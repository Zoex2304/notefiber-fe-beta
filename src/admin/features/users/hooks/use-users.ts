import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminUsersApi } from '@admin/lib/api/admin-api'
import type { UserListParams, UpdateUserRequest } from '@admin/lib/types/admin-api'
import { toaster } from '@admin/hooks/useToaster'

// Keys
export const userKeys = {
    all: ['users'] as const,
    lists: () => [...userKeys.all, 'list'] as const,
    list: (params: UserListParams) => [...userKeys.lists(), params] as const,
    details: () => [...userKeys.all, 'detail'] as const,
    detail: (id: string) => [...userKeys.details(), id] as const,
}

// Queries
export function useUsers(params: UserListParams) {
    return useQuery({
        queryKey: userKeys.list(params),
        queryFn: () => adminUsersApi.getUsers(params),
    })
}

export function useUser(userId: string) {
    return useQuery({
        queryKey: userKeys.detail(userId),
        queryFn: () => adminUsersApi.getUserDetail(userId),
        enabled: !!userId,
    })
}

// Mutations
export function useUpdateUserStatus() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            id,
            status,
            reason,
        }: {
            id: string
            status: 'active' | 'pending' | 'banned'
            reason?: string
        }) => adminUsersApi.updateUserStatus(id, status, reason),
        onSuccess: () => {
            toaster.success('User status updated successfully')
            queryClient.invalidateQueries({ queryKey: userKeys.all })
        },
        onError: (error) => {
            toaster.error('Failed to update user status')
            console.error(error)
        },
    })
}

export function useUpdateUserProfile() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
            adminUsersApi.updateUserProfile(id, data),
        onSuccess: () => {
            toaster.success('User profile updated successfully')
            queryClient.invalidateQueries({ queryKey: userKeys.all })
        },
        onError: (error) => {
            toaster.error('Failed to update user profile')
            console.error(error)
        },
    })
}

export function useDeleteUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => adminUsersApi.deleteUser(id),
        onSuccess: () => {
            toaster.success('User deleted successfully')
            queryClient.invalidateQueries({ queryKey: userKeys.all })
        },
        onError: (error) => {
            toaster.error('Failed to delete user')
            console.error(error)
        },
    })
}

export function usePurgeUsers() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (ids: string[]) => adminUsersApi.purgeUsers({ user_ids: ids }),
        onSuccess: (data) => {
            const failed = data.failed_users?.length || 0
            if (failed > 0) {
                toaster.warning(`Purged ${data.deleted_count} users with ${failed} errors`)
            } else {
                toaster.success(`Successfully purged ${data.deleted_count} users`)
            }
            queryClient.invalidateQueries({ queryKey: userKeys.all })
        },
        onError: (error) => {
            toaster.error('Failed to purge users')
            console.error(error)
        },
    })
}
