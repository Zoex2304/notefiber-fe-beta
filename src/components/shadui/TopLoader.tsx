import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

interface TopLoaderProps {
    color?: string;
}

export function TopLoader({ color }: TopLoaderProps) {
    const isLoading = useRouterState({ select: (s) => s.status === 'pending' });
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isLoading) {
            setIsVisible(true);
            setProgress(30);
        } else {
            // Finish immediately when loading completes
            if (isVisible) {
                setProgress(100);
            }
        }
    }, [isLoading, isVisible]);

    useEffect(() => {
        if (progress === 100) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                setProgress(0);
            }, 500); // Fade out delay
            return () => clearTimeout(timer);
        }
    }, [progress]);

    useEffect(() => {
        if (isVisible && progress < 90) {
            const timer = setInterval(() => {
                setProgress((prev) => Math.min(prev + Math.random() * 10, 90));
            }, 500);
            return () => clearInterval(timer);
        }
    }, [isVisible, progress]);

    if (!isVisible) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-transparent">
            <div
                className={cn(
                    "h-full transition-all duration-500 ease-out",
                    !color && "bg-gradient-to-r from-royal-violet-base to-royal-violet-muted"
                )}
                style={{
                    width: `${progress}%`,
                    backgroundColor: color || undefined
                }}
            />
        </div>
    );
}
