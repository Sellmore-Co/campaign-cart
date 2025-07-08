import { AddressConfig } from '../types/global';

export interface CountryConfig {
    stateLabel: string;
    stateRequired: boolean;
    postcodeLabel: string;
    postcodeRegex: string | null;
    postcodeMinLength: number;
    postcodeMaxLength: number;
    postcodeExample: string | null;
    currencyCode: string;
    currencySymbol: string;
}
export interface Country {
    code: string;
    name: string;
    phonecode: string;
    currencyCode: string;
    currencySymbol: string;
}
export interface State {
    code: string;
    name: string;
}
export interface LocationData {
    detectedCountryCode: string;
    detectedCountryConfig: CountryConfig;
    detectedStates: State[];
    countries: Country[];
}
export interface CountryStatesData {
    countryConfig: CountryConfig;
    states: State[];
}
export declare class CountryService {
    private static instance;
    private cachePrefix;
    private cacheExpiry;
    private baseUrl;
    private logger;
    private config;
    private constructor();
    static getInstance(): CountryService;
    /**
     * Set address configuration
     */
    setConfig(config: AddressConfig): void;
    /**
     * Get current configuration
     */
    getConfig(): AddressConfig;
    /**
     * Get location data with user's detected country and list of all countries
     */
    getLocationData(): Promise<LocationData>;
    /**
     * Get states for a specific country
     */
    getCountryStates(countryCode: string): Promise<CountryStatesData>;
    /**
     * Get country configuration by country code
     */
    getCountryConfig(countryCode: string): Promise<CountryConfig>;
    /**
     * Validate postal code based on country configuration
     */
    validatePostalCode(postalCode: string, _countryCode: string, countryConfig: CountryConfig): boolean;
    /**
     * Clear all cached data
     */
    clearCache(): void;
    /**
     * Clear cache for a specific country
     */
    clearCountryCache(countryCode: string): void;
    private getFromCache;
    private setCache;
    private getDefaultCountryConfig;
    private getFallbackLocationData;
    private applyCountryFiltering;
    private applyStateFiltering;
}
//# sourceMappingURL=countryService.d.ts.map