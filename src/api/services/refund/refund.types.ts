/**
 * Refund API Types
 * Maps to the backend refund endpoints
 */

// Request payload for submitting a refund request
export interface RefundRequestPayload {
    subscription_id: string;
    reason: string;
}

// Response from refund request submission
export interface RefundRequestResponse {
    refund_id: string;
    status: 'pending' | 'approved' | 'rejected';
    message: string;
}

// Individual refund item in user's refund list
export interface UserRefund {
    id: string;
    subscription_id: string;
    plan_name: string;
    amount: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}
