import { useState, useCallback } from 'react';

interface NewSessionState {
    isOpen: boolean;
    pendingMessage: string;
    pendingMode: string;
}

interface UseNewSessionConfirmationReturn {
    /** Whether the confirmation modal is open */
    isOpen: boolean;
    /** The message waiting to be sent after confirmation */
    pendingMessage: string;
    /** The mode for the pending message */
    pendingMode: string;
    /** Request confirmation before creating new session */
    requestConfirmation: (message: string, mode: string) => void;
    /** User confirmed - proceed with new session */
    confirm: () => { message: string; mode: string };
    /** User cancelled - abort the operation */
    cancel: () => void;
    /** Close modal and reset state */
    reset: () => void;
}

const INITIAL_STATE: NewSessionState = {
    isOpen: false,
    pendingMessage: "",
    pendingMode: ""
};

/**
 * Hook to manage the "Create New Session" confirmation dialog flow.
 * Used when user tries to use bypass/nuance mode on a session with existing messages.
 */
export function useNewSessionConfirmation(): UseNewSessionConfirmationReturn {
    const [state, setState] = useState<NewSessionState>(INITIAL_STATE);

    // Request confirmation - opens modal and stores pending data
    const requestConfirmation = useCallback((message: string, mode: string) => {
        setState({
            isOpen: true,
            pendingMessage: message,
            pendingMode: mode
        });
    }, []);

    // User confirmed - return stored data for processing
    const confirm = useCallback(() => {
        const { pendingMessage, pendingMode } = state;
        setState(INITIAL_STATE);
        return { message: pendingMessage, mode: pendingMode };
    }, [state]);

    // User cancelled - reset without action
    const cancel = useCallback(() => {
        setState(INITIAL_STATE);
    }, []);

    // Explicit reset
    const reset = useCallback(() => {
        setState(INITIAL_STATE);
    }, []);

    return {
        isOpen: state.isOpen,
        pendingMessage: state.pendingMessage,
        pendingMode: state.pendingMode,
        requestConfirmation,
        confirm,
        cancel,
        reset
    };
}
