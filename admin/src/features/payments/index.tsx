import { getRouteApi } from '@tanstack/react-router'
import { Main } from '@admin/components/layout/main'
import { PaymentsTable } from './components/payments-table'
import { usePayments } from './hooks/use-payments'
import type { TransactionListParams } from '@admin/lib/types/admin-api'
import type { NavigateFn } from '@admin/hooks/use-table-url-state'

const route = getRouteApi('/_authenticated/payments')

export function Payments() {
    const search = route.useSearch() as TransactionListParams
    const navigate = route.useNavigate() as NavigateFn

    const queryParams: TransactionListParams = {
        page: search.page || 1,
        limit: search.limit || 10,
        status: search.status,
    }

    const { data: payments = [], isLoading } = usePayments(queryParams)

    return (
        <>
            <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
                <div className='flex items-center justify-between'>
                    <div>
                        <h2 className='text-2xl font-bold tracking-tight'>Payments</h2>
                        <p className='text-muted-foreground'>
                            View and manage all subscription transactions.
                        </p>
                    </div>
                </div>
                <PaymentsTable
                    data={payments}
                    isLoading={isLoading}
                    search={search}
                    navigate={navigate}
                />
            </Main>
        </>
    )
}
