import { useQuery } from '@tanstack/react-query';
import { userService } from '../../api/services/user/user.service';
import { type UserProfile } from '../../api/services/user/user.types';
import { type ApiResponse } from '../../api/types/response.types';
import { type ApiError } from '../../api/types/error.types';

export const useUserProfile = (enabled = true) => {
    return useQuery<ApiResponse<UserProfile>, ApiError>({
        queryKey: ['user', 'profile'],
        queryFn: () => userService.getProfile(),
        enabled,
    });
};
