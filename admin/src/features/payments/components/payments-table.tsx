import { useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@admin/components/ui/table'
import { Button } from '@admin/components/ui/button'
import { Skeleton } from '@admin/components/ui/skeleton'
import { RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react'
import { StatusBadge } from '@admin/components/ui/status-badge'
import { CurrencyDisplay } from '@admin/components/ui/currency-display'
import { DateDisplay } from '@admin/components/ui/date-display'
import { RefundDialog } from '@admin/features/refunds/refund-dialog'
import type { Transaction, TransactionListParams } from '@admin/lib/types/admin-api'
import type { NavigateFn } from '@admin/hooks/use-table-url-state'

interface PaymentsTableProps {
    data: Transaction[]
    isLoading: boolean
    search: TransactionListParams
    navigate: NavigateFn
}

export function PaymentsTable({ data, isLoading, search, navigate }: PaymentsTableProps) {
    const [refundOpen, setRefundOpen] = useState(false)
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>()

    const handleRefundClick = (transaction: Transaction) => {
        setSelectedTransaction(transaction)
        setRefundOpen(true)
    }

    const handlePageChange = (newPage: number) => {
        navigate({
            search: {
                ...search,
                page: newPage,
            },
        })
    }

    if (isLoading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                ))}
            </div>
        )
    }

    if (!data || data.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                No transactions found
            </div>
        )
    }

    const currentPage = search.page || 1
    const limit = search.limit || 10

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((transaction) => (
                            <TableRow key={transaction.id}>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{transaction.user_email}</span>
                                        {transaction.midtrans_order_id && (
                                            <span className="text-xs text-muted-foreground">
                                                {transaction.midtrans_order_id}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>{transaction.plan_name}</TableCell>
                                <TableCell>
                                    <CurrencyDisplay amount={transaction.amount} />
                                </TableCell>
                                <TableCell>
                                    <StatusBadge status={transaction.status as any} />
                                </TableCell>
                                <TableCell>
                                    <StatusBadge status={transaction.payment_status as any} />
                                </TableCell>
                                <TableCell>
                                    <DateDisplay date={transaction.transaction_date} />
                                </TableCell>
                                <TableCell className="text-right">
                                    {transaction.payment_status === 'success' && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRefundClick(transaction)}
                                        >
                                            <RotateCcw className="h-4 w-4 mr-1" />
                                            Refund
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                    Page {currentPage}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={data.length < limit}
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            <RefundDialog
                open={refundOpen}
                onOpenChange={setRefundOpen}
                transaction={selectedTransaction as any}
            />
        </>
    )
}
