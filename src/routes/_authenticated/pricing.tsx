import { createFileRoute } from '@tanstack/react-router'
import AppPricing from '@/pages/pricing/AppPricing'

export const Route = createFileRoute('/_authenticated/pricing')({
    component: AppPricing,
})
