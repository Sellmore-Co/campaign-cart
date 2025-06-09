/**
 * CountryCampaignManager - Manages country detection and switching
 * 
 * This class handles:
 * - Country detection via cached localization data
 * - Country switching for UI/display purposes
 * - Syncing country selection with checkout forms
 */

export class CountryCampaignManager {
  #app;
  #logger;
  #currentCountry = null;
  #isInitialized = false;

  constructor(app) {
    this.#app = app;
    this.#logger = app.logger.createModuleLogger('COUNTRY_CAMPAIGN');
    this.#logger.info('CountryCampaignManager initialized');
  }

  /**
   * Initialize the country system
   */
  async init() {
    this.#logger.info('Initializing country system');
    
    try {
      // Detect user's country
      const detectedCountry = await this.#detectUserCountry();
      this.#logger.info(`🌍 Detected country: ${detectedCountry}`);
      
      // Set current country
      this.#currentCountry = detectedCountry;
      this.#isInitialized = true;
      
      // Fire initialization complete event
      this.#triggerCountryEvent('initialized', detectedCountry);
      
      return { country: detectedCountry };
    } catch (error) {
      this.#logger.error('Failed to initialize country system:', error);
      
      // Fall back to default
      const fallbackCountry = 'US';
      this.#currentCountry = fallbackCountry;
      this.#isInitialized = true;
      
      this.#triggerCountryEvent('initialized', fallbackCountry);
      
      return { country: fallbackCountry };
    }
  }

  /**
   * Detect user's country using cached localization data
   */
  async #detectUserCountry() {
    this.#logger.info('🔍 Starting country detection...');
    
    // Check for force country parameter first
    const urlParams = new URLSearchParams(window.location.search);
    const forceCountry = urlParams.get('forceCountry');
    
    if (forceCountry) {
      const forcedCountry = forceCountry.toUpperCase();
      this.#logger.info(`🔧 Using forced country from URL: ${forcedCountry} (bypassing validation)`);
      this.#storeCountrySelection(forcedCountry);
      return forcedCountry;
    }
    
    // Check for previously selected country (valid for 24 hours)
    const storedCountry = this.#getStoredCountry();
    if (storedCountry) {
      this.#logger.info(`💾 Using previously selected country: ${storedCountry}`);
      return this.#validateCountryAgainstConfig(storedCountry);
    }

    // Use globally cached localization data
    const localizationData = window.osLocalizationData;
    if (localizationData && localizationData.detectedCountryCode) {
      const detectedCountry = localizationData.detectedCountryCode;
      this.#logger.info(`🌐 Using cached localization data: ${detectedCountry}`);
      return this.#validateCountryAgainstConfig(detectedCountry);
    }

    // Fallback to config default
    const defaultCountry = window.osConfig?.addressConfig?.defaultCountry || 'US';
    this.#logger.warn(`❌ No localization data available, using fallback: ${defaultCountry}`);
    return defaultCountry;
  }

  /**
   * Validate detected country against addressConfig settings
   * @param {string} countryCode - Country code to validate
   * @returns {string} Valid country code (may be fallback)
   */
  #validateCountryAgainstConfig(countryCode) {
    const addressConfig = window.osConfig?.addressConfig;
    const showCountries = addressConfig?.showCountries;
    const defaultCountry = addressConfig?.defaultCountry || 'US';

    // If no showCountries restriction, use detected country
    if (!showCountries || !Array.isArray(showCountries)) {
      this.#logger.debug(`No showCountries restriction, using detected: ${countryCode}`);
      return countryCode;
    }

    // Check if detected country is in allowed list
    if (showCountries.includes(countryCode)) {
      this.#logger.info(`✅ Detected country ${countryCode} is in allowed list`);
      return countryCode;
    }

    // Country not allowed, fall back to default
    this.#logger.info(`🚫 Detected country ${countryCode} not in allowed list [${showCountries.join(', ')}], falling back to: ${defaultCountry}`);
    return defaultCountry;
  }

  /**
   * Get stored country if still valid (within 24 hours)
   */
  #getStoredCountry() {
    const storedCountry = localStorage.getItem('os-selected-country');
    const storedTimestamp = localStorage.getItem('os-selected-country-timestamp');
    
    if (storedCountry && storedTimestamp) {
      const hoursSinceStored = (Date.now() - parseInt(storedTimestamp)) / (1000 * 60 * 60);
      
      if (hoursSinceStored < 24) {
        return storedCountry;
      } else {
        // Clear expired data
        this.#clearStoredCountry();
        this.#logger.info(`⏰ Stored country expired after ${Math.round(hoursSinceStored)} hours`);
      }
    }
    
    return null;
  }

  /**
   * Store country selection for persistence
   */
  #storeCountrySelection(countryCode) {
    localStorage.setItem('os-selected-country', countryCode);
    localStorage.setItem('os-selected-country-timestamp', Date.now().toString());
  }

  /**
   * Clear stored country selection
   */
  #clearStoredCountry() {
    localStorage.removeItem('os-selected-country');
    localStorage.removeItem('os-selected-country-timestamp');
  }

  /**
   * Switch to a different country
   */
  async switchCountry(newCountryCode) {
    if (!newCountryCode) {
      this.#logger.error('Cannot switch country: no country code provided');
      return { success: false, message: 'No country code provided' };
    }

    const upperCountryCode = newCountryCode.toUpperCase();

    // Guard against switching to the same country
    if (upperCountryCode === this.#currentCountry) {
      this.#logger.debug(`Country is already ${upperCountryCode}, no switch needed`);
      return { success: true, country: upperCountryCode, message: 'Already current country' };
    }

    this.#logger.info(`Switching country: ${this.#currentCountry} → ${upperCountryCode}`);

    try {
      const previousCountry = this.#currentCountry;
      this.#currentCountry = upperCountryCode;
      
      // Store the selection for persistence
      this.#storeCountrySelection(upperCountryCode);

      // Sync with checkout forms
      this.syncCountrySelection();

      // Trigger country changed event
      this.#triggerCountryEvent('changed', upperCountryCode, previousCountry);

      this.#logger.info(`✅ Successfully switched country: ${previousCountry} → ${upperCountryCode}`);
      
      return { success: true, previousCountry, country: upperCountryCode };
    } catch (error) {
      this.#logger.error(`Failed to switch country to ${upperCountryCode}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Trigger country-related events
   */
  #triggerCountryEvent(eventType, country, previousCountry = null) {
    const eventDetail = {
      country,
      previousCountry,
      manager: this
    };

    // Trigger internal app event
    if (this.#app.triggerEvent) {
      this.#app.triggerEvent(`country.${eventType}`, eventDetail);
    }

    // Trigger DOM event
    const event = new CustomEvent(`os:country.${eventType}`, {
      bubbles: true,
      detail: eventDetail
    });
    document.dispatchEvent(event);

    this.#logger.info(`🔔 Country ${eventType} event triggered: ${country}${previousCountry ? ` (from ${previousCountry})` : ''}`);
  }

  /**
   * Get current country code
   */
  getCurrentCountry() {
    return this.#currentCountry;
  }

  /**
   * Get current campaign data
   * @returns {Object} Current campaign data from the app
   */
  getCurrentCampaignData() {
    return this.#app.campaignData;
  }

  /**
   * Get current campaign ID (deprecated - always returns null)
   * @deprecated No longer switching campaigns based on country
   * @returns {null} Always returns null since we don't switch campaigns
   */
  getCurrentCampaignId() {
    return null;
  }

  /**
   * Check if manager is initialized
   */
  get isInitialized() {
    return this.#isInitialized;
  }

  /**
   * Sync country selection with checkout forms
   */
  syncCountrySelection() {
    if (!this.#currentCountry) return;

    const countrySelects = [
      document.querySelector('[os-checkout-field="country"]'),
      document.querySelector('[os-checkout-field="billing-country"]')
    ];

    countrySelects.forEach(select => {
      if (select && select.value !== this.#currentCountry) {
        this.#logger.info(`Syncing country select to: ${this.#currentCountry}`);
        select.value = this.#currentCountry;
        
        // Trigger change event to update related fields
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  }

  /**
   * Clear stored country selection and detect fresh
   */
  async resetCountryDetection() {
    this.#logger.info('Resetting country detection');
    
    this.#clearStoredCountry();
    
    // Detect fresh country
    const detectedCountry = await this.#detectUserCountry();
    
    // Switch to detected country if different
    if (detectedCountry !== this.#currentCountry) {
      return await this.switchCountry(detectedCountry);
    }
    
    return { success: true, country: detectedCountry };
  }
} 