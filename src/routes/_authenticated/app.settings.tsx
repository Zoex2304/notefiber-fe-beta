import { createFileRoute } from '@tanstack/react-router'
import AccountSettings from '@/pages/user/AccountSettings'

export const Route = createFileRoute('/_authenticated/app/settings')({
    component: AccountSettings,
})
