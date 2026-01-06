import { ActionTooltip } from '@/components/common/ActionTooltip';
import { Button } from '@/components/shadui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadui/card';
import { Badge } from '@/components/shadui/badge';
import { Skeleton } from '@/components/shadui/skeleton';
import { Separator } from '@/components/shadui/separator';
import { useRefundDetail } from '@/hooks/user/useRefunds';
import { useParams, useRouter } from '@tanstack/react-router';
import { format } from 'date-fns';
import { MoveLeft, Clock, CheckCircle, XCircle, FileText, Receipt, ShieldAlert } from 'lucide-react';
import type { UserRefund } from '@/api/services/refund/refund.types';

const statusConfig: Record<
    UserRefund['status'],
    { icon: typeof Clock; variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; color: string }
> = {
    pending: { icon: Clock, variant: 'secondary', label: 'Processing', color: 'text-muted-foreground' },
    approved: { icon: CheckCircle, variant: 'default', label: 'Refunded', color: 'text-green-600 dark:text-green-400' },
    rejected: { icon: XCircle, variant: 'destructive', label: 'Declined', color: 'text-destructive' },
};

export function RefundDetail() {
    // strict: false allows us to access params that might be defined in the route but not strictly inferred here without the route context
    const params = useParams({ strict: false }) as { refundId: string };
    const id = params.refundId;
    const router = useRouter();
    const { data: refund, isLoading, error } = useRefundDetail(id);

    if (isLoading) {
        return (
            <div className="container max-w-2xl mx-auto p-6 space-y-6">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (error || !refund) {
        return (
            <div className="container max-w-2xl mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <ShieldAlert className="h-12 w-12 text-muted-foreground" />
                <h2 className="text-xl font-semibold text-foreground">Refund Record Not Found</h2>
                <Button variant="outline" onClick={() => router.history.back()}>
                    Go Back
                </Button>
            </div>
        );
    }

    const config = statusConfig[refund.status];
    const StatusIcon = config.icon;

    return (
        <div className="container max-w-2xl mx-auto p-6 space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <ActionTooltip label="Go Back">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.history.back()}
                        className="h-10 w-10 shrink-0 rounded-full hover:bg-muted"
                    >
                        <MoveLeft className="h-5 w-5 text-muted-foreground" />
                    </Button>
                </ActionTooltip>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Refund Details</h1>
                    <p className="text-muted-foreground text-sm">Reference ID: <span className="font-mono text-muted-foreground/60">{refund.id.slice(0, 8)}</span></p>
                </div>
            </div>

            <Card className="shadow-sm border-border overflow-hidden bg-card">
                <div className={`h-2 w-full ${refund.status === 'approved' ? 'bg-green-500' : refund.status === 'rejected' ? 'bg-destructive' : 'bg-muted'}`} />
                <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2 text-card-foreground">
                                Refund for {refund.plan_name}
                            </CardTitle>
                            <CardDescription className="mt-1">
                                Submitted on {format(new Date(refund.created_at), 'PPP')} at {format(new Date(refund.created_at), 'p')}
                            </CardDescription>
                        </div>
                        <Badge variant={config.variant} className="gap-1.5 px-3 py-1">
                            <StatusIcon className="h-3.5 w-3.5" />
                            {config.label}
                        </Badge>
                    </div>
                </CardHeader>
                <Separator />
                <CardContent className="p-6 space-y-6">
                    {/* Amount */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Receipt className="h-4 w-4 text-muted-foreground/70" />
                            Refund Amount
                        </label>
                        <div className="text-2xl font-bold text-foreground">
                            {(refund.amount / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground/70" />
                            Reason for Request
                        </label>
                        <div className="bg-muted/50 rounded-lg p-4 text-sm text-foreground border border-border">
                            {refund.reason}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
