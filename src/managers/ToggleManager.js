/**
 * ToggleManager - Manages toggle item buttons in the DOM
 * 
 * This class handles toggle item buttons that can add/remove items from the cart.
 */

import { DebugUtils } from '../utils/DebugUtils.js';

export class ToggleManager {
  #packageToggles = {}; // Renamed and restructured: Key is packageId
  #app;
  #logger;
  #isDebugMode = false;

  constructor(app) {
    this.#app = app;
    this.#logger = app.logger.createModuleLogger('TOGGLE');
    this.#isDebugMode = DebugUtils.initDebugMode();
    this.#initAndRegisterToggleElements();
    this.#app.state.subscribe('cart', () => this.#updateAllToggleUIs()); // Changed method name
    
    // Listen for country changes to update toggle UI
    this.#setupCountryChangeListener();
    
    this.#logger.info('ToggleManager initialized');
    if (this.#isDebugMode) {
      this.#logger.info('Debug mode enabled for toggle items');
    }
  }

  #initAndRegisterToggleElements() {
    const toggleElements = document.querySelectorAll('[data-os-action="toggle-item"]');
    if (!toggleElements.length) {
      this.#logger.debug('No toggle item buttons found.');
      return;
    }
    this.#logger.info(`Found ${toggleElements.length} toggle item button elements.`);
    toggleElements.forEach(element => this.#registerToggleElement(element));
    this.#updateAllToggleUIs(); // Initial UI update based on loaded cart state
  }

  /**
   * Setup listener for country changes
   */
  #setupCountryChangeListener() {
    document.addEventListener('os:country.changed', (event) => {
      const { country, previousCountry } = event.detail;
      this.#logger.info(`Country changed from ${previousCountry} to ${country}, updating toggle UI`);
      
      // Update all toggle UI to reflect new package mappings
      this.#updateAllToggleUIs();
    });
  }

  #registerToggleElement(toggleElement) {
    const packageId = toggleElement.getAttribute('data-os-package');
    const profileId = toggleElement.getAttribute('data-os-profile');
    
    if (!packageId && !profileId) {
      this.#logger.warn('Toggle element missing data-os-package or data-os-profile attribute', toggleElement);
      return;
    }

    // Determine the toggle type and ID
    const isProfile = !!profileId;
    const toggleId = isProfile ? profileId : packageId;
    const toggleType = isProfile ? 'profile' : 'package';

    const quantity = Number.parseInt(toggleElement.getAttribute('data-os-quantity') ?? '1', 10);

    // If this toggle ID hasn't been seen, initialize its entry
    if (!this.#packageToggles[toggleId]) {
      this.#packageToggles[toggleId] = {
        id: toggleId,
        type: toggleType,
        isProfile: isProfile,
        packageId: packageId, // Keep for backwards compatibility
        quantity: quantity,
        elements: []
      };
      this.#logger.debug(`[INIT] Creating new toggle registration for ${toggleType}: ${toggleId}`);
    } else {
       // Optional: Warn if quantity differs between buttons for the same toggle
       if (this.#packageToggles[toggleId].quantity !== quantity) {
           this.#logger.warn(`Toggle button for ${toggleType} ${toggleId} has different quantity (${quantity}) than previously registered (${this.#packageToggles[toggleId].quantity}). Using first quantity found.`);
       }
    }

    // Add the current DOM element to the list for this toggle ID
    this.#packageToggles[toggleId].elements.push(toggleElement);
    this.#logger.debugWithTime(`[INIT] Registered element for ${toggleType}: ${toggleId}. Total elements: ${this.#packageToggles[toggleId].elements.length}`);

    // Add event listener to this specific element
    toggleElement.addEventListener('click', event => {
      event.preventDefault();
      this.#processToggleAction(toggleId, toggleElement);
    });

    // Add debug overlay if needed
    if (this.#isDebugMode) {
      this.#addDebugOverlay(toggleElement, toggleId, toggleType, quantity);
    }
  }

  #addDebugOverlay(element, toggleId, toggleType, quantity) { 
    const isUpsell = element.hasAttribute('data-os-upsell') ? 
      element.getAttribute('data-os-upsell') === 'true' : 
      (element.closest('[data-os-upsell-section]') !== null);
    
    let price = 'N/A';
    let debugInfo = {};

    if (toggleType === 'profile') {
      // Get profile price if available
      if (this.#app.profiles) {
        price = this.#app.profiles.getFormattedPrice(toggleId) || 'N/A';
      }
      debugInfo = {
        'Profile': toggleId,
        'Type': 'Profile',
        'Qty': quantity,
        'Price': price,
        'Upsell': isUpsell ? 'Yes' : 'No'
      };
    } else {
      // Package debug info
      const packageData = this.#getPackageDataFromCampaign(toggleId);
      price = packageData ? packageData.price : 'N/A';
      debugInfo = {
        'Package': toggleId,
        'Type': 'Package',
        'Qty': quantity,
        'Price': price,
        'Upsell': isUpsell ? 'Yes' : 'No'
      };
    }
    
    DebugUtils.addDebugOverlay(element, `toggle-${toggleType}-${toggleId}-${this.#packageToggles[toggleId]?.elements.length || 0}`, 'toggle', debugInfo);
  }

  // Process toggle action for both packages and profiles
  async #processToggleAction(toggleId, clickedElement) {
    const toggleInfo = this.#packageToggles[toggleId];
    if (!toggleInfo) {
      this.#logger.error(`Toggle info for ${toggleInfo?.type || 'unknown'} ${toggleId} not found`);
      return;
    }

    const { type, isProfile, quantity } = toggleInfo;

    if (isProfile) {
      // Handle profile toggle
      await this.#processProfileToggle(toggleId, clickedElement, quantity);
    } else {
      // Handle package toggle (existing logic)
      await this.#processPackageToggle(toggleId, clickedElement, quantity);
    }
  }

  async #processProfileToggle(profileId, clickedElement, quantity) {
    try {
      // Check if profile is in cart
      const isInCart = this.#app.profiles.isInCart(profileId);

      // Check if THIS SPECIFIC clicked element represents an upsell
      const isUpsell = clickedElement.hasAttribute('data-os-upsell') ? 
        clickedElement.getAttribute('data-os-upsell') === 'true' : 
        (clickedElement.closest('[data-os-upsell-section]') !== null);

      if (isInCart) {
        // Remove profile from cart
        const result = await this.#app.profiles.removeFromCart(profileId);
        if (result) {
          this.#logger.info(`Toggled OFF profile: ${profileId}`);
        }
      } else {
        // Add profile to cart
        const result = await this.#app.profiles.addToCart(profileId, { quantity, is_upsell: isUpsell });
        if (result) {
          this.#logger.info(`Toggled ON profile: ${profileId}${isUpsell ? ' (upsell)' : ''}`);
        }
      }

      // Trigger event
      this.#app.triggerEvent('toggle.changed', { 
        profileId, 
        type: 'profile',
        isActive: !isInCart 
      });

    } catch (error) {
      this.#logger.error(`Error toggling profile ${profileId}:`, error);
    }
  }

  async #processPackageToggle(packageId, clickedElement, quantity) {
    // Translate the package ID using CountryCampaignManager if available
    const translatedPackageId = this.#translatePackageId(packageId);
    const isInCart = this.#isItemInCart(translatedPackageId);

    if (isInCart) {
      this.#removeItemFromCart(translatedPackageId);
      this.#logger.info(`Toggled OFF item ${packageId} (translated to ${translatedPackageId})`);
    } else {
      const packageData = this.#getPackageDataFromCampaign(translatedPackageId);
      if (!packageData) {
        this.#logger.error(`Package ${translatedPackageId} (original: ${packageId}) not found in campaign data`);
        return;
      }

      // Check if THIS SPECIFIC clicked element represents an upsell
      const isUpsell = clickedElement.hasAttribute('data-os-upsell') ? 
        clickedElement.getAttribute('data-os-upsell') === 'true' : 
        (clickedElement.closest('[data-os-upsell-section]') !== null);

      this.#addItemToCart({
        // Use translated package ID for the cart
        id: translatedPackageId, 
        name: packageData.name,
        price: Number.parseFloat(packageData.price),
        quantity,
        type: 'package',
        is_upsell: isUpsell
      });
      
      this.#logger.info(`Toggled ON item ${packageId} (translated to ${translatedPackageId})${isUpsell ? ' (upsell)' : ''}`);
    }

    // Trigger event with original packageId and new state
    this.#app.triggerEvent('toggle.changed', { 
      packageId, 
      translatedPackageId, 
      type: 'package',
      isActive: !isInCart 
    });
  }

  /**
   * Translate package ID using product profiles configuration
   * @param {string} originalPackageId - The original package ID from the HTML data attribute (canonical ID)
   * @returns {string} - The translated package ID for the current country's campaign
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
      
      // Use product profiles for translation
      const profiles = window.osConfig?.productProfiles;
      
      if (!profiles) {
        this.#logger.debug('No product profiles configuration found, using original package ID');
        return originalPackageId;
      }

      // Look through all profiles to find which one should be used for this canonical package ID
      // The originalPackageId might be a canonical ID that maps to different campaign IDs per country
      for (const [profileId, profile] of Object.entries(profiles)) {
        // Check if ANY country mapping in this profile matches the original package ID
        // This helps us identify which profile this canonical ID belongs to
        const hasMatchingMapping = Object.values(profile.campaignMappings || {}).some(mapping => 
          mapping.packageId?.toString() === originalPackageId?.toString()
        );
        
        if (hasMatchingMapping) {
          // Found the profile! Now get the package ID for the current country
          const currentMapping = profile.campaignMappings?.[currentCountry];
          if (currentMapping) {
            const translatedId = currentMapping.packageId?.toString();
            this.#logger.debug(`Translated package ID via profile ${profileId}: ${originalPackageId} -> ${translatedId} for country ${currentCountry}`);
            return translatedId;
      } else {
            this.#logger.warn(`Profile ${profileId} found but no mapping for country ${currentCountry}`);
        return originalPackageId;
          }
        }
      }

      // If no profile mapping found, this package might not be profile-based
      this.#logger.debug(`No profile mapping found for package ${originalPackageId}, using original ID`);
      return originalPackageId;
    } catch (error) {
      this.#logger.error('Error translating package ID:', error);
      return originalPackageId;
    }
  }

  #getPackageDataFromCampaign(packageId) {
    if (!this.#app.campaignData?.packages) {
      this.#logger.error('Campaign data not available');
      return null;
    }
    return this.#app.campaignData.packages.find(pkg => pkg.ref_id?.toString() === packageId?.toString() || pkg.id?.toString() === packageId?.toString()) ?? null;
  }
  
  // Update all toggle UIs (both packages and profiles)
  #updateAllToggleUIs() {
    this.#logger.debugWithTime(`[UPDATE_ALL] Cart state changed. Updating ALL toggle UIs.`);
    Object.values(this.#packageToggles).forEach(toggleInfo => { 
        if (toggleInfo.isProfile) {
          this.#updateUIForProfile(toggleInfo);
        } else {
          this.#updateUIForPackage(toggleInfo);
        }
    });
  }

  // Update UI for profile toggles
  #updateUIForProfile(profileInfo) {
    const { id: profileId, elements } = profileInfo;
    if (!elements || elements.length === 0) return;
    
    // Check if profile is in cart
    const isInCart = this.#app.profiles ? this.#app.profiles.isInCart(profileId) : false;
    this.#logger.debugWithTime(`[UPDATE_PROFILE_UI] Updating UI for profile ${profileId}. IsInCart: ${isInCart}. Element count: ${elements.length}`);
    
    elements.forEach(element => {
      element.classList.toggle('os--active', isInCart);
      element.setAttribute('data-os-active', isInCart.toString());

      const wrapper = element.closest('[data-os-toggle-wrapper]');
      if (wrapper) {
        wrapper.classList.toggle('os--active', isInCart);
        this.#logger.debugWithTime(`  > Toggled wrapper class for profile element ${profileId}`);
      }
    });
  }

  // Update UI for package toggles
  #updateUIForPackage(packageInfo) {
      const { packageId, elements } = packageInfo;
      if (!elements || elements.length === 0) return;
      
      // Translate the package ID to check against the cart
      const translatedPackageId = this.#translatePackageId(packageId);
      const isInCart = this.#isItemInCart(translatedPackageId);
      this.#logger.debugWithTime(`[UPDATE_PKG_UI] Updating UI for package ${packageId} (translated: ${translatedPackageId}). IsInCart: ${isInCart}. Element count: ${elements.length}`);
      
      elements.forEach(element => {
        element.classList.toggle('os--active', isInCart);
        element.setAttribute('data-os-active', isInCart.toString());
    
        const wrapper = element.closest('[data-os-toggle-wrapper]');
        if (wrapper) {
          wrapper.classList.toggle('os--active', isInCart);
          this.#logger.debugWithTime(`  > Toggled wrapper class for element of package ${packageId}`);
        } else {
          this.#logger.debugWithTime(`  > No wrapper found via closest() for element of package ${packageId}`);
        }
      });
  }

  #isItemInCart(itemId) {
    // Use item.package_id now that StateManager provides it reliably
    const items = this.#app.state.getState('cart')?.items || [];
    const found = items.some(item => item.package_id?.toString() === itemId?.toString());
    this.#logger.debugWithTime(`[isItemInCart] Checking for packageId: "${itemId}". Found: ${found}`);
    return found; 
  }

  #addItemToCart(item) {
    if (!this.#app.cart) {
      this.#logger.error('Cart manager not available');
      return;
    }
    this.#app.cart.addToCart(item);
  }

  #removeItemFromCart(packageIdToRemove) { // Renamed param for clarity
    if (!this.#app.cart) {
      this.#logger.error('Cart manager not available');
      return;
    }
    // Assuming CartManager.removeFromCart expects the packageId/ID used in the cart items
    this.#app.cart.removeFromCart(packageIdToRemove);
  }
}