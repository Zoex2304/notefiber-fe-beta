import { useQuery } from '@tanstack/react-query'
import { adminDashboardApi } from '@admin/lib/api/admin-api'
import type { TransactionListParams } from '@admin/lib/types/admin-api'

export function usePayments(params: TransactionListParams) {
    return useQuery({
        queryKey: ['admin', 'payments', params],
        queryFn: () => adminDashboardApi.getTransactions(params),
    })
}
