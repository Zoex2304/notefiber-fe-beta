import { Label } from '@admin/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@admin/components/ui/select'
import { Textarea } from '@admin/components/ui/textarea'
import { cn } from '@admin/lib/utils'
import { useState } from 'react'

interface RefundReasonSelectProps {
    value: string
    onChange: (value: string) => void
    error?: string
    disabled?: boolean
    className?: string
}

const PRESET_REASONS = [
    'User requested cancellation',
    'Billing error',
    'Service not as expected',
    'Technical issues',
    'Duplicate charge',
    'Other',
]

export function RefundReasonSelect({
    value,
    onChange,
    error,
    disabled,
    className,
}: RefundReasonSelectProps) {
    const [selectedPreset, setSelectedPreset] = useState<string>('')
    const [customReason, setCustomReason] = useState<string>(value)

    const handlePresetChange = (preset: string) => {
        setSelectedPreset(preset)
        if (preset === 'Other') {
            onChange(customReason)
        } else {
            onChange(preset)
        }
    }

    const handleCustomChange = (custom: string) => {
        setCustomReason(custom)
        if (selectedPreset === 'Other') {
            onChange(custom)
        }
    }

    return (
        <div className={cn('space-y-3', className)}>
            <div className='space-y-2'>
                <Label htmlFor='refund-reason'>Refund Reason</Label>
                <Select
                    value={selectedPreset}
                    onValueChange={handlePresetChange}
                    disabled={disabled}
                >
                    <SelectTrigger
                        id='refund-reason'
                        className={cn(error && 'border-destructive')}
                    >
                        <SelectValue placeholder='Select a reason' />
                    </SelectTrigger>
                    <SelectContent>
                        {PRESET_REASONS.map((reason) => (
                            <SelectItem key={reason} value={reason}>
                                {reason}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {selectedPreset === 'Other' && (
                <div className='space-y-2'>
                    <Label htmlFor='custom-reason'>Custom Reason</Label>
                    <Textarea
                        id='custom-reason'
                        placeholder='Provide details...'
                        value={customReason}
                        onChange={(e) => handleCustomChange(e.target.value)}
                        disabled={disabled}
                        className={cn(error && 'border-destructive')}
                    />
                </div>
            )}

            {error && <p className='text-destructive text-sm'>{error}</p>}
        </div>
    )
}
