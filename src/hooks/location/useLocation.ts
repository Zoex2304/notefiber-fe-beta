import { useQuery } from '@tanstack/react-query';
import { locationService } from '../../api/services/location/location.service';
import { type SearchCitiesParams, type GetStatesParams, type GetZipcodesParams, type CitiesResponse, type StatesResponse, type ZipcodesResponse } from '../../api/services/location/location.types';
import { type ApiError } from '../../api/types/error.types';

export const useCities = (params: SearchCitiesParams, enabled: boolean) => {
    return useQuery<CitiesResponse, ApiError>({
        queryKey: ['location', 'cities', params],
        queryFn: () => locationService.searchCities(params),
        enabled,
    });
};

export const useStates = (params: GetStatesParams, enabled: boolean) => {
    return useQuery<StatesResponse, ApiError>({
        queryKey: ['location', 'states', params],
        queryFn: () => locationService.getStates(params),
        enabled,
    });
};

export const useZipcodes = (params: GetZipcodesParams, enabled: boolean) => {
    return useQuery<ZipcodesResponse, ApiError>({
        queryKey: ['location', 'zipcodes', params],
        queryFn: () => locationService.getZipcodes(params),
        enabled,
    });
};
