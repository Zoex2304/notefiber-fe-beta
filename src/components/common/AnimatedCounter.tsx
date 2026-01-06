
import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedDigitProps {
    value: number | string;
    className?: string;
}

function AnimatedDigit({ value, className }: AnimatedDigitProps) {
    const numericValue = typeof value === 'number' ? value : parseFloat(value as string) || 0;
    const prevValue = useRef(numericValue);
    const direction = numericValue > prevValue.current ? 1 : -1;

    useEffect(() => {
        prevValue.current = numericValue;
    }, [numericValue]);

    return (
        <div className={cn("relative inline-block overflow-hidden h-[1.2em] min-w-[1ch] align-top", className)}>
            <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                <motion.span
                    key={value}
                    custom={direction}
                    variants={{
                        // For countdown (dir -1): Enter from Top (-100%), Exit to Bottom (100%)
                        // For countup (dir 1): Enter from Bottom (100%), Exit to Top (-100%)
                        initial: (d: number) => ({ y: d > 0 ? "100%" : "-100%", opacity: 0 }),
                        animate: { y: "0%", opacity: 1 },
                        exit: (d: number) => ({ y: d > 0 ? "-100%" : "100%", opacity: 0 }),
                    }}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    // Snappy digit flip to prevent "sinking" feeling
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="absolute inset-0 flex items-center justify-center font-bold"
                >
                    {value}
                </motion.span>
            </AnimatePresence>
            {/* Invisible spacer to maintain width */}
            <span className="invisible">{value}</span>
        </div>
    );
}

export interface AnimatedCounterProps {
    value: number;
    initialValue?: number;
    className?: string;
    formatter?: (value: number) => string | number;
    delay?: number; // Delay before starting animation to target
}

export function AnimatedCounter({
    value,
    initialValue = 100,
    className,
    formatter = (v) => v.toLocaleString(),
    delay = 400
}: AnimatedCounterProps) {

    // Spring to drive the "Odometer" tumbling effect
    // Very slow stiffness to ensure we see the numbers tumbling (100..99..98)
    const springValue = useSpring(initialValue, {
        stiffness: 15,
        damping: 10,
        mass: 1
    });

    const [displayedValue, setDisplayedValue] = useState(initialValue);

    // Sync spring to state
    useEffect(() => {
        return springValue.on("change", (latest) => {
            setDisplayedValue(Math.round(latest));
        });
    }, [springValue]);

    // Handle value changes
    useEffect(() => {
        // Reset to initial (e.g. 100) instantly
        springValue.jump(initialValue);

        // Trigger tumble to actual value after brief delay
        const t = setTimeout(() => springValue.set(value), delay);

        return () => clearTimeout(t);
    }, [value, springValue, initialValue, delay]);

    return (
        <AnimatedDigit
            value={formatter(displayedValue)}
            className={className}
        />
    );
}
