import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ValueCardProps {
    title: string;
    description: string;
    icon: ReactNode;
    className?: string;
}

export function ValueCard({ title, description, icon, className }: ValueCardProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-start gap-4 p-6 lg:p-8 rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow",
                className
            )}
        >
            <div className="mb-2">
                {icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>
    );
}
