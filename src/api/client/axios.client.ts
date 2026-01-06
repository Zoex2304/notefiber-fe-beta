import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { API_CONFIG } from '../config/api.config';
import { API_CONSTANTS } from '../../constants/api.constants';
import { tokenStorage } from '../../utils/storage/token.storage';

// Create a custom event for 403 errors
export const UPGRADE_EVENT = 'TRIGGER_UPGRADE_MODAL';

export const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    headers: API_CONFIG.HEADERS,
    timeout: API_CONSTANTS.TIMEOUT,
    withCredentials: true, // Important for CORS
});

// Request Interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const token = tokenStorage.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        if (error.response?.status === 403) {
            // Dispatch event to open Upgrade Modal
            window.dispatchEvent(new Event(UPGRADE_EVENT));
        }
        return Promise.reject(error);
    }
);

export const apiClient = axiosInstance; // Ensure we export as apiClient if that's what's used
