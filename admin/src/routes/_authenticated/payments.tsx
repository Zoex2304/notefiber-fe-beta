import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { Payments } from '@admin/features/payments'

const paymentsSearchSchema = z.object({
    page: z.number().int().positive().default(1).optional(),
    limit: z.number().int().positive().default(10).optional(),
    status: z.string().optional(),
})

export const Route = createFileRoute('/_authenticated/payments')({
    component: Payments,
    validateSearch: (search) => paymentsSearchSchema.parse(search),
})
