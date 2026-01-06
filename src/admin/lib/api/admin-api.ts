import axios, { AxiosError } from 'axios'
import type {
    ApiSuccessResponse,
    DashboardStats,
    SubscriptionPlan,
    CreatePlanRequest,
    UpdatePlanRequest,
    UserDetail,
    RefundRequest,
    RefundResponse,
    RefundListParams,
    RefundListItem,
    RefundApprovalResponse,
    RefundRejectionResponse,
    User,
    UserListParams,
    UpdateUserRequest,
    PurgeUsersRequest,
    PurgeUsersResponse,
    SystemLog,
    LogDetail,
    LogListParams,
    UserGrowthData,
    Transaction,
    TransactionListParams,
    UpgradeSubscriptionRequest,
    UpgradeSubscriptionResponse,
    Feature,
    CreateFeatureRequest,
    UpdateFeatureRequest,
    AiConfiguration,
    AiNuance,
    CreateAiNuanceRequest,
    UpdateAiConfigurationRequest,
    UpdateAiNuanceRequest,
    // Billing Types (v1.6.0)
    AdminBilling,
    CreateBillingRequest,
    UpdateBillingRequest,
    // Cancellation Types (v1.6.0)
    AdminCancellation,
    CancellationListParams,
    ProcessCancellationRequest,
} from '../types/admin-api'
import { ADMIN_ENDPOINTS } from '../../config/admin-endpoints'

// Base API configuration
const envUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const API_BASE_URL = envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
    // Fix: Use 'admin_token' to match what is stored in AdminAuthContext
    const token = localStorage.getItem('admin_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Dashboard Statistics API
export const adminDashboardApi = {
    /**
     * Fetch dashboard statistics including revenue, user counts, and recent transactions
     */
    async getStats(): Promise<DashboardStats> {
        const response = await apiClient.get<ApiSuccessResponse<DashboardStats>>(ADMIN_ENDPOINTS.DASHBOARD.STATS)
        return response.data.data
    },

    /**
     * Get user registration statistics over time (for charts)
     */
    async getGrowthStats(): Promise<UserGrowthData[]> {
        const response = await apiClient.get<ApiSuccessResponse<UserGrowthData[]>>(ADMIN_ENDPOINTS.DASHBOARD.GROWTH)
        return response.data.data
    },

    /**
     * Get paginated transaction history
     */
    async getTransactions(params: TransactionListParams): Promise<Transaction[]> {
        const response = await apiClient.get<ApiSuccessResponse<Transaction[]>>(ADMIN_ENDPOINTS.DASHBOARD.TRANSACTIONS, { params })
        return response.data.data
    },
}

// Subscription Plans API
export const adminPlansApi = {
    /**
     * Get all subscription plans
     */
    async getPlans(): Promise<SubscriptionPlan[]> {
        const response = await apiClient.get<ApiSuccessResponse<SubscriptionPlan[]>>(ADMIN_ENDPOINTS.PLANS.LIST)
        return response.data.data
    },

    /**
     * Get a single subscription plan by ID
     */
    async getPlan(id: string): Promise<SubscriptionPlan> {
        const response = await apiClient.get<ApiSuccessResponse<SubscriptionPlan>>(
            ADMIN_ENDPOINTS.PLANS.DETAIL(id)
        )
        return response.data.data
    },

    /**
     * Create a new subscription plan
     */
    async createPlan(data: CreatePlanRequest): Promise<SubscriptionPlan> {
        const response = await apiClient.post<ApiSuccessResponse<SubscriptionPlan>>(
            ADMIN_ENDPOINTS.PLANS.CREATE,
            data
        )
        return response.data.data
    },

    /**
     * Update an existing subscription plan
     */
    async updatePlan(id: string, data: UpdatePlanRequest): Promise<SubscriptionPlan> {
        const response = await apiClient.put<ApiSuccessResponse<SubscriptionPlan>>(
            ADMIN_ENDPOINTS.PLANS.UPDATE(id),
            data
        )
        return response.data.data
    },

    /**
     * Delete a subscription plan (soft delete)
     */
    async deletePlan(id: string): Promise<void> {
        await apiClient.delete(ADMIN_ENDPOINTS.PLANS.DELETE(id))
    },
}

// Plan Features API (Assignment)
export const adminPlanFeaturesApi = {
    /**
     * Get all features assigned to a plan
     */
    async getFeatures(planId: string): Promise<Feature[]> {
        const response = await apiClient.get<ApiSuccessResponse<Feature[]>>(
            ADMIN_ENDPOINTS.PLANS.FEATURES(planId)
        )
        return response.data.data ?? []
    },

    /**
     * Assign a feature to a plan
     */
    async assignFeature(planId: string, featureKey: string): Promise<Feature> {
        const response = await apiClient.post<ApiSuccessResponse<Feature>>(
            ADMIN_ENDPOINTS.PLANS.FEATURES(planId),
            { feature_key: featureKey }
        )
        return response.data.data
    },

    /**
     * Remove a feature from a plan
     */
    async removeFeature(planId: string, featureId: string): Promise<void> {
        await apiClient.delete(ADMIN_ENDPOINTS.PLANS.FEATURE_DELETE(planId, featureId))
    },
}

// User Management API
export const adminUsersApi = {
    /**
     * Get list of users
     */
    async getUsers(params: UserListParams): Promise<User[]> {
        const response = await apiClient.get<ApiSuccessResponse<User[]>>(ADMIN_ENDPOINTS.USERS.LIST, { params })
        return response.data.data
    },

    /**
     * Get user detail including AI token usage
     */
    async getUserDetail(userId: string): Promise<UserDetail> {
        const response = await apiClient.get<ApiSuccessResponse<UserDetail>>(
            ADMIN_ENDPOINTS.USERS.DETAIL(userId)
        )
        return response.data.data
    },

    /**
     * Update user status
     */
    async updateUserStatus(id: string, status: 'active' | 'pending' | 'banned', reason?: string): Promise<void> {
        await apiClient.put(ADMIN_ENDPOINTS.USERS.UPDATE_STATUS(id), { status, reason })
    },

    /**
     * Update user profile
     */
    async updateUserProfile(id: string, data: UpdateUserRequest): Promise<UserDetail> {
        const response = await apiClient.put<ApiSuccessResponse<UserDetail>>(ADMIN_ENDPOINTS.USERS.UPDATE_PROFILE(id), data)
        return response.data.data
    },

    /**
     * Soft delete user
     */
    async deleteUser(id: string): Promise<void> {
        await apiClient.delete(ADMIN_ENDPOINTS.USERS.DELETE(id))
    },

    /**
     * Deep purge users (Irreversible)
     */
    async purgeUsers(data: PurgeUsersRequest): Promise<PurgeUsersResponse> {
        const response = await apiClient.post<ApiSuccessResponse<PurgeUsersResponse>>(
            ADMIN_ENDPOINTS.USERS.PURGE,
            data
        )
        return response.data.data
    },
    /**
     * Create a single user
     */
    async createUser(data: any): Promise<User> {
        const response = await apiClient.post<ApiSuccessResponse<User>>(ADMIN_ENDPOINTS.USERS.CREATE, data)
        return response.data.data
    },

    /**
     * Bulk create users via JSON file
     */
    async bulkCreateUsers(file: File): Promise<any> {
        const formData = new FormData()
        formData.append('file', file)

        const response = await apiClient.post<ApiSuccessResponse<any>>(
            ADMIN_ENDPOINTS.USERS.BULK,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        )
        return response.data
    },
}

// Logging Management API
export const adminLogsApi = {
    /**
     * Get system logs
     */
    async getLogs(params: LogListParams): Promise<SystemLog[]> {
        const response = await apiClient.get<ApiSuccessResponse<SystemLog[]>>(ADMIN_ENDPOINTS.LOGS.LIST, { params })
        return response.data.data
    },

    /**
     * Get log details
     */
    async getLogDetail(id: string): Promise<LogDetail> {
        const response = await apiClient.get<ApiSuccessResponse<LogDetail>>(ADMIN_ENDPOINTS.LOGS.DETAIL(id))
        return response.data.data
    },
}

// Refund Processing API
export const adminRefundsApi = {
    /**
     * Get list of refund requests with filtering by status
     */
    async getRefunds(params?: RefundListParams): Promise<RefundListItem[]> {
        const response = await apiClient.get<ApiSuccessResponse<RefundListItem[]>>(ADMIN_ENDPOINTS.REFUNDS.LIST, { params })
        return response.data.data ?? []
    },

    /**
     * Get a single refund request details
     */
    async getRefund(id: string): Promise<RefundListItem> {
        const response = await apiClient.get<ApiSuccessResponse<RefundListItem>>(ADMIN_ENDPOINTS.REFUNDS.DETAIL(id))
        return response.data.data
    },

    /**
     * Approve a pending refund request
     */
    async approveRefund(id: string, adminNotes?: string): Promise<RefundApprovalResponse> {
        const response = await apiClient.post<ApiSuccessResponse<RefundApprovalResponse>>(
            ADMIN_ENDPOINTS.REFUNDS.APPROVE(id),
            { admin_notes: adminNotes }
        )
        return response.data.data
    },

    /**
     * Reject a pending refund request
     */
    async rejectRefund(id: string, reason: string): Promise<RefundRejectionResponse> {
        const response = await apiClient.post<ApiSuccessResponse<RefundRejectionResponse>>(
            ADMIN_ENDPOINTS.REFUNDS.REJECT(id),
            { rejection_reason: reason }
        )
        return response.data.data
    },

    /**
     * Process a subscription refund (legacy - for direct refund from dashboard)
     */
    async processRefund(data: RefundRequest): Promise<RefundResponse> {
        const response = await apiClient.post<ApiSuccessResponse<RefundResponse>>(
            ADMIN_ENDPOINTS.REFUNDS.PROCESS_LEGACY,
            data
        )
        return response.data.data
    },

    /**
     * Manually upgrade a user's subscription (Admin Override)
     */
    async upgradeSubscription(data: UpgradeSubscriptionRequest): Promise<UpgradeSubscriptionResponse> {
        const response = await apiClient.post<ApiSuccessResponse<UpgradeSubscriptionResponse>>(
            ADMIN_ENDPOINTS.REFUNDS.UPGRADE_SUBSCRIPTION,
            data
        )
        return response.data.data
    },
}

// Master Feature Management API
export const adminFeaturesApi = {
    /**
     * Get all master features
     */
    async getFeatures(): Promise<Feature[]> {
        const response = await apiClient.get<ApiSuccessResponse<Feature[]>>(ADMIN_ENDPOINTS.FEATURES.LIST)
        return response.data.data
    },

    /**
     * Create a new master feature
     */
    async createFeature(data: CreateFeatureRequest): Promise<Feature> {
        const response = await apiClient.post<ApiSuccessResponse<Feature>>(
            ADMIN_ENDPOINTS.FEATURES.CREATE,
            data
        )
        return response.data.data
    },

    /**
     * Update a master feature
     */
    async updateFeature(id: string, data: UpdateFeatureRequest): Promise<Feature> {
        const response = await apiClient.put<ApiSuccessResponse<Feature>>(
            ADMIN_ENDPOINTS.FEATURES.UPDATE(id),
            data
        )
        return response.data.data
    },

    /**
     * Delete a master feature
     */
    async deleteFeature(id: string): Promise<void> {
        await apiClient.delete(ADMIN_ENDPOINTS.FEATURES.DELETE(id))
    },
}

// AI Configuration API
export const adminAiConfigApi = {
    /**
     * Get all AI configurations
     */
    async getConfigs(): Promise<AiConfiguration[]> {
        const response = await apiClient.get<ApiSuccessResponse<AiConfiguration[]>>(ADMIN_ENDPOINTS.AI.CONFIGURATIONS)
        return response.data.data
    },

    /**
     * Update an AI configuration
     */
    async updateConfig(key: string, data: UpdateAiConfigurationRequest): Promise<AiConfiguration> {
        const response = await apiClient.put<ApiSuccessResponse<AiConfiguration>>(
            ADMIN_ENDPOINTS.AI.CONFIGURATION_UPDATE(key),
            data
        )
        return response.data.data
    },
}

// AI Nuance API
export const adminAiNuanceApi = {
    /**
     * Get all AI nuances
     */
    async getNuances(): Promise<AiNuance[]> {
        const response = await apiClient.get<ApiSuccessResponse<AiNuance[]>>(ADMIN_ENDPOINTS.AI.NUANCES)
        return response.data.data
    },

    /**
     * Create a new AI nuance
     */
    async createNuance(data: CreateAiNuanceRequest): Promise<AiNuance> {
        const response = await apiClient.post<ApiSuccessResponse<AiNuance>>(
            ADMIN_ENDPOINTS.AI.NUANCE_CREATE,
            data
        )
        return response.data.data
    },

    /**
     * Update an AI nuance
     */
    async updateNuance(id: string, data: UpdateAiNuanceRequest): Promise<AiNuance> {
        const response = await apiClient.put<ApiSuccessResponse<AiNuance>>(
            ADMIN_ENDPOINTS.AI.NUANCE_UPDATE(id),
            data
        )
        return response.data.data
    },

    /**
     * Delete an AI nuance
     */
    async deleteNuance(id: string): Promise<void> {
        await apiClient.delete(ADMIN_ENDPOINTS.AI.NUANCE_DELETE(id))
    },
}

// =====================================================
// Admin Billing API (v1.6.0)
// =====================================================
export const adminBillingApi = {
    /**
     * Get all billing addresses for a specific user
     */
    async getUserBilling(userId: string): Promise<AdminBilling[]> {
        const response = await apiClient.get<ApiSuccessResponse<AdminBilling[]>>(
            ADMIN_ENDPOINTS.BILLING.USER_LIST(userId)
        )
        return response.data.data ?? []
    },

    /**
     * Create a new billing address for a user
     */
    async createBilling(userId: string, data: CreateBillingRequest): Promise<AdminBilling> {
        const response = await apiClient.post<ApiSuccessResponse<AdminBilling>>(
            ADMIN_ENDPOINTS.BILLING.CREATE(userId),
            data
        )
        return response.data.data
    },

    /**
     * Update an existing billing address
     */
    async updateBilling(id: string, data: UpdateBillingRequest): Promise<AdminBilling> {
        const response = await apiClient.put<ApiSuccessResponse<AdminBilling>>(
            ADMIN_ENDPOINTS.BILLING.UPDATE(id),
            data
        )
        return response.data.data
    },

    /**
     * Delete a billing address
     */
    async deleteBilling(id: string): Promise<void> {
        await apiClient.delete(ADMIN_ENDPOINTS.BILLING.DELETE(id))
    },
}

// =====================================================
// Admin Cancellations API (v1.6.0)
// =====================================================
export const adminCancellationsApi = {
    /**
     * Get list of cancellation requests with optional filtering
     */
    async getCancellations(params?: CancellationListParams): Promise<AdminCancellation[]> {
        const response = await apiClient.get<ApiSuccessResponse<AdminCancellation[]>>(
            ADMIN_ENDPOINTS.CANCELLATIONS.LIST,
            { params }
        )
        return response.data.data ?? []
    },

    /**
     * Get a single cancellation request details
     */
    async getCancellation(id: string): Promise<AdminCancellation> {
        const response = await apiClient.get<ApiSuccessResponse<AdminCancellation>>(
            ADMIN_ENDPOINTS.CANCELLATIONS.DETAIL(id)
        )
        return response.data.data
    },

    /**
     * Process (approve/reject) a cancellation request
     */
    async processCancellation(id: string, data: ProcessCancellationRequest): Promise<AdminCancellation> {
        const response = await apiClient.post<ApiSuccessResponse<AdminCancellation>>(
            ADMIN_ENDPOINTS.CANCELLATIONS.PROCESS(id),
            data
        )
        return response.data.data
    },
}

// Error handling helper
export function handleApiError(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message: string }>
        return axiosError.response?.data?.message || axiosError.message || 'An error occurred'
    }
    if (error instanceof Error) {
        return error.message
    }
    return 'An unknown error occurred'
}

