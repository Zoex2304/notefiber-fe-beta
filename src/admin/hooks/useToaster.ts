import { toast as sonnerToast, type ExternalToast } from 'sonner';

/**
 * Centralized toaster utility for admin namespace.
 * Mirrors the user namespace toaster API for consistency.
 * Admin namespace does not have notification sounds.
 */
export const toaster = {
    // Basic
    message: (message: string | React.ReactNode, data?: ExternalToast) =>
        sonnerToast.message(message, data),

    // Variants
    success: (message: string | React.ReactNode, data?: ExternalToast) =>
        sonnerToast.success(message, data),

    error: (message: string | React.ReactNode, data?: ExternalToast) =>
        sonnerToast.error(message, data),

    info: (message: string | React.ReactNode, data?: ExternalToast) =>
        sonnerToast.info(message, data),

    warning: (message: string | React.ReactNode, data?: ExternalToast) =>
        sonnerToast.warning(message, data),

    // Utilities
    dismiss: (id?: string | number) => sonnerToast.dismiss(id),
    promise: <T>(promise: Promise<T> | (() => Promise<T>), data?: Parameters<typeof sonnerToast.promise>[1]) =>
        sonnerToast.promise(promise, data),
};
