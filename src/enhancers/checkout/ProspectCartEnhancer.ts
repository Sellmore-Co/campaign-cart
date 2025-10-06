/**
 * Prospect Cart Enhancer
 * Handles creation and management of prospect carts for non-logged-in users
 */

import { BaseEnhancer } from '@/enhancers/base/BaseEnhancer';
import { useCartStore } from '@/stores/cartStore';
import { useConfigStore } from '@/stores/configStore';
import { useCampaignStore } from '@/stores/campaignStore';
import { useAttributionStore } from '@/stores/attributionStore';
import { ApiClient } from '@/api/client';
import type { CartBase, UserCreateCart } from '@/types/api';

export interface ProspectCartConfig {
  autoCreate?: boolean;
  triggerOn?: 'formStart' | 'emailEntry' | 'manual';
  emailField?: string;
  includeUtmData?: boolean;
  sessionTimeout?: number; // minutes
}

export interface ProspectCart {
  id: string;
  prospect_id: string;
  email?: string;
  created_at: string;
  expires_at: string;
  utm_data?: Record<string, string>;
  cart_data?: any;
}

export class ProspectCartEnhancer extends BaseEnhancer {
  private config: ProspectCartConfig = {
    autoCreate: true,
    triggerOn: 'emailEntry',
    emailField: 'email',
    includeUtmData: true,
    sessionTimeout: 30
  };
  
  private apiClient!: ApiClient;
  private prospectCart: ProspectCart | undefined;
  private emailField?: HTMLInputElement;
  private hasTriggered = false;

  public async initialize(): Promise<void> {
    this.validateElement();

    this.logger.info('Initializing ProspectCartEnhancer', {
      element: this.element.tagName,
      config: this.config
    });

    // Initialize API client
    const config = useConfigStore.getState();
    this.apiClient = new ApiClient(config.apiKey);

    // Load configuration
    this.loadConfig();

    // Find email field
    this.findEmailField();

    // Subscribe to cart changes
    this.subscribe(useCartStore, this.handleCartUpdate.bind(this));

    // Setup triggers based on configuration
    this.setupTriggers();

    // Check for existing prospect cart
    this.checkExistingProspectCart();

    this.logger.debug('ProspectCartEnhancer initialized', {
      emailFieldFound: !!this.emailField,
      triggerOn: this.config.triggerOn,
      autoCreate: this.config.autoCreate
    });
  }

  public update(data?: any): void {
    if (data?.config) {
      this.config = { ...this.config, ...data.config };
      this.setupTriggers();
    }
  }

  private loadConfig(): void {
    // Load from data attributes
    const configAttr = this.getAttribute('data-prospect-config');
    if (configAttr) {
      try {
        const customConfig = JSON.parse(configAttr);
        this.config = { ...this.config, ...customConfig };
      } catch (error) {
        this.logger.warn('Invalid prospect config JSON:', error);
      }
    }

    // Override with specific attributes
    if (this.hasAttribute('data-auto-create')) {
      this.config.autoCreate = this.getAttribute('data-auto-create') !== 'false';
    }

    if (this.hasAttribute('data-trigger-on')) {
      const triggerOn = this.getAttribute('data-trigger-on');
      if (triggerOn && (triggerOn === 'formStart' || triggerOn === 'emailEntry' || triggerOn === 'manual')) {
        this.config.triggerOn = triggerOn;
      }
    }

    if (this.hasAttribute('data-email-field')) {
      const emailField = this.getAttribute('data-email-field');
      if (emailField) {
        this.config.emailField = emailField;
      }
    }
  }

  private findEmailField(): void {
    const selectors = [
      '[data-next-checkout-field="email"]',
      '[os-checkout-field="email"]',
      `input[name="${this.config.emailField}"]`,
      'input[type="email"]',
      'input[data-field="email"]',
      'input[name*="email"]'
    ];

    for (const selector of selectors) {
      const field = this.element.querySelector(selector) as HTMLInputElement;
      if (field) {
        this.emailField = field;
        this.logger.debug('Found email field with selector:', selector);
        break;
      }
    }

    if (!this.emailField) {
      this.logger.warn('Email field not found for prospect cart');
    }
  }
  
  /**
   * Get formatted phone number in E.164 format from existing intlTelInput instance
   */
  private getFormattedPhoneNumber(): string {
    // Find the phone field
    const phoneField = this.element.querySelector('[data-next-checkout-field="phone"], [os-checkout-field="phone"], input[name="phone"], input[type="tel"]') as HTMLInputElement;
    
    if (!phoneField) {
      return '';
    }
    
    // Check if intlTelInput instance exists on the element (created by CheckoutFormEnhancer)
    const intlTelInputInstance = (window as any).intlTelInputGlobals?.getInstance?.(phoneField);
    
    if (intlTelInputInstance && typeof intlTelInputInstance.getNumber === 'function') {
      try {
        const e164Number = intlTelInputInstance.getNumber();
        if (e164Number) {
          this.logger.debug('Got E.164 formatted phone from existing instance:', e164Number);
          return e164Number;
        }
      } catch (error) {
        this.logger.warn('Failed to get E.164 formatted phone from existing instance:', error);
      }
    }
    
    // Fallback to raw phone value if intlTelInput not available or not initialized
    this.logger.debug('Using raw phone value (intlTelInput instance not found)');
    return phoneField.value || '';
  }

  private setupTriggers(): void {
    if (!this.config.autoCreate) return;

    switch (this.config.triggerOn) {
      case 'formStart':
        this.setupFormStartTrigger();
        break;
      case 'emailEntry':
        this.setupEmailEntryTrigger();
        break;
      case 'manual':
        // No automatic triggers, only manual creation
        break;
    }
  }

  private setupFormStartTrigger(): void {
    // Trigger when user starts filling any form field
    const formFields = this.element.querySelectorAll('input, select, textarea');
    
    formFields.forEach(field => {
      const handler = () => {
        if (!this.hasTriggered) {
          this.createProspectCart();
          this.hasTriggered = true;
        }
      };

      field.addEventListener('focus', handler, { once: true });
      field.addEventListener('input', handler, { once: true });
    });
  }

  // Store timeouts at class level to coordinate between blur and updateEmail
  private emailInputTimeout: number | undefined;
  private emailBlurTimeout: number | undefined;

  private setupEmailEntryTrigger(): void {
    if (!this.emailField) {
      this.logger.warn('Cannot setup email entry trigger - email field not found');
      return;
    }

    this.logger.debug('Setting up email entry trigger on field:', this.emailField);

    // Find first name and last name fields
    const firstNameField = this.element.querySelector('[data-next-checkout-field="fname"], [os-checkout-field="fname"], input[name="first_name"]') as HTMLInputElement;
    const lastNameField = this.element.querySelector('[data-next-checkout-field="lname"], [os-checkout-field="lname"], input[name="last_name"]') as HTMLInputElement;

    let blurTimeout: number | undefined;
    let lastEmailValue = '';

    // Handler for checking if we should create cart
    const checkForCartCreation = () => {
      // Clear any existing timeout
      if (blurTimeout) {
        clearTimeout(blurTimeout);
      }
      
      blurTimeout = window.setTimeout(() => {
        this.logger.debug('Checking if all required fields are valid for cart creation');
        this.checkAndCreateCart();
      }, 300); // 300ms delay to catch rapid blur events
    };

    // Set up email field listeners
    this.emailField.addEventListener('blur', () => {
      const currentEmail = this.emailField!.value.trim();
      
      // Only process if email has changed and appears complete
      if (currentEmail !== lastEmailValue && currentEmail.length > 0) {
        lastEmailValue = currentEmail;
        
        this.logger.debug('Email blur event processed, value:', currentEmail);
        
        // Only check if email looks complete (has @ and a domain with TLD)
        if (currentEmail.includes('@') && currentEmail.split('@')[1]?.includes('.')) {
          checkForCartCreation();
        } else {
          this.logger.debug('Email appears incomplete, skipping cart creation:', currentEmail);
        }
      }
    });

    // Also listen for change event on email (more reliable for autofill)
    this.emailField.addEventListener('change', () => {
      const currentEmail = this.emailField!.value.trim();
      if (this.isValidEmail(currentEmail)) {
        this.logger.debug('Valid email detected on change event:', currentEmail);
        checkForCartCreation();
      }
    });

    // Set up first name field listeners
    if (firstNameField) {
      firstNameField.addEventListener('blur', () => {
        const firstName = firstNameField.value.trim();
        if (firstName.length >= 2) {
          this.logger.debug('First name blur event, checking cart creation');
          checkForCartCreation();
        }
      });
      
      firstNameField.addEventListener('change', () => {
        const firstName = firstNameField.value.trim();
        if (this.isValidName(firstName)) {
          this.logger.debug('Valid first name detected on change event:', firstName);
          checkForCartCreation();
        }
      });
    }

    // Set up last name field listeners
    if (lastNameField) {
      lastNameField.addEventListener('blur', () => {
        const lastName = lastNameField.value.trim();
        if (lastName.length >= 2) {
          this.logger.debug('Last name blur event, checking cart creation');
          checkForCartCreation();
        }
      });
      
      lastNameField.addEventListener('change', () => {
        const lastName = lastNameField.value.trim();
        if (this.isValidName(lastName)) {
          this.logger.debug('Valid last name detected on change event:', lastName);
          checkForCartCreation();
        }
      });
    }
  }

  private checkExistingProspectCart(): void {
    // Check for existing prospect cart in session storage
    const stored = sessionStorage.getItem('next_prospect_cart');
    if (stored) {
      try {
        const prospectCart = JSON.parse(stored);
        
        // Check if cart is still valid (not expired)
        const expiresAt = new Date(prospectCart.expires_at);
        if (expiresAt > new Date()) {
          this.prospectCart = prospectCart;
          this.logger.debug('Restored existing prospect cart:', prospectCart.id);
        } else {
          // Remove expired cart
          sessionStorage.removeItem('next_prospect_cart');
        }
      } catch (error) {
        this.logger.warn('Failed to parse stored prospect cart:', error);
        sessionStorage.removeItem('next_prospect_cart');
      }
    }
  }

  private async createProspectCart(): Promise<void> {
    if (this.prospectCart) {
      this.logger.debug('Prospect cart already exists');
      return;
    }

    this.logger.info('Starting prospect cart creation');

    try {
      const cartState = useCartStore.getState();
      const email = this.emailField?.value || '';
      
      this.logger.debug('Cart state:', {
        isEmpty: cartState.isEmpty,
        itemCount: cartState.items.length,
        items: cartState.items,
        email: email
      });
      
      // Don't create cart if no items
      if (cartState.isEmpty || cartState.items.length === 0) {
        this.logger.warn('No items in cart, skipping prospect cart creation');
        return;
      }
      
      // Get all available form data
      const firstName = (this.element.querySelector('[data-next-checkout-field="fname"], [os-checkout-field="fname"], input[name="first_name"]') as HTMLInputElement)?.value || '';
      const lastName = (this.element.querySelector('[data-next-checkout-field="lname"], [os-checkout-field="lname"], input[name="last_name"]') as HTMLInputElement)?.value || '';
      // Get phone in E.164 format if possible
      const phone = this.getFormattedPhoneNumber();

      // Get accepts_marketing checkbox value (defaults to true if not present)
      const acceptsMarketingCheckbox = this.element.querySelector('[data-next-checkout-field="accepts_marketing"], [os-checkout-field="accepts_marketing"], input[name="accepts_marketing"]') as HTMLInputElement;
      const acceptsMarketing = acceptsMarketingCheckbox?.checked ?? true;

      // NOTE: Address data collection is intentionally disabled
      // We do not send address data with prospect carts

      // Get attribution from the attribution store (this has all the tracking data)
      const attributionStore = useAttributionStore.getState();
      const attribution = attributionStore.getAttributionForApi();

      // Update metadata with current page information since we're on the checkout page
      if (attribution.metadata) {
        // Update landing_page to current URL
        attribution.metadata.landing_page = window.location.href;

        // Update referrer if it's empty
        if (!attribution.metadata.referrer) {
          attribution.metadata.referrer = document.referrer || '';
        }

        // Update domain if it's empty
        if (!attribution.metadata.domain) {
          attribution.metadata.domain = window.location.hostname;
        }

        // Update device if it's empty
        if (!attribution.metadata.device) {
          attribution.metadata.device = navigator.userAgent || '';
        }

        // Update timestamp to current time
        attribution.metadata.timestamp = Date.now();
      }

      // Ensure funnel is set to CH01 for checkout
      if (!attribution.funnel || attribution.funnel === '') {
        attribution.funnel = 'CH01';
      }

      // Build user data
      const user: UserCreateCart = {
        first_name: firstName,
        last_name: lastName,
        language: 'en',
        accepts_marketing: acceptsMarketing
      };
      
      // Add email only if it exists
      if (email) {
        user.email = email;
      }
      
      // Add phone if it exists (in E.164 format)
      if (phone) {
        user.phone_number = phone;
      }
      
      // Build cart data according to CartBase interface
      const cartData: CartBase = {
        lines: cartState.items.map(item => ({
          package_id: item.packageId,
          quantity: item.quantity,
          is_upsell: item.is_upsell || false
        })),
        user,
        currency: this.getCurrency()
      };
      
      // ADDRESS DATA IS INTENTIONALLY NOT INCLUDED
      // We do not send address data with prospect carts to avoid any potential issues
      // Address will be collected and sent only during the actual checkout process
      
      // Add attribution if it has data
      if (attribution && Object.keys(attribution).length > 0) {
        cartData.attribution = attribution;
      }

      this.logger.debug('Creating prospect cart with data:', {
        hasAddress: false, // Address is intentionally excluded
        hasAttribution: !!cartData.attribution,
        attribution: attribution,
        userData: cartData.user,
        itemCount: cartData.lines.length
      });

      // Create cart using standard API
      let cart;
      try {
        cart = await this.apiClient.createCart(cartData);
      } catch (initialError) {
        // If the initial request fails, try with just email
        this.logger.warn('Initial prospect cart creation failed, retrying with minimal data:', initialError);
        
        // Only retry if we have a valid email
        if (!this.isValidEmail(email)) {
          throw initialError;
        }
        
        // Create minimal cart data with just email and cart items
        const minimalCartData: CartBase = {
          lines: cartState.items.map((item: any) => ({
            package_id: item.packageId,
            quantity: item.quantity
          })),
          user: {
            email: email,
            first_name: '',  // Required field, but empty for minimal cart
            last_name: '',   // Required field, but empty for minimal cart
            language: 'en'   // Default to English
          },
          currency: this.getCurrency()
        };
        
        // Don't include attribution or address in the retry
        this.logger.info('Retrying prospect cart creation with minimal data (email only)');
        
        try {
          cart = await this.apiClient.createCart(minimalCartData);
          this.logger.info('Successfully created prospect cart with minimal data');
        } catch (retryError) {
          this.logger.error('Failed to create prospect cart even with minimal data:', retryError);
          throw retryError;
        }
      }
      
      // Store cart info as prospect cart
      this.prospectCart = {
        id: cart.checkout_url || '', // Use checkout URL as ID
        prospect_id: cart.checkout_url || '',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + (this.config.sessionTimeout || 30) * 60 * 1000).toISOString(),
        utm_data: this.collectUtmData(),
        cart_data: cart
      };
      
      if (email) {
        this.prospectCart.email = email;
      }
      
      // Store in session
      sessionStorage.setItem('next_prospect_cart', JSON.stringify(this.prospectCart));
      
      // Emit event
      this.emitProspectEvent('cart-created', { cart, prospectCart: this.prospectCart });
      
      this.logger.info('Prospect cart created with checkout URL:', cart.checkout_url);
    } catch (error) {
      this.logger.error('Failed to create prospect cart:', error);
    }
  }

  private async updateProspectCart(): Promise<void> {
    if (!this.prospectCart) return;

    // Since we're using standard cart API, we don't update existing carts
    // Instead, we'll create a new one if needed
    this.logger.debug('Prospect cart update skipped - using standard cart API');
  }

  private collectUtmData(): Record<string, string> {
    const params = new URLSearchParams(window.location.search);
    const utmData: Record<string, string> = {};
    
    const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    
    utmParams.forEach(param => {
      const value = params.get(param);
      if (value) {
        utmData[param] = value;
      }
    });

    // Also check for stored UTM data from previous pages
    const storedUtm = sessionStorage.getItem('next_utm_data');
    if (storedUtm) {
      try {
        const stored = JSON.parse(storedUtm);
        Object.assign(utmData, stored);
      } catch (error) {
        this.logger.warn('Failed to parse stored UTM data:', error);
      }
    }

    // Store current UTM data for future use
    if (Object.keys(utmData).length > 0) {
      sessionStorage.setItem('next_utm_data', JSON.stringify(utmData));
    }

    return utmData;
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

  private isValidEmail(email: string): boolean {
    // More robust email validation regex that supports all valid TLDs
    // Matches: user@domain.com, user.name@domain.co.uk, user@example.co
    // Rejects: test@test....com, spaces, etc.
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
    
    // Additional validation rules
    if (!emailRegex.test(email)) {
      return false;
    }
    
    // Check for consecutive dots in local or domain part
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
    
    return true;
  }

  private isValidName(name: string): boolean {
    // Name must not be empty
    if (!name || name.trim().length === 0) {
      return false;
    }
    
    // Name must be at least 2 characters
    if (name.trim().length < 2) {
      return false;
    }
    
    // Name can only contain letters, spaces, hyphens, apostrophes, and accented characters
    const nameRegex = /^[A-Za-zÀ-ÿ]+(?:[' -][A-Za-zÀ-ÿ]+)*$/;
    return nameRegex.test(name.trim());
  }

  private handleCartUpdate(cartState: any): void {
    // Update prospect cart when cart changes
    if (this.prospectCart && !cartState.isEmpty) {
      // Debounce updates
      clearTimeout(this.updateTimeout);
      this.updateTimeout = window.setTimeout(() => {
        this.updateProspectCart();
      }, 1000);
    }
  }

  private updateTimeout: number = 0;

  private emitProspectEvent(type: string, data?: any): void {
    const event = new CustomEvent(`next:prospect-${type}`, {
      detail: data,
      bubbles: true
    });
    
    this.element.dispatchEvent(event);
  }

  // Public API methods
  public async createCartManually(): Promise<ProspectCart | null> {
    await this.createProspectCart();
    return this.prospectCart || null;
  }

  public getCurrentProspectCart(): ProspectCart | null {
    return this.prospectCart || null;
  }

  public async abandonCart(): Promise<void> {
    if (!this.prospectCart) return;

    this.emitProspectEvent('cart-abandoned', { prospectCart: this.prospectCart });
    
    // Clear stored cart
    sessionStorage.removeItem('next_prospect_cart');
    this.prospectCart = undefined;
    
    this.logger.info('Prospect cart marked as abandoned');
  }

  public async convertCart(): Promise<void> {
    if (!this.prospectCart) return;

    this.emitProspectEvent('cart-converted', { prospectCart: this.prospectCart });
    
    // Clear stored cart as it's now converted to a real order
    sessionStorage.removeItem('next_prospect_cart');
    this.prospectCart = undefined;
    
    this.logger.info('Prospect cart converted to order');
  }

  private updateEmailTimeout: number | undefined;
  
  public updateEmail(email: string): void {
    if (this.emailField) {
      this.emailField.value = email;
    }
    
    // Only check cart creation if email is valid
    if (this.isValidEmail(email.trim())) {
      this.checkAndCreateCart();
    } else {
      this.logger.debug('updateEmail called with invalid email:', email);
    }
  }
  
  /**
   * Check if we have enough data to create prospect cart and create it immediately
   */
  public checkAndCreateCart(): void {
    // Get current form values
    const email = (this.element.querySelector('[data-next-checkout-field="email"], [os-checkout-field="email"], input[type="email"]') as HTMLInputElement)?.value?.trim() || '';
    const firstName = (this.element.querySelector('[data-next-checkout-field="fname"], [os-checkout-field="fname"], input[name="first_name"]') as HTMLInputElement)?.value?.trim() || '';
    const lastName = (this.element.querySelector('[data-next-checkout-field="lname"], [os-checkout-field="lname"], input[name="last_name"]') as HTMLInputElement)?.value?.trim() || '';
    
    // Validate all required fields
    const hasValidEmail = this.isValidEmail(email);
    const hasValidFirstName = this.isValidName(firstName);
    const hasValidLastName = this.isValidName(lastName);
    
    // Note: begin_checkout event is now tracked in CheckoutFormEnhancer on initialization
    
    // Check if prospect cart has already been created
    if (this.hasTriggered) {
      return;
    }
    
    // Log validation status
    this.logger.debug('Field validation status for cart creation:', {
      email: { value: email, valid: hasValidEmail },
      firstName: { value: firstName, valid: hasValidFirstName },
      lastName: { value: lastName, valid: hasValidLastName }
    });
    
    // Clear any pending timeout if any field is invalid
    if (!hasValidEmail || !hasValidFirstName || !hasValidLastName) {
      if (this.updateEmailTimeout !== undefined) {
        clearTimeout(this.updateEmailTimeout);
        this.updateEmailTimeout = undefined;
      }
      
      // Log why we're not creating cart
      if (!hasValidEmail) {
        this.logger.debug('Invalid or incomplete email, skipping cart creation:', email);
      } else if (!hasValidFirstName) {
        this.logger.debug('Invalid or missing first name, waiting for valid name:', firstName);
      } else if (!hasValidLastName) {
        this.logger.debug('Invalid or missing last name, waiting for valid name:', lastName);
      }
      
      return;
    }
    
    // All fields are valid - create cart immediately
    // Clear any pending timeouts
    if (this.updateEmailTimeout !== undefined) {
      clearTimeout(this.updateEmailTimeout);
      this.updateEmailTimeout = undefined;
    }
    if (this.emailBlurTimeout !== undefined) {
      clearTimeout(this.emailBlurTimeout);
    }
    if (this.emailInputTimeout !== undefined) {
      clearTimeout(this.emailInputTimeout);
    }
    
    this.logger.info('All required fields valid (email, fname, lname), creating prospect cart immediately', {
      email,
      firstName,
      lastName
    });
    
    this.createProspectCart();
    this.hasTriggered = true;
  }
}