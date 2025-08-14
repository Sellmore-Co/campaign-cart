/**
 * Credit Card Service - Consolidated credit card processing
 * Handles Spreedly integration, validation, and tokenization
 */

import { createLogger } from '@/utils/logger';
// import { ErrorDisplayManager } from '../utils/error-display-utils'; - removed unused import
import { FieldFinder } from '../utils/field-finder-utils';
import type { Logger } from '@/utils/logger';
import { useCheckoutStore } from '@/stores/checkoutStore';
import { nextAnalytics, EcommerceEvents } from '@/utils/analytics/index';

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
  
  // Track if we've fired the add_payment_info event
  private hasTrackedPaymentInfo = false;

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
      // Skip if already initialized
      if (this.isReady) {
        this.logger.debug('CreditCardService already initialized, skipping');
        return;
      }
      
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
    
    // Hide error containers - this is called after successful tokenization
    // so it's safe to hide payment errors here
    this.hidePaymentErrorContainers();
  }

  /**
   * Clear credit card fields
   */
  public clearFields(): void {
    // Clear Spreedly iframe fields if available
    if (window.Spreedly && this.isReady) {
      try {
        // Spreedly doesn't provide a direct clear method, but we can try to reset
        window.Spreedly.reload();
        this.logger.debug('Spreedly fields reloaded');
      } catch (error) {
        this.logger.warn('Failed to reload Spreedly fields:', error);
      }
    }

    // Clear month and year fields
    if (this.monthField instanceof HTMLSelectElement) {
      this.monthField.selectedIndex = 0;
    }
    if (this.yearField instanceof HTMLSelectElement) {
      this.yearField.selectedIndex = 0;
    }

    // Clear validation state
    this.validationState = this.initializeValidationState();
    
    // Clear any visible errors
    this.clearAllErrors();
  }
  
  private hidePaymentErrorContainers(): void {
    // Hide credit error container (used for all payment errors)
    const creditErrorContainer = document.querySelector('[data-next-component="credit-error"]');
    if (creditErrorContainer instanceof HTMLElement) {
      creditErrorContainer.style.display = 'none';
      creditErrorContainer.classList.remove('visible');
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

  /**
   * Focus a specific Spreedly field
   */
  public focusField(field: 'number' | 'cvv'): void {
    if (window.Spreedly && this.isReady) {
      window.Spreedly.transferFocus(field);
      this.logger.debug(`Focusing ${field} field`);
    }
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
      // Add event listener to check payment info when month changes
      if (monthField instanceof HTMLSelectElement) {
        monthField.addEventListener('change', () => this.checkAndTrackPaymentInfo());
      }
    }
    
    // Find year field
    const yearField = FieldFinder.findField('cc-year') || 
                      FieldFinder.findField('exp-year');
    if (yearField) {
      this.yearField = yearField;
      // Add event listener to check payment info when year changes
      if (yearField instanceof HTMLSelectElement) {
        yearField.addEventListener('change', () => this.checkAndTrackPaymentInfo());
      }
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
        // Add transition for smooth focus effect
        this.numberField.style.transition = 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out';
      }
      
      if (this.cvvField) {
        this.cvvField.id = 'spreedly-cvv';
        this.cvvField.setAttribute('data-spreedly', 'cvv');
        // Add transition for smooth focus effect
        this.cvvField.style.transition = 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out';
      }
      
      // Initialize Spreedly
      window.Spreedly.init(this.environmentKey, {
        "numberEl": "spreedly-number",
        "cvvEl": "spreedly-cvv"
      });
      
      // Set up event listeners
      this.setupSpreedlyEventListeners();
      
      // Set up click handlers for better UX
      this.setupFieldClickHandlers();
      
      // Add focus styles
      this.addFocusStyles();
      
      this.logger.debug('Spreedly setup complete');
    } catch (error) {
      this.logger.error('Error setting up Spreedly:', error);
      throw error;
    }
  }

  private addFocusStyles(): void {
    // Add CSS for focus states if not already present
    const styleId = 'spreedly-focus-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        /* Spreedly field focus states */
        #spreedly-number.next-focused,
        #spreedly-number.has-focus,
        #spreedly-cvv.next-focused,
        #spreedly-cvv.has-focus {
          border-color: #80bdff !important;
          outline: 0 !important;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25) !important;
        }
        
        /* Bootstrap-style focus */
        .form-control#spreedly-number.next-focused,
        .form-control#spreedly-number.has-focus,
        .form-control#spreedly-cvv.next-focused,
        .form-control#spreedly-cvv.has-focus {
          border-color: #80bdff !important;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25) !important;
        }
        
        /* Parent container focus states */
        .frm-flds.next-focused,
        .form-group.next-focused,
        .field-group.next-focused {
          /* Add any parent-level focus styles here if needed */
        }
        
        /* Ensure smooth transitions */
        #spreedly-number,
        #spreedly-cvv {
          transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }
      `;
      document.head.appendChild(style);
    }
  }

  private setupFieldClickHandlers(): void {
    // Add click handler to credit card number field container
    if (this.numberField) {
      // Find the wrapper or use the field itself
      const numberWrapper = this.numberField.closest('.frm-flds, .form-group, .form-field, .field-group') || this.numberField;
      
      numberWrapper.addEventListener('click', (event) => {
        // Don't transfer focus if clicking on another input
        const target = event.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'SELECT' && target.tagName !== 'TEXTAREA') {
          if (window.Spreedly && this.isReady) {
            window.Spreedly.transferFocus('number');
            this.logger.debug('Transferring focus to credit card number field');
          }
        }
      });
      
      // Also add to the field itself for direct clicks
      this.numberField.addEventListener('click', () => {
        if (window.Spreedly && this.isReady) {
          window.Spreedly.transferFocus('number');
        }
      });
    }
    
    // Add click handler to CVV field container
    if (this.cvvField) {
      // Find the wrapper or use the field itself
      const cvvWrapper = this.cvvField.closest('.frm-flds, .form-group, .form-field, .field-group') || this.cvvField;
      
      cvvWrapper.addEventListener('click', (event) => {
        // Don't transfer focus if clicking on another input
        const target = event.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'SELECT' && target.tagName !== 'TEXTAREA') {
          if (window.Spreedly && this.isReady) {
            window.Spreedly.transferFocus('cvv');
            this.logger.debug('Transferring focus to CVV field');
          }
        }
      });
      
      // Also add to the field itself for direct clicks
      this.cvvField.addEventListener('click', () => {
        if (window.Spreedly && this.isReady) {
          window.Spreedly.transferFocus('cvv');
        }
      });
    }
  }

  private setupSpreedlyEventListeners(): void {
    // Ready event
    window.Spreedly.on('ready', () => {
      this.logger.info('[Spreedly Event: ready] iFrame initialized and ready for configuration');
      this.applySpreedlyConfig();
      this.isReady = true;
      if (this.onReadyCallback) {
        this.onReadyCallback();
      }
    });

    // Error event - triggered when tokenization fails
    window.Spreedly.on('errors', (errors: any[]) => {
      this.logger.error('[Spreedly Event: errors] Tokenization failed:', errors.map(e => ({
        attribute: e.attribute,
        key: e.key,
        message: e.message
      })));
      
      // Handle empty error messages with better user feedback
      const errorMessages = errors.map(error => {
        if (!error.message || error.message.trim() === '') {
          // Provide user-friendly messages for known error keys
          if (error.key === 'errors.unexpected_error' || error.status === 0) {
            return 'Unable to process payment. Please check your internet connection and try again.';
          }
          return 'An error occurred processing your payment. Please try again.';
        }
        return error.message;
      });
      
      if (this.onErrorCallback) {
        this.onErrorCallback(errorMessages);
      }
      
      this.showSpreedlyErrors(errors);
    });
    
    // Payment method event - successful tokenization
    window.Spreedly.on('paymentMethod', (token: string, pmData: any) => {
      this.logger.info('[Spreedly Event: paymentMethod] Successfully tokenized!', { 
        token, 
        last4: pmData.last_four_digits,
        cardType: pmData.card_type,
        fingerprint: pmData.fingerprint 
      });
      
      // Clear all errors on successful tokenization
      this.clearAllErrors();
      
      if (this.onTokenCallback) {
        this.logger.debug('[Spreedly] Invoking token callback');
        this.onTokenCallback(token, pmData);
      } else {
        this.logger.error('[Spreedly] No onTokenCallback registered!');
      }
    });
    
    // Validation event - triggered when validate() is called
    // Note: This is separate from fieldEvent and only fires when explicitly calling Spreedly.validate()
    window.Spreedly.on('validation', (inputProperties: any) => {
      this.logger.info('[Spreedly Event: validation] Validation requested:', {
        cardType: inputProperties.cardType,
        validNumber: inputProperties.validNumber,
        validCvv: inputProperties.validCvv,
        numberLength: inputProperties.numberLength,
        cvvLength: inputProperties.cvvLength,
        iin: inputProperties.iin
      });
      
      // Update validation state based on the event
      // We keep this separate from fieldEvent in case validate() is called explicitly
      if (inputProperties.validNumber !== undefined) {
        this.validationState.number.isValid = inputProperties.validNumber;
        this.validationState.number.hasError = !inputProperties.validNumber;
      }
      
      if (inputProperties.validCvv !== undefined) {
        this.validationState.cvv.isValid = inputProperties.validCvv;
        this.validationState.cvv.hasError = !inputProperties.validCvv;
      }
      
      // Note: We don't clear errors here because this event is typically used
      // for checking validation state, not for real-time user input
    });
    
    // Field events for real-time feedback
    window.Spreedly.on('fieldEvent', (name: string, type: string, _activeEl: any, inputProperties: any) => {
      
      this.handleSpreedlyFieldEvent(name, type, inputProperties);
          // Only log input events with properties, reduce noise from other events
          // if (type === 'input' && inputProperties) {
          //   this.logger.info(`[Spreedly Event: fieldEvent] ${name} - ${type}`, {
          //     activeField: activeEl,
          //     cardType: inputProperties.cardType,
          //     validNumber: inputProperties.validNumber,
          //     validCvv: inputProperties.validCvv,
          //     numberLength: inputProperties.numberLength,
          //     cvvLength: inputProperties.cvvLength,
          //     iin: inputProperties.iin
          //   });
          // } else if (type === 'focus' || type === 'blur') {
          //   this.logger.debug(`[Spreedly Event: fieldEvent] ${name} - ${type}`, { activeField: activeEl });
          // }
          
    });
    
    // Console error event - useful for debugging
    window.Spreedly.on('consoleError', (error: any) => {
      this.logger.error('[Spreedly Event: consoleError] Error from iFrame:', {
        message: error.msg,
        url: error.url,
        line: error.line,
        col: error.col
      });
    });
  }

  private applySpreedlyConfig(): void {
    try {
      // Apply basic configuration
      window.Spreedly.setFieldType('number', 'text');
      window.Spreedly.setFieldType('cvv', 'text');
      window.Spreedly.setNumberFormat('prettyFormat');
      
      // Set placeholders
      window.Spreedly.setPlaceholder('number', 'Card Number');
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
    // Handle focus/blur events for visual feedback
    if (type === 'focus') {
      this.handleFieldFocus(name);
    } else if (type === 'blur') {
      this.handleFieldBlur(name);
    }
    
    // Handle input events for validation
    if (type === 'input' && inputProperties) {
      if (name === 'number' && inputProperties.validNumber !== undefined) {
        const wasValid = this.validationState.number.isValid;
        const hadError = this.validationState.number.hasError;
        
        this.validationState.number.isValid = inputProperties.validNumber;
        this.validationState.number.hasError = !inputProperties.validNumber;
        
        if (wasValid !== inputProperties.validNumber) {
          this.logger.info(`[Spreedly] Card number validation changed: ${wasValid} -> ${inputProperties.validNumber}`);
        }
        
        // Handle validation state changes
        if (inputProperties.validNumber && (hadError || wasValid !== inputProperties.validNumber)) {
          // Field became valid - clear errors
          this.logger.info('[Spreedly] Card number is now valid, clearing error');
          this.clearCreditCardFieldError('number');
          
          // Also clear any general credit card errors from the checkout store
          const checkoutStore = useCheckoutStore.getState();
          checkoutStore.clearError('cc-number');
          checkoutStore.clearError('card_number');
        } else if (!inputProperties.validNumber && wasValid) {
          // Field became invalid - show error
          this.logger.info('[Spreedly] Card number is now invalid, showing error');
          this.setCreditCardFieldError('number', 'Please enter a valid credit card number');
          
          // Also set error in checkout store
          const checkoutStore = useCheckoutStore.getState();
          checkoutStore.setError('cc-number', 'Please enter a valid credit card number');
        }
      } else if (name === 'cvv' && inputProperties.validCvv !== undefined) {
        const wasValid = this.validationState.cvv.isValid;
        const hadError = this.validationState.cvv.hasError;
        
        this.validationState.cvv.isValid = inputProperties.validCvv;
        this.validationState.cvv.hasError = !inputProperties.validCvv;
        
        if (wasValid !== inputProperties.validCvv) {
          this.logger.info(`[Spreedly] CVV validation changed: ${wasValid} -> ${inputProperties.validCvv}`);
        }
        
        // Handle validation state changes
        if (inputProperties.validCvv && (hadError || wasValid !== inputProperties.validCvv)) {
          // Field became valid - clear errors
          this.logger.info('[Spreedly] CVV is now valid, clearing error');
          this.clearCreditCardFieldError('cvv');
          
          // Also clear any general credit card errors from the checkout store
          const checkoutStore = useCheckoutStore.getState();
          checkoutStore.clearError('cvv');
          checkoutStore.clearError('card_cvv');
        } else if (!inputProperties.validCvv && wasValid) {
          // Field became invalid - show error
          this.logger.info('[Spreedly] CVV is now invalid, showing error');
          this.setCreditCardFieldError('cvv', 'Please enter a valid CVV');
          
          // Also set error in checkout store
          const checkoutStore = useCheckoutStore.getState();
          checkoutStore.setError('cvv', 'Please enter a valid CVV');
        }
      }
      
      // Check if both credit card fields are valid and track add_payment_info event
      this.checkAndTrackPaymentInfo();
    }
  }
  
  /**
   * Check if credit card fields are complete and track add_payment_info event
   */
  private checkAndTrackPaymentInfo(): void {
    // Only track once per session
    if (this.hasTrackedPaymentInfo) {
      return;
    }
    
    // Check if both Spreedly fields are valid
    const spreedlyFieldsValid = this.validationState.number.isValid && 
                                this.validationState.cvv.isValid;
    
    // Check if month and year are filled (basic check)
    const monthValue = this.monthField instanceof HTMLSelectElement ? this.monthField.value : '';
    const yearValue = this.yearField instanceof HTMLSelectElement ? this.yearField.value : '';
    const expirationValid = monthValue && yearValue && monthValue !== '' && yearValue !== '';
    
    // If all credit card fields are valid/complete, track the event
    if (spreedlyFieldsValid && expirationValid) {
      try {
        nextAnalytics.track(EcommerceEvents.createAddPaymentInfoEvent('Credit Card'));
        this.hasTrackedPaymentInfo = true;
        this.logger.info('Tracked add_payment_info event - credit card fields complete');
      } catch (error) {
        this.logger.warn('Failed to track add_payment_info event:', error);
      }
    }
  }

  private handleFieldFocus(fieldName: string): void {
    const field = fieldName === 'number' ? this.numberField : 
                  fieldName === 'cvv' ? this.cvvField : null;
                  
    if (field) {
      // Add focus class to the field container
      field.classList.add('next-focused', 'has-focus');
      
      // Find and focus the wrapper/container
      const wrapper = field.closest('.frm-flds, .form-group, .form-field, .field-group');
      if (wrapper) {
        wrapper.classList.add('next-focused', 'has-focus');
      }
      
      // Find and add focus to parent containers that might have borders
      const parentContainer = field.closest('.credit-card-field, .form-input-wrapper');
      if (parentContainer) {
        parentContainer.classList.add('next-focused', 'has-focus');
      }
      
      this.logger.debug(`Field focused: ${fieldName}`);
    }
  }

  private handleFieldBlur(fieldName: string): void {
    const field = fieldName === 'number' ? this.numberField : 
                  fieldName === 'cvv' ? this.cvvField : null;
                  
    if (field) {
      // Remove focus class from the field container
      field.classList.remove('next-focused', 'has-focus');
      
      // Find and remove focus from the wrapper/container
      const wrapper = field.closest('.frm-flds, .form-group, .form-field, .field-group');
      if (wrapper) {
        wrapper.classList.remove('next-focused', 'has-focus');
      }
      
      // Find and remove focus from parent containers
      const parentContainer = field.closest('.credit-card-field, .form-input-wrapper');
      if (parentContainer) {
        parentContainer.classList.remove('next-focused', 'has-focus');
      }
      
      this.logger.debug(`Field blurred: ${fieldName}`);
    }
  }

  private showSpreedlyErrors(errors: any[]): void {
    this.logger.info('[Spreedly] Showing errors:', errors);
    
    // Use the credit error container for all payment errors
    const errorContainer = document.querySelector('[data-next-component="credit-error"]');
    if (errorContainer instanceof HTMLElement) {
      const messageElement = errorContainer.querySelector('[data-next-component="credit-error-text"]');
      if (messageElement) {
        const errorMessages = errors.map(e => e.message).join('. ');
        messageElement.textContent = errorMessages;
        errorContainer.style.display = 'flex';
        errorContainer.classList.add('visible');
        
        this.logger.debug('[Spreedly] Error displayed with message:', errorMessages);
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
          if (errorContainer.style.display === 'flex') {
            errorContainer.style.display = 'none';
            errorContainer.classList.remove('visible');
            this.logger.debug('[Spreedly] Error auto-hidden after 10 seconds');
          }
        }, 10000);
      }
    } else {
      this.logger.error('[Spreedly] Could not find error container to display errors');
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
    
    this.logger.debug(`[Spreedly] Setting error for field: ${fieldType} - ${message}`);
    
    // Map field types to actual DOM selectors
    let selector: string | null = null;
    if (fieldType === 'number') {
      selector = '[data-next-checkout-field="cc-number"], #spreedly-number';
    } else if (fieldType === 'cvv') {
      selector = '[data-next-checkout-field="cvv"], #spreedly-cvv';
    } else if (fieldType === 'month') {
      selector = '[data-next-checkout-field="cc-month"], [data-next-checkout-field="exp-month"]';
    } else if (fieldType === 'year') {
      selector = '[data-next-checkout-field="cc-year"], [data-next-checkout-field="exp-year"]';
    }
    
    if (!selector) {
      this.logger.warn(`[Spreedly] No selector found for field type: ${fieldType}`);
      return;
    }
    
    // Find all matching fields
    const fields = document.querySelectorAll(selector);
    fields.forEach(field => {
      if (field instanceof HTMLElement) {
        // Add error classes to the field itself
        field.classList.remove('no-error');
        field.classList.add('has-error', 'next-error-field');
        
        // Find the parent wrapper (could be .form-group, .frm-flds, etc.)
        const wrapper = field.closest('.form-group, .frm-flds, .field-group');
        if (wrapper) {
          wrapper.classList.remove('addTick');
          wrapper.classList.add('has-error', 'addErrorIcon');
          
          // Remove any existing error labels
          const existingErrors = wrapper.querySelectorAll('.next-error-label');
          existingErrors.forEach(error => error.remove());
          
          // Add new error message
          const errorElement = document.createElement('div');
          errorElement.className = 'next-error-label';
          errorElement.setAttribute('role', 'alert');
          errorElement.setAttribute('aria-live', 'polite');
          errorElement.textContent = message;
          wrapper.appendChild(errorElement);
          
          this.logger.debug(`[Spreedly] Added error label: ${message}`);
        }
      }
    });
    
    // Note: We don't show the general payment error container here
    // That's only for submission failures, not real-time validation
  }

  private clearCreditCardFieldError(fieldType: keyof CreditCardValidationState): void {
    this.validationState[fieldType].hasError = false;
    delete this.validationState[fieldType].errorMessage;
    
    this.logger.debug(`[Spreedly] Clearing error for field: ${fieldType}`);
    
    // Map field types to actual DOM selectors
    let selector: string | null = null;
    if (fieldType === 'number') {
      selector = '[data-next-checkout-field="cc-number"], #spreedly-number';
    } else if (fieldType === 'cvv') {
      selector = '[data-next-checkout-field="cvv"], #spreedly-cvv';
    } else if (fieldType === 'month') {
      selector = '[data-next-checkout-field="cc-month"], [data-next-checkout-field="exp-month"]';
    } else if (fieldType === 'year') {
      selector = '[data-next-checkout-field="cc-year"], [data-next-checkout-field="exp-year"]';
    }
    
    if (!selector) {
      this.logger.warn(`[Spreedly] No selector found for field type: ${fieldType}`);
      return;
    }
    
    // Find all matching fields
    const fields = document.querySelectorAll(selector);
    fields.forEach(field => {
      if (field instanceof HTMLElement) {
        // Remove error classes from the field itself
        field.classList.remove('has-error', 'next-error-field');
        
        // Find the parent wrapper (could be .form-group, .frm-flds, etc.)
        const wrapper = field.closest('.form-group, .frm-flds, .field-group');
        if (wrapper) {
          wrapper.classList.remove('has-error', 'addErrorIcon');
          
          // Remove any error labels within the wrapper
          const errorLabels = wrapper.querySelectorAll('.next-error-label, .error-message, [role="alert"]');
          errorLabels.forEach(label => {
            this.logger.debug(`[Spreedly] Removing error label: ${label.textContent}`);
            label.remove();
          });
        }
      }
    });
    
    // Note: We don't hide payment error containers here because those are for
    // backend payment failures, not field validation errors
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