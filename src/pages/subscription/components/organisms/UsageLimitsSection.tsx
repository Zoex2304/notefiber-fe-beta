import { SectionHeader } from '@/components/layout/SectionHeader';
import { UsageStatCard } from '../molecules/UsageStatCard';
import { HardDrive, Zap, Search, Database, Book } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TokenUsageData {
    chat: {
        used: number;
        limit: number;
        percentage: number;
    };
    search?: {
        used: number;
        limit: number;
        percentage: number;
    };
    storage?: {
        notes?: {
            used: number;
            limit: number;
            percentage: number;
        };
        notebooks?: {
            used: number;
            limit: number;
            percentage: number;
        };
    };
}

interface UsageLimitsSectionProps {
    /** Token usage data from subscription context */
    tokenUsage: TokenUsageData;
    /** Additional classes */
    className?: string;
}

/**
 * Usage limits section organism displaying all resource consumption metrics.
 * Renders a responsive grid of usage stat cards.
 */
export function UsageLimitsSection({
    tokenUsage,
    className
}: UsageLimitsSectionProps) {
    return (
        <div className={cn(className)}>
            <SectionHeader
                icon={HardDrive}
                title="Usage & Limits"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* AI Chat Tokens */}
                <UsageStatCard
                    icon={Zap}
                    iconColor="text-amber-500"
                    title="AI Chat Tokens"
                    usage={{
                        used: tokenUsage.chat.used,
                        limit: tokenUsage.chat.limit,
                        percentage: tokenUsage.chat.percentage
                    }}
                    progressColor="bg-amber-500"
                    useTokenIndicator={true}
                />

                {/* Search Tokens */}
                <UsageStatCard
                    icon={Search}
                    iconColor="text-blue-500"
                    title="Search Tokens"
                    usage={{
                        used: tokenUsage.search?.used || 0,
                        limit: tokenUsage.search?.limit || 0,
                        percentage: tokenUsage.search?.percentage || 0
                    }}
                    progressColor="bg-blue-500"
                />

                {/* Note Storage */}
                <UsageStatCard
                    icon={Database}
                    iconColor="text-purple-500"
                    title="Note Storage"
                    usage={{
                        used: tokenUsage.storage?.notes?.used || 0,
                        limit: tokenUsage.storage?.notes?.limit || 0,
                        percentage: tokenUsage.storage?.notes?.percentage || 0
                    }}
                    progressColor="bg-purple-500"
                    isUnlimited={
                        (tokenUsage.storage?.notes?.limit ?? 0) === -1
                    }
                    unitLabel="used"
                />

                {/* Notebook Storage */}
                <UsageStatCard
                    icon={Book}
                    iconColor="text-pink-500"
                    title="Notebooks"
                    usage={{
                        used: tokenUsage.storage?.notebooks?.used || 0,
                        limit: tokenUsage.storage?.notebooks?.limit || 0,
                        percentage: tokenUsage.storage?.notebooks?.percentage || 0
                    }}
                    progressColor="bg-pink-500"
                    isUnlimited={
                        (tokenUsage.storage?.notebooks?.limit ?? 0) === -1
                    }
                    unitLabel="used"
                />
            </div>
        </div>
    );
}
