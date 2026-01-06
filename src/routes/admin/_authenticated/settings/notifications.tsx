import { createFileRoute } from '@tanstack/react-router'
import { SettingsNotifications } from '@admin/features/settings/notifications'

export const Route = createFileRoute('/admin/_authenticated/settings/notifications')({
  component: SettingsNotifications,
})
