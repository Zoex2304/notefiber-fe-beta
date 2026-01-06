import { useQuery } from '@tanstack/react-query';
import { paymentService } from '../../api/services/payment/payment.service';
import { type Plan } from '../../api/services/payment/payment.types';
import { type ApiResponse } from '../../api/types/response.types';
import { type ApiError } from '../../api/types/error.types';

export const useSubscriptionPlans = () => {
    return useQuery<ApiResponse<Plan[]>, ApiError>({
        queryKey: ['payment', 'plans'],
        queryFn: () => paymentService.getPlans(),
    });
};
