import { ReactNode } from 'react';
import { Card, CardContent, CardHeader } from '@/components/shadui/card';
import { Button } from '@/components/shadui/button';
import { Badge } from '@/components/shadui/badge';
import { Skeleton } from '@/components/shadui/skeleton';
import { ArrowLeft, XCircle, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationDetailLayoutProps {
    title: string;
    requestId?: string;
    backLabel?: string;
    isLoading?: boolean;
    error?: unknown;
    notFoundMessage?: string;
    onBack: () => void;
    status?: {
        label: string;
        icon: LucideIcon;
        variant: "default" | "secondary" | "destructive" | "outline";
        className?: string;
        cardBorder?: string;
    };
    children: ReactNode;
}

export function NotificationDetailLayout({
    title,
    requestId,
    backLabel = "Go Back",
    isLoading,
    error,
    notFoundMessage = "The request you're looking for doesn't exist.",
    onBack,
    status,
    children
}: NotificationDetailLayoutProps) {

    if (isLoading) {
        return (
            <div className="min-h-full w-full bg-[#f8f6f9] dark:bg-background p-6 lg:p-10 flex flex-col items-center">
                <div className="w-full max-w-3xl space-y-6">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-8 w-48" />
                    </div>
                    <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
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

    if (error) {
        return (
            <div className="min-h-full w-full bg-[#f8f6f9] dark:bg-background p-6 lg:p-10 flex flex-col items-center justify-center">
                <Card className="max-w-md w-full border-dashed shadow-sm">
                    <CardContent className="py-12 text-center flex flex-col items-center">
                        <div className="bg-red-50 p-4 rounded-full mb-4">
                            <XCircle className="h-8 w-8 text-red-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Request Not Found</h3>
                        <p className="text-muted-foreground mb-6">
                            {typeof error === 'string' ? error : notFoundMessage}
                        </p>
                        <Button variant="outline" onClick={onBack} className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            {backLabel}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-full w-full bg-[#f8f6f9] dark:bg-background p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onBack}
                            className="bg-white hover:bg-white/80 shadow-sm rounded-full h-8 w-8 text-gray-500"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#0F0538] to-[#4B3E8E] dark:from-white dark:to-gray-300">
                                {title}
                            </h1>
                            {requestId && (
                                <p className="text-sm text-gray-500 font-medium">
                                    Request ID: <span className="font-mono">{requestId.slice(0, 8)}</span>
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content Card */}
                <Card className={cn(
                    "border-0 shadow-lg bg-white/90 backdrop-blur-xl overflow-hidden rounded-2xl ring-1 ring-black/5",
                    status?.cardBorder
                )}>
                    {status && (
                        <div className="border-b border-gray-100 bg-gray-50/50 p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className={cn("p-2 rounded-lg", status.className?.replace('text-', 'bg-').replace('border-', ''))} style={{ background: 'transparent' }}>
                                    <div className={cn("p-2 rounded-full", status.className?.split(' ')[1])}>
                                        <status.icon className={cn("h-6 w-6", status.className?.split(' ')[2])} />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="font-semibold text-gray-900">Request Status</h2>
                                    {/* Date could be passed here if needed, or rendered by parent if flexible */}
                                </div>
                            </div>
                            <Badge variant={status.variant} className={cn("px-4 py-1.5 h-auto text-sm font-medium", status.className)}>
                                {status.label}
                            </Badge>
                        </div>
                    )}

                    <CardContent className="p-8 space-y-8">
                        {children}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
