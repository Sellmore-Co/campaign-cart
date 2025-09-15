/**
 * Country Service
 * Handles fetching country and state data from the CDN API with caching
 */

import { Logger } from '@/utils/logger';
import type { AddressConfig } from '@/types/global';

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

export class CountryService {
  private static instance: CountryService;
  private cachePrefix = 'next_country_';
  private cacheExpiry = 3600000; // 1 hour in milliseconds
  private baseUrl = 'https://cdn-countries.muddy-wind-c7ca.workers.dev';
  private logger: Logger;
  private config: AddressConfig = {};

  private constructor() {
    this.logger = new Logger('CountryService');
  }

  public static getInstance(): CountryService {
    if (!CountryService.instance) {
      CountryService.instance = new CountryService();
    }
    return CountryService.instance;
  }

  /**
   * Set address configuration
   */
  public setConfig(config: AddressConfig): void {
    this.config = { ...config };
    this.logger.debug('Address configuration updated:', this.config);
  }

  /**
   * Get current configuration
   */
  public getConfig(): AddressConfig {
    return { ...this.config };
  }

  /**
   * Get location data with user's detected country and list of all countries
   */
  public async getLocationData(): Promise<LocationData> {
    // Use localStorage for location data as countries list doesn't change often
    const cached = this.getFromCache('location_data', true);
    
    if (cached) {
      return await this.applyCountryFiltering(cached);
    }

    try {
      const response = await fetch(`${this.baseUrl}/location`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch location data: ${response.statusText}`);
      }

      const data = await response.json();
      // Store in localStorage for longer persistence
      this.setCache('location_data', data, true);
      
      this.logger.debug('Location data fetched', {
        detectedCountry: data.detectedCountryCode,
        countriesCount: data.countries?.length
      });

      return await this.applyCountryFiltering(data);
    } catch (error) {
      this.logger.error('Failed to fetch location data:', error);
      return await this.applyCountryFiltering(this.getFallbackLocationData());
    }
  }

  /**
   * Get states for a specific country
   */
  public async getCountryStates(countryCode: string): Promise<CountryStatesData> {
    const cacheKey = `states_${countryCode}`;
    // Use localStorage for country states as they don't change often
    const cached = this.getFromCache(cacheKey, true);
    
    if (cached) {
      return {
        ...cached,
        states: this.applyStateFiltering(cached.states || [])
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/countries/${countryCode}/states`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch states for ${countryCode}: ${response.statusText}`);
      }

      const data = await response.json();
      // Store in localStorage for longer persistence
      this.setCache(cacheKey, data, true);
      
      this.logger.debug(`States data fetched for ${countryCode}`, {
        statesCount: data.states?.length,
        stateLabel: data.countryConfig?.stateLabel
      });

      return {
        ...data,
        states: this.applyStateFiltering(data.states || [])
      };
    } catch (error) {
      this.logger.error(`Failed to fetch states for ${countryCode}:`, error);
      // Return empty states with default config
      return {
        countryConfig: this.getDefaultCountryConfig(countryCode),
        states: []
      };
    }
  }

  /**
   * Get country configuration by country code
   */
  public async getCountryConfig(countryCode: string): Promise<CountryConfig> {
    // First try to get from location data if it's the detected country
    const locationData = await this.getLocationData();
    if (locationData.detectedCountryCode === countryCode) {
      return locationData.detectedCountryConfig;
    }

    // Otherwise fetch states data which includes country config
    const statesData = await this.getCountryStates(countryCode);
    return statesData.countryConfig;
  }

  /**
   * Validate postal code based on country configuration
   */
  public validatePostalCode(postalCode: string, _countryCode: string, countryConfig: CountryConfig): boolean {
    if (!postalCode) return false;

    // Check length constraints
    if (postalCode.length < countryConfig.postcodeMinLength || 
        postalCode.length > countryConfig.postcodeMaxLength) {
      return false;
    }

    // Check regex pattern if provided
    if (countryConfig.postcodeRegex) {
      try {
        const regex = new RegExp(countryConfig.postcodeRegex);
        return regex.test(postalCode);
      } catch (error) {
        this.logger.error('Invalid postal code regex:', error);
        return true; // Allow if regex is invalid
      }
    }

    return true;
  }

  /**
   * Clear all cached data
   */
  public clearCache(): void {
    try {
      // Remove all cache entries with our prefix from both storages
      const keysToRemove: string[] = [];
      
      // Clear from sessionStorage
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(this.cachePrefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => sessionStorage.removeItem(key));
      
      // Clear from localStorage (mainly states data)
      const localKeysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.cachePrefix)) {
          localKeysToRemove.push(key);
        }
      }
      localKeysToRemove.forEach(key => localStorage.removeItem(key));
      
      this.logger.debug(`Country service cache cleared (${keysToRemove.length} session + ${localKeysToRemove.length} local entries)`);
    } catch (error) {
      this.logger.warn('Failed to clear cache:', error);
    }
  }

  /**
   * Clear cache for a specific country
   */
  public clearCountryCache(countryCode: string): void {
    try {
      const cacheKey = this.cachePrefix + `states_${countryCode}`;
      // Clear from localStorage since states are stored there
      localStorage.removeItem(cacheKey);
      // Also clear from sessionStorage in case there's any legacy data
      sessionStorage.removeItem(cacheKey);
      this.logger.debug(`Cache cleared for country: ${countryCode}`);
    } catch (error) {
      this.logger.warn(`Failed to clear cache for country ${countryCode}:`, error);
    }
  }

  private getFromCache(key: string, useLocalStorage: boolean = false): any {
    try {
      const cacheKey = this.cachePrefix + key;
      const storage = useLocalStorage ? localStorage : sessionStorage;
      const cached = storage.getItem(cacheKey);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();

      if (now - timestamp > this.cacheExpiry) {
        storage.removeItem(cacheKey);
        return null;
      }

      return data;
    } catch (error) {
      this.logger.warn('Failed to read from cache:', error);
      return null;
    }
  }

  private setCache(key: string, data: any, useLocalStorage: boolean = false): void {
    try {
      const cacheKey = this.cachePrefix + key;
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      const storage = useLocalStorage ? localStorage : sessionStorage;
      storage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      this.logger.warn('Failed to write to cache:', error);
      // Continue without caching if storage is unavailable
    }
  }

  private getDefaultCountryConfig(countryCode: string): CountryConfig {
    // Default configurations for common countries
    const configs: Record<string, CountryConfig> = {
      US: {
        stateLabel: 'State',
        stateRequired: true,
        postcodeLabel: 'ZIP Code',
        postcodeRegex: '^\\d{5}(-\\d{4})?$',
        postcodeMinLength: 5,
        postcodeMaxLength: 10,
        postcodeExample: '12345 or 12345-6789',
        currencyCode: 'USD',
        currencySymbol: '$'
      },
      CA: {
        stateLabel: 'Province',
        stateRequired: true,
        postcodeLabel: 'Postal Code',
        postcodeRegex: '^[A-Z]\\d[A-Z] ?\\d[A-Z]\\d$',
        postcodeMinLength: 6,
        postcodeMaxLength: 7,
        postcodeExample: 'K1A 0B1',
        currencyCode: 'CAD',
        currencySymbol: '$'
      },
      GB: {
        stateLabel: 'County',
        stateRequired: false,
        postcodeLabel: 'Postcode',
        postcodeRegex: '^[A-Z]{1,2}\\d{1,2}[A-Z]?\\s?\\d[A-Z]{2}$',
        postcodeMinLength: 5,
        postcodeMaxLength: 8,
        postcodeExample: 'SW1A 1AA',
        currencyCode: 'GBP',
        currencySymbol: '£'
      }
    };

    return configs[countryCode] || {
      stateLabel: 'State/Province',
      stateRequired: false,
      postcodeLabel: 'Postal Code',
      postcodeRegex: null,
      postcodeMinLength: 2,
      postcodeMaxLength: 20,
      postcodeExample: null,
      currencyCode: 'USD',
      currencySymbol: '$'
    };
  }

  private getFallbackLocationData(): LocationData {
    // Minimal fallback data for when API is unavailable
    return {
      detectedCountryCode: 'US',
      detectedCountryConfig: this.getDefaultCountryConfig('US'),
      detectedStates: [],
      countries: [
        { code: 'US', name: 'United States', phonecode: '+1', currencyCode: 'USD', currencySymbol: '$' },
        { code: 'CA', name: 'Canada', phonecode: '+1', currencyCode: 'CAD', currencySymbol: '$' },
        { code: 'GB', name: 'United Kingdom', phonecode: '+44', currencyCode: 'GBP', currencySymbol: '£' },
        { code: 'AU', name: 'Australia', phonecode: '+61', currencyCode: 'AUD', currencySymbol: '$' },
        { code: 'DE', name: 'Germany', phonecode: '+49', currencyCode: 'EUR', currencySymbol: '€' }
      ]
    };
  }

  private async applyCountryFiltering(data: LocationData): Promise<LocationData> {
    let filteredCountries = [...data.countries];
    
    // Apply custom countries list if provided
    if (this.config.countries && this.config.countries.length > 0) {
      filteredCountries = this.config.countries.map(customCountry => ({
        code: customCountry.code,
        name: customCountry.name,
        phonecode: '',
        currencyCode: 'USD',
        currencySymbol: '$'
      }));
    }
    // Apply showCountries filter if provided
    else if (this.config.showCountries && this.config.showCountries.length > 0) {
      filteredCountries = filteredCountries.filter(country => 
        this.config.showCountries!.includes(country.code)
      );
    }
    
    // IMPORTANT: Preserve the original detected country config for currency purposes
    // Even if the country is not in the allowed shipping list, we want to keep
    // the detected currency (e.g., show CAD for Canadian users even if only shipping to US)
    const originalDetectedCountryConfig = data.detectedCountryConfig;
    
    // Use detected country or fall back to default if detection failed
    let detectedCountryCode = data.detectedCountryCode;
    let detectedCountryConfig = data.detectedCountryConfig;
    
    // Check if detected country is in the allowed list
    const detectedCountryAllowed = filteredCountries.some(country => 
      country.code === detectedCountryCode
    );
    
    // Only change the country code for shipping purposes when:
    // 1. No country was detected, OR
    // 2. The detected country is not in the allowed shipping list
    if ((!detectedCountryCode || !detectedCountryAllowed) && this.config.defaultCountry) {
      const defaultCountryExists = filteredCountries.some(country => 
        country.code === this.config.defaultCountry
      );
      
      if (defaultCountryExists) {
        this.logger.info(`Using default country ${this.config.defaultCountry} for shipping (detected: ${detectedCountryCode}, allowed: ${detectedCountryAllowed})`);
        this.logger.info(`Preserving detected currency: ${originalDetectedCountryConfig.currencyCode} from detected location: ${data.detectedCountryCode}`);
        
        // Only change the country code for shipping dropdown default
        // Keep the original detected country config for currency
        detectedCountryCode = this.config.defaultCountry;
        
        // KEEP the original detected currency config, don't replace it
        // This ensures Canadian users see CAD even if only US shipping is allowed
        detectedCountryConfig = originalDetectedCountryConfig;
      }
    } else if (detectedCountryCode && detectedCountryAllowed) {
      this.logger.info(`Using detected country: ${detectedCountryCode}`);
    }
    
    return {
      ...data,
      countries: filteredCountries,
      detectedCountryCode,
      detectedCountryConfig  // This will be the original detected config for currency
    };
  }

  private applyStateFiltering(states: State[]): State[] {
    // Hardcoded US territories to exclude
    const US_TERRITORIES_TO_HIDE = [
      "AS", "UM-81", "GU", "UM-84", "UM-86", "UM-67", 
      "UM-89", "UM-71", "UM-76", "MP", "UM-95", "PR", 
      "UM", "VI", "UM-79"
    ];
    
    // Apply hardcoded filtering first
    let filteredStates = states.filter(state => 
      !US_TERRITORIES_TO_HIDE.includes(state.code)
    );
    
    // Then apply config-based filtering if any
    if (this.config.dontShowStates && this.config.dontShowStates.length > 0) {
      filteredStates = filteredStates.filter(state => 
        !this.config.dontShowStates!.includes(state.code)
      );
    }
    
    return filteredStates;
  }
} 