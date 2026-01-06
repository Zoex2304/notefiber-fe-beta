import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Notification } from '@/api/services/notification/notification.types';
import { NotificationTypeCode } from '@/api/services/notification/notification.schemas';

interface NotificationItemProps {
    notification: Notification;
    onClick?: (notification: Notification) => void;
}

/**
 * Get icon/emoji for notification type
 */
function getNotificationIcon(typeCode: string): string {
    switch (typeCode) {
        case NotificationTypeCode.NOTE_CREATED:
            return '📝';
        case NotificationTypeCode.USER_LOGIN:
            return '🔐';
        case NotificationTypeCode.SUBSCRIPTION_CREATED:
            return '✨';
        case NotificationTypeCode.REFUND_APPROVED:
            return '💸';
        case NotificationTypeCode.REFUND_REQUESTED:
            return '📋';
        case NotificationTypeCode.AI_LIMIT_UPDATED:
            return '🤖';
        case NotificationTypeCode.SYSTEM_BROADCAST:
            return '📢';
        case NotificationTypeCode.SOCIAL_PROOF:
            return '🎉';
        default:
            return '🔔';
    }
}

/**
 * NotificationItem - Single notification display
 * 
 * Renders a notification with icon, title, message, and timestamp.
 * Shows read/unread state visually.
 */
export function NotificationItem({ notification, onClick }: NotificationItemProps) {
    const { title, message, type_code, is_read, created_at } = notification;

    const handleClick = () => {
        onClick?.(notification);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
        }
    };

    // Format relative time
    let timeAgo = '';
    try {
        timeAgo = formatDistanceToNow(new Date(created_at), { addSuffix: true });
    } catch {
        timeAgo = 'Just now';
    }

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            className={cn(
                'flex items-start gap-3 p-3',
                'cursor-pointer',
                'hover:bg-accent/50 transition-colors',
                'border-b border-border last:border-b-0',
                !is_read && 'bg-accent/30'
            )}
        >
            {/* Icon */}
            <span className="text-lg flex-shrink-0 mt-0.5">
                {getNotificationIcon(type_code)}
            </span>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p
                    className={cn(
                        'text-sm leading-tight',
                        !is_read ? 'font-semibold text-foreground' : 'text-muted-foreground'
                    )}
                >
                    {title}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                    {message}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                    {timeAgo}
                </p>
            </div>

            {/* Unread indicator */}
            {!is_read && (
                <span className="w-2 h-2 bg-royal-violet-base rounded-full flex-shrink-0 mt-1.5" />
            )}
        </div>
    );
}
