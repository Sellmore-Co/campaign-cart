import { CountryService, CountryConfig } from '../countryService';
import { Logger } from '../logger';
export declare class CheckoutFormPopulator {
    private fields;
    private countryService;
    private logger;
    private countries;
    private countryConfigs;
    private currentCountryConfig?;
    constructor(fields: Map<string, HTMLElement>, countryService: CountryService, logger: Logger);
    initialize(): Promise<void>;
    private loadCountryData;
    populateExpirationFields(): void;
    private getExpirationElements;
    private populateMonthOptions;
    private populateYearOptions;
    private populateCountryDropdown;
    updateStateOptions(country: string): Promise<void>;
    private updateFormLabels;
    populateFormData(): void;
    getCountryConfig(countryCode: string): CountryConfig | undefined;
    validatePostalCode(postalCode: string, countryCode: string, countryConfig: CountryConfig): boolean;
    destroy(): void;
}
//# sourceMappingURL=checkoutFormPopulator.d.ts.map