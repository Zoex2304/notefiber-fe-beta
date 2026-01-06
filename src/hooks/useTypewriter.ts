import { useState, useEffect, useRef } from 'react';

/**
 * A hook that types out text character by character.
 * Supports streaming updates (if text grows, it continues typing).
 * 
 * @param text The full text to display
 * @param speedMs Interval in ms between characters (default 20ms)
 * @param enabled Whether to animate or show immediately
 * @param onTyping Optional callback fired when typing state changes (for scroll sync)
 */
export function useTypewriter(
    text: string,
    speedMs: number = 10,
    enabled: boolean = true,
    onTyping?: (isTyping: boolean) => void
) {
    const [displayedText, setDisplayedText] = useState(enabled ? "" : text);
    const [isComplete, setIsComplete] = useState(!enabled);

    // We use a ref to track the current index without triggering re-renders
    const currentIndex = useRef(enabled ? 0 : text.length);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Initial sync for enabling/disabling
    useEffect(() => {
        if (!enabled) {
            setDisplayedText(text);
            currentIndex.current = text.length;
            setIsComplete(true);
        } else if (currentIndex.current === 0 && text.length > 0 && displayedText === "") {
            // Starting fresh
        }
    }, [enabled]);

    useEffect(() => {
        if (!enabled) return;

        const typeChar = () => {
            if (currentIndex.current < text.length) {
                // Determine step size to catch up if behind (e.g. large chunk came in)
                const distance = text.length - currentIndex.current;
                // Faster catchup if falling behind
                const step = distance > 50 ? 5 : distance > 20 ? 2 : 1;

                const nextChunk = text.slice(currentIndex.current, currentIndex.current + step);
                setDisplayedText(prev => prev + nextChunk);
                currentIndex.current += step;

                // Adjust speed based on lag? For now constant.
                timeoutRef.current = setTimeout(typeChar, speedMs);
                setIsComplete(false);
                onTyping?.(true); // Notify parent we're typing
            } else {
                setIsComplete(true);
                onTyping?.(false); // Notify parent typing complete
            }
        };

        // If we are idle and text grew, resume typing
        if (currentIndex.current < text.length && !timeoutRef.current) {
            typeChar();
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [text, speedMs, enabled]);

    // Safety: if text provided is smaller than current index (deletion/reset), reset index
    if (text.length < currentIndex.current) {
        currentIndex.current = text.length;
        setDisplayedText(text);
    }

    return { displayedText: enabled ? displayedText : text, isComplete };
}
