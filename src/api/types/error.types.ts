/**
 * API Error Types
 */

export interface ApiErrorResponse {
    success: false;
    code: number;
    message: string;
    errors?: Record<string, string[]>; // Validation errors
}

export class ApiError extends Error {
    readonly code: number;
    readonly errors?: Record<string, string[]>;
    readonly originalError?: unknown;

    constructor(message: string, code: number = 500, errors?: Record<string, string[]>, originalError?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.code = code;
        this.errors = errors;
        this.originalError = originalError;
    }
}

export class NetworkError extends ApiError {
    constructor(originalError?: unknown) {
        super('Network error occurred. Please check your connection.', 0, undefined, originalError);
        this.name = 'NetworkError';
    }
}

export class AuthenticationError extends ApiError {
    constructor(message = 'Authentication required', originalError?: unknown) {
        super(message, 401, undefined, originalError);
        this.name = 'AuthenticationError';
    }
}

export class ValidationError extends ApiError {
    constructor(message = 'Validation failed', errors?: Record<string, string[]>, originalError?: unknown) {
        super(message, 422, errors, originalError);
        this.name = 'ValidationError';
    }
}
