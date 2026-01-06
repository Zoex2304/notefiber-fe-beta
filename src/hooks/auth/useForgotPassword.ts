import { useMutation } from '@tanstack/react-query';
import { authService } from '../../api/services/auth/auth.service';
import { type ForgotPasswordRequest } from '../../api/services/auth/auth.types';
import { type ApiResponse } from '../../api/types/response.types';
import { type ApiError } from '../../api/types/error.types';

export const useForgotPassword = () => {
    return useMutation<ApiResponse<null>, ApiError, ForgotPasswordRequest>({
        mutationFn: (data) => authService.forgotPassword(data),
    });
};
