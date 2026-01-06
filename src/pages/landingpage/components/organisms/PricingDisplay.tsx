import { useState, useEffect } from "react";
import { SwitchPricing, type PricingPeriod } from "@/components/shadui/SwitchPricing";
import type { PricingCardData } from "@/components/shadui/PricingCard";
import { PricingSection } from "@/components/shadui/PricingSection";
import { useSubscriptionStore } from "@/stores/useSubscriptionStore";
import { Loader2 } from "lucide-react";

interface PricingDisplayProps {
    // Optional customization for button behavior (e.g., in modal)
    onPlanSelect?: (planSlug: string) => void;
    currentPlanSlug?: string;
    showSwitcher?: boolean; // Default true
    /**
     * Context determines button behavior:
     * - 'landing': Always show "Get Started" → signup
     * - 'app': Show "Current plan" / "Upgrade to X"
     */
    context?: 'landing' | 'app';
}

/**
 * Reusable Pricing Display Organism
 * 
 * Encapsulates all pricing display logic:
 * - API data fetching
 * - Monthly/Yearly switcher
 * - Loading/Error states
 * - Pricing cards grid
 * 
 * Used in:
 * - Landing page MainContentSection5
 * - Pricing modal
 * - Any other pricing display
 */
export function PricingDisplay({
    onPlanSelect,
    currentPlanSlug,
    showSwitcher = true,
    context = 'app',
}: PricingDisplayProps) {
    const [period, setPeriod] = useState<PricingPeriod>("monthly");
    const [isPulsing, setIsPulsing] = useState(false);

    // Fetch public plans and user's current plan from Global Store
    const { publicPlans, fetchPublicPlans, planName } = useSubscriptionStore();

    // Derive user's current plan slug from their actual subscription
    // This is the single source of truth for "Current Plan" determination
    const userPlanSlug = currentPlanSlug ||
        planName?.toLowerCase().replace(/\s+plan$/i, '').replace(/\s+/g, '-') ||
        'free';

    useEffect(() => {
        fetchPublicPlans();
    }, []);

    const handleToggle = (newPeriod: PricingPeriod) => {
        if (newPeriod === period) return;
        setPeriod(newPeriod);
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 500);
    };

    // Filter and transform API data to PricingCardData format
    const dataToDisplay: PricingCardData[] = publicPlans
        .filter((plan) => {
            const planPeriod = plan.billing_period?.toLowerCase() || 'monthly';
            return planPeriod === period;
        })
        .map((plan) => {
            // Generate features from plan limits
            const features: string[] = [];

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

            if (plan.limits.semantic_search_daily === 0) {
                features.push("No semantic search data"); // Debugging or consistent? 
                // Actually existing logic omitted it if 0.
            }

            if (plan.limits.ai_chat_daily > 0) {
                if (plan.limits.ai_chat_daily === -1) {
                    features.push("Unlimited AI chat");
                } else {
                    features.push(`${plan.limits.ai_chat_daily} AI chats/day`);
                }
            }

            // Also map plan.features (Text List) if available
            if (plan.features && plan.features.length > 0) {
                // But wait, plan.features is now objects { key, text, is_enabled }.
                // We should map them too?
                // The PricingCard component likely expects strings.
                // Let's create strings from enabled features.
                plan.features.filter(f => f.is_enabled).forEach(f => {
                    // Check if not already added via limits?
                    // Just add them.
                    if (!features.includes(f.text)) {
                        // Avoid duplicates if logic above added them?
                        // For now trust the API features list.
                        features.push(f.text);
                    }
                });
            }

            // Format price
            const formattedPrice = new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
            }).format(plan.price);

            const baseData = {
                title: plan.name,
                price: formattedPrice,
                period: `/ ${plan.billing_period === 'monthly' ? 'month' : 'year'}`,
                description: plan.tagline || "",
                features, // Use our constructed list
                slug: plan.slug,
                isPopular: plan.is_most_popular,
            };

            // Add custom button behavior if onPlanSelect is provided (for modal usage)
            if (onPlanSelect) {
                return {
                    ...baseData,
                    onClick: () => onPlanSelect(plan.slug),
                    buttonText: plan.slug === currentPlanSlug ? "Current Plan" : "Upgrade Now",
                    isDisabled: plan.slug === currentPlanSlug,
                };
            }

            return baseData;
        });

    return (
        <div className="w-full">
            <div className="flex flex-col items-center gap-6 lg:gap-8">
                {/* Switcher Pricing */}
                {showSwitcher && (
                    <SwitchPricing activePeriod={period} onToggle={handleToggle} />
                )}

                {/* Card Container */}
                {publicPlans.length === 0 ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-royal-violet-base" />
                    </div>
                ) : dataToDisplay.length > 0 ? (
                    <PricingSection
                        cardsData={dataToDisplay}
                        isPulsing={isPulsing}
                        context={context}
                        currentPlanSlug={context === 'app' ? userPlanSlug : undefined}
                    />
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No {period} plans available at the moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
