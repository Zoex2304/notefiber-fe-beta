import { Label } from '@admin/components/ui/label'
import { Input } from '@admin/components/ui/input'
import { cn } from '@admin/lib/utils'
import { Zap } from 'lucide-react'

interface TokenLimitInputProps {
    value: number
    onChange: (value: number) => void
    error?: string
    disabled?: boolean
    className?: string
}

export function TokenLimitInput({
    value,
    onChange,
    error,
    disabled,
    className,
}: TokenLimitInputProps) {
    return (
        <div className={cn('space-y-2', className)}>
            <Label htmlFor='token-limit'>Daily AI Token Limit</Label>
            <div className='relative'>
                <Zap className='text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' />
                <Input
                    id='token-limit'
                    type='number'
                    step='1'
                    min='0'
                    placeholder='0 (unlimited)'
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value) || 0)}
                    disabled={disabled}
                    className={cn('pl-9', error && 'border-destructive')}
                />
            </div>
            <p className='text-muted-foreground text-xs'>
                Set to 0 for unlimited AI requests
            </p>
            {error && <p className='text-destructive text-sm'>{error}</p>}
        </div>
    )
}
