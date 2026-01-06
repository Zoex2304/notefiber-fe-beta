import { Card, CardContent } from '@/components/shadui/card';
import { Badge } from '@/components/shadui/badge';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { PendingDots } from '@/components/common/PendingDots';
import { ArrowRight, FileText, Receipt, RotateCcw, FileX } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';

type HistoryType = 'refund' | 'cancellation';
type StatusType = 'pending' | 'approved' | 'rejected';

interface HistorySummaryCardProps {
    /** Type of history item */
    type: HistoryType;
    /** Plan name associated with the request */
    planName: string;
    /** Current status */
    status: StatusType;
    /** Amount for refunds (in cents) */
    amount?: number;
    /** Reason provided */
    reason: string;
    /** Request date (ISO string) */
    date: string;
    /** Click handler for navigation */
    onClick: () => void;
    /** Link to full history */
    historyLink: string;
    /** Additional classes */
    className?: string;
}

const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive'; label: string }> = {
    pending: { variant: 'secondary', label: 'Processing' },
    approved: { variant: 'default', label: 'Approved' },
    rejected: { variant: 'destructive', label: 'Declined' },
    // Fallbacks for potential other statuses
    canceled: { variant: 'secondary', label: 'Canceled' },
    failed: { variant: 'destructive', label: 'Failed' },
    completed: { variant: 'default', label: 'Completed' },
    succeeded: { variant: 'default', label: 'Succeeded' },
};

const iconConfig: Record<HistoryType, { icon: typeof FileText; headerIcon: typeof RotateCcw; bgClass: Record<string, string> }> = {
    refund: {
        icon: Receipt,
        headerIcon: RotateCcw,
        bgClass: {
            pending: 'bg-yellow-50 text-yellow-600',
            approved: 'bg-green-50 text-green-600',
            rejected: 'bg-red-50 text-red-600',
            // Default/Fallback
            canceled: 'bg-gray-50 text-gray-600',
            failed: 'bg-red-50 text-red-600',
            completed: 'bg-green-50 text-green-600',
            succeeded: 'bg-green-50 text-green-600',
        }
    },
    cancellation: {
        icon: FileText,
        headerIcon: FileX,
        bgClass: {
            pending: 'bg-yellow-50 text-yellow-600',
            approved: 'bg-green-50 text-green-600',
            rejected: 'bg-red-50 text-red-600',
            canceled: 'bg-gray-50 text-gray-600',
            failed: 'bg-red-50 text-red-600',
            completed: 'bg-green-50 text-green-600',
            succeeded: 'bg-green-50 text-green-600',
        }
    }
};

/**
 * Clickable summary card for refund or cancellation history.
 * Provides consistent visual treatment for request history items.
 */
export function HistorySummaryCard({
    type,
    planName,
    status,
    amount,
    reason,
    date,
    onClick,
    historyLink,
    className
}: HistorySummaryCardProps) {
    const Icon = iconConfig[type].icon;
    const HeaderIcon = iconConfig[type].headerIcon;
    // Safe access for background class
    const iconBgClass = (iconConfig[type].bgClass as any)[status] || 'bg-gray-50 text-gray-600';

    // Safe access for config
    const config = statusConfig[status] || statusConfig['pending'];
    const { variant, label } = config;
    const isRefund = type === 'refund';
    const title = `${isRefund ? 'Refund' : 'Cancellation'} for ${planName}`;
    const headerTitle = `Latest ${isRefund ? 'Refund' : 'Cancellation'} Request`;

    return (
        <div className={cn("space-y-0", className)}>
            {/* Header using SectionHeader for consistency */}
            <SectionHeader
                icon={HeaderIcon}
                title={headerTitle}
                action={
                    <Link
                        to={historyLink}
                        className="text-royal-violet-base font-medium hover:text-shiny-purple hover:underline flex items-center text-sm transition-colors"
                    >
                        View all history <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                }
            />

            {/* Card */}
            <Card
                className="shadow-sm border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200 cursor-pointer group"
                onClick={onClick}
            >
                <CardContent className="p-5 flex items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* Icon */}
                        <div className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                            iconBgClass
                        )}>
                            <Icon className="h-5 w-5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex items-center justify-between gap-4">
                                <span className="font-semibold text-gray-900 truncate">{title}</span>
                                <Badge
                                    variant={variant}
                                    className={cn(
                                        "gap-1.5 px-2 py-0.5 text-xs font-medium shrink-0",
                                        status === 'pending' && "animate-pulse"
                                    )}
                                >
                                    {status === 'pending' && <PendingDots size="sm" colorClassName="bg-current" />}
                                    {isRefund && status === 'pending' ? 'Processing' :
                                        isRefund && status === 'approved' ? 'Refunded' : label}
                                </Badge>
                            </div>

                            {isRefund && amount !== undefined && (
                                <div className="flex items-center gap-2">
                                    <p className="font-medium text-gray-900">
                                        {(amount / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                    </p>
                                    <span className="text-gray-300">•</span>
                                    <p className="text-sm text-gray-500 line-clamp-1">{reason}</p>
                                </div>
                            )}

                            {!isRefund && (
                                <p className="text-sm text-gray-500 line-clamp-1 max-w-md">{reason}</p>
                            )}

                            <p className="text-xs text-gray-400">
                                {isRefund ? 'Requested' : 'Submitted on'} {new Date(date).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* Arrow */}
                    <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-royal-violet-base transition-colors shrink-0" />
                </CardContent>
            </Card>
        </div>
    );
}
