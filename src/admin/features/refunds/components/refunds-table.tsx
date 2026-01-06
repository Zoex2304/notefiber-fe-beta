import { useMemo } from 'react'
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Eye, CheckCircle, XCircle } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { Button } from '@admin/components/ui/button'
import { Badge } from '@admin/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@admin/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@admin/components/ui/dropdown-menu'
import { Skeleton } from '@admin/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@admin/components/ui/tabs'
import type { RefundListItem, RefundStatus } from '@admin/lib/types/admin-api'
import { useRefundsContext } from './refunds-provider'

interface RefundsTableProps {
    data: RefundListItem[]
    isLoading: boolean
    statusFilter: RefundStatus | 'all'
    onStatusFilterChange: (status: RefundStatus | 'all') => void
    highlightId?: string
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount)
}

const statusBadgeVariant: Record<RefundStatus, 'default' | 'secondary' | 'destructive'> = {
    pending: 'secondary',
    approved: 'default',
    rejected: 'destructive',
}

export function RefundsTable({ data, isLoading, statusFilter, onStatusFilterChange, highlightId }: RefundsTableProps) {
    const { setSelectedRefund, setApprovalDialogOpen, setDetailDialogOpen, setRejectionDialogOpen } = useRefundsContext()

    const handleViewDetails = (refund: RefundListItem) => {
        setSelectedRefund(refund)
        setDetailDialogOpen(true)
    }

    const handleApprove = (refund: RefundListItem) => {
        setSelectedRefund(refund)
        setApprovalDialogOpen(true)
    }

    const handleReject = (refund: RefundListItem) => {
        setSelectedRefund(refund)
        setRejectionDialogOpen(true)
    }

    const columns: ColumnDef<RefundListItem>[] = useMemo(
        () => [
            {
                accessorKey: 'user',
                header: 'User',
                cell: ({ row }) => (
                    <div className="flex flex-col">
                        <span className="font-medium">{row.original.user.full_name}</span>
                        <span className="text-xs text-muted-foreground">{row.original.user.email}</span>
                    </div>
                ),
            },
            {
                accessorKey: 'subscription.plan_name',
                header: 'Plan',
                cell: ({ row }) => <span>{row.original.subscription.plan_name}</span>,
            },
            {
                accessorKey: 'amount',
                header: 'Amount',
                cell: ({ row }) => (
                    <span className="font-medium">{formatCurrency(row.original.amount)}</span>
                ),
            },
            {
                accessorKey: 'reason',
                header: 'Reason',
                cell: ({ row }) => (
                    <span className="max-w-[200px] truncate block" title={row.original.reason}>
                        {row.original.reason}
                    </span>
                ),
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ row }) => (
                    <Badge variant={statusBadgeVariant[row.original.status]}>
                        {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
                    </Badge>
                ),
            },
            {
                accessorKey: 'created_at',
                header: 'Requested',
                cell: ({ row }) => (
                    <span className="text-sm text-muted-foreground" title={format(new Date(row.original.created_at), 'PPpp')}>
                        {formatDistanceToNow(new Date(row.original.created_at), { addSuffix: true })}
                    </span>
                ),
            },
            {
                id: 'actions',
                cell: ({ row }) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewDetails(row.original)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </DropdownMenuItem>
                            {row.original.status === 'pending' && (
                                <>
                                    <DropdownMenuItem onClick={() => handleApprove(row.original)}>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Approve Refund
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleReject(row.original)} className="text-destructive focus:text-destructive">
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Reject Refund
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                ),
            },
        ],
        [setSelectedRefund, setApprovalDialogOpen, setDetailDialogOpen]
    )

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    if (isLoading) {
        return (
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {['User', 'Plan', 'Amount', 'Reason', 'Status', 'Requested', ''].map((header, i) => (
                                <TableHead key={i}>{header}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                                {Array.from({ length: 7 }).map((_, j) => (
                                    <TableCell key={j}>
                                        <Skeleton className="h-4 w-full" />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <Tabs value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as RefundStatus | 'all')}>
                <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => {
                                const isHighlighted = highlightId && row.original.id === highlightId
                                return (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && 'selected'}
                                        className={isHighlighted ? 'bg-yellow-100 dark:bg-yellow-900/30 animate-pulse' : ''}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                )
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No refund requests found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Next
                </Button>
            </div>
        </div>
    )
}
