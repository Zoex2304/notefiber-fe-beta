import { apiClient } from '../../client';
import { ENDPOINTS } from '../../config/endpoints';
import { type ApiResponse } from '../../types/response.types';
import type { RefundRequestPayload, RefundRequestResponse, UserRefund } from './refund.types';

export const refundService = {
    /**
     * Submit a new refund request for a subscription
     */
    requestRefund: async (payload: RefundRequestPayload): Promise<ApiResponse<RefundRequestResponse>> => {
        const response = await apiClient.post<ApiResponse<RefundRequestResponse>>(
            ENDPOINTS.REFUND.REQUEST,
            payload
        );
        return response.data;
    },

    /**
     * Get list of user's own refund requests
     */
    getMyRefunds: async (): Promise<ApiResponse<UserRefund[]>> => {
        const response = await apiClient.get<ApiResponse<UserRefund[]>>(ENDPOINTS.REFUND.LIST);
        return response.data;
    },

    /**
     * Get single refund request details
     */
    getRefund: async (id: string): Promise<ApiResponse<UserRefund>> => {
        const response = await apiClient.get<ApiResponse<UserRefund>>(ENDPOINTS.REFUND.DETAIL(id));
        return response.data;
    },
};
