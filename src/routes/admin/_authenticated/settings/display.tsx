import { createFileRoute } from '@tanstack/react-router'
import { SettingsDisplay } from '@admin/features/settings/display'

export const Route = createFileRoute('/admin/_authenticated/settings/display')({
  component: SettingsDisplay,
})
