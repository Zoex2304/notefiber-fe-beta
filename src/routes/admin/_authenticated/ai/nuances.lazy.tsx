import { createLazyFileRoute } from '@tanstack/react-router'
import { AiNuanceList } from '@admin/features/ai'

export const Route = createLazyFileRoute('/admin/_authenticated/ai/nuances')({
    component: AiNuances,
})

function AiNuances() {
    return (
        <div className='p-6 space-y-6'>
            <AiNuanceList />
        </div>
    )
}
