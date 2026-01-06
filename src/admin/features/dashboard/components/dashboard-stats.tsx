import { DollarSign, Users, UserCheck, Activity } from 'lucide-react'
import { StatCard } from '@admin/components/ui/stat-card'
import { CurrencyDisplay } from '@admin/components/ui/currency-display'
import { useDashboardStats } from '@admin/hooks/use-admin-api'

export function DashboardStats() {
    const { data: stats, isLoading, error } = useDashboardStats({
        refetchInterval: 60000, // Refresh every 60 seconds
    })

    if (isLoading) {
        return (
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className='h-32 animate-pulse rounded-lg bg-muted'
                    />
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <div className='text-destructive rounded-lg border border-destructive bg-destructive/10 p-4'>
                Failed to load dashboard statistics. Please try again.
            </div>
        )
    }

    if (!stats) {
        return null
    }

    return (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <StatCard
                title='Total Revenue'
                value={<CurrencyDisplay amount={stats.total_revenue} />}
                icon={DollarSign}
                description='All-time revenue'
            />

            <StatCard
                title='Active Subscribers'
                value={stats.active_subscribers.toLocaleString()}
                icon={Users}
                description='Current active subscriptions'
            />

            <StatCard
                title='Total Users'
                value={stats.total_users.toLocaleString()}
                icon={UserCheck}
                description='Registered users'
            />

            <StatCard
                title='Active Users'
                value={stats.active_users.toLocaleString()}
                icon={Activity}
                description='Users with active status'
            />
        </div>
    )
}
