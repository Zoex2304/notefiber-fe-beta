import { SectionHeader } from '@/components/layout/SectionHeader';
import { FeatureIncludedItem } from '../molecules/FeatureIncludedItem';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPlanDisplayFeatures, findPlanByName } from '@/utils/planUtils';
import type { PublicPlan } from '@/api/services/payment/payment.types';

interface PlanFeaturesSectionProps {
    /** Current plan name */
    planName: string;
    /** Available public plans */
    publicPlans: PublicPlan[];
    /** Loading state */
    isLoading?: boolean;
    /** Additional classes */
    className?: string;
}

/**
 * Plan features section organism showing included features.
 * Displays a responsive grid of feature items based on current plan.
 */
export function PlanFeaturesSection({
    planName,
    publicPlans,
    isLoading = false,
    className
}: PlanFeaturesSectionProps) {
    const currentPlan = findPlanByName(publicPlans, planName);
    const features = currentPlan ? getPlanDisplayFeatures(currentPlan) : [];
    const showLoading = isLoading || publicPlans.length === 0;
    const showFallback = !showLoading && publicPlans.length > 0 && !currentPlan;

    return (
        <div className={cn(
            "bg-white rounded-xl border border-gray-100 p-6 shadow-sm",
            "hover:shadow-md transition-shadow duration-300",
            className
        )}>
            <SectionHeader
                icon={Sparkles}
                title={`Included in ${planName}`}
                className="mb-6"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
                {showLoading && (
                    // Loading skeleton items
                    Array(3).fill(0).map((_, i) => (
                        <FeatureIncludedItem key={i} text="" isLoading />
                    ))
                )}

                {!showLoading && features.map((text, idx) => (
                    <FeatureIncludedItem key={idx} text={text} />
                ))}

                {showFallback && (
                    <div className="col-span-full text-center text-gray-500 py-4">
                        <p>Plan details not available for {planName}.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
