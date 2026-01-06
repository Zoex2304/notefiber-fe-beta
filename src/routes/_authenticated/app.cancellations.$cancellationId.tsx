import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { FileText, Calendar, MessageSquare, Clock, CheckCircle, XCircle } from 'lucide-react'
import { cancellationService } from '@/api/services/cancellation/cancellation.service'
import { NotificationDetailLayout } from '@/components/layout/NotificationDetailLayout'

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
}

export const Route = createFileRoute('/_authenticated/app/cancellations/$cancellationId')({
    component: UserCancellationDetailPage,
})

function UserCancellationDetailPage() {
    const { cancellationId } = Route.useParams()

    const { data: response, isLoading, error } = useQuery({
        queryKey: ['user', 'cancellation', cancellationId],
        queryFn: () => cancellationService.getCancellation(cancellationId),
    })

    const cancellation = response?.data

    const handleBack = () => {
        window.history.back()
    }

    const statusConfig = cancellation
        ? (STATUS_CONFIG[cancellation.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending)
        : STATUS_CONFIG.pending

    return (
        <NotificationDetailLayout
            title="Cancellation Details"
            requestId={cancellation?.id}
            backLabel="Back to Subscription"
            onBack={handleBack}
            isLoading={isLoading}
            error={error || (!isLoading && !cancellation)}
            status={cancellation ? {
                label: statusConfig.label,
                icon: statusConfig.icon,
                variant: statusConfig.variant,
                className: statusConfig.className,
                cardBorder: statusConfig.cardBorder
            } : undefined}
        >
            {cancellation && (
                <>
                    {/* Plan Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-5 rounded-2xl bg-[#F8F6F9] dark:bg-gray-800 border border-purple-100 dark:border-gray-700 flex items-start gap-4 transition-all hover:shadow-md">
                            <div className="p-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm text-purple-600">
                                <FileText className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Plan</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                    {cancellation.plan_name}
                                </p>
                            </div>
                        </div>

                        <div className="p-5 rounded-2xl bg-[#F8F6F9] dark:bg-gray-800 border border-purple-100 dark:border-gray-700 flex items-start gap-4 transition-all hover:shadow-md">
                            <div className="p-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm text-blue-600">
                                <Calendar className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Requested On</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                    {new Date(cancellation.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Reason */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-gray-400" />
                            Reason for Cancellation
                        </h3>
                        <p className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-100 text-gray-700 dark:text-gray-300 leading-relaxed italic">
                            "{cancellation.reason || 'No reason provided'}"
                        </p>
                    </div>

                    {/* Admin Response (if rejected or approved) */}
                    {cancellation.admin_notes && (
                        <div className="border-t pt-8">
                            <h4 className="font-medium mb-3">Admin Response</h4>
                            <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                                <p className="text-sm italic text-foreground/80">
                                    "{cancellation.admin_notes}"
                                </p>
                            </div>
                        </div>
                    )}
                </>
            )}
        </NotificationDetailLayout>
    )
}
