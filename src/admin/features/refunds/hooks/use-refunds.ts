import { useQuery } from '@tanstack/react-query'
import { adminRefundsApi } from '@admin/lib/api/admin-api'
import type { RefundListParams, RefundListItem } from '@admin/lib/types/admin-api'

export function useRefunds(params?: RefundListParams) {
    return useQuery<RefundListItem[], Error>({
        queryKey: ['admin', 'refunds', params],
        queryFn: () => adminRefundsApi.getRefunds(params),
        staleTime: 30000,
    })
}
