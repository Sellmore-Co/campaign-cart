/**
 * Address Service - Consolidated address handling service
 * Consolidates functionality from AddressManager and AddressAutocompleteManager
 */

import { createLogger } from '@/utils/logger';
import { useConfigStore } from '@/stores/configStore';
import { googleMapsLoader } from '@/utils/googleMapsLoader';
import { EventBus } from '@/utils/events';
import type { Country, CountryConfig } from '@/utils/countryService';
import type { Logger } from '@/utils/logger';
import type { AddressFields } from '../types';
import { FieldFinder } from '../utils/field-finder-utils';

// Google Maps types
interface AddressComponent {
  types: string[];
  long_name: string;
  short_name: string;
}

interface PlaceResult {
  address_components?: AddressComponent[];
  formatted_address?: string;
}

export class AddressService {
  private logger: Logger;
  private eventBus = EventBus.getInstance();
  private form: HTMLFormElement;
  private fields: Map<string, HTMLElement>;
  private billingFields: Map<string, HTMLElement>;
  private countryService: any;
  
  // Country/State management
  private countries: Country[] = [];
  private countryConfigs: Map<string, CountryConfig> = new Map();
  private currentCountryConfig?: CountryConfig;
  
  // Autocomplete management
  private autocompleteInstances: Map<string, any> = new Map();
  private addressFields: { shipping: AddressFields; billing: AddressFields } | null = null;
  private locationElements: NodeListOf<Element> | null = null;
  private fieldsShown = false;
  private enableAutocomplete = true;

  constructor(
    form: HTMLFormElement,
    fields: Map<string, HTMLElement>,
    billingFields: Map<string, HTMLElement>,
    countryService: any,
    logger?: Logger
  ) {
    this.form = form;
    this.fields = fields;
    this.billingFields = billingFields;
    this.countryService = countryService;
    this.logger = logger || createLogger('AddressService');
    
    this.logger.info('AddressService initialized');
  }

  /**
   * Initialize the address service with both country management and autocomplete
   * Optionally accepts callbacks for country data loading
   */
  public async initialize(
    configStore?: any,
    updateFormDataCallback?: (data: Record<string, any>) => void,
    clearErrorCallback?: (field: string) => void,
    addClassCallback?: (className: string) => void,
    removeClassCallback?: (className: string) => void
  ): Promise<void> {
    try {
      this.logger.info('Initializing address service...');
      
      // If callbacks are provided, do full country data loading, otherwise just basic initialization
      if (configStore && updateFormDataCallback && clearErrorCallback && addClassCallback && removeClassCallback) {
        // Initialize with full country data loading and autocomplete in parallel
        await Promise.all([
          this.loadCountryData(configStore, updateFormDataCallback, clearErrorCallback, addClassCallback, removeClassCallback),
          this.initializeAutocomplete()
        ]);
      } else {
        // Initialize country data and autocomplete in parallel
        await Promise.all([
          this.initializeCountryData(),
          this.initializeAutocomplete()
        ]);
      }
      
      this.logger.info('Address service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize address service:', error);
      // Still set up basic functionality as fallback
      this.setupBasicFieldListeners();
    }
  }

  /**
   * Load country data and set up country/state management
   */
  public async loadCountryData(
    configStore: any,
    updateFormDataCallback: (data: Record<string, any>) => void,
    clearErrorCallback: (field: string) => void,
    addClassCallback: (className: string) => void,
    removeClassCallback: (className: string) => void
  ): Promise<void> {
    try {
      addClassCallback('next-loading-countries');
      
      // Set address configuration from config store
      const config = configStore.getState();
      if (config.addressConfig) {
        this.countryService.setConfig(config.addressConfig);
      }
      
      const locationData = await this.countryService.getLocationData();
      this.countries = locationData.countries;
      
      // Populate country dropdown
      const countryField = this.fields.get('country');
      if (countryField instanceof HTMLSelectElement) {
        this.populateCountryDropdown(
          countryField, 
          locationData.countries, 
          locationData.detectedCountryCode
        );
        
        // Update checkout store with default country if set
        if (locationData.detectedCountryCode) {
          updateFormDataCallback({
            country: locationData.detectedCountryCode
          });
          
          // Clear any country validation errors since we now have a value
          clearErrorCallback('country');
        }
      }
      
      // Store detected country config
      this.countryConfigs.set(
        locationData.detectedCountryCode, 
        locationData.detectedCountryConfig
      );
      
      // Load states for detected country
      if (locationData.detectedCountryCode) {
        const provinceField = this.fields.get('province');
        if (provinceField instanceof HTMLSelectElement) {
          await this.updateStateOptions(
            locationData.detectedCountryCode,
            provinceField,
            updateFormDataCallback,
            clearErrorCallback
          );
          this.currentCountryConfig = this.countryConfigs.get(locationData.detectedCountryCode) ?? locationData.detectedCountryConfig;
        }
        
        // Update form labels based on detected country
        this.updateFormLabels(locationData.detectedCountryConfig);
      }
      
      // Also populate billing country dropdown if billing fields exist
      if (this.billingFields.size > 0) {
        this.populateBillingCountryDropdown();
      }
      
      this.logger.debug('Country data loaded', {
        countriesCount: this.countries.length,
        detectedCountry: locationData.detectedCountryCode,
        addressConfig: config.addressConfig
      });
      
    } catch (error) {
      this.logger.error('Failed to load country data:', error);
    } finally {
      removeClassCallback('next-loading-countries');
    }
  }

  /**
   * Initialize country data (internal method)
   */
  private async initializeCountryData(): Promise<void> {
    // This method can be called internally without the full callback system
    // For cases where we just need the data loaded
    try {
      const locationData = await this.countryService.getLocationData();
      this.countries = locationData.countries;
      this.countryConfigs.set(
        locationData.detectedCountryCode, 
        locationData.detectedCountryConfig
      );
    } catch (error) {
      this.logger.warn('Failed to initialize country data:', error);
    }
  }

  /**
   * Initialize autocomplete functionality
   */
  private async initializeAutocomplete(): Promise<void> {
    try {
      // Get configuration
      const configStore = useConfigStore.getState();
      const googleMapsConfig = configStore.googleMapsConfig;
      
      this.enableAutocomplete = googleMapsConfig.enableAutocomplete !== false && !!googleMapsConfig.apiKey;
      
      if (!this.enableAutocomplete) {
        this.logger.debug('Google Maps autocomplete disabled, using basic field listeners');
        this.setupBasicFieldListeners();
        return;
      }

      // Find address fields
      this.findAddressFields();
      
      if (!this.addressFields) {
        this.logger.warn('No address fields found');
        return;
      }

      // Hide location fields initially
      this.hideLocationFields();
      
      // Set up lazy loading for Google Maps autocomplete
      this.setupLazyAutocompleteLoading();
      
    } catch (error) {
      this.logger.error('Failed to initialize autocomplete:', error);
      this.setupBasicFieldListeners();
    }
  }

  /**
   * Find address fields in the form
   */
  private findAddressFields(): void {
    const shippingFields = FieldFinder.findFields(
      ['address1', 'city', 'province', 'postal', 'country'],
      { container: this.form }
    );
    
    const billingFields = FieldFinder.findFields(
      ['billing-address1', 'billing-city', 'billing-province', 'billing-postal', 'billing-country'],
      { container: this.form }
    );
    
    this.addressFields = {
      shipping: {
        address: shippingFields.get('address1') as HTMLInputElement,
        city: shippingFields.get('city') as HTMLInputElement,
        state: shippingFields.get('province') as HTMLSelectElement,
        zip: shippingFields.get('postal') as HTMLInputElement,
        country: shippingFields.get('country') as HTMLSelectElement,
      },
      billing: {
        address: billingFields.get('billing-address1') as HTMLInputElement,
        city: billingFields.get('billing-city') as HTMLInputElement,
        state: billingFields.get('billing-province') as HTMLSelectElement,
        zip: billingFields.get('billing-postal') as HTMLInputElement,
        country: billingFields.get('billing-country') as HTMLSelectElement,
      }
    };

    // Find location display elements
    this.locationElements = this.form.querySelectorAll('[data-next-component="location"]');
    
    this.logger.debug('Address fields found', {
      shipping: Object.keys(this.addressFields.shipping).filter(key => this.addressFields!.shipping[key as keyof AddressFields]),
      billing: Object.keys(this.addressFields.billing).filter(key => this.addressFields!.billing[key as keyof AddressFields])
    });
  }

  /**
   * Set up lazy loading for Google Maps autocomplete
   * Only loads the API when user focuses on an address field
   */
  private setupLazyAutocompleteLoading(): void {
    if (!this.addressFields) return;

    let isLoading = false;
    let isLoaded = false;

    const loadAutocompleteOnFocus = async () => {
      if (isLoaded || isLoading) return;
      
      isLoading = true;
      this.logger.info('User focused on address field, loading Google Maps API...');
      
      try {
        await this.initializeGoogleMapsAutocomplete();
        isLoaded = true;
        
        // Remove all focus listeners since we've loaded the API
        if (this.addressFields) {
          [this.addressFields.shipping.address, this.addressFields.billing.address].forEach(field => {
            if (field) {
              field.removeEventListener('focus', loadAutocompleteOnFocus);
            }
          });
        }
      } catch (error) {
        this.logger.error('Failed to load Google Maps on focus:', error);
      } finally {
        isLoading = false;
      }
    };

    // Add focus listeners to address fields
    if (this.addressFields.shipping.address) {
      this.addressFields.shipping.address.addEventListener('focus', loadAutocompleteOnFocus);
    }
    
    if (this.addressFields.billing.address) {
      this.addressFields.billing.address.addEventListener('focus', loadAutocompleteOnFocus);
    }

    // Also set up basic field listeners immediately for non-autocomplete functionality
    this.setupBasicFieldListeners();
  }

  /**
   * Initialize Google Maps autocomplete with retry logic
   */
  private async initializeGoogleMapsAutocomplete(): Promise<void> {
    try {
      // Load Google Maps API
      await googleMapsLoader.loadGoogleMapsAPI();
      
      // Add a small delay to ensure the API is fully initialized
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Debug logging
      this.logger.debug('Google Maps status:', {
        google: typeof window.google !== 'undefined',
        maps: typeof window.google?.maps !== 'undefined',
        places: typeof window.google?.maps?.places !== 'undefined',
        Autocomplete: typeof window.google?.maps?.places?.Autocomplete !== 'undefined'
      });
      
      if (!googleMapsLoader.isPlacesAvailable()) {
        this.logger.warn('Google Places API not available, falling back to basic listeners');
        this.setupBasicFieldListeners();
        return;
      }

      this.logger.debug('Google Maps API loaded, setting up autocomplete');
      this.setupAutocomplete();
      
    } catch (error) {
      this.logger.warn('Failed to load Google Maps API, using basic field listeners:', error);
      this.setupBasicFieldListeners();
    }
  }

  /**
   * Set up Google Maps autocomplete on address fields
   */
  private setupAutocomplete(): void {
    if (!this.addressFields) return;

    const configStore = useConfigStore.getState();
    const defaultCountry = configStore.addressConfig.defaultCountry || 'US';

    // Set up autocomplete for shipping address
    if (this.addressFields.shipping.address) {
      this.createAutocompleteInstance(
        this.addressFields.shipping.address,
        this.addressFields.shipping,
        'address1',
        defaultCountry
      );
    }

    // Set up autocomplete for billing address
    if (this.addressFields.billing.address) {
      this.createAutocompleteInstance(
        this.addressFields.billing.address,
        this.addressFields.billing,
        'billing-address1',
        defaultCountry
      );
    }

    // Set up country change listeners to update autocomplete restrictions
    this.setupCountryChangeListeners();
  }

  /**
   * Create autocomplete instance for a specific field
   */
  private createAutocompleteInstance(
    input: HTMLInputElement,
    fields: AddressFields,
    fieldKey: string,
    defaultCountry: string
  ): void {
    try {
      const countryValue = fields.country?.value || defaultCountry;
      
      const options = {
        types: ['address'],
        fields: ['address_components', 'formatted_address'],
        componentRestrictions: { country: countryValue }
      };

      // Check if Google Maps API is loaded
      if (!window.google?.maps?.places) {
        this.logger.warn('Google Maps Places API not loaded, skipping autocomplete initialization');
        return;
      }
      
      // For now, stick with the legacy Autocomplete API until we can properly implement PlaceAutocompleteElement
      // The new API requires more complex DOM manipulation and styling
      // Note: Google shows deprecation warnings but the API is still fully supported
      if (!window.google.maps.places.Autocomplete) {
        this.logger.warn('Google Maps Autocomplete API not available');
        return;
      }
      
      const autocomplete = new window.google.maps.places.Autocomplete(input, options);
      this.autocompleteInstances.set(fieldKey, autocomplete);
      
      this.logger.debug(`Autocomplete created for ${fieldKey}, restricted to: ${countryValue}`);

      // Handle place selection
      autocomplete.addListener('place_changed', async () => {
        const place: PlaceResult | undefined = autocomplete.getPlace();
        if (!place || !place.address_components) {
          this.logger.debug('No valid place data returned from autocomplete');
          return;
        }

        await this.fillAddressFromAutocomplete(place, fields);
      });

      // Show location fields on long enough input
      input.addEventListener('blur', () => {
        if (input.value.length > 10) {
          this.showLocationFields();
        }
      });

      // Prevent form submission on Enter
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
        }
      });

    } catch (error) {
      this.logger.error(`Failed to create autocomplete for ${fieldKey}:`, error);
    }
  }

  /**
   * Fill address fields from Google Maps autocomplete result
   */
  public async fillAddressFromAutocomplete(place: PlaceResult, fields: AddressFields): Promise<void> {
    console.log('🔍 fillAddressFromAutocomplete called with place:', place);
    
    if (!place.address_components) return;

    this.showLocationFields();

    // Parse address components
    const components = this.parseAddressComponents(place.address_components);
    
    if (!components) {
      this.logger.warn('Failed to parse address components');
      return;
    }

    // Log autocomplete selection for specific countries (e.g., Brazil)
    const countryCode = components.country?.short;
    if (countryCode === 'BR' || countryCode === 'GB' || countryCode === 'JP' || countryCode === 'IN' || countryCode === 'CA') {
      // Use console.log directly to ensure visibility
      console.log(`🌍 Google Autocomplete selection for ${countryCode}:`, {
        country: countryCode,
        formatted_address: place.formatted_address,
        components: {
          street_number: components.street_number?.long,
          route: components.route?.long,
          locality: components.locality?.long,
          postal_town: components.postal_town?.long,
          sublocality: components.sublocality?.long,
          sublocality_level_1: components.sublocality_level_1?.long,
          sublocality_level_2: components.sublocality_level_2?.long,
          administrative_area_level_1: components.administrative_area_level_1?.long,
          administrative_area_level_2: components.administrative_area_level_2?.long,
          administrative_area_level_3: components.administrative_area_level_3?.long,
          administrative_area_level_4: components.administrative_area_level_4?.long,
          neighborhood: components.neighborhood?.long,
          postal_code: components.postal_code?.long,
          postal_code_suffix: components.postal_code_suffix?.long
        },
        all_types: Object.keys(components)
      });
    }

    // Fill in the address fields
    if (fields.address) {
      const streetNumber = components.street_number?.long || '';
      const route = components.route?.long || '';
      
      let addressValue = '';
      
      // Country-specific address formatting
      if (countryCode === 'BR' && route && streetNumber) {
        // Brazil format: "Street Name, Number"
        addressValue = `${route}, ${streetNumber}`;
        
        // Append neighborhood if available
        if (components.sublocality_level_1) {
          addressValue += ` - ${components.sublocality_level_1.long}`;
        } else if (components.sublocality) {
          addressValue += ` - ${components.sublocality.long}`;
        }
      } else {
        // Default format: "Number Street Name"
        addressValue = [streetNumber, route].filter(Boolean).join(' ');
      }
      
      fields.address.value = addressValue;
      fields.address.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // For Brazil, parse city and state from formatted address if components are missing
    let parsedCity = '';
    let parsedState = '';
    
    if (countryCode === 'BR' && place.formatted_address && 
        (!components.administrative_area_level_2 || !components.administrative_area_level_1)) {
      // BR format: "Street, Number - Neighborhood, City - State, Postal, Country"
      const addressParts = place.formatted_address.split(',');
      if (addressParts.length >= 3) {
        // Extract city and state from the pattern "City - State"
        const cityStatePart = addressParts[addressParts.length - 3]?.trim();
        if (cityStatePart && cityStatePart.includes(' - ')) {
          const [city, state] = cityStatePart.split(' - ').map(s => s.trim());
          parsedCity = city || '';
          parsedState = state || '';
        }
      }
    }

    // Enhanced city extraction with fallback logic
    if (fields.city) {
      let cityValue = '';
      
      // Country-specific logic
      if (countryCode === 'BR') {
        // Brazil: try administrative_area_level_2 first, then parsed city
        if (components.administrative_area_level_2) {
          cityValue = components.administrative_area_level_2.long;
        } else if (parsedCity) {
          cityValue = parsedCity;
        }
      }
      // Primary: Try locality (most common - US, CA, AU, etc.)
      else if (components.locality) {
        cityValue = components.locality.long;
      } 
      // Fallback 1: Try postal_town (common in UK)
      else if (components.postal_town) {
        cityValue = components.postal_town.long;
      }
      // Fallback 2: Try administrative_area_level_2 (some countries use this)
      else if (components.administrative_area_level_2) {
        cityValue = components.administrative_area_level_2.long;
      }
      // Fallback 3: Try sublocality (common in some Asian countries - but not for BR)
      else if (components.sublocality && countryCode !== 'BR') {
        cityValue = components.sublocality.long;
      }
      // Fallback 4: Try sublocality_level_1 (but not for BR where it's neighborhood)
      else if (components.sublocality_level_1 && countryCode !== 'BR') {
        cityValue = components.sublocality_level_1.long;
      }
      
      if (cityValue) {
        fields.city.value = cityValue;
        fields.city.dispatchEvent(new Event('change', { bubbles: true }));
        this.logger.debug(`City set to: ${cityValue} (type: ${
          components.locality ? 'locality' : 
          components.postal_town ? 'postal_town' : 
          components.sublocality ? 'sublocality' : 
          'sublocality_level_1'
        })`);
      } else {
        this.logger.warn('No suitable city component found in address');
      }
    }

    if (fields.zip && components?.postal_code) {
      fields.zip.value = components.postal_code.long;
      fields.zip.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Handle country and state
    if (fields.country && components?.country) {
      const countryCode = components.country.short;
      const needsCountryChange = fields.country.value !== countryCode;
      
      if (needsCountryChange) {
        fields.country.value = countryCode;
        fields.country.dispatchEvent(new Event('change', { bubbles: true }));
        this.logger.debug(`Country set to ${countryCode}`);
        console.log(`🌐 Country changed to ${countryCode}`);
      }

      // Set state with retry (wait for country change to load states)
      if (fields.state) {
        // Add extra delay if country was just changed
        if (needsCountryChange) {
          console.log(`⏱️ Country was just changed, adding extra delay before setting state`);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        if (components?.administrative_area_level_1) {
          console.log(`🏛️ Setting state from administrative_area_level_1: ${components.administrative_area_level_1.short}`);
          this.setStateWithRetry(fields.state, components.administrative_area_level_1.short);
        } else if (countryCode === 'BR' && parsedState) {
          // For Brazil, use parsed state if component is missing
          console.log(`🏛️ Setting state from parsed address: ${parsedState}`);
          this.setStateWithRetry(fields.state, parsedState);
        }
      }
    }

    // Emit event for other components
    this.eventBus.emit('address:autocomplete-filled', {
      type: fields.address?.getAttribute('data-next-checkout-field')?.includes('billing') ? 'billing' : 'shipping',
      components
    });
  }

  /**
   * Parse Google Maps address components into a usable format
   */
  private parseAddressComponents(addressComponents: AddressComponent[]): Record<string, { long: string; short: string }> {
    const components: Record<string, { long: string; short: string }> = {};
    
    addressComponents.forEach(component => {
      // Store the component for ALL its types, not just the first one
      component.types.forEach(type => {
        // Skip 'political' as it's too generic
        if (type !== 'political') {
          components[type] = {
            long: component.long_name,
            short: component.short_name
          };
        }
      });
    });

    // Debug logging for address component parsing
    this.logger.debug('Parsed address components:', {
      availableTypes: Object.keys(components),
      cityRelatedComponents: {
        locality: components.locality?.long,
        postal_town: components.postal_town?.long,
        sublocality: components.sublocality?.long,
        sublocality_level_1: components.sublocality_level_1?.long
      },
      allComponents: components
    });

    return components;
  }

  /**
   * Set state with retry logic (for when state options are loading)
   */
  private async setStateWithRetry(stateSelect: HTMLSelectElement, stateCode: string, attempt = 0): Promise<void> {
    console.log(`🔄 setStateWithRetry: Attempting to set state to ${stateCode} (attempt ${attempt + 1}/5)`);
    
    if (attempt >= 5) {
      this.logger.warn(`Failed to set state ${stateCode} after 5 attempts`);
      console.log(`❌ Failed to set state ${stateCode} after 5 attempts. Available options:`, 
        Array.from(stateSelect.options).map(opt => opt.value));
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 300 * Math.pow(1.5, attempt)));

    const hasOption = Array.from(stateSelect.options).some(opt => opt.value === stateCode);
    if (hasOption) {
      stateSelect.value = stateCode;
      stateSelect.dispatchEvent(new Event('change', { bubbles: true }));
      this.logger.debug(`State set to ${stateCode}`);
      console.log(`✅ State successfully set to ${stateCode}`);
    } else {
      console.log(`⏳ State option ${stateCode} not found yet. Available options:`, 
        Array.from(stateSelect.options).map(opt => opt.value));
      this.setStateWithRetry(stateSelect, stateCode, attempt + 1);
    }
  }

  /**
   * Set up country change listeners to update autocomplete restrictions
   */
  private setupCountryChangeListeners(): void {
    if (!this.addressFields) return;

    // Shipping country change
    if (this.addressFields.shipping.country) {
      this.addressFields.shipping.country.addEventListener('change', () => {
        const autocomplete = this.autocompleteInstances.get('address1');
        const countryValue = this.addressFields?.shipping?.country?.value;
        if (autocomplete && countryValue && countryValue.length === 2) {
          // Legacy Autocomplete API
          if (autocomplete.setComponentRestrictions) {
            autocomplete.setComponentRestrictions({ country: countryValue });
          }
          this.logger.debug(`Shipping autocomplete restricted to: ${countryValue}`);
        }
      });
    }

    // Billing country change
    if (this.addressFields.billing.country) {
      this.addressFields.billing.country.addEventListener('change', () => {
        const autocomplete = this.autocompleteInstances.get('billing-address1');
        const countryValue = this.addressFields?.billing?.country?.value;
        if (autocomplete && countryValue && countryValue.length === 2) {
          // Legacy Autocomplete API
          if (autocomplete.setComponentRestrictions) {
            autocomplete.setComponentRestrictions({ country: countryValue });
          }
          this.logger.debug(`Billing autocomplete restricted to: ${countryValue}`);
        }
      });
    }
  }

  /**
   * Country/State Management Methods
   */

  public populateCountryDropdown(
    countrySelect: HTMLSelectElement, 
    countries: Country[], 
    defaultCountry?: string
  ): void {
    // Clear existing options except the first one (usually "Select Country")
    const firstOption = countrySelect.options[0];
    countrySelect.innerHTML = '';
    if (firstOption && !firstOption.value) {
      // Make the placeholder option disabled and unselectable
      firstOption.disabled = true;
      firstOption.setAttribute('disabled', 'disabled');
      countrySelect.appendChild(firstOption);
    }
    
    // Add country options
    countries.forEach(country => {
      const option = document.createElement('option');
      option.value = country.code;
      option.textContent = country.name;
      if (country.code === defaultCountry) {
        option.selected = true;
      }
      countrySelect.appendChild(option);
    });
    
    if (defaultCountry) {
      this.logger.debug(`Country auto-selected: ${defaultCountry}`);
      
      // Trigger change event to ensure other handlers are notified
      countrySelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  public populateBillingCountryDropdown(): void {
    const billingCountryField = this.billingFields.get('billing-country');
    if (!(billingCountryField instanceof HTMLSelectElement)) return;
    
    // Clear existing options except the first one
    const firstOption = billingCountryField.options[0];
    billingCountryField.innerHTML = '';
    if (firstOption && !firstOption.value) {
      firstOption.disabled = true;
      firstOption.setAttribute('disabled', 'disabled');
      billingCountryField.appendChild(firstOption);
    }
    
    // Add country options
    this.countries.forEach(country => {
      const option = document.createElement('option');
      option.value = country.code;
      option.textContent = country.name;
      billingCountryField.appendChild(option);
    });
    
    // Don't auto-select for billing - user needs to explicitly choose
    this.logger.debug('Billing country dropdown populated');
  }

  public async updateStateOptions(
    country: string,
    provinceField: HTMLSelectElement,
    updateFormDataCallback: (data: Record<string, any>) => void,
    clearErrorCallback: (field: string) => void
  ): Promise<void> {
    // Show loading state
    provinceField.disabled = true;
    const originalHTML = provinceField.innerHTML;
    provinceField.innerHTML = '<option value="">Loading...</option>';
    
    try {
      // Get country config and states
      const countryData = await this.countryService.getCountryStates(country);
      this.countryConfigs.set(country, countryData.countryConfig);
      
      // Check if country has states/subdivisions
      const hasStates = countryData.states && countryData.states.length > 0;
      const stateRequired = countryData.countryConfig.stateRequired;
      
      // Find the parent container of the province field
      const provinceContainer = provinceField.closest('.frm-flds, .form-group, .form-field, .field-group') || provinceField.parentElement;
      
      // Hide field if country doesn't require states AND has no states data
      if (!stateRequired && !hasStates) {
        if (provinceContainer) {
          (provinceContainer as HTMLElement).style.display = 'none';
        }
        provinceField.removeAttribute('required');
        provinceField.removeAttribute('data-next-validate');
        
        // Clear any state value in the store
        updateFormDataCallback({ province: '' });
        clearErrorCallback('province');
        
        this.logger.debug(`State field hidden for ${country} (not required, no states available)`);
        return;
      }
      
      // Show field if it was previously hidden
      if (provinceContainer) {
        (provinceContainer as HTMLElement).style.display = '';
      }
      
      // Clear and populate state options
      provinceField.innerHTML = '';
      
      // Create disabled placeholder option
      const placeholderOption = document.createElement('option');
      placeholderOption.value = '';
      placeholderOption.textContent = `Select ${countryData.countryConfig.stateLabel}`;
      placeholderOption.disabled = true;
      placeholderOption.selected = true;
      placeholderOption.setAttribute('disabled', 'disabled');
      provinceField.appendChild(placeholderOption);
      
      countryData.states.forEach((state: any) => {
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
      
      // Clear any previous state selection from store when switching countries
      updateFormDataCallback({ province: '' });
      clearErrorCallback('province');
      
      // Reset to placeholder (empty value) initially
      provinceField.value = '';
      
      // Auto-select first state if no previous value and states are available and country requires states
      if (countryData.states.length > 0 && countryData.countryConfig.stateRequired) {
        const firstState = countryData.states[0];
        if (firstState) {
          provinceField.value = firstState.code;
          
          // Update the store with the auto-selected state
          updateFormDataCallback({
            province: firstState.code
          });
          
          // Clear any existing errors for this field since we now have a value
          clearErrorCallback('province');
          
          // Trigger change event to ensure any other handlers are notified
          provinceField.dispatchEvent(new Event('change', { bubbles: true }));
          
          this.logger.debug(`Auto-selected first state: ${firstState.name} (${firstState.code})`);
        }
      }
      
    } catch (error) {
      this.logger.error('Failed to load states:', error);
      // Restore original content on error
      provinceField.innerHTML = originalHTML;
    } finally {
      provinceField.disabled = false;
    }
  }

  public async updateBillingStateOptions(country: string, shippingProvince?: string): Promise<void> {
    const billingProvinceField = this.billingFields.get('billing-province');
    if (!(billingProvinceField instanceof HTMLSelectElement)) return;
    
    // Show loading state
    billingProvinceField.disabled = true;
    const originalHTML = billingProvinceField.innerHTML;
    billingProvinceField.innerHTML = '<option value="">Loading...</option>';
    
    try {
      // Get country config and states
      const countryData = await this.countryService.getCountryStates(country);
      
      // Clear and populate state options
      billingProvinceField.innerHTML = '';
      
      // Create disabled placeholder option
      const placeholderOption = document.createElement('option');
      placeholderOption.value = '';
      placeholderOption.textContent = `Select ${countryData.countryConfig.stateLabel}`;
      placeholderOption.disabled = true;
      placeholderOption.selected = true;
      billingProvinceField.appendChild(placeholderOption);
      
      countryData.states.forEach((state: any) => {
        const option = document.createElement('option');
        option.value = state.code;
        option.textContent = state.name;
        billingProvinceField.appendChild(option);
      });
      
      // Update required attribute based on country config
      if (countryData.countryConfig.stateRequired) {
        billingProvinceField.setAttribute('required', 'required');
      } else {
        billingProvinceField.removeAttribute('required');
      }
      
      // Try to select the same state as shipping if it exists
      if (shippingProvince) {
        billingProvinceField.value = shippingProvince;
      }
      
    } catch (error) {
      this.logger.error('Failed to load billing states:', error);
      billingProvinceField.innerHTML = originalHTML;
    } finally {
      billingProvinceField.disabled = false;
    }
  }

  public updateFormLabels(countryConfig: CountryConfig): void {
    // Update state/province label
    const stateLabel = this.form.querySelector('label[for*="province"], label[for*="state"]');
    if (stateLabel) {
      const isRequired = countryConfig.stateRequired ? ' *' : '';
      stateLabel.textContent = countryConfig.stateLabel + isRequired;
    }
    
    // Update postal code label
    const postalLabel = this.form.querySelector('label[for*="postal"], label[for*="zip"]');
    if (postalLabel) {
      postalLabel.textContent = countryConfig.postcodeLabel + ' *';
    }
    
    // Update postal code placeholder if field exists
    const postalField = this.fields.get('postal');
    if (postalField instanceof HTMLInputElement && countryConfig.postcodeExample) {
      postalField.placeholder = countryConfig.postcodeExample;
    }
  }

  public updateBillingFormLabels(countryConfig: CountryConfig): void {
    // Update billing state/province label - look for labels associated with billing fields
    const billingStateLabel = this.form.querySelector('label[for*="billing"][for*="province"], label[for*="billing"][for*="state"]');
    if (billingStateLabel) {
      const isRequired = countryConfig.stateRequired ? ' *' : '';
      billingStateLabel.textContent = `Billing ${countryConfig.stateLabel}${isRequired}`;
    }
    
    // Update billing postal code label
    const billingPostalLabel = this.form.querySelector('label[for*="billing"][for*="postal"], label[for*="billing"][for*="zip"]');
    if (billingPostalLabel) {
      billingPostalLabel.textContent = `Billing ${countryConfig.postcodeLabel} *`;
    }
    
    // Update billing postal code placeholder if field exists
    const billingPostalField = this.billingFields.get('billing-postal');
    if (billingPostalField instanceof HTMLInputElement && countryConfig.postcodeExample) {
      billingPostalField.placeholder = countryConfig.postcodeExample;
    }
    
    this.logger.debug('Updated billing form labels for country:', {
      stateLabel: countryConfig.stateLabel,
      postcodeLabel: countryConfig.postcodeLabel,
      stateRequired: countryConfig.stateRequired
    });
  }

  /**
   * Format postal code based on country rules
   */
  public formatPostalCode(value: string, country: string): string {
    const countryConfig = this.countryConfigs.get(country);
    if (!countryConfig) return value;

    // Apply country-specific formatting rules
    switch (country) {
      case 'CA':
        // Canadian postal code: A1A 1A1
        return value.toUpperCase().replace(/^([A-Z]\d[A-Z])(\d[A-Z]\d)$/, '$1 $2');
      case 'GB':
        // UK postal code: Various formats
        return value.toUpperCase();
      case 'US':
        // US ZIP code: 12345 or 12345-6789
        return value.replace(/^(\d{5})(\d{4})$/, '$1-$2');
      default:
        return value;
    }
  }

  /**
   * Sync billing address to shipping address
   */
  public syncBillingToShipping(): void {
    if (!this.addressFields) return;

    const { shipping, billing } = this.addressFields;

    // Sync address fields
    if (shipping.address?.value && billing.address) {
      billing.address.value = shipping.address.value;
      billing.address.dispatchEvent(new Event('change', { bubbles: true }));
    }

    if (shipping.city?.value && billing.city) {
      billing.city.value = shipping.city.value;
      billing.city.dispatchEvent(new Event('change', { bubbles: true }));
    }

    if (shipping.zip?.value && billing.zip) {
      billing.zip.value = shipping.zip.value;
      billing.zip.dispatchEvent(new Event('change', { bubbles: true }));
    }

    if (shipping.country?.value && billing.country) {
      billing.country.value = shipping.country.value;
      billing.country.dispatchEvent(new Event('change', { bubbles: true }));
    }

    if (shipping.state?.value && billing.state) {
      billing.state.value = shipping.state.value;
      billing.state.dispatchEvent(new Event('change', { bubbles: true }));
    }

    this.logger.debug('Billing address synced to shipping address');
  }

  /**
   * Location field visibility management
   */

  private hideLocationFields(): void {
    if (this.fieldsShown) return;
    
    if (this.locationElements) {
      this.locationElements.forEach(el => el.classList.add('cc-hidden'));
      this.logger.debug('Location fields hidden');
    }
  }

  private showLocationFields(): void {
    if (this.fieldsShown) return;
    
    if (this.locationElements) {
      this.locationElements.forEach(el => el.classList.remove('cc-hidden'));
      this.fieldsShown = true;
      
      // Emit event for other components
      this.eventBus.emit('address:location-fields-shown', {});
      document.dispatchEvent(new CustomEvent('location-fields-shown'));
      
      this.logger.debug('Location fields shown');
    }
  }

  /**
   * Set up basic field listeners when autocomplete is not available
   */
  private setupBasicFieldListeners(): void {
    if (!this.addressFields) {
      this.findAddressFields();
    }

    if (!this.addressFields) return;

    const addressFields = [
      this.addressFields.shipping.address,
      this.addressFields.billing.address
    ].filter(Boolean);

    addressFields.forEach(field => {
      if (!field) return;
      
      field.addEventListener('blur', () => {
        if (field.value && field.value.length > 10) {
          this.showLocationFields();
        }
      });
    });

    this.logger.debug('Basic field listeners set up');
  }


  /**
   * Getters for accessing internal state
   */

  public getCountries(): Country[] {
    return this.countries;
  }

  public getCountryConfigs(): Map<string, CountryConfig> {
    return this.countryConfigs;
  }

  public getCurrentCountryConfig(): CountryConfig | undefined {
    return this.currentCountryConfig;
  }

  public isAutocompleteAvailable(): boolean {
    return this.enableAutocomplete && googleMapsLoader.isPlacesAvailable();
  }

  public getAddressFields(): { shipping: AddressFields; billing: AddressFields } | null {
    return this.addressFields;
  }

  /**
   * Cleanup method
   */
  public destroy(): void {
    this.autocompleteInstances.clear();
    this.addressFields = null;
    this.locationElements = null;
    this.fieldsShown = false;
    
    this.logger.debug('AddressService destroyed');
  }
}