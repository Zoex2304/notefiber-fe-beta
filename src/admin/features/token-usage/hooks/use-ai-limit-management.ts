/**
 * useAiLimitManagement Hook
 * 
 * Custom hook for AI limit management state and actions.
 * Single responsibility: Orchestrates API calls and UI state.
 */

import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toaster } from '@admin/hooks/useToaster';
import { aiLimitService } from '../services/ai-limit.service';
import type { TokenUsageItem, UpdateAiLimitResponse } from '../types';
import type { WebSocketMessage } from '@admin/lib/api/websocket-client';

interface UseAiLimitManagementResult {
    selectedUsers: string[];
    toggleUserSelection: (userId: string) => void;
    selectAll: (users: TokenUsageItem[]) => void;
    clearSelection: () => void;
    updateUsage: (userId: string, usage: { chat?: number; search?: number }) => Promise<void>;
    resetUsage: (userId: string) => Promise<void>;
    bulkUpdateUsage: (usage: { chat?: number; search?: number }) => Promise<void>;
    bulkResetUsage: () => Promise<void>;
    isUpdating: boolean;
    editDialog: { open: boolean; user: TokenUsageItem | null };
    openEditDialog: (user: TokenUsageItem) => void;
    closeEditDialog: () => void;
    bulkDialog: { open: boolean };
    openBulkDialog: () => void;
    closeBulkDialog: () => void;
}

export function useAiLimitManagement(): UseAiLimitManagementResult {
    const queryClient = useQueryClient();

    // Selection state
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

    // Dialog states
    const [editDialog, setEditDialog] = useState<{ open: boolean; user: TokenUsageItem | null }>({
        open: false,
        user: null,
    });
    const [bulkDialog, setBulkDialog] = useState({ open: false });

    // Query key prefix for all token usage queries
    const queryKeyPrefix = ['admin', 'token-usage'];

    // ========== Helper: Update Cache ==========
    const updateUserInCache = useCallback((
        userId: string,
        updates: { chat?: number; search?: number },
        remaining?: number
    ) => {
        // Update all queries starting with the prefix (handles pagination keys)
        queryClient.setQueriesData({ queryKey: queryKeyPrefix }, (oldData: TokenUsageItem[] | undefined) => {
            if (!oldData) return oldData;

            return oldData.map(user => {
                if (user.user_id === userId) {
                    const updatedUser = { ...user };

                    if (updates.chat !== undefined) updatedUser.ai_chat_daily_usage = updates.chat;
                    if (updates.search !== undefined) updatedUser.semantic_search_daily_usage = updates.search;

                    // Update remaining based on backend response or local calc
                    if (remaining !== undefined) {
                        updatedUser.ai_daily_remaining = remaining;
                    }
                    return updatedUser;
                }
                return user;
            });
        });
    }, [queryClient]);

    // ========== Selection Handlers ==========
    const toggleUserSelection = useCallback((userId: string) => {
        setSelectedUsers(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
    }, []);

    const selectAll = useCallback((users: TokenUsageItem[]) => {
        setSelectedUsers(users.map(u => u.user_id));
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedUsers([]);
    }, []);

    // ========== Dialog Handlers ==========
    const openEditDialog = useCallback((user: TokenUsageItem) => {
        setEditDialog({ open: true, user });
    }, []);

    const closeEditDialog = useCallback(() => {
        setEditDialog({ open: false, user: null });
    }, []);

    const openBulkDialog = useCallback(() => {
        setBulkDialog({ open: true });
    }, []);

    const closeBulkDialog = useCallback(() => {
        setBulkDialog({ open: false });
    }, []);

    // ========== Mutations ==========
    const updateMutation = useMutation({
        mutationFn: ({ userId, usage }: { userId: string; usage: { chat?: number; search?: number } }) =>
            aiLimitService.updateUserUsage(userId, usage),
        onSuccess: (data) => {
            toaster.success(`AI usage updated for ${data.user_email}`);
            // Optimistic update
            updateUserInCache(
                data.user_id,
                { chat: data.new_chat_usage, search: data.new_semantic_search_usage },
                data.ai_daily_remaining
            );
            closeEditDialog();
        },
        onError: () => {
            toaster.error('Failed to update AI usage');
        },
    });

    const resetMutation = useMutation({
        mutationFn: (userId: string) => aiLimitService.resetUserUsage(userId),
        onSuccess: (data) => {
            toaster.success('AI usage reset to 0');
            // Assuming reset sets both to 0 if 0 is not provided
            // Or response contains strict new values.
            // If new_chat_usage is undefined, it might mean unchanged?
            // But reset typically resets ALL.
            // I'll rely on response data.
            updateUserInCache(
                data.user_id,
                { chat: data.new_chat_usage, search: data.new_semantic_search_usage },
                data.ai_daily_remaining
            );
        },
        onError: () => {
            toaster.error('Failed to reset AI usage');
        },
    });

    const bulkUpdateMutation = useMutation({
        mutationFn: (usage: { chat?: number; search?: number }) => aiLimitService.bulkUpdateUsage(selectedUsers, usage),
        onSuccess: (data) => {
            toaster.success(`Updated usage for ${data.total_updated} users`);
            if (data.failed_user_ids.length > 0) {
                toaster.warning(`Failed for ${data.failed_user_ids.length} users`);
            }
            queryClient.invalidateQueries({ queryKey: queryKeyPrefix });
            clearSelection();
            closeBulkDialog();
        },
        onError: () => {
            toaster.error('Bulk update failed');
        },
    });

    const bulkResetMutation = useMutation({
        mutationFn: () => aiLimitService.bulkResetUsage(selectedUsers),
        onSuccess: (data) => {
            toaster.success(`Reset usage for ${data.total_updated} users`);
            queryClient.invalidateQueries({ queryKey: queryKeyPrefix });
            clearSelection();
        },
        onError: () => {
            toaster.error('Bulk reset failed');
        },
    });

    // ========== WebSocket Sync ==========
    useEffect(() => {
        const handleAdminNotification = (event: Event) => {
            const customEvent = event as CustomEvent<WebSocketMessage>;
            const message = customEvent.detail;

            if (message.data.type_code === 'AI_LIMIT_UPDATED' && message.data.metadata) {
                // Parse new schema
                const metadata = message.data.metadata as Record<string, unknown>;
                const {
                    user_id,
                    new_chat_usage,
                    new_semantic_search_usage,
                    ai_daily_remaining
                } = metadata;

                if (typeof user_id === 'string') {
                    updateUserInCache(
                        user_id,
                        {
                            chat: typeof new_chat_usage === 'number' ? new_chat_usage : undefined,
                            search: typeof new_semantic_search_usage === 'number' ? new_semantic_search_usage : undefined
                        },
                        typeof ai_daily_remaining === 'number' ? ai_daily_remaining : undefined
                    );
                }
            }
        };

        window.addEventListener('admin:notification', handleAdminNotification);
        return () => window.removeEventListener('admin:notification', handleAdminNotification);
    }, [updateUserInCache]);

    // ========== Action Wrappers ==========
    const updateUsage = useCallback(async (userId: string, usage: { chat?: number; search?: number }) => {
        await updateMutation.mutateAsync({ userId, usage });
    }, [updateMutation]);

    const resetUsage = useCallback(async (userId: string) => {
        await resetMutation.mutateAsync(userId);
    }, [resetMutation]);

    const bulkUpdateUsage = useCallback(async (usage: { chat?: number; search?: number }) => {
        await bulkUpdateMutation.mutateAsync(usage);
    }, [bulkUpdateMutation]);

    const bulkResetUsage = useCallback(async () => {
        await bulkResetMutation.mutateAsync();
    }, [bulkResetMutation]);

    const isUpdating =
        updateMutation.isPending ||
        resetMutation.isPending ||
        bulkUpdateMutation.isPending ||
        bulkResetMutation.isPending;

    return {
        selectedUsers,
        toggleUserSelection,
        selectAll,
        clearSelection,
        updateUsage,
        resetUsage,
        bulkUpdateUsage,
        bulkResetUsage,
        isUpdating,
        editDialog,
        openEditDialog,
        closeEditDialog,
        bulkDialog,
        openBulkDialog,
        closeBulkDialog,
    };
}
