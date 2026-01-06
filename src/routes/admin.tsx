// Admin layout route - wraps all /admin/* routes with admin-specific providers
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Toaster } from '@admin/components/ui/sonner'
import { NavigationProgress } from '@admin/components/navigation-progress'
import { DirectionProvider } from '@admin/context/direction-provider'
import { FontProvider } from '@admin/context/font-provider'
import { ThemeProvider } from '@admin/context/theme-provider'
import { AdminAuthProvider } from '@admin/contexts/AdminAuthContext'

export const Route = createFileRoute('/admin')({
    component: AdminLayout,
})

function AdminLayout() {
    return (
        <AdminAuthProvider>
            <ThemeProvider>
                <FontProvider>
                    <DirectionProvider>
                        <NavigationProgress />
                        <Outlet />
                        <Toaster duration={5000} />
                        {import.meta.env.MODE === 'development' && (
                            <>
                                <ReactQueryDevtools buttonPosition='bottom-left' />
                                <TanStackRouterDevtools position='bottom-right' />
                            </>
                        )}
                    </DirectionProvider>
                </FontProvider>
            </ThemeProvider>
        </AdminAuthProvider>
    )
}
