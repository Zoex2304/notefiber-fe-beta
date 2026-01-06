import { useState } from 'react'
import { Button } from '@admin/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@admin/components/ui/card'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@admin/components/ui/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@admin/components/ui/popover'
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
import { Badge } from '@admin/components/ui/badge'
import { Check, ChevronsUpDown, Trash2, Sparkles, ArrowLeft, Loader2 } from 'lucide-react'
import { usePlanFeatures, useAssignFeature, useRemoveFeature, useFeatures } from '@admin/hooks/use-admin-api'
import { cn } from '@admin/lib/utils'
import type { Feature } from '@admin/lib/types/admin-api'

interface PlanFeaturesManagerProps {
    planId: string
    onBack?: () => void
}

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
            {
                onSuccess: () => {
                    setOpenCombobox(false)
                },
            }
        )
    }

    const handleRemove = () => {
        if (!removingFeature) return
        removeFeature(
            { planId, featureId: removingFeature.id },
            {
                onSuccess: () => {
                    setRemovingFeature(null)
                },
            }
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
                            <CardDescription>
                                Manage features included in this plan
                            </CardDescription>
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
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openCombobox}
                                    className="w-[300px] justify-between"
                                    disabled={isLoadingAll || isAssigning}
                                >
                                    {isAssigning ? (
                                        <div className="flex items-center">
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Assigning...
                                        </div>
                                    ) : (
                                        <>
                                            Select feature to assign...
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0">
                                <Command>
                                    <CommandInput placeholder="Search features..." />
                                    <CommandList>
                                        <CommandEmpty>No feature found.</CommandEmpty>
                                        <CommandGroup>
                                            {availableFeatures.map((feature) => (
                                                <CommandItem
                                                    key={feature.key}
                                                    value={feature.key}
                                                    onSelect={() => handleAssign(feature.key)}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            "opacity-0" // Always hidden since filtered
                                                        )}
                                                    />
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
                    {allFeatures?.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                            No master features found. Create features in the main "Manage Features" menu first.
                        </p>
                    )}
                </div>

                {/* Assigned List */}
                <div className="rounded-md border">
                    {isLoadingAssigned ? (
                        <div className="p-8 text-center">
                            <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : assignedFeatures?.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            No features assigned to this plan yet.
                        </div>
                    ) : (
                        <div className="divide-y">
                            {assignedFeatures?.map((feature) => (
                                <div key={feature.id} className="flex items-center justify-between p-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{feature.name}</span>
                                            <Badge variant="outline" className="text-xs font-mono">
                                                {feature.key}
                                            </Badge>
                                            {!feature.is_active && (
                                                <Badge variant="destructive" className="text-xs">
                                                    Inactive
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {feature.description}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-muted-foreground hover:text-destructive"
                                        onClick={() => setRemovingFeature(feature)}
                                    >
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
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Feature</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove "{removingFeature?.name}" from this plan?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRemove}
                            disabled={isRemoving}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isRemoving ? 'Removing...' : 'Remove'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    )
}
