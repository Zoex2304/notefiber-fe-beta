import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@admin/components/ui/table'
import { Button } from '@admin/components/ui/button'
import { CurrencyDisplay } from '@admin/components/ui/currency-display'
import { DateTimeDisplay } from '@admin/components/ui/date-display'
import { StatusBadge } from '@admin/components/ui/status-badge'
import { useDashboardStats } from '@admin/hooks/use-admin-api'
import { RefundDialog } from '@admin/features/refunds/refund-dialog'
import { useState } from 'react'
import type { RecentTransaction } from '@admin/lib/types/admin-api'

export function TransactionsTable() {
    const { data: stats, isLoading } = useDashboardStats()
    const [refundDialogOpen, setRefundDialogOpen] = useState(false)
    const [selectedTransaction, setSelectedTransaction] = useState<RecentTransaction | undefined>()

    const handleRefundClick = (transaction: RecentTransaction) => {
        setSelectedTransaction(transaction)
        setRefundDialogOpen(true)
    }

    if (isLoading) {
        return (
            <div className='space-y-2'>
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className='h-16 animate-pulse rounded bg-muted' />
                ))}
            </div>
        )
    }

    if (!stats || stats.recent_transactions.length === 0) {
        return (
            <div className='text-muted-foreground flex h-32 items-center justify-center text-sm'>
                No recent transactions
            </div>
        )
    }

    return (
        <div className='rounded-md border'>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {stats.recent_transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                            <TableCell>
                                <div className='space-y-1'>
                                    <div className='text-sm font-medium'>
                                        {transaction.user_email}
                                    </div>
                                    {transaction.midtrans_order_id && (
                                        <div className='text-muted-foreground text-xs'>
                                            {transaction.midtrans_order_id}
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>{transaction.plan_name}</TableCell>
                            <TableCell>
                                <CurrencyDisplay amount={transaction.amount} />
                            </TableCell>
                            <TableCell>
                                <StatusBadge status={transaction.status} />
                            </TableCell>
                            <TableCell>
                                <StatusBadge status={transaction.payment_status} />
                            </TableCell>
                            <TableCell>
                                <DateTimeDisplay
                                    date={transaction.transaction_date}
                                    showTime={false}
                                />
                            </TableCell>
                            <TableCell>
                                {transaction.payment_status !== 'refunded' && transaction.payment_status === 'success' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRefundClick(transaction)}
                                    >
                                        Refund
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <RefundDialog
                open={refundDialogOpen}
                onOpenChange={setRefundDialogOpen}
                transaction={selectedTransaction}
            />
        </div>
    )
}
