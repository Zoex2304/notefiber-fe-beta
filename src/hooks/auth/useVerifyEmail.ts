import { useMutation } from '@tanstack/react-query';
import { authService } from '../../api/services/auth/auth.service';
import { type VerifyEmailRequest } from '../../api/services/auth/auth.types';
import { type ApiResponse } from '../../api/types/response.types';
import { type ApiError } from '../../api/types/error.types';

export const useVerifyEmail = () => {
    return useMutation<ApiResponse<null>, ApiError, VerifyEmailRequest>({
        mutationFn: (data) => authService.verifyEmail(data),
    });
};
