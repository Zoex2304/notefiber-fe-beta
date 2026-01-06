"use client";

import { useRef, useEffect } from "react";
import { Plus, FolderPlus, ChevronsDown, ChevronsUp } from "lucide-react";
import { Button } from "@/components/shadui/button";
import { ActionTooltip } from "@/components/common/ActionTooltip";
import { PlanStatusPill } from "@/components/common/PlanStatusPill";
import { Logo } from "@/components/shadui/Logo";
import { Sidebar } from "@/components/sidebar";
import { cn } from "@/lib/utils";
import type { Note } from "@/types/note";
import type { Notebook } from "@/types/notebook";
import { SidebarLayout } from "./SidebarLayout";
// Hooks
import { useSidebarStore } from "@/stores/useSidebarStore";

// Constants
// const SIDEBAR_COOKIE_NAME = "sidebar_collapsed"; // Handled by store persist now

export interface AppSidebarProps {
    notebooks: Notebook[];
    notes: Note[];
    selectedNotebook: string | null;
    selectedNote: string | null;
    onNotebookSelect: (notebookId: string) => void;
    onNoteSelect: (noteId: string) => void;
    onNotebookUpdate: (notebookId: string, updates: Partial<Notebook>) => void;
    onNoteUpdate?: (noteId: string, updates: Partial<Note>) => void;
    onDeleteNotebook: (notebookId: string) => void;
    onDeleteNote: (noteId: string) => void;
    onMoveNote: (noteId: string, targetNotebookId: string) => void;
    onMoveNotebook: (notebookId: string, targetParentId: string | null) => void;
    expandedNotebooks: Set<string>;
    setExpandedNotebooks: React.Dispatch<React.SetStateAction<Set<string>>>;
    isProcessingMove: boolean;
    isDeletingNotebook: string | null;
    isDeletingNote: string | null;
    onCreateNotebook: () => void;
    onCreateNote: () => void;
    onCreateNoteInNotebook?: (notebookId: string) => void;
    isCreatingNotebook: boolean;
    isCreatingNote: boolean;
    onClearSelection: () => void;
}

export function AppSidebar({
    notebooks,
    notes,
    selectedNotebook,
    selectedNote,
    onNotebookSelect,
    onNoteSelect,
    onNotebookUpdate,
    onNoteUpdate,
    onDeleteNotebook,
    onDeleteNote,
    onMoveNote,
    onMoveNotebook,
    expandedNotebooks,
    setExpandedNotebooks,
    isProcessingMove,
    isDeletingNotebook,
    isDeletingNote,
    onCreateNotebook,
    onCreateNote,
    onCreateNoteInNotebook,
    isCreatingNotebook,
    isCreatingNote,
    onClearSelection,
}: AppSidebarProps) {
    // Sidebar Store Logic
    const isLeftOpen = useSidebarStore(s => s.isLeftOpen);
    const toggleLeftSidebar = useSidebarStore(s => s.toggleLeftSidebar);
    const setLeftSidebarOpen = useSidebarStore(s => s.setLeftSidebarOpen);

    const isCollapsed = !isLeftOpen;
    const toggleCollapse = toggleLeftSidebar;
    const expand = () => setLeftSidebarOpen(true);

    const sidebarRef = useRef<HTMLDivElement>(null);

    // Click on empty area to clear selection
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;

            // Must be within sidebar
            if (!sidebarRef.current || !sidebarRef.current.contains(target)) {
                return;
            }

            // Don't clear if clicking on interactive elements
            const isInteractive = target.closest('button, [role="button"], a, input, [data-sidebar-item]');
            if (isInteractive) {
                return;
            }

            // Clear selection when clicking on empty areas
            onClearSelection();
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClearSelection]);

    // Keyboard shortcut: Ctrl/Cmd + B to toggle
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "b" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                toggleCollapse();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [toggleCollapse]);

    return (
        <SidebarLayout
            side="left"
            isCollapsed={isCollapsed}
            onToggle={toggleCollapse}
            className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground"
        >
            {/* Header: Logo + Actions on SAME row - h-14 to match TopBar */}
            <div className="h-14 px-4 border-b border-sidebar-border flex items-center shrink-0">
                <div className="flex items-center justify-between w-full gap-2">
                    {/* Logo */}
                    {isCollapsed ? (
                        <Logo variant="symbol" className="h-7 w-7 mx-auto" />
                    ) : (
                        <>
                            <Logo variant="horizontal" className="h-8 shrink-0" />
                            {/* Action Buttons (Icon-only like VS Code) */}
                            <div className="flex gap-1 shrink-0">
                                <ActionTooltip label="New Notebook" side="bottom">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={onCreateNotebook}
                                        disabled={isCreatingNotebook}
                                        className="h-7 w-7"
                                    >
                                        {isCreatingNotebook ? (
                                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary" />
                                        ) : (
                                            <FolderPlus className="h-4 w-4" />
                                        )}
                                    </Button>
                                </ActionTooltip>

                                <ActionTooltip
                                    label={!selectedNotebook ? "Select a notebook first" : "New Note"}
                                    side="bottom"
                                >
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={onCreateNote}
                                        disabled={!selectedNotebook || isCreatingNote}
                                        className="h-7 w-7"
                                    >
                                        {isCreatingNote ? (
                                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600" />
                                        ) : (
                                            <Plus className="h-4 w-4" />
                                        )}
                                    </Button>
                                </ActionTooltip>


                                <ActionTooltip
                                    label={expandedNotebooks.size === 0 ? "Expand All" : "Collapse All"}
                                    side="bottom"
                                >
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            if (expandedNotebooks.size === 0) {
                                                // Expand All: Create set with ALL notebook IDs
                                                setExpandedNotebooks(new Set(notebooks.map(n => n.id)));
                                            } else {
                                                // Collapse All: Clear set
                                                setExpandedNotebooks(new Set());
                                            }
                                        }}
                                        className="h-7 w-7 group"
                                    >
                                        <div className="transition-transform duration-200 ease-in-out group-active:scale-90">
                                            {expandedNotebooks.size === 0 ? (
                                                <ChevronsDown className="h-4 w-4 transition-all duration-300" />
                                            ) : (
                                                <ChevronsUp className="h-4 w-4 transition-all duration-300" />
                                            )}
                                        </div>
                                    </Button>
                                </ActionTooltip>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Content: File Tree */}
            <div
                ref={sidebarRef}
                className={cn(
                    "flex-1 overflow-auto",
                    isCollapsed && "overflow-hidden"
                )}
            >
                {/* Content: File Tree or Collapsed Actions */}
                {isCollapsed ? (
                    <div className="flex flex-col items-center py-4 gap-2">
                        <ActionTooltip label="New Notebook" side="right">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    expand(); // Auto-expand on click
                                    onCreateNotebook();
                                }}
                                disabled={isCreatingNotebook}
                                className="h-8 w-8"
                            >
                                {isCreatingNotebook ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600" />
                                ) : (
                                    <FolderPlus className="h-4 w-4" />
                                )}
                            </Button>
                        </ActionTooltip>

                        <ActionTooltip
                            label={!selectedNotebook ? "Select a notebook first" : "New Note"}
                            side="right"
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    expand(); // Auto-expand on click
                                    onCreateNote();
                                }}
                                disabled={!selectedNotebook || isCreatingNote}
                                className="h-8 w-8"
                            >
                                {isCreatingNote ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600" />
                                ) : (
                                    <Plus className="h-4 w-4" />
                                )}
                            </Button>
                        </ActionTooltip>
                    </div>
                ) : notebooks.length === 0 ? (
                    // Empty State
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-4 animate-in fade-in duration-300">
                        <div className="bg-muted p-4 rounded-full shadow-sm ring-1 ring-border mb-2">
                            <FolderPlus className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-sm font-semibold text-foreground">No notebooks yet</h3>
                            <p className="text-xs text-muted-foreground max-w-[200px] mx-auto leading-relaxed">
                                Create a notebook to start organizing your ideas and chats.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onCreateNotebook}
                            className="bg-card hover:bg-accent text-foreground border-border mt-2"
                        >
                            <FolderPlus className="mr-2 h-3.5 w-3.5" />
                            Create Notebook
                        </Button>
                    </div>
                ) : (
                    <Sidebar
                        notebooks={notebooks}
                        notes={notes}
                        selectedNotebook={selectedNotebook}
                        selectedNote={selectedNote}
                        onNotebookSelect={onNotebookSelect}
                        onNoteSelect={onNoteSelect}
                        onNotebookUpdate={onNotebookUpdate}
                        onNoteUpdate={onNoteUpdate}
                        onDeleteNotebook={onDeleteNotebook}
                        onDeleteNote={onDeleteNote}
                        onMoveNote={onMoveNote}
                        onMoveNotebook={onMoveNotebook}
                        expandedNotebooks={expandedNotebooks}
                        setExpandedNotebooks={setExpandedNotebooks}
                        isProcessingMove={isProcessingMove}
                        isDeletingNotebook={isDeletingNotebook}
                        isDeletingNote={isDeletingNote}
                        onCreateNote={onCreateNoteInNotebook}
                    />
                )}
            </div>

            {/* Footer: Plan Status Pill (like Mistral AI) */}
            <div className="p-3 border-t border-sidebar-border shrink-0">
                {isCollapsed ? (
                    <ActionTooltip label="Your Plan" side="right">
                        <div className="flex justify-center">
                            <PlanStatusPill compact />
                        </div>
                    </ActionTooltip>
                ) : (
                    <PlanStatusPill />
                )}
            </div>
        </SidebarLayout>
    );
}
