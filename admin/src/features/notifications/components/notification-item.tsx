/**
 * NotificationItem Component
 * 
 * Pure presentational component for rendering a single notification.
 * Supports click-to-navigate via action_url in metadata.
 * Follows Atomic Design as a molecule component.
 */

import { cn } from '@admin/lib/utils';
import type { NotificationItemProps } from '@admin/lib/types/notification.types';
import { getNotificationIcon } from '@admin/lib/types/notification.types';

/**
 * Renders a single notification item with icon, content, and read status
 */
export function NotificationItem({ notification, onMarkAsRead, onNavigate }: NotificationItemProps) {
    const icon = getNotificationIcon(notification.type_code);
    const isRefundRequest = notification.type_code === 'REFUND_REQUESTED';
    const actionUrl = notification.metadata?.action_url;

    const handleClick = () => {
        // Mark as read first
        if (!notification.is_read) {
            onMarkAsRead(notification.id);
        }

        // Navigate if action_url exists
        if (actionUrl && onNavigate) {
            onNavigate(actionUrl);
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className={cn(
                'w-full text-left px-3 py-2 hover:bg-muted/50 transition-colors border-l-2',
                !notification.is_read && 'bg-muted/30',
                isRefundRequest
                    ? 'border-l-red-500 bg-red-50/50 dark:bg-red-900/10'
                    : 'border-l-transparent',
                actionUrl && 'cursor-pointer'
            )}
        >
            <div className="flex gap-2">
                <span className="text-lg shrink-0" aria-hidden="true">
                    {icon}
                </span>
                <div className="flex-1 min-w-0">
                    <p
                        className={cn(
                            'text-sm truncate',
                            !notification.is_read && 'font-medium'
                        )}
                    >
                        {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                        {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.created_at).toLocaleString()}
                    </p>
                </div>
                {!notification.is_read && (
                    <div
                        className="w-2 h-2 rounded-full bg-primary mt-1 shrink-0"
                        aria-label="Unread"
                    />
                )}
            </div>
        </button>
    );
}
