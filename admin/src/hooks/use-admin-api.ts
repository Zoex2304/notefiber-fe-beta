import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toaster } from '@admin/hooks/useToaster'
import {
    adminDashboardApi,
    adminPlansApi,
    adminPlanFeaturesApi,
    adminFeaturesApi,
    adminUsersApi,
    adminRefundsApi,
    handleApiError,
} from '../lib/api/admin-api'
import type {
    CreatePlanRequest,
    UpdatePlanRequest,
    RefundRequest,
    TransactionListParams,
    UpgradeSubscriptionRequest,
    UpgradeSubscriptionRequest,
    CreatePlanDisplayFeatureRequest,
    UpdatePlanDisplayFeatureRequest,
    CreateFeatureRequest,
    UpdateFeatureRequest,
} from '../lib/types/admin-api'

// Query keys
export const adminQueryKeys = {
    dashboard: ['admin', 'dashboard'] as const,
    growth: ['admin', 'growth'] as const,
    transactions: (params?: TransactionListParams) => ['admin', 'transactions', params] as const,
    plans: ['admin', 'plans'] as const,
    plan: (id: string) => ['admin', 'plans', id] as const,
    planFeatures: (planId: string) => ['admin', 'plans', planId, 'features'] as const,
    features: ['admin', 'features'] as const,
    userDetail: (id: string) => ['admin', 'users', id] as const,
}

// Dashboard Hooks
export function useDashboardStats(options?: { refetchInterval?: number }) {
    return useQuery({
        queryKey: adminQueryKeys.dashboard,
        queryFn: () => adminDashboardApi.getStats(),
        refetchInterval: options?.refetchInterval || false,
    })
}

export function useUserGrowthStats() {
    return useQuery({
        queryKey: adminQueryKeys.growth,
        queryFn: () => adminDashboardApi.getGrowthStats(),
    })
}

export function useTransactions(params: TransactionListParams = { page: 1, limit: 10 }) {
    return useQuery({
        queryKey: adminQueryKeys.transactions(params),
        queryFn: () => adminDashboardApi.getTransactions(params),
    })
}

// Subscription Plans Hooks
export function useSubscriptionPlans() {
    return useQuery({
        queryKey: adminQueryKeys.plans,
        queryFn: () => adminPlansApi.getPlans(),
    })
}

export function useSubscriptionPlan(id: string) {
    return useQuery({
        queryKey: adminQueryKeys.plan(id),
        queryFn: () => adminPlansApi.getPlan(id),
        enabled: !!id,
    })
}

export function useCreatePlan() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreatePlanRequest) => adminPlansApi.createPlan(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.plans })
            toaster.success('Subscription plan created successfully')
        },
        onError: (error) => {
            toaster.error(`Failed to create plan: ${handleApiError(error)}`)
        },
    })
}

export function useUpdatePlan() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdatePlanRequest }) =>
            adminPlansApi.updatePlan(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.plans })
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.plan(variables.id) })
            toaster.success('Subscription plan updated successfully')
        },
        onError: (error) => {
            toaster.error(`Failed to update plan: ${handleApiError(error)}`)
        },
    })
}

export function useDeletePlan() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => adminPlansApi.deletePlan(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.plans })
            toaster.success('Subscription plan deleted successfully')
        },
        onError: (error) => {
            toaster.error(`Failed to delete plan: ${handleApiError(error)}`)
        },
    })
}

// User Detail Hook
export function useUserDetail(userId: string) {
    return useQuery({
        queryKey: adminQueryKeys.userDetail(userId),
        queryFn: () => adminUsersApi.getUserDetail(userId),
        enabled: !!userId,
    })
}

// Refund Hook
export function useProcessRefund() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: RefundRequest) => adminRefundsApi.processRefund(data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboard })
            toaster.success(`Refund processed successfully. Refund ID: ${response.refund_id}`)
        },
        onError: (error) => {
            toaster.error(`Failed to process refund: ${handleApiError(error)}`)
        },
    })
}

// Subscription Upgrade Hook
export function useUpgradeSubscription() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: UpgradeSubscriptionRequest) => adminRefundsApi.upgradeSubscription(data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboard })
            toaster.success(`Subscription upgraded. New ID: ${response.new_subscription_id}`)
        },
        onError: (error) => {
            toaster.error(`Failed to upgrade subscription: ${handleApiError(error)}`)
        },
    })
}

// Master Features Hooks
export function useFeatures() {
    return useQuery({
        queryKey: adminQueryKeys.features,
        queryFn: () => adminFeaturesApi.getFeatures(),
    })
}

export function useCreateFeature() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateFeatureRequest) => adminFeaturesApi.createFeature(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.features })
            toaster.success('Feature created successfully')
        },
        onError: (error) => {
            toaster.error(`Failed to create feature: ${handleApiError(error)}`)
        },
    })
}

export function useUpdateFeature() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateFeatureRequest }) =>
            adminFeaturesApi.updateFeature(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.features })
            toaster.success('Feature updated successfully')
        },
        onError: (error) => {
            toaster.error(`Failed to update feature: ${handleApiError(error)}`)
        },
    })
}

export function useDeleteFeature() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => adminFeaturesApi.deleteFeature(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.features })
            toaster.success('Feature deleted successfully')
        },
        onError: (error) => {
            toaster.error(`Failed to delete feature: ${handleApiError(error)}`)
        },
    })
}

// Plan Display Features Hooks
export function usePlanFeatures(planId: string) {
    return useQuery({
        queryKey: adminQueryKeys.planFeatures(planId),
        queryFn: () => adminPlanFeaturesApi.getFeatures(planId),
        enabled: !!planId,
    })
}

export function useAssignFeature() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ planId, featureKey }: { planId: string; featureKey: string }) =>
            adminPlanFeaturesApi.assignFeature(planId, featureKey),
        onSuccess: (_, { planId }) => {
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.planFeatures(planId) })
            toaster.success('Feature assigned successfully')
        },
        onError: (error) => {
            toaster.error(`Failed to assign feature: ${handleApiError(error)}`)
        },
    })
}

export function useRemoveFeature() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ planId, featureId }: { planId: string; featureId: string }) =>
            adminPlanFeaturesApi.removeFeature(planId, featureId),
        onSuccess: (_, { planId }) => {
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.planFeatures(planId) })
            toaster.success('Feature removed successfully')
        },
        onError: (error) => {
            toaster.error(`Failed to remove feature: ${handleApiError(error)}`)
        },
    })
}
