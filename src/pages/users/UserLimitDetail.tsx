import { useParams } from '@tanstack/react-router';
import { Card, CardContent, CardHeader } from '@/components/shadui/card';
import { Button } from '@/components/shadui/button';
import { Badge } from '@/components/shadui/badge';
import { Skeleton } from '@/components/shadui/skeleton';
import { ArrowLeft, Zap, CheckCircle, FileText, User, AlertCircle } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { cn } from '@/lib/utils';
import { Progress } from "@/components/shadui/progress";

export function UserLimitDetail() {
    const { userId } = useParams({ from: '/_authenticated/app/users/$userId' });
    const { isActive, planName, tokenUsage, isLoading } = useSubscription();

    const handleBack = () => {
        window.history.back();
    };

    if (isLoading) {
        return (
            <div className="min-h-full w-full bg-background p-6 lg:p-10 flex flex-col items-center">
                <div className="w-full max-w-3xl space-y-6">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-8 w-48" />
                    </div>
                    <Card className="border-0 shadow-sm bg-card/80 backdrop-blur-sm">
                        <CardHeader>
                            <Skeleton className="h-8 w-1/3 mb-2" />
                            <Skeleton className="h-4 w-1/4" />
                        </CardHeader>
                        <CardContent className="h-64" />
                    </Card>
                </div>
            </div>
        );
    }

    // Determine limit status
    const chatLimit = tokenUsage.chat.limit;
    const chatUsed = tokenUsage.chat.used;
    const isUnlimited = chatLimit === -1;
    const limitDisplay = isUnlimited ? 'Unlimited' : chatLimit.toLocaleString();
    const usedDisplay = chatUsed.toLocaleString();
    const percentUsed = isUnlimited ? 0 : (chatLimit > 0 ? Math.min(100, Math.round((chatUsed / chatLimit) * 100)) : 0);

    return (
        <div className="min-h-full w-full bg-background p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleBack}
                            className="bg-card hover:bg-card/80 shadow-sm rounded-full h-8 w-8 text-muted-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 dark:from-white dark:to-gray-300">
                                User Limit Status
                            </h1>
                            <p className="text-sm text-muted-foreground font-medium">
                                User ID: <span className="font-mono">{userId}</span>
                            </p>
                        </div>
                    </div>
                </div>

                <Card className="border-0 shadow-lg bg-card/90 backdrop-blur-xl overflow-hidden rounded-2xl ring-1 ring-black/5 dark:ring-white/10">
                    <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 p-6 border-b border-primary/20 dark:border-purple-900/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-background rounded-lg shadow-sm text-primary">
                                <Zap className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-foreground">Daily AI Limits</h2>
                                <p className="text-sm text-muted-foreground">Real-time usage monitoring</p>
                            </div>
                        </div>
                        <Badge variant={isActive ? 'default' : 'secondary'} className={cn(
                            "px-3 py-1 text-sm font-medium",
                            isActive ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-muted text-muted-foreground"
                        )}>
                            {isActive ? (
                                <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Active</span>
                            ) : (
                                <span className="flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Inactive</span>
                            )}
                        </Badge>
                    </div>

                    <CardContent className="p-8 space-y-8">

                        {/* Notification Banner */}
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-3">
                            <Zap className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-foreground">
                                    Limit Status Update
                                </p>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                    Your daily AI interaction limits have been successfully updated based on your recent plan changes or administrative action.
                                </p>
                            </div>
                        </div>

                        {/* Usage Progress */}
                        {!isUnlimited && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="text-muted-foreground">Daily Usage</span>
                                    <span className={cn(
                                        percentUsed > 90 ? "text-destructive" : "text-primary"
                                    )}>
                                        {percentUsed}% Used
                                    </span>
                                </div>
                                <Progress value={percentUsed} className="h-3 bg-muted" />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{usedDisplay} tokens</span>
                                    <span>{limitDisplay} limit</span>
                                </div>
                            </div>
                        )}

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-muted/50 border-0 flex items-center gap-4">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Plan Tier</p>
                                    <p className="text-lg font-bold text-foreground capitalize">{planName}</p>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-muted/50 border-0 flex items-center gap-4">
                                <User className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account</p>
                                    <p className="text-lg font-bold text-foreground">{isActive ? 'Good Standing' : 'Inactive'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="text-center pt-4">
                            <p className="text-xs text-muted-foreground">
                                Limits reset automatically every 24 hours.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
