import {
    useRef,
    useEffect,
    useCallback,
    forwardRef,
    useImperativeHandle,
    KeyboardEvent,
    Fragment
} from "react";
import { X, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Note } from "@/types/note";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface InlineReference {
    id: string;
    title: string;
    type: "note" | "parameter";
}

export interface InlineSegment {
    type: "text" | "reference";
    content: string;
    reference?: InlineReference;
}

export interface InlineReferenceInputProps {
    /** Raw text value (without reference markers) */
    value: string;
    /** Inline references embedded in the content */
    references: InlineReference[];
    /** Handler for value changes */
    onChange: (value: string) => void;
    /** Handler for reference changes */
    onReferencesChange: (refs: InlineReference[]) => void;
    /** Key event handler (for parent to intercept) */
    onKeyDown?: (e: KeyboardEvent<HTMLDivElement>) => void;
    /** Placeholder text */
    placeholder?: string;
    /** Whether input is disabled */
    disabled?: boolean;
    /** Additional class names */
    className?: string;
}

export interface InlineReferenceInputHandle {
    focus: () => void;
    insertReference: (ref: InlineReference) => void;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

/**
 * InlineReferenceInput - A rich text-like input that seamlessly blends
 * reference pills with natural text flow.
 * 
 * Features:
 * - References appear inline, merging with surrounding text
 * - Maintains cursor position during reference insertion
 * - Backspace removes references naturally
 * - Extracts clean text + references for API submission
 */
export const InlineReferenceInput = forwardRef<
    InlineReferenceInputHandle,
    InlineReferenceInputProps
>(function InlineReferenceInput(
    {
        value,
        references,
        onChange,
        onReferencesChange,
        onKeyDown,
        placeholder = "Type your message...",
        disabled = false,
        className
    },
    ref
) {
    const containerRef = useRef<HTMLDivElement>(null);
    const isComposing = useRef(false);

    // -------------------------------------------------------------------------
    // Imperative Handle
    // -------------------------------------------------------------------------

    useImperativeHandle(ref, () => ({
        focus: () => containerRef.current?.focus(),
        insertReference: (newRef: InlineReference) => {
            // Add reference to the list
            onReferencesChange([...references, newRef]);

            // Insert marker at cursor position in text
            const marker = `[${newRef.title}]`;
            const selection = window.getSelection();

            if (containerRef.current && selection && selection.rangeCount > 0) {
                // For now, append to end of text
                onChange(value + marker + " ");
            } else {
                onChange(value + marker + " ");
            }

            // Refocus
            setTimeout(() => containerRef.current?.focus(), 0);
        }
    }));

    // -------------------------------------------------------------------------
    // Parse Content into Segments
    // -------------------------------------------------------------------------

    const parseSegments = useCallback((): InlineSegment[] => {
        if (!value && references.length === 0) return [];

        const segments: InlineSegment[] = [];
        const refMap = new Map(references.map(r => [`[${r.title}]`, r]));

        // Split text by reference markers [title]
        const parts = value.split(/(\[[^\]]+\])/g);

        parts.forEach(part => {
            if (!part) return;

            const matchedRef = refMap.get(part);
            if (matchedRef) {
                segments.push({
                    type: "reference",
                    content: matchedRef.title,
                    reference: matchedRef
                });
            } else {
                segments.push({
                    type: "text",
                    content: part
                });
            }
        });

        return segments;
    }, [value, references]);

    // -------------------------------------------------------------------------
    // Handle Input
    // -------------------------------------------------------------------------

    const handleInput = useCallback(() => {
        if (isComposing.current || !containerRef.current) return;

        const container = containerRef.current;
        let newValue = "";
        const remainingRefs: InlineReference[] = [];
        const refSet = new Set(references.map(r => r.id));

        // Walk through child nodes
        container.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                newValue += node.textContent || "";
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const el = node as HTMLElement;
                const refId = el.dataset.refId;

                if (refId && refSet.has(refId)) {
                    const ref = references.find(r => r.id === refId);
                    if (ref) {
                        remainingRefs.push(ref);
                        newValue += `[${ref.title}]`;
                    }
                } else {
                    // Unknown element, extract text
                    newValue += el.textContent || "";
                }
            }
        });

        onChange(newValue);
        onReferencesChange(remainingRefs);
    }, [references, onChange, onReferencesChange]);

    // -------------------------------------------------------------------------
    // Handle Key Events
    // -------------------------------------------------------------------------

    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
        // Pass to parent first
        onKeyDown?.(e);

        if (e.defaultPrevented) return;

        // Handle backspace on reference pill
        if (e.key === "Backspace") {
            const selection = window.getSelection();
            if (selection && selection.isCollapsed && selection.anchorNode) {
                // Check if cursor is right after a reference pill
                const node = selection.anchorNode;
                if (node.nodeType === Node.TEXT_NODE && selection.anchorOffset === 0) {
                    const prevSibling = node.previousSibling as HTMLElement | null;
                    if (prevSibling?.dataset?.refId) {
                        e.preventDefault();
                        const refId = prevSibling.dataset.refId;
                        onReferencesChange(references.filter(r => r.id !== refId));
                        prevSibling.remove();
                        handleInput();
                    }
                }
            }
        }
    }, [onKeyDown, references, onReferencesChange, handleInput]);

    // -------------------------------------------------------------------------
    // Handle Remove Reference
    // -------------------------------------------------------------------------

    const handleRemoveReference = useCallback((refId: string) => {
        onReferencesChange(references.filter(r => r.id !== refId));

        // Also remove from text value
        const ref = references.find(r => r.id === refId);
        if (ref) {
            const marker = `[${ref.title}]`;
            onChange(value.replace(marker, "").replace(/\s+/g, " ").trim());
        }
    }, [references, value, onChange, onReferencesChange]);

    // -------------------------------------------------------------------------
    // Render Segments
    // -------------------------------------------------------------------------

    const segments = parseSegments();
    const isEmpty = !value.trim() && references.length === 0;

    return (
        <div
            ref={containerRef}
            contentEditable={!disabled}
            suppressContentEditableWarning
            role="textbox"
            aria-placeholder={placeholder}
            aria-disabled={disabled}
            tabIndex={disabled ? -1 : 0}
            className={cn(
                "flex-1 min-h-[40px] max-h-[200px] overflow-y-auto",
                "py-2.5 px-2 text-sm outline-none",
                "whitespace-pre-wrap break-words",
                disabled && "opacity-50 cursor-not-allowed",
                className
            )}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => { isComposing.current = true; }}
            onCompositionEnd={() => {
                isComposing.current = false;
                handleInput();
            }}
        >
            {isEmpty ? (
                <span className="text-gray-400 pointer-events-none select-none">
                    {placeholder}
                </span>
            ) : (
                segments.map((segment, idx) => (
                    <Fragment key={idx}>
                        {segment.type === "text" ? (
                            segment.content
                        ) : (
                            <span
                                data-ref-id={segment.reference?.id}
                                contentEditable={false}
                                className={cn(
                                    "inline-flex items-center gap-1 mx-0.5 px-1.5 py-0.5 rounded-md",
                                    "bg-purple-100 text-purple-700 text-xs font-medium",
                                    "border border-purple-200",
                                    "select-none cursor-default",
                                    "align-baseline"
                                )}
                            >
                                <FileText className="h-3 w-3 opacity-70 shrink-0" />
                                <span className="max-w-[120px] truncate">
                                    {segment.content}
                                </span>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (segment.reference) {
                                            handleRemoveReference(segment.reference.id);
                                        }
                                    }}
                                    className="ml-0.5 p-0.5 hover:bg-purple-200 rounded-full transition-colors"
                                >
                                    <X className="h-2.5 w-2.5" />
                                </button>
                            </span>
                        )}
                    </Fragment>
                ))
            )}
        </div>
    );
});
