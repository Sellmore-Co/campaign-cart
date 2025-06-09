/**
 * CountryCampaignManager - Manages country detection and currency
 * 
 * This class handles:
 * - Country detection via Cloudflare Worker /location endpoint
 * - Package ID translation using product profiles
 * - Country switching for UI/display purposes
 */

export class CountryCampaignManager {
  #app;
  #logger;
  #currentCountry = null;
  #config = {};
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
      // Detect user's country
      const detectedCountry = await this.#detectUserCountry();
      this.#logger.info(`🌍 [CountryCampaign] Detected country: ${detectedCountry}`);
      
      // Set current country
      this.#currentCountry = detectedCountry;
      
      this.#isInitialized = true;
      this.#logger.info(`✅ [CountryCampaign] System initialized - Country: ${detectedCountry}`);
      
      // Fire initialization complete event for other managers to sync
      this.#logger.info(`🔔 [CountryCampaign] Firing country-campaign.initialized event for: ${detectedCountry}`);
      const event = new CustomEvent('os:country-campaign.initialized', {
        bubbles: true,
        detail: {
          country: detectedCountry,
          campaignId: null, // No longer switching campaigns
          manager: this
        }
      });
      document.dispatchEvent(event);
      this.#logger.info(`🔔 [CountryCampaign] Event dispatched successfully`);
      
      return {
        country: detectedCountry,
        campaignId: null
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
      
      return {
        country: 'US',
        campaignId: null
      };
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
      
      // Return the detected country (all countries are now supported since we're not switching campaigns)
      this.#logger.info(`✅ [CountryCampaign] Using detected country: ${detectedCountry}`);
      return detectedCountry;
    }

    // Should not happen since TwentyNineNext loads this first
    this.#logger.error('❌ [CountryCampaign] No global localization data available! TwentyNineNext should have loaded this first.');
    return window.osConfig?.addressConfig?.defaultCountry || 'US'; // Safe fallback
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
        campaignData: this.#app.campaignData,
        message: 'Already current country'
      };
    }

    this.#logger.info(`Switching country to: ${upperCountryCode}`);

    this.#logger.info(`Switching country to: ${upperCountryCode}`);

    try {
      // Update cart items with new package mappings (using existing campaign data)
      await this.#updateCartForNewCountry(this.#currentCountry, upperCountryCode, this.#app.campaignData);

      // Update current country
      const previousCountry = this.#currentCountry;
      this.#currentCountry = upperCountryCode;
      
      // Store the country selection for persistence
      localStorage.setItem('os-forced-country', upperCountryCode);
      localStorage.setItem('os-forced-country-timestamp', Date.now().toString());

      // Trigger country changed event
      this.#triggerCountryChangedEvent(upperCountryCode, this.#app.campaignData, previousCountry);

      this.#logger.info(`Successfully switched country from ${previousCountry} to ${upperCountryCode}`);
      
      return {
        success: true,
        previousCountry,
        newCountry: upperCountryCode,
        campaignData: this.#app.campaignData
      };
    } catch (error) {
      this.#logger.error(`Failed to switch country to ${upperCountryCode}:`, error);
      
      return {
        success: false,
        error: error.message,
        message: `Failed to switch to ${upperCountryCode}: ${error.message}`
      };
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
          ...item, // This preserves profileId, profileName, is_upsell, and other metadata
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
   * Get current campaign ID (deprecated - always returns null)
   * @deprecated No longer switching campaigns based on country
   */
  getCurrentCampaignId() {
    return null;
  }

  /**
   * Get current campaign data
   */
  getCurrentCampaignData() {
    return this.#app.campaignData;
  }

  /**
   * Get cached campaigns (deprecated - no longer caching campaigns)
   * @deprecated No longer caching campaigns per country
   */
  getCachedCampaigns() {
    return {};
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
   * @deprecated All countries are now supported
   */
  getAvailableCountries() {
    // Return common countries since we no longer have campaign-specific restrictions
    return ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'ES', 'IT', 'NL', 'SE', 'NO', 'DK', 'FI'];
  }

  /**
   * Check if a country is supported
   * @deprecated All countries are now supported
   */
  isCountrySupported(countryCode) {
    // All countries are supported since we're not switching campaigns
    return true;
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