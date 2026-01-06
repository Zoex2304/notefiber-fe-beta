/**
 * AI Limit Management Service
 * 
 * Service layer for admin AI limit management API.
 * Single responsibility: HTTP calls for AI limit operations.
 */

import axios from 'axios';
import type {
    TokenUsageItem,
    TokenUsageApiResponse,
    UpdateAiLimitRequest,
    UpdateAiLimitResponse,
    BulkUpdateAiLimitRequest,
    BulkResetAiLimitRequest,
    BulkAiLimitResponse,
} from '../types';

// API client setup
const envUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const API_BASE_URL = envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Base endpoint
const ENDPOINT = '/admin/token-usage';

/**
 * AI Limit Management Service
 */
export const aiLimitService = {
    /**
     * Get list of all users with AI usage stats
     */
    async getTokenUsage(page = 1, limit = 20): Promise<TokenUsageItem[]> {
        const response = await apiClient.get<TokenUsageApiResponse<TokenUsageItem[]>>(
            ENDPOINT,
            { params: { page, limit } }
        );
        return response.data.data ?? [];
    },

    /**
     * Update a single user's AI usage count
     * @param userId - User UUID
     * @param usage - Chat and/or Search usage to update
     */
    async updateUserUsage(userId: string, usage: { chat?: number; search?: number }): Promise<UpdateAiLimitResponse> {
        const payload: UpdateAiLimitRequest = {
            ai_chat_daily_usage: usage.chat,
            semantic_search_daily_usage: usage.search
        };
        const response = await apiClient.put<TokenUsageApiResponse<UpdateAiLimitResponse>>(
            `${ENDPOINT}/${userId}`,
            payload
        );
        return response.data.data;
    },

    /**
     * Reset a single user's usage to 0
     * @param userId - User UUID
     */
    async resetUserUsage(userId: string): Promise<UpdateAiLimitResponse> {
        const response = await apiClient.delete<TokenUsageApiResponse<UpdateAiLimitResponse>>(
            `${ENDPOINT}/${userId}`
        );
        return response.data.data;
    },

    /**
     * Bulk update AI usage for multiple users
     * @param userIds - Array of user UUIDs
     * @param usage - Chat and/or Search usage
     */
    async bulkUpdateUsage(userIds: string[], usage: { chat?: number; search?: number }): Promise<BulkAiLimitResponse> {
        const payload: BulkUpdateAiLimitRequest = {
            user_ids: userIds,
            ai_chat_daily_usage: usage.chat,
            semantic_search_daily_usage: usage.search,
        };
        const response = await apiClient.post<TokenUsageApiResponse<BulkAiLimitResponse>>(
            `${ENDPOINT}/bulk`,
            payload
        );
        return response.data.data;
    },

    /**
     * Bulk reset AI usage to 0 for multiple users
     * @param userIds - Array of user UUIDs
     */
    async bulkResetUsage(userIds: string[]): Promise<BulkAiLimitResponse> {
        const payload: BulkResetAiLimitRequest = { user_ids: userIds };
        const response = await apiClient.delete<TokenUsageApiResponse<BulkAiLimitResponse>>(
            `${ENDPOINT}/bulk`,
            { data: payload }
        );
        return response.data.data;
    },
};
