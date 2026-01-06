import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/api/client/axios.client";
import type { Note } from "@/types/note";
import type { BaseResponse } from "@/dto/base-response";
import type { ShowNoteResponse } from "@/dto/note";

export function useActiveNote(noteId?: string) {
    const [currentNote, setCurrentNote] = useState<Note | null>(null);
    const [isLoadingNote, setIsLoadingNote] = useState(true);
    const [noteError, setNoteError] = useState<string | null>(null);

    const fetchNote = useCallback(async (id: string) => {
        setIsLoadingNote(true);
        setNoteError(null);
        try {
            const response = await apiClient.get<BaseResponse<ShowNoteResponse>>(
                `/note/v1/${id}`
            );
            const noteData = response.data.data;
            const note: Note = {
                id: noteData.id,
                title: noteData.title,
                content: noteData.content,
                notebookId: noteData.notebook_id,
                breadcrumb: noteData.breadcrumb,
                createdAt: new Date(noteData.created_at),
                updatedAt: new Date(noteData.updated_at ?? noteData.created_at),
            };
            setCurrentNote(note);
            return note;
        } catch (error) {
            console.error("Failed to fetch note:", error);
            setNoteError("Note not found or you don't have permission to view it.");
            return null;
        } finally {
            setIsLoadingNote(false);
        }
    }, []);

    // Auto-fetch when noteId changes
    useEffect(() => {
        if (noteId) {
            fetchNote(noteId);
        } else {
            // Reset if no ID (e.g. at root)
            setCurrentNote(null);
            setIsLoadingNote(false);
            setNoteError(null);
        }
    }, [noteId, fetchNote]);

    return {
        currentNote,
        setCurrentNote,
        isLoadingNote,
        noteError,
        fetchNote
    };
}
