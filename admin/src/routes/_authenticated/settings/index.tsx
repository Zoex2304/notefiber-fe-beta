import { createFileRoute } from '@tanstack/react-router'
import { SettingsProfile } from '@admin/features/settings/profile'

export const Route = createFileRoute('/_authenticated/settings/')({
  component: SettingsProfile,
})
