# Dokumentasi Fitur: Admin Limit Plan Management

**Tanggal Dokumentasi:** 25 Desember 2024  
**Fokus Domain:** Frontend (Admin App)  
**Lokasi:** `admin/src/features/plans/components/molecules/`

---

## Alur Data Semantik

```
[Admin di Plans Page]
    -> [Click "Manage Features"] -> [FeatureManagementDialog]
        -> [List Master Features dengan CRUD]
        -> [Create: key, name, description, category, is_active]
        -> [Edit: update feature properties]
        -> [Delete: soft delete dengan confirmation]
    
    -> [Create/Edit Plan Form]
        -> [PlanFeaturesEditor: Storage Limits + AI Features]
            -> [max_notebooks: -1 (unlimited), 0 (disabled), N]
            -> [max_notes_per_notebook]
            -> [semantic_search: toggle + daily_limit]
            -> [ai_chat: toggle + daily_limit]
    
    -> [Plan Detail -> Manage Features]
        -> [PlanFeaturesManager: Assign/Remove features to plan]
            -> [Combobox select dari available features]
            -> [Remove dengan confirmation dialog]
```

---

## A. Laporan Implementasi Fitur Admin Limit Plan Management

### Deskripsi Fungsional

Fitur ini mengelola dua aspek limits pada subscription plans:

1. **Master Features** - Catalog fitur global yang dapat di-assign ke plans
2. **Usage Limits** - Storage dan AI limits per plan (notebooks, notes, search, chat)
3. **Feature Assignment** - Many-to-many relationship plan-features

**Komponen Utama:**

| Komponen | Fungsi |
|----------|--------|
| `FeatureManagementDialog` | CRUD master features (global catalog) |
| `PlanFeaturesEditor` | Edit storage limits & AI features per plan |
| `PlanFeaturesManager` | Assign/remove features ke specific plan |

**Data Models:**

| Model | Fields |
|-------|--------|
| **Feature** (Master) | id, key, name, description, category, is_active, sort_order |
| **PlanFeatures** (Limits) | max_notebooks, max_notes_per_notebook, semantic_search, ai_chat, daily_limits |
| **PlanDisplayFeature** | plan_id, feature_key, display_text, is_enabled, sort_order |

### Visualisasi

> [PLACEHOLDER SCREENSHOT - MANAGE FEATURES BUTTON]
> *Gambar 1: Button "Manage Features" di Plans page header.*

> [PLACEHOLDER SCREENSHOT - FEATURE MANAGEMENT DIALOG]
> *Gambar 2: Dialog dengan list features (kiri) dan create/edit form (kanan).*

> [PLACEHOLDER SCREENSHOT - FEATURES LIST TABLE]
> *Gambar 3: Table master features dengan key, name, actions.*

> [PLACEHOLDER SCREENSHOT - PLAN FEATURES EDITOR]
> *Gambar 4: Storage limits dan AI features editor di create/edit plan form.*

> [PLACEHOLDER SCREENSHOT - PLAN FEATURES MANAGER]
> *Gambar 5: Assign features to plan dengan combobox selector.*

---

## B. Bedah Arsitektur & Komponen

---

### `admin/src/features/plans/components/molecules/feature-management-dialog.tsx`
**Layer Terdeteksi:** `UI Component (Master Features CRUD)`

**Narasi Operasional:**

Dialog fullscreen untuk mengelola master features catalog. Split-view: tabel features di kiri, form create/edit di kanan. Features sorted by sort_order, searchable by name/key.

```tsx
export function FeatureManagementDialog({ open, onOpenChange }: FeatureManagementDialogProps) {
    const { data: features, isLoading } = useFeatures()
    const { mutate: createFeature, isPending: isCreating } = useCreateFeature()
    const { mutate: updateFeature, isPending: isUpdating } = useUpdateFeature()
    const { mutate: deleteFeature, isPending: isDeleting } = useDeleteFeature()

    const [isEditing, setIsEditing] = useState(false)
    const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null)
    const [deletingFeature, setDeletingFeature] = useState<Feature | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    // Form state
    const [formData, setFormData] = useState({
        key: '',
        name: '',
        description: '',
        category: '',
        is_active: true,
        sort_order: 0,
    })

    const resetForm = () => {
        setFormData({
            key: '', name: '', description: '', category: '',
            is_active: true,
            sort_order: features?.length ? features.length * 10 : 0,
        })
        setIsEditing(false)
        setSelectedFeature(null)
    }

    const handleEdit = (feature: Feature) => {
        setFormData({
            key: feature.key,
            name: feature.name,
            description: feature.description || '',
            category: feature.category || '',
            is_active: feature.is_active,
            sort_order: feature.sort_order,
        })
        setSelectedFeature(feature)
        setIsEditing(true)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (isEditing && selectedFeature) {
            updateFeature({
                id: selectedFeature.id,
                data: {
                    name: formData.name,
                    description: formData.description,
                    category: formData.category,
                    is_active: formData.is_active,
                    sort_order: formData.sort_order,
                }
            }, { onSuccess: () => resetForm() })
        } else {
            createFeature(formData, { onSuccess: () => resetForm() })
        }
    }

    const filteredFeatures = features?.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.key.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []

    const sortedFeatures = [...filteredFeatures].sort((a, b) => a.sort_order - b.sort_order)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!max-w-none w-[98vw] max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Feature Management</DialogTitle>
                    <DialogDescription>
                        Create and manage global features that can be assigned to subscription plans.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex gap-6 flex-1 overflow-hidden pt-4">
                    {/* List Section */}
                    <div className="flex-[2] flex flex-col gap-4 overflow-hidden border-r pr-6">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search features..." className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[200px]">Key</TableHead>
                                        <TableHead className="w-auto">Name</TableHead>
                                        <TableHead className="w-[100px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedFeatures.map((feature) => (
                                        <TableRow key={feature.id} className={selectedFeature?.id === feature.id ? "bg-muted/50" : ""}>
                                            <TableCell className="font-mono text-xs">{feature.key}</TableCell>
                                            <TableCell>
                                                <span className="font-medium">{feature.name}</span>
                                                <span className="text-xs text-muted-foreground">{feature.description}</span>
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(feature)}><Pencil /></Button>
                                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeletingFeature(feature)}><Trash2 /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="flex-1 flex flex-col gap-4 overflow-y-auto pl-1">
                        <h3 className="font-semibold text-lg">
                            {isEditing ? 'Edit Feature' : 'Create New Feature'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Feature Key *</Label>
                                <Input value={formData.key} onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                                    placeholder="e.g. ai-chat-gpt4" disabled={isEditing} />
                                <p className="text-xs text-muted-foreground">Cannot be changed after creation.</p>
                            </div>

                            <div className="space-y-2">
                                <Label>Display Name *</Label>
                                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. GPT-4 Access" />
                            </div>

                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    placeholder="e.g. AI Features" />
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Internal description..." />
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <div>
                                    <Label>Active Status</Label>
                                    <p className="text-xs text-muted-foreground">Enable or disable this feature</p>
                                </div>
                                <Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
                            </div>

                            <div className="space-y-2">
                                <Label>Sort Order</Label>
                                <Input type="number" value={formData.sort_order} onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })} />
                            </div>

                            <Button type="submit" className="w-full" disabled={!formData.key || !formData.name || isCreating || isUpdating}>
                                {isEditing ? 'Update Feature' : 'Create Feature'}
                            </Button>
                        </form>
                    </div>
                </div>
            </DialogContent>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deletingFeature} onOpenChange={(open) => !open && setDeletingFeature(null)}>
                <AlertDialogContent>
                    <AlertDialogTitle>Delete Feature</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete "{deletingFeature?.name}"?
                        This action cannot be undone and may affect plans using this feature.
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deletingFeature && deleteFeature(deletingFeature.id)} className="bg-destructive">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Dialog>
    )
}
```
*Caption: Snippet 1: Feature Management Dialog dengan split-view CRUD.*

---

### `admin/src/features/plans/components/molecules/plan-features-editor.tsx`
**Layer Terdeteksi:** `UI Component (Usage Limits Editor)`

**Narasi Operasional:**

Editor untuk storage limits dan AI features pada plan. Dibagi 2 sections: Storage Limits (cumulative) dan AI Features (daily reset). Special values: -1 = unlimited, 0 = disabled.

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
                    {/* Max Notebooks */}
                    <div className="space-y-2">
                        <Label><FolderOpen /> Max Notebooks (Folders)</Label>
                        <div className="flex items-center gap-2">
                            <CleanNumberInput allowNegative={true} placeholder="-1 (unlimited)"
                                value={maxNotebooks} onChange={onMaxNotebooksChange} disabled={disabled} />
                            <LimitValueDisplay value={maxNotebooks} />
                        </div>
                        <p className="text-xs text-muted-foreground">-1 = unlimited, 0 = disabled</p>
                    </div>

                    {/* Max Notes per Notebook */}
                    <div className="space-y-2">
                        <Label><FileText /> Max Notes per Notebook</Label>
                        <div className="flex items-center gap-2">
                            <CleanNumberInput allowNegative={true}
                                value={maxNotesPerNotebook} onChange={onMaxNotesPerNotebookChange} disabled={disabled} />
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
                            <Switch checked={semanticSearch} onCheckedChange={onSemanticSearchChange} disabled={disabled} />
                        </div>
                        {semanticSearch && (
                            <div className="mt-4 space-y-2">
                                <Label className="text-xs">Daily Search Limit</Label>
                                <div className="flex items-center gap-2">
                                    <CleanNumberInput value={semanticSearchDailyLimit} onChange={onSemanticSearchDailyLimitChange} disabled={disabled} />
                                    <span className="text-xs text-muted-foreground">requests/day</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* AI Chat Toggle + Daily Limit */}
                    <div className="rounded-lg border bg-background/50 p-4">
                        <div className="flex items-center justify-between">
                            <Label><MessageSquare /> AI Chat Assistant</Label>
                            <Switch checked={aiChat} onCheckedChange={onAiChatChange} disabled={disabled} />
                        </div>
                        {aiChat && (
                            <div className="mt-4 space-y-2">
                                <Label className="text-xs">Daily Chat Limit</Label>
                                <div className="flex items-center gap-2">
                                    <CleanNumberInput value={aiChatDailyLimit} onChange={onAiChatDailyLimitChange} disabled={disabled} />
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
*Caption: Snippet 2: Plan Features Editor dengan storage dan AI sections.*

---

### `admin/src/features/plans/components/molecules/plan-features-manager.tsx`
**Layer Terdeteksi:** `UI Component (Feature Assignment)`

**Narasi Operasional:**

Komponen untuk assign/remove master features ke specific plan. Menggunakan Combobox untuk select dari available features (sudah difilter yang belum di-assign). Remove dengan confirmation dialog.

```tsx
export function PlanFeaturesManager({ planId, onBack }: PlanFeaturesManagerProps) {
    const { data: assignedFeatures, isLoading: isLoadingAssigned } = usePlanFeatures(planId)
    const { data: allFeatures, isLoading: isLoadingAll } = useFeatures()
    const { mutate: assignFeature, isPending: isAssigning } = useAssignFeature()
    const { mutate: removeFeature, isPending: isRemoving } = useRemoveFeature()

    const [openCombobox, setOpenCombobox] = useState(false)
    const [removingFeature, setRemovingFeature] = useState<Feature | null>(null)

    // Filter out already assigned features
    const availableFeatures = allFeatures?.filter(
        (f) => !assignedFeatures?.some((af) => af.key === f.key)
    ) || []

    const handleAssign = (featureKey: string) => {
        assignFeature(
            { planId, featureKey },
            { onSuccess: () => setOpenCombobox(false) }
        )
    }

    const handleRemove = () => {
        if (!removingFeature) return
        removeFeature(
            { planId, featureId: removingFeature.id },
            { onSuccess: () => setRemovingFeature(null) }
        )
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {onBack && (
                            <Button variant="ghost" size="icon" onClick={onBack}>
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        )}
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5" />
                                Assigned Features
                            </CardTitle>
                            <CardDescription>Manage features included in this plan</CardDescription>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Assignment Control */}
                <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Assign New Feature</span>
                        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" role="combobox" className="w-[300px] justify-between" disabled={isLoadingAll || isAssigning}>
                                    {isAssigning ? 'Assigning...' : 'Select feature to assign...'}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0">
                                <Command>
                                    <CommandInput placeholder="Search features..." />
                                    <CommandList>
                                        <CommandEmpty>No feature found.</CommandEmpty>
                                        <CommandGroup>
                                            {availableFeatures.map((feature) => (
                                                <CommandItem key={feature.key} value={feature.key} onSelect={() => handleAssign(feature.key)}>
                                                    <div className="flex flex-col">
                                                        <span>{feature.name}</span>
                                                        <span className="text-xs text-muted-foreground">{feature.key}</span>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {/* Assigned List */}
                <div className="rounded-md border">
                    {isLoadingAssigned ? (
                        <div className="p-8 text-center"><Loader2 className="animate-spin" /></div>
                    ) : assignedFeatures?.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">No features assigned yet.</div>
                    ) : (
                        <div className="divide-y">
                            {assignedFeatures?.map((feature) => (
                                <div key={feature.id} className="flex items-center justify-between p-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{feature.name}</span>
                                            <Badge variant="outline" className="text-xs font-mono">{feature.key}</Badge>
                                            {!feature.is_active && <Badge variant="destructive">Inactive</Badge>}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive"
                                        onClick={() => setRemovingFeature(feature)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>

            {/* Remove Confirmation */}
            <AlertDialog open={!!removingFeature} onOpenChange={(open) => !open && setRemovingFeature(null)}>
                <AlertDialogContent>
                    <AlertDialogTitle>Remove Feature</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to remove "{removingFeature?.name}" from this plan?
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRemove} className="bg-destructive">Remove</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    )
}
```
*Caption: Snippet 3: Plan Features Manager dengan combobox assignment.*

---

### `admin/src/lib/types/admin-api.ts (Feature Types)`
**Layer Terdeteksi:** `Type Definitions`

**Narasi Operasional:**

Zod schemas untuk Feature management types. Master Feature schema dengan key (immutable), name, category, is_active.

```tsx
// Master Feature Types
export const featureSchema = z.object({
    id: z.string(),
    key: z.string(),
    name: z.string(),
    description: z.string().optional(),
    category: z.string().optional(),
    is_active: z.boolean(),
    sort_order: z.number(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
})

export type Feature = z.infer<typeof featureSchema>

export const createFeatureRequestSchema = z.object({
    key: z.string().min(1, 'Key is required'),
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    category: z.string().optional(),
    is_active: z.boolean().optional(),
    sort_order: z.number().int().optional(),
})

export type CreateFeatureRequest = z.infer<typeof createFeatureRequestSchema>

export const updateFeatureRequestSchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    is_active: z.boolean().optional(),
    sort_order: z.number().int().optional(),
})

export type UpdateFeatureRequest = z.infer<typeof updateFeatureRequestSchema>
```
*Caption: Snippet 4: Feature type definitions dengan Zod schemas.*

---

### `admin/src/hooks/use-admin-api.ts (Feature Hooks)`
**Layer Terdeteksi:** `Custom Hooks (API Operations)`

**Narasi Operasional:**

Hooks untuk feature management: useFeatures (list all), useCreateFeature, useUpdateFeature, useDeleteFeature, usePlanFeatures (per plan), useAssignFeature, useRemoveFeature.

```tsx
// Master Features Hooks
export function useFeatures() {
    return useQuery({
        queryKey: adminQueryKeys.features,
        queryFn: () => adminFeaturesApi.getFeatures(),
    })
}

export function useCreateFeature() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: CreateFeatureRequest) => adminFeaturesApi.createFeature(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.features })
            toast.success('Feature created successfully')
        },
        onError: (error) => toast.error(`Failed to create feature: ${handleApiError(error)}`),
    })
}

export function useUpdateFeature() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateFeatureRequest }) =>
            adminFeaturesApi.updateFeature(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.features })
            toast.success('Feature updated successfully')
        },
        onError: (error) => toast.error(`Failed to update feature: ${handleApiError(error)}`),
    })
}

export function useDeleteFeature() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => adminFeaturesApi.deleteFeature(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.features })
            toast.success('Feature deleted successfully')
        },
        onError: (error) => toast.error(`Failed to delete feature: ${handleApiError(error)}`),
    })
}

// Plan Feature Assignment Hooks
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
        onError: (error) => toast.error(`Failed to assign feature: ${handleApiError(error)}`),
    })
}

export function useRemoveFeature() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ planId, featureId }: { planId: string; featureId: string }) =>
            adminPlanFeaturesApi.removeFeature(planId, featureId),
        onSuccess: (_, { planId }) => {
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.planFeatures(planId) })
            toast.success('Feature removed successfully')
        },
        onError: (error) => toast.error(`Failed to remove feature: ${handleApiError(error)}`),
    })
}
```
*Caption: Snippet 5: Feature management hooks dengan cache invalidation.*

---

## C. Ringkasan Ketergantungan Komponen

| Komponen | Menerima Dari | Meneruskan Ke |
|----------|---------------|---------------|
| `FeatureManagementDialog` | `useFeatures`, mutation hooks | Create/Edit form, Delete dialog |
| `PlanFeaturesEditor` | Props dari parent form | Controlled inputs |
| `PlanFeaturesManager` | `usePlanFeatures`, `useFeatures` | Combobox, Assigned list |

---

## D. Diagram Feature Management Dialog

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Feature Management                                                     X  â”‚
â”‚  Create and manage global features that can be assigned to subscription   â”‚
â”‚  plans.                                                                    â”‚
â”‚                                                                            â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚  [ðŸ” Search features...]              â”‚  Create New Feature         â”‚  â”‚
â”‚  â”‚                                        â”‚                            â”‚  â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚  Feature Key *              â”‚  â”‚
â”‚  â”‚  â”‚ Key        â”‚ Name       â”‚ Actionsâ”‚ â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”â”‚  â”‚
â”‚  â”‚  â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”¤ â”‚  â”‚ ai-chat-gpt4           â”‚â”‚  â”‚
â”‚  â”‚  â”‚ ai-chat    â”‚ AI Chat    â”‚ âœï¸ ðŸ—‘ï¸  â”‚ â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜â”‚  â”‚
â”‚  â”‚  â”‚ semantic   â”‚ Semantic   â”‚ âœï¸ ðŸ—‘ï¸  â”‚ â”‚  Cannot be changed later.  â”‚  â”‚
â”‚  â”‚  â”‚ priority   â”‚ Priority   â”‚ âœï¸ ðŸ—‘ï¸  â”‚ â”‚                            â”‚  â”‚
â”‚  â”‚  â”‚ export-pdf â”‚ PDF Export â”‚ âœï¸ ðŸ—‘ï¸  â”‚ â”‚  Display Name *            â”‚  â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”â”‚  â”‚
â”‚  â”‚                                        â”‚  â”‚ GPT-4 Access           â”‚â”‚  â”‚
â”‚  â”‚                                        â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜â”‚  â”‚
â”‚  â”‚                                        â”‚                            â”‚  â”‚
â”‚  â”‚                                        â”‚  Category                  â”‚  â”‚
â”‚  â”‚                                        â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”â”‚  â”‚
â”‚  â”‚                                        â”‚  â”‚ AI Features            â”‚â”‚  â”‚
â”‚  â”‚                                        â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜â”‚  â”‚
â”‚  â”‚                                        â”‚                            â”‚  â”‚
â”‚  â”‚                                        â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”â”‚  â”‚
â”‚  â”‚                                        â”‚  â”‚ Active Status    [ON] â”‚â”‚  â”‚
â”‚  â”‚                                        â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜â”‚  â”‚
â”‚  â”‚                                        â”‚                            â”‚  â”‚
â”‚  â”‚                                        â”‚  Sort Order: [10]          â”‚  â”‚
â”‚  â”‚                                        â”‚                            â”‚  â”‚
â”‚  â”‚                                        â”‚  [    Create Feature    ]  â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## E. Usage Limits Value Reference

| Value | Meaning | Display |
|-------|---------|---------|
| `-1` | Unlimited | âˆž Unlimited (green) |
| `0` | Disabled/Not included | Disabled (red) |
| `N > 0` | Specific limit | Number value |

---

## F. Limit Categories

| Category | Limits | Reset Behavior |
|----------|--------|----------------|
| **Storage Limits** | max_notebooks, max_notes_per_notebook | Cumulative (never reset) |
| **AI Features** | semantic_search_daily_limit, ai_chat_daily_limit | Daily (reset at midnight) |

---

*Dokumen ini dibuat secara otomatis berdasarkan analisis kode sumber dalam mode READ-ONLY.*
