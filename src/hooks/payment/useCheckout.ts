import { useMutation } from '@tanstack/react-query';
import { paymentService } from '../../api/services/payment/payment.service';
import { type CheckoutRequest, type CheckoutResponse } from '../../api/services/payment/payment.types';
import { type ApiResponse } from '../../api/types/response.types';
import { type ApiError } from '../../api/types/error.types';

export const useCheckout = () => {
    return useMutation<ApiResponse<CheckoutResponse>, ApiError, CheckoutRequest>({
        mutationFn: (data) => paymentService.checkout(data),
    });
};
