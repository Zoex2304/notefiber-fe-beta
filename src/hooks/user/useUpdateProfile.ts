import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../api/services/user/user.service';
import { type UpdateProfileRequest } from '../../api/services/user/user.types';
import { type ApiResponse } from '../../api/types/response.types';
import { type ApiError } from '../../api/types/error.types';

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation<ApiResponse<null>, ApiError, UpdateProfileRequest>({
        mutationFn: (data) => userService.updateProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
        },
    });
};
