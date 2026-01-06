import { Label } from '@admin/components/ui/label'
import { Input } from '@admin/components/ui/input'
import { cn } from '@admin/lib/utils'

interface PlanSlugInputProps {
    value: string
    onChange: (value: string) => void
    error?: string
    disabled?: boolean
    className?: string
}

export function PlanSlugInput({
    value,
    onChange,
    error,
    disabled,
    className,
}: PlanSlugInputProps) {
    // Auto-format slug as user types
    const handleChange = (newValue: string) => {
        const formatted = newValue
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/--+/g, '-')
        onChange(formatted)
    }

    return (
        <div className={cn('space-y-2', className)}>
            <Label htmlFor='plan-slug'>Slug</Label>
            <Input
                id='plan-slug'
                placeholder='e.g., pro-plan'
                value={value}
                onChange={(e) => handleChange(e.target.value)}
                disabled={disabled}
                className={cn(error && 'border-destructive')}
            />
            <p className='text-muted-foreground text-xs'>
                URL-friendly identifier (lowercase, alphanumeric, hyphens only)
            </p>
            {error && <p className='text-destructive text-sm'>{error}</p>}
        </div>
    )
}
