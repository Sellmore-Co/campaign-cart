/**
 * Order Manager - Handles order creation and processing
 */

import { OrderBuilder } from '../builders/OrderBuilder';
import { handleOrderRedirect } from '../utils/redirect-handler';
import type { ApiClient } from '@/api/client';
import type { Logger } from '@/utils/logger';

export class OrderManager {
  private orderBuilder: OrderBuilder;

  constructor(
    private apiClient: ApiClient,
    private logger: Logger,
    private emitCallback: (event: string, data: any) => void
  ) {
    this.orderBuilder = new OrderBuilder();
  }

  public async createOrder(
    checkoutFormData: Record<string, any>,
    cartItems: any[],
    paymentMethod: string,
    paymentToken?: string,
    billingAddress?: any,
    sameAsShipping: boolean = true,
    shippingMethod?: any,
    vouchers: string[] = [],
    // resetCartCallback?: () => void
  ): Promise<any> {
    console.log('🟢 [OrderManager] createOrder called with:', {
      paymentMethod,
      paymentToken: paymentToken ? `${paymentToken.substring(0, 8)}...` : 'none',
      itemCount: cartItems.length,
      sameAsShipping,
      hasShippingMethod: !!shippingMethod,
      vouchersCount: vouchers.length
    });
    
    try {
      // Validate required data
      if (!checkoutFormData.email || !checkoutFormData.fname || !checkoutFormData.lname) {
        throw new Error('Missing required customer information');
      }
      
      if (cartItems.length === 0) {
        throw new Error('Cannot create order with empty cart');
      }
      
      if ((paymentMethod === 'credit-card' || paymentMethod === 'card_token') && !paymentToken) {
        throw new Error('Payment token is required for credit card payments');
      }
      
      // Build order data
      const orderData = this.orderBuilder.buildOrder(
        checkoutFormData,
        cartItems,
        paymentMethod,
        paymentToken,
        billingAddress,
        sameAsShipping,
        shippingMethod,
        vouchers
      );
      
      this.logger.debug('Creating order with data:', {
        ...orderData,
        // Mask sensitive data in logs
        payment_detail: {
          ...orderData.payment_detail,
          card_token: orderData.payment_detail.card_token ? 'MASKED' : undefined
        }
      });
      
      console.log('🟢 [OrderManager] Order data built successfully');
      console.log('🟢 [OrderManager] Payment method:', orderData.payment_detail.payment_method);
      console.log('🟢 [OrderManager] Has payment token:', !!orderData.payment_detail.card_token);
      
      // Create the order via API
      console.log('🟢 [OrderManager] Calling API to create order...');
      const order = await this.apiClient.createOrder(orderData);
      
      console.log('🟢 [OrderManager] Order created successfully by API:', {
        ref_id: order.ref_id,
        number: order.number,
        total: order.total_incl_tax,
        currency: order.currency,
        has_order_status_url: !!order.order_status_url,
        has_payment_complete_url: !!order.payment_complete_url,
        is_test: order.is_test
      });
      
      // Validate order response
      if (!order.ref_id) {
        throw new Error('Invalid order response: missing ref_id');
      }
      
      // Clear cart after successful order creation
      // if (resetCartCallback) {
      //   console.log('🟢 [OrderManager] Clearing cart after successful order');
      //   resetCartCallback();
      // }
      
      // Log success
      this.logger.info('Order created successfully', {
        ref_id: order.ref_id,
        number: order.number,
        total: order.total_incl_tax,
        payment_method: paymentMethod
      });
      
      return order;
      
    } catch (error: any) {
      console.error('🔴 [OrderManager] Error creating order:', error);
      this.logger.error('Failed to create order:', error);
      
      // Check for payment-specific errors in the response
      if (error.status === 400 && error.responseData) {
        const responseData = error.responseData;
        
        // Check for payment errors
        if (responseData.payment_details || responseData.payment_response_code) {
          console.log('🔴 [OrderManager] Payment error detected:', {
            payment_details: responseData.payment_details,
            payment_response_code: responseData.payment_response_code
          });
          
          // Emit payment error event with details
          this.emitCallback('payment:error', {
            message: responseData.payment_details || 'Payment failed',
            code: responseData.payment_response_code,
            details: responseData
          });
          
          // Create a user-friendly error message
          let errorMessage = 'Payment failed: ';
          if (responseData.payment_details) {
            errorMessage += responseData.payment_details;
          } else {
            errorMessage += 'Please check your payment information and try again.';
          }
          
          throw new Error(errorMessage);
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

  public async createExpressOrder(
    cartItems: any[],
    paymentMethod: 'paypal' | 'apple_pay' | 'google_pay',
    // resetCartCallback?: () => void
  ): Promise<any> {
    this.logger.info('createExpressOrder called with:', {
      paymentMethod,
      itemCount: cartItems.length
    });
    
    try {
      // Validate cart items
      if (cartItems.length === 0) {
        throw new Error('Cannot create express order with empty cart');
      }
      
      // Get vouchers from cart store
      const { useCartStore } = await import('@/stores/cartStore');
      const cartStore = useCartStore.getState();
      const vouchers = (cartStore.appliedCoupons || []).map((coupon: any) => coupon.code);
      
      // Build minimal order data for express checkout
      const orderData = this.orderBuilder.buildExpressOrder(cartItems, paymentMethod, vouchers);
      
      this.logger.debug('Creating express order with minimal data:', orderData);
      this.logger.info('Express order data built');
      
      // Create the order
      const order = await this.apiClient.createOrder(orderData);
      
      this.logger.info('Express order created:', {
        ref_id: order.ref_id,
        has_order_status_url: !!order.order_status_url,
        has_payment_complete_url: !!order.payment_complete_url
      });
      
      // Only clear cart if payment is complete (has order_status_url)
      // If payment_complete_url is returned, user needs to complete payment first
      // if (resetCartCallback && order.order_status_url && !order.payment_complete_url) {
      //   this.logger.info('Express payment is complete, clearing cart');
      //   resetCartCallback();
      // } else if (order.payment_complete_url) {
      //   this.logger.info('Express payment requires completion at gateway, keeping cart');
      // }
      
      return order;
      
    } catch (error) {
      console.error('🔴 [OrderManager] Error creating express order:', error);
      this.logger.error('Failed to create express order:', error);
      throw error;
    }
  }

  public async createTestOrder(
    cartItems: any[],
    // resetCartCallback?: () => void
  ): Promise<any> {
    console.log('🟢 [OrderManager] createTestOrder called with:', {
      itemCount: cartItems.length
    });
    
    try {
      // Get vouchers from cart store
      const { useCartStore } = await import('@/stores/cartStore');
      const cartStore = useCartStore.getState();
      const vouchers = (cartStore.appliedCoupons || []).map((coupon: any) => coupon.code);
      
      // Build test order data
      const testOrderData = this.orderBuilder.buildTestOrder(cartItems, vouchers);
      
      this.logger.debug('Creating test order with data:', testOrderData);
      console.log('🟢 [OrderManager] Test order data built');
      
      // Create the order using existing API client
      const order = await this.apiClient.createOrder(testOrderData);
      
      console.log('🟢 [OrderManager] Test order created:', {
        ref_id: order.ref_id,
        number: order.number,
        is_test: order.is_test
      });
      
      // Clear cart after successful test order
      // if (resetCartCallback) {
      //   console.log('🟢 [OrderManager] Clearing cart after test order');
      //   resetCartCallback();
      // }
      
      return order;
      
    } catch (error) {
      console.error('🔴 [OrderManager] Error creating test order:', error);
      this.logger.error('Failed to create test order:', error);
      throw error;
    }
  }

  public handleOrderRedirect(order: any): void {
    this.logger.info('handleOrderRedirect called with order:', {
      ref_id: order.ref_id,
      has_order_status_url: !!order.order_status_url,
      has_payment_complete_url: !!order.payment_complete_url
    });
    
    try {
      // Validate order has required data for redirect
      if (!order.ref_id) {
        console.error('🔴 [OrderManager] Cannot redirect: order missing ref_id');
        this.logger.error('Cannot redirect: order missing ref_id');
        this.emitCallback('order:redirect-missing', { order });
        return;
      }
      
      // Handle the redirect using the utility function
      handleOrderRedirect(order, this.logger, this.emitCallback);
      
    } catch (error) {
      console.error('🔴 [OrderManager] Error handling order redirect:', error);
      this.logger.error('Error handling order redirect:', error);
      this.emitCallback('order:redirect-missing', { order });
    }
  }

  public async handleTokenizedPayment(
    token: string,
    pmData: any,
    createOrderCallback: () => Promise<any>
  ): Promise<void> {
    console.log('🟢 [OrderManager] handleTokenizedPayment called with token:', token ? `${token.substring(0, 8)}...` : 'none');
    
    try {
      // Validate token
      if (!token) {
        throw new Error('Payment token is required');
      }
      
      this.logger.debug('Handling tokenized payment', { 
        token: token.substring(0, 8) + '...', 
        pmData: pmData ? 'present' : 'missing' 
      });
      
      console.log('🟢 [OrderManager] Calling createOrderCallback...');
      
      // Continue with order creation now that we have the payment token
      const order = await createOrderCallback();
      
      console.log('🟢 [OrderManager] Order created via callback:', {
        ref_id: order.ref_id,
        number: order.number
      });
      
      // Emit order completed event
      console.log('🟢 [OrderManager] Emitting order:completed event');
      this.emitCallback('order:completed', order);
      
      // Handle redirect based on response format
      console.log('🟢 [OrderManager] Handling order redirect...');
      this.handleOrderRedirect(order);
      
    } catch (error) {
      console.error('🔴 [OrderManager] Failed to process tokenized payment:', error);
      this.logger.error('Failed to process tokenized payment:', error);
      throw error;
    }
  }

  // validateOrderData method removed - unused

  /**
   * Get order status for debugging
   */
  public async getOrderStatus(refId: string): Promise<any> {
    try {
      console.log('🟢 [OrderManager] Getting order status for:', refId);
      const order = await this.apiClient.getOrder(refId);
      console.log('🟢 [OrderManager] Order status retrieved:', {
        ref_id: order.ref_id,
        number: order.number,
        total: order.total_incl_tax
      });
      return order;
    } catch (error) {
      console.error('🔴 [OrderManager] Error getting order status:', error);
      this.logger.error('Failed to get order status:', error);
      throw error;
    }
  }
}