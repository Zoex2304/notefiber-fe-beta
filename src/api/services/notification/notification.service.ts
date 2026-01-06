import { apiClient } from '../../client';
import { ENDPOINTS } from '../../config/endpoints';
import { type ApiResponse } from '../../types/response.types';
import type {
    NotificationListResponse,
    UnreadCountResponse,
    MarkReadResponse,
} from './notification.types';

export const notificationService = {
    /**
     * Get paginated notification history
     */
    getNotifications: async (
        limit: number = 20,
        offset: number = 0
    ): Promise<ApiResponse<NotificationListResponse>> => {
        const response = await apiClient.get<ApiResponse<NotificationListResponse>>(
            ENDPOINTS.NOTIFICATIONS.LIST,
            { params: { limit, offset } }
        );
        return response.data;
    },

    /**
     * Get unread notification count for badge
     */
    getUnreadCount: async (): Promise<ApiResponse<UnreadCountResponse>> => {
        const response = await apiClient.get<ApiResponse<UnreadCountResponse>>(
            ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT
        );
        return response.data;
    },

    /**
     * Mark a single notification as read
     */
    markAsRead: async (id: string): Promise<ApiResponse<MarkReadResponse>> => {
        const endpoint = ENDPOINTS.NOTIFICATIONS.MARK_READ.replace(':id', id);
        const response = await apiClient.patch<ApiResponse<MarkReadResponse>>(endpoint);
        return response.data;
    },

    /**
     * Mark all notifications as read
     */
    markAllAsRead: async (): Promise<ApiResponse<MarkReadResponse>> => {
        const response = await apiClient.patch<ApiResponse<MarkReadResponse>>(
            ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ
        );
        return response.data;
    },
};
