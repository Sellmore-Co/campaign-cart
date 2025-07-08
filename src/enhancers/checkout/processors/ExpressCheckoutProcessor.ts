/**
 * Express Checkout Processor - Handles PayPal, Apple Pay, Google Pay
 */

import { EXPRESS_PAYMENT_METHOD_MAP } from '../constants/field-mappings';
import type { Logger } from '@/utils/logger';
import type { OrderManager } from '../managers/OrderManager';
import type { CartItem } from '@/types/global';

export class ExpressCheckoutProcessor {
  constructor(
    private logger: Logger,
    private addClassCallback: (className: string) => void,
    private removeClassCallback: (className: string) => void,
    private emitCallback: (event: string, data: any) => void,
    private orderManager: OrderManager
  ) {}

  public async handleExpressCheckout(
    method: string,
    cartItems: CartItem[],
    isCartEmpty: boolean,
    resetCart: () => void
  ): Promise<void> {
    try {
      this.addClassCallback('next-processing');
      
      // Validate cart is not empty
      if (isCartEmpty) {
        this.logger.warn('Cannot checkout with empty cart');
        this.emitCallback('express-checkout:error', {
          method: method,
          error: 'Cart is empty'
        });
        return;
      }
      
      // Get mapped payment method
      const paymentMethod = EXPRESS_PAYMENT_METHOD_MAP[method] || method;
      
      // Emit express checkout started event
      this.emitCallback('express-checkout:started', { 
        method: paymentMethod,
        itemCount: cartItems.length
      });
      
      this.logger.info(`Express checkout initiated with ${method}`);
      
      // Create express order using OrderManager - just hit the API with the payment method
      const order = await this.orderManager.createExpressOrder(
        cartItems,
        paymentMethod as any,
        resetCart
      );
      
      // Emit success event
      this.emitCallback('express-checkout:completed', {
        method: paymentMethod,
        order: order
      });
      
      // Handle redirect using OrderManager
      this.orderManager.handleOrderRedirect(order);
      
    } catch (error) {
      this.logger.error('Express checkout failed:', error);
      
      this.emitCallback('express-checkout:failed', {
        method: method,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    } finally {
      this.removeClassCallback('next-processing');
    }
  }
}