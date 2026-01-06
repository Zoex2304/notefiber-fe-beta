import { createFileRoute } from '@tanstack/react-router'
import RefundsPage from '@admin/features/refunds'

export const Route = createFileRoute('/_authenticated/refunds')({
    component: RefundsPage,
})
