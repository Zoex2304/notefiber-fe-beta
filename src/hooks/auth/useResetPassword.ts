import { useMutation } from '@tanstack/react-query';
import { authService } from '../../api/services/auth/auth.service';
import { type ResetPasswordRequest } from '../../api/services/auth/auth.types';
import { type ApiResponse } from '../../api/types/response.types';
import { type ApiError } from '../../api/types/error.types';

export const useResetPassword = () => {
    return useMutation<ApiResponse<null>, ApiError, ResetPasswordRequest>({
        mutationFn: (data) => authService.resetPassword(data),
    });
};
