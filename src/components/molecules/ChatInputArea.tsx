import { Send } from "lucide-react";
import { Button } from "@/components/shadui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { SlidingButton } from "@/components/atoms/SlidingButton";
import { PrefixHelper } from "@/components/molecules/PrefixHelper";
import { SuggestionMenu } from "@/components/molecules/SuggestionMenu";
import { InputPillsHeader } from "@/components/molecules/InputPillsHeader";
import { useChatInputController } from "@/hooks/chat/useChatInputController";
import type { Note } from "@/types/note";

// =============================================================================
// Types
// =============================================================================

export interface ChatInputAreaProps {
    /** Current input value */
    value: string;
    /** Handler for input changes */
    onChange: (value: string) => void;
    /** Handler when message should be sent */
    onSend: (content: string) => void;
    /** Whether input is disabled (e.g., loading) */
    disabled?: boolean;
    /** Optional class name */
    className?: string;
    /** Available notes for autocomplete */
    notes: Note[];
}

// =============================================================================
// Component
// =============================================================================

/**
 * Chat input area following atomic design principles.
 * Pure orchestrator - all business logic lives in useChatInputController hook.
 * 
 * Structure:
 * - Header: InputPillsHeader (modes + references)
 * - Body: SlidingButton + Textarea + SendButton
 */
export function ChatInputArea({
    value,
    onChange,
    onSend,
    disabled = false,
    className,
    notes = []
}: ChatInputAreaProps) {
    const {
        textareaRef,
        canSend,
        shouldHideCommandButton,
        showMenu,
        filteredItems,
        activeIndex,
        activeModes,
        preloadedReferences,
        handleChange,
        handleKeyDown,
        handleSend,
        handlePrefixSelect,
        applySuggestion,
        removeMode,
        removeReference,
    } = useChatInputController({ value, onChange, onSend, notes });

    return (
        <div className={cn("p-4 border-t border-gray-200 bg-white shrink-0 relative", className)}>
            {/* Suggestion Menu */}
            {showMenu && (
                <SuggestionMenu
                    items={filteredItems}
                    activeIndex={activeIndex}
                    onSelect={applySuggestion}
                />
            )}

            {/* Input Container */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden focus-within:border-royal-violet-base focus-within:ring-1 focus-within:ring-royal-violet-base transition-all">
                {/* Pills Header */}
                <InputPillsHeader
                    modes={activeModes}
                    references={preloadedReferences}
                    onRemoveMode={removeMode}
                    onRemoveReference={removeReference}
                />

                {/* Input Body */}
                <div className="flex items-end gap-1 p-2">
                    {/* Command Button (slides when typing) */}
                    <SlidingButton hidden={shouldHideCommandButton}>
                        <PrefixHelper onSelect={handlePrefixSelect} />
                    </SlidingButton>

                    {/* Textarea */}
                    <Textarea
                        ref={textareaRef}
                        value={value}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask anything..."
                        className={cn(
                            "flex-1 min-w-[50px] min-h-[40px] max-h-[200px]",
                            "resize-none border-none shadow-none",
                            "focus-visible:ring-0 focus-visible:ring-offset-0",
                            "py-2 px-2 bg-transparent text-sm",
                            "placeholder:text-gray-400 overflow-y-auto"
                        )}
                        disabled={disabled}
                        rows={1}
                    />

                    {/* Send Button */}
                    <Button
                        size="icon"
                        onClick={handleSend}
                        disabled={!canSend || disabled}
                        className={cn(
                            "h-10 w-10 rounded-full transition-all shrink-0 self-end mb-0.5",
                            canSend
                                ? "bg-gradient-primary-violet text-white hover:opacity-90 shadow-md"
                                : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                        )}
                    >
                        <Send className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Disclaimer */}
            <div className="text-[10px] text-gray-400 text-center mt-2 font-medium">
                AI can make mistakes. Please verify important information.
            </div>
        </div>
    );
}
