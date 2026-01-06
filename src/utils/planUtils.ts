import type { PublicPlan } from '@/api/services/payment/payment.types';

/**
 * Generates a list of displayable feature strings from a PublicPlan.
 * Combines explicit features and computed limits (e.g. "Unlimited notebooks").
 */
export function getPlanDisplayFeatures(plan: PublicPlan): string[] {
    const features: string[] = [];

    // 1. Computed Limits
    if (plan.limits.max_notebooks === -1) {
        features.push("Unlimited notebooks");
    } else {
        features.push(`${plan.limits.max_notebooks} notebooks maximum`);
    }

    if (plan.limits.max_notes_per_notebook === -1) {
        features.push("Unlimited notes per notebook");
    } else {
        features.push(`${plan.limits.max_notes_per_notebook} notes per notebook`);
    }

    if (plan.limits.semantic_search_daily > 0) {
        if (plan.limits.semantic_search_daily === -1) {
            features.push("Unlimited semantic search");
        } else {
            features.push(`${plan.limits.semantic_search_daily} semantic searches/day`);
        }
    }

    if (plan.limits.ai_chat_daily > 0) {
        if (plan.limits.ai_chat_daily === -1) {
            features.push("Unlimited AI chat");
        } else {
            features.push(`${plan.limits.ai_chat_daily} AI chats/day`);
        }
    }

    // 2. Explicit Features
    if (plan.features && plan.features.length > 0) {
        plan.features.filter(f => f.is_enabled).forEach(f => {
            if (!features.includes(f.text)) {
                features.push(f.text);
            }
        });
    }

    return features;
}

/**
 * Helper to fuzzy find a plan by name (e.g. "Pro Plan" vs "Pro")
 */
export function findPlanByName(plans: PublicPlan[], name: string): PublicPlan | undefined {
    if (!name) return undefined;
    const normalized = name.toLowerCase();

    // Strict match
    const strict = plans.find(p => p.name.toLowerCase() === normalized);
    if (strict) return strict;

    // Contains match (e.g. "Pro Plan" contains "Pro")
    // or "Pro" is contained in "Pro Plan"
    return plans.find(p => normalized.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(normalized));
}
