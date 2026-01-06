import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@admin/components/ui/sheet'
import { Badge } from '@admin/components/ui/badge'
import { type SystemLog } from '@admin/lib/types/admin-api'
import { useLog } from '../hooks/use-logs'

type LogDetailSheetProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    logId: string | null
    initialData?: SystemLog
}

export function LogDetailSheet({
    open,
    onOpenChange,
    logId,
    initialData,
}: LogDetailSheetProps) {
    // If we have initial data (from the row), use it while loading full details
    // But ideally we fetch full details if there are extra fields not in the list
    const { data: fullLog } = useLog(logId || '')

    const log = fullLog || initialData

    if (!log) return null

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className='w-[400px] sm:w-[540px] overflow-y-auto'>
                <SheetHeader>
                    <SheetTitle>Log Details</SheetTitle>
                    <SheetDescription>
                        View detailed information about this system log.
                    </SheetDescription>
                </SheetHeader>
                <div className='mt-6 space-y-6'>
                    <div>
                        <h4 className='text-sm font-medium text-muted-foreground mb-1'>Log ID</h4>
                        <p className='font-mono text-sm break-all'>{log.id}</p>
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                        <div>
                            <h4 className='text-sm font-medium text-muted-foreground mb-1'>Level</h4>
                            <Badge
                                variant={
                                    log.level === 'error' ? 'destructive' :
                                        log.level === 'warn' ? 'secondary' : 'default'
                                }
                            >
                                {log.level.toUpperCase()}
                            </Badge>
                        </div>
                        <div>
                            <h4 className='text-sm font-medium text-muted-foreground mb-1'>Module</h4>
                            <p className='text-sm font-medium'>{log.module}</p>
                        </div>
                    </div>

                    <div>
                        <h4 className='text-sm font-medium text-muted-foreground mb-1'>Timestamp</h4>
                        <p className='text-sm'>{new Date(log.created_at).toLocaleString()}</p>
                    </div>

                    <div>
                        <h4 className='text-sm font-medium text-muted-foreground mb-1'>Message</h4>
                        <p className='text-sm bg-muted p-3 rounded-md whitespace-pre-wrap'>{log.message}</p>
                    </div>

                    {/* Details (JSON) */}
                    {log.details && (
                        <div>
                            <h4 className='text-sm font-medium text-muted-foreground mb-1'>Additional Details</h4>
                            <pre className='text-xs bg-muted p-3 rounded-md overflow-x-auto font-mono'>
                                {JSON.stringify(log.details, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}
