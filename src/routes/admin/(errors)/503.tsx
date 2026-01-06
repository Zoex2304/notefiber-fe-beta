import { createFileRoute } from '@tanstack/react-router'
import { MaintenanceError } from '@admin/features/errors/maintenance-error'

export const Route = createFileRoute('/admin/(errors)/503')({
  component: MaintenanceError,
})
