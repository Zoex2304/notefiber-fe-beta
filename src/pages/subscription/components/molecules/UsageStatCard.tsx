import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadui/card';
import { UsageProgressBar } from '@/components/layout/UsageProgressBar';
import { TokenUsageIndicator } from '@/components/common/TokenUsageIndicator';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UsageData {
    used: number;
    limit: number;
    percentage: number;
}

interface UsageStatCardProps {
    /** Lucide icon component */
    icon: LucideIcon;
    /** Icon color class */
    iconColor: string;
    /** Card title */
    title: string;
    /** Usage statistics */
    usage: UsageData;
    /** Progress bar color class */
    progressColor: string;
    /** Show as unlimited (limit === -1 from backend) */
    isUnlimited?: boolean;
    /** Custom unit label (e.g., 'notes', 'notebooks', 'daily used') */
    unitLabel?: string;
    /** Use TokenUsageIndicator instead of custom progress bar */
    useTokenIndicator?: boolean;
    /** Additional classes */
    className?: string;
}

/**
 * Usage statistic card molecule for displaying resource consumption.
 * Provides consistent KPI visualization with animated counters and progress.
 */
export function UsageStatCard({
    icon: Icon,
    iconColor,
    title,
    usage,
    progressColor,
    isUnlimited = false,
    unitLabel = 'daily used',
    useTokenIndicator = false,
    className
}: UsageStatCardProps) {
    // Unlimited is ONLY when limit === -1 (backend convention)
    // Do NOT treat high numbers (like 20000) as unlimited
    const showUnlimited = isUnlimited || usage.limit === -1;
    const displayLabel = showUnlimited ? "Unlimited" : unitLabel;

    return (
        <Card className={cn(
            "shadow-sm border-gray-100 bg-white hover:shadow-md transition-all duration-300",
            "hover:border-gray-200",
            className
        )}>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Icon className={cn("h-4 w-4", iconColor)} />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Main Value Display */}
                    <div className="flex items-baseline justify-between">
                        <div className="text-2xl font-bold text-gray-900">
                            {(() => {
                                if (showUnlimited) return "Active";

                                const limit = usage.limit;
                                const used = usage.used;
                                const rawPercentage = limit > 0 ? (used / limit) * 100 : 0;

                                if (used > 0 && rawPercentage < 1) {
                                    return `${rawPercentage.toFixed(2)}%`;
                                }
                                return `${Math.min(Math.round(rawPercentage), 100)}%`;
                            })()}
                        </div>
                        <span className="text-sm text-gray-500">{displayLabel}</span>
                    </div>

                    {/* Progress Visualization */}
                    {useTokenIndicator ? (
                        <TokenUsageIndicator
                            dailyLimit={usage.limit}
                            dailyUsed={usage.used}
                            percentage={usage.percentage}
                            showLabel={false}
                        />
                    ) : (
                        <UsageProgressBar
                            percentage={usage.percentage}
                            colorClassName={progressColor}
                            isUnlimited={showUnlimited}
                        />
                    )}

                    {/* Usage Stats Footer */}
                    <div className="flex justify-between text-xs text-gray-400">
                        <span>{usage.used.toLocaleString()} used</span>
                        <span>
                            {usage.limit === -1
                                ? '∞'
                                : usage.limit.toLocaleString()
                            } limit
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
