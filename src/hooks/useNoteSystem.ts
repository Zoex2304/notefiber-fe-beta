import { useState, useCallback } from "react";
import { apiClient } from "@/api/client/axios.client";
import type { Note } from "@/types/note";
import type { Notebook } from "@/types/notebook";
import type { BaseResponse } from "@/dto/base-response";
import type {
    MoveNotebookResponse,
    CreateNotebookRequest,
    CreateNotebookResponse,
    GetAllNotebookResponse,
    MoveNotebookRequest,
} from "@/dto/notebook";
import type {
    UpdateNoteResponse,
    CreateNoteRequest,
    CreateNoteResponse,
    UpdateNoteRequest,
    MoveNoteResponse,
    MoveNoteRequest,
} from "@/dto/note";

export function useNoteSystem() {
    const [notebooks, setNotebooks] = useState<Notebook[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);

    const fetchAllNotebooks = useCallback(async () => {
        const data = await apiClient.get<BaseResponse<GetAllNotebookResponse[]>>(
            `/notebook/v1`
        );

        const notebooksData = data.data.data ?? [];
        const mappedNotebooks = notebooksData.map((notebook) => ({
            id: notebook.id,
            name: notebook.name,
            parentId: notebook.parent_id,
            createdAt: new Date(notebook.created_at),
            updatedAt: new Date(notebook.updated_at ?? notebook.created_at),
        }));

        const mappedNotes = notebooksData.reduce<Note[]>((currentNotes, notebook) => {
            return [
                ...currentNotes,
                ...notebook.notes.map<Note>((n) => ({
                    id: n.id,
                    title: n.title,
                    content: n.content,
                    createdAt: new Date(n.created_at),
                    notebookId: notebook.id,
                    updatedAt: new Date(n.updated_at ?? n.created_at),
                })),
            ];
        }, []);

        setNotebooks(mappedNotebooks);
        setNotes(mappedNotes);
    }, []);

    const createNote = useCallback(async (request: CreateNoteRequest) => {
        const res = await apiClient.post<BaseResponse<CreateNoteResponse>>(
            `/note/v1`,
            request
        );
        await fetchAllNotebooks();
        return res.data.data;
    }, [fetchAllNotebooks]);

    const createNotebook = useCallback(async (request: CreateNotebookRequest) => {
        const res = await apiClient.post<BaseResponse<CreateNotebookResponse>>(
            `/notebook/v1`,
            request
        );
        await fetchAllNotebooks();
        return res.data.data;
    }, [fetchAllNotebooks]);

    const updateNote = useCallback(async (noteId: string, request: UpdateNoteRequest) => {
        const res = await apiClient.put<BaseResponse<UpdateNoteResponse>>(
            `/note/v1/${noteId}`,
            request
        );
        await fetchAllNotebooks();
        return res.data.data;
    }, [fetchAllNotebooks]);

    const deleteNote = useCallback(async (noteId: string) => {
        await apiClient.delete(`/note/v1/${noteId}`);
        await fetchAllNotebooks();
    }, [fetchAllNotebooks]);

    const deleteNotebook = useCallback(async (notebookId: string) => {
        await apiClient.delete(`/notebook/v1/${notebookId}`);
        await fetchAllNotebooks();
    }, [fetchAllNotebooks]);

    const moveNote = useCallback(async (noteId: string, request: MoveNoteRequest) => {
        // Optimistic update helper could go here, but for now we rely on fetchAllNotebooks
        // or we can allow the UI to handle the optimistic part via setNotes before calling this.
        // For simplicity relative to the original code, we keep the logic clean here.

        await apiClient.put<BaseResponse<MoveNoteResponse>>(
            `/note/v1/${noteId}/move`,
            request
        );
        await fetchAllNotebooks();
    }, [fetchAllNotebooks]);

    const moveNotebook = useCallback(async (notebookId: string, request: MoveNotebookRequest) => {
        await apiClient.put<BaseResponse<MoveNotebookResponse>>(
            `/notebook/v1/${notebookId}/move`,
            request
        );
        await fetchAllNotebooks();
    }, [fetchAllNotebooks]);

    // Helper to get recursive children
    const getAllChildNotebooks = useCallback((parentId: string): string[] => {
        // Let's implement a pure helper for this to avoid hook dependency/recursion complexity
        const getChildren = (currentNotebooks: Notebook[], pId: string): string[] => {
            const children = currentNotebooks.filter((nb) => nb.parentId === pId);
            const ids = [pId];
            children.forEach(child => {
                ids.push(...getChildren(currentNotebooks, child.id));
            });
            return ids;
        };

        return getChildren(notebooks, parentId);
    }, [notebooks]);


    return {
        notebooks,
        notes,
        setNotes, // Data setter exposed for optimistic UI updates
        fetchAllNotebooks,
        createNote,
        createNotebook,
        updateNote,
        deleteNote,
        deleteNotebook,
        moveNote,
        moveNotebook,
        getAllChildNotebooks
    };
}
