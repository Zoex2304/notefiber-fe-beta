import { Progress } from '@admin/components/ui/progress'
import { cn } from '@admin/lib/utils'

interface TokenProgressBarProps {
    current: number
    limit: number
    showLabel?: boolean
    className?: string
}

export function TokenProgressBar({
    current,
    limit,
    showLabel = true,
    className,
}: TokenProgressBarProps) {
    const percentage = limit > 0 ? (current / limit) * 100 : 0
    const isNearLimit = percentage >= 80
    const isAtLimit = percentage >= 100

    // Determine color based on usage
    const getProgressColor = () => {
        if (isAtLimit) return 'bg-destructive'
        if (isNearLimit) return 'bg-yellow-500'
        return 'bg-primary'
    }

    return (
        <div className={cn('space-y-2', className)}>
            {showLabel && (
                <div className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground'>AI Token Usage</span>
                    <span className={cn('font-medium', isAtLimit && 'text-destructive')}>
                        {current} / {limit === 0 ? '∞' : limit}
                    </span>
                </div>
            )}
            <Progress
                value={Math.min(percentage, 100)}
                className='h-2'
                indicatorClassName={getProgressColor()}
            />
        </div>
    )
}
