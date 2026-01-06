import { Label } from '@admin/components/ui/label'
import { Input } from '@admin/components/ui/input'
import { cn } from '@admin/lib/utils'

interface PlanNameInputProps {
    value: string
    onChange: (value: string) => void
    error?: string
    disabled?: boolean
    className?: string
}

export function PlanNameInput({
    value,
    onChange,
    error,
    disabled,
    className,
}: PlanNameInputProps) {
    return (
        <div className={cn('space-y-2', className)}>
            <Label htmlFor='plan-name'>Plan Name</Label>
            <Input
                id='plan-name'
                placeholder='e.g., Pro Plan'
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className={cn(error && 'border-destructive')}
            />
            {error && <p className='text-destructive text-sm'>{error}</p>}
        </div>
    )
}
