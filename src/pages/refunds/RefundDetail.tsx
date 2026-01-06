/**
 * RefundDetail Page
 * 
 * Displays details of a specific refund request.
 * Accessed via notification deep linking.
 */

import { useEffect, useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { Card, CardContent, CardHeader } from '@/components/shadui/card';
import { Button } from '@/components/shadui/button';
import { Badge } from '@/components/shadui/badge';
import { Skeleton } from '@/components/shadui/skeleton';
import { Clock, CheckCircle, XCircle, DollarSign, Calendar, FileText, ArrowLeft } from 'lucide-react';
import { refundService } from '@/api/services/refund/refund.service';
import type { UserRefund } from '@/api/services/refund/refund.types';
import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
    pending: {
        label: 'Review Pending',
        icon: Clock,
        variant: 'outline' as const,
        className: 'border-yellow-200 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/10 dark:text-yellow-400 dark:border-yellow-800',
        cardBorder: 'border-yellow-200',
    },
    approved: {
        label: 'Approved',
        icon: CheckCircle,
        variant: 'outline' as const,
        className: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-800',
        cardBorder: 'border-emerald-200',
    },
    rejected: {
        label: 'Rejected',
        icon: XCircle,
        variant: 'outline' as const,
        className: 'border-red-200 bg-red-50 text-red-700 dark:bg-red-900/10 dark:text-red-400 dark:border-red-800',
        cardBorder: 'border-red-200',
    },
};

export function RefundDetail() {
    const { refundId } = useParams({ from: '/_authenticated/app/refunds/$refundId' });
    const [refund, setRefund] = useState<UserRefund | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRefund = async () => {
            setIsLoading(true);
            try {
                const response = await refundService.getMyRefunds();
                if (response.success && response.data) {
                    const found = response.data.find(r => r.id === refundId);
                    if (found) {
                        setRefund(found);
                    } else {
                        setError('Refund request not found');
                    }
                } else {
                    setError('Failed to load refund details');
                }
            } catch {
                setError('Failed to load refund details');
            } finally {
                setIsLoading(false);
            }
        };
        fetchRefund();
    }, [refundId]);

    const handleBack = () => {
        window.history.back();
    };

    if (isLoading) {
        return (
            <div className="min-h-full w-full bg-[#f8f6f9] dark:bg-background p-6 lg:p-10 flex flex-col items-center">
                <div className="w-full max-w-3xl space-y-6">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-8 w-48" />
                    </div>
                    <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                            <Skeleton className="h-8 w-1/3 mb-2" />
                            <Skeleton className="h-4 w-1/4" />
                        </CardHeader>
                        <CardContent className="h-64" />
                    </Card>
                </div>
            </div>
        );
    }

    if (error || !refund) {
        return (
            <div className="min-h-full w-full bg-[#f8f6f9] dark:bg-background p-6 lg:p-10 flex flex-col items-center justify-center">
                <Card className="max-w-md w-full border-dashed shadow-sm">
                    <CardContent className="py-12 text-center flex flex-col items-center">
                        <div className="bg-red-50 p-4 rounded-full mb-4">
                            <XCircle className="h-8 w-8 text-red-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Refund Not Found</h3>
                        <p className="text-muted-foreground mb-6">
                            {error || "The refund request you're looking for doesn't exist."}
                        </p>
                        <Button variant="outline" onClick={handleBack} className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Go Back
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const statusConfig = STATUS_CONFIG[refund.status];
    const StatusIcon = statusConfig.icon;

    return (
        <div className="min-h-full w-full bg-[#f8f6f9] dark:bg-background p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleBack}
                            className="bg-white hover:bg-white/80 shadow-sm rounded-full h-8 w-8 text-gray-500"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#0F0538] to-[#4B3E8E] dark:from-white dark:to-gray-300">
                                Refund Details
                            </h1>
                            <p className="text-sm text-gray-500 font-medium">
                                Request ID: <span className="font-mono">{refund.id.slice(0, 8)}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content Card */}
                <Card className={cn(
                    "border-0 shadow-lg bg-white/90 backdrop-blur-xl overflow-hidden rounded-2xl ring-1 ring-black/5",
                    statusConfig.cardBorder
                )}>
                    {/* Status Banner */}
                    <div className="border-b border-gray-100 bg-gray-50/50 p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-lg", statusConfig.className.replace('text-', 'bg-').replace('border-', ''))} style={{ background: 'transparent' }}>
                                <div className={cn("p-2 rounded-full", statusConfig.className.split(' ')[1])}>
                                    <StatusIcon className={cn("h-6 w-6", statusConfig.className.split(' ')[2])} />
                                </div>
                            </div>
                            <div>
                                <h2 className="font-semibold text-gray-900">Request Status</h2>
                                <p className="text-sm text-gray-500">Created {new Date(refund.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <Badge variant={statusConfig.variant} className={cn("px-4 py-1.5 h-auto text-sm font-medium", statusConfig.className)}>
                            {statusConfig.label}
                        </Badge>
                    </div>

                    <CardContent className="p-8 space-y-8">
                        {/* Key Metrics Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-5 rounded-2xl bg-[#F8F6F9] dark:bg-gray-800 border border-purple-100 dark:border-gray-700 flex items-start gap-4 transition-all hover:shadow-md">
                                <div className="p-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm text-emerald-600">
                                    <DollarSign className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Refund Amount</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        ${refund.amount.toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            <div className="p-5 rounded-2xl bg-[#F8F6F9] dark:bg-gray-800 border border-purple-100 dark:border-gray-700 flex items-start gap-4 transition-all hover:shadow-md">
                                <div className="p-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm text-purple-600">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Plan</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                        {refund.plan_name}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Details Section */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-gray-400" />
                                    Reason for Refund
                                </h3>
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-100 text-gray-700 dark:text-gray-300 leading-relaxed italic">
                                    "{refund.reason}"
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar className="h-4 w-4" />
                                Requested on {new Date(refund.created_at).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
