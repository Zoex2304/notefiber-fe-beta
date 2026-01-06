import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, AlertCircle } from 'lucide-react';
import { toaster } from '@/hooks/useToaster';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/shadui/dialog';
import { Button } from '@/components/shadui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/shadui/form';
import { Textarea } from '@/components/shadui/textarea';
import { Alert, AlertDescription } from '@/components/shadui/alert';
import { refundService } from '@/api/services/refund/refund.service';

const refundFormSchema = z.object({
    reason: z.string()
        .min(10, 'Reason must be at least 10 characters')
        .max(500, 'Reason must not exceed 500 characters'),
});

type RefundFormValues = z.infer<typeof refundFormSchema>;

interface RefundRequestModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    subscriptionId: string | null;
    planName: string;
    onSuccess?: () => void;
}

export function RefundRequestModal({
    open,
    onOpenChange,
    subscriptionId,
    planName,
    onSuccess,
}: RefundRequestModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<RefundFormValues>({
        resolver: zodResolver(refundFormSchema),
        defaultValues: {
            reason: '',
        },
    });

    const handleSubmit = async (data: RefundFormValues) => {
        if (!subscriptionId) {
            toaster.error('No active subscription found for refund request.');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await refundService.requestRefund({
                subscription_id: subscriptionId,
                reason: data.reason,
            });

            if (response.success) {
                toaster.success(response.data?.message || 'Refund request submitted successfully!');
                form.reset();
                onOpenChange(false);
                onSuccess?.();
            } else {
                toaster.error(response.message || 'Failed to submit refund request.');
            }
        } catch (error: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const errorMessage = (error as any)?.response?.data?.message || (error instanceof Error ? error.message : 'Failed to submit refund request. Please try again.');
            toaster.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        form.reset();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleCancel}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Request Refund</DialogTitle>
                    <DialogDescription>
                        Submit a refund request for your <strong>{planName}</strong> subscription.
                        Our team will review your request within 3 business days.
                    </DialogDescription>
                </DialogHeader>

                <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-700 dark:text-amber-400">
                        Refunds are processed manually. Once approved, the refund will be transferred
                        to your original payment method within 5-7 business days.
                    </AlertDescription>
                </Alert>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reason for Refund</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="Please explain why you're requesting a refund..."
                                            rows={4}
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Minimum 10 characters required. Please be as specific as possible.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit Request
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
