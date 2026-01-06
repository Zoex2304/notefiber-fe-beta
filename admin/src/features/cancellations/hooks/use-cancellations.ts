import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminCancellationsApi } from '@admin/lib/api/admin-api'
import type { CancellationListParams, AdminCancellation, ProcessCancellationRequest } from '@admin/lib/types/admin-api'

export function useCancellations(params?: CancellationListParams) {
    return useQuery<AdminCancellation[], Error>({
        queryKey: ['admin', 'cancellations', params],
        queryFn: () => adminCancellationsApi.getCancellations(params),
        staleTime: 30000,
    })
}

export function useProcessCancellation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: ProcessCancellationRequest }) =>
            adminCancellationsApi.processCancellation(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'cancellations'] })
        },
    })
}
