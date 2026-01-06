import { createFileRoute } from '@tanstack/react-router'
import { SettingsProfile } from '@admin/features/settings/profile'

export const Route = createFileRoute('/admin/_authenticated/settings/')({
  component: SettingsProfile,
})
