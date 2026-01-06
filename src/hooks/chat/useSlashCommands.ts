import { useState, useCallback, useMemo } from 'react';

/**
 * Chat command configuration
 */
export interface ChatCommand {
    cmd: string;
    desc: string;
}

/**
 * Default chat commands available in the input
 */
export const CHAT_COMMANDS: ChatCommand[] = [
    { cmd: "/bypass", desc: "Skip RAG, pure LLM" },
    { cmd: "/nuance", desc: "Domain-specific context" }
];

interface UseSlashCommandsOptions {
    commands?: ChatCommand[];
}

interface UseSlashCommandsReturn {
    /** Whether to show the command menu */
    showMenu: boolean;
    /** Filtered commands based on current input */
    filteredCommands: ChatCommand[];
    /** Currently highlighted command index */
    activeIndex: number;
    /** The current filter string (e.g., "/byp") */
    filterString: string;
    /** Navigate to next command */
    navigateDown: () => void;
    /** Navigate to previous command */
    navigateUp: () => void;
    /** Set active index directly */
    setActiveIndex: (index: number) => void;
    /** Close the menu */
    closeMenu: () => void;
    /** Reset state when input changes */
    processInput: (input: string) => void;
}

/**
 * Hook to manage slash command suggestions and keyboard navigation.
 * Follows single responsibility: only handles command suggestion logic.
 */
export function useSlashCommands(
    options: UseSlashCommandsOptions = {}
): UseSlashCommandsReturn {
    const { commands = CHAT_COMMANDS } = options;

    const [showMenu, setShowMenu] = useState(false);
    const [filterString, setFilterString] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);

    // Filter commands based on current filter
    const filteredCommands = useMemo(() => {
        if (!filterString.startsWith("/")) return [];

        return commands.filter(c =>
            c.cmd.toLowerCase().startsWith(filterString.toLowerCase()) ||
            c.desc.toLowerCase().includes(filterString.toLowerCase())
        );
    }, [commands, filterString]);

    // Process input to detect slash commands
    const processInput = useCallback((input: string) => {
        const lastWord = input.split(/(\s+)/).pop() || "";

        if (lastWord.startsWith("/")) {
            setShowMenu(true);
            setFilterString(lastWord);
            setActiveIndex(0);
        } else {
            setShowMenu(false);
            setFilterString("");
        }
    }, []);

    // Navigation handlers
    const navigateDown = useCallback(() => {
        setActiveIndex(prev => Math.min(filteredCommands.length - 1, prev + 1));
    }, [filteredCommands.length]);

    const navigateUp = useCallback(() => {
        setActiveIndex(prev => Math.max(0, prev - 1));
    }, []);

    const closeMenu = useCallback(() => {
        setShowMenu(false);
        setFilterString("");
        setActiveIndex(0);
    }, []);

    return {
        showMenu,
        filteredCommands,
        activeIndex,
        filterString,
        navigateDown,
        navigateUp,
        setActiveIndex,
        closeMenu,
        processInput
    };
}
