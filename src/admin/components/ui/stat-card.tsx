import { Card, CardContent, CardHeader, CardTitle } from '@admin/components/ui/card'
import { cn } from '@admin/lib/utils'
import type { LucideIcon } from 'lucide-react'

import type { ReactNode } from 'react'

interface StatCardProps {
    title: string
    value: string | number | ReactNode
    description?: string
    icon?: LucideIcon
    trend?: {
        value: string
        isPositive: boolean
    }
    className?: string
}

export function StatCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    className,
}: StatCardProps) {
    return (
        <Card className={cn(className)}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>{title}</CardTitle>
                {Icon && (
                    <Icon className='text-muted-foreground h-4 w-4' />
                )}
            </CardHeader>
            <CardContent>
                <div className='text-2xl font-bold'>{value}</div>
                {(description || trend) && (
                    <p className='text-muted-foreground text-xs'>
                        {trend && (
                            <span
                                className={cn(
                                    'font-medium',
                                    trend.isPositive ? 'text-green-600' : 'text-red-600'
                                )}
                            >
                                {trend.value}
                            </span>
                        )}
                        {description && ` ${description}`}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
