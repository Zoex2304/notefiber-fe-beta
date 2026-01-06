import { createFileRoute } from '@tanstack/react-router'
import { CancellationHistoryPage } from '@/pages/subscription/CancellationHistoryPage'

export const Route = createFileRoute('/_authenticated/app/subscription/history')({
    component: CancellationHistoryPage,
})
