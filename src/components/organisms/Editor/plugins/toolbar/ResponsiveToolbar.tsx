import React, { useState, useRef, useLayoutEffect } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/shadui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/shadui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ResponsiveToolbarProps {
    items: { id: string; content: React.ReactNode }[];
    className?: string;
}

export function ResponsiveToolbar({ items, className }: ResponsiveToolbarProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [visibleCount, setVisibleCount] = useState(items.length);

    // We will render a hidden "Ruler" container to measure full widths of all groups
    const rulerRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (!rulerRef.current || !containerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const containerWidth = entry.contentRect.width;
                const rulerNodes = rulerRef.current?.children;
                if (!rulerNodes) return;

                let currentWidth = 0;
                let newVisibleCount = 0;
                const moreButtonWidth = 40; // Approximate width of the "More" button

                // Collect widths
                const widths = Array.from(rulerNodes).map(node => node.getBoundingClientRect().width);

                for (let i = 0; i < widths.length; i++) {
                    const itemW = widths[i];

                    // const isLast = i === items.length - 1;

                    if (currentWidth + itemW <= containerWidth) {
                        if (i < items.length - 1) {
                            if (currentWidth + itemW + moreButtonWidth <= containerWidth) {
                                currentWidth += itemW;
                                newVisibleCount++;
                            } else {
                                break;
                            }
                        } else {
                            currentWidth += itemW;
                            newVisibleCount++;
                        }
                    } else {
                        break;
                    }
                }
                setVisibleCount(Math.max(1, newVisibleCount));
            }
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [items]);

    const visibleItems = items.slice(0, visibleCount);
    const overflowItems = items.slice(visibleCount);

    return (
        <div className={cn("relative w-full", className)}>
            {/* Hidden Ruler for Measurements */}
            <div
                ref={rulerRef}
                className="absolute top-0 left-0 w-max opacity-0 pointer-events-none flex items-center invisible"
                aria-hidden="true"
            >
                {items.map((item) => (
                    <div key={item.id} className="shrink-0 pr-2 border-r border-border mr-2 flex items-center">
                        {item.content}
                    </div>
                ))}
            </div>

            {/* Actual Toolbar */}
            <div
                ref={containerRef}
                className="flex items-center p-2 bg-card w-full overflow-hidden"
            >
                {visibleItems.map((item, index) => (
                    <div
                        key={item.id}
                        className={cn(
                            "shrink-0 flex items-center",
                            index < visibleItems.length - 1 && "pr-2 border-r border-border mr-2"
                        )}
                    >
                        {item.content}
                    </div>
                ))}

                {overflowItems.length > 0 && (
                    <div className="pl-1">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-80 p-3">
                                <div className="flex flex-col gap-3">
                                    {overflowItems.map(item => (
                                        <div key={item.id} className="flex flex-wrap gap-1 justify-start border-b border-border last:border-0 pb-3 last:pb-0 px-1">
                                            {item.content}
                                        </div>
                                    ))}
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </div>
        </div>
    );
}
