import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@admin/components/ui/card'
import { Button } from '@admin/components/ui/button'
import { Badge } from '@admin/components/ui/badge'
import { Skeleton } from '@admin/components/ui/skeleton'
import { Main } from '@admin/components/layout/main'
import { ArrowLeft, Clock, CheckCircle, XCircle, FileText, User, Calendar, MessageSquare, AlertCircle } from 'lucide-react'
import { adminCancellationsApi } from '@admin/lib/api/admin-api'

const STATUS_CONFIG = {
    pending: {
        label: 'Pending Review',
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

export const Route = createFileRoute('/admin/_authenticated/cancellations/$cancellationId')({
    component: CancellationDetailPage,
})

function CancellationDetailPage() {
    const { cancellationId } = Route.useParams()

    const { data: cancellation, isLoading, error } = useQuery({
        queryKey: ['admin', 'cancellation', cancellationId],
        queryFn: () => adminCancellationsApi.getCancellation(cancellationId),
    })

    const handleBack = () => {
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

    if (error || !cancellation) {
        return (
            <Main className="max-w-2xl">
                <Button variant="ghost" onClick={handleBack} className="mb-6">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Cancellations
                </Button>
                <Card>
                    <CardContent className="py-12 text-center">
                        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Cancellation Request Not Found</h3>
                        <p className="text-muted-foreground">
                            The cancellation request you're looking for doesn't exist or has been removed.
                        </p>
                    </CardContent>
                </Card>
            </Main>
        )
    }

    const statusConfig = STATUS_CONFIG[cancellation.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending
    const StatusIcon = statusConfig.icon

    return (
        <Main className="max-w-2xl">
            <Button variant="ghost" onClick={handleBack} className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Cancellations
            </Button>

            <Card>
                <CardHeader className={statusConfig.bgColor}>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                Cancellation Request
                                <Badge variant={statusConfig.variant}>
                                    <StatusIcon className="mr-1 h-3 w-3" />
                                    {statusConfig.label}
                                </Badge>
                            </CardTitle>
                            <CardDescription className="mt-1">
                                ID: {cancellation.id.slice(0, 8)}...
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                    {/* User & Plan Info */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                            <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">User</p>
                                <p className="font-semibold">{cancellation.user_name || cancellation.user_email || 'N/A'}</p>
                                {cancellation.user_name && cancellation.user_email && (
                                    <p className="text-xs text-muted-foreground">{cancellation.user_email}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                            <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">Plan</p>
                                <p className="font-semibold">{cancellation.plan_name}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">Requested On</p>
                                <p className="font-semibold">
                                    {new Date(cancellation.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">Effectve Date</p>
                                <p className="font-semibold">
                                    {cancellation.effective_date ? new Date(cancellation.effective_date).toLocaleDateString() : 'Immediately'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="border-t pt-4">
                        <div className="flex items-center gap-2 mb-2 font-medium">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            Reason for Cancellation
                        </div>
                        <p className="text-muted-foreground bg-muted/50 p-3 rounded-lg">
                            {cancellation.reason || 'No reason provided'}
                        </p>
                    </div>

                    {/* Admin Notes */}
                    {cancellation.admin_notes && (
                        <div className="border-t pt-4">
                            <h4 className="font-medium mb-2">Admin Notes</h4>
                            <p className="text-sm text-muted-foreground italic">
                                "{cancellation.admin_notes}"
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </Main>
    )
}
