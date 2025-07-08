/**
 * Checkout Form Enhancer - Consolidated but complete functionality using CheckoutValidator
 */

import { BaseEnhancer } from '@/enhancers/base/BaseEnhancer';
import { useCheckoutStore, type CheckoutState } from '@/stores/checkoutStore';
import { useCartStore } from '@/stores/cartStore';
import { useConfigStore } from '@/stores/configStore';
import { ApiClient } from '@/api/client';
import { CountryService, type Country, type CountryConfig } from '@/utils/countryService';
import type { CartState } from '@/types/global';
import { sentryManager } from '@/utils/monitoring/SentryManager';
import { CreditCardService, type CreditCardData } from './services/CreditCardService';
import { CheckoutValidator } from './validation/CheckoutValidator';
import { UIService } from './services/UIService';
import { useAttributionStore } from '@/stores/attributionStore';
import type { CreateOrder, Address, Payment, Attribution, PaymentMethod } from '@/types/api';

// Consolidated constants
const FIELD_SELECTORS = ['[data-next-checkout-field]', '[os-checkout-field]'] as const;
const BILLING_CONTAINER_SELECTOR = '[os-checkout-element="different-billing-address"]';
const SHIPPING_FORM_SELECTOR = '[os-checkout-component="shipping-form"]';
const BILLING_FORM_CONTAINER_SELECTOR = '[os-checkout-component="billing-form"]';

const PAYMENT_METHOD_MAP: Record<string, 'card_token' | 'paypal' | 'apple_pay' | 'google_pay' | 'credit-card'> = {
  'credit': 'credit-card',
  'paypal': 'paypal',
  'apple-pay': 'apple_pay',
  'google-pay': 'google_pay'
};

const API_PAYMENT_METHOD_MAP: Record<string, PaymentMethod> = {
  'credit-card': 'card_token',
  'card_token': 'card_token',
  'paypal': 'paypal',
  'apple_pay': 'apple_pay',
  'google_pay': 'google_pay'
};

const BILLING_FIELD_MAPPING: Record<string, string> = {
  'fname': 'billing-fname',
  'lname': 'billing-lname',
  'address1': 'billing-address1',
  'address2': 'billing-address2',
  'city': 'billing-city',
  'province': 'billing-province',
  'postal': 'billing-postal',
  'country': 'billing-country',
  'phone': 'billing-phone'
};

const BILLING_ADDRESS_FIELD_MAP: Record<string, string> = {
  'fname': 'first_name',
  'lname': 'last_name',
  'address1': 'address1',
  'address2': 'address2',
  'city': 'city',
  'province': 'province',
  'postal': 'postal',
  'country': 'country',
  'phone': 'phone'
};

export class CheckoutFormEnhancer extends BaseEnhancer {
  private form!: HTMLFormElement;
  private apiClient!: ApiClient;
  private countryService!: CountryService;
  private creditCardService?: CreditCardService;
  private validator!: CheckoutValidator;
  private ui!: UIService;
  
  // Field collections
  private fields: Map<string, HTMLElement> = new Map();
  private billingFields: Map<string, HTMLElement> = new Map();
  private paymentButtons: Map<string, HTMLElement> = new Map();
  
  // Country/State management
  private countries: Country[] = [];
  private countryConfigs: Map<string, CountryConfig> = new Map();
  private currentCountryConfig?: CountryConfig;
  
  // Phone input management
  private phoneInputs: Map<string, any> = new Map();
  private isIntlTelInputAvailable = false;
  
  // Event handlers
  private submitHandler?: (event: Event) => void;
  private changeHandler?: (event: Event) => void;
  private paymentMethodChangeHandler?: (event: Event) => void;
  private shippingMethodChangeHandler?: (event: Event) => void;
  private billingAddressToggleHandler?: (event: Event) => void;
  private boundHandleTestDataFilled?: EventListener;
  private boundHandleKonamiActivation?: EventListener;

  public async initialize(): Promise<void> {
    this.validateElement();
    
    if (!(this.element instanceof HTMLFormElement)) {
      throw new Error('CheckoutFormEnhancer must be applied to a form element');
    }
    
    this.form = this.element;
    this.form.noValidate = true;
    
    // Initialize core dependencies
    const config = useConfigStore.getState();
    this.apiClient = new ApiClient(config.apiKey);
    this.countryService = CountryService.getInstance();
    
    // Initialize validator
    this.validator = new CheckoutValidator(
      this.logger,
      this.countryService,
      undefined // PhoneInputManager will be handled by us
    );
    
    // Check for phone input library
    this.isIntlTelInputAvailable = !!(window as any).intlTelInput && !!(window as any).intlTelInputUtils;
    
    // Scan for all fields and buttons
    this.scanAllFields();
    
    // Setup billing form (clone from shipping if needed)
    const billingFormCloned = this.setupBillingForm();
    if (billingFormCloned) {
      this.scanBillingFields(); // Re-scan after cloning
    }
    
    // Initialize UI service
    this.ui = new UIService(
      this.form,
      this.fields,
      this.logger,
      this.billingFields
    );
    this.ui.initialize();
    
    // Initialize credit card service
    if (config.spreedlyEnvironmentKey) {
      await this.initializeCreditCard(config.spreedlyEnvironmentKey, config.debug);
    }
    
    // Initialize address/country functionality
    await this.initializeAddressManagement(config);
    
    // Initialize phone inputs
    this.initializePhoneInputs();
    
    // Populate expiration fields
    this.populateExpirationFields();
    
    // Setup event handlers
    this.setupEventHandlers();
    
    // Subscribe to store changes
    this.subscribe(useCheckoutStore, this.handleCheckoutUpdate.bind(this));
    this.subscribe(useCartStore, this.handleCartUpdate.bind(this));
    this.subscribe(useConfigStore, this.handleConfigUpdate.bind(this));
    
    // Setup debug event listeners
    this.boundHandleTestDataFilled = this.handleTestDataFilled.bind(this);
    this.boundHandleKonamiActivation = this.handleKonamiActivation.bind(this);
    document.addEventListener('checkout:test-data-filled', this.boundHandleTestDataFilled as EventListener);
    document.addEventListener('next:test-mode-activated', this.boundHandleKonamiActivation as EventListener);
    
    // Initialize form with existing data
    this.populateFormData();
    
    this.logger.debug('CheckoutFormEnhancer initialized');
    this.emit('checkout:form-initialized', { form: this.form });
  }

  // ============================================================================
  // FIELD SCANNING AND MANAGEMENT
  // ============================================================================

  private scanAllFields(): void {
    // Scan checkout fields
    FIELD_SELECTORS.forEach(selector => {
      this.form.querySelectorAll(selector).forEach(element => {
        const fieldName = element.getAttribute(selector.includes('data-next') ? 'data-next-checkout-field' : 'os-checkout-field');
        if (fieldName && element instanceof HTMLElement) {
          this.fields.set(fieldName, element);
        }
      });
    });

    // Scan payment buttons
    const paymentSelectors = [
      '[data-next-checkout-payment]',
      '[os-checkout-payment]'
    ];
    paymentSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(element => {
        const paymentMethod = element.getAttribute(selector.includes('data-next') ? 'data-next-checkout-payment' : 'os-checkout-payment');
        if (paymentMethod && element instanceof HTMLElement) {
          this.paymentButtons.set(paymentMethod, element);
        }
      });
    });

    // Scan for expiration fields and add them if not found
    this.scanExpirationFields();
  }

  private scanBillingFields(): void {
    const billingSelectors = [
      '[os-checkout-field^="billing-"]',
      '[data-next-checkout-field^="billing-"]'
    ];
    billingSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(element => {
        const fieldName = element.getAttribute('os-checkout-field') || 
                         element.getAttribute('data-next-checkout-field');
        if (fieldName && element instanceof HTMLElement) {
          this.billingFields.set(fieldName, element);
        }
      });
    });
  }

  private scanExpirationFields(): void {
    const monthSelectors = [
      '[data-next-checkout-field="cc-month"]',
      '[data-next-checkout-field="exp-month"]', 
      '[os-checkout-field="cc-month"]',
      '[os-checkout-field="exp-month"]',
      '#credit_card_exp_month'
    ];
    
    const yearSelectors = [
      '[data-next-checkout-field="cc-year"]',
      '[data-next-checkout-field="exp-year"]',
      '[os-checkout-field="cc-year"]', 
      '[os-checkout-field="exp-year"]',
      '#credit_card_exp_year'
    ];

    const monthField = monthSelectors
      .map(selector => document.querySelector(selector))
      .find(element => element !== null) as HTMLElement | null;
    
    const yearField = yearSelectors
      .map(selector => document.querySelector(selector))
      .find(element => element !== null) as HTMLElement | null;

    if (monthField) {
      const hasExpMonth = monthField.getAttribute('data-next-checkout-field') === 'exp-month' ||
                         monthField.getAttribute('os-checkout-field') === 'exp-month';
      
      if (hasExpMonth && !this.fields.has('exp-month')) {
        this.fields.set('exp-month', monthField);
      } else if (!hasExpMonth && !this.fields.has('cc-month') && !this.fields.has('exp-month')) {
        this.fields.set('cc-month', monthField);
      }
    }

    if (yearField) {
      const hasExpYear = yearField.getAttribute('data-next-checkout-field') === 'exp-year' ||
                        yearField.getAttribute('os-checkout-field') === 'exp-year';
      
      if (hasExpYear && !this.fields.has('exp-year')) {
        this.fields.set('exp-year', yearField);
      } else if (!hasExpYear && !this.fields.has('cc-year') && !this.fields.has('exp-year')) {
        this.fields.set('cc-year', yearField);
      }
    }
  }

  private populateExpirationFields(): void {
    const monthField = this.fields.get('cc-month') || this.fields.get('exp-month');
    const yearField = this.fields.get('cc-year') || this.fields.get('exp-year');

    if (monthField instanceof HTMLSelectElement) {
      monthField.innerHTML = '<option value="">Month</option>';
      for (let i = 1; i <= 12; i++) {
        const month = i.toString().padStart(2, '0');
        const option = document.createElement('option');
        option.value = month;
        option.textContent = month;
        monthField.appendChild(option);
      }
    }

    if (yearField instanceof HTMLSelectElement) {
      yearField.innerHTML = '<option value="">Year</option>';
      const currentYear = new Date().getFullYear();
      for (let i = 0; i < 20; i++) {
        const year = currentYear + i;
        const option = document.createElement('option');
        option.value = year.toString();
        option.textContent = year.toString();
        yearField.appendChild(option);
      }
    }
  }

  // ============================================================================
  // BILLING FORM MANAGEMENT
  // ============================================================================

  private setupBillingForm(): boolean {
    const billingContainer = document.querySelector(BILLING_CONTAINER_SELECTOR);
    if (!billingContainer) return false;

    const shippingForm = document.querySelector(SHIPPING_FORM_SELECTOR);
    if (!shippingForm) return false;

    const billingFormContainer = billingContainer.querySelector(BILLING_FORM_CONTAINER_SELECTOR);
    if (!billingFormContainer) return false;

    const billingForm = shippingForm.cloneNode(true) as HTMLElement;
    this.convertShippingFieldsToBilling(billingForm);
    
    billingFormContainer.innerHTML = '';
    billingFormContainer.appendChild(billingForm);
    
    this.setInitialBillingFormState();
    return true;
  }

  private convertShippingFieldsToBilling(billingForm: HTMLElement): void {
    // Update data-next-checkout-field attributes
    billingForm.querySelectorAll('[data-next-checkout-field]').forEach(field => {
      const currentValue = field.getAttribute('data-next-checkout-field');
      if (currentValue && !currentValue.startsWith('billing-')) {
        field.setAttribute('data-next-checkout-field', `billing-${currentValue}`);
      }
    });

    // Update os-checkout-field attributes
    billingForm.querySelectorAll('[os-checkout-field]').forEach(field => {
      const currentValue = field.getAttribute('os-checkout-field');
      if (currentValue && !currentValue.startsWith('billing-')) {
        field.setAttribute('os-checkout-field', `billing-${currentValue}`);
      }
    });

    // Update name and id attributes
    billingForm.querySelectorAll('input, select, textarea').forEach(field => {
      const element = field as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
      
      if (element.name && !element.name.startsWith('billing_')) {
        element.name = element.name.startsWith('shipping_') 
          ? element.name.replace('shipping_', 'billing_')
          : `billing_${element.name}`;
      }
      
      if (element.id && !element.id.startsWith('billing_')) {
        element.id = element.id.startsWith('shipping_') 
          ? element.id.replace('shipping_', 'billing_')
          : `billing_${element.id}`;
      }
      
      // Clear values
      if (element.type === 'checkbox' || element.type === 'radio') {
        (element as HTMLInputElement).checked = false;
      } else {
        element.value = '';
      }
    });
  }

  private setInitialBillingFormState(): void {
    const billingToggle = this.form.querySelector('input[name="use_shipping_address"]') as HTMLInputElement;
    const billingSection = document.querySelector(BILLING_CONTAINER_SELECTOR) as HTMLElement;
    
    if (billingToggle && billingSection) {
      if (billingToggle.checked) {
        this.collapseBillingForm(billingSection);
      } else {
        this.expandBillingForm(billingSection);
      }
    }
  }

  private expandBillingForm(billingSection: HTMLElement): void {
    billingSection.style.transition = 'none';
    billingSection.style.height = 'auto';
    const fullHeight = billingSection.offsetHeight;
    
    billingSection.style.height = '0';
    billingSection.offsetHeight;
    
    billingSection.style.transition = 'height 0.3s ease-in-out, padding 0.3s ease-in-out, margin-top 0.3s ease-in-out';
    billingSection.style.height = `${fullHeight}px`;
    billingSection.style.padding = '20px 2px';
    billingSection.style.marginTop = '20px';
    billingSection.style.overflow = 'visible';
    
    setTimeout(() => {
      billingSection.style.height = 'auto';
    }, 300);
    
    billingSection.classList.add('billing-form-expanded');
    billingSection.classList.remove('billing-form-collapsed');
  }

  private collapseBillingForm(billingSection: HTMLElement): void {
    const currentHeight = billingSection.offsetHeight;
    
    billingSection.style.height = `${currentHeight}px`;
    billingSection.style.overflow = 'hidden';
    billingSection.offsetHeight;
    
    billingSection.style.transition = 'height 0.3s ease-in-out, padding 0.3s ease-in-out, margin-top 0.3s ease-in-out';
    billingSection.style.height = '0';
    billingSection.style.padding = '2px';
    billingSection.style.marginTop = '0';
    
    billingSection.classList.add('billing-form-collapsed');
    billingSection.classList.remove('billing-form-expanded');
  }

  private copyShippingToBilling(): void {
    const checkoutStore = useCheckoutStore.getState();
    const shippingData = checkoutStore.formData;
    
    const billingAddress = {
      first_name: shippingData.fname || '',
      last_name: shippingData.lname || '',
      address1: shippingData.address1 || '',
      address2: shippingData.address2,
      city: shippingData.city || '',
      province: shippingData.province || '',
      postal: shippingData.postal || '',
      country: shippingData.country || '',
      phone: shippingData.phone || ''
    };
    checkoutStore.setBillingAddress(billingAddress);
    
    Object.entries(BILLING_FIELD_MAPPING).forEach(([shippingField, billingField]) => {
      const shippingValue = shippingData[shippingField];
      const billingElement = this.billingFields.get(billingField);
      
      if (shippingValue && billingElement) {
        if (billingElement instanceof HTMLInputElement || billingElement instanceof HTMLSelectElement) {
          billingElement.value = shippingValue;
        }
      }
    });
  }

  // ============================================================================
  // ADDRESS AND COUNTRY MANAGEMENT
  // ============================================================================

  private async initializeAddressManagement(config: any): Promise<void> {
    try {
      this.addClass('next-loading-countries');
      
      if (config.addressConfig) {
        this.countryService.setConfig(config.addressConfig);
      }
      
      const locationData = await this.countryService.getLocationData();
      this.countries = locationData.countries;
      
      const countryField = this.fields.get('country');
      if (countryField instanceof HTMLSelectElement) {
        this.populateCountryDropdown(countryField, locationData.countries, locationData.detectedCountryCode);
        
        if (locationData.detectedCountryCode) {
          this.updateFormData({ country: locationData.detectedCountryCode });
          this.clearError('country');
        }
      }
      
      this.countryConfigs.set(locationData.detectedCountryCode, locationData.detectedCountryConfig);
      
      if (locationData.detectedCountryCode) {
        const provinceField = this.fields.get('province');
        if (provinceField instanceof HTMLSelectElement) {
          await this.updateStateOptions(locationData.detectedCountryCode, provinceField);
          this.currentCountryConfig = locationData.detectedCountryConfig;
        }
        this.updateFormLabels(locationData.detectedCountryConfig);
      }
      
      if (this.billingFields.size > 0) {
        this.populateBillingCountryDropdown();
      }
      
    } catch (error) {
      this.logger.error('Failed to load country data:', error);
    } finally {
      this.removeClass('next-loading-countries');
    }
  }

  private populateCountryDropdown(countrySelect: HTMLSelectElement, countries: Country[], defaultCountry?: string): void {
    const firstOption = countrySelect.options[0];
    countrySelect.innerHTML = '';
    if (firstOption && !firstOption.value) {
      firstOption.disabled = true;
      countrySelect.appendChild(firstOption);
    }
    
    countries.forEach(country => {
      const option = document.createElement('option');
      option.value = country.code;
      option.textContent = country.name;
      if (country.code === defaultCountry) {
        option.selected = true;
      }
      countrySelect.appendChild(option);
    });
    
    if (defaultCountry) {
      countrySelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  private populateBillingCountryDropdown(): void {
    const billingCountryField = this.billingFields.get('billing-country');
    if (!(billingCountryField instanceof HTMLSelectElement)) return;
    
    const firstOption = billingCountryField.options[0];
    billingCountryField.innerHTML = '';
    if (firstOption && !firstOption.value) {
      firstOption.disabled = true;
      billingCountryField.appendChild(firstOption);
    }
    
    this.countries.forEach(country => {
      const option = document.createElement('option');
      option.value = country.code;
      option.textContent = country.name;
      billingCountryField.appendChild(option);
    });
  }

  private async updateStateOptions(country: string, provinceField: HTMLSelectElement): Promise<void> {
    provinceField.disabled = true;
    const originalHTML = provinceField.innerHTML;
    provinceField.innerHTML = '<option value="">Loading...</option>';
    
    try {
      const countryData = await this.countryService.getCountryStates(country);
      this.countryConfigs.set(country, countryData.countryConfig);
      
      const hasStates = countryData.states && countryData.states.length > 0;
      const stateRequired = countryData.countryConfig.stateRequired;
      
      const provinceContainer = provinceField.closest('.frm-flds, .form-group, .form-field, .field-group') || provinceField.parentElement;
      
      if (!stateRequired && !hasStates) {
        if (provinceContainer) {
          (provinceContainer as HTMLElement).style.display = 'none';
        }
        provinceField.removeAttribute('required');
        this.updateFormData({ province: '' });
        this.clearError('province');
        return;
      }
      
      if (provinceContainer) {
        (provinceContainer as HTMLElement).style.display = '';
      }
      
      provinceField.innerHTML = '';
      
      const placeholderOption = document.createElement('option');
      placeholderOption.value = '';
      placeholderOption.textContent = `Select ${countryData.countryConfig.stateLabel}`;
      placeholderOption.disabled = true;
      placeholderOption.selected = true;
      provinceField.appendChild(placeholderOption);
      
      countryData.states.forEach((state: any) => {
        const option = document.createElement('option');
        option.value = state.code;
        option.textContent = state.name;
        provinceField.appendChild(option);
      });
      
      if (countryData.countryConfig.stateRequired) {
        provinceField.setAttribute('required', 'required');
      } else {
        provinceField.removeAttribute('required');
      }
      
      this.updateFormData({ province: '' });
      this.clearError('province');
      provinceField.value = '';
      
      if (countryData.states.length > 0 && countryData.countryConfig.stateRequired) {
        const firstState = countryData.states[0];
        if (firstState) {
          provinceField.value = firstState.code;
          this.updateFormData({ province: firstState.code });
          this.clearError('province');
          provinceField.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
      
    } catch (error) {
      this.logger.error('Failed to load states:', error);
      provinceField.innerHTML = originalHTML;
    } finally {
      provinceField.disabled = false;
    }
  }

  private updateFormLabels(countryConfig: CountryConfig): void {
    const stateLabel = this.form.querySelector('label[for*="province"], label[for*="state"]');
    if (stateLabel) {
      const isRequired = countryConfig.stateRequired ? ' *' : '';
      stateLabel.textContent = countryConfig.stateLabel + isRequired;
    }
    
    const postalLabel = this.form.querySelector('label[for*="postal"], label[for*="zip"]');
    if (postalLabel) {
      postalLabel.textContent = countryConfig.postcodeLabel + ' *';
    }
    
    const postalField = this.fields.get('postal');
    if (postalField instanceof HTMLInputElement && countryConfig.postcodeExample) {
      postalField.placeholder = countryConfig.postcodeExample;
    }
  }

  // ============================================================================
  // PHONE INPUT MANAGEMENT
  // ============================================================================

  private initializePhoneInputs(): void {
    if (!this.isIntlTelInputAvailable) return;

    const shippingPhoneField = this.fields.get('phone');
    const billingPhoneField = this.billingFields.get('billing-phone');

    if (shippingPhoneField instanceof HTMLInputElement) {
      this.initializePhoneInput('shipping', shippingPhoneField);
    }

    if (billingPhoneField instanceof HTMLInputElement) {
      this.initializePhoneInput('billing', billingPhoneField);
    }
  }

  private initializePhoneInput(type: 'shipping' | 'billing', phoneField: HTMLInputElement): void {
    try {
      const existingInstance = this.phoneInputs.get(type);
      if (existingInstance) {
        existingInstance.destroy();
      }

      const instance = (window as any).intlTelInput(phoneField, {
        separateDialCode: false,
        nationalMode: true,
        autoPlaceholder: 'aggressive',
        utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js',
        preferredCountries: ['us', 'ca', 'gb', 'au'],
        allowDropdown: false,
        initialCountry: 'us'
      });

      this.phoneInputs.set(type, instance);

      phoneField.addEventListener('input', () => {
        if (instance) {
          const fullNumber = instance.getNumber();
          if (type === 'shipping') {
            this.updateFormData({ phone: fullNumber });
          } else {
            const checkoutStore = useCheckoutStore.getState();
            const currentBillingData = checkoutStore.billingAddress || {
              first_name: '', last_name: '', address1: '', city: '', province: '', postal: '', country: '', phone: ''
            };
            checkoutStore.setBillingAddress({ ...currentBillingData, phone: fullNumber });
          }
        }
      });

    } catch (error) {
      this.logger.error(`Failed to initialize ${type} phone field:`, error);
    }
  }

  // ============================================================================
  // CREDIT CARD MANAGEMENT
  // ============================================================================

  private async initializeCreditCard(environmentKey: string, _debug: boolean): Promise<void> {
    try {
      this.addClass('next-loading-spreedly');
      
      this.creditCardService = new CreditCardService(environmentKey);
      
      this.creditCardService.setOnReady(() => {
        this.removeClass('next-loading-spreedly');
        this.emit('checkout:spreedly-ready', {});
      });
      
      this.creditCardService.setOnError((errors) => {
        this.emit('payment:error', { errors });
      });
      
      this.creditCardService.setOnToken((token, pmData) => {
        this.handleTokenizedPayment(token, pmData);
      });
      
      await this.creditCardService.initialize();
      
      // Connect credit card service to validator
      this.validator.setCreditCardService(this.creditCardService);
      
    } catch (error) {
      this.logger.error('Failed to initialize credit card service:', error);
      this.removeClass('next-loading-spreedly');
      throw error;
    }
  }

  // ============================================================================
  // ORDER MANAGEMENT
  // ============================================================================

  private buildOrderData(checkoutStore: any, cartStore: any): CreateOrder {
    const shippingAddress: Address = {
      first_name: checkoutStore.formData.fname || '',
      last_name: checkoutStore.formData.lname || '',
      line1: checkoutStore.formData.address1 || '',
      line2: checkoutStore.formData.address2,
      line4: checkoutStore.formData.city || '',
      state: checkoutStore.formData.province,
      postcode: checkoutStore.formData.postal,
      country: checkoutStore.formData.country || '',
      phone_number: checkoutStore.formData.phone
    };
    
    let billingAddressData: Address | undefined;
    if (!checkoutStore.sameAsShipping && checkoutStore.billingAddress) {
      billingAddressData = {
        first_name: checkoutStore.billingAddress.first_name || '',
        last_name: checkoutStore.billingAddress.last_name || '',
        line1: checkoutStore.billingAddress.address1 || '',
        line4: checkoutStore.billingAddress.city || '',
        country: checkoutStore.billingAddress.country || '',
        ...(checkoutStore.billingAddress.address2 && { line2: checkoutStore.billingAddress.address2 }),
        ...(checkoutStore.billingAddress.province && { state: checkoutStore.billingAddress.province }),
        ...(checkoutStore.billingAddress.postal && { postcode: checkoutStore.billingAddress.postal }),
        ...(checkoutStore.billingAddress.phone && { phone_number: checkoutStore.billingAddress.phone })
      };
    }
    
    const payment: Payment = {
      payment_method: API_PAYMENT_METHOD_MAP[checkoutStore.paymentMethod] || 'card_token',
      ...(checkoutStore.paymentToken && { card_token: checkoutStore.paymentToken })
    };
    
    const attributionStore = useAttributionStore.getState();
    const attribution = attributionStore.getAttributionForApi();
    
    return {
      lines: cartStore.items.map((item: any) => ({
        package_id: item.packageId,
        quantity: item.quantity,
        is_upsell: false
      })),
      shipping_address: shippingAddress,
      ...(billingAddressData && { billing_address: billingAddressData }),
      billing_same_as_shipping_address: checkoutStore.sameAsShipping,
      shipping_method: checkoutStore.shippingMethod?.id || 1,
      payment_detail: payment,
      user: {
        email: checkoutStore.formData.email,
        first_name: checkoutStore.formData.fname || '',
        last_name: checkoutStore.formData.lname || '',
        language: 'en',
        phone_number: checkoutStore.formData.phone,
        accepts_marketing: checkoutStore.formData.accepts_marketing || false
      },
      vouchers: checkoutStore.vouchers || [],
      attribution: attribution,
      success_url: this.getSuccessUrl(),
      payment_failed_url: this.getFailureUrl()
    };
  }

  private async createOrder(): Promise<any> {
    const checkoutStore = useCheckoutStore.getState();
    const cartStore = useCartStore.getState();
    
    try {
      if (!checkoutStore.formData.email || !checkoutStore.formData.fname || !checkoutStore.formData.lname) {
        throw new Error('Missing required customer information');
      }
      
      if (cartStore.items.length === 0) {
        throw new Error('Cannot create order with empty cart');
      }
      
      if ((checkoutStore.paymentMethod === 'credit-card' || checkoutStore.paymentMethod === 'card_token') && !checkoutStore.paymentToken) {
        throw new Error('Payment token is required for credit card payments');
      }
      
      const orderData = this.buildOrderData(checkoutStore, cartStore);
      const order = await this.apiClient.createOrder(orderData);
      
      if (!order.ref_id) {
        throw new Error('Invalid order response: missing ref_id');
      }
      
      cartStore.reset();
      
      this.logger.info('Order created successfully', {
        ref_id: order.ref_id,
        number: order.number,
        total: order.total_incl_tax,
        payment_method: checkoutStore.paymentMethod
      });
      
      return order;
      
    } catch (error) {
      this.logger.error('Failed to create order:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Rate limited')) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        } else if (error.message.includes('401') || error.message.includes('403')) {
          throw new Error('Authentication error. Please refresh the page and try again.');
        } else if (error.message.includes('400')) {
          throw new Error('Invalid order data. Please check your information and try again.');
        } else if (error.message.includes('500')) {
          throw new Error('Server error. Please try again in a few moments.');
        }
      }
      
      throw error;
    }
  }

  private async createTestOrder(): Promise<any> {
    const cartStore = useCartStore.getState();
    
    try {
      const testOrderData = {
        lines: cartStore.items.length > 0 
          ? cartStore.items.map((item: any) => ({
              package_id: item.packageId,
              quantity: item.quantity,
              is_upsell: false
            }))
          : [{ package_id: 1, quantity: 1, is_upsell: false }],
        
        shipping_address: {
          first_name: 'Test',
          last_name: 'Order',
          line1: 'Test Address 123',
          line2: '',
          line4: 'Tempe',
          state: 'AZ',
          postcode: '85281',
          country: 'US',
          phone_number: '+14807581224'
        },
        
        billing_same_as_shipping_address: true,
        shipping_method: 1,
        
        payment_detail: {
          payment_method: 'card_token' as PaymentMethod,
          card_token: 'test_card'
        },
        
        user: {
          email: 'test@test.com',
          first_name: 'Test',
          last_name: 'Order',
          language: 'en',
          phone_number: '+14807581224',
          accepts_marketing: false
        },
        
        vouchers: [],
        attribution: this.getTestAttribution(),
        success_url: this.getSuccessUrl(),
        payment_failed_url: this.getFailureUrl()
      };
      
      const order = await this.apiClient.createOrder(testOrderData);
      cartStore.reset();
      
      return order;
      
    } catch (error) {
      this.logger.error('Failed to create test order:', error);
      throw error;
    }
  }

  private getTestAttribution(): Attribution {
    const attributionStore = useAttributionStore.getState();
    const baseAttribution = attributionStore.getAttributionForApi();
    
    return {
      ...baseAttribution,
      utm_source: 'konami_code',
      utm_medium: 'test',
      utm_campaign: 'debug_test_order',
      utm_content: 'test_mode',
      metadata: {
        ...baseAttribution.metadata,
        test_order: true,
        test_timestamp: Date.now()
      }
    };
  }

  private handleOrderRedirect(order: any): void {
    let redirectUrl: string | undefined;
    
    if (order.payment_complete_url) {
      redirectUrl = order.payment_complete_url;
    } else {
      const nextPageUrl = this.getNextPageUrlFromMeta(order.ref_id);
      if (nextPageUrl) {
        redirectUrl = nextPageUrl;
      } else if (order.order_status_url) {
        redirectUrl = order.order_status_url;
      } else {
        redirectUrl = `${window.location.origin}/checkout/confirmation/?ref_id=${order.ref_id || ''}`;
      }
    }
    
    if (redirectUrl) {
      const finalUrl = this.preserveQueryParams(redirectUrl);
      window.location.href = finalUrl;
    } else {
      this.emit('order:redirect-missing', { order });
    }
  }

  private getNextPageUrlFromMeta(refId?: string): string | null {
    const metaTag = document.querySelector('meta[name="next-next-url"]') as HTMLMetaElement ||
                   document.querySelector('meta[name="os-next-page"]') as HTMLMetaElement;
    
    if (!metaTag?.content) return null;
    
    const nextPagePath = metaTag.content;
    const redirectUrl = nextPagePath.startsWith('http') ? 
      new URL(nextPagePath) : 
      new URL(nextPagePath, window.location.origin);
    
    if (refId) {
      redirectUrl.searchParams.append('ref_id', refId);
    }
    
    return redirectUrl.href;
  }

  private preserveQueryParams(targetUrl: string, preserveParams: string[] = ['debug', 'debugger']): string {
    try {
      const url = new URL(targetUrl, window.location.origin);
      const currentParams = new URLSearchParams(window.location.search);
      
      preserveParams.forEach(param => {
        const value = currentParams.get(param);
        if (value && !url.searchParams.has(param)) {
          url.searchParams.append(param, value);
        }
      });
      
      return url.href;
    } catch (error) {
      return targetUrl;
    }
  }

  private getSuccessUrl(): string {
    const metaTag = document.querySelector('meta[name="next-success-url"]') as HTMLMetaElement ||
                   document.querySelector('meta[name="os-next-page"]') as HTMLMetaElement;
    return metaTag?.content || window.location.origin + '/success';
  }

  private getFailureUrl(): string {
    const metaTag = document.querySelector('meta[name="next-failure-url"]') as HTMLMetaElement ||
                   document.querySelector('meta[name="os-failure-url"]') as HTMLMetaElement;
    if (metaTag?.content) return metaTag.content;
    
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('payment_failed', 'true');
    return currentUrl.href;
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  private async handleFormSubmit(event: Event): Promise<void> {
    event.preventDefault();
    
    const checkoutStore = useCheckoutStore.getState();
    const cartStore = useCartStore.getState();
    
    await sentryManager.startSpan(
      {
        op: 'ui.click',
        name: 'Checkout Form Submit',
        attributes: {
          'checkout.payment_method': checkoutStore.paymentMethod,
          'cart.item_count': cartStore.items.length,
          'cart.total_value': cartStore.total,
          'checkout.same_as_shipping': checkoutStore.sameAsShipping
        }
      },
      async (span) => {
        try {
          checkoutStore.clearAllErrors();
          checkoutStore.setProcessing(true);
          
          // Use CheckoutValidator for validation
          const includePayment = checkoutStore.paymentMethod === 'credit-card' || checkoutStore.paymentMethod === 'card_token';
          
          const validation = await this.validator.validateForm(
            checkoutStore.formData,
            this.countryConfigs,
            this.currentCountryConfig,
            includePayment,
            checkoutStore.billingAddress,
            checkoutStore.sameAsShipping
          );
          
          if (!validation.isValid) {
            span?.setAttribute('validation.passed', false);
            span?.setAttribute('validation.error_count', Object.keys(validation.errors || {}).length);
            
            if (validation.errors) {
              Object.entries(validation.errors).forEach(([field, error]) => {
                checkoutStore.setError(field, error);
              });
            }
            
            if (validation.firstErrorField) {
              this.validator.focusFirstErrorField(validation.firstErrorField);
            }
            return;
          }
          
          span?.setAttribute('validation.passed', true);
          
          this.emit('checkout:started', {
            formData: checkoutStore.formData,
            paymentMethod: checkoutStore.paymentMethod
          });
          
          if (checkoutStore.paymentMethod === 'credit-card' || checkoutStore.paymentMethod === 'card_token') {
            span?.setAttribute('payment.type', 'credit_card');
            
            if (this.creditCardService?.ready) {
              const cardData: CreditCardData = {
                full_name: `${checkoutStore.formData.fname || ''} ${checkoutStore.formData.lname || ''}`.trim(),
                month: checkoutStore.formData['cc-month'] || checkoutStore.formData['exp-month'] || '',
                year: checkoutStore.formData['cc-year'] || checkoutStore.formData['exp-year'] || ''
              };
              await this.creditCardService.tokenizeCard(cardData);
              span?.setAttribute('payment.tokenization_started', true);
              return;
            } else {
              throw new Error('Credit card payment system is not ready. Please refresh the page and try again.');
            }
          }
          
          span?.setAttribute('payment.type', checkoutStore.paymentMethod || 'unknown');
          await this.processOrder();
          
        } catch (error) {
          span?.setAttribute('error', true);
          span?.setAttribute('error.type', (error as Error).name);
          span?.setAttribute('error.message', (error as Error).message);
          
          this.handleError(error, 'handleFormSubmit');
          checkoutStore.setError('general', 'Failed to process order. Please try again.');
        } finally {
          checkoutStore.setProcessing(false);
        }
      }
    );
  }

  private async processOrder(): Promise<void> {
    try {
      const order = await this.createOrder();
      this.emit('order:completed', order);
      this.handleOrderRedirect(order);
    } catch (error) {
      throw error;
    }
  }

  private async handleTokenizedPayment(token: string, pmData: any): Promise<void> {
    try {
      const checkoutStore = useCheckoutStore.getState();
      checkoutStore.setPaymentToken(token);
      
      this.emit('payment:tokenized', { token, pmData, paymentMethod: checkoutStore.paymentMethod });
      
      await this.processOrder();
      
    } catch (error) {
      this.logger.error('Failed to process tokenized payment:', error);
      const checkoutStore = useCheckoutStore.getState();
      checkoutStore.setError('general', 'Payment processing failed. Please try again.');
      checkoutStore.setProcessing(false);
    }
  }

  private async handleFieldChange(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    const fieldName = this.getFieldNameFromElement(target);
    
    if (!fieldName) return;
    
    const checkoutStore = useCheckoutStore.getState();
    
    if (fieldName.startsWith('billing-')) {
      this.handleBillingFieldChange(fieldName, target.value, checkoutStore);
      
      if (fieldName === 'billing-country') {
        const billingProvinceField = this.billingFields.get('billing-province');
        if (billingProvinceField instanceof HTMLSelectElement) {
          await this.updateBillingStateOptions(target.value, billingProvinceField, checkoutStore.formData.province);
        }
      }
    } else {
      this.updateFormData({ [fieldName]: target.value });
      checkoutStore.clearError(fieldName);
      
      if (fieldName === 'country') {
        const provinceField = this.fields.get('province');
        if (provinceField instanceof HTMLSelectElement) {
          await this.updateStateOptions(target.value, provinceField);
        }
      }
    }
    
    // Clear visual error for this field when user starts typing/changing value
    if (target.value && target.value.trim() !== '') {
      // Use validator to clear the error
      this.validator.clearError(fieldName);
    }
  }

  private async updateBillingStateOptions(country: string, billingProvinceField: HTMLSelectElement, shippingProvince?: string): Promise<void> {
    billingProvinceField.disabled = true;
    const originalHTML = billingProvinceField.innerHTML;
    billingProvinceField.innerHTML = '<option value="">Loading...</option>';
    
    try {
      const countryData = await this.countryService.getCountryStates(country);
      
      billingProvinceField.innerHTML = '';
      
      const placeholderOption = document.createElement('option');
      placeholderOption.value = '';
      placeholderOption.textContent = `Select ${countryData.countryConfig.stateLabel}`;
      placeholderOption.disabled = true;
      placeholderOption.selected = true;
      billingProvinceField.appendChild(placeholderOption);
      
      countryData.states.forEach((state: any) => {
        const option = document.createElement('option');
        option.value = state.code;
        option.textContent = state.name;
        billingProvinceField.appendChild(option);
      });
      
      if (countryData.countryConfig.stateRequired) {
        billingProvinceField.setAttribute('required', 'required');
      } else {
        billingProvinceField.removeAttribute('required');
      }
      
      if (shippingProvince) {
        billingProvinceField.value = shippingProvince;
      }
      
    } catch (error) {
      this.logger.error('Failed to load billing states:', error);
      billingProvinceField.innerHTML = originalHTML;
    } finally {
      billingProvinceField.disabled = false;
    }
  }

  private getFieldNameFromElement(element: HTMLElement): string | null {
    const checkoutFieldName = element.getAttribute('data-next-checkout-field') || 
                              element.getAttribute('os-checkout-field');
    
    if (checkoutFieldName) return checkoutFieldName;
    
    if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement) {
      if (element.name) return element.name;
    }
    
    return null;
  }

  private handleBillingFieldChange(fieldName: string, value: string, checkoutStore: any): void {
    const billingFieldName = fieldName.replace('billing-', '');
    const currentBillingData = checkoutStore.billingAddress || {
      first_name: '', last_name: '', address1: '', city: '', province: '', postal: '', country: '', phone: ''
    };
    
    const mappedFieldName = BILLING_ADDRESS_FIELD_MAP[billingFieldName] || billingFieldName;
    
    checkoutStore.setBillingAddress({
      ...currentBillingData,
      [mappedFieldName]: value
    } as CheckoutState['billingAddress']);
  }

  private handlePaymentMethodChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const checkoutStore = useCheckoutStore.getState();
    
    const mappedMethod = PAYMENT_METHOD_MAP[target.value] || 'credit-card';
    checkoutStore.setPaymentMethod(mappedMethod as any);
    
    this.updatePaymentFormVisibility(target.value);
  }

  private updatePaymentFormVisibility(paymentMethod: string): void {
    const paymentMethods = this.form.querySelectorAll('[data-next-payment-method]');
    
    paymentMethods.forEach(paymentMethodElement => {
      if (paymentMethodElement instanceof HTMLElement) {
        const radio = paymentMethodElement.querySelector('input[type="radio"]');
        const paymentForm = paymentMethodElement.querySelector('[data-next-payment-form]');
        
        if (!(radio instanceof HTMLInputElement) || !(paymentForm instanceof HTMLElement)) {
          return;
        }
        
        const isSelected = radio.value === paymentMethod;
        
        if (isSelected) {
          paymentMethodElement.classList.add('next-selected');
          paymentForm.setAttribute('data-next-payment-state', 'expanded');
          this.expandPaymentForm(paymentForm);
        } else {
          paymentMethodElement.classList.remove('next-selected');
          paymentForm.setAttribute('data-next-payment-state', 'collapsed');
          this.collapsePaymentForm(paymentForm);
        }
      }
    });
  }

  private expandPaymentForm(paymentForm: HTMLElement): void {
    if (paymentForm.classList.contains('payment-method__form--expanded')) return;
    
    paymentForm.classList.remove('payment-method__form--collapsed');
    paymentForm.classList.add('payment-method__form--expanded');
    
    const startHeight = paymentForm.offsetHeight;
    const currentOverflow = paymentForm.style.overflow;
    
    paymentForm.style.overflow = 'hidden';
    paymentForm.style.height = 'auto';
    const targetHeight = paymentForm.scrollHeight;
    
    paymentForm.style.height = startHeight + 'px';
    paymentForm.offsetHeight;
    
    paymentForm.style.height = targetHeight + 'px';
    
    setTimeout(() => {
      paymentForm.style.height = '';
      paymentForm.style.overflow = currentOverflow;
    }, 300);
  }

  private collapsePaymentForm(paymentForm: HTMLElement): void {
    if (paymentForm.classList.contains('payment-method__form--collapsed')) return;
    
    const currentHeight = paymentForm.scrollHeight;
    
    paymentForm.style.overflow = 'hidden';
    paymentForm.style.height = currentHeight + 'px';
    paymentForm.offsetHeight;
    
    paymentForm.style.height = '0px';
    
    setTimeout(() => {
      paymentForm.classList.add('payment-method__form--collapsed');
      paymentForm.classList.remove('payment-method__form--expanded');
    }, 300);
  }

  private handleShippingMethodChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const checkoutStore = useCheckoutStore.getState();
    
    const shippingMethods = [
      { id: 1, name: 'Standard Shipping', price: 0, code: 'standard' },
      { id: 2, name: 'Subscription Shipping', price: 5, code: 'subscription' },
      { id: 3, name: 'Expedited: Standard Overnight', price: 28, code: 'overnight' }
    ];
    
    const parsedValue = parseInt(target.value);
    if (isNaN(parsedValue)) return;
    
    const selectedMethod = shippingMethods.find(m => m.id === parsedValue);
    if (selectedMethod) {
      checkoutStore.setShippingMethod(selectedMethod);
      
      const cartStore = useCartStore.getState();
      cartStore.setShippingMethod(selectedMethod.id);
    }
  }

  private handleBillingAddressToggle(event: Event): void {
    const target = event.target as HTMLInputElement;
    const checkoutStore = useCheckoutStore.getState();
    
    checkoutStore.setSameAsShipping(target.checked);
    
    const billingSection = document.querySelector(BILLING_CONTAINER_SELECTOR);
    if (billingSection instanceof HTMLElement) {
      if (target.checked) {
        this.collapseBillingForm(billingSection);
      } else {
        this.expandBillingForm(billingSection);
        setTimeout(() => {
          this.copyShippingToBilling();
        }, 50);
      }
    }
  }

  private setupEventHandlers(): void {
    this.submitHandler = this.handleFormSubmit.bind(this);
    this.form.addEventListener('submit', this.submitHandler);
    
    this.changeHandler = this.handleFieldChange.bind(this);
    [...this.fields.values(), ...this.billingFields.values()].forEach(field => {
      if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) {
        field.addEventListener('change', this.changeHandler!);
        field.addEventListener('blur', this.changeHandler!);
      }
    });
    
    this.paymentMethodChangeHandler = this.handlePaymentMethodChange.bind(this);
    const paymentRadios = this.form.querySelectorAll([
      '[data-next-checkout-field="payment-method"]',
      '[os-checkout-field="payment-method"]',
      'input[name="payment_method"]'
    ].join(', '));
    paymentRadios.forEach(radio => {
      radio.addEventListener('change', this.paymentMethodChangeHandler!);
    });
    
    this.shippingMethodChangeHandler = this.handleShippingMethodChange.bind(this);
    const shippingRadios = this.form.querySelectorAll('input[name="shipping_method"]');
    shippingRadios.forEach(radio => {
      radio.addEventListener('change', this.shippingMethodChangeHandler!);
    });
    
    this.billingAddressToggleHandler = this.handleBillingAddressToggle.bind(this);
    const billingToggle = this.form.querySelector('input[name="use_shipping_address"]');
    if (billingToggle) {
      billingToggle.addEventListener('change', this.billingAddressToggleHandler);
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private updateFormData(data: Record<string, any>): void {
    const checkoutStore = useCheckoutStore.getState();
    checkoutStore.updateFormData(data);
  }

  private clearError(field: string): void {
    const checkoutStore = useCheckoutStore.getState();
    checkoutStore.clearError(field);
  }

  private populateFormData(): void {
    const checkoutStore = useCheckoutStore.getState();
    this.fields.forEach((field, name) => {
      if (checkoutStore.formData[name] && (field instanceof HTMLInputElement || field instanceof HTMLSelectElement)) {
        field.value = checkoutStore.formData[name];
      }
    });
    
    // Update floating labels for populated data
    this.ui.updateLabelsForPopulatedData();
  }

  private handleTestDataFilled(_event: Event): void {
    setTimeout(() => {
      this.populateFormData();
      
      this.fields.forEach((field) => {
        if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement) {
          field.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      
      // Update UI for test data
      this.ui.updateLabelsForPopulatedData();
    }, 150);
  }

  private async handleKonamiActivation(event: Event): Promise<void> {
    const checkoutStore = useCheckoutStore.getState();
    // const cartStore = useCartStore.getState();
    
    const customEvent = event as CustomEvent;
    const activationMethod = customEvent.detail?.method;
    
    if (activationMethod === 'konami') {
      try {
        const testFormData = {
          email: 'test@test.com',
          fname: 'Test',
          lname: 'Order',
          phone: '+14807581224',
          address1: 'Test Address 123',
          address2: '',
          city: 'Tempe',
          province: 'AZ',
          postal: '85281',
          country: 'US',
          accepts_marketing: false
        };
        
        checkoutStore.clearAllErrors();
        this.validator.clearAllErrors();
        checkoutStore.updateFormData(testFormData);
        checkoutStore.setPaymentMethod('credit-card');
        checkoutStore.setPaymentToken('test_card');
        checkoutStore.setSameAsShipping(true);
        checkoutStore.setShippingMethod({
          id: 1,
          name: 'Standard Shipping',
          price: 0,
          code: 'standard'
        });
        
        this.populateFormData();
        
        setTimeout(async () => {
          try {
            const order = await this.createTestOrder();
            this.emit('order:completed', order);
            this.handleOrderRedirect(order);
          } catch (error) {
            this.logger.error('Failed to create test order:', error);
          }
        }, 1000);
        
      } catch (error) {
        this.logger.error('Error filling test data for Konami order:', error);
      }
    }
  }

  private handleCheckoutUpdate(state: any): void {
    // Handle errors - let the validator handle the display
    if (state.errors && Object.keys(state.errors).length > 0) {
      // The validator will handle error display through its ErrorDisplayManager
      // We just need to make sure the validator knows about the errors
      Object.entries(state.errors).forEach(([fieldName, message]) => {
        this.validator.setError(fieldName, message as string);
      });
    } else {
      // Clear all errors when state has no errors
      this.validator.clearAllErrors();
    }
    
    // Handle processing state
    if (state.isProcessing) {
      this.form.classList.add('next-processing');
    } else {
      this.form.classList.remove('next-processing');
    }
  }

  private handleCartUpdate(cartState: CartState): void {
    if (cartState.isEmpty) {
      this.logger.warn('Cart is empty');
    }
  }

  private async handleConfigUpdate(configState: any): Promise<void> {
    try {
      if (configState.spreedlyEnvironmentKey && !this.creditCardService) {
        await this.initializeCreditCard(configState.spreedlyEnvironmentKey, configState.debug || false);
      }
    } catch (error) {
      this.logger.error('Error handling config update:', error);
    }
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  public setSuccessUrl(url: string): void {
    this.setOrCreateMetaTag('next-success-url', url);
    this.setOrCreateMetaTag('os-next-page', url);
  }

  public setFailureUrl(url: string): void {
    this.setOrCreateMetaTag('next-failure-url', url);
    this.setOrCreateMetaTag('os-failure-url', url);
  }

  private setOrCreateMetaTag(name: string, content: string): void {
    let metaTag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
    
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.name = name;
      document.head.appendChild(metaTag);
    }
    
    metaTag.content = content;
  }

  public validateField(fieldName: string, value: any): { isValid: boolean; errorMessage?: string } {
    const result = this.validator.validateField(fieldName, value);
    return {
      isValid: result.isValid,
      ...(result.message && { errorMessage: result.message })
    };
  }

  public clearAllValidationErrors(): void {
    const checkoutStore = useCheckoutStore.getState();
    checkoutStore.clearAllErrors();
    this.validator.clearAllErrors();
  }

  public update(): void {
    this.scanAllFields();
    this.initializePhoneInputs();
  }

  protected override cleanupEventListeners(): void {
    if (this.submitHandler) {
      this.form.removeEventListener('submit', this.submitHandler);
    }
    
    if (this.changeHandler) {
      [...this.fields.values(), ...this.billingFields.values()].forEach(field => {
        field.removeEventListener('change', this.changeHandler!);
        field.removeEventListener('blur', this.changeHandler!);
      });
    }
    
    if (this.paymentMethodChangeHandler) {
      const paymentRadios = this.form.querySelectorAll([
        '[data-next-checkout-field="payment-method"]',
        '[os-checkout-field="payment-method"]',
        'input[name="payment_method"]'
      ].join(', '));
      paymentRadios.forEach(radio => {
        radio.removeEventListener('change', this.paymentMethodChangeHandler!);
      });
    }
    
    if (this.shippingMethodChangeHandler) {
      const shippingRadios = this.form.querySelectorAll('input[name="shipping_method"]');
      shippingRadios.forEach(radio => {
        radio.removeEventListener('change', this.shippingMethodChangeHandler!);
      });
    }
    
    if (this.billingAddressToggleHandler) {
      const billingToggle = this.form.querySelector('input[name="use_shipping_address"]');
      if (billingToggle) {
        billingToggle.removeEventListener('change', this.billingAddressToggleHandler!);
      }
    }
    
    if (this.boundHandleTestDataFilled) {
      document.removeEventListener('checkout:test-data-filled', this.boundHandleTestDataFilled);
    }
    
    if (this.boundHandleKonamiActivation) {
      document.removeEventListener('next:test-mode-activated', this.boundHandleKonamiActivation);
    }
  }

  public override destroy(): void {
    if (this.validator) {
      this.validator.destroy();
    }
    
    if (this.creditCardService) {
      this.creditCardService.destroy();
    }
    
    this.phoneInputs.forEach((instance) => {
      try {
        instance.destroy();
      } catch (error) {
        // Ignore errors during cleanup
      }
    });
    this.phoneInputs.clear();
    
    this.fields.clear();
    this.billingFields.clear();
    this.paymentButtons.clear();
    
    super.destroy();
  }
}