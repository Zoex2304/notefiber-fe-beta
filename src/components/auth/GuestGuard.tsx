import { useEffect } from 'react';
import { Outlet, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/hooks/auth/useAuth';
import { debugLog } from '@/utils/debug/LogOverlay';

export const GuestGuard = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            debugLog.info("GuestGuard: User is authenticated, redirecting to /app");
            navigate({ to: "/app", replace: true });
        }
    }, [isLoading, isAuthenticated, navigate]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-royal-violet-base border-t-transparent" />
            </div>
        );
    }

    if (isAuthenticated) {
        return null; // Will redirect via useEffect
    }

    return <Outlet />;
};
