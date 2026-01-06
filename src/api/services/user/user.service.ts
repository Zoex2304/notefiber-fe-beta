import { apiClient } from '../../client';
import { ENDPOINTS } from '../../config/endpoints';
import { type ApiResponse } from '../../types/response.types';
import * as Types from './user.types';

export const userService = {
    getProfile: async (): Promise<ApiResponse<Types.UserProfile>> => {
        const response = await apiClient.get<ApiResponse<Types.UserProfile>>(ENDPOINTS.USER.PROFILE);
        return response.data;
    },

    updateProfile: async (data: Types.UpdateProfileRequest): Promise<ApiResponse<null>> => {
        const response = await apiClient.put<ApiResponse<null>>(ENDPOINTS.USER.PROFILE, data);
        return response.data;
    },

    deleteAccount: async (): Promise<ApiResponse<null>> => {
        const response = await apiClient.delete<ApiResponse<null>>(ENDPOINTS.USER.ACCOUNT);
        return response.data;
    }
};
