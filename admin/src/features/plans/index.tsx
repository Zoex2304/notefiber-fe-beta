import { useState } from 'react'
import { Button } from '@admin/components/ui/button'
import { Main } from '@admin/components/layout/main'
import { PlansList } from './components/organisms/plans-list'
import { CreatePlanForm } from './components/organisms/create-plan-form'
import { EditPlanForm } from './components/organisms/edit-plan-form'
import { FeatureManagementDialog } from './components/molecules/feature-management-dialog'
import { Plus, ArrowLeft, Layers } from 'lucide-react'
import type { SubscriptionPlan } from './data/schema'

type ViewMode = 'list' | 'create' | 'edit'

export function PlansManagement() {
    const [viewMode, setViewMode] = useState<ViewMode>('list')
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
    const [showFeaturesDialog, setShowFeaturesDialog] = useState(false)

    const handleCreateNew = () => {
        setViewMode('create')
    }

    const handleEdit = (plan: SubscriptionPlan) => {
        setSelectedPlan(plan)
        setViewMode('edit')
    }

    const handleBack = () => {
        setViewMode('list')
        setSelectedPlan(null)
    }

    return (
        <>

            <Main>
                <div className='mb-6 flex items-center justify-between'>
                    {viewMode === 'list' ? (
                        <>
                            <div>
                                <h1 className='text-2xl font-bold tracking-tight'>
                                    Subscription Plans
                                </h1>
                                <p className='text-muted-foreground'>
                                    Manage subscription plans and pricing
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setShowFeaturesDialog(true)}>
                                    <Layers className="mr-2 h-4 w-4" />
                                    Manage Features
                                </Button>
                                <Button onClick={handleCreateNew}>
                                    <Plus className='mr-2 h-4 w-4' />
                                    Create Plan
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Button variant='ghost' onClick={handleBack}>
                                <ArrowLeft className='mr-2 h-4 w-4' />
                                Back to Plans
                            </Button>
                        </>
                    )}
                </div>

                {viewMode === 'list' && (
                    <PlansList onCreateNew={handleCreateNew} onEdit={handleEdit} />
                )}

                {viewMode === 'create' && (
                    <CreatePlanForm onSuccess={handleBack} onCancel={handleBack} />
                )}

                {viewMode === 'edit' && selectedPlan && (
                    <EditPlanForm
                        plan={selectedPlan}
                        onSuccess={handleBack}
                        onCancel={handleBack}
                    />
                )}

                <FeatureManagementDialog
                    open={showFeaturesDialog}
                    onOpenChange={setShowFeaturesDialog}
                />
            </Main>
        </>
    )
}
