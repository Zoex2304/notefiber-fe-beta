import { createFileRoute } from '@tanstack/react-router'
import { SubscriptionManagement } from '@/pages/subscription/SubscriptionManagement'

export const Route = createFileRoute('/_authenticated/app/subscription/')({
  component: SubscriptionManagement,
})
