# Dokumentasi Fitur: Admin User Management CRUD

**Tanggal Dokumentasi:** 25 Desember 2024  
**Fokus Domain:** Frontend (Admin App)  
**Lokasi:** `admin/src/features/users/`

---

## Alur Data Semantik

```
[Admin Login ke Admin Panel]
    -> [Navigate ke /admin/users]
    -> [List: Fetch Users dengan Pagination & Filters]
    -> [Table: Tampilkan data dengan sorting, filter status/role]
    -> [Action: View Detail -> Navigate ke /admin/users/{id}]
    -> [Action: Edit -> Open Dialog -> Update Profile/Status via API]
    -> [Action: Delete -> Confirm dengan Email Input -> API DELETE]
```

---

## A. Laporan Implementasi Fitur Admin User Management

### Deskripsi Fungsional

Fitur ini menyediakan dashboard admin untuk mengelola seluruh user dalam sistem. Menggunakan TanStack Table untuk data grid dengan fitur sorting, filtering, dan pagination yang terintegrasi dengan URL state.

**Operasi yang Didukung:**

| Operasi | Trigger | API Endpoint | Deskripsi |
|---------|---------|--------------|-----------|
| **List** | Auto-fetch | `GET /admin/users` | List users dengan pagination & search |
| **Detail** | Klik row | `GET /admin/users/{id}` | Detail user dengan AI token usage |
| **Update Profile** | Edit Dialog | `PUT /admin/users/{id}` | Update name, email, role, status |
| **Update Status** | Status Dialog | `PUT /admin/users/{id}/status` | Quick update status saja |
| **Delete** | Delete Dialog | `DELETE /admin/users/{id}` | Soft delete dengan konfirmasi email |

**Filter Options:**

| Filter | Options |
|--------|---------|
| Status | Active, Pending, Banned |
| Role | Admin, User |
| Search | Email/Name (parameter `q`) |

### Visualisasi

> [PLACEHOLDER SCREENSHOT - USERS LIST]
> *Gambar 1: Admin Users list dengan table, filters, dan pagination.*

> [PLACEHOLDER SCREENSHOT - USER DETAIL]
> *Gambar 2: User detail page dengan profile information.*

> [PLACEHOLDER SCREENSHOT - EDIT DIALOG]
> *Gambar 3: Dialog edit user dengan form full_name, email, role, status.*

> [PLACEHOLDER SCREENSHOT - DELETE DIALOG]
> *Gambar 4: Delete confirmation dengan input email verification.*

> [PLACEHOLDER SCREENSHOT - STATUS DIALOG]
> *Gambar 5: Quick status update dialog.*

---

## B. Bedah Arsitektur & Komponen

---

### `admin/src/features/users/index.tsx`
**Layer Terdeteksi:** `Page Component (Users List Entry Point)`

**Narasi Operasional:**

Komponen ini adalah entry point untuk halaman Users. Mengambil search params dari URL untuk pagination dan filtering, kemudian memanggil `useUsers` hook untuk fetch data. Menggunakan `UsersProvider` untuk state management dialog/row antar komponen child.

```tsx
const route = getRouteApi('/_authenticated/users/')

export function Users() {
    const search = route.useSearch() as UserListParams
    const navigate = route.useNavigate() as NavigateFn

    const queryParams: UserListParams = {
        page: search.page || 1,
        limit: search.limit || 10,
        q: search.q || undefined,
    }

    const { data: users = [], isLoading, error } = useUsers(queryParams)

    return (
        <UsersProvider>
            <Header fixed>
                <Search />
                <div className='ms-auto flex items-center space-x-4'>
                    <ThemeSwitch />
                    <ConfigDrawer />
                    <ProfileDropdown />
                </div>
            </Header>

            <Main className='flex flex-1 flex-col gap-4'>
                <div className='flex flex-wrap items-end justify-between gap-2'>
                    <div>
                        <h2 className='text-2xl font-bold'>User List</h2>
                        <p className='text-muted-foreground'>Manage your users and their roles here.</p>
                    </div>
                    <UsersPrimaryButtons />
                </div>
                <UsersTable data={users} isLoading={isLoading} search={search} navigate={navigate} />
            </Main>

            <UsersDialogs />
        </UsersProvider>
    )
}
```
*Caption: Snippet 1: Users page dengan layout dan data fetching.*

---

### `admin/src/features/users/user-detail.tsx`
**Layer Terdeteksi:** `Page Component (User Detail View)`

**Narasi Operasional:**

Halaman ini menampilkan detail informasi user individual. Mengambil `userId` dari URL params dan fetch data via `useUser` hook. Menampilkan profile information dalam card: email, user ID, role badge, status badge, dan joined date.

```tsx
const route = getRouteApi('/_authenticated/users/$userId')

export function UserDetail() {
    const { userId } = route.useParams()
    const { data: user, isLoading, error } = useUser(userId)

    if (isLoading) {
        return <Skeleton className='h-8 w-1/3' />
    }

    if (error) {
        return (
            <Alert variant='destructive'>
                <AlertCircle />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Failed to load user details: {error.message}</AlertDescription>
            </Alert>
        )
    }

    return (
        <div className='space-y-6'>
            <div>
                <h2 className='text-3xl font-bold'>{user.full_name}</h2>
                <p className='text-muted-foreground'>Manage user details and view their profile information.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                            <h4 className='font-semibold text-sm text-muted-foreground'>Email</h4>
                            <p>{user.email}</p>
                        </div>
                        <div>
                            <h4 className='font-semibold text-sm text-muted-foreground'>User ID</h4>
                            <p className='font-mono text-sm'>{user.id}</p>
                        </div>
                        <div>
                            <h4 className='font-semibold text-sm text-muted-foreground'>Role</h4>
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role}</Badge>
                        </div>
                        <div>
                            <h4 className='font-semibold text-sm text-muted-foreground'>Status</h4>
                            <Badge variant={user.status === 'active' ? 'default' : user.status === 'pending' ? 'secondary' : 'destructive'}>
                                {user.status}
                            </Badge>
                        </div>
                        <div>
                            <h4 className='font-semibold text-sm text-muted-foreground'>Joined Date</h4>
                            <p>{format(new Date(user.created_at), 'PPP')}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
```
*Caption: Snippet 2: User detail page dengan profile card.*

---

### `admin/src/features/users/components/users-table.tsx`
**Layer Terdeteksi:** `UI Component (Data Table)`

**Narasi Operasional:**

Komponen ini merender data grid users menggunakan TanStack Table. State pagination dan filter disinkronkan dengan URL via `useTableUrlState` hook â€” memungkinkan bookmarking dan sharing URL dengan filter yang sama.

**Features:**
- Toolbar dengan search input dan filter dropdowns (Status, Role)
- Sortable columns
- Row selection untuk bulk actions
- Pagination dengan page size selector

```tsx
export function UsersTable({ data, isLoading, search, navigate }: UsersTableProps) {
    const [rowSelection, setRowSelection] = useState({})
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [sorting, setSorting] = useState<SortingState>([])

    // Synced with URL states
    const { columnFilters, onColumnFiltersChange, pagination, onPaginationChange } = useTableUrlState({
        search,
        navigate,
        pagination: { defaultPage: 1, defaultPageSize: 10 },
        columnFilters: [
            { columnId: 'email', searchKey: 'q', type: 'string' },
            { columnId: 'status', searchKey: 'status', type: 'array' },
            { columnId: 'role', searchKey: 'role', type: 'array' },
        ],
    })

    const table = useReactTable({
        data,
        columns,
        state: { sorting, pagination, rowSelection, columnFilters, columnVisibility },
        enableRowSelection: true,
        manualPagination: true,
        onPaginationChange,
        onColumnFiltersChange,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    return (
        <div className='flex flex-1 flex-col gap-4'>
            <DataTableToolbar
                table={table}
                searchPlaceholder='Search users...'
                searchKey='email'
                filters={[
                    { columnId: 'status', title: 'Status', options: [
                        { label: 'Active', value: 'active' },
                        { label: 'Pending', value: 'pending' },
                        { label: 'Banned', value: 'banned' },
                    ]},
                    { columnId: 'role', title: 'Role', options: [
                        { label: 'Admin', value: 'admin' },
                        { label: 'User', value: 'user' },
                    ]},
                ]}
            />
            <Table>
                {/* Table content */}
            </Table>
            <DataTablePagination table={table} />
            <DataTableBulkActions table={table} />
        </div>
    )
}
```
*Caption: Snippet 3: Users table dengan URL-synced pagination dan filters.*

---

### `admin/src/features/users/components/users-action-dialog.tsx`
**Layer Terdeteksi:** `UI Component (Edit Form Dialog)`

**Narasi Operasional:**

Dialog ini menangani editing user profile. Form menggunakan React Hook Form dengan Zod validation. Fields: full_name, email, role (dropdown), status (dropdown). Saat submit, memanggil `useUpdateUserProfile` mutation.

```tsx
const formSchema = z.object({
    full_name: z.string().min(1, 'Full Name is required.'),
    email: z.email({ error: (iss) => iss.input === '' ? 'Email is required.' : undefined }),
    role: z.enum(['user', 'admin']),
    status: z.enum(['active', 'pending', 'banned']),
})

export function UsersActionDialog({ currentRow, open, onOpenChange }: UserActionDialogProps) {
    const { mutate: updateUser, isPending } = useUpdateUserProfile()

    const form = useForm<UserForm>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            full_name: currentRow?.full_name || '',
            email: currentRow?.email || '',
            role: currentRow?.role || 'user',
            status: currentRow?.status || 'active',
        },
    })

    const onSubmit = (values: UserForm) => {
        if (!currentRow) return

        updateUser({ id: currentRow.id, data: values }, {
            onSuccess: () => {
                form.reset()
                onOpenChange(false)
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>Update user details here. Click save when you're done.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField name='full_name' render={...} />
                        <FormField name='email' render={...} />
                        <FormField name='role' render={({ field }) => (
                            <SelectDropdown items={[{ label: 'User', value: 'user' }, { label: 'Admin', value: 'admin' }]} />
                        )} />
                        <FormField name='status' render={({ field }) => (
                            <SelectDropdown items={[{ label: 'Active', value: 'active' }, { label: 'Pending', value: 'pending' }, { label: 'Banned', value: 'banned' }]} />
                        )} />
                    </form>
                </Form>
                <DialogFooter>
                    <Button type='submit' form='user-form' disabled={isPending}>Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
```
*Caption: Snippet 4: Edit dialog dengan form validation.*

---

### `admin/src/features/users/components/users-delete-dialog.tsx`
**Layer Terdeteksi:** `UI Component (Delete Confirmation)`

**Narasi Operasional:**

Dialog ini memastikan admin tidak accidentally menghapus user. Menggunakan **email verification** â€” admin harus mengetik ulang email user yang akan dihapus sebelum tombol Delete aktif. Menampilkan warning alert untuk menekankan bahwa aksi tidak dapat di-rollback.

```tsx
export function UsersDeleteDialog({ open, onOpenChange, currentRow }: UserDeleteDialogProps) {
    const [value, setValue] = useState('')
    const { mutate: deleteUser, isPending } = useDeleteUser()

    const handleDelete = () => {
        if (value.trim() !== currentRow.email) return

        deleteUser(currentRow.id, {
            onSuccess: () => {
                onOpenChange(false)
                setValue('')
            }
        })
    }

    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            handleConfirm={handleDelete}
            disabled={value.trim() !== currentRow.email || isPending}
            title={
                <span className='text-destructive'>
                    <AlertTriangle className='stroke-destructive inline-block' /> Delete User
                </span>
            }
            desc={
                <div className='space-y-4'>
                    <p>
                        Are you sure you want to delete <strong>{currentRow.full_name}</strong>?
                        This will permanently remove user <strong>{currentRow.email}</strong> with role of <strong>{currentRow.role.toUpperCase()}</strong>.
                    </p>

                    <Label>
                        Email:
                        <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder='Enter email to confirm deletion.' />
                    </Label>

                    <Alert variant='destructive'>
                        <AlertTitle>Warning!</AlertTitle>
                        <AlertDescription>This operation cannot be rolled back.</AlertDescription>
                    </Alert>
                </div>
            }
            confirmText='Delete'
            destructive
        />
    )
}
```
*Caption: Snippet 5: Delete dialog dengan email verification.*

---

### `admin/src/features/users/hooks/use-users.ts`
**Layer Terdeteksi:** `Custom Hooks (API Operations)`

**Narasi Operasional:**

File ini mengkonsolidasikan semua hooks untuk operasi users. Menggunakan TanStack Query dengan query keys terstruktur untuk cache management yang efisien.

**Hooks:**
- `useUsers(params)`: Fetch list dengan pagination/filters
- `useUser(userId)`: Fetch single user detail
- `useUpdateUserStatus()`: Mutation untuk quick status update
- `useUpdateUserProfile()`: Mutation untuk full profile update
- `useDeleteUser()`: Mutation untuk delete

```tsx
export const userKeys = {
    all: ['users'] as const,
    lists: () => [...userKeys.all, 'list'] as const,
    list: (params: UserListParams) => [...userKeys.lists(), params] as const,
    details: () => [...userKeys.all, 'detail'] as const,
    detail: (id: string) => [...userKeys.details(), id] as const,
}

export function useUsers(params: UserListParams) {
    return useQuery({
        queryKey: userKeys.list(params),
        queryFn: () => adminUsersApi.getUsers(params),
    })
}

export function useUser(userId: string) {
    return useQuery({
        queryKey: userKeys.detail(userId),
        queryFn: () => adminUsersApi.getUserDetail(userId),
        enabled: !!userId,
    })
}

export function useUpdateUserProfile() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
            adminUsersApi.updateUserProfile(id, data),
        onSuccess: () => {
            toast.success('User profile updated successfully')
            queryClient.invalidateQueries({ queryKey: userKeys.all })
        },
        onError: () => toast.error('Failed to update user profile'),
    })
}

export function useDeleteUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => adminUsersApi.deleteUser(id),
        onSuccess: () => {
            toast.success('User deleted successfully')
            queryClient.invalidateQueries({ queryKey: userKeys.all })
        },
        onError: () => toast.error('Failed to delete user'),
    })
}
```
*Caption: Snippet 6: Hooks dengan structured query keys dan cache invalidation.*

---

### `admin/src/lib/api/admin-api.ts (adminUsersApi)`
**Layer Terdeteksi:** `API Client (HTTP Methods)`

**Narasi Operasional:**

Bagian `adminUsersApi` dari file ini mengimplementasikan HTTP methods untuk user management. Menggunakan axios dengan interceptor yang menambahkan `admin_token` dari localStorage ke setiap request.

```tsx
export const adminUsersApi = {
    async getUsers(params: UserListParams): Promise<User[]> {
        const response = await apiClient.get<ApiSuccessResponse<User[]>>(ADMIN_ENDPOINTS.USERS.LIST, { params })
        return response.data.data
    },

    async getUserDetail(userId: string): Promise<UserDetail> {
        const response = await apiClient.get<ApiSuccessResponse<UserDetail>>(ADMIN_ENDPOINTS.USERS.DETAIL(userId))
        return response.data.data
    },

    async updateUserStatus(id: string, status: 'active' | 'pending' | 'banned', reason?: string): Promise<void> {
        await apiClient.put(ADMIN_ENDPOINTS.USERS.UPDATE_STATUS(id), { status, reason })
    },

    async updateUserProfile(id: string, data: UpdateUserRequest): Promise<UserDetail> {
        const response = await apiClient.put<ApiSuccessResponse<UserDetail>>(ADMIN_ENDPOINTS.USERS.UPDATE_PROFILE(id), data)
        return response.data.data
    },

    async deleteUser(id: string): Promise<void> {
        await apiClient.delete(ADMIN_ENDPOINTS.USERS.DELETE(id))
    },
}
```
*Caption: Snippet 7: API methods untuk user CRUD.*

---

### `admin/src/lib/types/admin-api.ts (User Types)`
**Layer Terdeteksi:** `Type Definition (API Contract)`

**Narasi Operasional:**

File ini mendefinisikan TypeScript types dan Zod schemas untuk user management. Includes types untuk list params, user entity, update requests, dan detail response.

```tsx
export const userListParamsSchema = z.object({
    page: z.number().default(1),
    limit: z.number().default(10),
    q: z.string().optional(),
})
export type UserListParams = z.infer<typeof userListParamsSchema>

export const userSchema = z.object({
    id: z.string(),
    email: z.string(),
    full_name: z.string(),
    role: z.enum(['user', 'admin']),
    status: z.enum(['active', 'pending', 'banned']),
    created_at: z.string(),
})
export type User = z.infer<typeof userSchema>

export const userDetailSchema = z.object({
    id: z.string(),
    email: z.string(),
    full_name: z.string(),
    role: z.enum(['user', 'admin']),
    status: z.enum(['active', 'pending', 'banned']),
    ai_daily_usage: z.number(),
    created_at: z.string(),
})
export type UserDetail = z.infer<typeof userDetailSchema>

export const updateUserProfileSchema = z.object({
    full_name: z.string().optional(),
    email: z.string().email().optional(),
    role: z.enum(['user', 'admin']).optional(),
    status: z.enum(['active', 'pending', 'banned']).optional(),
    avatar: z.string().optional(),
})
export type UpdateUserRequest = z.infer<typeof updateUserProfileSchema>
```
*Caption: Snippet 8: Type definitions untuk user management.*

---

## C. Ringkasan Ketergantungan Komponen

| Komponen | Menerima Dari | Meneruskan Ke |
|----------|---------------|---------------|
| `Users (index.tsx)` | URL params | `UsersTable`, `UsersDialogs` |
| `UserDetail` | URL params (userId) | Display only |
| `UsersTable` | Data from hook | Row actions -> `UsersProvider` |
| `UsersActionDialog` | `UsersProvider` (currentRow) | `useUpdateUserProfile` |
| `UsersDeleteDialog` | `UsersProvider` (currentRow) | `useDeleteUser` |
| `use-users.ts` | Components | `adminUsersApi` |

---

## D. Diagram Admin User Management

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    Admin Panel - Users                           â”‚
â”‚                                                                  â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚  Header                                                   â”‚   â”‚
â”‚  â”‚  [Search] [ThemeSwitch] [Config] [Profile]               â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                                                                  â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚  Main Content                                             â”‚   â”‚
â”‚  â”‚                                                           â”‚   â”‚
â”‚  â”‚  User List                                                â”‚   â”‚
â”‚  â”‚  Manage your users and their roles here.                  â”‚   â”‚
â”‚  â”‚                                                           â”‚   â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚   â”‚
â”‚  â”‚  â”‚ Toolbar                                             â”‚  â”‚   â”‚
â”‚  â”‚  â”‚ [ðŸ” Search users...] [Status â–¼] [Role â–¼] [Reset]   â”‚  â”‚   â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚   â”‚
â”‚  â”‚                                                           â”‚   â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚   â”‚
â”‚  â”‚  â”‚ â˜ â”‚ Name          â”‚ Email           â”‚ Role  â”‚Statusâ”‚â‹®â”‚  â”‚   â”‚
â”‚  â”‚  â”‚â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”¼â”€â”‚  â”‚   â”‚
â”‚  â”‚  â”‚ â˜ â”‚ John Doe      â”‚ john@email.com  â”‚ User  â”‚Activeâ”‚â‹®â”‚  â”‚   â”‚
â”‚  â”‚  â”‚ â˜ â”‚ Jane Smith    â”‚ jane@email.com  â”‚ Admin â”‚Activeâ”‚â‹®â”‚  â”‚   â”‚
â”‚  â”‚  â”‚ â˜ â”‚ Bob Wilson    â”‚ bob@email.com   â”‚ User  â”‚Bannedâ”‚â‹®â”‚  â”‚   â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚   â”‚
â”‚  â”‚                                                           â”‚   â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚   â”‚
â”‚  â”‚  â”‚ Pagination: [<] Page 1 of 10 [>] | 10 per page â–¼   â”‚  â”‚   â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                                                                  â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚  Row Actions Menu (â‹®)                                     â”‚   â”‚
â”‚  â”‚  â”œâ”€ ðŸ‘ View Details   -> /admin/users/{id}               â”‚   â”‚
â”‚  â”‚  â”œâ”€ âœï¸ Edit User      -> UsersActionDialog               â”‚   â”‚
â”‚  â”‚  â”œâ”€ ðŸ”„ Change Status  -> UsersStatusDialog               â”‚   â”‚
â”‚  â”‚  â””â”€ ðŸ—‘ Delete User    -> UsersDeleteDialog               â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## E. Delete Confirmation Flow

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Delete User Confirmation                                        â”‚
â”‚                                                                  â”‚
â”‚  1. Admin clicks "Delete" on row                                 â”‚
â”‚                    â–¼                                             â”‚
â”‚  2. UsersDeleteDialog opens                                      â”‚
â”‚     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”      â”‚
â”‚     â”‚  âš ï¸ Delete User                                     â”‚      â”‚
â”‚     â”‚                                                      â”‚      â”‚
â”‚     â”‚  Are you sure you want to delete **John Doe**?       â”‚      â”‚
â”‚     â”‚  This will permanently remove user **john@email.com**â”‚      â”‚
â”‚     â”‚  with role of **USER** from the system.              â”‚      â”‚
â”‚     â”‚                                                      â”‚      â”‚
â”‚     â”‚  Email: [____________________________]               â”‚      â”‚
â”‚     â”‚          ^ Must match user email                     â”‚      â”‚
â”‚     â”‚                                                      â”‚      â”‚
â”‚     â”‚  âš ï¸ Warning!                                         â”‚      â”‚
â”‚     â”‚  This operation cannot be rolled back.               â”‚      â”‚
â”‚     â”‚                                                      â”‚      â”‚
â”‚     â”‚          [Cancel]  [Delete] (disabled until match)   â”‚      â”‚
â”‚     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜      â”‚
â”‚                    â–¼                                             â”‚
â”‚  3. Admin types "john@email.com"                                 â”‚
â”‚                    â–¼                                             â”‚
â”‚  4. Delete button enables -> Click                               â”‚
â”‚                    â–¼                                             â”‚
â”‚  5. API DELETE /admin/users/{id}                                 â”‚
â”‚                    â–¼                                             â”‚
â”‚  6. Success toast "User deleted successfully"                    â”‚
â”‚                    â–¼                                             â”‚
â”‚  7. Query invalidated -> Table refreshes                         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

*Dokumen ini dibuat secara otomatis berdasarkan analisis kode sumber dalam mode READ-ONLY.*
