"use client"

import { useState } from "react"
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileText, Edit2, Trash2, Plus, MessageSquarePlus } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "./ui/context-menu"
import {
    Collapsible,
    CollapsibleContent,
} from "./ui/collapsible"
import { cn } from "../lib/utils"
import type { Note } from "../types/note"
import type { Notebook } from "../types/notebook"
import { apiClient } from "@/api/client/axios.client"
import type { BaseResponse } from "../dto/base-response"
import type { UpdateNotebookResponse, UpdateNotebookRequest } from "../dto/notebook"
import { useChatStore } from "@/stores/useChatStore"
import { useSubscriptionStore } from "@/stores/useSubscriptionStore"

interface SidebarProps {
    notebooks: Notebook[]
    notes: Note[]
    selectedNotebook: string | null
    selectedNote: string | null
    onNotebookSelect: (notebookId: string) => void
    onNoteSelect: (noteId: string) => void
    onNotebookUpdate: (notebookId: string, updates: Partial<Notebook>) => void
    onNoteUpdate?: (noteId: string, updates: Partial<Note>) => void
    onDeleteNotebook: (notebookId: string) => void
    onDeleteNote: (noteId: string) => void
    onMoveNote: (noteId: string, targetNotebookId: string) => void
    onMoveNotebook: (notebookId: string, targetParentId: string | null) => void
    expandedNotebooks: Set<string>
    setExpandedNotebooks: (expanded: Set<string>) => void
    isProcessingMove: boolean
    isDeletingNotebook: string | null
    isDeletingNote: string | null
    onCreateNote?: (notebookId: string) => void
}

export function Sidebar({
    notebooks,
    notes,
    selectedNotebook,
    selectedNote,
    onNotebookSelect,
    onNoteSelect,
    onNotebookUpdate,
    onDeleteNotebook,
    onDeleteNote,
    onMoveNote,
    onMoveNotebook,
    expandedNotebooks,
    setExpandedNotebooks,
    isProcessingMove,
    isDeletingNotebook, // Destructure new prop
    isDeletingNote,
    onCreateNote,
    onNoteUpdate,
}: SidebarProps) {
    const [editingNotebook, setEditingNotebook] = useState<string | null>(null)
    const [editingNote, setEditingNote] = useState<string | null>(null)
    const [editingName, setEditingName] = useState("")
    const [draggedItem, setDraggedItem] = useState<{ type: "notebook" | "note"; id: string } | null>(null)
    console.log(draggedItem); // Temporary usage to bypass unused var check pending full implementation
    const [dragOverItem, setDragOverItem] = useState<{ type: "notebook" | "note"; id: string } | null>(null)
    const [isSavingNotebookName, setIsSavingNotebookName] = useState(false)
    const [isSavingNoteName, setIsSavingNoteName] = useState(false)

    // AI Chat integration
    const setPreloadedReferences = useChatStore(state => state.setPreloadedReferences)
    const canUseAI = useSubscriptionStore(state => state.checkPermission('ai_chat'))

    const toggleNotebook = (notebookId: string) => {
        const newExpanded = new Set(expandedNotebooks)
        if (newExpanded.has(notebookId)) {
            newExpanded.delete(notebookId)
        } else {
            newExpanded.add(notebookId)
        }
        setExpandedNotebooks(newExpanded)
    }

    const buildNotebookTree = (parentId: string | null = null): Notebook[] => {
        return notebooks.filter((notebook) => notebook.parentId === parentId).sort((a, b) => a.name.localeCompare(b.name))
    }

    const getNotebookNotes = (notebookId: string): Note[] => {
        return notes.filter((note) => note.notebookId === notebookId).sort((a, b) => a.title.localeCompare(b.title))
    }

    const startEditingNotebook = (notebook: Notebook) => {
        setEditingNotebook(notebook.id)
        setEditingName(notebook.name)
    }

    const saveNotebookName = async () => {
        if (editingNotebook && editingName.trim()) {
            setIsSavingNotebookName(true) // Start loading

            const request: UpdateNotebookRequest = {
                name: editingName.trim()
            }
            await apiClient.put<BaseResponse<UpdateNotebookResponse>>(
                `/notebook/v1/${editingNotebook}`,
                request,
            )

            onNotebookUpdate(editingNotebook, { name: editingName.trim() })
            setIsSavingNotebookName(false) // End loading
        }
        setEditingNotebook(null)
        setEditingName("")
    }

    const cancelEditingNotebook = () => {
        setEditingNotebook(null)
        setEditingName("")
    }

    const startEditingNote = (note: Note) => {
        setEditingNote(note.id)
        setEditingName(note.title)
    }

    const saveNoteName = async () => {
        if (editingNote && editingName.trim()) {
            setIsSavingNoteName(true)

            if (onNoteUpdate) {
                // Optimistic update via parent
                onNoteUpdate(editingNote, { title: editingName.trim() })
                setIsSavingNoteName(false)
            } else {
                // Fallback if no parent handler (though we expect one)
                setIsSavingNoteName(false)
            }
        }
        setEditingNote(null)
        setEditingName("")
    }

    const cancelEditingNote = () => {
        setEditingNote(null)
        setEditingName("")
    }

    const handleDragStart = (e: React.DragEvent, type: "notebook" | "note", id: string) => {
        if (isProcessingMove || isDeletingNotebook || isDeletingNote) {
            e.preventDefault() // Prevent dragging if another operation is in progress
            return
        }
        e.stopPropagation()
        setDraggedItem({ type, id })
        e.dataTransfer.effectAllowed = "move"
        e.dataTransfer.setData("text/plain", `${type}:${id}`) // Set data for cross-browser compatibility
    }

    const handleDragOver = (e: React.DragEvent, type: "notebook" | "note", id: string) => {
        if (isProcessingMove || isDeletingNotebook || isDeletingNote) {
            e.preventDefault() // Prevent drag over if another operation is in progress
            return
        }
        e.preventDefault()
        e.stopPropagation()
        e.dataTransfer.dropEffect = "move"
        setDragOverItem({ type, id })
    }

    const handleDragLeave = () => {
        setDragOverItem(null)
    }

    const handleDrop = (e: React.DragEvent, targetType: "notebook" | "note", targetId: string) => {
        e.preventDefault()
        e.stopPropagation()

        if (isProcessingMove || isDeletingNotebook || isDeletingNote) return // Prevent drop if another operation is in progress

        const data = e.dataTransfer.getData("text/plain")
        if (!data) return

        const [draggedType, draggedId] = data.split(":") as ["notebook" | "note", string]

        if (draggedType === "note" && targetType === "notebook") {
            onMoveNote(draggedId, targetId)
        } else if (draggedType === "notebook" && targetType === "notebook") {
            if (draggedId !== targetId) {
                onMoveNotebook(draggedId, targetId)
            }
        }

        setDraggedItem(null)
        setDragOverItem(null)
    }

    const handleDropOnRoot = (e: React.DragEvent) => {
        e.preventDefault()

        if (isProcessingMove || isDeletingNotebook || isDeletingNote) return // Prevent drop if another operation is in progress

        const data = e.dataTransfer.getData("text/plain")
        if (!data) return

        const [draggedType, draggedId] = data.split(":") as ["notebook" | "note", string]

        if (draggedType === "notebook") {
            onMoveNotebook(draggedId, null)
        }

        setDraggedItem(null)
        setDragOverItem(null)
    }

    const renderNotebook = (notebook: Notebook, level = 0) => {
        const children = buildNotebookTree(notebook.id)
        const notebookNotes = getNotebookNotes(notebook.id)
        const isExpanded = expandedNotebooks.has(notebook.id)
        const isSelected = selectedNotebook === notebook.id
        const hasChildren = children.length > 0 || notebookNotes.length > 0
        const isEditing = editingNotebook === notebook.id
        const isDragOver = dragOverItem?.type === "notebook" && dragOverItem.id === notebook.id
        const isThisNotebookDeleting = isDeletingNotebook === notebook.id

        return (
            <div key={notebook.id}>
                <ContextMenu>
                    <ContextMenuTrigger asChild>
                        <div
                            className={cn(
                                "flex items-center group min-w-fit",
                                isDragOver && "bg-royal-violet-base/10 border-2 border-royal-violet-base border-dashed rounded",
                            )}
                            style={{ paddingLeft: `${level * 16}px` }}
                            draggable={!isEditing && !isProcessingMove && !isThisNotebookDeleting}
                            onDragStart={(e) => handleDragStart(e, "notebook", notebook.id)}
                            onDragOver={(e) => handleDragOver(e, "notebook", notebook.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, "notebook", notebook.id)}
                        >
                            <Button
                                variant="ghost"
                                className={cn(
                                    "flex-1 justify-start h-9 px-2 font-normal transition-all duration-200 whitespace-nowrap shrink-0",
                                    isSelected &&
                                    "bg-primary/10 text-primary shadow-sm border-l-2 border-primary", // Updated to primary
                                    !isSelected && "hover:bg-muted hover:shadow-sm",
                                    level > 0 && !isSelected && "bg-muted/30",
                                )}
                                onClick={() => {
                                    if (!isEditing && !isProcessingMove && !isThisNotebookDeleting) {
                                        onNotebookSelect(notebook.id)
                                        if (hasChildren) {
                                            toggleNotebook(notebook.id)
                                        }
                                    }
                                }}
                                onDoubleClick={(e) => {
                                    e.stopPropagation()
                                    if (!isEditing && !isProcessingMove && !isThisNotebookDeleting) {
                                        startEditingNotebook(notebook)
                                    }
                                }}
                                disabled={isProcessingMove || isThisNotebookDeleting}
                            >
                                <div className="w-4 flex justify-center mr-1">
                                    {hasChildren &&
                                        (isExpanded ? (
                                            <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                        ) : (
                                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                        ))}
                                </div>
                                {isExpanded ? (
                                    <FolderOpen className="h-4 w-4 mr-2 text-primary" /> // Updated icon color
                                ) : (
                                    <Folder className="h-4 w-4 mr-2 text-primary" /> // Updated icon color
                                )}
                                {isEditing ? (
                                    <div className="flex items-center flex-1">
                                        <Input
                                            value={editingName}
                                            onChange={(e) => setEditingName(e.target.value)}
                                            onBlur={saveNotebookName}
                                            onKeyDown={(e) => {
                                                e.stopPropagation()
                                                if (e.key === "Enter") {
                                                    saveNotebookName()
                                                } else if (e.key === "Escape") {
                                                    cancelEditingNotebook()
                                                }
                                            }}
                                            className="h-6 text-sm border-none p-0 focus-visible:ring-1 focus-visible:ring-primary flex-1" // Updated focus ring
                                            autoFocus
                                            onClick={(e) => e.stopPropagation()}
                                            disabled={isSavingNotebookName}
                                        />
                                        {isSavingNotebookName && (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary ml-2"></div> // Updated spinner
                                        )}
                                    </div>
                                ) : (
                                    <span className="flex-1 text-left whitespace-nowrap">{notebook.name}</span>
                                )}
                            </Button>
                        </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                        {onCreateNote && (
                            <ContextMenuItem
                                onClick={() => onCreateNote(notebook.id)}
                                disabled={isProcessingMove || isThisNotebookDeleting}
                            >
                                <Plus className="h-3 w-3 mr-2" />
                                New Note
                            </ContextMenuItem>
                        )}
                        <ContextMenuItem
                            onClick={() => startEditingNotebook(notebook)}
                            disabled={isSavingNotebookName || isProcessingMove || isThisNotebookDeleting}
                        >
                            <Edit2 className="h-3 w-3 mr-2" />
                            Rename
                        </ContextMenuItem>
                        <ContextMenuItem
                            onClick={() => onDeleteNotebook(notebook.id)}
                            className="text-red-600 focus:text-red-600"
                            disabled={isProcessingMove || isThisNotebookDeleting}
                        >
                            {isThisNotebookDeleting ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-2"></div>
                                    Deleting...
                                </div>
                            ) : (
                                <>
                                    <Trash2 className="h-3 w-3 mr-2" />
                                    Delete
                                </>
                            )}
                        </ContextMenuItem>
                    </ContextMenuContent>
                </ContextMenu>

                <Collapsible open={isExpanded}>
                    <CollapsibleContent className="relative">
                        {/* Hierarchical left border line */}
                        <div
                            className="absolute left-0 top-0 bottom-0 border-l border-border"
                            style={{ marginLeft: `${level * 16 + 16}px` }}
                        />
                        {/* Render notes first */}
                        {notebookNotes.map((note) => {
                            const isDragOverNote = dragOverItem?.type === "note" && dragOverItem.id === note.id
                            const isThisNoteDeleting = isDeletingNote === note.id
                            const isEditingNote = editingNote === note.id

                            return (
                                <ContextMenu key={note.id}>
                                    <ContextMenuTrigger asChild>
                                        <div
                                            className={cn(
                                                "flex items-center group min-w-fit",
                                                isDragOverNote && "bg-primary/10 border-2 border-primary border-dashed rounded",
                                            )}
                                            style={{ paddingLeft: `${(level + 1) * 16}px` }}
                                            draggable={!isProcessingMove && !isThisNoteDeleting && !isEditingNote}
                                            onDragStart={(e) => handleDragStart(e, "note", note.id)}
                                            onDragOver={(e) => handleDragOver(e, "note", note.id)}
                                            onDragLeave={handleDragLeave}
                                            onDrop={(e) => handleDrop(e, "note", note.id)}
                                        >
                                            <Button
                                                variant="ghost"
                                                className={cn(
                                                    "flex-1 justify-start h-8 px-2 font-normal text-muted-foreground transition-all duration-200 whitespace-nowrap shrink-0",
                                                    selectedNote === note.id && "text-primary font-medium",
                                                    selectedNote !== note.id && "hover:bg-muted text-muted-foreground",
                                                )}
                                                onClick={() => {
                                                    if (!isProcessingMove && !isThisNoteDeleting && !isEditingNote) {
                                                        onNoteSelect(note.id)
                                                        onNotebookSelect(notebook.id)
                                                    }
                                                }}
                                                onDoubleClick={(e) => {
                                                    e.stopPropagation();
                                                    if (!isProcessingMove && !isThisNoteDeleting && !isEditingNote) {
                                                        startEditingNote(note);
                                                    }
                                                }}
                                                disabled={isProcessingMove || isThisNoteDeleting}
                                            >
                                                <div className="w-4 mr-1"></div>
                                                <FileText className="h-3.5 w-3.5 mr-2 text-muted-foreground" />

                                                {isEditingNote ? (
                                                    <div className="flex items-center flex-1">
                                                        <Input
                                                            value={editingName}
                                                            onChange={(e) => setEditingName(e.target.value)}
                                                            onBlur={saveNoteName}
                                                            onKeyDown={(e) => {
                                                                e.stopPropagation()
                                                                if (e.key === "Enter") {
                                                                    saveNoteName()
                                                                } else if (e.key === "Escape") {
                                                                    cancelEditingNote()
                                                                }
                                                            }}
                                                            className="h-6 text-sm border-none p-0 focus-visible:ring-1 focus-visible:ring-primary flex-1"
                                                            autoFocus
                                                            onClick={(e) => e.stopPropagation()}
                                                            disabled={isSavingNoteName}
                                                        />
                                                        {isSavingNoteName && (
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary ml-2"></div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm flex-1 text-left whitespace-nowrap">{note.title}</span>
                                                )}
                                            </Button>
                                        </div>
                                    </ContextMenuTrigger>
                                    <ContextMenuContent>
                                        {/* Ask AI - Only shown if AI features enabled */}
                                        {canUseAI && (
                                            <ContextMenuItem
                                                onClick={() => {
                                                    setPreloadedReferences([note])
                                                    window.dispatchEvent(new CustomEvent('open-chat-sidebar'))
                                                }}
                                                className="text-primary focus:text-primary"
                                            >
                                                <MessageSquarePlus className="h-3 w-3 mr-2" />
                                                Ask AI
                                            </ContextMenuItem>
                                        )}
                                        <ContextMenuItem
                                            onClick={() => startEditingNote(note)}
                                            disabled={isSavingNoteName || isProcessingMove || isThisNoteDeleting}
                                        >
                                            <Edit2 className="h-3 w-3 mr-2" />
                                            Rename
                                        </ContextMenuItem>
                                        <ContextMenuItem
                                            onClick={() => onDeleteNote(note.id)}
                                            className="text-red-600 focus:text-red-600"
                                            disabled={isProcessingMove || isThisNoteDeleting}
                                        >
                                            {isThisNoteDeleting ? (
                                                <div className="flex items-center">
                                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-2"></div>
                                                    Deleting...
                                                </div>
                                            ) : (
                                                <>
                                                    <Trash2 className="h-3 w-3 mr-2" />
                                                    Delete
                                                </>
                                            )}
                                        </ContextMenuItem>
                                    </ContextMenuContent>
                                </ContextMenu>
                            )
                        })}

                        {/* Then render child notebooks */}
                        {children.map((child) => renderNotebook(child, level + 1))}
                    </CollapsibleContent>
                </Collapsible>
            </div>
        )
    }

    const rootNotebooks = buildNotebookTree()

    return (
        <div
            className="flex-1 overflow-auto bg-transparent"
            onDragOver={(e) => {
                if (isProcessingMove || isDeletingNotebook || isDeletingNote) return // Prevent drag over if another operation is in progress
                e.preventDefault()
                e.dataTransfer.dropEffect = "move"
            }}
            onDrop={(e) => {
                if (isProcessingMove || isDeletingNotebook || isDeletingNote) return // Prevent drop if another operation is in progress
                handleDropOnRoot(e)
            }}
        >
            <div className="p-2">
                <h3 className="text-sm font-semibold text-foreground mb-3 px-2 py-1 bg-muted rounded-md">Notebooks & Notes</h3>
                <div className="space-y-1">{rootNotebooks.map((notebook) => renderNotebook(notebook))}</div>
            </div>
        </div>
    )
}
