import { createFileRoute } from '@tanstack/react-router'
import AdminApp from '@admin/main'

// Admin route - NO RBAC (no beforeLoad authentication check)
// This makes admin accessible without authentication as requested
export const Route = createFileRoute('/admin/$')({
    component: AdminApp,
})
