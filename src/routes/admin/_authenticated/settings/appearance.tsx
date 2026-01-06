import { createFileRoute } from '@tanstack/react-router'
import { SettingsAppearance } from '@admin/features/settings/appearance'

export const Route = createFileRoute('/admin/_authenticated/settings/appearance')({
  component: SettingsAppearance,
})
