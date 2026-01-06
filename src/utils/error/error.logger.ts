/**
 * Error Logger
 * Helper to log errors to console or monitoring service
 */

import { ApiError } from '../../api/types/error.types';

export const errorLogger = {
    log: (error: unknown, context?: Record<string, unknown>) => {
        if (process.env.NODE_ENV === 'development') {
            console.group('🚨 Error Occurred');
            console.error(error);
            if (context) {
                console.info('Context:', context);
            }
            if (error instanceof ApiError) {
                console.info('Code:', error.code);
                console.info('Original Error:', error.originalError);
            }
            console.groupEnd();
        }
        // In production, you would send this to Sentry/Datadog
    },

    warn: (message: string, context?: Record<string, unknown>) => {
        if (process.env.NODE_ENV === 'development') {
            console.warn(message, context);
        }
    }
};
