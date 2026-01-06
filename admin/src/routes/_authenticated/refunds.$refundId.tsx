import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@admin/components/ui/card'
import { Button } from '@admin/components/ui/button'
import { Badge } from '@admin/components/ui/badge'
import { Skeleton } from '@admin/components/ui/skeleton'
import { Main } from '@admin/components/layout/main'
import { ArrowLeft, Clock, CheckCircle, XCircle, DollarSign, Calendar, FileText, User } from 'lucide-react'
import { adminRefundsApi } from '@admin/lib/api/admin-api'

const STATUS_CONFIG = {
    pending: {
        label: 'Pending',
        icon: Clock,
        variant: 'secondary' as const,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
    approved: {
        label: 'Approved',
        icon: CheckCircle,
        variant: 'default' as const,
        color: 'text-green-600',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    rejected: {
        label: 'Rejected',
        icon: XCircle,
        variant: 'destructive' as const,
        color: 'text-red-600',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
}

export const Route = createFileRoute('/_authenticated/refunds/$refundId')({
    component: RefundDetailPage,
})

function RefundDetailPage() {
    const { refundId } = Route.useParams()

    const { data: refund, isLoading, error } = useQuery({
        queryKey: ['admin', 'refund', refundId],
        queryFn: () => adminRefundsApi.getRefund(refundId),
    })

    const handleBack = () => {
        // Use browser history back for natural navigation
        window.history.back()
    }

    if (isLoading) {
        return (
            <Main className="max-w-2xl">
                <Skeleton className="h-8 w-32 mb-6" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-64 mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </CardContent>
                </Card>
            </Main>
        )
    }

    if (error || !refund) {
        return (
            <Main className="max-w-2xl">
                <Button variant="ghost" onClick={handleBack} className="mb-6">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Refunds
                </Button>
                <Card>
                    <CardContent className="py-12 text-center">
                        <XCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Refund Not Found</h3>
                        <p className="text-muted-foreground">
                            The refund request you're looking for doesn't exist.
                        </p>
                    </CardContent>
                </Card>
            </Main>
        )
    }

    const statusConfig = STATUS_CONFIG[refund.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending
    const StatusIcon = statusConfig.icon
    const planName = refund.subscription?.plan_name || 'N/A'

    return (
        <Main className="max-w-2xl">
            <Button variant="ghost" onClick={handleBack} className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Refunds
            </Button>

            <Card>
                <CardHeader className={statusConfig.bgColor}>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                Refund Request
                                <Badge variant={statusConfig.variant}>
                                    <StatusIcon className="mr-1 h-3 w-3" />
                                    {statusConfig.label}
                                </Badge>
                            </CardTitle>
                            <CardDescription className="mt-1">
                                ID: {refund.id.slice(0, 8)}...
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                    {/* Details Grid */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                            <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">User</p>
                                <p className="font-semibold">{refund.user?.email || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                            <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">Amount</p>
                                <p className="font-semibold">${(refund.amount || 0).toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                            <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">Plan</p>
                                <p className="font-semibold">{planName}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">Requested</p>
                                <p className="font-semibold">
                                    {new Date(refund.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="border-t pt-4">
                        <h4 className="font-medium mb-2">Reason for Refund</h4>
                        <p className="text-muted-foreground bg-muted/50 p-3 rounded-lg">
                            {refund.reason || 'No reason provided'}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </Main>
    )
}
