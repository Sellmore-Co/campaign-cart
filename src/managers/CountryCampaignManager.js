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
  #detectionSource = null; // Track how country was detected

  constructor(app) {
    this.#app = app;
    this.#logger = app.logger.createModuleLogger('COUNTRY_CAMPAIGN');
    
    // Listen for localization updates from AddressHandler
    this.#setupLocalizationListener();
    
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
      
      // Fire initialization complete event (keep for initial setup)
      this.#triggerCountryEvent('initialized', detectedCountry);
      
      return { country: detectedCountry };
    } catch (error) {
      this.#logger.error('Failed to initialize country system:', error);
      
      // Fall back to default
      const fallbackCountry = 'US';
      this.#currentCountry = fallbackCountry;
      this.#isInitialized = true;
      
      // Fire initialization complete event (keep for initial setup)
      this.#triggerCountryEvent('initialized', fallbackCountry);
      
      return { country: fallbackCountry };
    }
  }

  /**
   * Detect user's country using cached localization data
   */
  async #detectUserCountry() {
    this.#logger.info('🔍 Starting country detection...');
    
    // Check for force country parameter first (highest priority)
    const urlParams = new URLSearchParams(window.location.search);
    const forceCountry = urlParams.get('forceCountry');
    
    if (forceCountry) {
      const forcedCountry = forceCountry.toUpperCase();
      this.#logger.info(`🔧 Using forced country from URL: ${forcedCountry}`);
      this.#detectionSource = 'url_force';
      this.#storeCountrySelection(forcedCountry, 'url_force');
      return forcedCountry;
    }
    
    // Check for previously selected country (valid for 24 hours and same session)
    const storedCountry = this.#getStoredCountry();
    if (storedCountry) {
      this.#logger.info(`💾 Using previously selected country: ${storedCountry.country} (source: ${storedCountry.source})`);
      this.#detectionSource = storedCountry.source;
      return this.#validateCountryAgainstConfig(storedCountry.country);
    }

    // Use globally cached localization data (detection)
    const localizationData = window.osLocalizationData;
    if (localizationData && localizationData.detectedCountryCode) {
      const detectedCountry = localizationData.detectedCountryCode;
      this.#logger.info(`🌐 Using cached localization data: ${detectedCountry}`);
      this.#detectionSource = 'detection';
      
      const validatedCountry = this.#validateCountryAgainstConfig(detectedCountry);
      this.#storeCountrySelection(validatedCountry, 'detection');
      return validatedCountry;
    }

    // Fallback to config default
    const defaultCountry = window.osConfig?.addressConfig?.defaultCountry || 'US';
    this.#logger.warn(`❌ No localization data available, using fallback: ${defaultCountry}`);
    this.#detectionSource = 'fallback';
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
   * Get stored country if still valid (within 24 hours and same session)
   */
  #getStoredCountry() {
    const storedCountry = localStorage.getItem('os-selected-country');
    const storedTimestamp = localStorage.getItem('os-selected-country-timestamp');
    const storedSource = localStorage.getItem('os-selected-country-source');
    const storedSessionId = localStorage.getItem('os-selected-country-session');
    const currentSessionId = this.#getSessionId();
    
    if (storedCountry && storedTimestamp) {
      const hoursSinceStored = (Date.now() - parseInt(storedTimestamp)) / (1000 * 60 * 60);
      
      // Check if still valid (24 hours) and same session for forced/detected countries
      if (hoursSinceStored < 24) {
        // For forced or detected countries, also check session continuity
        if ((storedSource === 'url_force' || storedSource === 'detection') && 
            storedSessionId !== currentSessionId) {
          this.#logger.info(`🔄 Country stored in different session, will re-detect`);
          this.#clearStoredCountry();
          return null;
        }
        
        return {
          country: storedCountry,
          source: storedSource || 'unknown',
          sessionId: storedSessionId
        };
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
  #storeCountrySelection(countryCode, source = 'manual') {
    localStorage.setItem('os-selected-country', countryCode);
    localStorage.setItem('os-selected-country-timestamp', Date.now().toString());
    localStorage.setItem('os-selected-country-source', source);
    localStorage.setItem('os-selected-country-session', this.#getSessionId());
    this.#logger.debug(`Stored country selection: ${countryCode} (source: ${source})`);
  }

  /**
   * Clear stored country selection
   */
  #clearStoredCountry() {
    localStorage.removeItem('os-selected-country');
    localStorage.removeItem('os-selected-country-timestamp');
    localStorage.removeItem('os-selected-country-source');
    localStorage.removeItem('os-selected-country-session');
  }

  /**
   * Switch to a different country
   */
  async switchCountry(newCountryCode, force = false) {
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
      
      // Update detection source
      const newSource = force ? 'manual_forced' : 'manual';
      this.#detectionSource = newSource;
      
      // Store the selection for persistence
      this.#storeCountrySelection(upperCountryCode, newSource);

      // Sync with checkout forms
      this.syncCountrySelection();

      // NOTE: No longer triggering country.changed events to reduce event cascade
      // Currency updates are handled via AddressHandler → os:localization.updated → CurrencyService

      this.#logger.info(`✅ Successfully switched country: ${previousCountry} → ${upperCountryCode}`);
      
      return { success: true, previousCountry, country: upperCountryCode, source: newSource };
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
        
        // Set value silently without triggering events that could cause currency reversion
        select.value = this.#currentCountry;
        
        // DO NOT trigger change event - this was causing currency to revert
        // select.dispatchEvent(new Event('change', { bubbles: true }));
        
        this.#logger.debug(`Country select synced to ${this.#currentCountry} without triggering events`);
      }
    });
  }

  /**
   * Setup listener for localization updates from AddressHandler
   */
  #setupLocalizationListener() {
    document.addEventListener('os:localization.updated', (event) => {
      const { countryCode, source } = event.detail;
      this.#logger.info(`Localization updated from ${source}: ${countryCode}`);
      
      // Update country if it's different
      if (countryCode && countryCode !== this.#currentCountry) {
        this.#logger.info(`Updating current country: ${this.#currentCountry} → ${countryCode}`);
        this.#currentCountry = countryCode;
        
        // Update source tracking if this is a manual address change
        if (source === 'AddressHandler') {
          this.#detectionSource = 'manual';
        }
        
        this.#storeCountrySelection(countryCode, this.#detectionSource || 'manual');
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
  
  /**
   * Get current session ID for country persistence
   */
  #getSessionId() {
    if (!window.osSessionId) {
      // Generate session ID based on page load time and random number
      window.osSessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    return window.osSessionId;
  }
  
  /**
   * Check if country is currently locked from changes (DEPRECATED - always returns false)
   */
  isCountryLocked() {
    return false;
  }
  
  /**
   * Get the source of current country detection
   */
  getDetectionSource() {
    return this.#detectionSource;
  }
  
  /**
   * Force unlock country (DEPRECATED - no longer needed)
   */
  forceUnlockCountry() {
    this.#logger.warn('Force unlock country called (deprecated - country locking removed)');
    this.#detectionSource = 'manual';
    return { success: true, message: 'Country locking disabled' };
  }
} 