import { Copy, Check } from 'lucide-react'
import { Button } from '@admin/components/ui/button'
import { useState } from 'react'
import { cn } from '@admin/lib/utils'

interface RefundIdDisplayProps {
    refundId: string
    className?: string
}

export function RefundIdDisplay({ refundId, className }: RefundIdDisplayProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        await navigator.clipboard.writeText(refundId)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <code className='bg-muted relative rounded px-3 py-2 font-mono text-sm'>
                {refundId}
            </code>
            <Button
                variant='ghost'
                size='sm'
                onClick={handleCopy}
                className='h-8 w-8 p-0'
            >
                {copied ? (
                    <Check className='h-4 w-4 text-green-600' />
                ) : (
                    <Copy className='h-4 w-4' />
                )}
            </Button>
        </div>
    )
}
