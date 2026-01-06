import { RefundDetailDialog } from './refund-detail-dialog'
import { RefundApprovalDialog } from './refund-approval-dialog'
import { RefundRejectionDialog } from './refund-rejection-dialog'
import { useRefundsContext } from './refunds-provider'

export function RefundsDialogs() {
    const {
        selectedRefund,
        detailDialogOpen,
        setDetailDialogOpen,
        approvalDialogOpen,
        setApprovalDialogOpen,
        rejectionDialogOpen,
        setRejectionDialogOpen,
    } = useRefundsContext()

    return (
        <>
            <RefundDetailDialog
                open={detailDialogOpen}
                onOpenChange={setDetailDialogOpen}
                refund={selectedRefund}
            />
            <RefundApprovalDialog
                open={approvalDialogOpen}
                onOpenChange={setApprovalDialogOpen}
                refund={selectedRefund}
            />
            <RefundRejectionDialog
                open={rejectionDialogOpen}
                onOpenChange={setRejectionDialogOpen}
                refund={selectedRefund}
            />
        </>
    )
}
