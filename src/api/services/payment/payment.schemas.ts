import { z } from 'zod';

// ========== Plan Feature (for pricing modal) ==========
export const planDisplayFeatureSchema = z.object({
    key: z.string(),
    text: z.string(),
    is_enabled: z.boolean(),
});

export const planLimitsSchema = z.object({
    max_notebooks: z.number(),
    max_notes_per_notebook: z.number(),
    ai_chat_daily: z.number(),
    semantic_search_daily: z.number(),
});

// New Plan schema for /api/plans (public pricing modal)
export const publicPlanSchema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    tagline: z.string().nullable().optional(),
    price: z.number(),
    billing_period: z.string(),
    is_most_popular: z.boolean().optional(),
    limits: planLimitsSchema,
    features: z.array(planDisplayFeatureSchema),
});

// Legacy plan schema for /payment/plans (keep for backwards compatibility)
export const planSchema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    price: z.number(),
    currency: z.string(),
    billing_period: z.string(),
    description: z.string(),
    features: z.array(z.string()),
    ai_daily_credit_limit: z.number().optional(),
    is_active: z.boolean(),
});

// ========== Checkout ==========
export const checkoutRequestSchema = z.object({
    plan_id: z.string(),
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    email: z.string().email(),
    phone: z.string(),
    address_line1: z.string(),
    address_line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postal_code: z.string(),
    country: z.string(),
});

export const checkoutResponseSchema = z.object({
    subscription_id: z.string(),
    order_id: z.string(),
    status: z.string(),
    snap_token: z.string(),
    snap_redirect_url: z.string(),
});

// ========== Order Summary ==========
export const orderSummaryResponseSchema = z.object({
    plan_name: z.string(),
    billing_period: z.string(),
    price_per_unit: z.string(),
    subtotal: z.number(),
    tax: z.number(),
    total: z.number(),
    currency: z.string(),
});

// ========== Subscription Status ==========
export const subscriptionFeaturesSchema = z.object({
    ai_chat: z.boolean(),
    semantic_search: z.boolean(),
    max_notebooks: z.number(),
    max_notes_per_notebook: z.number(),
});

export const subscriptionStatusSchema = z.object({
    subscription_id: z.string().optional(),
    plan_name: z.string(),
    status: z.string(),
    current_period_end: z.string().optional(),
    ai_chat_daily_limit: z.number().optional(),
    semantic_search_daily_limit: z.number().optional(),
    ai_daily_credit_limit: z.number().optional(),
    ai_daily_usage: z.number().optional(),
    is_active: z.boolean(),
    has_pending_refund: z.boolean().optional(),
    features: subscriptionFeaturesSchema,
});

// ========== Usage Status ==========
export const usageLimitSchema = z.object({
    used: z.number(),
    limit: z.number(),
    can_use: z.boolean(),
});

export const dailyUsageLimitSchema = usageLimitSchema.extend({
    resets_at: z.string().optional(),
});

export const usagePlanSchema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
});

export const usageStorageSchema = z.object({
    notebooks: usageLimitSchema,
    notes: usageLimitSchema,
});

export const usageDailySchema = z.object({
    ai_chat: dailyUsageLimitSchema,
    semantic_search: dailyUsageLimitSchema,
});

export const usageStatusSchema = z.object({
    plan: usagePlanSchema,
    storage: usageStorageSchema,
    daily: usageDailySchema,
    upgrade_available: z.boolean(),
});

// ========== Limit Exceeded Error (429) ==========
export const limitExceededErrorSchema = z.object({
    limit: z.number(),
    used: z.number(),
    reset_after: z.string().optional(),
    show_modal_pricing: z.boolean().optional(),
});

// ========== Subscription Validation (v1.6.0) ==========
export const subscriptionValidationResponseSchema = z.object({
    is_valid: z.boolean(),
    status: z.enum(['active', 'grace_period', 'expired', 'free_tier', 'canceled', 'inactive']),
    renewal_required: z.boolean(),
    current_period_end: z.string().optional(),
    days_remaining: z.number().optional(),
    grace_period_end: z.string().optional(),
    plan_name: z.string().optional(),
});
