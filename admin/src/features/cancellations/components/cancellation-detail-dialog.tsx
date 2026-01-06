import { format } from 'date-fns'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@admin/components/ui/dialog'
import { Badge } from '@admin/components/ui/badge'
import { useCancellationsContext } from './cancellations-provider'
import type { CancellationStatus } from '@admin/lib/types/admin-api'

const statusBadgeVariant: Record<CancellationStatus, 'default' | 'secondary' | 'destructive'> = {
    pending: 'secondary',
    approved: 'default',
    rejected: 'destructive',
}

export function CancellationDetailDialog() {
    const { selectedCancellation, detailDialogOpen, setDetailDialogOpen } = useCancellationsContext()

    if (!selectedCancellation) return null

    return (
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Cancellation Request Details</DialogTitle>
                    <DialogDescription>
                        Full details for this cancellation request.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-muted-foreground block">User</span>
                            <span className="font-medium">{selectedCancellation.user_name || 'N/A'}</span>
                            <span className="text-xs text-muted-foreground block">{selectedCancellation.user_email}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block">Plan</span>
                            <span className="font-medium">{selectedCancellation.plan_name}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block">Status</span>
                            <Badge variant={statusBadgeVariant[selectedCancellation.status]}>
                                {selectedCancellation.status.charAt(0).toUpperCase() + selectedCancellation.status.slice(1)}
                            </Badge>
                        </div>
                        <div>
                            <span className="text-muted-foreground block">Effective Date</span>
                            <span className="font-medium">{format(new Date(selectedCancellation.effective_date), 'PP')}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block">Requested At</span>
                            <span className="font-medium">{format(new Date(selectedCancellation.created_at), 'PPpp')}</span>
                        </div>
                        {selectedCancellation.processed_at && (
                            <div>
                                <span className="text-muted-foreground block">Processed At</span>
                                <span className="font-medium">{format(new Date(selectedCancellation.processed_at), 'PPpp')}</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <span className="text-muted-foreground text-sm">Reason</span>
                        <p className="text-sm bg-muted p-3 rounded-md">{selectedCancellation.reason}</p>
                    </div>

                    {selectedCancellation.admin_notes && (
                        <div className="space-y-2">
                            <span className="text-muted-foreground text-sm">Admin Notes</span>
                            <p className="text-sm bg-muted p-3 rounded-md">{selectedCancellation.admin_notes}</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
