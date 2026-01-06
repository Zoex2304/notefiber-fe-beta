import { createFileRoute } from '@tanstack/react-router'
import { UserDetail } from '@admin/features/users/user-detail'

export const Route = createFileRoute('/admin/_authenticated/users/$userId')({
    component: UserDetail,
})
