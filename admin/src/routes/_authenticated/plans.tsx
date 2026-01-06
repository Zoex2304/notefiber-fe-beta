import { createFileRoute } from '@tanstack/react-router'
import { PlansManagement } from '@admin/features/plans'

// Admin plans management page
export const Route = createFileRoute('/_authenticated/plans')({
    component: PlansManagement,
})
