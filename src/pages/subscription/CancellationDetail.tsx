import { ActionTooltip } from '@/components/common/ActionTooltip';
import { Button } from '@/components/shadui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadui/card';
import { Badge } from '@/components/shadui/badge';
import { Skeleton } from '@/components/shadui/skeleton';
import { Separator } from '@/components/shadui/separator';
import { useCancellationDetail } from '@/hooks/user/useCancellations';
import { useParams, useRouter } from '@tanstack/react-router';
import { format } from 'date-fns';
import { MoveLeft, Clock, CheckCircle, XCircle, FileText, Calendar, ShieldAlert } from 'lucide-react';
import type { UserCancellationListItem } from '@/api/services/cancellation/cancellation.types';

const statusConfig: Record<
    UserCancellationListItem['status'],
    { icon: typeof Clock; variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; color: string }
> = {
    pending: { icon: Clock, variant: 'secondary', label: 'Pending Review', color: 'text-gray-500' },
    approved: { icon: CheckCircle, variant: 'default', label: 'Approved', color: 'text-green-600' },
    rejected: { icon: XCircle, variant: 'destructive', label: 'Rejected', color: 'text-red-600' },
};

export function CancellationDetail() {
    // strict: false allows us to access params that might be defined in the route but not strictly inferred here without the route context
    const params = useParams({ strict: false }) as { cancellationId: string };
    const id = params.cancellationId;
    const router = useRouter();
    const { data: cancellation, isLoading, error } = useCancellationDetail(id);

    if (isLoading) {
        return (
            <div className="container max-w-2xl mx-auto p-6 space-y-6">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (error || !cancellation) {
        return (
            <div className="container max-w-2xl mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <ShieldAlert className="h-12 w-12 text-gray-300" />
                <h2 className="text-xl font-semibold text-gray-900">Cancellation Record Not Found</h2>
                <Button variant="outline" onClick={() => router.history.back()}>
                    Go Back
                </Button>
            </div>
        );
    }

    const config = statusConfig[cancellation.status];
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
                        className="h-10 w-10 shrink-0 rounded-full hover:bg-gray-100"
                    >
                        <MoveLeft className="h-5 w-5 text-gray-600" />
                    </Button>
                </ActionTooltip>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Cancellation Details</h1>
                    <p className="text-gray-500 text-sm">Reference ID: <span className="font-mono text-gray-400">{cancellation.id.slice(0, 8)}</span></p>
                </div>
            </div>

            <Card className="shadow-sm border-gray-100 overflow-hidden">
                <div className={`h-2 w-full ${cancellation.status === 'approved' ? 'bg-green-500' : cancellation.status === 'rejected' ? 'bg-red-500' : 'bg-gray-200'}`} />
                <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                {cancellation.plan_name} Plan
                            </CardTitle>
                            <CardDescription className="mt-1">
                                Submitted on {format(new Date(cancellation.created_at), 'PPP')} at {format(new Date(cancellation.created_at), 'p')}
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
                    {/* Reason */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-400" />
                            Reason for Cancellation
                        </label>
                        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 border border-gray-100">
                            {cancellation.reason}
                        </div>
                    </div>

                    {/* Admin Response Section (if applicable) */}
                    {(cancellation.effective_date || cancellation.admin_notes) && (
                        <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100 space-y-4">
                            {cancellation.effective_date && (
                                <div className="flex items-start gap-3">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                        <Calendar className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-blue-900">Effective Date</h4>
                                        <p className="text-sm text-blue-700 mt-1">
                                            Your subscription is scheduled to end on <span className="font-medium">{format(new Date(cancellation.effective_date), 'PPP')}</span>.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {cancellation.admin_notes && (
                                <div className="space-y-1 pt-2">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-800/70">Admin Notes</h4>
                                    <p className="text-sm text-blue-800 leading-relaxed">
                                        {cancellation.admin_notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
