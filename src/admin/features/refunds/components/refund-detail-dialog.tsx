import { format } from 'date-fns'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@admin/components/ui/dialog'
import { Badge } from '@admin/components/ui/badge'
import { Separator } from '@admin/components/ui/separator'
import type { RefundListItem, RefundStatus } from '@admin/lib/types/admin-api'

interface RefundDetailDialogProps {
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

const statusBadgeVariant: Record<RefundStatus, 'default' | 'secondary' | 'destructive'> = {
    pending: 'secondary',
    approved: 'default',
    rejected: 'destructive',
}

export function RefundDetailDialog({ open, onOpenChange, refund }: RefundDetailDialogProps) {
    if (!refund) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Refund Request Details</DialogTitle>
                    <DialogDescription>
                        Request ID: {refund.id.slice(0, 8)}...
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* User Info */}
                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">User Information</h4>
                        <div className="space-y-1">
                            <p className="font-medium">{refund.user.full_name}</p>
                            <p className="text-sm text-muted-foreground">{refund.user.email}</p>
                        </div>
                    </div>

                    <Separator />

                    {/* Subscription Info */}
                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Subscription</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="text-muted-foreground">Plan:</span>
                            <span>{refund.subscription.plan_name}</span>
                            <span className="text-muted-foreground">Amount Paid:</span>
                            <span>{formatCurrency(refund.subscription.amount_paid)}</span>
                            <span className="text-muted-foreground">Payment Date:</span>
                            <span>{format(new Date(refund.subscription.payment_date), 'PPP')}</span>
                        </div>
                    </div>

                    <Separator />

                    {/* Refund Info */}
                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Refund Request</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Amount:</span>
                                <span className="font-medium">{formatCurrency(refund.amount)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Status:</span>
                                <Badge variant={statusBadgeVariant[refund.status]}>
                                    {refund.status.charAt(0).toUpperCase() + refund.status.slice(1)}
                                </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Requested:</span>
                                <span className="text-sm">{format(new Date(refund.created_at), 'PPp')}</span>
                            </div>
                            {refund.processed_at && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Processed:</span>
                                    <span className="text-sm">{format(new Date(refund.processed_at), 'PPp')}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Reason */}
                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Reason</h4>
                        <p className="text-sm bg-muted p-3 rounded-md">{refund.reason}</p>
                    </div>

                    {refund.admin_notes && (
                        <>
                            <Separator />
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Admin Notes</h4>
                                <p className="text-sm bg-muted p-3 rounded-md">{refund.admin_notes}</p>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
