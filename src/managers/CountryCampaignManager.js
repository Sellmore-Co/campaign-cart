/**
 * CountryCampaignManager - Manages country-specific campaigns and currency
 * 
 * This class handles:
 * - Country detection via Cloudflare Worker /location endpoint
 * - Fetching country-specific campaign data
 * - Package ID translation between campaigns
 * - Dynamic country switching with cart updates
 */

export class CountryCampaignManager {
  #app;
  #logger;
  #currentCountry = null;
  #cachedCampaigns = new Map(); // Map of country -> campaign data
  #config = {
    campaignIds: {}
  };
  #isInitialized = false;

  constructor(app) {
    this.#app = app;
    this.#logger = app.logger.createModuleLogger('COUNTRY_CAMPAIGN');
    this.#loadConfig();
    this.#logger.info('CountryCampaignManager initialized');
  }

  /**
   * Load configuration from window.osConfig
   */
  #loadConfig() {
    if (window.osConfig?.countryCampaigns) {
      this.#config.campaignIds = window.osConfig.countryCampaigns.campaignIds || {};
      
      this.#logger.info('Loaded country campaigns configuration:', {
        countries: Object.keys(this.#config.campaignIds)
      });
    } else {
      this.#logger.warn('No countryCampaigns configuration found in window.osConfig');
    }

    // Check for product profiles configuration
    if (window.osConfig?.productProfiles) {
      const profiles = Object.keys(window.osConfig.productProfiles);
      this.#logger.info('Found product profiles configuration:', {
        profiles: profiles
      });
    } else {
      this.#logger.warn('No productProfiles configuration found in window.osConfig');
    }
  }

  /**
   * Initialize the country campaign system
   */
  async init() {
    this.#logger.info('Initializing country campaign system');
    
    try {
      // Step 1: Detect user's country
      const detectedCountry = await this.#detectUserCountry();
      this.#logger.info(`🌍 [CountryCampaign] Detected country: ${detectedCountry}`);
      
      // Step 2: Get the appropriate campaign ID
      const campaignId = this.#getCampaignIdForCountry(detectedCountry);
      this.#logger.info(`📋 [CountryCampaign] Campaign ID for ${detectedCountry}: ${campaignId}`);
      
      // Step 3: Update API client to use this campaign
      this.#updateApiClientCampaign(campaignId);
      
      // Step 4: Set current country
      this.#currentCountry = detectedCountry;
      
      this.#isInitialized = true;
      this.#logger.info(`✅ [CountryCampaign] System initialized - Country: ${detectedCountry}, Campaign: ${campaignId}`);
      
      // Fire initialization complete event for other managers to sync
      this.#logger.info(`🔔 [CountryCampaign] Firing country-campaign.initialized event for: ${detectedCountry}`);
      const event = new CustomEvent('os:country-campaign.initialized', {
        bubbles: true,
        detail: {
          country: detectedCountry,
          campaignId: campaignId,
          manager: this
        }
      });
      document.dispatchEvent(event);
      this.#logger.info(`🔔 [CountryCampaign] Event dispatched successfully`);
      
      return {
        country: detectedCountry,
        campaignId: campaignId
      };
    } catch (error) {
      this.#logger.error('Failed to initialize country campaign system:', error);
      // Fall back to default behavior
      this.#isInitialized = true;
      
      // Still fire event even on error for consistency
      const event = new CustomEvent('os:country-campaign.initialized', {
        bubbles: true,
        detail: {
          country: 'US', // Safe fallback
          campaignId: null,
          manager: this
        }
      });
      document.dispatchEvent(event);
      
      return null;
    }
  }

  /**
   * Detect user's country using globally cached localization data
   */
  async #detectUserCountry() {
    this.#logger.info('🔍 [CountryCampaign] Starting country detection...');
    
    // Check for force country parameter first
    const urlParams = new URLSearchParams(window.location.search);
    const forceCountry = urlParams.get('forceCountry');
    
    if (forceCountry) {
      this.#logger.info(`🔧 [CountryCampaign] Using forced country from URL parameter: ${forceCountry}`);
      // Store forced country for persistence
      localStorage.setItem('os-forced-country', forceCountry.toUpperCase());
      localStorage.setItem('os-forced-country-timestamp', Date.now().toString());
      return forceCountry.toUpperCase();
    }
    
    // Check for previously forced/selected country (valid for 24 hours)
    const storedCountry = localStorage.getItem('os-forced-country');
    const storedTimestamp = localStorage.getItem('os-forced-country-timestamp');
    
    if (storedCountry && storedTimestamp) {
      const hoursSinceStored = (Date.now() - parseInt(storedTimestamp)) / (1000 * 60 * 60);
      
      if (hoursSinceStored < 24) {
        this.#logger.info(`💾 [CountryCampaign] Using previously selected country: ${storedCountry} (${Math.round(hoursSinceStored)}h ago)`);
        return storedCountry;
      } else {
        // Clear expired stored country
        localStorage.removeItem('os-forced-country');
        localStorage.removeItem('os-forced-country-timestamp');
        this.#logger.info(`⏰ [CountryCampaign] Stored country expired after ${Math.round(hoursSinceStored)} hours, detecting fresh`);
      }
    }

    // Use globally cached localization data (should always be available)
    const localizationData = window.osLocalizationData;
    if (localizationData && localizationData.detectedCountryCode) {
      const detectedCountry = localizationData.detectedCountryCode;
      this.#logger.info(`🌐 [CountryCampaign] Using cached localization data for country: ${detectedCountry}`);
      
      // CHECK: Is this detected country actually supported by our configuration?
      if (this.#config.campaignIds[detectedCountry]) {
        this.#logger.info(`✅ [CountryCampaign] Detected country ${detectedCountry} is supported`);
        return detectedCountry;
      } else {
        // Country not supported, use configured default
        const defaultCountry = window.osConfig?.addressConfig?.defaultCountry || 'US';
        this.#logger.warn(`⚠️ [CountryCampaign] Detected country ${detectedCountry} not supported, using default: ${defaultCountry}`);
        return defaultCountry;
      }
    }

    // Should not happen since TwentyNineNext loads this first
    this.#logger.error('❌ [CountryCampaign] No global localization data available! TwentyNineNext should have loaded this first.');
    return window.osConfig?.addressConfig?.defaultCountry || 'US'; // Safe fallback
  }

  /**
   * Get campaign ID for a specific country
   */
  #getCampaignIdForCountry(countryCode) {
    const campaignId = this.#config.campaignIds[countryCode];
    
    if (campaignId) {
      this.#logger.debug(`Found campaign ID for ${countryCode}: ${campaignId}`);
      return campaignId;
    }

    // Fall back to US campaign or first available campaign
    const fallbackCampaignId = this.#config.campaignIds['US'] || Object.values(this.#config.campaignIds)[0];
    
    if (fallbackCampaignId) {
      this.#logger.warn(`No campaign found for ${countryCode}, using fallback: ${fallbackCampaignId}`);
      return fallbackCampaignId;
    }

    this.#logger.error(`No campaign configuration found for ${countryCode} and no fallback available`);
    return null;
  }

  /**
   * Update the API client to use a specific campaign ID
   */
  #updateApiClientCampaign(campaignId) {
    if (!campaignId) {
      this.#logger.warn('Cannot update API client: no campaign ID provided');
      return;
    }

    // Update the API client's campaign ID by storing in session storage
    // The API client will pick this up on its next init or request
    sessionStorage.setItem('os-campaign-id', campaignId);
    
    this.#logger.debug(`Updated session storage with campaign ID: ${campaignId}`);
    
    // Update API client directly
    if (this.#app.api && typeof this.#app.api.updateCampaignId === 'function') {
      this.#app.api.updateCampaignId(campaignId);
      this.#logger.debug(`Updated API client to use campaign: ${campaignId}`);
    } else {
      this.#logger.warn('API client updateCampaignId method not available');
    }
  }

  /**
   * Switch to a different country
   */
  async switchCountry(newCountryCode) {
    if (!newCountryCode) {
      this.#logger.error('Cannot switch country: no country code provided');
      return {
        success: false,
        message: 'No country code provided'
      };
    }

    const upperCountryCode = newCountryCode.toUpperCase();

    // Guard against switching to the same country
    if (upperCountryCode === this.#currentCountry) {
      this.#logger.debug(`Country is already ${upperCountryCode}, no switch needed.`);
      return {
        success: true,
        newCountry: upperCountryCode,
        campaignData: this.#cachedCampaigns.get(upperCountryCode) || this.#app.campaignData,
        message: 'Already current country'
      };
    }

    // Debounce rapid successive calls to prevent cascading loops
    if (this._switchTimeout) {
      this.#logger.debug(`Debouncing country switch to ${upperCountryCode}`);
      clearTimeout(this._switchTimeout);
    }

    // Set a flag to prevent additional switches during processing
    if (this._isSwitching) {
      this.#logger.debug(`Country switch already in progress, ignoring request for ${upperCountryCode}`);
      return {
        success: false,
        message: 'Switch already in progress'
      };
    }

    this._isSwitching = true;
    this.#logger.info(`Switching country to: ${upperCountryCode}`);

    try {
      // Step 1: Get campaign ID for new country
      const newCampaignId = this.#getCampaignIdForCountry(upperCountryCode);
      if (!newCampaignId) {
        // If no campaign ID is found, just update the current country
        this.#logger.warn(`No campaign found for country: ${upperCountryCode}, but updating current country anyway`);
        
        const previousCountry = this.#currentCountry;
        this.#currentCountry = upperCountryCode;
        
        // Store the country selection for persistence
        localStorage.setItem('os-forced-country', upperCountryCode);
        localStorage.setItem('os-forced-country-timestamp', Date.now().toString());

        // Trigger country changed event with existing campaign data
        this.#triggerCountryChangedEvent(upperCountryCode, this.#app.campaignData, previousCountry);

        return {
          success: true,
          previousCountry,
          newCountry: upperCountryCode,
          campaignData: this.#app.campaignData,
          message: 'Country updated without campaign switch'
        };
      }

      // Step 2: Check if campaign is already cached
      let campaignData = this.#cachedCampaigns.get(upperCountryCode);
      
      if (!campaignData) {
        // Step 3: Fetch new campaign data
        this.#logger.info(`Fetching campaign data for ${upperCountryCode}: ${newCampaignId}`);
        
        // Temporarily update API client to fetch the new campaign
        const originalCampaignId = this.#app.api._campaignId;
        this.#updateApiClientCampaign(newCampaignId);
        
        try {
          campaignData = await this.#app.api.getCampaign();
          
          // Cache the campaign data
          this.#cachedCampaigns.set(upperCountryCode, campaignData);
          this.#logger.debug(`Cached campaign data for ${upperCountryCode}`);
        } catch (error) {
          // Restore original campaign ID on error
          this.#updateApiClientCampaign(originalCampaignId);
          throw error;
        }
      } else {
        this.#logger.debug(`Using cached campaign data for ${upperCountryCode}`);
        // Still need to update API client
        this.#updateApiClientCampaign(newCampaignId);
      }

      // Step 4: Update cart items with new package mappings
      await this.#updateCartForNewCountry(this.#currentCountry, upperCountryCode, campaignData);

      // Step 5: Update current country
      const previousCountry = this.#currentCountry;
      this.#currentCountry = upperCountryCode;
      
      // Store the country selection for persistence
      localStorage.setItem('os-forced-country', upperCountryCode);
      localStorage.setItem('os-forced-country-timestamp', Date.now().toString());

      // Step 6: Update campaign data in app
      this.#app.campaignData = campaignData;
      if (window.osConfig) {
        window.osConfig.campaign = campaignData;
      }

      // Step 7: Trigger country changed event
      this.#triggerCountryChangedEvent(upperCountryCode, campaignData, previousCountry);

      this.#logger.info(`Successfully switched country from ${previousCountry} to ${upperCountryCode}`);
      
      return {
        success: true,
        previousCountry,
        newCountry: upperCountryCode,
        campaignData
      };
    } catch (error) {
      this.#logger.error(`Failed to switch country to ${upperCountryCode}:`, error);
      
      // Return a more graceful error response instead of throwing
      return {
        success: false,
        error: error.message,
        message: `Failed to switch to ${upperCountryCode}: ${error.message}`
      };
    } finally {
      // Always clear the switching flag
      this._isSwitching = false;
    }
  }

  /**
   * Update cart items when switching countries using product profiles
   */
  async #updateCartForNewCountry(fromCountry, toCountry, newCampaignData) {
    if (!this.#app.state) {
      this.#logger.warn('State manager not available, cannot update cart');
      return;
    }

    const cart = this.#app.state.getState('cart');
    if (!cart?.items?.length) {
      this.#logger.debug('No cart items to update');
      return;
    }

    this.#logger.info(`Updating ${cart.items.length} cart items for country switch: ${fromCountry} -> ${toCountry}`);

    const newPackages = newCampaignData.packages || [];
    const updatedItems = [];

    for (const item of cart.items) {
      try {
        // Step 1: Get current package ID
        const currentPackageId = item.package_id?.toString() || item.id?.toString();

        // Step 2: Translate package ID using product profiles
        const newPackageId = this.#translatePackageIdUsingProfiles(currentPackageId, fromCountry, toCountry);

        // Step 3: Find package data in new campaign
        const newPackageData = newPackages.find(pkg => 
          pkg.ref_id?.toString() === newPackageId ||
          pkg.id?.toString() === newPackageId
        );

        if (!newPackageData) {
          this.#logger.warn(`Package not found in new campaign: translated ID ${newPackageId} (original: ${currentPackageId})`);
          continue;
        }

        // Step 4: Create updated item with new campaign data
        const updatedItem = {
          ...item,
          id: newPackageData.ref_id?.toString() || newPackageId,
          package_id: newPackageData.ref_id,
          name: newPackageData.name,
          price: parseFloat(newPackageData.price) || item.price,
          price_total: parseFloat(newPackageData.price) * (item.quantity || 1),
          retail_price: parseFloat(newPackageData.price_retail) || parseFloat(newPackageData.price),
          retail_price_total: parseFloat(newPackageData.price_retail || newPackageData.price) * (item.quantity || 1),
          currency: newCampaignData.currency || 'USD',
          image: newPackageData.image || item.image
        };

        updatedItems.push(updatedItem);
        
        this.#logger.debug(`Mapped item using profiles: ${currentPackageId} (${fromCountry}) -> ${newPackageId} (${toCountry})`);
      } catch (error) {
        this.#logger.error(`Error updating cart item:`, error, item);
      }
    }

    // Step 5: Update cart with new items
    if (updatedItems.length > 0) {
      // Clear cart and re-add items to trigger recalculation
      this.#app.state.setState('cart.items', updatedItems, false);
      
      // Trigger recalculation of totals
      const updatedCart = this.#app.state.getState('cart');
      this.#app.state.setState('cart', updatedCart, true);
      
      this.#logger.info(`Updated ${updatedItems.length} cart items for new country using product profiles`);
    }
  }

  /**
   * Trigger country changed event
   */
  #triggerCountryChangedEvent(newCountry, campaignData, previousCountry) {
    const currency = campaignData?.currency || 'Unknown';
    this.#logger.info(`🔄 [CountryCampaign] Triggering country change: ${previousCountry} → ${newCountry} (${currency})`);
    
    const eventDetail = {
      country: newCountry,
      previousCountry,
      campaignData,
      manager: this
    };

    // Trigger internal app event
    if (this.#app.triggerEvent) {
      this.#app.triggerEvent('country.changed', eventDetail);
    }

    // Trigger DOM event
    const event = new CustomEvent('os:country.changed', {
      bubbles: true,
      detail: eventDetail
    });
    document.dispatchEvent(event);

    this.#logger.info(`✅ [CountryCampaign] Country changed event triggered: ${previousCountry} → ${newCountry} (${currency})`);
  }

  /**
   * Get current country code
   */
  getCurrentCountry() {
    return this.#currentCountry;
  }

  /**
   * Get current campaign ID
   */
  getCurrentCampaignId() {
    if (!this.#currentCountry) {
      return null;
    }
    return this.#getCampaignIdForCountry(this.#currentCountry);
  }

  /**
   * Get current campaign data
   */
  getCurrentCampaignData() {
    if (!this.#currentCountry) {
      return null;
    }
    return this.#cachedCampaigns.get(this.#currentCountry) || this.#app.campaignData;
  }

  /**
   * Get cached campaigns
   */
  getCachedCampaigns() {
    const cached = {};
    this.#cachedCampaigns.forEach((data, country) => {
      cached[country] = {
        name: data.name,
        currency: data.currency,
        packages: data.packages?.length || 0
      };
    });
    return cached;
  }

  /**
   * Check if manager is initialized
   */
  get isInitialized() {
    return this.#isInitialized;
  }

  /**
   * Sync country selection with checkout forms
   * Call this to ensure country selects show the current country
   */
  syncCountrySelection() {
    if (!this.#currentCountry) return;

    // Find and update country select elements
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
   * @returns {Promise<Object>} Result of country detection
   */
  async clearStoredCountry() {
    this.#logger.info('Clearing stored country selection');
    
    // Remove stored country data
    localStorage.removeItem('os-forced-country');
    localStorage.removeItem('os-forced-country-timestamp');
    
    // Detect fresh country
    const detectedCountry = await this.#detectUserCountry();
    
    // Switch to detected country if different
    if (detectedCountry !== this.#currentCountry) {
      return await this.switchCountry(detectedCountry);
    }
    
    return {
      success: true,
      country: detectedCountry,
      message: 'Country selection cleared'
    };
  }

  /**
   * Get available countries from configuration
   */
  getAvailableCountries() {
    return Object.keys(this.#config.campaignIds);
  }

  /**
   * Check if a country is supported
   */
  isCountrySupported(countryCode) {
    return !!this.#config.campaignIds[countryCode?.toUpperCase()];
  }

  /**
   * Translate package ID from one country to another using product profiles
   */
  translatePackageId(packageId, fromCountry, toCountry) {
    // If no countries specified, use current and target countries
    const sourceCountry = fromCountry || this.#currentCountry;
    const targetCountry = toCountry || this.#currentCountry;
    
    if (!sourceCountry || !targetCountry) {
      this.#logger.debug(`Cannot translate package ID: missing country info`);
      return packageId;
    }

    return this.#translatePackageIdUsingProfiles(packageId, sourceCountry, targetCountry);
  }

  /**
   * Translate package ID using product profiles configuration
   * @param {string} packageId - The package ID to translate
   * @param {string} fromCountry - Source country code
   * @param {string} toCountry - Target country code
   * @returns {string} Translated package ID
   */
  #translatePackageIdUsingProfiles(packageId, fromCountry, toCountry) {
    const profiles = window.osConfig?.productProfiles;
    
    if (!profiles) {
      this.#logger.debug('No product profiles configuration found, using original package ID');
      return packageId;
    }

    // Look through all profiles to find which one maps to this package ID in the source country
    for (const [profileId, profile] of Object.entries(profiles)) {
      const sourceMapping = profile.campaignMappings?.[fromCountry];
      
      if (sourceMapping && sourceMapping.packageId?.toString() === packageId?.toString()) {
        // Found the profile that contains this package ID in the source country
        const targetMapping = profile.campaignMappings?.[toCountry];
        
        if (targetMapping) {
          const translatedId = targetMapping.packageId?.toString();
          this.#logger.debug(`Translated package ID via profile ${profileId}: ${packageId} (${fromCountry}) -> ${translatedId} (${toCountry})`);
          return translatedId;
        } else {
          this.#logger.warn(`Profile ${profileId} has no mapping for target country ${toCountry}`);
          return packageId;
        }
      }
    }

    // No profile mapping found, return original ID
    this.#logger.debug(`No profile mapping found for package ${packageId} in country ${fromCountry}, using original ID`);
    return packageId;
  }

  /**
   * Get the current country's package ID for a specific profile
   * @param {string} profileId - Profile ID
   * @returns {string|null} Package ID for current country
   */
  getPackageIdForProfile(profileId) {
    const profiles = window.osConfig?.productProfiles;
    
    if (!profiles || !profiles[profileId]) {
      this.#logger.warn(`Profile ${profileId} not found in configuration`);
      return null;
    }

    const currentCountry = this.#currentCountry;
    if (!currentCountry) {
      this.#logger.warn('No current country set');
      return null;
    }

    const mapping = profiles[profileId].campaignMappings?.[currentCountry];
    return mapping?.packageId?.toString() || null;
  }
} 