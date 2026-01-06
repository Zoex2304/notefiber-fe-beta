import { z } from 'zod';
import {
    notificationSchema,
    notificationListResponseSchema,
    unreadCountResponseSchema,
    markReadResponseSchema,
    websocketMessageSchema,
    websocketNotificationDataSchema,
    socialProofMetadataSchema,
    noteMetadataSchema,
} from './notification.schemas';

// Single notification
export type Notification = z.infer<typeof notificationSchema>;

// List response with pagination
export type NotificationListResponse = z.infer<typeof notificationListResponseSchema>;

// Unread count
export type UnreadCountResponse = z.infer<typeof unreadCountResponseSchema>;

// Mark as read response
export type MarkReadResponse = z.infer<typeof markReadResponseSchema>;

// WebSocket message types
export type WebSocketMessage = z.infer<typeof websocketMessageSchema>;
export type WebSocketNotificationData = z.infer<typeof websocketNotificationDataSchema>;

// Metadata types
export type SocialProofMetadata = z.infer<typeof socialProofMetadataSchema>;
export type NoteMetadata = z.infer<typeof noteMetadataSchema>;

// Social proof toast props (for UI component)
export interface SocialProofToastProps {
    title: string;
    message: string;
    avatarUrl?: string;
    planName?: string;
    onUpgradeClick: () => void;
    onDismiss?: () => void;
}
