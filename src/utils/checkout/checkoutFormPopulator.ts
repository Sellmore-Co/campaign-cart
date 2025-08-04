import { useCheckoutStore } from '@/stores/checkoutStore';
import { CountryService, type Country, type CountryConfig } from '@/utils/countryService';
import type { Logger } from '@/utils/logger';

export class CheckoutFormPopulator {
  private fields: Map<string, HTMLElement>;
  private countryService: CountryService;
  private logger: Logger;
  
  // Country data
  private countries: Country[] = [];
  private countryConfigs: Map<string, CountryConfig> = new Map();
  private currentCountryConfig?: CountryConfig;

  constructor(
    fields: Map<string, HTMLElement>,
    countryService: CountryService,
    logger: Logger
  ) {
    this.fields = fields;
    this.countryService = countryService;
    this.logger = logger;
  }

  public async initialize(): Promise<void> {
    await this.loadCountryData();
    this.populateExpirationFields();
  }

  private async loadCountryData(): Promise<void> {
    try {
      const locationData = await this.countryService.getLocationData();
      this.countries = locationData.countries;
      
      // Populate country dropdown
      const countryField = this.fields.get('country');
      if (countryField instanceof HTMLSelectElement) {
        this.populateCountryDropdown(countryField, locationData.detectedCountryCode);
      }
      
      // Store detected country config
      this.countryConfigs.set(
        locationData.detectedCountryCode, 
        locationData.detectedCountryConfig
      );
      
      // Load states for detected country
      if (locationData.detectedCountryCode) {
        await this.updateStateOptions(locationData.detectedCountryCode);
        
        // Update form labels based on detected country
        this.updateFormLabels(locationData.detectedCountryConfig);
      }
      
      this.logger.debug('Country data loaded', {
        countriesCount: this.countries.length,
        detectedCountry: locationData.detectedCountryCode
      });
      
    } catch (error) {
      this.logger.error('Failed to load country data:', error);
    }
  }

  public populateExpirationFields(): void {
    try {
      this.logger.debug('Populating expiration date fields');
      
      // Find expiration month and year fields - support both new and legacy selectors
      const [monthSelect, yearSelect] = this.getExpirationElements();
      
      if (monthSelect) {
        this.populateMonthOptions(monthSelect as HTMLSelectElement);
      }
      
      if (yearSelect) {
        this.populateYearOptions(yearSelect as HTMLSelectElement);
      }
      
      this.logger.debug('Expiration date fields populated', {
        monthFieldFound: !!monthSelect,
        yearFieldFound: !!yearSelect
      });
      
    } catch (error) {
      this.logger.error('Error populating expiration fields:', error);
    }
  }

  private getExpirationElements(): [HTMLElement | null, HTMLElement | null] {
    // Multiple selectors for month field - support both new and legacy
    const monthSelectors = [
      '[data-next-checkout-field="cc-month"]',
      '[data-next-checkout-field="exp-month"]', 
      '[os-checkout-field="cc-month"]',
      '[os-checkout-field="exp-month"]',
      '#credit_card_exp_month'
    ];
    
    // Multiple selectors for year field - support both new and legacy
    const yearSelectors = [
      '[data-next-checkout-field="cc-year"]',
      '[data-next-checkout-field="exp-year"]',
      '[os-checkout-field="cc-year"]', 
      '[os-checkout-field="exp-year"]',
      '#credit_card_exp_year'
    ];
    
    // Find the first matching element for each field
    const monthField = monthSelectors
      .map(selector => document.querySelector(selector))
      .find(element => element !== null) as HTMLElement | null;
    
    const yearField = yearSelectors
      .map(selector => document.querySelector(selector))
      .find(element => element !== null) as HTMLElement | null;
    
    return [monthField, yearField];
  }

  private populateMonthOptions(monthSelect: HTMLSelectElement): void {
    // Clear existing options and add placeholder
    monthSelect.innerHTML = '<option value="">Month</option>';
    
    // Add month options 01-12
    for (let i = 1; i <= 12; i++) {
      const month = i.toString().padStart(2, '0');
      const option = document.createElement('option');
      option.value = month;
      option.textContent = month;
      monthSelect.appendChild(option);
    }
    
    this.logger.debug('Month options populated (01-12)');
  }

  private populateYearOptions(yearSelect: HTMLSelectElement): void {
    // Clear existing options and add placeholder
    yearSelect.innerHTML = '<option value="">Year</option>';
    
    // Add year options from current year to current year + 20
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 20; i++) {
      const year = currentYear + i;
      const option = document.createElement('option');
      option.value = year.toString();
      option.textContent = year.toString();
      yearSelect.appendChild(option);
    }
    
    this.logger.debug(`Year options populated (${currentYear}-${currentYear + 19})`);
  }

  private populateCountryDropdown(countrySelect: HTMLSelectElement, defaultCountry?: string): void {
    // Clear existing options except the first one (usually "Select Country")
    const firstOption = countrySelect.options[0];
    countrySelect.innerHTML = '';
    if (firstOption && !firstOption.value) {
      countrySelect.appendChild(firstOption);
    }
    
    // Add country options
    this.countries.forEach(country => {
      const option = document.createElement('option');
      option.value = country.code;
      option.textContent = country.name;
      if (country.code === defaultCountry) {
        option.selected = true;
      }
      countrySelect.appendChild(option);
    });
    
    // Trigger change event if default country was set
    if (defaultCountry) {
      countrySelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  public async updateStateOptions(country: string): Promise<void> {
    const provinceField = this.fields.get('province');
    if (!(provinceField instanceof HTMLSelectElement)) return;
    
    // Show loading state
    provinceField.disabled = true;
    const originalHTML = provinceField.innerHTML;
    provinceField.innerHTML = '<option value="">Loading...</option>';
    
    try {
      // Get country config and states
      const countryData = await this.countryService.getCountryStates(country);
      this.countryConfigs.set(country, countryData.countryConfig);
      this.currentCountryConfig = countryData.countryConfig;
      
      // Update form labels based on country config
      this.updateFormLabels(countryData.countryConfig);
      
      // Clear and populate state options
      provinceField.innerHTML = `<option value="">Select ${countryData.countryConfig.stateLabel}</option>`;
      
      countryData.states.forEach(state => {
        const option = document.createElement('option');
        option.value = state.code;
        option.textContent = state.name;
        provinceField.appendChild(option);
      });
      
      // Update required attribute based on country config
      if (countryData.countryConfig.stateRequired) {
        provinceField.setAttribute('required', 'required');
        provinceField.setAttribute('data-next-validate', 'required');
      } else {
        provinceField.removeAttribute('required');
        provinceField.removeAttribute('data-next-validate');
      }
      
      // If we had a previously selected value, try to restore it
      const checkoutStore = useCheckoutStore.getState();
      if (checkoutStore.formData.province) {
        provinceField.value = checkoutStore.formData.province;
      }
      
    } catch (error) {
      this.logger.error('Failed to load states:', error);
      // Restore original content on error
      provinceField.innerHTML = originalHTML;
    } finally {
      provinceField.disabled = false;
    }
  }

  private updateFormLabels(countryConfig: CountryConfig): void {
    // Update state/province label
    const stateLabel = document.querySelector('label[for*="province"], label[for*="state"]');
    if (stateLabel) {
      const isRequired = countryConfig.stateRequired ? ' *' : '';
      stateLabel.textContent = countryConfig.stateLabel + isRequired;
    }
    
    // Update postal code label
    const postalLabel = document.querySelector('label[for*="postal"], label[for*="zip"]');
    if (postalLabel) {
      postalLabel.textContent = countryConfig.postcodeLabel + ' *';
    }
    
    // Update postal code placeholder if field exists
    const postalField = this.fields.get('postal');
    if (postalField instanceof HTMLInputElement && countryConfig.postcodeExample) {
      postalField.placeholder = countryConfig.postcodeExample;
    }
  }

  public populateFormData(): void {
    const checkoutStore = useCheckoutStore.getState();
    const formData = checkoutStore.formData;
    
    // Populate form fields with existing data
    this.fields.forEach((field, name) => {
      if (formData[name] && (field instanceof HTMLInputElement || field instanceof HTMLSelectElement)) {
        field.value = formData[name];
      }
    });
  }

  public getCountryConfig(countryCode: string): CountryConfig | undefined {
    return this.countryConfigs.get(countryCode);
  }

  public validatePostalCode(postalCode: string, countryCode: string, countryConfig: CountryConfig): boolean {
    return this.countryService.validatePostalCode(postalCode, countryCode, countryConfig);
  }

  public destroy(): void {
    this.countries = [];
    this.countryConfigs.clear();
    delete this.currentCountryConfig;
  }
}