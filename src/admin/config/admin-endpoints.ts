export const ADMIN_ENDPOINTS = {
    DASHBOARD: {
        STATS: '/admin/dashboard',
        GROWTH: '/admin/growth',
        TRANSACTIONS: '/admin/transactions',
    },
    PLANS: {
        LIST: '/admin/plans',
        DETAIL: (id: string) => `/admin/plans/${id}`,
        CREATE: '/admin/plans',
        UPDATE: (id: string) => `/admin/plans/${id}`,
        DELETE: (id: string) => `/admin/plans/${id}`,
        // Plan Features endpoints (Assignment)
        FEATURES: (planId: string) => `/admin/plans/${planId}/features`,
        FEATURE_DELETE: (planId: string, featureId: string) => `/admin/plans/${planId}/features/${featureId}`,
    },
    USERS: {
        LIST: '/admin/users',
        DETAIL: (id: string) => `/admin/users/${id}`,
        UPDATE_STATUS: (id: string) => `/admin/users/${id}/status`,
        UPDATE_PROFILE: (id: string) => `/admin/users/${id}`,
        DELETE: (id: string) => `/admin/users/${id}`,
        PURGE: '/admin/users/purge',
        CREATE: '/admin/users',
        BULK: '/admin/users/bulk',
    },
    FEATURES: {
        LIST: '/admin/features',
        CREATE: '/admin/features',
        UPDATE: (id: string) => `/admin/features/${id}`,
        DELETE: (id: string) => `/admin/features/${id}`,
    },
    LOGS: {
        LIST: '/admin/logs',
        DETAIL: (id: string) => `/admin/logs/${id}`,
    },
    REFUNDS: {
        LIST: '/admin/refunds',
        DETAIL: (id: string) => `/admin/refunds/${id}`,
        APPROVE: (id: string) => `/admin/refunds/${id}/approve`,
        REJECT: (id: string) => `/admin/refunds/${id}/reject`,
        PROCESS_LEGACY: '/admin/subscriptions/refund',
        UPGRADE_SUBSCRIPTION: '/admin/subscriptions/upgrade',
    },
    TOKEN_USAGE: {
        LIST: '/admin/token-usage',
    },
    AI: {
        CONFIGURATIONS: '/admin/ai/configurations',
        CONFIGURATION_UPDATE: (key: string) => `/admin/ai/configurations/${key}`,
        NUANCES: '/admin/ai/nuances',
        NUANCE_CREATE: '/admin/ai/nuances',
        NUANCE_UPDATE: (id: string) => `/admin/ai/nuances/${id}`,
        NUANCE_DELETE: (id: string) => `/admin/ai/nuances/${id}`,
    },
    BILLING: {
        USER_LIST: (userId: string) => `/admin/users/${userId}/billing`,
        CREATE: (userId: string) => `/admin/users/${userId}/billing`,
        UPDATE: (id: string) => `/admin/billing/${id}`,
        DELETE: (id: string) => `/admin/billing/${id}`,
    },
    CANCELLATIONS: {
        LIST: '/admin/cancellations',
        DETAIL: (id: string) => `/admin/cancellations/${id}`,
        PROCESS: (id: string) => `/admin/cancellations/${id}/process`,
    },
} as const;
