/**
 * CurrencyManager - Manages currency detection, conversion, and display
 * 
 * This class handles currency detection based on country selection,
 * fetches exchange rates, and provides currency conversion and formatting.
 */

export class CurrencyManager {
  #app;
  #logger;
  #config;
  #cachedRates = {};
  #ratesFetchPromise = null;
  #lastRateUpdate = null;

  constructor(app) {
    this.#app = app;
    this.#logger = app.logger.createModuleLogger('CURRENCY');
    this.#config = this.#loadConfig();
    
    if (!this.#config.enabled) {
      this.#logger.info('CurrencyManager disabled via configuration');
      return;
    }

    this.#logger.info('CurrencyManager initialized');
    this.#setupEventListeners();
    this.#initializeDefaultCurrency();
  }

  /**
   * Load currency configuration from window.osConfig
   */
  #loadConfig() {
    const defaultConfig = {
      enabled: true,
      defaultCurrency: 'USD',
      supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
      autoSwitchOnCountryChange: true,
      showCurrencySelector: false,
      fallbackCurrency: 'USD',
      rateUpdateInterval: 3600000, // 1 hour
      conversionNotice: true,
      workerUrl: 'https://cdn-currency.muddy-wind-c7ca.workers.dev'
    };

    const userConfig = window.osConfig?.currencyConfig || {};
    const config = { ...defaultConfig, ...userConfig };
    
    this.#logger.debug('Currency configuration loaded:', config);
    return config;
  }

  /**
   * Set up event listeners for country changes and other triggers
   */
  #setupEventListeners() {
    // Listen for country selection changes if country system is available
    if (this.#app.state) {
      this.#app.state.subscribe('location.selectedCountryCode', this.#handleCountryChange.bind(this));
      this.#app.state.subscribe('cart', this.#handleCartChange.bind(this));
    }

    // Listen for manual currency selection
    this.#setupCurrencySelector();
  }

  /**
   * Initialize with default currency
   */
  #initializeDefaultCurrency() {
    const defaultCurrency = this.#config.defaultCurrency;
    
    // Set initial currency state if not already set
    const currentCurrency = this.#app.state.getState('currency.selected');
    if (!currentCurrency) {
      this.#setCurrency(defaultCurrency, 'default');
    }

    // Fetch initial rates for default currency
    this.#fetchCurrencyRates(defaultCurrency);
  }

  /**
   * Handle country selection changes
   */
  async #handleCountryChange(countryCode) {
    if (!this.#config.autoSwitchOnCountryChange || !countryCode) {
      return;
    }

    try {
      this.#logger.info(`Country changed to ${countryCode}, detecting currency`);
      const currencyData = await this.#getCurrencyForCountry(countryCode);
      
      if (currencyData && this.#config.supportedCurrencies.includes(currencyData.currency)) {
        this.#setCurrency(currencyData.currency, 'country-detected', currencyData);
        this.#updateCartWithNewCurrency();
      }
    } catch (error) {
      this.#logger.error('Error handling country change for currency:', error);
    }
  }

  /**
   * Handle cart changes to update currency display
   */
  #handleCartChange(cartData) {
    if (cartData && this.#app.cartDisplay) {
      // Trigger cart display update to reflect currency changes
      this.#app.cartDisplay.updateCartDisplay();
    }
  }

  /**
   * Get currency information for a specific country
   */
  async #getCurrencyForCountry(countryCode) {
    try {
      const url = `${this.#config.workerUrl}/currency/${countryCode}`;
      this.#logger.debug(`Fetching currency data for ${countryCode} from: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      this.#logger.debug(`Currency data received for ${countryCode}:`, data);
      return data;
    } catch (error) {
      this.#logger.error(`Failed to fetch currency data for ${countryCode}:`, error);
      return null;
    }
  }

  /**
   * Fetch currency exchange rates
   */
  async #fetchCurrencyRates(baseCurrency = null) {
    const currency = baseCurrency || this.#config.defaultCurrency;
    
    // Check if we already have fresh rates
    if (this.#cachedRates[currency] && this.#isRatesFresh(currency)) {
      this.#logger.debug(`Using cached rates for ${currency}`);
      return this.#cachedRates[currency];
    }

    // Prevent concurrent requests for the same currency
    if (this.#ratesFetchPromise) {
      return this.#ratesFetchPromise;
    }

    this.#ratesFetchPromise = this.#performRatesFetch(currency);
    
    try {
      const rates = await this.#ratesFetchPromise;
      this.#ratesFetchPromise = null;
      return rates;
    } catch (error) {
      this.#ratesFetchPromise = null;
      throw error;
    }
  }

  /**
   * Perform the actual rates fetch
   */
  async #performRatesFetch(baseCurrency) {
    try {
      const url = `${this.#config.workerUrl}/rates/${baseCurrency}`;
      this.#logger.info(`Fetching exchange rates for ${baseCurrency} from: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache the rates with timestamp
      this.#cachedRates[baseCurrency] = {
        ...data,
        cachedAt: Date.now()
      };
      
      this.#lastRateUpdate = Date.now();
      this.#logger.info(`Exchange rates fetched successfully for ${baseCurrency}`);
      this.#logger.debug('Rates data:', data);
      
      // Update state with new rates
      this.#app.state.setState('currency.rates', data, false);
      
      return data;
    } catch (error) {
      this.#logger.error(`Failed to fetch exchange rates for ${baseCurrency}:`, error);
      
      // Fall back to cached rates if available
      if (this.#cachedRates[baseCurrency]) {
        this.#logger.warn(`Using stale cached rates for ${baseCurrency}`);
        return this.#cachedRates[baseCurrency];
      }
      
      // Use fallback static rates
      return this.#getFallbackRates(baseCurrency);
    }
  }

  /**
   * Check if cached rates are still fresh
   */
  #isRatesFresh(currency) {
    const cached = this.#cachedRates[currency];
    if (!cached || !cached.cachedAt) {
      return false;
    }
    
    const age = Date.now() - cached.cachedAt;
    return age < this.#config.rateUpdateInterval;
  }

  /**
   * Get fallback exchange rates when API is unavailable
   */
  #getFallbackRates(baseCurrency) {
    this.#logger.warn(`Using fallback rates for ${baseCurrency}`);
    
    // Static fallback rates (should be periodically updated)
    const fallbackRates = {
      USD: { EUR: 0.85, GBP: 0.79, CAD: 1.25, AUD: 1.35, USD: 1.00 },
      EUR: { USD: 1.18, GBP: 0.93, CAD: 1.47, AUD: 1.59, EUR: 1.00 },
      GBP: { USD: 1.27, EUR: 1.08, CAD: 1.58, AUD: 1.71, GBP: 1.00 },
      CAD: { USD: 0.80, EUR: 0.68, GBP: 0.63, AUD: 1.08, CAD: 1.00 },
      AUD: { USD: 0.74, EUR: 0.63, GBP: 0.58, CAD: 0.93, AUD: 1.00 }
    };

    const rates = fallbackRates[baseCurrency] || fallbackRates.USD;
    
    return {
      base: baseCurrency,
      rates: rates,
      lastUpdated: new Date().toISOString(),
      isFallback: true
    };
  }

  /**
   * Set the current currency
   */
  #setCurrency(currencyCode, source = 'manual', currencyData = null) {
    if (!this.#config.supportedCurrencies.includes(currencyCode)) {
      this.#logger.warn(`Currency ${currencyCode} not supported, falling back to ${this.#config.fallbackCurrency}`);
      currencyCode = this.#config.fallbackCurrency;
    }

    const currencyInfo = currencyData || this.#getCurrencyInfo(currencyCode);
    
    // Update currency state
    this.#app.state.setState('currency.selected', {
      code: currencyCode,
      symbol: currencyInfo.symbol,
      name: currencyInfo.name,
      source: source
    }, false);

    this.#app.state.setState('currency.formatting', currencyInfo.formatting || this.#getDefaultFormatting(currencyCode), false);

    this.#logger.info(`Currency set to ${currencyCode} (${source})`);

    // Fetch fresh rates for the new currency
    this.#fetchCurrencyRates(currencyCode);

    // Trigger cart recalculation with new currency
    this.#updateCartWithNewCurrency();
  }

  /**
   * Get currency information for display
   */
  #getCurrencyInfo(currencyCode) {
    const currencyMap = {
      USD: { symbol: '$', name: 'US Dollar' },
      EUR: { symbol: '€', name: 'Euro' },
      GBP: { symbol: '£', name: 'British Pound' },
      CAD: { symbol: 'C$', name: 'Canadian Dollar' },
      AUD: { symbol: 'A$', name: 'Australian Dollar' }
    };

    return currencyMap[currencyCode] || { symbol: currencyCode, name: currencyCode };
  }

  /**
   * Get default formatting for a currency
   */
  #getDefaultFormatting(currencyCode) {
    const formatMap = {
      USD: { decimal: '.', thousands: ',', precision: 2, format: '%s%v' },
      EUR: { decimal: ',', thousands: '.', precision: 2, format: '%v %s' },
      GBP: { decimal: '.', thousands: ',', precision: 2, format: '%s%v' },
      CAD: { decimal: '.', thousands: ',', precision: 2, format: '%s%v' },
      AUD: { decimal: '.', thousands: ',', precision: 2, format: '%s%v' }
    };

    return formatMap[currencyCode] || { decimal: '.', thousands: ',', precision: 2, format: '%s%v' };
  }

  /**
   * Update cart totals with new currency
   */
  #updateCartWithNewCurrency() {
    const currentCurrency = this.#app.state.getState('currency.selected');
    if (!currentCurrency) return;

    // Update cart currency information
    this.#app.state.setState('cart.totals.currency', currentCurrency.code, false);
    this.#app.state.setState('cart.totals.currency_symbol', currentCurrency.symbol, false);

    // Trigger cart display update
    if (this.#app.cartDisplay) {
      this.#app.cartDisplay.updateCartDisplay();
    }

    // Notify about currency change
    this.#app.triggerEvent('currency.changed', {
      currency: currentCurrency,
      rates: this.#app.state.getState('currency.rates')
    });
  }

  /**
   * Convert amount from one currency to another
   */
  convertPrice(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    const rates = this.#app.state.getState('currency.rates.rates');
    if (!rates) {
      this.#logger.warn('No exchange rates available for conversion');
      return amount;
    }

    try {
      let convertedAmount = amount;
      
      // Convert to base currency first if needed
      const baseCurrency = this.#app.state.getState('currency.rates.base') || 'USD';
      if (fromCurrency !== baseCurrency) {
        const fromRate = rates[fromCurrency];
        if (!fromRate) {
          throw new Error(`No rate available for ${fromCurrency}`);
        }
        convertedAmount = amount / fromRate;
      }

      // Convert from base to target currency
      if (toCurrency !== baseCurrency) {
        const toRate = rates[toCurrency];
        if (!toRate) {
          throw new Error(`No rate available for ${toCurrency}`);
        }
        convertedAmount = convertedAmount * toRate;
      }

      return convertedAmount;
    } catch (error) {
      this.#logger.error(`Currency conversion failed (${fromCurrency} → ${toCurrency}):`, error);
      return amount;
    }
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount, currencyCode = null) {
    const currency = currencyCode || this.#app.state.getState('currency.selected.code') || 'USD';
    const formatting = this.#app.state.getState('currency.formatting') || this.#getDefaultFormatting(currency);
    const symbol = this.#app.state.getState('currency.selected.symbol') || this.#getCurrencyInfo(currency).symbol;

    try {
      // Round to specified precision
      const rounded = Math.round(amount * Math.pow(10, formatting.precision)) / Math.pow(10, formatting.precision);
      
      // Format with thousands separator
      const parts = rounded.toFixed(formatting.precision).split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, formatting.thousands);
      const formattedNumber = parts.join(formatting.decimal);

      // Apply format template
      return formatting.format.replace('%s', symbol).replace('%v', formattedNumber);
    } catch (error) {
      this.#logger.error('Currency formatting error:', error);
      return `${symbol}${amount.toFixed(2)}`;
    }
  }

  /**
   * Set up currency selector UI if enabled
   */
  #setupCurrencySelector() {
    if (!this.#config.showCurrencySelector) {
      return;
    }

    // Look for currency selector elements
    const selectors = document.querySelectorAll('[data-os-currency-selector]');
    selectors.forEach(selector => {
      this.#initializeCurrencySelector(selector);
    });
  }

  /**
   * Initialize a currency selector element
   */
  #initializeCurrencySelector(selector) {
    // Populate with supported currencies
    selector.innerHTML = this.#config.supportedCurrencies
      .map(currency => {
        const info = this.#getCurrencyInfo(currency);
        return `<option value="${currency}">${currency} - ${info.name}</option>`;
      })
      .join('');

    // Set current value
    const currentCurrency = this.#app.state.getState('currency.selected.code');
    if (currentCurrency) {
      selector.value = currentCurrency;
    }

    // Listen for changes
    selector.addEventListener('change', (e) => {
      this.#setCurrency(e.target.value, 'user-selected');
    });

    this.#logger.debug('Currency selector initialized');
  }

  /**
   * Public API methods
   */

  /**
   * Manually set currency
   */
  setCurrency(currencyCode) {
    this.#setCurrency(currencyCode, 'api-call');
  }

  /**
   * Get current currency information
   */
  getCurrentCurrency() {
    return this.#app.state.getState('currency.selected');
  }

  /**
   * Get supported currencies
   */
  getSupportedCurrencies() {
    return this.#config.supportedCurrencies;
  }

  /**
   * Get current exchange rates
   */
  getCurrentRates() {
    return this.#app.state.getState('currency.rates');
  }

  /**
   * Check if currency system is enabled
   */
  isEnabled() {
    return this.#config.enabled;
  }

  /**
   * Refresh exchange rates
   */
  async refreshRates() {
    const currentCurrency = this.#app.state.getState('currency.selected.code');
    if (currentCurrency) {
      // Clear cache to force refresh
      delete this.#cachedRates[currentCurrency];
      await this.#fetchCurrencyRates(currentCurrency);
    }
  }
}