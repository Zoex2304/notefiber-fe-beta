import { createFileRoute } from '@tanstack/react-router'
import CancellationsPage from '@admin/features/cancellations'

export const Route = createFileRoute('/_authenticated/cancellations')({
    component: CancellationsPage,
})
