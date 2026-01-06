"use client";

import { useEffect, useState, useMemo } from "react";
import { Clock, Plus, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Note } from "@/types/note";

// Layout
import { SidebarLayout } from "./SidebarLayout";

// Components
import { Button } from "@/components/shadui/button";
import { Logo } from "@/components/shadui/Logo";
import { ActionTooltip } from "@/components/common/ActionTooltip";
import { TokenUsagePill } from "@/components/common/TokenUsagePill";
import { TokenLimitDialog } from "@/components/common/TokenLimitDialog";
import { NewSessionConfirmationModal } from "@/components/molecules/NewSessionConfirmationModal";
import { SessionHistoryList } from "@/components/molecules/SessionHistoryList";
import { ChatInterface } from "@/components/organisms/ChatInterface";
import { SaveToNotesDialog } from "@/components/molecules/SaveToNotesDialog";

// Hooks
import { useChatSystem } from "@/hooks/useChatSystem";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useNewSessionConfirmation } from "@/hooks/chat";
import { useAddToNotes } from "@/hooks/chat/useAddToNotes";
import { useNoteOrchestratorContext } from "@/contexts/NoteOrchestratorContext";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface RightSidebarProps {
    onNavigateToNote: (noteId: string) => void;
    notes: Note[];
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

/**
 * RightSidebar - Chat sidebar orchestrator.
 * 
 * This component is a pure orchestrator that:
 * - Manages view state (chat vs history)
 * - Wires up child components with appropriate data
 * - Handles sidebar-level interactions (collapse, view switching)
 * 
 * All business logic lives in hooks. All UI compositions live in organisms/molecules.
 */
export function RightSidebar({
    onNavigateToNote,
    notes
}: RightSidebarProps) {
    // -------------------------------------------------------------------------
    // Hooks
    // -------------------------------------------------------------------------

    // Sidebar Store
    const isCollapsed = useSidebarStore(s => s.isRightCollapsed);
    const isOpen = useSidebarStore(s => s.isRightOpen);
    const view = useSidebarStore(s => s.rightView);
    const toggleCollapse = useSidebarStore(s => s.toggleRightCollapsed);
    const setView = useSidebarStore(s => s.setRightView);
    const expand = () => useSidebarStore.getState().setRightCollapsed(false);

    // Permission Check
    const { checkPermission } = useSubscription();
    const canUseChat = checkPermission('ai_chat');

    // Force close if permission revoked (React to real-time updates)
    useEffect(() => {
        if (!canUseChat && isOpen) {
            useSidebarStore.getState().setRightSidebarOpen(false);
        }
    }, [canUseChat, isOpen]);


    // Chat System State
    const {
        activeSessionId,
        sessions,
        messages,
        isLoading,
        sendMessage,
        selectSession,
        deleteSession,
        createSession,
        tokenUsage,
        showTokenLimitDialog,
        setShowTokenLimitDialog
    } = useChatSystem();

    const { refreshSubscription } = useSubscription();
    const newSessionConfirmation = useNewSessionConfirmation();
    const addToNotes = useAddToNotes();
    const { noteSystem } = useNoteOrchestratorContext();

    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------

    const [input, setInput] = useState("");

    // -------------------------------------------------------------------------
    // Effects
    // -------------------------------------------------------------------------

    // Handle external open requests (e.g. from Search Dialog export)
    useEffect(() => {
        const handleOpenChat = () => {
            useSidebarStore.getState().openChat();
        };

        window.addEventListener("open-chat-sidebar", handleOpenChat);
        return () => window.removeEventListener("open-chat-sidebar", handleOpenChat);
    }, []);

    // Fetch sessions when sidebar opens
    useEffect(() => {
        if (isOpen) {
            refreshSubscription();
            // We can fetch sessions here if needed, but useChatSystem handles init.
        }
    }, [isOpen, refreshSubscription]);

    // -------------------------------------------------------------------------
    // Derived State
    // -------------------------------------------------------------------------

    const hasWideContent = useMemo(() =>
        messages.some(m => m.role === 'assistant' && (m.content.includes('```') || m.content.includes('| -')))
        , [messages]);

    // -------------------------------------------------------------------------
    // Handlers
    // -------------------------------------------------------------------------

    const handleSendMessage = async (content: string) => {
        // Check if mode switch requires new session
        const currentSession = sessions.find(s => s.id === activeSessionId);
        const sessionDirty = (currentSession?.messages || []).length > 0;
        const mode = content.startsWith("/bypass") ? "bypass" :
            content.startsWith("/nuance") ? "nuance" : "rag";

        if ((mode === "bypass" || mode === "nuance") && sessionDirty) {
            newSessionConfirmation.requestConfirmation(content, mode);
            return;
        }

        await sendMessage(content);
        setInput(""); // Clear input after send
    };

    const handleConfirmNewSession = async () => {
        const { message } = newSessionConfirmation.confirm();

        try {
            const newSessionId = await createSession();
            if (newSessionId) {
                await sendMessage(message, newSessionId);
            }
        } catch (e) {
            console.error("Failed to sequence new session", e);
        }

        setView('chat');
        setInput("");
    };

    const handleSessionSelect = (id: string) => {
        selectSession(id);
        setView('chat');
    };

    const handleNewSession = async () => {
        if (messages.length > 0) {
            const confirmed = await newSessionConfirmation.confirm();
            if (!confirmed) return;
        }
        await createSession();
        setView('chat'); // Auto-switch to chat tab (especially from history)
        setInput("");
    };

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    // Access Control: Strict Lock (Wrapper Level)
    // We return null here (after loops) to ensure hooks are always called, preventing violations.
    if (!canUseChat) return null;

    // Dynamic width calculation for smooth open/close animation
    // When closed (!isOpen), we treat it as collapsed with 0 width.
    const effectiveCollapsed = !isOpen || isCollapsed;
    const effectiveWidth = isOpen ? (hasWideContent ? 600 : 380) : 0;
    const effectiveCollapsedWidth = isOpen ? 64 : 0;

    return (
        <SidebarLayout
            side="right"
            width={effectiveWidth}
            collapsedWidth={effectiveCollapsedWidth}
            isCollapsed={effectiveCollapsed}
            onToggle={toggleCollapse}
            showToggle={isOpen}
            className={cn(
                "border-l border-border h-full shadow-xl z-30 flex flex-col",
                !isOpen && "border-none" // Hide border when width is 0 to avoid artifacts
            )}
        >
            {/* Header */}
            <div className={cn(
                "flex items-center justify-between border-b border-border bg-background flex-shrink-0 overflow-hidden",
                isCollapsed ? "h-14 px-2 flex-col justify-center gap-2" : "h-14 px-4"
            )}>
                {isCollapsed ? (
                    <Logo variant="symbol" className="h-5 w-5 mx-auto" />
                ) : (
                    <div className="flex items-center w-full h-full gap-2 px-1">
                        {/* Left: Logo & Title - Flex 1 to push center */}
                        <div className="flex-1 flex items-center justify-start min-w-0 gap-2">
                            {view === 'history' && (
                                <Button variant="ghost" size="icon" className="-ml-2 shrink-0" onClick={() => setView('chat')}>
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            )}
                            <div className="flex items-center gap-2 min-w-0">
                                <Logo variant="symbol" className="h-5 w-5 shrink-0" />
                                <span className="font-semibold text-sm text-foreground whitespace-nowrap overflow-hidden text-ellipsis">Ask AI</span>
                            </div>
                        </div>

                        {/* Center: Token Usage */}
                        <div className="shrink-0">
                            <TokenUsagePill />
                        </div>

                        {/* Right: Actions - Flex 1 to push center */}
                        <div className="flex-1 flex items-center justify-end min-w-0 gap-1">
                            {view === 'chat' && (
                                <ActionTooltip label="History">
                                    <Button variant="ghost" size="icon" onClick={() => setView('history')}>
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                </ActionTooltip>
                            )}
                            <ActionTooltip label="New Chat">
                                <Button variant="ghost" size="icon" onClick={handleNewSession}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </ActionTooltip>
                        </div>
                    </div>
                )}
            </div>

            {/* Content Area */}
            {isCollapsed ? (
                <div className="flex flex-col items-center py-4 gap-2">
                    <ActionTooltip label="New Chat" side="left">
                        <Button variant="ghost" size="icon" onClick={() => {
                            expand();
                            handleNewSession();
                        }}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </ActionTooltip>

                    <ActionTooltip label="History" side="left">
                        <Button variant="ghost" size="icon" onClick={() => {
                            expand();
                            setView('history');
                        }}>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </ActionTooltip>
                </div>
            ) : (
                <div className="flex flex-col flex-1 min-h-0 bg-muted/30 relative overflow-hidden">
                    {/* History View */}
                    {view === 'history' && (
                        <div className="absolute inset-0 z-20 bg-card animate-in fade-in slide-in-from-right-4 duration-300">
                            <SessionHistoryList
                                sessions={sessions}
                                activeSessionId={activeSessionId}
                                onSelect={handleSessionSelect}
                                onDelete={deleteSession}
                            />
                        </div>
                    )}

                    {/* Chat View */}
                    <div className={cn(
                        "flex flex-col flex-1 h-full transition-opacity duration-300",
                        view === 'history' ? "opacity-0 pointer-events-none" : "opacity-100"
                    )}>
                        <ChatInterface
                            activeSessionId={activeSessionId}
                            sessions={sessions}
                            messages={messages}
                            isLoading={isLoading}
                            onSendMessage={handleSendMessage}
                            onCitationClick={onNavigateToNote}
                            inputValue={input}
                            onInputChange={setInput}
                            notes={notes}
                            onSaveToNotes={(content, suggestedTitle) => addToNotes.openDialog({ content, suggestedTitle })}
                        />
                    </div>
                </div>
            )}

            {/* Modals */}
            <NewSessionConfirmationModal
                open={newSessionConfirmation.isOpen}
                onOpenChange={(open) => !open && newSessionConfirmation.cancel()}
                mode={newSessionConfirmation.pendingMode}
                onConfirm={handleConfirmNewSession}
                onCancel={newSessionConfirmation.cancel}
            />

            <TokenLimitDialog
                open={showTokenLimitDialog}
                onOpenChange={setShowTokenLimitDialog}
                dailyLimit={tokenUsage.chat.limit}
            />

            <SaveToNotesDialog
                open={addToNotes.isOpen}
                onOpenChange={(open) => !open && addToNotes.closeDialog()}
                suggestedTitle={addToNotes.suggestedTitle}
                notebooks={noteSystem.notebooks}
                onSaveToExisting={addToNotes.saveToExistingNotebook}
                onSaveToNew={addToNotes.saveToNewNotebook}
                isSaving={addToNotes.isSaving}
            />
        </SidebarLayout>
    );
}
