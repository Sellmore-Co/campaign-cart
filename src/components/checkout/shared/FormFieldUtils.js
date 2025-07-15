/**
 * FormFieldUtils - Utility functions for form field selection and manipulation
 * Provides centralized field selection logic with fallback strategies
 */

export class FormFieldUtils {
  /**
   * Find a form field using multiple selector strategies
   * @param {string} fieldName - The field name (e.g., 'postal', 'billing-postal')
   * @param {Object} options - Options for field selection
   * @param {string} options.prefix - Prefix for the field (e.g., 'billing-')
   * @param {boolean} options.isBilling - Whether this is a billing field
   * @returns {HTMLElement|null} The found element or null
   */
  static findField(fieldName, options = {}) {
    const { prefix = '', isBilling = false } = options;
    
    // Determine the full field name with prefix
    const fullFieldName = prefix ? `${prefix}${fieldName}` : fieldName;
    
    // For id/name attributes, use underscore convention
    const idPrefix = isBilling ? 'billing_' : 'shipping_';
    const idFieldName = fieldName.replace('-', '_');
    
    // Try multiple selector strategies
    const selectors = [
      `[os-checkout-field="${fullFieldName}"]`,
      `[data-os-field="${fullFieldName}"]`,
      `#${idPrefix}${idFieldName}`,
      `[name="${idPrefix}${idFieldName}"]`,
      `[id="${idFieldName}"]`,
      `[name="${idFieldName}"]`
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) return element;
    }
    
    return null;
  }

  /**
   * Find country field with fallback selectors
   * @param {boolean} isBilling - Whether to find billing country
   * @returns {HTMLElement|null} The country select element
   */
  static findCountryField(isBilling = false) {
    const fieldName = isBilling ? 'billing-country' : 'country';
    return this.findField('country', { 
      prefix: isBilling ? 'billing-' : '', 
      isBilling 
    });
  }

  /**
   * Find postal/zip code field with fallback selectors
   * @param {boolean} isBilling - Whether to find billing postal code
   * @returns {HTMLElement|null} The postal code input element
   */
  static findPostalField(isBilling = false) {
    const fieldName = isBilling ? 'billing-postal' : 'postal';
    
    // Special handling for postal/zip code fields
    const element = this.findField('postal', { 
      prefix: isBilling ? 'billing-' : '', 
      isBilling 
    });
    
    // Additional fallback for postal_code naming
    if (!element) {
      const idPrefix = isBilling ? 'billing_' : 'shipping_';
      return document.querySelector(`#${idPrefix}postal_code`) ||
             document.querySelector(`[name="${idPrefix}postal_code"]`) ||
             document.querySelector(`#postal_code`) ||
             document.querySelector(`[name="postal_code"]`);
    }
    
    return element;
  }

  /**
   * Find state/province field with fallback selectors
   * @param {boolean} isBilling - Whether to find billing state
   * @returns {HTMLElement|null} The state/province select element
   */
  static findStateField(isBilling = false) {
    const element = this.findField('province', { 
      prefix: isBilling ? 'billing-' : '', 
      isBilling 
    });
    
    // Check if it's wrapped in a select wrapper
    if (element) {
      const selectWrapper = element.closest('.select-form-wrapper');
      if (selectWrapper) {
        const select = selectWrapper.querySelector('select');
        if (select) return select;
      }
    }
    
    return element;
  }

  /**
   * Get all address fields for a given type
   * @param {string} type - 'shipping' or 'billing'
   * @returns {Object} Object with all address fields
   */
  static getAddressFields(type = 'shipping') {
    const isBilling = type === 'billing';
    const prefix = isBilling ? 'billing-' : '';
    
    const fieldNames = [
      'fname', 'lname', 'address1', 'address2', 
      'city', 'province', 'postal', 'country', 'phone'
    ];
    
    const fields = {};
    
    fieldNames.forEach(name => {
      const field = this.findField(name, { prefix, isBilling });
      if (field) {
        fields[name] = field;
      }
    });
    
    return fields;
  }

  /**
   * Get field label based on field name and country
   * @param {string} fieldName - The field name (e.g., 'postal', 'province')
   * @param {string} countryCode - Two-letter country code
   * @param {boolean} isBilling - Whether this is a billing field
   * @returns {string} The appropriate label for the field
   */
  static getFieldLabel(fieldName, countryCode, isBilling = false) {
    const prefix = isBilling ? 'Billing ' : '';
    
    if (fieldName === 'postal') {
      const postalLabels = {
        'US': 'ZIP Code',
        'CA': 'Postal Code',
        'GB': 'Postcode',
        'AU': 'Postcode',
        'NZ': 'Postcode',
        'BR': 'CEP',
        'IN': 'PIN Code',
        'default': 'Postal Code'
      };
      
      const label = postalLabels[countryCode] || postalLabels.default;
      return prefix + label;
    }
    
    if (fieldName === 'province' || fieldName === 'state') {
      const stateLabels = {
        'US': 'State',
        'CA': 'Province',
        'GB': 'County',
        'AU': 'State/Territory',
        'NZ': 'Region',
        'JP': 'Prefecture',
        'default': 'State/Province'
      };
      
      const label = stateLabels[countryCode] || stateLabels.default;
      return prefix + label;
    }
    
    // Default labels for other fields
    const defaultLabels = {
      'fname': 'First Name',
      'lname': 'Last Name',
      'address1': 'Address',
      'address2': 'Address 2',
      'city': 'City',
      'country': 'Country',
      'phone': 'Phone'
    };
    
    return prefix + (defaultLabels[fieldName] || fieldName);
  }

  /**
   * Update field placeholder and attributes based on country
   * @param {HTMLElement} field - The field element
   * @param {Object} config - Configuration object with label, pattern, maxLength
   */
  static updateFieldAttributes(field, config) {
    if (!field || !config) return;
    
    if (config.label !== undefined) {
      field.placeholder = config.label;
    }
    
    if (config.pattern !== undefined) {
      field.setAttribute('pattern', config.pattern);
    }
    
    if (config.maxLength !== undefined) {
      field.setAttribute('maxlength', config.maxLength);
    }
    
    if (config.format !== undefined) {
      field.setAttribute('data-format', config.format);
    }
  }

  /**
   * Clear error styling and messages for a field
   * @param {HTMLElement} field - The field element
   */
  static clearFieldError(field) {
    if (!field) return;
    
    field.classList.remove('error');
    
    const wrapper = field.closest('.frm-flds') || 
                   field.closest('.form-group') || 
                   field.parentElement;
    
    if (wrapper) {
      const errorElement = wrapper.querySelector('.pb-input-error');
      if (errorElement) {
        errorElement.remove();
      }
    }
  }

  /**
   * Show error message for a field
   * @param {HTMLElement} field - The field element
   * @param {string} message - The error message
   */
  static showFieldError(field, message) {
    if (!field || !message) return;
    
    field.classList.add('error');
    
    const wrapper = field.closest('.frm-flds') || 
                   field.closest('.form-group') || 
                   field.parentElement;
    
    if (wrapper) {
      // Remove existing error if any
      const existingError = wrapper.querySelector('.pb-input-error');
      if (existingError) {
        existingError.remove();
      }
      
      // Create new error element
      const errorElement = document.createElement('div');
      errorElement.className = 'pb-input-error';
      errorElement.textContent = message;
      errorElement.style.cssText = 'color: red; font-size: 0.875rem; margin-top: 0.25rem;';
      
      wrapper.appendChild(errorElement);
    }
  }
}