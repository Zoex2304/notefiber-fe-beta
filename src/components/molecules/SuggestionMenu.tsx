import { cn } from "@/lib/utils";
import { FileText, Command } from "lucide-react";
import type { SuggestionItem } from "@/hooks/chat/useInputSuggestions";

export interface SuggestionMenuProps {
    /** List of suggestions to display */
    items: SuggestionItem[];
    /** Currently highlighted index */
    activeIndex: number;
    /** Handler when an item is selected */
    onSelect: (value: string) => void;
}

/**
 * Floating menu showing available suggestions (slash commands or mentions).
 * Appears above the input when user types "/" or "@" in chat.
 */
export function SuggestionMenu({
    items,
    activeIndex,
    onSelect
}: SuggestionMenuProps) {
    if (items.length === 0) return null;

    // Determine type from first item for header
    const type = items[0].type;
    const title = type === 'command' ? "Commands" : "Notes";
    const subTitle = type === 'command' ? "Tab to select" : "Enter to select";

    return (
        <div className="absolute bottom-full left-4 mb-2 w-72 bg-white rounded-lg border border-gray-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 z-50 max-h-[300px] overflow-y-auto">
            <div className="p-1">
                {/* Header */}
                <div className="px-2 py-1.5 text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-100 flex items-center justify-between sticky top-0">
                    <span>{title}</span>
                    <span className="text-[10px] uppercase tracking-wider">{subTitle}</span>
                </div>

                {/* List */}
                {items.map((item, index) => (
                    <button
                        key={item.id}
                        className={cn(
                            "w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors",
                            index === activeIndex
                                ? "bg-purple-50 text-royal-violet-base"
                                : "hover:bg-gray-50 text-gray-700"
                        )}
                        onClick={() => onSelect(item.value)}
                    >
                        {item.type === 'command' ? (
                            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono shrink-0">
                                {item.label}
                            </code>
                        ) : (
                            <FileText className="h-3.5 w-3.5 shrink-0 opacity-70" />
                        )}

                        <div className="flex flex-col min-w-0">
                            <span className={cn("truncate font-medium", item.type === 'command' && "hidden")}>
                                {item.label}
                            </span>
                            <span className="text-xs text-gray-500 truncate">
                                {item.subLabel}
                            </span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
