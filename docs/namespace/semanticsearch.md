# Dokumentasi Fitur: Semantic Search

**Tanggal Dokumentasi:** 25 Desember 2024  
**Fokus Domain:** Frontend (User App)  
**Lokasi:** `src/components/`

---

## Alur Data Semantik

```
[User di MainApp Workspace]
    -> [Click Search Icon di TopBar]
    -> [checkCanUseSemanticSearch: Check daily limit]
        -> [Limit Exceeded] -> [Show PricingModal] -> Stop
        -> [Limit OK] -> Continue
    -> [checkPermission('semantic_search')]
        -> [Not Allowed] -> [Dispatch UPGRADE_EVENT] -> Stop
        -> [Allowed] -> Continue
    -> [SearchDialog opens]
    -> [User types query]
    -> [Debounced API: GET /note/v1/semantic-search?q=query]
    -> [Display results as clickable note cards]
    -> [Click result] -> [Navigate to note in MainApp]
```

---

## A. Laporan Implementasi Fitur Semantic Search

### Deskripsi Fungsional

Fitur ini menyediakan pencarian semantik berbasis AI untuk menemukan notes berdasarkan meaning, bukan hanya keyword matching. Menggunakan vector embeddings di backend untuk contextual matching.

**Operasi yang Didukung:**

| Operasi | Trigger | API Endpoint | Deskripsi |
|---------|---------|--------------|-----------|
| **Check Permission** | Search icon click | - | Check jika plan memiliki fitur |
| **Check Daily Limit** | Before dialog open | Refetch usage status | Check daily limit |
| **Semantic Search** | Query input | `GET /note/v1/semantic-search?q=` | Vector-based search |
| **Select Result** | Click result | - | Navigate ke note |

**Permission Checks:**

| Check | Layer | Action if Failed |
|-------|-------|------------------|
| `checkCanUseSemanticSearch` | Daily limit | Show PricingModal |
| `checkPermission('semantic_search')` | Plan feature | Dispatch UPGRADE_EVENT |

### Visualisasi

> [PLACEHOLDER SCREENSHOT - SEARCH BUTTON]
> *Gambar 1: Search icon di TopBar (hanya visible jika plan supports).*

> [PLACEHOLDER SCREENSHOT - SEARCH DIALOG]
> *Gambar 2: Search dialog dengan input field dan hasil.*

> [PLACEHOLDER SCREENSHOT - SEARCH RESULTS]
> *Gambar 3: Search results dengan note cards.*

> [PLACEHOLDER SCREENSHOT - NO RESULTS]
> *Gambar 4: Empty state saat no results found.*

> [PLACEHOLDER SCREENSHOT - PRICING MODAL]
> *Gambar 5: Pricing modal saat daily limit exceeded.*

---

## B. Bedah Arsitektur & Komponen

---

### `src/components/search-dialog.tsx`
**Layer Terdeteksi:** `UI Component (Search Dialog)`

**Narasi Operasional:**

Dialog modal untuk semantic search. Input field dengan debounced search (300ms delay). Results ditampilkan sebagai clickable cards. Saat user click result, dialog closes dan note di-select.

```tsx
function SearchDialog({ open, onOpenChange, notes, onNoteSelect }: SearchDialogProps) {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<Note[]>([])
    const [isSearching, setIsSearching] = useState(false)

    useEffect(() => {
        if (!query.trim()) {
            setResults([])
            return
        }

        setIsSearching(true)

        // Debounced search (300ms delay)
        const searchTimeout = setTimeout(async () => {
            const res = await apiClient.get<BaseResponse<GetSemanticSearchResponse[]>>(
                `/note/v1/semantic-search?q=${query}`
            )
            const data: Note[] = res.data.data.map(note => ({
                id: note.id,
                content: note.content,
                notebookId: note.notebook_id,
                title: note.title,
                createdAt: new Date(note.created_at),
                updatedAt: new Date(note.updated_at ?? note.created_at)
            }))

            setResults(data)
            setIsSearching(false)
        }, 300)

        return () => clearTimeout(searchTimeout)
    }, [query, notes])

    const handleNoteSelect = (noteId: string) => {
        onNoteSelect(noteId)
        setQuery("")
        setResults([])
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Semantic Search</DialogTitle>
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
                        {/* Loading State */}
                        {isSearching && (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                <span className="ml-2 text-sm text-gray-600">Searching...</span>
                            </div>
                        )}

                        {/* Results List */}
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
                                            <div className="font-medium text-sm truncate">{note.title}</div>
                                            <div className="text-xs text-gray-500 mt-1 truncate">
                                                {note.content.replace(/[#*\n]/g, " ").substring(0, 80)}...
                                            </div>
                                            <div className="text-xs text-blue-600 mt-1">Click to open</div>
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        )}

                        {/* Empty State */}
                        {!isSearching && query && results.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>No notes found for "{query}"</p>
                                <p className="text-xs mt-2">Try different keywords or create a new note</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="text-xs text-gray-400 text-center border-t pt-3">
                        Advanced semantic search technology helps you find relevant content across all your
                        notes using natural language understanding and contextual matching.
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export { SearchDialog };
```
*Caption: Snippet 1: Search Dialog dengan debounced API call dan result cards.*

---

### `src/components/common/TopBar.tsx`
**Layer Terdeteksi:** `UI Component (TopBar with Search Button)`

**Narasi Operasional:**

TopBar menampilkan search button hanya jika user's plan memiliki semantic_search permission. Button trigger `onSearchClick` callback ke parent.

```tsx
export const TopBar = ({ onSearchClick, onChatClick }: TopBarProps) => {
    const { checkPermission, tokenUsage } = useSubscription();

    const showSearch = checkPermission('semantic_search');
    const showChat = checkPermission('ai_chat');

    return (
        <div className="w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-50">
            {/* Left: Logo */}
            <div className="flex items-center">
                <Logo variant="horizontal" className="h-8" />
            </div>

            {/* Right: Actions & Profile */}
            <div className="flex items-center gap-2">
                {/* Plan Status Pill */}
                <PlanStatusPill className="mr-2" />

                {/* Search Button - Only shown if plan allows */}
                {showSearch && (
                    <ActionTooltip label="Search">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onSearchClick}
                            className="h-9 w-9 p-0 hover:bg-gray-100 rounded-full text-gray-600"
                        >
                            <Search className="h-5 w-5" />
                        </Button>
                    </ActionTooltip>
                )}

                {/* Chat Button - Only shown if plan allows */}
                {showChat && (
                    <div className="flex items-center gap-2">
                        <ActionTooltip label="Chat with AI">
                            <Button variant="ghost" size="sm" onClick={onChatClick}>
                                <MessageSquare className="h-5 w-5" />
                            </Button>
                        </ActionTooltip>
                        {/* Token Usage Indicator */}
                        {tokenUsage.dailyLimit > 0 && (
                            <div className="w-32">
                                <TokenUsageIndicator
                                    dailyUsed={tokenUsage.dailyUsed}
                                    dailyLimit={tokenUsage.dailyLimit}
                                    percentage={tokenUsage.percentage}
                                    showLabel={false}
                                />
                            </div>
                        )}
                    </div>
                )}

                {(showSearch || showChat) && <div className="h-6 w-px bg-gray-200 mx-2" />}

                <UserProfileMenu />
            </div>
        </div>
    );
};
```
*Caption: Snippet 2: TopBar dengan conditional search button visibility.*

---

### `src/pages/MainApp.tsx (Search Handler)`
**Layer Terdeteksi:** `Page Component (Search Integration)`

**Narasi Operasional:**

MainApp handles search click dengan dual check: (1) daily limit via UsageLimitsContext, (2) plan permission via SubscriptionContext. Jika keduanya pass, dialog opens.

```tsx
// State
const [searchOpen, setSearchOpen] = useState(false);

// From contexts
const { checkCanUseSemanticSearch } = useUsageLimits();
const { checkPermission } = useSubscription();

const handleSearchClick = async () => {
    // First check daily limit for semantic search
    const canUse = await checkCanUseSemanticSearch();
    if (!canUse) return; // Modal auto-shows if limit exceeded

    // Then check if feature is enabled for plan
    if (checkPermission('semantic_search')) {
        setSearchOpen(true);
    } else {
        window.dispatchEvent(new Event(UPGRADE_EVENT));
    }
};

// In render:
<TopBar
    onSearchClick={handleSearchClick}
    onChatClick={handleChatClick}
/>

<SearchDialog
    open={searchOpen}
    onOpenChange={setSearchOpen}
    notes={notes}
    onNoteSelect={(noteId) => {
        setSearchOpen(false)
        // Navigate to the selected note
        handleNoteSelect(noteId)
    }}
/>
```
*Caption: Snippet 3: Search handler dengan permission dan limit checks.*

---

### `src/contexts/UsageLimitsContext.tsx (Semantic Search Limit)`
**Layer Terdeteksi:** `Context Provider (Daily Limit Check)`

**Narasi Operasional:**

Context menyediakan `checkCanUseSemanticSearch` function. Refetches usage status sebelum check untuk ensure fresh data. Shows PricingModal jika limit exceeded.

```tsx
const checkCanUseSemanticSearch = useCallback(async () => {
    const result = await usage.refetch();
    const freshData = result.data?.data;
    const canUse = freshData?.daily.semantic_search.can_use ?? false;
    
    if (!canUse && freshData?.daily?.semantic_search) {
        showPricingModal('semantic searches', {
            used: freshData.daily.semantic_search.used,
            limit: freshData.daily.semantic_search.limit,
            resetsAt: freshData.daily.semantic_search.resets_at,
        });
    }
    return canUse;
}, [usage, showPricingModal]);

// Provided via context
<UsageLimitsContext.Provider
    value={{
        showPricingModal,
        hidePricingModal,
        isPricingModalOpen,
        checkCanCreateNotebook,
        checkCanCreateNote,
        checkCanUseAiChat,
        checkCanUseSemanticSearch,  // <-- Semantic search limit check
        usage,
    }}
>
```
*Caption: Snippet 4: Semantic search daily limit check dengan auto pricing modal.*

---

### `src/dto/note.ts`
**Layer Terdeteksi:** `DTO Definitions`

**Narasi Operasional:**

Response type untuk semantic search API. Returns matching notes dengan full details.

```tsx
export interface GetSemanticSearchResponse {
    id: string;
    title: string;
    content: string;
    notebook_id: string;
    created_at: Date;
    updated_at: Date | null;
}
```
*Caption: Snippet 5: Semantic search response DTO.*

---

## C. Ringkasan Ketergantungan Komponen

| Komponen | Menerima Dari | Meneruskan Ke |
|----------|---------------|---------------|
| `TopBar` | `checkPermission()` | `onSearchClick` callback |
| `MainApp` | TopBar click | `checkCanUseSemanticSearch`, `SearchDialog` |
| `UsageLimitsContext` | Usage API | `checkCanUseSemanticSearch`, `PricingModal` |
| `SearchDialog` | Semantic Search API | Parent via `onNoteSelect` |

---

## D. Diagram Search Dialog Layout

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Semantic Search                                            X  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚  â”‚ ðŸ” Search your notes semantically...                     â”‚ â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚                                                                â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚  â”‚                       Results                             â”‚ â”‚
â”‚  â”‚                                                           â”‚ â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚ â”‚
â”‚  â”‚  â”‚ ðŸ“„ Meeting Notes - Project Alpha                     â”‚ â”‚ â”‚
â”‚  â”‚  â”‚    Discussion about AI integration strategy and...  â”‚ â”‚ â”‚
â”‚  â”‚  â”‚    Click to open                                     â”‚ â”‚ â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚ â”‚
â”‚  â”‚                                                           â”‚ â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚ â”‚
â”‚  â”‚  â”‚ ðŸ“„ Research Summary                                   â”‚ â”‚ â”‚
â”‚  â”‚  â”‚    Key findings from semantic search technology...  â”‚ â”‚ â”‚
â”‚  â”‚  â”‚    Click to open                                     â”‚ â”‚ â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚ â”‚
â”‚  â”‚                                                           â”‚ â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚ â”‚
â”‚  â”‚  â”‚ ðŸ“„ Implementation Plan                                â”‚ â”‚ â”‚
â”‚  â”‚  â”‚    Vector embeddings and similarity matching for...  â”‚ â”‚ â”‚
â”‚  â”‚  â”‚    Click to open                                     â”‚ â”‚ â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚ â”‚
â”‚  â”‚                                                           â”‚ â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚                                                                â”‚
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ â”‚
â”‚  Advanced semantic search technology helps you find           â”‚
â”‚  relevant content using natural language understanding.       â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## E. Permission Flow

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    Semantic Search Permission Flow               â”‚
â”‚                                                                  â”‚
â”‚  [User clicks Search Icon]                                       â”‚
â”‚              â”‚                                                   â”‚
â”‚              â–¼                                                   â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                      â”‚
â”‚  â”‚  checkCanUseSemanticSearch()          â”‚                      â”‚
â”‚  â”‚  (Refetch usage â†’ check daily limit)  â”‚                      â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                      â”‚
â”‚              â”‚                                                   â”‚
â”‚      â”Œâ”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”                                          â”‚
â”‚      â–¼               â–¼                                          â”‚
â”‚  [can_use=false]  [can_use=true]                                â”‚
â”‚      â”‚               â”‚                                          â”‚
â”‚      â–¼               â–¼                                          â”‚
â”‚  [Show Pricing   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”      â”‚
â”‚   Modal with:    â”‚  checkPermission('semantic_search')   â”‚      â”‚
â”‚   - used/limit   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜      â”‚
â”‚   - resets_at]           â”‚                                      â”‚
â”‚      â”‚           â”Œâ”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”                              â”‚
â”‚      â”‚           â–¼               â–¼                              â”‚
â”‚      â”‚      [false]          [true]                             â”‚
â”‚      â”‚           â”‚               â”‚                              â”‚
â”‚      â”‚           â–¼               â–¼                              â”‚
â”‚      â”‚   [Dispatch         [setSearchOpen(true)]                â”‚
â”‚      â”‚    UPGRADE_EVENT]         â”‚                              â”‚
â”‚      â”‚           â”‚               â–¼                              â”‚
â”‚      â”‚           â”‚       [SearchDialog Opens]                   â”‚
â”‚      â”‚           â”‚               â”‚                              â”‚
â”‚      â–¼           â–¼               â–¼                              â”‚
â”‚  [STOP]       [STOP]      [User can search]                     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## F. API Endpoint

| Endpoint | Method | Query Param | Response |
|----------|--------|-------------|----------|
| `/note/v1/semantic-search` | GET | `q=<query>` | `GetSemanticSearchResponse[]` |

**Response Fields:**
- `id` - Note ID
- `title` - Note title
- `content` - Note content (full)
- `notebook_id` - Parent notebook
- `created_at`, `updated_at` - Timestamps

---

## G. Daily Limit Info

| Field | Description |
|-------|-------------|
| `used` | Number of searches used today |
| `limit` | Maximum searches per day |
| `can_use` | Boolean flag if can search |
| `resets_at` | ISO timestamp when limit resets |

---

*Dokumen ini dibuat secara otomatis berdasarkan analisis kode sumber dalam mode READ-ONLY.*
