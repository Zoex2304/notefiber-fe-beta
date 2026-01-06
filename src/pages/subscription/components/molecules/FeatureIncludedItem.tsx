import { Skeleton } from '@/components/shadui/skeleton';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureIncludedItemProps {
    /** Feature description text */
    text: string;
    /** Show loading skeleton */
    isLoading?: boolean;
    /** Additional classes */
    className?: string;
}

/**
 * Feature item molecule with check icon for plan features display.
 * Supports loading state for async data fetching.
 */
export function FeatureIncludedItem({
    text,
    isLoading = false,
    className
}: FeatureIncludedItemProps) {
    if (isLoading) {
        return (
            <div className={cn("flex items-center gap-3", className)}>
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </div>
        );
    }

    return (
        <div className={cn("flex items-center gap-3", className)}>
            <div className="h-8 w-8 rounded-full flex items-center justify-center bg-green-50 text-green-600 shrink-0">
                <Check className="h-4 w-4" />
            </div>
            <div>
                <p className="font-medium text-gray-900">{text}</p>
                <p className="text-xs text-gray-500">Included</p>
            </div>
        </div>
    );
}
