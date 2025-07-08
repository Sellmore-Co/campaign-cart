/**
 * SpreedlyManager - Manages Spreedly iframe integration for secure credit card processing
 * 
 * This class handles:
 * - Loading the Spreedly script if not already loaded
 * - Setting up the iframe fields for card number and CVV
 * - Styling the iframe fields to match the site design
 * - Handling tokenization of credit card data
 * - Managing validation and error handling
 */

export class SpreedlyManager {
  #environmentKey;
  #debugMode = false;
  #isReady = false;
  #onReadyCallback = null;
  #onErrorCallback = null;
  #onPaymentMethodCallback = null;
  #onValidationCallback = null;
  #config = null;
  #app = null;

  /**
   * Create a new SpreedlyManager
   * @param {string} environmentKey - The Spreedly environment key
   * @param {Object} options - Configuration options
   * @param {boolean} options.debug - Enable debug mode
   * @param {Object} options.app - The app instance for accessing global config
   */
  constructor(environmentKey, options = {}) {
    this.#environmentKey = environmentKey;
    this.#debugMode = options.debug || false;
    this.#app = options.app || null;
    
    // Load Spreedly configuration
    this.#loadConfig();
    
    if (!environmentKey) {
      this.#log('error', 'No environment key provided to SpreedlyManager');
      return;
    }
    
    this.#log('debug', `SpreedlyManager initialized with environment key: ${environmentKey}`);
    this.#initialize();
  }

  /**
   * Load Spreedly configuration from global config
   */
  #loadConfig() {
    // Default configuration
    this.#config = {
      fieldType: {
        number: 'text',
        cvv: 'text'
      },
      numberFormat: 'prettyFormat',
      placeholder: {
        number: 'Credit Card Number',
        cvv: 'CVV *'
      },
      labels: {
        number: 'Card Number',
        cvv: 'CVV'
      },
      titles: {
        number: 'Credit card number',
        cvv: 'Card verification value'
      },
      styling: {
        number: 'color: #212529; font-size: .925rem; font-weight: 400; width: 100%; height:100%; font-family: system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue","Noto Sans","Liberation Sans",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";',
        cvv: 'color: #212529; font-size: .925rem; font-weight: 400; width: 100%; height: 100%; font-family: system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue","Noto Sans","Liberation Sans",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";'
      },
      placeholder_styling: '',
      required: {
        number: true,
        cvv: true
      },
      autocomplete: true
    };

    // Merge with global configuration if it exists
    if (window.osConfig && window.osConfig.spreedlyConfig) {
      this.#log('debug', 'Found global Spreedly configuration', window.osConfig.spreedlyConfig);
      
      // Merge field types
      if (window.osConfig.spreedlyConfig.fieldType) {
        this.#config.fieldType = {
          ...this.#config.fieldType,
          ...window.osConfig.spreedlyConfig.fieldType
        };
      }
      
      // Merge number format
      if (window.osConfig.spreedlyConfig.numberFormat) {
        this.#config.numberFormat = window.osConfig.spreedlyConfig.numberFormat;
      }
      
      // Merge placeholders
      if (window.osConfig.spreedlyConfig.placeholder) {
        this.#config.placeholder = {
          ...this.#config.placeholder,
          ...window.osConfig.spreedlyConfig.placeholder
        };
      }
      
      // Merge labels
      if (window.osConfig.spreedlyConfig.labels) {
        this.#config.labels = {
          ...this.#config.labels,
          ...window.osConfig.spreedlyConfig.labels
        };
      }
      
      // Merge titles
      if (window.osConfig.spreedlyConfig.titles) {
        this.#config.titles = {
          ...this.#config.titles,
          ...window.osConfig.spreedlyConfig.titles
        };
      }
      
      // Merge styling
      if (window.osConfig.spreedlyConfig.styling) {
        this.#config.styling = {
          ...this.#config.styling,
          ...window.osConfig.spreedlyConfig.styling
        };
      }
      
      // Merge placeholder styling
      if (window.osConfig.spreedlyConfig.placeholder_styling) {
        this.#config.placeholder_styling = window.osConfig.spreedlyConfig.placeholder_styling;
      }
      
      // Merge required attributes
      if (window.osConfig.spreedlyConfig.required) {
        this.#config.required = {
          ...this.#config.required,
          ...window.osConfig.spreedlyConfig.required
        };
      }
      
      // Merge autocomplete setting
      if (window.osConfig.spreedlyConfig.hasOwnProperty('autocomplete')) {
        this.#config.autocomplete = window.osConfig.spreedlyConfig.autocomplete;
      }
    }
    
    this.#log('debug', 'Spreedly configuration initialized', this.#config);
  }

  /**
   * Initialize Spreedly
   * Load the script if needed and set up the iframe fields
   */
  #initialize() {
    if (typeof Spreedly === 'undefined') {
      this.#log('debug', 'Spreedly not loaded, loading script...');
      this.#loadScript()
        .then(() => {
          this.#log('debug', 'Spreedly script loaded');
          this.#setupSpreedly();
        })
        .catch(error => {
          this.#log('error', 'Failed to load Spreedly script', error);
          if (this.#onErrorCallback) {
            this.#onErrorCallback(['Failed to load Spreedly. Please refresh the page and try again.']);
          }
        });
    } else {
      this.#log('debug', 'Spreedly already loaded');
      this.#setupSpreedly();
    }
  }

  /**
   * Load the Spreedly script
   * @returns {Promise} A promise that resolves when the script is loaded
   */
  #loadScript() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://core.spreedly.com/iframe/iframe-v1.min.js';
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * Set up Spreedly with the environment key and prepare the iframe fields
   */
  #setupSpreedly() {
    try {
      this.#log('debug', 'Setting up Spreedly...');
      
      // First, prepare the HTML structure for the iframe fields
      this.#prepareHtmlStructure();
      
      // Initialize Spreedly with the environment key
      Spreedly.init(this.#environmentKey, {
        "numberEl": "spreedly-number",
        "cvvEl": "spreedly-cvv"
      });
      
      // Set up event listeners
      Spreedly.on('ready', () => {
        this.#log('debug', 'Spreedly iframe ready');
        
        // Apply configuration from the loaded config
        this.#applySpreedlyConfig();
        
        // Mark as ready and call the ready callback if set
        this.#isReady = true;
        if (this.#onReadyCallback) {
          this.#onReadyCallback();
        }
      });
      
      // Set up other event listeners
      this.#setupEventListeners();
      
      this.#log('debug', 'Spreedly setup complete');
    } catch (error) {
      this.#log('error', 'Error setting up Spreedly', error);
      if (this.#onErrorCallback) {
        this.#onErrorCallback(['Failed to set up Spreedly. Please refresh the page and try again.']);
      }
    }
  }

  /**
   * Apply configuration to Spreedly iframe fields
   */
  #applySpreedlyConfig() {
    try {
      this.#log('debug', 'Applying Spreedly configuration...');
      
      // Apply field types
      Spreedly.setFieldType('number', this.#config.fieldType.number);
      Spreedly.setFieldType('cvv', this.#config.fieldType.cvv);
      
      // Apply number format
      Spreedly.setNumberFormat(this.#config.numberFormat);
      
      // Apply placeholders
      Spreedly.setPlaceholder('number', this.#config.placeholder.number);
      Spreedly.setPlaceholder('cvv', this.#config.placeholder.cvv);
      
      // Apply labels
      Spreedly.setLabel('number', this.#config.labels.number);
      Spreedly.setLabel('cvv', this.#config.labels.cvv);
      
      // Apply titles
      Spreedly.setTitle('number', this.#config.titles.number);
      Spreedly.setTitle('cvv', this.#config.titles.cvv);
      
      // Apply styling
      Spreedly.setStyle('number', this.#config.styling.number);
      Spreedly.setStyle('cvv', this.#config.styling.cvv);
      
      // Apply placeholder styling if specified
      if (this.#config.placeholder_styling) {
        Spreedly.setStyle('placeholder', this.#config.placeholder_styling);
      }
      
      // Set required attributes if needed
      if (this.#config.required.number) {
        Spreedly.setRequiredAttribute('number');
      }
      if (this.#config.required.cvv) {
        Spreedly.setRequiredAttribute('cvv');
      }
      
      // Handle autocomplete
      if (!this.#config.autocomplete) {
        Spreedly.toggleAutoComplete();
      }
      
      this.#log('debug', 'Spreedly configuration applied');
    } catch (error) {
      this.#log('error', 'Error applying Spreedly configuration', error);
    }
  }

  /**
   * Prepare the HTML structure for the iframe fields
   * This uses the existing inputs rather than creating new ones
   */
  #prepareHtmlStructure() {
    try {
      this.#log('debug', 'Preparing HTML structure for Spreedly iframe fields');
      
      // Find the existing input containers
      const numberField = document.querySelector('[os-checkout-field="cc-number"]');
      const cvvField = document.querySelector('[os-checkout-field="cvv"]');
      
      if (!numberField || !cvvField) {
        this.#log('error', 'Could not find credit card fields');
        return;
      }
      
      // Simply use the IDs of the existing fields
      numberField.id = 'spreedly-number';
      cvvField.id = 'spreedly-cvv';
      
      // Make sure the fields are set up for the iframe
      numberField.setAttribute('data-spreedly', 'number');
      cvvField.setAttribute('data-spreedly', 'cvv');
      
      this.#log('debug', 'HTML structure prepared for Spreedly iframe fields - using existing DOM elements');
    } catch (error) {
      this.#log('error', 'Error preparing HTML structure for Spreedly iframe fields', error);
    }
  }

  /**
   * Set up event listeners for Spreedly events
   */
  #setupEventListeners() {
    // Listen for validation errors
    Spreedly.on('errors', (errors) => {
      this.#log('error', 'Spreedly validation errors:', errors);
      
      // Format error messages
      const errorMessages = errors.map(error => error.message);
      
      // Call the error callback if set
      if (this.#onErrorCallback) {
        this.#onErrorCallback(errorMessages);
      }
      
      // Show errors on the form
      this.#showErrors(errors);
    });
    
    // Listen for successful payment method creation
    Spreedly.on('paymentMethod', (token, pmData) => {
      this.#log('debug', 'Spreedly payment method created:', token);
      
      // Clear any existing errors
      this.clearAllErrors();
      
      // Call the payment method callback if set
      if (this.#onPaymentMethodCallback) {
        this.#onPaymentMethodCallback(token, pmData);
      }
    });
    
    // Listen for field validation events
    Spreedly.on('validation', (result) => {
      this.#log('debug', 'Spreedly field validation:', result);
      
      // Clear any existing error for this field
      this.#clearFieldError(result.fieldType);
      
      // Call the validation callback if set
      if (this.#onValidationCallback) {
        this.#onValidationCallback(result);
      }
    });
  }

  /**
   * Show errors on the form
   * @param {Array} errors - Array of error objects from Spreedly
   */
  #showErrors(errors) {
    errors.forEach(error => {
      const fieldType = error.attribute;
      let field = null;
      
      // Map Spreedly field types to our fields
      if (fieldType === 'number' || fieldType === 'card_number') {
        field = document.getElementById('spreedly-number');
      } else if (fieldType === 'cvv') {
        field = document.getElementById('spreedly-cvv');
      } else if (fieldType === 'month' || fieldType === 'year') {
        // Find the month/year select elements
        field = document.querySelector(`[os-checkout-field="cc-${fieldType}"]`) || 
               document.querySelector(`[os-checkout-field="exp-${fieldType}"]`) || 
               document.querySelector(`#credit_card_exp_${fieldType}`);
      } else if (fieldType === 'full_name' || fieldType === 'first_name' || fieldType === 'last_name') {
        field = document.querySelector('[os-checkout-field="cc-name"]');
      }
      
      if (field) {
        // Add error class to the field
        field.classList.add('error');
        
        // Find the parent wrapper
        const wrapper = field.closest('.frm-flds') || field.parentElement;
        
        // Create or update error message
        let errorElement = wrapper.querySelector('.pb-input-error');
        if (!errorElement) {
          errorElement = document.createElement('div');
          errorElement.className = 'pb-input-error';
          wrapper.appendChild(errorElement);
        }
        
        // Set error message and style
        errorElement.textContent = error.message;
        errorElement.style.color = 'red';
        errorElement.style.fontSize = '0.875rem';
        errorElement.style.marginTop = '0.25rem';
      }
    });
  }

  /**
   * Clear error for a specific field
   * @param {string} fieldType - The field type (number, cvv, etc.)
   */
  #clearFieldError(fieldType) {
    let field = null;
    
    // Map Spreedly field types to our fields
    if (fieldType === 'number' || fieldType === 'card_number') {
      field = document.getElementById('spreedly-number');
    } else if (fieldType === 'cvv') {
      field = document.getElementById('spreedly-cvv');
    }
    
    if (field) {
      // Remove error class from the field
      field.classList.remove('error');
      
      // Find the parent wrapper
      const wrapper = field.closest('.frm-flds') || field.parentElement;
      
      // Remove error message if it exists
      const errorElement = wrapper.querySelector('.pb-input-error');
      if (errorElement) {
        errorElement.remove();
      }
    }
  }

  /**
   * Clear all errors
   */
  clearAllErrors() {
    // Clear errors for number field
    this.#clearFieldError('number');
    
    // Clear errors for CVV field
    this.#clearFieldError('cvv');
    
    // Clear errors for month/year fields
    const monthField = document.querySelector('[os-checkout-field="cc-month"]') || 
                      document.querySelector('[os-checkout-field="exp-month"]') || 
                      document.querySelector('#credit_card_exp_month');
    const yearField = document.querySelector('[os-checkout-field="cc-year"]') || 
                     document.querySelector('[os-checkout-field="exp-year"]') || 
                     document.querySelector('#credit_card_exp_year');
    
    if (monthField) {
      monthField.classList.remove('error');
      const monthWrapper = monthField.closest('.frm-flds') || monthField.parentElement;
      const monthError = monthWrapper.querySelector('.pb-input-error');
      if (monthError) monthError.remove();
    }
    
    if (yearField) {
      yearField.classList.remove('error');
      const yearWrapper = yearField.closest('.frm-flds') || yearField.parentElement;
      const yearError = yearWrapper.querySelector('.pb-input-error');
      if (yearError) yearError.remove();
    }
  }

  /**
   * Tokenize a credit card
   * @param {Object} cardData - The card data to tokenize
   * @param {string} cardData.full_name - The cardholder name
   * @param {string} cardData.month - The expiration month (2 digits)
   * @param {string} cardData.year - The expiration year (4 digits)
   */
  tokenizeCard(cardData) {
    this.#log('debug', 'Tokenizing card with data:', {
      ...cardData,
      full_name: cardData.full_name,
      month: cardData.month,
      year: cardData.year
    });
    
    // Clear any existing errors
    this.clearAllErrors();
    
    // Validate required fields
    if (!cardData.full_name || !cardData.month || !cardData.year) {
      this.#log('error', 'Missing required card data');
      
      const errors = [];
      if (!cardData.full_name) errors.push({ attribute: 'full_name', message: 'Cardholder name is required' });
      if (!cardData.month) errors.push({ attribute: 'month', message: 'Expiration month is required' });
      if (!cardData.year) errors.push({ attribute: 'year', message: 'Expiration year is required' });
      
      this.#showErrors(errors);
      
      if (this.#onErrorCallback) {
        this.#onErrorCallback(errors.map(e => e.message));
      }
      
      return;
    }
    
    // Check if Spreedly is ready
    if (!this.#isReady) {
      this.#log('error', 'Spreedly is not ready yet');
      
      if (this.#onErrorCallback) {
        this.#onErrorCallback(['Payment system is not ready yet. Please try again in a moment.']);
      }
      
      return;
    }
    
    // Tokenize the card
    try {
      Spreedly.tokenizeCreditCard(cardData);
      this.#log('debug', 'Card tokenization initiated');
    } catch (error) {
      this.#log('error', 'Error tokenizing card', error);
      
      if (this.#onErrorCallback) {
        this.#onErrorCallback(['An error occurred while processing your card. Please try again.']);
      }
    }
  }

  /**
   * Set a callback to be called when Spreedly is ready
   * @param {Function} callback - The callback function
   */
  setOnReady(callback) {
    this.#onReadyCallback = callback;
    
    // If already ready, call the callback immediately
    if (this.#isReady && callback) {
      callback();
    }
  }

  /**
   * Set a callback to be called when Spreedly encounters an error
   * @param {Function} callback - The callback function
   */
  setOnError(callback) {
    this.#onErrorCallback = callback;
  }

  /**
   * Set a callback to be called when a payment method is created
   * @param {Function} callback - The callback function
   */
  setOnPaymentMethod(callback) {
    this.#onPaymentMethodCallback = callback;
  }

  /**
   * Set a callback to be called when a field is validated
   * @param {Function} callback - The callback function
   */
  setOnValidation(callback) {
    this.#onValidationCallback = callback;
  }

  /**
   * Log a message with the specified level
   * @param {string} level - The log level (debug, info, warn, error)
   * @param {string} message - The message to log
   * @param {*} data - Additional data to log
   */
  #log(level, message, data) {
    if (this.#debugMode || level === 'error') {
      const prefix = '[SpreedlyManager]';
      
      if (data) {
        console[level](`${prefix} ${message}`, data);
      } else {
        console[level](`${prefix} ${message}`);
      }
    }
  }
}  