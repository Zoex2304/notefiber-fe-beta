import { useState, useEffect } from 'react'
import { useSearch } from '@tanstack/react-router'
import { Main } from '@admin/components/layout/main'
import { CancellationsProvider } from './components/cancellations-provider'
import { CancellationsTable } from './components/cancellations-table'
import { CancellationsDialogs } from './components/cancellations-dialogs'
import { useCancellations } from './hooks/use-cancellations'
import type { CancellationStatus } from '@admin/lib/types/admin-api'

export default function CancellationsPage() {
    const [statusFilter, setStatusFilter] = useState<CancellationStatus | 'all'>('pending')
    const [highlightId, setHighlightId] = useState<string | undefined>()

    // Get highlight param from URL (e.g., /cancellations?highlight=uuid)
    const searchParams = useSearch({ strict: false }) as { highlight?: string }

    useEffect(() => {
        if (searchParams?.highlight) {
            setHighlightId(searchParams.highlight)
            // Clear highlight after 3 seconds
            const timer = setTimeout(() => setHighlightId(undefined), 3000)
            return () => clearTimeout(timer)
        }
    }, [searchParams?.highlight])

    const queryParams = statusFilter === 'all' ? undefined : { page: 1, limit: 20, status: statusFilter }
    const { data: cancellations = [], isLoading } = useCancellations(queryParams)

    return (
        <CancellationsProvider>
            <Main className="flex flex-1 flex-col gap-4 sm:gap-6">
                <div className="flex flex-wrap items-end justify-between gap-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Cancellation Requests</h2>
                        <p className="text-muted-foreground">
                            Review and process subscription cancellation requests from users.
                        </p>
                    </div>
                </div>

                <CancellationsTable
                    data={cancellations}
                    isLoading={isLoading}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    highlightId={highlightId}
                />
            </Main>

            <CancellationsDialogs />
        </CancellationsProvider>
    )
}
