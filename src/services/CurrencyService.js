/**
 * CurrencyService - Centralized currency management service
 * 
 * This service handles all currency-related operations including:
 * - Currency symbol determination with priority logic
 * - Currency code detection
 * - Price formatting
 * - Multi-currency conversion with exchange rates
 * - Caching for performance
 * - Country-aware currency handling
 */

export class CurrencyService {
  #app;
  #logger;
  #cache = {
    symbols: new Map(),
    codes: new Map(),
    exchangeRates: new Map(),
    exchangeRatesTimestamp: null,
    lastCountry: null,
    lastCampaignCurrency: null
  };
  
  // Event deduplication tracking
  #eventDeduplication = {
    lastEventTimestamp: null,
    lastEventCountry: null,
    lastEventCurrency: null,
    pendingRefresh: null,
    debounceDelay: 300 // 300ms debounce
  };

  // Exchange rates cache TTL (4 hours)
  #EXCHANGE_RATES_TTL = 4 * 60 * 60 * 1000;
  
  // Cloudflare Worker base URL for currency data
  #CURRENCY_WORKER_URL = 'https://cdn-countries.muddy-wind-c7ca.workers.dev';

  constructor(app) {
    this.#app = app;
    this.#logger = app.logger.createModuleLogger('CURRENCY');
    
    // Listen for events that should clear cache
    this.#setupEventListeners();
    
    this.#logger.infoWithTime('CurrencyService initialized with multi-currency support');
  }

  /**
   * Setup event listeners for localization data updates
   */
  #setupEventListeners() {
    // SINGLE EVENT: Listen for localization data updates from AddressHandler
    document.addEventListener('os:localization.updated', (event) => {
      const { countryCode, countryConfig, source } = event.detail;
      
      // DEDUPLICATION: Check if this is a duplicate event
      if (this.#isDuplicateEvent(countryCode, countryConfig.currencyCode)) {
        this.#logger.debugWithTime(`💱 [CurrencyService] Ignoring duplicate localization event: ${countryCode} → ${countryConfig.currencyCode}`);
        return;
      }
      
      this.#logger.infoWithTime(`💱 [CurrencyService] Localization updated from ${source}: ${countryCode} → ${countryConfig.currencyCode}`);
      
      // Update deduplication tracking
      this.#updateEventTracking(countryCode, countryConfig.currencyCode);
      
      // Clear cache to force fresh currency detection
      this.#clearCache();
      
      // DEBOUNCED: Update currency data and trigger UI refresh
      this.#debouncedRefreshCurrencyData(countryCode, countryConfig);
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
    // BUT ONLY if the detected country is actually supported by our country campaigns
    if (!symbol) {
      const currentLocalizationData = window.osLocalizationData || this.#app.getLocalizationData();

      if (currentLocalizationData?.detectedCountryConfig?.currencySymbol) {
        const detectedCountry = currentLocalizationData.detectedCountryCode;
        
        // Check if detected country is actually supported
        const isCountrySupported = this.#isCountrySupported(detectedCountry);
        
        if (isCountrySupported) {
          // If no specific currency code requested, use the detected one's symbol
          // OR if a currencyCode is provided, it must match the detected one's code to use its symbol
          if (!currencyCode || currencyCode === currentLocalizationData.detectedCountryConfig.currencyCode) {
            symbol = currentLocalizationData.detectedCountryConfig.currencySymbol;
            const detectedCurrency = currentLocalizationData.detectedCountryConfig.currencyCode;
            source = `current localization (${detectedCountry}/${detectedCurrency})`;
          }
        } else {
          this.#logger.debugWithTime(`💱 [CurrencyService] Detected country "${detectedCountry}" not supported, skipping its currency symbol`);
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
    
    // Priority for SINGLE CAMPAIGN setup:
    // 1. Currency code from the currently active country's localization data (HIGHEST - user's detected currency)
    // 2. Currency from CountryCampaignManager's current country (for multi-campaign setups)  
    // 3. Currency code from the loaded campaign data (base campaign currency)
    // 4. Fallback to USD
    
    // Debug current state - only log verbose details if debug level is enabled
    if (this.#logger.isDebugEnabled) {
      this.#logger.debugWithTime(`💱 [CurrencyService] getCurrencyCode() - Starting currency detection...`);
    }
    
    // FIRST: Check localization data (user's detected currency) - HIGHEST PRIORITY for single campaign
    const currentLocalizationData = window.osLocalizationData || this.#app.getLocalizationData();
    const localizationCurrency = currentLocalizationData?.detectedCountryConfig?.currencyCode;
    const detectedCountry = currentLocalizationData?.detectedCountryCode;
    
    if (this.#logger.isDebugEnabled) {
      this.#logger.debugWithTime(`💱 [CurrencyService] Localization - Country: "${detectedCountry}", Currency: "${localizationCurrency}"`);
      
      // Debug stale data issue
      if (detectedCountry && detectedCountry !== 'CA') {
        const urlParams = new URLSearchParams(window.location.search);
        const forcedCountry = urlParams.get('forceCountry');
        if (forcedCountry) {
          this.#logger.debugWithTime(`💱 [CurrencyService] ⚠️ STALE DATA: forceCountry=${forcedCountry} but localization shows ${detectedCountry}`);
        }
      }
    }
    
    if (localizationCurrency && detectedCountry) {
      const isCountrySupported = this.#isCountrySupported(detectedCountry);
      
      if (isCountrySupported) {
        currency = localizationCurrency;
        source = `current localization (${detectedCountry})`;
      } else {
        this.#logger.debugWithTime(`💱 [CurrencyService] Detected country "${detectedCountry}" not supported, skipping its currency code`);
      }
    }
    
    // SECOND: Check CountryCampaignManager (for multi-campaign setups where campaigns have different currencies)
    if (!currency && this.#app.countryCampaign && this.#app.countryCampaign.isInitialized) {
      const currentCountry = this.#app.countryCampaign.getCurrentCountry();
      const currentCampaignData = this.#app.countryCampaign.getCurrentCampaignData();
      
      if (this.#logger.isDebugEnabled) {
        this.#logger.debugWithTime(`💱 [CurrencyService] CountryCampaign - Country: "${currentCountry}", Campaign Currency: "${currentCampaignData?.currency}"`);
      }
      
      // Only use campaign currency if it's different from base campaign (indicating multi-campaign setup)
      const baseCampaignData = this.#app.getCampaignData();
      if (currentCountry && currentCampaignData?.currency && 
          currentCampaignData.currency !== baseCampaignData?.currency) {
        currency = currentCampaignData.currency;
        source = `country campaign manager (${currentCountry})`;
      }
    } else if (!currency && this.#logger.isDebugEnabled) {
      this.#logger.debugWithTime(`💱 [CurrencyService] CountryCampaign not available or not initialized`);
    }
    
    // Campaign data fallback
    if (!currency) {
      const campaignData = this.#app.getCampaignData();
      if (this.#logger.isDebugEnabled) {
        this.#logger.debugWithTime(`💱 [CurrencyService] Campaign fallback - Currency: "${campaignData?.currency}"`);
      }
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
    
    this.#logger.infoWithTime(`💱 [CurrencyService] getCurrencyCode() → "${currency}" (from ${source})`);
    return currency;
  }

  /**
   * Get base currency code from campaign data
   * @returns {string} Base currency code
   */
  getBaseCurrencyCode() {
    const campaignData = this.#app.getCampaignData();
    return campaignData?.currency || 'USD';
  }

  /**
   * Format a price with currency symbol and conversion
   * @param {number} price - Price to format (in base currency)
   * @param {string} currencyCode - Optional currency code to convert to
   * @param {boolean} skipConversion - Skip currency conversion
   * @returns {string} Formatted price
   */
  formatPrice(price, currencyCode = null, skipConversion = false) {
    if (typeof price !== 'number' || isNaN(price)) {
      this.#logger.warnWithTime(`Invalid price provided: ${price}, defaulting to 0`);
      price = 0;
    }

    // Determine target currency
    const targetCurrency = currencyCode || this.getCurrencyCode();
    const baseCurrency = this.getBaseCurrencyCode();
    
    // Convert price if needed
    let convertedPrice = price;
    if (!skipConversion && targetCurrency !== baseCurrency) {
      convertedPrice = this.convertPrice(price, baseCurrency, targetCurrency);
    }

    // Get the appropriate currency symbol
    const symbol = this.getCurrencySymbol(targetCurrency);
    
    // Format with symbol + price
    const formatted = `${symbol}${convertedPrice.toFixed(2)}`;
    
    this.#logger.debugWithTime(`💱 [CurrencyService] formatPrice(${price}, ${currencyCode || 'auto'}) → "${formatted}" ${!skipConversion && targetCurrency !== baseCurrency ? `(converted from ${baseCurrency})` : ''}`);
    return formatted;
  }

  /**
   * Convert price from one currency to another
   * @param {number} amount - Amount to convert
   * @param {string} fromCurrency - Source currency code
   * @param {string} toCurrency - Target currency code
   * @returns {number} Converted amount
   */
  convertPrice(amount, fromCurrency, toCurrency) {
    if (typeof amount !== 'number' || isNaN(amount)) {
      this.#logger.warnWithTime(`Invalid amount for conversion: ${amount}`);
      return 0;
    }

    // If same currency, no conversion needed
    if (fromCurrency === toCurrency) {
      return amount;
    }

    try {
      const exchangeRate = this.#getExchangeRate(fromCurrency, toCurrency);
      const convertedAmount = amount * exchangeRate;
      
      this.#logger.debugWithTime(`💱 [CurrencyService] convertPrice(${amount} ${fromCurrency} → ${toCurrency}) = ${convertedAmount.toFixed(2)} (rate: ${exchangeRate})`);
      
      return convertedAmount;
    } catch (error) {
      this.#logger.error(`Failed to convert ${amount} from ${fromCurrency} to ${toCurrency}:`, error);
      return amount; // Return original amount if conversion fails
    }
  }

  /**
   * Get exchange rate between two currencies
   * @param {string} fromCurrency - Source currency code
   * @param {string} toCurrency - Target currency code
   * @returns {number} Exchange rate
   */
  #getExchangeRate(fromCurrency, toCurrency) {
    const rateKey = `${fromCurrency}_${toCurrency}`;
    
    // Check cache first
    if (this.#cache.exchangeRates.has(rateKey) && this.#isExchangeRateCacheValid()) {
      return this.#cache.exchangeRates.get(rateKey);
    }

    // If not cached, we need to fetch rates
    // For now, return 1 and trigger async fetch
    this.#fetchExchangeRates();
    
    // Return fallback rate of 1 (no conversion) if not available
    this.#logger.debugWithTime(`💱 [CurrencyService] Exchange rate not available for ${rateKey}, using fallback rate of 1`);
    return 1;
  }

  /**
   * Fetch exchange rates from Cloudflare Worker
   * @returns {Promise<Object>} Exchange rates data
   */
  async #fetchExchangeRates() {
    try {
      // Check if we already have valid cached rates
      if (this.#isExchangeRateCacheValid() && this.#cache.exchangeRates.size > 0) {
        this.#logger.debugWithTime('💱 [CurrencyService] Using cached exchange rates');
        return this.#getCachedExchangeRates();
      }

      this.#logger.info('💱 [CurrencyService] Fetching fresh exchange rates from worker...');
      
      // Use the correct endpoint from your worker
      const response = await fetch(`${this.#CURRENCY_WORKER_URL}/currencies/rates`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.rates) {
        // Convert your API format to internal format for caching
        const exchangeRates = {};
        const baseCurrency = data.base || 'USD';
        
        // Convert rates to FROM_TO format for internal use
        Object.entries(data.rates).forEach(([targetCurrency, rate]) => {
          exchangeRates[`${baseCurrency}_${targetCurrency}`] = rate;
          // Also add reverse rate for convenience
          if (rate > 0) {
            exchangeRates[`${targetCurrency}_${baseCurrency}`] = 1 / rate;
          }
        });
        
        // Cache the exchange rates
        this.#cacheExchangeRates(exchangeRates);
        this.#logger.info(`💱 [CurrencyService] Exchange rates cached: ${Object.keys(exchangeRates).length} rates`);
        
        return exchangeRates;
      } else {
        throw new Error('No rates in response');
      }
      
    } catch (error) {
      this.#logger.error('💱 [CurrencyService] Failed to fetch exchange rates:', error);
      
      // Return cached rates if available, even if expired
      if (this.#cache.exchangeRates.size > 0) {
        this.#logger.warn('💱 [CurrencyService] Using expired cached exchange rates');
        return this.#getCachedExchangeRates();
      }
      
      // Return empty object as fallback
      return {};
    }
  }

  /**
   * Cache exchange rates data
   * @param {Object} exchangeRates - Exchange rates object
   */
  #cacheExchangeRates(exchangeRates) {
    this.#cache.exchangeRates.clear();
    this.#cache.exchangeRatesTimestamp = Date.now();
    
    // Cache individual rates for quick lookup
    Object.entries(exchangeRates).forEach(([currencyPair, rate]) => {
      this.#cache.exchangeRates.set(currencyPair, rate);
    });
  }

  /**
   * Get cached exchange rates as object
   * @returns {Object} Cached exchange rates
   */
  #getCachedExchangeRates() {
    const rates = {};
    this.#cache.exchangeRates.forEach((rate, pair) => {
      rates[pair] = rate;
    });
    return rates;
  }

  /**
   * Check if exchange rate cache is valid
   * @returns {boolean} True if cache is valid
   */
  #isExchangeRateCacheValid() {
    if (!this.#cache.exchangeRatesTimestamp) {
      return false;
    }
    
    const age = Date.now() - this.#cache.exchangeRatesTimestamp;
    return age < this.#EXCHANGE_RATES_TTL;
  }

  /**
   * Initialize exchange rates (call this during app initialization)
   * @returns {Promise<boolean>} Success status
   */
  async initializeExchangeRates() {
    try {
      // Check if multi-currency and exchange rates are enabled
      const multiCurrencyConfig = window.osConfig?.multiCurrency;
      const isMultiCurrencyEnabled = multiCurrencyConfig?.enabled !== false;
      const isExchangeRatesEnabled = multiCurrencyConfig?.enableExchangeRates !== false;
      
      if (!isMultiCurrencyEnabled) {
        this.#logger.info('💱 [CurrencyService] Multi-currency disabled, skipping exchange rates initialization');
        return true; // Return success since this is intentional
      }
      
      if (!isExchangeRatesEnabled) {
        this.#logger.info('💱 [CurrencyService] Exchange rates disabled, skipping rates fetch');
        return true; // Return success since this is intentional
      }
      
      this.#logger.info('💱 [CurrencyService] Initializing exchange rates...');
      await this.#fetchExchangeRates();
      return true;
    } catch (error) {
      this.#logger.error('💱 [CurrencyService] Failed to initialize exchange rates:', error);
      return false;
    }
  }

  /**
   * Check if a country is supported by checking addressConfig.showCountries
   * @param {string} countryCode - Country code to check
   * @returns {boolean} True if country is supported
   */
  #isCountrySupported(countryCode) {
    // Get address configuration for country restrictions
    const addressConfig = window.osConfig?.addressConfig;
    const showCountries = addressConfig?.showCountries;
    
    // If no restriction is configured, all countries are supported
    if (!showCountries || !Array.isArray(showCountries) || showCountries.length === 0) {
      this.#logger.debugWithTime(`💱 [CurrencyService] No country restrictions configured, ${countryCode} supported`);
      return true;
    }
    
    // Check if the country is in the allowed list
    const isSupported = showCountries.includes(countryCode);
    this.#logger.debugWithTime(`💱 [CurrencyService] Country ${countryCode} ${isSupported ? 'supported' : 'not supported'} (allowed: ${showCountries.join(', ')})`);
    
    return isSupported;
  }

  /**
   * Get hardcoded currency symbol mapping (updated with correct symbols)
   * @param {string} currencyCode - Currency code
   * @returns {string} Currency symbol
   */
  #getHardcodedSymbol(currencyCode) {
    const symbols = {
      'USD': '$',
      'GBP': '£',
      'EUR': '€',
      'CAD': 'C$',
      'AUD': 'A$',
      'JPY': '¥',
      'CHF': 'CHF',
      'SEK': 'kr',
      'NOK': 'kr',
      'DKK': 'kr',
      'PLN': 'zł',
      'CZK': 'Kč',
      'HUF': 'Ft',
      'BRL': 'R$',
      'MXN': '$',
      'INR': '₹',
      'CNY': '¥',
      'KRW': '₩',
      'SGD': 'S$',
      'NZD': 'NZ$',
      'ZAR': 'R'
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
    // Don't clear exchange rates cache on country change, they're still valid
    this.#cache.lastCountry = null;
    this.#cache.lastCampaignCurrency = null;
    this.#logger.debugWithTime('💱 [CurrencyService] Cache cleared');
  }
  
  /**
   * Clear event deduplication tracking
   */
  #clearEventDeduplication() {
    if (this.#eventDeduplication.pendingRefresh) {
      clearTimeout(this.#eventDeduplication.pendingRefresh);
    }
    this.#eventDeduplication = {
      lastEventTimestamp: null,
      lastEventCountry: null,
      lastEventCurrency: null,
      pendingRefresh: null,
      debounceDelay: 300
    };
    this.#logger.debugWithTime('💱 [CurrencyService] Event deduplication tracking cleared');
  }

  /**
   * Manually refresh cached data (useful for testing or debugging)
   */
  refresh() {
    this.#logger.infoWithTime('💱 [CurrencyService] Manual refresh requested');
    this.#clearCache();
    this.#clearEventDeduplication();
    // Also refresh exchange rates
    this.#cache.exchangeRates.clear();
    this.#cache.exchangeRatesTimestamp = null;
  }

  /**
   * Check if this is a duplicate event that should be ignored
   * @param {string} countryCode - Country code
   * @param {string} currencyCode - Currency code
   * @returns {boolean} True if this is a duplicate event
   */
  #isDuplicateEvent(countryCode, currencyCode) {
    const now = Date.now();
    const timeSinceLastEvent = this.#eventDeduplication.lastEventTimestamp ? 
      now - this.#eventDeduplication.lastEventTimestamp : Infinity;
    
    // If same country and currency within debounce window, it's a duplicate
    if (timeSinceLastEvent < this.#eventDeduplication.debounceDelay &&
        this.#eventDeduplication.lastEventCountry === countryCode &&
        this.#eventDeduplication.lastEventCurrency === currencyCode) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Update event tracking for deduplication
   * @param {string} countryCode - Country code
   * @param {string} currencyCode - Currency code
   */
  #updateEventTracking(countryCode, currencyCode) {
    this.#eventDeduplication.lastEventTimestamp = Date.now();
    this.#eventDeduplication.lastEventCountry = countryCode;
    this.#eventDeduplication.lastEventCurrency = currencyCode;
  }
  
  /**
   * Debounced currency data refresh to prevent rapid successive updates
   * @param {string} countryCode - Country code
   * @param {Object} countryConfig - Country configuration
   */
  #debouncedRefreshCurrencyData(countryCode, countryConfig) {
    // Clear any pending refresh
    if (this.#eventDeduplication.pendingRefresh) {
      clearTimeout(this.#eventDeduplication.pendingRefresh);
    }
    
    // Schedule new refresh
    this.#eventDeduplication.pendingRefresh = setTimeout(() => {
      this.#refreshCurrencyData(countryCode, countryConfig);
      this.#eventDeduplication.pendingRefresh = null;
    }, this.#eventDeduplication.debounceDelay);
    
    this.#logger.debugWithTime(`💱 [CurrencyService] Currency refresh debounced for ${this.#eventDeduplication.debounceDelay}ms`);
  }

  /**
   * Refresh currency data and trigger UI updates
   * @param {string} countryCode - Country code
   * @param {Object} countryConfig - Country configuration
   */
  #refreshCurrencyData(countryCode, countryConfig) {
    // Test new detection immediately
    const newCurrency = this.getCurrencyCode();
    const newSymbol = this.getCurrencySymbol();
    
    this.#logger.infoWithTime(`💱 [CurrencyService] Currency refreshed: ${newCurrency} (${newSymbol})`);
    
    // SINGLE EVENT: Trigger display refresh for all UI components
    this.#app.triggerEvent('display.refresh', {
      currency: newCurrency,
      symbol: newSymbol,
      country: countryCode,
      source: 'CurrencyService'
    });
  }

  /**
   * Force refresh currency detection (for immediate testing)
   */
  forceRefreshCurrency() {
    this.#logger.infoWithTime('💱 [CurrencyService] Force refreshing currency detection...');
    this.#clearCache();
    
    // Get current localization data
    const localizationData = window.osLocalizationData;
    if (localizationData?.detectedCountryCode && localizationData?.detectedCountryConfig) {
      this.#refreshCurrencyData(localizationData.detectedCountryCode, localizationData.detectedCountryConfig);
    } else {
      // Fallback refresh without specific country data
      const newCurrency = this.getCurrencyCode();
      const newSymbol = this.getCurrencySymbol();
      
      this.#app.triggerEvent('display.refresh', {
        currency: newCurrency,
        symbol: newSymbol,
        country: 'unknown',
        source: 'CurrencyService'
      });
    }
    
    return { currency: this.getCurrencyCode(), symbol: this.getCurrencySymbol() };
  }

  /**
   * Get cache status for debugging
   * @returns {Object} Cache status information
   */
  getCacheStatus() {
    return {
      symbolsCached: this.#cache.symbols.size,
      codesCached: this.#cache.codes.size,
      exchangeRatesCached: this.#cache.exchangeRates.size,
      exchangeRatesAge: this.#cache.exchangeRatesTimestamp ? 
        Date.now() - this.#cache.exchangeRatesTimestamp : null,
      exchangeRatesValid: this.#isExchangeRateCacheValid(),
      lastCountry: this.#cache.lastCountry,
      lastCampaignCurrency: this.#cache.lastCampaignCurrency,
      isValid: this.#isCacheValid()
    };
  }
} 