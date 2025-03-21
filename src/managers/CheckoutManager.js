/**
 * CheckoutPage - Handles checkout page functionality
 * 
 * This class is responsible for initializing and managing the checkout page,
 * including form validation, payment processing, and address handling.
 */

import { AddressHandler } from '../components/checkout/AddressHandler.js';
import { FormValidator } from '../components/checkout/FormValidator.js';
import { PaymentHandler } from '../components/checkout/PaymentHandler.js';
import { BillingAddressHandler } from '../components/checkout/BillingAddressHandler.js';
import { PaymentSelector } from '../components/checkout/PaymentSelector.js';
import { AddressAutocomplete } from '../components/checkout/AddressAutocomplete.js';
import { PhoneInputHandler } from '../components/checkout/PhoneInputHandler.js';
import { ProspectCartHandler } from '../components/checkout/ProspectCartHandler.js';
import { KonamiCodeHandler } from '../utils/KonamiCodeHandler.js';

export class CheckoutPage {
  #apiClient;
  #logger;
  #form;
  #app;
  #konamiCodeHandler;

  constructor(apiClient, logger, app) {
    this.#apiClient = apiClient;
    this.#logger = logger;
    this.#app = app; // Store the app instance for use with ProspectCartHandler
    this.#form = document.querySelector('form[os-checkout="form"]') || document.querySelector('form#combo_form');
    
    if (!this.#form) {
      this.#logger.warn('No checkout form found with [os-checkout="form"] selector or form#combo_form');
      return;
    }
    
    // CRITICAL: Remove any action and set method to post to prevent URL serialization
    this.#form.removeAttribute('action');
    this.#form.setAttribute('method', 'post');
    this.#form.setAttribute('novalidate', 'novalidate');
    
    // Add a hidden input to indicate JavaScript is enabled
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = 'js_enabled';
    hiddenInput.value = 'true';
    this.#form.appendChild(hiddenInput);
    
    // Add a hidden input to prevent serialization
    const preventSerializationInput = document.createElement('input');
    preventSerializationInput.type = 'hidden';
    preventSerializationInput.name = 'prevent_serialization';
    preventSerializationInput.value = 'true';
    this.#form.appendChild(preventSerializationInput);
    
    // Add multiple layers of form submission prevention
    const preventSubmit = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
      
      // Ensure form doesn't have action and has post method
      this.#form.removeAttribute('action');
      this.#form.setAttribute('method', 'post');
      
      // Cancel any form submission that might be in progress
      if (typeof window.stop === 'function') {
        window.stop();
      }
      
      this.#logger.debug('Form direct submission prevented');
      return false;
    };
    
    this.#form.addEventListener('submit', preventSubmit, true);
    this.#form.onsubmit = preventSubmit;
    
    // Disable all submit buttons in the form
    this.#disableSubmitButtons();
    
    this.#logger.debug('CheckoutPage initialized with form found');
    this.#initializeComponents();
    
    // Initialize Konami code handler
    this.#initKonamiCodeHandler();
  }

  #initializeComponents() {
    try {
      // First, fix the billing form by duplicating shipping form fields
      this.#injectBillingFormFields();
      
      // Initialize components one by one with proper error handling
      this.#initAddressHandler();
      this.#initBillingAddressHandler();
      this.#initPaymentSelector();
      this.#initFormValidator();
      this.#initPaymentHandler();
      this.#initAddressAutocomplete();
      this.#initPhoneInputHandler();
      this.#initProspectCartHandler();
      
      this.#setupEventListeners();
      
      document.dispatchEvent(new CustomEvent('os:checkout.ready', {
        detail: { checkoutPage: this }
      }));
      
      this.#logger.info('Checkout page components initialized successfully');
    } catch (error) {
      this.#logger.error('Error initializing checkout components', error);
    }
  }

  /**
   * Initialize the Konami code handler
   */
  #initKonamiCodeHandler() {
    try {
      // Create a new KonamiCodeHandler instance with a callback to trigger the Easter egg
      this.#konamiCodeHandler = new KonamiCodeHandler({
        callback: () => this.#triggerKonamiCodeEasterEgg(),
        logger: this.#logger
      });
      
      this.#logger.debug('Konami code handler initialized');
    } catch (error) {
      this.#logger.error('Error initializing Konami code handler:', error);
    }
  }
  
  /**
   * Trigger the Konami code Easter egg - create a test order with predefined data
   */
  #triggerKonamiCodeEasterEgg() {
    try {
      this.#logger.info('🎮 Konami code activated! Creating test order...');
      
      // Show the activation message
      const messageElement = KonamiCodeHandler.showActivationMessage();
      
      // Process the test payment after a short delay
      setTimeout(() => {
        // Remove the message
        document.body.removeChild(messageElement);
        
        // Process the test payment
        if (this.paymentHandler) {
          // Set Konami test mode
          KonamiCodeHandler.setTestMode();
          
          // Process the payment - the payment handler will detect the Konami test mode
          this.paymentHandler.processPayment();
          
          this.#logger.info('Konami code test order initiated');
        } else {
          this.#logger.error('Payment handler not initialized, cannot create test order');
          alert('Could not create test order: Payment handler not initialized');
        }
      }, 2000);
    } catch (error) {
      this.#logger.error('Error triggering Konami code Easter egg:', error);
    }
  }

  #initAddressHandler() {
    try {
      this.addressHandler = new AddressHandler(this.#form, this.#logger);
    } catch (error) {
      this.#logger.error('Error initializing AddressHandler', error);
    }
  }

  #initBillingAddressHandler() {
    try {
      this.billingAddressHandler = new BillingAddressHandler(this.#app);
      
      // Store the billing address handler on the form for access by other components
      if (this.#form && this.billingAddressHandler) {
        this.#form.__billingAddressHandler = this.billingAddressHandler;
        this.#logger.debug('BillingAddressHandler initialized and attached to form');
      }
    } catch (error) {
      this.#logger.error('Error initializing BillingAddressHandler', error);
    }
  }

  #initPaymentSelector() {
    try {
      this.paymentSelector = new PaymentSelector(this.#logger);
    } catch (error) {
      this.#logger.error('Error initializing PaymentSelector', error);
    }
  }

  #initFormValidator() {
    try {
      this.formValidator = new FormValidator({ 
        debugMode: window.location.search.includes('debug=true'),
        logger: this.#logger
      });
      
      if (this.#form && this.formValidator) {
        this.#form.__formValidator = this.formValidator;
        this.#logger.debug('FormValidator initialized and attached to form');
      }
    } catch (error) {
      this.#logger.error('Error initializing FormValidator', error);
    }
  }

  #initPaymentHandler() {
    try {
      this.paymentHandler = new PaymentHandler(this.#apiClient, this.#logger, this.#app);
    } catch (error) {
      this.#logger.error('Error initializing PaymentHandler', error);
    }
  }

  #initAddressAutocomplete() {
    try {
      // Pass Google Maps options from the app instance
      const googleMapsOptions = {
        enableGoogleMapsAutocomplete: this.#app.options.enableGoogleMapsAutocomplete
      };
      
      this.addressAutocomplete = new AddressAutocomplete(this.#logger, googleMapsOptions);
    } catch (error) {
      this.#logger.error('Error initializing AddressAutocomplete', error);
    }
  }

  #initPhoneInputHandler() {
    try {
      this.phoneInputHandler = new PhoneInputHandler(this.#logger);
    } catch (error) {
      this.#logger.error('Error initializing PhoneInputHandler', error);
    }
  }

  #initProspectCartHandler() {
    try {
      // Initialize the ProspectCartHandler if we have the app instance
      if (this.#app) {
        this.prospectCartHandler = new ProspectCartHandler(this.#app);
        this.#logger.info('ProspectCartHandler initialized');
      } else {
        this.#logger.warn('App instance not provided, ProspectCartHandler not initialized');
      }
    } catch (error) {
      this.#logger.error('Error initializing ProspectCartHandler', error);
    }
  }

  /**
   * Fix billing form by duplicating shipping form fields
   * This ensures the billing form has the correct field attributes
   */
  #injectBillingFormFields() {
    try {
      this.#logger.info('Fixing billing form by duplicating shipping form');
      
      // Find the shipping form and billing container
      const shippingForm = document.querySelector('[os-checkout-component="shipping-form"]');
      const billingContainer = document.querySelector('[os-checkout-component="billing-form"]');
      
      // If both elements exist, proceed with duplication
      if (shippingForm && billingContainer) {
        // Log the found elements
        this.#logger.info(`Found shipping form and billing container`);
        
        // Clone the shipping form
        const billingForm = shippingForm.cloneNode(true);
        
        // Update all field attributes to billing-specific ones
        const fieldMap = {
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
        
        // Update all input, select fields
        billingForm.querySelectorAll('input, select').forEach(field => {
          const fieldAttr = field.getAttribute('os-checkout-field');
          if (fieldAttr && fieldMap[fieldAttr]) {
            field.setAttribute('os-checkout-field', fieldMap[fieldAttr]);
            
            // Also update IDs and names to avoid duplicates
            if (field.id) {
              field.id = 'billing_' + field.id;
            }
            if (field.name) {
              field.name = 'billing_' + field.name;
            }
            if (field.getAttribute('data-name')) {
              field.setAttribute('data-name', 'Billing ' + field.getAttribute('data-name'));
            }
            
            // Update autocomplete attributes
            if (field.getAttribute('autocomplete')) {
              field.setAttribute('autocomplete', 'billing ' + field.getAttribute('autocomplete'));
            }
          }
        });
        
        // Update location container attribute
        const locationContainer = billingForm.querySelector('[data-os-component="location"]');
        if (locationContainer) {
          locationContainer.setAttribute('data-os-component', 'billing-location');
        }
        
        // Clear any existing content in the billing container
        billingContainer.innerHTML = '';
        
        // Append the modified form to the billing container
        billingContainer.appendChild(billingForm);
        
        this.#logger.info('Billing form successfully created from shipping form');
      } else {
        this.#logger.warn('Could not fix billing form - shipping form or billing container not found');
        this.#logger.warn(`Shipping form found: ${!!shippingForm}, Billing container found: ${!!billingContainer}`);
        
        // Log all checkout components for debugging
        const allComponents = document.querySelectorAll('[os-checkout-component]');
        this.#logger.warn(`Found ${allComponents.length} checkout components:`);
        allComponents.forEach(comp => {
          this.#logger.warn(`- ${comp.getAttribute('os-checkout-component')}`);
        });
      }
    } catch (error) {
      this.#logger.error('Error fixing billing form:', error);
    }
  }

  #setupEventListeners() {
    try {
      document.addEventListener('payment-method-changed', e => {
        this.#logger.debug(`Payment method changed to: ${e.detail.mode}`);
        const container = document.querySelector('[os-payment-mode]');
        container?.setAttribute('os-payment-mode', e.detail.mode);
      });
      
      // Ensure we're properly handling form submission
      if (this.#form) {
        this.#form.addEventListener('submit', e => this.#handleSubmit(e));
        this.#logger.debug('Form submit event listener attached');
      }
      
      // Listen for prospect cart created event if ProspectCartHandler is initialized
      if (this.#app && this.#app.events && this.prospectCartHandler) {
        this.#app.events.on('prospect.cartCreated', (data) => {
          this.#logger.info('Prospect cart created successfully', data);
          // You can add additional logic here if needed
        });
      }
      
      // Listen for order created event
      if (this.#app && this.#app.events) {
        this.#app.events.on('order.created', (data) => {
          this.#logger.info('Order created successfully', data);
          // You can add additional logic here if needed
        });
      }
    } catch (error) {
      this.#logger.error('Error setting up event listeners:', error);
    }
  }

  #handleSubmit(event) {
    // Always prevent the default form submission first
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
    
    this.#logger.debug('Form submission intercepted by #handleSubmit');
    
    // Prevent any form submission
    if (this.#form) {
      this.#form.removeAttribute('action');
      this.#form.setAttribute('method', 'post');
      
      const preventSubmit = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
        }
        
        // Ensure form doesn't have action and has post method
        if (this.#form) {
          this.#form.removeAttribute('action');
          this.#form.setAttribute('method', 'post');
        }
        
        // Cancel any form submission that might be in progress
        if (typeof window.stop === 'function') {
          window.stop();
        }
        
        this.#logger.debug('Form direct submission prevented');
        return false;
      };
      
      this.#form.onsubmit = preventSubmit;
    }
    
    if (this.formValidator && !this.formValidator.validateAllFields()) {
      this.#logger.warn('Form validation failed, stopping submission');
      return false;
    }
    
    if (this.paymentHandler) {
      this.#logger.debug('Delegating to paymentHandler.processPayment()');
      this.paymentHandler.processPayment();
    } else {
      this.#logger.error('Payment handler not initialized');
    }
    
    return false;
  }

  /**
   * Disable all submit buttons in the form to prevent accidental form submission
   * @private
   */
  #disableSubmitButtons() {
    try {
      if (!this.#form) return;
      
      // Find all submit buttons in the form
      const submitButtons = this.#form.querySelectorAll('button[type="submit"], input[type="submit"]');
      
      if (submitButtons.length > 0) {
        this.#logger.debug(`Found ${submitButtons.length} submit buttons, converting to type="button"`);
        
        submitButtons.forEach((button, index) => {
          // Change type to button
          button.setAttribute('type', 'button');
          
          // Add click handler to process payment
          button.addEventListener('click', (e) => {
            e.preventDefault();
            this.#logger.debug(`Submit button ${index + 1} clicked, delegating to payment handler`);
            
            if (this.paymentHandler) {
              this.paymentHandler.processPayment();
            } else {
              this.#logger.error('Payment handler not initialized');
            }
          });
          
          this.#logger.debug(`Converted submit button ${index + 1} to type="button"`);
        });
      } else {
        this.#logger.debug('No submit buttons found in the form');
      }
    } catch (error) {
      this.#logger.error('Error disabling submit buttons:', error);
    }
  }
}