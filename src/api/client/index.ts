import { axiosInstance } from './axios.client';
import { authRequestInterceptor } from './interceptors/auth.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';
import { configureRetryInterceptor } from './interceptors/retry.interceptor';
import createAuthRefreshInterceptor from 'axios-auth-refresh';
import { HTTP_STATUS } from '../../constants/api.constants';

import { AxiosError } from 'axios';

// Register Request Interceptors
axiosInstance.interceptors.request.use(authRequestInterceptor, Promise.reject);

// Register Response Interceptors
axiosInstance.interceptors.response.use(
    (response) => response, // Pass through successful responses
    errorInterceptor // Global error handler
);

// Register Retry Logic
configureRetryInterceptor(axiosInstance);

// Register Auth Refresh Logic (using axios-auth-refresh)
// Note: Logic for refresh token would go here. For now we just reject.
const refreshAuthLogic = (failedRequest: AxiosError) => {
    // Placeholder: Implement actual refresh logic here
    return Promise.reject(failedRequest);
};

createAuthRefreshInterceptor(axiosInstance, refreshAuthLogic, {
    statusCodes: [HTTP_STATUS.UNAUTHORIZED, HTTP_STATUS.FORBIDDEN],
    pauseInstanceWhileRefreshing: true,
});

export { axiosInstance as apiClient };
