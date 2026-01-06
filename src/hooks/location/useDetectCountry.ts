import { useQuery } from '@tanstack/react-query';
import { locationService } from '../../api/services/location/location.service';
import { type DetectedCountry } from '../../api/services/location/location.types';
import { type ApiError } from '../../api/types/error.types';

export const useDetectCountry = (enabled = true) => {
    return useQuery<DetectedCountry, ApiError>({
        queryKey: ['location', 'detect-country'],
        queryFn: () => locationService.detectCountry(),
        enabled,
        staleTime: Infinity, // Country unlikely to change
    });
};
