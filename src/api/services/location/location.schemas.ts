import { z } from 'zod';

export const countryResponseSchema = z.object({
    country: z.string(),
    country_name: z.string(),
});

export const citySchema = z.object({
    name: z.string(),
    state: z.string(),
    country: z.string(),
});

export const stateSchema = z.object({
    name: z.string(),
    code: z.string(),
    province: z.string(),
});

export const zipcodeSchema = z.object({
    code: z.string(),
    area: z.string(),
    country: z.string(),
});

// Search params
export const searchCitiesParamsSchema = z.object({
    country: z.string(),
    query: z.string().optional(),
    state: z.union([z.string(), z.number()]).optional(),
});

export const getStatesParamsSchema = z.object({
    country: z.string(),
    city: z.string(),
});

export const getZipcodesParamsSchema = z.object({
    country: z.string(),
    city: z.string(),
    state: z.string(),
});
