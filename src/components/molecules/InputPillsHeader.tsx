import { InputPill } from "@/components/atoms/InputPill";
import { cn } from "@/lib/utils";
import type { Note } from "@/types/note";

// =============================================================================
// Types
// =============================================================================

export interface InputPillsHeaderProps {
    /** Active mode pills to display */
    modes?: string[];
    /** Reference notes to display */
    references?: Note[];
    /** Handler when a mode is removed */
    onRemoveMode?: (mode: string) => void;
    /** Handler when a reference is removed */
    onRemoveReference?: (noteId: string) => void;
    /** Additional class names */
    className?: string;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Header section displaying mode pills and reference pills.
 * Follows AI Elements PromptInputHeader pattern.
 * 
 * @example
 * <InputPillsHeader
 *   modes={["bypass"]}
 *   references={[{ id: "1", title: "Note 1" }]}
 *   onRemoveMode={removeMode}
 *   onRemoveReference={removeReference}
 * />
 */
export function InputPillsHeader({
    modes = [],
    references = [],
    onRemoveMode,
    onRemoveReference,
    className,
}: InputPillsHeaderProps) {
    const hasPills = modes.length > 0 || references.length > 0;

    if (!hasPills) return null;

    return (
        <div
            className={cn(
                "flex flex-wrap items-center gap-2 p-3",
                "border-b border-gray-100 bg-gray-50/50",
                className
            )}
        >
            {/* Mode Pills */}
            {modes.map((mode) => (
                <InputPill
                    key={mode}
                    label={mode}
                    variant="mode"
                    onRemove={onRemoveMode ? () => onRemoveMode(mode) : undefined}
                    description={`${mode} mode - modifies how the AI responds`}
                />
            ))}

            {/* Reference Pills */}
            {references.map((note) => (
                <InputPill
                    key={note.id}
                    label={note.title}
                    variant="reference"
                    onRemove={onRemoveReference ? () => onRemoveReference(note.id) : undefined}
                    description={`Note reference: ${note.title}`}
                />
            ))}
        </div>
    );
}
