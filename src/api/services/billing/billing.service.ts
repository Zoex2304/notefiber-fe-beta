import { apiClient } from '../../client';
import { ENDPOINTS } from '../../config/endpoints';
import { type ApiResponse } from '../../types/response.types';
import type { UserBillingResponse, UserBillingUpdateRequest } from './billing.types';

export const billingService = {
    /**
     * Get current user's billing information
     */
    getBilling: async (): Promise<ApiResponse<UserBillingResponse>> => {
        const response = await apiClient.get<ApiResponse<UserBillingResponse>>(ENDPOINTS.USER.BILLING);
        return response.data;
    },

    /**
     * Update user's billing information
     */
    updateBilling: async (data: UserBillingUpdateRequest): Promise<ApiResponse<UserBillingResponse>> => {
        const response = await apiClient.put<ApiResponse<UserBillingResponse>>(ENDPOINTS.USER.BILLING, data);
        return response.data;
    },
};
