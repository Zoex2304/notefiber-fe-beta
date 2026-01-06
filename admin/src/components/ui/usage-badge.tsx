import { Badge } from '@admin/components/ui/badge'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@admin/lib/utils'

type UsageLevel = 'normal' | 'warning' | 'critical'

interface UsageBadgeProps {
    current: number
    limit: number
    className?: string
}

export function UsageBadge({ current, limit, className }: UsageBadgeProps) {
    const percentage = limit > 0 ? (current / limit) * 100 : 0

    const getUsageLevel = (): UsageLevel => {
        if (percentage >= 100) return 'critical'
        if (percentage >= 80) return 'warning'
        return 'normal'
    }

    const usageLevel = getUsageLevel()

    if (usageLevel === 'normal') return null

    const config = {
        warning: {
            label: '80% Used',
            variant: 'outline' as const,
            className: 'border-yellow-500 text-yellow-700',
        },
        critical: {
            label: 'Limit Reached',
            variant: 'destructive' as const,
            className: '',
        },
        normal: {
            label: '',
            variant: 'outline' as const,
            className: '',
        },
    }

    const { label, variant, className: variantClass } = config[usageLevel]

    return (
        <Badge variant={variant} className={cn(variantClass, className)}>
            <AlertTriangle className='mr-1 h-3 w-3' />
            {label}
        </Badge>
    )
}
