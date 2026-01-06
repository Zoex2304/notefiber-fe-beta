import { z } from 'zod'

// Plan Usage Limits Schema (the actual limits enforced by the backend)
export const planFeaturesSchema = z.object({
    max_notebooks: z.number().int().min(-1), // -1 = unlimited, 0 = disabled
    max_notes_per_notebook: z.number().int().min(-1),
    semantic_search: z.boolean(),
    ai_chat: z.boolean(),
    ai_chat_daily_limit: z.number().int().min(-1), // -1 = unlimited, 0 = disabled
    semantic_search_daily_limit: z.number().int().min(-1),
})

export type PlanFeatures = z.infer<typeof planFeaturesSchema>

// Billing Period Schema
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
    slug: z
        .string()
        .min(1, 'Slug is required')
        .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
    tagline: z.string().optional(),
    price: z.number().min(0, 'Price must be 0 or greater'),
    tax_rate: z.number().min(0).max(1).optional(),
    billing_period: billingPeriodSchema,
    // Usage limits
    max_notebooks: z.number().int().min(-1, 'Use -1 for unlimited'),
    max_notes_per_notebook: z.number().int().min(-1, 'Use -1 for unlimited'),
    semantic_search: z.boolean(),
    ai_chat: z.boolean(),
    ai_chat_daily_limit: z.number().int().min(-1, 'Use -1 for unlimited, 0 for disabled'),
    semantic_search_daily_limit: z.number().int().min(-1, 'Use -1 for unlimited, 0 for disabled'),
    // Display options
    is_most_popular: z.boolean().optional(),
    is_active: z.boolean().optional(),
    sort_order: z.number().int().min(0).optional(),
})

export type CreatePlanFormData = z.infer<typeof createPlanFormSchema>

// Update Plan Form Schema (all fields optional except features which are required if provided)
export const updatePlanFormSchema = z.object({
    name: z.string().min(1, 'Plan name is required').optional(),
    tagline: z.string().nullable().optional(),
    price: z.number().min(0, 'Price must be 0 or greater').optional(),
    tax_rate: z.number().min(0).max(1).optional(),
    // Usage limits
    max_notebooks: z.number().int().min(-1).optional(),
    max_notes_per_notebook: z.number().int().min(-1).optional(),
    semantic_search: z.boolean().optional(),
    ai_chat: z.boolean().optional(),
    ai_chat_daily_limit: z.number().int().min(-1).optional(),
    semantic_search_daily_limit: z.number().int().min(-1).optional(),
    // Display options
    is_most_popular: z.boolean().optional(),
    is_active: z.boolean().optional(),
    sort_order: z.number().int().min(0).optional(),
})

export type UpdatePlanFormData = z.infer<typeof updatePlanFormSchema>

// Plan Display Feature Schema (for pricing modal configuration)
export const planDisplayFeatureSchema = z.object({
    id: z.string(),
    plan_id: z.string(),
    feature_key: z.string(),
    display_text: z.string(),
    is_enabled: z.boolean(),
    sort_order: z.number(),
})

export type PlanDisplayFeature = z.infer<typeof planDisplayFeatureSchema>

// Create/Update Plan Display Feature schemas
export const createPlanDisplayFeatureSchema = z.object({
    feature_key: z.string().min(1, 'Feature key is required'),
    display_text: z.string().min(1, 'Display text is required'),
    is_enabled: z.boolean(),
    sort_order: z.coerce.number().int().min(0).optional(),
})

export type CreatePlanDisplayFeatureData = z.infer<typeof createPlanDisplayFeatureSchema>

export const updatePlanDisplayFeatureSchema = z.object({
    display_text: z.string().min(1, 'Display text is required').optional(),
    is_enabled: z.boolean().optional(),
    sort_order: z.coerce.number().int().min(0).optional(),
})

export type UpdatePlanDisplayFeatureData = z.infer<typeof updatePlanDisplayFeatureSchema>
