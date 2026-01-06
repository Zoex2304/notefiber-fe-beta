import { Label } from '@admin/components/ui/label'
import { Input } from '@admin/components/ui/input'
import { cn } from '@admin/lib/utils'
import { DollarSign } from 'lucide-react'

interface AmountInputProps {
    value: number
    onChange: (value: number) => void
    maxAmount?: number
    error?: string
    disabled?: boolean
    className?: string
}

export function AmountInput({
    value,
    onChange,
    maxAmount,
    error,
    disabled,
    className,
}: AmountInputProps) {
    const handleChange = (newValue: number) => {
        if (maxAmount && newValue > maxAmount) {
            onChange(maxAmount)
        } else {
            onChange(newValue)
        }
    }

    return (
        <div className={cn('space-y-2', className)}>
            <Label htmlFor='refund-amount'>Refund Amount (USD)</Label>
            <div className='relative'>
                <DollarSign className='text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' />
                <Input
                    id='refund-amount'
                    type='number'
                    step='0.01'
                    min='0'
                    max={maxAmount}
                    placeholder='Enter amount'
                    value={value}
                    onChange={(e) => handleChange(parseFloat(e.target.value) || 0)}
                    disabled={disabled}
                    className={cn('pl-9', error && 'border-destructive')}
                />
            </div>
            {maxAmount && (
                <p className='text-muted-foreground text-xs'>
                    Maximum: ${maxAmount.toFixed(2)}
                </p>
            )}
            {error && <p className='text-destructive text-sm'>{error}</p>}
        </div>
    )
}
