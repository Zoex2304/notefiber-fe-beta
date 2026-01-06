import { format } from 'date-fns';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadui/card';
import { Badge } from '@/components/shadui/badge';
import { Skeleton } from '@/components/shadui/skeleton';
import { useCancellationHistory } from '@/hooks/user/useCancellations';
import type { UserCancellationListItem } from '@/api/services/cancellation/cancellation.types';

const statusConfig: Record<
    UserCancellationListItem['status'],
    { icon: typeof Clock; variant: 'default' | 'secondary' | 'destructive'; label: string }
> = {
    pending: { icon: Clock, variant: 'secondary', label: 'Pending Review' },
    approved: { icon: CheckCircle, variant: 'default', label: 'Approved' },
    rejected: { icon: XCircle, variant: 'destructive', label: 'Rejected' },
};

export function CancellationHistorySection() {
    const { data: history = [], isLoading } = useCancellationHistory();

    if (isLoading) {
        return (
            <Card className="shadow-sm">
                <CardHeader>
                    <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-20 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (history.length === 0) {
        return null; // Don't show section if no history
    }

    return (
        <Card className="shadow-sm border-gray-100">
            <CardHeader>
                <CardTitle className="text-lg">Cancellation History</CardTitle>
                <CardDescription>Your past cancellation requests</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {history.map((item) => {
                        const config = statusConfig[item.status];
                        const StatusIcon = config.icon;

                        return (
                            <div
                                key={item.id}
                                className="flex items-start justify-between border rounded-lg p-4"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{item.plan_name}</span>
                                        <Badge variant={config.variant} className="gap-1">
                                            <StatusIcon className="h-3 w-3" />
                                            {config.label}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {item.reason}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Requested {format(new Date(item.created_at), 'PPP')}
                                    </p>
                                </div>
                                {item.effective_date && item.status === 'approved' && (
                                    <div className="text-right text-sm">
                                        <p className="text-muted-foreground">Effective</p>
                                        <p className="font-medium">
                                            {format(new Date(item.effective_date), 'PP')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
