import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminUsersApi } from '@admin/lib/api/admin-api'
import { toaster } from '@admin/hooks/useToaster'

export function useAdminUserCreate() {
    const queryClient = useQueryClient()

    // Single User Mutation
    const createSingle = useMutation({
        mutationFn: async (data: { email: string; full_name: string; role: 'user' | 'admin' }) => {
            // NOTE: Password is not in the form but API requires it if not auto-generated backend.
            // Based on spec: "password": "securePassword123"
            const payload = {
                ...data,
                password: Math.random().toString(36).slice(-8) + 'Aa1!', // Simple temp password
            }
            return adminUsersApi.createUser(payload)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            toaster.success('User created successfully')
        },
        onError: (error: any) => {
            toaster.error(error.message || 'Failed to create user')
        }
    })

    // Bulk Upload Mutation
    const createBulk = useMutation({
        mutationFn: async (file: File) => {
            return adminUsersApi.bulkCreateUsers(file)
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            const result = response.data

            if (result.failed_count > 0) {
                toaster.warning(`Bulk import: ${result.created_count} created, ${result.failed_count} failed`)
                console.error('Bulk import failures:', result.results.filter((r: any) => !r.success))
            } else {
                toaster.success(`Successfully imported ${result.created_count} users`)
            }
        },
        onError: (error: any) => {
            toaster.error(error.message || 'Failed to process bulk upload')
        }
    })

    return {
        createSingle,
        createBulk
    }
}
