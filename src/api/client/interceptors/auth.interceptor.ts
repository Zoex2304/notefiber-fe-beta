import { type InternalAxiosRequestConfig, type AxiosError } from 'axios';
import { tokenStorage } from '../../../utils/storage/token.storage';
import { API_CONSTANTS } from '../../../constants/api.constants';

export const authRequestInterceptor = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = tokenStorage.getToken();

    if (token && config.headers) {
        config.headers[API_CONSTANTS.HEADER_AUTH] = `${API_CONSTANTS.TOKEN_PREFIX} ${token}`;
    }

    return config;
};

export const authResponseErrorInterceptor = async (error: AxiosError) => {
    // This is handled by axios-auth-refresh logic or custom logic in error interceptor
    // Just a placeholder if we need strictly auth specific logic separated
    return Promise.reject(error);
};
