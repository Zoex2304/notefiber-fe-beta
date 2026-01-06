import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/shadui/alert-dialog';
import { useNavigate } from '@tanstack/react-router';

interface TokenLimitDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    dailyLimit: number;
}

export function TokenLimitDialog({ open, onOpenChange, dailyLimit }: TokenLimitDialogProps) {
    const navigate = useNavigate();

    const handleUpgrade = () => {
        onOpenChange(false);
        navigate({ to: '/pricing' });
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Daily AI Limit Reached</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                        <p>
                            You've used all {dailyLimit} of your AI requests for today.
                        </p>
                        <p>
                            Your usage will reset in 24 hours, or you can upgrade your plan for higher limits.
                        </p>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Close</AlertDialogCancel>
                    <AlertDialogAction onClick={handleUpgrade}>
                        Upgrade Plan
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
