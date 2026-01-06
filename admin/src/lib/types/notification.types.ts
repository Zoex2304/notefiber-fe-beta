/**
 * Admin Notification Types
 * 
 * Type definitions for the admin notification feature.
 * Single source of truth for notification data structures.
 */

/**
 * Notification metadata with optional action_url for deep linking
 */
export interface NotificationMetadata {
    action_url?: string;
    [key: string]: unknown;
}

/**
 * Individual notification item from the API
 */
export interface AdminNotification {
    id: string;
    user_id?: string;
    type_code: AdminNotificationTypeCode;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    read_at?: string | null;
    metadata?: NotificationMetadata;
    entity_type?: string;
    entity_id?: string;
}

/**
 * Known notification type codes for admin
 */
export type AdminNotificationTypeCode =
    | 'USER_REGISTERED'
    | 'USER_DELETED'
    | 'SUBSCRIPTION_CREATED'
    | 'REFUND_REQUESTED'
    | 'REFUND_APPROVED'
    | 'REFUND_REJECTED'
    | 'SUBSCRIPTION_CANCELLATION_REQUESTED'
    | 'SUBSCRIPTION_CANCELLATION_PROCESSED'
    | 'AI_LIMIT_UPDATED'
    | 'SYSTEM_BROADCAST'
    | string; // Allow unknown types for forward compatibility

/**
 * API response for fetching notifications list
 */
export interface AdminNotificationListResponse {
    data: AdminNotification[];
    total: number;
    page?: number;
    limit?: number;
}

/**
 * API response for unread count
 */
export interface AdminUnreadCountResponse {
    count: number;
}

/**
 * Props for notification item component
 */
export interface NotificationItemProps {
    notification: AdminNotification;
    onMarkAsRead: (id: string) => void;
    onNavigate?: (url: string) => void;
}

/**
 * Map notification type to display icon
 */
export const NOTIFICATION_TYPE_ICONS: Record<string, string> = {
    USER_REGISTERED: '👤',
    USER_DELETED: '🗑️',
    SUBSCRIPTION_CREATED: '💳',
    REFUND_REQUESTED: '↩️',
    REFUND_APPROVED: '✅',
    REFUND_REJECTED: '❌',
    SUBSCRIPTION_CANCELLATION_REQUESTED: '🛑',
    SUBSCRIPTION_CANCELLATION_PROCESSED: '📝',
    AI_LIMIT_UPDATED: '🤖',
    SYSTEM_BROADCAST: '📢',
} as const;

/**
 * Get icon for notification type, with fallback
 */
export function getNotificationIcon(typeCode: string): string {
    return NOTIFICATION_TYPE_ICONS[typeCode] ?? '🔔';
}
