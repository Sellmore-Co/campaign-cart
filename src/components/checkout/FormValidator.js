/**
 * FormValidator - Handles form validation for checkout
 */
export class FormValidator {
  #logger;
  #form;
  #validationErrors = {};
  #debugMode = false;
  #spreedlyEnabled = false;
  #spreedlyFieldsValid = false;
  #spreedlyReady = false;

  constructor(options = {}) {
    this.#debugMode = options.debugMode || false;
    this.#logger = options.logger || console;
    this.#form = this.#getFormElement();
    this.#spreedlyEnabled = typeof Spreedly !== 'undefined';

    if (!this.#form) return;

    this.#setupListeners();
  }

  #getFormElement() {
    const form = document.querySelector('form[os-checkout="form"]') || document.querySelector('form#combo_form');
    if (!form) this.#safeLog('warn', 'No checkout form found');
    return form;
  }

  #safeLog(level, message, ...args) {
    try {
      const logFn = this.#logger?.[level] || console[level] || console.log;
      logFn.call(console, `[${level.toUpperCase()}] ${message}`, ...args);
    } catch (error) {
      console.error('Error logging:', error);
    }
  }

  #setupListeners() {
    this.#form.addEventListener('submit', e => this.#handleSubmit(e));
    document.querySelector('[os-checkout-payment="combo"]')?.addEventListener('click', () => {
      if (this.validateAllFields()) this.#form.submit();
    });
    document.addEventListener('payment-method-changed', () => this.clearAllErrors());

    if (this.#spreedlyEnabled && typeof Spreedly.on === 'function') {
      this.#setupSpreedlyListeners();
    }

    // Add ZIP code formatting
    this.#setupZipCodeFormatting();
  }

  #setupSpreedlyListeners() {
    const listeners = {
      'ready': () => {
        this.#spreedlyReady = true;
        this.#safeLog('debug', 'Spreedly is ready');
      },
      'paymentMethod': (token, pmData) => {
        this.#spreedlyFieldsValid = true;
        this.#safeLog('debug', 'Spreedly payment method created');
        this.#clearSpreedlyErrors();
      },
      'validation': (result) => {
        this.#safeLog('debug', `Spreedly field validation: ${result.fieldType} ${result.valid ? 'valid' : 'invalid'}`);
        const field = document.getElementById(`spreedly-${result.fieldType}`);
        if (field) {
          field.classList.toggle('spreedly-valid', result.valid);
          field.classList.toggle('error', !result.valid);
        }
        if (result.valid) {
          this.clearErrorForField(field);
        } else {
          const errorMessage = this.#getSpreedlyFieldErrorMessage(result.fieldType);
          this.#handleSpreedlyError({ attribute: result.fieldType, message: errorMessage });
        }
      },
      'errors': (errors) => {
        this.#spreedlyFieldsValid = false;
        this.#safeLog('debug', 'Spreedly validation errors:', errors);
        errors.forEach(error => this.#handleSpreedlyError(error));
      },
      'fieldEvent': (name, event, activeElement, inputData) => {
        // Real-time feedback like Spreedly's example
        const field = document.getElementById(`spreedly-${name}`);
        if (event === 'input' && field) {
          const isValid = name === 'number' ? inputData.validNumber : inputData.validCvv;
          field.classList.toggle('spreedly-valid', isValid);
          field.classList.toggle('error', !isValid);
          if (isValid) {
            this.clearErrorForField(field);
          } else {
            const errorMessage = this.#getSpreedlyFieldErrorMessage(name);
            this.#showError(field, errorMessage);
          }
        }
      }
    };
  
    Object.entries(listeners).forEach(([event, handler]) => Spreedly.on(event, handler));
  }

  #getSpreedlyFieldErrorMessage(fieldType) {
    const errorMessages = {
      'number': 'Please enter a valid credit card number',
      'cvv': 'Please enter a valid security code (CVV)'
    };
    return errorMessages[fieldType] || `Invalid ${fieldType}`;
  }

  #handleSpreedlyError(error) {
    const fieldMap = {
      'number': 'spreedly-number',
      'card_number': 'spreedly-number',
      'cvv': 'spreedly-cvv',
      'month': 'cc-month',
      'year': 'cc-year',
      'full_name': 'cc-name',
      'first_name': 'cc-name',
      'last_name': 'cc-name'
    };
    const container = document.getElementById(fieldMap[error.attribute]) || 
                     document.querySelector(`[os-checkout-field="${fieldMap[error.attribute]}"]`);
    if (container) this.#showError(container, error.message);
  }

  #handleSubmit(event) {
    if (!this.validateAllFields()) {
      event.preventDefault();
      this.#safeLog('warn', 'Form validation failed');
    }
  }

  validateAllFields(selectedPaymentMethod = this.getSelectedPaymentMethod()) {
    this.#debugMode && this.#logValidationStart(selectedPaymentMethod);
    
    const isCreditCard = ['credit', 'credit-card'].includes(selectedPaymentMethod);
    let isValid = true;
    
    // First validate required fields
    const requiredFields = Array.from(document.querySelectorAll('[os-checkout-validate="required"]'));
    const firstErrorField = this.#validateFields(requiredFields, isCreditCard);
    
    // For credit card payments, validate credit card fields
    let ccValid = true;
    if (isCreditCard) {
      ccValid = this.validateCreditCard();
    }
    
    // Now validate any filled phone fields (even if not required)
    const phoneError = this.#validatePhoneFields();
    
    // Handle validation results
    if (firstErrorField) {
      this.#scrollToError(firstErrorField);
      isValid = false;
    } else if (phoneError) {
      isValid = false;
    } else if (!ccValid) {
      isValid = false;
    }

    return isValid;
  }

  #logValidationStart(method) {
    this.#safeLog('debug', 'Starting field validation for payment method:', method);
    this.#safeLog('debug', 'Same as shipping:', this.isSameAsShipping());
    this.#safeLog('debug', 'Spreedly enabled:', this.#spreedlyEnabled);
    this.#safeLog('debug', 'Spreedly ready:', this.#spreedlyReady);
  }

  #validateFields(fields, isCreditCard) {
    let firstErrorField = null;
    
    for (const field of fields) {
      const fieldName = field.getAttribute('os-checkout-field');
      if (this.#shouldSkipField(fieldName, isCreditCard)) {
        this.clearErrorForField(field);
        continue;
      }

      const label = field.previousElementSibling?.textContent || fieldName || field.placeholder;
      if (!this.#validateField(field, label)) {
        firstErrorField = firstErrorField || field;
      }
    }
    return firstErrorField;
  }

  #shouldSkipField(fieldName, isCreditCard) {
    return (this.isSameAsShipping() && fieldName?.startsWith('billing-')) ||
           (isCreditCard && ['cc-number', 'cvv'].includes(fieldName));
  }

  #validateCreditCardExpiryFields() {
    const [monthField, yearField] = this.#getExpiryFields();
    return this.#validateExpiryField(monthField, 'month') && 
           this.#validateExpiryField(yearField, 'year');
  }

  #getExpiryFields() {
    const monthSelectors = ['[os-checkout-field="cc-month"]', '[os-checkout-field="exp-month"]', '#credit_card_exp_month'];
    const yearSelectors = ['[os-checkout-field="cc-year"]', '[os-checkout-field="exp-year"]', '#credit_card_exp_year'];
    return [
      monthSelectors.map(s => document.querySelector(s)).find(Boolean),
      yearSelectors.map(s => document.querySelector(s)).find(Boolean)
    ];
  }

  #validateExpiryField(field, type) {
    if (!field || !field.value) {
      this.#safeLog('error', `${type} field is empty`);
      this.#showError(field, `Please select an expiration ${type}`);
      return false;
    }
    return true;
  }

  #clearSpreedlyErrors() {
    ['cc-number', 'cvv'].forEach(name => 
      this.clearErrorForField(document.querySelector(`[os-checkout-field="${name}"]`)));
    ['spreedly-number', 'spreedly-cvv'].forEach(id => 
      this.clearErrorForField(document.getElementById(id)));
  }

  #validateField(field, label) {
    if (!field) return true;

    const value = field.value.trim();
    const validation = this.#getFieldValidation(field, value, this.#getReadableFieldLabel(field, label));
    
    if (!validation.isValid) {
      this.#showError(field, validation.errorMessage);
    } else {
      this.clearErrorForField(field);
    }
    return validation.isValid;
  }

  #getReadableFieldLabel(field, fallbackLabel) {
    const fieldName = field.getAttribute('os-checkout-field') || field.name;
    
    // Map of field names to user-friendly labels
    const labelMap = {
      'fname': 'First Name',
      'lname': 'Last Name',
      'email': 'Email',
      'phone': 'Phone Number',
      'address1': 'Address',
      'address2': 'Apartment or Suite',
      'city': 'City',
      'province': 'State/Province',
      'postal': 'ZIP/Postal Code',
      'country': 'Country',
      'cc-number': 'Credit Card Number',
      'cvv': 'Security Code',
      'cc-month': 'Expiration Month',
      'cc-year': 'Expiration Year',
      'cc-name': 'Name on Card',
      'exp-month': 'Expiration Month',
      'exp-year': 'Expiration Year',
      'billing-fname': 'Billing First Name',
      'billing-lname': 'Billing Last Name',
      'billing-address1': 'Billing Address',
      'billing-address2': 'Billing Apartment or Suite',
      'billing-city': 'Billing City',
      'billing-province': 'Billing State/Province',
      'billing-postal': 'Billing ZIP/Postal Code',
      'billing-country': 'Billing Country',
      'billing-phone': 'Billing Phone Number'
    };
    
    // Return the mapped label if available, otherwise use the fallback label
    return labelMap[fieldName] || fallbackLabel || fieldName;
  }

  #getFieldValidation(field, value, label) {
    const tag = field.tagName.toLowerCase();
    const fieldName = field.getAttribute('os-checkout-field') || field.name;

    if (tag === 'select') return {
      isValid: !!value,
      errorMessage: `Please select a ${label}`
    };
    
    // Special handling for phone field - allow empty but validate if has value
    if (field.type === 'tel' && field.iti) {
      // If empty, it's valid (phone is optional)
      if (!value.trim()) {
        return { isValid: true, errorMessage: '' };
      }
      
      // If they entered something, validate it as a US number
      const isValid = field.iti.isValidNumber();
      
      return {
        isValid: isValid,
        errorMessage: `Please enter a valid US phone number (e.g. 555-555-5555)`
      };
    }
    
    if (!value) return { isValid: false, errorMessage: `Please enter your ${label}` };
    
    if (fieldName && (fieldName.includes('city') || fieldName.endsWith('-city'))) {
      return this.#validateCity(value, label);
    }
    
    // Updated postcode validation to use country-specific rules
    if (fieldName && (fieldName.includes('zip') || fieldName.includes('postal') || fieldName.endsWith('-zip'))) {
      return this.#validatePostcodeWithCountryRules(field, value, fieldName);
    }
    
    if (field.type === 'email') return {
      isValid: this.#isValidEmail(value),
      errorMessage: `Please enter a valid email address`
    };
    return { isValid: true, errorMessage: '' };
  }

  #validateCity(value, label) {
    // City should be a minimum of 2 letters without special characters, numbers, etc. Maximum length is 24 characters
    const cityRegex = /^[a-zA-Z\s]{2,24}$/;
    return {
      isValid: cityRegex.test(value),
      errorMessage: `Please enter a valid city name (2-24 letters, no numbers or special characters)`
    };
  }

  /**
   * Validate postcode using country-specific rules from AddressHandler
   * @param {HTMLElement} field - The postcode field
   * @param {string} value - Postcode value to validate
   * @param {string} fieldName - Name of the field for error message
   * @returns {Object} Validation result with isValid and errorMessage
   */
  #validatePostcodeWithCountryRules(field, value, fieldName) {
    // Get the corresponding country field
    const isShippingPostcode = fieldName === 'postal' || fieldName === 'zip';
    const countryField = isShippingPostcode 
      ? document.querySelector('[os-checkout-field="country"]')
      : document.querySelector('[os-checkout-field="billing-country"]');
    
    // If no country selected, fall back to basic validation
    if (!countryField || !countryField.value) {
      return this.#validateZipCode(value, fieldName);
    }
    
    const countryCode = countryField.value;
    
    // Try to get country config from AddressHandler if available
    if (window.osAddressHandler && typeof window.osAddressHandler.getCountryConfig === 'function') {
      const config = window.osAddressHandler.getCountryConfig(countryCode);
      
      if (config && config.postcodeRegex) {
        try {
          const regex = new RegExp(config.postcodeRegex);
          const isValid = regex.test(value);
          
          return {
            isValid,
            errorMessage: isValid ? '' : 
              `Please enter a valid ${config.postcodeLabel || 'postcode'}${config.postcodeExample ? `. Example: ${config.postcodeExample}` : ''}`
          };
        } catch (error) {
          this.#logger?.warn('Invalid postcode regex from country config:', config.postcodeRegex);
        }
      }
    }
    
    // Fall back to built-in country-specific validation
    return this.#validatePostcodeByCountry(value, countryCode, fieldName);
  }

  /**
   * Built-in country-specific postcode validation (fallback)
   * @param {string} value - Postcode value to validate
   * @param {string} countryCode - Country code
   * @param {string} fieldName - Name of the field for error message
   * @returns {Object} Validation result with isValid and errorMessage
   */
  #validatePostcodeByCountry(value, countryCode, fieldName) {
    let pattern, label, example;
    
    switch (countryCode.toUpperCase()) {
      case 'US':
        pattern = /^(\d{5}|\d{5}-\d{4})$/;
        label = 'ZIP Code';
        example = '12345 or 12345-6789';
        break;
        
      case 'CA':
        pattern = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
        label = 'Postal Code';
        example = 'K1A 0A6';
        break;
        
      case 'GB':
      case 'UK':
        pattern = /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i;
        label = 'Postcode';
        example = 'SW1A 0AA';
        break;
        
      case 'AU':
        pattern = /^\d{4}$/;
        label = 'Postcode';
        example = '2000';
        break;
        
      case 'DE':
        pattern = /^\d{5}$/;
        label = 'Postleitzahl';
        example = '10115';
        break;
        
      case 'FR':
        pattern = /^\d{5}$/;
        label = 'Code Postal';
        example = '75001';
        break;
        
      case 'NL':
        pattern = /^\d{4} ?[A-Z]{2}$/i;
        label = 'Postcode';
        example = '1012 JS';
        break;
        
      case 'ES':
        pattern = /^\d{5}$/;
        label = 'Código Postal';
        example = '28001';
        break;
        
      case 'IT':
        pattern = /^\d{5}$/;
        label = 'Codice Postale';
        example = '00118';
        break;
        
      case 'BR':
        pattern = /^\d{5}-?\d{3}$/;
        label = 'CEP';
        example = '01310-100';
        break;
        
      case 'JP':
        pattern = /^\d{3}-?\d{4}$/;
        label = 'Postal Code';
        example = '100-0005';
        break;
        
      case 'IN':
        pattern = /^\d{6}$/;
        label = 'PIN Code';
        example = '110001';
        break;
        
      default:
        // For unknown countries, accept any non-empty value
        return {
          isValid: value.trim().length > 0,
          errorMessage: value.trim().length > 0 ? '' : 'Please enter a postal code'
        };
    }
    
    const isValid = pattern.test(value);
    return {
      isValid,
      errorMessage: isValid ? '' : `Please enter a valid ${label}. Example: ${example}`
    };
  }

  /**
   * Legacy US ZIP code validation (kept for compatibility)
   * @param {string} value - ZIP code to validate
   * @param {string} fieldName - Name of the field for error message
   * @returns {Object} Validation result with isValid and errorMessage
   */
  #validateZipCode(value, fieldName = 'Zip') {
    // US ZIP code pattern: 5 digits or 5 digits + hyphen + 4 digits
    const zipPattern = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
    const isValid = zipPattern.test(value);
    
    return {
      isValid,
      errorMessage: isValid ? '' : `Field must be a valid US Zip code.`
    };
  }

  #showError(input, message) {
    if (!input) return;
    
    input.classList.add('error');
    const wrapper = input.closest('.frm-flds') || input.closest('.form-group') || input.parentElement;
    const errorElement = this.#getOrCreateErrorElement(wrapper);
    
    errorElement.textContent = message;
    Object.assign(errorElement.style, {
      color: 'red',
      fontSize: '0.875rem',
      marginTop: '0.25rem'
    });

    if (!input.hasErrorListener) {
      input.hasErrorListener = true;
      ['input', 'change'].forEach(event => 
        input.addEventListener(event, () => this.clearErrorForField(input)));
      if (input.type === 'tel' && input.iti) {
        input.addEventListener('countrychange', () => this.clearErrorForField(input));
      }
    }
  }

  #getOrCreateErrorElement(wrapper) {
    let errorElement = wrapper.querySelector('.pb-input-error');
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'pb-input-error';
      wrapper.appendChild(errorElement);
    }
    return errorElement;
  }

  clearErrorForField(field) {
    if (!field) return;
    
    field.classList.remove('error');
    const wrapper = field.closest('.frm-flds') || field.closest('.form-group') || field.parentElement;
    wrapper?.querySelector('.pb-input-error')?.remove();

    const fieldName = field.getAttribute('os-checkout-field');
    if (['cc-number', 'cvv'].includes(fieldName)) {
      const spreedlyId = `spreedly-${fieldName === 'cc-number' ? 'number' : 'cvv'}`;
      const spreedlyContainer = document.getElementById(spreedlyId);
      if (spreedlyContainer) {
        spreedlyContainer.classList.remove('error');
        spreedlyContainer.closest('.frm-flds')?.querySelector('.pb-input-error')?.remove();
      }
    }
  }

  clearAllErrors() {
    this.#validationErrors = {};
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    document.querySelectorAll('.pb-input-error').forEach(el => el.remove());
    this.#clearSpreedlyErrors();
  }

  #scrollToError(element) {
    if (!element) return;
    
    window.scrollTo({
      top: element.getBoundingClientRect().top + window.pageYOffset - 100,
      behavior: 'smooth'
    });
    setTimeout(() => element.focus(), 500);
  }

  #isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  isSameAsShipping() {
    const checkbox = document.querySelector('[os-checkout-field="same-as-shipping"] input[type="checkbox"]') || 
                     document.querySelector('[os-input-field="use-shipping-address"] input[type="checkbox"]') || 
                     document.querySelector('#use_shipping_address');
    return checkbox ? checkbox.checked : true;
  }

  getSelectedPaymentMethod() {
    return document.querySelector('input[name="payment_method"]:checked')?.value || 
           document.querySelector('input[name="combo_mode"]:checked')?.value || 
           'credit';
  }

  getFormValues() {
    const values = {};
    this.#form.querySelectorAll('input, select, textarea').forEach(field => {
      if (['button', 'submit'].includes(field.type) || field.disabled || !field.name) return;

      const fieldName = field.getAttribute('os-checkout-field') || field.name;
      if (field.type === 'checkbox') {
        values[fieldName] = field.checked;
      } else if (field.type === 'radio') {
        if (field.checked) values[fieldName] = field.value;
      } else if (fieldName.includes('.')) {
        const [parent, child] = fieldName.split('.');
        values[parent] = values[parent] || {};
        values[parent][child] = field.value;
      } else {
        values[fieldName] = field.value;
      }
    });
    return values;
  }

  validateCreditCard() {
    let isValid = true;
  
    // Validate expiry fields
    const [monthField, yearField] = this.#getExpiryFields();
    if (!this.#validateExpiryField(monthField, 'month')) isValid = false;
    if (!this.#validateExpiryField(yearField, 'year')) isValid = false;
  
    // If Spreedly is enabled, validate its fields
    if (this.#spreedlyEnabled && typeof Spreedly.validate === 'function') {
      // Check if the Spreedly fields already have valid class
      const numberContainer = document.getElementById('spreedly-number');
      const cvvContainer = document.getElementById('spreedly-cvv');
  
      let numberValid = numberContainer?.classList.contains('spreedly-valid');
      let cvvValid = cvvContainer?.classList.contains('spreedly-valid');
  
      // Trigger Spreedly validation
      Spreedly.validate();
      
      // Use the visual validation state of the fields
      if (!numberValid && numberContainer) {
        this.#showError(numberContainer, 'Please enter a valid credit card number');
        isValid = false;
      }
      
      if (!cvvValid && cvvContainer) {
        this.#showError(cvvContainer, 'Please enter a valid security code (CVV)');
        isValid = false;
      }
    } else {
      // Fallback for non-Spreedly setups
      const ccNumber = document.querySelector('[os-checkout-field="cc-number"]');
      const cvv = document.querySelector('[os-checkout-field="cvv"]');
      
      if (!ccNumber?.value.trim()) {
        this.#showError(ccNumber, 'Please enter a credit card number');
        isValid = false;
      }
      if (!cvv?.value.trim()) {
        this.#showError(cvv, 'Please enter a security code (CVV)');
        isValid = false;
      }
    }
  
    return isValid;
  }

  #validatePhoneFields() {
    // Find all phone input fields
    const phoneFields = Array.from(document.querySelectorAll('input[type="tel"]'));
    let hasError = false;
    
    for (const field of phoneFields) {
      // Skip if field is empty (phone is optional)
      if (!field.value.trim() || !field.iti) continue;
      
      // Validate phone number if entered
      const isValid = field.iti.isValidNumber();
      
      if (!isValid) {
        // Get specific error code for better error messages
        const errorCode = field.iti.getValidationError();
        
        // Map error codes to user-friendly messages
        const errorMessages = {
          0: 'Please enter a valid US phone number (e.g. 555-555-5555)',
          1: 'Invalid country code',
          2: 'Phone number is too short',
          3: 'Phone number is too long',
          4: 'Please enter a valid phone number',
          5: 'Invalid phone number format'
        };
        
        const message = errorMessages[errorCode] || 'Please enter a valid US phone number';
        this.#showError(field, message);
        
        if (!hasError) {
          this.#scrollToError(field);
          hasError = true;
        }
      } else {
        this.clearErrorForField(field);
      }
    }
    
    return hasError;
  }

  /**
   * Set up auto-formatting for ZIP/postal code fields
   * Note: Formatting only applies to US addresses (country=US)
   * Other countries like Canada (K1A 0B1) are left unformatted to allow letters
   */
  #setupZipCodeFormatting() {
    // Find all ZIP/postal code fields
    const zipFields = [
      ...document.querySelectorAll('[os-checkout-field="postal"]'),
      ...document.querySelectorAll('[os-checkout-field="billing-postal"]'),
      ...document.querySelectorAll('[os-checkout-field="zip"]')
    ];
    
    zipFields.forEach(field => {
      if (field) {
        field.addEventListener('input', (e) => this.#formatZipCode(e));
        this.#logger.debug(`Country-aware ZIP/postal formatting setup for: ${field.getAttribute('os-checkout-field') || field.name || 'unknown'}`);
      }
    });
  }
  
  /**
   * Format ZIP code as user types: 
   * - Only applies US ZIP code formatting for US addresses
   * - For other countries, skip formatting to allow letters (e.g., Canadian K1A 0B1)
   * @param {Event} event - Input event
   */
  #formatZipCode(event) {
    const input = event.target;
    
    // Get the corresponding country field to check if this is US
    const fieldName = input.getAttribute('os-checkout-field');
    const isShippingPostcode = fieldName === 'postal' || fieldName === 'zip';
    const countryField = isShippingPostcode 
      ? document.querySelector('[os-checkout-field="country"]')
      : document.querySelector('[os-checkout-field="billing-country"]');
    
    // Only apply US ZIP formatting if country is explicitly US
    if (!countryField || countryField.value !== 'US') {
      this.#logger.debug(`Skipping ZIP formatting for country: ${countryField?.value || 'none'} (field: ${fieldName})`);
      return; // Skip formatting for non-US countries
    }
    
    const cursorPos = input.selectionStart;
    const oldValue = input.value;
    
    // Remove non-digits and non-hyphens (US ZIP code format only)
    let cleaned = oldValue.replace(/[^\d-]/g, '');
    
    // Only allow one hyphen after the 5th digit
    if (cleaned.length > 5) {
      const firstPart = cleaned.slice(0, 5);
      
      if (cleaned.charAt(5) !== '-') {
        // Insert hyphen after 5 digits
        const secondPart = cleaned.slice(5).replace(/-/g, '');
        cleaned = `${firstPart}-${secondPart}`;
      } else {
        // Keep existing hyphen and remove any others
        const secondPart = cleaned.slice(6).replace(/-/g, '');
        cleaned = `${firstPart}-${secondPart}`;
      }
    }
    
    // Limit to ZIP+4 format (12345-6789)
    if (cleaned.includes('-')) {
      const [first, second] = cleaned.split('-');
      cleaned = `${first.slice(0, 5)}-${second.slice(0, 4)}`;
    } else {
      cleaned = cleaned.slice(0, 5);
    }
    
    // Only update if changed to avoid cursor jumping
    if (cleaned !== oldValue) {
      input.value = cleaned;
      
      // Adjust cursor position
      const posAdjust = cleaned.length - oldValue.length;
      input.setSelectionRange(cursorPos + posAdjust, cursorPos + posAdjust);
      
      this.#logger.debug(`Applied US ZIP formatting: "${oldValue}" → "${cleaned}"`);
    }
  }
}