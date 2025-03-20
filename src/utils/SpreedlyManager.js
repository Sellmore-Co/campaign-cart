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

  /**
   * Create a new SpreedlyManager
   * @param {string} environmentKey - The Spreedly environment key
   * @param {Object} options - Configuration options
   * @param {boolean} options.debug - Enable debug mode
   */
  constructor(environmentKey, options = {}) {
    this.#environmentKey = environmentKey;
    this.#debugMode = options.debug || false;
    
    if (!environmentKey) {
      this.#log('error', 'No environment key provided to SpreedlyManager');
      return;
    }
    
    this.#log('debug', `SpreedlyManager initialized with environment key: ${environmentKey}`);
    this.#initialize();
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
      
      // Use exactly the same style as in the original implementation
      const style = 'color: #212529; font-size: 1rem; line-height: 1.5; font-weight: 400; \
      width: calc(100% - 20px); height: calc(100% - 2px); position: absolute; \
      font-family: system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue","Noto Sans","Liberation Sans",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";';
      
      // Set up event listeners
      Spreedly.on('ready', () => {
        this.#log('debug', 'Spreedly iframe ready');
        
        // Configure the iframe fields exactly as in the original
        Spreedly.setFieldType('text');
        Spreedly.setPlaceholder('cvv', 'CVV *');
        Spreedly.setPlaceholder('number', 'Credit Card Number');
        Spreedly.setNumberFormat('prettyFormat');
        Spreedly.setStyle('cvv', style);
        Spreedly.setStyle('number', style);
        
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
   * Prepare the HTML structure for the iframe fields
   * This creates the containers for the iframe fields and hides the original inputs
   */
  #prepareHtmlStructure() {
    try {
      this.#log('debug', 'Preparing HTML structure for Spreedly iframe fields');
      
      // Find the original input containers - exactly as in the original implementation
      const numberField = document.querySelector('[os-checkout-field="cc-number"]');
      const cvvField = document.querySelector('[os-checkout-field="cvv"]');
      
      if (!numberField || !cvvField) {
        this.#log('error', 'Could not find credit card fields');
        return;
      }
      
      const numberContainer = numberField.closest('.frm-flds');
      const cvvContainer = cvvField.closest('.frm-flds');
      
      if (numberContainer && cvvContainer) {
        // Hide original inputs
        numberField.style.display = 'none';
        cvvField.style.display = 'none';
        
        // Create and add Spreedly containers
        const numberDiv = document.createElement('div');
        numberDiv.id = 'spreedly-number';
        numberDiv.className = 'input-flds spreedly-field';
        numberContainer.appendChild(numberDiv);
        
        const cvvDiv = document.createElement('div');
        cvvDiv.id = 'spreedly-cvv';
        cvvDiv.className = 'input-flds spreedly-field';
        cvvContainer.appendChild(cvvDiv);
        
        // Add necessary styles - exactly as in the original implementation
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
          .spreedly-field {
            position: relative;
            overflow: hidden;
          }
        `;
        document.head.appendChild(styleSheet);
      } else {
        this.#log('error', 'Could not find credit card field containers');
      }
      
      this.#log('debug', 'HTML structure prepared for Spreedly iframe fields');
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
      let container = null;
      
      // Map Spreedly field types to our containers
      if (fieldType === 'number' || fieldType === 'card_number') {
        container = document.getElementById('spreedly-number');
      } else if (fieldType === 'cvv') {
        container = document.getElementById('spreedly-cvv');
      } else if (fieldType === 'month' || fieldType === 'year') {
        // Find the month/year select elements
        container = document.querySelector(`[os-checkout-field="cc-${fieldType}"]`) || 
                   document.querySelector(`[os-checkout-field="exp-${fieldType}"]`) || 
                   document.querySelector(`#credit_card_exp_${fieldType}`);
      } else if (fieldType === 'full_name' || fieldType === 'first_name' || fieldType === 'last_name') {
        container = document.querySelector('[os-checkout-field="cc-name"]');
      }
      
      if (container) {
        // Add error class to the container
        container.classList.add('error');
        
        // Find the parent wrapper
        const wrapper = container.closest('.frm-flds') || container.parentElement;
        
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
    let container = null;
    
    // Map Spreedly field types to our containers
    if (fieldType === 'number' || fieldType === 'card_number') {
      container = document.getElementById('spreedly-number');
    } else if (fieldType === 'cvv') {
      container = document.getElementById('spreedly-cvv');
    }
    
    if (container) {
      // Remove error class from the container
      container.classList.remove('error');
      
      // Find the parent wrapper
      const wrapper = container.closest('.frm-flds') || container.parentElement;
      
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