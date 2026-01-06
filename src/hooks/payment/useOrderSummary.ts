import { useQuery } from '@tanstack/react-query';
import { paymentService } from '@/api/services/payment/payment.service';
import { type ApiResponse } from '@/api/types/response.types';
import { type OrderSummaryResponse } from '@/api/services/payment/payment.types';
import { type ApiError } from '@/api/types/error.types';

export const useOrderSummary = (planId: string | undefined) => {
    return useQuery<ApiResponse<OrderSummaryResponse>, ApiError>({
        queryKey: ['payment', 'summary', planId],
        queryFn: () => {
            if (!planId) throw new Error("Plan ID is required");
            return paymentService.getOrderSummary(planId);
        },
        enabled: !!planId,
    });
};
