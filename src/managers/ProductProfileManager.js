/**
 * ProductProfileManager - Manages product profiles for easier programmatic cart operations
 * 
 * This class provides:
 * - Product profile configuration and management
 * - Country-aware profile to package mapping
 * - Programmatic cart operations using profiles
 * - Pricing information for profiles
 * - Integration with existing CountryCampaignManager
 */

export class ProductProfileManager {
  #app;
  #logger;
  #profiles = new Map();

  constructor(app) {
    this.#app = app;
    this.#logger = app.logger.createModuleLogger('PROFILE');
    
    this.#initializeProfiles();
    this.#setupCountryChangeListener();
    
    this.#logger.infoWithTime('ProductProfileManager initialized');
  }

  /**
   * Initialize product profiles from configuration (SIMPLIFIED)
   * Loads profiles but ignores country mappings - uses single campaign mode
   */
  #initializeProfiles() {
    const profilesConfig = window.osConfig?.productProfiles;
    
    if (!profilesConfig) {
      this.#logger.debugWithTime('No product profiles configuration found');
      return;
    }

    // Load profiles but ignore complex country mappings
    Object.entries(profilesConfig).forEach(([profileId, profileData]) => {
      try {
        this.#validateProfileSimple(profileId, profileData);
        this.#profiles.set(profileId, {
          ...profileData,
          id: profileId
        });
        this.#logger.debugWithTime(`Loaded profile: ${profileId} - ${profileData.name}`);
      } catch (error) {
        this.#logger.warnWithTime(`Invalid profile configuration for ${profileId}:`, error.message);
      }
    });

    this.#logger.infoWithTime(`Loaded ${this.#profiles.size} product profiles (single campaign mode)`);
  }

  /**
   * Validate profile configuration (SIMPLIFIED for single campaign)
   * @param {string} profileId - Profile ID
   * @param {Object} profileData - Profile configuration
   */
  #validateProfileSimple(profileId, profileData) {
    if (!profileData.name) {
      throw new Error('Profile must have a name');
    }

    // New simplified format: single package
    if (profileData.packageId) {
      return;
    }

    // New simplified format: multiple packages
    if (profileData.packages && Array.isArray(profileData.packages)) {
      if (profileData.packages.length === 0) {
        throw new Error('Profile packages array cannot be empty');
      }
      // Validate each package has packageId
      profileData.packages.forEach((pkg, index) => {
        if (!pkg.packageId) {
          throw new Error(`Package ${index} must have packageId`);
        }
      });
      return;
    }

    // Legacy format: campaignMappings (backward compatibility)
    if (profileData.campaignMappings && typeof profileData.campaignMappings === 'object') {
      const mappings = Object.values(profileData.campaignMappings);
      if (mappings.length === 0) {
        throw new Error('Profile must have at least one package mapping');
      }
      return;
    }

    throw new Error('Profile must have packageId, packages array, or campaignMappings (legacy)');
  }

  /**
   * Setup listener for country changes (DISABLED - single campaign mode)
   */
  #setupCountryChangeListener() {
    // No longer needed in single campaign mode - profiles don't use country mappings
    this.#logger.debugWithTime('Country change listener disabled (single campaign mode)');
  }

  /**
   * Get all available profiles
   * @returns {Array} Array of profile objects
   */
  getProfiles() {
    return Array.from(this.#profiles.values());
  }

  /**
   * Get profiles by category
   * @param {string} category - Category to filter by
   * @returns {Array} Array of profile objects
   */
  getProfilesByCategory(category) {
    return this.getProfiles().filter(profile => 
      profile.metadata?.category === category
    );
  }

  /**
   * Get featured profiles
   * @returns {Array} Array of featured profile objects
   */
  getFeaturedProfiles() {
    return this.getProfiles().filter(profile => 
      profile.metadata?.featured === true
    );
  }

  /**
   * Get a specific profile
   * @param {string} profileId - Profile ID
   * @returns {Object|null} Profile object or null if not found
   */
  getProfile(profileId) {
    return this.#profiles.get(profileId) || null;
  }

  /**
   * Get package mapping for a profile (SIMPLIFIED for single campaign)
   * @param {string} profileId - Profile ID
   * @returns {Array|Object|null} Package mapping(s)
   */
  getCurrentMapping(profileId) {
    const profile = this.getProfile(profileId);
    if (!profile) {
      this.#logger.warnWithTime(`Profile not found: ${profileId}`);
      return null;
    }

    // New simplified format: direct packageId
    if (profile.packageId) {
      return {
        packageId: profile.packageId,
        quantity: profile.quantity || 1
      };
    }

    // New simplified format: multiple packages array
    if (profile.packages && Array.isArray(profile.packages)) {
      return profile.packages;
    }

    // Legacy format: campaignMappings - use first available mapping (backward compatibility)
    if (profile.campaignMappings) {
      const mappings = Object.values(profile.campaignMappings);
      if (mappings.length > 0) {
        const mapping = mappings[0]; // Use first available mapping
        this.#logger.debugWithTime(`Using legacy mapping format for profile ${profileId} (consider upgrading to simplified format)`);
        return mapping;
      }
    }

    this.#logger.warnWithTime(`No valid mapping found for profile ${profileId}`);
    return null;
  }

  /**
   * Get current country from CountryCampaignManager
   * @returns {string} Current country code
   */
  #getCurrentCountry() {
    if (this.#app.countryCampaign) {
      return this.#app.countryCampaign.getCurrentCountry();
    }
    
    // Fallback to US if no country campaign manager
    return 'US';
  }

  /**
   * Add profile to cart
   * @param {string} profileId - Profile ID to add
   * @param {Object} options - Additional options
   * @returns {Promise<boolean>} Success status
   */
  async addToCart(profileId, options = {}) {
    try {
      const mapping = this.getCurrentMapping(profileId);
      if (!mapping) {
        throw new Error(`Cannot add profile ${profileId} - no mapping for current country`);
      }

      const profile = this.getProfile(profileId);
      const packages = Array.isArray(mapping) ? mapping : [mapping];
      
      this.#logger.infoWithTime(`Adding profile ${profileId} (${profile.name}) to cart`);

      // Add each package in the profile
      for (const pkg of packages) {
        const packageData = await this.#getPackageData(pkg.packageId);
        if (!packageData) {
          throw new Error(`Package ${pkg.packageId} not found in campaign data`);
        }

        const quantity = (pkg.quantity || 1) * (options.quantity || 1);
        
        await this.#app.cart.addToCart({
          id: packageData.ref_id || packageData.id,
          name: packageData.name,
          price: packageData.price,
          quantity: quantity,
          type: 'package',
          profileId: profileId, // Add profile reference
          profileName: profile.name,
          is_upsell: options.is_upsell || false // Pass through upsell flag
        });

        this.#logger.debugWithTime(`Added package ${pkg.packageId} (qty: ${quantity}) from profile ${profileId}`);
      }

      // Trigger profile added event
      this.#triggerProfileEvent('added', profileId, { profile, mapping, options });
      
      return true;
    } catch (error) {
      this.#logger.errorWithTime(`Failed to add profile ${profileId} to cart:`, error);
      return false;
    }
  }

  /**
   * Remove profile from cart
   * @param {string} profileId - Profile ID to remove
   * @returns {Promise<boolean>} Success status
   */
  async removeFromCart(profileId) {
    try {
      const cart = this.#app.state.getState('cart');
      const itemsToRemove = cart.items.filter(item => item.profileId === profileId);
      
      if (itemsToRemove.length === 0) {
        this.#logger.debugWithTime(`Profile ${profileId} not found in cart`);
        return true;
      }

      this.#logger.infoWithTime(`Removing profile ${profileId} from cart (${itemsToRemove.length} items)`);

      // Remove each item
      for (const item of itemsToRemove) {
        await this.#app.cart.removeFromCart(item.id);
      }

      // Trigger profile removed event
      this.#triggerProfileEvent('removed', profileId, { itemsRemoved: itemsToRemove.length });
      
      return true;
    } catch (error) {
      this.#logger.errorWithTime(`Failed to remove profile ${profileId} from cart:`, error);
      return false;
    }
  }

  /**
   * Check if profile is in cart
   * @param {string} profileId - Profile ID to check
   * @returns {boolean} Whether profile is in cart
   */
  isInCart(profileId) {
    const cart = this.#app.state.getState('cart');
    return cart.items.some(item => item.profileId === profileId);
  }

  /**
   * Get profile pricing information
   * @param {string} profileId - Profile ID
   * @param {string} priceType - Type of price (total-sale, unit-sale, etc.)
   * @returns {number|null} Price value or null if not available
   */
  getPrice(profileId, priceType = 'total-sale') {
    const mapping = this.getCurrentMapping(profileId);
    if (!mapping) return null;

    const packages = Array.isArray(mapping) ? mapping : [mapping];
    let totalPrice = 0;

    for (const pkg of packages) {
      const packageData = this.#getPackageDataSync(pkg.packageId);
      if (!packageData) continue;

      const pricing = this.#calculatePackagePricing(packageData);
      const quantity = pkg.quantity || 1;
      
      let packagePrice = pricing[priceType] || 0;
      totalPrice += packagePrice * quantity;
    }

    return totalPrice > 0 ? totalPrice : null;
  }

  /**
   * Get formatted price string for profile
   * @param {string} profileId - Profile ID
   * @param {string} priceType - Type of price
   * @param {Object} options - Formatting options
   * @returns {string} Formatted price string
   */
  getFormattedPrice(profileId, priceType = 'total-sale', options = {}) {
    const price = this.getPrice(profileId, priceType);
    if (price === null) return '';

    // Use CurrencyService for proper multi-currency conversion and formatting
    return this.#app.currency.formatPrice(price, null, false, options);
  }

  /**
   * Get package data from campaign
   * @param {string} packageId - Package ID
   * @returns {Promise<Object|null>} Package data
   */
  async #getPackageData(packageId) {
    if (!this.#app.campaignData?.packages) {
      await new Promise(resolve => {
        const checkData = () => {
          if (this.#app.campaignData?.packages) {
            resolve();
          } else {
            setTimeout(checkData, 100);
          }
        };
        checkData();
      });
    }

    return this.#getPackageDataSync(packageId);
  }

  /**
   * Get package data synchronously
   * @param {string} packageId - Package ID
   * @returns {Object|null} Package data
   */
  #getPackageDataSync(packageId) {
    if (!this.#app.campaignData?.packages) return null;
    
    return this.#app.campaignData.packages.find(pkg => 
      pkg.ref_id?.toString() === packageId?.toString() || 
      pkg.id?.toString() === packageId?.toString()
    ) || null;
  }

  /**
   * Calculate pricing values for a package
   * @param {Object} packageData - Package data from campaign
   * @returns {Object} Calculated pricing values
   */
  #calculatePackagePricing(packageData) {
    const qty = parseInt(packageData.qty || 1, 10);
    
    const totalSale = parseFloat(packageData.price_total || packageData.price || 0);
    const totalRegular = parseFloat(packageData.price_retail_total || packageData.price_retail || totalSale);
    
    const unitSale = qty > 0 ? totalSale / qty : totalSale;
    const unitRegular = qty > 0 ? totalRegular / qty : totalRegular;
    
    const totalSavings = totalRegular - totalSale;
    const unitSavings = unitRegular - unitSale;
    const totalSavingsPercent = totalRegular > 0 ? ((totalSavings / totalRegular) * 100) : 0;
    const unitSavingsPercent = unitRegular > 0 ? ((unitSavings / unitRegular) * 100) : 0;
    
    return {
      'total-sale': totalSale,
      'total-regular': totalRegular,
      'total-saving-amount': totalSavings,
      'total-saving-percentage': totalSavingsPercent,
      'unit-sale': unitSale,
      'unit-regular': unitRegular,
      'unit-saving-amount': unitSavings,
      'unit-saving-percentage': unitSavingsPercent
    };
  }

  /**
   * Get currency symbol
   * @returns {string} Currency symbol
   */
  #getCurrencySymbol() {
    // Use centralized currency service
    return this.#app.currency.getCurrencySymbol();
  }

  /**
   * Trigger profile event
   * @param {string} eventName - Event name
   * @param {string} profileId - Profile ID
   * @param {Object} detail - Event details
   */
  #triggerProfileEvent(eventName, profileId, detail = {}) {
    const event = new CustomEvent(`os:profile.${eventName}`, {
      bubbles: true,
      cancelable: true,
      detail: { 
        profileId, 
        profile: this.getProfile(profileId),
        ...detail,
        manager: this 
      }
    });
    
    document.dispatchEvent(event);
    this.#logger.debugWithTime(`Profile event triggered: ${eventName} for ${profileId}`);
  }

  /**
   * Get profiles that are currently in cart
   * @returns {Array} Array of profile IDs in cart
   */
  getCartProfiles() {
    const cart = this.#app.state.getState('cart');
    const profileIds = new Set();
    
    cart.items.forEach(item => {
      if (item.profileId) {
        profileIds.add(item.profileId);
      }
    });
    
    return Array.from(profileIds);
  }

  /**
   * Clear all profiles from cart
   * @returns {Promise<boolean>} Success status
   */
  async clearProfilesFromCart() {
    try {
      const profileIds = this.getCartProfiles();
      
      for (const profileId of profileIds) {
        await this.removeFromCart(profileId);
      }
      
      this.#logger.infoWithTime(`Cleared ${profileIds.length} profiles from cart`);
      return true;
    } catch (error) {
      this.#logger.errorWithTime('Failed to clear profiles from cart:', error);
      return false;
    }
  }
} 