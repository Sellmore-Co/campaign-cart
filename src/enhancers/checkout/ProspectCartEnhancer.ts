/**
 * Prospect Cart Enhancer
 * Handles creation and management of prospect carts for non-logged-in users
 */

import { BaseEnhancer } from '@/enhancers/base/BaseEnhancer';
import { useCartStore } from '@/stores/cartStore';
import { useConfigStore } from '@/stores/configStore';
import { useAttributionStore } from '@/stores/attributionStore';
import { ApiClient } from '@/api/client';
import type { CartBase, UserCreateCart, AddressCart } from '@/types/api';
import { nextAnalytics, EcommerceEvents } from '@/utils/analytics/index';

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
  private hasTrackedBeginCheckout = false;

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
  private emailInputTimeout?: number;
  private emailBlurTimeout?: number;

  private setupEmailEntryTrigger(): void {
    if (!this.emailField) {
      this.logger.warn('Cannot setup email entry trigger - email field not found');
      return;
    }

    this.logger.debug('Setting up email entry trigger on field:', this.emailField);

    // Trigger when email is entered - check immediately for all required fields
    this.emailField.addEventListener('blur', () => {
      this.logger.debug('Email blur event triggered, value:', this.emailField!.value);
      // Check if we have enough data to create cart immediately
      this.checkAndCreateCart();
    });

    // Don't need input handler anymore since we check on blur/change
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
      const phone = (this.element.querySelector('[data-next-checkout-field="phone"], [os-checkout-field="phone"], input[name="phone"]') as HTMLInputElement)?.value || '';
      
      // Get address data if available
      const address1 = (this.element.querySelector('[data-next-checkout-field="address1"], [os-checkout-field="address1"], input[name="address1"]') as HTMLInputElement)?.value || '';
      const address2 = (this.element.querySelector('[data-next-checkout-field="address2"], [os-checkout-field="address2"], input[name="address2"]') as HTMLInputElement)?.value || '';
      const city = (this.element.querySelector('[data-next-checkout-field="city"], [os-checkout-field="city"], input[name="city"]') as HTMLInputElement)?.value || '';
      const state = (this.element.querySelector('[data-next-checkout-field="province"], [os-checkout-field="province"], select[name="province"]') as HTMLInputElement)?.value || '';
      const postal = (this.element.querySelector('[data-next-checkout-field="postal"], [os-checkout-field="postal"], input[name="postal"]') as HTMLInputElement)?.value || '';
      const country = (this.element.querySelector('[data-next-checkout-field="country"], [os-checkout-field="country"], select[name="country"]') as HTMLSelectElement)?.value || '';
      
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
        accepts_marketing: false
      };
      
      // Add email only if it exists
      if (email) {
        user.email = email;
      }
      
      // Add phone if it exists
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
        user
      };
      
      // Only add address data if we have the required fields (first_name, last_name, line1, line4/city, and country)
      // The API requires these fields to be non-empty if address object is included
      if (firstName && lastName && address1 && city && country) {
        const addressData: AddressCart = {
          first_name: firstName,
          last_name: lastName,
          line1: address1,
          line4: city, // API expects city in line4
          country: country
        };
        
        // Only add optional fields if they have values
        if (address2) addressData.line2 = address2;
        if (state) addressData.state = state;
        if (postal) addressData.postcode = postal;
        if (phone) addressData.phone_number = phone;
        
        cartData.address = addressData;
      }
      
      // Add attribution if it has data
      if (attribution && Object.keys(attribution).length > 0) {
        cartData.attribution = attribution;
      }

      this.logger.debug('Creating prospect cart with data:', {
        hasAddress: !!cartData.address,
        hasAttribution: !!cartData.attribution,
        attribution: attribution,
        userData: cartData.user,
        itemCount: cartData.lines.length,
        addressData: cartData.address
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
          }
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

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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

  private updateEmailTimeout?: number;
  
  public updateEmail(email: string): void {
    if (this.emailField) {
      this.emailField.value = email;
    }
    
    // Don't set a timer, just check if we have enough data
    this.checkAndCreateCart();
  }
  
  /**
   * Check if we have enough data to create prospect cart and create it immediately
   */
  public checkAndCreateCart(): void {
    if (this.hasTriggered) {
      return;
    }
    
    // Get current form values
    const email = (this.element.querySelector('[data-next-checkout-field="email"], [os-checkout-field="email"], input[type="email"]') as HTMLInputElement)?.value || '';
    const firstName = (this.element.querySelector('[data-next-checkout-field="fname"], [os-checkout-field="fname"], input[name="first_name"]') as HTMLInputElement)?.value || '';
    const lastName = (this.element.querySelector('[data-next-checkout-field="lname"], [os-checkout-field="lname"], input[name="last_name"]') as HTMLInputElement)?.value || '';
    
    // Create cart immediately if we have valid email + first name + last name
    if (this.isValidEmail(email) && firstName.trim() !== '' && lastName.trim() !== '') {
      // Clear any pending timeouts
      clearTimeout(this.updateEmailTimeout);
      clearTimeout(this.emailBlurTimeout);
      clearTimeout(this.emailInputTimeout);
      
      this.logger.info('All required fields filled (email, fname, lname), creating prospect cart immediately');
      this.createProspectCart();
      this.hasTriggered = true;
      
      // Track begin_checkout event
      this.trackBeginCheckout();
    } else if (this.isValidEmail(email) && !this.updateEmailTimeout) {
      // If we only have email, set a timeout to wait for more data
      this.updateEmailTimeout = window.setTimeout(() => {
        this.logger.info('Creating prospect cart after timeout (only email available)');
        this.createProspectCart();
        this.hasTriggered = true;
        this.trackBeginCheckout();
      }, 5000);
      
      this.logger.debug(`Waiting for more data. Has email: ${!!email}, fname: ${!!firstName}, lname: ${!!lastName}`);
    }
  }
  
  /**
   * Track begin_checkout event when user starts checkout by entering email
   */
  private trackBeginCheckout(): void {
    if (!this.hasTrackedBeginCheckout) {
      try {
        const cartStore = useCartStore.getState();
        // Only track if cart has items
        if (!cartStore.isEmpty && cartStore.items.length > 0) {
          nextAnalytics.track(EcommerceEvents.createBeginCheckoutEvent());
          this.hasTrackedBeginCheckout = true;
          this.logger.info('Tracked begin_checkout event on email entry');
        }
      } catch (error) {
        this.logger.warn('Failed to track begin_checkout event:', error);
      }
    }
  }
}