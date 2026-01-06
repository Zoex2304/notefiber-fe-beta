"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/shadui/button"
import { Input } from "./ui/input"
import { Eye, Edit, Save } from "lucide-react"
import { Editor } from "./organisms/Editor"
import type { Note } from "../types/note"
import { formatUpdatedAt } from "../lib/date"

interface NoteEditorProps {
    note: Note
    onUpdate: (noteId: string, updates: Partial<Note>) => void
}

export function NoteEditor({ note, onUpdate }: NoteEditorProps) {
    const [isPreview, setIsPreview] = useState(false)
    const [content, setContent] = useState(note.content)
    const [title, setTitle] = useState(note.title)
    const [hasChanges, setHasChanges] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Track the content we expect after save to compare against refetched props
    const expectedContentRef = useRef<{ content: string; title: string } | null>(null)

    // Sync from props when note changes (different note selected or external update)
    useEffect(() => {
        // If we're expecting this exact content from our own save, ignore the sync
        // This prevents the refetch from triggering hasChanges
        if (
            expectedContentRef.current &&
            expectedContentRef.current.content === note.content &&
            expectedContentRef.current.title === note.title
        ) {
            // Clear the expected content after we've confirmed sync
            expectedContentRef.current = null
            return
        }

        setContent(note.content)
        setTitle(note.title)
        setHasChanges(false)
        expectedContentRef.current = null
    }, [note.id, note.content, note.title])

    // Calculate hasChanges by comparing current values with note props
    useEffect(() => {
        // Compare against expected content if we just saved, otherwise against note props
        const baseContent = expectedContentRef.current?.content ?? note.content
        const baseTitle = expectedContentRef.current?.title ?? note.title
        setHasChanges(content !== baseContent || title !== baseTitle)
    }, [content, title, note.content, note.title])

    const handleSave = async () => {
        // Prevent double-clicks
        if (isSaving) return

        setIsSaving(true)
        try {
            // Set expected content BEFORE the API call
            // When the refetch comes back with this exact content, we know it's from our save
            expectedContentRef.current = { content, title }
            setHasChanges(false)

            await onUpdate(note.id, { content, title })
        } catch (error) {
            // Clear expected content and restore hasChanges if save failed
            expectedContentRef.current = null
            setHasChanges(true)
            console.error("Failed to save note:", error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleEditorChange = (jsonString: string) => {
        // Ensure we're receiving a string
        if (typeof jsonString !== 'string') {
            console.error("Editor onChange received non-string:", typeof jsonString)
            return
        }
        setContent(jsonString)
    }

    return (
        <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="border-b border-gray-200 p-4 bg-white">
                <div className="flex items-center justify-between mb-3">
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="text-lg font-semibold border-none p-0 h-auto focus-visible:ring-0"
                        placeholder="Note title..."
                    />
                    <div className="flex items-center gap-2">
                        {hasChanges && (
                            <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={isSaving}
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {isSaving ? 'Saving...' : 'Save'}
                            </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => setIsPreview(!isPreview)}>
                            {isPreview ? (
                                <>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </>
                            ) : (
                                <>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Preview
                                </>
                            )}
                        </Button>
                    </div>
                </div>
                <div className="text-xs text-gray-500">
                    {formatUpdatedAt(note.updatedAt)}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
                {isPreview ? (
                    <div className="h-full overflow-hidden flex flex-col bg-white">
                        <Editor
                            initialContent={content}
                            readOnly={true}
                        />
                    </div>
                ) : (
                    <div className="h-full flex flex-col p-6 bg-white">
                        <Editor
                            key={note.id}
                            initialContent={note.content}
                            onChange={handleEditorChange}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

