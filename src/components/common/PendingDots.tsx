import { cn } from '@/lib/utils';

interface PendingDotsProps {
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Color class for the dots */
    colorClassName?: string;
    /** Additional classes */
    className?: string;
}

/**
 * Reusable animated pending/waiting dots indicator.
 * 
 * Use this component anywhere in the application to represent
 * a waiting or pending state (e.g., awaiting approval, processing).
 * 
 * The animation creates a subtle "breathing" effect that conveys
 * an ongoing process rather than a static state.
 * 
 * @example
 * // In a button
 * <Button disabled>
 *   <PendingDots /> Awaiting Approval
 * </Button>
 * 
 * @example
 * // Standalone with text
 * <span className="flex items-center gap-2">
 *   <PendingDots size="sm" />
 *   Processing
 * </span>
 */
export function PendingDots({
    size = 'md',
    colorClassName = 'bg-current',
    className
}: PendingDotsProps) {
    const sizeMap = {
        sm: 'w-1 h-1',
        md: 'w-1.5 h-1.5',
        lg: 'w-2 h-2'
    };

    const gapMap = {
        sm: 'gap-0.5',
        md: 'gap-1',
        lg: 'gap-1.5'
    };

    const dotClass = cn(
        'rounded-full',
        sizeMap[size],
        colorClassName
    );

    return (
        <span
            className={cn(
                'inline-flex items-center',
                gapMap[size],
                className
            )}
            role="status"
            aria-label="Pending"
        >
            <span
                className={cn(dotClass, 'animate-pulse')}
                style={{ animationDelay: '0ms' }}
            />
            <span
                className={cn(dotClass, 'animate-pulse')}
                style={{ animationDelay: '150ms' }}
            />
            <span
                className={cn(dotClass, 'animate-pulse')}
                style={{ animationDelay: '300ms' }}
            />
        </span>
    );
}
