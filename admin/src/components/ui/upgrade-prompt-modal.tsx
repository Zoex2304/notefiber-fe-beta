import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@admin/components/ui/dialog'
import { Button } from '@admin/components/ui/button'
import { Zap, TrendingUp } from 'lucide-react'

interface UpgradePromptModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentUsage: number
    currentLimit: number
    onUpgrade?: () => void
}

export function UpgradePromptModal({
    open,
    onOpenChange,
    currentUsage,
    currentLimit,
    onUpgrade,
}: UpgradePromptModalProps) {
    const percentage = (currentUsage / currentLimit) * 100

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
                        <Zap className='h-6 w-6 text-primary' />
                    </div>
                    <DialogTitle className='text-center'>
                        {percentage >= 100
                            ? 'AI Token Limit Reached'
                            : 'Approaching AI Token Limit'}
                    </DialogTitle>
                    <DialogDescription className='text-center'>
                        You've used {currentUsage} of your {currentLimit} daily AI requests (
                        {Math.round(percentage)}%).{' '}
                        {percentage >= 100
                            ? 'Upgrade to continue using AI features.'
                            : 'Consider upgrading for higher limits.'}
                    </DialogDescription>
                </DialogHeader>

                <div className='bg-muted rounded-lg p-4'>
                    <div className='flex items-center gap-3'>
                        <TrendingUp className='text-primary h-5 w-5' />
                        <div className='flex-1'>
                            <p className='font-medium'>Upgrade to Pro</p>
                            <p className='text-muted-foreground text-sm'>
                                Get 500 AI requests per day
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className='sm:justify-center'>
                    <Button variant='outline' onClick={() => onOpenChange(false)}>
                        Maybe Later
                    </Button>
                    <Button onClick={onUpgrade}>
                        <TrendingUp className='mr-2 h-4 w-4' />
                        Upgrade Now
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
