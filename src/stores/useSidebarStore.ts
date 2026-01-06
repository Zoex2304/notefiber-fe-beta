import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
    // Left Sidebar (App Sidebar)
    isLeftOpen: boolean;

    // Right Sidebar (Chat Sidebar)
    isRightOpen: boolean;       // Rendered/Visible in Layout
    isRightCollapsed: boolean;  // Minimized width
    rightView: 'chat' | 'history';

    // Actions
    toggleLeftSidebar: () => void;
    setLeftSidebarOpen: (open: boolean) => void;

    toggleRightSidebar: () => void;
    setRightSidebarOpen: (open: boolean) => void;

    toggleRightCollapsed: () => void;
    setRightCollapsed: (collapsed: boolean) => void;

    setRightView: (view: 'chat' | 'history') => void;

    // Composite Actions
    openChat: () => void; // Opens right sidebar and sets view to chat, expands if needed
    openHistory: () => void; // Opens right sidebar and sets view to history
}

export const useSidebarStore = create<SidebarState>()(
    persist(
        (set, get) => ({
            isLeftOpen: true,

            isRightOpen: false,
            isRightCollapsed: false,
            rightView: 'chat',

            toggleLeftSidebar: () => set((state) => ({ isLeftOpen: !state.isLeftOpen })),
            setLeftSidebarOpen: (open) => set({ isLeftOpen: open }),

            toggleRightSidebar: () => set((state) => ({ isRightOpen: !state.isRightOpen })),
            setRightSidebarOpen: (open) => set({ isRightOpen: open }),

            toggleRightCollapsed: () => set((state) => ({ isRightCollapsed: !state.isRightCollapsed })),
            setRightCollapsed: (collapsed) => set({ isRightCollapsed: collapsed }),

            setRightView: (view) => set({ rightView: view }),

            openChat: () => set({
                isRightOpen: true,
                rightView: 'chat',
                isRightCollapsed: false // Auto-expand when explicitly opening
            }),

            openHistory: () => set({
                isRightOpen: true,
                rightView: 'history',
                isRightCollapsed: false
            }),
        }),
        {
            name: 'sidebar-storage',
            partialize: (state) => ({
                isLeftOpen: state.isLeftOpen,
                isRightCollapsed: state.isRightCollapsed,
                // We don't persist isRightOpen usually to start fresh? 
                // Or maybe we do. Let's persist all for now as user asked for persistence.
                isRightOpen: state.isRightOpen,
                rightView: state.rightView
            }),
        }
    )
);
