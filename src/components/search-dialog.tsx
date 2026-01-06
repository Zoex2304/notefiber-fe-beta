"use client"

import * as React from "react"
import type { Note } from "@/types/note"
import { apiClient } from "@/api/client/axios.client"
import type { BaseResponse } from "@/dto/base-response"
import type { GetSemanticSearchResponse } from "@/dto/note"
import { useChatStore } from "@/stores/useChatStore"
import { Checkbox } from "@/components/shadui/checkbox"
import { Button } from "@/components/shadui/button"
import { Badge } from "@/components/shadui/badge"
import {
    Command,
    CommandDialog,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/shadui/command"
import {
    FileText,
    Loader2,
    SearchX,
    Search,
    Clock,
    MessageSquarePlus
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    notes: Note[]
    onNoteSelect: (noteId: string) => void
}

export function SearchDialog({ open, onOpenChange, onNoteSelect, notes }: SearchDialogProps) {
    const [query, setQuery] = React.useState("")
    const [semanticResults, setSemanticResults] = React.useState<Note[]>([])
    const [isSearching, setIsSearching] = React.useState(false)
    // Store access for export
    const setPreloadedReferences = useChatStore(state => state.setPreloadedReferences)
    // Removed direct sidebar control in favor of event dispatch

    // Selection state
    const [selectedNotes, setSelectedNotes] = React.useState<Set<string>>(new Set())

    const handleExportToChat = () => {
        const selected = semanticResults.filter(n => selectedNotes.has(n.id))
        setPreloadedReferences(selected)
        onOpenChange(false)

        // Dispatch a custom event that RightSidebar can listen to? 
        // Or simply relying on the user opening it. 
        // Ideally we should open it. 
        // Let's try emitting a window event for now as a quick fix or just rely on manual opening.
        // Actually, let's keep it clean. Just set data and close.
        // Provide visual feedback?

        // Let's dispatch a custom event 'open-chat-sidebar' that `MainApp.tsx` or `PersistentLayout` might listen to.
        window.dispatchEvent(new CustomEvent('open-chat-sidebar'))
    }

    // Derived state for local search
    const recentNotes = React.useMemo(() => {
        return [...notes].sort((a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ).slice(0, 5);
    }, [notes]);

    React.useEffect(() => {
        // Clear selection when query changes significantly or dialog closes? 
        // Maybe keep selection while searching different terms? 
        // Let's keep selection to allow multi-query gathering!
    }, [query])

    React.useEffect(() => {
        if (!open) {
            setSemanticResults([])
            setQuery("")
            setSelectedNotes(new Set())
        }
    }, [open])

    /* ... existing search effect ... */
    React.useEffect(() => {
        if (!query.trim()) {
            setSemanticResults([])
            return
        }

        setIsSearching(true)

        const searchTimeout = setTimeout(async () => {
            try {
                const res = await apiClient.get<BaseResponse<GetSemanticSearchResponse[]>>(
                    `/note/v1/semantic-search?q=${query}`
                )
                const apiData = res.data.data ?? []
                const data: Note[] = apiData.map(note => ({
                    id: note.id,
                    content: note.content,
                    notebookId: note.notebook_id,
                    title: note.title,
                    createdAt: new Date(note.created_at),
                    updatedAt: new Date(note.updated_at ?? note.created_at)
                }))

                setSemanticResults(data)
            } catch (error) {
                console.error("Search failed:", error)
                setSemanticResults([])
            } finally {
                setIsSearching(false)
            }
        }, 300)

        return () => clearTimeout(searchTimeout)
    }, [query])

    const handleSelect = (noteId: string) => {
        if (selectedNotes.size > 0) {
            // If in selection mode, clicking row acts as toggle
            // But we need to pass event to stop propagation? 
            // Let's simplify: if selecting, separate click areas?
            // User behavior: Click text -> Go to note. Click checkbox -> Select.
            // So handleSelect should remain "Go to note".
            // We'll wrap checkbox in stopPropagation.
        }

        onNoteSelect(noteId)
        onOpenChange(false)
        setQuery("")
    }

    return (
        <CommandDialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <Command shouldFilter={false}>
                <div className="flex flex-col h-full max-h-[600px]">
                    <CommandInput
                        placeholder="Search notes (semantic & fuzzy)..."
                        value={query}
                        onValueChange={setQuery}
                    />
                    <CommandList className="flex-1 overflow-y-auto">
                        {/* Loading State */}
                        {isSearching && (
                            <div className="flex flex-col items-center justify-center py-8 gap-2 bg-gradient-to-b from-transparent to-gray-50/50">
                                <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                                <p className="text-xs font-medium text-purple-600/80 animate-pulse">Thinking...</p>
                            </div>
                        )}

                        {/* Empty State */}
                        {!isSearching && query && semanticResults.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in-95 duration-200">
                                <div className="bg-gray-50 p-4 rounded-full mb-3 ring-1 ring-gray-100">
                                    <SearchX className="h-6 w-6 text-gray-400" />
                                </div>
                                <h3 className="text-sm font-semibold text-gray-900">No matches found</h3>
                            </div>
                        )}

                        {/* Semantic Results */}
                        {!isSearching && semanticResults.length > 0 && (
                            <CommandGroup heading="Contextual Matches" className="px-2 pb-2 text-violet-900 group-heading:text-xs group-heading:font-bold group-heading:uppercase group-heading:tracking-wider">
                                {semanticResults.map((note, index) => {
                                    const isSelected = selectedNotes.has(note.id);
                                    return (
                                        <CommandItem
                                            key={note.id}
                                            value={note.id}
                                            onSelect={() => handleSelect(note.id)}
                                            className={cn(
                                                "relative flex items-start gap-3 p-3 mb-2 rounded-xl border shadow-sm transition-all cursor-pointer group aria-selected:bg-transparent data-[disabled]:opacity-100 !opacity-100 !pointer-events-auto",
                                                "animate-in slide-in-from-bottom-2 fade-in duration-300",
                                                isSelected
                                                    ? "border-violet-500 bg-violet-50/40 shadow-violet-100 ring-1 ring-violet-500/20"
                                                    : "border-gray-100 bg-white hover:shadow-md hover:border-violet-200 hover:bg-violet-50/10"
                                            )}
                                            style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                                        >
                                            {/* Selection Checkbox - Stop propagation to prevent navigation */}
                                            <div
                                                className="pt-0.5 shrink-0 z-10"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={(checked) => {
                                                        const newSelected = new Set(selectedNotes)
                                                        if (checked) {
                                                            if (newSelected.size >= 5) return
                                                            newSelected.add(note.id)
                                                        } else {
                                                            newSelected.delete(note.id)
                                                        }
                                                        setSelectedNotes(newSelected)
                                                    }}
                                                    className={cn(
                                                        "h-4 w-4 transition-all !text-white",
                                                        isSelected
                                                            ? "!bg-violet-600 !border-violet-600"
                                                            : "border-gray-300 data-[state=checked]:!bg-violet-600 data-[state=checked]:!border-violet-600"
                                                    )}
                                                />
                                            </div>

                                            {/* Content Container - Clicking here triggers CommandItem onSelect */}
                                            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                                                {/* Header */}
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <div className={cn(
                                                            "p-1 px-1.5 rounded-md shrink-0 transition-colors",
                                                            isSelected
                                                                ? "bg-violet-100 text-violet-700"
                                                                : "bg-gradient-to-br from-violet-100 to-indigo-50 text-violet-600"
                                                        )}>
                                                            <FileText className="h-3.5 w-3.5" />
                                                        </div>
                                                        <span className={cn(
                                                            "font-semibold truncate text-sm transition-colors",
                                                            isSelected ? "text-violet-900" : "text-gray-900 group-hover:text-violet-700"
                                                        )}>
                                                            {note.title}
                                                        </span>
                                                    </div>
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-[10px] px-1.5 h-5 bg-gradient-to-r from-violet-100/80 to-indigo-100/80 text-violet-700 shadow-none border border-violet-100/50"
                                                    >
                                                        AI Match
                                                    </Badge>
                                                </div>

                                                {/* Snippet - Always Gray */}
                                                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed font-medium pl-1">
                                                    {note.content}
                                                </p>
                                            </div>
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        )}

                        {/* Recent Items */}
                        {!query && recentNotes.length > 0 && (
                            <>
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <div className="bg-purple-50 p-3 rounded-full mb-3">
                                        <Search className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-800">Ready to search</p>
                                </div>
                                <CommandSeparator className="my-2" />
                                <CommandGroup heading="Recent Notes">
                                    {recentNotes.map((note) => (
                                        <CommandItem
                                            key={note.id}
                                            value={note.id}
                                            onSelect={() => handleSelect(note.id)}
                                            className="flex items-center gap-2 py-2.5 px-4 cursor-pointer m-1 rounded-md"
                                        >
                                            <Clock className="h-3.5 w-3.5 text-gray-400" />
                                            <span className="text-sm text-gray-700">{note.title}</span>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>

                    {/* Export Footer */}
                    {selectedNotes.size > 0 && (
                        <div className="p-3 border-t bg-gray-50 flex items-center justify-between animate-in slide-in-from-bottom-2">
                            <span className="text-xs text-gray-500 font-medium ml-2">
                                {selectedNotes.size} note{selectedNotes.size !== 1 ? 's' : ''} selected
                            </span>
                            <Button
                                onClick={handleExportToChat}
                                size="sm"
                                className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
                            >
                                <MessageSquarePlus className="h-4 w-4" />
                                Continue to Chat
                            </Button>
                        </div>
                    )}
                </div>
            </Command>
        </CommandDialog>
    )
}
