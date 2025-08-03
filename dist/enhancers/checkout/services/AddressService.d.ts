import { Country, CountryConfig } from '../../../utils/countryService';
import { Logger } from '../../../utils/logger';
import { AddressFields } from '../types';
interface AddressComponent {
    types: string[];
    long_name: string;
    short_name: string;
}
interface PlaceResult {
    address_components?: AddressComponent[];
    formatted_address?: string;
}
export declare class AddressService {
    private logger;
    private eventBus;
    private form;
    private fields;
    private billingFields;
    private countryService;
    private countries;
    private countryConfigs;
    private currentCountryConfig?;
    private autocompleteInstances;
    private addressFields;
    private locationElements;
    private fieldsShown;
    private enableAutocomplete;
    constructor(form: HTMLFormElement, fields: Map<string, HTMLElement>, billingFields: Map<string, HTMLElement>, countryService: any, logger?: Logger);
    /**
     * Initialize the address service with both country management and autocomplete
     * Optionally accepts callbacks for country data loading
     */
    initialize(configStore?: any, updateFormDataCallback?: (data: Record<string, any>) => void, clearErrorCallback?: (field: string) => void, addClassCallback?: (className: string) => void, removeClassCallback?: (className: string) => void): Promise<void>;
    /**
     * Load country data and set up country/state management
     */
    loadCountryData(configStore: any, updateFormDataCallback: (data: Record<string, any>) => void, clearErrorCallback: (field: string) => void, addClassCallback: (className: string) => void, removeClassCallback: (className: string) => void): Promise<void>;
    /**
     * Initialize country data (internal method)
     */
    private initializeCountryData;
    /**
     * Initialize autocomplete functionality
     */
    private initializeAutocomplete;
    /**
     * Find address fields in the form
     */
    private findAddressFields;
    /**
     * Set up lazy loading for Google Maps autocomplete
     * Only loads the API when user focuses on an address field
     */
    private setupLazyAutocompleteLoading;
    /**
     * Initialize Google Maps autocomplete with retry logic
     */
    private initializeGoogleMapsAutocomplete;
    /**
     * Set up Google Maps autocomplete on address fields
     */
    private setupAutocomplete;
    /**
     * Create autocomplete instance for a specific field
     */
    private createAutocompleteInstance;
    /**
     * Fill address fields from Google Maps autocomplete result
     */
    fillAddressFromAutocomplete(place: PlaceResult, fields: AddressFields): Promise<void>;
    /**
     * Parse Google Maps address components into a usable format
     */
    private parseAddressComponents;
    /**
     * Set state with retry logic (for when state options are loading)
     */
    private setStateWithRetry;
    /**
     * Set up country change listeners to update autocomplete restrictions
     */
    private setupCountryChangeListeners;
    /**
     * Country/State Management Methods
     */
    populateCountryDropdown(countrySelect: HTMLSelectElement, countries: Country[], defaultCountry?: string): void;
    populateBillingCountryDropdown(): void;
    updateStateOptions(country: string, provinceField: HTMLSelectElement, updateFormDataCallback: (data: Record<string, any>) => void, clearErrorCallback: (field: string) => void): Promise<void>;
    updateBillingStateOptions(country: string, shippingProvince?: string): Promise<void>;
    updateFormLabels(countryConfig: CountryConfig): void;
    updateBillingFormLabels(countryConfig: CountryConfig): void;
    /**
     * Format postal code based on country rules
     */
    formatPostalCode(value: string, country: string): string;
    /**
     * Sync billing address to shipping address
     */
    syncBillingToShipping(): void;
    /**
     * Location field visibility management
     */
    private hideLocationFields;
    private showLocationFields;
    /**
     * Set up basic field listeners when autocomplete is not available
     */
    private setupBasicFieldListeners;
    /**
     * Set up autofill detection styles
     */
    private setupAutofillDetection;
    /**
     * Getters for accessing internal state
     */
    getCountries(): Country[];
    getCountryConfigs(): Map<string, CountryConfig>;
    getCurrentCountryConfig(): CountryConfig | undefined;
    isAutocompleteAvailable(): boolean;
    getAddressFields(): {
        shipping: AddressFields;
        billing: AddressFields;
    } | null;
    /**
     * Cleanup method
     */
    destroy(): void;
}
export {};
//# sourceMappingURL=AddressService.d.ts.map