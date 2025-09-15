/**
 * Express Checkout Container Enhancer
 * Handles the container element that dynamically shows/hides express checkout buttons
 * based on configuration from the configStore
 * 
 * Supports:
 * - data-next-express-checkout="container" - Container element
 * - data-next-express-checkout="buttons" - Target element for button injection
 * - Dynamic button creation based on config
 * - Show/hide logic based on available methods
 * - Express checkout button functionality (PayPal, Apple Pay, Google Pay)
 */

import { BaseEnhancer } from '@/enhancers/base/BaseEnhancer';
import { useConfigStore } from '@/stores/configStore';
import { useCartStore } from '@/stores/cartStore';
import { useCheckoutStore } from '@/stores/checkoutStore';
import { useCampaignStore } from '@/stores/campaignStore';
import { ApiClient } from '@/api/client';
import { OrderManager } from './managers/OrderManager';
import { ExpressCheckoutProcessor } from './processors/ExpressCheckoutProcessor';
import { PAYPAL_SVG, APPLE_PAY_SVG, GOOGLE_PAY_SVG } from './constants/payment-icons';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { isApplePayAvailable, isGooglePayAvailable, isPayPalAvailable, getPaymentCapabilities } from '@/utils/paymentAvailability';
import * as AmplitudeAnalytics from '@/utils/analytics/amplitude';
import type { PaymentConfig, CartState } from '@/types/global';
import type { PaymentMethodOption } from '@/types/api';

export class ExpressCheckoutContainerEnhancer extends BaseEnhancer {
  private buttonsContainer?: HTMLElement;
  private buttonInstances: Map<string, HTMLElement> = new Map();
  private buttonClickHandlers: Map<string, (event: Event) => void> = new Map();
  private paymentConfig?: PaymentConfig;
  private availableExpressMethods?: PaymentMethodOption[];
  private orderManager?: OrderManager;
  private expressProcessor?: ExpressCheckoutProcessor;
  private loadingOverlay: LoadingOverlay;
  private errorElement?: HTMLElement;
  private errorTextElement?: HTMLElement;

  constructor(element: HTMLElement) {
    super(element);
    this.loadingOverlay = new LoadingOverlay();
  }
  
  public async initialize(): Promise<void> {
    this.validateElement();
    
    const containerType = this.getAttribute('data-next-express-checkout');
    if (containerType !== 'container') {
      throw new Error('ExpressCheckoutContainerEnhancer can only be used on container elements');
    }
    
    // Log payment capabilities for debugging
    const capabilities = getPaymentCapabilities();
    this.logger.info('Payment capabilities detected:', capabilities);
    
    // Find buttons container
    this.buttonsContainer = this.element.querySelector('[data-next-express-checkout="buttons"]') as HTMLElement;
    if (!this.buttonsContainer) {
      this.logger.warn('No buttons container found with data-next-express-checkout="buttons"');
      return;
    }
    
    // Find error elements
    this.errorElement = document.querySelector('[data-next-component="express-error"]') as HTMLElement;
    this.errorTextElement = document.querySelector('[data-next-component="express-error-text"]') as HTMLElement;
    
    // Initially hide error element
    if (this.errorElement) {
      this.errorElement.style.display = 'none';
    }
    
    // Initialize dependencies
    const config = useConfigStore.getState();
    const apiClient = new ApiClient(config.apiKey);
    
    this.orderManager = new OrderManager(
      apiClient,
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
    
    // Subscribe to config changes
    this.subscribe(useConfigStore, this.handleConfigUpdate.bind(this));
    
    // Subscribe to campaign changes to get available payment methods
    this.subscribe(useCampaignStore, this.handleCampaignUpdate.bind(this));
    
    // Subscribe to cart changes to update button states
    this.subscribe(useCartStore, this.handleCartUpdate.bind(this));
    
    // Initial setup
    this.handleConfigUpdate(useConfigStore.getState());
    this.handleCampaignUpdate(useCampaignStore.getState());
    
    this.logger.debug('ExpressCheckoutContainerEnhancer initialized');
  }
  
  private handleConfigUpdate(state: any): void {
    const prevPaymentConfig = this.paymentConfig;
    this.paymentConfig = state.paymentConfig;
    
    // Only update buttons if payment config actually changed
    if (JSON.stringify(prevPaymentConfig) !== JSON.stringify(state.paymentConfig)) {
      this.updateExpressCheckoutButtons();
    }
  }
  
  private handleCampaignUpdate(state: any): void {
    const newExpressMethods = state.data?.available_express_payment_methods;
    
    // Check if express methods actually changed
    const methodsChanged = JSON.stringify(this.availableExpressMethods) !== JSON.stringify(newExpressMethods);
    
    if (methodsChanged) {
      this.availableExpressMethods = newExpressMethods;
      this.updateExpressCheckoutButtons();
    }
  }
  
  private async updateExpressCheckoutButtons(): Promise<void> {
    if (!this.buttonsContainer) {
      this.hideContainer();
      return;
    }
    
    // Use campaign data if available, otherwise fall back to config
    if (this.availableExpressMethods && this.availableExpressMethods.length > 0) {
      // Use campaign data
      this.showContainer();
      this.clearButtons();
      
      // Create buttons based on available express methods from campaign
      // BUT only if the device actually supports them
      for (const method of this.availableExpressMethods) {
        switch (method.code) {
          case 'paypal':
            if (isPayPalAvailable()) {
              this.createPayPalButton();
            } else {
              this.logger.debug('PayPal not available on this device');
            }
            break;
          case 'apple_pay':
            if (isApplePayAvailable()) {
              this.createApplePayButton();
            } else {
              this.logger.debug('Apple Pay not available on this device/browser');
            }
            break;
          case 'google_pay':
            if (isGooglePayAvailable()) {
              this.createGooglePayButton();
            } else {
              this.logger.debug('Google Pay not available on this device/browser');
            }
            break;
          default:
            this.logger.warn(`Unknown express payment method: ${method.code}`);
        }
      }
      
      const actuallyAvailable = this.buttonInstances.size > 0;
      this.logger.debug('Express checkout buttons updated from campaign data', {
        requestedMethods: this.availableExpressMethods.map(m => m.code),
        actuallyShown: Array.from(this.buttonInstances.keys()),
        hasVisibleButtons: actuallyAvailable
      });
      
      // Hide container if no buttons were actually created
      if (!actuallyAvailable) {
        this.hideContainer();
      }
    } else if (this.paymentConfig?.expressCheckout) {
      // Fall back to config-based setup
      const { enabled, methods } = this.paymentConfig.expressCheckout;
      
      if (!enabled) {
        this.hideContainer();
        return;
      }
      
      // Check if any method is enabled
      const hasEnabledMethods = Object.values(methods || {}).some(enabled => enabled);
      
      if (!hasEnabledMethods) {
        this.hideContainer();
        return;
      }
      
      // Show container
      this.showContainer();
      
      // Clear existing buttons
      this.clearButtons();
      
      // Create buttons for enabled methods
      // BUT only if the device actually supports them
      if (methods.paypal && isPayPalAvailable()) {
        this.createPayPalButton();
      } else if (methods.paypal) {
        this.logger.debug('PayPal enabled in config but not available on device');
      }
      
      if (methods.applePay && isApplePayAvailable()) {
        this.createApplePayButton();
      } else if (methods.applePay) {
        this.logger.debug('Apple Pay enabled in config but not available on device/browser');
      }
      
      if (methods.googlePay && isGooglePayAvailable()) {
        this.createGooglePayButton();
      } else if (methods.googlePay) {
        this.logger.debug('Google Pay enabled in config but not available on device/browser');
      }
      
      const actuallyAvailable = this.buttonInstances.size > 0;
      this.logger.debug('Express checkout buttons updated from config', {
        requestedMethods: {
          paypal: methods.paypal,
          applePay: methods.applePay,
          googlePay: methods.googlePay
        },
        actuallyShown: Array.from(this.buttonInstances.keys()),
        hasVisibleButtons: actuallyAvailable
      });
      
      // Hide container if no buttons were actually created
      if (!actuallyAvailable) {
        this.hideContainer();
      }
    } else {
      // No payment methods available
      this.hideContainer();
    }
  }
  
  private hideContainer(): void {
    this.element.style.display = 'none';
    this.logger.debug('Express checkout container hidden - no methods enabled');
  }
  
  private showContainer(): void {
    this.element.style.display = '';
    this.logger.debug('Express checkout container shown');
  }
  
  private clearButtons(): void {
    // Remove click handlers
    for (const [method, handler] of this.buttonClickHandlers) {
      const button = this.buttonInstances.get(method);
      if (button) {
        button.removeEventListener('click', handler);
      }
    }
    this.buttonClickHandlers.clear();
    
    // Remove buttons one by one (only if container exists)
    if (this.buttonsContainer) {
      while (this.buttonsContainer.firstChild) {
        this.buttonsContainer.removeChild(this.buttonsContainer.firstChild);
      }
    }
    this.buttonInstances.clear();
  }
  
  private async handleButtonClick(method: string, event: Event): Promise<void> {
    event.preventDefault();
    
    // Prevent double-clicks
    const button = event.currentTarget as HTMLButtonElement;
    if (button.disabled) return;
    
    // Hide any existing error when starting new attempt
    if (this.errorElement) {
      this.errorElement.style.display = 'none';
    }
    
    // Disable all express buttons
    for (const [, btn] of this.buttonInstances) {
      btn.setAttribute('disabled', 'true');
    }
    
    const cartStore = useCartStore.getState();
    const checkoutStore = useCheckoutStore.getState();
    
    // Track checkout events based on cart state
    if (cartStore.isEmpty) {
      // Track empty cart checkout attempt
      queueMicrotask(() => {
        AmplitudeAnalytics.trackEmptyCartCheckoutAttempt({
          paymentMethod: method,
          buttonLocation: 'express_checkout'
        });
      });
    } else {
      // Track normal checkout started
      queueMicrotask(() => {
        // Try to get country from checkout form if available, otherwise use default
        const country = checkoutStore.formData?.country || 
                       useConfigStore.getState().addressConfig?.defaultCountry || 
                       'US';
        
        AmplitudeAnalytics.trackCheckoutStarted({
          cartValue: cartStore.total,
          itemsCount: cartStore.totalQuantity,
          detectedCountry: country,
          paymentMethod: method // Pass the actual method (paypal, apple_pay, google_pay)
        });
      });
    }
    
    // let hasError = false;
    
    try {
      checkoutStore.setProcessing(true);
      checkoutStore.setPaymentMethod(method as any);
      
      // Use ExpressCheckoutProcessor to handle the checkout
      await this.expressProcessor!.handleExpressCheckout(
        method,
        cartStore.items,
        cartStore.isEmpty,
        () => cartStore.reset()
      );
      
      // If we reach here, it was successful - keep buttons disabled for 3 seconds
      setTimeout(() => {
        for (const [, btn] of this.buttonInstances) {
          if (!cartStore.isEmpty) {
            btn.removeAttribute('disabled');
          }
        }
      }, 3000);
      
    } catch (error) {
      // hasError = true;
      this.handleError(error, 'handleButtonClick');
      checkoutStore.setError('payment', 'Express checkout failed. Please try again.');
      
      // Show error message
      if (this.errorElement && this.errorTextElement) {
        const errorMessage = error instanceof Error ? error.message : 'Express checkout failed';
        this.errorTextElement.textContent = `${errorMessage}. Please try a different payment method.`;
        this.errorElement.style.display = 'flex';
        this.errorElement.style.position = 'relative';
        this.errorElement.style.zIndex = '10000'; // Higher than overlay
      }
      
      // Re-enable buttons immediately on error so user can try another method
      for (const [, btn] of this.buttonInstances) {
        if (!cartStore.isEmpty) {
          btn.removeAttribute('disabled');
        }
      }
    } finally {
      checkoutStore.setProcessing(false);
    }
  }
  
  private handleCartUpdate(cartState: CartState): void {
    // Update all button states based on cart
    for (const [, button] of this.buttonInstances) {
      if (cartState.isEmpty) {
        button.setAttribute('disabled', 'true');
        button.classList.add('next-cart-empty');
      } else {
        button.removeAttribute('disabled');
        button.classList.remove('next-cart-empty');
      }
    }
  }
  
  private async createPayPalButton(): Promise<void> {
    const button = this.createButton('paypal', 'cc-paypal', PAYPAL_SVG);
    button.style.backgroundColor = 'hsla(42.121212121212125, 100.00%, 61.18%, 1.00)';
    this.buttonInstances.set('paypal', button);
    this.buttonsContainer!.appendChild(button);
    
    // Add click handler
    const handler = (event: Event) => this.handleButtonClick('paypal', event);
    this.buttonClickHandlers.set('paypal', handler);
    button.addEventListener('click', handler);
    
    // Emit initialized event
    this.emit('express-checkout:initialized', {
      method: 'paypal',
      element: button
    });
    
    this.logger.debug('PayPal express checkout button created');
  }
  
  private async createApplePayButton(): Promise<void> {
    const button = this.createButton('apple_pay', 'cc-apple-pay', APPLE_PAY_SVG);
    button.style.color = 'hsla(0, 0.00%, 100.00%, 1.00)';
    this.buttonInstances.set('apple_pay', button);
    this.buttonsContainer!.appendChild(button);
    
    // Add click handler
    const handler = (event: Event) => this.handleButtonClick('apple_pay', event);
    this.buttonClickHandlers.set('apple_pay', handler);
    button.addEventListener('click', handler);
    
    // Emit initialized event
    this.emit('express-checkout:initialized', {
      method: 'apple_pay',
      element: button
    });
    
    this.logger.debug('Apple Pay express checkout button created');
  }
  
  private async createGooglePayButton(): Promise<void> {
    const button = this.createButton('google_pay', 'cc-google-pay', GOOGLE_PAY_SVG);
    this.buttonInstances.set('google_pay', button);
    this.buttonsContainer!.appendChild(button);
    
    // Add click handler
    const handler = (event: Event) => this.handleButtonClick('google_pay', event);
    this.buttonClickHandlers.set('google_pay', handler);
    button.addEventListener('click', handler);
    
    // Emit initialized event
    this.emit('express-checkout:initialized', {
      method: 'google_pay',
      element: button
    });
    
    this.logger.debug('Google Pay express checkout button created');
  }
  
  private createButton(method: string, className: string, svgContent: string): HTMLElement {
    const button = document.createElement('button');
    button.className = `payment-btn ${className}`;
    button.setAttribute('data-next-express-checkout', method);
    button.setAttribute('data-action', 'submit');
    
    
    // Apply inline styles from the template
    button.style.position = 'relative';
    button.style.display = 'flex';
    button.style.width = '100%';
    button.style.height = '2.75rem';
    button.style.justifyContent = 'center';
    button.style.alignItems = 'center';
    button.style.borderRadius = '4px';
    button.style.backgroundColor = 'hsla(0, 0.00%, 0.00%, 1.00)';
    button.style.border = 'none';
    button.style.cursor = 'pointer';
    
    // Content wrapper for logo
    const contentDiv = document.createElement('div');
    contentDiv.setAttribute('next-slot', 'content');
    
    // Logo container
    const logoDiv = document.createElement('div');
    if (method === 'apple_pay' || method === 'google_pay') {
      logoDiv.className = 'payment-btn__logo';
      logoDiv.style.height = '1.5rem';
    }
    logoDiv.innerHTML = svgContent;
    contentDiv.appendChild(logoDiv);
    button.appendChild(contentDiv);
    
    // Spinner container
    const spinnerDiv = document.createElement('div');
    spinnerDiv.className = 'payment-btn-spinner';
    spinnerDiv.setAttribute('next-slot', 'spinner');
    spinnerDiv.innerHTML = '<div class="spinner"></div>';
    button.appendChild(spinnerDiv);
    
    return button;
  }
  
  public update(): void {
    // Re-check configuration and update buttons
    this.handleConfigUpdate(useConfigStore.getState());
  }
  
  public override destroy(): void {
    this.clearButtons();
    super.destroy();
  }
}