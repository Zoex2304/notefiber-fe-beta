# Dokumentasi Fitur: Refund Management (User & Admin)

**Tanggal Dokumentasi:** 25 Desember 2024  
**Fokus Domain:** Frontend (User App + Admin App)  
**Lokasi User:** `src/pages/subscription/`, `src/api/services/refund/`  
**Lokasi Admin:** `admin/src/features/refunds/`

---

## Alur Data Semantik

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                          REFUND MANAGEMENT FLOW                              â”‚
â”‚                                                                              â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”â”‚
â”‚  â”‚                         USER SIDE                                        â”‚â”‚
â”‚  â”‚                                                                          â”‚â”‚
â”‚  â”‚  [User di Subscription Management]                                       â”‚â”‚
â”‚  â”‚      -> [Click "Request Refund"]                                         â”‚â”‚
â”‚  â”‚      -> [RefundRequestModal opens]                                       â”‚â”‚
â”‚  â”‚          -> [Input reason (min 10 chars)]                                â”‚â”‚
â”‚  â”‚          -> [Submit: POST /refund/request]                               â”‚â”‚
â”‚  â”‚          -> [Status: pending]                                            â”‚â”‚
â”‚  â”‚          -> [Toast: success/error]                                       â”‚â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜â”‚
â”‚                                   â”‚                                          â”‚
â”‚                                   â–¼                                          â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”â”‚
â”‚  â”‚                         ADMIN SIDE                                       â”‚â”‚
â”‚  â”‚                                                                          â”‚â”‚
â”‚  â”‚  [Admin di Refunds Page]                                                 â”‚â”‚
â”‚  â”‚      -> [RefundsTable: list all refund requests]                         â”‚â”‚
â”‚  â”‚          -> [Tabs Filter: All / Pending / Approved / Rejected]           â”‚â”‚
â”‚  â”‚          -> [Actions: View Details / Approve Refund]                     â”‚â”‚
â”‚  â”‚              -> [RefundDetailDialog: full info]                          â”‚â”‚
â”‚  â”‚              -> [RefundApprovalDialog: confirm + admin notes]            â”‚â”‚
â”‚  â”‚                  -> [POST /admin/refunds/:id/approve]                    â”‚â”‚
â”‚  â”‚                  -> [Manual transfer required]                           â”‚â”‚
â”‚  â”‚                  -> [Status: approved]                                   â”‚â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## A. USER SIDE: Refund Request

### Deskripsi Fungsional

User dapat meminta refund untuk subscription aktif. Form validasi mengharuskan reason minimal 10 karakter. Setelah submit, request masuk ke admin queue dengan status "pending".

**Operasi yang Didukung:**

| Operasi | Trigger | API Endpoint | Deskripsi |
|---------|---------|--------------|-----------|
| **Request Refund** | Submit form | `POST /refund/request` | Submit refund request |
| **Get My Refunds** | Page load | `GET /refund/list` | List user's refund history |

### Visualisasi User Side

> [PLACEHOLDER SCREENSHOT - SUBSCRIPTION PAGE]
> *Gambar 1: Subscription Management page dengan "Request Refund" button.*

> [PLACEHOLDER SCREENSHOT - REFUND REQUEST MODAL]
> *Gambar 2: Modal form dengan reason textarea dan submit button.*

---

### `src/pages/subscription/RefundRequestModal.tsx`
**Layer Terdeteksi:** `UI Component (User Refund Form)`

**Narasi Operasional:**

Modal dialog untuk user submit refund request. Form menggunakan React Hook Form + Zod dengan validasi reason (10-500 chars). Warning alert tentang manual processing. Toast notification untuk success/error.

```tsx
const refundFormSchema = z.object({
    reason: z.string()
        .min(10, 'Reason must be at least 10 characters')
        .max(500, 'Reason must not exceed 500 characters'),
});

type RefundFormValues = z.infer<typeof refundFormSchema>;

export function RefundRequestModal({
    open, onOpenChange, subscriptionId, planName, onSuccess,
}: RefundRequestModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<RefundFormValues>({
        resolver: zodResolver(refundFormSchema),
        defaultValues: { reason: '' },
    });

    const handleSubmit = async (data: RefundFormValues) => {
        if (!subscriptionId) {
            toast.error('No active subscription found for refund request.');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await refundService.requestRefund({
                subscription_id: subscriptionId,
                reason: data.reason,
            });

            if (response.success) {
                toast.success(response.data?.message || 'Refund request submitted successfully!');
                form.reset();
                onOpenChange(false);
                onSuccess?.();
            } else {
                toast.error(response.message || 'Failed to submit refund request.');
            }
        } catch (error: unknown) {
            const errorMessage = (error as any)?.response?.data?.message || 
                (error instanceof Error ? error.message : 'Failed to submit refund request.');
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleCancel}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Request Refund</DialogTitle>
                    <DialogDescription>
                        Submit a refund request for your <strong>{planName}</strong> subscription.
                        Our team will review your request within 3 business days.
                    </DialogDescription>
                </DialogHeader>

                <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-700">
                        Refunds are processed manually. Once approved, the refund will be transferred
                        to your original payment method within 5-7 business days.
                    </AlertDescription>
                </Alert>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reason for Refund</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} placeholder="Please explain why..." rows={4} />
                                    </FormControl>
                                    <FormDescription>
                                        Minimum 10 characters required.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit Request
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
```
*Caption: Snippet 1: User refund request modal dengan form validation.*

---

### `src/api/services/refund/refund.service.ts`
**Layer Terdeteksi:** `API Service (User Side)`

**Narasi Operasional:**

Service layer untuk user refund operations. Includes request submission dan get own refunds.

```tsx
export const refundService = {
    /**
     * Submit a new refund request for a subscription
     */
    requestRefund: async (payload: RefundRequestPayload): Promise<ApiResponse<RefundRequestResponse>> => {
        const response = await apiClient.post<ApiResponse<RefundRequestResponse>>(
            ENDPOINTS.REFUND.REQUEST,
            payload
        );
        return response.data;
    },

    /**
     * Get list of user's own refund requests
     */
    getMyRefunds: async (): Promise<ApiResponse<UserRefund[]>> => {
        const response = await apiClient.get<ApiResponse<UserRefund[]>>(ENDPOINTS.REFUND.LIST);
        return response.data;
    },
};
```
*Caption: Snippet 2: User refund API service.*

---

### `src/api/services/refund/refund.types.ts`
**Layer Terdeteksi:** `Type Definitions (User Side)`

**Narasi Operasional:**

Types untuk user refund operations.

```tsx
// Request payload for submitting a refund request
export interface RefundRequestPayload {
    subscription_id: string;
    reason: string;
}

// Response from refund request submission
export interface RefundRequestResponse {
    refund_id: string;
    status: 'pending' | 'approved' | 'rejected';
    message: string;
}

// Individual refund item in user's refund list
export interface UserRefund {
    id: string;
    subscription_id: string;
    plan_name: string;
    amount: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}
```
*Caption: Snippet 3: User refund types.*

---

## B. ADMIN SIDE: Refund Processing

### Deskripsi Fungsional

Admin dapat melihat semua refund requests, filter by status, view detail, dan approve/reject. Important: Midtrans tidak support automated refunds, jadi admin harus manual transfer.

**Operasi yang Didukung:**

| Operasi | Trigger | API Endpoint | Deskripsi |
|---------|---------|--------------|-----------|
| **List Refunds** | Page load | `GET /admin/refunds` | List all refunds |
| **Get Detail** | View Details | `GET /admin/refunds/:id` | Single refund detail |
| **Approve** | Confirm approve | `POST /admin/refunds/:id/approve` | Approve refund |
| **Reject** | Reject action | `POST /admin/refunds/:id/reject` | Reject refund |

### Visualisasi Admin Side

> [PLACEHOLDER SCREENSHOT - REFUNDS PAGE]
> *Gambar 3: Admin refunds page dengan table dan tabs filter.*

> [PLACEHOLDER SCREENSHOT - REFUNDS TABLE]
> *Gambar 4: Table dengan columns: User, Plan, Amount, Reason, Status, Requested, Actions.*

> [PLACEHOLDER SCREENSHOT - DETAIL DIALOG]
> *Gambar 5: Refund detail dialog dengan user, subscription, dan request info.*

> [PLACEHOLDER SCREENSHOT - APPROVAL DIALOG]
> *Gambar 6: Approval confirmation dengan warning dan admin notes field.*

---

### `admin/src/features/refunds/components/refunds-table.tsx`
**Layer Terdeteksi:** `UI Component (Admin Refunds Table)`

**Narasi Operasional:**

TanStack Table untuk displaying refund requests. Includes tabs filter (All/Pending/Approved/Rejected), pagination, dan row actions (View Details, Approve Refund). Approve action hanya visible untuk pending requests.

```tsx
export function RefundsTable({ data, isLoading, statusFilter, onStatusFilterChange }: RefundsTableProps) {
    const { setSelectedRefund, setApprovalDialogOpen, setDetailDialogOpen } = useRefundsContext()

    const handleViewDetails = (refund: RefundListItem) => {
        setSelectedRefund(refund)
        setDetailDialogOpen(true)
    }

    const handleApprove = (refund: RefundListItem) => {
        setSelectedRefund(refund)
        setApprovalDialogOpen(true)
    }

    const columns: ColumnDef<RefundListItem>[] = useMemo(() => [
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
                <span className="text-sm text-muted-foreground">
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
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(row.original)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                        </DropdownMenuItem>
                        {row.original.status === 'pending' && (
                            <DropdownMenuItem onClick={() => handleApprove(row.original)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve Refund
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ], [])

    return (
        <div className="space-y-4">
            {/* Status Filter Tabs */}
            <Tabs value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as RefundStatus | 'all')}>
                <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>...</TableHeader>
                    <TableBody>...</TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                    Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                    Next
                </Button>
            </div>
        </div>
    )
}
```
*Caption: Snippet 4: Admin refunds table dengan status tabs dan actions.*

---

### `admin/src/features/refunds/components/refund-approval-dialog.tsx`
**Layer Terdeteksi:** `UI Component (Admin Approval Dialog)`

**Narasi Operasional:**

Confirmation dialog untuk approve refund. Displays refund details, warning tentang manual transfer, dan optional admin notes untuk audit trail.

```tsx
export function RefundApprovalDialog({ open, onOpenChange, refund }: RefundApprovalDialogProps) {
    const [adminNotes, setAdminNotes] = useState('')
    const queryClient = useQueryClient()

    const approveMutation = useMutation({
        mutationFn: async () => {
            if (!refund) throw new Error('No refund selected')
            return adminRefundsApi.approveRefund(refund.id, adminNotes || undefined)
        },
        onSuccess: (data) => {
            toast.success(`Refund approved! Amount: ${formatCurrency(data.refunded_amount)}`)
            queryClient.invalidateQueries({ queryKey: ['admin', 'refunds'] })
            queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
            setAdminNotes('')
            onOpenChange(false)
        },
        onError: (error: unknown) => {
            const message = error instanceof Error ? error.message : 'Failed to approve refund'
            toast.error(message)
        },
    })

    return (
        <Dialog open={open} onOpenChange={handleCancel}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>Confirm Refund Approval</DialogTitle>
                    <DialogDescription>
                        Please review the details before approving this refund.
                    </DialogDescription>
                </DialogHeader>

                {/* Manual Transfer Warning */}
                <Alert variant="destructive" className="border-amber-500/50 bg-amber-500/10">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-700">
                        <strong>Important:</strong> You must manually transfer the refund amount to the user.
                        Midtrans does not support automated refunds.
                    </AlertDescription>
                </Alert>

                {/* Refund Details */}
                <div className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-muted-foreground">User:</span>
                        <span className="font-medium">{refund.user.full_name}</span>
                        <span className="text-muted-foreground">Email:</span>
                        <span>{refund.user.email}</span>
                        <span className="text-muted-foreground">Plan:</span>
                        <span>{refund.subscription.plan_name}</span>
                        <span className="text-muted-foreground">Refund Amount:</span>
                        <span className="font-bold text-primary">{formatCurrency(refund.amount)}</span>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="admin-notes">Admin Notes (optional)</Label>
                        <Textarea
                            id="admin-notes"
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            placeholder="Add notes for audit trail..."
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                    <Button onClick={handleConfirm} disabled={approveMutation.isPending}>
                        {approveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Approve Refund
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
```
*Caption: Snippet 5: Admin refund approval dialog dengan manual transfer warning.*

---

### `admin/src/features/refunds/components/refund-detail-dialog.tsx`
**Layer Terdeteksi:** `UI Component (Admin Detail View)`

**Narasi Operasional:**

Dialog untuk view full refund details. Sections: User Info, Subscription Info, Refund Request Info, Reason, Admin Notes (if any).

```tsx
export function RefundDetailDialog({ open, onOpenChange, refund }: RefundDetailDialogProps) {
    if (!refund) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Refund Request Details</DialogTitle>
                    <DialogDescription>
                        Request ID: {refund.id.slice(0, 8)}...
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* User Info */}
                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">User Information</h4>
                        <div className="space-y-1">
                            <p className="font-medium">{refund.user.full_name}</p>
                            <p className="text-sm text-muted-foreground">{refund.user.email}</p>
                        </div>
                    </div>

                    <Separator />

                    {/* Subscription Info */}
                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Subscription</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span>Plan:</span><span>{refund.subscription.plan_name}</span>
                            <span>Amount Paid:</span><span>{formatCurrency(refund.subscription.amount_paid)}</span>
                            <span>Payment Date:</span><span>{format(new Date(refund.subscription.payment_date), 'PPP')}</span>
                        </div>
                    </div>

                    <Separator />

                    {/* Refund Info */}
                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Refund Request</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Amount:</span>
                                <span className="font-medium">{formatCurrency(refund.amount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Status:</span>
                                <Badge variant={statusBadgeVariant[refund.status]}>
                                    {refund.status.charAt(0).toUpperCase() + refund.status.slice(1)}
                                </Badge>
                            </div>
                            <div className="flex justify-between">
                                <span>Requested:</span>
                                <span>{format(new Date(refund.created_at), 'PPp')}</span>
                            </div>
                            {refund.processed_at && (
                                <div className="flex justify-between">
                                    <span>Processed:</span>
                                    <span>{format(new Date(refund.processed_at), 'PPp')}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Reason */}
                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Reason</h4>
                        <p className="text-sm bg-muted p-3 rounded-md">{refund.reason}</p>
                    </div>

                    {/* Admin Notes (if any) */}
                    {refund.admin_notes && (
                        <>
                            <Separator />
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Admin Notes</h4>
                                <p className="text-sm bg-muted p-3 rounded-md">{refund.admin_notes}</p>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
```
*Caption: Snippet 6: Admin refund detail dialog dengan full info sections.*

---

### `admin/src/lib/types/admin-api.ts (Refund Types)`
**Layer Terdeteksi:** `Type Definitions (Admin Side)`

**Narasi Operasional:**

Zod schemas untuk admin refund management.

```tsx
export const refundStatusSchema = z.enum(['pending', 'approved', 'rejected'])
export type RefundStatus = z.infer<typeof refundStatusSchema>

export const refundListParamsSchema = z.object({
    status: refundStatusSchema.optional(),
})
export type RefundListParams = z.infer<typeof refundListParamsSchema>

export const refundListItemSchema = z.object({
    id: z.string(),
    user: z.object({
        id: z.string(),
        email: z.string(),
        full_name: z.string(),
    }),
    subscription: z.object({
        id: z.string(),
        plan_name: z.string(),
        amount_paid: z.number(),
        payment_date: z.string(),
    }),
    amount: z.number(),
    reason: z.string(),
    status: refundStatusSchema,
    admin_notes: z.string().optional(),
    created_at: z.string(),
    processed_at: z.string().optional(),
})
export type RefundListItem = z.infer<typeof refundListItemSchema>

export const refundApprovalResponseSchema = z.object({
    refund_id: z.string(),
    status: z.literal('approved'),
    refunded_amount: z.number(),
    processed_at: z.string(),
})
export type RefundApprovalResponse = z.infer<typeof refundApprovalResponseSchema>
```
*Caption: Snippet 7: Admin refund types dengan Zod schemas.*

---

## C. Ringkasan Ketergantungan Komponen

| Komponen | Side | Menerima Dari | Meneruskan Ke |
|----------|------|---------------|---------------|
| `RefundRequestModal` | User | SubscriptionManagement | refundService |
| `refundService` | User | Modal form data | API |
| `RefundsTable` | Admin | useRefunds hook | Detail/Approval dialogs |
| `RefundApprovalDialog` | Admin | RefundsTable | adminRefundsApi |
| `RefundDetailDialog` | Admin | RefundsTable | Display only |

---

## D. Diagram Refund Flow

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                        REFUND STATUS FLOW                        â”‚
â”‚                                                                  â”‚
â”‚    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”         â”‚
â”‚    â”‚   USER   â”‚        â”‚  ADMIN   â”‚        â”‚  STATUS  â”‚         â”‚
â”‚    â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜        â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜        â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜         â”‚
â”‚         â”‚                   â”‚                   â”‚               â”‚
â”‚         â”‚ Request Refund    â”‚                   â”‚               â”‚
â”‚         â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€> PENDING     â”‚
â”‚         â”‚                   â”‚                   â”‚    (yellow)   â”‚
â”‚         â”‚                   â”‚ View Details      â”‚               â”‚
â”‚         â”‚                   â”‚<â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤               â”‚
â”‚         â”‚                   â”‚                   â”‚               â”‚
â”‚         â”‚                   â”‚ Approve Refund    â”‚               â”‚
â”‚         â”‚                   â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€> APPROVED    â”‚
â”‚         â”‚                   â”‚ + Admin Notes     â”‚    (green)    â”‚
â”‚         â”‚                   â”‚ + Manual Transfer â”‚               â”‚
â”‚         â”‚                   â”‚                   â”‚               â”‚
â”‚         â”‚                   â”‚ Reject Refund     â”‚               â”‚
â”‚         â”‚                   â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€> REJECTED    â”‚
â”‚         â”‚                   â”‚ + Rejection Reasonâ”‚    (red)      â”‚
â”‚         â”‚                   â”‚                   â”‚               â”‚
â”‚         â–¼                   â–¼                   â–¼               â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## E. API Endpoints Summary

### User Side

| Endpoint | Method | Body | Response |
|----------|--------|------|----------|
| `/refund/request` | POST | `{ subscription_id, reason }` | `{ refund_id, status, message }` |
| `/refund/list` | GET | - | `UserRefund[]` |

### Admin Side

| Endpoint | Method | Body | Response |
|----------|--------|------|----------|
| `/admin/refunds` | GET | `?status=pending` | `RefundListItem[]` |
| `/admin/refunds/:id` | GET | - | `RefundListItem` |
| `/admin/refunds/:id/approve` | POST | `{ admin_notes? }` | `RefundApprovalResponse` |
| `/admin/refunds/:id/reject` | POST | `{ rejection_reason }` | - |

---

## F. Status Badge Colors

| Status | Variant | Color |
|--------|---------|-------|
| `pending` | secondary | Yellow/Gray |
| `approved` | default | Green |
| `rejected` | destructive | Red |

---

## G. Important Notes

> [!WARNING]
> **Manual Transfer Required**
> 
> Midtrans tidak support automated refunds. Setelah admin approve refund, admin harus manually transfer ke user's payment method (bank transfer, e-wallet, etc.).

---

*Dokumen ini dibuat secara otomatis berdasarkan analisis kode sumber dalam mode READ-ONLY.*
