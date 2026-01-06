import { useEffect, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/shadui/input';
import { Combobox } from '@/components/shadui/combobox';
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from '@/components/shadui/form';
import { useStates, useCities, useZipcodes } from '@/hooks/location/useLocation';
import { useDebounce } from '@/hooks/useDebounce';
import { Globe, Map as MapIcon, Building2, Hash } from 'lucide-react'; // Fixed Map collision

// Standard list of countries (using ISO codes)
const COUNTRIES = [
    { value: 'ID', label: 'Indonesia' },
    { value: 'US', label: 'United States' },
    { value: 'SG', label: 'Singapore' },
    { value: 'MY', label: 'Malaysia' },
];

interface LocationFieldsProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: UseFormReturn<any>;
    fieldNames?: {
        country: string;
        state: string;
        city: string;
        postal_code: string;
    };
    defaultCountry?: string;
}

const defaultFieldNames = {
    country: 'country',
    state: 'state',
    city: 'city',
    postal_code: 'postal_code',
};

export function LocationFields({
    form,
    fieldNames = defaultFieldNames,
    defaultCountry = 'ID',
}: LocationFieldsProps) {
    const fields = { ...defaultFieldNames, ...fieldNames };

    // Watch values for cascading dropdowns
    const selectedCountry = form.watch(fields.country) || defaultCountry;
    const selectedState = form.watch(fields.state);
    const selectedCity = form.watch(fields.city);

    // City Search State
    const [citySearch, setCitySearch] = useState('');
    const debouncedCitySearch = useDebounce(citySearch, 500);

    // Manual Input States (Fallback)
    const [isManualState, setIsManualState] = useState(false);
    const [isManualCity, setIsManualCity] = useState(false);
    const [isManualZip, setIsManualZip] = useState(false);

    // --- Location Data Hooks ---

    // 1. States
    const { data: statesData, isLoading: isLoadingStates } = useStates(
        { country: selectedCountry, city: 'dummy' },
        !!selectedCountry
    );

    // Find the State Code based on the selected State Name
    const selectedStateObj = statesData?.states.find(s => s.name === selectedState);
    const selectedStateCode = selectedStateObj?.code;

    // 2. Cities
    const { data: citiesData, isLoading: isLoadingCities } = useCities(
        {
            country: selectedCountry,
            query: debouncedCitySearch,
            state: selectedStateCode
        },
        !!(selectedCountry && (debouncedCitySearch.length >= 2 || !!selectedStateCode))
    );

    // 3. Zipcodes
    // Try passing State NAME first as per log url, but fallback to logic
    const { data: zipcodesData, isLoading: isLoadingZipcodes } = useZipcodes(
        { country: selectedCountry, city: selectedCity, state: selectedState },
        !!(selectedCountry && selectedCity && selectedState)
    );

    const filteredCities = citiesData?.cities || [];

    // --- Reset Logic ---
    useEffect(() => {
        // Only reset if strict change happens, avoid loops
        // Logic removed for brevity in diff, keeping existing simple resets
    }, []);

    useEffect(() => {
        form.setValue(fields.state, '');
        form.setValue(fields.city, '');
        form.setValue(fields.postal_code, '');
        setIsManualState(false);
        setIsManualCity(false);
        setIsManualZip(false);
    }, [selectedCountry, fields.state, fields.city, fields.postal_code]); // removed form from dep

    useEffect(() => {
        form.setValue(fields.city, '');
        form.setValue(fields.postal_code, '');
        setIsManualCity(false);
        setIsManualZip(false);
        setCitySearch('');
    }, [selectedState, fields.city, fields.postal_code]);

    useEffect(() => {
        form.setValue(fields.postal_code, '');
        setIsManualZip(false);
    }, [selectedCity, fields.postal_code]);

    // --- Automatic Manual Fallback Logic ---
    useEffect(() => {
        if (!isLoadingStates && statesData && statesData.states.length === 0 && selectedCountry) {
            setIsManualState(true);
            setIsManualCity(true);
            setIsManualZip(true);
        }
    }, [isLoadingStates, statesData, selectedCountry]);

    useEffect(() => {
        if (!isLoadingCities && citiesData && citiesData.cities.length === 0 && selectedState && !isManualState) {
            setIsManualCity(true);
        }
    }, [isLoadingCities, citiesData, selectedState, isManualState]);

    useEffect(() => {
        if (!isLoadingZipcodes && zipcodesData && zipcodesData.zipcodes.length === 0 && selectedCity && !isManualCity) {
            setIsManualZip(true);
        }
    }, [isLoadingZipcodes, zipcodesData, selectedCity, isManualCity]);

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Country */}
                <FormField
                    control={form.control}
                    name={fields.country}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                                <Combobox
                                    options={COUNTRIES}
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Select Country"
                                    icon={Globe}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* State */}
                <FormField
                    control={form.control}
                    name={fields.state}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>State / Province</FormLabel>
                            <FormControl>
                                {isManualState ? (
                                    <div className="relative">
                                        <MapIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input placeholder="Enter state manually" {...field} className="pl-9" />
                                    </div>
                                ) : (
                                    <Combobox
                                        options={statesData?.states.map(s => ({ value: s.name, label: s.name })) || []}
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Select State"
                                        disabled={!selectedCountry}
                                        emptyMessage={isLoadingStates ? 'Loading...' : 'No states found.'}
                                        icon={MapIcon}
                                    />
                                )}
                            </FormControl>
                            <FormMessage />
                            {!isManualState && isLoadingStates && (
                                <span className="text-xs text-muted-foreground">Loading states...</span>
                            )}
                            {!isManualState && selectedCountry && !isLoadingStates && statesData?.states && statesData.states.length === 0 && (
                                <button
                                    type="button"
                                    className="text-xs text-primary hover:underline"
                                    onClick={() => setIsManualState(true)}
                                >
                                    State not listed? Enter manually.
                                </button>
                            )}
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* City */}
                <FormField
                    control={form.control}
                    name={fields.city}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                                {isManualCity ? (
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input placeholder="Enter city manually" {...field} className="pl-9" />
                                    </div>
                                ) : (
                                    <Combobox
                                        options={filteredCities.map((c, i) => ({ value: c.name, label: c.name, key: `${c.name}-${i}` }))}
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Select City"
                                        searchPlaceholder="Search city (min 2 chars)..."
                                        onSearchChange={setCitySearch}
                                        searchValue={citySearch}
                                        disabled={!selectedState}
                                        emptyMessage={
                                            isLoadingCities
                                                ? 'Searching...'
                                                : citySearch.length < 2
                                                    ? 'Type to search...'
                                                    : 'No cities found matching your state.'
                                        }
                                        icon={Building2}
                                    />
                                )}
                            </FormControl>
                            <FormMessage />
                            {!isManualCity && isLoadingCities && (
                                <span className="text-xs text-muted-foreground">Searching cities...</span>
                            )}
                            {!isManualCity && selectedState && !isLoadingCities && citySearch.length >= 2 && filteredCities.length === 0 && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    City not found?{' '}
                                    <button
                                        type="button"
                                        className="text-primary hover:underline"
                                        onClick={() => setIsManualCity(true)}
                                    >
                                        Enter manually
                                    </button>
                                </p>
                            )}
                        </FormItem>
                    )}
                />

                {/* Zipcode */}
                <FormField
                    control={form.control}
                    name={fields.postal_code}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>ZIP Code</FormLabel>
                            <FormControl>
                                {isManualZip ? (
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input placeholder="Enter ZIP Code" {...field} className="pl-9" />
                                    </div>
                                ) : (
                                    <Combobox
                                        // Fix for collision: generate unique key
                                        options={zipcodesData?.zipcodes.map((z, i) => ({
                                            value: z.code,
                                            label: `${z.code} - ${z.area}`,
                                            // Add an internal unique ID for the Combobox to use as key
                                            key: `${z.code}-${z.area}-${i}`
                                        })) || []}
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Select ZIP Code"
                                        disabled={!selectedCity}
                                        emptyMessage={isLoadingZipcodes ? 'Loading...' : 'No Zip Codes found.'}
                                        icon={Hash}
                                    />
                                )}
                            </FormControl>
                            <FormMessage />
                            {!isManualZip && isLoadingZipcodes && (
                                <span className="text-xs text-muted-foreground">Loading zip codes...</span>
                            )}
                            {!isManualZip && selectedCity && !isLoadingZipcodes && zipcodesData?.zipcodes.length === 0 && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Code not found?{' '}
                                    <button
                                        type="button"
                                        className="text-primary hover:underline"
                                        onClick={() => setIsManualZip(true)}
                                    >
                                        Enter manually
                                    </button>
                                </p>
                            )}
                        </FormItem>
                    )}
                />
            </div>
        </>
    );
}
