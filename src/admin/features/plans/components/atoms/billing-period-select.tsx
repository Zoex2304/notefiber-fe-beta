import { Label } from '@admin/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@admin/components/ui/select'
import { cn } from '@admin/lib/utils'
import type { BillingPeriod } from '../../data/schema'

interface BillingPeriodSelectProps {
    value: BillingPeriod
    onChange: (value: BillingPeriod) => void
    error?: string
    disabled?: boolean
    className?: string
}

export function BillingPeriodSelect({
    value,
    onChange,
    error,
    disabled,
    className,
}: BillingPeriodSelectProps) {
    return (
        <div className={cn('space-y-2', className)}>
            <Label htmlFor='billing-period'>Billing Period</Label>
            <Select value={value} onValueChange={onChange} disabled={disabled}>
                <SelectTrigger
                    id='billing-period'
                    className={cn(error && 'border-destructive')}
                >
                    <SelectValue placeholder='Select billing period' />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value='monthly'>Monthly</SelectItem>
                    <SelectItem value='yearly'>Yearly</SelectItem>
                </SelectContent>
            </Select>
            {error && <p className='text-destructive text-sm'>{error}</p>}
        </div>
    )
}
