/**
 * CurrencyService - Centralized currency management service
 * 
 * This service handles all currency-related operations including:
 * - Currency symbol determination with priority logic
 * - Currency code detection
 * - Price formatting
 * - Caching for performance
 * - Country-aware currency handling
 */

export class CurrencyService {
  #app;
  #logger;
  #cache = {
    symbols: new Map(),
    codes: new Map(),
    lastCountry: null,
    lastCampaignCurrency: null
  };

  constructor(app) {
    this.#app = app;
    this.#logger = app.logger.createModuleLogger('CURRENCY');
    
    // Listen for events that should clear cache
    this.#setupEventListeners();
    
    this.#logger.infoWithTime('CurrencyService initialized');
  }

  /**
   * Setup event listeners for cache invalidation
   */
  #setupEventListeners() {
    // Clear cache when country changes
    document.addEventListener('os:country.changed', () => {
      this.#clearCache();
      this.#logger.debugWithTime('Cache cleared due to country change');
    });

    // Clear cache when campaign data is loaded
    document.addEventListener('os:campaign.loaded', () => {
      this.#clearCache();
      this.#logger.debugWithTime('Cache cleared due to campaign data load');
    });

    // Clear cache when country campaign is initialized
    document.addEventListener('os:country-campaign.initialized', () => {
      this.#clearCache();
      this.#logger.debugWithTime('Cache cleared due to country campaign initialization');
    });
  }

  /**
   * Get currency symbol with priority logic
   * @param {string} currencyCode - Optional currency code, defaults to detected currency
   * @returns {string} Currency symbol
   */
  getCurrencySymbol(currencyCode = null) {
    // Create cache key
    const cacheKey = currencyCode || 'auto';
    
    // Check cache first
    if (this.#cache.symbols.has(cacheKey) && this.#isCacheValid()) {
      const cachedSymbol = this.#cache.symbols.get(cacheKey);
      this.#logger.debugWithTime(`💱 [CurrencyService] getCurrencySymbol(${currencyCode || 'auto'}) → "${cachedSymbol}" (cached)`);
      return cachedSymbol;
    }

    let symbol, source;
    
    // Priority:
    // 1. Symbol from CountryCampaignManager's current country data
    // 2. Symbol from window.osLocalizationData (updated by AddressHandler)
    // 3. Fallback to hardcoded mapping
    
    // Check CountryCampaignManager first if available and initialized
    if (this.#app.countryCampaign && this.#app.countryCampaign.isInitialized) {
      const currentCountry = this.#app.countryCampaign.getCurrentCountry();
      
      // Try to get symbol from cached country configs (AddressHandler caches these)
      if (currentCountry && window.osConfig?.countryConfigs?.[currentCountry]?.currencySymbol) {
        const countrySymbol = window.osConfig.countryConfigs[currentCountry].currencySymbol;
        const countryCode = window.osConfig.countryConfigs[currentCountry].currencyCode;
        
        // Use this symbol if no specific currency requested OR if it matches the requested currency
        if (!currencyCode || currencyCode === countryCode) {
          symbol = countrySymbol;
          source = `country campaign manager configs (${currentCountry}/${countryCode})`;
        }
      }
    }
    
    // Fallback to window.osLocalizationData (updated by AddressHandler)
    if (!symbol) {
      const currentLocalizationData = window.osLocalizationData || this.#app.getLocalizationData();

      if (currentLocalizationData?.detectedCountryConfig?.currencySymbol) {
        // If no specific currency code requested, use the detected one's symbol
        // OR if a currencyCode is provided, it must match the detected one's code to use its symbol
        if (!currencyCode || currencyCode === currentLocalizationData.detectedCountryConfig.currencyCode) {
          symbol = currentLocalizationData.detectedCountryConfig.currencySymbol;
          const country = currentLocalizationData.detectedCountryCode;
          const detectedCurrency = currentLocalizationData.detectedCountryConfig.currencyCode;
          source = `current localization (${country}/${detectedCurrency})`;
        }
      }
    }

    // Final fallback to hardcoded mapping
    if (!symbol) {
      symbol = this.#getHardcodedSymbol(currencyCode);
      source = `fallback mapping for ${currencyCode || 'default'}`;
    }
    
    // Cache the result
    this.#cache.symbols.set(cacheKey, symbol);
    this.#updateCacheValidation();
    
    this.#logger.debugWithTime(`💱 [CurrencyService] getCurrencySymbol(${currencyCode || 'auto'}) → "${symbol}" (from ${source})`);
    return symbol;
  }

  /**
   * Get currency code with priority logic
   * @returns {string} Currency code
   */
  getCurrencyCode() {
    // Check cache first
    if (this.#cache.codes.has('current') && this.#isCacheValid()) {
      const cachedCode = this.#cache.codes.get('current');
      this.#logger.debugWithTime(`💱 [CurrencyService] getCurrencyCode() → "${cachedCode}" (cached)`);
      return cachedCode;
    }

    let currency, source;
    
    // Priority:
    // 1. Currency from CountryCampaignManager's current country (most authoritative)
    // 2. Currency code from the currently active country's localization data  
    // 3. Currency code from the loaded campaign data
    // 4. Fallback to USD
    
    // Check CountryCampaignManager first if available and initialized
    if (this.#app.countryCampaign && this.#app.countryCampaign.isInitialized) {
      const currentCountry = this.#app.countryCampaign.getCurrentCountry();
      const currentCampaignData = this.#app.countryCampaign.getCurrentCampaignData();
      
      if (currentCountry && currentCampaignData?.currency) {
        currency = currentCampaignData.currency;
        source = `country campaign manager (${currentCountry})`;
      }
    }
    
    // Fallback to localization data
    if (!currency) {
      const currentLocalizationData = window.osLocalizationData || this.#app.getLocalizationData();
      const localizationCurrency = currentLocalizationData?.detectedCountryConfig?.currencyCode;
      
      if (localizationCurrency) {
        currency = localizationCurrency;
        source = `current localization (${currentLocalizationData.detectedCountryCode || 'unknown'})`;
      }
    }
    
    // Campaign data fallback
    if (!currency) {
      const campaignData = this.#app.getCampaignData();
      if (campaignData?.currency) {
        currency = campaignData.currency;
        source = 'campaign data';
      }
    }
    
    // Final fallback
    if (!currency) {
      currency = 'USD';
      source = 'default fallback';
    }
    
    // Cache the result
    this.#cache.codes.set('current', currency);
    this.#updateCacheValidation();
    
    this.#logger.debugWithTime(`💱 [CurrencyService] getCurrencyCode() → "${currency}" (from ${source})`);
    return currency;
  }

  /**
   * Format a price with currency symbol
   * @param {number} price - Price to format
   * @param {string} currencyCode - Optional currency code
   * @returns {string} Formatted price
   */
  formatPrice(price, currencyCode = null) {
    if (typeof price !== 'number' || isNaN(price)) {
      this.#logger.warnWithTime(`Invalid price provided: ${price}, defaulting to 0`);
      price = 0;
    }

    // Get the appropriate currency symbol
    const symbol = this.getCurrencySymbol(currencyCode);
    
    // Format with symbol + price (currency code is handled separately)
    const formatted = `${symbol}${price.toFixed(2)}`;
    
    this.#logger.debugWithTime(`💱 [CurrencyService] formatPrice(${price}, ${currencyCode || 'auto'}) → "${formatted}"`);
    return formatted;
  }

  /**
   * Get hardcoded currency symbol mapping
   * @param {string} currencyCode - Currency code
   * @returns {string} Currency symbol
   */
  #getHardcodedSymbol(currencyCode) {
    const symbols = {
      'USD': '$',
      'GBP': '£',
      'EUR': '€',
      'CAD': '$',
      'AUD': '$',
      'JPY': '¥',
      'CHF': 'CHF',
      'SEK': 'kr',
      'NOK': 'kr',
      'DKK': 'kr'
    };
    
    return symbols[currencyCode] || '$'; // Default to '$' if no specific match
  }

  /**
   * Check if cache is still valid
   * @returns {boolean} True if cache is valid
   */
  #isCacheValid() {
    // Get current state for comparison
    const currentCountry = this.#app.countryCampaign?.getCurrentCountry();
    const currentCampaignData = this.#app.countryCampaign?.getCurrentCampaignData();
    const currentCampaignCurrency = currentCampaignData?.currency;

    // Cache is invalid if country or campaign currency changed
    if (this.#cache.lastCountry !== currentCountry || 
        this.#cache.lastCampaignCurrency !== currentCampaignCurrency) {
      return false;
    }

    return true;
  }

  /**
   * Update cache validation markers
   */
  #updateCacheValidation() {
    this.#cache.lastCountry = this.#app.countryCampaign?.getCurrentCountry();
    const currentCampaignData = this.#app.countryCampaign?.getCurrentCampaignData();
    this.#cache.lastCampaignCurrency = currentCampaignData?.currency;
  }

  /**
   * Clear all cached data
   */
  #clearCache() {
    this.#cache.symbols.clear();
    this.#cache.codes.clear();
    this.#cache.lastCountry = null;
    this.#cache.lastCampaignCurrency = null;
    this.#logger.debugWithTime('💱 [CurrencyService] Cache cleared');
  }

  /**
   * Manually refresh cached data (useful for testing or debugging)
   */
  refresh() {
    this.#logger.infoWithTime('💱 [CurrencyService] Manual refresh requested');
    this.#clearCache();
  }

  /**
   * Get cache status for debugging
   * @returns {Object} Cache status information
   */
  getCacheStatus() {
    return {
      symbolsCached: this.#cache.symbols.size,
      codesCached: this.#cache.codes.size,
      lastCountry: this.#cache.lastCountry,
      lastCampaignCurrency: this.#cache.lastCampaignCurrency,
      isValid: this.#isCacheValid()
    };
  }
} 