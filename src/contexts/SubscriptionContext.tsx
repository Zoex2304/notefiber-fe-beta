/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, type ReactNode } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';

// Legacy Context (kept for tree consistency if needed, but state is now in Zustand)
const SubscriptionContext = createContext<boolean>(true);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated } = useAuth();
    const { fetchSubscription } = useSubscriptionStore();

    useEffect(() => {
        if (isAuthenticated) {
            fetchSubscription();
        }
    }, [isAuthenticated, fetchSubscription]);

    return (
        <SubscriptionContext.Provider value={true}>
            {children}
        </SubscriptionContext.Provider>
    );
};

// Hook now bridges to Zustand
export const useSubscription = () => {
    const store = useSubscriptionStore();
    return {
        ...store,
        // Ensure manual call is available if needed (it is in store actions)
        refreshSubscription: store.fetchSubscription
    };
};
