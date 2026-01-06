import { useSubscription } from "@/contexts/SubscriptionContext";
import { cn } from "@/lib/utils";
import { Search, Sparkles, FileText, Book } from "lucide-react";
import { GradientPill } from "./GradientPill";
import { AnimatedCounter } from "./AnimatedCounter";

export interface TokenUsagePillProps {
    className?: string;
    type?: 'chat' | 'search' | 'notes' | 'notebooks';
    compact?: boolean;
}



export function TokenUsagePill({ className, type = 'chat', compact = false }: TokenUsagePillProps) {
    const { isActive, tokenUsage } = useSubscription();

    let metric;
    if (type === 'chat' || type === 'search') {
        metric = tokenUsage[type];
    } else {
        metric = tokenUsage.storage?.[type as 'notes' | 'notebooks'];
    }

    // Only show if subscription is active and limit is valid (allow 0 if it's explicitly set, but here we check existence)
    if (!isActive || !metric || metric.limit === undefined) return null;

    const isChat = type === 'chat';
    const isSearch = type === 'search'; // Fixed logic for icon selection below

    return (
        <GradientPill className={className} compact={compact}>
            {isChat && (
                <Sparkles className={cn("w-3.5 h-3.5 text-white fill-white/20", compact && "w-3.5 h-3.5")} />
            )}
            {type === 'search' && (
                <Search className={cn("w-3.5 h-3.5 text-white/90", compact && "w-3.5 h-3.5")} />
            )}
            {type === 'notes' && (
                <FileText className={cn("w-3.5 h-3.5 text-white/90", compact && "w-3.5 h-3.5")} />
            )}
            {type === 'notebooks' && (
                <Book className={cn("w-3.5 h-3.5 text-white/90", compact && "w-3.5 h-3.5")} />
            )}

            {!compact && (
                <span className="flex items-center gap-0.5 tracking-tight font-bold relative z-10 text-shadow-sm font-sans">
                    <AnimatedCounter
                        value={metric.used}
                        initialValue={100}
                        formatter={(v) => v.toLocaleString()}
                    />
                    <span className="text-white/60 font-medium mx-0.5">/</span>
                    <span>{metric.limit === -1 ? '∞' : metric.limit.toLocaleString()}</span>
                </span>
            )}
        </GradientPill>
    );
}
