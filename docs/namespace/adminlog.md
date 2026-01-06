# Dokumentasi Fitur: Admin Log Management

**Tanggal Dokumentasi:** 25 Desember 2024  
**Fokus Domain:** Frontend (Admin App)  
**Lokasi:** `admin/src/features/system-logs/`

---

## Alur Data Semantik

```
[Admin Navigate ke /admin/logs]
    -> [Route: validated search params (page, limit, level)]
    -> [Logs Component: useLogs hook fetch data]
    -> [LogsTable: TanStack Table dengan columns definition]
    -> [Filter by Level: INFO / WARN / ERROR]
    -> [Pagination: URL-based page & limit]
    -> [Click View Details] -> [LogDetailSheet: fetch full log detail]
```

---

## A. Laporan Implementasi Fitur Admin Log Management

### Deskripsi Fungsional

Fitur ini menyediakan interface untuk admin melihat dan menganalisis system logs. Menggunakan **DataTable** pattern dengan sorting, filtering, dan pagination. Detail log ditampilkan dalam **Sheet** (slide-out panel).

**Operasi yang Didukung:**

| Operasi | Trigger | API Endpoint | Deskripsi |
|---------|---------|--------------|-----------|
| **List Logs** | Auto-fetch | `GET /admin/logs` | List logs dengan pagination |
| **Filter by Level** | Dropdown | Query param `level` | Filter INFO/WARN/ERROR |
| **Pagination** | Table controls | Query params `page`, `limit` | URL-based pagination |
| **View Detail** | Button | `GET /admin/logs/{id}` | Fetch dan display log detail |

**Data Model (SystemLog):**

| Field | Type | Deskripsi |
|-------|------|-----------|
| `id` | string | Unique log identifier (MD5 hash) |
| `level` | string | Log level: info, warn, error |
| `module` | string | Source module (auth, payment, etc.) |
| `message` | string | Log message |
| `details` | object | Additional JSON data (optional) |
| `created_at` | string | ISO timestamp |

### Visualisasi

> [PLACEHOLDER SCREENSHOT - LOGS LIST]
> *Gambar 1: System Logs page dengan table layout.*

> [PLACEHOLDER SCREENSHOT - LEVEL FILTER]
> *Gambar 2: Level filter dropdown (INFO/WARN/ERROR).*

> [PLACEHOLDER SCREENSHOT - LOG DETAIL SHEET]
> *Gambar 3: Log detail sheet dengan full message dan JSON details.*

> [PLACEHOLDER SCREENSHOT - PAGINATION]
> *Gambar 4: Pagination controls di bottom table.*

> [PLACEHOLDER SCREENSHOT - LEVEL BADGES]
> *Gambar 5: Level badges dengan color coding (red=error, yellow=warn, blue=info).*

---

## B. Bedah Arsitektur & Komponen

---

### `admin/src/routes/_authenticated/logs.tsx`
**Layer Terdeteksi:** `Route Definition`

**Narasi Operasional:**

File route ini mendefinisikan path `/admin/logs` dengan search params validation. Zod schema memvalidasi `page`, `limit`, dan `level` dari URL query params.

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { Logs } from '@admin/features/system-logs'

const logsSearchSchema = z.object({
    page: z.number().int().positive().default(1).optional(),
    limit: z.number().int().positive().default(10).optional(),
    level: z.string().optional(),
})

export const Route = createFileRoute('/_authenticated/logs')({
    component: Logs,
    validateSearch: (search) => logsSearchSchema.parse(search),
})
```
*Caption: Snippet 1: Route definition dengan search params validation.*

---

### `admin/src/features/system-logs/index.tsx`
**Layer Terdeteksi:** `Page Component (Logs Entry Point)`

**Narasi Operasional:**

Komponen ini adalah entry point untuk halaman System Logs. Membaca search params dari route, memanggil `useLogs` hook untuk fetch data, dan merender `LogsTable`.

```tsx
const route = getRouteApi('/_authenticated/logs')

export function Logs() {
    const search = route.useSearch() as LogListParams
    const navigate = route.useNavigate() as NavigateFn

    // Safely cast search params with defaults
    const queryParams: LogListParams = {
        page: search.page || 1,
        limit: search.limit || 10,
        level: search.level,
    }

    const { data: logs = [], isLoading, error } = useLogs(queryParams)

    if (error) {
        console.error("Failed to fetch logs", error)
    }

    return (
        <>
            <Header fixed>
                <Search />
                <div className='ms-auto flex items-center space-x-4'>
                    <ThemeSwitch />
                    <ConfigDrawer />
                    <ProfileDropdown />
                </div>
            </Header>

            <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
                <div className='flex items-center justify-between'>
                    <div>
                        <h2 className='text-2xl font-bold tracking-tight'>System Logs</h2>
                        <p className='text-muted-foreground'>
                            View system activity and audit logs.
                        </p>
                    </div>
                </div>
                <LogsTable data={logs} isLoading={isLoading} search={search} navigate={navigate} />
            </Main>
        </>
    )
}
```
*Caption: Snippet 2: Logs page component dengan data fetching.*

---

### `admin/src/features/system-logs/components/logs-table.tsx`
**Layer Terdeteksi:** `UI Component (DataTable)`

**Narasi Operasional:**

Komponen table menggunakan TanStack Table untuk rendering logs. Features: row selection, sorting, filtering by level, URL-based pagination. Click "View Details" opens `LogDetailSheet`.

```tsx
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
                        {table.getHeaderGroups().map((headerGroup) => (...))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={logsColumns.length}>
                                    <Skeleton className="h-4 w-full" />
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (...))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={logsColumns.length}>No logs found.</TableCell>
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
```
*Caption: Snippet 3: Logs table dengan TanStack Table configuration.*

---

### `admin/src/features/system-logs/components/logs-columns.tsx`
**Layer Terdeteksi:** `Column Definitions`

**Narasi Operasional:**

Definisi kolom untuk table: select checkbox, level (dengan badge), module, message (truncated), timestamp, dan actions button. Level menggunakan color-coded badges.

```tsx
export const logsColumns: ColumnDef<SystemLog>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label='Select all'
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label='Select row'
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'level',
        header: ({ column }) => (
            <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
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
        meta: { filterVariant: 'select' },
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
        accessorKey: 'module',
        header: ({ column }) => (
            <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                Module
                <ArrowUpDown className='ml-2 h-4 w-4' />
            </Button>
        ),
        cell: ({ row }) => <div className='w-[80px]'>{row.getValue('module')}</div>,
    },
    {
        accessorKey: 'message',
        header: ({ column }) => (
            <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
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
            <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
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
                <Button variant="ghost" size="sm" onClick={() => meta?.onViewDetails?.(row.original)}>
                    View Details
                </Button>
            )
        }
    }
]
```
*Caption: Snippet 4: Column definitions dengan level badges dan actions.*

---

### `admin/src/features/system-logs/components/log-detail-sheet.tsx`
**Layer Terdeteksi:** `UI Component (Detail Panel)`

**Narasi Operasional:**

Sheet component untuk menampilkan detail log. Fetches full log data via `useLog` hook. Displays: ID, level (badge), module, timestamp, message, dan JSON details (jika ada).

```tsx
export function LogDetailSheet({
    open,
    onOpenChange,
    logId,
    initialData,
}: LogDetailSheetProps) {
    // Fetch full details (might have extra fields not in list)
    const { data: fullLog } = useLog(logId || '')

    const log = fullLog || initialData

    if (!log) return null

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className='w-[400px] sm:w-[540px] overflow-y-auto'>
                <SheetHeader>
                    <SheetTitle>Log Details</SheetTitle>
                    <SheetDescription>
                        View detailed information about this system log.
                    </SheetDescription>
                </SheetHeader>
                <div className='mt-6 space-y-6'>
                    {/* Log ID */}
                    <div>
                        <h4 className='text-sm font-medium text-muted-foreground mb-1'>Log ID</h4>
                        <p className='font-mono text-sm break-all'>{log.id}</p>
                    </div>

                    {/* Level & Module */}
                    <div className='grid grid-cols-2 gap-4'>
                        <div>
                            <h4 className='text-sm font-medium text-muted-foreground mb-1'>Level</h4>
                            <Badge variant={
                                log.level === 'error' ? 'destructive' :
                                log.level === 'warn' ? 'secondary' : 'default'
                            }>
                                {log.level.toUpperCase()}
                            </Badge>
                        </div>
                        <div>
                            <h4 className='text-sm font-medium text-muted-foreground mb-1'>Module</h4>
                            <p className='text-sm font-medium'>{log.module}</p>
                        </div>
                    </div>

                    {/* Timestamp */}
                    <div>
                        <h4 className='text-sm font-medium text-muted-foreground mb-1'>Timestamp</h4>
                        <p className='text-sm'>{new Date(log.created_at).toLocaleString()}</p>
                    </div>

                    {/* Message */}
                    <div>
                        <h4 className='text-sm font-medium text-muted-foreground mb-1'>Message</h4>
                        <p className='text-sm bg-muted p-3 rounded-md whitespace-pre-wrap'>{log.message}</p>
                    </div>

                    {/* Details (JSON) */}
                    {log.details && (
                        <div>
                            <h4 className='text-sm font-medium text-muted-foreground mb-1'>Additional Details</h4>
                            <pre className='text-xs bg-muted p-3 rounded-md overflow-x-auto font-mono'>
                                {JSON.stringify(log.details, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}
```
*Caption: Snippet 5: Log detail sheet dengan formatted JSON display.*

---

### `admin/src/features/system-logs/hooks/use-logs.ts`
**Layer Terdeteksi:** `Custom Hooks (API Operations)`

**Narasi Operasional:**

Hooks untuk fetching logs. `useLogs` untuk list dengan pagination, `useLog` untuk single log detail. Query keys structured untuk efficient caching.

```tsx
import { useQuery } from '@tanstack/react-query'
import { adminLogsApi } from '@admin/lib/api/admin-api'
import { LogListParams } from '@admin/lib/types/admin-api'

export const logKeys = {
    all: ['system-logs'] as const,
    lists: () => [...logKeys.all, 'list'] as const,
    list: (params: LogListParams) => [...logKeys.lists(), params] as const,
    details: () => [...logKeys.all, 'detail'] as const,
    detail: (id: string) => [...logKeys.details(), id] as const,
}

export const useLogs = (params: LogListParams) => {
    return useQuery({
        queryKey: logKeys.list(params),
        queryFn: () => adminLogsApi.getLogs(params),
    })
}

export const useLog = (id: string) => {
    return useQuery({
        queryKey: logKeys.detail(id),
        queryFn: () => adminLogsApi.getLogDetail(id),
        enabled: !!id,
    })
}
```
*Caption: Snippet 6: Logs hooks dengan query key factory.*

---

### `admin/src/lib/types/admin-api.ts (Log Types)`
**Layer Terdeteksi:** `Type Definitions`

**Narasi Operasional:**

Zod schemas untuk log-related types. `logListParamsSchema` untuk pagination params, `systemLogSchema` untuk log object, `logDetailSchema` extends dengan optional details field.

```tsx
export const logListParamsSchema = z.object({
    page: z.number().default(1),
    limit: z.number().default(10),
    level: z.string().optional(),
})

export type LogListParams = z.infer<typeof logListParamsSchema>

export const systemLogSchema = z.object({
    id: z.string(),
    level: z.string(),
    module: z.string(),
    message: z.string(),
    details: z.record(z.string(), z.any()).optional(),
    created_at: z.string(),
})

export type SystemLog = z.infer<typeof systemLogSchema>

export const logDetailSchema = systemLogSchema.extend({
    details: z.record(z.string(), z.any()).optional(),
})

export type LogDetail = z.infer<typeof logDetailSchema>
```
*Caption: Snippet 7: Zod schemas untuk log types.*

---

### `admin/src/lib/api/admin-api.ts (Logs API)`
**Layer Terdeteksi:** `API Client`

**Narasi Operasional:**

API functions untuk logs. `getLogs` dengan pagination params, `getLogDetail` untuk single log by ID.

```tsx
export const adminLogsApi = {
    /**
     * Get system logs
     */
    async getLogs(params: LogListParams): Promise<SystemLog[]> {
        const response = await apiClient.get<ApiSuccessResponse<SystemLog[]>>(ADMIN_ENDPOINTS.LOGS.LIST, { params })
        return response.data.data
    },

    /**
     * Get log details
     */
    async getLogDetail(id: string): Promise<LogDetail> {
        const response = await apiClient.get<ApiSuccessResponse<LogDetail>>(ADMIN_ENDPOINTS.LOGS.DETAIL(id))
        return response.data.data
    },
}
```
*Caption: Snippet 8: Logs API functions.*

---

## C. Ringkasan Ketergantungan Komponen

| Komponen | Menerima Dari | Meneruskan Ke |
|----------|---------------|---------------|
| `Route (logs.tsx)` | URL params | `Logs` component |
| `Logs (index.tsx)` | `useLogs` hook | `LogsTable` |
| `LogsTable` | Data array | Table rows, `LogDetailSheet` |
| `logsColumns` | Row data | Cell content, actions |
| `LogDetailSheet` | `useLog` hook | Formatted display |

---

## D. Diagram Logs Management Flow

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    Admin Panel - System Logs                     â”‚
â”‚                                                                  â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚  Header: [Search] [ThemeSwitch] [Config] [Profile]        â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                                                                  â”‚
â”‚  System Logs                                                     â”‚
â”‚  View system activity and audit logs.                            â”‚
â”‚                                                                  â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚  Toolbar: [Search message...] [Filter by Level â–¼]        â”‚   â”‚
â”‚  â”‚                                                           â”‚   â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚   â”‚
â”‚  â”‚  â”‚  Drop down options:                                 â”‚  â”‚   â”‚
â”‚  â”‚  â”‚  â˜ INFO    (blue badge)                            â”‚  â”‚   â”‚
â”‚  â”‚  â”‚  â˜ WARN    (yellow badge)                          â”‚  â”‚   â”‚
â”‚  â”‚  â”‚  â˜ ERROR   (red badge)                             â”‚  â”‚   â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                                                                  â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚ â˜ â”‚ Level â”‚ Module  â”‚ Message              â”‚ Timestamp  â”‚   â”‚ â”‚
â”‚  â”œâ”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”¤ â”‚
â”‚  â”‚ â˜ â”‚ INFO  â”‚ auth    â”‚ User logged in suc...â”‚ 12/25 14:30â”‚ ðŸ‘ â”‚ â”‚
â”‚  â”‚ â˜ â”‚ ERROR â”‚ payment â”‚ Payment failed: ca...â”‚ 12/25 14:25â”‚ ðŸ‘ â”‚ â”‚
â”‚  â”‚ â˜ â”‚ WARN  â”‚ storage â”‚ Disk space running...â”‚ 12/25 14:20â”‚ ðŸ‘ â”‚ â”‚
â”‚  â”‚ â˜ â”‚ INFO  â”‚ user    â”‚ Profile updated fo...â”‚ 12/25 14:15â”‚ ðŸ‘ â”‚ â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                                                                  â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚  [â† Previous]  Page 1 of 10  [Next â†’]     [10 â–¼] per page â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## E. Log Detail Sheet Layout

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Log Details                        X  â”‚
â”‚  View detailed information about       â”‚
â”‚  this system log.                      â”‚
â”‚                                        â”‚
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ â”‚
â”‚                                        â”‚
â”‚  Log ID                                â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚ a7f3b2c1e4d8...               â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                                        â”‚
â”‚  Level          Module                 â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚ ðŸ”´ ERROR  â”‚  â”‚ payment        â”‚    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                        â”‚
â”‚  Timestamp                             â”‚
â”‚  12/25/2024, 2:25:30 PM               â”‚
â”‚                                        â”‚
â”‚  Message                               â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚ Payment processing failed:     â”‚   â”‚
â”‚  â”‚ Card declined by issuer       â”‚   â”‚
â”‚  â”‚ Transaction ID: TXN_123456    â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                                        â”‚
â”‚  Additional Details                    â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚ {                              â”‚   â”‚
â”‚  â”‚   "user_id": "usr_abc123",    â”‚   â”‚
â”‚  â”‚   "amount": 199000,           â”‚   â”‚
â”‚  â”‚   "currency": "IDR",          â”‚   â”‚
â”‚  â”‚   "error_code": "DECLINED"    â”‚   â”‚
â”‚  â”‚ }                              â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## F. Level Badge Color Mapping

| Level | Badge Variant | Color |
|-------|---------------|-------|
| `info` | default | Blue/Gray |
| `warn` | secondary | Yellow |
| `error` | destructive | Red |

---

*Dokumen ini dibuat secara otomatis berdasarkan analisis kode sumber dalam mode READ-ONLY.*
