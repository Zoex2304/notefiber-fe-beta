import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { Logs } from '@admin/features/system-logs'

const logsSearchSchema = z.object({
    page: z.number().int().positive().default(1).optional(),
    limit: z.number().int().positive().default(10).optional(),
    level: z.string().optional(),
})

export const Route = createFileRoute('/admin/_authenticated/logs')({
    component: Logs,
    validateSearch: (search) => logsSearchSchema.parse(search),
})
