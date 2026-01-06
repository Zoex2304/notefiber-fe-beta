import { toast as sonnerToast, type ExternalToast } from 'sonner';
import { useToasterStore } from '@/stores/useToasterStore';
import { playNotificationSound } from '@/utils/sound';

/**
 * Custom hook logic for the toaster system.
 * Serves as a centralized controller for all toast notifications.
 */

// Helper to handle the side effects (Sound, Logging, etc.)
const dispatchToast = (
    action: () => string | number,
) => {
    // 1. Play Sound
    // Access store directly to avoid hook rules inside this utility function
    const { isSoundEnabled } = useToasterStore.getState();
    if (isSoundEnabled) {
        playNotificationSound();
    }

    // 2. Execute the Sonner action
    return action();
};

export const toaster = {
    // Basic
    message: (message: string | React.ReactNode, data?: ExternalToast) =>
        dispatchToast(() => sonnerToast.message(message, data)),

    // Variants
    success: (message: string | React.ReactNode, data?: ExternalToast) =>
        dispatchToast(() => sonnerToast.success(message, data)),

    error: (message: string | React.ReactNode, data?: ExternalToast) =>
        dispatchToast(() => sonnerToast.error(message, data)),

    info: (message: string | React.ReactNode, data?: ExternalToast) =>
        dispatchToast(() => sonnerToast.info(message, data)),

    warning: (message: string | React.ReactNode, data?: ExternalToast) =>
        dispatchToast(() => sonnerToast.warning(message, data)),

    // Utilities - Pass through provided by Sonner
    dismiss: (id?: string | number) => sonnerToast.dismiss(id),
    promise: <T>(promise: Promise<T> | (() => Promise<T>), data?: any) => {
        // For promise, we play sound on initiation? Or success? 
        // Typically promise toasts show a loading state first.
        playNotificationSound(); // Initial sound
        return sonnerToast.promise(promise, data);
    },

    // Default call (toast('message'))
    trigger: (message: string | React.ReactNode, data?: ExternalToast) =>
        dispatchToast(() => sonnerToast(message, data)),
};

// Hook for using the store in components if needed (e.g. settings)
export const useToaster = () => {
    const store = useToasterStore();
    return {
        ...store,
        toaster,
    };
};
