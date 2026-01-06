import type { ReactNode } from 'react';
import { Button } from '@/components/shadui/button';
import { ActionTooltip } from '@/components/common/ActionTooltip';
import { MoveLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderLayoutProps {
    /** Main page title */
    title: string;
    /** Optional subtitle or description */
    subtitle?: string;
    /** Callback when back button is clicked */
    onBack?: () => void;
    /** Optional tooltip for back button */
    backTooltip?: string;
    /** Additional content to render in header (e.g., badges, actions) */
    children?: ReactNode;
    /** Additional classes for the container */
    className?: string;
}

/**
 * Reusable page header layout with back navigation, title, and subtitle.
 * Provides consistent visual styling across all detail/management pages.
 */
export function PageHeaderLayout({
    title,
    subtitle,
    onBack,
    backTooltip = "Go Back",
    children,
    className
}: PageHeaderLayoutProps) {
    return (
        <div className={cn("flex items-center gap-4", className)}>
            {onBack && (
                <ActionTooltip label={backTooltip}>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onBack}
                        className="h-10 w-10 shrink-0 rounded-full hover:bg-muted transition-colors duration-200"
                    >
                        <MoveLeft className="h-5 w-5 text-muted-foreground" />
                    </Button>
                </ActionTooltip>
            )}
            <div className="flex-1">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-muted-foreground mt-1 text-body-base">
                        {subtitle}
                    </p>
                )}
            </div>
            {children}
        </div>
    );
}
