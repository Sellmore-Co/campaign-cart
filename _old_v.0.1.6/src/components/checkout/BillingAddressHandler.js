/**
 * BillingAddressHandler - Manages the billing address form
 * 
 * This class handles the billing address form functionality, including:
 * - Toggle between using shipping address or a different billing address
 * - Copying shipping address values to billing fields
 * - Showing/hiding the billing form based on user selection
 * - Showing/hiding the billing location fields when address is entered
 */

export class BillingAddressHandler {
  #app;
  #logger;
  #sameAsShippingCheckbox;
  #billingFormContainer;
  #shippingFields = {};
  #billingFields = {};
  #fieldMap = {
    'fname': 'billing-fname',
    'lname': 'billing-lname',
    'address1': 'billing-address1',
    'address2': 'billing-address2',
    'city': 'billing-city',
    'province': 'billing-province',
    'postal': 'billing-postal',
    'country': 'billing-country',
    'phone': 'billing-phone'
  };
  #isTransitioning = false;
  #lastState = null;
  #billingLocationComponent = null;
  #billingAddress1Field = null;

  constructor(app) {
    this.#app = app;
    
    // Ensure we have a valid logger with all required methods
    if (app?.logger) {
      // If app.logger is a module logger, use it directly
      if (typeof app.logger.debug === 'function' && 
          typeof app.logger.info === 'function' && 
          typeof app.logger.warn === 'function' && 
          typeof app.logger.error === 'function') {
        this.#logger = app.logger;
      } else {
        // Otherwise, try to create a module logger
        this.#logger = app.logger.createModuleLogger ? 
          app.logger.createModuleLogger('BILLING') : 
          console;
      }
    } else {
      // Fallback to console if no logger is available
      this.#logger = console;
    }
    
    this.#init();
  }

  #init() {
    try {
      // Find the checkbox for "same as shipping" - try multiple possible selectors
      this.#sameAsShippingCheckbox = 
        document.querySelector('[os-checkout-field="same-as-shipping"]') || 
        document.querySelector('[name="use_shipping_address"]') || 
        document.querySelector('#use_shipping_address');
      
      this.#billingFormContainer = document.querySelector('[os-checkout-element="different-billing-address"]');
      
      // Find billing location component (city, state, zip)
      this.#billingLocationComponent = document.querySelector('[data-os-component="billing-location"]');
      
      // Find billing address field for input monitoring
      this.#billingAddress1Field = document.querySelector('[os-checkout-field="billing-address1"]');
      
      if (!this.#sameAsShippingCheckbox) {
        this.#logWarn('Same as shipping checkbox not found. Tried multiple selectors including [name="use_shipping_address"] and #use_shipping_address');
        
        // Log all checkboxes in the form for debugging
        const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
        this.#logDebug(`Found ${allCheckboxes.length} checkboxes on the page:`);
        allCheckboxes.forEach((checkbox, index) => {
          this.#logDebug(`Checkbox ${index + 1}: id=${checkbox.id}, name=${checkbox.name}, class=${checkbox.className}`);
        });
        
        return;
      }
      
      if (!this.#billingFormContainer) {
        this.#logWarn('Billing form container not found with selector [os-checkout-element="different-billing-address"]');
        
        // Try alternative selector
        this.#billingFormContainer = document.querySelector('.billing_form-container');
        if (this.#billingFormContainer) {
          this.#logInfo('Found billing form container with alternative selector .billing_form-container');
        } else {
          return;
        }
      }
      
      this.#logDebug('BillingAddressHandler initialized');
      
      // Cache all shipping and billing field elements
      this.#cacheFieldElements();
      
      // Set initial state based on checkbox
      this.#lastState = this.#sameAsShippingCheckbox.checked;
      this.#toggleBillingForm(this.#lastState, false);
      
      // Set up billing location visibility
      this.#setupBillingLocationVisibility();
      
      // Add event listeners
      this.#setupEventListeners();
    } catch (error) {
      this.#logError('Error initializing BillingAddressHandler:', error);
    }
  }

  // Safe logging methods that check if the method exists before calling
  #logDebug(message, ...args) {
    if (typeof this.#logger.debug === 'function') {
      this.#logger.debug(message, ...args);
    } else if (typeof this.#logger.log === 'function') {
      this.#logger.log(message, ...args);
    }
  }

  #logInfo(message, ...args) {
    if (typeof this.#logger.info === 'function') {
      this.#logger.info(message, ...args);
    } else if (typeof this.#logger.log === 'function') {
      this.#logger.log(message, ...args);
    }
  }

  #logWarn(message, ...args) {
    if (typeof this.#logger.warn === 'function') {
      this.#logger.warn(message, ...args);
    } else if (typeof this.#logger.log === 'function') {
      this.#logger.log(`WARNING: ${message}`, ...args);
    }
  }

  #logError(message, error) {
    if (typeof this.#logger.error === 'function') {
      this.#logger.error(message, error);
    } else if (typeof this.#logger.log === 'function') {
      this.#logger.log(`ERROR: ${message}`, error);
    } else {
      console.error(message, error);
    }
  }

  #setupBillingLocationVisibility() {
    // If we don't have the billing location component or address field, we can't proceed
    if (!this.#billingLocationComponent) {
      this.#logWarn('Billing location component not found with selector [data-os-component="billing-location"]');
      return;
    }
    
    if (!this.#billingAddress1Field) {
      this.#logWarn('Billing address1 field not found with selector [os-checkout-field="billing-address1"]');
      return;
    }
    
    // Set initial state - hide the location component
    this.#billingLocationComponent.classList.add('cc-hidden');
    
    this.#logDebug('Billing location component initially hidden');
  }

  #cacheFieldElements() {
    // Cache shipping fields
    Object.keys(this.#fieldMap).forEach(shippingField => {
      const element = document.querySelector(`[os-checkout-field="${shippingField}"]`);
      if (element) {
        this.#shippingFields[shippingField] = element;
      }
    });
    
    // Cache billing fields
    Object.values(this.#fieldMap).forEach(billingField => {
      const element = document.querySelector(`[os-checkout-field="${billingField}"]`);
      if (element) {
        this.#billingFields[billingField] = element;
      }
    });
    
    this.#logDebug(`Cached ${Object.keys(this.#shippingFields).length} shipping fields and ${Object.keys(this.#billingFields).length} billing fields`);
  }

  #setupEventListeners() {
    // Listen for changes to the "same as shipping" checkbox
    this.#sameAsShippingCheckbox.addEventListener('change', (e) => {
      if (!this.#isTransitioning) {
        this.#lastState = e.target.checked;
        this.#toggleBillingForm(e.target.checked, true);
        
        // If checked, copy shipping values to billing
        if (e.target.checked) {
          this.copyShippingToBilling();
        }
        
        this.#logDebug(`Billing address changed: ${e.target.checked ? 'Same as shipping' : 'Different from shipping'}`);
      }
    });
    
    // Listen for payment method changes
    document.addEventListener('payment-method-changed', () => {
      if (this.#lastState !== null && !this.#isTransitioning) {
        this.#toggleBillingForm(this.#lastState, false);
        this.#logDebug(`Payment method changed, billing address state: ${this.#lastState ? 'Same as shipping' : 'Different from shipping'}`);
      }
    });
    
    // Listen for address autocomplete showing location fields
    document.addEventListener('location-fields-shown', () => {
      if (this.#billingLocationComponent) {
        this.#showBillingLocationComponent();
        this.#logDebug('Location fields shown by AddressAutocomplete, showing billing location component as well');
      }
    });
    
    // Listen for changes to shipping fields to update billing if "same as shipping" is checked
    Object.entries(this.#shippingFields).forEach(([fieldName, element]) => {
      element.addEventListener('change', () => {
        if (this.#sameAsShippingCheckbox.checked) {
          const billingFieldName = this.#fieldMap[fieldName];
          const billingElement = this.#billingFields[billingFieldName];
          
          if (billingElement) {
            billingElement.value = element.value;
            
            // Trigger change event on the billing field
            billingElement.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      });
    });
    
    // Set up input handler for billing address1 field
    if (this.#billingAddress1Field && this.#billingLocationComponent) {
      // Show location component when user types in address
      this.#billingAddress1Field.addEventListener('input', () => {
        // Show location component after minimum characters
        if (this.#billingAddress1Field.value.length >= 3) {
          this.#showBillingLocationComponent();
        }
      });
      
      // Set up mutation observer for autocomplete
      this.#setupBillingAddressAutocompleteDetection();
    }
  }

  #setupBillingAddressAutocompleteDetection() {
    // Create mutation observer to detect when autocomplete fills the address field
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && 
            (mutation.attributeName === 'value' || mutation.attributeName === 'autocomplete-value')) {
          if (this.#billingAddress1Field.value.length > 0) {
            this.#showBillingLocationComponent();
            this.#logDebug('Autocomplete detected on billing address field');
          }
        }
      });
    });
    
    // Observe changes to the value attribute of the billing address field
    observer.observe(this.#billingAddress1Field, { 
      attributes: true, 
      attributeFilter: ['value', 'autocomplete-value'] 
    });
    
    // Also listen for Google Places API autocomplete events
    document.addEventListener('google-places-autocomplete-filled', (e) => {
      if (e.detail && e.detail.field === 'billing-address1') {
        this.#showBillingLocationComponent();
        this.#logDebug('Google Places autocomplete detected on billing address field');
      }
    });
    
    this.#logDebug('Billing address autocomplete detection set up');
  }

  #showBillingLocationComponent() {
    if (this.#billingLocationComponent && this.#billingLocationComponent.classList.contains('cc-hidden')) {
      this.#billingLocationComponent.classList.remove('cc-hidden');
      this.#logDebug('Billing location component shown');
    }
  }

  #toggleBillingForm(isChecked, animate = true) {
    if (!this.#billingFormContainer || this.#isTransitioning) return;

    this.#isTransitioning = true;

    if (!this.#billingFormContainer.style.transition) {
      this.#billingFormContainer.style.transition = 'height 0.3s ease-out, opacity 0.3s ease-out';
    }

    const handleTransitionEnd = (e) => {
      if (e.propertyName === 'height') {
        if (!isChecked) {
          this.#billingFormContainer.style.height = 'auto';
        }
        this.#billingFormContainer.style.overflow = '';
        this.#isTransitioning = false;
        this.#billingFormContainer.removeEventListener('transitionend', handleTransitionEnd);
        
        this.#logDebug(`Billing form transition completed: ${isChecked ? 'collapsed' : 'expanded'}`);
      }
    };

    if (animate) {
      this.#billingFormContainer.removeEventListener('transitionend', handleTransitionEnd);
      
      if (!isChecked) {
        // Expanding
        this.#billingFormContainer.style.display = 'flex';
        this.#billingFormContainer.style.height = '0px';
        this.#billingFormContainer.style.overflow = 'hidden';
        
        requestAnimationFrame(() => {
          const targetHeight = this.#billingFormContainer.scrollHeight;
          this.#billingFormContainer.style.height = `${targetHeight}px`;
          this.#billingFormContainer.style.opacity = '1';
          
          this.#logDebug(`Expanding billing form to height: ${targetHeight}px`);
        });
        
        this.#billingFormContainer.addEventListener('transitionend', handleTransitionEnd);
      } else {
        // Collapsing
        this.#billingFormContainer.style.height = `${this.#billingFormContainer.scrollHeight}px`;
        this.#billingFormContainer.style.overflow = 'hidden';
        
        requestAnimationFrame(() => {
          this.#billingFormContainer.style.height = '0px';
          this.#billingFormContainer.style.opacity = '0';
          
          this.#logDebug('Collapsing billing form');
        });
        
        this.#billingFormContainer.addEventListener('transitionend', handleTransitionEnd);
        
        this.#billingFormContainer.addEventListener('transitionend', (e) => {
          if (e.propertyName === 'height' && isChecked) {
            this.#billingFormContainer.style.display = 'none';
            this.#logDebug('Billing form hidden after collapse');
          }
        }, { once: true });
      }
    } else {
      // No animation for initial state
      this.#billingFormContainer.style.display = isChecked ? 'none' : 'flex';
      this.#billingFormContainer.style.height = isChecked ? '0' : 'auto';
      this.#billingFormContainer.style.opacity = isChecked ? '0' : '1';
      this.#billingFormContainer.style.overflow = '';
      this.#isTransitioning = false;
      
      this.#logDebug(`Set billing form without animation: ${isChecked ? 'hidden' : 'visible'}`);
    }
  }

  // Deprecated method - use #toggleBillingForm instead
  #updateBillingFormVisibility() {
    this.#toggleBillingForm(this.#sameAsShippingCheckbox.checked, false);
  }

  /**
   * Copy shipping address values to billing address fields
   */
  copyShippingToBilling() {
    try {
      Object.entries(this.#shippingFields).forEach(([shippingField, shippingElement]) => {
        const billingFieldName = this.#fieldMap[shippingField];
        const billingElement = this.#billingFields[billingFieldName];
        
        if (billingElement && shippingElement) {
          billingElement.value = shippingElement.value;
          
          // Trigger change event on the billing field
          billingElement.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      
      // If address1 is copied and has value, show location component
      if (this.#billingFields['billing-address1'] && 
          this.#billingFields['billing-address1'].value && 
          this.#billingFields['billing-address1'].value.length > 0) {
        this.#showBillingLocationComponent();
      }
      
      this.#logDebug('Copied shipping address to billing address');
    } catch (error) {
      this.#logError('Error copying shipping to billing:', error);
    }
  }

  /**
   * Get the billing address data
   * If "same as shipping" is checked, returns null to indicate shipping should be used
   * Otherwise returns an object with the billing address fields
   */
  getBillingAddressData() {
    // If same as shipping is checked, return null to indicate shipping should be used
    if (this.#sameAsShippingCheckbox && this.#sameAsShippingCheckbox.checked) {
      return null;
    }
    
    // Otherwise, collect billing address data
    const billingData = {};
    
    Object.entries(this.#billingFields).forEach(([fieldName, element]) => {
      // Convert from billing-fname to fname format for API
      const apiFieldName = fieldName.replace('billing-', '');
      billingData[apiFieldName] = element.value;
    });
    
    return billingData;
  }

  /**
   * Check if billing address is same as shipping
   * @returns {boolean} Whether billing address is same as shipping
   */
  isSameAsShipping() {
    const isSame = this.#sameAsShippingCheckbox ? this.#sameAsShippingCheckbox.checked : true;
    this.#logDebug(`Billing address is ${isSame ? 'same as' : 'different from'} shipping`);
    return isSame;
  }
}