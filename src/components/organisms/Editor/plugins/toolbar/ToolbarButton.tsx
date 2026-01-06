import { Button } from "@/components/shadui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/shadui/tooltip";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface ToolbarButtonProps {
    onClick: () => void;
    icon: LucideIcon;
    label: string;
    isActive?: boolean;
    disabled?: boolean;
}

export const ToolbarButton = ({ onClick, icon: Icon, label, isActive, disabled }: ToolbarButtonProps) => (
    <Tooltip>
        <TooltipTrigger asChild>
            <Button
                variant="ghost"
                size="sm"
                onClick={onClick}
                className={cn(
                    "h-8 w-8 p-0 hover:bg-muted",
                    isActive && "bg-muted text-foreground"
                )}
                type="button"
                disabled={disabled}
            >
                <Icon className="h-4 w-4" />
                <span className="sr-only">{label}</span>
            </Button>
        </TooltipTrigger>
        <TooltipContent>
            <p>{label}</p>
        </TooltipContent>
    </Tooltip>
);
