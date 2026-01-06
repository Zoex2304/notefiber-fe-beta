import { format, formatDistanceToNow } from 'date-fns'

interface DateDisplayProps {
    date: string | Date
    formatString?: string
    className?: string
}

export function DateDisplay({
    date,
    formatString = 'PPP',
    className,
}: DateDisplayProps) {
    const dateObj = typeof date === 'string' ? new Date(date) : date

    return <span className={className}>{format(dateObj, formatString)}</span>
}

interface RelativeDateDisplayProps {
    date: string | Date
    addSuffix?: boolean
    className?: string
}

export function RelativeDateDisplay({
    date,
    addSuffix = true,
    className,
}: RelativeDateDisplayProps) {
    const dateObj = typeof date === 'string' ? new Date(date) : date

    return (
        <span className={className}>
            {formatDistanceToNow(dateObj, { addSuffix })}
        </span>
    )
}

interface DateTimeDisplayProps {
    date: string | Date
    showTime?: boolean
    className?: string
}

export function DateTimeDisplay({
    date,
    showTime = true,
    className,
}: DateTimeDisplayProps) {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const formatString = showTime ? 'PPp' : 'PP'

    return <span className={className}>{format(dateObj, formatString)}</span>
}
