import { createFileRoute } from '@tanstack/react-router'
import { CancellationDetail } from '@/pages/subscription/CancellationDetail'

export const Route = createFileRoute(
  '/_authenticated/app/subscription/cancellation/$cancellationId',
)({
  component: CancellationDetail,
})
