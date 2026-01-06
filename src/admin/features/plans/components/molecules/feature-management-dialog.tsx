import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@admin/components/ui/dialog'
import { Button } from '@admin/components/ui/button'
import { Input } from '@admin/components/ui/input'
import { Label } from '@admin/components/ui/label'
import { Switch } from '@admin/components/ui/switch'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@admin/components/ui/table'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@admin/components/ui/alert-dialog'
import { Pencil, Trash2, Search, Loader2 } from 'lucide-react'
import { useFeatures, useCreateFeature, useUpdateFeature, useDeleteFeature } from '@admin/hooks/use-admin-api'
import type { Feature } from '@admin/lib/types/admin-api'

interface FeatureManagementDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

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
            key: '',
            name: '',
            description: '',
            category: '',
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
            }, {
                onSuccess: () => {
                    resetForm()
                }
            })
        } else {
            createFeature(formData, {
                onSuccess: () => {
                    resetForm()
                }
            })
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
                                <Input
                                    placeholder="Search features..."
                                    className="pl-8"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
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
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center py-8">
                                                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                            </TableCell>
                                        </TableRow>
                                    ) : sortedFeatures.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                                No features found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        sortedFeatures.map((feature) => (
                                            <TableRow key={feature.id} className={selectedFeature?.id === feature.id ? "bg-muted/50" : ""}>
                                                <TableCell className="font-mono text-xs">{feature.key}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{feature.name}</span>
                                                        <span className="text-xs text-muted-foreground truncate max-w-[250px]">
                                                            {feature.description}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => handleEdit(feature)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                                            onClick={() => setDeletingFeature(feature)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="flex-1 flex flex-col gap-4 overflow-y-auto pl-1">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg">
                                {isEditing ? 'Edit Feature' : 'Create New Feature'}
                            </h3>
                            {isEditing && (
                                <Button variant="ghost" size="sm" onClick={resetForm}>
                                    Cancel
                                </Button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="key">
                                    Feature Key <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="key"
                                    value={formData.key}
                                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                                    placeholder="e.g. ai-chat-gpt4"
                                    disabled={isEditing || isCreating || isUpdating} // Key is usually immutable after creation
                                />
                                <p className="text-xs text-muted-foreground">
                                    Unique identifier used in code. Cannot be changed later.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Display Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. GPT-4 Access"
                                    disabled={isCreating || isUpdating}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    placeholder="e.g. AI Features"
                                    disabled={isCreating || isUpdating}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Input
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Internal description..."
                                    disabled={isCreating || isUpdating}
                                />
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                    <Label htmlFor="active">Active Status</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Enable or disable this feature
                                    </p>
                                </div>
                                <Switch
                                    id="active"
                                    checked={formData.is_active}
                                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                                    disabled={isCreating || isUpdating}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sort">Sort Order</Label>
                                <Input
                                    id="sort"
                                    type="number"
                                    value={formData.sort_order}
                                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                                    disabled={isCreating || isUpdating}
                                />
                            </div>

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={!formData.key || !formData.name || isCreating || isUpdating}
                                >
                                    {(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isEditing ? 'Update Feature' : 'Create Feature'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </DialogContent>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deletingFeature} onOpenChange={(open) => !open && setDeletingFeature(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Feature</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{deletingFeature?.name}"?
                            This action cannot be undone and may affect plans using this feature.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deletingFeature && deleteFeature(deletingFeature.id, {
                                onSuccess: () => setDeletingFeature(null)
                            })}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Dialog>
    )
}
