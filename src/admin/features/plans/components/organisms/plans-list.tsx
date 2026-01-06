import { useSubscriptionPlans, useDeletePlan } from '@admin/hooks/use-admin-api'
import { PlanCard } from '../molecules/plan-card'
import { DeletePlanDialog } from '../molecules/delete-plan-dialog'
import { Button } from '@admin/components/ui/button'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import type { SubscriptionPlan } from '../../data/schema'

interface PlansListProps {
    onCreateNew?: () => void
    onEdit?: (plan: SubscriptionPlan) => void
}

export function PlansList({ onCreateNew, onEdit }: PlansListProps) {
    const { data: plans, isLoading, error } = useSubscriptionPlans()
    const { mutate: deletePlan, isPending: isDeleting } = useDeletePlan()

    const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(null)

    const handleDelete = () => {
        if (planToDelete) {
            deletePlan(planToDelete.id, {
                onSuccess: () => {
                    setPlanToDelete(null)
                },
            })
        }
    }

    if (isLoading) {
        return (
            <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className='h-96 animate-pulse rounded-lg bg-muted'
                    />
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <div className='text-destructive rounded-lg border border-destructive bg-destructive/10 p-4'>
                Failed to load subscription plans. Please try again.
            </div>
        )
    }

    if (!plans || plans.length === 0) {
        return (
            <div className='flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center'>
                <p className='text-muted-foreground mb-4'>
                    No subscription plans yet
                </p>
                {onCreateNew && (
                    <Button onClick={onCreateNew}>
                        <Plus className='mr-2 h-4 w-4' />
                        Create First Plan
                    </Button>
                )}
            </div>
        )
    }

    return (
        <>
            <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                {plans.map((plan) => (
                    <PlanCard
                        key={plan.id}
                        plan={plan}
                        onEdit={onEdit}
                        onDelete={setPlanToDelete}
                    />
                ))}
            </div>

            <DeletePlanDialog
                open={!!planToDelete}
                onOpenChange={(open) => !open && setPlanToDelete(null)}
                plan={planToDelete}
                onConfirm={handleDelete}
                isDeleting={isDeleting}
            />
        </>
    )
}
