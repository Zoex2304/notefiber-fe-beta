import { createFileRoute } from '@tanstack/react-router'
import { GeneralError } from '@admin/features/errors/general-error'

export const Route = createFileRoute('/(errors)/500')({
  component: GeneralError,
})
