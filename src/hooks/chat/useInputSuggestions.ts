import { useState, useCallback, useMemo } from 'react';
import type { Note } from '@/types/note';

export interface SuggestionItem {
    id: string;
    label: string;
    subLabel?: string;
    type: 'command' | 'note';
    value: string; // The value to insert
}

export interface UseInputSuggestionsOptions {
    commands?: SuggestionItem[];
    notes?: Note[];
}

export function useInputSuggestions({ commands = [], notes = [] }: UseInputSuggestionsOptions) {
    const [showMenu, setShowMenu] = useState(false);
    const [filterString, setFilterString] = useState("");
    const [triggerChar, setTriggerChar] = useState<string | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    // Filter items based on trigger and filter string
    const filteredItems = useMemo(() => {
        if (!triggerChar) return [];

        const search = filterString.toLowerCase();

        if (triggerChar === '/') {
            return commands.filter(c =>
                c.label.toLowerCase().includes(search) ||
                c.subLabel?.toLowerCase().includes(search)
            );
        }

        if (triggerChar === '@') {
            return notes
                .filter(n => n.title.toLowerCase().includes(search))
                .map(n => ({
                    id: n.id,
                    label: n.title,
                    subLabel: "Note Reference",
                    type: 'note' as const,
                    value: `@notes:${n.id}` // Store ID for backend resolution
                }))
                .slice(0, 5); // Limit to 5 results
        }

        return [];
    }, [triggerChar, filterString, commands, notes]);

    // Process input
    const processInput = useCallback((input: string) => {
        const lastWord = input.split(/(\s+)/).pop() || "";

        if (lastWord.startsWith("/")) {
            setTriggerChar("/");
            setFilterString(lastWord.slice(1));
            setShowMenu(true);
            setActiveIndex(0);
        } else if (lastWord.startsWith("@")) {
            setTriggerChar("@");
            setFilterString(lastWord.slice(1));
            setShowMenu(true);
            setActiveIndex(0);
        } else {
            setShowMenu(false);
            setTriggerChar(null);
        }
    }, []);

    // Navigation
    const navigateDown = useCallback(() => {
        setActiveIndex(prev => Math.min(filteredItems.length - 1, prev + 1));
    }, [filteredItems.length]);

    const navigateUp = useCallback(() => {
        setActiveIndex(prev => Math.max(0, prev - 1));
    }, []);

    const closeMenu = useCallback(() => {
        setShowMenu(false);
        setFilterString("");
        setTriggerChar(null);
        setActiveIndex(0);
    }, []);

    return {
        showMenu,
        filteredItems,
        activeIndex,
        triggerChar,
        navigateDown,
        navigateUp,
        closeMenu,
        processInput
    };
}
