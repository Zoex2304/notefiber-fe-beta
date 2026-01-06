import { useState, useCallback } from 'react';

/**
 * Valid chat modes (commands that become pills)
 */
/**
 * Valid chat modes (commands that become pills)
 * allowing string for dynamic nuances
 */
export type ChatMode = string;

// We allow dynamic modes now, so no strict static list checks for adding.
// But we might want to know which are "system" commands vs nuances?
// For now, let's just treat everything added via addMode as a pill.

interface UseChatInputModesReturn {
    /** Currently active modes as pills */
    activeModes: ChatMode[];
    /** Add a mode to active modes */
    addMode: (mode: ChatMode) => void;
    /** Remove a mode from active modes */
    removeMode: (mode: ChatMode) => void;
    /** Remove the last added mode (for Backspace handling) */
    removeLastMode: () => void;
    /** Clear all active modes */
    clearModes: () => void;
    /** Check if a string is a valid mode command */
    isModeCommand: (cmd: string) => boolean;
    /** Build the final message content with mode prefix */
    buildMessageContent: (rawInput: string) => string;
    /** Extract mode from input text (for pasted content) */
    extractModeFromText: (text: string) => ChatMode | null;
}

/**
 * Hook to manage chat input mode pills.
 */
export function useChatInputModes(): UseChatInputModesReturn {
    const [activeModes, setActiveModes] = useState<ChatMode[]>([]);

    // Check if a command string is a mode command
    const isModeCommand = useCallback((cmd: string): boolean => {
        // Simple heuristic: starts with / is potentially a mode if passed here
        return cmd.startsWith("/");
    }, []);

    // Add a mode (from command like "/bypass" or clean like "bypass")
    const addMode = useCallback((mode: string) => {
        const cleanMode = mode.replace("/", "");

        setActiveModes(prev => {
            if (prev.includes(cleanMode)) return prev;
            return [...prev, cleanMode];
        });
    }, []);

    // Remove a specific mode
    const removeMode = useCallback((mode: ChatMode) => {
        setActiveModes(prev => prev.filter(m => m !== mode));
    }, []);

    // Remove the last mode (Backspace behavior)
    const removeLastMode = useCallback(() => {
        setActiveModes(prev => prev.slice(0, -1));
    }, []);

    // Clear all modes (after sending)
    const clearModes = useCallback(() => {
        setActiveModes([]);
    }, []);

    // Build final message content with mode prefix for backend
    const buildMessageContent = useCallback((rawInput: string): string => {
        if (activeModes.length === 0) return rawInput;

        // Prepend the first active mode as command
        return `/${activeModes[0]} ${rawInput}`;
    }, [activeModes]);

    // Extract mode from pasted/typed text (fallback detection)
    const extractModeFromText = useCallback((text: string): ChatMode | null => {
        // Simple extraction: if text starts with /, extract the first word as mode
        const match = text.match(/^\/(\w+)/);
        if (match) {
            return match[1];
        }
        return null;
    }, []);

    return {
        activeModes,
        addMode,
        removeMode,
        removeLastMode,
        clearModes,
        isModeCommand,
        buildMessageContent,
        extractModeFromText
    };
}
