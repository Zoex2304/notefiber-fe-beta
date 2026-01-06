import { useState } from 'react'
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    useReactTable,
} from '@tanstack/react-table'
import type { SortingState, VisibilityState } from '@tanstack/react-table'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@admin/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@admin/components/data-table'
import { useTableUrlState } from '@admin/hooks/use-table-url-state'
import { logsColumns } from './logs-columns'
import { type SystemLog } from '@admin/lib/types/admin-api'
import { Skeleton } from '@admin/components/ui/skeleton'
import type { NavigateFn } from '@admin/hooks/use-table-url-state'
import { LogDetailSheet } from './log-detail-sheet'

interface LogsTableProps {
    data: SystemLog[]
    isLoading?: boolean
    search: Record<string, unknown>
    navigate: NavigateFn
}

export function LogsTable({ data, isLoading, search, navigate }: LogsTableProps) {
    const [rowSelection, setRowSelection] = useState({})
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [sorting, setSorting] = useState<SortingState>([{ id: 'created_at', desc: true }])
    const [selectedLogId, setSelectedLogId] = useState<string | null>(null)
    const [showDetailSheet, setShowDetailSheet] = useState(false)

    const {
        pagination,
        onPaginationChange,
        columnFilters,
        onColumnFiltersChange,
    } = useTableUrlState({
        search,
        navigate,
        pagination: { defaultPage: 1, defaultPageSize: 10 },
        columnFilters: [
            { columnId: 'level', searchKey: 'level', type: 'string' },
        ]
    })

    // Enhance columns to add action handler
    const columns = logsColumns.map(col => {
        if (col.id === 'actions') {
            return {
                ...col,
                meta: {
                    onViewDetails: (log: SystemLog) => {
                        setSelectedLogId(log.id)
                        setShowDetailSheet(true)
                    }
                }
            }
        }
        return col
    })


    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            pagination,
        },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: onColumnFiltersChange,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: onPaginationChange,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        manualPagination: true,
        pageCount: -1,
    })

    return (
        <div className='space-y-4'>
            <DataTableToolbar
                table={table}
                searchKey="message"
                filters={[
                    {
                        columnId: 'level',
                        title: 'Level',
                        options: [
                            { label: 'INFO', value: 'info' },
                            { label: 'WARN', value: 'warn' },
                            { label: 'ERROR', value: 'error' },
                        ]
                    }
                ]}
            />
            <div className='rounded-md border'>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} colSpan={header.colSpan}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={logsColumns.length} className='h-24 text-center'>
                                    <div className="flex flex-col space-y-2">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={logsColumns.length}
                                    className='h-24 text-center'
                                >
                                    No logs found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <DataTablePagination table={table} />

            <LogDetailSheet
                open={showDetailSheet}
                onOpenChange={setShowDetailSheet}
                logId={selectedLogId}
            />
        </div>
    )
}
