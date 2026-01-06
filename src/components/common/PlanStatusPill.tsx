import { useSubscription } from "@/contexts/SubscriptionContext";
import { cn } from "@/lib/utils";
import { Sparkles, Crown } from "lucide-react";

interface PlanStatusPillProps {
    className?: string;
    compact?: boolean;
}

export function PlanStatusPill({ className, compact = false }: PlanStatusPillProps) {
    const { planName, isActive } = useSubscription();

    // Determine styles based on plan status
    const isPro = isActive && planName.toLowerCase().includes("pro");
    const isEnterprise = isActive && planName.toLowerCase().includes("enterprise");
    const isPaid = isPro || isEnterprise;

    // Compact mode: just show icon
    if (compact) {
        return (
            <div
                className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg transition-all",
                    isPaid
                        ? "bg-gradient-primary-violet text-white shadow-sm"
                        : "bg-gray-100 text-gray-500",
                    className
                )}
            >
                {isPaid ? (
                    <Crown className="w-4 h-4" strokeWidth={2.5} />
                ) : (
                    <Sparkles className="w-4 h-4" strokeWidth={2.5} />
                )}
            </div>
        );
    }

    return (
        <div
            className={cn(
                "flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                isPaid
                    ? "bg-gradient-primary-violet text-white border-transparent shadow-sm"
                    : "bg-gray-100 text-gray-600 border-gray-200",
                className
            )}
        >
            {isPaid && <Sparkles className="w-3.5 h-3.5 text-white/90 fill-white/20" strokeWidth={2.5} />}
            <span className="capitalize">{planName}</span>
        </div>
    );
}

