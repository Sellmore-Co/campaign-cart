/**
 * Validation Configuration - Focused on credit card validation and UI patterns
 * 
 * Integrates with existing validation-utils.ts for core form validation
 * Adds credit card specific validation and UI styling patterns from example.js
 */

import { isValidEmail, isValidPhone, formatFieldName } from '../utils/validation-utils';

export interface CreditCardValidationPattern {
  regex?: RegExp;
  minLength?: number;
  maxLength?: number;
  errorMessage: string;
  realTimeValidation: boolean;
}

export class ValidationConfig {
  /**
   * Credit card validation patterns from example.js
   */
  public static readonly CREDIT_CARD_PATTERNS: Record<string, CreditCardValidationPattern> = {
    'cc-name': {
      minLength: 2,
      errorMessage: 'Please enter a valid cardholder name',
      realTimeValidation: true
    },
    
    'cc-month': {
      errorMessage: 'Please select an expiration month',
      realTimeValidation: true
    },
    
    'cc-year': {
      errorMessage: 'Please select an expiration year',
      realTimeValidation: true
    }
  };

  /**
   * US-specific validation patterns from example.js
   */
  public static readonly US_PATTERNS: Record<string, CreditCardValidationPattern> = {
    city: {
      regex: /^[A-Za-z\s]+$/,
      minLength: 2,
      maxLength: 42,
      errorMessage: 'Not a valid US City Format',
      realTimeValidation: false
    },
    
    postal: {
      regex: /(^\d{5}$)|(^\d{5}-\d{4}$)/,
      minLength: 5,
      maxLength: 11,
      errorMessage: 'Not a valid US ZIP code format',
      realTimeValidation: false
    }
  };

  /**
   * Name validation patterns from example.js
   */
  public static readonly NAME_PATTERNS = {
    firstName: /^[A-Za-z]+(?:[' -][A-Za-z]+)*$/,
    lastName: /\b([A-ZÀ-ÿ][-,a-z. ']+[ ]*)+$/gi
  };

  /**
   * CSS classes for validation states (from example.js)
   */
  public static readonly CSS_CLASSES = {
    valid: 'no-error',
    invalid: 'has-error',
    errorField: 'next-error-field',
    errorMessage: 'next-error',
    errorIcon: 'addErrorIcon',
    validIcon: 'addTick',
    processing: 'next-processing',
    hasValue: 'has-value'
  };

  /**
   * Error container selectors from example.js
   */
  public static readonly ERROR_CONTAINERS: Record<string, string> = {
    email: '.invalid-email',
    fname: '.invalid-fname',
    lname: '.invalid-lname',
    phone: '.invalid-ph',
    address1: '.invalid-shipping_address_line1',
    city: '.invalid-shipping_address_line4',
    province: '.invalid-shipping_state',
    postal: '.invalid-shipping_postcode',
    country: '.invalid-shipping_country',
    'cc-name': '.invalid-cc-name',
    'cc-month': '.invalid-cc-month',
    'cc-year': '.invalid-cc-year',
    'cc-number': '.invalid-cc-number',
    cvv: '.invalid-cvv'
  };

  /**
   * Validation messages
   */
  public static readonly MESSAGES = {
    creditCard: {
      number: 'Please enter a valid card number',
      cvv: 'Please enter a valid CVV number',
      month: 'Please select an expiration month',
      year: 'Please select an expiration year',
      name: 'Please enter the cardholder name',
      expired: 'This card has expired'
    },
    general: {
      required: 'This field is required',
      invalid: 'Please enter a valid value',
      tooShort: 'This value is too short',
      tooLong: 'This value is too long'
    }
  };

  /**
   * Validate credit card field
   */
  public static validateCreditCardField(fieldName: string, value: string): { isValid: boolean; errorMessage?: string } {
    const pattern = this.CREDIT_CARD_PATTERNS[fieldName];
    if (!pattern) return { isValid: true };

    const trimmedValue = value.trim();
    
    if (!trimmedValue) {
      return { isValid: false, errorMessage: `${fieldName.replace('cc-', '').replace('-', ' ')} is required` };
    }

    if (pattern.minLength && trimmedValue.length < pattern.minLength) {
      return { isValid: false, errorMessage: pattern.errorMessage };
    }

    if (pattern.maxLength && trimmedValue.length > pattern.maxLength) {
      return { isValid: false, errorMessage: pattern.errorMessage };
    }

    return { isValid: true };
  }

  /**
   * Validate field with country-specific patterns
   */
  public static validateFieldWithPattern(fieldName: string, value: string, countryCode?: string): { isValid: boolean; errorMessage?: string } {
    // Check for US-specific patterns
    if (countryCode === 'US' && this.US_PATTERNS[fieldName]) {
      const pattern = this.US_PATTERNS[fieldName];
      const trimmedValue = value.trim();

      if (pattern.regex && !pattern.regex.test(trimmedValue)) {
        return { isValid: false, errorMessage: pattern.errorMessage };
      }

      if (pattern.minLength && trimmedValue.length < pattern.minLength) {
        return { isValid: false, errorMessage: pattern.errorMessage };
      }

      if (pattern.maxLength && trimmedValue.length > pattern.maxLength) {
        return { isValid: false, errorMessage: pattern.errorMessage };
      }
    }

    return { isValid: true };
  }

  /**
   * Check if field should have real-time validation
   */
  public static shouldValidateRealTime(fieldName: string): boolean {
    const ccPattern = this.CREDIT_CARD_PATTERNS[fieldName];
    return ccPattern?.realTimeValidation || false;
  }

  /**
   * Get error container selector for a field
   */
  public static getErrorContainer(fieldName: string): string | undefined {
    return this.ERROR_CONTAINERS[fieldName];
  }

  /**
   * Get formatted field name using existing utility
   */
  public static getFormattedFieldName(field: string, _countryConfig?: any): string {
    return formatFieldName(field);
  }

  /**
   * Use existing validation utilities
   */
  public static isValidEmail = isValidEmail;
  public static isValidPhone = isValidPhone;
}