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
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\d\s\-\+\(\)]+$/,
  NAME: /^[A-Za-zÀ-ÿ]+(?:[' -][A-Za-zÀ-ÿ]+)*$/,
} as const;

export interface ValidationRule {
  type: 'required' | 'email' | 'phone' | 'postal' | 'name' | 'custom';
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

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  private initializeValidationRules(): void {
    const requiredRule: ValidationRule = { type: 'required', message: 'This field is required' };
    const emailRule: ValidationRule = { type: 'email', message: 'Please enter a valid email address' };
    const phoneRule: ValidationRule = { type: 'phone', message: 'Please enter a valid phone number' };
    const nameRule: ValidationRule = { type: 'name', message: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
    
    this.rules.set('email', [requiredRule, emailRule]);
    this.rules.set('fname', [requiredRule, nameRule]);
    this.rules.set('lname', [requiredRule, nameRule]);
    this.rules.set('address1', [requiredRule]);
    this.rules.set('city', [requiredRule]);
    this.rules.set('postal', [requiredRule]);
    this.rules.set('country', [requiredRule]);
    this.rules.set('phone', [phoneRule]); // Phone is optional but validated if present
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
    
    // Define required fields in validation order
    const baseRequiredFields = ['email', 'fname', 'lname', 'address1', 'city'];
    
    const countryConfig = countryConfigs.get(formData.country);
    const requiredFields = [...baseRequiredFields];
    
    if (countryConfig?.stateRequired) {
      requiredFields.push('province');
    }
    
    requiredFields.push('postal', 'country');
    
    // Validate each required field
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].trim() === '') {
        errors[field] = `${this.formatFieldName(field, currentCountryConfig)} is required`;
        if (!firstErrorField) {
          firstErrorField = field;
        }
        isValid = false;
      }
    });
    
    // Name validation
    if (formData.fname && formData.fname.trim() && !this.isValidName(formData.fname)) {
      errors.fname = 'First name can only contain letters, spaces, hyphens, and apostrophes';
      if (!firstErrorField) {
        firstErrorField = 'fname';
      }
      isValid = false;
    }
    
    if (formData.lname && formData.lname.trim() && !this.isValidName(formData.lname)) {
      errors.lname = 'Last name can only contain letters, spaces, hyphens, and apostrophes';
      if (!firstErrorField) {
        firstErrorField = 'lname';
      }
      isValid = false;
    }
    
    // Email validation
    if (formData.email && !this.isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
      if (isValid) {
        firstErrorField = 'email';
      }
      isValid = false;
    }
    
    // Phone validation
    if (formData.phone) {
      let phoneIsValid = false;
      
      if (this.phoneInputManager) {
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
        if (isValid) {
          firstErrorField = 'phone';
        }
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
        if (isValid) {
          firstErrorField = 'postal';
        }
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
              
              if (isValid && error.field === 'number') {
                firstErrorField = 'cc-number';
              } else if (isValid && !firstErrorField) {
                firstErrorField = fieldName;
              }
            });
            isValid = false;
          }
          
          // Validate month/year dropdowns
          const creditCardValidation = this.creditCardService.validateCreditCard(cardData);
          if (!creditCardValidation.isValid && creditCardValidation.errors) {
            Object.entries(creditCardValidation.errors).forEach(([field, error]) => {
              errors[field] = error;
              if (isValid) {
                firstErrorField = field;
                isValid = false;
              }
            });
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
        if (isValid) {
          firstErrorField = htmlFieldName;
          isValid = false;
        }
      });
      
      if (!billingErrors.isValid) {
        isValid = false;
      }
    }
    
    return { 
      isValid, 
      ...(firstErrorField && { firstErrorField }),
      errors 
    };
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
    return VALIDATION_PATTERNS.EMAIL.test(email);
  }

  public isValidPhone(phone: string): boolean {
    return VALIDATION_PATTERNS.PHONE.test(phone) && phone.replace(/\D/g, '').length >= 10;
  }

  public isValidName(name: string): boolean {
    return VALIDATION_PATTERNS.NAME.test(name.trim());
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
    this.hideError(fieldName);
  }

  public clearAllErrors(): void {
    this.errors.clear();
    
    const fields = document.querySelectorAll('[data-next-checkout-field], [os-checkout-field]');
    fields.forEach(field => {
      const fieldName = field.getAttribute('data-next-checkout-field') || field.getAttribute('os-checkout-field');
      if (fieldName) {
        this.hideError(fieldName);
      }
    });
    
    // Clear credit card errors
    if (this.creditCardService) {
      this.creditCardService.clearAllErrors();
    }
  }

  public showError(fieldName: string, message: string): void {
    const field = this.findFormField(fieldName);
    if (!field) return;

    this.errorManager.showFieldError(field, message);
  }

  private hideError(fieldName: string): void {
    const field = this.findFormField(fieldName);
    if (!field) return;

    this.errorManager.clearFieldError(field);
    this.errorManager.showFieldValid(field);
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