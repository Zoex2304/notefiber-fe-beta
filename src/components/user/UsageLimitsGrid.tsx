
import { Card, CardContent } from "@/components/shadui/card";
import { Progress } from "@/components/shadui/progress";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { cn } from "@/lib/utils";
import { Zap, Search, Database, Book, HardDrive } from "lucide-react";

interface UsageCardProps {
    icon: React.ElementType;
    title: string;
    used: number;
    limit: number;
    limitLabel?: string;
    colorClass?: string;
    isDaily?: boolean; // To show "daily used" vs "used"
}

function UsageCard({ icon: Icon, title, used, limit, limitLabel, colorClass = "text-primary", isDaily }: UsageCardProps) {
    // Calculate percentage
    const rawPercentage = limit > 0 ? (used / limit) * 100 : 0;
    const isUnlimited = limit === -1;

    // Determine display string
    let displayString = "0%";
    if (isUnlimited) {
        displayString = "∞";
    } else if (used > 0 && rawPercentage < 1) {
        displayString = `${rawPercentage.toFixed(2)}%`;
    } else {
        displayString = `${Math.min(Math.round(rawPercentage), 100)}%`;
    }

    // Determine progress bar value (ensure at least 1% visible if used > 0)
    const progressValue = limit > 0
        ? Math.min(Math.round(rawPercentage), 100)
        : 0;

    return (
        <Card className="shadow-sm border-border/60">
            <CardContent className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Icon className={cn("w-4 h-4", colorClass)} />
                    <span className="text-sm font-medium">{title}</span>
                </div>

                {/* Big Stat */}
                <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-bold tracking-tight">
                        {displayString}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                        {isDaily ? 'daily used' : 'used'}
                    </span>
                </div>

                {/* Progress Bar */}
                <Progress
                    value={progressValue}
                    className="h-2"
                    indicatorClassName={colorClass?.replace("text-", "bg-")}
                />

                {/* Footer Stats */}
                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                    <span>{used.toLocaleString()} used</span>
                    <span>
                        {isUnlimited ? 'Unlimited' : `${limit.toLocaleString()} ${limitLabel || 'limit'}`}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}

export function UsageLimitsGrid() {
    const { tokenUsage } = useSubscription();

    // Mapping data from context
    const chatUsage = tokenUsage.chat;
    const searchUsage = tokenUsage.search;
    const notesUsage = tokenUsage.storage?.notes;
    const notebooksUsage = tokenUsage.storage?.notebooks;

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                <HardDrive className="w-5 h-5 text-muted-foreground" />
                Usage & Limits
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* AI Chat */}
                <UsageCard
                    icon={Zap} // Or Sparkles
                    title="AI Chat Tokens"
                    used={chatUsage?.used || 0}
                    limit={chatUsage?.limit || 0}
                    colorClass="text-amber-500" // Orange/Yellowish
                    isDaily
                />

                {/* Search */}
                <UsageCard
                    icon={Search}
                    title="Search Tokens"
                    used={searchUsage?.used || 0}
                    limit={searchUsage?.limit || 0}
                    colorClass="text-blue-500"
                    isDaily
                />

                {/* storage: Notes */}
                <UsageCard
                    icon={Database} // Or FileText
                    title="Note Storage"
                    used={notesUsage?.used || 0}
                    limit={notesUsage?.limit || 0}
                    colorClass="text-purple-500"
                />

                {/* storage: Notebooks */}
                <UsageCard
                    icon={Book}
                    title="Notebooks"
                    used={notebooksUsage?.used || 0}
                    limit={notebooksUsage?.limit || 0}
                    colorClass="text-pink-500"
                />
            </div>
        </div>
    );
}
