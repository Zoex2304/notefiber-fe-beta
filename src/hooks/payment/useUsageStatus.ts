import { useQuery } from '@tanstack/react-query';
import { paymentService } from '../../api/services/payment/payment.service';
import { type UsageStatus } from '../../api/services/payment/payment.types';
import { type ApiResponse } from '../../api/types/response.types';
import { type ApiError } from '../../api/types/error.types';

/**
 * Hook to fetch user's current usage status
 * Uses GET /api/user/usage-status (auth required)
 * @param options.enabled - Set to false to disable the query (e.g., when not authenticated)
 */
export const useUsageStatus = (options?: { refetchInterval?: number; enabled?: boolean }) => {
    return useQuery<ApiResponse<UsageStatus>, ApiError>({
        queryKey: ['user', 'usage-status'],
        queryFn: () => paymentService.getUsageStatus(),
        refetchInterval: options?.enabled !== false ? (options?.refetchInterval || 30000) : false, // Default: refetch every 30s
        staleTime: 10000, // Consider data stale after 10s
        enabled: options?.enabled !== false, // Only run when enabled (default true)
    });
};


/**
 * Helper hook for checking if user can perform an action
 * @param options.enabled - Set to false to disable the query (e.g., when not authenticated)
 */
export const useCanUseFeature = (options?: { enabled?: boolean }) => {
    const { data, isLoading, refetch } = useUsageStatus({ enabled: options?.enabled });
    const usage = data?.data;

    return {
        isLoading,
        refetch,
        // Storage checks
        canCreateNotebook: () => usage?.storage.notebooks.can_use ?? false,
        canCreateNote: () => usage?.storage.notes.can_use ?? false,
        // Daily limit checks
        canUseAiChat: () => usage?.daily.ai_chat.can_use ?? false,
        canUseSemanticSearch: () => usage?.daily.semantic_search.can_use ?? false,
        // Upgrade check
        upgradeAvailable: usage?.upgrade_available ?? false,
        // Raw usage data
        storage: usage?.storage,
        daily: usage?.daily,
        plan: usage?.plan,
    };
};
