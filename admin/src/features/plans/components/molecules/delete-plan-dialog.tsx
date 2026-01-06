import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@admin/components/ui/alert-dialog'
import type { SubscriptionPlan } from '../../data/schema'

interface DeletePlanDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    plan: SubscriptionPlan | null
    onConfirm: () => void
    isDeleting?: boolean
}

export function DeletePlanDialog({
    open,
    onOpenChange,
    plan,
    onConfirm,
    isDeleting,
}: DeletePlanDialogProps) {
    if (!plan) return null

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Subscription Plan?</AlertDialogTitle>
                    <AlertDialogDescription className='space-y-2'>
                        <p>
                            Are you sure you want to delete <strong>{plan.name}</strong>?
                        </p>
                        <p className='text-sm'>
                            This plan will be soft-deleted and hidden from new subscribers.
                            Existing users with active subscriptions will not be affected.
                        </p>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className='bg-destructive hover:bg-destructive/90'
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Plan'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
