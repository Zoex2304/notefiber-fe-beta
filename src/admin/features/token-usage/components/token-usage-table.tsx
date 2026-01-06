/**
 * Token Usage Table Component
 * 
 * Table for displaying and managing user AI usage.
 * Uses shared data-table infrastructure for search, sort, and pagination.
 */

import { useState, useMemo } from 'react';
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type SortingState,
    type VisibilityState,
} from '@tanstack/react-table';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@admin/components/ui/table';
import { Skeleton } from '@admin/components/ui/skeleton';
import { Badge } from '@admin/components/ui/badge';
import { Button } from '@admin/components/ui/button';
import { Checkbox } from '@admin/components/ui/checkbox';
import { Progress } from '@admin/components/ui/progress';
import { MoreHorizontal, Pencil, RotateCcw } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@admin/components/ui/dropdown-menu';

// Shared Data Table Components
import { DataTableToolbar } from '@admin/components/data-table/toolbar';
import { DataTablePagination } from '@admin/components/data-table/pagination';
import { DataTableColumnHeader } from '@admin/components/data-table/column-header';
import { useTableUrlState, type NavigateFn } from '@admin/hooks/use-table-url-state';

import type { TokenUsageItem } from '../types';

interface TokenUsageTableProps {
    data: TokenUsageItem[];
    isLoading?: boolean;
    search: Record<string, unknown>;
    navigate: NavigateFn;

    // Selection props
    selectedUsers: string[];
    onToggleSelection: (userId: string) => void;
    onSelectAll: () => void;
    onClearSelection: () => void;

    // Action props
    onEditUser: (user: TokenUsageItem) => void;
    onResetUser: (userId: string) => void;
}

export function TokenUsageTable({
    data,
    isLoading,
    search,
    navigate,
    selectedUsers,
    onToggleSelection,
    onSelectAll,
    onClearSelection,
    onEditUser,
    onResetUser,
}: TokenUsageTableProps) {
    // Local UI states
    const [rowSelection, setRowSelection] = useState({});
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [sorting, setSorting] = useState<SortingState>([]);

    // Synced URL state
    const {
        columnFilters,
        onColumnFiltersChange,
        pagination,
        onPaginationChange,
    } = useTableUrlState({
        search,
        navigate,
        pagination: { defaultPage: 1, defaultPageSize: 20 },
        columnFilters: [
            { columnId: 'email', searchKey: 'q', type: 'string' },
        ],
    });

    // Computed selection state for checkbox
    const allSelected = data.length > 0 && selectedUsers.length === data.length;
    const someSelected = selectedUsers.length > 0 && selectedUsers.length < data.length;

    const columns: ColumnDef<TokenUsageItem>[] = [
        {
            id: 'select',
            header: () => (
                <Checkbox
                    checked={allSelected}
                    // @ts-expect-error - indeterminate is valid
                    indeterminate={someSelected}
                    onCheckedChange={(checked) => {
                        if (checked) onSelectAll();
                        else onClearSelection();
                    }}
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={selectedUsers.includes(row.original.user_id)}
                    onCheckedChange={() => onToggleSelection(row.original.user_id)}
                />
            ),
            size: 40,
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: 'email',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="User" />
            ),
            cell: ({ row }) => (
                <div className="min-w-[180px]">
                    <p className="font-medium">{row.original.full_name || 'N/A'}</p>
                    <p className="text-sm text-muted-foreground">{row.original.email}</p>
                </div>
            ),
        },
        {
            accessorKey: 'plan_name',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Plan" />
            ),
            cell: ({ row }) => (
                <Badge variant="outline" className="whitespace-nowrap">
                    {row.original.plan_name}
                </Badge>
            ),
        },
        {
            accessorKey: 'ai_chat_daily_usage',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Chat Usage" />
            ),
            cell: ({ row }) => {
                const used = row.original.ai_chat_daily_usage ?? 0;
                const limit = row.original.ai_chat_daily_limit ?? 0;
                const percentage = limit > 0 ? (used / limit) * 100 : 0;
                const isHigh = percentage >= 80;
                const isOverLimit = used >= limit && limit > 0;

                // Fallback for NaN
                const displayUsed = isNaN(used) ? 0 : used;
                const displayLimit = limit === -1 ? '∞' : limit.toLocaleString();

                return (
                    <div className="min-w-[140px]">
                        <div className="flex items-center justify-between text-sm mb-1.5">
                            <span className={isOverLimit ? 'text-red-500 font-medium' : ''}>
                                {displayUsed.toLocaleString()}
                            </span>
                            <span className="text-muted-foreground">
                                / {displayLimit}
                            </span>
                        </div>
                        {limit > 0 && (
                            <Progress
                                value={Math.min(percentage, 100)}
                                className="h-2"
                                indicatorClassName={
                                    isOverLimit
                                        ? 'bg-red-500'
                                        : isHigh
                                            ? 'bg-yellow-500'
                                            : 'bg-green-500'
                                }
                            />
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'semantic_search_daily_usage',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Search Usage" />
            ),
            cell: ({ row }) => {
                const used = row.original.semantic_search_daily_usage ?? 0;
                const limit = row.original.semantic_search_daily_limit ?? 0;
                const percentage = limit > 0 ? (used / limit) * 100 : 0;

                // Fallback for NaN
                const displayUsed = isNaN(used) ? 0 : used;
                const displayLimit = limit === -1 ? '∞' : limit.toLocaleString();

                return (
                    <div className="min-w-[140px]">
                        <div className="flex items-center justify-between text-sm mb-1.5">
                            <span>{displayUsed.toLocaleString()}</span>
                            <span className="text-muted-foreground">
                                / {displayLimit}
                            </span>
                        </div>
                        {limit > 0 && (
                            <Progress
                                value={Math.min(percentage, 100)}
                                className="h-2"
                                indicatorClassName="bg-blue-500" // Distinct color for search
                            />
                        )}
                    </div>
                );
            },
        },

        {
            accessorKey: 'ai_daily_usage_last_reset',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Last Reset" />
            ),
            cell: ({ row }) => {
                const dateStr = row.original.ai_daily_usage_last_reset;
                if (!dateStr) return <span className="text-muted-foreground">—</span>;

                const date = new Date(dateStr);
                return (
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                );
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditUser(row.original)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Usage
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onResetUser(row.original.user_id)}>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Reset Usage (0)
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
            size: 50,
            enableSorting: false,
        },
    ];

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            pagination,
            // We don't use internal rowSelection for business logic, but might need it for standard behavior?
            // Actually let's ignore internal rowSelection as we use external selectedUsers
            columnFilters,
            columnVisibility,
        },
        // Enable client-side features for filtered/sorted views on current page
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),

        onPaginationChange,
        onColumnFiltersChange,
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,

        // Manual pagination to respect server-side paging (kind of)
        // If we want client side usage of the 20 items:
        manualPagination: true,
        pageCount: -1, // Unknown total for now, or use total from API if available
    });

    return (
        <div className="space-y-4">
            <DataTableToolbar
                table={table}
                searchKey="email"
                searchPlaceholder="Search by email..."
            />

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            [...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={columns.length}>
                                        <Skeleton className="h-10 w-full" />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={selectedUsers.includes(row.original.user_id) && 'selected'}
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
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <DataTablePagination table={table} />
        </div>
    );
}
