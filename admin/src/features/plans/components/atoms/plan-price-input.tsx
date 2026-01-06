import { Label } from '@admin/components/ui/label'
import { CleanNumberInput } from './clean-number-input'
import { cn } from '@admin/lib/utils'
import { DollarSign } from 'lucide-react'

interface PlanPriceInputProps {
    value: number
    onChange: (value: number) => void
    error?: string
    disabled?: boolean
    className?: string
}

export function PlanPriceInput({
    value,
    onChange,
    error,
    disabled,
    className,
}: PlanPriceInputProps) {
    return (
        <div className={cn('space-y-2', className)}>
            <Label htmlFor='plan-price'>Price (USD)</Label>
            <div className='relative'>
                <DollarSign className='text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' />
                <CleanNumberInput
                    id='plan-price'
                    placeholder='0.00'
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className={cn('pl-9', error && 'border-destructive')}
                    min={0}
                />
            </div>
            {error && <p className='text-destructive text-sm'>{error}</p>}
        </div>
    )
}
