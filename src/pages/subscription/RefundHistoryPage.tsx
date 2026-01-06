import { ActionTooltip } from '@/components/common/ActionTooltip';
import { Button } from '@/components/shadui/button';
import { Card, CardContent } from '@/components/shadui/card';
import { Badge } from '@/components/shadui/badge';
import { Skeleton } from '@/components/shadui/skeleton';
import { useRefundHistory } from '@/hooks/user/useRefunds';
import { useNavigate } from '@tanstack/react-router';
import { format } from 'date-fns';
import { MoveLeft, Clock, CheckCircle, XCircle, ChevronRight, Receipt } from 'lucide-react';
import type { UserRefund } from '@/api/services/refund/refund.types';

const statusConfig: Record<
    UserRefund['status'],
    { icon: typeof Clock; variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }
> = {
    pending: { icon: Clock, variant: 'secondary', label: 'Processing' },
    approved: { icon: CheckCircle, variant: 'default', label: 'Refunded' },
    rejected: { icon: XCircle, variant: 'destructive', label: 'Declined' },
};

export function RefundHistoryPage() {
    const navigate = useNavigate();
    const { data: history = [], isLoading } = useRefundHistory();

    if (isLoading) {
        return (
            <div className="container max-w-3xl mx-auto p-6 space-y-6">
                <Skeleton className="h-8 w-48" />
                <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            </div>
        );
    }

    return (
        <div className="container max-w-3xl mx-auto p-6 space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <ActionTooltip label="Go Back">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate({ to: '/app/subscription' })}
                        className="h-10 w-10 shrink-0 rounded-full hover:bg-gray-100"
                    >
                        <MoveLeft className="h-5 w-5 text-gray-600" />
                    </Button>
                </ActionTooltip>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Refund History</h1>
                    <p className="text-gray-500 text-sm">Track the status of your refund requests</p>
                </div>
            </div>

            {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Receipt className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No History Found</h3>
                    <p className="text-gray-500 max-w-sm mt-1">
                        You haven't submitted any refund requests yet.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {history.map((item) => {
                        const config = statusConfig[item.status];
                        const StatusIcon = config.icon;

                        return (
                            <Card
                                key={item.id}
                                className="shadow-sm hover:shadow-md transition-shadow cursor-pointer group border-gray-100"
                                onClick={() => navigate({ to: '/app/subscription/refunds/$refundId', params: { refundId: item.id } })}
                            >
                                <CardContent className="p-5 flex items-center justify-between gap-4">
                                    <div className="space-y-1.5 flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="font-semibold text-gray-900 truncate">Refund for {item.plan_name}</span>
                                            <Badge variant={config.variant} className="gap-1 px-2 py-0.5 text-xs font-medium shrink-0">
                                                <StatusIcon className="h-3 w-3" />
                                                {config.label}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-gray-900">
                                                {(item.amount / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                            </p>
                                            <span className="text-gray-300">•</span>
                                            <p className="text-sm text-gray-500 line-clamp-1">
                                                {item.reason}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <span>Requested {format(new Date(item.created_at), 'PPP')}</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
