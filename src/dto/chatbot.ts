export interface GetAllSessionsResponse {
    id: string;
    title: string;
    created_at: Date;
    updated_at: Date | null;
}

export interface ResolvedReferenceDTO {
    note_id: string;
    title: string;
    resolved: boolean;
}

export interface GetChatHistoryResponse {
    id: string;
    role: string;
    chat: string;
    created_at: Date;
    citations?: CitationResponse[];
    references?: ResolvedReferenceDTO[];
    mode?: "rag" | "bypass" | "nuance";
    nuance_key?: string;
}

export interface CreateSessionResponse {
    id: string;
}

export interface DeleteSessionRequest {
    chat_session_id: string;
}

export interface NoteReferenceDTO {
    note_id: string;
    source_type: "export" | "inline" | "autocomplete";
}

export interface SendChatRequest {
    chat_session_id: string;
    chat: string;
    references?: NoteReferenceDTO[];
}

export interface CitationResponse {
    note_id: string;
    title: string;
}

export interface SendChatResponseChat {
    id: string;
    chat: string;
    role: string;
    created_at: Date;
    citations?: CitationResponse[];
    references?: ResolvedReferenceDTO[];
}

export interface SendChatResponse {
    chat_session_id: string;
    title: string;
    sent: SendChatResponseChat;
    reply: SendChatResponseChat;
    mode?: "rag" | "bypass" | "nuance";
    nuance_key?: string;
}