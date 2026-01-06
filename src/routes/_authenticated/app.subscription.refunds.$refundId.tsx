import { createFileRoute } from '@tanstack/react-router'
import { RefundDetail } from '@/pages/subscription/RefundDetail'

export const Route = createFileRoute('/_authenticated/app/subscription/refunds/$refundId')({
    component: RefundDetail,
})
