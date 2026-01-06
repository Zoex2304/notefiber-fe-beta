import { Skeleton } from '@/components/shadui/skeleton';
import { PageHeaderLayout } from '@/components/layout/PageHeaderLayout';
import { useSubscriptionPageLogic } from '@/hooks/subscription/useSubscriptionPageLogic';
import {
    SubscriptionHeroSection,
    UsageLimitsSection,
    PlanFeaturesSection,
    BillingManagementSection
} from './components';
import { RefundRequestModal } from './RefundRequestModal';
import { CancellationRequestModal } from './CancellationRequestModal';

/**
 * Subscription Management Page
 * 
 * This page follows atomic design principles and acts as a pure orchestrator.
 * All business logic is extracted to useSubscriptionPageLogic hook.
 * All UI components are composed from atoms -> molecules -> organisms.
 */
export function SubscriptionManagement() {
    const {
        // State
        planName,
        tokenUsage,
        subscriptionId,
        isPaidPlan,
        isCanceledButValid,
        displayActive,
        showDangerZone,
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
    } = useSubscriptionPageLogic();

    // Loading State
    if (isLoading) {
        return (
            <div className="p-8 space-y-4 max-w-5xl mx-auto">
                <Skeleton className="h-48 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
            </div>
        );
    }

    return (
        <div className="container max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
            {/* Page Header */}
            <PageHeaderLayout
                title="Subscription"
                subtitle="Manage your plan usage and details"
                onBack={handleGoBack}
            />

            {/* Hero Section */}
            <SubscriptionHeroSection
                planName={planName}
                isActive={displayActive}
                isCanceledButValid={isCanceledButValid}
                isPaidPlan={isPaidPlan}
                hasPendingRefund={hasPendingRefund}
                onUpgrade={handleUpgrade}
                onRefund={handleRefundClick}
            />

            {/* Usage & Limits */}
            <UsageLimitsSection tokenUsage={tokenUsage} />

            {/* Included Features */}
            <PlanFeaturesSection
                planName={planName}
                publicPlans={publicPlans}
                isLoading={publicPlans.length === 0}
            />

            {/* Billing & Management */}
            <BillingManagementSection
                displayActive={displayActive}
                isCanceledButValid={isCanceledButValid}
                isPaidPlan={isPaidPlan}
                hasPendingRefund={hasPendingRefund}
                latestCancellation={latestCancellation}
                latestRefund={latestRefund}
                showDangerZone={showDangerZone}
                onCancelClick={handleCancelClick}
                onNavigateToRefund={handleNavigateToRefund}
                onNavigateToCancellation={handleNavigateToCancellation}
            />

            {/* Modals */}
            <RefundRequestModal
                open={refundModalOpen}
                onOpenChange={setRefundModalOpen}
                subscriptionId={subscriptionId}
                planName={planName}
                onSuccess={handleRefundSuccess}
            />
            <CancellationRequestModal
                open={cancellationModalOpen}
                onOpenChange={setCancellationModalOpen}
                subscriptionId={subscriptionId}
                planName={planName}
                onSuccess={handleCancelSuccess}
            />
        </div>
    );
}
