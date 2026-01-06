
import { useState, useCallback } from "react";

interface UseSidebarStateOptions {
    defaultCollapsed?: boolean;
    cookieName?: string;
}

export function useSidebarState({ defaultCollapsed = false, cookieName }: UseSidebarStateOptions = {}) {
    const [isCollapsed, setIsCollapsed] = useState(() => {
        if (typeof document !== "undefined" && cookieName) {
            return document.cookie.includes(`${cookieName}=true`);
        }
        return defaultCollapsed;
    });

    const toggle = useCallback(() => {
        setIsCollapsed((prev) => {
            const newState = !prev;
            if (cookieName) {
                document.cookie = `${cookieName}=${newState}; path=/; max-age=${60 * 60 * 24 * 365}`;
            }
            return newState;
        });
    }, [cookieName]);

    const setCollapsed = useCallback((collapsed: boolean) => {
        setIsCollapsed(collapsed);
        if (cookieName) {
            document.cookie = `${cookieName}=${collapsed}; path=/; max-age=${60 * 60 * 24 * 365}`;
        }
    }, [cookieName]);

    const expand = useCallback(() => setCollapsed(false), [setCollapsed]);
    const collapse = useCallback(() => setCollapsed(true), [setCollapsed]);

    return {
        isCollapsed,
        setIsCollapsed, // Expose raw setter if needing bypass persistence or specialized logic
        toggle,
        expand,
        collapse,
        setCollapsed
    };
}
