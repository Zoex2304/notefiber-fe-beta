import { createFileRoute } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@admin/components/layout/authenticated-layout'

export const Route = createFileRoute('/admin/_authenticated')({
  component: AuthenticatedLayout,
})
