import { useRef, useEffect, useCallback, useMemo } from "react";
import { useChatInputModes } from "@/hooks/chat";
import { useChatStore } from "@/stores/useChatStore";
import { useNuances } from "@/hooks/chat/useNuances";
import { useInputSuggestions, type SuggestionItem } from "@/hooks/chat/useInputSuggestions";
import type { Note } from "@/types/note";

// =============================================================================
// Types
// =============================================================================

export interface UseChatInputControllerOptions {
    /** Current input value */
    value: string;
    /** Handler for input changes */
    onChange: (value: string) => void;
    /** Handler when message should be sent */
    onSend: (content: string) => void;
    /** Available notes for autocomplete */
    notes: Note[];
}

export interface ChatInputControllerReturn {
    // Refs
    textareaRef: React.RefObject<HTMLTextAreaElement | null>;

    // Derived State
    canSend: boolean;
    shouldHideCommandButton: boolean;
    hasPillsToShow: boolean;

    // Suggestion Menu State
    showMenu: boolean;
    filteredItems: SuggestionItem[];
    activeIndex: number;

    // Mode State
    activeModes: string[];

    // Reference State
    preloadedReferences: Note[];

    // Handlers
    handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    handleKeyDown: (e: React.KeyboardEvent) => void;
    handleSend: () => void;
    handlePrefixSelect: (prefix: string) => void;
    applySuggestion: (value: string) => void;
    removeMode: (mode: string) => void;
    removeReference: (noteId: string) => void;
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Consolidates all chat input logic into a single hook.
 * Manages text state, suggestions, modes, references, and keyboard navigation.
 * 
 * @example
 * const controller = useChatInputController({ value, onChange, onSend, notes });
 */
export function useChatInputController({
    value,
    onChange,
    onSend,
    notes,
}: UseChatInputControllerOptions): ChatInputControllerReturn {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    // External state
    const { preloadedReferences, setPreloadedReferences } = useChatStore();
    const { nuances } = useNuances();

    // ==========================================================================
    // Build Commands
    // ==========================================================================

    const commands: SuggestionItem[] = useMemo(() => {
        const staticCmds: SuggestionItem[] = [
            { id: 'bypass', label: '/bypass', subLabel: 'Skip RAG, pure LLM', type: 'command', value: '/bypass ' }
        ];

        const nuanceCmds: SuggestionItem[] = nuances.map(n => ({
            id: `nuance-${n.key}`,
            label: `/${n.key}`,
            subLabel: n.description,
            type: 'command',
            value: `/${n.key} `
        }));

        return [...staticCmds, ...nuanceCmds];
    }, [nuances]);

    // ==========================================================================
    // Input Suggestions
    // ==========================================================================

    const {
        showMenu,
        filteredItems,
        activeIndex,
        navigateDown,
        navigateUp,
        closeMenu,
        processInput
    } = useInputSuggestions({ commands, notes });

    // ==========================================================================
    // Mode Management
    // ==========================================================================

    const {
        activeModes,
        addMode,
        removeMode,
        removeLastMode,
        clearModes,
        buildMessageContent
    } = useChatInputModes();

    // ==========================================================================
    // Effects
    // ==========================================================================

    // Process input for suggestion triggers
    useEffect(() => {
        processInput(value);
    }, [value, processInput]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            if (value.trim()) {
                textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
            }
        }
    }, [value]);

    // Reset height on mount
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    }, []);

    // ==========================================================================
    // Handlers
    // ==========================================================================

    const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value);
    }, [onChange]);

    const applySuggestion = useCallback((applyValue: string) => {
        const parts = value.split(/(\s+)/);
        parts.pop();
        const baseValue = parts.join("");

        const trimmedValue = applyValue.trim();

        // Handle slash commands -> convert to pill
        if (trimmedValue.startsWith("/")) {
            const mode = trimmedValue.replace("/", "");
            addMode(mode);
            onChange(baseValue);
        }
        // Handle note references -> convert to pill
        else if (trimmedValue.startsWith("@notes:")) {
            const noteId = trimmedValue.replace("@notes:", "");
            const note = notes.find(n => n.id === noteId);
            if (note) {
                setPreloadedReferences([...preloadedReferences, note]);
            }
            onChange(baseValue);
        }
        // Handle other text
        else {
            onChange(baseValue + applyValue + " ");
        }

        closeMenu();
        textareaRef.current?.focus();
    }, [value, onChange, closeMenu, addMode, notes, preloadedReferences, setPreloadedReferences]);

    const handlePrefixSelect = useCallback((prefix: string) => {
        onChange(prefix + value);
        textareaRef.current?.focus();
    }, [value, onChange]);

    const handleSend = useCallback(() => {
        if (!value.trim() && activeModes.length === 0 && preloadedReferences.length === 0) return;

        const content = buildMessageContent(value);
        clearModes();
        onChange("");

        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        onSend(content);
    }, [value, activeModes.length, preloadedReferences.length, buildMessageContent, clearModes, onChange, setPreloadedReferences, onSend]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        // Menu navigation
        if (showMenu && filteredItems.length > 0) {
            if (e.key === "Tab" || e.key === "Enter") {
                e.preventDefault();
                applySuggestion(filteredItems[activeIndex].value);
                return;
            }
            if (e.key === "ArrowUp") {
                e.preventDefault();
                navigateUp();
                return;
            }
            if (e.key === "ArrowDown") {
                e.preventDefault();
                navigateDown();
                return;
            }
            if (e.key === "Escape") {
                e.preventDefault();
                closeMenu();
                return;
            }
        }

        // Backspace to remove last pill
        if (e.key === "Backspace" && value === "") {
            if (preloadedReferences.length > 0) {
                e.preventDefault();
                setPreloadedReferences(preloadedReferences.slice(0, -1));
                return;
            }
            if (activeModes.length > 0) {
                e.preventDefault();
                removeLastMode();
                return;
            }
        }

        // Enter to send
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }, [
        showMenu, filteredItems, activeIndex, value, activeModes.length,
        preloadedReferences.length, applySuggestion, navigateUp, navigateDown,
        closeMenu, removeLastMode, handleSend, setPreloadedReferences, preloadedReferences
    ]);

    const removeReference = useCallback((noteId: string) => {
        setPreloadedReferences(preloadedReferences.filter(r => r.id !== noteId));
    }, [preloadedReferences, setPreloadedReferences]);

    // ==========================================================================
    // Derived State
    // ==========================================================================

    const hasContent = value.trim().length > 0;
    const canSend = hasContent || activeModes.length > 0 || preloadedReferences.length > 0;
    const shouldHideCommandButton = hasContent || activeModes.length > 0 || preloadedReferences.length > 0;
    const hasPillsToShow = activeModes.length > 0 || preloadedReferences.length > 0;

    return {
        // Refs
        textareaRef,

        // Derived State
        canSend,
        shouldHideCommandButton,
        hasPillsToShow,

        // Suggestion Menu State
        showMenu,
        filteredItems,
        activeIndex,

        // Mode State
        activeModes,

        // Reference State
        preloadedReferences,

        // Handlers
        handleChange,
        handleKeyDown,
        handleSend,
        handlePrefixSelect,
        applySuggestion,
        removeMode,
        removeReference,
    };
}
