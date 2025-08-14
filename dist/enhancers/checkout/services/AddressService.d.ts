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
    initialize(configStore?: any, updateFormDataCallback?: (data: Record<string, any>) => void, clearErrorCallback?: (field: string) => void, addClassCallback?: (className: string) => void, removeClassCallback?: (className: string) => void): Promise<void>;
    loadCountryData(configStore: any, updateFormDataCallback: (data: Record<string, any>) => void, clearErrorCallback: (field: string) => void, addClassCallback: (className: string) => void, removeClassCallback: (className: string) => void): Promise<void>;
    private initializeCountryData;
    private initializeAutocomplete;
    private findAddressFields;
    private setupLazyAutocompleteLoading;
    private initializeGoogleMapsAutocomplete;
    private setupAutocomplete;
    private createAutocompleteInstance;
    fillAddressFromAutocomplete(place: PlaceResult, fields: AddressFields): Promise<void>;
    private parseAddressComponents;
    private setStateWithRetry;
    private setupCountryChangeListeners;
    populateCountryDropdown(countrySelect: HTMLSelectElement, countries: Country[], defaultCountry?: string): void;
    populateBillingCountryDropdown(): void;
    updateStateOptions(country: string, provinceField: HTMLSelectElement, updateFormDataCallback: (data: Record<string, any>) => void, clearErrorCallback: (field: string) => void): Promise<void>;
    updateBillingStateOptions(country: string, shippingProvince?: string): Promise<void>;
    updateFormLabels(countryConfig: CountryConfig): void;
    updateBillingFormLabels(countryConfig: CountryConfig): void;
    formatPostalCode(value: string, country: string): string;
    syncBillingToShipping(): void;
    private hideLocationFields;
    private showLocationFields;
    private setupBasicFieldListeners;
    getCountries(): Country[];
    getCountryConfigs(): Map<string, CountryConfig>;
    getCurrentCountryConfig(): CountryConfig | undefined;
    isAutocompleteAvailable(): boolean;
    getAddressFields(): {
        shipping: AddressFields;
        billing: AddressFields;
    } | null;
    destroy(): void;
}
export {};
//# sourceMappingURL=AddressService.d.ts.map