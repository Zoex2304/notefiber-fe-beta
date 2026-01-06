"use client";

import { NoteEditor } from "@/components/note-editor";
import { NoteBreadcrumb } from "@/components/NoteBreadcrumb";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import "@/App.css";
import { useNoteOrchestratorContext } from "@/contexts/NoteOrchestratorContext";

export default function NotePage() {
    // -- Orchestration --
    const {
        appSidebarProps,
        activeNote,
        handleNoteUpdate,
    } = useNoteOrchestratorContext();

    return (
        <div className="flex-1 flex flex-col bg-background overflow-hidden relative h-full">
            {/* Note Content */}
            <div className="absolute inset-0 flex flex-col overflow-y-auto overflow-x-hidden">
                {activeNote.isLoadingNote ? (
                    <div className="flex-1 flex items-center justify-center bg-background">
                        <div className="text-center">
                            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                            <p className="text-gray-600">Loading note...</p>
                        </div>
                    </div>
                ) : activeNote.noteError ? (
                    <div className="flex-1 flex items-center justify-center bg-background">
                        <div className="text-center">
                            <div className="text-6xl mb-4">❌</div>
                            <h2 className="text-xl font-medium mb-2 text-red-600">
                                {activeNote.noteError}
                            </h2>
                            <Link
                                to="/app"
                                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mt-4"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Dashboard
                            </Link>
                        </div>
                    </div>
                ) : activeNote.currentNote ? (
                    <>
                        <NoteBreadcrumb
                            note={activeNote.currentNote}
                            onFolderClick={(folderId) => appSidebarProps.setExpandedNotebooks(prev => {
                                const next = new Set(prev);
                                // 1. Ensure ancestors
                                const crumbIndex = activeNote.currentNote?.breadcrumb?.findIndex(b => b.id === folderId) ?? -1;
                                if (crumbIndex > 0) {
                                    activeNote.currentNote?.breadcrumb?.slice(0, crumbIndex).forEach(crumb => {
                                        next.add(crumb.id);
                                    });
                                }
                                // 2. Toggle self
                                if (next.has(folderId)) {
                                    next.delete(folderId);
                                } else {
                                    next.add(folderId);
                                }
                                return next;
                            })}
                        />
                        <div className="flex-1">
                            <NoteEditor note={activeNote.currentNote} onUpdate={handleNoteUpdate} />
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-muted/20">
                        <div className="text-center">
                            <div className="text-6xl mb-4">📝</div>
                            <h2 className="text-xl font-medium mb-2">
                                Select a note to start editing
                            </h2>
                            <p className="text-sm">
                                Choose a note from the sidebar or create a new one
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
