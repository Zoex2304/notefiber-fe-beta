import { Card, CardContent } from '@/components/shadui/card';
import { Badge } from '@/components/shadui/badge';
import { Button } from '@/components/shadui/button';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { HistorySummaryCard } from '../molecules/HistorySummaryCard';
import { Calendar, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserCancellationListItem } from '@/api/services/cancellation/cancellation.types';
import type { UserRefund } from '@/api/services/refund/refund.types';

interface BillingManagementSectionProps {
    /** Whether subscription displays as active */
    displayActive: boolean;
    /** Whether subscription is canceled but still valid */
    isCanceledButValid: boolean;
    /** Whether current plan is paid */
    isPaidPlan: boolean;
    /** Whether there's a pending refund */
    hasPendingRefund: boolean;
    /** Latest cancellation request (if any) */
    latestCancellation?: UserCancellationListItem | null;
    /** Latest refund request (if any) */
    latestRefund?: UserRefund | null;
    /** Whether to show the danger zone */
    showDangerZone: boolean;
    /** Handler for cancellation button */
    onCancelClick: () => void;
    /** Handler for refund detail navigation */
    onNavigateToRefund: (id: string) => void;
    /** Handler for cancellation detail navigation */
    onNavigateToCancellation: (id: string) => void;
    /** Additional classes */
    className?: string;
}

/**
 * Billing management section organism combining billing info,
 * history summaries, and danger zone in a vertical flow.
 */
export function BillingManagementSection({
    displayActive,
    isCanceledButValid,
    isPaidPlan,
    hasPendingRefund,
    latestCancellation,
    latestRefund,
    showDangerZone,
    onCancelClick,
    onNavigateToRefund,
    onNavigateToCancellation,
    className
}: BillingManagementSectionProps) {
    // Derived state
    const showEffectiveDate = latestCancellation?.status === 'approved' && latestCancellation?.effective_date;

    // Status badge styling
    const statusBadgeClass = cn(
        "capitalize px-2.5 py-0.5 text-sm font-semibold",
        displayActive
            ? "bg-green-100 text-green-700 hover:bg-green-100"
            : "bg-gray-100 text-gray-600",
        isCanceledButValid && "bg-orange-100 text-orange-700 hover:bg-orange-100"
    );

    const statusText = isCanceledButValid
        ? 'Canceling'
        : (displayActive ? 'Active' : 'Inactive');

    return (
        <div className={cn("space-y-8", className)}>
            {/* Billing Information */}
            <div>
                <SectionHeader
                    icon={Calendar}
                    title="Billing Information"
                />
                <Card className="shadow-sm border-gray-100 bg-white overflow-hidden hover:shadow-md transition-shadow duration-300">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Current Status */}
                            <div className="space-y-1">
                                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                    Current Status
                                </h4>
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant={displayActive ? 'default' : 'secondary'}
                                        className={statusBadgeClass}
                                    >
                                        {statusText}
                                    </Badge>
                                    {hasPendingRefund && (
                                        <Badge
                                            variant="outline"
                                            className="border-yellow-200 text-yellow-700 bg-yellow-50"
                                        >
                                            Refund Pending
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Billing Date Info */}
                            {showEffectiveDate ? (
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                        Cancellation Effective
                                    </h4>
                                    <p className="text-lg font-bold text-gray-900">
                                        {new Date(latestCancellation!.effective_date!).toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-gray-500">Access continues until this date</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                        {isPaidPlan ? 'Next Invoice' : 'Next Billing'}
                                    </h4>
                                    <p className="text-lg font-bold text-gray-900">
                                        {isPaidPlan
                                            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
                                            : "No upcoming charges"}
                                    </p>
                                    {isPaidPlan && (
                                        <p className="text-xs text-gray-500">Auto-renews on this date</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Latest Refund Summary */}
            {latestRefund && (
                <HistorySummaryCard
                    type="refund"
                    planName={latestRefund.plan_name}
                    status={latestRefund.status as 'pending' | 'approved' | 'rejected'}
                    amount={latestRefund.amount}
                    reason={latestRefund.reason}
                    date={latestRefund.created_at}
                    onClick={() => onNavigateToRefund(latestRefund.id)}
                    historyLink="/app/subscription/refunds/history"
                />
            )}

            {/* Latest Cancellation Summary */}
            {latestCancellation && (
                <HistorySummaryCard
                    type="cancellation"
                    planName={latestCancellation.plan_name}
                    status={latestCancellation.status as 'pending' | 'approved' | 'rejected'}
                    reason={latestCancellation.reason}
                    date={latestCancellation.created_at}
                    onClick={() => onNavigateToCancellation(latestCancellation.id)}
                    historyLink="/app/subscription/history"
                />
            )}

            {/* Danger Zone */}
            {showDangerZone && (
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <h3 className="text-lg font-semibold text-gray-900">Danger Zone</h3>
                    </div>
                    <Card className="border-red-100 bg-red-50/50 shadow-none hover:shadow-sm transition-shadow duration-300">
                        <CardContent className="p-6">
                            <h4 className="font-medium text-gray-900 mb-2">Cancel Subscription</h4>
                            <p className="text-sm text-gray-500 mb-4">
                                Request to cancel your subscription. You will lose access to premium features at the end of your billing period.
                            </p>
                            <Button
                                variant="destructive"
                                onClick={onCancelClick}
                                className="w-full shadow-sm"
                            >
                                Request Cancellation
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
