export interface Citation {
    noteId: string;
    title: string;
}

export interface ResolvedReference {
    note_id: string;
    title: string;
    resolved: boolean;
    source_type?: "export" | "inline" | "autocomplete";
}

export interface Message {
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: Date
    citations?: Citation[]
    references?: ResolvedReference[]
    mode?: "rag" | "bypass" | "nuance"
    nuanceKey?: string
}

export interface ChatSession {
    id: string
    name: string
    messages: Message[]
    createdAt: Date
    updatedAt: Date
}