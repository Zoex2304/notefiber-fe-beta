import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface RingingIconProps {
    /** The icon or element to animate */
    children: ReactNode;
    /** Whether the ringing animation is active */
    isRinging?: boolean;
    /** Animation intensity: subtle, normal, expressive */
    intensity?: 'subtle' | 'normal' | 'expressive';
    /** Whether to apply highlight color when ringing */
    highlightOnRing?: boolean;
    /** Custom highlight color class (default: yellow gradient) */
    highlightClassName?: string;
    /** Duration of the ring animation in seconds */
    duration?: number;
    /** Number of times to repeat the ring (0 = infinite while isRinging) */
    repeatCount?: number;
    /** Additional classes */
    className?: string;
    /** onClick handler */
    onClick?: () => void;
}

// Animation variants for different intensities
const ringVariants: Record<string, Variants> = {
    subtle: {
        idle: { rotate: 0, scale: 1 },
        ring: {
            rotate: [0, -8, 8, -6, 6, -4, 4, 0],
            scale: [1, 1.05, 1.05, 1.03, 1.03, 1.01, 1.01, 1],
            transition: {
                duration: 0.6,
                ease: "easeInOut",
            }
        }
    },
    normal: {
        idle: { rotate: 0, scale: 1 },
        ring: {
            rotate: [0, -12, 12, -10, 10, -6, 6, -3, 3, 0],
            scale: [1, 1.1, 1.1, 1.08, 1.08, 1.05, 1.05, 1.02, 1.02, 1],
            transition: {
                duration: 0.8,
                ease: "easeInOut",
            }
        }
    },
    expressive: {
        idle: { rotate: 0, scale: 1 },
        ring: {
            rotate: [0, -15, 15, -12, 12, -10, 10, -8, 8, -5, 5, 0],
            scale: [1, 1.15, 1.15, 1.12, 1.12, 1.1, 1.1, 1.08, 1.08, 1.05, 1.05, 1],
            transition: {
                duration: 1,
                ease: "easeInOut",
            }
        }
    }
};

/**
 * Reusable ringing/shaking animation wrapper for icons.
 * 
 * Use this component to add attention-grabbing animations to any icon,
 * perfect for notification bells, alerts, or any element that needs
 * to communicate importance.
 * 
 * Features:
 * - Configurable shake intensity (subtle, normal, expressive)
 * - Optional color highlight with smooth transition
 * - Customizable duration and repeat count
 * - Works with any icon or element as children
 * 
 * @example
 * // Basic usage with notification bell
 * <RingingIcon isRinging={hasNewNotification}>
 *   <Bell className="h-5 w-5" />
 * </RingingIcon>
 * 
 * @example
 * // Expressive with custom highlight
 * <RingingIcon 
 *   isRinging={true} 
 *   intensity="expressive"
 *   highlightOnRing
 *   highlightClassName="text-amber-500"
 * >
 *   <Bell className="h-5 w-5" />
 * </RingingIcon>
 */
export function RingingIcon({
    children,
    isRinging = false,
    intensity = 'normal',
    highlightOnRing = true,
    highlightClassName = 'text-amber-500',
    duration,
    className,
    onClick
}: RingingIconProps) {
    const variants = ringVariants[intensity];

    // Override duration if provided
    const customVariants: Variants = duration ? {
        idle: variants.idle,
        ring: {
            ...variants.ring,
            transition: {
                // @ts-ignore - Safe because we know the structure of our variants
                ...(variants.ring as any).transition,
                duration,
            }
        }
    } : variants;

    return (
        <motion.div
            className={cn(
                "relative inline-flex items-center justify-center origin-top cursor-pointer",
                "transition-colors duration-300",
                isRinging && highlightOnRing && highlightClassName,
                className
            )}
            initial="idle"
            animate={isRinging ? "ring" : "idle"}
            variants={customVariants}
            onClick={onClick}
            style={{
                // Set transform origin to simulate bell swinging from top
                transformOrigin: 'top center'
            }}
        >
            {children}

            {/* Glow effect when ringing */}
            {isRinging && highlightOnRing && (
                <motion.div
                    className="absolute inset-0 rounded-full bg-amber-400/30 blur-md -z-10"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                        opacity: [0, 0.6, 0.3, 0.6, 0],
                        scale: [0.8, 1.3, 1.2, 1.3, 0.8]
                    }}
                    transition={{
                        // @ts-ignore
                        duration: customVariants.ring?.transition?.duration || 0.8,
                        ease: "easeInOut"
                    }}
                />
            )}
        </motion.div>
    );
}
