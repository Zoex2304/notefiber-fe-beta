import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { AdminCancellation } from '@admin/lib/types/admin-api'

interface CancellationsContextType {
    selectedCancellation: AdminCancellation | null
    setSelectedCancellation: (cancellation: AdminCancellation | null) => void
    processDialogOpen: boolean
    setProcessDialogOpen: (open: boolean) => void
    detailDialogOpen: boolean
    setDetailDialogOpen: (open: boolean) => void
}

const CancellationsContext = createContext<CancellationsContextType | undefined>(undefined)

export function CancellationsProvider({ children }: { children: ReactNode }) {
    const [selectedCancellation, setSelectedCancellation] = useState<AdminCancellation | null>(null)
    const [processDialogOpen, setProcessDialogOpen] = useState(false)
    const [detailDialogOpen, setDetailDialogOpen] = useState(false)

    return (
        <CancellationsContext.Provider
            value={{
                selectedCancellation,
                setSelectedCancellation,
                processDialogOpen,
                setProcessDialogOpen,
                detailDialogOpen,
                setDetailDialogOpen,
            }}
        >
            {children}
        </CancellationsContext.Provider>
    )
}

export function useCancellationsContext() {
    const context = useContext(CancellationsContext)
    if (context === undefined) {
        throw new Error('useCancellationsContext must be used within a CancellationsProvider')
    }
    return context
}
