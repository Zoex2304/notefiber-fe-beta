/**
 * LightThemeWrapper - Forces light theme for a specific DOM subtree.
 * 
 * This component is the SINGLE SOURCE OF TRUTH for light theme isolation.
 * It's designed for namespaces like landing pages that should ALWAYS use 
 * light theme regardless of user preference or system setting.
 * 
 * How it works:
 * 1. Adds `light` class which overrides CSS variables via global-theme.css
 * 2. Applies explicit `bg-white` to cover parent's dark background
 * 3. Applies `text-foreground` to reset text color (breaks body inheritance)
 * 4. Uses `min-h-screen` to fill entire viewport
 * 5. Resets color-scheme to ensure browser UI elements match
 * 
 * This is AGNOSTIC to the global ThemeProvider and PERSISTENT across 
 * user theme changes.
 */
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface LightThemeWrapperProps {
    children: ReactNode;
    className?: string;
}

export function LightThemeWrapper({ children, className }: LightThemeWrapperProps) {
    return (
        <div
            className={cn(
                "light", // Force light theme CSS variables
                "min-h-screen w-full", // Cover full viewport
                "bg-white", // Explicit background to cover parent's dark bg
                "text-foreground", // Reset text color to light theme's foreground
                className
            )}
            data-theme="light"
            style={{
                colorScheme: 'light', // Force light color scheme for browser UI
            }}
        >
            {children}
        </div>
    );
}
