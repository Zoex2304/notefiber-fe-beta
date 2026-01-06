# TRACE DEEP: Upstream → Downstream - Frontend AI UI/UX & Error Recovery
**Dokumentasi AI UI/UX Implementation & Error Handling Recovery** | Tanggal: 28 Desember 2024

---

## 📊 OVERVIEW: AI UI/UX & Error Recovery Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    USER INTERACTION (Upstream)                      │
├─────────────────────────────────────────────────────────────────────┤
│  - Click "Ask AI" → AIChatDialog opens                              │
│  - Type query → Input state                                         │
│  - Click "Search" → SearchDialog opens                              │
│  - Click "Send" → Message sent                                      │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│            UI STATE MANAGEMENT (Component Layer)                    │
├─────────────────────────────────────────────────────────────────────┤
│  - isLoading: Pending state                                         │
│  - input: User text input                                           │
│  - messages: Chat history                                           │
│  - results: Search results                                          │
│  - error states: Optimistic update rollback                         │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│        OPTIMISTIC UI UPDATES (Immediate Feedback)                   │
├─────────────────────────────────────────────────────────────────────┤
│  - Add user message to UI immediately                               │
│  - Show loading spinner for AI response                             │
│  - Enable/disable buttons based on state                            │
│  - No delay in user perception                                      │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│             API REQUEST (Network Layer)                             │
├─────────────────────────────────────────────────────────────────────┤
│  POST /chatbot/v1/send-chat                                         │
│  POST /chatbot/v1/create-session                                    │
│  GET /note/v1/semantic-search                                       │
│  - Try/Catch error handling                                         │
│  - Status code checking                                             │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ├─ Success                       ├─ Error
                 ▼                               ▼
┌──────────────────────────────────┐  ┌──────────────────────────────────┐
│  STATE UPDATE (Confirmed Data)    │  │  ERROR RECOVERY (Rollback)        │
├──────────────────────────────────┤  ├──────────────────────────────────┤
│  - Replace optimistic with real  │  │  - Check error status code       │
│  - Update session metadata       │  │  - Remove optimistic message     │
│  - Refresh token usage           │  │  - Show error toast/modal        │
│  - Disable loading spinner       │  │  - Provide retry option          │
└────────────────┬─────────────────┘  └─────────────────┬────────────────┘
                 │                                      │
                 └──────────────┬──────────────────────┘
                                ▼
                     ┌──────────────────────────────┐
                     │   UI RENDER & DISPLAY        │
                     ├──────────────────────────────┤
                     │  - Show confirmed message    │
                     │  - Render markdown content   │
                     │  - Display error message     │
                     │  - Update usage indicators   │
                     └──────────────────────────────┘
                                ▼
                     ┌──────────────────────────────┐
                     │   DOWNSTREAM (User Sees)     │
                     ├──────────────────────────────┤
                     │  - Chat message + response   │
                     │  - Token usage progress bar  │
                     │  - Error or success message  │
                     └──────────────────────────────┘
```

---

## 🔍 TRACE DEEP #1: AI Chat UI/UX Flow - Success Path

### Entry Point: AIChatDialog Component Opens

**File:** `src/components/ai-chat-dialog.tsx`

```tsx
interface AIChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notes: Note[];
}

export function AIChatDialog({ open, onOpenChange }: AIChatDialogProps) {
  // ⭐ UI STATE: Component initialization
  const [input, setInput] = useState("");           // User text input
  const [sessions, setSessions] = useState<ChatSession[]>([]);  // Chat sessions
  const [activeSessionId, setActiveSessionId] = useState("");   // Current session
  const [isLoading, setIsLoading] = useState(false);            // Loading state
  const [showTokenLimitDialog, setShowTokenLimitDialog] = useState(false);

  // ⭐ CONTEXT: Get subscription & usage data
  const { tokenUsage, refreshSubscription } = useSubscription();
  const { showPricingModal } = useUsageLimits();

  // Compute: Active session and messages
  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const messages = activeSession?.messages || [];
```

---

### Upstream: User Sends Message

**UI State Changes (Input → Sending):**

```tsx
const handleSend = async () => {
  if (!input.trim() || isLoading || !activeSession) return;

  // ⭐ STEP 1: CLEAR INPUT IMMEDIATELY
  const userMessage = input;
  setInput("");  // User sees input cleared instantly
  setIsLoading(true);  // Show loading indicator

  // ⭐ STEP 2: OPTIMISTIC UPDATE
  // Add user message to UI immediately (no network wait)
  setSessions((prev) =>
    prev.map((s) => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          messages: [
            ...s.messages,
            {
              id: "temp",  // Temporary ID for UI
              content: userMessage,
              role: "user",
              timestamp: new Date(),
            },
          ],
        };
      }
      return { ...s };
    })
  );

  // ⭐ STEP 3: BUILD REQUEST
  const request: SendChatRequest = {
    chat: userMessage,
    chat_session_id: activeSessionId,
  };

  try {
    // ⭐ STEP 4: API REQUEST
    const res = await apiClient.post<BaseResponse<SendChatResponse>>(
      `/chatbot/v1/send-chat`,
      request
    );

    // ⭐ STEP 5: SUCCESS - UPDATE WITH REAL DATA
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            // Update session name from AI response
            name: res.data.data.title,
            messages: [
              ...s.messages.slice(0, -1),  // Remove optimistic message
              {
                // User message (from server confirmation)
                id: res.data.data.sent.id,
                content: res.data.data.sent.chat,
                role: res.data.data.sent.role === "model" ? "assistant" : "user",
                timestamp: new Date(res.data.data.sent.created_at),
              },
              {
                // AI response message
                id: res.data.data.reply.id,
                content: res.data.data.reply.chat,
                role: res.data.data.reply.role === "model" ? "assistant" : "user",
                timestamp: new Date(res.data.data.reply.created_at),
              },
            ],
          };
        }
        return { ...s };
      })
    );

    // ⭐ STEP 6: REFRESH SUBSCRIPTION
    // Update token usage after successful message
    await refreshSubscription();

  } catch (error: any) {
    // ⭐ ERROR HANDLING (see next section)
  } finally {
    // ⭐ STEP 7: CLEANUP
    setIsLoading(false);  // Hide loading spinner
  }
};
```

---

### UI Render During Success: Loading & Response

**Rendering: Optimistic Message**

```tsx
{/* Message List */}
{messages.map((message) => (
  <div
    key={message.id}
    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
  >
    {/* Avatar */}
    <div className="flex-shrink-0">
      {message.role === "user" ? (
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-white" />
        </div>
      ) : (
        <div className="w-8 h-8 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center">
          <Bot className="h-4 w-4 text-white" />
        </div>
      )}
    </div>

    {/* Message Bubble */}
    <div
      className={`rounded-lg p-3 shadow-sm ${
        message.role === "user"
          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
          : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900 border border-gray-200"
      }`}
    >
      {/* Render user message as plain text */}
      {message.role === "user" && (
        <div className="text-sm whitespace-pre-wrap">
          {message.content}
        </div>
      )}

      {/* Render AI response as Markdown */}
      {message.role === "assistant" && (
        <ReactMarkdown className="prose prose-sm">
          {message.content}
        </ReactMarkdown>
      )}

      {/* Timestamp */}
      <div className={`text-xs mt-1 ${message.role === "user" ? "opacity-70" : "opacity-60"}`}>
        {message.timestamp.toLocaleTimeString()}
      </div>
    </div>
  </div>
))}

{/* Loading Indicator */}
{isLoading && (
  <div className="flex gap-3">
    <div className="w-8 h-8 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center">
      <Bot className="h-4 w-4 text-white" />
    </div>
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
      <div className="flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">
          AI is thinking...
        </span>
      </div>
    </div>
  </div>
)}
```

---

### Downstream: Token Usage Update

**File:** `src/components/common/TokenUsageIndicator.tsx`

```tsx
interface TokenUsageIndicatorProps {
  dailyUsed: number;
  dailyLimit: number;
  percentage: number;
  showLabel?: boolean;
}

export function TokenUsageIndicator({
  dailyUsed,
  dailyLimit,
  percentage,
  showLabel = true,
}: TokenUsageIndicatorProps) {
  // ⭐ COLOR CODING: Visual feedback based on usage
  const getColor = () => {
    if (percentage >= 90) return 'text-red-600';      // Critical
    if (percentage >= 80) return 'text-yellow-600';   // Warning
    return 'text-green-600';                          // Safe
  };

  const getProgressColor = () => {
    if (percentage >= 90) return 'bg-red-600';
    if (percentage >= 80) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  // If no limit, don't show
  if (dailyLimit === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
      {showLabel && (
        <div className={`text-xs font-medium flex items-center justify-between ${getColor()}`}>
          <span>AI Usage Today</span>
          <span>
            {dailyUsed} / {dailyLimit}
          </span>
        </div>
      )}
      
      {/* Progress Bar */}
      <Progress
        value={percentage}
        className="h-1.5"
        indicatorClassName={getProgressColor()}
      />
      
      {/* Warning Message */}
      {showLabel && percentage >= 80 && (
        <p className="text-xs text-muted-foreground">
          {percentage >= 90
            ? '⚠️ Almost at your daily limit!'
            : '⚠️ Approaching daily limit'}
        </p>
      )}
    </div>
  );
}

// ⭐ USAGE IN AIChatDialog HEADER
<TokenUsageIndicator
  dailyUsed={tokenUsage.dailyUsed}
  dailyLimit={tokenUsage.dailyLimit}
  percentage={tokenUsage.percentage}
  showLabel={false}
/>
<p className="text-xs text-muted-foreground mt-1 text-center">
  {tokenUsage.dailyUsed}/{tokenUsage.dailyLimit} requests
</p>
```

---

## 🔴 TRACE DEEP #2: Error Recovery Flow

### Error Scenarios & Recovery Mechanisms

**File:** `src/contexts/UsageLimitsContext.tsx`

```tsx
/**
 * Helper function to handle 429 (Too Many Requests) errors
 */
export function handleLimitExceededError(
  error: any,
  showPricingModal: UsageLimitsContextType['showPricingModal']
): boolean {
  // ⭐ SCENARIO 1: Daily limit exceeded (429)
  if (error?.response?.status === 429 || error?.code === 429) {
    const data = error?.response?.data?.data || error?.data;
    if (data) {
      const featureName = error?.response?.data?.message || 'Daily limit';
      showPricingModal(featureName, {
        used: data.used,
        limit: data.limit,
        resetsAt: data.reset_after,
      });
      return true;
    }
    // Show modal even without detailed data
    showPricingModal();
    return true;
  }

  // ⭐ SCENARIO 2: Feature requires upgrade (403)
  if (error?.response?.status === 403) {
    showPricingModal();
    return true;
  }

  return false;
}
```

---

### Error Recovery in AIChatDialog

**File:** `src/components/ai-chat-dialog.tsx` (Error Path)

```tsx
const handleSend = async () => {
  // ... previous code ...

  try {
    const res = await apiClient.post<BaseResponse<SendChatResponse>>(
      `/chatbot/v1/send-chat`,
      request
    );

    // Success path...
    
  } catch (error: any) {
    // ⭐ ERROR RECOVERY STEP 1: Check for 429 limit error
    if (!handleLimitExceededError(error, showPricingModal)) {
      // ⭐ ERROR RECOVERY STEP 2: Check legacy token limit error (500)
      if (
        error.response?.status === 500 &&
        error.response?.data?.message?.includes("daily AI usage limit exceeded")
      ) {
        setShowTokenLimitDialog(true);  // Show limit reached dialog
      }
    }

    // ⭐ ERROR RECOVERY STEP 3: Remove optimistic message
    // Rollback optimistic update to maintain consistency
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: s.messages.slice(0, -1),  // Remove the optimistic message
          };
        }
        return { ...s };
      })
    );

    // ⭐ ERROR RECOVERY STEP 4: Log error for debugging
    console.error("Failed to send chat:", error);

  } finally {
    // ⭐ ERROR RECOVERY STEP 5: Cleanup loading state
    setIsLoading(false);
  }
};
```

---

### Error UI Components

**File:** `src/components/common/TokenLimitDialog.tsx` (Limit Exceeded UI)

```tsx
interface TokenLimitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dailyLimit: number;
}

export function TokenLimitDialog({
  open,
  onOpenChange,
  dailyLimit,
}: TokenLimitDialogProps) {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate({ to: '/pricing' });  // Redirect to upgrade
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            🚫 Daily AI Limit Reached
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              You've used all {dailyLimit} of your AI requests for today.
            </p>
            <p>
              Your usage will reset in 24 hours, or you can upgrade your plan for higher limits.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
          <AlertDialogAction onClick={handleUpgrade}>
            Upgrade Plan
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

---

## 🔍 TRACE DEEP #3: Semantic Search UI/UX & Error Recovery

### Search Dialog UI State

**File:** `src/components/search-dialog.tsx`

```tsx
function SearchDialog({
  open,
  onOpenChange,
  notes,
  onNoteSelect,
}: SearchDialogProps) {
  // ⭐ UI STATE
  const [query, setQuery] = useState("");             // Search input
  const [results, setResults] = useState<Note[]>([]);  // Search results
  const [isSearching, setIsSearching] = useState(false); // Loading state

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);

    // ⭐ DEBOUNCED SEARCH: 300ms delay to reduce API calls
    const searchTimeout = setTimeout(async () => {
      try {
        const res = await apiClient.get<BaseResponse<GetSemanticSearchResponse[]>>(
          `/note/v1/semantic-search?q=${encodeURIComponent(query)}`
        );

        // ⭐ SUCCESS: Transform response
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

      } catch (error) {
        // ⭐ ERROR HANDLING: Log and clear loading
        console.error("Search failed:", error);
        setIsSearching(false);
        setResults([]);  // Clear previous results on error
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const handleNoteSelect = (noteId: string) => {
    onNoteSelect(noteId);
    setQuery("");      // Clear search
    setResults([]);    // Clear results
    onOpenChange(false); // Close dialog
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>🔍 Semantic Search</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search your notes semantically..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {/* Results Area */}
          <div className="max-h-96 overflow-auto">
            {/* ⭐ STATE 1: Loading */}
            {isSearching && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-600">Searching...</span>
              </div>
            )}

            {/* ⭐ STATE 2: Results found */}
            {!isSearching && results.length > 0 && (
              <div className="space-y-2">
                {results.map((note) => (
                  <Button
                    key={note.id}
                    variant="ghost"
                    className="w-full justify-start h-auto p-3 text-left hover:bg-blue-50"
                    onClick={() => handleNoteSelect(note.id)}
                  >
                    <FileText className="h-4 w-4 mr-3 text-gray-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {note.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 truncate">
                        {note.content.replace(/[#*\n]/g, " ").substring(0, 80)}...
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        Click to open
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            )}

            {/* ⭐ STATE 3: No results found */}
            {!isSearching && query && results.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No notes found for "{query}"</p>
                <p className="text-xs mt-2">
                  Try different keywords or create a new note
                </p>
              </div>
            )}

            {/* ⭐ STATE 4: Initial empty state */}
            {!isSearching && !query && results.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <p>Start typing to search your notes...</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 🔄 Complete Error Recovery Sequence

### Scenario: User Hits Daily Limit

```
1. USER ACTION
   └─ User sends message after reaching daily limit

2. COMPONENT STATE
   └─ isLoading = true
   └─ Optimistic message added

3. API REQUEST
   └─ POST /chatbot/v1/send-chat
   └─ Response: 429 Too Many Requests

4. CATCH ERROR BLOCK
   └─ handleLimitExceededError(error, showPricingModal)
      ├─ Check error.response.status === 429
      ├─ Extract: used, limit, reset_after
      └─ Call: showPricingModal('AI chat messages', {...})

5. ROLLBACK OPTIMISTIC UPDATE
   └─ setSessions((prev) =>
        prev.map((s) => ({
          ...s,
          messages: s.messages.slice(0, -1)  // Remove optimistic
        }))
      )

6. SHOW ERROR UI
   └─ PricingModal displays:
      ├─ "Daily limit exceeded"
      ├─ Used: 10/10
      ├─ Resets at: tomorrow
      ├─ Button: "Upgrade Plan"

7. USER SEES
   └─ Previous message unchanged
   └─ Error modal overlay
   └─ No duplicate message created

8. USER ACTION
   └─ Click "Close" → Modal closes, continue chatting tomorrow
   └─ Click "Upgrade Plan" → Navigate to /pricing

9. POST-UPGRADE FLOW
   └─ refreshSubscription() updates dailyLimit
   └─ TokenUsageIndicator shows new limits
   └─ User can now send more messages
```

---

## 🎨 UI/UX State Visualization

### Chat Dialog States

```
┌─────────────────────────────────────┐
│   STATE 1: IDLE (Normal)            │
├─────────────────────────────────────┤
│  Input: Enabled                     │
│  Send Button: Enabled               │
│  Loading Spinner: Hidden            │
│  Last Message: Confirmed            │
│  Usage: Shows 5/10 (Green)          │
└─────────────────────────────────────┘
         │
         ▼ User clicks Send
┌─────────────────────────────────────┐
│   STATE 2: OPTIMISTIC (Sending)     │
├─────────────────────────────────────┤
│  Input: Cleared                     │
│  Send Button: Disabled              │
│  Last User Message: Shows immediately│
│  Loading Spinner: Visible           │
│  Usage: Unchanged (6/10 pending)    │
└─────────────────────────────────────┘
         │
    ┌────┴────┐
    ▼         ▼
SUCCESS     ERROR
    │         │
    ▼         ▼
┌─────┐   ┌─────────────────────┐
│ ST3 │   │  STATE: ROLLED BACK │
└─────┘   ├─────────────────────┤
   │      │ Input: Restored     │
   │      │ Last message: Removed
   │      │ Error Modal: Shown   │
   │      │ Can retry           │
   │      └─────────────────────┘
   ▼
┌─────────────────────────────────────┐
│   STATE 3: CONFIRMED (Success)      │
├─────────────────────────────────────┤
│  Input: Enabled                     │
│  Send Button: Enabled               │
│  Messages: Both user + AI shown     │
│  Loading Spinner: Hidden            │
│  Usage: Updated 6/10 (Green)        │
│  Markdown: Rendered in AI message   │
└─────────────────────────────────────┘
```

### Search Dialog States

```
┌──────────────────────┐
│  INITIAL STATE       │
├──────────────────────┤
│  Input: Empty        │
│  Results: Empty      │
│  Loading: No         │
└──────────────────────┘
       │
       ▼ User types
┌──────────────────────┐
│  TYPING STATE        │
├──────────────────────┤
│  Input: "machine..." │
│  Debounce: 300ms     │
│  Results: Previous   │
│  Loading: No         │
└──────────────────────┘
       │
       ▼ Debounce expires
┌──────────────────────┐
│  SEARCHING STATE     │
├──────────────────────┤
│  Spinner: Animated   │
│  Text: "Searching..." │
│  Results: Cleared    │
│  Input: Disabled?    │
└──────────────────────┘
    │           │
    ▼ Success   ▼ No results
┌──────────┐ ┌─────────────────┐
│RESULTS   │ │EMPTY STATE      │
├──────────┤ ├─────────────────┤
│ Cards    │ │"No notes found" │
│ Click    │ │"Try different"  │
│ Navigate │ └─────────────────┘
└──────────┘
```

---

## 📊 State Management Patterns

### Pattern 1: Optimistic Update with Rollback

```tsx
// Initial state
const [messages, setMessages] = useState<Message[]>([]);

const handleSend = async () => {
  const userMessage = { id: "temp", content: input, role: "user" };
  
  // Add immediately (optimistic)
  setMessages(prev => [...prev, userMessage]);
  
  try {
    const response = await api.send(input);
    
    // Replace with confirmed data
    setMessages(prev => [
      ...prev.slice(0, -1),  // Remove optimistic
      response.userMessage,
      response.aiMessage
    ]);
  } catch (error) {
    // Rollback on error
    setMessages(prev => prev.slice(0, -1));
  }
};
```

### Pattern 2: Debounced Search

```tsx
const [query, setQuery] = useState("");
const [results, setResults] = useState([]);

useEffect(() => {
  if (!query.trim()) {
    setResults([]);
    return;
  }

  setIsSearching(true);
  
  // Cancel previous timeout
  const timeout = setTimeout(async () => {
    try {
      const data = await api.search(query);
      setResults(data);
    } finally {
      setIsSearching(false);
    }
  }, 300);

  // Cleanup to cancel if user types again
  return () => clearTimeout(timeout);
}, [query]);
```

### Pattern 3: Progressive Error Recovery

```tsx
try {
  // Attempt API call
  const response = await api.call();
  
} catch (error) {
  // Try 1: Check for specific error (429)
  if (error.response?.status === 429) {
    showLimitModal();
    return;
  }
  
  // Try 2: Check for auth error (401)
  if (error.response?.status === 401) {
    redirectToLogin();
    return;
  }
  
  // Try 3: Fallback to generic error
  showErrorToast("Something went wrong");
  
} finally {
  // Always cleanup
  setIsLoading(false);
}
```

---

## 🎯 Key UI/UX Principles

### 1. Immediate Feedback
- Optimistic updates show action immediately
- No "dead time" waiting for API response
- User feels responsive UI

### 2. Visual Hierarchy
- User messages: Blue gradient, aligned right
- AI messages: Gray gradient, aligned left
- Loading state: Spinner + "thinking" text
- Error state: Red modal with actions

### 3. Progressive Disclosure
- Token usage shown in header
- Warning at 80%, alert at 90%
- Limit dialog only on actual limit
- No unnecessary modals

### 4. Graceful Degradation
- Search handles no results
- Chat handles network errors
- Old messages not affected by new errors
- Retry mechanisms available

### 5. Color Coding
- Green: Safe (< 80% usage)
- Yellow: Warning (80-90% usage)
- Red: Critical (> 90% usage)

---

## 📱 Responsive Design Considerations

### Desktop View
```
┌─────────────────────────────────────┐
│  Header: Title + Token Usage (80px) │
├─────────────────────────────────────┤
│                                     │
│  Messages Area (Scrollable)         │
│  - User message (right, blue)       │
│  - AI message (left, gray, markdown)│
│  - Loading spinner                  │
│                                     │
├─────────────────────────────────────┤
│  Input: Textarea (min 40px)         │
│  Button: Send (icon + disabled)     │
└─────────────────────────────────────┘
max-width: 4xl (56rem)
height: 700px
```

### Mobile View
```
Same layout but:
- Full width dialog
- Smaller font sizes
- Touch-friendly buttons (44px min)
- Shorter max height
```

---

## 🔗 Integration Points

### With SubscriptionContext
```tsx
const { tokenUsage, refreshSubscription } = useSubscription();

// After sending message
await refreshSubscription();  // Update usage
setTokenUsage(...)            // Update UI
```

### With UsageLimitsContext
```tsx
const { showPricingModal, checkCanUseAiChat } = useUsageLimits();

// Before sending
const canChat = await checkCanUseAiChat();
if (!canChat) return;  // Modal auto-shown
```

### With API Client
```tsx
const res = await apiClient.post<BaseResponse<SendChatResponse>>(
  `/chatbot/v1/send-chat`,
  request
);

// Interceptors handle auth, formatting
```

---

## 📚 Related Documentation

- [AI Service Integration Layer](./TRACE_DEEP_AI_SERVICE_INTEGRATION_LAYER.md)
- [Context Management Layer](./TRACE_DEEP_CONTEXT_MANAGEMENT_LAYER.md)
- [Chatbot Implementation](./namespace/chatbotreal.md)
- [Semantic Search Implementation](./namespace/semanticsearch.md)
- [Error Handling Rules](./api/rules.md)
- [Architecture Guidelines](./INSTRUCTION/PARADIGM.MD)

