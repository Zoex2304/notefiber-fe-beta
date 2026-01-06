import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
    /** Lucide icon component - REQUIRED for visual consistency */
    icon: LucideIcon;
    /** Section title text */
    title: string;
    /** Optional action element (e.g., link, button) */
    action?: ReactNode;
    /** Additional classes */
    className?: string;
}

/**
 * Consistent section header with icon and title.
 * Used to demarcate content sections with visual hierarchy.
 * 
 * Icon always uses foreground color (text-gray-500) for consistency.
 * Icon is required and cannot be disabled.
 */
export function SectionHeader({
    icon: Icon,
    title,
    action,
    className
}: SectionHeaderProps) {
    return (
        <div className={cn("flex items-center justify-between mb-4", className)}>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Icon className="h-5 w-5 text-gray-500" />
                {title}
            </h3>
            {action}
        </div>
    );
}
