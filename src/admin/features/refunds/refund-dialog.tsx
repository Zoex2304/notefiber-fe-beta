import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { toaster } from '@admin/hooks/useToaster';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@admin/components/ui/dialog';
import { Button } from '@admin/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@admin/components/ui/form';
import { Input } from '@admin/components/ui/input';
import { Textarea } from '@admin/components/ui/textarea';
import { adminRefundsApi } from '@admin/lib/api/admin-api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { RecentTransaction } from '@admin/lib/types/admin-api';

const refundSchema = z.object({
    subscription_id: z.string().min(1, 'Subscription ID is required'),
    reason: z.string().min(10, 'Reason must be at least 10 characters'),
    amount: z.string().optional(),
});

type RefundFormValues = z.infer<typeof refundSchema>;

interface RefundDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transaction?: RecentTransaction;
}

export function RefundDialog({ open, onOpenChange, transaction }: RefundDialogProps) {
    const [step, setStep] = useState<'form' | 'confirm'>('form');
    const queryClient = useQueryClient();

    const form = useForm<RefundFormValues>({
        resolver: zodResolver(refundSchema),
        defaultValues: {
            subscription_id: transaction?.id || '',
            reason: '',
            amount: transaction?.amount.toString() || '',
        },
    });

    const refundMutation = useMutation({
        mutationFn: async (data: RefundFormValues) => {
            const refundData = {
                subscription_id: data.subscription_id,
                reason: data.reason,
                ...(data.amount && { amount: parseFloat(data.amount) }),
            };
            return adminRefundsApi.processRefund(refundData);
        },
        onSuccess: (data) => {
            toaster.success(`Refund processed successfully! Refund ID: ${data.refund_id}`);
            queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
            form.reset();
            setStep('form');
            onOpenChange(false);
        },
        onError: (error: any) => {
            toaster.error(error.response?.data?.message || 'Failed to process refund');
        },
    });

    const handleSubmit = (data: RefundFormValues) => {
        setStep('confirm');
    };

    const handleConfirm = () => {
        refundMutation.mutate(form.getValues());
    };

    const handleBack = () => {
        setStep('form');
    };

    const handleCancel = () => {
        form.reset();
        setStep('form');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleCancel}>
            <DialogContent className="sm:max-w-[500px]">
                {step === 'form' ? (
                    <>
                        <DialogHeader>
                            <DialogTitle>Process Refund</DialogTitle>
                            <DialogDescription>
                                Enter the refund details below. This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="subscription_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Subscription ID</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    disabled={!!transaction}
                                                    placeholder="Enter subscription ID"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="reason"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Reason</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    {...field}
                                                    placeholder="Enter reason for refund (e.g., customer request, technical issue)"
                                                    rows={4}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Provide a detailed reason (minimum 10 characters)
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Amount (USD)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="Leave empty for full refund"
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Optional: Enter partial refund amount
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={handleCancel}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">
                                        Continue
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>Confirm Refund</DialogTitle>
                            <DialogDescription>
                                Please review the refund details before proceeding.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subscription ID:</span>
                                    <span className="font-medium">{form.getValues('subscription_id')}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Amount:</span>
                                    <span className="font-medium">
                                        ${form.getValues('amount') || 'Full refund'}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-sm text-muted-foreground">Reason:</span>
                                    <p className="text-sm rounded-md bg-muted p-2">
                                        {form.getValues('reason')}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleBack}
                                disabled={refundMutation.isPending}
                            >
                                Back
                            </Button>
                            <Button
                                onClick={handleConfirm}
                                disabled={refundMutation.isPending}
                            >
                                {refundMutation.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Process Refund
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
