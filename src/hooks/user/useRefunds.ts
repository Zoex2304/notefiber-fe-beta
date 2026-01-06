import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { refundService } from '@/api/services/refund/refund.service';
import type { UserRefund, RefundRequestPayload, RefundRequestResponse } from '@/api/services/refund/refund.types';

/**
 * Hook to fetch user's refund request history
 */
export function useRefundHistory() {
    return useQuery<UserRefund[], Error>({
        queryKey: ['user', 'refunds'],
        queryFn: async () => {
            const response = await refundService.getMyRefunds();
            if (!response.success) {
                throw new Error(response.message || 'Failed to fetch refund history');
            }
            return response.data ?? [];
        },
        staleTime: 30000,
    });
}

/**
 * Hook to fetch single refund request details
 */
export function useRefundDetail(id: string) {
    return useQuery<UserRefund, Error>({
        queryKey: ['user', 'refunds', id],
        queryFn: async () => {
            const response = await refundService.getRefund(id);
            if (!response.success || !response.data) {
                throw new Error(response.message || 'Failed to fetch refund details');
            }
            return response.data;
        },
        enabled: !!id,
        staleTime: 30000,
    });
}

/**
 * Hook to request a refund
 */
export function useRequestRefund() {
    const queryClient = useQueryClient();

    return useMutation<RefundRequestResponse, Error, RefundRequestPayload>({
        mutationFn: async (data) => {
            const response = await refundService.requestRefund(data);
            if (!response.success || !response.data) {
                throw new Error(response.message || 'Failed to submit refund request');
            }
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', 'refunds'] });
            queryClient.invalidateQueries({ queryKey: ['subscription'] });
        },
    });
}
