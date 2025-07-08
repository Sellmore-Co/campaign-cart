/**
 * ProspectCartHandler - Creates carts for users based on form data
 * 
 * This component monitors checkout form fields and creates a cart in the API
 * when users fill out their email and other information. This helps with:
 * 1. Lead capture for abandoned carts
 * 2. Analytics for checkout funnel optimization
 * 3. Enabling cart recovery emails
 */

export class ProspectCartHandler {
  #app;
  #logger;
  #initialized = false;
  #cartCreated = false;
  #cartAttempted = false;
  #beginCheckoutFired = false; // Track if beginCheckout event has been fired
  #debounceTimeout = null;
  #debounceDelay = 3000; // 3 seconds debounce
  #lastFormData = null; // Track the last form data we attempted to use
  
  // Form field selectors
  #selectors = {
    firstName: '[os-checkout-field="fname"]',
    lastName: '[os-checkout-field="lname"]',
    email: '[os-checkout-field="email"]',
    phone: '[os-checkout-field="phone"]',
    address1: '[os-checkout-field="address1"]',
    address2: '[os-checkout-field="address2"]',
    city: '[os-checkout-field="city"]',
    province: '[os-checkout-field="province"]',
    postal: '[os-checkout-field="postal"]',
    country: '[os-checkout-field="country"]'
  };
  
  // Form fields
  #fields = {
    firstName: null,
    lastName: null,
    email: null,
    phone: null,
    address1: null,
    address2: null,
    city: null,
    province: null,
    postal: null,
    country: null
  };
  
  // Email validation regex
  #emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /**
   * Initialize the ProspectCartHandler
   * @param {Object} app - The main application instance
   */
  constructor(app) {
    this.#app = app;
    
    // Create a module-specific logger
    if (this.#app && this.#app.logger) {
      this.#logger = this.#app.logger.createModuleLogger('PROSPECT');
    } else {
      // Create a simple logger fallback
      this.#logger = {
        debug: (message, data) => console.log(`[PROSPECT DEBUG] ${message}`, data !== undefined ? data : ''),
        info: (message, data) => console.info(`[PROSPECT INFO] ${message}`, data !== undefined ? data : ''),
        warn: (message, data) => console.warn(`[PROSPECT WARN] ${message}`, data !== undefined ? data : ''),
        error: (message, data) => console.error(`[PROSPECT ERROR] ${message}`, data !== undefined ? data : '')
      };
    }
    
    // Initialize the component
    this.#init();
  }
  
  /**
   * Initialize the component
   */
  #init() {
    this.#logger.info('Initializing ProspectCartHandler');
    
    // Find form fields
    this.#findFormFields();
    
    // If required fields are found, attach event listeners
    if (this.#fields.email && (this.#fields.firstName || this.#fields.lastName)) {
      this.#attachEventListeners();
      this.#initialized = true;
      this.#logger.info('ProspectCartHandler initialized successfully');
    } else {
      this.#logger.warn('Required form fields not found, ProspectCartHandler not initialized');
    }
  }
  
  /**
   * Find form fields in the DOM
   */
  #findFormFields() {
    // Find each form field
    Object.keys(this.#selectors).forEach(field => {
      this.#fields[field] = document.querySelector(this.#selectors[field]);
      
      // Also try with data-os-field attribute if not found
      if (!this.#fields[field]) {
        const altSelector = this.#selectors[field].replace('os-checkout-field', 'data-os-field');
        this.#fields[field] = document.querySelector(altSelector);
      }
      
      // Log if field is found
      if (this.#fields[field]) {
        this.#logger.debug(`Found ${field} field`);
      } else {
        this.#logger.debug(`${field} field not found`);
      }
    });
  }
  
  /**
   * Attach event listeners to form fields
   */
  #attachEventListeners() {
    // Attach blur event listeners to key fields
    if (this.#fields.email) {
      this.#fields.email.addEventListener('blur', () => this.#handleFieldChange());
    }
    
    if (this.#fields.firstName) {
      this.#fields.firstName.addEventListener('blur', () => this.#handleFieldChange());
    }
    
    if (this.#fields.lastName) {
      this.#fields.lastName.addEventListener('blur', () => this.#handleFieldChange());
    }
    
    // Listen for form submission to prevent multiple cart creation attempts
    const form = document.querySelector('form[os-checkout="form"]');
    if (form) {
      form.addEventListener('submit', () => {
        // If the form is being submitted, we don't need to create a prospect cart
        this.#cartAttempted = true;
        if (this.#debounceTimeout) {
          clearTimeout(this.#debounceTimeout);
        }
      });
    }
    
    this.#logger.debug('Event listeners attached to form fields');
  }
  
  /**
   * Handle field change event
   */
  #handleFieldChange() {
    // If cart already created or attempted, don't try again
    if (this.#cartCreated || this.#cartAttempted) {
      return;
    }
    
    // Clear any existing timeout
    if (this.#debounceTimeout) {
      clearTimeout(this.#debounceTimeout);
    }
    
    // Check if we should fire the beginCheckout event
    // We do this before the debounce to capture the intent early
    this.#checkAndFireBeginCheckout();
    
    // Set a new timeout to debounce the cart creation
    this.#debounceTimeout = setTimeout(() => {
      this.#checkAndCreateCart();
    }, this.#debounceDelay);
  }
  
  /**
   * Check if we should fire the beginCheckout event
   * and fire it if we haven't already
   */
  #checkAndFireBeginCheckout() {
    // If we've already fired the event, don't fire it again
    if (this.#beginCheckoutFired) {
      return;
    }
    
    // Check if we have enough information to consider this a checkout start
    const hasEmail = this.#fields.email && 
                    this.#fields.email.value && 
                    this.#fields.email.value.trim().length > 0;
                    
    const hasName = (this.#fields.firstName && this.#fields.firstName.value && 
                    this.#fields.firstName.value.trim().length > 0) || 
                    (this.#fields.lastName && this.#fields.lastName.value && 
                    this.#fields.lastName.value.trim().length > 0);
    
    // If the user has entered an email or name, consider it a checkout start
    if (hasEmail || hasName) {
      this.#logger.debug('User has started entering checkout information, firing beginCheckout event');
      
      // Fire the beginCheckout event
      if (this.#app.events) {
        this.#app.events.beginCheckout();
        this.#beginCheckoutFired = true;
        this.#logger.info('beginCheckout event fired');
      }
    }
  }
  
  /**
   * Check if we have enough information to create a cart
   * and create it if we do
   */
  #checkAndCreateCart() {
    // If cart already created or attempted, don't create another one
    if (this.#cartCreated || this.#cartAttempted) {
      this.#logger.debug('Cart already created or attempted, skipping');
      return;
    }
    
    // Check if we have enough information to create a cart
    if (!this.#hasMinimumRequiredFields()) {
      this.#logger.debug('Not enough information to create a cart');
      return;
    }
    
    // Check if the form data has changed since our last attempt
    const currentFormData = this.#getFormData();
    if (this.#lastFormData && this.#isSameFormData(currentFormData, this.#lastFormData)) {
      this.#logger.debug('Form data has not changed since last attempt, skipping');
      return;
    }
    
    // Store the current form data
    this.#lastFormData = currentFormData;
    
    // Mark that we've attempted to create a cart
    this.#cartAttempted = true;
    
    // Create the cart
    this.#createProspectCart();
  }
  
  /**
   * Check if we have the minimum required fields to create a cart
   * @returns {boolean} Whether we have the minimum required fields
   */
  #hasMinimumRequiredFields() {
    // We need a valid email
    const hasValidEmail = this.#fields.email && 
                         this.#fields.email.value && 
                         this.#emailRegex.test(this.#fields.email.value);
    
    if (!hasValidEmail) {
      this.#logger.debug('Email is missing or invalid');
      return false;
    }
    
    // We need at least one name field (first or last)
    const hasFirstName = this.#fields.firstName && 
                        this.#fields.firstName.value && 
                        this.#fields.firstName.value.trim().length >= 2;
    
    const hasLastName = this.#fields.lastName && 
                       this.#fields.lastName.value && 
                       this.#fields.lastName.value.trim().length >= 2;
    
    if (!hasFirstName && !hasLastName) {
      this.#logger.debug('First name and last name are missing or too short');
      return false;
    }
    
    this.#logger.debug('Minimum required fields are present');
    return true;
  }
  
  /**
   * Get the current form data
   * @returns {Object} The form data
   */
  #getFormData() {
    const data = {};
    
    // Get values from all fields
    Object.keys(this.#fields).forEach(field => {
      if (this.#fields[field]) {
        data[field] = this.#fields[field].value;
      }
    });
    
    return data;
  }
  
  /**
   * Check if two form data objects are the same
   * @param {Object} data1 - The first form data object
   * @param {Object} data2 - The second form data object
   * @returns {boolean} Whether the form data objects are the same
   */
  #isSameFormData(data1, data2) {
    // Check if the required fields are the same
    return data1.email === data2.email && 
           data1.firstName === data2.firstName && 
           data1.lastName === data2.lastName;
  }
  
  /**
   * Create a prospect cart
   */
  #createProspectCart() {
    this.#logger.info('Creating prospect cart');
    
    // Get cart data from StateManager
    const cartData = this.#app.state.getState('cart');
    
    // If cart has no lines, don't create a cart
    if (!cartData || !cartData.items || cartData.items.length === 0) {
      this.#logger.warn('No cart items available, skipping cart creation');
      this.#cartAttempted = false; // Reset so we can try again later
      return;
    }
    
    // Get attribution data from state - it's already initialized and stored
    const attributionData = cartData.attribution || {};
    this.#logger.debug('Using attribution data from state', attributionData);
    
    // Get user information
    const firstName = this.#fields.firstName ? this.#fields.firstName.value : '';
    const lastName = this.#fields.lastName ? this.#fields.lastName.value : '';
    const email = this.#fields.email ? this.#fields.email.value : '';
    const phone = this.#getPhoneNumber();
    
    // Update user state with user information
    this.#updateUserState(email, firstName, lastName, phone);
    
    // Create cart data object with essential information
    const prospectCartData = {
      lines: cartData.items.map(item => {
        // Create the line item with required properties
        const lineItem = {
          package_id: item.id,
          quantity: item.quantity || 1
        };
        
        // Preserve is_upsell flag if it exists
        if (item.is_upsell === true) {
          lineItem.is_upsell = true;
          this.#logger.debug(`Adding upsell item to prospect cart: ${item.id}`);
        }
        
        return lineItem;
      }),
      user: {
        first_name: firstName,
        last_name: lastName,
        email: email
      },
      attribution: attributionData
    };

    // Only add phone number if it's valid
    if (phone) {
      prospectCartData.user.phone_number = phone;
    } else {
      this.#logger.warn('Invalid phone number format - sending cart without phone number');
    }
    
    // Add shipping method if available
    if (cartData.shippingMethod) {
      prospectCartData.shipping_method = cartData.shippingMethod.ref_id || (cartData.shippingMethod.id ? parseInt(cartData.shippingMethod.id, 10) : 1);
    }
    
    // IMPORTANT FIX: Don't include address data for prospect cart creation
    // This is the key change to fix the validation errors
    this.#logger.debug('Omitting address data for prospect cart creation');
    
    // Create the cart via API
    this.#createCartViaApi(prospectCartData);
  }
  
  /**
   * Update user state with user information
   * @param {string} email - User's email
   * @param {string} firstName - User's first name
   * @param {string} lastName - User's last name
   * @param {string} phone - User's phone number
   */
  #updateUserState(email, firstName, lastName, phone) {
    if (!this.#app.state) {
      this.#logger.warn('State manager not available, cannot update user state');
      return;
    }
    
    try {
      // Get current user state
      const currentUser = this.#app.state.getState('user') || {};
      
      // Update user state with new information
      const updatedUser = {
        ...currentUser,
        email: email || currentUser.email,
        firstName: firstName || currentUser.firstName,
        lastName: lastName || currentUser.lastName,
        phone: phone || currentUser.phone
      };
      
      // Set the updated user state
      this.#app.state.setState('user', updatedUser);
      this.#logger.debug('Updated user state with user information', updatedUser);
    } catch (error) {
      this.#logger.error('Error updating user state:', error);
    }
  }
  
  /**
   * Check if address data is valid
   * @param {Object} address - The address data
   * @returns {boolean} Whether the address is valid
   */
  #isAddressValid(address) {
    // If we have a country but no postal code, or an invalid postal code, the address is invalid
    if (address.country === 'US' && (!address.postcode || !this.#isValidPostalCode(address.postcode, 'US'))) {
      this.#logger.warn('US address requires a valid postal code');
      return false;
    }
    
    // For other countries, we're less strict
    return true;
  }
  
  /**
   * Get address data from form fields, validating postal code if present
   * @returns {Object} The validated address data
   */
  #getValidAddressData() {
    // Get country and postal code first to check validity
    const country = this.#fields.country && this.#fields.country.value ? 
                   this.#fields.country.value : '';
    
    const postalCode = this.#fields.postal && this.#fields.postal.value ? 
                      this.#fields.postal.value : '';
    
    // For US addresses, if postal code is invalid, don't include any address data
    if (country === 'US' && postalCode && !this.#isValidPostalCode(postalCode, country)) {
      this.#logger.warn(`Invalid postal code for US: ${postalCode} - omitting all address data`);
      return null;
    }
    
    // Only include address fields that have values
    const address = {};
    
    // Add name and phone to address if available
    if (this.#fields.firstName && this.#fields.firstName.value) {
      address.first_name = this.#fields.firstName.value;
    }
    
    if (this.#fields.lastName && this.#fields.lastName.value) {
      address.last_name = this.#fields.lastName.value;
    }
    
    const phone = this.#getPhoneNumber();
    if (phone) {
      address.phone_number = phone;
    }
    
    // Add optional address fields if they have values
    if (this.#fields.address1 && this.#fields.address1.value) {
      address.line1 = this.#fields.address1.value;
    }
    
    if (this.#fields.address2 && this.#fields.address2.value) {
      address.line2 = this.#fields.address2.value;
    }
    
    if (this.#fields.city && this.#fields.city.value) {
      address.line4 = this.#fields.city.value; // City
    }
    
    if (this.#fields.province && this.#fields.province.value) {
      address.state = this.#fields.province.value;
    }
    
    // Add country and postal code if available and valid
    if (country) {
      address.country = country;
    }
    
    if (postalCode && (!country || this.#isValidPostalCode(postalCode, country))) {
      address.postcode = postalCode;
    }
    
    return address;
  }
  
  /**
   * Check if a postal code is valid for a country
   * @param {string} postalCode - The postal code to validate
   * @param {string} country - The country code
   * @returns {boolean} Whether the postal code is valid
   */
  #isValidPostalCode(postalCode, country) {
    // Skip validation if no postal code or country
    if (!postalCode || !country) {
      return true;
    }
    
    // Validate based on country
    switch (country.toUpperCase()) {
      case 'US':
        // US postal codes should be 5 digits or 5+4 digits
        return /^\d{5}(-\d{4})?$/.test(postalCode);
        
      case 'CA':
        // Canadian postal codes: A1A 1A1
        return /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(postalCode);
        
      case 'GB':
      case 'UK':
        // UK postal codes are complex but generally follow this pattern
        return /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i.test(postalCode);
        
      case 'AU':
        // Australian postal codes are 4 digits
        return /^\d{4}$/.test(postalCode);
        
      case 'NZ':
        // New Zealand postal codes are 4 digits
        return /^\d{4}$/.test(postalCode);
        
      case 'DE':
        // German postal codes are 5 digits
        return /^\d{5}$/.test(postalCode);
        
      case 'FR':
        // French postal codes are 5 digits
        return /^\d{5}$/.test(postalCode);
        
      // Add more countries as needed
        
      default:
        // For other countries, accept any non-empty string
        // The API will validate if needed
        return postalCode.trim().length > 0;
    }
  }
  
  /**
   * Get phone number from field, handling international format
   * @returns {string} The phone number
   */
  #getPhoneNumber() {
    if (!this.#fields.phone) return '';
    
    // Check if we have an international telephone input instance
    if (this.#fields.phone.iti && typeof this.#fields.phone.iti.getNumber === 'function') {
      const number = this.#fields.phone.iti.getNumber();
      // Only return the number if it's valid
      if (this.#fields.phone.iti.isValidNumber()) {
        return number;
      }
      return ''; // Return empty string if invalid
    }
    
    // If no international telephone input, validate the number format
    const value = this.#fields.phone.value;
    if (!value) return '';
    
    // Basic phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(value.replace(/\D/g, '')) ? value : '';
  }
  
  /**
   * Create a cart via the API
   * @param {Object} cartData - The cart data
   */
  #createCartViaApi(cartData) {
    // Check if we have access to the API client
    if (!this.#app.api || typeof this.#app.api.createCart !== 'function') {
      this.#logger.error('API client not available');
      this.#cartAttempted = false; // Reset so we can try again later
      return;
    }
    
    // Log the cart data being sent
    this.#logger.debug('Sending cart data to API', cartData);
    
    // Create the cart
    this.#app.api.createCart(cartData)
      .then(response => {
        this.#logger.info('Prospect cart created successfully', response);
        this.#cartCreated = true;
        
        // Trigger prospect cart created event
        if (this.#app.events) {
          this.#app.events.trigger('prospect.cartCreated', {
            cart: response
          });
          
          // Trigger begin_checkout event for analytics if not already fired
          if (!this.#beginCheckoutFired) {
            this.#logger.info('Triggering beginCheckout event for analytics');
            this.#app.events.beginCheckout();
            this.#beginCheckoutFired = true;
          } else {
            this.#logger.debug('beginCheckout event already fired, skipping');
          }
        }
      })
      .catch(error => {
        this.#logger.error('Error creating prospect cart', error);
        // Reset the attempted flag so we can try again later with different data
        this.#cartAttempted = false;
      });
  }
  
  /**
   * Manually trigger the beginCheckout event
   * This can be called from outside the class if needed
   */
  triggerBeginCheckout() {
    if (this.#app && this.#app.events) {
      // Only fire if not already fired
      if (!this.#beginCheckoutFired) {
        this.#logger.info('Manually triggering beginCheckout event');
        this.#app.events.beginCheckout();
        this.#beginCheckoutFired = true;
        return true;
      } else {
        this.#logger.debug('beginCheckout event already fired, skipping');
        return false;
      }
    } else {
      this.#logger.warn('Cannot trigger beginCheckout event: Events manager not available');
      return false;
    }
  }
  
  /**
   * Reset the beginCheckout flag
   * This can be used if the user clears the form or starts over
   */
  resetBeginCheckoutFlag() {
    this.#beginCheckoutFired = false;
    this.#logger.debug('Reset beginCheckout flag');
    return true;
  }
}