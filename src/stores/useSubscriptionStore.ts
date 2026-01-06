import { create } from 'zustand';
import { paymentService } from '@/api/services/payment/payment.service';
import type { PublicPlan, SubscriptionValidationResponse } from '@/api/services/payment/payment.types';

interface UsageMetric {
    used: number;
    limit: number;
    can_use: boolean;
    resets_at?: string;
    percentage: number;
}

interface SubscriptionState {
    // Plan & Status
    planName: string;
    isActive: boolean;
    subscriptionId: string | null;
    isLoading: boolean;

    // Global Data
    publicPlans: PublicPlan[];

    // Features (Normalized)
    features: {
        ai_chat: boolean;
        semantic_search: boolean;
        max_notes: number;
        max_notebooks: number;
        // Limits
        daily_token_limit: number;
        daily_search_limit: number;
    };

    // Usage Stats (Mapped from /api/user/usage-status)
    tokenUsage: {
        chat: UsageMetric;
        search: UsageMetric;
        storage: {
            notes: UsageMetric;
            notebooks: UsageMetric;
        };
    };

    // Subscription Validation (v1.6.0)
    validationStatus: SubscriptionValidationResponse | null;

    // Actions
    fetchSubscription: () => Promise<void>;
    fetchPublicPlans: () => Promise<void>;
    validateSubscription: () => Promise<void>;
    checkPermission: (feature: 'ai_chat' | 'semantic_search') => boolean;
    checkLimit: (type: 'chat' | 'search' | 'notes' | 'notebooks') => boolean;
}

const defaultMetric: UsageMetric = { used: 0, limit: 0, can_use: false, percentage: 0 };
const defaultFeatures = { ai_chat: false, semantic_search: false, max_notes: 5, max_notebooks: 1, daily_token_limit: 0, daily_search_limit: 0 };

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
    planName: "Free Plan",
    isActive: false,
    subscriptionId: null,
    isLoading: true,
    publicPlans: [],
    features: defaultFeatures,
    tokenUsage: {
        chat: defaultMetric,
        search: defaultMetric,
        storage: {
            notes: defaultMetric,
            notebooks: defaultMetric,
        }
    },
    validationStatus: null,

    fetchPublicPlans: async () => {
        // Prevent concurrent or redundant fetches if already have data? 
        // For now, simple fetch.
        try {
            const res = await paymentService.getPublicPlans();
            if (res.success && res.data) {
                set({ publicPlans: res.data });
            }
        } catch (error) {
            console.error("Failed to fetch public plans:", error);
        }
    },

    fetchSubscription: async () => {
        set({ isLoading: true });
        try {
            // 1. Fetch Plan Status (Features, ID, Active Status)
            const subResponse = await paymentService.getSubscriptionStatus();

            // 2. Fetch Usage Status (Limits, Used Count)
            const usageResponse = await paymentService.getUsageStatus().catch(e => {
                console.warn("Usage fetch failed:", e);
                return { success: false, data: null };
            });

            // --- Process Subscription Data ---
            if (subResponse.success && subResponse.data) {
                const subData = subResponse.data;
                // Normalize features
                let normalizedFeatures = { ...defaultFeatures };
                const rawFeatures = subData.features;

                // Handle the structured features schema we saw in payment.types.ts
                if (typeof rawFeatures === 'object' && rawFeatures && !Array.isArray(rawFeatures)) {
                    // It's likely SubscriptionFeaturesSchema: { ai_chat, semantic_search, max_notebooks, max_notes_per_notebook }
                    const rec = rawFeatures as any;
                    normalizedFeatures = {
                        ai_chat: !!rec.ai_chat,
                        semantic_search: !!rec.semantic_search,
                        max_notes: Number(rec.max_notes_per_notebook) || 50, // Use max_notes_per_notebook as our "max_notes" proxy or separate? 
                        // Actually, the user wants "max_notes" in general. 
                        // But schema says `max_notes_per_notebook`.
                        // Let's assume `max_notes_per_notebook` is the limit per notebook, but usage is global?
                        // Wait, usageStatus has `storage: { notes: { limit: ... } }`. We should rely on USAGE STATUS for limits.
                        // Here we just want "Feature Flags".
                        max_notebooks: Number(rec.max_notebooks) || 1,
                        daily_token_limit: subData.ai_chat_daily_limit || 0,
                        daily_search_limit: subData.semantic_search_daily_limit || 0,
                    };
                } else if (Array.isArray(rawFeatures)) {
                    // Fallback for legacy array
                    const list = (rawFeatures as unknown as string[]).map(f => f.toLowerCase());
                    normalizedFeatures.ai_chat = list.some(f => f.includes('chat'));
                    normalizedFeatures.semantic_search = list.some(f => f.includes('semantic'));
                    normalizedFeatures.max_notes = 9999;
                    normalizedFeatures.max_notebooks = 99;
                }

                set({
                    planName: subData.plan_name,
                    isActive: subData.is_active,
                    subscriptionId: subData.subscription_id || null,
                    features: normalizedFeatures
                });
            }

            // --- Process Usage Data ---
            if (usageResponse.success && usageResponse.data) {
                const uData = usageResponse.data;
                const daily = uData.daily;
                const storage = uData.storage;
                const subData = subResponse.data; // Access subscription data for correct limits

                // Helper to map metric with correct limit source
                const mapMetric = (source: any, authoritativeLimit?: number): UsageMetric => {
                    if (!source) return defaultMetric;
                    const used = Number(source.used) || 0;

                    // Priority: Authoritative Limit (from payment/status) > Source Limit (usage-status)
                    // If authorativeLimit is provided (and valid >= 0), use it.
                    let limit = Number(source.limit) || 0;
                    if (authoritativeLimit !== undefined && authoritativeLimit >= 0) {
                        limit = authoritativeLimit;
                    }

                    const can_use = source.can_use !== false; // Keep usage-status can_use flags? 
                    // Actually, if limit is high, can_use SHOULD be true, but usage-status might say false.
                    // If we trust the limit, we should re-evaluate can_use.
                    // But user asked to "Consume", not "Override". 
                    // However, if limit is 20000 and used is 0, then can_use IS true mathematically.
                    // usage-status saying false is contradictory to the Limit.
                    // The safer bet is to re-calculate can_use if we have a valid positive limit.
                    const derivedCanUse = limit > 0 ? used < limit : can_use;

                    const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
                    return { used, limit, can_use: derivedCanUse, resets_at: source.resets_at, percentage: pct };
                };

                set({
                    tokenUsage: {
                        chat: mapMetric(daily.ai_chat, subData?.ai_chat_daily_limit),
                        search: mapMetric(daily.semantic_search, subData?.semantic_search_daily_limit),
                        storage: {
                            notes: mapMetric(storage?.notes, subData?.features?.max_notes_per_notebook),
                            notebooks: mapMetric(storage?.notebooks, subData?.features?.max_notebooks),
                        }
                    }
                });
            }

        } catch (error) {
            console.error("Subscription Sync Error:", error);
        } finally {
            set({ isLoading: false });
        }
    },

    validateSubscription: async () => {
        try {
            const response = await paymentService.validateSubscription();
            if (response.success && response.data) {
                set({ validationStatus: response.data });
            }
        } catch (error) {
            console.warn("Subscription validation failed:", error);
        }
    },

    checkPermission: (feature) => {
        return get().features[feature];
    },

    checkLimit: (type) => {
        const state = get();
        if (type === 'notes') {
            const metric = state.tokenUsage.storage.notes;
            // If limit is -1, it's unlimited.
            if (metric.limit === -1) return true;
            if (metric.can_use === false) return false;
            return metric.used < metric.limit;
        }
        if (type === 'notebooks') {
            const metric = state.tokenUsage.storage.notebooks;
            if (metric.limit === -1) return true;
            if (metric.can_use === false) return false;
            return metric.used < metric.limit;
        }

        const metric = state.tokenUsage[type as 'chat' | 'search'];
        if (!metric) return false;

        if (metric.limit === -1) return true;
        if (metric.can_use === false) return false;
        if (metric.limit <= 0) return false;
        return metric.used < metric.limit;
    }
}));
