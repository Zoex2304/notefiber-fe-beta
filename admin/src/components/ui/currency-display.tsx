interface CurrencyDisplayProps {
    amount: number
    currency?: string
    locale?: string
    className?: string
}

export function CurrencyDisplay({
    amount,
    currency = 'USD',
    locale = 'en-US',
    className,
}: CurrencyDisplayProps) {
    const formatted = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount)

    return <span className={className}>{formatted}</span>
}

// Compact version for large numbers
export function CompactCurrencyDisplay({
    amount,
    currency = 'USD',
    locale = 'en-US',
    className,
}: CurrencyDisplayProps) {
    const formatted = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(amount)

    return <span className={className}>{formatted}</span>
}
