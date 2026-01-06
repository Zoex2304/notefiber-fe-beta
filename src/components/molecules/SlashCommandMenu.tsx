import { cn } from "@/lib/utils";
import type { ChatCommand } from "@/hooks/chat";

export interface SlashCommandMenuProps {
    /** List of commands to display */
    commands: ChatCommand[];
    /** Currently highlighted index */
    activeIndex: number;
    /** Handler when a command is selected */
    onSelect: (cmd: string) => void;
}

/**
 * Floating menu showing available slash commands.
 * Appears above the input when user types "/" in chat.
 */
export function SlashCommandMenu({
    commands,
    activeIndex,
    onSelect
}: SlashCommandMenuProps) {
    if (commands.length === 0) return null;

    return (
        <div className="absolute bottom-full left-4 mb-2 w-72 bg-white rounded-lg border border-gray-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 z-50">
            <div className="p-1">
                {/* Header */}
                <div className="px-2 py-1.5 text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <span>Commands</span>
                    <span className="text-[10px] uppercase tracking-wider">Tab to select</span>
                </div>

                {/* Command List */}
                {commands.map((cmd, index) => (
                    <button
                        key={cmd.cmd}
                        className={cn(
                            "w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors",
                            index === activeIndex
                                ? "bg-purple-50 text-royal-violet-base"
                                : "hover:bg-gray-50 text-gray-700"
                        )}
                        onClick={() => onSelect(cmd.cmd)}
                    >
                        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">
                            {cmd.cmd}
                        </code>
                        <span className="text-xs text-gray-500">{cmd.desc}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
