import { createFileRoute } from '@tanstack/react-router'
import { Settings } from '@admin/features/settings'

export const Route = createFileRoute('/admin/_authenticated/settings')({
  component: Settings,
})
