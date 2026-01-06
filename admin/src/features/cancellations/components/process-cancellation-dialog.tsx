import { useState } from 'react'
import { format } from 'date-fns'
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
import { Label } from '@admin/components/ui/label'
import { Textarea } from '@admin/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@admin/components/ui/radio-group'
import { useCancellationsContext } from './cancellations-provider'
import { useProcessCancellation } from '../hooks/use-cancellations'

export function ProcessCancellationDialog() {
    const { selectedCancellation, processDialogOpen, setProcessDialogOpen, setSelectedCancellation } = useCancellationsContext()
    const [action, setAction] = useState<'approve' | 'reject'>('approve')
    const [adminNotes, setAdminNotes] = useState('')

    const processMutation = useProcessCancellation()

    const handleSubmit = async () => {
        if (!selectedCancellation) return

        try {
            await processMutation.mutateAsync({
                id: selectedCancellation.id,
                data: { action, admin_notes: adminNotes || undefined },
            })

            toaster.success(
                action === 'approve'
                    ? 'Cancellation request approved successfully'
                    : 'Cancellation request rejected'
            )
            handleClose()
        } catch (error) {
            toaster.error('Failed to process cancellation request')
        }
    }

    const handleClose = () => {
        setProcessDialogOpen(false)
        setSelectedCancellation(null)
        setAction('approve')
        setAdminNotes('')
    }

    if (!selectedCancellation) return null

    return (
        <Dialog open={processDialogOpen} onOpenChange={setProcessDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Process Cancellation Request</DialogTitle>
                    <DialogDescription>
                        Review and process this subscription cancellation request.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Request Details */}
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">User:</span>
                            <span className="font-medium">{selectedCancellation.user_name || selectedCancellation.user_id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Plan:</span>
                            <span className="font-medium">{selectedCancellation.plan_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Effective Date:</span>
                            <span className="font-medium">{format(new Date(selectedCancellation.effective_date), 'PP')}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>User's Reason:</Label>
                        <p className="text-sm bg-muted p-3 rounded-md">{selectedCancellation.reason}</p>
                    </div>

                    {/* Action Selection */}
                    <div className="space-y-2">
                        <Label>Action</Label>
                        <RadioGroup value={action} onValueChange={(v) => setAction(v as 'approve' | 'reject')}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="approve" id="approve" />
                                <Label htmlFor="approve" className="font-normal cursor-pointer">
                                    Approve - Cancel the subscription
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="reject" id="reject" />
                                <Label htmlFor="reject" className="font-normal cursor-pointer">
                                    Reject - Keep the subscription active
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Admin Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="admin_notes">Admin Notes (optional)</Label>
                        <Textarea
                            id="admin_notes"
                            placeholder="Add any notes about this decision..."
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={processMutation.isPending}
                        variant={action === 'reject' ? 'destructive' : 'default'}
                    >
                        {processMutation.isPending ? 'Processing...' : action === 'approve' ? 'Approve' : 'Reject'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
