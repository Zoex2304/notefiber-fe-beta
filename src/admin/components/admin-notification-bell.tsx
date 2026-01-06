/**
 * AdminNotificationBell Component
 * 
 * Pure UI component for the notification bell and dropdown.
 * All business logic is delegated to useAdminNotifications hook.
 * Follows Atomic Design as an organism (composed of molecules).
 */

import { Bell } from 'lucide-react';
import { Button } from '@admin/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@admin/components/ui/dropdown-menu';
import { Badge } from '@admin/components/ui/badge';
import { ScrollArea } from '@admin/components/ui/scroll-area';
import { useAdminNotifications, NotificationItem } from '@admin/features/notifications';

/**
 * Notification bell with dropdown showing recent notifications.
 * Uses useAdminNotifications hook for all state and actions.
 */
export function AdminNotificationBell() {
    const {
        notifications,
        unreadCount,
        isLoading,
        isOpen,
        setIsOpen,
        markAsRead,
        markAllAsRead,
        handleNavigate,
    } = useAdminNotifications();

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                            variant="destructive"
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b">
                    <h4 className="font-semibold">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                            onClick={markAllAsRead}
                        >
                            Mark all read
                        </Button>
                    )}
                </div>

                {/* Notification List */}
                <ScrollArea className="h-[300px]">
                    {isLoading ? (
                        <div className="p-4 text-center text-muted-foreground">
                            Loading...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">
                            No notifications yet
                        </div>
                    ) : (
                        <div className="py-1">
                            {notifications.map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onMarkAsRead={markAsRead}
                                    onNavigate={handleNavigate}
                                />
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
