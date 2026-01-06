/**
 * useAdminNotifications Hook
 * 
 * Custom hook for admin notification state and actions.
 * Encapsulates all business logic: WebSocket, API calls, state management, and sound.
 * UI components should consume this hook and remain pure.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { toaster } from '@admin/hooks/useToaster';
import { useNavigate } from '@tanstack/react-router';
import { WebSocketClient, getWebSocketUrl, type WebSocketMessage } from '@admin/lib/api/websocket-client';
import { adminNotificationService } from '../services/admin-notification.service';
import type { AdminNotification } from '@admin/lib/types/notification.types';

// Sound configuration
const NOTIFICATION_SOUND_URL = '/sounds/notif_v2.mp3';

interface UseAdminNotificationsResult {
    /** List of notifications */
    notifications: AdminNotification[];
    /** Number of unread notifications */
    unreadCount: number;
    /** Whether notifications are being fetched */
    isLoading: boolean;
    /** Whether dropdown is open */
    isOpen: boolean;
    /** Toggle dropdown open state */
    setIsOpen: (open: boolean) => void;
    /** Mark a single notification as read */
    markAsRead: (id: string) => Promise<void>;
    /** Mark all notifications as read */
    markAllAsRead: () => Promise<void>;
    /** Navigate to a URL (for notification clicks) */
    handleNavigate: (url: string) => void;
}

/**
 * Play notification sound
 */
function playNotificationSound(): void {
    try {
        const audio = new Audio(NOTIFICATION_SOUND_URL);
        audio.volume = 0.5;
        audio.play().catch(() => {
            // Autoplay may be blocked - silent fail
        });
    } catch {
        // Audio not supported - silent fail
    }
}

/**
 * Hook for managing admin notifications
 * 
 * Handles:
 * - WebSocket connection for real-time updates
 * - REST API calls for fetching and updating notifications
 * - State management for notifications list and unread count
 * - Toast notifications and sound for new messages
 * - Deep linking navigation via action_url
 */
export function useAdminNotifications(): UseAdminNotificationsResult {
    // State
    const [notifications, setNotifications] = useState<AdminNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Refs
    const wsClientRef = useRef<WebSocketClient | null>(null);

    // Router
    const navigate = useNavigate();

    // ========== Navigation Handler ==========
    const handleNavigate = useCallback((url: string) => {
        setIsOpen(false); // Close dropdown

        // Convert /refunds/:id to /refunds?highlight=:id for table highlighting
        const refundMatch = url.match(/^\/refunds\/([a-f0-9-]+)$/i);
        if (refundMatch) {
            navigate({ to: '/refunds', search: { highlight: refundMatch[1] } });
        } else {
            navigate({ to: url });
        }
    }, [navigate]);

    // ========== API Methods ==========
    const fetchNotifications = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await adminNotificationService.getNotifications(20, 0);
            setNotifications(data);
        } catch {
            // Silent error - notifications are non-critical
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const count = await adminNotificationService.getUnreadCount();
            setUnreadCount(count);
        } catch {
            // Silent error
        }
    }, []);

    const markAsRead = useCallback(async (id: string) => {
        try {
            await adminNotificationService.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch {
            // Silent error
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            await adminNotificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch {
            // Silent error
        }
    }, []);

    // ========== WebSocket Handler ==========
    const handleNotification = useCallback((message: WebSocketMessage) => {
        // Play notification sound
        playNotificationSound();

        // Increment unread count
        setUnreadCount(prev => prev + 1);

        // Prepend to notifications list
        const newNotification: AdminNotification = {
            id: message.data.id,
            type_code: message.data.type_code,
            title: message.data.title,
            message: message.data.message,
            is_read: false,
            created_at: new Date().toISOString(),
            metadata: message.data.metadata,
            entity_type: message.data.metadata?.entity_type as string | undefined,
            entity_id: message.data.metadata?.entity_id as string | undefined,
        };

        setNotifications(prev => [newNotification, ...prev.slice(0, 49)]);

        // Show toast notification with click action
        const actionUrl = message.data.metadata?.action_url as string | undefined;
        toaster.message(message.data.title, {
            description: message.data.message,
            duration: 5000,
            action: actionUrl ? {
                label: 'View',
                onClick: () => navigate({ to: actionUrl }),
            } : undefined,
        });

        // Dispatch global event for other components to react (e.g., table updates)
        window.dispatchEvent(new CustomEvent('admin:notification', { detail: message }));
    }, [navigate]);

    // ========== WebSocket Lifecycle ==========
    useEffect(() => {
        // Setup WebSocket
        let client: WebSocketClient | null = null;
        const token = localStorage.getItem('admin_token');

        if (token) {
            const wsUrl = getWebSocketUrl();
            client = new WebSocketClient({
                baseUrl: wsUrl,
                token,
                onNotification: handleNotification,
                onOpen: () => {
                    // Sync on connect/reconnect: Fetch missed notifications from DB
                    fetchUnreadCount();
                    fetchNotifications();
                },
            });
            wsClientRef.current = client;
            client.connect();
        }

        // Cleanup
        return () => {
            if (client) {
                client.disconnect();
            }
            wsClientRef.current = null;
        };
    }, [fetchUnreadCount, fetchNotifications, handleNotification]);

    // ========== Fetch on Dropdown Open ==========
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen, fetchNotifications]);

    return {
        notifications,
        unreadCount,
        isLoading,
        isOpen,
        setIsOpen,
        markAsRead,
        markAllAsRead,
        handleNavigate,
    };
}
