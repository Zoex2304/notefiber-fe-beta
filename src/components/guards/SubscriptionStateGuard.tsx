import { useEffect } from 'react';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';
import { NotificationTypeCode } from '@/api/services/notification/notification.schemas';
import type { WebSocketNotificationData } from '@/api/services/notification/notification.types';

// Events that imply a mandatory subscription state refresh
const STATE_MUTATING_EVENTS = new Set([
    NotificationTypeCode.REFUND_APPROVED,
    NotificationTypeCode.REFUND_REJECTED, // Maybe user reclaimed quota or status changed
    NotificationTypeCode.AI_LIMIT_UPDATED,
    NotificationTypeCode.SUBSCRIPTION_CREATED,
    NotificationTypeCode.SUBSCRIPTION_CANCELLATION_PROCESSED,
    // Add others as needed (e.g. PLAN_UPGRADE_SUCCESS)
]);

export function SubscriptionStateGuard() {
    const fetchSubscription = useSubscriptionStore(s => s.fetchSubscription);

    useEffect(() => {
        const handleSystemNotification = (event: Event) => {
            const customEvent = event as CustomEvent<WebSocketNotificationData>;
            const { type_code } = customEvent.detail;

            if (STATE_MUTATING_EVENTS.has(type_code as any)) {
                console.log(`[SubscriptionGuard] Intercepting state-mutating event: ${type_code}. Refreshing subscription...`);
                fetchSubscription();
            }
        };

        window.addEventListener('sys:notification_received', handleSystemNotification);

        return () => {
            window.removeEventListener('sys:notification_received', handleSystemNotification);
        };
    }, [fetchSubscription]);

    return null; // This component is pure logic/infrastructure
}
