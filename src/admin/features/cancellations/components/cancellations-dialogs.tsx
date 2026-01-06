import { ProcessCancellationDialog } from './process-cancellation-dialog'
import { CancellationDetailDialog } from './cancellation-detail-dialog'

export function CancellationsDialogs() {
    return (
        <>
            <ProcessCancellationDialog />
            <CancellationDetailDialog />
        </>
    )
}
