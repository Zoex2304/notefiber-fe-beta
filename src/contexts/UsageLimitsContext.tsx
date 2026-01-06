import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { PricingModal } from '@/components/modals/PricingModal';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';

interface LimitExceededInfo {
    featureName: string;
    used: number;
    limit: number;
    resetsAt?: string;
}

interface UsageLimitsContextType {
    // Modal controls
    showPricingModal: (featureName?: string, limitInfo?: Omit<LimitExceededInfo, 'featureName'>) => void;
    hidePricingModal: () => void;
    isPricingModalOpen: boolean;

    // Usage checking functions (with auto-modal on failure)
    checkCanCreateNotebook: () => Promise<boolean>;
    checkCanCreateNote: () => Promise<boolean>;
    checkCanUseAiChat: () => Promise<boolean>;
    checkCanUseSemanticSearch: () => Promise<boolean>;
}

const UsageLimitsContext = createContext<UsageLimitsContextType | undefined>(undefined);

interface UsageLimitsProviderProps {
    children: ReactNode;
}

/**
 * UsageLimitsProvider
 * 
 * Provides usage limit checking functions that read from the Zustand store
 * (single source of truth) and show upgrade modals when limits are exceeded.
 * 
 * All usage data comes from useSubscriptionStore.tokenUsage, which is fetched
 * once on authentication and can be refreshed via fetchSubscription().
 */
export function UsageLimitsProvider({ children }: UsageLimitsProviderProps) {
    const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
    const [modalFeatureName, setModalFeatureName] = useState<string>('This feature');
    const [modalLimitInfo, setModalLimitInfo] = useState<Omit<LimitExceededInfo, 'featureName'> | undefined>();

    // Read from Zustand store - single source of truth
    const fetchSubscription = useSubscriptionStore(s => s.fetchSubscription);
    const planName = useSubscriptionStore(s => s.planName);

    const showPricingModal = useCallback((featureName = 'This feature', limitInfo?: Omit<LimitExceededInfo, 'featureName'>) => {
        setModalFeatureName(featureName);
        setModalLimitInfo(limitInfo);
        setIsPricingModalOpen(true);
    }, []);

    const hidePricingModal = useCallback(() => {
        setIsPricingModalOpen(false);
        setModalLimitInfo(undefined);
    }, []);

    // Check functions that refresh Zustand and auto-show modal on failure
    const checkCanCreateNotebook = useCallback(async () => {
        // Refresh from backend to ensure fresh data
        await fetchSubscription();
        // Read fresh state from Zustand
        const freshUsage = useSubscriptionStore.getState().tokenUsage;
        const canUse = freshUsage.storage.notebooks.can_use;

        if (!canUse) {
            showPricingModal('notebooks', {
                used: freshUsage.storage.notebooks.used,
                limit: freshUsage.storage.notebooks.limit,
            });
        }
        return canUse;
    }, [fetchSubscription, showPricingModal]);

    const checkCanCreateNote = useCallback(async () => {
        await fetchSubscription();
        const freshUsage = useSubscriptionStore.getState().tokenUsage;
        const canUse = freshUsage.storage.notes.can_use;

        if (!canUse) {
            showPricingModal('notes per notebook', {
                used: freshUsage.storage.notes.used,
                limit: freshUsage.storage.notes.limit,
            });
        }
        return canUse;
    }, [fetchSubscription, showPricingModal]);

    const checkCanUseAiChat = useCallback(async () => {
        await fetchSubscription();
        const freshUsage = useSubscriptionStore.getState().tokenUsage;
        const canUse = freshUsage.chat.can_use;

        if (!canUse) {
            showPricingModal('AI chat messages', {
                used: freshUsage.chat.used,
                limit: freshUsage.chat.limit,
                resetsAt: freshUsage.chat.resets_at,
            });
        }
        return canUse;
    }, [fetchSubscription, showPricingModal]);

    const checkCanUseSemanticSearch = useCallback(async () => {
        await fetchSubscription();
        const freshUsage = useSubscriptionStore.getState().tokenUsage;
        const canUse = freshUsage.search.can_use;

        if (!canUse) {
            showPricingModal('semantic searches', {
                used: freshUsage.search.used,
                limit: freshUsage.search.limit,
                resetsAt: freshUsage.search.resets_at,
            });
        }
        return canUse;
    }, [fetchSubscription, showPricingModal]);

    // Derive current plan slug for pricing modal
    const currentPlanSlug = planName?.toLowerCase().replace(/\s+plan$/i, '').replace(/\s+/g, '-') || 'free';

    return (
        <UsageLimitsContext.Provider
            value={{
                showPricingModal,
                hidePricingModal,
                isPricingModalOpen,
                checkCanCreateNotebook,
                checkCanCreateNote,
                checkCanUseAiChat,
                checkCanUseSemanticSearch,
            }}
        >
            {children}
            <PricingModal
                isOpen={isPricingModalOpen}
                onClose={hidePricingModal}
                featureName={modalFeatureName}
                limitInfo={modalLimitInfo}
                currentPlanSlug={currentPlanSlug}
            />
        </UsageLimitsContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUsageLimits() {
    const context = useContext(UsageLimitsContext);
    if (context === undefined) {
        throw new Error('useUsageLimits must be used within a UsageLimitsProvider');
    }
    return context;
}

/**
 * Helper function to handle 429 limit exceeded errors from API
 * Use this in your API error handlers
 */
// eslint-disable-next-line react-refresh/only-export-components
export function handleLimitExceededError(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: any,
    showPricingModal: UsageLimitsContextType['showPricingModal']
): boolean {
    // Check if this is a 429 error with limit exceeded data
    if (error?.response?.status === 429 || error?.code === 429) {
        const data = error?.response?.data?.data || error?.data;
        if (data) {
            const featureName = error?.response?.data?.message || 'Daily limit';
            showPricingModal(featureName, {
                used: data.used,
                limit: data.limit,
                resetsAt: data.reset_after,
            });
            return true;
        }
        // Show modal even without detailed data
        showPricingModal();
        return true;
    }

    // Check for 403 forbidden (feature requires upgrade)
    if (error?.response?.status === 403) {
        showPricingModal();
        return true;
    }

    return false;
}
