/**
 * Consolidated Checkout Validator - Updated to use CreditCardService
 */

import type { CountryConfig } from '@/utils/countryService';
import type { Logger } from '@/utils/logger';
import { ErrorDisplayManager } from '../utils/error-display-utils';
import { FieldFinder } from '../utils/field-finder-utils';
import { CreditCardService, type CreditCardData } from '../services/CreditCardService';

// Centralized validation patterns and constants
export const VALIDATION_PATTERNS = {
  // Enhanced email validation - supports all valid TLDs including .co, .uk, etc.
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/,
  PHONE: /^[\d\s\-\+\(\)]+$/,
  NAME: /^[A-Za-zÀ-ÿ]+(?:[' -][A-Za-zÀ-ÿ]+)*$/,
  // City validation - allows any Unicode letter, spaces, periods, apostrophes (both straight and curly), and hyphens
  // Examples: "New York", "St. John's", "São Paulo", "Québec-City", "Mont-Saint-Michel", "O'Fallon"
  CITY: /^[\p{L}\s.''-]+$/u,
} as const;

export interface ValidationRule {
  type: 'required' | 'email' | 'phone' | 'postal' | 'name' | 'city' | 'custom';
  message?: string;
  validator?: (value: any, context?: any) => boolean;
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export interface FormValidationResult {
  isValid: boolean;
  firstErrorField?: string;
  errors: Record<string, string>;
}

export class CheckoutValidator {
  private logger: Logger;
  private countryService: any;
  private phoneInputManager?: any;
  private errorManager: ErrorDisplayManager;
  private creditCardService?: CreditCardService;
  private phoneValidator?: (phoneNumber: string, type?: 'shipping' | 'billing') => boolean;
  
  // Validation rules for form fields
  private rules: Map<string, ValidationRule[]> = new Map();
  
  // Error storage
  private errors: Map<string, string> = new Map();

  constructor(
    logger: Logger,
    countryService: any,
    phoneInputManager?: any
  ) {
    this.logger = logger;
    this.countryService = countryService;
    this.phoneInputManager = phoneInputManager;
    this.errorManager = new ErrorDisplayManager();
    this.initializeValidationRules();
  }

  /**
   * Set credit card service for payment validation
   */
  public setCreditCardService(creditCardService: CreditCardService): void {
    this.creditCardService = creditCardService;
  }

  /**
   * Set custom phone validator function
   */
  public setPhoneValidator(validator: (phoneNumber: string, type?: 'shipping' | 'billing') => boolean): void {
    this.phoneValidator = validator;
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  private initializeValidationRules(): void {
    const requiredRule: ValidationRule = { type: 'required', message: 'This field is required' };
    const emailRule: ValidationRule = { type: 'email', message: 'Please enter a valid email address' };
    const phoneRule: ValidationRule = { type: 'phone', message: 'Please enter a valid phone number' };
    const nameRule: ValidationRule = { type: 'name', message: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
    const cityRule: ValidationRule = { type: 'city', message: 'Please enter a valid city name' };
    
    this.rules.set('email', [requiredRule, emailRule]);
    this.rules.set('fname', [requiredRule, nameRule]);
    this.rules.set('lname', [requiredRule, nameRule]);
    this.rules.set('address1', [requiredRule]);
    this.rules.set('city', [requiredRule, cityRule]);
    this.rules.set('postal', [requiredRule]);
    this.rules.set('country', [requiredRule]);
    this.rules.set('phone', [phoneRule]); // Phone validation rules (required is conditional)
  }

  // ============================================================================
  // CORE VALIDATION METHODS
  // ============================================================================

  /**
   * Validate a single field based on its rules
   */
  public validateField(name: string, value: any, context?: any): ValidationResult {
    const rules = this.rules.get(name) || [];
    let isValid = true;
    let message: string | undefined;

    for (const rule of rules) {
      if (!this.applyRule(rule, value, context)) {
        message = rule.message || `${this.formatFieldName(name, context)} is invalid`;
        this.setError(name, message);
        isValid = false;
        break;
      }
    }

    if (isValid) {
      this.clearError(name);
    }

    const result: ValidationResult = { isValid };
    if (message !== undefined) {
      result.message = message;
    }
    return result;
  }

  /**
   * Validate only fields required for a specific checkout step
   */
  public async validateStep(
    step: number,
    formData: Record<string, any>,
    countryConfigs: Map<string, CountryConfig>,
    currentCountryConfig?: CountryConfig
  ): Promise<FormValidationResult> {
    let isValid = true;
    let firstErrorField: string | undefined;
    const errors: Record<string, string> = {};

    // Define fields required for each step
    let requiredFields: string[] = [];

    if (step === 1) {
      // Step 1: Contact information and shipping address
      requiredFields = ['email', 'fname', 'lname', 'country', 'address1', 'city', 'postal'];

      const countryConfig = countryConfigs.get(formData.country);
      if (countryConfig?.stateRequired) {
        requiredFields.push('province');
      }

      // Check if phone field is marked as required in HTML
      const phoneField = document.querySelector('[name="phone"]') as HTMLInputElement;
      if (phoneField && (phoneField.hasAttribute('required') || phoneField.dataset.nextRequired === 'true')) {
        requiredFields.push('phone');
      }
    } else if (step === 2) {
      // Step 2: Shipping method (already validated in step 1, just check if present)
      requiredFields = ['email', 'fname', 'lname', 'country', 'address1', 'city', 'postal'];
      const countryConfig = countryConfigs.get(formData.country);
      if (countryConfig?.stateRequired) {
        requiredFields.push('province');
      }
    } else if (step === 3) {
      // Step 3: Payment (validate everything)
      return this.validateForm(formData, countryConfigs, currentCountryConfig, true, undefined, true);
    }

    // Validate each required field
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].trim() === '') {
        errors[field] = `${this.formatFieldName(field, currentCountryConfig)} is required`;
        isValid = false;
        if (!firstErrorField) firstErrorField = field;
      }
    });

    // Name validation
    if (formData.fname && formData.fname.trim() && !this.isValidName(formData.fname)) {
      errors.fname = 'First name can only contain letters, spaces, hyphens, and apostrophes';
      isValid = false;
      if (!firstErrorField) firstErrorField = 'fname';
    }

    if (formData.lname && formData.lname.trim() && !this.isValidName(formData.lname)) {
      errors.lname = 'Last name can only contain letters, spaces, hyphens, and apostrophes';
      isValid = false;
      if (!firstErrorField) firstErrorField = 'lname';
    }

    // City validation
    if (formData.city && formData.city.trim() && !this.isValidCity(formData.city)) {
      errors.city = 'Please enter a valid city name';
      isValid = false;
      if (!firstErrorField) firstErrorField = 'city';
    }

    // Email validation
    if (formData.email && !this.isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
      if (!firstErrorField) firstErrorField = 'email';
    }

    // Phone validation (if required)
    if (requiredFields.includes('phone') && formData.phone) {
      let phoneIsValid = false;

      if (this.phoneValidator) {
        phoneIsValid = this.phoneValidator(formData.phone, 'shipping');
      } else if (this.phoneInputManager) {
        phoneIsValid = this.phoneInputManager.validatePhoneNumber(true);
      } else {
        phoneIsValid = this.isValidPhone(formData.phone);
      }

      if (!phoneIsValid) {
        errors.phone = 'Please enter a valid phone number';
        isValid = false;
        if (!firstErrorField) firstErrorField = 'phone';
      }
    }

    // Postal code validation
    if (formData.postal && formData.country) {
      const countryConfig = countryConfigs.get(formData.country);
      if (countryConfig && !this.countryService.validatePostalCode(formData.postal, formData.country, countryConfig)) {
        const errorMsg = countryConfig.postcodeExample
          ? `Please enter a valid ${countryConfig.postcodeLabel.toLowerCase()} (e.g. ${countryConfig.postcodeExample})`
          : `Please enter a valid ${countryConfig.postcodeLabel.toLowerCase()}`;
        errors.postal = errorMsg;
        isValid = false;
        if (!firstErrorField) firstErrorField = 'postal';
      }
    }

    return { isValid, firstErrorField, errors };
  }

  /**
   * Validate entire form including billing address if needed
   */
  public async validateForm(
    formData: Record<string, any>,
    countryConfigs: Map<string, CountryConfig>,
    currentCountryConfig?: CountryConfig,
    includePayment: boolean = false,
    billingAddress?: any,
    sameAsShipping: boolean = true
  ): Promise<FormValidationResult> {
    let isValid = true;
    let firstErrorField: string | undefined;
    const errors: Record<string, string> = {};

    // Define required fields in validation order (fname first for proper focus order)
    const baseRequiredFields = ['fname', 'lname', 'email', 'address1', 'city'];

    const countryConfig = countryConfigs.get(formData.country);
    const requiredFields = [...baseRequiredFields];

    // Check if phone field is marked as required in HTML
    const phoneField = document.querySelector('[name="phone"]') as HTMLInputElement;
    if (phoneField && (phoneField.hasAttribute('required') || phoneField.dataset.nextRequired === 'true')) {
      requiredFields.push('phone');
    }

    if (countryConfig?.stateRequired) {
      requiredFields.push('province');
    }

    requiredFields.push('postal', 'country');
    
    // Validate each required field
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].trim() === '') {
        errors[field] = `${this.formatFieldName(field, currentCountryConfig)} is required`;
        isValid = false;
      }
    });

    // Name validation
    if (formData.fname && formData.fname.trim() && !this.isValidName(formData.fname)) {
      errors.fname = 'First name can only contain letters, spaces, hyphens, and apostrophes';
      isValid = false;
    }

    if (formData.lname && formData.lname.trim() && !this.isValidName(formData.lname)) {
      errors.lname = 'Last name can only contain letters, spaces, hyphens, and apostrophes';
      isValid = false;
    }

    // City validation
    if (formData.city && formData.city.trim() && !this.isValidCity(formData.city)) {
      errors.city = 'Please enter a valid city name';
      isValid = false;
    }

    // Email validation
    if (formData.email && !this.isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Phone validation
    if (formData.phone) {
      let phoneIsValid = false;

      if (this.phoneValidator) {
        phoneIsValid = this.phoneValidator(formData.phone, 'shipping');
      } else if (this.phoneInputManager) {
        phoneIsValid = this.phoneInputManager.validatePhoneNumber(true);
        const formattedPhone = this.phoneInputManager.getFormattedPhoneNumber(true);
        if (formattedPhone) {
          formData.phone = formattedPhone;
        }
      } else {
        phoneIsValid = this.isValidPhone(formData.phone);
      }

      if (!phoneIsValid) {
        errors.phone = 'Please enter a valid phone number';
        isValid = false;
      }
    }

    // Postal code validation
    if (formData.postal && formData.country) {
      const countryConfig = countryConfigs.get(formData.country);
      if (countryConfig && !this.countryService.validatePostalCode(formData.postal, formData.country, countryConfig)) {
        const errorMsg = countryConfig.postcodeExample
          ? `Please enter a valid ${countryConfig.postcodeLabel.toLowerCase()} (e.g. ${countryConfig.postcodeExample})`
          : `Please enter a valid ${countryConfig.postcodeLabel.toLowerCase()}`;
        errors.postal = errorMsg;
        isValid = false;
      }
    }
    
    // Credit card validation
    if (includePayment) {
      const paymentMethod = formData.paymentMethod || 'credit-card';
      
      if (paymentMethod === 'credit-card' || paymentMethod === 'card_token') {
        const cardData: CreditCardData = {
          full_name: `${formData.fname || ''} ${formData.lname || ''}`.trim(),
          month: formData['exp-month'] || formData['cc-month'] || '',
          year: formData['exp-year'] || formData['cc-year'] || ''
        };
        
        // Check credit card service if available
        if (this.creditCardService) {
          // Check Spreedly fields
          const spreedlyCheck = this.creditCardService.checkSpreedlyFieldsReady();
          if (spreedlyCheck.hasEmptyFields) {
            spreedlyCheck.errors.forEach((error) => {
              const fieldName = error.field === 'number' ? 'cc-number' : 'cvv';
              errors[fieldName] = error.message;
            });
            isValid = false;
          }

          // Validate month/year dropdowns
          const creditCardValidation = this.creditCardService.validateCreditCard(cardData);
          if (!creditCardValidation.isValid && creditCardValidation.errors) {
            Object.entries(creditCardValidation.errors).forEach(([field, error]) => {
              errors[field] = error;
            });
            isValid = false;
          }
        }
      }
    }
    
    // Billing address validation
    if (!sameAsShipping && billingAddress) {
      const billingErrors = this.validateBillingAddress(billingAddress, countryConfigs);

      Object.entries(billingErrors.errors).forEach(([field, error]) => {
        const fieldNameMap: Record<string, string> = {
          'first_name': 'billing-fname',
          'last_name': 'billing-lname',
          'address1': 'billing-address1',
          'city': 'billing-city',
          'province': 'billing-province',
          'postal': 'billing-postal',
          'country': 'billing-country',
          'phone': 'billing-phone'
        };

        const htmlFieldName = fieldNameMap[field] || `billing-${field}`;
        errors[htmlFieldName] = error;
      });

      if (!billingErrors.isValid) {
        isValid = false;
      }
    }
    
    // After collecting all errors, find the first error field based on DOM position
    if (!isValid && Object.keys(errors).length > 0) {
      firstErrorField = this.findFirstErrorFieldInDOM(errors);
    }

    return {
      isValid,
      ...(firstErrorField && { firstErrorField }),
      errors
    };
  }

  private findFirstErrorFieldInDOM(errors: Record<string, string>): string | undefined {
    // Get all form fields with errors
    const errorFieldNames = Object.keys(errors);
    if (errorFieldNames.length === 0) return undefined;

    // Find all fields in the DOM
    const fieldsInDOM: { name: string; element: HTMLElement; position: number }[] = [];

    errorFieldNames.forEach(fieldName => {
      const field = this.findFormField(fieldName);
      if (field) {
        const rect = field.getBoundingClientRect();
        const position = rect.top + window.scrollY; // Get absolute position from top of document
        fieldsInDOM.push({ name: fieldName, element: field, position });
      }
    });

    // Sort by position and return the first one
    if (fieldsInDOM.length > 0) {
      fieldsInDOM.sort((a, b) => a.position - b.position);
      return fieldsInDOM[0].name;
    }

    // Fallback to first error in the errors object
    return errorFieldNames[0];
  }

  // ============================================================================
  // VALIDATION HELPERS
  // ============================================================================

  private applyRule(rule: ValidationRule, value: any, context?: any): boolean {
    switch (rule.type) {
      case 'required':
        return value !== null && value !== undefined && value.toString().trim() !== '';
      
      case 'email':
        return !value || this.isValidEmail(value);
      
      case 'phone':
        if (!value) return true;
        
        if (this.phoneInputManager) {
          return this.phoneInputManager.validatePhoneNumber(true);
        } else {
          return this.isValidPhone(value);
        }
      
      case 'name':
        return !value || this.isValidName(value);
      
      case 'city':
        return !value || this.isValidCity(value);
      
      case 'postal':
        if (!value || !context?.country) return true;
        const countryConfig = context.countryConfigs?.get(context.country);
        return !countryConfig || this.countryService.validatePostalCode(value, context.country, countryConfig);
      
      case 'custom':
        return rule.validator ? rule.validator(value, context) : true;
      
      default:
        return true;
    }
  }

  public isValidEmail(email: string): boolean {
    // First check basic regex pattern
    if (!VALIDATION_PATTERNS.EMAIL.test(email)) {
      return false;
    }
    
    // Additional validation rules
    // Check for consecutive dots
    if (email.includes('..')) {
      return false;
    }
    
    // Check that email doesn't start or end with a dot
    const [localPart, domainPart] = email.split('@');
    if (!localPart || !domainPart) {
      return false;
    }
    
    if (localPart.startsWith('.') || localPart.endsWith('.') || 
        domainPart.startsWith('.') || domainPart.endsWith('.')) {
      return false;
    }
    
    // Ensure TLD is at least 2 characters (prevents .c, .h, etc.)
    const parts = domainPart.split('.');
    const tld = parts[parts.length - 1];
    if (!tld || tld.length < 2) {
      return false;
    }
    
    // Check for common incomplete domains (single letter TLDs)
    // Note: .co is a valid TLD for Colombia and many services, so we don't block it
    const incompletePatterns = [
      /\.c$/,     // gmail.c, yahoo.c (but not .co)
      /\.n$/,     // incomplete .net
      /\.o$/,     // incomplete .org
    ];
    
    // Only apply incomplete pattern check if it's truly a single letter TLD
    const domainLower = email.toLowerCase();
    if (incompletePatterns.some(pattern => pattern.test(domainLower))) {
      // Make sure we're not blocking valid 2-letter TLDs
      const parts = domainPart.split('.');
      const tld = parts[parts.length - 1];
      if (tld && tld.length === 1) {
        return false;
      }
    }
    
    return true;
  }

  public isValidPhone(phone: string): boolean {
    return VALIDATION_PATTERNS.PHONE.test(phone) && phone.replace(/\D/g, '').length >= 10;
  }

  public isValidName(name: string): boolean {
    return VALIDATION_PATTERNS.NAME.test(name.trim());
  }

  public isValidCity(city: string): boolean {
    const trimmedCity = city.trim();
    
    // City must not be empty
    if (!trimmedCity) {
      return false;
    }
    
    // City must be at least 2 characters
    if (trimmedCity.length < 2) {
      return false;
    }
    
    // Check for numbers anywhere in the city name
    if (/\d/.test(trimmedCity)) {
      return false;
    }
    
    // Check for excessive consecutive punctuation (more than 2 hyphens or spaces)
    if (/---+/.test(trimmedCity) || /\s{3,}/.test(trimmedCity)) {
      return false;
    }
    
    // Check if starts with punctuation (except for allowed cases)
    // Allow starting with letters only (Unicode letters via \p{L})
    if (!/^[\p{L}]/u.test(trimmedCity)) {
      return false;
    }
    
    // Use the CITY pattern for validation
    // This regex allows: Unicode letters, spaces, periods, apostrophes (both ' and '), and hyphens
    return VALIDATION_PATTERNS.CITY.test(trimmedCity);
  }

  private formatFieldName(field: string, currentCountryConfig?: any): string {
    const fieldNames: Record<string, string> = {
      fname: 'First name',
      lname: 'Last name',
      address1: 'Address',
      address2: 'Address line 2',
      city: 'City',
      province: currentCountryConfig?.stateLabel || 'State/Province',
      postal: currentCountryConfig?.postcodeLabel || 'Postal code',
      country: 'Country',
      email: 'Email',
      phone: 'Phone number'
    };
    
    return fieldNames[field] || field;
  }

  // ============================================================================
  // BILLING ADDRESS VALIDATION
  // ============================================================================

  private validateBillingAddress(
    billingAddress: any, 
    countryConfigs: Map<string, CountryConfig>
  ): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};
    let isValid = true;
    
    const requiredBillingFields = ['first_name', 'last_name', 'address1', 'city', 'country'];
    
    const countryConfig = countryConfigs.get(billingAddress?.country);
    if (countryConfig?.stateRequired) {
      requiredBillingFields.push('province');
    }
    
    requiredBillingFields.push('postal');
    
    requiredBillingFields.forEach(field => {
      const value = billingAddress?.[field];
      
      if (!value || value.trim() === '') {
        const fieldDisplayName = field === 'first_name' ? 'First name' :
                                field === 'last_name' ? 'Last name' :
                                field === 'address1' ? 'Address' :
                                field === 'city' ? 'City' :
                                field === 'province' ? 'State/Province' :
                                field === 'postal' ? 'ZIP/Postal code' :
                                field === 'country' ? 'Country' : field;
        
        errors[field] = `Billing ${fieldDisplayName.toLowerCase()} is required`;
        isValid = false;
      } else if ((field === 'first_name' || field === 'last_name') && value.trim()) {
        if (!this.isValidName(value)) {
          const fieldDisplayName = field === 'first_name' ? 'First name' : 'Last name';
          errors[field] = `Billing ${fieldDisplayName.toLowerCase()} can only contain letters, spaces, hyphens, and apostrophes`;
          isValid = false;
        }
      }
    });
    
    // Validate billing phone
    if (billingAddress?.phone) {
      let phoneIsValid = false;
      
      if (this.phoneValidator) {
        phoneIsValid = this.phoneValidator(billingAddress.phone, 'billing');
      } else {
        phoneIsValid = this.isValidPhone(billingAddress.phone);
      }
      
      if (!phoneIsValid) {
        errors.phone = 'Please enter a valid billing phone number';
        isValid = false;
      }
    }
    
    // Validate billing postal code
    if (billingAddress?.postal && billingAddress?.country) {
      const countryConfig = countryConfigs.get(billingAddress.country);
      if (countryConfig && !this.countryService.validatePostalCode(billingAddress.postal, billingAddress.country, countryConfig)) {
        const errorMsg = countryConfig.postcodeExample 
          ? `Please enter a valid billing ${countryConfig.postcodeLabel.toLowerCase()} (e.g. ${countryConfig.postcodeExample})`
          : `Please enter a valid billing ${countryConfig.postcodeLabel.toLowerCase()}`;
        errors.postal = errorMsg;
        isValid = false;
      }
    }
    
    return { isValid, errors };
  }

  // ============================================================================
  // ERROR MANAGEMENT
  // ============================================================================

  public setError(fieldName: string, message: string): void {
    this.errors.set(fieldName, message);
    this.showError(fieldName, message);
  }

  public clearError(fieldName: string): void {
    this.errors.delete(fieldName);
    // Only hide the error display, don't mark as valid
    this.hideErrorOnly(fieldName);
  }

  public clearAllErrors(): void {
    this.errors.clear();
    
    const fields = document.querySelectorAll('[data-next-checkout-field], [os-checkout-field]');
    fields.forEach(field => {
      const fieldName = field.getAttribute('data-next-checkout-field') || field.getAttribute('os-checkout-field');
      if (fieldName) {
        // Use hideErrorOnly to avoid marking fields as valid
        this.hideErrorOnly(fieldName);
      }
    });
    
    // Clear credit card errors
    if (this.creditCardService) {
      this.creditCardService.clearAllErrors();
    }
  }

  public showError(fieldName: string, message: string): void {
    const field = this.findFormField(fieldName);
    if (!field) {
      this.logger.warn(`Field not found for error display: ${fieldName}`);
      return;
    }

    this.logger.debug(`Showing error for field ${fieldName}:`, { field, message });
    this.errorManager.showFieldError(field, message);
  }


  private hideErrorOnly(fieldName: string): void {
    const field = this.findFormField(fieldName);
    if (!field) return;

    // Only clear the error display, never add success styling
    this.errorManager.clearFieldError(field);
  }

  private findFormField(fieldName: string): HTMLElement | null {
    return FieldFinder.findField(fieldName);
  }

  // ============================================================================
  // FOCUS MANAGEMENT
  // ============================================================================

  public focusFirstErrorField(firstErrorField?: string): void {
    if (!firstErrorField) return;
    
    const ccFields = ['cc-month', 'cc-year', 'number', 'cvv', 'exp-month', 'exp-year'];
    if (ccFields.includes(firstErrorField)) {
      this.focusCreditCardErrorField(firstErrorField);
      return;
    }
    
    const field = this.findFormField(firstErrorField);
    
    if (field && 'focus' in field) {
      field.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      setTimeout(() => {
        (field as HTMLInputElement).focus();
      }, 800);
    }
  }

  private focusCreditCardErrorField(fieldName: string): void {
    if (fieldName === 'cc-number' || fieldName === 'number') {
      if (typeof window !== 'undefined' && (window as any).Spreedly) {
        (window as any).Spreedly.transferFocus('number');
      }
    } else if (fieldName === 'cvv') {
      if (typeof window !== 'undefined' && (window as any).Spreedly) {
        (window as any).Spreedly.transferFocus('cvv');
      }
    } else {
      // For month/year fields, focus normally
      const field = this.findFormField(fieldName);
      if (field && 'focus' in field) {
        (field as HTMLInputElement).focus();
      }
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  public isValid(): boolean {
    return this.errors.size === 0;
  }

  public destroy(): void {
    this.clearAllErrors();
    this.logger.debug('CheckoutValidator destroyed');
  }
}