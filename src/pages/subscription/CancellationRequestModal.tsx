import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toaster } from '@/hooks/useToaster';
import { Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/shadui/dialog';
import { Button } from '@/components/shadui/button';
import { Textarea } from '@/components/shadui/textarea';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/shadui/form';
import { useRequestCancellation } from '@/hooks/user/useCancellations';
import { userCancellationRequestSchema } from '@/api/services/cancellation/cancellation.schemas';
import type { UserCancellationRequest } from '@/api/services/cancellation/cancellation.types';

interface CancellationRequestModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    subscriptionId: string | null;
    planName: string;
    onSuccess?: () => void;
}

export function CancellationRequestModal({
    open,
    onOpenChange,
    subscriptionId,
    planName,
    onSuccess,
}: CancellationRequestModalProps) {
    const requestMutation = useRequestCancellation();

    const form = useForm<UserCancellationRequest>({
        resolver: zodResolver(userCancellationRequestSchema),
        defaultValues: {
            subscription_id: subscriptionId || '',
            reason: '',
        },
    });

    // Update subscription_id when it changes
    if (subscriptionId && form.getValues('subscription_id') !== subscriptionId) {
        form.setValue('subscription_id', subscriptionId);
    }

    const handleSubmit = async (data: UserCancellationRequest) => {
        try {
            await requestMutation.mutateAsync(data);
            toaster.success('Cancellation request submitted. We will review it shortly.');
            onOpenChange(false);
            form.reset();
            onSuccess?.();
        } catch (error) {
            toaster.error('Failed to submit cancellation request');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Request Cancellation</DialogTitle>
                    <DialogDescription>
                        Request to cancel your <span className="font-medium">{planName}</span> subscription.
                        Your request will be reviewed by our team.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reason for cancellation</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Please tell us why you want to cancel..."
                                            rows={4}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 text-sm text-amber-800">
                            <p className="font-medium mb-1">Please note:</p>
                            <ul className="list-disc list-inside space-y-1 text-amber-700">
                                <li>Cancellation takes effect at the end of your billing period</li>
                                <li>You will retain access until then</li>
                                <li>Our team will review your request within 24-48 hours</li>
                            </ul>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Keep Subscription
                            </Button>
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={requestMutation.isPending || !subscriptionId}
                            >
                                {requestMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit Request
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
