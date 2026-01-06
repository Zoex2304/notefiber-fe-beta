import { useState, useEffect } from 'react';
import { Loader2, FolderPlus, Save } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/shadui/dialog';
import { Button } from '@/components/shadui/button';
import { Input } from '@/components/shadui/input';
import { Label } from '@/components/shadui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/shadui/select';
import type { Notebook } from '@/types/notebook';

interface SaveToNotesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    suggestedTitle: string;
    notebooks: Notebook[];
    onSaveToExisting: (notebookId: string, title: string) => Promise<boolean>;
    onSaveToNew: (notebookName: string, noteTitle: string) => Promise<boolean>;
    isSaving: boolean;
}

type Mode = 'existing' | 'new';

/**
 * Dialog for saving AI response to notes.
 * Supports selecting existing notebook or creating new one.
 */
export function SaveToNotesDialog({
    open,
    onOpenChange,
    suggestedTitle,
    notebooks,
    onSaveToExisting,
    onSaveToNew,
    isSaving,
}: SaveToNotesDialogProps) {
    const [mode, setMode] = useState<Mode>('existing');
    const [title, setTitle] = useState('');
    const [selectedNotebook, setSelectedNotebook] = useState('');
    const [newNotebookName, setNewNotebookName] = useState('');

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            setTitle(suggestedTitle);
            setSelectedNotebook(notebooks[0]?.id || '');
            setNewNotebookName('');
            setMode('existing');
        }
    }, [open, suggestedTitle, notebooks]);

    const handleSave = async () => {
        if (mode === 'existing') {
            await onSaveToExisting(selectedNotebook, title);
        } else {
            await onSaveToNew(newNotebookName, title);
        }
    };

    const isValid = title.trim() && (
        mode === 'existing' ? selectedNotebook : newNotebookName.trim()
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Save className="h-5 w-5 text-purple-600" />
                        Save to Notes
                    </DialogTitle>
                    <DialogDescription>
                        Save this AI response as a note in your notebook.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Note Title */}
                    <div className="space-y-2">
                        <Label htmlFor="note-title">Note Title</Label>
                        <Input
                            id="note-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter note title..."
                            disabled={isSaving}
                        />
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant={mode === 'existing' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setMode('existing')}
                            disabled={isSaving}
                            className={mode === 'existing' ? 'bg-purple-600 hover:bg-purple-700' : ''}
                        >
                            Existing Notebook
                        </Button>
                        <Button
                            type="button"
                            variant={mode === 'new' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setMode('new')}
                            disabled={isSaving}
                            className={mode === 'new' ? 'bg-purple-600 hover:bg-purple-700' : ''}
                        >
                            <FolderPlus className="h-4 w-4 mr-1" />
                            New Notebook
                        </Button>
                    </div>

                    {/* Notebook Selection / Creation */}
                    {mode === 'existing' ? (
                        <div className="space-y-2">
                            <Label>Select Notebook</Label>
                            <Select
                                value={selectedNotebook}
                                onValueChange={setSelectedNotebook}
                                disabled={isSaving || notebooks.length === 0}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a notebook..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {notebooks.map((nb) => (
                                        <SelectItem key={nb.id} value={nb.id}>
                                            {nb.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {notebooks.length === 0 && (
                                <p className="text-xs text-amber-600">
                                    No notebooks found. Create a new one instead.
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label htmlFor="new-notebook">New Notebook Name</Label>
                            <Input
                                id="new-notebook"
                                value={newNotebookName}
                                onChange={(e) => setNewNotebookName(e.target.value)}
                                placeholder="Enter notebook name..."
                                disabled={isSaving}
                            />
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSaving}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || !isValid}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Save Note
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
