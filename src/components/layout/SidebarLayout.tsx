"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface SidebarLayoutProps {
    children: ReactNode;
    isCollapsed: boolean;
    onToggle: () => void;
    side?: "left" | "right";
    width?: number;
    collapsedWidth?: number;
    className?: string;
    showToggle?: boolean;
}

export function SidebarLayout({
    children,
    isCollapsed,
    onToggle,
    side = "left",
    width = 280,
    collapsedWidth = 64,
    className,
    showToggle = true,
}: SidebarLayoutProps) {
    const isLeft = side === "left";

    return (
        <aside
            className={cn(
                "relative flex flex-col bg-white transition-[width] duration-200 ease-in-out z-20 will-change-[width]",
                isLeft ? "border-r border-gray-200" : "border-l border-gray-200",
                className
            )}
            style={{ width: isCollapsed ? collapsedWidth : width }}
        >
            {/* Collapse Toggle Button - Positioned on the edge */}
            {showToggle && (
                <motion.button
                    onClick={onToggle}
                    whileHover={{ scale: 1.1, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                        "absolute top-1/2 -translate-y-1/2 z-30",
                        "flex h-6 w-6 items-center justify-center rounded-full",
                        "bg-white border border-gray-200 shadow-sm",
                        "text-gray-500 hover:text-royal-violet-base hover:border-royal-violet-base/20 transition-colors",
                        isLeft ? "-right-3" : "-left-3"
                    )}
                    aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {/* Logic for chevron direction based on side and interaction */}
                    {isLeft ? (
                        isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />
                    ) : (
                        isCollapsed ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />
                    )}
                </motion.button>
            )}

            {/* Content Container */}
            <div className={cn("flex flex-col h-full w-full overflow-hidden")}>
                {children}
            </div>
        </aside>
    );
}
