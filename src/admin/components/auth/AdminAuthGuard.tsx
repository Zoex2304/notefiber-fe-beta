import { useEffect } from 'react';
import { useNavigate, Outlet } from '@tanstack/react-router';
import { useAdminAuth } from '@admin/contexts/AdminAuthContext';

export function AdminAuthGuard() {
    const { isAuthenticated, isLoading } = useAdminAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            // Store intended destination
            const currentPath = window.location.pathname;
            if (currentPath !== '/admin/sign-in-2') {
                localStorage.setItem('admin_redirect', currentPath);
            }
            navigate({ to: '/admin/sign-in-2' });
        }
    }, [isAuthenticated, isLoading, navigate]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return <Outlet />;
}
