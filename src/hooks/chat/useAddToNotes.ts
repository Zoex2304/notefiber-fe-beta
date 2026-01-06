import { useState, useCallback } from 'react';
import { useNoteOrchestratorContext } from '@/contexts/NoteOrchestratorContext';
import { toaster } from '@/hooks/useToaster';

interface SaveToNotesData {
    content: string;
    suggestedTitle: string;
}

interface UseAddToNotesReturn {
    // Dialog state
    isOpen: boolean;
    openDialog: (data: SaveToNotesData) => void;
    closeDialog: () => void;

    // Data
    contentToSave: string;
    suggestedTitle: string;

    // Actions
    saveToExistingNotebook: (notebookId: string, title: string) => Promise<boolean>;
    saveToNewNotebook: (notebookName: string, noteTitle: string) => Promise<boolean>;

    // Loading state
    isSaving: boolean;
}

/**
 * Custom hook for "Save to Notes" feature.
 * Single responsibility: manage dialog state and note creation logic.
 */
export function useAddToNotes(): UseAddToNotesReturn {
    const { noteSystem } = useNoteOrchestratorContext();

    // Dialog state
    const [isOpen, setIsOpen] = useState(false);
    const [contentToSave, setContentToSave] = useState('');
    const [suggestedTitle, setSuggestedTitle] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const openDialog = useCallback((data: SaveToNotesData) => {
        setContentToSave(data.content);
        setSuggestedTitle(data.suggestedTitle);
        setIsOpen(true);
    }, []);

    const closeDialog = useCallback(() => {
        setIsOpen(false);
        setContentToSave('');
        setSuggestedTitle('');
    }, []);

    const saveToExistingNotebook = useCallback(async (notebookId: string, title: string): Promise<boolean> => {
        if (!contentToSave.trim() || !title.trim()) {
            toaster.error('Title and content are required');
            return false;
        }

        setIsSaving(true);
        try {
            await noteSystem.createNote({
                notebook_id: notebookId,
                title: title.trim(),
                content: contentToSave.trim(),
            });

            toaster.success('Note saved successfully!');
            closeDialog();
            return true;
        } catch (error) {
            console.error('Failed to save note:', error);
            toaster.error('Failed to save note');
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [contentToSave, noteSystem, closeDialog]);

    const saveToNewNotebook = useCallback(async (notebookName: string, noteTitle: string): Promise<boolean> => {
        if (!contentToSave.trim() || !noteTitle.trim() || !notebookName.trim()) {
            toaster.error('All fields are required');
            return false;
        }

        setIsSaving(true);
        try {
            // First create the notebook
            const newNotebook = await noteSystem.createNotebook({
                name: notebookName.trim(),
                parent_id: null, // Root level notebook
            });

            // Then create the note in the new notebook
            await noteSystem.createNote({
                notebook_id: newNotebook.id,
                title: noteTitle.trim(),
                content: contentToSave.trim(),
            });

            toaster.success('Note saved to new notebook!');
            closeDialog();
            return true;
        } catch (error) {
            console.error('Failed to create notebook/note:', error);
            toaster.error('Failed to save note');
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [contentToSave, noteSystem, closeDialog]);

    return {
        isOpen,
        openDialog,
        closeDialog,
        contentToSave,
        suggestedTitle,
        saveToExistingNotebook,
        saveToNewNotebook,
        isSaving,
    };
}
