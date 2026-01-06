/**
 * BulkActionsBar Component
 * 
 * Toolbar for bulk AI limit operations.
 * Shows when users are selected.
 */

import { Button } from '@admin/components/ui/button';
import { RotateCcw, Pencil, X } from 'lucide-react';

interface BulkActionsBarProps {
    selectedCount: number;
    onEditClick: () => void;
    onResetClick: () => void;
    onClearClick: () => void;
    isLoading: boolean;
}

export function BulkActionsBar({
    selectedCount,
    onEditClick,
    onResetClick,
    onClearClick,
    isLoading,
}: BulkActionsBarProps) {
    if (selectedCount === 0) return null;

    return (
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium">
                {selectedCount} user{selectedCount > 1 ? 's' : ''} selected
            </span>
            <div className="flex-1" />
            <Button
                variant="outline"
                size="sm"
                onClick={onEditClick}
                disabled={isLoading}
            >
                <Pencil className="h-4 w-4 mr-1" />
                Set Usage
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={onResetClick}
                disabled={isLoading}
            >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset (Set to 0)
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={onClearClick}
                disabled={isLoading}
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
}
