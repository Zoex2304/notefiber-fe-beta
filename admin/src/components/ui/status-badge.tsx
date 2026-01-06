import { Badge } from '@admin/components/ui/badge'
import { cn } from '@admin/lib/utils'

type Status = 'active' | 'inactive' | 'canceled' | 'pending' | 'success' | 'failed' | 'refunded'

interface StatusBadgeProps {
    status: Status
    className?: string
}

const statusConfig: Record<
    Status,
    {
        label: string
        variant: 'default' | 'secondary' | 'destructive' | 'outline'
        className?: string
    }
> = {
    active: {
        label: 'Active',
        variant: 'default',
        className: 'bg-green-500 hover:bg-green-600',
    },
    inactive: {
        label: 'Inactive',
        variant: 'secondary',
    },
    canceled: {
        label: 'Canceled',
        variant: 'destructive',
    },
    pending: {
        label: 'Pending',
        variant: 'outline',
        className: 'border-yellow-500 text-yellow-700',
    },
    success: {
        label: 'Success',
        variant: 'default',
        className: 'bg-green-500 hover:bg-green-600',
    },
    failed: {
        label: 'Failed',
        variant: 'destructive',
    },
    refunded: {
        label: 'Refunded',
        variant: 'outline',
        className: 'border-blue-500 text-blue-700',
    },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const config = statusConfig[status] ?? {
        label: status || 'Unknown',
        variant: 'secondary' as const,
    }

    return (
        <Badge
            variant={config.variant}
            className={cn(config.className, className)}
        >
            {config.label}
        </Badge>
    )
}
