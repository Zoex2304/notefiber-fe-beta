import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationBell } from '@/components/molecules/NotificationBell';
import { NotificationItem } from '@/components/molecules/NotificationItem';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/shadui/popover';
import { Button } from '@/components/shadui/button';
import type { Notification } from '@/api/services/notification/notification.types';

/**
 * NotificationDropdown - Notification list popover
 * 
 * Displays the notification bell with a dropdown containing
 * the list of notifications with mark-all-read functionality.
 * Supports deep linking via action_url in notification metadata.
 */
export function NotificationDropdown() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const {
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        refreshNotifications,
    } = useNotifications();

    const handleNotificationClick = async (notification: Notification) => {
        // Mark as read if unread
        if (!notification.is_read) {
            await markAsRead(notification.id);
        }

        // Navigate if action_url exists in metadata
        const actionUrl = notification.metadata?.action_url as string | undefined;
        if (actionUrl) {
            // Normalize specific backend paths to frontend routes
            let targetUrl = actionUrl;
            if (actionUrl === '/settings') targetUrl = '/app/settings';
            else if (actionUrl.startsWith('/refunds/')) targetUrl = `/app/subscription${actionUrl}`;
            else if (actionUrl.startsWith('/users/')) targetUrl = `/app${actionUrl}`;

            navigate({ to: targetUrl });
        }

        // Close popover
        setOpen(false);
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
    };

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (isOpen) {
            refreshNotifications();
        }
    };

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <div>
                    <NotificationBell />
                </div>
            </PopoverTrigger>
            <PopoverContent
                className="w-80 p-0"
                align="end"
                sideOffset={8}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <h3 className="font-semibold text-sm">
                        Notifications
                        {unreadCount > 0 && (
                            <span className="ml-2 text-xs text-muted-foreground">
                                ({unreadCount} unread)
                            </span>
                        )}
                    </h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs gap-1"
                            onClick={handleMarkAllAsRead}
                        >
                            <Check className="h-3 w-3" />
                            Mark all read
                        </Button>
                    )}
                </div>

                {/* Notification list */}
                <div className="max-h-[360px] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                            <span className="text-3xl mb-2">🔔</span>
                            <p className="text-sm text-muted-foreground">
                                No notifications yet
                            </p>
                            <p className="text-xs text-muted-foreground/70 mt-1">
                                We'll notify you when something happens
                            </p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onClick={handleNotificationClick}
                            />
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
