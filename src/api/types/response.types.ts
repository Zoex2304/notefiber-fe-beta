/**
 * API Response Wrappers
 */

export interface ApiResponse<T = null> {
    success: boolean;
    code: number;
    message: string;
    data: T;
}
