/**
 * UpsellManager - Manages post-purchase upsell operations
 * 
 * This class provides functionality for handling post-purchase upsells,
 * allowing customers to add additional products to their order.
 */

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
        
        const packageId = button.getAttribute('data-os-package-id');
        const quantity = parseInt(button.getAttribute('data-os-quantity') || '1', 10);
        const nextUrl = button.getAttribute('data-os-next-url');
        
        if (!packageId) {
          this.#logger.error('No package ID specified for upsell accept button');
          return;
        }
        
        this.acceptUpsell(packageId, quantity, nextUrl);
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