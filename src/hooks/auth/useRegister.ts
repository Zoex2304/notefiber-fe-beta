import { useMutation } from '@tanstack/react-query';
import { authService } from '../../api/services/auth/auth.service';
import { type RegisterRequest, type RegisterData } from '../../api/services/auth/auth.types';
import { type ApiResponse } from '../../api/types/response.types';
import { type ApiError } from '../../api/types/error.types';

export const useRegister = () => {
    return useMutation<ApiResponse<RegisterData>, ApiError, RegisterRequest>({
        mutationFn: (data) => authService.register(data),
    });
};
