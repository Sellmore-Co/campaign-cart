/**
 * Express Checkout Processor - Handles PayPal, Apple Pay, Google Pay
 */

import { EXPRESS_PAYMENT_METHOD_MAP } from '../constants/field-mappings';
import type { Logger } from '@/utils/logger';
import type { OrderManager } from '../managers/OrderManager';
import type { CartItem } from '@/types/global';
import { nextAnalytics, EcommerceEvents } from '@/utils/analytics/index';

export class ExpressCheckoutProcessor {
  constructor(
    private logger: Logger,
    private showLoadingCallback: () => void,
    private hideLoadingCallback: (immediate?: boolean) => void,
    private emitCallback: (event: string, data: any) => void,
    private orderManager: OrderManager
  ) {}

  public async handleExpressCheckout(
    method: string,
    cartItems: CartItem[],
    isCartEmpty: boolean,
    _resetCart: () => void
  ): Promise<void> {
    let hasError = false;
    
    try {
      this.showLoadingCallback();
      
      // Validate cart is not empty
      if (isCartEmpty) {
        this.logger.warn('Cannot checkout with empty cart');
        this.emitCallback('express-checkout:error', {
          method: method,
          error: 'Cart is empty'
        });
        hasError = true;
        return;
      }
      
      // Get mapped payment method
      const paymentMethod = EXPRESS_PAYMENT_METHOD_MAP[method] || method;

      // NOTE: begin_checkout is already tracked when the checkout page loads (in CheckoutFormEnhancer)
      // We should NOT track it again here - that would be a duplicate

      // Track add_payment_info event immediately for express methods
      try {
        const paymentTypeMap: Record<string, string> = {
          'paypal': 'PayPal',
          'apple_pay': 'Apple Pay',
          'google_pay': 'Google Pay'
        };
        const paymentType = paymentTypeMap[paymentMethod] || paymentMethod;
        nextAnalytics.track(EcommerceEvents.createAddPaymentInfoEvent(paymentType));
        this.logger.info('Tracked add_payment_info event for express checkout', { paymentType });
      } catch (analyticsError) {
        this.logger.warn('Failed to track add_payment_info event:', analyticsError);
      }
      
      // Emit express checkout started event
      this.emitCallback('express-checkout:started', { 
        method: paymentMethod,
        itemCount: cartItems.length
      });
      
      this.logger.info(`Express checkout initiated with ${method}`);
      
      // Create express order using OrderManager - just hit the API with the payment method
      const order = await this.orderManager.createExpressOrder(
        cartItems,
        paymentMethod as any
      );
      
      // Emit success event
      this.emitCallback('express-checkout:completed', {
        method: paymentMethod,
        order: order
      });
      
      // Handle redirect using OrderManager
      this.orderManager.handleOrderRedirect(order);
      
    } catch (error: any) {
      hasError = true;
      this.logger.error('Express checkout failed:', error);
      
      // Check for payment-specific errors and display them
      if (error.responseData) {
        const responseData = error.responseData;
        
        // Handle PayPal-specific errors
        if (method === 'paypal' && responseData.payment_details) {
          this.displayPayPalError(responseData.payment_details);
        }
        // Handle other express payment errors
        else if ((method === 'apple_pay' || method === 'google_pay') && responseData.payment_details) {
          this.displayExpressPaymentError(method, responseData.payment_details);
        }
      }
      
      this.emitCallback('express-checkout:failed', {
        method: method,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    } finally {
      // Hide immediately on error, with delay on success
      this.hideLoadingCallback(hasError);
    }
  }
  
  private displayPayPalError(errorMessage: string): void {
    // Find PayPal error container
    const errorContainer = document.querySelector('[data-next-component="paypal-error"]');
    const errorTextElement = document.querySelector('[data-next-component="paypal-error-text"]');
    
    if (errorContainer instanceof HTMLElement && errorTextElement) {
      // Update error message
      errorTextElement.textContent = errorMessage + ' Please try a different payment method.';
      
      // Show error container
      errorContainer.style.display = 'flex';
      
      this.logger.info('PayPal error displayed:', errorMessage);
    }
    
    // Also display in general payment error area
    this.displayGeneralPaymentError(errorMessage);
  }
  
  private displayExpressPaymentError(method: string, errorMessage: string): void {
    // Display in general payment error area
    const methodName = method === 'apple_pay' ? 'Apple Pay' : 'Google Pay';
    const fullMessage = `${methodName} error: ${errorMessage}. Please try a different payment method.`;
    this.displayGeneralPaymentError(fullMessage);
  }
  
  private displayGeneralPaymentError(message: string): void {
    // Find general credit error container (used for all payment errors)
    const errorContainer = document.querySelector('[data-next-component="credit-error"]');
    const errorTextElement = document.querySelector('[data-next-component="credit-error-text"]');
    
    if (errorContainer instanceof HTMLElement && errorTextElement) {
      errorTextElement.textContent = message;
      errorContainer.style.display = 'flex';
    }
  }
}