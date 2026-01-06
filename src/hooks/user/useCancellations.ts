import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cancellationService } from '@/api/services/cancellation/cancellation.service';
import type {
    UserCancellationRequest,
    UserCancellationResponse,
    UserCancellationListItem,
} from '@/api/services/cancellation/cancellation.types';

/**
 * Hook to fetch user's cancellation request history
 */
export function useCancellationHistory() {
    return useQuery<UserCancellationListItem[], Error>({
        queryKey: ['user', 'cancellations'],
        queryFn: async () => {
            const response = await cancellationService.getCancellationHistory();
            if (!response.success) {
                throw new Error(response.message || 'Failed to fetch cancellation history');
            }
            return response.data ?? [];
        },
        staleTime: 30000, // 30 seconds
    });
}

/**
 * Hook to request a subscription cancellation
 */
export function useRequestCancellation() {
    const queryClient = useQueryClient();

    return useMutation<UserCancellationResponse, Error, UserCancellationRequest>({
        mutationFn: async (data) => {
            const response = await cancellationService.requestCancellation(data);
            if (!response.success || !response.data) {
                throw new Error(response.message || 'Failed to submit cancellation request');
            }
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', 'cancellations'] });
            queryClient.invalidateQueries({ queryKey: ['subscription'] });
        },
    });
}

/**
 * Hook to fetch single cancellation request details
 */
export function useCancellationDetail(id: string) {
    return useQuery<UserCancellationListItem, Error>({
        queryKey: ['user', 'cancellations', id],
        queryFn: async () => {
            const response = await cancellationService.getCancellation(id);
            if (!response.success || !response.data) {
                throw new Error(response.message || 'Failed to fetch cancellation details');
            }
            return response.data;
        },
        enabled: !!id,
        staleTime: 30000,
    });
}
