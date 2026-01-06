import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, AlertTriangle } from 'lucide-react'
import { toaster } from '@admin/hooks/useToaster'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@admin/components/ui/dialog'
import { Button } from '@admin/components/ui/button'
import { Textarea } from '@admin/components/ui/textarea'
import { Label } from '@admin/components/ui/label'
import { Alert, AlertDescription } from '@admin/components/ui/alert'
import { adminRefundsApi } from '@admin/lib/api/admin-api'
import type { RefundListItem } from '@admin/lib/types/admin-api'

interface RefundApprovalDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    refund: RefundListItem | null
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount)
}

export function RefundApprovalDialog({ open, onOpenChange, refund }: RefundApprovalDialogProps) {
    const [adminNotes, setAdminNotes] = useState('')
    const queryClient = useQueryClient()

    const approveMutation = useMutation({
        mutationFn: async () => {
            if (!refund) throw new Error('No refund selected')
            return adminRefundsApi.approveRefund(refund.id, adminNotes || undefined)
        },
        onSuccess: (data) => {
            toaster.success(`Refund approved! Amount: ${formatCurrency(data.refunded_amount)}`)
            queryClient.invalidateQueries({ queryKey: ['admin', 'refunds'] })
            queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
            setAdminNotes('')
            onOpenChange(false)
        },
        onError: (error: unknown) => {
            const message = error instanceof Error ? error.message : 'Failed to approve refund'
            toaster.error(message)
        },
    })

    const handleConfirm = () => {
        approveMutation.mutate()
    }

    const handleCancel = () => {
        setAdminNotes('')
        onOpenChange(false)
    }

    if (!refund) return null

    return (
        <Dialog open={open} onOpenChange={handleCancel}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>Confirm Refund Approval</DialogTitle>
                    <DialogDescription>
                        Please review the details before approving this refund.
                    </DialogDescription>
                </DialogHeader>

                <Alert variant="destructive" className="border-amber-500/50 bg-amber-500/10">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-700 dark:text-amber-400">
                        <strong>Important:</strong> You must manually transfer the refund amount to the user.
                        Midtrans does not support automated refunds.
                    </AlertDescription>
                </Alert>

                <div className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-muted-foreground">User:</span>
                        <span className="font-medium">{refund.user.full_name}</span>
                        <span className="text-muted-foreground">Email:</span>
                        <span>{refund.user.email}</span>
                        <span className="text-muted-foreground">Plan:</span>
                        <span>{refund.subscription.plan_name}</span>
                        <span className="text-muted-foreground">Refund Amount:</span>
                        <span className="font-bold text-primary">{formatCurrency(refund.amount)}</span>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="admin-notes">Admin Notes (optional)</Label>
                        <Textarea
                            id="admin-notes"
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            placeholder="Add notes for audit trail..."
                            rows={3}
                            disabled={approveMutation.isPending}
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={approveMutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} disabled={approveMutation.isPending}>
                        {approveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Approve Refund
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
