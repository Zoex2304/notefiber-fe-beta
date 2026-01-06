import { Badge } from '@/components/shadui/badge';
import { GradientPill } from '@/components/common/GradientPill';
import { PendingDots } from '@/components/common/PendingDots';
import { Crown, Sparkles, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

import HeaderGradient from '@/assets/images/common/header gradient_v2.svg';

interface SubscriptionHeroSectionProps {
    /** Current plan name */
    planName: string;
    /** Whether subscription is active */
    isActive: boolean;
    /** Whether subscription is canceled but still valid */
    isCanceledButValid: boolean;
    /** Whether current plan is a paid plan */
    isPaidPlan: boolean;
    /** Whether there's a pending refund */
    hasPendingRefund: boolean;
    /** Handler for upgrade/change plan */
    onUpgrade: () => void;
    /** Handler for refund request */
    onRefund: () => void;
    /** Additional classes */
    className?: string;
}

/**
 * Hero section organism for subscription management page.
 * Displays plan status, badges, and primary CTA buttons.
 */
export function SubscriptionHeroSection({
    planName,
    isActive,
    isCanceledButValid,
    isPaidPlan,
    hasPendingRefund,
    onUpgrade,
    onRefund,
    className
}: SubscriptionHeroSectionProps) {
    const displayActive = isActive || isCanceledButValid;

    // Determine status badge styling
    const statusBadgeClass = cn(
        "uppercase tracking-wider text-[10px] font-bold px-2 py-0.5 rounded-sm",
        "transition-all duration-300",
        displayActive ? "bg-royal-violet-base hover:bg-royal-violet-base" : "bg-gray-100 text-gray-500",
        isCanceledButValid && "bg-orange-500 hover:bg-orange-600"
    );

    // Determine status text
    const statusText = isCanceledButValid
        ? 'Active (Canceled)'
        : (displayActive ? 'Active' : 'Inactive');

    // Determine CTA button text and icon
    const ctaText = (!displayActive || !isPaidPlan)
        ? "Upgrade Plan"
        : (isCanceledButValid ? "Renew Plan" : "Change Plan");

    const ctaIcon = (!displayActive || !isPaidPlan)
        ? <Crown className="h-4 w-4" />
        : <Sparkles className="h-4 w-4" />;

    // Description text based on plan type
    const description = isPaidPlan
        ? "You have access to all premium features including advanced AI chat and semantic search."
        : "Upgrade to Pro to unlock advanced AI capabilities and unlimited notes.";

    return (
        <div className={cn(
            "relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm",
            isPaidPlan && "bg-soft-purple dark:bg-card", // Keep special bg for paid in light, default card in dark
            className
        )}>
            {/* Background Gradient */}
            {isPaidPlan && (
                <img
                    src={HeaderGradient}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0 dark:opacity-20"
                />
            )}

            {/* Content */}
            <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                {/* Left: Plan Info */}
                <div>
                    {/* Status Badges */}
                    <div className="flex items-center gap-3 mb-2">
                        <Badge
                            variant={displayActive ? 'default' : 'secondary'}
                            className={statusBadgeClass}
                        >
                            {statusText}
                        </Badge>
                        {hasPendingRefund && (
                            <Badge
                                variant="outline"
                                className="text-yellow-600 border-yellow-200 animate-pulse"
                            >
                                Refund Pending
                            </Badge>
                        )}
                    </div>

                    {/* Plan Name */}
                    <h2 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
                        {planName}
                        {isPaidPlan && (
                            <Crown className="h-6 w-6 text-yellow-500 fill-yellow-100" />
                        )}
                    </h2>

                    {/* Description */}
                    <p className="text-muted-foreground max-w-md font-medium">
                        {description}
                    </p>
                </div>

                {/* Right: Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <GradientPill
                        onClick={onUpgrade}
                        className="w-full sm:w-auto min-w-[140px]"
                        icon={ctaIcon}
                        size="lg"
                    >
                        {ctaText}
                    </GradientPill>

                    {isPaidPlan && (
                        <GradientPill
                            onClick={hasPendingRefund ? undefined : onRefund}
                            variant="invert"
                            animation="none"
                            className={cn(
                                "w-full sm:w-auto",
                                hasPendingRefund && "opacity-70 cursor-not-allowed"
                            )}
                            showGlow={false}
                            icon={
                                hasPendingRefund ? (
                                    <PendingDots size="sm" colorClassName="bg-gray-500" />
                                ) : (
                                    <RotateCcw className="h-4 w-4" />
                                )
                            }
                            size="lg"
                        >
                            {hasPendingRefund ? 'Awaiting Approval' : 'Request Refund'}
                        </GradientPill>
                    )}
                </div>
            </div>
        </div>
    );
}
