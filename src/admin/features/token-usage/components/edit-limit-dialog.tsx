/**
 * EditUsageDialog Component
 * 
 * Dialog for editing a single user's AI daily usage.
 * Pure UI component - receives state via props.
 */

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@admin/components/ui/dialog';
import { Button } from '@admin/components/ui/button';
import { Input } from '@admin/components/ui/input';
import { Label } from '@admin/components/ui/label';
import { Loader2, AlertTriangle } from 'lucide-react';
import type { TokenUsageItem } from '../types';

interface EditUsageDialogProps {
    open: boolean;
    onClose: () => void;
    user: TokenUsageItem | null;
    onSave: (userId: string, usage: { chat?: number; search?: number }) => Promise<void>;
    onReset: (userId: string) => Promise<void>;
    isLoading: boolean;
}

export function EditUsageDialog({
    open,
    onClose,
    user,
    onSave,
    onReset,
    isLoading,
}: EditUsageDialogProps) {
    const [chatUsage, setChatUsage] = useState('0');
    const [searchUsage, setSearchUsage] = useState('0');
    const [error, setError] = useState<string | null>(null);

    // Initialize from user's current usage
    useEffect(() => {
        if (user) {
            setChatUsage(String(user.ai_chat_daily_usage ?? 0));
            setSearchUsage(String(user.semantic_search_daily_usage ?? 0));
            setError(null);
        }
    }, [user, open]);

    const validate = (chatVal: number, searchVal: number): boolean => {
        if (!user) return false;

        if (isNaN(chatVal) || chatVal < 0) {
            setError("Chat usage must be a positive number");
            return false;
        }
        if (isNaN(searchVal) || searchVal < 0) {
            setError("Search usage must be a positive number");
            return false;
        }

        // Limit Checks
        if (user.ai_chat_daily_limit !== -1 && chatVal > user.ai_chat_daily_limit) {
            setError(`Chat usage exceeds limit of ${user.ai_chat_daily_limit}`);
            return false;
        }

        if (user.semantic_search_daily_limit !== -1 && searchVal > user.semantic_search_daily_limit) {
            setError(`Search usage exceeds limit of ${user.semantic_search_daily_limit}`);
            return false;
        }

        setError(null);
        return true;
    };

    const handleSave = async () => {
        if (!user) return;
        const cVal = parseInt(chatUsage, 10);
        const sVal = parseInt(searchUsage, 10);

        if (!validate(cVal, sVal)) return;

        // Send both
        await onSave(user.user_id, { chat: cVal, search: sVal });
    };

    const handleReset = async () => {
        if (!user) return;
        await onReset(user.user_id);
    };

    if (!user) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit AI Usage</DialogTitle>
                    <DialogDescription>
                        Adjust usage counters for <strong>{user.email}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-6">
                    {/* Chat Usage Section */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold">Chat Usage</Label>
                        <div className="p-3 bg-muted rounded-md text-sm flex justify-between">
                            <span>Limit: <strong>{user.ai_chat_daily_limit === -1 ? 'Unlimited' : user.ai_chat_daily_limit}</strong></span>
                            <span>Current: <strong>{user.ai_chat_daily_usage}</strong></span>
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="chatUsage">Set Chat Count</Label>
                            <Input
                                id="chatUsage"
                                type="number"
                                min="0"
                                value={chatUsage}
                                onChange={(e) => {
                                    setChatUsage(e.target.value);
                                    setError(null);
                                }}
                            />
                        </div>
                    </div>

                    {/* Search Usage Section */}
                    <div className="space-y-3 pt-2 border-t">
                        <Label className="text-base font-semibold">Semantic Search Usage</Label>
                        <div className="p-3 bg-muted rounded-md text-sm flex justify-between">
                            <span>Limit: <strong>{user.semantic_search_daily_limit === -1 ? 'Unlimited' : user.semantic_search_daily_limit}</strong></span>
                            <span>Current: <strong>{user.semantic_search_daily_usage}</strong></span>
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="searchUsage">Set Search Count</Label>
                            <Input
                                id="searchUsage"
                                type="number"
                                min="0"
                                value={searchUsage}
                                onChange={(e) => {
                                    setSearchUsage(e.target.value);
                                    setError(null);
                                }}
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-destructive flex items-center mt-1">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {error}
                        </p>
                    )}
                </div>

                <DialogFooter className="flex justify-between sm:justify-between">
                    <Button
                        variant="secondary"
                        onClick={handleReset}
                        disabled={isLoading}
                        className="mr-auto"
                        type="button"
                    >
                        Reset All (0)
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose} disabled={isLoading} type="button">
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isLoading || !!error} type="button">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
