import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@admin/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@admin/components/ui/card'
import { Input } from '@admin/components/ui/input'
import { Label } from '@admin/components/ui/label'
import { Switch } from '@admin/components/ui/switch'
import { Textarea } from '@admin/components/ui/textarea'
import { useCreatePlan } from '@admin/hooks/use-admin-api'
import { PlanNameInput } from '../atoms/plan-name-input'
import { PlanSlugInput } from '../atoms/plan-slug-input'
import { PlanPriceInput } from '../atoms/plan-price-input'
import { BillingPeriodSelect } from '@admin/features/plans/components/atoms/billing-period-select'
import { PlanFeaturesEditor } from '../molecules/plan-features-editor'
import { createPlanFormSchema, type CreatePlanFormData, type BillingPeriod } from '../../data/schema'
import { Crown, Settings, Eye } from 'lucide-react'
import { Badge } from '@admin/components/ui/badge'

interface CreatePlanFormProps {
    onSuccess?: () => void
    onCancel?: () => void
}

export function CreatePlanForm({ onSuccess, onCancel }: CreatePlanFormProps) {
    const { mutate: createPlan, isPending } = useCreatePlan()

    const {
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<CreatePlanFormData>({
        resolver: zodResolver(createPlanFormSchema),
        defaultValues: {
            name: '',
            slug: '',
            tagline: '',
            price: 0,
            tax_rate: 0,
            billing_period: 'monthly',
            // Storage limits
            max_notebooks: 3,
            max_notes_per_notebook: 10,
            // AI features
            semantic_search: false,
            ai_chat: false,
            ai_chat_daily_limit: 0,
            semantic_search_daily_limit: 0,
            // Display options
            is_most_popular: false,
            is_active: true,
            sort_order: 0,
        },
    })

    const name = watch('name')
    const slug = watch('slug')
    const tagline = watch('tagline')
    const price = watch('price')
    const billingPeriod = watch('billing_period')
    const maxNotebooks = watch('max_notebooks')
    const maxNotesPerNotebook = watch('max_notes_per_notebook')
    const semanticSearch = watch('semantic_search')
    const aiChat = watch('ai_chat')
    const aiChatDailyLimit = watch('ai_chat_daily_limit')
    const semanticSearchDailyLimit = watch('semantic_search_daily_limit')
    const isMostPopular = watch('is_most_popular')
    const isActive = watch('is_active')
    const sortOrder = watch('sort_order')

    // Auto-generate slug from name
    const handleNameChange = (value: string) => {
        setValue('name', value)
        if (!slug) {
            const autoSlug = value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
            setValue('slug', autoSlug)
        }
    }

    const onSubmit = (data: CreatePlanFormData) => {
        createPlan(
            {
                name: data.name,
                slug: data.slug,
                tagline: data.tagline,
                price: data.price,
                tax_rate: data.tax_rate,
                billing_period: data.billing_period,
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
            {
                onSuccess: () => {
                    onSuccess?.()
                },
            }
        )
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Basic Information
                    </CardTitle>
                    <CardDescription>
                        Set the plan name, pricing, and billing cycle
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <PlanNameInput
                            value={name}
                            onChange={handleNameChange}
                            error={errors.name?.message}
                            disabled={isPending}
                        />
                        <PlanSlugInput
                            value={slug}
                            onChange={(value) => setValue('slug', value)}
                            error={errors.slug?.message}
                            disabled={isPending}
                        />
                    </div>

                    {/* Tagline */}
                    <div className="space-y-2">
                        <Label htmlFor="tagline">Tagline</Label>
                        <Textarea
                            id="tagline"
                            placeholder="e.g., 'Get started with basic note-taking' or 'Unlock AI Chat and Semantic Search'"
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

                    <div className="grid gap-4 md:grid-cols-2">
                        <PlanPriceInput
                            value={price}
                            onChange={(value) => setValue('price', value)}
                            error={errors.price?.message}
                            disabled={isPending}
                        />
                        <BillingPeriodSelect
                            value={billingPeriod}
                            onChange={(value) => setValue('billing_period', value as BillingPeriod)}
                            error={errors.billing_period?.message}
                            disabled={isPending}
                        />
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
                        maxNotebooks={maxNotebooks}
                        onMaxNotebooksChange={(value) => setValue('max_notebooks', value)}
                        maxNotesPerNotebook={maxNotesPerNotebook}
                        onMaxNotesPerNotebookChange={(value) => setValue('max_notes_per_notebook', value)}
                        semanticSearch={semanticSearch}
                        onSemanticSearchChange={(value) => setValue('semantic_search', value)}
                        aiChat={aiChat}
                        onAiChatChange={(value) => setValue('ai_chat', value)}
                        aiChatDailyLimit={aiChatDailyLimit}
                        onAiChatDailyLimitChange={(value) => setValue('ai_chat_daily_limit', value)}
                        semanticSearchDailyLimit={semanticSearchDailyLimit}
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
                        <Input
                            id="sort-order"
                            type="number"
                            min="0"
                            step="1"
                            placeholder="0"
                            value={sortOrder}
                            onChange={(e) => setValue('sort_order', parseInt(e.target.value) || 0)}
                            disabled={isPending}
                            className="w-32"
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
                    {isPending ? 'Creating...' : 'Create Plan'}
                </Button>
            </div>
        </form>
    )
}
