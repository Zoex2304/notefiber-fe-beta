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

interface RefundRejectionDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    refund: RefundListItem | null
}

export function RefundRejectionDialog({ open, onOpenChange, refund }: RefundRejectionDialogProps) {
    const [rejectionReason, setRejectionReason] = useState('')
    const queryClient = useQueryClient()

    const rejectMutation = useMutation({
        mutationFn: async () => {
            if (!refund) throw new Error('No refund selected')
            if (!rejectionReason.trim()) throw new Error('Rejection reason is required')
            return adminRefundsApi.rejectRefund(refund.id, rejectionReason)
        },
        onSuccess: () => {
            toaster.success('Refund request rejected')
            queryClient.invalidateQueries({ queryKey: ['admin', 'refunds'] })
            queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
            setRejectionReason('')
            onOpenChange(false)
        },
        onError: (error: unknown) => {
            const message = error instanceof Error ? error.message : 'Failed to reject refund'
            toaster.error(message)
        },
    })

    const handleConfirm = () => {
        if (!rejectionReason.trim()) {
            toaster.error('Please provide a reason for rejection')
            return
        }
        rejectMutation.mutate()
    }

    const handleCancel = () => {
        setRejectionReason('')
        onOpenChange(false)
    }

    if (!refund) return null

    return (
        <Dialog open={open} onOpenChange={handleCancel}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>Reject Refund Request</DialogTitle>
                    <DialogDescription>
                        This action will reject the user's refund request.
                    </DialogDescription>
                </DialogHeader>

                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        <strong>Warning:</strong> The user will be notified that their refund request was rejected.
                    </AlertDescription>
                </Alert>

                <div className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-muted-foreground">User:</span>
                        <span className="font-medium">{refund.user.full_name}</span>
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-bold">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(refund.amount)}</span>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="rejection-reason" className="text-destructive">Rejection Reason (Required)</Label>
                        <Textarea
                            id="rejection-reason"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Explain why the refund is being rejected..."
                            rows={3}
                            disabled={rejectMutation.isPending}
                            className="border-destructive/50 focus-visible:ring-destructive"
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={rejectMutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={rejectMutation.isPending}
                    >
                        {rejectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Reject Refund
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
