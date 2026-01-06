import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface UsageProgressBarProps {
    /** Current percentage (0-100) */
    percentage: number;
    /** Tailwind color class for the progress bar */
    colorClassName?: string;
    /** If true, shows full bar in green */
    isUnlimited?: boolean;
    /** Animation duration in seconds */
    duration?: number;
    /** Additional classes for container */
    className?: string;
}

/**
 * Animated progress bar with Framer Motion.
 * Supports unlimited state and customizable colors.
 */
export function UsageProgressBar({
    percentage,
    colorClassName = 'bg-purple-500',
    isUnlimited = false,
    duration = 1,
    className
}: UsageProgressBarProps) {
    const displayPercentage = isUnlimited ? 100 : Math.min(100, percentage);
    const barColor = isUnlimited ? 'bg-green-500' : colorClassName;

    return (
        <div className={cn("h-1.5 w-full bg-gray-100 rounded-full overflow-hidden", className)}>
            <motion.div
                className={cn("h-full rounded-full", barColor)}
                initial={{ width: 0 }}
                animate={{ width: `${displayPercentage}%` }}
                transition={{ duration, ease: "easeOut" }}
            />
        </div>
    );
}
