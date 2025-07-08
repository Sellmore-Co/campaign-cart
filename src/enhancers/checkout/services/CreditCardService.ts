/**
 * Credit Card Service - Consolidated credit card processing
 * Handles Spreedly integration, validation, and tokenization
 */

import { createLogger } from '@/utils/logger';
// import { ErrorDisplayManager } from '../utils/error-display-utils'; - removed unused import
import { FieldFinder } from '../utils/field-finder-utils';
import type { Logger } from '@/utils/logger';

declare global {
  interface Window {
    Spreedly: any;
  }
}

export interface CreditCardData {
  full_name: string;
  month: string;
  year: string;
}

export interface CreditCardValidationState {
  number: { isValid: boolean; hasError: boolean; errorMessage?: string };
  cvv: { isValid: boolean; hasError: boolean; errorMessage?: string };
  month: { isValid: boolean; hasError: boolean; errorMessage?: string };
  year: { isValid: boolean; hasError: boolean; errorMessage?: string };
}

export class CreditCardService {
  private logger: Logger;
  private environmentKey: string;
  private isReady: boolean = false;
  // errorManager removed - unused
  private validationState: CreditCardValidationState;
  
  // Callbacks
  private onReadyCallback?: () => void;
  private onErrorCallback?: (errors: string[]) => void;
  private onTokenCallback?: (token: string, pmData: any) => void;
  
  // Field references
  private numberField?: HTMLElement;
  private cvvField?: HTMLElement;
  private monthField?: HTMLElement;
  private yearField?: HTMLElement;

  constructor(environmentKey: string) {
    this.environmentKey = environmentKey;
    this.logger = createLogger('CreditCardService');
    // errorManager initialization removed - no longer used
    this.validationState = this.initializeValidationState();
    
    if (!environmentKey) {
      this.logger.error('No Spreedly environment key provided');
      return;
    }
  }

  /**
   * Initialize the credit card service
   */
  public async initialize(): Promise<void> {
    try {
      // Find credit card fields
      this.findCreditCardFields();
      
      if (!this.numberField || !this.cvvField) {
        this.logger.debug('Credit card fields not found, skipping Spreedly initialization');
        return;
      }
      
      // Load and setup Spreedly
      await this.loadSpreedlyScript();
      this.setupSpreedly();
      
      this.logger.debug('CreditCardService initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize CreditCardService:', error);
      throw error;
    }
  }

  /**
   * Tokenize credit card data
   */
  public async tokenizeCard(cardData: CreditCardData): Promise<string> {
    if (!this.isReady) {
      throw new Error('Credit card service is not ready');
    }

    // Validate card data
    if (!cardData.full_name || !cardData.month || !cardData.year) {
      throw new Error('Credit card data is incomplete');
    }

    this.logger.debug('Tokenizing credit card');
    
    return new Promise((resolve, reject) => {
      // Set up one-time callbacks
      const originalTokenCallback = this.onTokenCallback;
      const originalErrorCallback = this.onErrorCallback;
      
      this.onTokenCallback = (token: string, pmData: any) => {
        // Call the original callback first (to emit the event)
        if (originalTokenCallback) {
          originalTokenCallback(token, pmData);
        }
        // Then restore and resolve
        if (originalTokenCallback) {
          this.onTokenCallback = originalTokenCallback;
        } else {
          delete this.onTokenCallback;
        }
        if (originalErrorCallback) {
          this.onErrorCallback = originalErrorCallback;
        } else {
          delete this.onErrorCallback;
        }
        resolve(token);
      };
      
      this.onErrorCallback = (errors: string[]) => {
        // Call the original callback first (to emit the error event)
        if (originalErrorCallback) {
          originalErrorCallback(errors);
        }
        // Then restore and reject
        if (originalTokenCallback) {
          this.onTokenCallback = originalTokenCallback;
        } else {
          delete this.onTokenCallback;
        }
        if (originalErrorCallback) {
          this.onErrorCallback = originalErrorCallback;
        } else {
          delete this.onErrorCallback;
        }
        reject(new Error(errors.join('. ')));
      };
      
      // Set timeout
      const timeoutId = setTimeout(() => {
        if (originalTokenCallback) {
          this.onTokenCallback = originalTokenCallback;
        } else {
          delete this.onTokenCallback;
        }
        if (originalErrorCallback) {
          this.onErrorCallback = originalErrorCallback;
        } else {
          delete this.onErrorCallback;
        }
        reject(new Error('Credit card tokenization timed out'));
      }, 30000);
      
      // Clear timeout on resolution
      const originalResolve = resolve;
      const originalReject = reject;
      const wrappedResolve = (value: string | PromiseLike<string>) => {
        clearTimeout(timeoutId);
        originalResolve(value as string);
      };
      // Override resolve with wrapped version
      resolve = wrappedResolve as any;
      reject = (error: Error) => {
        clearTimeout(timeoutId);
        originalReject(error);
      };
      
      // Tokenize with Spreedly
      console.log('🟢 [CreditCardService] Calling Spreedly.tokenizeCreditCard with:', cardData);
      window.Spreedly.tokenizeCreditCard(cardData);
    });
  }

  /**
   * Validate credit card form data
   */
  public validateCreditCard(cardData: CreditCardData): { isValid: boolean; errors?: Record<string, string> } {
    const errors: Record<string, string> = {};
    let isValid = true;

    // Determine the actual field names used in the DOM
    const monthFieldName = this.monthField?.getAttribute('data-next-checkout-field') || 
                          this.monthField?.getAttribute('os-checkout-field') || 
                          'cc-month';
    const yearFieldName = this.yearField?.getAttribute('data-next-checkout-field') || 
                         this.yearField?.getAttribute('os-checkout-field') || 
                         'cc-year';

    // Validate month
    if (!cardData.month || cardData.month.trim() === '') {
      errors[monthFieldName] = 'Expiration month is required';
      this.setCreditCardFieldError('month', 'Expiration month is required');
      isValid = false;
    } else {
      const monthNum = parseInt(cardData.month, 10);
      if (monthNum < 1 || monthNum > 12) {
        errors[monthFieldName] = 'Please select a valid month';
        this.setCreditCardFieldError('month', 'Please select a valid month');
        isValid = false;
      } else {
        this.setCreditCardFieldValid('month');
      }
    }

    // Validate year
    if (!cardData.year || cardData.year.trim() === '') {
      errors[yearFieldName] = 'Expiration year is required';
      this.setCreditCardFieldError('year', 'Expiration year is required');
      isValid = false;
    } else {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-based
      const yearNum = parseInt(cardData.year, 10);
      const fullYear = yearNum < 100 ? 2000 + yearNum : yearNum;
      
      if (fullYear < currentYear || fullYear > currentYear + 20) {
        errors[yearFieldName] = 'Please select a valid year';
        this.setCreditCardFieldError('year', 'Please select a valid year');
        isValid = false;
      } else if (fullYear === currentYear && cardData.month) {
        // Check if card is expired (year is current year and month is in the past)
        const monthNum = parseInt(cardData.month, 10);
        if (monthNum < currentMonth) {
          errors[monthFieldName] = 'Card has expired';
          errors[yearFieldName] = 'Card has expired';
          this.setCreditCardFieldError('month', 'Card has expired');
          this.setCreditCardFieldError('year', 'Card has expired');
          isValid = false;
        } else {
          this.setCreditCardFieldValid('year');
        }
      } else {
        this.setCreditCardFieldValid('year');
      }
    }

    const result: { isValid: boolean; errors?: Record<string, string> } = { isValid };
    if (Object.keys(errors).length > 0) {
      result.errors = errors;
    }
    return result;
  }

  /**
   * Check if Spreedly fields are ready for validation
   */
  public checkSpreedlyFieldsReady(): { hasEmptyFields: boolean; errors: Array<{field: string; message: string}> } {
    const errors: Array<{field: string; message: string}> = [];
    
    // Check if Spreedly fields have been interacted with and are valid
    if (!this.validationState.number.isValid) {
      errors.push({ field: 'number', message: 'Please enter a valid credit card number' });
    }
    
    if (!this.validationState.cvv.isValid) {
      errors.push({ field: 'cvv', message: 'Please enter a valid CVV' });
    }
    
    return {
      hasEmptyFields: errors.length > 0,
      errors
    };
  }

  /**
   * Clear all credit card errors
   */
  public clearAllErrors(): void {
    // Clear Spreedly field errors
    this.clearCreditCardFieldError('number');
    this.clearCreditCardFieldError('cvv');
    this.clearCreditCardFieldError('month');
    this.clearCreditCardFieldError('year');
    
    // Hide toast error
    const toastHandler = document.querySelector('[next-checkout-element="spreedly-error"]');
    if (toastHandler instanceof HTMLElement) {
      toastHandler.style.display = 'none';
    }
  }

  /**
   * Set callbacks
   */
  public setOnReady(callback: () => void): void {
    this.onReadyCallback = callback;
    if (this.isReady) callback();
  }

  public setOnError(callback: (errors: string[]) => void): void {
    this.onErrorCallback = callback;
  }

  public setOnToken(callback: (token: string, pmData: any) => void): void {
    this.onTokenCallback = callback;
  }

  /**
   * Check if service is ready
   */
  public get ready(): boolean {
    return this.isReady;
  }

  // Private methods

  private initializeValidationState(): CreditCardValidationState {
    return {
      number: { isValid: false, hasError: false },
      cvv: { isValid: false, hasError: false },
      month: { isValid: false, hasError: false },
      year: { isValid: false, hasError: false }
    };
  }

  private findCreditCardFields(): void {
    // Find credit card number field
    const numberField = FieldFinder.findField('cc-number') || 
                        document.getElementById('spreedly-number');
    if (numberField) {
      this.numberField = numberField;
    }
    
    // Find CVV field
    const cvvField = FieldFinder.findField('cvv') || 
                     document.getElementById('spreedly-cvv');
    if (cvvField) {
      this.cvvField = cvvField;
    }
    
    // Find month field
    const monthField = FieldFinder.findField('cc-month') || 
                       FieldFinder.findField('exp-month');
    if (monthField) {
      this.monthField = monthField;
    }
    
    // Find year field
    const yearField = FieldFinder.findField('cc-year') || 
                      FieldFinder.findField('exp-year');
    if (yearField) {
      this.yearField = yearField;
    }

    this.logger.debug('Credit card fields found:', {
      number: !!this.numberField,
      cvv: !!this.cvvField,
      month: !!this.monthField,
      year: !!this.yearField
    });
  }

  private async loadSpreedlyScript(): Promise<void> {
    if (typeof window.Spreedly !== 'undefined') {
      this.logger.debug('Spreedly already loaded');
      return;
    }

    this.logger.debug('Loading Spreedly script...');
    
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://core.spreedly.com/iframe/iframe-v1.min.js';
      script.async = true;
      script.onload = () => {
        this.logger.debug('Spreedly script loaded');
        resolve();
      };
      script.onerror = () => {
        this.logger.error('Failed to load Spreedly script');
        reject(new Error('Failed to load Spreedly script'));
      };
      document.head.appendChild(script);
    });
  }

  private setupSpreedly(): void {
    try {
      // Prepare iframe fields
      if (this.numberField) {
        this.numberField.id = 'spreedly-number';
        this.numberField.setAttribute('data-spreedly', 'number');
      }
      
      if (this.cvvField) {
        this.cvvField.id = 'spreedly-cvv';
        this.cvvField.setAttribute('data-spreedly', 'cvv');
      }
      
      // Initialize Spreedly
      window.Spreedly.init(this.environmentKey, {
        "numberEl": "spreedly-number",
        "cvvEl": "spreedly-cvv"
      });
      
      // Set up event listeners
      this.setupSpreedlyEventListeners();
      
      this.logger.debug('Spreedly setup complete');
    } catch (error) {
      this.logger.error('Error setting up Spreedly:', error);
      throw error;
    }
  }

  private setupSpreedlyEventListeners(): void {
    // Ready event
    window.Spreedly.on('ready', () => {
      this.logger.debug('Spreedly ready');
      this.applySpreedlyConfig();
      this.isReady = true;
      if (this.onReadyCallback) {
        this.onReadyCallback();
      }
    });

    // Error event
    window.Spreedly.on('errors', (errors: any[]) => {
      this.logger.error('Spreedly errors:', errors);
      const errorMessages = errors.map(error => error.message);
      
      if (this.onErrorCallback) {
        this.onErrorCallback(errorMessages);
      }
      
      this.showSpreedlyErrors(errors);
    });
    
    // Payment method event
    window.Spreedly.on('paymentMethod', (token: string, pmData: any) => {
      console.log('🟢 [CreditCardService] Spreedly paymentMethod event received!', { token, pmData });
      this.logger.debug('Spreedly payment method created:', token);
      this.clearAllErrors();
      
      if (this.onTokenCallback) {
        console.log('🟢 [CreditCardService] Calling onTokenCallback with token:', token);
        this.onTokenCallback(token, pmData);
      } else {
        console.log('🔴 [CreditCardService] No onTokenCallback registered!');
      }
    });
    
    // Field validation event
    window.Spreedly.on('validation', (result: any) => {
      this.logger.debug('Spreedly validation:', result);
      
      if (result.valid) {
        this.clearCreditCardFieldError(result.fieldType);
      }
    });
    
    // Field events for real-time feedback
    window.Spreedly.on('fieldEvent', (name: string, type: string, _activeEl: any, inputProperties: any) => {
      this.handleSpreedlyFieldEvent(name, type, inputProperties);
    });
  }

  private applySpreedlyConfig(): void {
    try {
      // Apply basic configuration
      window.Spreedly.setFieldType('number', 'text');
      window.Spreedly.setFieldType('cvv', 'text');
      window.Spreedly.setNumberFormat('prettyFormat');
      
      // Set placeholders
      window.Spreedly.setPlaceholder('number', 'Credit Card Number');
      window.Spreedly.setPlaceholder('cvv', 'CVV *');
      
      // Set styling
      const fieldStyle = 'color: #212529; font-size: .925rem; font-weight: 400; width: 100%; height:100%; font-family: system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue","Noto Sans","Liberation Sans",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";';
      window.Spreedly.setStyle('number', fieldStyle);
      window.Spreedly.setStyle('cvv', fieldStyle);
      
      // Set required attributes
      window.Spreedly.setRequiredAttribute('number');
      window.Spreedly.setRequiredAttribute('cvv');
      
      this.logger.debug('Spreedly configuration applied');
    } catch (error) {
      this.logger.error('Error applying Spreedly configuration:', error);
    }
  }

  private handleSpreedlyFieldEvent(name: string, type: string, inputProperties: any): void {
    if (type === 'input' && inputProperties) {
      if (name === 'number' && inputProperties.validNumber !== undefined) {
        this.validationState.number.isValid = inputProperties.validNumber;
        this.validationState.number.hasError = !inputProperties.validNumber;
      } else if (name === 'cvv' && inputProperties.validCvv !== undefined) {
        this.validationState.cvv.isValid = inputProperties.validCvv;
        this.validationState.cvv.hasError = !inputProperties.validCvv;
      }
    }
  }

  private showSpreedlyErrors(errors: any[]): void {
    // Show in toast
    const toastHandler = document.querySelector('[next-checkout-element="spreedly-error"]');
    if (toastHandler instanceof HTMLElement) {
      const messageElement = toastHandler.querySelector('[data-os-message="error"]');
      if (messageElement) {
        const errorMessages = errors.map(e => e.message).join('. ');
        messageElement.textContent = errorMessages;
        toastHandler.style.display = 'flex';
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
          if (toastHandler.style.display === 'flex') {
            toastHandler.style.display = 'none';
          }
        }, 10000);
      }
    }
    
    // Mark fields with errors
    errors.forEach(error => {
      const fieldType = error.attribute;
      if (fieldType === 'number' || fieldType === 'card_number') {
        this.setCreditCardFieldError('number', error.message);
      } else if (fieldType === 'cvv') {
        this.setCreditCardFieldError('cvv', error.message);
      }
    });
  }

  private setCreditCardFieldValid(fieldType: keyof CreditCardValidationState): void {
    this.validationState[fieldType].isValid = true;
    this.validationState[fieldType].hasError = false;
    delete this.validationState[fieldType].errorMessage;
    
    const field = this.getFieldElement(fieldType);
    if (field) {
      field.classList.remove('has-error', 'next-error-field');
      field.classList.add('no-error');
      
      const wrapper = FieldFinder.findFieldWrapper(field);
      if (wrapper) {
        wrapper.classList.remove('has-error', 'addErrorIcon');
        wrapper.classList.add('addTick');
      }
    }
  }

  private setCreditCardFieldError(fieldType: keyof CreditCardValidationState, message: string): void {
    this.validationState[fieldType].isValid = false;
    this.validationState[fieldType].hasError = true;
    this.validationState[fieldType].errorMessage = message;
    
    const field = this.getFieldElement(fieldType);
    if (field) {
      field.classList.remove('no-error');
      field.classList.add('has-error', 'next-error-field');
      
      const wrapper = FieldFinder.findFieldWrapper(field);
      if (wrapper) {
        wrapper.classList.remove('addTick');
        wrapper.classList.add('has-error', 'addErrorIcon');
        
        // Add error message
        const existingError = wrapper.querySelector('.next-error-label');
        if (existingError) {
          existingError.remove();
        }
        
        const errorElement = document.createElement('div');
        errorElement.className = 'next-error-label';
        errorElement.textContent = message;
        wrapper.appendChild(errorElement);
      }
    }
  }

  private clearCreditCardFieldError(fieldType: keyof CreditCardValidationState): void {
    this.validationState[fieldType].hasError = false;
    delete this.validationState[fieldType].errorMessage;
    
    const field = this.getFieldElement(fieldType);
    if (field) {
      field.classList.remove('has-error', 'next-error-field');
      
      const wrapper = FieldFinder.findFieldWrapper(field);
      if (wrapper) {
        wrapper.classList.remove('has-error', 'addErrorIcon');
        
        const errorElement = wrapper.querySelector('.next-error-label');
        if (errorElement) {
          errorElement.remove();
        }
      }
    }
  }

  private getFieldElement(fieldType: keyof CreditCardValidationState): HTMLElement | undefined {
    switch (fieldType) {
      case 'number': return this.numberField;
      case 'cvv': return this.cvvField;
      case 'month': return this.monthField;
      case 'year': return this.yearField;
      default: return undefined;
    }
  }

  public destroy(): void {
    this.clearAllErrors();
    this.isReady = false;
    delete this.onReadyCallback;
    delete this.onErrorCallback;
    delete this.onTokenCallback;
    this.logger.debug('CreditCardService destroyed');
  }
}