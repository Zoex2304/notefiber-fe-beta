import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billingService } from '@/api/services/billing/billing.service';
import type { UserBillingResponse, UserBillingUpdateRequest } from '@/api/services/billing/billing.types';

/**
 * Hook to fetch user's billing information
 */
export function useBillingInfo() {
    return useQuery<UserBillingResponse, Error>({
        queryKey: ['user', 'billing'],
        queryFn: async () => {
            const response = await billingService.getBilling();
            if (!response.success || !response.data) {
                throw new Error(response.message || 'Failed to fetch billing info');
            }
            return response.data;
        },
        staleTime: 60000, // 1 minute
        retry: 1,
    });
}

/**
 * Hook to update user's billing information
 */
export function useUpdateBilling() {
    const queryClient = useQueryClient();

    return useMutation<UserBillingResponse, Error, UserBillingUpdateRequest>({
        mutationFn: async (data) => {
            const response = await billingService.updateBilling(data);
            if (!response.success || !response.data) {
                throw new Error(response.message || 'Failed to update billing info');
            }
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', 'billing'] });
        },
    });
}
