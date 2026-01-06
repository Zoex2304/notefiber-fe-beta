/**
 * API Endpoints
 * Maps to the API documentation paths
 */

export const ENDPOINTS = {
    AUTH: {
        REGISTER: '/auth/register',
        VERIFY_EMAIL: '/auth/verify-email',
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        REFRESH_TOKEN: '/auth/refresh-token',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
        GOOGLE: '/auth/google',
        GOOGLE_CALLBACK: '/auth/google/callback',
    },
    // Public endpoints (no auth required)
    PUBLIC: {
        PLANS: '/plans', // GET /api/plans - for pricing modal
    },
    USER: {
        PROFILE: '/user/profile',
        ACCOUNT: '/user/account',
        USAGE_STATUS: '/user/usage-status', // GET /api/user/usage-status
        BILLING: '/user/billing',           // GET, PUT /api/user/billing
        CANCELLATION_REQUEST: '/user/cancellation', // POST /api/user/cancellation
        CANCELLATIONS: '/user/cancellations', // GET /api/user/cancellations
        CANCELLATION_DETAIL: (id: string) => `/user/cancellations/${id}`,
        // NOTE: Use PAYMENT.STATUS for subscription status (old /user/subscription/status doesn't exist)
    },
    LOCATION: {
        DETECT_COUNTRY: '/location/detect-country',
        CITIES: '/location/cities',
        STATES: '/location/states',
        ZIPCODES: '/location/zipcodes',
    },
    PAYMENT: {
        PLANS: '/payment/plans',
        CHECKOUT: '/payment/checkout',
        SUMMARY: '/payment/summary',
        STATUS: '/payment/status',
        CANCEL: '/payment/cancel',
        VALIDATE: '/payment/validate', // GET /api/payment/validate
    },
    NOTIFICATIONS: {
        LIST: '/notifications',
        UNREAD_COUNT: '/notifications/unread-count',
        MARK_READ: '/notifications/:id/read',
        MARK_ALL_READ: '/notifications/read-all',
    },
    REFUND: {
        REQUEST: '/user/refund/request',
        LIST: '/user/refunds',
        DETAIL: (id: string) => `/user/refunds/${id}`,
    },
} as const;
