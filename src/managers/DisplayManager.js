/**
 * DisplayManager - Manages conditional display of elements based on cart contents and package pricing
 * 
 * This class handles:
 * - Showing/hiding elements based on what's in the cart (data-os-in-cart attributes)
 * - Displaying standalone package pricing information (data-os-package-price attributes)
 */

export class DisplayManager {
  #app;
  #logger;
  #displayElements = new Map();
  #priceElements = new Map(); // For standalone package pricing

  constructor(app) {
    this.#app = app;
    this.#logger = app.logger.createModuleLogger('DISPLAY');
    this.#initDisplayElements();
    this.#initPriceElements();
    
    // Subscribe to cart updates to refresh display elements
    this.#app.state.subscribe('cart', () => this.refreshDisplayElements());
    
    // Listen for country changes
    this.#setupCountryChangeListener();
    
    this.#logger.infoWithTime('DisplayManager initialized');
  }

  /**
   * Setup listener for country changes
   */
  #setupCountryChangeListener() {
    document.addEventListener('os:country.changed', (event) => {
      const { country, campaignData } = event.detail;
      this.#logger.infoWithTime(`Country changed to ${country}, refreshing display elements and pricing`);
      
      // Refresh display elements as package IDs might have changed
      this.refreshDisplayElements();
      
      // Refresh package pricing as prices and currency might have changed
      this.refreshPackagePricing();
    });
  }

  /**
   * Initialize all display elements on the page
   */
  #initDisplayElements() {
    this.#logger.infoWithTime('Initializing display elements');
    
    // Find all swap display containers
    const swapContainers = document.querySelectorAll('[data-os-cart="swap-display"]');
    
    if (swapContainers.length === 0) {
      this.#logger.debugWithTime('No swap display containers found on page');
      return;
    }
    
    this.#logger.debugWithTime(`Found ${swapContainers.length} swap display containers`);
    
    // Process each container
    swapContainers.forEach((container, index) => {
      const containerId = container.dataset.osId || `auto-container-${index}`;
      
      // Find all display elements within this container
      const displayElements = container.querySelectorAll('[data-os-in-cart="display"]');
      
      if (displayElements.length === 0) {
        this.#logger.warnWithTime(`Container ${containerId} has no display elements`);
        return;
      }
      
      // Store the container and its display elements
      this.#displayElements.set(container, {
        id: containerId,
        elements: Array.from(displayElements).map(element => ({
          element,
          packageId: element.dataset.osPackage
        }))
      });
      
      this.#logger.debugWithTime(`Initialized container ${containerId} with ${displayElements.length} display elements`);
    });
    
    // Initial update of all display elements
    this.refreshDisplayElements();
  }

  /**
   * Refresh all display elements based on current cart contents
   */
  refreshDisplayElements() {
    this.#logger.debugWithTime('Refreshing display elements');
    
    // Get current cart items
    const cart = this.#app.state.getState('cart');
    const cartItemIds = cart.items.map(item => item.id.toString());
    
    // Update each container
    this.#displayElements.forEach((containerData, container) => {
      this.#updateContainerDisplay(container, containerData, cartItemIds);
    });
  }

  /**
   * Update the display of elements within a container based on cart contents
   * @param {HTMLElement} container - The container element
   * @param {Object} containerData - Data about the container and its elements
   * @param {Array<string>} cartItemIds - IDs of items currently in the cart
   */
  #updateContainerDisplay(container, containerData, cartItemIds) {
    const { id, elements } = containerData;
    let hasVisibleElement = false;
    
    // First pass: check if any element should be visible
    for (const { element, packageId } of elements) {
      if (packageId && cartItemIds.includes(packageId)) {
        // Show this element
        element.style.display = 'block';
        hasVisibleElement = true;
        this.#logger.debugWithTime(`Showing element for package ${packageId} in container ${id}`);
      } else {
        // Hide this element
        element.style.display = 'none';
      }
    }
    
    // If no elements are visible, show the first one as fallback (optional)
    if (!hasVisibleElement && elements.length > 0) {
      // Option 1: Show nothing (current behavior)
      // Option 2: Show the first element as fallback
      // elements[0].element.style.display = 'block';
      // this.#logger.debugWithTime(`No matching packages in cart, showing first element as fallback in container ${id}`);
    }
    
    // Trigger a custom event
    this.#triggerDisplayEvent('updated', container, {
      containerId: id,
      hasVisibleElement,
      visiblePackageIds: elements
        .filter(({ element }) => element.style.display === 'block')
        .map(({ packageId }) => packageId)
    });
  }

  /**
   * Trigger a display event
   * @param {string} eventName - Name of the event
   * @param {HTMLElement} element - Element that triggered the event
   * @param {Object} detail - Event details
   */
  #triggerDisplayEvent(eventName, element, detail = {}) {
    const event = new CustomEvent(`os:display.${eventName}`, {
      bubbles: true,
      cancelable: true,
      detail: { ...detail, manager: this }
    });
    
    element.dispatchEvent(event);
    document.dispatchEvent(event);
    this.#logger.debugWithTime(`Display event triggered: ${eventName}`);
  }

  /**
   * Initialize all package pricing elements on the page
   */
  #initPriceElements() {
    this.#logger.infoWithTime('Initializing package pricing elements');
    
    // Find all package pricing elements
    const priceElements = document.querySelectorAll('[data-os-package-price], [data-os-profile-price]');
    
    if (priceElements.length === 0) {
      this.#logger.debugWithTime('No package pricing elements found on page');
      return;
    }
    
    this.#logger.debugWithTime(`Found ${priceElements.length} package pricing elements`);
    
    // Group elements by package ID or profile ID for efficient processing
    priceElements.forEach((element) => {
      const packageId = element.dataset.osPackageId;
      const profileId = element.dataset.osProfileId;
      const priceType = element.dataset.osPackagePrice || element.dataset.osProfilePrice;
      const isProfile = !!element.dataset.osProfilePrice;
      
      const elementId = isProfile ? profileId : packageId;
      
      if (!elementId) {
        this.#logger.warnWithTime(`Pricing element missing ${isProfile ? 'data-os-profile-id' : 'data-os-package-id'} attribute`, element);
        return;
      }
      
      if (!priceType) {
        this.#logger.warnWithTime(`Pricing element missing ${isProfile ? 'data-os-profile-price' : 'data-os-package-price'} attribute`, element);
        return;
      }
      
      // Store element data for later processing
      if (!this.#priceElements.has(elementId)) {
        this.#priceElements.set(elementId, []);
      }
      
      this.#priceElements.get(elementId).push({
        element,
        priceType,
        isProfile,
        divideBy: element.dataset.osDivideBy ? parseInt(element.dataset.osDivideBy, 10) : null,
        format: element.dataset.osFormat || 'default',
        hideIfZero: element.dataset.osHideIfZero === 'true',
        showDecimals: element.dataset.osShowDecimals === 'true'
      });
      
      const type = isProfile ? 'Profile' : 'Package';
      this.#logger.debugWithTime(`Registered pricing element: ${type} ${elementId}, Type ${priceType}`);
    });
    
    // Initial update of all pricing elements
    this.refreshPackagePricing();
  }

  /**
   * Refresh all package pricing elements with current campaign data
   */
  refreshPackagePricing() {
    this.#logger.debugWithTime('Refreshing package pricing elements');
    
    if (!this.#app.campaignData?.packages) {
      this.#logger.warnWithTime('Campaign data not available for pricing refresh');
      return;
    }
    
    // Get currency symbol from campaign data or default
    const currencySymbol = this.#getCurrencySymbol();
    
    // Update each package's and profile's pricing elements
    this.#priceElements.forEach((elements, elementId) => {
      // Check if this is a profile or package
      const isProfile = elements[0]?.isProfile || false;
      
      if (isProfile) {
        this.#updateProfilePricing(elementId, elements, currencySymbol);
      } else {
        this.#updatePackagePricing(elementId, elements, currencySymbol);
      }
    });
  }

  /**
   * Update pricing elements for a specific package
   * @param {string} packageId - The package ID (original from HTML)
   * @param {Array} elements - Array of element objects for this package
   * @param {string} currencySymbol - Currency symbol to use
   */
  #updatePackagePricing(packageId, elements, currencySymbol) {
    // Translate package ID using CountryCampaignManager if available
    const translatedPackageId = this.#translatePackageId(packageId);
    
    // Get package data from campaign using translated ID
    const packageData = this.#getPackageData(translatedPackageId);
    
    if (!packageData) {
      this.#logger.warnWithTime(`Package data not found for ID: ${translatedPackageId} (original: ${packageId})`);
      // Hide elements if package not found
      elements.forEach(({ element, hideIfZero }) => {
        if (hideIfZero) {
          element.style.display = 'none';
          // Hide container if it has data-container attribute
          const container = element.closest('[data-container="true"]');
          if (container) container.style.display = 'none';
        }
      });
      return;
    }
    
    // Calculate pricing values
    const pricing = this.#calculatePackagePricing(packageData);
    
    // Update each element
    elements.forEach(({ element, priceType, divideBy, format, hideIfZero, showDecimals }) => {
      let value = this.#getPriceValue(pricing, priceType, divideBy);
      
      // Handle hide if zero
      if (hideIfZero && (value === 0 || value < 0)) {
        element.style.display = 'none';
        const container = element.closest('[data-container="true"]');
        if (container) container.style.display = 'none';
        return;
      } else {
        element.style.display = '';
        const container = element.closest('[data-container="true"]');
        if (container) container.style.display = '';
      }
      
      // Format and display value
      const displayValue = this.#formatPriceValue(value, priceType, format, currencySymbol, showDecimals);
      element.textContent = displayValue;
      
      this.#logger.debugWithTime(`Updated pricing: Package ${packageId} -> ${translatedPackageId}, Type ${priceType}, Value: ${displayValue}`);
    });
  }

  /**
   * Update pricing elements for a specific profile
   * @param {string} profileId - The profile ID
   * @param {Array} elements - Array of element objects for this profile
   * @param {string} currencySymbol - Currency symbol to use
   */
  #updateProfilePricing(profileId, elements, currencySymbol) {
    // Get profile pricing using ProductProfileManager
    if (!this.#app.profiles) {
      this.#logger.warnWithTime('ProductProfileManager not available for profile pricing');
      return;
    }

    const profile = this.#app.profiles.getProfile(profileId);
    if (!profile) {
      this.#logger.warnWithTime(`Profile not found: ${profileId}`);
      // Hide elements if profile not found
      elements.forEach(({ element, hideIfZero }) => {
        if (hideIfZero) {
          element.style.display = 'none';
          const container = element.closest('[data-container="true"]');
          if (container) container.style.display = 'none';
        }
      });
      return;
    }

    // Update each element
    elements.forEach(({ element, priceType, divideBy, format, hideIfZero, showDecimals }) => {
      let value = this.#app.profiles.getPrice(profileId, priceType) || 0;
      
      // Apply divideBy if specified
      if (divideBy && divideBy > 0) {
        value = value / divideBy;
      }
      
      // Handle hide if zero
      if (hideIfZero && (value === 0 || value < 0)) {
        element.style.display = 'none';
        const container = element.closest('[data-container="true"]');
        if (container) container.style.display = 'none';
        return;
      } else {
        element.style.display = '';
        const container = element.closest('[data-container="true"]');
        if (container) container.style.display = '';
      }
      
      // Format and display value
      const displayValue = this.#formatPriceValue(value, priceType, format, currencySymbol, showDecimals);
      element.textContent = displayValue;
      
      this.#logger.debugWithTime(`Updated profile pricing: ${profileId}, Type ${priceType}, Value: ${displayValue}`);
    });
  }

  /**
   * Translate package ID using CountryCampaignManager if available
   * @param {string} originalPackageId - The original package ID from the HTML data attribute
   * @returns {string} - The translated package ID for the current country
   */
  #translatePackageId(originalPackageId) {
    // Check if CountryCampaignManager is available
    const countryCampaignManager = this.#app.countryCampaign;
    
    if (!countryCampaignManager || !countryCampaignManager.getCurrentCountry()) {
      this.#logger.debug(`CountryCampaignManager not available or no current country, using original package ID: ${originalPackageId}`);
      return originalPackageId;
    }

    try {
      const currentCountry = countryCampaignManager.getCurrentCountry();
      const config = window.osConfig?.countryCampaigns?.packageMaps?.[currentCountry];
      
      if (!config) {
        this.#logger.debug(`No package mapping found for country ${currentCountry}, using original package ID: ${originalPackageId}`);
        return originalPackageId;
      }

      const translatedId = config[originalPackageId];
      if (translatedId !== undefined) {
        this.#logger.debug(`Translated package ID: ${originalPackageId} -> ${translatedId} for country ${currentCountry}`);
        return translatedId.toString();
      } else {
        this.#logger.debug(`No translation found for package ${originalPackageId} in country ${currentCountry}, using original ID`);
        return originalPackageId;
      }
    } catch (error) {
      this.#logger.error('Error translating package ID:', error);
      return originalPackageId;
    }
  }

  /**
   * Get package data from campaign data
   * @param {string} packageId - The package ID to find
   * @returns {Object|null} Package data or null if not found
   */
  #getPackageData(packageId) {
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
    
    // Total prices
    const totalSale = parseFloat(packageData.price_total || packageData.price || 0);
    const totalRegular = parseFloat(packageData.price_retail_total || packageData.price_retail || totalSale);
    
    // Unit prices
    const unitSale = qty > 0 ? totalSale / qty : totalSale;
    const unitRegular = qty > 0 ? totalRegular / qty : totalRegular;
    
    // Savings
    const totalSavings = totalRegular - totalSale;
    const unitSavings = unitRegular - unitSale;
    const totalSavingsPercent = totalRegular > 0 ? ((totalSavings / totalRegular) * 100) : 0;
    const unitSavingsPercent = unitRegular > 0 ? ((unitSavings / unitRegular) * 100) : 0;
    
    return {
      // Total pricing
      'total-sale': totalSale,
      'total-regular': totalRegular,
      'total-saving-amount': totalSavings,
      'total-saving-percentage': totalSavingsPercent,
      
      // Unit pricing
      'unit-sale': unitSale,
      'unit-regular': unitRegular,
      'unit-saving-amount': unitSavings,
      'unit-saving-percentage': unitSavingsPercent,
      
      // Aliases for consistency with selector pricing
      'each-sale': unitSale,
      'each-regular': unitRegular,
      'saving-amount': unitSavings,
      'saving-percentage': unitSavingsPercent,
      
      // Meta data
      'quantity': qty
    };
  }

  /**
   * Get price value for a specific type
   * @param {Object} pricing - Calculated pricing object
   * @param {string} priceType - Type of price to get
   * @param {number|null} divideBy - Optional divisor for per-subunit pricing
   * @returns {number} Price value
   */
  #getPriceValue(pricing, priceType, divideBy) {
    let value = pricing[priceType] || 0;
    
    // Apply divideBy if specified
    if (divideBy && divideBy > 0) {
      value = value / divideBy;
    }
    
    return value;
  }

  /**
   * Format price value for display
   * @param {number} value - Raw price value
   * @param {string} priceType - Type of price
   * @param {string} format - Format style
   * @param {string} currencySymbol - Currency symbol
   * @param {boolean} showDecimals - Whether to show decimal places
   * @returns {string} Formatted price string
   */
  #formatPriceValue(value, priceType, format, currencySymbol, showDecimals = false) {
    // Handle percentage types
    if (priceType.includes('percentage')) {
      const percentValue = Math.round(value);
      if (percentValue <= 0) return '';
      
      switch (format) {
        case 'parenthesis':
          return `(${percentValue}% OFF)`;
        case 'simple':
          return `${percentValue}%`;
        default:
          return `${percentValue}% OFF`;
      }
    }
    
    // Handle monetary values
    if (value <= 0) return '';
    
    // Format the number based on showDecimals setting
    let formattedValue;
    if (showDecimals) {
      // Always show 2 decimal places
      formattedValue = value.toFixed(2);
    } else {
      // Remove trailing zeros (current behavior)
      formattedValue = parseFloat(value.toFixed(2)).toString();
    }
    
    return `${currencySymbol}${formattedValue}`;
  }

  /**
   * Get currency symbol from campaign data or configuration
   * @returns {string} Currency symbol
   */
  #getCurrencySymbol() {
    // Try to get from campaign data
    if (this.#app.campaignData?.currency) {
      const symbols = {
        'USD': '$',
        'CAD': 'C$',
        'GBP': '£',
        'EUR': '€',
        'AUD': 'A$'
      };
      return symbols[this.#app.campaignData.currency] || '$';
    }
    
    // Try to get from page configuration
    const configSymbol = document.querySelector('[data-os-cart="summary"]')?.dataset.currencySymbol;
    if (configSymbol) return configSymbol;
    
    // Default
    return '$';
  }

  /**
   * Manually refresh display elements and pricing
   * This can be called after dynamic content is loaded
   */
  refresh() {
    this.#logger.infoWithTime('Manually refreshing display elements and pricing');
    this.#displayElements.clear();
    this.#priceElements.clear();
    this.#initDisplayElements();
    this.#initPriceElements();
  }
} 