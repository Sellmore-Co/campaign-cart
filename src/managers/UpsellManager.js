/**
 * UpsellManager - Manages post-purchase upsell operations
 * 
 * This class provides functionality for handling post-purchase upsells,
 * allowing customers to add additional products or product profiles to their order.
 * 
 * Supports both individual packages and product profiles:
 * - Package upsells: Use data-os-package-id attribute
 * - Profile upsells: Use data-os-profile-id attribute (works with CountryCampaignManager)
 * 
 * Example HTML for package upsell:
 * <button data-os-upsell="accept" data-os-package-id="123" data-os-quantity="1" data-os-next-url="/next">Accept</button>
 * 
 * Example HTML for profile upsell:
 * <button data-os-upsell="accept" data-os-profile-id="premium-bundle" data-os-quantity="1" data-os-next-url="/next">Accept</button>
 */

import { initNavigationPrevention, saveAcceptedUpsell, createNextUrlWithDebug } from '../utils/NavigationPrevention.js';

export class UpsellManager {
  #app;
  #logger;
  #stateManager;
  #api;
  #upsellElements = {};
  #orderRef = null;

  constructor(app) {
    this.#app = app;
    this.#logger = app.logger.createModuleLogger('UPSELL');
    this.#stateManager = app.state;
    this.#api = app.api;
    
    this.#init();
    this.#logger.info('UpsellManager initialized');
  }

  #init() {
    // Initialize navigation prevention
    // initNavigationPrevention();
    
    // Check for order reference in URL or sessionStorage
    this.#orderRef = this.#getOrderReferenceId();
    
    if (this.#orderRef) {
      this.#logger.info(`Order reference ID found: ${this.#orderRef}`);
      this.#stateManager.setState('order.ref_id', this.#orderRef);
    } else {
      this.#logger.warn('No order reference ID found, upsell functionality will be limited');
    }
    
    this.#initUpsellElements();
    this.#bindEvents();
    this.#setupCountryChangeListener();
  }

  /**
   * Setup listener for country changes
   */
  #setupCountryChangeListener() {
    document.addEventListener('os:country.changed', (event) => {
      const { country, previousCountry, campaignData } = event.detail;
      this.#logger.info(`Country changed from ${previousCountry} to ${country}, upsell system updated`);
      
      // Log country change for upsell context
      this.#logger.debug('Updated campaign data available for upsell operations', {
        currency: campaignData?.currency,
        packages: campaignData?.packages?.length || 0
      });
    });
  }
  
  /**
   * Get the order reference ID from URL parameters or sessionStorage
   * @returns {string|null} The order reference ID or null if not found
   */
  #getOrderReferenceId() {
    // Try to get from URL parameters first
    const urlParams = new URLSearchParams(window.location.search);
    let refId = urlParams.get('ref_id');
    
    // If not in URL, try sessionStorage
    if (!refId) {
      refId = sessionStorage.getItem('order_ref_id');
      this.#logger.debug('Getting order ref_id from sessionStorage:', refId);
    } else {
      this.#logger.debug('Getting order ref_id from URL parameters:', refId);
      // Save to sessionStorage for future use
      sessionStorage.setItem('order_ref_id', refId);
    }
    
    return refId;
  }
  
  /**
   * Initialize upsell UI elements
   */
  #initUpsellElements() {
    this.#upsellElements = {
      acceptButtons: document.querySelectorAll('[data-os-upsell="accept"]'),
      declineButtons: document.querySelectorAll('[data-os-upsell="decline"]'),
    };
    
    this.#logger.debug(`Found ${this.#upsellElements.acceptButtons.length} accept buttons and ${this.#upsellElements.declineButtons.length} decline buttons`);
  }
  
  /**
   * Bind events to upsell elements
   */
  #bindEvents() {
    // Bind click events to accept buttons
    this.#upsellElements.acceptButtons.forEach(button => {
      button.addEventListener('click', event => {
        event.preventDefault();
        
        // Check for both package and profile attributes
        const packageId = button.getAttribute('data-os-package-id');
        const profileId = button.getAttribute('data-os-profile-id');
        
        if (!packageId && !profileId) {
          this.#logger.error('No package ID or profile ID specified for upsell accept button');
          return;
        }
        
        const quantity = parseInt(button.getAttribute('data-os-quantity') || '1', 10);
        const nextUrl = button.getAttribute('data-os-next-url');
        
        // Determine if this is a profile or package upsell
        const isProfile = !!profileId;
        const upsellId = isProfile ? profileId : packageId;
        
        this.#logger.debug(`Processing upsell: ${isProfile ? 'Profile' : 'Package'} ${upsellId}`);
        
        if (isProfile) {
          this.acceptProfileUpsell(profileId, quantity, nextUrl);
        } else {
          this.acceptUpsell(packageId, quantity, nextUrl);
        }
      });
    });
    
    // Bind click events to decline buttons
    this.#upsellElements.declineButtons.forEach(button => {
      button.addEventListener('click', event => {
        event.preventDefault();
        
        const nextUrl = button.getAttribute('data-os-next-url');
        if (nextUrl) {
          this.declineUpsell(nextUrl);
        } else {
          this.#logger.error('No next URL specified for upsell decline button');
        }
      });
    });
  }
  
  /**
   * Accept a profile upsell offer by adding the profile packages to the order
   * @param {string} profileId - The profile ID to add to the order
   * @param {number} quantity - The quantity multiplier (default: 1)
   * @param {string} nextUrl - The URL to redirect to after adding the upsell
   */
  async acceptProfileUpsell(profileId, quantity = 1, nextUrl) {
    if (!this.#orderRef) {
      this.#logger.error('Cannot accept profile upsell: No order reference ID found');
      return;
    }

    if (!this.#app.profiles) {
      this.#logger.error('Cannot accept profile upsell: ProductProfileManager not available');
      return;
    }

    this.#logger.info(`Accepting profile upsell: Profile ${profileId}, Quantity ${quantity}`);
    
    // Disable all upsell buttons to prevent multiple clicks
    this.#disableUpsellButtons();
    
    try {
      // Show loading state
      document.body.classList.add('os-loading');
      
      // Get profile mapping for current country
      const mapping = this.#app.profiles.getCurrentMapping(profileId);
      if (!mapping) {
        throw new Error(`No mapping found for profile ${profileId} in current country`);
      }

      const profile = this.#app.profiles.getProfile(profileId);
      const packages = Array.isArray(mapping) ? mapping : [mapping];
      
      // Create upsell lines for all packages in the profile
      const upsellLines = [];
      
      for (const pkg of packages) {
        const packageQuantity = (pkg.quantity || 1) * quantity;
        
        upsellLines.push({
          package_id: Number(pkg.packageId),
          quantity: Number(packageQuantity),
          is_upsell: true
        });
        
        this.#logger.debug(`Added package ${pkg.packageId} (qty: ${packageQuantity}) to profile upsell`);
      }

      // Create the upsell data
      const upsellData = {
        lines: upsellLines
      };
      
      // Call the API to add the upsell
      const response = await this.#api.createOrderUpsell(this.#orderRef, upsellData);
      this.#logger.info('Profile upsell successfully added to order', response);
      
      // Store upsell information for tracking
      this.#storeProfileUpsellPurchaseData(response, profileId, profile, packages, quantity);
      
      // Redirect to the next page
      this.#redirect(nextUrl);
    } catch (error) {
      this.#logger.error('Error accepting profile upsell:', error);
      document.body.classList.remove('os-loading');
      
      // Re-enable buttons in case of error
      this.#enableUpsellButtons();
      
      // Display error to user
      this.#displayError('There was an error processing your upsell. Please try again.');
    }
  }
  
  /**
   * Accept an upsell offer by adding the product to the order
   * @param {string|number} packageId - The package ID to add to the order
   * @param {number} quantity - The quantity to add (default: 1)
   * @param {string} nextUrl - The URL to redirect to after adding the upsell
   */
  async acceptUpsell(packageId, quantity = 1, nextUrl) {
    if (!this.#orderRef) {
      this.#logger.error('Cannot accept upsell: No order reference ID found');
      return;
    }
    
    this.#logger.info(`Accepting upsell: Package ${packageId}, Quantity ${quantity}`);
    
    // Disable all upsell buttons to prevent multiple clicks
    this.#disableUpsellButtons();
    
    try {
      // Show loading state
      document.body.classList.add('os-loading');
      
      // Create the upsell data
      const upsellData = {
        lines: [{
          package_id: Number(packageId),
          quantity: Number(quantity),
          is_upsell: true
        }]
      };
      
      // Call the API to add the upsell
      const response = await this.#api.createOrderUpsell(this.#orderRef, upsellData);
      this.#logger.info('Upsell successfully added to order', response);
      
      // Store upsell information in sessionStorage for tracking on the next page
      this.#storeUpsellPurchaseData(response, packageId, quantity);
      
      // Save accepted upsell info for back navigation prevention
      //const processedNextUrl = createNextUrlWithDebug(nextUrl);
      // saveAcceptedUpsell(packageId, processedNextUrl);
      
      // Redirect to the next page
      this.#redirect(nextUrl);
    } catch (error) {
      this.#logger.error('Error accepting upsell:', error);
      document.body.classList.remove('os-loading');
      
      // Re-enable buttons in case of error
      this.#enableUpsellButtons();
      
      // Display error to user
      this.#displayError('There was an error processing your upsell. Please try again.');
    }
  }
  
  /**
   * Store profile upsell data in sessionStorage for tracking
   * @param {Object} response - API response from createOrderUpsell
   * @param {string} profileId - The profile ID added to the order
   * @param {Object} profile - The profile object
   * @param {Array} packages - The packages that were added
   * @param {number} quantity - The quantity multiplier
   */
  #storeProfileUpsellPurchaseData(response, profileId, profile, packages, quantity) {
    try {
      // Calculate total price for the profile upsell
      let totalPrice = 0;
      const upsellLines = [];

      packages.forEach(pkg => {
        const packageQuantity = (pkg.quantity || 1) * quantity;
        
        // Get package price from campaign data
        const campaignData = this.#app.getCampaignData();
        const packageData = campaignData?.packages?.find(p => 
          p.ref_id.toString() === pkg.packageId.toString() || 
          p.external_id?.toString() === pkg.packageId.toString()
        );

        if (packageData) {
          const packagePrice = parseFloat(packageData.price) * packageQuantity;
          totalPrice += packagePrice;

          upsellLines.push({
            product_id: packageData.external_id || packageData.ref_id,
            product_title: packageData.name,
            price: parseFloat(packageData.price),
            quantity: packageQuantity,
            is_upsell: true,
            profile_id: profileId,
            profile_name: profile.name
          });
        }
      });

      // Store data for tracking
      const upsellPurchaseData = {
        number: response.number || response.ref_id,
        ref_id: response.ref_id,
        total: totalPrice,
        currency: this.#app.getCampaignData()?.currency || 'USD',
        lines: upsellLines,
        profile_id: profileId,
        profile_name: profile.name
      };

      // Store data in sessionStorage
      sessionStorage.setItem('pending_upsell_purchase', 'true');
      sessionStorage.setItem('upsell_purchase_data', JSON.stringify(upsellPurchaseData));

      this.#logger.info('Stored profile upsell purchase data for tracking', upsellPurchaseData);
    } catch (error) {
      this.#logger.error('Error storing profile upsell purchase data:', error);
    }
  }
  
  /**
   * Store upsell data in sessionStorage to track as a purchase event on next page load
   * @param {Object} response - API response from createOrderUpsell
   * @param {string|number} packageId - The package ID added to the order
   * @param {number} quantity - The quantity added
   */
  #storeUpsellPurchaseData(response, packageId, quantity) {
    try {
      // Get the campaign data to find the package details
      const campaignData = this.#app.getCampaignData();
      if (!campaignData || !campaignData.packages) {
        this.#logger.warn('Campaign data not available for upsell tracking');
        return;
      }
      
      // Find the package that was added as an upsell
      const packageData = campaignData.packages.find(pkg => 
        pkg.ref_id.toString() === packageId.toString() || 
        pkg.external_id?.toString() === packageId.toString()
      );
      
      if (!packageData) {
        this.#logger.warn(`Package data not found for upsell tracking: ${packageId}`);
        return;
      }
      
      // Store minimal order data needed for the purchase event
      const upsellPurchaseData = {
        number: response.number || response.ref_id,
        ref_id: response.ref_id,
        total: parseFloat(packageData.price) * quantity,
        currency: campaignData.currency || 'USD',
        lines: [{
          product_id: packageData.external_id || packageData.ref_id,
          product_title: packageData.name,
          price: parseFloat(packageData.price),
          quantity: quantity,
          is_upsell: true
        }]
      };
      
      // Store data in sessionStorage with a flag indicating it's an upsell purchase
      sessionStorage.setItem('pending_upsell_purchase', 'true');
      sessionStorage.setItem('upsell_purchase_data', JSON.stringify(upsellPurchaseData));
      
      this.#logger.info('Stored upsell purchase data for tracking on next page load', upsellPurchaseData);
    } catch (error) {
      this.#logger.error('Error storing upsell purchase data:', error);
    }
  }
  
  /**
   * Decline an upsell offer and redirect to the next URL
   * @param {string} nextUrl - The URL to redirect to
   */
  declineUpsell(nextUrl) {
    this.#logger.info('Declining upsell offer');
    
    // Disable all upsell buttons to prevent multiple clicks
    this.#disableUpsellButtons();
    
    this.#redirect(nextUrl);
  }
  
  /**
   * Disable all upsell buttons to prevent multiple clicks
   */
  #disableUpsellButtons() {
    this.#logger.debug('Disabling upsell buttons');
    
    // Disable all accept buttons
    this.#upsellElements.acceptButtons.forEach(button => {
      button.style.pointerEvents = 'none';
      button.classList.add('os-button-disabled');
    });
    
    // Disable all decline buttons
    this.#upsellElements.declineButtons.forEach(button => {
      button.style.pointerEvents = 'none';
      button.classList.add('os-button-disabled');
    });
  }
  
  /**
   * Re-enable all upsell buttons (used in case of error)
   */
  #enableUpsellButtons() {
    this.#logger.debug('Re-enabling upsell buttons');
    
    // Re-enable all accept buttons
    this.#upsellElements.acceptButtons.forEach(button => {
      button.style.pointerEvents = '';
      button.classList.remove('os-button-disabled');
    });
    
    // Re-enable all decline buttons
    this.#upsellElements.declineButtons.forEach(button => {
      button.style.pointerEvents = '';
      button.classList.remove('os-button-disabled');
    });
  }
  
  /**
   * Redirect to a URL, appending the order reference ID if needed
   * @param {string} url - The URL to redirect to
   */
  #redirect(url) {
    if (!url) {
      this.#logger.warn('No URL provided for redirect');
      return;
    }
    
    const redirectUrl = new URL(url, window.location.origin);
    
    // Append the order reference ID if not already in the URL
    if (this.#orderRef && !redirectUrl.searchParams.has('ref_id')) {
      redirectUrl.searchParams.append('ref_id', this.#orderRef);
    }
    
    // Preserve debug parameter if present
    const currentUrlParams = new URLSearchParams(window.location.search);
    if (currentUrlParams.has('debug') && currentUrlParams.get('debug') === 'true' && 
        !redirectUrl.searchParams.has('debug')) {
      redirectUrl.searchParams.append('debug', 'true');
    }
    
    this.#logger.info(`Redirecting to ${redirectUrl.href}`);
    window.location.href = redirectUrl.href;
  }
  
  /**
   * Display an error message to the user
   * @param {string} message - The error message to display
   */
  #displayError(message) {
    const errorContainer = document.querySelector('[data-os-error-container]');
    if (errorContainer) {
      errorContainer.textContent = message;
      errorContainer.style.display = 'block';
    } else {
      alert(message);
    }
  }
} 