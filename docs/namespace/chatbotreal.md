# Dokumentasi Fitur: AI Chatbot

**Tanggal Dokumentasi:** 25 Desember 2024  
**Fokus Domain:** Frontend (User App)  
**Lokasi:** `src/components/`

---

## Alur Data Semantik

```
[User di MainApp Workspace]
    -> [Click "Ask AI" Button] -> [AIChatDialog opens]
    -> [Fetch Sessions: GET /chatbot/v1/sessions]
    -> [Select Session] -> [Fetch History: GET /chatbot/v1/chat-history]
    -> [Type Message + Send]
        -> [Optimistic Update: add user message]
        -> [POST /chatbot/v1/send-chat]
        -> [Response: user sent + AI reply]
        -> [Update Messages + Token Usage]
    -> [Create New Session: POST /chatbot/v1/create-session]
    -> [Delete Session: DELETE /chatbot/v1/delete-session]
    -> [Limit Exceeded: Show TokenLimitDialog / PricingModal]
```

---

## A. Laporan Implementasi Fitur AI Chatbot

### Deskripsi Fungsional

Fitur ini menyediakan AI Chat Assistant yang terintegrasi dengan notes user. Dialog modal dengan sidebar untuk session management dan area chat utama. AI response dirender sebagai Markdown.

**Operasi yang Didukung:**

| Operasi | Trigger | API Endpoint | Deskripsi |
|---------|---------|--------------|-----------|
| **List Sessions** | Dialog open | `GET /chatbot/v1/sessions` | Fetch semua chat sessions |
| **Get History** | Select session | `GET /chatbot/v1/chat-history` | Fetch chat history per session |
| **Create Session** | "New Chat" button | `POST /chatbot/v1/create-session` | Buat session baru |
| **Delete Session** | Trash icon | `DELETE /chatbot/v1/delete-session` | Hapus session |
| **Send Message** | Enter/Send button | `POST /chatbot/v1/send-chat` | Kirim message, terima AI reply |

**Data Models:**

| Model | Fields |
|-------|--------|
| **ChatSession** | id, name, messages[], createdAt, updatedAt |
| **Message** | id, role (user/assistant), content, timestamp |
| **TokenUsage** | dailyUsed, dailyLimit, percentage |

### Visualisasi

> [PLACEHOLDER SCREENSHOT - CHAT DIALOG]
> *Gambar 1: AI Chat Dialog dengan session sidebar dan chat area.*

> [PLACEHOLDER SCREENSHOT - SESSION LIST]
> *Gambar 2: Session sidebar dengan list sessions dan delete button.*

> [PLACEHOLDER SCREENSHOT - CHAT MESSAGES]
> *Gambar 3: Chat messages dengan user (blue) dan AI (gray) bubbles.*

> [PLACEHOLDER SCREENSHOT - TOKEN USAGE]
> *Gambar 4: Token usage indicator di header (daily used / limit).*

> [PLACEHOLDER SCREENSHOT - TOKEN LIMIT DIALOG]
> *Gambar 5: Alert dialog saat daily limit reached.*

---

## B. Bedah Arsitektur & Komponen

---

### `src/components/ai-chat-dialog.tsx`
**Layer Terdeteksi:** `UI Component (Main Chat Dialog)`

**Narasi Operasional:**

Komponen utama untuk AI Chat. Dialog fullscreen dengan split-view: session sidebar (kiri) dan chat area (kanan). Menggunakan optimistic update untuk smooth UX â€” message ditampilkan langsung sebelum response dari server.

```tsx
export function AIChatDialog({ open, onOpenChange }: AIChatDialogProps) {
    const [input, setInput] = useState("");
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeSessionId, setActiveSessionId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showTokenLimitDialog, setShowTokenLimitDialog] = useState(false);

    const { tokenUsage, refreshSubscription } = useSubscription();
    const { showPricingModal } = useUsageLimits();

    const activeSession = sessions.find((s) => s.id === activeSessionId);
    const messages = activeSession?.messages || [];

    // Fetch all sessions on dialog open
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

    // Click session -> fetch chat history
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

    // Create new session
    const createNewSession = async () => {
        const res = await apiClient.post<BaseResponse<CreateSessionResponse>>(
            `/chatbot/v1/create-session`
        );

        await fetchData();
        sessionClickHandler(res.data.data.id);
    };

    // Delete session
    const deleteSession = async (sessionId: string) => {
        if (sessions.length <= 1) return;

        const data: DeleteSessionRequest = { chat_session_id: sessionId };
        await apiClient.delete(`/chatbot/v1/delete-session`, { data });

        await fetchData();

        if (activeSessionId === sessionId) {
            const remainingSessions = sessions.filter((s) => s.id !== sessionId);
            sessionClickHandler(remainingSessions[0]?.id ?? "");
        }
    };

    // Send message with optimistic update
    const handleSend = async () => {
        if (!input.trim() || isLoading || !activeSession) return;

        setInput("");
        setIsLoading(true);

        // Optimistic: add user message immediately
        setSessions((prev) =>
            prev.map((s) => {
                if (s.id === activeSessionId) {
                    return {
                        ...s,
                        messages: [
                            ...s.messages,
                            { id: "temp", content: input, role: "user", timestamp: new Date() },
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
            const res = await apiClient.post<BaseResponse<SendChatResponse>>(
                `/chatbot/v1/send-chat`,
                request
            );

            // Replace optimistic message with actual + add AI reply
            setSessions((prev) =>
                prev.map((s) => {
                    if (s.id === activeSessionId) {
                        return {
                            ...s,
                            name: res.data.data.title, // Session title updated based on conversation
                            messages: [
                                ...s.messages.slice(0, -1), // Remove optimistic message
                                {
                                    id: res.data.data.sent.id,
                                    content: res.data.data.sent.chat,
                                    role: res.data.data.sent.role === "model" ? "assistant" : "user",
                                    timestamp: new Date(res.data.data.sent.created_at),
                                },
                                {
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

            // Refresh subscription to get updated token usage
            await refreshSubscription();
        } catch (error: any) {
            // Handle limit exceeded error (429) with pricing modal
            if (!handleLimitExceededError(error, showPricingModal)) {
                // Handle legacy token limit error (500)
                if (error.response?.status === 500 &&
                    error.response?.data?.message?.includes("daily AI usage limit exceeded")) {
                    setShowTokenLimitDialog(true);
                }
            }
            // Remove optimistic user message on error
            setSessions((prev) =>
                prev.map((s) => {
                    if (s.id === activeSessionId) {
                        return { ...s, messages: s.messages.slice(0, -1) };
                    }
                    return { ...s };
                })
            );
            console.error("Failed to send chat:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Fetch sessions on dialog open
    useEffect(() => {
        const fetchList = async () => {
            const newSessions = await fetchData();
            if (newSessions.length > 0) {
                sessionClickHandler(newSessions[0].id);
            }
        };
        if (open) {
            fetchList();
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[700px] flex flex-col bg-gradient-to-br from-white to-gray-50">
                <DialogHeader className="bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 pb-4">
                    <div className="flex items-center justify-between pr-8">
                        <DialogTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Ask AI
                        </DialogTitle>
                        <div className="flex items-center gap-4">
                            {tokenUsage.dailyLimit > 0 && (
                                <div className="w-48">
                                    <TokenUsageIndicator
                                        dailyUsed={tokenUsage.dailyUsed}
                                        dailyLimit={tokenUsage.dailyLimit}
                                        percentage={tokenUsage.percentage}
                                        showLabel={false}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1 text-center">
                                        {tokenUsage.dailyUsed}/{tokenUsage.dailyLimit} requests
                                    </p>
                                </div>
                            )}
                            <Button variant="outline" size="sm" onClick={createNewSession}>
                                <Plus className="h-4 w-4 mr-2" />
                                New Chat
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex flex-1 gap-4 min-h-0">
                    {/* Session Sidebar */}
                    <div className="w-48 border-r border-gray-200 pr-4 flex flex-col">
                        <h4 className="text-sm font-semibold text-gray-800 mb-3">Chat Sessions</h4>
                        <ScrollArea className="flex-1">
                            <div className="space-y-1 pr-2">
                                {sessions.map((session) => (
                                    <div key={session.id} className="flex items-center gap-1">
                                        <Button
                                            variant={activeSessionId === session.id ? "secondary" : "ghost"}
                                            size="sm"
                                            className={`flex-1 justify-start ${activeSessionId === session.id
                                                ? "bg-gradient-to-r from-blue-50 to-blue-100 border-l-2 border-blue-500"
                                                : "hover:bg-gray-50"
                                            }`}
                                            onClick={() => sessionClickHandler(session.id)}
                                        >
                                            <span className="truncate w-full text-xs">
                                                {session.name.length > 18 ? `${session.name.slice(0, 18)}...` : session.name}
                                            </span>
                                        </Button>
                                        {sessions.length > 1 && (
                                            <Button variant="ghost" size="sm" onClick={() => deleteSession(session.id)}>
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col min-w-0">
                        <ScrollArea className="flex-1 pr-4">
                            <div className="space-y-4 p-4">
                                {messages.map((message) => (
                                    <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                                        <div className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
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
                                            <div className={`rounded-lg p-3 shadow-sm ${message.role === "user"
                                                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                                                : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900 border border-gray-200"
                                            }`}>
                                                {message.role === "assistant" && (
                                                    <ReactMarkdown className={"prose prose-sm"}>
                                                        {message.content}
                                                    </ReactMarkdown>
                                                )}
                                                {message.role === "user" && (
                                                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                                                )}
                                                <div className={`text-xs mt-1 ${message.role === "user" ? "opacity-70" : "opacity-60"}`}>
                                                    {message.timestamp.toLocaleTimeString()}
                                                </div>
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
                                                <span className="text-sm text-gray-600">AI is thinking...</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="flex gap-2 pt-4 border-t border-gray-200 px-4 pb-4">
                            <Textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask me anything about your notes..."
                                className="flex-1 min-h-[40px] max-h-[120px]"
                                disabled={isLoading}
                            />
                            <Button onClick={handleSend} disabled={!input.trim() || isLoading}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <TokenLimitDialog
                    open={showTokenLimitDialog}
                    onOpenChange={setShowTokenLimitDialog}
                    dailyLimit={tokenUsage.dailyLimit}
                />
            </DialogContent>
        </Dialog>
    );
}
```
*Caption: Snippet 1: AI Chat Dialog dengan session management dan optimistic updates.*

---

### `src/types/ai-chat.ts`
**Layer Terdeteksi:** `Type Definitions`

**Narasi Operasional:**

Type definitions untuk chat system. Message dengan role (user/assistant), ChatSession dengan messages array.

```tsx
export interface Message {
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: Date
}

export interface ChatSession {
    id: string
    name: string
    messages: Message[]
    createdAt: Date
    updatedAt: Date
}
```
*Caption: Snippet 2: Chat type definitions.*

---

### `src/dto/chatbot.ts`
**Layer Terdeteksi:** `DTO Definitions`

**Narasi Operasional:**

DTOs untuk chatbot API requests dan responses. Includes session CRUD dan send chat.

```tsx
export interface GetAllSessionsResponse {
    id: string;
    title: string;
    created_at: Date;
    updated_at: Date | null;
}

export interface GetChatHistoryResponse {
    id: string;
    role: string;    // "user" or "model"
    chat: string;
    created_at: Date;
}

export interface CreateSessionResponse {
    id: string;
}

export interface DeleteSessionRequest {
    chat_session_id: string;
}

export interface SendChatRequest {
    chat_session_id: string;
    chat: string;
}

export interface SendChatResponseChat {
    id: string;
    chat: string;
    role: string;
    created_at: Date;
}

export interface SendChatResponse {
    chat_session_id: string;
    title: string;           // Auto-generated session title from conversation
    sent: SendChatResponseChat;    // User message (confirmed)
    reply: SendChatResponseChat;   // AI reply
}
```
*Caption: Snippet 3: Chatbot DTOs untuk API communication.*

---

### `src/components/common/TokenUsageIndicator.tsx`
**Layer Terdeteksi:** `UI Component (Usage Meter)`

**Narasi Operasional:**

Progress bar untuk menampilkan AI usage. Color-coded: green (normal), yellow (80%), red (90%). Tidak ditampilkan jika unlimited (dailyLimit = 0).

```tsx
export function TokenUsageIndicator({
    dailyUsed,
    dailyLimit,
    percentage,
    className,
    showLabel = true,
}: TokenUsageIndicatorProps) {
    // Determine color based on usage percentage
    const getColor = () => {
        if (percentage >= 90) return 'text-red-600';
        if (percentage >= 80) return 'text-yellow-600';
        return 'text-green-600';
    };

    const getProgressColor = () => {
        if (percentage >= 90) return 'bg-red-600';
        if (percentage >= 80) return 'bg-yellow-600';
        return 'bg-green-600';
    };

    // If no limit set (unlimited), don't show indicator
    if (dailyLimit === 0) {
        return null;
    }

    return (
        <div className={cn('space-y-1', className)}>
            {showLabel && (
                <div className={cn('text-xs font-medium flex items-center justify-between', getColor())}>
                    <span>AI Usage Today</span>
                    <span>{dailyUsed} / {dailyLimit}</span>
                </div>
            )}
            <Progress value={percentage} className="h-1.5" indicatorClassName={getProgressColor()} />
            {showLabel && percentage >= 80 && (
                <p className="text-xs text-muted-foreground">
                    {percentage >= 90 ? 'Almost at your daily limit!' : 'Approaching daily limit'}
                </p>
            )}
        </div>
    );
}
```
*Caption: Snippet 4: Token usage indicator dengan color-coded progress.*

---

### `src/components/common/TokenLimitDialog.tsx`
**Layer Terdeteksi:** `UI Component (Limit Alert)`

**Narasi Operasional:**

Alert dialog ditampilkan saat daily limit tercapai. Offers upgrade option yang navigate ke pricing page.

```tsx
export function TokenLimitDialog({ open, onOpenChange, dailyLimit }: TokenLimitDialogProps) {
    const navigate = useNavigate();

    const handleUpgrade = () => {
        onOpenChange(false);
        navigate({ to: '/pricing' });
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Daily AI Limit Reached</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                        <p>You've used all {dailyLimit} of your AI requests for today.</p>
                        <p>Your usage will reset in 24 hours, or you can upgrade your plan for higher limits.</p>
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
*Caption: Snippet 5: Token limit dialog dengan upgrade option.*

---

### `src/pages/MainApp.tsx (Chat Integration)`
**Layer Terdeteksi:** `Page Component (Chat Trigger)`

**Narasi Operasional:**

Chat dialog diintegrasikan ke MainApp. State `chatOpen` mengontrol visibility, triggered dari UI button.

```tsx
import { AIChatDialog } from "@/components/ai-chat-dialog";

// In MainApp component:
const [chatOpen, setChatOpen] = useState(false);

// In render:
<AIChatDialog open={chatOpen} onOpenChange={setChatOpen} notes={notes} />
```
*Caption: Snippet 6: Chat dialog integration di MainApp.*

---

## C. Ringkasan Ketergantungan Komponen

| Komponen | Menerima Dari | Meneruskan Ke |
|----------|---------------|---------------|
| `MainApp` | User action | `AIChatDialog` (open state) |
| `AIChatDialog` | API responses | Session list, Messages, `TokenLimitDialog` |
| `TokenUsageIndicator` | `useSubscription().tokenUsage` | Progress display |
| `TokenLimitDialog` | Limit error | Navigate to pricing |

---

## D. Diagram Chat Dialog Layout

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Ask AI                                [Token: 45/50] [+ New Chat]      X  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                            â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚  Chat Sessions   â”‚                                                 â”‚   â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”â”‚              â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚   â”‚
â”‚  â”‚  â”‚ How to use...â”‚â”‚              â”‚ ðŸ¤– Hello! How can I help    â”‚   â”‚   â”‚
â”‚  â”‚  â”‚ Dec 25       â”‚â”‚              â”‚   you with your notes?      â”‚   â”‚   â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜â”‚              â”‚   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€      â”‚   â”‚   â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”â”‚              â”‚   10:30 AM                  â”‚   â”‚   â”‚
â”‚  â”‚  â”‚ Note organizâ”‚â”‚              â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚   â”‚
â”‚  â”‚  â”‚ Dec 24    ðŸ—‘ â”‚â”‚                                                 â”‚   â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜â”‚                      â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚   â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”â”‚                      â”‚ ðŸ‘¤ How do I create  â”‚   â”‚   â”‚
â”‚  â”‚  â”‚ AI features  â”‚â”‚                      â”‚   a new notebook?   â”‚   â”‚   â”‚
â”‚  â”‚  â”‚ Dec 23    ðŸ—‘ â”‚â”‚                      â”‚   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€     â”‚   â”‚   â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜â”‚                      â”‚   10:31 AM          â”‚   â”‚   â”‚
â”‚  â”‚                   â”‚                      â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚   â”‚
â”‚  â”‚                   â”‚              â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚   â”‚
â”‚  â”‚                   â”‚              â”‚ ðŸ¤– To create a notebook,    â”‚   â”‚   â”‚
â”‚  â”‚                   â”‚              â”‚   click the "+" button in   â”‚   â”‚   â”‚
â”‚  â”‚                   â”‚              â”‚   the sidebar and select... â”‚   â”‚   â”‚
â”‚  â”‚                   â”‚              â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚   â”‚
â”‚  â”‚                   â”‚                                                 â”‚   â”‚
â”‚  â”‚                   â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”â”‚   â”‚
â”‚  â”‚                   â”‚  â”‚ ðŸ”„ AI is thinking...                        â”‚â”‚   â”‚
â”‚  â”‚                   â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜â”‚   â”‚
â”‚  â”‚                   â”‚                                                 â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                                                                            â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚ Ask me anything about your notes...                         [ðŸ“¤]  â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## E. API Endpoints Summary

| Endpoint | Method | Request Body | Response |
|----------|--------|--------------|----------|
| `/chatbot/v1/sessions` | GET | - | `ChatSession[]` |
| `/chatbot/v1/chat-history?chat_session_id=` | GET | - | `Message[]` |
| `/chatbot/v1/create-session` | POST | - | `{ id }` |
| `/chatbot/v1/delete-session` | DELETE | `{ chat_session_id }` | - |
| `/chatbot/v1/send-chat` | POST | `{ chat, chat_session_id }` | `{ sent, reply, title }` |

---

## F. Error Handling

| Error Type | Status Code | Handling |
|------------|-------------|----------|
| **Limit Exceeded** | 429 | `showPricingModal()` via `handleLimitExceededError` |
| **Legacy Limit** | 500 + message | `setShowTokenLimitDialog(true)` |
| **Network Error** | - | Remove optimistic message, log error |

---

## G. Token Usage Color Coding

| Percentage | Color | Indicator |
|------------|-------|-----------|
| 0-79% | Green | Normal usage |
| 80-89% | Yellow | "Approaching daily limit" |
| 90-100% | Red | "Almost at your daily limit!" |

---

*Dokumen ini dibuat secara otomatis berdasarkan analisis kode sumber dalam mode READ-ONLY.*
