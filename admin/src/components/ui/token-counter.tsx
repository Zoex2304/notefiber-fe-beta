import { cn } from '@admin/lib/utils'
import { Zap } from 'lucide-react'

interface TokenCounterProps {
    count: number
    limit?: number
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export function TokenCounter({
    count,
    limit,
    size = 'md',
    className,
}: TokenCounterProps) {
    const sizeClasses = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
    }

    const hasLimit = limit !== undefined && limit > 0
    const percentage = hasLimit ? (count / limit) * 100 : 0
    const isWarning = percentage >= 80
    const isDanger = percentage >= 100

    return (
        <div
            className={cn(
                'inline-flex items-center gap-2 rounded-md border px-3 py-1',
                isWarning && !isDanger && 'border-yellow-500 bg-yellow-50 text-yellow-700',
                isDanger && 'border-destructive bg-destructive/10 text-destructive',
                !isWarning && 'border-border',
                className
            )}
        >
            <Zap className='h-4 w-4' />
            <span className={cn('font-medium', sizeClasses[size])}>
                {count.toLocaleString()}
                {hasLimit && ` / ${limit.toLocaleString()}`}
            </span>
        </div>
    )
}
