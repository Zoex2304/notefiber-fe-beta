import { Progress } from '@/components/shadui/progress';
import { cn } from '@/lib/utils';

interface TokenUsageIndicatorProps {
    dailyUsed: number;
    dailyLimit: number;
    percentage: number;
    className?: string;
    showLabel?: boolean;
}

export function TokenUsageIndicator({
    dailyUsed,
    dailyLimit,
    percentage,
    className,
    showLabel = true,
}: TokenUsageIndicatorProps) {
    // Determine color based on usage percentage
    const getColor = () => {
        if (percentage >= 90) return 'text-red-600';
        if (percentage >= 80) return 'text-yellow-600';
        return 'text-green-600';
    };

    const getProgressColor = () => {
        if (percentage >= 90) return 'bg-red-600';
        if (percentage >= 80) return 'bg-yellow-600';
        return 'bg-green-600';
    };

    // If no limit set or unlimited (-1), don't show indicator
    if (dailyLimit === 0 || dailyLimit === -1) {
        return null;
    }

    return (
        <div className={cn('space-y-1', className)}>
            {showLabel && (
                <div className={cn('text-xs font-medium flex items-center justify-between', getColor())}>
                    <span>AI Usage Today</span>
                    <span>
                        {dailyUsed} / {dailyLimit}
                    </span>
                </div>
            )}
            <Progress
                value={percentage}
                className="h-1.5"
                indicatorClassName={getProgressColor()}
            />
            {showLabel && percentage >= 80 && (
                <p className="text-xs text-muted-foreground">
                    {percentage >= 90
                        ? 'Almost at your daily limit!'
                        : 'Approaching daily limit'}
                </p>
            )}
        </div>
    );
}
