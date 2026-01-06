import { z } from 'zod'

// Dashboard Statistics Types
export const dashboardStatsSchema = z.object({
    total_revenue: z.number(),
    active_subscribers: z.number(),
    total_users: z.number(),
    active_users: z.number(),
    recent_transactions: z.array(
        z.object({
            id: z.string(),
            user_id: z.string(),
            user_email: z.string(),
            plan_name: z.string(),
            amount: z.number(),
            status: z.enum(['active', 'inactive', 'canceled']),
            payment_status: z.enum(['pending', 'success', 'failed', 'refunded']),
            transaction_date: z.string(),
            midtrans_order_id: z.string().nullable(),
        })
    ),
})

export type DashboardStats = z.infer<typeof dashboardStatsSchema>
export type RecentTransaction = DashboardStats['recent_transactions'][number]

// Subscription Plan Types
export const planFeaturesSchema = z.object({
    max_notebooks: z.number(),
    max_notes_per_notebook: z.number(),
    semantic_search: z.boolean(),
    ai_chat: z.boolean(),
    ai_chat_daily_limit: z.number(),
    semantic_search_daily_limit: z.number(),
})

export const subscriptionPlanSchema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    tagline: z.string().nullable().optional(),
    price: z.number(),
    billing_period: z.enum(['monthly', 'yearly']),
    is_most_popular: z.boolean().optional(),
    is_active: z.boolean().optional(),
    sort_order: z.number().optional(),
    features: planFeaturesSchema,
})

export const subscriptionPlansSchema = z.array(subscriptionPlanSchema)

export type PlanFeatures = z.infer<typeof planFeaturesSchema>
export type SubscriptionPlan = z.infer<typeof subscriptionPlanSchema>

// Plan Display Feature Types (for pricing modal configuration)
export const planDisplayFeatureSchema = z.object({
    id: z.string(),
    plan_id: z.string(),
    feature_key: z.string(),
    display_text: z.string(),
    is_enabled: z.boolean(),
    sort_order: z.number(),
})

export type PlanDisplayFeature = z.infer<typeof planDisplayFeatureSchema>

export const createPlanDisplayFeatureRequestSchema = z.object({
    feature_key: z.string().min(1),
    display_text: z.string().min(1),
    is_enabled: z.boolean(),
    sort_order: z.number().optional(),
})

export type CreatePlanDisplayFeatureRequest = z.infer<typeof createPlanDisplayFeatureRequestSchema>

export const updatePlanDisplayFeatureRequestSchema = z.object({
    display_text: z.string().optional(),
    is_enabled: z.boolean().optional(),
    sort_order: z.number().optional(),
})

export type UpdatePlanDisplayFeatureRequest = z.infer<typeof updatePlanDisplayFeatureRequestSchema>

// Create/Update Plan Request Types
export const createPlanRequestSchema = z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    tagline: z.string().optional(),
    price: z.number().min(0),
    tax_rate: z.number().optional(),
    billing_period: z.enum(['monthly', 'yearly']),
    is_most_popular: z.boolean().optional(),
    is_active: z.boolean().optional(),
    sort_order: z.number().optional(),
    features: planFeaturesSchema,
})

export const updatePlanRequestSchema = z.object({
    name: z.string().optional(),
    tagline: z.string().nullable().optional(),
    price: z.number().min(0).optional(),
    tax_rate: z.number().optional(),
    is_most_popular: z.boolean().optional(),
    is_active: z.boolean().optional(),
    sort_order: z.number().optional(),
    features: planFeaturesSchema.partial().optional(),
})

export type CreatePlanRequest = z.infer<typeof createPlanRequestSchema>
export type UpdatePlanRequest = z.infer<typeof updatePlanRequestSchema>


// User Detail with Token Usage Types
export const userDetailSchema = z.object({
    id: z.string(),
    email: z.string(),
    full_name: z.string(),
    role: z.enum(['user', 'admin']),
    status: z.enum(['active', 'pending', 'banned']),
    ai_daily_usage: z.number(),
    created_at: z.string(),
})

export type UserDetail = z.infer<typeof userDetailSchema>

// Refund Types
export const refundRequestSchema = z.object({
    subscription_id: z.string(),
    reason: z.string().min(1),
    amount: z.number().positive().optional(),
})

export const refundResponseSchema = z.object({
    refund_id: z.string(),
    refunded_amount: z.number(),
    status: z.string(),
})

export type RefundRequest = z.infer<typeof refundRequestSchema>
export type RefundResponse = z.infer<typeof refundResponseSchema>

// Refund List Types (for admin management page)
export const refundStatusSchema = z.enum(['pending', 'approved', 'rejected'])
export type RefundStatus = z.infer<typeof refundStatusSchema>

export const refundListParamsSchema = z.object({
    status: refundStatusSchema.optional(),
    page: z.number().default(1),
    limit: z.number().default(10),
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

export const refundRejectionResponseSchema = z.object({
    refund_id: z.string(),
    status: z.literal('rejected'),
    processed_at: z.string(),
})
export type RefundRejectionResponse = z.infer<typeof refundRejectionResponseSchema>


// User Management Types
export const userListParamsSchema = z.object({
    page: z.number().default(1),
    limit: z.number().default(10),
    q: z.string().optional(),
})

export type UserListParams = z.infer<typeof userListParamsSchema>

export const userSchema = z.object({
    id: z.string(),
    email: z.string(),
    full_name: z.string(),
    role: z.enum(['user', 'admin']),
    status: z.enum(['active', 'pending', 'banned']), // Updated from blocked to banned based on payload
    created_at: z.string(),
})

export type User = z.infer<typeof userSchema>

export const updateUserStatusSchema = z.object({
    status: z.enum(['active', 'pending', 'banned']),
    reason: z.string().optional(),
})

export const updateUserProfileSchema = z.object({
    full_name: z.string().optional(),
    email: z.string().email().optional(),
    role: z.enum(['user', 'admin']).optional(),
    status: z.enum(['active', 'pending', 'banned']).optional(),
    avatar: z.string().optional(),
})

export type UpdateUserRequest = z.infer<typeof updateUserProfileSchema>

export const purgeUsersRequestSchema = z.object({
    user_ids: z.array(z.string().min(1)),
})

export type PurgeUsersRequest = z.infer<typeof purgeUsersRequestSchema>

export const purgeUsersResponseSchema = z.object({
    deleted_count: z.number(),
    failed_users: z.array(
        z.object({
            user_id: z.string(),
            error: z.string(),
        })
    ),
})

export type PurgeUsersResponse = z.infer<typeof purgeUsersResponseSchema>

// Logging Types
export const logListParamsSchema = z.object({
    page: z.number().default(1),
    limit: z.number().default(10),
    level: z.string().optional(),
})

export type LogListParams = z.infer<typeof logListParamsSchema>

export const systemLogSchema = z.object({
    id: z.string(),
    level: z.string(),
    module: z.string(),
    message: z.string(),
    details: z.record(z.string(), z.any()).optional(),
    created_at: z.string(),
})

export type SystemLog = z.infer<typeof systemLogSchema>

export const logDetailSchema = systemLogSchema.extend({
    details: z.record(z.string(), z.any()).optional(),
})

export type LogDetail = z.infer<typeof logDetailSchema>


// API Response Wrapper Types
export const apiSuccessResponseSchema = z.object({
    status: z.literal('success'), // Keeping status for compatibility if backend sends it
    success: z.boolean().optional(), // Adding success for new payloads
    message: z.string().optional(),
    data: z.unknown(),
})

export const apiErrorResponseSchema = z.object({
    status: z.literal('error'),
    success: z.boolean().optional(),
    message: z.string(),
    code: z.number().optional(),
})

export type ApiSuccessResponse<T> = {
    status?: 'success'
    success?: boolean
    message?: string
    data: T
}

export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>

// User Growth Stats Types
export const userGrowthDataSchema = z.object({
    date: z.string(),
    count: z.number(),
})

export type UserGrowthData = z.infer<typeof userGrowthDataSchema>

// Transaction Types
export const transactionListParamsSchema = z.object({
    page: z.number().default(1),
    limit: z.number().default(10),
    status: z.string().optional(),
})

export type TransactionListParams = z.infer<typeof transactionListParamsSchema>

export const transactionSchema = z.object({
    id: z.string(),
    user_id: z.string(),
    user_email: z.string(),
    plan_name: z.string(),
    amount: z.number(),
    status: z.string(),
    payment_status: z.string(),
    transaction_date: z.string(),
    midtrans_order_id: z.string().nullable(),
})

export type Transaction = z.infer<typeof transactionSchema>

// Subscription Upgrade Types
export const upgradeSubscriptionRequestSchema = z.object({
    user_id: z.string(),
    new_plan_id: z.string(),
})

export const upgradeSubscriptionResponseSchema = z.object({
    old_subscription_id: z.string(),
    new_subscription_id: z.string(),
    status: z.string(),
})

export type UpgradeSubscriptionRequest = z.infer<typeof upgradeSubscriptionRequestSchema>
export type UpgradeSubscriptionResponse = z.infer<typeof upgradeSubscriptionResponseSchema>

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

// AI Configuration Types
export const aiConfigurationSchema = z.object({
    key: z.string(),
    value: z.string(),
    description: z.string(),
    value_type: z.enum(['string', 'number', 'boolean', 'json']),
    category: z.enum(['system', 'model', 'search']),
})

export type AiConfiguration = z.infer<typeof aiConfigurationSchema>

export const updateAiConfigurationRequestSchema = z.object({
    value: z.string(),
})

export type UpdateAiConfigurationRequest = z.infer<typeof updateAiConfigurationRequestSchema>

// AI Nuance Types
export const aiNuanceSchema = z.object({
    id: z.string(),
    key: z.string(),
    name: z.string(),
    description: z.string(),
    model_override: z.string().optional().nullable(),
    system_prompt: z.string(),
    is_active: z.boolean(),
    sort_order: z.number(),
    created_at: z.string(),
    updated_at: z.string(),
})

export type AiNuance = z.infer<typeof aiNuanceSchema>

export const createAiNuanceRequestSchema = z.object({
    key: z.string().min(1, 'Key is required'),
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    system_prompt: z.string().min(1, 'Prompt is required'),
    model_override: z.string().optional().nullable(),
    is_active: z.boolean().optional(),
    sort_order: z.number().optional(),
})

export type CreateAiNuanceRequest = z.infer<typeof createAiNuanceRequestSchema>

export const updateAiNuanceRequestSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    system_prompt: z.string().optional(),
    model_override: z.string().optional().nullable(),
    is_active: z.boolean().optional(),
    sort_order: z.number().optional(),
})

export type UpdateAiNuanceRequest = z.infer<typeof updateAiNuanceRequestSchema>

// =====================================================
// Admin Billing Types (v1.6.0)
// =====================================================

export const adminBillingSchema = z.object({
    id: z.string(),
    user_id: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    email: z.string(),
    phone: z.string().optional(),
    address_line1: z.string(),
    address_line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postal_code: z.string(),
    country: z.string(),
    is_default: z.boolean(),
    created_at: z.string(),
    updated_at: z.string(),
})

export type AdminBilling = z.infer<typeof adminBillingSchema>

export const createBillingRequestSchema = z.object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email'),
    phone: z.string().optional(),
    address_line1: z.string().min(1, 'Address is required'),
    address_line2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postal_code: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required'),
    is_default: z.boolean().optional(),
})

export type CreateBillingRequest = z.infer<typeof createBillingRequestSchema>

export const updateBillingRequestSchema = createBillingRequestSchema.partial()

export type UpdateBillingRequest = z.infer<typeof updateBillingRequestSchema>

// =====================================================
// Admin Cancellation Types (v1.6.0)
// =====================================================

export const cancellationStatusSchema = z.enum(['pending', 'approved', 'rejected'])

export type CancellationStatus = z.infer<typeof cancellationStatusSchema>

export const adminCancellationSchema = z.object({
    id: z.string(),
    subscription_id: z.string(),
    user_id: z.string(),
    user_email: z.string().optional(),
    user_name: z.string().optional(),
    plan_name: z.string(),
    reason: z.string(),
    status: cancellationStatusSchema,
    admin_notes: z.string().optional(),
    effective_date: z.string(),
    processed_at: z.string().optional(),
    created_at: z.string(),
})

export type AdminCancellation = z.infer<typeof adminCancellationSchema>

export const cancellationListParamsSchema = z.object({
    status: cancellationStatusSchema.optional(),
    page: z.number().default(1),
    limit: z.number().default(10),
})

export type CancellationListParams = z.infer<typeof cancellationListParamsSchema>

export const processCancellationRequestSchema = z.object({
    action: z.enum(['approve', 'reject']),
    admin_notes: z.string().optional(),
})

export type ProcessCancellationRequest = z.infer<typeof processCancellationRequestSchema>
