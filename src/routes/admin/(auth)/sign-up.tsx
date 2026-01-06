import { createFileRoute } from '@tanstack/react-router'
import { SignUp } from '@admin/features/auth/sign-up'

export const Route = createFileRoute('/admin/(auth)/sign-up')({
  component: SignUp,
})
