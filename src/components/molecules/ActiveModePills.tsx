import { X } from "lucide-react";
import type { ChatMode } from "@/hooks/chat";

export interface ActiveModePillsProps {
    /** Currently active modes */
    modes: ChatMode[];
    /** Handler to remove a mode */
    onRemove: (mode: ChatMode) => void;
}

/**
 * Displays active chat mode pills with remove buttons.
 * Shows bypass/nuance modes as interactive tags in the input area.
 */
export function ActiveModePills({ modes, onRemove }: ActiveModePillsProps) {
    if (modes.length === 0) return null;

    return (
        <>
            {modes.map(mode => (
                <div
                    key={mode}
                    className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-md text-xs font-medium animate-in zoom-in-50 duration-200"
                >
                    <span>{mode}</span>
                    <button
                        onClick={() => onRemove(mode)}
                        className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                        aria-label={`Remove ${mode} mode`}
                    >
                        <X className="h-3 w-3" />
                    </button>
                </div>
            ))}
        </>
    );
}
