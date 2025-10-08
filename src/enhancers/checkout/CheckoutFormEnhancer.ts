/**
 * Checkout Form Enhancer - Consolidated but complete functionality using CheckoutValidator
 */

import { BaseEnhancer } from '@/enhancers/base/BaseEnhancer';
import { useCheckoutStore, type CheckoutState } from '@/stores/checkoutStore';
import { useCartStore } from '@/stores/cartStore';
import { useConfigStore } from '@/stores/configStore';
import { useCampaignStore } from '@/stores/campaignStore';
import { ApiClient } from '@/api/client';
import { CountryService, type Country, type CountryConfig } from '@/utils/countryService';
import type { CartState } from '@/types/global';
import { CreditCardService, type CreditCardData } from './services/CreditCardService';
import { CheckoutValidator } from './validation/CheckoutValidator';
import { UIService } from './services/UIService';
import { useAttributionStore } from '@/stores/attributionStore';
import type { CreateOrder, Address, Payment, Attribution, PaymentMethod } from '@/types/api';
import { ProspectCartEnhancer } from './ProspectCartEnhancer';
import { GeneralModal } from '@/components/modals/GeneralModal';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { ExpressCheckoutProcessor } from './processors/ExpressCheckoutProcessor';
import { OrderManager } from './managers/OrderManager';
import { nextAnalytics, EcommerceEvents } from '@/utils/analytics/index';
import { userDataStorage } from '@/utils/analytics/userDataStorage';
import * as AmplitudeAnalytics from '@/utils/analytics/amplitude';

// Consolidated constants
const FIELD_SELECTORS = ['[data-next-checkout-field]', '[os-checkout-field]'] as const;
const BILLING_CONTAINER_SELECTOR = '[os-checkout-element="different-billing-address"], [data-next-component="different-billing-address"]';
const SHIPPING_FORM_SELECTOR = '[os-checkout-component="shipping-form"], [data-next-component="shipping-form"]';
const BILLING_FORM_CONTAINER_SELECTOR = '[os-checkout-component="billing-form"], [data-next-component="billing-form"]';

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
  private stateLoadingPromises: Map<string, Promise<any>> = new Map();
  private ui!: UIService;
  private prospectCartEnhancer?: ProspectCartEnhancer;
  private loadingOverlay: LoadingOverlay;
  private expressProcessor?: ExpressCheckoutProcessor;
  private orderManager?: OrderManager;

  constructor(element: HTMLElement) {
    super(element);
    this.loadingOverlay = new LoadingOverlay();
  }
  
  // Field collections
  private fields: Map<string, HTMLElement> = new Map();
  private billingFields: Map<string, HTMLElement> = new Map();
  private paymentButtons: Map<string, HTMLElement> = new Map();
  private submitButton?: HTMLButtonElement;
  
  // Country/State management
  private countries: Country[] = [];
  private countryConfigs: Map<string, CountryConfig> = new Map();
  private currentCountryConfig?: CountryConfig;
  private detectedCountryCode: string = 'US';
  
  // Phone input management
  private phoneInputs: Map<string, any> = new Map();
  private isIntlTelInputAvailable = false;
  
  // Google Maps management
  private googleMapsLoaded = false;
  private googleMapsLoading = false;
  private googleMapsLoadPromise: Promise<void> | null = null;
  private autocompleteInstances: Map<string, any> = new Map();
  private enableAutocomplete = true;
  
  // Location field visibility management
  private locationElements: NodeListOf<Element> | null = null;
  private billingLocationElements: NodeListOf<Element> | null = null;
  private locationFieldsShown: boolean = false;
  private billingLocationFieldsShown: boolean = false;
  
  // Event handlers
  private submitHandler?: (event: Event) => void;
  private changeHandler?: (event: Event) => void;
  private paymentMethodChangeHandler?: (event: Event) => void;
  private shippingMethodChangeHandler?: (event: Event) => void;
  private billingAddressToggleHandler?: (event: Event) => void;
  private boundHandleTestDataFilled?: EventListener;
  private boundHandleKonamiActivation?: EventListener;
  
  // Animation state management
  private billingAnimationInProgress = false;
  private billingAnimationDebounceTimer?: NodeJS.Timeout;
  private billingAnimationTimeouts: Set<NodeJS.Timeout> = new Set();
  
  // Track if analytics events have been fired
  private hasTrackedShippingInfo = false;
  private hasTrackedBeginCheckout = false;

  // Multi-step checkout support
  private isMultiStep = false;
  private currentStep = 1;
  private nextStepUrl?: string;

  public async initialize(): Promise<void> {
    this.validateElement();
    
    if (!(this.element instanceof HTMLFormElement)) {
      throw new Error('CheckoutFormEnhancer must be applied to a form element');
    }
    
    this.form = this.element;
    this.form.noValidate = true;

    // Check if this is a multi-step checkout
    this.detectMultiStepCheckout();

    // Initialize loading overlay
    this.loadingOverlay = new LoadingOverlay();
    
    // NOTE: Currency is initialized separately based on:
    // 1. URL parameter (?currency=XXX) - highest priority
    // 2. Session storage (previous selection) - medium priority  
    // 3. Detected location - lowest priority
    // Currency does NOT change when shipping/billing country changes
    
    // Initialize core dependencies
    const config = useConfigStore.getState();
    this.apiClient = new ApiClient(config.apiKey);
    this.countryService = CountryService.getInstance();
    
    // Re-initialize attribution to ensure we have current page data
    const attributionStore = useAttributionStore.getState();
    await attributionStore.initialize();
    
    // Initialize OrderManager and ExpressCheckoutProcessor
    this.orderManager = new OrderManager(
      this.apiClient,
      this.logger,
      (event: string, data: any) => this.emit(event as any, data)
    );
    
    this.expressProcessor = new ExpressCheckoutProcessor(
      this.logger,
      () => this.loadingOverlay.show(),
      (immediate?: boolean) => this.loadingOverlay.hide(immediate),
      (event: string, data: any) => this.emit(event as any, data),
      this.orderManager
    );
    
    // Check for phone input library
    this.isIntlTelInputAvailable = !!(window as any).intlTelInput && !!(window as any).intlTelInputUtils;
    
    // Initialize validator
    this.validator = new CheckoutValidator(
      this.logger,
      this.countryService,
      undefined // PhoneInputManager will be handled by us
    );
    
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
    
    // Initialize payment forms to sync with DOM state
    this.ui.initializePaymentForms();
    
    // Initialize credit card service
    if (config.spreedlyEnvironmentKey) {
      await this.initializeCreditCard(config.spreedlyEnvironmentKey, config.debug);
    }
    
    // Initialize address/country functionality
    await this.initializeAddressManagement(config);
    
    // Initialize phone inputs
    this.initializePhoneInputs();
    
    // Initialize address autocomplete
    await this.initializeAddressAutocomplete();
    
    // Set up phone validation callback for validator after phone inputs are initialized
    this.validator.setPhoneValidator((phoneNumber: string, type: 'shipping' | 'billing' = 'shipping') => {
      if (!this.isIntlTelInputAvailable) {
        // Fallback to basic validation
        return /^[\d\s\-\+\(\)]+$/.test(phoneNumber);
      }
      
      const instance = this.phoneInputs.get(type);
      if (instance) {
        return instance.isValidNumber();
      }
      
      // If no instance found, use basic validation
      return /^[\d\s\-\+\(\)]+$/.test(phoneNumber);
    });
    
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
    await this.populateFormData();

    // Initialize location field visibility
    this.initializeLocationFieldVisibility();
    
    // Initialize ProspectCartEnhancer
    await this.initializeProspectCart();
    
    // Listen for payment errors from other components
    this.eventBus.on('payment:error', (event: any) => {
      if (event.message) {
        this.displayPaymentError(event.message);
      }
    });
    
    // Listen for country changes from debug selector
    document.addEventListener('next:country-changed', async (e) => {
      const customEvent = e as CustomEvent;
      const { to: newCountry } = customEvent.detail;
      if (newCountry) {
        await this.handleCountryChange(newCountry);
      }
    });
    
    // Handle page restoration from bfcache (back/forward navigation)
    window.addEventListener('pageshow', (event) => {
      if (event.persisted ||
          (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming)?.type === 'back_forward') {
        // Page was restored from bfcache
        this.logger.info('Page restored from bfcache, resetting express checkout state');

        // Hide loading overlay immediately when coming back
        this.loadingOverlay.hide(true);

        const checkoutStore = useCheckoutStore.getState();

        // Reset processing state
        if (checkoutStore.isProcessing) {
          this.logger.info('Resetting processing state after bfcache restore');
          checkoutStore.setProcessing(false);
        }
        if (checkoutStore.paymentMethod === 'apple_pay' ||
            checkoutStore.paymentMethod === 'google_pay' ||
            checkoutStore.paymentMethod === 'paypal') {
          this.logger.info('Resetting payment method from', checkoutStore.paymentMethod, 'to credit-card');
          checkoutStore.setPaymentMethod('credit-card');
          checkoutStore.setPaymentToken(''); // Clear any stale payment token
        }

        // Re-initialize credit card service if needed
        if (this.creditCardService && config.spreedlyEnvironmentKey) {
          this.logger.info('Re-initializing credit card service after bfcache restore');
          this.creditCardService.initialize().catch(error => {
            this.logger.error('Failed to re-initialize credit card service:', error);
          });
        }

        // Check for fresh purchase event
        this.handlePurchaseEvent();
      }
    });

    // Handle window focus to reset express checkout state when user returns
    // This catches cases where the user cancels PayPal/etc without triggering pageshow
    window.addEventListener('focus', () => {
      const checkoutStore = useCheckoutStore.getState();

      // Only reset if we're in processing state (likely from express checkout)
      if (checkoutStore.isProcessing) {
        this.logger.info('Window focused with processing=true, resetting express checkout state');

        // Hide loading overlay
        this.loadingOverlay.hide(true);

        // Reset processing state
        checkoutStore.setProcessing(false);

        // Reset payment method back to credit-card if it's an express method
        if (checkoutStore.paymentMethod === 'apple_pay' ||
            checkoutStore.paymentMethod === 'google_pay' ||
            checkoutStore.paymentMethod === 'paypal') {
          this.logger.info('Resetting payment method from', checkoutStore.paymentMethod, 'to credit-card');
          checkoutStore.setPaymentMethod('credit-card');
          checkoutStore.setPaymentToken('');
        }
      }
    });
    
    // Check for fresh purchase on initial load
    this.handlePurchaseEvent();

    // Track begin_checkout event - only from here, nowhere else
    // Small delay to ensure analytics providers are ready
    setTimeout(() => {
      this.trackBeginCheckout();
    }, 500);

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

    // Find submit button
    const submitButton = this.form.querySelector('button[type="submit"]') || 
                        this.form.querySelector('[data-next-checkout-submit]') ||
                        this.form.querySelector('[os-checkout-submit]');
    if (submitButton instanceof HTMLButtonElement) {
      this.submitButton = submitButton;
      this.logger.debug('Found submit button:', submitButton);
    } else {
      this.logger.warn('Submit button not found in checkout form');
    }

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

    // Clear the billing form container
    billingFormContainer.innerHTML = '';
    
    // Clone ALL shipping field rows (including basic fields like name, country, address1)
    const allShippingFieldRows = shippingForm.querySelectorAll('[data-next-component="shipping-field-row"]');
    
    // First clone the non-location field rows (name, country, address1)
    allShippingFieldRows.forEach(row => {
      // Check if this row is inside a location container
      const isInsideLocation = row.closest('[data-next-component="location"]');
      
      if (!isInsideLocation) {
        // This is a basic field row (name, country, address1), clone it
        const clonedRow = row.cloneNode(true) as HTMLElement;
        this.convertShippingFieldsToBilling(clonedRow);
        billingFormContainer.appendChild(clonedRow);
      }
    });
    
    // Then check if there's a location container with additional fields
    const locationContainer = shippingForm.querySelector('[data-next-component="location"]');
    
    if (locationContainer) {
      // Clone the entire location container with all its field rows
      const clonedLocation = locationContainer.cloneNode(true) as HTMLElement;
      
      // Mark it as billing location
      clonedLocation.setAttribute('data-next-component', 'billing-location');
      
      // Convert all fields inside to billing fields
      this.convertShippingFieldsToBilling(clonedLocation);
      
      // Initially hide the billing location fields (they'll be shown when billing address1 is filled)
      clonedLocation.classList.add('next-hidden', 'next-location-hidden');
      clonedLocation.style.display = 'none';
      
      billingFormContainer.appendChild(clonedLocation);
    } else {
      // Fallback: If no location container, clone any remaining field rows
      allShippingFieldRows.forEach(row => {
        const isInsideLocation = row.closest('[data-next-component="location"]');
        
        if (isInsideLocation) {
          // These are location fields without a container, clone them
          const clonedRow = row.cloneNode(true) as HTMLElement;
          this.convertShippingFieldsToBilling(clonedRow);
          billingFormContainer.appendChild(clonedRow);
        }
      });
    }
    
    this.setInitialBillingFormState();
    return true;
  }

  private convertShippingFieldsToBilling(billingForm: HTMLElement): void {
    // Remove h tags (h1, h2, h3, h4, h5, h6) from the cloned form
    billingForm.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
      heading.remove();
    });

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
    
    // Production logging that won't be stripped
    console.log('%c[PROD] Setting initial billing state', 'color: #4CAF50; font-weight: bold', {
      toggleFound: !!billingToggle,
      sectionFound: !!billingSection,
      toggleChecked: billingToggle?.checked,
      currentHeight: billingSection?.style.height,
      currentOverflow: billingSection?.style.overflow,
      currentClasses: billingSection?.className
    });
    
    this.logger.info('[Billing] Setting initial state', {
      toggleFound: !!billingToggle,
      sectionFound: !!billingSection,
      toggleChecked: billingToggle?.checked,
      currentHeight: billingSection?.style.height,
      currentOverflow: billingSection?.style.overflow,
      currentClasses: billingSection?.className
    });
    
    if (billingToggle && billingSection) {
      // Clear any existing inline styles first
      billingSection.style.removeProperty('height');
      billingSection.style.removeProperty('overflow');
      billingSection.style.removeProperty('transition');
      
      if (billingToggle.checked) {
        // Set collapsed state immediately without animation
        billingSection.style.height = '0px';
        billingSection.style.overflow = 'hidden';
        billingSection.classList.add('billing-form-collapsed');
        billingSection.classList.remove('billing-form-expanded');
        this.logger.info('[Billing] Initial state: COLLAPSED (checkbox checked)');
      } else {
        // Set expanded state immediately without animation
        billingSection.style.height = 'auto';
        billingSection.style.overflow = 'visible';
        billingSection.classList.add('billing-form-expanded');
        billingSection.classList.remove('billing-form-collapsed');
        this.logger.info('[Billing] Initial state: EXPANDED (checkbox unchecked)');
      }
    } else {
      this.logger.warn('[Billing] Could not set initial state - missing elements');
    }
  }

  private expandBillingForm(billingSection: HTMLElement): void {
    // Clear any existing animation timeouts
    this.billingAnimationTimeouts.forEach(timeout => clearTimeout(timeout));
    this.billingAnimationTimeouts.clear();
    
    // Mark animation as in progress
    this.billingAnimationInProgress = true;
    
    this.logger.debug('[Billing] Starting expand animation', {
      startHeight: billingSection.offsetHeight,
      startOverflow: billingSection.style.overflow
    });
    
    // Double RAF for better browser compatibility in production
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
      // Measure the full height
      billingSection.style.transition = 'none';
      billingSection.style.height = 'auto';
      const fullHeight = billingSection.scrollHeight;
      
      this.logger.debug('[Billing] Measured full height:', fullHeight);
      
      // Set back to 0 for animation
      billingSection.style.height = '0px';
      billingSection.style.overflow = 'hidden';
      
      // Force reflow - use multiple methods to ensure it works in production
      void billingSection.offsetHeight;
      void billingSection.getBoundingClientRect();
      
      // Add another RAF to ensure the height is set before transition
      requestAnimationFrame(() => {
        // Animate to full height
        billingSection.style.setProperty('transition', 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 'important');
        billingSection.style.setProperty('height', `${fullHeight}px`, 'important');
        
        // Force style in production
        const computedStyle = window.getComputedStyle(billingSection);
        console.log('%c[PROD] Expand animation started', 'color: #00BCD4; font-weight: bold', {
          fromHeight: '0px',
          toHeight: fullHeight,
          measuredFullHeight: fullHeight,
          appliedTransition: billingSection.style.transition,
          computedTransition: computedStyle.transition,
          computedHeight: computedStyle.height,
          hasTransition: computedStyle.transition !== 'none',
          transitionProperty: computedStyle.transitionProperty,
          transitionDuration: computedStyle.transitionDuration
        });
        
        this.logger.debug('[Billing] Expand animation started', {
          fromHeight: '0px',
          toHeight: fullHeight
        });
        
        // Clean up after animation
        const handleTransitionEnd = () => {
          // Set to auto and remove transition
          billingSection.style.transition = 'none';
          billingSection.style.height = 'auto';
          billingSection.style.overflow = 'visible';
          billingSection.removeEventListener('transitionend', handleTransitionEnd);
          this.billingAnimationInProgress = false;
          
          // Production logging for completion
          console.log('%c[PROD] Expand complete', 'color: #4CAF50; font-weight: bold', {
            finalHeight: billingSection.style.height,
            finalOverflow: billingSection.style.overflow,
            finalTransition: billingSection.style.transition,
            computedHeight: window.getComputedStyle(billingSection).height,
            scrollHeight: billingSection.scrollHeight
          });
          
          this.logger.info('[Billing] Expand complete', {
            finalHeight: billingSection.style.height,
            finalOverflow: billingSection.style.overflow,
            finalTransition: billingSection.style.transition
          });
        };
        
        billingSection.addEventListener('transitionend', handleTransitionEnd);
        
        // Fallback cleanup
        const fallbackTimeout = setTimeout(() => {
          if (this.billingAnimationInProgress && billingSection.classList.contains('billing-form-expanded')) {
            this.logger.warn('[Billing] Expand fallback triggered - forcing completion');
            billingSection.style.transition = 'none';
            billingSection.style.height = 'auto';
            billingSection.style.overflow = 'visible';
            this.billingAnimationInProgress = false;
          }
          this.billingAnimationTimeouts.delete(fallbackTimeout);
        }, 350);
        
        this.billingAnimationTimeouts.add(fallbackTimeout);
      });
      
      billingSection.classList.add('billing-form-expanded');
      billingSection.classList.remove('billing-form-collapsed');
      }); // Extra RAF close
    });
  }

  private collapseBillingForm(billingSection: HTMLElement): void {
    // Clear any existing animation timeouts
    this.billingAnimationTimeouts.forEach(timeout => clearTimeout(timeout));
    this.billingAnimationTimeouts.clear();
    
    // Mark animation as in progress
    this.billingAnimationInProgress = true;
    
    this.logger.debug('[Billing] Starting collapse animation', {
      startHeight: billingSection.offsetHeight,
      scrollHeight: billingSection.scrollHeight
    });
    
    // Double RAF for better browser compatibility in production
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
      // Get current height before collapsing
      const currentHeight = billingSection.scrollHeight;
      
      // Remove any existing transition first
      billingSection.style.transition = 'none';
      
      // Set explicit height to enable transition from auto
      billingSection.style.height = `${currentHeight}px`;
      billingSection.style.overflow = 'hidden';
      
      // Force reflow - use multiple methods to ensure it works in production
      void billingSection.offsetHeight;
      void billingSection.getBoundingClientRect();
      
      // Add another RAF to ensure the height is set before transition
      requestAnimationFrame(() => {
        // Animate to collapsed state
        billingSection.style.setProperty('transition', 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 'important');
        billingSection.style.setProperty('height', '0px', 'important');
        
        // Force style in production
        const computedStyle = window.getComputedStyle(billingSection);
        console.log('%c[PROD] Collapse animation started', 'color: #E91E63; font-weight: bold', {
          fromHeight: currentHeight,
          toHeight: '0px',
          appliedTransition: billingSection.style.transition,
          computedTransition: computedStyle.transition,
          computedHeight: computedStyle.height,
          hasTransition: computedStyle.transition !== 'none',
          transitionProperty: computedStyle.transitionProperty,
          transitionDuration: computedStyle.transitionDuration
        });
        
        this.logger.debug('[Billing] Collapse animation started', {
          fromHeight: currentHeight,
          toHeight: '0px'
        });
        
        // Clean up after animation
        const handleTransitionEnd = () => {
          // Keep it collapsed but remove transition
          billingSection.style.transition = 'none';
          billingSection.style.height = '0px';
          billingSection.style.overflow = 'hidden';
          billingSection.removeEventListener('transitionend', handleTransitionEnd);
          this.billingAnimationInProgress = false;
          
          // Production logging for completion
          console.log('%c[PROD] Collapse complete', 'color: #9C27B0; font-weight: bold', {
            finalHeight: billingSection.style.height,
            finalOverflow: billingSection.style.overflow,
            finalTransition: billingSection.style.transition,
            computedHeight: window.getComputedStyle(billingSection).height
          });
          
          this.logger.info('[Billing] Collapse complete', {
            finalHeight: billingSection.style.height,
            finalOverflow: billingSection.style.overflow,
            finalTransition: billingSection.style.transition
          });
        };
        
        billingSection.addEventListener('transitionend', handleTransitionEnd);
        
        // Fallback cleanup
        const fallbackTimeout = setTimeout(() => {
          if (this.billingAnimationInProgress && billingSection.classList.contains('billing-form-collapsed')) {
            this.logger.warn('[Billing] Collapse fallback triggered - forcing completion');
            billingSection.style.transition = 'none';
            billingSection.style.height = '0px';
            billingSection.style.overflow = 'hidden';
            this.billingAnimationInProgress = false;
          }
          this.billingAnimationTimeouts.delete(fallbackTimeout);
        }, 350);
        
        this.billingAnimationTimeouts.add(fallbackTimeout);
      });
      
      billingSection.classList.add('billing-form-collapsed');
      billingSection.classList.remove('billing-form-expanded');
      }); // Extra RAF close
    });
  }


  // ============================================================================
  // GOOGLE MAPS LOADER METHODS
  // ============================================================================

  private async loadGoogleMapsAPI(): Promise<void> {
    const configStore = useConfigStore.getState();
    const googleMapsConfig = configStore.googleMapsConfig;

    // Skip loading if autocomplete is disabled
    if (googleMapsConfig.enableAutocomplete === false) {
      this.logger.debug('Google Maps Autocomplete is disabled in configuration');
      return;
    }

    // Check if API key is available
    if (!googleMapsConfig.apiKey) {
      this.logger.warn('Google Maps API key not found. Autocomplete will be disabled.');
      return;
    }

    if (this.googleMapsLoaded) {
      this.logger.debug('Google Maps API already loaded');
      return;
    }

    if (this.googleMapsLoading) {
      this.logger.debug('Google Maps API loading in progress, waiting...');
      return this.googleMapsLoadPromise!;
    }

    this.googleMapsLoading = true;
    this.googleMapsLoadPromise = this.performGoogleMapsLoad(googleMapsConfig);
    
    try {
      await this.googleMapsLoadPromise;
      this.googleMapsLoaded = true;
      this.logger.info('Google Maps API loaded successfully');
    } catch (error) {
      this.logger.error('Failed to load Google Maps API:', error);
      // Don't throw - autocomplete failure shouldn't break checkout
    } finally {
      this.googleMapsLoading = false;
    }
  }

  private async performGoogleMapsLoad(config: any): Promise<void> {
    // Check if Google Maps is already loaded
    if (typeof window.google !== 'undefined' && typeof window.google.maps !== 'undefined') {
      this.logger.debug('Google Maps API already available');
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const regionParam = config.region ? `&region=${config.region}` : '';
      
      script.src = `https://maps.googleapis.com/maps/api/js?key=${config.apiKey}&libraries=places${regionParam}&loading=async`;
      script.async = true;
      script.defer = true;
      
      script.onload = async () => {
        this.logger.debug('Google Maps API script loaded successfully');
        
        // Wait a bit for the API to fully initialize
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts) {
          if (typeof window.google !== 'undefined' && 
              typeof window.google.maps !== 'undefined' && 
              typeof window.google.maps.places !== 'undefined' &&
              typeof window.google.maps.places.Autocomplete !== 'undefined') {
            this.logger.debug('Google Maps Places API fully initialized');
            resolve();
            return;
          }
          
          attempts++;
          this.logger.debug(`Waiting for Google Maps API to initialize... (attempt ${attempts}/${maxAttempts})`);
          await new Promise(r => setTimeout(r, 100));
        }
        
        // If we get here, something went wrong
        reject(new Error('Google Maps API not fully available after script load'));
      };
      
      script.onerror = () => {
        const error = new Error('Failed to load Google Maps API script');
        this.logger.error(error.message);
        reject(error);
      };

      // Check if script is already loading/loaded
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
      if (existingScript) {
        this.logger.debug('Google Maps script already in DOM, waiting for load...');
        
        // Check if already fully loaded
        if (typeof window.google !== 'undefined' && 
            typeof window.google.maps !== 'undefined' && 
            typeof window.google.maps.places !== 'undefined' &&
            typeof window.google.maps.places.Autocomplete !== 'undefined') {
          resolve();
          return;
        }
        
        // Wait for existing script to fully load
        const waitForExisting = async () => {
          let attempts = 0;
          const maxAttempts = 10;
          
          while (attempts < maxAttempts) {
            if (typeof window.google !== 'undefined' && 
                typeof window.google.maps !== 'undefined' && 
                typeof window.google.maps.places !== 'undefined' &&
                typeof window.google.maps.places.Autocomplete !== 'undefined') {
              this.logger.debug('Existing Google Maps script fully loaded');
              resolve();
              return;
            }
            
            attempts++;
            await new Promise(r => setTimeout(r, 100));
          }
          
          reject(new Error('Existing Google Maps script failed to fully initialize'));
        };
        
        waitForExisting();
        return;
      }

      document.head.appendChild(script);
    });
  }

  private isGoogleMapsLoaded(): boolean {
    return this.googleMapsLoaded && typeof window.google !== 'undefined' && typeof window.google.maps !== 'undefined';
  }

  private isGoogleMapsPlacesAvailable(): boolean {
    return this.isGoogleMapsLoaded() && 
           typeof window.google.maps.places !== 'undefined' &&
           typeof window.google.maps.places.Autocomplete !== 'undefined';
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
      
      // Check if autocomplete should be enabled
      const googleMapsConfig = config.googleMapsConfig || {};
      this.enableAutocomplete = googleMapsConfig.enableAutocomplete !== false && !!googleMapsConfig.apiKey;
      
      const locationData = await this.countryService.getLocationData();
      this.countries = locationData.countries;
      
      // Check for shipping country override from URL or sessionStorage
      // NOTE: This only affects the shipping country dropdown, NOT currency
      let selectedCountryCode = locationData.detectedCountryCode;

      // Use console.log to ensure visibility
      const countryConfig = this.countryService.getConfig();
      const checkoutStore = useCheckoutStore.getState();
      const storedCountry = checkoutStore.formData.country;

      console.log('%c[CheckoutForm] Shipping Country Priority Check', 'color: #FF6B6B; font-weight: bold', {
        detectedCountry: locationData.detectedCountryCode,
        detectedCurrency: locationData.detectedCountryConfig.currencyCode,
        addressConfigDefault: countryConfig?.defaultCountry,
        storedCountry: storedCountry,
        urlParam: new URLSearchParams(window.location.search).get('country'),
        sessionOverride: sessionStorage.getItem('next_selected_country'),
        availableCountries: this.countries.map(c => c.code),
        note: 'Shipping country may differ from detected location. Currency is based on detected location only.'
      });

      this.logger.info('Shipping country selection priority check (does not affect currency):', {
        detectedCountry: locationData.detectedCountryCode,
        addressConfigDefault: countryConfig?.defaultCountry,
        storedCountry: storedCountry,
        urlParam: new URLSearchParams(window.location.search).get('country'),
        sessionOverride: sessionStorage.getItem('next_selected_country')
      });

      // Priority 1: Stored country from checkoutStore (from previous step)
      if (storedCountry) {
        const countryExists = this.countries.some(c => c.code === storedCountry);
        if (countryExists) {
          selectedCountryCode = storedCountry;
          this.logger.info(`✅ Using stored country from previous step: ${storedCountry}`);
        } else {
          this.logger.warn(`Stored country ${storedCountry} not in available countries`);
        }
      }
      // Priority 2: URL parameter (?country=XX for shipping destination)
      else {
        const urlParams = new URLSearchParams(window.location.search);
        const urlCountry = urlParams.get('country');
        if (urlCountry) {
          const countryCode = urlCountry.toUpperCase();
          // Verify the country exists in the available countries
          const countryExists = this.countries.some(c => c.code === countryCode);
          if (countryExists) {
            selectedCountryCode = countryCode;
            // Save to sessionStorage for persistence
            sessionStorage.setItem('next_selected_country', countryCode);
            this.logger.info(`✅ Using shipping country from URL parameter: ${countryCode} (currency unaffected)`);
          } else {
            this.logger.warn(`Country ${countryCode} from URL not in available countries`);
          }
        }
        // Priority 3: sessionStorage override (from previous URL param or user selection)
        else {
          const savedCountryOverride = sessionStorage.getItem('next_selected_country');
          if (savedCountryOverride) {
            const countryExists = this.countries.some(c => c.code === savedCountryOverride);
            if (countryExists) {
              selectedCountryCode = savedCountryOverride;
              this.logger.info(`✅ Using shipping country from session storage: ${savedCountryOverride} (currency unaffected)`);
            } else {
              this.logger.warn(`Saved country ${savedCountryOverride} not in available countries`);
            }
          } else {
            this.logger.info(`✅ Using detected/default shipping country: ${selectedCountryCode} (currency unaffected)`);
          }
        }
      }
      
      this.detectedCountryCode = selectedCountryCode;
      
      const countryField = this.fields.get('country');
      if (countryField instanceof HTMLSelectElement) {
        console.log('%c[CheckoutForm] Setting country dropdown', 'color: #4ECDC4; font-weight: bold', {
          field: countryField,
          selectedCountry: selectedCountryCode,
          availableOptions: locationData.countries.map(c => c.code)
        });
        
        this.populateCountryDropdown(countryField, locationData.countries, selectedCountryCode);
        
        if (selectedCountryCode) {
          this.updateFormData({ country: selectedCountryCode });
          this.clearError('country');
          
          console.log('%c[CheckoutForm] Country set to:', 'color: #95E77E; font-weight: bold', selectedCountryCode, {
            dropdownValue: countryField.value,
            formData: useCheckoutStore.getState().formData.country
          });
        }
      }
      
      // Always fetch the config for the selected country to ensure we have the right one
      let selectedCountryConfig;
      try {
        selectedCountryConfig = await this.countryService.getCountryConfig(selectedCountryCode);
        this.logger.debug(`Fetched config for country ${selectedCountryCode}`);
      } catch (error) {
        this.logger.warn(`Failed to get config for country ${selectedCountryCode}, using detected config`);
        selectedCountryConfig = locationData.detectedCountryConfig;
      }
      
      this.countryConfigs.set(selectedCountryCode, selectedCountryConfig);

      // IMPORTANT: Save stored province before loading states (updateStateOptions clears it)
      const storedProvince = checkoutStore.formData.province;
      console.log('%c[CheckoutForm] Saved province before state loading', 'color: #FF1493; font-weight: bold', {
        storedProvince,
        storedCountry,
        willRestore: !!storedProvince && storedCountry === selectedCountryCode
      });

      if (selectedCountryCode) {
        const provinceField = this.fields.get('province');
        if (provinceField instanceof HTMLSelectElement) {
          await this.updateStateOptions(selectedCountryCode, provinceField);
          this.currentCountryConfig = selectedCountryConfig;

          // Restore stored province after states are loaded (if country matches)
          if (storedProvince && storedCountry === selectedCountryCode) {
            const optionExists = Array.from(provinceField.options).some(opt => opt.value === storedProvince);
            if (optionExists) {
              provinceField.value = storedProvince;
              this.updateFormData({ province: storedProvince });
              console.log('%c[CheckoutForm] ✅ Restored province after state loading', 'color: #00FF00; font-weight: bold', {
                province: storedProvince,
                fieldValue: provinceField.value
              });
            } else {
              console.log('%c[CheckoutForm] ⚠️ Cannot restore province - option not found', 'color: #FFA500', {
                storedProvince,
                availableOptions: Array.from(provinceField.options).map(o => o.value)
              });
            }
          }
        }
        this.updateFormLabels(selectedCountryConfig);
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

  private async handleCountryChange(newCountry: string): Promise<void> {
    this.logger.info(`Handling country change to: ${newCountry}`);
    
    // Update the country dropdown
    const countryField = this.fields.get('country');
    if (countryField instanceof HTMLSelectElement) {
      countryField.value = newCountry;
      
      // Update form data in checkout store
      this.updateFormData({ country: newCountry });
      
      // Update state options for the new country
      const provinceField = this.fields.get('province');
      if (provinceField instanceof HTMLSelectElement) {
        await this.updateStateOptions(newCountry, provinceField);
      }
      
      // Trigger change event to update any dependent fields
      countryField.dispatchEvent(new Event('change', { bubbles: true }));
      
      this.logger.info(`Country field updated to: ${newCountry}`);
    }
    
    // Also update billing country if billing form is visible
    const billingCountryField = this.billingFields.get('billing-country');
    if (billingCountryField instanceof HTMLSelectElement) {
      billingCountryField.value = newCountry;
      
      // Update billing state options
      const billingProvinceField = this.billingFields.get('billing-province');
      if (billingProvinceField instanceof HTMLSelectElement) {
        // Pass the shipping province value if "same as shipping" is checked
        const checkoutStore = useCheckoutStore.getState();
        const shippingProvince = checkoutStore.sameAsShipping ? checkoutStore.formData.province : undefined;
        await this.updateBillingStateOptions(newCountry, billingProvinceField, shippingProvince);
      }
      
      billingCountryField.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  private async updateStateOptions(country: string, provinceField: HTMLSelectElement): Promise<void> {
    // If country is empty, just clear the state field
    if (!country || country.trim() === '') {
      provinceField.innerHTML = '<option value="">Select Country First</option>';
      provinceField.disabled = true;
      return;
    }
    
    provinceField.disabled = true;
    const originalHTML = provinceField.innerHTML;
    provinceField.innerHTML = '<option value="">Loading...</option>';
    
    try {
      // Check if we already have a promise for this country
      let countryDataPromise = this.stateLoadingPromises.get(country);
      
      if (!countryDataPromise) {
        // Create new promise and store it
        countryDataPromise = this.countryService.getCountryStates(country);
        this.stateLoadingPromises.set(country, countryDataPromise);
        
        // Clean up after completion
        countryDataPromise.finally(() => {
          setTimeout(() => this.stateLoadingPromises.delete(country), 100);
        });
      } else {
        this.logger.debug(`Reusing existing state loading promise for ${country}`);
      }
      
      const countryData = await countryDataPromise;
      this.countryConfigs.set(country, countryData.countryConfig);
      this.currentCountryConfig = countryData.countryConfig;
      
      // Update form labels and placeholders for the new country
      this.updateFormLabels(countryData.countryConfig);
      
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
      
      // Create placeholder option that shows the appropriate label
      const placeholderOption = document.createElement('option');
      placeholderOption.value = '';
      placeholderOption.textContent = `Select ${countryData.countryConfig.stateLabel}`;
      placeholderOption.disabled = false; // Keep it selectable but invalid for validation
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
      
      // Store the current value (might be from autofill)
      const currentProvinceValue = provinceField.value;
      
      // Clear the form data but keep the field value if it exists
      this.updateFormData({ province: '' });
      this.clearError('province');
      
      // Check if the current value is valid for the new country
      let validStateFound = false;
      if (currentProvinceValue) {
        const isValidState = countryData.states.some((state: any) => state.code === currentProvinceValue);
        if (isValidState) {
          // Keep the autofilled value if it's valid
          provinceField.value = currentProvinceValue;
          this.updateFormData({ province: currentProvinceValue });
          validStateFound = true;
          this.logger.debug(`Kept autofilled state: ${currentProvinceValue}`);
        } else {
          // Clear invalid state
          provinceField.value = '';
        }
      } else {
        provinceField.value = '';
      }
      
      // Don't auto-select - keep the placeholder selected
      // The placeholder option is already selected by default
      if (!validStateFound) {
        // Ensure the placeholder is selected (value is empty)
        provinceField.value = '';
        this.logger.debug(`No valid state found, showing placeholder: Select ${countryData.countryConfig.stateLabel}`);
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
    if (postalField instanceof HTMLInputElement) {
      postalField.placeholder = countryConfig.postcodeLabel;
    }
  }

  private updateBillingFormLabels(countryConfig: CountryConfig): void {
    // Find billing form container
    const billingContainer = document.querySelector('[os-checkout-element="different-billing-address"]');
    if (!billingContainer) return;
    
    const billingStateLabel = billingContainer.querySelector('label[for*="billing"][for*="province"], label[for*="billing"][for*="state"]');
    if (billingStateLabel) {
      const isRequired = countryConfig.stateRequired ? ' *' : '';
      billingStateLabel.textContent = `Billing ${countryConfig.stateLabel}${isRequired}`;
    }
    
    const billingPostalLabel = billingContainer.querySelector('label[for*="billing"][for*="postal"], label[for*="billing"][for*="zip"]');
    if (billingPostalLabel) {
      billingPostalLabel.textContent = `Billing ${countryConfig.postcodeLabel} *`;
    }
    
    const billingPostalField = this.billingFields.get('billing-postal');
    if (billingPostalField instanceof HTMLInputElement) {
      billingPostalField.placeholder = `Billing ${countryConfig.postcodeLabel}`;
    }
  }

  // ============================================================================
  // ADDRESS AUTOCOMPLETE MANAGEMENT
  // ============================================================================

  private async initializeAddressAutocomplete(): Promise<void> {
    if (!this.enableAutocomplete) {
      this.logger.debug('Google Maps autocomplete disabled, skipping initialization');
      return;
    }

    try {
      // Set up lazy loading for Google Maps autocomplete
      this.setupLazyAutocompleteLoading();
    } catch (error) {
      this.logger.error('Failed to initialize autocomplete:', error);
    }
  }

  private setupLazyAutocompleteLoading(): void {
    const addressField = this.fields.get('address1');
    const billingAddressField = this.billingFields.get('billing-address1');

    let isLoading = false;
    let isLoaded = false;

    const loadAutocompleteOnFocus = async () => {
      if (isLoaded || isLoading) return;
      
      isLoading = true;
      this.logger.info('User focused on address field, loading Google Maps API...');
      
      try {
        await this.initializeGoogleMapsAutocomplete();
        isLoaded = true;
        
        // Remove all focus listeners since we've loaded the API
        if (addressField) {
          addressField.removeEventListener('focus', loadAutocompleteOnFocus);
        }
        if (billingAddressField) {
          billingAddressField.removeEventListener('focus', loadAutocompleteOnFocus);
        }
      } catch (error) {
        this.logger.error('Failed to load Google Maps on focus:', error);
      } finally {
        isLoading = false;
      }
    };

    // Add focus listeners to address fields
    if (addressField instanceof HTMLInputElement) {
      addressField.addEventListener('focus', loadAutocompleteOnFocus);
    }
    
    if (billingAddressField instanceof HTMLInputElement) {
      billingAddressField.addEventListener('focus', loadAutocompleteOnFocus);
    }
  }

  private async initializeGoogleMapsAutocomplete(): Promise<void> {
    try {
      // Load Google Maps API
      await this.loadGoogleMapsAPI();
      
      // Add a small delay to ensure the API is fully initialized
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Debug logging
      this.logger.debug('Google Maps status:', {
        google: typeof window.google !== 'undefined',
        maps: typeof window.google?.maps !== 'undefined',
        places: typeof window.google?.maps?.places !== 'undefined',
        Autocomplete: typeof window.google?.maps?.places?.Autocomplete !== 'undefined'
      });
      
      if (!this.isGoogleMapsPlacesAvailable()) {
        this.logger.warn('Google Places API not available, skipping autocomplete setup');
        return;
      }

      this.logger.debug('Google Maps API loaded, setting up autocomplete');
      this.setupAutocomplete();
      
    } catch (error) {
      this.logger.warn('Failed to load Google Maps API:', error);
    }
  }

  private setupAutocomplete(): void {
    const addressField = this.fields.get('address1');
    const billingAddressField = this.billingFields.get('billing-address1');
    const defaultCountry = this.detectedCountryCode || 'US';

    // Set up autocomplete for shipping address
    if (addressField instanceof HTMLInputElement) {
      this.createAutocompleteInstance(
        addressField,
        'address1',
        defaultCountry,
        'shipping'
      );
    }

    // Set up autocomplete for billing address
    if (billingAddressField instanceof HTMLInputElement) {
      this.createAutocompleteInstance(
        billingAddressField,
        'billing-address1',
        defaultCountry,
        'billing'
      );
    }

    // Set up country change listeners to update autocomplete restrictions
    this.setupAutocompleteCountryChangeListeners();
  }

  private createAutocompleteInstance(
    input: HTMLInputElement,
    fieldKey: string,
    defaultCountry: string,
    type: 'shipping' | 'billing'
  ): void {
    try {
      const countryField = type === 'shipping' 
        ? this.fields.get('country') 
        : this.billingFields.get('billing-country');
      const countryValue = (countryField instanceof HTMLSelectElement && countryField.value) 
        ? countryField.value 
        : defaultCountry;
      
      const options = {
        types: ['address'],
        fields: ['address_components', 'formatted_address'],
        componentRestrictions: { country: countryValue }
      };

      // Check if Google Maps API is loaded
      if (!window.google?.maps?.places) {
        this.logger.warn('Google Maps Places API not loaded, skipping autocomplete initialization');
        return;
      }
      
      // For now, stick with the legacy Autocomplete API until we can properly implement PlaceAutocompleteElement
      // The new API requires more complex DOM manipulation and styling
      // Note: Google shows deprecation warnings but the API is still fully supported
      if (!window.google.maps.places.Autocomplete) {
        this.logger.warn('Google Maps Autocomplete API not available');
        return;
      }
      
      const autocomplete = new window.google.maps.places.Autocomplete(input, options);
      this.autocompleteInstances.set(fieldKey, autocomplete);
      
      this.logger.debug(`Autocomplete created for ${fieldKey}, restricted to: ${countryValue}`);

      // Handle place selection
      autocomplete.addListener('place_changed', async () => {
        const place = autocomplete.getPlace();
        if (!place || !place.address_components) {
          this.logger.debug('No valid place data returned from autocomplete');
          return;
        }

        await this.fillAddressFromAutocomplete(place, type);
      });

      // Prevent form submission on Enter
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
        }
      });

    } catch (error) {
      this.logger.error(`Failed to create autocomplete for ${fieldKey}:`, error);
    }
  }

  private async fillAddressFromAutocomplete(place: any, type: 'shipping' | 'billing'): Promise<void> {
    console.log('🔍 fillAddressFromAutocomplete called with place:', place, 'type:', type);
    
    if (!place.address_components) return;

    // Parse address components
    const components = this.parseAddressComponents(place.address_components);
    
    if (!components) {
      this.logger.warn('Failed to parse address components');
      return;
    }

    // Log autocomplete selection for specific countries (e.g., Brazil)
    const countryCode = components.country?.short;
    if (countryCode === 'BR' || countryCode === 'GB' || countryCode === 'JP' || countryCode === 'IN' || countryCode === 'CA') {
      // Use console.log directly to ensure visibility
      console.log(`🌍 Google Autocomplete selection for ${countryCode}:`, {
        country: countryCode,
        type: type,
        formatted_address: place.formatted_address,
        components: {
          street_number: components.street_number?.long,
          route: components.route?.long,
          locality: components.locality?.long,
          postal_town: components.postal_town?.long,
          sublocality: components.sublocality?.long,
          sublocality_level_1: components.sublocality_level_1?.long,
          sublocality_level_2: components.sublocality_level_2?.long,
          administrative_area_level_1: components.administrative_area_level_1?.long,
          administrative_area_level_2: components.administrative_area_level_2?.long,
          administrative_area_level_3: components.administrative_area_level_3?.long,
          administrative_area_level_4: components.administrative_area_level_4?.long,
          neighborhood: components.neighborhood?.long,
          postal_code: components.postal_code?.long,
          postal_code_suffix: components.postal_code_suffix?.long
        },
        all_types: Object.keys(components)
      });
    }

    const isShipping = type === 'shipping';
    const fieldPrefix = isShipping ? '' : 'billing-';
    const fieldMap = isShipping ? this.fields : this.billingFields;
    const checkoutStore = useCheckoutStore.getState();

    // Fill in the address fields
    const addressField = fieldMap.get(`${fieldPrefix}address1`);
    if (addressField instanceof HTMLInputElement) {
      const streetNumber = components.street_number?.long || '';
      const route = components.route?.long || '';
      
      let addressValue = '';
      
      // Country-specific address formatting
      if (countryCode === 'BR' && route && streetNumber) {
        // Brazil format: "Street Name, Number"
        addressValue = `${route}, ${streetNumber}`;
        
        // Append neighborhood if available
        if (components.sublocality_level_1) {
          addressValue += ` - ${components.sublocality_level_1.long}`;
        } else if (components.sublocality) {
          addressValue += ` - ${components.sublocality.long}`;
        }
      } else {
        // Default format: "Number Street Name"
        addressValue = [streetNumber, route].filter(Boolean).join(' ');
      }
      
      addressField.value = addressValue;
      addressField.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // For Brazil, parse city and state from formatted address if components are missing
    let parsedCity = '';
    let parsedState = '';
    
    if (countryCode === 'BR' && place.formatted_address && 
        (!components.administrative_area_level_2 || !components.administrative_area_level_1)) {
      // BR format: "Street, Number - Neighborhood, City - State, Postal, Country"
      const addressParts = place.formatted_address.split(',');
      if (addressParts.length >= 3) {
        // Extract city and state from the pattern "City - State"
        const cityStatePart = addressParts[addressParts.length - 3]?.trim();
        if (cityStatePart && cityStatePart.includes(' - ')) {
          const [city, state] = cityStatePart.split(' - ').map((s: string) => s.trim());
          parsedCity = city || '';
          parsedState = state || '';
        }
      }
    }

    const cityField = fieldMap.get(`${fieldPrefix}city`);
    if (cityField instanceof HTMLInputElement) {
      let cityValue = '';
      
      // Country-specific logic
      if (countryCode === 'BR') {
        // Brazil: try administrative_area_level_2 first, then parsed city
        if (components.administrative_area_level_2) {
          cityValue = components.administrative_area_level_2.long;
        } else if (parsedCity) {
          cityValue = parsedCity;
        }
      }
      // Primary: Try locality (most common - US, CA, AU, etc.)
      else if (components.locality) {
        cityValue = components.locality.long;
      } 
      // Fallback 1: Try postal_town (common in UK)
      else if (components.postal_town) {
        cityValue = components.postal_town.long;
      }
      // Fallback 2: Try administrative_area_level_2 (some countries use this)
      else if (components.administrative_area_level_2) {
        cityValue = components.administrative_area_level_2.long;
      }
      // Fallback 3: Try sublocality (common in some Asian countries - but not for BR)
      else if (components.sublocality && countryCode !== 'BR') {
        cityValue = components.sublocality.long;
      }
      // Fallback 4: Try sublocality_level_1 (but not for BR where it's neighborhood)
      else if (components.sublocality_level_1 && countryCode !== 'BR') {
        cityValue = components.sublocality_level_1.long;
      }
      
      if (cityValue) {
        cityField.value = cityValue;
        cityField.dispatchEvent(new Event('change', { bubbles: true }));
        this.logger.debug(`City set to: ${cityValue} (type: ${
          components.locality ? 'locality' : 
          components.postal_town ? 'postal_town' : 
          components.sublocality ? 'sublocality' : 
          'sublocality_level_1'
        })`);
      } else {
        this.logger.warn('No suitable city component found in address');
      }
    }

    const zipField = fieldMap.get(`${fieldPrefix}postal`);
    if (zipField instanceof HTMLInputElement && components?.postal_code) {
      zipField.value = components.postal_code.long;
      zipField.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Handle country and state
    const countryField = fieldMap.get(`${fieldPrefix}country`);
    if (countryField instanceof HTMLSelectElement && components?.country) {
      const countryCode = components.country.short;
      if (countryField.value !== countryCode) {
        countryField.value = countryCode;
        countryField.dispatchEvent(new Event('change', { bubbles: true }));
        this.logger.debug(`Country set to ${countryCode}`);
      }

      // Set state with retry (wait for country change to load states)
      const stateField = fieldMap.get(`${fieldPrefix}province`);
      if (stateField instanceof HTMLSelectElement) {
        if (components?.administrative_area_level_1) {
          this.setStateWithRetry(stateField, components.administrative_area_level_1.short, fieldPrefix);
        } else if (countryCode === 'BR' && parsedState) {
          // For Brazil, use parsed state if component is missing
          this.setStateWithRetry(stateField, parsedState, fieldPrefix);
        }
      }
    }

    // Update the store
    if (isShipping) {
      const updates: Record<string, string> = {};
      if (components.street_number || components.route) {
        const streetNumber = components.street_number?.long || '';
        const route = components.route?.long || '';
        
        let addressValue = '';
        
        // Country-specific address formatting
        if (countryCode === 'BR' && route && streetNumber) {
          // Brazil format: "Street Name, Number"
          addressValue = `${route}, ${streetNumber}`;
          
          // Append neighborhood if available
          if (components.sublocality_level_1) {
            addressValue += ` - ${components.sublocality_level_1.long}`;
          } else if (components.sublocality) {
            addressValue += ` - ${components.sublocality.long}`;
          }
        } else {
          // Default format: "Number Street Name"
          addressValue = [streetNumber, route].filter(Boolean).join(' ');
        }
        
        updates.address1 = addressValue;
      }
      // Enhanced city extraction for store updates
      if (countryCode === 'BR' && components.administrative_area_level_2) {
        updates.city = components.administrative_area_level_2.long;
      } else if (components.locality) {
        updates.city = components.locality.long;
      } else if (components.postal_town) {
        updates.city = components.postal_town.long;
      } else if (components.administrative_area_level_2) {
        updates.city = components.administrative_area_level_2.long;
      } else if (components.sublocality && countryCode !== 'BR') {
        updates.city = components.sublocality.long;
      } else if (components.sublocality_level_1) {
        updates.city = components.sublocality_level_1.long;
      }
      if (components.postal_code) updates.postal = components.postal_code.long;
      if (components.country) updates.country = components.country.short;
      if (components.administrative_area_level_1) updates.province = components.administrative_area_level_1.short;
      
      checkoutStore.updateFormData(updates);
      
      // Check if we should track shipping info after autofill
      if (!this.hasTrackedShippingInfo && updates.city && updates.province) {
        try {
          // Get current shipping method if selected
          const shippingMethod = checkoutStore.shippingMethod;
          const shippingTier = shippingMethod ? shippingMethod.name : 'Standard';
          nextAnalytics.track(EcommerceEvents.createAddShippingInfoEvent(shippingTier));
          this.hasTrackedShippingInfo = true;
          this.logger.info('Tracked add_shipping_info event (Google Places autofill)', { shippingTier });
        } catch (error) {
          this.logger.warn('Failed to track add_shipping_info event after autofill:', error);
        }
      }
    } else {
      // Update billing address
      const currentBillingData = checkoutStore.billingAddress || {
        first_name: '', last_name: '', address1: '', city: '', province: '', postal: '', country: '', phone: ''
      };
      
      const updates: any = { ...currentBillingData };
      if (components.street_number || components.route) {
        const streetNumber = components.street_number?.long || '';
        const route = components.route?.long || '';
        
        let addressValue = '';
        
        // Country-specific address formatting
        if (countryCode === 'BR' && route && streetNumber) {
          // Brazil format: "Street Name, Number"
          addressValue = `${route}, ${streetNumber}`;
          
          // Append neighborhood if available
          if (components.sublocality_level_1) {
            addressValue += ` - ${components.sublocality_level_1.long}`;
          } else if (components.sublocality) {
            addressValue += ` - ${components.sublocality.long}`;
          }
        } else {
          // Default format: "Number Street Name"
          addressValue = [streetNumber, route].filter(Boolean).join(' ');
        }
        
        updates.address1 = addressValue;
      }
      // Enhanced city extraction for store updates
      if (countryCode === 'BR' && components.administrative_area_level_2) {
        updates.city = components.administrative_area_level_2.long;
      } else if (components.locality) {
        updates.city = components.locality.long;
      } else if (components.postal_town) {
        updates.city = components.postal_town.long;
      } else if (components.administrative_area_level_2) {
        updates.city = components.administrative_area_level_2.long;
      } else if (components.sublocality && countryCode !== 'BR') {
        updates.city = components.sublocality.long;
      } else if (components.sublocality_level_1) {
        updates.city = components.sublocality_level_1.long;
      }
      if (components.postal_code) updates.postal = components.postal_code.long;
      if (components.country) updates.country = components.country.short;
      if (components.administrative_area_level_1) updates.province = components.administrative_area_level_1.short;
      
      checkoutStore.setBillingAddress(updates);
    }

    // Emit event for other components
    this.emit('address:autocomplete-filled', {
      type,
      components
    });
  }

  private parseAddressComponents(addressComponents: any[]): Record<string, { long: string; short: string }> {
    const components: Record<string, { long: string; short: string }> = {};
    
    addressComponents.forEach(component => {
      // Store the component for ALL its types, not just the first one
      component.types.forEach((type: string) => {
        // Skip 'political' as it's too generic
        if (type !== 'political') {
          components[type] = {
            long: component.long_name,
            short: component.short_name
          };
        }
      });
    });

    // Debug logging for address component parsing
    this.logger.debug('Parsed address components:', {
      availableTypes: Object.keys(components),
      cityRelatedComponents: {
        locality: components.locality?.long,
        postal_town: components.postal_town?.long,
        sublocality: components.sublocality?.long,
        sublocality_level_1: components.sublocality_level_1?.long
      },
      allComponents: components
    });

    return components;
  }

  private async setStateWithRetry(stateSelect: HTMLSelectElement, stateCode: string, fieldPrefix: string, attempt = 0): Promise<void> {
    if (attempt >= 5) {
      this.logger.warn(`Failed to set state ${stateCode} after 5 attempts`);
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 300 * Math.pow(1.5, attempt)));

    const hasOption = Array.from(stateSelect.options).some(opt => opt.value === stateCode);
    if (hasOption) {
      stateSelect.value = stateCode;
      stateSelect.dispatchEvent(new Event('change', { bubbles: true }));
      this.logger.debug(`State set to ${stateCode}`);
    } else {
      this.setStateWithRetry(stateSelect, stateCode, fieldPrefix, attempt + 1);
    }
  }

  private autocompleteListenersAttached = false;

  private setupAutocompleteCountryChangeListeners(): void {
    // Prevent duplicate listener attachment
    if (this.autocompleteListenersAttached) {
      this.logger.debug('Autocomplete country change listeners already attached, skipping');
      return;
    }

    // Shipping country change - use a named function so we can identify it
    const shippingCountryField = this.fields.get('country');
    if (shippingCountryField instanceof HTMLSelectElement) {
      // Mark the field to indicate autocomplete handler will be attached
      (shippingCountryField as any)._hasAutocompleteHandler = true;
      
      shippingCountryField.addEventListener('change', () => {
        const autocomplete = this.autocompleteInstances.get('address1');
        const countryValue = shippingCountryField.value;
        if (autocomplete && countryValue && countryValue.length === 2) {
          // Legacy Autocomplete API
          if (autocomplete.setComponentRestrictions) {
            autocomplete.setComponentRestrictions({ country: countryValue });
          }
          this.logger.debug(`Shipping autocomplete restricted to: ${countryValue}`);
        }
      });
    }

    // Billing country change
    const billingCountryField = this.billingFields.get('billing-country');
    if (billingCountryField instanceof HTMLSelectElement) {
      billingCountryField.addEventListener('change', () => {
        const autocomplete = this.autocompleteInstances.get('billing-address1');
        const countryValue = billingCountryField.value;
        if (autocomplete && countryValue && countryValue.length === 2) {
          // Legacy Autocomplete API
          if (autocomplete.setComponentRestrictions) {
            autocomplete.setComponentRestrictions({ country: countryValue });
          }
          this.logger.debug(`Billing autocomplete restricted to: ${countryValue}`);
        }
      });
    }

    this.autocompleteListenersAttached = true;
  }

  // ============================================================================
  // LOCATION FIELD VISIBILITY MANAGEMENT
  // ============================================================================

  private initializeLocationFieldVisibility(): void {
    // Find all location elements - check both possible attributes
    this.locationElements = this.form.querySelectorAll('[data-next-component="location"], [data-next-component-location="location"]');
    
    // Also find billing location elements
    this.billingLocationElements = this.form.querySelectorAll('[data-next-component="billing-location"]');
    
    if (!this.locationElements || this.locationElements.length === 0) {
      this.logger.debug('No shipping location elements found');
    }
    
    if (!this.billingLocationElements || this.billingLocationElements.length === 0) {
      this.logger.debug('No billing location elements found');
    }
    
    // Hide location fields initially
    this.hideLocationFields();
    this.hideBillingLocationFields();
    
    // Set up address field listeners for shipping
    const addressField = this.fields.get('address1');
    if (addressField instanceof HTMLInputElement) {
      // Listen for changes on address1 field
      addressField.addEventListener('input', this.handleAddressInput.bind(this));
      addressField.addEventListener('change', this.handleAddressInput.bind(this));
      addressField.addEventListener('blur', this.handleAddressInput.bind(this));
      
      // Check initial state
      if (addressField.value && addressField.value.trim().length > 0) {
        this.showLocationFields();
      }
    }
    
    // Set up address field listeners for billing
    const billingAddressField = this.billingFields?.get('billing-address1');
    if (billingAddressField instanceof HTMLInputElement) {
      // Listen for changes on billing address1 field
      billingAddressField.addEventListener('input', this.handleBillingAddressInput.bind(this));
      billingAddressField.addEventListener('change', this.handleBillingAddressInput.bind(this));
      billingAddressField.addEventListener('blur', this.handleBillingAddressInput.bind(this));
      
      // Check initial state
      if (billingAddressField.value && billingAddressField.value.trim().length > 0) {
        this.showBillingLocationFields();
      }
    }
    
    // Listen for autocomplete fill events
    this.eventBus.on('address:autocomplete-filled', (event: any) => {
      if (event.type === 'shipping') {
        this.showLocationFields();
      } else if (event.type === 'billing') {
        this.showBillingLocationFields();
      }
    });
    
    // Listen for address field changes via store updates
    const checkoutStore = useCheckoutStore.getState();
    if (checkoutStore.formData.address1 && checkoutStore.formData.address1.trim().length > 0) {
      this.showLocationFields();
    }
    if (checkoutStore.formData['billing-address1'] && checkoutStore.formData['billing-address1'].trim().length > 0) {
      this.showBillingLocationFields();
    }
    
    this.logger.debug('Location field visibility initialized', {
      shippingLocationElementsCount: this.locationElements?.length || 0,
      billingLocationElementsCount: this.billingLocationElements?.length || 0
    });
  }
  
  private handleAddressInput(event: Event): void {
    const field = event.target as HTMLInputElement;
    if (field.value && field.value.trim().length > 0) {
      this.showLocationFields();
    }
  }
  
  private handleBillingAddressInput(event: Event): void {
    const field = event.target as HTMLInputElement;
    if (field.value && field.value.trim().length > 0) {
      this.showBillingLocationFields();
    }
  }
  
  private hideLocationFields(): void {
    if (!this.locationElements) return;
    
    this.locationElements.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.display = 'none';
        el.classList.add('next-location-hidden');
      }
    });
    
    this.locationFieldsShown = false;
    this.logger.debug('Location fields hidden');
  }
  
  private showLocationFields(): void {
    if (this.locationFieldsShown || !this.locationElements) return;
    
    this.locationElements.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.display = 'flex';
        el.classList.remove('next-location-hidden');
      }
    });
    
    this.locationFieldsShown = true;
    
    // Emit event for other components
    this.eventBus.emit('checkout:location-fields-shown', {});
    this.form.dispatchEvent(new CustomEvent('checkout:location-fields-shown'));
    
    this.logger.debug('Location fields shown');
  }
  
  private hideBillingLocationFields(): void {
    if (!this.billingLocationElements) return;
    
    this.billingLocationElements.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.display = 'none';
        el.classList.add('next-location-hidden');
      }
    });
    
    this.billingLocationFieldsShown = false;
    this.logger.debug('Billing location fields hidden');
  }
  
  private showBillingLocationFields(): void {
    if (this.billingLocationFieldsShown || !this.billingLocationElements) return;
    
    this.billingLocationElements.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.display = 'flex';
        el.classList.remove('next-location-hidden');
      }
    });
    
    this.billingLocationFieldsShown = true;
    
    // Emit event for other components
    this.eventBus.emit('checkout:billing-location-fields-shown', {});
    this.form.dispatchEvent(new CustomEvent('checkout:billing-location-fields-shown'));
    
    this.logger.debug('Billing location fields shown');
  }

  // ============================================================================
  // PROSPECT CART MANAGEMENT
  // ============================================================================

  private async initializeProspectCart(): Promise<void> {
    try {
      // Initialize ProspectCartEnhancer with email entry trigger
      this.prospectCartEnhancer = new ProspectCartEnhancer(this.form);
      
      // Configure it to trigger on email entry
      await this.prospectCartEnhancer.initialize();
      
      // Listen for prospect cart events
      this.form.addEventListener('next:prospect-cart-created', (event: Event) => {
        const customEvent = event as CustomEvent;
        this.logger.info('Prospect cart created', customEvent.detail);
      });
      
      this.form.addEventListener('next:prospect-cart-abandoned', (event: Event) => {
        const customEvent = event as CustomEvent;
        this.logger.info('Prospect cart abandoned', customEvent.detail);
      });
      
      this.logger.debug('ProspectCartEnhancer initialized');
    } catch (error) {
      this.logger.warn('Failed to initialize ProspectCartEnhancer:', error);
      // Don't throw - prospect cart is not critical for checkout
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

      // Get initial country from country field or use detected country
      const countryFieldName = type === 'shipping' ? 'country' : 'billing-country';
      const countryField = type === 'shipping' ? this.fields.get(countryFieldName) : this.billingFields.get(countryFieldName);
      const initialCountry = (countryField instanceof HTMLSelectElement && countryField.value) 
        ? countryField.value.toLowerCase() 
        : this.detectedCountryCode.toLowerCase();

      // Set placeholder based on required attribute
      const isRequired = phoneField.getAttribute('data-next-required') === 'true' || 
                        phoneField.hasAttribute('required');
      phoneField.placeholder = isRequired ? 'Phone*' : 'Phone (Optional)';
      
      const instance = (window as any).intlTelInput(phoneField, {
        separateDialCode: false,
        nationalMode: true,
        autoPlaceholder: 'off',  // Turn off auto placeholder to use our custom one
        utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js',
        preferredCountries: ['us', 'ca', 'gb', 'au'],
        allowDropdown: false,
        initialCountry: initialCountry,
        formatOnDisplay: true
      });

      this.phoneInputs.set(type, instance);

      // Auto-format as user types
      phoneField.addEventListener('input', () => {
        if (instance && (window as any).intlTelInputUtils) {
          const currentValue = phoneField.value;
          const countryData = instance.getSelectedCountryData();
          
          // Format the number as the user types
          if (currentValue && countryData.iso2) {
            const formattedNumber = (window as any).intlTelInputUtils.formatNumber(
              currentValue,
              countryData.iso2,
              (window as any).intlTelInputUtils.numberFormat.NATIONAL
            );
            
            // Only update if the formatted number is different to avoid cursor jumping
            if (formattedNumber !== currentValue) {
              const cursorPosition = phoneField.selectionStart || 0;
              const oldLength = currentValue.length;
              const newLength = formattedNumber.length;
              
              phoneField.value = formattedNumber;
              
              // Adjust cursor position after formatting
              const newCursorPosition = cursorPosition + (newLength - oldLength);
              phoneField.setSelectionRange(newCursorPosition, newCursorPosition);
            }
          }
          
          // Get the full international number for storage
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
      
      // Format on blur to ensure proper formatting when user leaves the field
      phoneField.addEventListener('blur', () => {
        if (instance && (window as any).intlTelInputUtils) {
          const countryData = instance.getSelectedCountryData();
          const currentValue = phoneField.value;
          
          if (currentValue && countryData.iso2) {
            const formattedNumber = (window as any).intlTelInputUtils.formatNumber(
              currentValue,
              countryData.iso2,
              (window as any).intlTelInputUtils.numberFormat.NATIONAL
            );
            phoneField.value = formattedNumber;
          }
        }
      });
      
      // Listen for country changes to update phone country
      if (countryField instanceof HTMLSelectElement) {
        const updatePhoneCountry = () => {
          const countryCode = countryField.value;
          if (countryCode && instance) {
            instance.setCountry(countryCode.toLowerCase());
          }
        };
        
        // Listen for country changes
        countryField.addEventListener('change', updatePhoneCountry);
      }

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
        this.logger.debug('[Spreedly] Credit card service ready');
        
        // Spreedly is now ready and will handle error clearing via field events
      });
      
      this.creditCardService.setOnError((errors) => {
        this.logger.warn('[Spreedly] Credit card validation errors:', errors);
        this.emit('payment:error', { errors });
        
        // Display credit card validation errors
        if (errors && errors.length > 0) {
          const errorMessage = errors.map((err: any) => err.message || err).join('. ');
          this.displayPaymentError(errorMessage);
        }
      });
      
      this.creditCardService.setOnToken((token, pmData) => {
        this.logger.info('[Spreedly] Payment token received:', { token, pmData });
        this.handleTokenizedPayment(token, pmData);
      });
      
      // Set up floating label callbacks for Spreedly fields
      if (this.ui) {
        this.creditCardService.setFloatingLabelCallbacks(
          // Focus callback
          (fieldName: 'number' | 'cvv') => {
            this.ui.handleSpreedlyFieldFocus(fieldName);
          },
          // Blur callback
          (fieldName: 'number' | 'cvv', hasValue: boolean) => {
            this.ui.handleSpreedlyFieldBlur(fieldName, hasValue);
          },
          // Input callback
          (fieldName: 'number' | 'cvv', hasValue: boolean) => {
            this.ui.handleSpreedlyFieldInput(fieldName, hasValue);
          }
        );
        this.logger.debug('[Spreedly] Connected floating label callbacks');
      }
      
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
  // FORM CLEARING
  // ============================================================================

  private clearAllCheckoutFields(): void {
    try {
      // Clear all shipping fields
      this.fields.forEach((field) => {
        if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
          if (field.type === 'checkbox' || field.type === 'radio') {
            (field as HTMLInputElement).checked = false;
          } else {
            field.value = '';
          }
        } else if (field instanceof HTMLSelectElement) {
          field.selectedIndex = 0;
        }
      });

      // Clear all billing fields
      this.billingFields.forEach((field) => {
        if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
          if (field.type === 'checkbox' || field.type === 'radio') {
            (field as HTMLInputElement).checked = false;
          } else {
            field.value = '';
          }
        } else if (field instanceof HTMLSelectElement) {
          field.selectedIndex = 0;
        }
      });

      // Clear credit card fields if credit card service exists
      if (this.creditCardService && typeof this.creditCardService.clearFields === 'function') {
        this.creditCardService.clearFields();
      }

      // Reset checkout store
      const checkoutStore = useCheckoutStore.getState();
      checkoutStore.reset();

      // Clear any errors
      checkoutStore.clearAllErrors();

      // Re-initialize country dropdowns with detected country
      const countryField = this.fields.get('country');
      if (countryField instanceof HTMLSelectElement && this.detectedCountryCode) {
        countryField.value = this.detectedCountryCode;
        countryField.dispatchEvent(new Event('change', { bubbles: true }));
      }

      // Reset billing same as shipping checkbox
      const billingToggle = this.form.querySelector('input[name="use_shipping_address"]') as HTMLInputElement;
      if (billingToggle) {
        billingToggle.checked = true;
        billingToggle.dispatchEvent(new Event('change', { bubbles: true }));
      }

      this.logger.info('All checkout fields cleared');
    } catch (error) {
      this.logger.error('Error clearing checkout fields:', error);
    }
  }

  // ============================================================================
  // PURCHASE EVENT HANDLING
  // ============================================================================

  private async handlePurchaseEvent(): Promise<void> {
    // Check for existing order in sessionStorage
    const orderDataStr = sessionStorage.getItem('next-order');
    if (!orderDataStr) return;
    
    try {
      const orderData = JSON.parse(orderDataStr);
      const order = orderData?.state?.order;
      
      // Check if we have a valid order
      if (!order?.ref_id || !order?.number) return;
      
      // Check if we've already shown the modal for this order
      const shownOrdersStr = sessionStorage.getItem('next-shown-order-warnings');
      const shownOrders = shownOrdersStr ? JSON.parse(shownOrdersStr) : [];
      
      if (shownOrders.includes(order.ref_id)) {
        this.logger.debug('Already shown warning for order', order.ref_id);
        return;
      }
      
      this.logger.info('Fresh purchase detected, showing attention modal', {
        orderNumber: order.number,
        refId: order.ref_id
      });
      
      // Track modal shown time for duration calculation
      const modalShownTime = Date.now();
      
      // Ensure checkout is not in processing state before showing modal
      const checkoutStore = useCheckoutStore.getState();
      checkoutStore.setProcessing(false);
      
      const action = await GeneralModal.show({
        title: 'Attention',
        content: 'Your initial order has been successfully processed. Please check your email for the order confirmation. Entering your payment details again will result in a secondary purchase.',
        buttons: [
          { text: 'Close', action: 'cancel' },
          { text: 'Back', action: 'confirm' }
        ],
        className: 'purchase-warning-modal'
      });
      
      // Mark this order as shown
      shownOrders.push(order.ref_id);
      sessionStorage.setItem('next-shown-order-warnings', JSON.stringify(shownOrders));
      
      // Track the duplicate order prevention event with user action
      const timeOnModal = Date.now() - modalShownTime;
      queueMicrotask(() => {
        AmplitudeAnalytics.trackDuplicateOrderPrevention({
          orderRefId: order.ref_id,
          orderNumber: order.number,
          userAction: action === 'confirm' ? 'back' : 'close',
          timeOnPage: timeOnModal
        });
      });
      
      if (action === 'confirm') {
        // Handle back button - navigate to the success URL
        const successUrl = this.getSuccessUrl();
        if (successUrl) {
          // Add ref_id to the URL if not already present
          const url = new URL(successUrl, window.location.origin);
          if (!url.searchParams.has('ref_id') && order.ref_id) {
            url.searchParams.set('ref_id', order.ref_id);
          }
          window.location.href = url.href;
        }
      } else {
        // User clicked 'Close' - ensure form is properly initialized
        // Re-populate form data if it exists in the store
        this.populateFormData();
        
        // Ensure UI is in correct state
        if (this.ui) {
          this.ui.hideLoading('checkout');
        }
        
        // Clear all form fields and reset checkout state
        this.clearAllCheckoutFields();
      }
    } catch (error) {
      this.logger.error('Failed to parse order data from sessionStorage:', error);
      // Ensure we're not stuck in processing state
      const checkoutStore = useCheckoutStore.getState();
      checkoutStore.setProcessing(false);
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
    
    // Extract coupon codes from cart's appliedCoupons
    const vouchers = (cartStore.appliedCoupons || []).map((coupon: any) => coupon.code);
    
    return {
      lines: cartStore.items.map((item: any) => ({
        package_id: item.packageId,
        quantity: item.quantity,
        is_upsell: item.is_upsell || false
      })),
      shipping_address: shippingAddress,
      ...(billingAddressData && { billing_address: billingAddressData }),
      billing_same_as_shipping_address: checkoutStore.sameAsShipping,
      shipping_method: checkoutStore.shippingMethod?.id || cartStore.shippingMethod?.id || 1,
      payment_detail: payment,
      user: {
        email: checkoutStore.formData.email,
        first_name: checkoutStore.formData.fname || '',
        last_name: checkoutStore.formData.lname || '',
        language: 'en',
        phone_number: checkoutStore.formData.phone,
        accepts_marketing: checkoutStore.formData.accepts_marketing ?? true
      },
      vouchers: vouchers,
      attribution: attribution,
      currency: this.getCurrency(),
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
      
      // cartStore.reset();
      
      this.logger.info('Order created successfully', {
        ref_id: order.ref_id,
        number: order.number,
        total: order.total_incl_tax,
        payment_method: checkoutStore.paymentMethod
      });
      
      return order;
      
    } catch (error: any) {
      this.logger.error('Failed to create order:', error);
      
      // Check for API errors in the response
      if (error.status === 400 && error.responseData) {
        const responseData = error.responseData;
        
        // Log the full error response for debugging
        this.logger.warn('API 400 error response:', responseData);
        
        // Check for message array (common API error format)
        if (responseData.message && Array.isArray(responseData.message)) {
          // Extract the actual message from each array item
          const errorMessages = responseData.message.map((msg: any) => {
            if (typeof msg === 'object' && msg !== null) {
              // If it's an object, try to extract a message property or stringify it
              return msg.message || JSON.stringify(msg);
            }
            return String(msg);
          }).join('. ');
          this.displayPaymentError(errorMessages);
          throw new Error(errorMessages);
        }
        
        // Check for single message string
        if (responseData.message && typeof responseData.message === 'string') {
          this.displayPaymentError(responseData.message);
          throw new Error(responseData.message);
        }
        
        // Check for payment-specific errors
        if (responseData.payment_details || responseData.payment_response_code) {
          this.logger.warn('Payment error detected:', {
            payment_details: responseData.payment_details,
            payment_response_code: responseData.payment_response_code
          });
          
          // Track checkout failed event for Amplitude
          const checkoutStore = useCheckoutStore.getState();
          const cartStore = useCartStore.getState();
          queueMicrotask(() => {
            const checkoutStartTime = (window as any)._checkoutStartTime || Date.now();
            const timeOnPage = Date.now() - checkoutStartTime;
            AmplitudeAnalytics.trackCheckoutFailed({
              errorMessage: responseData.payment_details || 'Payment failed',
              errorType: 'payment',
              paymentResponseCode: responseData.payment_response_code,
              cartValue: cartStore.total,
              itemsCount: cartStore.totalQuantity,
              country: checkoutStore.formData.country || 'US',
              paymentMethod: checkoutStore.paymentMethod,
              timeOnPage: timeOnPage
            });
          });
          
          // Display payment error in the UI
          this.displayPaymentError(responseData.payment_details || 'Payment failed. Please check your payment information.');
          
          // Create a user-friendly error message
          let errorMessage = 'Payment failed: ';
          if (responseData.payment_details) {
            errorMessage += responseData.payment_details;
          } else {
            errorMessage += 'Please check your payment information and try again.';
          }
          
          throw new Error(errorMessage);
        }
        
        // Check for validation errors
        if (responseData.errors) {
          const errorMessages = Object.entries(responseData.errors)
            .map(([, messages]) => {
              if (Array.isArray(messages)) {
                return messages.join('. ');
              }
              return messages;
            })
            .join('. ');
          
          // Track checkout failed event for validation errors
          const checkoutStore = useCheckoutStore.getState();
          const cartStore = useCartStore.getState();
          queueMicrotask(() => {
            const checkoutStartTime = (window as any)._checkoutStartTime || Date.now();
            const timeOnPage = Date.now() - checkoutStartTime;
            AmplitudeAnalytics.trackCheckoutFailed({
              errorMessage: errorMessages,
              errorType: 'api',
              cartValue: cartStore.total,
              itemsCount: cartStore.totalQuantity,
              country: checkoutStore.formData.country || 'US',
              paymentMethod: checkoutStore.paymentMethod,
              timeOnPage: timeOnPage
            });
          });
          
          this.displayPaymentError(errorMessages);
          throw new Error(errorMessages);
        }
      }
      
      // Enhance error message for better user experience
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
      // Extract coupon codes from cart's appliedCoupons
      const vouchers = (cartStore.appliedCoupons || []).map((coupon: any) => coupon.code);
      
      const testOrderData = {
        lines: cartStore.items.length > 0 
          ? cartStore.items.map((item: any) => ({
              package_id: item.packageId,
              quantity: item.quantity,
              is_upsell: item.is_upsell || false
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
        shipping_method: cartStore.shippingMethod?.id || 1,
        
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
          accepts_marketing: true
        },
        
        vouchers: vouchers,
        attribution: this.getTestAttribution(),
        currency: this.getCurrency(),
        success_url: this.getSuccessUrl(),
        payment_failed_url: this.getFailureUrl()
      };
      
      const order = await this.apiClient.createOrder(testOrderData);
      // cartStore.reset();
      
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
    // Track checkout completed event for Amplitude with full form data
    const checkoutStore = useCheckoutStore.getState();
    const cartStore = useCartStore.getState();
    queueMicrotask(() => {
      // @ts-ignore - Using Date.now() is fine here
      const checkoutStartTime = (window as any)._checkoutStartTime || Date.now();
      const timeToComplete = Date.now() - checkoutStartTime;
      const trackData: Parameters<typeof AmplitudeAnalytics.trackCheckoutCompleted>[0] = {
        orderRefId: order.ref_id || 'unknown',
        orderValue: order.total_amount || cartStore.total,
        itemsCount: cartStore.totalQuantity,
        country: checkoutStore.formData.country || 'US',
        paymentMethod: checkoutStore.paymentMethod,
        timeToComplete: timeToComplete,
        sameAsShipping: checkoutStore.sameAsShipping
      };
      
      if (checkoutStore.formData.province) trackData.state = checkoutStore.formData.province;
      if (checkoutStore.formData.city) trackData.city = checkoutStore.formData.city;
      if (checkoutStore.formData.postal) trackData.postalCode = checkoutStore.formData.postal;
      if (checkoutStore.formData.email) trackData.email = checkoutStore.formData.email;
      
      if (!checkoutStore.sameAsShipping && checkoutStore.billingAddress) {
        if (checkoutStore.billingAddress.country) trackData.billingCountry = checkoutStore.billingAddress.country;
        if (checkoutStore.billingAddress.province) trackData.billingState = checkoutStore.billingAddress.province;
        if (checkoutStore.billingAddress.city) trackData.billingCity = checkoutStore.billingAddress.city;
        if (checkoutStore.billingAddress.postal) trackData.billingPostalCode = checkoutStore.billingAddress.postal;
      }
      
      AmplitudeAnalytics.trackCheckoutCompleted(trackData);
    });
    
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
      // Keep the loading state active during redirect
      // The browser will handle clearing it when the page unloads
      window.location.href = finalUrl;
    } else {
      // Only clear loading state if redirect fails
      const checkoutStore = useCheckoutStore.getState();
      checkoutStore.setProcessing(false);
      this.emit('order:redirect-missing', { order });
    }
  }

  private getNextPageUrlFromMeta(refId?: string): string | null {
    const metaTag = document.querySelector('meta[name="next-success-url"]') as HTMLMetaElement ||
                   document.querySelector('meta[name="next-next-url"]') as HTMLMetaElement ||
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

  private getCurrency(): string {
    // Get currency from campaign or config store (same logic as cart store)
    const campaignState = useCampaignStore.getState();
    if (campaignState?.data?.currency) {
      return campaignState.data.currency;
    }
    
    const configStore = useConfigStore.getState();
    return configStore?.selectedCurrency || configStore?.detectedCurrency || 'USD';
  }

  private getSuccessUrl(): string {
    const metaTag = document.querySelector('meta[name="next-success-url"]') as HTMLMetaElement ||
                   document.querySelector('meta[name="next-next-url"]') as HTMLMetaElement ||
                   document.querySelector('meta[name="os-next-page"]') as HTMLMetaElement;
    
    if (metaTag?.content) {
      // Convert to absolute URL if it's a relative path
      if (metaTag.content.startsWith('/')) {
        return window.location.origin + metaTag.content;
      }
      // Return as-is if it's already an absolute URL
      return metaTag.content;
    }
    
    return window.location.origin + '/success';
  }

  private async validateExpressCheckoutFields(formData: any, requiredFields: string[]): Promise<any> {
    const errors: Record<string, string> = {};
    let firstErrorField: string | null = null;
    
    // Validate only the specified required fields
    for (const field of requiredFields) {
      const value = formData[field];
      
      if (!value || (typeof value === 'string' && !value.trim())) {
        const fieldNameMap: Record<string, string> = {
          'email': 'Email',
          'fname': 'First Name',
          'lname': 'Last Name',
          'phone': 'Phone',
          'address1': 'Address',
          'city': 'City',
          'province': 'State/Province',
          'postal': 'ZIP/Postal Code',
          'country': 'Country'
        };
        
        const fieldLabel = fieldNameMap[field] || field;
        errors[field] = `${fieldLabel} is required`;
        
        if (!firstErrorField) {
          firstErrorField = field;
        }
      }
      
      // Special validation for email using the validator
      if (field === 'email' && value) {
        if (!this.validator.isValidEmail(value)) {
          errors[field] = 'Please enter a valid email address';
          if (!firstErrorField) {
            firstErrorField = field;
          }
        }
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      firstErrorField
    };
  }

  private getFailureUrl(): string {
    const metaTag = document.querySelector('meta[name="next-failure-url"]') as HTMLMetaElement ||
                   document.querySelector('meta[name="os-failure-url"]') as HTMLMetaElement;
    
    if (metaTag?.content) {
      // Convert to absolute URL if it's a relative path
      if (metaTag.content.startsWith('/')) {
        return window.location.origin + metaTag.content;
      }
      // Return as-is if it's already an absolute URL
      return metaTag.content;
    }
    
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('payment_failed', 'true');
    return currentUrl.href;
  }

  // ============================================================================
  // MULTI-STEP CHECKOUT SUPPORT
  // ============================================================================

  /**
   * Detect if this is a multi-step checkout by checking for step attributes
   */
  private detectMultiStepCheckout(): void {
    // Check for data-next-checkout-step attribute on form
    const stepAttr = this.form.getAttribute('data-next-checkout-step') ||
                     this.form.getAttribute('os-checkout-step');

    if (stepAttr) {
      this.isMultiStep = true;
      this.currentStep = parseInt(this.form.getAttribute('data-next-step-number') || '1', 10);
      this.nextStepUrl = stepAttr;

      this.logger.info('Multi-step checkout detected', {
        currentStep: this.currentStep,
        nextStepUrl: this.nextStepUrl
      });

      // Update store step
      const checkoutStore = useCheckoutStore.getState();
      checkoutStore.setStep(this.currentStep);
    }
  }

  /**
   * Handle step navigation for multi-step checkout
   */
  private async handleStepNavigation(checkoutStore: any, cartStore: any): Promise<void> {
    try {
      checkoutStore.clearAllErrors();
      checkoutStore.setProcessing(true);

      // Show loading overlay
      this.loadingOverlay.show();

      this.logger.info(`Validating step ${this.currentStep} before navigation`);

      // Validate only current step fields
      const validation = await this.validator.validateStep(
        this.currentStep,
        checkoutStore.formData,
        this.countryConfigs,
        this.currentCountryConfig
      );

      if (!validation.isValid) {
        this.logger.warn(`Step ${this.currentStep} validation failed`, validation.errors);

        // Display errors
        if (validation.errors) {
          Object.entries(validation.errors).forEach(([field, error]) => {
            checkoutStore.setError(field, error as string);
            this.validator.showError(field, error as string);
          });
        }

        // Focus first error field
        if (validation.firstErrorField) {
          setTimeout(() => {
            this.validator.focusFirstErrorField(validation.firstErrorField);
          }, 100);
        }

        // Clear processing state and hide overlay on validation error
        checkoutStore.setProcessing(false);
        this.loadingOverlay.hide(true);
        return;
      }

      // Validation passed - data is already saved in checkoutStore via field change handlers
      // Navigate to next step
      this.logger.info(`Step ${this.currentStep} validated successfully, navigating to: ${this.nextStepUrl}`);

      // Update step in store before navigation
      checkoutStore.setStep(this.currentStep + 1);

      // Build next URL with preserved query parameters
      let nextUrl = this.nextStepUrl!;
      const currentParams = new URLSearchParams(window.location.search);

      // Check if debug=true is in current URL
      if (currentParams.get('debug') === 'true') {
        // Handle relative URLs (e.g., "shipping", "shipping.html", "/shipping.html")
        const separator = nextUrl.includes('?') ? '&' : '?';
        nextUrl = `${nextUrl}${separator}debug=true`;
        this.logger.debug('Preserving debug parameter in next step URL');
      }

      // Add a small delay to show the loading spinner before navigation
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Clear processing state before navigation to prevent it persisting to next page
      checkoutStore.setProcessing(false);

      // Navigate to next page (loading overlay will be cleared by page navigation)
      window.location.href = nextUrl;

    } catch (error) {
      this.logger.error('Step navigation error:', error);
      checkoutStore.setError('general', 'Failed to proceed to next step. Please try again.');
      checkoutStore.setProcessing(false);
      this.loadingOverlay.hide(true);
    }
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  private async handleFormSubmit(event: Event): Promise<void> {
    event.preventDefault();

    const checkoutStore = useCheckoutStore.getState();
    const cartStore = useCartStore.getState();

    // Handle multi-step navigation
    if (this.isMultiStep && this.nextStepUrl) {
      return this.handleStepNavigation(checkoutStore, cartStore);
    }
    
        try {
          checkoutStore.clearAllErrors();
          checkoutStore.setProcessing(true);
          
          // Show loading overlay
          this.loadingOverlay.show();
          
          // Validate phone numbers using intl-tel-input if available
          if (this.isIntlTelInputAvailable) {
            // Validate shipping phone
            const shippingPhoneInstance = this.phoneInputs.get('shipping');
            if (shippingPhoneInstance) {
              const isValidShipping = shippingPhoneInstance.isValidNumber();
              if (!isValidShipping && checkoutStore.formData.phone) {
                checkoutStore.setError('phone', 'Please enter a valid phone number');
              } else if (isValidShipping) {
                // Update with formatted number
                const formattedNumber = shippingPhoneInstance.getNumber();
                if (formattedNumber) {
                  checkoutStore.updateFormData({ phone: formattedNumber });
                }
              }
            }
            
            // Validate billing phone if different from shipping
            if (!checkoutStore.sameAsShipping && checkoutStore.billingAddress) {
              const billingPhoneInstance = this.phoneInputs.get('billing');
              if (billingPhoneInstance) {
                const isValidBilling = billingPhoneInstance.isValidNumber();
                if (!isValidBilling && checkoutStore.billingAddress.phone) {
                  checkoutStore.setError('billing-phone', 'Please enter a valid phone number');
                }
              }
            }
          }
          
          // Check if this is an express payment method
          const expressPaymentMethods = ['paypal', 'apple_pay', 'google_pay'];
          const isExpressPayment = expressPaymentMethods.includes(checkoutStore.paymentMethod);
          
          // Track checkout started event for Amplitude
          const checkoutStartTime = Date.now();
          // Store the start time globally so we can calculate time to complete later
          (window as any)._checkoutStartTime = checkoutStartTime;
          queueMicrotask(() => {
            const country = checkoutStore.formData.country || 'US';
            AmplitudeAnalytics.trackCheckoutStarted({
              cartValue: cartStore.total,
              itemsCount: cartStore.totalQuantity,
              detectedCountry: country,
              paymentMethod: checkoutStore.paymentMethod || 'credit-card'
            });
          });
          
          // Check if validation is required for express payments
          const config = useConfigStore.getState();
          const requireExpressValidation = config.paymentConfig?.expressCheckout?.requireValidation;
          
          // Debug logging
          this.logger.debug('Express payment config:', {
            isExpressPayment,
            paymentMethod: checkoutStore.paymentMethod,
            requireExpressValidation,
            hasExpressProcessor: !!this.expressProcessor,
            fullConfig: config.paymentConfig?.expressCheckout
          });
          
          // If it's an express payment method and validation is NOT required, use ExpressCheckoutProcessor
          if (isExpressPayment && this.expressProcessor && !requireExpressValidation) {
            this.logger.info(`Processing express checkout for ${checkoutStore.paymentMethod} (skipping validation)`);
            
            // Hide loading overlay first since ExpressCheckoutProcessor will show its own
            this.loadingOverlay.hide(true);
            
            // Use ExpressCheckoutProcessor which handles everything including order creation
            await this.expressProcessor.handleExpressCheckout(
              checkoutStore.paymentMethod,
              cartStore.items,
              cartStore.isEmpty,
              () => cartStore.reset()
            );
            
            // ExpressCheckoutProcessor handles all success/error cases and redirects
            return;
          }
          
          // Log if express payment requires validation
          if (isExpressPayment && requireExpressValidation) {
            this.logger.info(`Express payment ${checkoutStore.paymentMethod} requires validation (requireValidation: true)`);
          }
          
          // For regular credit card payments OR express payments with validation required
          const includePayment = checkoutStore.paymentMethod === 'credit-card' || 
                               checkoutStore.paymentMethod === 'card_token' ||
                               (isExpressPayment && requireExpressValidation);
          
          let validation;
          
          // If express payment with custom required fields, validate only those fields
          if (isExpressPayment && requireExpressValidation && config.paymentConfig?.expressCheckout?.requiredFields) {
            const requiredFields = config.paymentConfig.expressCheckout.requiredFields;
            validation = await this.validateExpressCheckoutFields(checkoutStore.formData, requiredFields);
          } else {
            // Otherwise use full validation
            validation = await this.validator.validateForm(
              checkoutStore.formData,
              this.countryConfigs,
              this.currentCountryConfig,
              includePayment,
              checkoutStore.billingAddress,
              checkoutStore.sameAsShipping
            );
          }
          
          if (!validation.isValid) {
            
            // Track validation failed event for Amplitude with error details and values
            queueMicrotask(() => {
              const errorFields = Object.keys(validation.errors || {});
              
              // Build error details with field value, error message, and categorization
              const errorDetails: Record<string, { value: any; error: string; category: string; errorType: string }> = {};
              const errorsByCategory = {
                shipping: [] as string[],
                billing: [] as string[],
                payment: [] as string[],
                contact: [] as string[]
              };
              
              errorFields.forEach(field => {
                // Determine the actual value for this field
                let fieldValue = '';
                if (field.startsWith('billing-')) {
                  const billingField = field.replace('billing-', '') as keyof typeof checkoutStore.billingAddress;
                  fieldValue = checkoutStore.billingAddress?.[billingField] || '';
                } else if (field === 'cc-number' || field === 'cvv') {
                  fieldValue = '[REDACTED]'; // Don't log sensitive payment data
                } else if (field === 'exp-month' || field === 'cc-month') {
                  fieldValue = checkoutStore.formData['cc-month'] || checkoutStore.formData['exp-month'] || '';
                } else if (field === 'exp-year' || field === 'cc-year') {
                  fieldValue = checkoutStore.formData['cc-year'] || checkoutStore.formData['exp-year'] || '';
                } else {
                  fieldValue = checkoutStore.formData[field] || '';
                }
                
                // Categorize the error
                let category = 'shipping';
                if (field.startsWith('billing-')) {
                  category = 'billing';
                } else if (['cc-number', 'cvv', 'exp-month', 'exp-year', 'cc-month', 'cc-year'].includes(field)) {
                  category = 'payment';
                } else if (['email', 'phone'].includes(field)) {
                  category = 'contact';
                }
                
                // Determine error type
                const errorMessage = validation.errors[field] as string;
                let errorType = 'other';
                if (errorMessage.toLowerCase().includes('required') || errorMessage.toLowerCase().includes('is required')) {
                  errorType = 'required';
                } else if (errorMessage.toLowerCase().includes('valid') || errorMessage.toLowerCase().includes('invalid')) {
                  errorType = 'format';
                } else if (errorMessage.toLowerCase().includes('match')) {
                  errorType = 'mismatch';
                }
                
                errorDetails[field] = {
                  value: fieldValue,
                  error: errorMessage,
                  category: category,
                  errorType: errorType
                };
                
                errorsByCategory[category as keyof typeof errorsByCategory].push(field);
              });
              
              // Include ALL form values for complete context
              const formValues: Record<string, any> = {
                // Contact info
                email: checkoutStore.formData.email || '',
                phone: checkoutStore.formData.phone || '',
                // Shipping address
                shipping_fname: checkoutStore.formData.fname || '',
                shipping_lname: checkoutStore.formData.lname || '',
                shipping_address1: checkoutStore.formData.address1 || '',
                shipping_address2: checkoutStore.formData.address2 || '',
                shipping_city: checkoutStore.formData.city || '',
                shipping_province: checkoutStore.formData.province || '',
                shipping_postal: checkoutStore.formData.postal || '',
                shipping_country: checkoutStore.formData.country || 'US',
                // Payment info (redacted)
                has_cc_number: !!checkoutStore.formData['cc-number'],
                has_cvv: !!checkoutStore.formData['cvv'],
                exp_month: checkoutStore.formData['cc-month'] || checkoutStore.formData['exp-month'] || '',
                exp_year: checkoutStore.formData['cc-year'] || checkoutStore.formData['exp-year'] || '',
                // Billing settings
                same_as_shipping: checkoutStore.sameAsShipping
              };
              
              // Add billing values if different from shipping
              if (!checkoutStore.sameAsShipping && checkoutStore.billingAddress) {
                formValues.billing_fname = checkoutStore.billingAddress.first_name || '';
                formValues.billing_lname = checkoutStore.billingAddress.last_name || '';
                formValues.billing_address1 = checkoutStore.billingAddress.address1 || '';
                formValues.billing_address2 = checkoutStore.billingAddress.address2 || '';
                formValues.billing_city = checkoutStore.billingAddress.city || '';
                formValues.billing_province = checkoutStore.billingAddress.province || '';
                formValues.billing_postal = checkoutStore.billingAddress.postal || '';
                formValues.billing_country = checkoutStore.billingAddress.country || '';
              }
              
              AmplitudeAnalytics.trackCheckoutValidationFailed({
                validationErrors: errorFields,
                errorCount: errorFields.length,
                firstErrorField: validation.firstErrorField || errorFields[0] || 'unknown',
                country: checkoutStore.formData.country || 'US',
                paymentMethod: checkoutStore.paymentMethod,
                errorDetails: errorDetails,
                formValues: formValues,
                errorsByCategory: errorsByCategory
              } as any);
            });
            
            // Log validation errors for debugging
            this.logger.warn('Validation failed', {
              paymentMethod: checkoutStore.paymentMethod,
              isExpressPayment,
              requireExpressValidation,
              errors: validation.errors,
              firstErrorField: validation.firstErrorField
            });
            
            if (validation.errors) {
              Object.entries(validation.errors).forEach(([field, error]) => {
                checkoutStore.setError(field, error as string);
                // Also show error in UI
                this.validator.showError(field, error as string);
              });
            }
            
            // For express payments with validation, show a detailed error message
            if (isExpressPayment && requireExpressValidation) {
              const errorFields = Object.keys(validation.errors || {});
              // const errorCount = errorFields.length;
              
              // Create a human-readable list of field names
              const fieldNameMap: Record<string, string> = {
                'email': 'Email',
                'fname': 'First Name',
                'lname': 'Last Name',
                'phone': 'Phone',
                'address1': 'Address',
                'city': 'City',
                'province': 'State/Province',
                'postal': 'ZIP/Postal Code',
                'country': 'Country',
                'cc-month': 'Expiration Month',
                'cc-year': 'Expiration Year',
                'exp-month': 'Expiration Month',
                'exp-year': 'Expiration Year',
                'billing-fname': 'Billing First Name',
                'billing-lname': 'Billing Last Name',
                'billing-address1': 'Billing Address',
                'billing-city': 'Billing City',
                'billing-province': 'Billing State/Province',
                'billing-postal': 'Billing ZIP/Postal Code',
                'billing-country': 'Billing Country'
              };
              
              const requiredFields = errorFields.map(field => fieldNameMap[field] || field).join(', ');
              const generalMessage = `Please fill in the following required fields: ${requiredFields}`;
              checkoutStore.setError('general', generalMessage);
              
              // Also show payment error to make it more visible
              this.displayPaymentError(generalMessage);
            }
            
            if (validation.firstErrorField) {
              // Add a small delay to ensure errors are rendered before scrolling
              setTimeout(() => {
                this.validator.focusFirstErrorField(validation.firstErrorField);
              }, 100);
            }
            
            // Clear processing state when validation fails
            checkoutStore.setProcessing(false);
            this.loadingOverlay.hide(true); // Hide immediately on validation error
            return;
          }
          
          // span?.setAttribute('validation.passed', true);
          
          // Track checkout submitted event for Amplitude with full form data
          queueMicrotask(() => {
            const timeOnPage = Date.now() - checkoutStartTime;
            const submitData: Parameters<typeof AmplitudeAnalytics.trackCheckoutSubmitted>[0] = {
              cartValue: cartStore.total,
              itemsCount: cartStore.totalQuantity,
              country: checkoutStore.formData.country || 'US',
              paymentMethod: checkoutStore.paymentMethod,
              timeOnPage: timeOnPage,
              sameAsShipping: checkoutStore.sameAsShipping
            };
            
            if (checkoutStore.formData.province) submitData.state = checkoutStore.formData.province;
            if (checkoutStore.formData.city) submitData.city = checkoutStore.formData.city;
            if (checkoutStore.formData.postal) submitData.postalCode = checkoutStore.formData.postal;
            if (checkoutStore.formData.email) submitData.email = checkoutStore.formData.email;
            
            if (!checkoutStore.sameAsShipping && checkoutStore.billingAddress) {
              if (checkoutStore.billingAddress.country) submitData.billingCountry = checkoutStore.billingAddress.country;
              if (checkoutStore.billingAddress.province) submitData.billingState = checkoutStore.billingAddress.province;
              if (checkoutStore.billingAddress.city) submitData.billingCity = checkoutStore.billingAddress.city;
              if (checkoutStore.billingAddress.postal) submitData.billingPostalCode = checkoutStore.billingAddress.postal;
            }
            
            AmplitudeAnalytics.trackCheckoutSubmitted(submitData);
          });
          
          // For express payment methods (PayPal, Apple Pay, Google Pay), always use ExpressCheckoutProcessor
          if (isExpressPayment && this.expressProcessor) {
            this.logger.info(`Processing express checkout for ${checkoutStore.paymentMethod} (after validation)`);
            
            // Hide loading overlay first since ExpressCheckoutProcessor will show its own
            this.loadingOverlay.hide(true);
            
            // Use ExpressCheckoutProcessor which handles everything including order creation
            await this.expressProcessor.handleExpressCheckout(
              checkoutStore.paymentMethod,
              cartStore.items,
              cartStore.isEmpty,
              () => cartStore.reset()
            );
            
            // ExpressCheckoutProcessor handles all success/error cases and redirects
            return;
          }
          
          // Only credit card payments go through the regular flow
          if (checkoutStore.paymentMethod === 'credit-card' || checkoutStore.paymentMethod === 'card_token') {
            // span?.setAttribute('payment.type', 'credit_card');
            
            if (this.creditCardService?.ready) {
              const cardData: CreditCardData = {
                full_name: `${checkoutStore.formData.fname || ''} ${checkoutStore.formData.lname || ''}`.trim(),
                month: checkoutStore.formData['cc-month'] || checkoutStore.formData['exp-month'] || '',
                year: checkoutStore.formData['cc-year'] || checkoutStore.formData['exp-year'] || ''
              };
              await this.creditCardService.tokenizeCard(cardData);
              // span?.setAttribute('payment.tokenization_started', true);
              return;
            } else {
              throw new Error('Credit card payment system is not ready. Please refresh the page and try again.');
            }
          }
          
          // This should not be reached for express payments
          // span?.setAttribute('payment.type', checkoutStore.paymentMethod || 'unknown');
          await this.processOrder();
          
        } catch (error) {
          // span?.setAttribute('error', true);
          // span?.setAttribute('error.type', (error as Error).name);
          // span?.setAttribute('error.message', (error as Error).message);
          
          this.handleError(error, 'handleFormSubmit');
          checkoutStore.setError('general', 'Failed to process order. Please try again.');
          // Only set processing to false on error
          checkoutStore.setProcessing(false);
          this.loadingOverlay.hide(true); // Hide immediately on error
        }
  }

  private async processOrder(): Promise<void> {
    try {
      const order = await this.createOrder();
      
      // Mark prospect cart as converted if it exists
      if (this.prospectCartEnhancer) {
        await this.prospectCartEnhancer.convertCart();
      }
      
      this.emit('order:completed', order);
      this.handleOrderRedirect(order);
      // Note: LoadingOverlay will hide after 3 seconds on success
    } catch (error) {
      // Make sure to clear processing state on error
      const checkoutStore = useCheckoutStore.getState();
      checkoutStore.setProcessing(false);
      this.loadingOverlay.hide(true); // Hide immediately on error
      throw error;
    }
  }

  private async handleTokenizedPayment(token: string, pmData: any): Promise<void> {
    try {
      const checkoutStore = useCheckoutStore.getState();
      checkoutStore.setPaymentToken(token);
      
      this.emit('payment:tokenized', { token, pmData, paymentMethod: checkoutStore.paymentMethod });
      
      await this.processOrder();
      
    } catch (error: any) {
      this.logger.error('Failed to process tokenized payment:', error);
      const checkoutStore = useCheckoutStore.getState();
      
      // Check if error has payment details
      if (error.message && error.message.includes('Payment failed:')) {
        // The error message already contains payment details from createOrder
        checkoutStore.setError('general', error.message);
      } else {
        checkoutStore.setError('general', 'Payment processing failed. Please try again.');
      }
      
      checkoutStore.setProcessing(false);
      this.loadingOverlay.hide(true); // Hide immediately on error
    }
  }

  private async handleFieldChange(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    const fieldName = this.getFieldNameFromElement(target);

    if (!fieldName) return;

    const checkoutStore = useCheckoutStore.getState();

    if (fieldName.startsWith('billing-')) {
      // Billing fields are always strings (no checkboxes in billing)
      this.handleBillingFieldChange(fieldName, target.value, checkoutStore);

      if (fieldName === 'billing-country') {
        const billingProvinceField = this.billingFields.get('billing-province');
        if (billingProvinceField instanceof HTMLSelectElement) {
          await this.updateBillingStateOptions(target.value, billingProvinceField, checkoutStore.formData.province);
        }
        // Currency is location-based only, not affected by billing or shipping country
      }
    } else {
      // Get the correct value based on input type
      const fieldValue = (target instanceof HTMLInputElement && (target.type === 'checkbox' || target.type === 'radio'))
        ? target.checked
        : target.value;

      this.updateFormData({ [fieldName]: fieldValue });
      checkoutStore.clearError(fieldName);
      
      // Validate fields on blur - simplified without redundant fallback messages
      const fieldsToValidate = ['email', 'city', 'fname', 'lname'];
      
      if (fieldsToValidate.includes(fieldName) && (event.type === 'blur' || event.type === 'change')) {
        const fieldValue = target.value.trim();
        if (fieldValue) {
          const validationResult = this.validator.validateField(fieldName, fieldValue);
          if (!validationResult.isValid && validationResult.message) {
            this.validator.setError(fieldName, validationResult.message);
            this.logger.warn(`Invalid ${fieldName} detected on blur:`, fieldValue);
          } else if (validationResult.isValid) {
            this.validator.clearError(fieldName);
          }
        }
      }
      
      if (fieldName === 'country') {
        const provinceField = this.fields.get('province');
        if (provinceField instanceof HTMLSelectElement) {
          await this.updateStateOptions(target.value, provinceField);
        }
        
        // Save the user's country selection to sessionStorage
        sessionStorage.setItem('next_selected_country', target.value);
        this.logger.debug(`Saved user's country selection to session: ${target.value}`);
        
        // Currency is now based on user's location, not shipping country
        // Currency can only be changed via URL parameter or manual selection
      }
      
      // Show location fields when address1 is populated
      if (fieldName === 'address1' && target.value && target.value.trim().length > 0) {
        this.showLocationFields();
        
        // Track add_shipping_info when user has entered a shipping address
        // Check if we have enough address info to consider it "entered"
        if (!this.hasTrackedShippingInfo && checkoutStore.formData.city && checkoutStore.formData.province) {
          try {
            // Get current shipping method if selected
            const shippingMethod = checkoutStore.shippingMethod;
            const shippingTier = shippingMethod ? shippingMethod.name : 'Standard';
            nextAnalytics.track(EcommerceEvents.createAddShippingInfoEvent(shippingTier));
            this.hasTrackedShippingInfo = true;
            this.logger.info('Tracked add_shipping_info event (address complete)', { shippingTier });
          } catch (error) {
            this.logger.warn('Failed to track add_shipping_info event:', error);
          }
        }
      }
      
      // Only update prospect cart and storage on blur/change events, not on every input
      if (event.type === 'blur' || event.type === 'change') {
        // Update ProspectCartEnhancer when email changes
        if (fieldName === 'email' && this.prospectCartEnhancer) {
          this.prospectCartEnhancer.updateEmail(target.value);
        }
        
        // Save user data to cookies for persistence
        if (fieldName === 'email' || fieldName === 'fname' || fieldName === 'lname' || fieldName === 'phone') {
          const updates: any = {};
          if (fieldName === 'email') updates.email = target.value;
          if (fieldName === 'fname') updates.firstName = target.value;
          if (fieldName === 'lname') updates.lastName = target.value;
          if (fieldName === 'phone') updates.phone = target.value;
          
          userDataStorage.updateUserData(updates);
          this.logger.debug('Updated user data storage:', fieldName, target.value);
        }
        
        // Check if we have enough data to create prospect cart
        if (this.prospectCartEnhancer && ['email', 'fname', 'lname'].includes(fieldName)) {
          this.prospectCartEnhancer.checkAndCreateCart();
        }
      }
    }
    
    // Handle validation differently based on event type
    if (event.type === 'blur') {
      // On blur, always handle the field state
      const field = this.getFieldByName(fieldName);
      if (!field) return;
      
      const wrapper = field.closest('.form-group, .form-input');
      
      // Check if field is empty (works for both input and select elements)
      const isEmpty = !target.value || (typeof target.value === 'string' && target.value.trim() === '');
      
      if (isEmpty) {
        // Field is empty - check if there's an error label present
        // Check both in wrapper and form-group (error label can be in either)
        const formGroup = field.closest('.form-group');
        const errorLabel = wrapper?.querySelector('.next-error-label') || formGroup?.querySelector('.next-error-label');
        
        if (errorLabel) {
          // There's an error label present, so maintain the error state on the field
          // Re-add error classes to the field to keep them consistent with the error label
          field.classList.add('has-error', 'next-error-field');
          field.classList.remove('no-error');
          
          // Also ensure wrapper has error icon class if there's an error
          if (wrapper) {
            wrapper.classList.add('addErrorIcon');
            wrapper.classList.remove('addTick');
          }
        } else {
          // No error label - remove both error and success classes
          field.classList.remove('has-error', 'next-error-field', 'no-error');
          
          if (wrapper) {
            wrapper.classList.remove('addErrorIcon', 'addTick');
          }
        }
        
        // For required fields, we might want to show an error
        // Don't show required error on blur for better UX - only on submit
        // Just leave the field in neutral state
      } else {
        // Field has value - validate it
        const validationResult = this.validator.validateField(fieldName, target.value);
        
        if (validationResult.isValid) {
          // Field is valid, add the no-error class
          field.classList.remove('has-error', 'next-error-field');
          field.classList.add('no-error');
          
          // Remove error message if exists
          if (wrapper) {
            wrapper.classList.remove('addErrorIcon');
            wrapper.classList.add('addTick');
            const errorLabel = wrapper.querySelector('.next-error-label');
            if (errorLabel) {
              errorLabel.remove();
            }
          }
        } else if (validationResult.message) {
          // Field is invalid, show error
          field.classList.remove('no-error'); // Ensure no-error is removed
          this.validator.showError(fieldName, validationResult.message);
        }
      }
    } else if (event.type === 'input') {
      // On input events, clear the error display as soon as user starts typing
      const field = this.getFieldByName(fieldName);
      if (field) {
        // Just remove error classes without adding success classes
        field.classList.remove('has-error', 'next-error-field');
        
        // Remove error message if exists - check both wrapper and parent form-group
        const wrapper = field.closest('.form-group, .form-input');
        if (wrapper) {
          // First check inside the wrapper
          let errorLabel = wrapper.querySelector('.next-error-label');
          if (errorLabel) {
            errorLabel.remove();
          }
          
          // Also check if wrapper is form-input inside a form-group
          const formGroup = wrapper.closest('.form-group');
          if (formGroup) {
            errorLabel = formGroup.querySelector('.next-error-label');
            if (errorLabel) {
              errorLabel.remove();
            }
          }
        }
        
        // Also check parent element in case structure is different
        const parentGroup = field.closest('.form-group');
        if (parentGroup) {
          const errorLabel = parentGroup.querySelector('.next-error-label');
          if (errorLabel) {
            errorLabel.remove();
          }
        }
      }
    } else if (event.type === 'change') {
      // On change events (e.g., from Google Autocomplete), validate and clear errors if field is now valid
      const field = this.getFieldByName(fieldName);
      if (field && target.value && target.value.trim() !== '') {
        // Field has value - validate it and clear error if valid
        const validationResult = this.validator.validateField(fieldName, target.value);
        
        if (validationResult.isValid) {
          // Field is valid, remove error classes and messages
          field.classList.remove('has-error', 'next-error-field');
          field.classList.add('no-error');
          
          const wrapper = field.closest('.form-group, .form-input');
          if (wrapper) {
            wrapper.classList.remove('addErrorIcon');
            wrapper.classList.add('addTick');
            const errorLabel = wrapper.querySelector('.next-error-label');
            if (errorLabel) {
              errorLabel.remove();
            }
          }
          
          // Also clear error from store
          const checkoutStore = useCheckoutStore.getState();
          checkoutStore.clearError(fieldName);
        }
      }
    }
  }

  private async updateBillingStateOptions(country: string, billingProvinceField: HTMLSelectElement, shippingProvince?: string): Promise<void> {
    // If country is empty, just clear the state field
    if (!country || country.trim() === '') {
      billingProvinceField.innerHTML = '<option value="">Select Country First</option>';
      billingProvinceField.disabled = true;
      return;
    }
    
    billingProvinceField.disabled = true;
    const originalHTML = billingProvinceField.innerHTML;
    billingProvinceField.innerHTML = '<option value="">Loading...</option>';
    
    try {
      // Check if we already have a promise for this country
      let countryDataPromise = this.stateLoadingPromises.get(country);
      
      if (!countryDataPromise) {
        // Create new promise and store it
        countryDataPromise = this.countryService.getCountryStates(country);
        this.stateLoadingPromises.set(country, countryDataPromise);
        
        // Clean up after completion
        countryDataPromise.finally(() => {
          setTimeout(() => this.stateLoadingPromises.delete(country), 100);
        });
      } else {
        this.logger.debug(`Reusing existing state loading promise for ${country} (billing)`);
      }
      
      const countryData = await countryDataPromise;
      
      // Update billing form labels and placeholders
      this.updateBillingFormLabels(countryData.countryConfig);
      
      billingProvinceField.innerHTML = '';
      
      // Create placeholder option with appropriate label
      const placeholderOption = document.createElement('option');
      placeholderOption.value = '';
      placeholderOption.textContent = `Select ${countryData.countryConfig.stateLabel}`;
      placeholderOption.disabled = false; // Keep it selectable but invalid for validation
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

  private getFieldByName(fieldName: string): HTMLElement | null {
    // Check shipping fields first
    const shippingField = this.fields.get(fieldName);
    if (shippingField) return shippingField;
    
    // Check billing fields
    const billingField = this.billingFields.get(fieldName);
    if (billingField) return billingField;
    
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
    
    // Hide any payment-specific errors when switching methods
    const paypalError = document.querySelector('[data-next-component="paypal-error"]');
    if (paypalError instanceof HTMLElement) {
      paypalError.style.display = 'none';
    }
    
    const creditError = document.querySelector('[data-next-component="credit-error"]');
    if (creditError instanceof HTMLElement) {
      creditError.style.display = 'none';
    }
    
    this.ui.updatePaymentFormVisibility(target.value);
    
    // Note: For credit card payments, add_payment_info is tracked when card fields are complete (via CreditCardService)
    // For express payments (PayPal, Apple Pay, Google Pay), it's tracked when the button is clicked (via ExpressCheckoutProcessor)
  }

  // Methods moved to CheckoutUIHelpers class - expandPaymentForm and collapsePaymentForm

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
      
      // Track add_shipping_info event when shipping method is selected
      if (!this.hasTrackedShippingInfo) {
        try {
          // Map shipping codes to tier names for GA4
          const shippingTierMap: Record<string, string> = {
            'standard': 'Standard',
            'subscription': 'Subscription',
            'overnight': 'Express'
          };
          
          const shippingTier = shippingTierMap[selectedMethod.code] || selectedMethod.name;
          nextAnalytics.track(EcommerceEvents.createAddShippingInfoEvent(shippingTier));
          this.hasTrackedShippingInfo = true;
          this.logger.info('Tracked add_shipping_info event', { shippingTier });
        } catch (error) {
          this.logger.warn('Failed to track add_shipping_info event:', error);
        }
      }
    }
  }

  private handleBillingAddressToggle(event: Event): void {
    const target = event.target as HTMLInputElement;
    
    // Production logging
    console.log('%c[PROD] Billing toggle clicked', 'color: #2196F3; font-weight: bold', {
      checked: target.checked,
      animationInProgress: this.billingAnimationInProgress,
      timestamp: Date.now()
    });
    
    this.logger.info('[Billing] Toggle clicked', {
      checked: target.checked,
      animationInProgress: this.billingAnimationInProgress
    });
    
    // Prevent rapid clicks during animation
    if (this.billingAnimationInProgress) {
      event.preventDefault();
      // Revert checkbox state
      target.checked = !target.checked;
      this.logger.warn('[Billing] Click blocked - animation in progress');
      return;
    }
    
    // Clear any existing debounce timer
    if (this.billingAnimationDebounceTimer) {
      clearTimeout(this.billingAnimationDebounceTimer);
    }
    
    // Reduced debounce to 10ms (just enough to prevent double-clicks)
    this.billingAnimationDebounceTimer = setTimeout(() => {
      const checkoutStore = useCheckoutStore.getState();
      const billingSection = document.querySelector(BILLING_CONTAINER_SELECTOR);
      
      if (!billingSection || !(billingSection instanceof HTMLElement)) {
        this.logger.error('[Billing] CRITICAL: Billing section not found!');
        return;
      }
      
      // Production logging before processing
      console.log('%c[PROD] Processing toggle', 'color: #FF9800; font-weight: bold', {
        targetChecked: target.checked,
        currentHeight: billingSection.style.height,
        currentOverflow: billingSection.style.overflow,
        currentTransition: billingSection.style.transition,
        classes: billingSection.className,
        computedHeight: window.getComputedStyle(billingSection).height
      });
      
      this.logger.info('[Billing] Processing toggle', {
        targetChecked: target.checked,
        currentHeight: billingSection.style.height,
        currentOverflow: billingSection.style.overflow,
        currentTransition: billingSection.style.transition,
        classes: billingSection.className
      });
      
      // Update store state
      checkoutStore.setSameAsShipping(target.checked);
      
      if (target.checked) {
        this.logger.info('[Billing] Collapsing form...');
        this.collapseBillingForm(billingSection);
      } else {
        this.logger.info('[Billing] Expanding form...');
        this.expandBillingForm(billingSection);
        
        // Populate billing fields after expansion
        setTimeout(() => {
          // Only set the country and trigger state loading
          const shippingCountry = checkoutStore.formData.country;
          const billingCountryField = this.billingFields.get('billing-country');
          
          if (shippingCountry && billingCountryField instanceof HTMLSelectElement) {
            billingCountryField.value = shippingCountry;
            billingCountryField.dispatchEvent(new Event('change', { bubbles: true }));
            this.logger.debug('[Billing] Set country to:', shippingCountry);
          }
          
          // Clear the billing address in the store (except country)
          checkoutStore.setBillingAddress({
            first_name: '',
            last_name: '',
            address1: '',
            address2: '',
            city: '',
            province: '',
            postal: '',
            country: shippingCountry || '',
            phone: ''
          });
        }, 50);
      }
    }, 10); // Reduced debounce delay from 50ms to 10ms
  }

  /**
   * Set up detection for browser autofill
   */
  private setupAutofillDetection(): void {
    // Track the previous values of fields
    const fieldValues = new Map<HTMLElement, string>();
    
    // Flag to temporarily disable autofill detection (e.g., during Google Places autocomplete)
    let isAutofillDetectionPaused = false;
    
    // Listen for Google Places autocomplete events to pause detection
    this.eventBus.on('address:autocomplete-filled', () => {
      isAutofillDetectionPaused = true;
      // Resume after 2 seconds (enough time for Google Places to finish)
      setTimeout(() => {
        isAutofillDetectionPaused = false;
        // Update field values after Google Places fills them
        [...this.fields.values()].forEach(field => {
          if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) {
            fieldValues.set(field, field.value);
          }
        });
      }, 2000);
    });
    
    // Initialize with current values
    [...this.fields.values()].forEach(field => {
      if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) {
        fieldValues.set(field, field.value);
      }
    });
    
    // Check for autofill periodically
    let checkCount = 0;
    const maxChecks = 60; // Check for up to 30 seconds (60 * 500ms)
    
    const checkInterval = setInterval(() => {
      checkCount++;
      
      // Skip if detection is paused (Google Places is filling fields)
      if (isAutofillDetectionPaused) {
        return;
      }
      
      // Track if we found autofilled fields
      let hasAutofill = false;
      const autofilledFields: string[] = [];
      
      // Check each field for changes
      [...this.fields.values()].forEach(field => {
        if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) {
          const oldValue = fieldValues.get(field) || '';
          const newValue = field.value;
          
          // Skip address1 field as it's handled by Google Places
          const fieldName = field.getAttribute('data-next-checkout-field') || 
                          field.getAttribute('os-checkout-field') || 
                          field.name;
          if (fieldName === 'address1' || fieldName === 'address') {
            fieldValues.set(field, newValue); // Update value but don't trigger events
            return;
          }
          
          // If value changed and field wasn't focused (likely autofill)
          if (newValue !== oldValue && newValue !== '' && document.activeElement !== field) {
            hasAutofill = true;
            fieldValues.set(field, newValue);
            
            // Add field name to list
            if (fieldName) {
              autofilledFields.push(fieldName);
            }
            
            // Don't dispatch change events for country field as it has side effects (loads states)
            // The state management should handle keeping the autofilled state value
            if (fieldName !== 'country' && fieldName !== 'billing-country') {
              // Only dispatch change event (not input) to update store
              field.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
        }
      });
      
      // If we detected autofill, check for shipping info tracking
      if (hasAutofill && autofilledFields.length > 0) {
        this.logger.info('Browser autofill detected for fields:', autofilledFields);
        
        // Small delay to ensure store is updated
        setTimeout(() => {
          const checkoutStore = useCheckoutStore.getState();
          if (!this.hasTrackedShippingInfo && checkoutStore.formData.city && checkoutStore.formData.province) {
            try {
              const shippingMethod = checkoutStore.shippingMethod;
              const shippingTier = shippingMethod ? shippingMethod.name : 'Standard';
              nextAnalytics.track(EcommerceEvents.createAddShippingInfoEvent(shippingTier));
              this.hasTrackedShippingInfo = true;
              this.logger.info('Tracked add_shipping_info event (browser autofill)', { shippingTier });
            } catch (error) {
              this.logger.warn('Failed to track add_shipping_info event after browser autofill:', error);
            }
          }
        }, 100);
      }
      
      // Stop checking after max attempts
      if (checkCount >= maxChecks) {
        clearInterval(checkInterval);
        this.logger.debug('Stopped autofill detection after 30 seconds');
      }
    }, 500);
    
    // Store interval for cleanup
    (this as any).autofillInterval = checkInterval;
  }

  private setupEventHandlers(): void {
    this.submitHandler = this.handleFormSubmit.bind(this);
    this.form.addEventListener('submit', this.submitHandler);
    
    this.changeHandler = this.handleFieldChange.bind(this);
    [...this.fields.values(), ...this.billingFields.values()].forEach(field => {
      if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) {
        field.addEventListener('change', this.changeHandler!);
        field.addEventListener('blur', this.changeHandler!);
        
        // Add input event listener for better autofill detection
        field.addEventListener('input', this.changeHandler!);
      }
    });
    
    // Set up Chrome autofill detection
    this.setupAutofillDetection();
    
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
    
    // Note: Credit card error clearing is handled by CreditCardService via Spreedly events
  }

  // ============================================================================
  // CURRENCY MANAGEMENT
  // ============================================================================

  // Currency handling has been moved to initialization only
  // Currency is now based on user's detected location and URL parameters
  // Shipping country changes no longer affect currency

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

  private async populateFormData(): Promise<void> {
    const checkoutStore = useCheckoutStore.getState();

    console.log('%c[populateFormData] Starting form population', 'color: #FFA500; font-weight: bold', {
      storedData: checkoutStore.formData,
      country: checkoutStore.formData.country,
      province: checkoutStore.formData.province
    });

    // Check if country is stored and different from current
    const storedCountry = checkoutStore.formData.country;
    const countryField = this.fields.get('country');

    if (storedCountry && countryField instanceof HTMLSelectElement) {
      // Set country first
      countryField.value = storedCountry;
      console.log('%c[populateFormData] Set country field', 'color: #00CED1', {
        storedCountry,
        fieldValue: countryField.value,
        detectedCountryCode: this.detectedCountryCode
      });

      // If country changed, load states for that country
      const currentCountryValue = countryField.value;
      if (currentCountryValue && currentCountryValue !== this.detectedCountryCode) {
        this.logger.info(`Restoring saved country: ${currentCountryValue}`);
        console.log('%c[populateFormData] Loading states for restored country', 'color: #FFD700', currentCountryValue);

        // Load states for the stored country
        const provinceField = this.fields.get('province');
        if (provinceField instanceof HTMLSelectElement) {
          console.log('%c[populateFormData] Before updateStateOptions', 'color: #FF6347', {
            country: currentCountryValue,
            provinceField: provinceField,
            currentOptions: Array.from(provinceField.options).map(o => o.value)
          });

          await this.updateStateOptions(currentCountryValue, provinceField);

          console.log('%c[populateFormData] After updateStateOptions', 'color: #32CD32', {
            country: currentCountryValue,
            provinceField: provinceField,
            newOptions: Array.from(provinceField.options).map(o => o.value),
            optionsCount: provinceField.options.length
          });
        }
      }
    }

    // Now populate all fields including province
    this.fields.forEach((field, name) => {
      if (checkoutStore.formData[name] && (field instanceof HTMLInputElement || field instanceof HTMLSelectElement)) {
        // Skip province if we just loaded states - it will be set below
        if (name !== 'province' || !(field instanceof HTMLSelectElement)) {
          field.value = checkoutStore.formData[name];
          console.log(`[populateFormData] Set field ${name} =`, checkoutStore.formData[name]);
        }
      }
    });

    // Set province value after states are loaded
    const storedProvince = checkoutStore.formData.province;
    const provinceField = this.fields.get('province');

    console.log('%c[populateFormData] Setting province', 'color: #FF1493; font-weight: bold', {
      storedProvince,
      provinceField: provinceField,
      isSelect: provinceField instanceof HTMLSelectElement
    });

    if (storedProvince && provinceField instanceof HTMLSelectElement) {
      const availableOptions = Array.from(provinceField.options).map(opt => ({
        value: opt.value,
        text: opt.text
      }));

      console.log('%c[populateFormData] Province field options', 'color: #9370DB', {
        storedProvince,
        availableOptions,
        optionsCount: provinceField.options.length
      });

      // Check if the option exists
      const optionExists = Array.from(provinceField.options).some(opt => opt.value === storedProvince);

      console.log('%c[populateFormData] Province option check', 'color: #FF4500', {
        storedProvince,
        optionExists,
        availableValues: availableOptions.map(o => o.value)
      });

      if (optionExists) {
        provinceField.value = storedProvince;
        // IMPORTANT: Also update the store since updateStateOptions cleared it
        this.updateFormData({ province: storedProvince });
        console.log('%c[populateFormData] ✅ Province set successfully', 'color: #00FF00; font-weight: bold', {
          storedProvince,
          fieldValue: provinceField.value,
          storeUpdated: true
        });
        this.logger.debug(`Restored province: ${storedProvince}`);
      } else {
        console.log('%c[populateFormData] ❌ Province NOT set - option not found', 'color: #FF0000; font-weight: bold', {
          storedProvince,
          availableOptions
        });
        this.logger.warn(`Province ${storedProvince} not found in options for country ${storedCountry}`);
      }
    } else {
      console.log('%c[populateFormData] Province not set', 'color: #FFA500', {
        hasStoredProvince: !!storedProvince,
        hasProvinceField: !!provinceField,
        isSelectElement: provinceField instanceof HTMLSelectElement
      });
    }

    // Update floating labels for populated data
    this.ui.updateLabelsForPopulatedData();

    console.log('%c[populateFormData] Form population complete', 'color: #00FF00; font-weight: bold');
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
          accepts_marketing: true
        };
        
        checkoutStore.clearAllErrors();
        this.validator.clearAllErrors();
        checkoutStore.updateFormData(testFormData);
        checkoutStore.setPaymentMethod('credit-card');
        checkoutStore.setPaymentToken('test_card');
        checkoutStore.setSameAsShipping(true);
        // Use existing shipping method from cart if available
        const cartStore = useCartStore.getState();
        const existingShipping = cartStore.shippingMethod || checkoutStore.shippingMethod;
        if (existingShipping) {
          checkoutStore.setShippingMethod(existingShipping);
        } else {
          // Fallback to first available from campaign
          const campaignStore = useCampaignStore.getState();
          if (campaignStore.data?.shipping_methods && campaignStore.data.shipping_methods.length > 0) {
            const firstMethod = campaignStore.data.shipping_methods[0];
            if (firstMethod) {
              checkoutStore.setShippingMethod({
                id: firstMethod.ref_id,
                name: firstMethod.code,
                price: parseFloat(firstMethod.price || '0'),
                code: firstMethod.code
              });
            }
          } else {
            // Last resort fallback
            checkoutStore.setShippingMethod({
              id: 1,
              name: 'Standard Shipping',
              price: 0,
              code: 'standard'
            });
          }
        }
        
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
    }
    // Note: We do NOT call clearAllErrors when state has no errors
    // because that would mark all fields as valid prematurely.
    // Errors should only be cleared field-by-field as they're fixed.
    
    // Check if address1 was updated and show location fields if needed
    if (state.formData?.address1 && state.formData.address1.trim().length > 0) {
      this.showLocationFields();
    }
    
    // Handle processing state
    if (state.isProcessing) {
      // Disable submit button when processing
      if (this.submitButton) {
        this.submitButton.disabled = true;
        this.submitButton.setAttribute('aria-busy', 'true');
      }
    } else {
      // Enable submit button when not processing
      if (this.submitButton) {
        this.submitButton.disabled = false;
        this.submitButton.setAttribute('aria-busy', 'false');
      }
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
    this.setOrCreateMetaTag('next-next-url', url);
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
        field.removeEventListener('input', this.changeHandler!);
      });
    }
    
    // Clear autofill detection interval
    if ((this as any).autofillInterval) {
      clearInterval((this as any).autofillInterval);
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

  private displayPaymentError(message: string): void {
    this.logger.info('[Payment Error] Displaying error:', message);

    // Use a slight delay to ensure DOM is ready
    setTimeout(() => {
      // Find the credit error container
      const errorContainer = document.querySelector('[data-next-component="credit-error"]');
      if (errorContainer instanceof HTMLElement) {
        // Find the message element
        const messageElement = errorContainer.querySelector('[data-next-component="credit-error-text"]');
        if (messageElement) {
          messageElement.textContent = message;
        }

        // Force show the error container
        errorContainer.style.display = 'flex';
        errorContainer.style.visibility = 'visible';
        errorContainer.style.opacity = '1';
        errorContainer.classList.add('visible');
        errorContainer.classList.remove('hidden');

        // Remove any inline styles that might be hiding it
        if (errorContainer.style.display === 'none') {
          errorContainer.style.removeProperty('display');
          errorContainer.style.display = 'flex';
        }

        this.logger.info('[Payment Error] Error container shown with message:', message);

        // Auto-hide after 10 seconds
        setTimeout(() => {
          errorContainer.style.display = 'none';
          errorContainer.classList.remove('visible');
        }, 10000);
      } else {
        this.logger.error('[Payment Error] Could not find error container element');
      }
    }, 100); // Small delay to ensure DOM is ready

    // Also emit an event for other components to handle
    this.emit('payment:error', { errors: [message] });
  }

  /**
   * Track begin_checkout event when checkout form initializes
   * This should be the ONLY place where begin_checkout is fired
   */
  private trackBeginCheckout(): void {
    // Prevent duplicate tracking
    if (this.hasTrackedBeginCheckout) {
      this.logger.debug('begin_checkout already tracked, skipping duplicate');
      return;
    }

    try {
      const cartStore = useCartStore.getState();
      const checkoutStore = useCheckoutStore.getState();

      // Only track if cart has items
      if (!cartStore.isEmpty && cartStore.items.length > 0) {
        this.hasTrackedBeginCheckout = true;

        // Track through analytics (this handles GTM, Facebook, etc.)
        nextAnalytics.track(EcommerceEvents.createBeginCheckoutEvent());

        // Only emit internal event for UI components that need to know checkout started
        // NOT for analytics tracking - that's already handled above
        this.emit('checkout:started', {
          formData: checkoutStore.formData,
          paymentMethod: checkoutStore.paymentMethod,
          isProcessing: checkoutStore.isProcessing,
          step: checkoutStore.step
        });

        this.logger.info('Tracked begin_checkout event on checkout form initialization');
      }
    } catch (error) {
      this.logger.warn('Failed to track begin_checkout event:', error);
    }
  }

  public override destroy(): void {
    // Clear any pending animation timers
    if (this.billingAnimationDebounceTimer) {
      clearTimeout(this.billingAnimationDebounceTimer);
    }
    
    // Clear all animation timeouts
    this.billingAnimationTimeouts.forEach(timeout => clearTimeout(timeout));
    this.billingAnimationTimeouts.clear();
    
    if (this.validator) {
      this.validator.destroy();
    }
    
    if (this.creditCardService) {
      this.creditCardService.destroy();
    }
    
    if (this.prospectCartEnhancer) {
      this.prospectCartEnhancer.destroy();
    }
    
    this.phoneInputs.forEach((instance) => {
      try {
        instance.destroy();
      } catch (error) {
        // Ignore errors during cleanup
      }
    });
    this.phoneInputs.clear();
    
    // Clean up autocomplete instances
    this.autocompleteInstances.clear();
    
    this.fields.clear();
    this.billingFields.clear();
    this.paymentButtons.clear();
    
    super.destroy();
  }
}