# Dokumentasi Fitur: Admin Subscription Management

**Tanggal Dokumentasi:** 25 Desember 2024  
**Fokus Domain:** Frontend (Admin App)  
**Lokasi:** `admin/src/features/plans/`

---

## Alur Data Semantik

```
[Admin Login ke Admin Panel]
    -> [Navigate ke /admin/plans]
    -> [List: Fetch All Plans dengan Card Layout]
    -> [View: Plan Cards dengan pricing, limits, features]
    -> [Action: Create -> CreatePlanForm -> API POST]
    -> [Action: Edit -> EditPlanForm -> API PUT]
    -> [Action: Delete -> Confirm Dialog -> API DELETE]
    -> [Action: Manage Features -> FeatureManagementDialog]
```

---

## A. Laporan Implementasi Fitur Admin Subscription Management

### Deskripsi Fungsional

Fitur ini menyediakan dashboard admin untuk mengelola Subscription Plans. Berbeda dengan User Management yang menggunakan table, Plans menggunakan **Card Layout** untuk visualisasi yang lebih informatif karena setiap plan memiliki banyak nested data (features, limits).

**Operasi yang Didukung:**

| Operasi | Trigger | API Endpoint | Deskripsi |
|---------|---------|--------------|-----------|
| **List** | Auto-fetch | `GET /admin/plans` | List semua plans dengan card layout |
| **Create** | Form Submit | `POST /admin/plans` | Buat plan baru dengan features |
| **Update** | Form Submit | `PUT /admin/plans/{id}` | Update plan existing |
| **Delete** | Confirm Dialog | `DELETE /admin/plans/{id}` | Soft delete plan |
| **Manage Features** | Dialog | `GET/POST/DELETE /admin/features` | CRUD master features |
| **Assign Feature** | Button | `POST /admin/plans/{id}/features` | Assign feature ke plan |

**Data yang Dikelola:**

| Kategori | Fields |
|----------|--------|
| **Basic Info** | name, slug, tagline, price, billing_period |
| **Storage Limits** | max_notebooks, max_notes_per_notebook |
| **AI Features** | semantic_search, ai_chat, daily limits |
| **Display Options** | is_most_popular, is_active, sort_order |

### Visualisasi

> [PLACEHOLDER SCREENSHOT - PLANS LIST]
> *Gambar 1: Admin Plans list dengan card layout.*

> [PLACEHOLDER SCREENSHOT - CREATE FORM]
> *Gambar 2: Create Plan form dengan 3 cards: Basic Info, Features, Display Options.*

> [PLACEHOLDER SCREENSHOT - PLAN CARD DETAIL]
> *Gambar 3: Plan card menampilkan pricing, limits, AI features, assigned features.*

> [PLACEHOLDER SCREENSHOT - FEATURES EDITOR]
> *Gambar 4: Plan Features Editor dengan storage limits dan AI toggles.*

> [PLACEHOLDER SCREENSHOT - DELETE DIALOG]
> *Gambar 5: Delete confirmation dialog.*

---

## B. Bedah Arsitektur & Komponen

---

### `admin/src/features/plans/index.tsx`
**Layer Terdeteksi:** `Page Component (Plans Management Entry Point)`

**Narasi Operasional:**

Komponen ini adalah entry point untuk halaman Plans Management. Menggunakan state machine sederhana dengan `viewMode` untuk switch antara 'list', 'create', dan 'edit' views. Include `FeatureManagementDialog` untuk CRUD master features.

```tsx
type ViewMode = 'list' | 'create' | 'edit'

export function PlansManagement() {
    const [viewMode, setViewMode] = useState<ViewMode>('list')
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
    const [showFeaturesDialog, setShowFeaturesDialog] = useState(false)

    const handleCreateNew = () => setViewMode('create')
    const handleEdit = (plan: SubscriptionPlan) => {
        setSelectedPlan(plan)
        setViewMode('edit')
    }
    const handleBack = () => {
        setViewMode('list')
        setSelectedPlan(null)
    }

    return (
        <>
            <Header>
                <TopNav links={topNav} />
                <div className='ms-auto flex items-center space-x-4'>
                    <Search />
                    <ThemeSwitch />
                    <ProfileDropdown />
                </div>
            </Header>

            <Main>
                <div className='mb-6 flex items-center justify-between'>
                    {viewMode === 'list' ? (
                        <>
                            <div>
                                <h1 className='text-2xl font-bold'>Subscription Plans</h1>
                                <p className='text-muted-foreground'>Manage subscription plans and pricing</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setShowFeaturesDialog(true)}>
                                    <Layers className="mr-2 h-4 w-4" />
                                    Manage Features
                                </Button>
                                <Button onClick={handleCreateNew}>
                                    <Plus className='mr-2 h-4 w-4' />
                                    Create Plan
                                </Button>
                            </div>
                        </>
                    ) : (
                        <Button variant='ghost' onClick={handleBack}>
                            <ArrowLeft className='mr-2 h-4 w-4' />
                            Back to Plans
                        </Button>
                    )}
                </div>

                {viewMode === 'list' && <PlansList onCreateNew={handleCreateNew} onEdit={handleEdit} />}
                {viewMode === 'create' && <CreatePlanForm onSuccess={handleBack} onCancel={handleBack} />}
                {viewMode === 'edit' && selectedPlan && <EditPlanForm plan={selectedPlan} onSuccess={handleBack} onCancel={handleBack} />}

                <FeatureManagementDialog open={showFeaturesDialog} onOpenChange={setShowFeaturesDialog} />
            </Main>
        </>
    )
}
```
*Caption: Snippet 1: Plans management dengan view mode state machine.*

---

### `admin/src/features/plans/components/organisms/plans-list.tsx`
**Layer Terdeteksi:** `UI Component (Plans Grid)`

**Narasi Operasional:**

Komponen ini merender grid of PlanCards. Menggunakan responsive grid (1-2-3 columns) dan menangani loading/error/empty states. Delete action dihandle dengan state untuk selected plan dan dialog.

```tsx
export function PlansList({ onCreateNew, onEdit }: PlansListProps) {
    const { data: plans, isLoading, error } = useSubscriptionPlans()
    const { mutate: deletePlan, isPending: isDeleting } = useDeletePlan()
    const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(null)

    const handleDelete = () => {
        if (planToDelete) {
            deletePlan(planToDelete.id, {
                onSuccess: () => setPlanToDelete(null),
            })
        }
    }

    if (isLoading) {
        return (
            <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                {[1, 2, 3].map((i) => <div key={i} className='h-96 animate-pulse rounded-lg bg-muted' />)}
            </div>
        )
    }

    if (error) {
        return <div className='text-destructive border border-destructive'>Failed to load subscription plans.</div>
    }

    if (!plans || plans.length === 0) {
        return (
            <div className='flex flex-col items-center justify-center border border-dashed p-12'>
                <p className='text-muted-foreground mb-4'>No subscription plans yet</p>
                {onCreateNew && <Button onClick={onCreateNew}><Plus /> Create First Plan</Button>}
            </div>
        )
    }

    return (
        <>
            <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                {plans.map((plan) => (
                    <PlanCard key={plan.id} plan={plan} onEdit={onEdit} onDelete={setPlanToDelete} />
                ))}
            </div>

            <DeletePlanDialog
                open={!!planToDelete}
                onOpenChange={(open) => !open && setPlanToDelete(null)}
                plan={planToDelete}
                onConfirm={handleDelete}
                isDeleting={isDeleting}
            />
        </>
    )
}
```
*Caption: Snippet 2: Plans list dengan grid layout dan delete dialog.*

---

### `admin/src/features/plans/components/molecules/plan-card.tsx`
**Layer Terdeteksi:** `UI Component (Plan Display Card)`

**Narasi Operasional:**

Komponen ini merender satu plan dalam format card dengan informasi lengkap: pricing, storage limits, AI features, assigned features. Includes visual indicators untuk "Most Popular" dan "Hidden" status.

**Sections dalam Card:**
1. Header: name, slug, billing period badge
2. Price display dengan currency format
3. Storage Limits: notebooks, notes per notebook
4. AI Features: semantic search, AI chat dengan daily limits
5. Assigned Features: list dari master features yang di-assign
6. Actions: Edit dan Delete buttons

```tsx
export function PlanCard({ plan, onEdit, onDelete, className }: PlanCardProps) {
    const { data: features, isLoading: isLoadingFeatures } = usePlanFeatures(plan.id)
    const isInactive = plan.is_active === false

    return (
        <Card className={cn(
            'relative transition-all duration-200',
            plan.is_most_popular && 'ring-2 ring-amber-500 ring-offset-2',
            isInactive && 'opacity-60',
            className
        )}>
            {/* Most Popular Badge */}
            {plan.is_most_popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="gap-1 bg-amber-500 text-white">
                        <Crown className="h-3 w-3" />
                        Most Popular
                    </Badge>
                </div>
            )}

            {/* Inactive Overlay */}
            {isInactive && (
                <div className="absolute right-3 top-3">
                    <Badge variant="secondary"><EyeOff /> Hidden</Badge>
                </div>
            )}

            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <CardTitle>{plan.name}</CardTitle>
                        <CardDescription className="font-mono text-xs">/{plan.slug}</CardDescription>
                    </div>
                    <Badge variant="outline" className="capitalize">{plan.billing_period}</Badge>
                </div>
                {plan.tagline && <p className="text-sm text-muted-foreground">{plan.tagline}</p>}
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Price */}
                <div>
                    <p className="text-3xl font-bold"><CurrencyDisplay amount={plan.price} /></p>
                    <p className="text-sm text-muted-foreground">per {plan.billing_period === 'monthly' ? 'month' : 'year'}</p>
                </div>

                {/* Storage Limits */}
                <div className="space-y-2">
                    <p className="text-xs font-medium uppercase text-muted-foreground">Storage Limits</p>
                    <ul className="space-y-1.5">
                        <li className="flex items-center gap-2 text-sm">
                            <FolderOpen /> <span className="flex-1">Notebooks</span>
                            <LimitBadge value={plan.features.max_notebooks} />
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                            <FileText /> <span className="flex-1">Notes per Notebook</span>
                            <LimitBadge value={plan.features.max_notes_per_notebook} />
                        </li>
                    </ul>
                </div>

                {/* AI Features */}
                <div className="space-y-2">
                    <p className="text-xs font-medium uppercase text-muted-foreground">AI Features</p>
                    <ul className="space-y-1.5">
                        <li className="flex items-center gap-2 text-sm">
                            {plan.features.semantic_search ? <Check className="text-green-600" /> : <X className="text-muted-foreground" />}
                            <Search /> Semantic Search
                            {plan.features.semantic_search && <LimitBadge value={plan.features.semantic_search_daily_limit} suffix="/day" />}
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                            {plan.features.ai_chat ? <Check className="text-green-600" /> : <X className="text-muted-foreground" />}
                            <MessageSquare /> AI Chat
                            {plan.features.ai_chat && <LimitBadge value={plan.features.ai_chat_daily_limit} suffix="/day" />}
                        </li>
                    </ul>
                </div>

                {/* Assigned Display Features */}
                <div className="space-y-2">
                    <p className="text-xs font-medium uppercase text-muted-foreground">Included Features</p>
                    {isLoadingFeatures ? (
                        <div className="animate-pulse">Loading...</div>
                    ) : features && features.length > 0 ? (
                        <ul className="space-y-1.5">
                            {features.map((feature) => (
                                <li key={feature.id} className="flex items-start gap-2 text-sm">
                                    <Check className="text-green-600" />
                                    <span>{feature.name}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground italic">No extra features assigned</p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                    {onEdit && <Button variant="outline" size="sm" onClick={() => onEdit(plan)}><Edit /> Edit</Button>}
                    {onDelete && <Button variant="destructive" size="sm" onClick={() => onDelete(plan)}><Trash2 /></Button>}
                </div>
            </CardContent>
        </Card>
    )
}
```
*Caption: Snippet 3: Plan card dengan complete information display.*

---

### `admin/src/features/plans/components/organisms/create-plan-form.tsx`
**Layer Terdeteksi:** `Form Component (Plan Creation)`

**Narasi Operasional:**

Form ini menangani creation plan baru dengan 3 Card sections: Basic Info, Features, Display Options. Menggunakan React Hook Form dengan Zod resolver. Auto-generate slug dari name.

**Form Cards:**
1. **Basic Information:** name, slug (auto-generated), tagline, price, billing_period
2. **Usage Limits & Features:** PlanFeaturesEditor component
3. **Display Options:** is_most_popular toggle, is_active toggle, sort_order

```tsx
export function CreatePlanForm({ onSuccess, onCancel }: CreatePlanFormProps) {
    const { mutate: createPlan, isPending } = useCreatePlan()

    const { handleSubmit, watch, setValue, formState: { errors } } = useForm<CreatePlanFormData>({
        resolver: zodResolver(createPlanFormSchema),
        defaultValues: {
            name: '', slug: '', tagline: '', price: 0, tax_rate: 0, billing_period: 'monthly',
            max_notebooks: 3, max_notes_per_notebook: 10,
            semantic_search: false, ai_chat: false,
            ai_chat_daily_limit: 0, semantic_search_daily_limit: 0,
            is_most_popular: false, is_active: true, sort_order: 0,
        },
    })

    // Auto-generate slug from name
    const handleNameChange = (value: string) => {
        setValue('name', value)
        if (!watch('slug')) {
            const autoSlug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
            setValue('slug', autoSlug)
        }
    }

    const onSubmit = (data: CreatePlanFormData) => {
        createPlan({
            name: data.name, slug: data.slug, tagline: data.tagline,
            price: data.price, tax_rate: data.tax_rate, billing_period: data.billing_period,
            is_most_popular: data.is_most_popular, is_active: data.is_active, sort_order: data.sort_order,
            features: {
                max_notebooks: data.max_notebooks,
                max_notes_per_notebook: data.max_notes_per_notebook,
                semantic_search: data.semantic_search,
                ai_chat: data.ai_chat,
                ai_chat_daily_limit: data.ai_chat_daily_limit,
                semantic_search_daily_limit: data.semantic_search_daily_limit,
            },
        }, { onSuccess: () => onSuccess?.() })
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Settings /> Basic Information</CardTitle>
                    <CardDescription>Set the plan name, pricing, and billing cycle</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <PlanNameInput value={watch('name')} onChange={handleNameChange} error={errors.name?.message} />
                        <PlanSlugInput value={watch('slug')} onChange={(v) => setValue('slug', v)} error={errors.slug?.message} />
                    </div>
                    <Textarea id="tagline" placeholder="Plan tagline..." value={watch('tagline') || ''} onChange={(e) => setValue('tagline', e.target.value)} />
                    <div className="grid gap-4 md:grid-cols-2">
                        <PlanPriceInput value={watch('price')} onChange={(v) => setValue('price', v)} error={errors.price?.message} />
                        <BillingPeriodSelect value={watch('billing_period')} onChange={(v) => setValue('billing_period', v)} />
                    </div>
                </CardContent>
            </Card>

            {/* Features Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Usage Limits & Features</CardTitle>
                    <CardDescription>Configure storage limits and AI feature access</CardDescription>
                </CardHeader>
                <CardContent>
                    <PlanFeaturesEditor
                        maxNotebooks={watch('max_notebooks')}
                        onMaxNotebooksChange={(v) => setValue('max_notebooks', v)}
                        maxNotesPerNotebook={watch('max_notes_per_notebook')}
                        onMaxNotesPerNotebookChange={(v) => setValue('max_notes_per_notebook', v)}
                        semanticSearch={watch('semantic_search')}
                        onSemanticSearchChange={(v) => setValue('semantic_search', v)}
                        aiChat={watch('ai_chat')}
                        onAiChatChange={(v) => setValue('ai_chat', v)}
                        aiChatDailyLimit={watch('ai_chat_daily_limit')}
                        onAiChatDailyLimitChange={(v) => setValue('ai_chat_daily_limit', v)}
                        semanticSearchDailyLimit={watch('semantic_search_daily_limit')}
                        onSemanticSearchDailyLimitChange={(v) => setValue('semantic_search_daily_limit', v)}
                    />
                </CardContent>
            </Card>

            {/* Display Options Card */}
            <Card>
                <CardHeader>
                    <CardTitle><Eye /> Display Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Most Popular Toggle */}
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <Label><Crown className="text-amber-500" /> Most Popular</Label>
                            <Switch checked={watch('is_most_popular')} onCheckedChange={(v) => setValue('is_most_popular', v)} />
                        </div>
                        {/* Active Toggle */}
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <Label>Active</Label>
                            <Switch checked={watch('is_active')} onCheckedChange={(v) => setValue('is_active', v)} />
                        </div>
                    </div>
                    <Input type="number" min="0" value={watch('sort_order')} onChange={(e) => setValue('sort_order', parseInt(e.target.value) || 0)} />
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-3">
                {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
                <Button type="submit" disabled={isPending}>{isPending ? 'Creating...' : 'Create Plan'}</Button>
            </div>
        </form>
    )
}
```
*Caption: Snippet 4: Create plan form dengan 3 card sections.*

---

### `admin/src/features/plans/components/molecules/plan-features-editor.tsx`
**Layer Terdeteksi:** `UI Component (Features Configuration)`

**Narasi Operasional:**

Komponen ini menyediakan UI untuk edit storage limits dan AI features. Dibagi 2 sections: Storage Limits (notebooks, notes) dan AI Features (semantic search, AI chat). Daily limits hanya muncul jika feature toggle aktif.

**Special Values:**
- `-1` = Unlimited
- `0` = Disabled

```tsx
export function PlanFeaturesEditor({
    maxNotebooks, onMaxNotebooksChange,
    maxNotesPerNotebook, onMaxNotesPerNotebookChange,
    semanticSearch, onSemanticSearchChange,
    aiChat, onAiChatChange,
    aiChatDailyLimit, onAiChatDailyLimitChange,
    semanticSearchDailyLimit, onSemanticSearchDailyLimitChange,
    disabled, className,
}: PlanFeaturesEditorProps) {
    return (
        <div className={cn('space-y-6', className)}>
            {/* Storage Limits Section */}
            <div className="rounded-lg border bg-card p-4">
                <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <FolderOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold">Storage Limits</h3>
                        <p className="text-xs text-muted-foreground">Cumulative limits that don't reset</p>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label><FolderOpen /> Max Notebooks (Folders)</Label>
                        <div className="flex items-center gap-2">
                            <CleanNumberInput allowNegative={true} placeholder="-1 (unlimited)" value={maxNotebooks} onChange={onMaxNotebooksChange} />
                            <LimitValueDisplay value={maxNotebooks} />
                        </div>
                        <p className="text-xs text-muted-foreground">-1 = unlimited, 0 = disabled</p>
                    </div>

                    <div className="space-y-2">
                        <Label><FileText /> Max Notes per Notebook</Label>
                        <div className="flex items-center gap-2">
                            <CleanNumberInput allowNegative={true} value={maxNotesPerNotebook} onChange={onMaxNotesPerNotebookChange} />
                            <LimitValueDisplay value={maxNotesPerNotebook} />
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Features Section */}
            <div className="rounded-lg border bg-card p-4">
                <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-1/10">
                        <Sparkles className="h-4 w-4 text-chart-1" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold">AI Features</h3>
                        <p className="text-xs text-muted-foreground">Daily limits reset at midnight</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Semantic Search Toggle + Daily Limit */}
                    <div className="rounded-lg border bg-background/50 p-4">
                        <div className="flex items-center justify-between">
                            <Label><Search /> Semantic Search</Label>
                            <Switch checked={semanticSearch} onCheckedChange={onSemanticSearchChange} />
                        </div>
                        {semanticSearch && (
                            <div className="mt-4 space-y-2">
                                <Label className="text-xs">Daily Search Limit</Label>
                                <div className="flex items-center gap-2">
                                    <CleanNumberInput value={semanticSearchDailyLimit} onChange={onSemanticSearchDailyLimitChange} />
                                    <span className="text-xs text-muted-foreground">requests/day</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* AI Chat Toggle + Daily Limit */}
                    <div className="rounded-lg border bg-background/50 p-4">
                        <div className="flex items-center justify-between">
                            <Label><MessageSquare /> AI Chat Assistant</Label>
                            <Switch checked={aiChat} onCheckedChange={onAiChatChange} />
                        </div>
                        {aiChat && (
                            <div className="mt-4 space-y-2">
                                <Label className="text-xs">Daily Chat Limit</Label>
                                <div className="flex items-center gap-2">
                                    <CleanNumberInput value={aiChatDailyLimit} onChange={onAiChatDailyLimitChange} />
                                    <span className="text-xs text-muted-foreground">messages/day</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
```
*Caption: Snippet 5: Features editor dengan storage dan AI sections.*

---

### `admin/src/features/plans/data/schema.ts`
**Layer Terdeteksi:** `Type Definition (Zod Schemas)`

**Narasi Operasional:**

File ini mendefinisikan Zod schemas untuk plan management. Includes schemas untuk plan features, billing period, create form, dan update form.

```tsx
// Plan Usage Limits Schema
export const planFeaturesSchema = z.object({
    max_notebooks: z.number().int().min(-1),  // -1 = unlimited, 0 = disabled
    max_notes_per_notebook: z.number().int().min(-1),
    semantic_search: z.boolean(),
    ai_chat: z.boolean(),
    ai_chat_daily_limit: z.number().int().min(-1),
    semantic_search_daily_limit: z.number().int().min(-1),
})
export type PlanFeatures = z.infer<typeof planFeaturesSchema>

// Billing Period
export const billingPeriodSchema = z.enum(['monthly', 'yearly'])
export type BillingPeriod = z.infer<typeof billingPeriodSchema>

// Subscription Plan Schema
export const subscriptionPlanSchema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    tagline: z.string().nullable().optional(),
    price: z.number(),
    billing_period: billingPeriodSchema,
    is_most_popular: z.boolean().optional(),
    is_active: z.boolean().optional(),
    sort_order: z.number().optional(),
    features: planFeaturesSchema,
})
export type SubscriptionPlan = z.infer<typeof subscriptionPlanSchema>

// Create Plan Form Schema
export const createPlanFormSchema = z.object({
    name: z.string().min(1, 'Plan name is required'),
    slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
    tagline: z.string().optional(),
    price: z.number().min(0, 'Price must be 0 or greater'),
    tax_rate: z.number().min(0).max(1).optional(),
    billing_period: billingPeriodSchema,
    max_notebooks: z.number().int().min(-1),
    max_notes_per_notebook: z.number().int().min(-1),
    semantic_search: z.boolean(),
    ai_chat: z.boolean(),
    ai_chat_daily_limit: z.number().int().min(-1),
    semantic_search_daily_limit: z.number().int().min(-1),
    is_most_popular: z.boolean().optional(),
    is_active: z.boolean().optional(),
    sort_order: z.number().int().min(0).optional(),
})
export type CreatePlanFormData = z.infer<typeof createPlanFormSchema>
```
*Caption: Snippet 6: Zod schemas untuk plan management.*

---

### `admin/src/hooks/use-admin-api.ts (Plans Hooks)`
**Layer Terdeteksi:** `Custom Hooks (API Operations)`

**Narasi Operasional:**

File ini menyediakan hooks untuk plans CRUD. Includes query keys, list/detail queries, dan create/update/delete mutations dengan cache invalidation.

```tsx
export const adminQueryKeys = {
    plans: ['admin', 'plans'] as const,
    plan: (id: string) => ['admin', 'plans', id] as const,
    planFeatures: (planId: string) => ['admin', 'plans', planId, 'features'] as const,
    features: ['admin', 'features'] as const,
}

// Subscription Plans Hooks
export function useSubscriptionPlans() {
    return useQuery({
        queryKey: adminQueryKeys.plans,
        queryFn: () => adminPlansApi.getPlans(),
    })
}

export function useSubscriptionPlan(id: string) {
    return useQuery({
        queryKey: adminQueryKeys.plan(id),
        queryFn: () => adminPlansApi.getPlan(id),
        enabled: !!id,
    })
}

export function useCreatePlan() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: CreatePlanRequest) => adminPlansApi.createPlan(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.plans })
            toast.success('Subscription plan created successfully')
        },
        onError: (error) => toast.error(`Failed to create plan: ${handleApiError(error)}`),
    })
}

export function useUpdatePlan() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdatePlanRequest }) => adminPlansApi.updatePlan(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.plans })
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.plan(variables.id) })
            toast.success('Subscription plan updated successfully')
        },
        onError: (error) => toast.error(`Failed to update plan: ${handleApiError(error)}`),
    })
}

export function useDeletePlan() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => adminPlansApi.deletePlan(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.plans })
            toast.success('Subscription plan deleted successfully')
        },
        onError: (error) => toast.error(`Failed to delete plan: ${handleApiError(error)}`),
    })
}

// Feature Assignment Hooks
export function usePlanFeatures(planId: string) {
    return useQuery({
        queryKey: adminQueryKeys.planFeatures(planId),
        queryFn: () => adminPlanFeaturesApi.getFeatures(planId),
        enabled: !!planId,
    })
}

export function useAssignFeature() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ planId, featureKey }: { planId: string; featureKey: string }) =>
            adminPlanFeaturesApi.assignFeature(planId, featureKey),
        onSuccess: (_, { planId }) => {
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.planFeatures(planId) })
            toast.success('Feature assigned successfully')
        },
    })
}
```
*Caption: Snippet 7: Plans CRUD hooks dengan cache management.*

---

## C. Ringkasan Ketergantungan Komponen

| Komponen | Menerima Dari | Meneruskan Ke |
|----------|---------------|---------------|
| `PlansManagement` | State (viewMode) | `PlansList`, `CreatePlanForm`, `EditPlanForm` |
| `PlansList` | `useSubscriptionPlans` | `PlanCard`, `DeletePlanDialog` |
| `PlanCard` | Plan data | Display only + actions |
| `CreatePlanForm` | Form state | `useCreatePlan` mutation |
| `PlanFeaturesEditor` | Props from form | Controlled inputs |

---

## D. Diagram Plans Management Flow

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    Admin Panel - Plans                           â”‚
â”‚                                                                  â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚  Header with TopNav                                       â”‚   â”‚
â”‚  â”‚  [Dashboard] [Plans (active)] [Users]                     â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                                                                  â”‚
â”‚  Subscription Plans                    [Manage Features][+Create]â”‚
â”‚  Manage subscription plans and pricing                           â”‚
â”‚                                                                  â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚    Free Plan    â”‚ â”‚ â­ Pro Plan     â”‚ â”‚ Enterprise Plan â”‚   â”‚
â”‚  â”‚                 â”‚ â”‚ Most Popular    â”‚ â”‚                 â”‚   â”‚
â”‚  â”‚  /$0/month      â”‚ â”‚  /$19/month     â”‚ â”‚  /$49/month     â”‚   â”‚
â”‚  â”‚                 â”‚ â”‚                 â”‚ â”‚                 â”‚   â”‚
â”‚  â”‚  Storage Limits â”‚ â”‚  Storage Limits â”‚ â”‚  Storage Limits â”‚   â”‚
â”‚  â”‚  ðŸ“ 3 notebooks â”‚ â”‚  ðŸ“ âˆž unlimited â”‚ â”‚  ðŸ“ âˆž unlimited â”‚   â”‚
â”‚  â”‚  ðŸ“„ 10 notes/nb â”‚ â”‚  ðŸ“„ 100 notes   â”‚ â”‚  ðŸ“„ âˆž unlimited â”‚   â”‚
â”‚  â”‚                 â”‚ â”‚                 â”‚ â”‚                 â”‚   â”‚
â”‚  â”‚  AI Features    â”‚ â”‚  AI Features    â”‚ â”‚  AI Features    â”‚   â”‚
â”‚  â”‚  âœ— Semantic     â”‚ â”‚  âœ“ Semantic 30/dâ”‚ â”‚  âœ“ Semantic âˆž   â”‚   â”‚
â”‚  â”‚  âœ— AI Chat      â”‚ â”‚  âœ“ AI Chat 50/d â”‚ â”‚  âœ“ AI Chat âˆž    â”‚   â”‚
â”‚  â”‚                 â”‚ â”‚                 â”‚ â”‚                 â”‚   â”‚
â”‚  â”‚  [Edit] [ðŸ—‘]    â”‚ â”‚  [Edit] [ðŸ—‘]    â”‚ â”‚  [Edit] [ðŸ—‘]    â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## E. Create Plan Form Layout

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  [â† Back to Plans]                                               â”‚
â”‚                                                                  â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚  âš™ï¸ Basic Information                                     â”‚   â”‚
â”‚  â”‚  Set the plan name, pricing, and billing cycle            â”‚   â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”         â”‚   â”‚
â”‚  â”‚  â”‚ Plan Name          â”‚ â”‚ Slug (auto-gen)     â”‚         â”‚   â”‚
â”‚  â”‚  â”‚ [Pro Plan_______]  â”‚ â”‚ [pro-plan_________] â”‚         â”‚   â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜         â”‚   â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”          â”‚   â”‚
â”‚  â”‚  â”‚ Tagline                                    â”‚          â”‚   â”‚
â”‚  â”‚  â”‚ [Unlock AI Chat and Semantic Search______] â”‚          â”‚   â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜          â”‚   â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”         â”‚   â”‚
â”‚  â”‚  â”‚ Price              â”‚ â”‚ Billing Period     â”‚         â”‚   â”‚
â”‚  â”‚  â”‚ [Rp 199.000______] â”‚ â”‚ [Monthly â–¼]        â”‚         â”‚   â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜         â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                                                                  â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚  Usage Limits & Features                                  â”‚   â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚   â”‚
â”‚  â”‚  â”‚  ðŸ“ Storage Limits                                  â”‚  â”‚   â”‚
â”‚  â”‚  â”‚  Max Notebooks: [-1_____] âˆž Unlimited              â”‚  â”‚   â”‚
â”‚  â”‚  â”‚  Max Notes/NB:  [100____]                          â”‚  â”‚   â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚   â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚   â”‚
â”‚  â”‚  â”‚  âœ¨ AI Features                                     â”‚  â”‚   â”‚
â”‚  â”‚  â”‚  ðŸ” Semantic Search  [ON/OFF]   Daily: [30] /day  â”‚  â”‚   â”‚
â”‚  â”‚  â”‚  ðŸ’¬ AI Chat          [ON/OFF]   Daily: [50] /day  â”‚  â”‚   â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                                                                  â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚  ðŸ‘ Display Options                                       â”‚   â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”           â”‚   â”‚
â”‚  â”‚  â”‚ ðŸ‘‘ Most Popular    â”‚ â”‚ Active             â”‚           â”‚   â”‚
â”‚  â”‚  â”‚      [ON/OFF]      â”‚ â”‚      [ON/OFF]      â”‚           â”‚   â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜           â”‚   â”‚
â”‚  â”‚  Sort Order: [0___]                                      â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                                                                  â”‚
â”‚                                    [Cancel]  [Create Plan]       â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

*Dokumen ini dibuat secara otomatis berdasarkan analisis kode sumber dalam mode READ-ONLY.*
