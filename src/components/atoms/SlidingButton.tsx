import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// =============================================================================
// Types
// =============================================================================

export interface SlidingButtonProps {
    /** Whether the button should be hidden */
    hidden?: boolean;
    /** Content to render */
    children: ReactNode;
    /** Additional class names */
    className?: string;
    /** Animation duration in ms */
    duration?: number;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Animated container that smoothly slides in/out.
 * Useful for buttons that should hide when certain conditions are met.
 * 
 * @example
 * <SlidingButton hidden={hasContent}>
 *   <PrefixHelper onSelect={handleSelect} />
 * </SlidingButton>
 */
export function SlidingButton({
    hidden = false,
    children,
    className,
    duration = 200,
}: SlidingButtonProps) {
    return (
        <div
            className={cn(
                "flex items-center justify-center overflow-hidden shrink-0 self-center",
                "transition-all ease-out",
                hidden
                    ? "w-0 opacity-0 -ml-1"
                    : "w-8 opacity-100 ml-0.5",
                className
            )}
            style={{ transitionDuration: `${duration}ms` }}
        >
            {children}
        </div>
    );
}
