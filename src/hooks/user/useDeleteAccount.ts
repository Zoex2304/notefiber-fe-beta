import { useMutation } from '@tanstack/react-query';
import { userService } from '../../api/services/user/user.service';
import { type ApiResponse } from '../../api/types/response.types';
import { type ApiError } from '../../api/types/error.types';
import { useAuth } from '../auth/useAuth';

export const useDeleteAccount = () => {
    const { logout } = useAuth();

    return useMutation<ApiResponse<null>, ApiError>({
        mutationFn: () => userService.deleteAccount(),
        onSuccess: () => {
            logout();
        },
    });
};
