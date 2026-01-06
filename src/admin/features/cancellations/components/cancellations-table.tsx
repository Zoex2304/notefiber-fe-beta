import { useMemo } from 'react'
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Eye, CheckCircle } from 'lucide-react'
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
import type { AdminCancellation, CancellationStatus } from '@admin/lib/types/admin-api'
import { useCancellationsContext } from './cancellations-provider'

interface CancellationsTableProps {
    data: AdminCancellation[]
    isLoading: boolean
    statusFilter: CancellationStatus | 'all'
    onStatusFilterChange: (status: CancellationStatus | 'all') => void
    highlightId?: string
}

const statusBadgeVariant: Record<CancellationStatus, 'default' | 'secondary' | 'destructive'> = {
    pending: 'secondary',
    approved: 'default',
    rejected: 'destructive',
}

export function CancellationsTable({ data, isLoading, statusFilter, onStatusFilterChange, highlightId }: CancellationsTableProps) {
    const { setSelectedCancellation, setProcessDialogOpen, setDetailDialogOpen } = useCancellationsContext()

    const handleViewDetails = (cancellation: AdminCancellation) => {
        setSelectedCancellation(cancellation)
        setDetailDialogOpen(true)
    }

    const handleProcess = (cancellation: AdminCancellation) => {
        setSelectedCancellation(cancellation)
        setProcessDialogOpen(true)
    }

    const columns: ColumnDef<AdminCancellation>[] = useMemo(
        () => [
            {
                accessorKey: 'user',
                header: 'User',
                cell: ({ row }) => (
                    <div className="flex flex-col">
                        <span className="font-medium">{row.original.user_name || 'N/A'}</span>
                        <span className="text-xs text-muted-foreground">{row.original.user_email || row.original.user_id}</span>
                    </div>
                ),
            },
            {
                accessorKey: 'plan_name',
                header: 'Plan',
                cell: ({ row }) => <span>{row.original.plan_name}</span>,
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
                accessorKey: 'effective_date',
                header: 'Effective Date',
                cell: ({ row }) => (
                    <span className="text-sm">
                        {format(new Date(row.original.effective_date), 'PP')}
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
                                    <DropdownMenuItem onClick={() => handleProcess(row.original)}>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Process Request
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                ),
            },
        ],
        [setSelectedCancellation, setProcessDialogOpen, setDetailDialogOpen]
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
                            {['User', 'Plan', 'Reason', 'Effective Date', 'Status', 'Requested', ''].map((header, i) => (
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
            <Tabs value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as CancellationStatus | 'all')}>
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
                                    No cancellation requests found.
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
