import { apiClient } from "@/api/client/axios.client";
import type { AiNuance, CreateAiNuanceRequest, UpdateAiNuanceRequest, AiNuanceOption } from "@/dto/ai";
import type { BaseResponse } from "@/dto/base-response";

// Admin Endpoints
export const getAiNuances = async () => {
    const response = await apiClient.get<BaseResponse<AiNuance[]>>("/admin/ai/nuances");
    return response.data;
};

export const createAiNuance = async (data: CreateAiNuanceRequest) => {
    const response = await apiClient.post<BaseResponse<AiNuance>>("/admin/ai/nuances", data);
    return response.data;
};

export const updateAiNuance = async (id: string, data: UpdateAiNuanceRequest) => {
    const response = await apiClient.put<BaseResponse<AiNuance>>(`/admin/ai/nuances/${id}`, data);
    return response.data;
};

export const deleteAiNuance = async (id: string) => {
    const response = await apiClient.delete<BaseResponse<null>>(`/admin/ai/nuances/${id}`);
    return response.data;
};

// Public/User Endpoint
export const getAvailableNuances = async () => {
    const response = await apiClient.get<BaseResponse<AiNuanceOption[]>>("/chatbot/v1/nuances");
    return response.data;
};
