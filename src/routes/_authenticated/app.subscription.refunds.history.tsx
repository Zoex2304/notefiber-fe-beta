import { createFileRoute } from '@tanstack/react-router'
import { RefundHistoryPage } from '@/pages/subscription/RefundHistoryPage'

export const Route = createFileRoute('/_authenticated/app/subscription/refunds/history')({
    component: RefundHistoryPage,
})
