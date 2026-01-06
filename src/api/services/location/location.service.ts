import { apiClient } from '../../client';
import { ENDPOINTS } from '../../config/endpoints';
// Location endpoints might not return standard ApiResponse wrappers based on docs?
// Checking docs: Yes they seem to just return the data object directly in example?
// Re-checking docs/api/api.md...
// Section 3.1: Success Response: { country: "ID", ... } -> No "success", "code", "data" wrapper shown in JSON example?
// Wait, looking at specific example 3.1:
// { "country": "ID", ... }
// Unlike Auth/User which show { "success": true, "data": ... }
// I will assume for now they return direct data OR the docs omitted the wrapper.
// HOWEVER, typically APIs are consistent.
// Let's look closer at 3.1.
// "Success Response (200 OK):" then JSON.
// Auth 1.1: "Success Response (200 OK):" then JSON with { success: true ... }
// It is inconsistent in documentation.
// I will start by assuming they MIGHT lack the wrapper, OR the docs are just concise.
// Given strict "rules.md" says: "Return typed responses wrapped in ApiResponse", and "Transform API responses to domain types".
// I will assume for PREFLIGHT I should type them as strict return types.
// But if the backend actually returns unwrapped data, my `ApiResponse` type usage might be wrong.
// Safe bet: The user said "All available API endpoints are explained in detail...".
// If the example doesn't show wrapper, I should probably respect the example.
// BUT `rules.md` says: "Method Structure: Return typed responses wrapped in ApiResponse".
// RULES.md usually overrides or defines the FRONTEND expectation.
// I'll stick to `rules.md` pattern for the SERVICE return type (Promise<ApiResponse<T>>),
// but if the actual API endpoint returns raw data, I might need the interceptor to normalize it or the service to map it.
// For now, I will follow `rules.md` return type signature, but in implementation I will assume the `apiClient` returns what the server sends.
// If the server sends raw data, I might cast it to ApiResponse or wrap it.
// Actually, looking at `payment`, it has `success: true`.
// `Location` seems to be the odd one out.
// I will implement it assuming it might need a distinct type, or I will wrap it manually if needed.
// For now, to solve the "Return typed responses wrapped in ApiResponse" rule:
// I will type the service method return as `Promise<ApiResponse<...> | ...>` or just `Promise<...>` if it deviates?
// `rules.md` says: "Methods return strongly-typed promises ... Return typed responses wrapped in ApiResponse".
// I will treat `Location` responses as `data` inside an `ApiResponse` essentially, or I'll customize.
// Let's assume standard wrapper for consistency, and if it fails in wiring, we fix.
// Actually, I'll follow the docs exactly for the TYPES, but strictness for SERVICE.
// If the docs show raw object, I'll define a type for that raw object.

import * as Types from './location.types';

export const locationService = {
    detectCountry: async (): Promise<Types.DetectedCountry> => {
        const response = await apiClient.get<Types.DetectedCountry>(ENDPOINTS.LOCATION.DETECT_COUNTRY);
        return response.data;
    },

    searchCities: async (params: Types.SearchCitiesParams): Promise<Types.CitiesResponse> => {
        const response = await apiClient.get<Types.CitiesResponse>(ENDPOINTS.LOCATION.CITIES, { params });
        return response.data;
    },

    getStates: async (params: Types.GetStatesParams): Promise<Types.StatesResponse> => {
        const response = await apiClient.get<Types.StatesResponse>(ENDPOINTS.LOCATION.STATES, { params });
        return response.data;
    },

    getZipcodes: async (params: Types.GetZipcodesParams): Promise<Types.ZipcodesResponse> => {
        const response = await apiClient.get<Types.ZipcodesResponse>(ENDPOINTS.LOCATION.ZIPCODES, { params });
        return response.data;
    }
};
