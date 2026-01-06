import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { RefundListItem } from '@admin/lib/types/admin-api'

interface RefundsContextType {
    selectedRefund: RefundListItem | null
    setSelectedRefund: (refund: RefundListItem | null) => void
    approvalDialogOpen: boolean
    setApprovalDialogOpen: (open: boolean) => void
    detailDialogOpen: boolean
    setDetailDialogOpen: (open: boolean) => void
    rejectionDialogOpen: boolean
    setRejectionDialogOpen: (open: boolean) => void
}

const RefundsContext = createContext<RefundsContextType | undefined>(undefined)

export function RefundsProvider({ children }: { children: ReactNode }) {
    const [selectedRefund, setSelectedRefund] = useState<RefundListItem | null>(null)
    const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
    const [detailDialogOpen, setDetailDialogOpen] = useState(false)
    const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false)

    return (
        <RefundsContext.Provider
            value={{
                selectedRefund,
                setSelectedRefund,
                approvalDialogOpen,
                setApprovalDialogOpen,
                detailDialogOpen,
                setDetailDialogOpen,
                rejectionDialogOpen,
                setRejectionDialogOpen,
            }}
        >
            {children}
        </RefundsContext.Provider>
    )
}

export function useRefundsContext() {
    const context = useContext(RefundsContext)
    if (context === undefined) {
        throw new Error('useRefundsContext must be used within a RefundsProvider')
    }
    return context
}
