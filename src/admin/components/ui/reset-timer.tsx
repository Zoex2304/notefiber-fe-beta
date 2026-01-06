import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { cn } from '@admin/lib/utils'

interface ResetTimerProps {
    lastResetDate: string | Date
    className?: string
}

export function ResetTimer({ lastResetDate, className }: ResetTimerProps) {
    const [timeLeft, setTimeLeft] = useState('')

    useEffect(() => {
        const calculateTimeLeft = () => {
            const lastReset = new Date(lastResetDate)
            const nextReset = new Date(lastReset.getTime() + 24 * 60 * 60 * 1000) // +24 hours
            const now = new Date()
            const diff = nextReset.getTime() - now.getTime()

            if (diff <= 0) {
                return 'Resetting...'
            }

            const hours = Math.floor(diff / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

            return `${hours}h ${minutes}m`
        }

        setTimeLeft(calculateTimeLeft())

        const interval = setInterval(() => {
            setTimeLeft(calculateTimeLeft())
        }, 60000) // Update every minute

        return () => clearInterval(interval)
    }, [lastResetDate])

    return (
        <div className={cn('text-muted-foreground flex items-center gap-2 text-sm', className)}>
            <Clock className='h-4 w-4' />
            <span>Resets in {timeLeft}</span>
        </div>
    )
}
