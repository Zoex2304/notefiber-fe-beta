import { createFileRoute } from '@tanstack/react-router'
import { SettingsNotifications } from '@admin/features/settings/notifications'

export const Route = createFileRoute('/_authenticated/settings/notifications')({
  component: SettingsNotifications,
})
