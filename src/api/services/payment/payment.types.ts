import { z } from 'zod';
import {
    planSchema,
    publicPlanSchema,
    checkoutRequestSchema,
    checkoutResponseSchema,
    orderSummaryResponseSchema,
    subscriptionStatusSchema,
    usageStatusSchema,
    limitExceededErrorSchema,
    planDisplayFeatureSchema,
    planLimitsSchema,
    subscriptionValidationResponseSchema,
} from './payment.schemas';

// Legacy types (backwards compatibility)
export type Plan = z.infer<typeof planSchema>;

// New types for Usage Limits system
export type PublicPlan = z.infer<typeof publicPlanSchema>;
export type PlanDisplayFeature = z.infer<typeof planDisplayFeatureSchema>;
export type PlanLimits = z.infer<typeof planLimitsSchema>;

// Checkout types
export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;
export type CheckoutResponse = z.infer<typeof checkoutResponseSchema>;
export type OrderSummaryResponse = z.infer<typeof orderSummaryResponseSchema>;

// Subscription types
export type SubscriptionStatusResponse = z.infer<typeof subscriptionStatusSchema>;

// Usage types
export type UsageStatus = z.infer<typeof usageStatusSchema>;
export type LimitExceededError = z.infer<typeof limitExceededErrorSchema>;

// Subscription Validation (v1.6.0)
export type SubscriptionValidationResponse = z.infer<typeof subscriptionValidationResponseSchema>;
