import { createFileRoute } from '@tanstack/react-router'
import { UnauthorisedError } from '@admin/features/errors/unauthorized-error'

export const Route = createFileRoute('/admin/(errors)/401')({
  component: UnauthorisedError,
})
