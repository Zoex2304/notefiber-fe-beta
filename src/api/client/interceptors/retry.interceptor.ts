import axiosRetry from 'axios-retry';
import { type AxiosInstance } from 'axios';
import { API_CONSTANTS } from '../../../constants/api.constants';

export const configureRetryInterceptor = (axiosInstance: AxiosInstance) => {
    axiosRetry(axiosInstance, {
        retries: API_CONSTANTS.RETRY_COUNT,
        retryDelay: axiosRetry.exponentialDelay,
        retryCondition: (error) => {
            // Retry on network errors or 5xx status codes
            return axiosRetry.isNetworkOrIdempotentRequestError(error) || (error.response?.status ? error.response.status >= 500 : false);
        },
    });
};
