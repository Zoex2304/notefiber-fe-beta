/**
 * AI Limit Management Types
 * 
 * Type definitions for admin AI limit management feature.
 * Based on backend API specification v1.3.4 (Decoupled Usage)
 */

// ========== Request Types ==========

/**
 * Request body for updating single user's AI usage
 */
export interface UpdateAiLimitRequest {
    /** Target chat usage value. */
    ai_chat_daily_usage?: number;
    /** Target semantic search usage value. */
    semantic_search_daily_usage?: number;
}

/**
 * Request body for bulk updating multiple users
 */
export interface BulkUpdateAiLimitRequest {
    user_ids: string[];
    /** Target chat usage value. */
    ai_chat_daily_usage?: number;
    /** Target semantic search usage value. */
    semantic_search_daily_usage?: number;
}

/**
 * Request body for bulk resetting users to 0 usage
 */
export interface BulkResetAiLimitRequest {
    user_ids: string[];
}

/**
 * Common list params
 */
export interface TokenUsageParams {
    page?: number;
    limit?: number;
    q?: string;
    sort?: string;
}

// ========== Response Types ==========

/**
 * Single user token usage item
 */
export interface TokenUsageItem {
    user_id: string;
    email: string;
    full_name?: string;
    plan_name: string;

    // Chat
    ai_chat_daily_usage: number;
    ai_chat_daily_limit: number;
    ai_chat_daily_remaining: number;

    // Search
    semantic_search_daily_usage: number;
    semantic_search_daily_limit: number;
    semantic_search_daily_remaining: number;

    // Metadata
    ai_daily_usage_last_reset: string;
    semantic_search_usage_last_reset: string;
}

/**
 * Response data from updating a single user's AI usage
 */
export interface UpdateAiLimitResponse {
    user_id: string;
    user_email: string;

    // Updated fields (optional in response if not changed)
    new_chat_usage?: number;
    new_semantic_search_usage?: number;

    // Remaining balance helper
    ai_daily_remaining?: number;
}

/**
 * Response data from bulk operations
 */
export interface BulkAiLimitResponse {
    total_requested: number;
    total_updated: number;
    failed_user_ids: string[];
}

// ========== API Response Wrapper ==========

export interface TokenUsageApiResponse<T> {
    success: boolean;
    code: number;
    message: string;
    data: T;
}

// Alias for common usage list response
export type TokenUsageResponse = TokenUsageApiResponse<TokenUsageItem[]>;
