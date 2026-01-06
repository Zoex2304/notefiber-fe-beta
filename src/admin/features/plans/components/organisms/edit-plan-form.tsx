import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@admin/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@admin/components/ui/card'
import { Label } from '@admin/components/ui/label'
import { Switch } from '@admin/components/ui/switch'
import { Textarea } from '@admin/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@admin/components/ui/tabs'
import { useUpdatePlan } from '@admin/hooks/use-admin-api'
import { PlanNameInput } from '../atoms/plan-name-input'
import { PlanPriceInput } from '../atoms/plan-price-input'
import { PlanFeaturesEditor } from '../molecules/plan-features-editor'
import { CleanNumberInput } from '../atoms/clean-number-input'
import { PlanFeaturesManager } from '../molecules/plan-features-manager'
import { updatePlanFormSchema, type UpdatePlanFormData, type SubscriptionPlan } from '../../data/schema'
import { Crown, Settings, Eye, Sparkles } from 'lucide-react'
import { Badge } from '@admin/components/ui/badge'

interface EditPlanFormProps {
    plan: SubscriptionPlan
    onSuccess?: () => void
    onCancel?: () => void
}

export function EditPlanForm({ plan, onSuccess, onCancel }: EditPlanFormProps) {
    const { mutate: updatePlan, isPending } = useUpdatePlan()

    const {
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
        reset,
    } = useForm<UpdatePlanFormData>({
        resolver: zodResolver(updatePlanFormSchema),
        defaultValues: {
            name: plan.name,
            tagline: plan.tagline,
            price: plan.price,
            // Storage limits
            max_notebooks: plan.features.max_notebooks,
            max_notes_per_notebook: plan.features.max_notes_per_notebook,
            // AI features
            semantic_search: plan.features.semantic_search,
            ai_chat: plan.features.ai_chat,
            ai_chat_daily_limit: plan.features.ai_chat_daily_limit,
            semantic_search_daily_limit: plan.features.semantic_search_daily_limit,
            // Display options
            is_most_popular: plan.is_most_popular,
            is_active: plan.is_active,
            sort_order: plan.sort_order,
        },
    })

    // Reset form when plan changes
    useEffect(() => {
        reset({
            name: plan.name,
            tagline: plan.tagline,
            price: plan.price,
            max_notebooks: plan.features.max_notebooks,
            max_notes_per_notebook: plan.features.max_notes_per_notebook,
            semantic_search: plan.features.semantic_search,
            ai_chat: plan.features.ai_chat,
            ai_chat_daily_limit: plan.features.ai_chat_daily_limit,
            semantic_search_daily_limit: plan.features.semantic_search_daily_limit,
            is_most_popular: plan.is_most_popular,
            is_active: plan.is_active,
            sort_order: plan.sort_order,
        })
    }, [plan, reset])

    const name = watch('name')
    const tagline = watch('tagline')
    const price = watch('price')
    const maxNotebooks = watch('max_notebooks')
    const maxNotesPerNotebook = watch('max_notes_per_notebook')
    const semanticSearch = watch('semantic_search')
    const aiChat = watch('ai_chat')
    const aiChatDailyLimit = watch('ai_chat_daily_limit')
    const semanticSearchDailyLimit = watch('semantic_search_daily_limit')
    const isMostPopular = watch('is_most_popular')
    const isActive = watch('is_active')
    const sortOrder = watch('sort_order')

    const onSubmit = (data: UpdatePlanFormData) => {
        updatePlan(
            {
                id: plan.id,
                data: {
                    name: data.name,
                    tagline: data.tagline,
                    price: data.price,
                    is_most_popular: data.is_most_popular,
                    is_active: data.is_active,
                    sort_order: data.sort_order,
                    features: {
                        max_notebooks: data.max_notebooks,
                        max_notes_per_notebook: data.max_notes_per_notebook,
                        semantic_search: data.semantic_search,
                        ai_chat: data.ai_chat,
                        ai_chat_daily_limit: data.ai_chat_daily_limit,
                        semantic_search_daily_limit: data.semantic_search_daily_limit,
                    },
                },
            },
            {
                onSuccess: () => {
                    onSuccess?.()
                },
            }
        )
    }

    return (
        <Tabs defaultValue="details" className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Edit: {plan.name}</h2>
                    <p className="text-sm text-muted-foreground">
                        /{plan.slug} · {plan.billing_period}
                    </p>
                </div>
                <TabsList>
                    <TabsTrigger value="details" className="gap-2">
                        <Settings className="h-4 w-4" />
                        Plan Details
                    </TabsTrigger>
                    <TabsTrigger value="features" className="gap-2">
                        <Sparkles className="h-4 w-4" />
                        Display Features
                    </TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="details">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Info Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                Basic Information
                            </CardTitle>
                            <CardDescription>
                                Update plan name, pricing, and description
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <PlanNameInput
                                    value={name || ''}
                                    onChange={(value) => setValue('name', value)}
                                    error={errors.name?.message}
                                    disabled={isPending}
                                />
                                <PlanPriceInput
                                    value={price || 0}
                                    onChange={(value) => setValue('price', value)}
                                    error={errors.price?.message}
                                    disabled={isPending}
                                />
                            </div>

                            {/* Tagline */}
                            <div className="space-y-2">
                                <Label htmlFor="tagline">Tagline</Label>
                                <Textarea
                                    id="tagline"
                                    placeholder="e.g., 'Get started with basic note-taking'"
                                    value={tagline || ''}
                                    onChange={(e) => setValue('tagline', e.target.value)}
                                    disabled={isPending}
                                    className="resize-none"
                                    rows={2}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Shown as subtitle in the pricing modal
                                </p>
                            </div>

                            {/* Immutable Fields Display */}
                            <div className="rounded-md bg-muted p-4 space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <strong className="text-muted-foreground">Immutable Fields:</strong>
                                    <span className="text-xs text-muted-foreground">(Cannot be changed after creation)</span>
                                </div>
                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="flex items-center gap-2">
                                        <Label className="text-muted-foreground">Slug:</Label>
                                        <Badge variant="secondary" className="font-mono">
                                            {plan.slug}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Label className="text-muted-foreground">Billing Period:</Label>
                                        <Badge variant="secondary" className="capitalize">
                                            {plan.billing_period}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Features Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Usage Limits & Features</CardTitle>
                            <CardDescription>
                                Configure storage limits and AI feature access
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PlanFeaturesEditor
                                maxNotebooks={maxNotebooks || 0}
                                onMaxNotebooksChange={(value) => setValue('max_notebooks', value)}
                                maxNotesPerNotebook={maxNotesPerNotebook || 0}
                                onMaxNotesPerNotebookChange={(value) => setValue('max_notes_per_notebook', value)}
                                semanticSearch={semanticSearch || false}
                                onSemanticSearchChange={(value) => setValue('semantic_search', value)}
                                aiChat={aiChat || false}
                                onAiChatChange={(value) => setValue('ai_chat', value)}
                                aiChatDailyLimit={aiChatDailyLimit || 0}
                                onAiChatDailyLimitChange={(value) => setValue('ai_chat_daily_limit', value)}
                                semanticSearchDailyLimit={semanticSearchDailyLimit || 0}
                                onSemanticSearchDailyLimitChange={(value) => setValue('semantic_search_daily_limit', value)}
                                disabled={isPending}
                            />
                        </CardContent>
                    </Card>

                    {/* Display Options Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Eye className="h-5 w-5" />
                                Display Options
                            </CardTitle>
                            <CardDescription>
                                Control how this plan appears in the pricing modal
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                {/* Most Popular Toggle */}
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="is-most-popular" className="flex items-center gap-2">
                                            <Crown className="h-4 w-4 text-amber-500" />
                                            Most Popular
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Show "Most Popular" badge
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isMostPopular && (
                                            <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">
                                                Most Popular
                                            </Badge>
                                        )}
                                        <Switch
                                            id="is-most-popular"
                                            checked={isMostPopular}
                                            onCheckedChange={(value) => setValue('is_most_popular', value)}
                                            disabled={isPending}
                                        />
                                    </div>
                                </div>

                                {/* Active Toggle */}
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="is-active">Active</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Show in pricing modal
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={isActive ? 'default' : 'secondary'}>
                                            {isActive ? 'Visible' : 'Hidden'}
                                        </Badge>
                                        <Switch
                                            id="is-active"
                                            checked={isActive}
                                            onCheckedChange={(value) => setValue('is_active', value)}
                                            disabled={isPending}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Sort Order */}
                            <div className="space-y-2">
                                <Label htmlFor="sort-order">Sort Order</Label>
                                <CleanNumberInput
                                    id="sort-order"
                                    placeholder="0"
                                    value={sortOrder || 0}
                                    onChange={(value) => setValue('sort_order', value)}
                                    disabled={isPending}
                                    className="w-32"
                                    min={0}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Lower numbers appear first in the pricing modal
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        {onCancel && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                        )}
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Updating...' : 'Update Plan'}
                        </Button>
                    </div>
                </form>
            </TabsContent>

            <TabsContent value="features">
                <PlanFeaturesManager planId={plan.id} onBack={onCancel} />
            </TabsContent>
        </Tabs>
    )
}
