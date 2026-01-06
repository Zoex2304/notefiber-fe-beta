import { Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { TopBar } from "@/components/common/TopBar";
import { SearchDialog } from "@/components/search-dialog";
import { useNoteOrchestratorContext } from "@/contexts/NoteOrchestratorContext";
// Hooks
import { useChatStore } from "@/stores/useChatStore";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { useEffect, useRef } from "react";
import { playNotificationSound } from "@/utils/sound";
import { toaster } from "@/hooks/useToaster";

export function PersistentLayout() {
    const {
        appSidebarProps,
        noteSystem,
        // Search
        searchOpen,
        setSearchOpen,
        checkAndOpenSearch,
        checkAndToggleChat,
        // Navigation
        navigateToNote
    } = useNoteOrchestratorContext();

    // Sidebar Store
    const isRightOpen = useSidebarStore(s => s.isRightOpen);
    const isRightCollapsed = useSidebarStore(s => s.isRightCollapsed);
    const toggleRightSidebar = useSidebarStore(s => s.toggleRightSidebar);
    const openChat = useSidebarStore(s => s.openChat);

    // Background Job Notification Logic
    const isGenerating = useChatStore(state => state.isGenerating);
    const prevGenerating = useRef(isGenerating);

    useEffect(() => {
        const handleOpenChatSidebar = () => openChat();
        window.addEventListener("open-chat-sidebar", handleOpenChatSidebar);
        return () => window.removeEventListener("open-chat-sidebar", handleOpenChatSidebar);
    }, [openChat]);

    useEffect(() => {
        // If we WERE generating, and now NOT generating, and sidebar is CLOSED or COLLAPSED
        if (prevGenerating.current && !isGenerating) {
            // Notification Condition:
            // 1. Sidebar is completely closed (!isRightOpen)
            // 2. OR Sidebar is open but collapsed (isRightOpen && isRightCollapsed)
            const shouldNotify = !isRightOpen || isRightCollapsed;

            if (shouldNotify) {
                playNotificationSound();
                toaster.success("Response Ready", {
                    description: "The AI has finished processing your request.",
                    action: {
                        label: "Open Chat",
                        onClick: () => openChat()
                    },
                    duration: 5000
                });
            }
        }
        prevGenerating.current = isGenerating;
    }, [isGenerating, isRightOpen, isRightCollapsed, openChat]);

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
            {/* Left Sidebar */}
            <AppSidebar {...appSidebarProps} />

            {/* Main Workspace */}
            <div className="flex-1 flex flex-col min-w-0 h-full">
                <TopBar
                    onSearchClick={checkAndOpenSearch}
                    onChatClick={checkAndToggleChat}
                />

                {/* Content Area - Where specific pages like MainApp, NotePage, AccountSettings rendered */}
                <div className="flex-1 flex flex-col bg-white overflow-y-auto overflow-x-hidden relative">
                    <Outlet />
                </div>
            </div>

            {/* Right Sidebar (Chat) */}
            <RightSidebar
                onNavigateToNote={navigateToNote}
                notes={noteSystem.notes}
            />

            {/* Dialogs */}
            <SearchDialog
                open={searchOpen}
                onOpenChange={setSearchOpen}
                notes={noteSystem.notes}
                onNoteSelect={(noteId) => {
                    navigateToNote(noteId);
                    setSearchOpen(false);
                }}
            />
        </div>
    );
}

