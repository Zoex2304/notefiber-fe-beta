import { Button } from '@admin/components/ui/button'
import { Badge } from '@admin/components/ui/badge'
import { Checkbox } from '@admin/components/ui/checkbox'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'
import { type SystemLog } from '@admin/lib/types/admin-api'

export const logsColumns: ColumnDef<SystemLog>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label='Select all'
                className='translate-y-[2px]'
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label='Select row'
                className='translate-y-[2px]'
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'level',
        header: ({ column }) => (
            <Button
                variant='ghost'
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
                Level
                <ArrowUpDown className='ml-2 h-4 w-4' />
            </Button>
        ),
        cell: ({ row }) => {
            const level = row.getValue('level') as string
            return (
                <Badge
                    variant={
                        level === 'error' ? 'destructive' :
                            level === 'warn' ? 'secondary' : 'default'
                    }
                >
                    {level.toUpperCase()}
                </Badge>
            )
        },
        meta: {
            filterVariant: 'select',
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
    {
        accessorKey: 'module',
        header: ({ column }) => (
            <Button
                variant='ghost'
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
                Module
                <ArrowUpDown className='ml-2 h-4 w-4' />
            </Button>
        ),
        cell: ({ row }) => <div className='w-[80px]'>{row.getValue('module')}</div>,
    },
    {
        accessorKey: 'message',
        header: ({ column }) => (
            <Button
                variant='ghost'
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
                Message
                <ArrowUpDown className='ml-2 h-4 w-4' />
            </Button>
        ),
        cell: ({ row }) => (
            <div className='max-w-[500px] truncate font-medium'>
                {row.getValue('message')}
            </div>
        ),
    },
    {
        accessorKey: 'created_at',
        header: ({ column }) => (
            <Button
                variant='ghost'
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
                Timestamp
                <ArrowUpDown className='ml-2 h-4 w-4' />
            </Button>
        ),
        cell: ({ row }) => {
            const date = new Date(row.getValue('created_at'))
            return <div className="text-muted-foreground text-sm">{date.toLocaleString()}</div>
        },
    },
    {
        id: 'actions',
        cell: ({ row, column }) => {
            const meta = column.columnDef.meta
            return (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => meta?.onViewDetails?.(row.original)}
                >
                    View Details
                </Button>
            )
        }
    }
]
