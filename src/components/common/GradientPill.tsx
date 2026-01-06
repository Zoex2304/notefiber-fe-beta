
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

export interface GradientPillProps {
    className?: string;
    children: ReactNode;
    onClick?: () => void;
    compact?: boolean;
    showGlow?: boolean;

    /** 
     * Visual style variant 
     * - default: Purple gradient fill with orbiting border
     * - invert: White background with purple border/text
     * - outline: Transparent background with purple border/text
     */
    variant?: 'default' | 'invert' | 'outline';

    /**
     * Animation type
     * - spin: Orbiting border animation
     * - pulse: Subtle pulse effect
     * - none: Static
     */
    animation?: 'spin' | 'pulse' | 'none';

    /** Optional icon to render left of text */
    icon?: ReactNode;

    /** Button size */
    size?: 'sm' | 'md' | 'lg';
}

export function GradientPill({
    className,
    children,
    onClick,
    compact = false,
    showGlow = true,
    variant = 'default',
    animation = 'spin',
    icon,
    size = 'md'
}: GradientPillProps) {

    // Size styles
    // Size styles
    const padding = size === 'sm' ? 'px-3 py-1 text-[10px]' :
        size === 'lg' ? 'px-6 py-2.5 text-sm' : // Adjusted for better balance
            'px-4 py-1.5 text-xs';

    const textSize = size === 'sm' ? 'text-[10px]' :
        size === 'lg' ? 'text-sm' :
            'text-xs';

    // Variant styles for the inner content container
    const variantStyles = {
        default: [
            "bg-gradient-to-b from-[#9E8CE8] to-[#7050F0]",
            "text-white border border-white/20",
            "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),0_2px_8px_rgba(112,80,240,0.3)]"
        ],
        invert: [
            "bg-white",
            "text-[#7050F0] border border-[#7050F0]/20",
            "shadow-sm hover:border-[#7050F0]/40 hover:bg-purple-50/50"
        ],
        outline: [
            "bg-transparent",
            "text-[#7050F0] border border-[#7050F0]/30",
            "hover:bg-[#7050F0]/5"
        ]
    };

    // Should we show the orbiting border effect?
    // Only for default variant with spin animation
    const showOrbit = variant === 'default' && animation === 'spin';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
                "relative group rounded-full overflow-visible p-[2px] cursor-pointer inline-flex",
                className
            )}
            onClick={onClick}
        >
            {/* Orbiting Border Effect - White & Purple Comet */}
            {showOrbit && (
                <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                    <div className="absolute inset-[-100%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,#7050f0_40%,#ffffff_50%,transparent_55%)] opacity-100 will-change-transform" />
                </div>
            )}

            {/* Static Border for Invert/Outline if needed (handled by inner container border) */}

            {/* Main Pill / Button Container */}
            <div
                className={cn(
                    "relative z-10 flex items-center gap-2 rounded-full font-bold tracking-tight transition-all group-hover:brightness-110 justify-center w-full",
                    variantStyles[variant],
                    padding,
                    textSize,
                    compact && "px-1.5 py-0.5"
                )}
            >
                {/* Subtle sheen overlay (Default only) */}
                {variant === 'default' && (
                    <div className="absolute inset-x-0 top-0 h-[50%] bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-t-full" />
                )}

                {icon && <span className="shrink-0">{icon}</span>}
                {children}
            </div>

            {/* Background Glow (Outer) - Softer White/Purple Mix */}
            {showGlow && variant === 'default' && (
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-white/20 rounded-full blur-md -z-10 transition-opacity group-hover:opacity-100" />
            )}
        </motion.div>
    );
}
