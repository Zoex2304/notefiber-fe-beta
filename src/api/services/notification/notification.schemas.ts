import { z } from 'zod';

// ========== Notification Type Codes ==========
export const NotificationTypeCode = {
    NOTE_CREATED: 'NOTE_CREATED',
    USER_LOGIN: 'USER_LOGIN',
    USER_REGISTERED: 'USER_REGISTERED',
    USER_DELETED: 'USER_DELETED',
    SUBSCRIPTION_CREATED: 'SUBSCRIPTION_CREATED',
    REFUND_REQUESTED: 'REFUND_REQUESTED',
    REFUND_APPROVED: 'REFUND_APPROVED',
    REFUND_REJECTED: 'REFUND_REJECTED',
    SUBSCRIPTION_CANCELLATION_REQUESTED: 'SUBSCRIPTION_CANCELLATION_REQUESTED',
    SUBSCRIPTION_CANCELLATION_PROCESSED: 'SUBSCRIPTION_CANCELLATION_PROCESSED',
    AI_LIMIT_UPDATED: 'AI_LIMIT_UPDATED',
    SYSTEM_BROADCAST: 'SYSTEM_BROADCAST',
    SOCIAL_PROOF: 'SOCIAL_PROOF',
} as const;

export type NotificationTypeCodeValue = typeof NotificationTypeCode[keyof typeof NotificationTypeCode];

// ========== Notification Metadata Schemas ==========
export const noteMetadataSchema = z.object({
    note_id: z.string().optional(),
    title: z.string().optional(),
});

export const socialProofMetadataSchema = z.object({
    full_name: z.string(),
    avatar_url: z.string().optional(),
    plan_name: z.string(),
    type: z.literal('flexing').optional(),
});

export const genericMetadataSchema = z.record(z.string(), z.unknown());

// ========== Single Notification ==========
export const notificationSchema = z.object({
    id: z.string(),
    user_id: z.string().optional(),
    type_code: z.string(),
    title: z.string(),
    message: z.string(),
    is_read: z.boolean(),
    created_at: z.string(),
    read_at: z.string().nullable().optional(),
    metadata: genericMetadataSchema.optional(),
    entity_type: z.string().optional(),
    entity_id: z.string().optional(),
});

// ========== Notification List Response ==========
export const notificationListResponseSchema = z.object({
    data: z.array(notificationSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
});

// ========== Unread Count ==========
export const unreadCountResponseSchema = z.object({
    count: z.number(),
});

// ========== Mark as Read Response ==========
export const markReadResponseSchema = z.object({
    success: z.boolean(),
});

// ========== WebSocket Message Format ==========
export const websocketNotificationDataSchema = z.object({
    id: z.string(),
    title: z.string(),
    message: z.string(),
    type_code: z.string(),
    metadata: genericMetadataSchema.optional(),
});

export const websocketMessageSchema = z.object({
    type: z.literal('notification'),
    data: websocketNotificationDataSchema,
});
