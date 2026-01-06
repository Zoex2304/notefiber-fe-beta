import { X, FileText, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/shadui/badge";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/shadui/hover-card";
import { cn } from "@/lib/utils";

// =============================================================================
// Types
// =============================================================================

export type InputPillVariant = "mode" | "reference" | "default";

export interface InputPillProps {
    /** Display label */
    label: string;
    /** Visual variant */
    variant?: InputPillVariant;
    /** Optional icon override */
    icon?: LucideIcon;
    /** Optional hover description */
    description?: string;
    /** Remove handler */
    onRemove?: () => void;
    /** Additional class names */
    className?: string;
}

// =============================================================================
// Variant Styles
// =============================================================================

const variantStyles: Record<InputPillVariant, string> = {
    mode: "bg-purple-100 text-purple-700 border border-purple-200",
    reference: "bg-purple-50 text-purple-700 border border-purple-100",
    default: "bg-gray-100 text-gray-700 border border-gray-200",
};

// =============================================================================
// Component
// =============================================================================

/**
 * Reusable pill/tag component with optional hover card.
 * Follows AI Elements inline-citation pattern.
 * 
 * @example
 * <InputPill 
 *   label="bypass" 
 *   variant="mode" 
 *   onRemove={() => removeMode("bypass")} 
 * />
 */
export function InputPill({
    label,
    variant = "default",
    icon: Icon,
    description,
    onRemove,
    className,
}: InputPillProps) {
    const showIcon = variant === "reference" || Icon;
    const IconComponent = Icon || FileText;

    const pill = (
        <Badge
            variant="secondary"
            className={cn(
                "inline-flex items-center gap-1 px-2 py-1 rounded-md cursor-default",
                "text-xs font-medium whitespace-nowrap",
                "transition-colors hover:bg-accent group",
                variantStyles[variant],
                className
            )}
        >
            {showIcon && (
                <IconComponent className="h-3 w-3 opacity-70 shrink-0" />
            )}
            <span className="max-w-[120px] truncate">{label}</span>
            {onRemove && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onRemove();
                    }}
                    className="p-0.5 hover:bg-purple-200 rounded-full transition-colors opacity-70 group-hover:opacity-100"
                    aria-label={`Remove ${label}`}
                >
                    <X className="h-2.5 w-2.5" />
                </button>
            )}
        </Badge>
    );

    // Wrap with HoverCard if description provided
    if (description) {
        return (
            <HoverCard closeDelay={0} openDelay={200}>
                <HoverCardTrigger asChild>
                    {pill}
                </HoverCardTrigger>
                <HoverCardContent className="w-auto max-w-xs p-2" align="start">
                    <p className="text-sm text-muted-foreground">{description}</p>
                </HoverCardContent>
            </HoverCard>
        );
    }

    return pill;
}
