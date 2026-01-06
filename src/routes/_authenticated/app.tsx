import { createFileRoute } from '@tanstack/react-router'
import { PersistentLayout } from '@/components/layout/PersistentLayout'
import { NoteOrchestratorProvider } from '@/contexts/NoteOrchestratorContext'

function AppLayout() {
    return (
        <NoteOrchestratorProvider>
            <PersistentLayout />
        </NoteOrchestratorProvider>
    )
}

export const Route = createFileRoute('/_authenticated/app')({
    component: AppLayout,
})
