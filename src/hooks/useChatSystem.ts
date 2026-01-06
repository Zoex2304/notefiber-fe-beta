import { useEffect } from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useChatStore } from "@/stores/useChatStore";

export function useChatSystem() {
    // Access global store
    const store = useChatStore();
    const { tokenUsage, refreshSubscription, checkLimit } = useSubscription();

    // Derived
    const activeSession = store.sessions.find((s) => s.id === store.activeSessionId) || null;
    const messages = activeSession?.messages || [];

    // Initialize sessions on mount
    useEffect(() => {
        // Only fetch if empty to avoid constant refetching on mount, 
        // OR allow smart refetching (swr-style). For now, fetch if empty.
        if (store.sessions.length === 0) {
            store.fetchSessions();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        // State
        sessions: store.sessions,
        activeSession,
        activeSessionId: store.activeSessionId,
        messages,
        isLoading: store.isLoading,
        showTokenLimitDialog: store.showTokenLimitDialog,
        tokenUsage, // From Context -> Store

        // Actions
        setShowTokenLimitDialog: store.setShowTokenLimitDialog,
        fetchSessions: store.fetchSessions,
        selectSession: store.selectSession,
        createSession: store.createSession,
        deleteSession: store.deleteSession,
        sendMessage: store.sendMessage,
        refreshSubscription,
        checkLimit
    };
}

