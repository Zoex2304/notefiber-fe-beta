import { z } from 'zod';
import * as schemas from './location.schemas';

export type DetectedCountry = z.infer<typeof schemas.countryResponseSchema>;
export type City = z.infer<typeof schemas.citySchema>;
export type State = z.infer<typeof schemas.stateSchema>;
export type Zipcode = z.infer<typeof schemas.zipcodeSchema>;

export type SearchCitiesParams = z.infer<typeof schemas.searchCitiesParamsSchema>;
export type GetStatesParams = z.infer<typeof schemas.getStatesParamsSchema>;
export type GetZipcodesParams = z.infer<typeof schemas.getZipcodesParamsSchema>;

export interface CitiesResponse {
    country: string;
    cities: City[];
}

export interface StatesResponse {
    city: string;
    states: State[];
}

export interface ZipcodesResponse {
    city: string;
    state: string;
    zipcodes: Zipcode[];
}
