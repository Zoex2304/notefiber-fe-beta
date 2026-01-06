import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminBillingApi } from '@admin/lib/api/admin-api'
import type { AdminBilling, CreateBillingRequest, UpdateBillingRequest } from '@admin/lib/types/admin-api'

export function useUserBilling(userId: string) {
    return useQuery<AdminBilling[], Error>({
        queryKey: ['admin', 'users', userId, 'billing'],
        queryFn: () => adminBillingApi.getUserBilling(userId),
        staleTime: 30000,
        enabled: !!userId,
    })
}

export function useCreateBilling(userId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateBillingRequest) => adminBillingApi.createBilling(userId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'users', userId, 'billing'] })
        },
    })
}

export function useUpdateBilling() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateBillingRequest }) =>
            adminBillingApi.updateBilling(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
        },
    })
}

export function useDeleteBilling() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => adminBillingApi.deleteBilling(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
        },
    })
}
