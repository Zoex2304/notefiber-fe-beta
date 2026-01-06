export interface AiConfiguration {
    id: string;
    key: string;
    value: string;
    value_type: "string" | "number" | "boolean" | "json";
    description: string;
    category: "rag" | "llm" | "bypass" | "nuance";
    updated_at: string;
}

export interface UpdateAiConfigurationRequest {
    value: string;
}

export interface AiNuance {
    id: string;
    key: string;
    name: string;
    description: string;
    system_prompt: string;
    model_override?: string;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface CreateAiNuanceRequest {
    key: string;
    name: string;
    description?: string;
    system_prompt: string;
    model_override?: string;
    sort_order?: number;
}

export interface UpdateAiNuanceRequest {
    name?: string;
    description?: string;
    system_prompt?: string;
    model_override?: string;
    is_active?: boolean;
    sort_order?: number;
}

// For autocomplete
export interface AiNuanceOption {
    key: string;
    name: string;
    description: string;
}
