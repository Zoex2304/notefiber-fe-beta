import { createFileRoute } from '@tanstack/react-router'
import { ComingSoon } from '@admin/components/coming-soon'

export const Route = createFileRoute('/admin/_authenticated/help-center/')({
  component: ComingSoon,
})
