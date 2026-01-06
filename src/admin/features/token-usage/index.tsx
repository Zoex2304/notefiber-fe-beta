/**
 * Token Usage Feature - Main Page
 * 
 * Admin page for viewing and managing user AI token usage.
 * Integrates table, dialogs, and bulk actions.
 */

import { useSearch, useNavigate } from '@tanstack/react-router';
import { Main } from '@admin/components/layout/main';
import { TokenUsageTable } from './components/token-usage-table';
import { EditUsageDialog } from './components/edit-limit-dialog';
import { BulkActionsBar } from './components/bulk-actions-bar';
import { useTokenUsage } from './hooks/use-token-usage';
import { useAiLimitManagement } from './hooks/use-ai-limit-management';
import { Activity } from 'lucide-react';
import { NavigateFn } from '@admin/hooks/use-table-url-state';

// Define search params type locally or in types
interface TokenUsageSearchParams {
    page?: number;
    limit?: number;
    q?: string; // Query for email/name
}

export function TokenUsage() {
    const search = useSearch({ strict: false }) as TokenUsageSearchParams;
    const navigate = useNavigate();

    // Construct query params for API
    const queryParams = {
        page: search.page || 1,
        limit: search.limit || 20,
        // The service might not support 'q' yet, but we pass it anyway or filter client side.
        // For now, let's fetch data and let table handle filtering if API ignores 'q'
    };

    const { data: tokenUsage = [], isLoading } = useTokenUsage(queryParams);

    const {
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
    } = useAiLimitManagement();

    const handleBulkUpdate = async () => {
        // Simple prompt for now, consistent with v1.3.4 patch requirements
        const chatInput = window.prompt("Enter new CHAT usage (leave blank to skip):");
        const searchInput = window.prompt("Enter new SEARCH usage (leave blank to skip):");

        if (chatInput === null && searchInput === null) return; // Cancelled both

        const updates: { chat?: number; search?: number } = {};

        if (chatInput && chatInput.trim() !== "") {
            const val = parseInt(chatInput, 10);
            if (!isNaN(val) && val >= 0) updates.chat = val;
        }

        if (searchInput && searchInput.trim() !== "") {
            const val = parseInt(searchInput, 10);
            if (!isNaN(val) && val >= 0) updates.search = val;
        }

        if (Object.keys(updates).length > 0) {
            await bulkUpdateUsage(updates);
        }
    };

    return (
        <Main className="flex flex-1 flex-col gap-4 sm:gap-6">
            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Activity className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Token Usage</h2>
                        <p className="text-muted-foreground">
                            Monitor and manage AI usage across all users
                        </p>
                    </div>
                </div>
            </div>

            {/* Bulk Actions */}
            <BulkActionsBar
                selectedCount={selectedUsers.length}
                onEditClick={handleBulkUpdate}
                onResetClick={bulkResetUsage}
                onClearClick={clearSelection}
                isLoading={isUpdating}
            />

            {/* Table */}
            <TokenUsageTable
                data={tokenUsage}
                isLoading={isLoading}
                search={search as Record<string, unknown>}
                navigate={navigate as unknown as NavigateFn}
                selectedUsers={selectedUsers}
                onToggleSelection={toggleUserSelection}
                onSelectAll={() => selectAll(tokenUsage)}
                onClearSelection={clearSelection}
                onEditUser={openEditDialog}
                onResetUser={resetUsage}
            />

            {/* Edit Dialog */}
            <EditUsageDialog
                open={editDialog.open}
                onClose={closeEditDialog}
                user={editDialog.user}
                onSave={updateUsage}
                onReset={resetUsage}
                isLoading={isUpdating}
            />
        </Main>
    );
}
