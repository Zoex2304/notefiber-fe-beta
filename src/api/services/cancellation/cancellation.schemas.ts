import { z } from 'zod';

// =====================================================
// User Cancellation Schemas (v1.6.0)
// =====================================================

export const userCancellationRequestSchema = z.object({
    subscription_id: z.string().min(1, 'Subscription ID is required'),
    reason: z.string().min(10, 'Reason must be at least 10 characters'),
});

export const userCancellationResponseSchema = z.object({
    cancellation_id: z.string(),
    status: z.enum(['pending', 'approved', 'rejected']),
    message: z.string(),
});

export const userCancellationListItemSchema = z.object({
    id: z.string(),
    subscription_id: z.string(),
    plan_name: z.string(),
    reason: z.string(),
    status: z.enum(['pending', 'approved', 'rejected']),
    effective_date: z.string(),
    admin_notes: z.string().optional(),
    created_at: z.string(),
});
