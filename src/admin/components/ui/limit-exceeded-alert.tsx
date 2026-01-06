import { Alert, AlertDescription, AlertTitle } from '@admin/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface LimitExceededAlertProps {
    limit: number
    used: number
}

export function LimitExceededAlert({ limit, used }: LimitExceededAlertProps) {
    return (
        <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>Daily AI Limit Reached</AlertTitle>
            <AlertDescription>
                You've used all {used} of your {limit} daily AI requests. Your usage will
                reset in 24 hours from your last reset, or you can upgrade your plan for a
                higher limit.
            </AlertDescription>
        </Alert>
    )
}
