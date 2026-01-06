import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { SignIn } from '@admin/features/auth/sign-in'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/admin/(auth)/sign-in')({
  component: SignIn,
  validateSearch: searchSchema,
})
