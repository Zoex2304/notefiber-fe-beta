/**
 * Error Mapper
 * Transforms various error types into user-friendly messages
 */

import { ApiError, NetworkError, AuthenticationError, ValidationError } from '../../api/types/error.types';
import { HTTP_STATUS } from '../../constants/api.constants';

export const errorMapper = {
    toMessage: (error: unknown): string => {
        if (typeof error === 'string') return error;

        if (error instanceof NetworkError) {
            return 'Unable to connect to the server. Please check your internet connection.';
        }

        if (error instanceof AuthenticationError) {
            return 'Your session has expired. Please login again.';
        }

        if (error instanceof ValidationError) {
            // Return the first validation error message if available
            if (error.errors) {
                const firstField = Object.keys(error.errors)[0];
                if (firstField && error.errors[firstField]?.length > 0) {
                    return error.errors[firstField][0];
                }
            }
            return error.message || 'Please check your input.';
        }

        if (error instanceof ApiError) {
            if (error.code === HTTP_STATUS.INTERNAL_SERVER_ERROR) {
                return 'Something went wrong on our end. Please try again later.';
            }
            return error.message;
        }

        if (error instanceof Error) {
            return error.message;
        }

        return 'An unexpected error occurred.';
    }
};
