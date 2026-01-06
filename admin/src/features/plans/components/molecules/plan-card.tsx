import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@admin/components/ui/card'
import { Badge } from '@admin/components/ui/badge'
import { Button } from '@admin/components/ui/button'
import { CurrencyDisplay } from '@admin/components/ui/currency-display'
import {
    Check,
    X,
    Edit,
    Trash2,
    Crown,
    FolderOpen,
    FileText,
    MessageSquare,
    Search,
    Infinity,
    EyeOff,
} from 'lucide-react'
import { cn } from '@admin/lib/utils'
import { usePlanFeatures } from '@admin/hooks/use-admin-api'
import type { SubscriptionPlan } from '../../data/schema'

interface PlanCardProps {
    plan: SubscriptionPlan
    onEdit?: (plan: SubscriptionPlan) => void
    onDelete?: (plan: SubscriptionPlan) => void
    className?: string
}

function LimitBadge({ value, suffix }: { value: number; suffix?: string }) {
    if (value === -1) {
        return (
            <span className="inline-flex items-center gap-1 text-green-600">
                <Infinity className="h-3 w-3" />
                Unlimited
            </span>
        )
    }
    if (value === 0) {
        return <span className="text-muted-foreground">Disabled</span>
    }
    return (
        <span>
            {value}
            {suffix && <span className="text-muted-foreground"> {suffix}</span>}
        </span>
    )
}

export function PlanCard({ plan, onEdit, onDelete, className }: PlanCardProps) {
    const { data: features, isLoading: isLoadingFeatures } = usePlanFeatures(plan.id)
    const isInactive = plan.is_active === false

    return (
        <Card
            className={cn(
                'relative transition-all duration-200',
                plan.is_most_popular && 'ring-2 ring-amber-500 ring-offset-2',
                isInactive && 'opacity-60',
                className
            )}
        >
            {/* Most Popular Badge */}
            {plan.is_most_popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="gap-1 bg-amber-500 text-white hover:bg-amber-600">
                        <Crown className="h-3 w-3" />
                        Most Popular
                    </Badge>
                </div>
            )}

            {/* Inactive Overlay */}
            {isInactive && (
                <div className="absolute right-3 top-3">
                    <Badge variant="secondary" className="gap-1">
                        <EyeOff className="h-3 w-3" />
                        Hidden
                    </Badge>
                </div>
            )}

            <CardHeader className={cn(plan.is_most_popular && 'pt-6')}>
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <CardTitle>{plan.name}</CardTitle>
                        <CardDescription className="font-mono text-xs">
                            /{plan.slug}
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className="capitalize">
                        {plan.billing_period}
                    </Badge>
                </div>
                {plan.tagline && (
                    <p className="text-sm text-muted-foreground">{plan.tagline}</p>
                )}
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Price */}
                <div>
                    <p className="text-3xl font-bold">
                        <CurrencyDisplay amount={plan.price} />
                    </p>
                    <p className="text-sm text-muted-foreground">
                        per {plan.billing_period === 'monthly' ? 'month' : 'year'}
                    </p>
                </div>

                {/* Storage Limits */}
                <div className="space-y-2">
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                        Storage Limits
                    </p>
                    <ul className="space-y-1.5">
                        <li className="flex items-center gap-2 text-sm">
                            <FolderOpen className="h-4 w-4 text-muted-foreground" />
                            <span className="flex-1">Notebooks</span>
                            <LimitBadge value={plan.features.max_notebooks} />
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="flex-1">Notes per Notebook</span>
                            <LimitBadge value={plan.features.max_notes_per_notebook} />
                        </li>
                    </ul>
                </div>

                {/* AI Features */}
                <div className="space-y-2">
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                        AI Features
                    </p>
                    <ul className="space-y-1.5">
                        <li className="flex items-center gap-2 text-sm">
                            {plan.features.semantic_search ? (
                                <Check className="h-4 w-4 text-green-600" />
                            ) : (
                                <X className="h-4 w-4 text-muted-foreground" />
                            )}
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <span className="flex-1">Semantic Search</span>
                            {plan.features.semantic_search && (
                                <LimitBadge
                                    value={plan.features.semantic_search_daily_limit}
                                    suffix="/day"
                                />
                            )}
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                            {plan.features.ai_chat ? (
                                <Check className="h-4 w-4 text-green-600" />
                            ) : (
                                <X className="h-4 w-4 text-muted-foreground" />
                            )}
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            <span className="flex-1">AI Chat</span>
                            {plan.features.ai_chat && (
                                <LimitBadge
                                    value={plan.features.ai_chat_daily_limit}
                                    suffix="/day"
                                />
                            )}
                        </li>
                    </ul>
                </div>

                {/* Assigned Display Features */}
                <div className="space-y-2">
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                        Included Features
                    </p>
                    {isLoadingFeatures ? (
                        <div className="space-y-1">
                            {[1, 2].map(i => (
                                <div key={i} className="h-4 w-full animate-pulse rounded bg-muted"></div>
                            ))}
                        </div>
                    ) : features && features.length > 0 ? (
                        <ul className="space-y-1.5">
                            {features.map((feature) => (
                                <li key={feature.id} className="flex items-start gap-2 text-sm">
                                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                                    <span>{feature.name}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground italic">No extra features assigned</p>
                    )}
                </div>
                {plan.sort_order !== undefined && (
                    <div className="text-xs text-muted-foreground">
                        Sort order: {plan.sort_order}
                    </div>
                )}

                {/* Actions */}
                {(onEdit || onDelete) && (
                    <div className="flex gap-2 pt-2">
                        {onEdit && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEdit(plan)}
                                className="flex-1"
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Button>
                        )}
                        {onDelete && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => onDelete(plan)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
