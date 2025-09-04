import { useCheckoutStore } from '@/stores/checkoutStore';
import { useCartStore } from '@/stores/cartStore';
import type { ApiClient } from '@/api/client';
import type { CreateOrder, Address, Payment, Attribution } from '@/types/api';
import type { CheckoutRedirectHandler } from '@/utils/checkout/checkoutRedirectHandler';
import type { Logger } from '@/utils/logger';

export class CheckoutOrderManager {
  private apiClient: ApiClient;
  private redirectHandler: CheckoutRedirectHandler;
  private logger: Logger;

  constructor(
    apiClient: ApiClient,
    redirectHandler: CheckoutRedirectHandler,
    logger: Logger
  ) {
    this.apiClient = apiClient;
    this.redirectHandler = redirectHandler;
    this.logger = logger;
  }

  public async createOrder(): Promise<any> {
    const checkoutStore = useCheckoutStore.getState();
    const cartStore = useCartStore.getState();
    
    // Build order data
    const shippingAddress: Address = {
      first_name: checkoutStore.formData.fname || '',
      last_name: checkoutStore.formData.lname || '',
      line1: checkoutStore.formData.address1 || '',
      line2: checkoutStore.formData.address2,
      line4: checkoutStore.formData.city || '', // city
      state: checkoutStore.formData.province,
      postcode: checkoutStore.formData.postal,
      country: checkoutStore.formData.country || '',
      phone_number: checkoutStore.formData.phone
    };
    
    // Build billing address
    let billingAddress: Address | undefined;
    if (!checkoutStore.sameAsShipping) {
      billingAddress = checkoutStore.billingAddress ? {
        first_name: checkoutStore.billingAddress.first_name,
        last_name: checkoutStore.billingAddress.last_name,
        line1: checkoutStore.billingAddress.address1,
        line2: checkoutStore.billingAddress.address2 || '',
        line4: checkoutStore.billingAddress.city,
        state: checkoutStore.billingAddress.province,
        postcode: checkoutStore.billingAddress.postal,
        country: checkoutStore.billingAddress.country,
        phone_number: checkoutStore.billingAddress.phone
      } : undefined;
    }
    
    // Build payment details
    const payment: Payment = {
      payment_method: this.mapPaymentMethod(checkoutStore.paymentMethod),
      ...(checkoutStore.paymentToken && { card_token: checkoutStore.paymentToken }),
      payment_gateway: 1, // This should come from campaign data
      payment_gateway_group: 1
    };
    
    // Build attribution
    const attribution: Attribution = {
      // These would typically come from URL parameters or cookies
      ...(this.getUrlParam('utm_source') && { utm_source: this.getUrlParam('utm_source')! }),
      ...(this.getUrlParam('utm_medium') && { utm_medium: this.getUrlParam('utm_medium')! }),
      ...(this.getUrlParam('utm_campaign') && { utm_campaign: this.getUrlParam('utm_campaign')! }),
      ...(this.getUrlParam('utm_term') && { utm_term: this.getUrlParam('utm_term')! }),
      ...(this.getUrlParam('utm_content') && { utm_content: this.getUrlParam('utm_content')! }),
      ...(this.getUrlParam('gclid') && { gclid: this.getUrlParam('gclid')! }),
      ...(this.getUrlParam('affiliate') && { affiliate: this.getUrlParam('affiliate')! })
    };
    
    // Build order request
    const orderData: CreateOrder = {
      lines: cartStore.items.map(item => ({
        package_id: item.packageId,
        quantity: item.quantity,
        is_upsell: item.is_upsell || false
      })),
      shipping_address: shippingAddress,
      ...(billingAddress && { billing_address: billingAddress }),
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
      vouchers: checkoutStore.vouchers,
      attribution: attribution,
      success_url: this.redirectHandler.getSuccessUrl(),
      payment_failed_url: this.redirectHandler.getFailureUrl()
    };
    
    this.logger.debug('Creating order with data:', orderData);
    
    // Create the order
    const order = await this.apiClient.createOrder(orderData);
    
    // Clear cart after successful order
    cartStore.reset();
    
    return order;
  }

  public async createExpressOrder(paymentMethod: 'paypal' | 'apple_pay' | 'google_pay'): Promise<any> {
    const cartStore = useCartStore.getState();
    
    // Extract coupon codes from cart's appliedCoupons
    const vouchers = (cartStore.appliedCoupons || []).map((coupon: any) => coupon.code);
    
    // Minimal order data - only required fields per API
    const orderData: CreateOrder = {
      lines: cartStore.items.map(item => ({
        package_id: item.packageId,
        quantity: item.quantity,
        is_upsell: item.is_upsell || false
      })),
      payment_detail: {
        payment_method: paymentMethod
      },
      shipping_method: 1, // Default shipping method
      vouchers: vouchers,
      success_url: this.redirectHandler.getSuccessUrl(),
      payment_failed_url: this.redirectHandler.getFailureUrl()
    };
    
    this.logger.debug('Creating express order with minimal data:', orderData);
    
    // Create the order
    const order = await this.apiClient.createOrder(orderData);
    
    // Clear cart after successful order
    cartStore.reset();
    
    return order;
  }

  private mapPaymentMethod(method: string): 'card_token' | 'paypal' | 'apple_pay' | 'google_pay' {
    const methodMap: Record<string, 'card_token' | 'paypal' | 'apple_pay' | 'google_pay'> = {
      'credit-card': 'card_token',
      'card_token': 'card_token',
      'paypal': 'paypal',
      'apple_pay': 'apple_pay',
      'google_pay': 'google_pay'
    };
    
    return methodMap[method] || 'card_token';
  }

  private getUrlParam(param: string): string | undefined {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param) || undefined;
  }

  public destroy(): void {
    // Cleanup if needed
  }
}