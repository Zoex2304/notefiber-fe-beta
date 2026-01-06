import { type QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet, useRouterState } from '@tanstack/react-router'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Toaster } from '@/components/ui/Toaster'
import { TopLoader } from '@/components/shadui/TopLoader'
import { useState, useEffect } from 'react'
import { SubscriptionProvider } from '@/contexts/SubscriptionContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { UpgradeModal } from '@/components/modals/UpgradeModal'
import { LogOverlay } from '@/utils/debug/LogOverlay'
import { DevUtils } from '@/components/dev/DevUtils'

import { type User } from '@/api/services/auth/auth.types';

// Define the router context type
export interface RouterContext {
    queryClient: QueryClient
    auth?: {
        isAuthenticated: boolean
        user: User | null
    }
}

export const Route = createRootRouteWithContext<RouterContext>()({
    component: RootComponent,
})

function RootComponent() {
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    // Debug visibility state
    const [showDebug, setShowDebug] = useState(true);

    useEffect(() => {
        const UPGRADE_EVENT = 'show-upgrade-modal';
        const handleUpgradeTrigger = () => setShowUpgradeModal(true);

        // Debug toggle handler
        const handleDebugToggle = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'h') {
                e.preventDefault();
                setShowDebug(prev => !prev);
            }
        };

        window.addEventListener(UPGRADE_EVENT, handleUpgradeTrigger);
        window.addEventListener('keydown', handleDebugToggle);

        return () => {
            window.removeEventListener(UPGRADE_EVENT, handleUpgradeTrigger);
            window.removeEventListener('keydown', handleDebugToggle);
        };
    }, []);

    const router = useRouterState();
    const isAdmin = router.location.pathname.startsWith('/admin');

    return (
        <SubscriptionProvider>
            <NotificationProvider>
                <div className="min-h-screen bg-background font-sans antialiased">
                    <Outlet />
                    <Toaster />
                    <TopLoader color={isAdmin ? "#E5E7EB" : undefined} />
                    <UpgradeModal
                        isOpen={showUpgradeModal}
                        onClose={() => setShowUpgradeModal(false)}
                        featureName="This pro feature"
                    />
                    {import.meta.env.DEV && showDebug && (
                        <>
                            <LogOverlay />
                            <DevUtils />
                            <ReactQueryDevtools buttonPosition="bottom-left" />
                            <TanStackRouterDevtools position="bottom-right" />
                        </>
                    )}
                </div>
            </NotificationProvider>
        </SubscriptionProvider>
    )
}
