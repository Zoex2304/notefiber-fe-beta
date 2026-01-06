import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { toaster } from '@/hooks/useToaster';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';
import { useCancellationHistory } from '@/hooks/user/useCancellations';
import { useRefundHistory } from '@/hooks/user/useRefunds';
import { refundService } from '@/api/services/refund/refund.service';

/**
 * Custom hook that orchestrates all subscription management page logic.
 * Extracts business logic from the page component for separation of concerns.
 */
export function useSubscriptionPageLogic() {
    const navigate = useNavigate();
    const router = useRouter();

    // Subscription context
    const {
        planName,
        isActive,
        tokenUsage,
        subscriptionId,
        refreshSubscription,
        isLoading,
        validateSubscription,
        validationStatus
    } = useSubscription();

    // Zustand store for public plans
    const publicPlans = useSubscriptionStore(state => state.publicPlans);
    const fetchPublicPlans = useSubscriptionStore(state => state.fetchPublicPlans);

    // Data fetching hooks
    const { data: cancellationHistory = [] } = useCancellationHistory();
    const { data: refundHistory = [] } = useRefundHistory();

    // Local state
    const [refundModalOpen, setRefundModalOpen] = useState(false);
    const [cancellationModalOpen, setCancellationModalOpen] = useState(false);
    const [hasPendingRefund, setHasPendingRefund] = useState(false);

    // Derived state
    const latestCancellation = cancellationHistory.length > 0 ? cancellationHistory[0] : null;
    const latestRefund = refundHistory.length > 0 ? refundHistory[0] : null;
    const isPaidPlan = planName.toLowerCase().includes('pro') || planName.toLowerCase().includes('enterprise');
    const isCanceledButValid = Boolean(validationStatus?.is_valid && validationStatus?.status === 'canceled');
    const displayActive = isActive || isCanceledButValid;
    const showEffectiveDate = latestCancellation?.status === 'approved' && latestCancellation?.effective_date;
    const showDangerZone = isPaidPlan && !isCanceledButValid && (!latestCancellation || latestCancellation.status === 'rejected');

    // Initialize data on mount
    useEffect(() => {
        fetchPublicPlans();
        validateSubscription();
    }, [fetchPublicPlans, validateSubscription]);

    // Check for pending refund
    useEffect(() => {
        const checkPendingRefund = async () => {
            try {
                const response = await refundService.getMyRefunds();
                if (response.success && response.data) {
                    const pending = response.data.some(r => r.status === 'pending');
                    setHasPendingRefund(pending);
                }
            } catch {
                // Silent error
            }
        };

        if (subscriptionId) {
            checkPendingRefund();
        }

        const handleRefundStatusChange = () => {
            checkPendingRefund();
        };

        window.addEventListener('refund:status_changed', handleRefundStatusChange);
        return () => window.removeEventListener('refund:status_changed', handleRefundStatusChange);
    }, [subscriptionId]);

    // Handlers
    const handleGoBack = useCallback(() => {
        router.history.go(-1);
    }, [router]);

    const handleUpgrade = useCallback(() => {
        navigate({ to: '/pricing' });
    }, [navigate]);

    const handleCancelClick = useCallback(() => {
        setCancellationModalOpen(true);
    }, []);

    const handleRefundClick = useCallback(() => {
        if (hasPendingRefund) {
            toaster.info('Refund pending approval.');
            return;
        }
        setRefundModalOpen(true);
    }, [hasPendingRefund]);

    const handleRefundSuccess = useCallback(() => {
        setHasPendingRefund(true);
        refreshSubscription();
    }, [refreshSubscription]);

    const handleCancelSuccess = useCallback(() => {
        refreshSubscription();
    }, [refreshSubscription]);

    const handleNavigateToRefund = useCallback((id: string) => {
        navigate({
            to: '/app/subscription/refunds/$refundId',
            params: { refundId: id }
        });
    }, [navigate]);

    const handleNavigateToCancellation = useCallback((id: string) => {
        navigate({
            to: '/app/subscription/cancellation/$cancellationId',
            params: { cancellationId: id }
        });
    }, [navigate]);

    return {
        // State
        planName,
        isActive,
        tokenUsage,
        subscriptionId,
        isPaidPlan,
        isCanceledButValid,
        displayActive,
        showDangerZone,
        showEffectiveDate,
        hasPendingRefund,
        latestCancellation,
        latestRefund,
        publicPlans,
        isLoading,

        // Modal state
        refundModalOpen,
        setRefundModalOpen,
        cancellationModalOpen,
        setCancellationModalOpen,

        // Handlers
        handleGoBack,
        handleUpgrade,
        handleRefundClick,
        handleCancelClick,
        handleRefundSuccess,
        handleCancelSuccess,
        handleNavigateToRefund,
        handleNavigateToCancellation
    };
}
