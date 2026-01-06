import { apiClient } from "@/api/client/axios.client";
import type { AiConfiguration, UpdateAiConfigurationRequest } from "@/dto/ai";
import type { BaseResponse } from "@/dto/base-response";

export const getAiConfigurations = async () => {
    const response = await apiClient.get<BaseResponse<AiConfiguration[]>>("/admin/ai/configurations");
    return response.data;
};

export const updateAiConfiguration = async (key: string, data: UpdateAiConfigurationRequest) => {
    const response = await apiClient.put<BaseResponse<AiConfiguration>>(`/admin/ai/configurations/${key}`, data);
    return response.data;
};
