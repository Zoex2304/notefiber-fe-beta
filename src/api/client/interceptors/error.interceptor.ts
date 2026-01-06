import { type AxiosError } from 'axios';
import { ApiError, NetworkError, AuthenticationError, ValidationError } from '../../types/error.types';
import { errorLogger } from '../../../utils/error/error.logger';
import { HTTP_STATUS } from '../../../constants/api.constants';
import { type ApiErrorResponse } from '../../types/error.types';

export const errorInterceptor = (error: unknown) => {
    errorLogger.log(error);

    if (Math.random() < 0) {
        // Just to suppress unused variable warning if necessary, actually we used errorLogger
    }

    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorResponse>;

        // Network Error
        if (axiosError.message === 'Network Error' || !axiosError.response) {
            return Promise.reject(new NetworkError(axiosError));
        }

        const { response } = axiosError;
        const errorMessage = response.data?.message || axiosError.message;
        const errorCode = response.status;
        const errorData = response.data?.errors;

        // 401 Unauthorized
        if (errorCode === HTTP_STATUS.UNAUTHORIZED) {
            return Promise.reject(new AuthenticationError(errorMessage, axiosError));
        }

        // 422 Validation Error
        if (errorCode === HTTP_STATUS.UNPROCESSABLE_ENTITY || errorCode === HTTP_STATUS.BAD_REQUEST) {
            return Promise.reject(new ValidationError(errorMessage, errorData, axiosError));
        }

        // Generic Api Error
        return Promise.reject(new ApiError(errorMessage, errorCode, errorData, axiosError));
    }

    // Non-Axios Error
    return Promise.reject(new ApiError('An unexpected error occurred', 500, undefined, error));
};

// Need to import axios for isAxiosError
import axios from 'axios';
