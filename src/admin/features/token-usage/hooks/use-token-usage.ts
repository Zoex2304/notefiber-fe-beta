import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ADMIN_ENDPOINTS } from '@admin/config/admin-endpoints';
import type { TokenUsageResponse, TokenUsageParams, TokenUsageItem } from '../types';

// Create admin API client
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

export function useTokenUsage(params: TokenUsageParams = {}) {
    return useQuery<TokenUsageItem[]>({
        queryKey: ['admin', 'token-usage', params],
        queryFn: async () => {
            const response = await apiClient.get<TokenUsageResponse>(
                ADMIN_ENDPOINTS.TOKEN_USAGE.LIST,
                { params }
            );
            return response.data.data;
        },
    });
}
