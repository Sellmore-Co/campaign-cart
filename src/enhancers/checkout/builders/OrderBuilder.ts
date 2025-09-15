/**
 * Order Builder - Builds order data for API submission
 */

import { API_PAYMENT_METHOD_MAP } from '../constants/field-mappings';
import { getSuccessUrl, getFailureUrl } from '../utils/url-utils';
import { useAttributionStore } from '@/stores/attributionStore';
import { useCampaignStore } from '@/stores/campaignStore';
import { useConfigStore } from '@/stores/configStore';
import { useCartStore } from '@/stores/cartStore';
import { useCheckoutStore } from '@/stores/checkoutStore';
import type { CreateOrder, Address, Payment, Attribution } from '@/types/api';

export class OrderBuilder {
  private getCurrency(): string {
    // Get currency from campaign or config store (same logic as cart store)
    const campaignState = useCampaignStore.getState();
    if (campaignState?.data?.currency) {
      return campaignState.data.currency;
    }
    
    const configStore = useConfigStore.getState();
    return configStore?.selectedCurrency || configStore?.detectedCurrency || 'USD';
  }

  public buildOrder(
    checkoutFormData: Record<string, any>,
    cartItems: any[],
    paymentMethod: string,
    paymentToken?: string,
    billingAddress?: any,
    sameAsShipping: boolean = true,
    shippingMethod?: any,
    vouchers: string[] = []
  ): CreateOrder {
    // Build shipping address
    const shippingAddress: Address = {
      first_name: checkoutFormData.fname || '',
      last_name: checkoutFormData.lname || '',
      line1: checkoutFormData.address1 || '',
      line2: checkoutFormData.address2,
      line4: checkoutFormData.city || '', // city
      state: checkoutFormData.province,
      postcode: checkoutFormData.postal,
      country: checkoutFormData.country || '',
      phone_number: checkoutFormData.phone
    };
    
    // Build billing address
    let billingAddressData: Address | undefined;
    if (!sameAsShipping && billingAddress) {
      billingAddressData = {
        first_name: billingAddress.first_name || '',
        last_name: billingAddress.last_name || '',
        line1: billingAddress.address1 || '',
        line4: billingAddress.city || '',
        country: billingAddress.country || '',
        ...(billingAddress.address2 && { line2: billingAddress.address2 }),
        ...(billingAddress.province && { state: billingAddress.province }),
        ...(billingAddress.postal && { postcode: billingAddress.postal }),
        ...(billingAddress.phone && { phone_number: billingAddress.phone })
      };
    }
    
    // Build payment details
    const payment: Payment = {
      payment_method: this.mapPaymentMethod(paymentMethod),
      ...(paymentToken && { card_token: paymentToken })
    };
    
    // Get attribution from store
    const attributionStore = useAttributionStore.getState();
    const attribution = attributionStore.getAttributionForApi();
    
    // Build order request
    const orderData: CreateOrder = {
      lines: cartItems.map(item => ({
        package_id: item.packageId,
        quantity: item.quantity,
        is_upsell: item.is_upsell || false
      })),
      shipping_address: shippingAddress,
      ...(billingAddressData && { billing_address: billingAddressData }),
      billing_same_as_shipping_address: sameAsShipping,
      shipping_method: shippingMethod?.id || this.getDefaultShippingMethodId(),
      payment_detail: payment,
      user: {
        email: checkoutFormData.email,
        first_name: checkoutFormData.fname || '',
        last_name: checkoutFormData.lname || '',
        language: 'en',
        phone_number: checkoutFormData.phone,
        accepts_marketing: checkoutFormData.accepts_marketing ?? true
      },
      vouchers: vouchers,
      attribution: attribution,
      currency: this.getCurrency(),
      success_url: getSuccessUrl(),
      payment_failed_url: getFailureUrl()
    };
    
    return orderData;
  }

  public buildExpressOrder(
    cartItems: any[],
    paymentMethod: 'paypal' | 'apple_pay' | 'google_pay',
    vouchers: string[] = []
  ): CreateOrder {
    // Get attribution from store
    const attributionStore = useAttributionStore.getState();
    const attribution = attributionStore.getAttributionForApi();
    
    // Minimal order data - only required fields per API
    const orderData: CreateOrder = {
      lines: cartItems.map(item => ({
        package_id: item.packageId,
        quantity: item.quantity,
        is_upsell: item.is_upsell || false
      })),
      payment_detail: {
        payment_method: paymentMethod
      },
      shipping_method: this.getDefaultShippingMethodId(),
      vouchers: vouchers,
      attribution: attribution,
      currency: this.getCurrency(),
      success_url: getSuccessUrl(),
      payment_failed_url: getFailureUrl()
    };
    
    return orderData;
  }

  public buildTestOrder(cartItems: any[], vouchers: string[] = []): any {
    // Build test order data (similar to createOrder but with test card token)
    const testOrderData: any = {
      lines: cartItems.length > 0 
        ? cartItems.map(item => ({
            package_id: item.packageId,
            quantity: item.quantity,
            is_upsell: item.is_upsell || false
          }))
        : [{ package_id: 1, quantity: 1, is_upsell: false }], // Default package if cart empty
      
      shipping_address: {
        first_name: 'Test',
        last_name: 'Order',
        line1: 'Test Address 123',
        line2: '',
        line4: 'Tempe', // city
        state: 'AZ',
        postcode: '85281',
        country: 'US',
        phone_number: '+14807581224'
      },
      
      billing_same_as_shipping_address: true,
      shipping_method: this.getDefaultShippingMethodId(),
      
      payment_detail: {
        payment_method: 'card_token',
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
      success_url: getSuccessUrl(),
      payment_failed_url: getFailureUrl()
    };
    
    return testOrderData;
  }

  private mapPaymentMethod(method: string): 'card_token' | 'paypal' | 'apple_pay' | 'google_pay' {
    return API_PAYMENT_METHOD_MAP[method] || 'card_token';
  }

  private getDefaultShippingMethodId(): number {
    // Import stores at the top of the file if not already imported
    // Using the same pattern as getCurrency() method
    const cartStore = useCartStore.getState();
    const checkoutStore = useCheckoutStore.getState();
    const campaignStore = useCampaignStore.getState();
    
    // Use existing selection first - check cart store
    if (cartStore.shippingMethod?.id) {
      console.log('[OrderBuilder] Using shipping method from cart:', cartStore.shippingMethod.id);
      return cartStore.shippingMethod.id;
    }
    
    // Then check checkout store
    if (checkoutStore.shippingMethod?.id) {
      console.log('[OrderBuilder] Using shipping method from checkout:', checkoutStore.shippingMethod.id);
      return checkoutStore.shippingMethod.id;
    }
    
    // Fall back to first available method from campaign
    if (campaignStore.data?.shipping_methods && campaignStore.data.shipping_methods.length > 0) {
      const firstMethod = campaignStore.data.shipping_methods[0];
      if (firstMethod) {
        const firstMethodId = firstMethod.ref_id;
        console.log('[OrderBuilder] Using first available shipping method:', firstMethodId);
        return firstMethodId;
      }
    }
    
    // Last resort fallback
    console.warn('[OrderBuilder] No shipping method found, using fallback ID 1');
    return 1;
  }

  private getTestAttribution(): Attribution {
    // Get real attribution but override some fields for test
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
}