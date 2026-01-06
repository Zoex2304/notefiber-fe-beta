import { createFileRoute } from '@tanstack/react-router'
import MainApp from '@/pages/MainApp'

export const Route = createFileRoute('/_authenticated/app/')({
    component: MainApp,
})
