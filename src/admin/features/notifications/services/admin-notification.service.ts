/**
 * Admin Notification Service
 * 
 * Service layer for admin notification API calls.
 * Follows service-based architecture with clean separation.
 */

import axios from 'axios';
import type {
    AdminNotification,
    AdminNotificationListResponse,
    AdminUnreadCountResponse,
} from '@admin/lib/types/notification.types';

// API Configuration (matches admin-api.ts pattern)
const envUrl = import.meta.env.VITE_API_BASE_URL || 'https://notefiber-be-beta-production.up.railway.app';
const API_BASE_URL = envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const ENDPOINTS = {
    LIST: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
} as const;

export const adminNotificationService = {
    /**
     * Fetch paginated list of notifications
     */
    async getNotifications(limit = 20, offset = 0): Promise<AdminNotification[]> {
        const response = await apiClient.get<AdminNotificationListResponse>(
            ENDPOINTS.LIST,
            { params: { limit, offset } }
        );
        return response.data.data ?? [];
    },

    /**
     * Get unread notification count
     */
    async getUnreadCount(): Promise<number> {
        const response = await apiClient.get<AdminUnreadCountResponse>(ENDPOINTS.UNREAD_COUNT);
        return response.data.count;
    },

    /**
     * Mark a single notification as read
     */
    async markAsRead(id: string): Promise<void> {
        await apiClient.patch(ENDPOINTS.MARK_READ(id));
    },

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(): Promise<void> {
        await apiClient.patch(ENDPOINTS.MARK_ALL_READ);
    },
};
