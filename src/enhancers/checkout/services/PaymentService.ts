/**
 * Payment Service - Updated to use CreditCardService
 */

import { useCheckoutStore } from '@/stores/checkoutStore';
import { CreditCardService, type CreditCardData } from './CreditCardService';
import { PAYMENT_METHOD_MAP } from '../constants/field-mappings';
import { PAYMENT_METHOD_SELECTOR } from '../constants/selectors';
import type { Logger } from '@/utils/logger';
// import { EventHandlerManager } from '../utils/event-handler-utils'; - removed unused import

// Phone input types
interface IntlTelInputInstance {
  destroy(): void;
  getNumber(): string;
  getNumberType(): number;
  getValidationError(): number;
  isValidNumber(): boolean;
  setCountry(countryCode: string): void;
  setNumber(number: string): void;
  getSelectedCountryData(): { iso2: string; [key: string]: any };
}

declare global {
  interface Window {
    intlTelInput: any;
    intlTelInputUtils: any;
  }
}

export interface ValidationResult {
  isValid: boolean;
  errors?: Record<string, string>;
  firstErrorField?: string;
}

export interface PaymentResult {
  success: boolean;
  token?: string;
  error?: string;
  paymentMethod?: string;
}

export class PaymentService {
  private form: HTMLFormElement;
  private creditCardService: CreditCardService | undefined;
  private phoneInputs: Map<string, IntlTelInputInstance> = new Map();
  private paymentButtons: Map<string, HTMLElement> = new Map();
  private isIntlTelInputAvailable = false;
  private uiService: any | undefined; // Reference to UIService for floating labels
  
  // Utility managers
  // eventManager removed - unused
  
  // Event handlers
  private paymentMethodChangeHandler?: (event: Event) => void;
  private expressCheckoutHandlers: Map<string, (event: Event) => void> = new Map();

  constructor(
    form: HTMLFormElement,
    private logger: Logger,
    private addClassCallback: (className: string) => void,
    private removeClassCallback: (className: string) => void,
    private emitCallback: (event: string, data: any) => void
  ) {
    this.form = form;
    // eventManager initialization removed
    this.checkIntlTelInputAvailability();
    this.scanPaymentButtons();
  }

  /**
   * Initialize the payment service
   */
  public async initialize(spreedlyEnvironmentKey?: string, debug: boolean = false): Promise<void> {
    // Initialize credit card service if key is available
    if (spreedlyEnvironmentKey) {
      await this.initializeCreditCardService(spreedlyEnvironmentKey, debug);
    }
    
    // Initialize phone inputs
    this.initializePhoneFields();
    
    // Setup payment event handlers
    this.setupPaymentEventHandlers();
    
    this.logger.debug('PaymentService initialized');
  }

  /**
   * Initialize credit card processing
   */
  private async initializeCreditCardService(spreedlyEnvironmentKey: string, _debug: boolean = false): Promise<void> {
    try {
      // Check if we have credit card fields
      const ccNumberField = document.querySelector('[data-next-checkout-field="cc-number"]') ||
                           document.querySelector('[os-checkout-field="cc-number"]');
      const cvvField = document.querySelector('[data-next-checkout-field="cvv"]') ||
                      document.querySelector('[os-checkout-field="cvv"]');
      
      if (!ccNumberField || !cvvField) {
        this.logger.debug('Credit card fields not found, skipping credit card service initialization');
        return;
      }
      
      this.addClassCallback('next-loading-spreedly');
      
      // Initialize credit card service
      this.creditCardService = new CreditCardService(spreedlyEnvironmentKey);
      
      // Set up callbacks
      this.creditCardService.setOnReady(() => {
        this.logger.debug('Credit card service is ready');
        this.removeClassCallback('next-loading-spreedly');
        this.emitCallback('checkout:spreedly-ready', {});
      });
      
      this.creditCardService.setOnError((errors) => {
        this.logger.error('Credit card errors:', errors);
        this.emitCallback('payment:error', { 
          errors,
          message: errors && errors.length > 0 ? errors.map((err: any) => err.message || err).join('. ') : 'Payment validation failed'
        });
      });
      
      this.creditCardService.setOnToken((token, pmData) => {
        console.log('🟢 [PaymentService] Token callback triggered with token:', token);
        this.logger.debug('Credit card tokenized:', token);
        this.handleTokenizedPayment(token, pmData);
      });
      
      // Initialize the service
      await this.creditCardService.initialize();
      
      // Connect floating label callbacks if UIService is available
      this.connectFloatingLabelCallbacks();
      
      this.logger.debug('Credit card service initialized successfully');
      
    } catch (error) {
      this.logger.error('Failed to initialize credit card service:', error);
      this.removeClassCallback('next-loading-spreedly');
      throw error;
    }
  }
  
  /**
   * Connect floating label callbacks between CreditCardService and UIService
   */
  private connectFloatingLabelCallbacks(): void {
    if (!this.creditCardService || !this.uiService) {
      return;
    }
    
    this.creditCardService.setFloatingLabelCallbacks(
      // Focus callback
      (fieldName: 'number' | 'cvv') => {
        if (this.uiService?.handleSpreedlyFieldFocus) {
          this.uiService.handleSpreedlyFieldFocus(fieldName);
        }
      },
      // Blur callback
      (fieldName: 'number' | 'cvv', hasValue: boolean) => {
        if (this.uiService?.handleSpreedlyFieldBlur) {
          this.uiService.handleSpreedlyFieldBlur(fieldName, hasValue);
        }
      },
      // Input callback
      (fieldName: 'number' | 'cvv', hasValue: boolean) => {
        if (this.uiService?.handleSpreedlyFieldInput) {
          this.uiService.handleSpreedlyFieldInput(fieldName, hasValue);
        }
      }
    );
    
    this.logger.debug('Connected floating label callbacks between CreditCardService and UIService');
  }

  /**
   * Check if intl-tel-input is available
   */
  private checkIntlTelInputAvailability(): void {
    this.isIntlTelInputAvailable = !!(window.intlTelInput && window.intlTelInputUtils);
    if (!this.isIntlTelInputAvailable) {
      this.logger.warn('intl-tel-input is not available. Make sure the library is loaded.');
    }
  }

  /**
   * Scan for payment buttons in the form
   */
  private scanPaymentButtons(): void {
    // Look for various payment buttons
    const paymentSelectors = [
      '[data-next-checkout="paypal"]',
      '[os-checkout="paypal"]',
      '[data-next-checkout="apple-pay"]',
      '[os-checkout="apple-pay"]',
      '[data-next-checkout="google-pay"]',
      '[os-checkout="google-pay"]',
      '[data-next-checkout="combo"]',
      '[os-checkout="combo"]'
    ];

    paymentSelectors.forEach(selector => {
      const button = this.form.querySelector(selector) as HTMLElement;
      if (button) {
        const method = this.extractPaymentMethod(selector);
        this.paymentButtons.set(method, button);
        this.logger.debug(`Found payment button: ${method}`);
      }
    });
  }

  /**
   * Extract payment method from selector
   */
  private extractPaymentMethod(selector: string): string {
    if (selector.includes('paypal')) return 'paypal';
    if (selector.includes('apple-pay')) return 'apple-pay';
    if (selector.includes('google-pay')) return 'google-pay';
    if (selector.includes('combo')) return 'combo';
    return 'unknown';
  }

  /**
   * Initialize phone input fields with intl-tel-input
   */
  public initializePhoneFields(
    shippingPhoneField?: HTMLElement,
    billingPhoneField?: HTMLElement,
    updateFormDataCallback?: (data: Record<string, any>) => void,
    updateBillingDataCallback?: (data: Record<string, any>) => void
  ): void {
    if (!this.isIntlTelInputAvailable) {
      this.logger.debug('Skipping phone field initialization - intl-tel-input not available');
      return;
    }

    // Auto-find fields if not provided
    if (!shippingPhoneField) {
      shippingPhoneField = (this.form.querySelector('[data-next-checkout-field="phone"]') ||
                          this.form.querySelector('[os-checkout-field="phone"]')) as HTMLElement | undefined;
    }

    if (!billingPhoneField) {
      billingPhoneField = (this.form.querySelector('[data-next-checkout-field="billing-phone"]') ||
                         this.form.querySelector('[os-checkout-field="billing-phone"]')) as HTMLElement | undefined;
    }

    // Initialize shipping phone field
    if (shippingPhoneField && shippingPhoneField instanceof HTMLInputElement) {
      this.initializePhoneInput('shipping', shippingPhoneField, updateFormDataCallback);
    }

    // Initialize billing phone field
    if (billingPhoneField && billingPhoneField instanceof HTMLInputElement) {
      this.initializeBillingPhoneInput(billingPhoneField, updateBillingDataCallback);
    }
  }

  /**
   * Initialize a single phone input field
   */
  private initializePhoneInput(
    type: 'shipping' | 'billing',
    phoneField: HTMLInputElement,
    updateCallback?: (data: Record<string, any>) => void
  ): void {
    try {
      // Destroy existing instance if it exists
      const existingInstance = this.phoneInputs.get(type);
      if (existingInstance) {
        existingInstance.destroy();
      }

      // Initialize intl-tel-input
      const instance = window.intlTelInput(phoneField, {
        separateDialCode: false,
        nationalMode: true,
        autoPlaceholder: 'aggressive',
        utilsScript: this.getUtilsScriptPath(),
        preferredCountries: ['us', 'ca', 'gb', 'au'],
        excludeCountries: [],
        onlyCountries: [],
        allowDropdown: false,
        initialCountry: 'us',
        customPlaceholder: (selectedCountryPlaceholder: string) => {
          return type === 'billing' ? `${selectedCountryPlaceholder} (Billing)` : selectedCountryPlaceholder;
        }
      });

      this.phoneInputs.set(type, instance);

      // Add event listeners
      phoneField.addEventListener('countrychange', () => {
        this.logger.debug(`${type} phone country changed`);
        if (updateCallback && instance) {
          const fullNumber = instance.getNumber();
          updateCallback({ phone: fullNumber });
        }
      });

      phoneField.addEventListener('input', () => {
        if (instance) {
          // Format the number as user types
          setTimeout(() => {
            try {
              const currentValue = phoneField.value;
              if (currentValue && window.intlTelInputUtils?.formatNumber) {
                const countryData = instance?.getSelectedCountryData();
                const countryCode = countryData?.iso2?.toUpperCase() || 'US';
                const formattedNumber = window.intlTelInputUtils.formatNumber(
                  currentValue,
                  countryCode,
                  window.intlTelInputUtils.numberFormat?.NATIONAL || 0
                );
                if (formattedNumber !== currentValue) {
                  phoneField.value = formattedNumber;
                }
              }
            } catch (error) {
              // Ignore formatting errors
            }
          }, 10);

          if (updateCallback) {
            const fullNumber = instance.getNumber();
            updateCallback({ phone: fullNumber });
          }
        }
      });

      phoneField.addEventListener('blur', () => {
        if (instance && updateCallback) {
          const fullNumber = instance.getNumber();
          updateCallback({ phone: fullNumber });
        }
      });

      this.logger.debug(`${type} phone field initialized with intl-tel-input`);

    } catch (error) {
      this.logger.error(`Failed to initialize ${type} phone field:`, error);
    }
  }

  /**
   * Initialize billing phone input (wrapper for consistency)
   */
  private initializeBillingPhoneInput(
    phoneField: HTMLInputElement,
    updateBillingDataCallback?: (data: Record<string, any>) => void
  ): void {
    this.initializePhoneInput('billing', phoneField, updateBillingDataCallback);
  }

  /**
   * Setup payment method selection
   */
  public setupPaymentMethod(method: string): void {
    const mappedMethod = PAYMENT_METHOD_MAP[method] || 'credit-card';
    
    // Update store
    const checkoutStore = useCheckoutStore.getState();
    checkoutStore.setPaymentMethod(mappedMethod as any);
    
    // Update UI visibility
    this.updatePaymentFormVisibility(method);
    
    this.logger.debug(`Payment method set to: ${mappedMethod}`);
  }

  /**
   * Update payment form visibility based on selected method
   */
  private updatePaymentFormVisibility(method: string): void {
    // Hide all payment forms first
    const paymentForms = this.form.querySelectorAll('[data-payment-form]');
    paymentForms.forEach(form => {
      (form as HTMLElement).style.display = 'none';
    });

    // Show the selected payment form
    const selectedForm = this.form.querySelector(`[data-payment-form="${method}"]`) as HTMLElement;
    if (selectedForm) {
      selectedForm.style.display = 'block';
    }

    // Special handling for credit card form
    if (method === 'credit-card' || method === 'card_token') {
      const creditCardForm = this.form.querySelector('[data-payment-form="credit-card"]') as HTMLElement;
      if (creditCardForm) {
        creditCardForm.style.display = 'block';
      }
    }

    // Hide all payment error messages when switching payment methods
    const paypalError = document.querySelector('[data-next-component="paypal-error"]') as HTMLElement;
    if (paypalError) {
      paypalError.style.display = 'none';
    }

    const creditError = document.querySelector('[data-next-component="credit-error"]') as HTMLElement;
    if (creditError) {
      creditError.style.display = 'none';
    }
  }

  /**
   * Validate payment data
   */
  public validatePaymentData(): ValidationResult {
    const checkoutStore = useCheckoutStore.getState();
    const errors: Record<string, string> = {};
    let firstErrorField: string | undefined;

    // Validate credit card fields if credit card payment is selected
    if (checkoutStore.paymentMethod === 'credit-card' || checkoutStore.paymentMethod === 'card_token') {
      // Validate credit card service is ready
      if (this.creditCardService && !this.creditCardService.ready) {
        errors['general'] = 'Payment system is not ready. Please wait and try again.';
        if (!firstErrorField) firstErrorField = 'general';
      }
      
      // Note: The actual credit card validation (month/year) is handled by 
      // CheckoutValidator which calls CreditCardService.validateCreditCard()
    }

    // Validate phone numbers
    const phoneValidation = this.validatePhoneNumbers();
    if (!phoneValidation.isValid && phoneValidation.errors) {
      Object.assign(errors, phoneValidation.errors);
      if (!firstErrorField && phoneValidation.firstErrorField) {
        firstErrorField = phoneValidation.firstErrorField;
      }
    }

    const hasErrors = Object.keys(errors).length > 0;
    return {
      isValid: !hasErrors,
      ...(hasErrors && { errors }),
      ...(firstErrorField && { firstErrorField })
    };
  }

  /**
   * Validate phone numbers
   */
  private validatePhoneNumbers(): ValidationResult {
    if (!this.isIntlTelInputAvailable) {
      return { isValid: true }; // Skip validation if library not available
    }

    const errors: Record<string, string> = {};
    let firstErrorField: string | undefined;

    // Validate shipping phone
    const shippingInstance = this.phoneInputs.get('shipping');
    if (shippingInstance) {
      try {
        if (!shippingInstance.isValidNumber()) {
          errors['phone'] = 'Please enter a valid phone number';
          if (!firstErrorField) firstErrorField = 'phone';
        }
      } catch (error) {
        this.logger.error('Shipping phone validation error:', error);
      }
    }

    // Validate billing phone
    const billingInstance = this.phoneInputs.get('billing');
    if (billingInstance) {
      try {
        if (!billingInstance.isValidNumber()) {
          errors['billing-phone'] = 'Please enter a valid billing phone number';
          if (!firstErrorField) firstErrorField = 'billing-phone';
        }
      } catch (error) {
        this.logger.error('Billing phone validation error:', error);
      }
    }

    const hasErrors = Object.keys(errors).length > 0;
    return {
      isValid: !hasErrors,
      ...(hasErrors && { errors }),
      ...(firstErrorField && { firstErrorField })
    };
  }

  /**
   * Submit payment (tokenize credit card)
   */
  public async submitPayment(): Promise<PaymentResult> {
    try {
      const checkoutStore = useCheckoutStore.getState();
      
      // Handle credit card payments
      if (checkoutStore.paymentMethod === 'credit-card' || checkoutStore.paymentMethod === 'card_token') {
        if (!this.creditCardService || !this.creditCardService.ready) {
          throw new Error('Payment system is not ready. Please refresh the page and try again.');
        }

        const cardData = this.getCardDataFromForm();
        await this.creditCardService.tokenizeCard(cardData);
        
        // Return pending result - actual result will come through callback
        return {
          success: true,
          paymentMethod: checkoutStore.paymentMethod
        };
      }

      // Handle other payment methods
      return {
        success: true,
        paymentMethod: checkoutStore.paymentMethod
      };

    } catch (error) {
      this.logger.error('Payment submission failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed'
      };
    }
  }

  /**
   * Handle express checkout
   */
  public async handleExpressCheckout(method: string): Promise<void> {
    try {
      this.logger.debug(`Starting express checkout with method: ${method}`);
      
      const checkoutStore = useCheckoutStore.getState();
      
      // Set processing state
      checkoutStore.setProcessing(true);
      checkoutStore.setPaymentMethod(method as any);
      
      // Emit express checkout event
      this.emitCallback('checkout:express-started', { method });
      
      // For now, just emit success - actual implementation would depend on payment provider
      this.emitCallback('checkout:express-completed', { 
        method,
        success: true 
      });
      
    } catch (error) {
      this.logger.error(`Express checkout failed for ${method}:`, error);
      this.emitCallback('checkout:express-failed', { 
        method, 
        error: error instanceof Error ? error.message : 'Express checkout failed' 
      });
      throw error;
    }
  }

  /**
   * Format phone number for a specific input
   */
  public formatPhoneNumber(input: HTMLInputElement): void {
    if (!this.isIntlTelInputAvailable) return;

    const inputType = input.getAttribute('data-next-checkout-field') || input.getAttribute('os-checkout-field');
    let instance: IntlTelInputInstance | undefined;

    if (inputType === 'phone') {
      instance = this.phoneInputs.get('shipping');
    } else if (inputType === 'billing-phone') {
      instance = this.phoneInputs.get('billing');
    }

    if (instance && input.value) {
      try {
        if (window.intlTelInputUtils?.formatNumber) {
          const countryData = instance.getSelectedCountryData();
          const countryCode = countryData?.iso2?.toUpperCase() || 'US';
          const formattedNumber = window.intlTelInputUtils.formatNumber(
            input.value,
            countryCode,
            window.intlTelInputUtils.numberFormat?.NATIONAL || 0
          );
          input.value = formattedNumber;
        }
      } catch (error) {
        this.logger.error('Error formatting phone number:', error);
      }
    }
  }

  /**
   * Sync phone country with address country
   */
  public syncPhoneCountryWithAddressCountry(
    addressCountryCode: string,
    isShipping: boolean = true
  ): void {
    if (!this.isIntlTelInputAvailable) return;

    try {
      const phoneInstance = this.phoneInputs.get(isShipping ? 'shipping' : 'billing');
      const fieldType = isShipping ? 'shipping' : 'billing';

      if (phoneInstance && addressCountryCode) {
        const countryCode = addressCountryCode.toLowerCase();
        phoneInstance.setCountry(countryCode);
        this.logger.debug(`${fieldType} phone country synced to: ${countryCode}`);
      }
    } catch (error) {
      this.logger.error(`Failed to sync ${isShipping ? 'shipping' : 'billing'} phone country:`, error);
    }
  }

  /**
   * Set phone number programmatically
   */
  public setPhoneNumber(phoneNumber: string, isShipping: boolean = true): void {
    if (!this.isIntlTelInputAvailable) return;

    const phoneInstance = this.phoneInputs.get(isShipping ? 'shipping' : 'billing');
    const fieldType = isShipping ? 'shipping' : 'billing';

    if (!phoneInstance) return;

    try {
      phoneInstance.setNumber(phoneNumber);
      this.logger.debug(`${fieldType} phone number set to:`, phoneNumber);
    } catch (error) {
      this.logger.error(`Failed to set ${fieldType} phone number:`, error);
    }
  }

  /**
   * Get formatted phone number
   */
  public getFormattedPhoneNumber(isShipping: boolean = true): string {
    if (!this.isIntlTelInputAvailable) return '';

    const phoneInstance = this.phoneInputs.get(isShipping ? 'shipping' : 'billing');

    if (!phoneInstance) return '';

    try {
      return phoneInstance.getNumber();
    } catch (error) {
      this.logger.error(`Failed to get formatted ${isShipping ? 'shipping' : 'billing'} phone number:`, error);
      return '';
    }
  }

  /**
   * Setup payment event handlers
   */
  private setupPaymentEventHandlers(): void {
    // Payment method change handler
    this.paymentMethodChangeHandler = this.handlePaymentMethodChange.bind(this);
    const paymentRadios = this.form.querySelectorAll(PAYMENT_METHOD_SELECTOR);
    paymentRadios.forEach(radio => {
      radio.addEventListener('change', this.paymentMethodChangeHandler!);
    });

    // Express checkout button handlers
    this.paymentButtons.forEach((button, method) => {
      if (method !== 'combo') { // combo is the main submit button
        const handler = (event: Event) => {
          event.preventDefault();
          this.handleExpressCheckout(method);
        };
        this.expressCheckoutHandlers.set(method, handler);
        button.addEventListener('click', handler);
      }
    });
  }

  /**
   * Handle payment method change
   */
  private handlePaymentMethodChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.setupPaymentMethod(target.value);
  }

  /**
   * Handle tokenized payment callback
   */
  private handleTokenizedPayment(token: string, pmData: any): void {
    console.log('🟢 [PaymentService] handleTokenizedPayment called with token:', token);
    this.logger.debug('Payment tokenized successfully:', token);
    
    const checkoutStore = useCheckoutStore.getState();
    checkoutStore.setPaymentToken(token);
    
    console.log('🟢 [PaymentService] Emitting payment:tokenized event');
    
    // Emit event for further processing
    this.emitCallback('payment:tokenized', { 
      token, 
      pmData,
      paymentMethod: checkoutStore.paymentMethod 
    });
    
    console.log('🟢 [PaymentService] payment:tokenized event emitted');
  }

  /**
   * Get card data from form
   */
  private getCardDataFromForm(): CreditCardData {
    const checkoutStore = useCheckoutStore.getState();
    const formData = checkoutStore.formData;
    
    return {
      full_name: `${formData.fname || ''} ${formData.lname || ''}`.trim(),
      month: formData['cc-month'] || formData['exp-month'] || '',
      year: formData['cc-year'] || formData['exp-year'] || ''
    };
  }

  /**
   * Get utils script path for intl-tel-input
   */
  private getUtilsScriptPath(): string {
    const possiblePaths = [
      'https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js',
      '/node_modules/intl-tel-input/build/js/utils.js',
      '/assets/js/utils.js'
    ];

    return possiblePaths[0] || '';
  }

  /**
   * Check if credit card service is ready
   */
  public isCreditCardReady(): boolean {
    return this.creditCardService?.ready || false;
  }

  /**
   * Get credit card service for validator integration
   */
  public getCreditCardService(): CreditCardService | undefined {
    return this.creditCardService;
  }
  
  /**
   * Set UIService reference for floating label integration
   */
  public setUIService(uiService: any): void {
    this.uiService = uiService;
    // If credit card service is already initialized, connect the callbacks
    if (this.creditCardService) {
      this.connectFloatingLabelCallbacks();
    }
  }

  /**
   * Update configuration
   */
  public async handleConfigUpdate(configState: any): Promise<void> {
    // Check if Spreedly environment key has been updated
    if (configState.spreedlyEnvironmentKey) {
      await this.initializeCreditCardService(
        configState.spreedlyEnvironmentKey,
        configState.debug || false
      );
    }

    // Re-check intl-tel-input availability
    this.checkIntlTelInputAvailability();
  }

  /**
   * Update service (re-scan for new elements)
   */
  public update(): void {
    this.checkIntlTelInputAvailability();
    this.scanPaymentButtons();
    this.initializePhoneFields();
  }

  /**
   * Cleanup and destroy
   */
  public destroy(): void {
    try {
      // Cleanup credit card service
      if (this.creditCardService) {
        this.creditCardService.destroy();
      }
      this.creditCardService = undefined;

      // Cleanup phone inputs
      this.phoneInputs.forEach((instance, type) => {
        try {
          instance.destroy();
        } catch (error) {
          this.logger.error(`Error destroying ${type} phone input:`, error);
        }
      });
      this.phoneInputs.clear();

      // Cleanup event handlers
      if (this.paymentMethodChangeHandler) {
        const paymentRadios = this.form.querySelectorAll(PAYMENT_METHOD_SELECTOR);
        paymentRadios.forEach(radio => {
          radio.removeEventListener('change', this.paymentMethodChangeHandler!);
        });
      }

      // Cleanup express checkout handlers
      this.expressCheckoutHandlers.forEach((handler, method) => {
        const button = this.paymentButtons.get(method);
        if (button) {
          button.removeEventListener('click', handler);
        }
      });
      this.expressCheckoutHandlers.clear();

      this.paymentButtons.clear();

      this.logger.debug('PaymentService destroyed');
    } catch (error) {
      this.logger.error('Error destroying PaymentService:', error);
    }
  }
}