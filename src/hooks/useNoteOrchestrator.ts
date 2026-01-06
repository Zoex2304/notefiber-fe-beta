import { useEffect, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import type { Note } from "@/types/note";
import type { AppSidebarProps } from "@/components/layout/AppSidebar";
import { useSidebarLogic } from "./useSidebarLogic";
import { useNoteSystem } from "./useNoteSystem";
import { useActiveNote } from "./useActiveNote";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useUsageLimits } from "@/contexts/UsageLimitsContext";
import { useSidebarStore } from "@/stores/useSidebarStore";

export function useNoteOrchestrator() {
    // strict: false allows usage outside of the explicit route (e.g. in MainApp dashboard)
    const { noteId } = useParams({ strict: false });
    const navigate = useNavigate();

    // -- Contexts --
    const { checkPermission } = useSubscription();
    const { checkCanCreateNotebook, checkCanCreateNote, checkCanUseAiChat, checkCanUseSemanticSearch } = useUsageLimits();

    // -- Hooks --
    const sidebar = useSidebarLogic();
    const noteSystem = useNoteSystem();
    const activeNote = useActiveNote(noteId);

    // -- Dialog/Sidebar State --
    const [searchOpen, setSearchOpen] = useState(false);

    // -- Synchronization Effects --

    // 1. Initialize Data
    useEffect(() => {
        noteSystem.fetchAllNotebooks();
    }, [noteSystem.fetchAllNotebooks]);

    // 2. Sync Selection & Expansion with URL/Active Note
    useEffect(() => {
        if (activeNote.currentNote) {
            const note = activeNote.currentNote;
            sidebar.setSelectedNote(note.id);
            sidebar.setSelectedNotebook(note.notebookId);

            // Auto-expand ancestry
            if (note.breadcrumb?.length) {
                const ancestorIds = note.breadcrumb.map((b) => b.id);
                sidebar.setExpandedNotebooks((prev) => new Set([...prev, ...ancestorIds]));
            }
        }
    }, [activeNote.currentNote?.id]);


    // -- Action Handlers --

    const handleCreateNote = async () => {
        if (!sidebar.selectedNotebook || sidebar.isCreatingNote) return;

        const canCreate = await checkCanCreateNote();
        if (!canCreate) return;

        sidebar.setIsCreatingNote(true);
        try {
            const newNote = await noteSystem.createNote({
                title: "Untitled Note",
                content: "# Untitled Note\n\nStart writing...",
                notebook_id: sidebar.selectedNotebook,
            });

            navigate({ to: "/app/note/$noteId", params: { noteId: newNote.id } });
            sidebar.setExpandedNotebooks((prev) => new Set([...prev, sidebar.selectedNotebook!]));
        } finally {
            sidebar.setIsCreatingNote(false);
        }
    };

    // Create note in a specific notebook (from context menu)
    const handleCreateNoteInNotebook = async (notebookId: string) => {
        if (sidebar.isCreatingNote) return;

        const canCreate = await checkCanCreateNote();
        if (!canCreate) return;

        sidebar.setIsCreatingNote(true);
        try {
            const newNote = await noteSystem.createNote({
                title: "Untitled Note",
                content: "# Untitled Note\n\nStart writing...",
                notebook_id: notebookId,
            });

            navigate({ to: "/app/note/$noteId", params: { noteId: newNote.id } });
            sidebar.setExpandedNotebooks((prev) => new Set([...prev, notebookId]));
            sidebar.setSelectedNotebook(notebookId);
        } finally {
            sidebar.setIsCreatingNote(false);
        }
    };

    const handleCreateNotebook = async () => {
        if (sidebar.isCreatingNotebook) return;

        const canCreate = await checkCanCreateNotebook();
        if (!canCreate) return;

        sidebar.setIsCreatingNotebook(true);
        try {
            await noteSystem.createNotebook({
                name: "New Notebook",
                parent_id: sidebar.selectedNotebook ?? null,
            });

            if (sidebar.selectedNotebook) {
                sidebar.setExpandedNotebooks((prev) => new Set([...prev, sidebar.selectedNotebook!]));
            }
        } finally {
            sidebar.setIsCreatingNotebook(false);
        }
    };

    const handleNoteUpdate = async (noteIdToUpdate: string, updates: Partial<Note>) => {
        await noteSystem.updateNote(noteIdToUpdate, {
            title: updates.title ?? "",
            content: updates.content ?? "",
        });

        // Refresh active note if it's the one currently viewed
        if (noteId && noteIdToUpdate === noteId) {
            // We can optionally explicitly refresh, but useActiveNote might handle own staleness if extended.
            // For now, re-fetching ensures consistency.
            activeNote.fetchNote(noteId);
        }
    };

    const handleDeleteNotebook = async (notebookId: string) => {
        if (sidebar.isDeletingNotebook === notebookId) return;

        sidebar.setIsDeletingNotebook(notebookId);
        await noteSystem.deleteNotebook(notebookId);

        if (sidebar.selectedNotebook === notebookId) {
            sidebar.setSelectedNotebook(null);
            sidebar.setSelectedNote(null);
        }
        sidebar.setIsDeletingNotebook(null);
    };

    const handleDeleteNote = async (noteIdToDelete: string) => {
        if (sidebar.isDeletingNote === noteIdToDelete) return;

        sidebar.setIsDeletingNote(noteIdToDelete);
        await noteSystem.deleteNote(noteIdToDelete);

        if (noteIdToDelete === noteId) {
            navigate({ to: "/app" });
        }
        sidebar.setIsDeletingNote(null);
    };

    const handleMoveNote = async (noteIdToMove: string, targetNotebookId: string) => {
        sidebar.setIsProcessingMove(true);
        await new Promise((resolve) => setTimeout(resolve, 800)); // UX delay

        // Optimistic update
        noteSystem.setNotes((prev) =>
            prev.map((note) =>
                note.id === noteIdToMove
                    ? { ...note, notebookId: targetNotebookId, updatedAt: new Date() }
                    : note
            )
        );

        await noteSystem.moveNote(noteIdToMove, { notebook_id: targetNotebookId });
        sidebar.setExpandedNotebooks((prev) => new Set([...prev, targetNotebookId]));
        sidebar.setIsProcessingMove(false);
    };

    const handleMoveNotebook = async (notebookId: string, targetParentId: string | null) => {
        const childIds = noteSystem.getAllChildNotebooks(notebookId);
        // Prevent moving into self or children
        if (targetParentId && childIds.includes(targetParentId)) {
            return;
        }

        sidebar.setIsProcessingMove(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        await noteSystem.moveNotebook(notebookId, { parent_id: targetParentId });

        if (targetParentId) {
            sidebar.setExpandedNotebooks((prev) => new Set([...prev, targetParentId]));
        }
        sidebar.setIsProcessingMove(false);
    };

    // -- Dialog/Sidebar Handlers --
    const checkAndToggleChat = async () => {
        const { isRightOpen, isRightCollapsed, toggleRightSidebar, openChat } = useSidebarStore.getState();

        // If open and expanded, just close it (toggle)
        if (isRightOpen && !isRightCollapsed) {
            toggleRightSidebar();
            return;
        }

        // If open but collapsed, expand it
        if (isRightOpen && isRightCollapsed) {
            openChat();
            return;
        }

        // If closed, check permission before opening
        const canUse = await checkCanUseAiChat();
        if (!canUse) return;

        // @ts-ignore
        if (checkPermission("ai_chat")) {
            openChat();
        } else {
            const UPGRADE_EVENT = "upgrade-plan";
            window.dispatchEvent(new Event(UPGRADE_EVENT));
        }
    };

    const checkAndOpenSearch = async () => {
        const canUse = await checkCanUseSemanticSearch();
        if (!canUse) return;

        // @ts-ignore
        if (checkPermission("semantic_search")) {
            setSearchOpen(true);
        } else {
            const UPGRADE_EVENT = "upgrade-plan";
            window.dispatchEvent(new Event(UPGRADE_EVENT));
        }
    };


    const navigateToNote = (id: string) => navigate({ to: "/app/note/$noteId", params: { noteId: id } });

    // -- Prop Bundling --

    const appSidebarProps: AppSidebarProps = {
        notebooks: noteSystem.notebooks,
        notes: noteSystem.notes,
        selectedNotebook: sidebar.selectedNotebook,
        selectedNote: sidebar.selectedNote,
        onNotebookSelect: sidebar.setSelectedNotebook,
        onNoteSelect: navigateToNote,
        onNotebookUpdate: noteSystem.fetchAllNotebooks,
        onNoteUpdate: handleNoteUpdate,
        onDeleteNotebook: handleDeleteNotebook,
        onDeleteNote: handleDeleteNote,
        onMoveNote: handleMoveNote,
        onMoveNotebook: handleMoveNotebook,
        expandedNotebooks: sidebar.expandedNotebooks,
        setExpandedNotebooks: sidebar.setExpandedNotebooks,
        isProcessingMove: sidebar.isProcessingMove,
        isDeletingNotebook: sidebar.isDeletingNotebook,
        isDeletingNote: sidebar.isDeletingNote,
        onCreateNotebook: handleCreateNotebook,
        onCreateNote: handleCreateNote,
        onCreateNoteInNotebook: handleCreateNoteInNotebook,
        isCreatingNotebook: sidebar.isCreatingNotebook,
        isCreatingNote: sidebar.isCreatingNote,
        onClearSelection: () => {
            sidebar.setSelectedNotebook(null);
            sidebar.setSelectedNote(null);
        },
    };

    return {
        appSidebarProps,
        noteSystem,
        activeNote,
        sidebar,
        handleNoteUpdate,
        navigateToNote,

        // Search
        searchOpen,
        setSearchOpen,
        checkAndOpenSearch,

        // Chat Sidebar
        checkAndToggleChat,
    };
}
