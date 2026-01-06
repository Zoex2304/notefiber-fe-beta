import { createLazyFileRoute } from '@tanstack/react-router'
import { AiConfigTable } from '@admin/features/ai'

export const Route = createLazyFileRoute('/_authenticated/ai/configurations')({
    component: AiConfigurations,
})

function AiConfigurations() {
    return (
        <div className='p-6 space-y-6'>
            <div className='flex items-center justify-between'>
                <h1 className='text-3xl font-bold tracking-tight'>AI Configurations</h1>
            </div>
            <AiConfigTable />
        </div>
    )
}
