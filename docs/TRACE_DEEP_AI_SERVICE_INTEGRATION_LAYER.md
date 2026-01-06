# TRACE DEEP: Upstream → Downstream - AI Service Integration Layer
**Dokumentasi Path Alur Data AI Service** | Tanggal: 25 Desember 2024

---

## 📊 OVERVIEW: Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│               UPSTREAM (User Interaction Entry)                 │
├─────────────────────────────────────────────────────────────────┤
│  UI Layer (MainApp.tsx) → User Actions                          │
│  - Click "Ask AI" Button → Open Chat Dialog                     │
│  - Click Search Icon → Open Semantic Search                     │
│  - Type Message → Send to AI                                    │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│       INTEGRATION LAYER (Permission & Limit Checks)             │
├─────────────────────────────────────────────────────────────────┤
│  useSubscription() → Check token usage                          │
│  useUsageLimits() → Check daily limits                          │
│  checkPermission() → Check plan features                        │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│          COMPONENT LAYER (Dialog Management)                    │
├─────────────────────────────────────────────────────────────────┤
│  AIChatDialog / SearchDialog                                    │
│  - Initialize state                                             │
│  - Render UI components                                         │
│  - Handle user input                                            │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│         API CLIENT LAYER (HTTP Request Formation)               │
├─────────────────────────────────────────────────────────────────┤
│  apiClient.get/post/put/delete                                  │
│  - Build request with parameters                                │
│  - Append authentication headers                                │
│  - Apply interceptors                                           │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│        BACKEND SERVICE LAYER (Server Processing)                │
├─────────────────────────────────────────────────────────────────┤
│  POST /chatbot/v1/send-chat                                     │
│  POST /chatbot/v1/create-session                                │
│  GET /note/v1/semantic-search                                   │
│  - Process request                                              │
│  - Call AI Service (Gemini/Claude API)                          │
│  - Generate embeddings                                          │
│  - Return response                                              │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│       DOWNSTREAM (Frontend State Update & UI Render)            │
├─────────────────────────────────────────────────────────────────┤
│  - Update session state                                         │
│  - Update message state                                         │
│  - Re-render components                                         │
│  - Display results to user                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔍 TRACE DEEP #1: AI CHAT FLOW

### Entry Point → Upstream

**File:** `src/pages/MainApp.tsx`

```tsx
// UPSTREAM: User clicks "Ask AI" button
const handleAIChatOpen = () => {
  setChatOpen(true);  // Opens AIChatDialog
};

// UI State Management
const [chatOpen, setChatOpen] = useState(false);
```

**Component Trigger:** `src/components/ai-chat-dialog.tsx`

```tsx
export function AIChatDialog({ open, onOpenChange }: AIChatDialogProps) {
  // PERMISSION CHECK (Integration Layer)
  const { tokenUsage, refreshSubscription } = useSubscription();
  const { showPricingModal } = useUsageLimits();
  
  // LOCAL STATE MANAGEMENT
  const [input, setInput] = useState("");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
```

---

### Integration Layer: Permission & Limit Checks

**Context:** `src/contexts/SubscriptionContext.tsx` (Hypothetical)

```typescript
// Check if user has daily token limit
const { tokenUsage, refreshSubscription } = useSubscription();

// Structure:
{
  dailyUsed: number;      // Tokens used today
  dailyLimit: number;     // Daily limit from plan
  percentage: number;     // Usage percentage
}
```

**Context:** `src/contexts/UsageLimitsContext.tsx` (Hypothetical)

```typescript
// Check if action is allowed based on plan
const { showPricingModal } = useUsageLimits();

// If daily limit exceeded:
setShowTokenLimitDialog(true);  // Show warning
// If not allowed:
showPricingModal();              // Show upgrade prompt
```

---

### Component Layer: AI Chat Dialog

**API Call 1: Fetch Sessions**

```tsx
const fetchData = async (): Promise<ChatSession[]> => {
  const res = await apiClient.get<BaseResponse<GetAllSessionsResponse[]>>(
    `/chatbot/v1/sessions`
  );
  
  const apiData = res.data.data ?? [];
  
  const newSessions = apiData.map((d) => ({
    id: d.id,
    messages: [],
    name: d.title,
    createdAt: new Date(d.created_at),
    updatedAt: new Date(d.updated_at ?? d.created_at),
  }));
  
  setSessions(newSessions);
  return newSessions;
};
```

**API Call 2: Fetch Chat History**

```tsx
const sessionClickHandler = async (sessionId: string) => {
  setActiveSessionId(sessionId);
  
  const res = await apiClient.get<BaseResponse<GetChatHistoryResponse[]>>(
    `/chatbot/v1/chat-history?chat_session_id=${sessionId}`
  );
  
  setSessions((prev) =>
    prev.map((session) => {
      if (session.id === sessionId) {
        return {
          ...session,
          messages: res.data.data.map<Message>((data) => ({
            id: data.id,
            content: data.chat,
            role: data.role === "model" ? "assistant" : "user",
            timestamp: new Date(data.created_at),
          })),
        };
      }
      return { ...session };
    })
  );
};
```

---

### Optimistic Update + API Request

**API Call 3: Send Chat Message**

```tsx
const handleSend = async () => {
  if (!input.trim() || isLoading || !activeSession) return;
  
  setInput("");
  setIsLoading(true);
  
  // ⭐ OPTIMISTIC UPDATE: Show user message immediately
  setSessions((prev) =>
    prev.map((s) => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          messages: [
            ...s.messages,
            {
              id: "temp",
              content: input,
              role: "user",
              timestamp: new Date(),
            },
          ],
        };
      }
      return { ...s };
    })
  );
  
  const request: SendChatRequest = {
    chat: input,
    chat_session_id: activeSessionId,
  };
  
  try {
    // ACTUAL API CALL
    const res = await apiClient.post<BaseResponse<SendChatResponse>>(
      `/chatbot/v1/send-chat`,
      request
    );
    
    // ⭐ UPDATE STATE WITH ACTUAL RESPONSE
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            name: res.data.data.title,
            messages: [
              ...s.messages.slice(0, -1),  // Remove optimistic message
              {
                id: res.data.data.sent.id,
                content: res.data.data.sent.chat,
                role: res.data.data.sent.role === "model" ? "assistant" : "user",
                timestamp: new Date(res.data.data.sent.created_at),
              },
              {
                id: res.data.data.response.id,
                content: res.data.data.response.chat,
                role: res.data.data.response.role === "model" ? "assistant" : "user",
                timestamp: new Date(res.data.data.response.created_at),
              },
            ],
          };
        }
        return { ...s };
      })
    );
    
    // Check token usage after sending
    await refreshSubscription();
    
    // If token limit exceeded
    if (tokenUsage.percentage >= 100) {
      setShowTokenLimitDialog(true);
    }
  } catch (error) {
    setIsLoading(false);
  }
};
```

---

### API Client Layer: HTTP Request Formation

**File:** `src/api/client/axios.client.ts`

```typescript
// Initialize axios instance with base URL
const axiosInstance = axios.create({
  baseURL: AppConfig.baseUrl,
  timeout: 30000,
});

// Add interceptors for auth headers
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API Client wrapper
export const apiClient = {
  get: <T,>(url: string) => axiosInstance.get<T>(url),
  post: <T,>(url: string, data: any) => axiosInstance.post<T>(url, data),
  put: <T,>(url: string, data: any) => axiosInstance.put<T>(url, data),
  delete: <T,>(url: string, config?: any) => axiosInstance.delete<T>(url, config),
};
```

**Request Example:**
```
POST /chatbot/v1/send-chat HTTP/1.1
Host: api.notefiber.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "chat": "What is the capital of France?",
  "chat_session_id": "session-123-abc"
}
```

---

### Backend Service Layer

**Endpoint:** `POST /chatbot/v1/send-chat`

```json
{
  "request": {
    "chat": "What is the capital of France?",
    "chat_session_id": "session-123-abc"
  }
}
```

**Backend Processing Flow:**

```
1. Receive request
2. Validate chat_session_id exists and belongs to user
3. Store user message in database
4. Call AI Service (Gemini/Claude API)
   ├─ Fetch chat history for context
   ├─ Build prompt with conversation context
   ├─ Stream response from AI API
   └─ Aggregate response
5. Store AI response in database
6. Generate new embeddings for semantic search index
7. Return response
```

**Response Structure:**

```json
{
  "success": true,
  "code": 200,
  "message": "Message sent successfully",
  "data": {
    "title": "Conversation about Geography",
    "sent": {
      "id": "msg-001",
      "chat": "What is the capital of France?",
      "role": "user",
      "created_at": "2024-12-25T10:30:00Z"
    },
    "response": {
      "id": "msg-002",
      "chat": "The capital of France is Paris. It is located in the northern-central part of the country...",
      "role": "model",
      "created_at": "2024-12-25T10:30:05Z"
    }
  }
}
```

---

### Downstream: State Update & UI Render

**State Update Process:**

```tsx
// 1. Messages are added to session
setSessions((prev) =>
  prev.map((s) => {
    if (s.id === activeSessionId) {
      return {
        ...s,
        messages: [
          ...s.messages,
          {
            id: res.data.data.response.id,
            content: res.data.data.response.chat,
            role: "assistant",
            timestamp: new Date(res.data.data.response.created_at),
          },
        ],
      };
    }
    return s;
  })
);

// 2. UI re-renders with new messages
// 3. Message bubbles appear in chat area
// 4. Markdown content is rendered (if AI response contains markdown)
// 5. User can send next message
```

**UI Render Component:**

```tsx
const messages = activeSession?.messages || [];

return (
  <div className="chat-messages">
    {messages.map((msg) => (
      <div
        key={msg.id}
        className={msg.role === "user" ? "user-bubble" : "ai-bubble"}
      >
        {msg.role === "assistant" ? (
          <ReactMarkdown>{msg.content}</ReactMarkdown>
        ) : (
          <p>{msg.content}</p>
        )}
      </div>
    ))}
  </div>
);
```

---

## 🔍 TRACE DEEP #2: SEMANTIC SEARCH FLOW

### Entry Point → Upstream

**File:** `src/pages/MainApp.tsx`

```tsx
// UPSTREAM: User clicks search icon
const handleSearchOpen = () => {
  // Permission check before opening
  const canUseSearch = await checkCanUseSemanticSearch();
  if (!canUseSearch) {
    showPricingModal();  // Limit exceeded
    return;
  }
  
  setSearchOpen(true);  // Opens SearchDialog
};
```

---

### Integration Layer: Permission & Limit Checks

```tsx
// Check if user can use semantic search
const { checkCanUseSemanticSearch } = useUsageLimits();
const { checkPermission } = useSubscription();

// Permission flow:
const canUseSearch = await checkCanUseSemanticSearch();
if (!canUseSearch) {
  setShowPricingModal(true);
  return;
}

// Feature check:
const hasFeature = checkPermission("semantic_search");
if (!hasFeature) {
  dispatch(UPGRADE_EVENT);  // Dispatch upgrade event
  return;
}
```

---

### Component Layer: Search Dialog

**File:** `src/components/search-dialog.tsx`

```tsx
function SearchDialog({ open, onOpenChange, notes, onNoteSelect }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Note[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    
    setIsSearching(true);
    
    // ⭐ DEBOUNCED SEARCH: 300ms delay to reduce API calls
    const searchTimeout = setTimeout(async () => {
      const res = await apiClient.get<BaseResponse<GetSemanticSearchResponse[]>>(
        `/note/v1/semantic-search?q=${encodeURIComponent(query)}`
      );
      
      // Transform response to Note objects
      const data: Note[] = res.data.data.map((note) => ({
        id: note.id,
        content: note.content,
        notebookId: note.notebook_id,
        title: note.title,
        createdAt: new Date(note.created_at),
        updatedAt: new Date(note.updated_at ?? note.created_at),
      }));
      
      setResults(data);
      setIsSearching(false);
    }, 300);
    
    return () => clearTimeout(searchTimeout);
  }, [query]);
  
  const handleNoteSelect = (noteId: string) => {
    onNoteSelect(noteId);
    setQuery("");
    setResults([]);
    onOpenChange(false);  // Close search dialog
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Search UI */}
      <Input
        placeholder="Search semantically..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />
      
      {/* Results */}
      {isSearching && <LoadingSpinner />}
      {!isSearching && results.length > 0 && (
        <div className="results-list">
          {results.map((note) => (
            <Button
              key={note.id}
              variant="ghost"
              onClick={() => handleNoteSelect(note.id)}
            >
              <div>{note.title}</div>
              <div className="text-xs text-gray-500">{note.content.substring(0, 80)}...</div>
            </Button>
          ))}
        </div>
      )}
      {!isSearching && query && results.length === 0 && (
        <div className="empty-state">No notes found for "{query}"</div>
      )}
    </Dialog>
  );
}
```

---

### API Client Layer: Search Request

**Request Example:**
```
GET /note/v1/semantic-search?q=machine%20learning HTTP/1.1
Host: api.notefiber.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### Backend Service Layer: Semantic Search

**Endpoint:** `GET /note/v1/semantic-search?q=query`

**Backend Processing:**

```
1. Receive query string
2. Convert query to embedding vector using AI model
   ├─ Use Gemini Embeddings API
   └─ Get vector representation of user query
3. Search vector database for similar notes
   ├─ Compare query embedding with note embeddings
   ├─ Calculate cosine similarity
   └─ Return top-K results (usually 5-10)
4. Filter by user's notebooks
5. Return matching notes with metadata
```

**Response Structure:**

```json
{
  "success": true,
  "code": 200,
  "message": "Search results",
  "data": [
    {
      "id": "note-001",
      "title": "Machine Learning Basics",
      "content": "Machine learning is a subset of AI...",
      "notebook_id": "notebook-1",
      "created_at": "2024-12-20T10:00:00Z",
      "updated_at": "2024-12-25T15:30:00Z",
      "similarity_score": 0.95
    },
    {
      "id": "note-002",
      "title": "Deep Learning Models",
      "content": "Deep learning uses neural networks...",
      "notebook_id": "notebook-2",
      "created_at": "2024-12-22T09:45:00Z",
      "updated_at": "2024-12-25T14:20:00Z",
      "similarity_score": 0.87
    }
  ]
}
```

---

### Downstream: State Update & UI Render

```tsx
// 1. Transform API response to Note objects
const data: Note[] = res.data.data.map((note) => ({
  id: note.id,
  content: note.content,
  notebookId: note.notebook_id,
  title: note.title,
  createdAt: new Date(note.created_at),
  updatedAt: new Date(note.updated_at ?? note.created_at),
}));

// 2. Update results state
setResults(data);

// 3. Render result cards in search dialog
// 4. User can click result to navigate to note
const handleNoteSelect = (noteId: string) => {
  onNoteSelect(noteId);  // Pass to parent (MainApp)
  onOpenChange(false);    // Close dialog
};

// 5. Parent component (MainApp) updates selected note
// - Loads note content
// - Displays in editor
// - Auto-expands notebook in sidebar
```

---

## 📍 ARCHITECTURE LAYERS MAPPING

### Layer 1: USER INTERFACE LAYER
**Files:** 
- `src/pages/MainApp.tsx` - Main application component
- `src/components/ai-chat-dialog.tsx` - Chat dialog UI
- `src/components/search-dialog.tsx` - Search dialog UI
- `src/components/common/TopBar.tsx` - Top bar with search button

**Responsibility:** Capture user interactions, manage UI state

---

### Layer 2: INTEGRATION LAYER
**Files:**
- `src/contexts/SubscriptionContext.tsx` - Subscription & token usage management
- `src/contexts/UsageLimitsContext.tsx` - Daily limits & feature permissions
- `src/hooks/useSubscription.ts` - Hook for subscription data
- `src/hooks/useUsageLimits.ts` - Hook for usage limits

**Responsibility:** Permission checks, limit enforcement, subscription status

---

### Layer 3: COMPONENT LAYER
**Files:**
- `src/components/ai-chat-dialog.tsx` - Dialog component with state management
- `src/components/search-dialog.tsx` - Search component with state management

**Responsibility:** Dialog rendering, user input handling, optimistic updates

---

### Layer 4: API CLIENT LAYER
**Files:**
- `src/api/client/axios.client.ts` - Axios instance with interceptors
- `src/config/config.ts` - Configuration (base URL, etc.)

**Responsibility:** HTTP request formation, authentication headers, interceptors

---

### Layer 5: DATA TYPES & CONTRACTS
**Files:**
- `src/dto/chatbot.ts` - Chatbot request/response types
- `src/types/note.ts` - Note type definition
- `src/types/ai-chat.ts` - Chat session & message types
- `src/dto/base-response.ts` - Generic API response wrapper

**Responsibility:** Type safety, data validation at boundaries

---

### Layer 6: BACKEND SERVICE LAYER
**Location:** Backend (out of scope for this docs, but referenced)

**Endpoints:**
- `POST /chatbot/v1/send-chat` - AI chat message processing
- `GET /chatbot/v1/sessions` - List chat sessions
- `GET /chatbot/v1/chat-history` - Fetch chat history
- `GET /note/v1/semantic-search` - Semantic search

**Responsibility:** AI service calls, vector operations, data persistence

---

## 🔄 COMPLETE REQUEST-RESPONSE CYCLE

### AI Chat: Complete Trace

```
1. USER ACTION (Upstream)
   ↓
   User clicks "Send" button in chat dialog
   Input: "Hello, help me with my project"
   
2. COMPONENT STATE (Component Layer)
   ↓
   setInput("") → Clear input
   setIsLoading(true) → Show loading
   Optimistic update → Add user message immediately
   
3. PERMISSION CHECK (Integration Layer)
   ↓
   Check: checkCanUseAiChat() → Returns true/false
   Check: tokenUsage.percentage → Check daily limit
   If failed → Show PricingModal, return early
   If success → Continue
   
4. REQUEST FORMATION (API Client Layer)
   ↓
   Build request:
   {
     chat: "Hello, help me with my project",
     chat_session_id: "session-123"
   }
   
   Add headers:
   {
     Authorization: "Bearer token123...",
     Content-Type: "application/json"
   }
   
5. HTTP REQUEST
   ↓
   POST /chatbot/v1/send-chat
   
6. BACKEND PROCESSING (Backend Service Layer)
   ↓
   ├─ Validate user and session
   ├─ Store user message in DB
   ├─ Call Gemini API for response
   ├─ Store AI response in DB
   └─ Generate embeddings
   
7. RESPONSE (API Client Layer)
   ↓
   {
     success: true,
     data: {
       sent: { id, chat, role, created_at },
       response: { id, chat, role, created_at }
     }
   }
   
8. STATE UPDATE (Component Layer)
   ↓
   setSessions((prev) =>
     prev.map((s) => {
       if (s.id === activeSessionId) {
         return {
           ...s,
           messages: [
             ...s.messages,
             { ...userMsg },
             { ...aiMsg }
           ]
         };
       }
       return s;
     })
   );
   
9. SUBSCRIPTION REFRESH (Integration Layer)
   ↓
   await refreshSubscription();
   Update tokenUsage state
   
10. UI RE-RENDER (Downstream)
    ↓
    Messages array updated → React re-renders
    Message bubbles appear in chat
    User message (blue) | AI response (gray)
    
11. USER SEES RESULT
    ↓
    Chat message visible with AI response
    Can continue conversation
```

---

## 🔐 DATA FLOW SECURITY CONSIDERATIONS

### Authentication
```
Every API call includes:
- Authorization header with JWT token
- Token stored in localStorage
- Token refreshed on UPGRADE_EVENT
```

### Validation
```
Frontend:
- Type checking with TypeScript
- Input validation before sending

Backend:
- Request validation
- User ownership verification
- Rate limiting
```

### Error Handling
```
Frontend:
try {
  const res = await apiClient.post(...);
  // Success handling
} catch (error) {
  // Error handling
  toast.error("Failed to send message");
  setIsLoading(false);
}
```

---

## 📈 PERFORMANCE OPTIMIZATIONS

### 1. Debounced Search
```tsx
const searchTimeout = setTimeout(async () => {
  // API call after 300ms delay
}, 300);

return () => clearTimeout(searchTimeout);  // Cancel previous timeout
```

### 2. Optimistic Updates
```tsx
// Show message immediately
setSessions(prev => /* add user message */);

// Update after API response
setSessions(prev => /* replace with confirmed data */);
```

### 3. State Memoization
```tsx
const activeSession = sessions.find((s) => s.id === activeSessionId);
const messages = activeSession?.messages || [];
```

---

## 🎯 KEY TAKEAWAYS

| Layer | Component | Responsibility |
|-------|-----------|-----------------|
| **Upstream** | MainApp, Dialog | User interaction entry point |
| **Integration** | Contexts, Hooks | Permission & limit checks |
| **Component** | Dialog, Search | UI rendering & state management |
| **API Client** | axios.client.ts | HTTP request formation |
| **Backend** | API Endpoints | AI service calls & data processing |
| **Downstream** | State → Render | UI update & display to user |

---

## 📚 RELATED DOCUMENTATION

- [Chatbot Implementation](./chatbotreal.md)
- [Semantic Search Implementation](./semanticsearch.md)
- [API Reference](../api/api.md)
- [Architecture Guidelines](../INSTRUCTION/PARADIGM.MD)

