import { ProviderAdapter } from './ProviderAdapter';
import { DataLayerEvent } from '../types';

declare global {
  interface Window {
    fbq: (command: string, event: string, parameters?: any, eventData?: { eventID?: string }) => void;
  }
}

/**
 * Facebook Pixel adapter
 */
export class FacebookAdapter extends ProviderAdapter {
  private blockedEvents: string[] = [];
  private storeName?: string;
  private eventMapping: Record<string, string> = {
    // Data layer events to Facebook events
    'dl_page_view': 'PageView',
    'dl_view_item': 'ViewContent',
    'dl_add_to_cart': 'AddToCart',
    'dl_remove_from_cart': 'RemoveFromCart',
    'dl_begin_checkout': 'InitiateCheckout',
    'dl_add_shipping_info': 'AddShippingInfo',
    'dl_add_payment_info': 'AddPaymentInfo',
    'dl_purchase': 'Purchase',
    'dl_search': 'Search',
    'dl_add_to_wishlist': 'AddToWishlist',
    'dl_sign_up': 'CompleteRegistration',
    'dl_login': 'Login',
    'dl_subscribe': 'Subscribe',
    'dl_start_trial': 'StartTrial',
    'dl_view_cart': 'ViewCart',
    // Upsell events - using custom events
    'dl_viewed_upsell': 'ViewedUpsell',
    'dl_accepted_upsell': 'AcceptedUpsell',
    'dl_skipped_upsell': 'SkippedUpsell',
    // Standard event names
    'page_view': 'PageView',
    'view_item': 'ViewContent',
    'add_to_cart': 'AddToCart',
    'remove_from_cart': 'RemoveFromCart',
    'begin_checkout': 'InitiateCheckout',
    'add_shipping_info': 'AddShippingInfo',
    'add_payment_info': 'AddPaymentInfo',
    'purchase': 'Purchase',
    'search': 'Search',
    'add_to_wishlist': 'AddToWishlist',
    'sign_up': 'CompleteRegistration',
    'login': 'Login',
    'subscribe': 'Subscribe',
    'start_trial': 'StartTrial',
    'view_cart': 'ViewCart'
  };

  constructor(config?: any) {
    super('Facebook');
    if (config?.blockedEvents) {
      this.blockedEvents = config.blockedEvents;
    }
    if (config?.storeName) {
      this.storeName = config.storeName;
    }
  }

  /**
   * Track event - called by DataLayerManager
   */
  override trackEvent(event: DataLayerEvent): void {
    this.sendEvent(event);
  }

  /**
   * Check if Facebook Pixel is loaded
   */
  private isFbqLoaded(): boolean {
    return this.isBrowser() && typeof window.fbq === 'function';
  }

  /**
   * Send event to Facebook Pixel
   */
  sendEvent(event: DataLayerEvent): void {
    if (!this.enabled) {
      this.debug('Facebook adapter disabled');
      return;
    }

    // Check if this event is blocked
    if (this.blockedEvents.includes(event.event)) {
      this.debug(`Event ${event.event} is blocked for Facebook`);
      return;
    }

    // If fbq is not loaded yet, wait for it
    if (!this.isFbqLoaded()) {
      this.waitForFbq().then(() => {
        this.sendEventInternal(event);
      }).catch((error) => {
        this.debug('Facebook Pixel failed to load, skipping event:', event.event);
      });
      return;
    }

    this.sendEventInternal(event);
  }

  /**
   * Wait for Facebook Pixel to be loaded
   */
  private async waitForFbq(timeout: number = 5000): Promise<void> {
    const start = Date.now();
    
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (this.isFbqLoaded()) {
          clearInterval(checkInterval);
          resolve();
        } else if (Date.now() - start > timeout) {
          clearInterval(checkInterval);
          reject(new Error('Facebook Pixel load timeout'));
        }
      }, 100);
    });
  }

  /**
   * Internal method to send event after fbq is confirmed loaded
   */
  private sendEventInternal(event: DataLayerEvent): void {
    const fbEventName = this.mapEventName(event.event);
    if (!fbEventName) {
      this.debug(`No Facebook mapping for event: ${event.event}`);
      return;
    }

    const parameters = this.transformParameters(event, fbEventName);

    try {
      if (window.fbq) {
        // AddShippingInfo is not a standard FB event, use trackCustom
        if (fbEventName === 'AddShippingInfo') {
          window.fbq('trackCustom', fbEventName, parameters);
          this.debug(`Custom event sent to Facebook: ${fbEventName}`, parameters);
        }
        // For Purchase events, include eventID for deduplication if storeName is configured
        else if (fbEventName === 'Purchase' && this.storeName) {
          // Use order_number if available, fallback to order_id (ref_id)
          const orderIdentifier = parameters.order_number || parameters.order_id;
          if (orderIdentifier) {
            const eventId = `${this.storeName}-${orderIdentifier}`;
            // Pass eventID as 4th parameter to fbq track call for proper deduplication
            window.fbq('track', fbEventName, parameters, { eventID: eventId });
            this.debug(`Event sent to Facebook: ${fbEventName} with eventID: ${eventId}`, parameters);
          } else {
            window.fbq('track', fbEventName, parameters);
            this.debug(`Event sent to Facebook: ${fbEventName} (no order identifier for eventID)`, parameters);
          }
        } else {
          window.fbq('track', fbEventName, parameters);
          this.debug(`Event sent to Facebook: ${fbEventName}`, parameters);
        }
      }
    } catch (error) {
      this.debug('Error sending event to Facebook:', error);
    }
  }

  /**
   * Map data layer event name to Facebook event name
   */
  private mapEventName(eventName: string): string | null {
    return this.eventMapping[eventName] || null;
  }

  /**
   * Transform event parameters for Facebook Pixel
   */
  private transformParameters(event: DataLayerEvent, fbEventName: string): any {
    const params: any = {};

    // Common parameters
    if (event.data?.value) {
      params.value = parseFloat(this.formatCurrency(event.data.value));
    }

    if (event.data?.currency) {
      params.currency = event.data.currency;
    }

    // Handle different event types
    switch (fbEventName) {
      case 'ViewContent':
        return this.buildViewContentParams(event);
      
      case 'AddToCart':
      case 'RemoveFromCart':
        return this.buildAddToCartParams(event);
      
      case 'InitiateCheckout':
        return this.buildCheckoutParams(event);
      
      case 'AddShippingInfo':
        return this.buildShippingInfoParams(event);
      
      case 'AddPaymentInfo':
        return this.buildPaymentInfoParams(event);
      
      case 'Purchase':
        return this.buildPurchaseParams(event);
      
      case 'Search':
        return this.buildSearchParams(event);
      
      case 'CompleteRegistration':
        return this.buildRegistrationParams(event);
      
      case 'ViewedUpsell':
      case 'AcceptedUpsell':
      case 'SkippedUpsell':
        return this.buildUpsellParams(event, fbEventName);
      
      default:
        return this.buildGenericParams(event);
    }
  }

  /**
   * Build ViewContent parameters
   */
  private buildViewContentParams(event: DataLayerEvent): any {
    const ecommerceData = this.extractEcommerceData(event);
    const items = ecommerceData.items || [];
    
    const params: any = {
      content_type: 'product',
      currency: ecommerceData.currency || 'USD',
      value: ecommerceData.value || 0
    };

    if (items.length > 0) {
      params.content_ids = items.map((item: any) => 
        item.item_id || item.id || item.product_id || item.sku || item.external_id
      );
      params.contents = items.map((item: any) => ({
        id: item.item_id || item.id || item.product_id || item.sku || item.external_id,
        quantity: item.quantity || 1,
        item_price: item.price || item.item_price || 0
      }));
      params.content_name = items[0].item_name || items[0].name || items[0].title;
      params.content_category = items[0].item_category || items[0].category || 'uncategorized';
    }

    return params;
  }

  /**
   * Build AddToCart/RemoveFromCart parameters
   */
  private buildAddToCartParams(event: DataLayerEvent): any {
    const ecommerceData = this.extractEcommerceData(event);
    const items = ecommerceData.items || [];
    
    const params: any = {
      content_type: 'product',
      currency: ecommerceData.currency || 'USD',
      value: ecommerceData.value || 0
    };

    if (items.length > 0) {
      // Fix: Map item_id to content_ids (was causing [null])
      params.content_ids = items.map((item: any) => 
        item.item_id || item.id || item.product_id || item.sku || item.external_id
      );
      
      // Include product names
      const itemNames = items.map((item: any) => item.item_name || item.name || item.title).filter(Boolean);
      if (itemNames.length > 0) {
        params.content_name = itemNames.join(', ');
      }
      
      // Include category (if available)
      const firstItemCategory = items[0].item_category || items[0].category;
      if (firstItemCategory) {
        params.content_category = firstItemCategory;
      }
      
      // Calculate total quantity
      const totalQuantity = items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
      params.num_items = totalQuantity;
      
      // Build contents array with proper field mapping
      params.contents = items.map((item: any) => ({
        id: item.item_id || item.id || item.product_id || item.sku || item.external_id,
        quantity: item.quantity || 1,
        item_price: item.price || item.item_price || 0,
        // Include additional fields Facebook can use
        name: item.item_name || item.name,
        category: item.item_category || item.category || 'uncategorized'
      }));
    }

    return params;
  }

  /**
   * Build AddShippingInfo parameters
   */
  private buildShippingInfoParams(event: DataLayerEvent): any {
    const ecommerceData = this.extractEcommerceData(event);
    const items = ecommerceData.items || [];
    
    const params: any = {
      content_type: 'product',
      currency: ecommerceData.currency || 'USD',
      value: ecommerceData.value || 0,
      num_items: items.length
    };

    if (items.length > 0) {
      params.content_ids = items.map((item: any) => 
        item.item_id || item.id || item.product_id || item.sku || item.external_id
      );
      params.contents = items.map((item: any) => ({
        id: item.item_id || item.id || item.product_id || item.sku || item.external_id,
        quantity: item.quantity || 1,
        item_price: item.price || item.item_price || 0
      }));
    }

    // Include shipping tier if available
    if (ecommerceData.shipping_tier || event.data?.shipping_tier) {
      params.shipping_tier = ecommerceData.shipping_tier || event.data?.shipping_tier;
    }

    return params;
  }

  /**
   * Build AddPaymentInfo parameters
   */
  private buildPaymentInfoParams(event: DataLayerEvent): any {
    const ecommerceData = this.extractEcommerceData(event);
    const items = ecommerceData.items || [];
    
    const params: any = {
      content_type: 'product',
      currency: ecommerceData.currency || 'USD',
      value: ecommerceData.value || 0,
      num_items: items.length
    };

    if (items.length > 0) {
      params.content_ids = items.map((item: any) => 
        item.item_id || item.id || item.product_id || item.sku || item.external_id
      );
      params.contents = items.map((item: any) => ({
        id: item.item_id || item.id || item.product_id || item.sku || item.external_id,
        quantity: item.quantity || 1,
        item_price: item.price || item.item_price || 0
      }));
    }

    // Include payment type if available
    if (ecommerceData.payment_type || event.data?.payment_type) {
      params.payment_type = ecommerceData.payment_type || event.data?.payment_type;
    }

    return params;
  }

  /**
   * Build InitiateCheckout parameters
   */
  private buildCheckoutParams(event: DataLayerEvent): any {
    // Check for ecommerce data first (GA4 format), then fall back to data
    const ecommerceData = event.ecommerce || event.data || {};
    const items = ecommerceData.items || ecommerceData.products || [];
    
    const params: any = {
      content_type: 'product',
      currency: ecommerceData.currency || 'USD',
      value: ecommerceData.value || ecommerceData.total || 0,
      num_items: items.length
    };

    if (items.length > 0) {
      params.content_ids = items.map((item: any) => 
        item.item_id || item.id || item.product_id || item.sku || item.external_id
      );
      params.contents = items.map((item: any) => ({
        id: item.item_id || item.id || item.product_id || item.sku || item.external_id,
        quantity: item.quantity || 1,
        item_price: item.price || item.item_price || 0
      }));
    }

    if (ecommerceData.coupon || ecommerceData.discount_code || event.data?.coupon) {
      params.coupon = ecommerceData.coupon || ecommerceData.discount_code || event.data?.coupon;
    }

    return params;
  }

  /**
   * Build Purchase parameters
   */
  private buildPurchaseParams(event: DataLayerEvent): any {
    const ecommerceData = this.extractEcommerceData(event);
    const items = ecommerceData.items || [];
    
    const params: any = {
      content_type: 'product',
      currency: ecommerceData.currency || 'USD',
      value: ecommerceData.value || 0,
      num_items: items.length,
      order_id: ecommerceData.transaction_id || event.data?.order_id,
      order_number: event.data?.order_number // Include order_number for eventID deduplication
    };

    if (items.length > 0) {
      params.content_ids = items.map((item: any) => 
        item.item_id || item.id || item.product_id || item.sku || item.external_id
      );
      params.contents = items.map((item: any) => ({
        id: item.item_id || item.id || item.product_id || item.sku || item.external_id,
        quantity: item.quantity || 1,
        item_price: item.price || item.item_price || 0
      }));
    }

    return params;
  }

  /**
   * Build Search parameters
   */
  private buildSearchParams(event: DataLayerEvent): any {
    const data = event.data || {};
    
    return {
      search_string: data.search_term || data.query || '',
      content_category: data.category,
      content_ids: data.product_ids || []
    };
  }

  /**
   * Build Registration parameters
   */
  private buildRegistrationParams(event: DataLayerEvent): any {
    const data = event.data || {};
    
    return {
      content_name: data.registration_method || 'email',
      status: data.status || 'completed',
      value: data.value || 0,
      currency: data.currency || 'USD'
    };
  }

  /**
   * Build Upsell parameters
   */
  private buildUpsellParams(event: DataLayerEvent, fbEventName: string): any {
    // The event structure has order_id and upsell object
    const params: any = {
      content_type: 'product',
      order_id: event.order_id || event.data?.order_id,
      event_name: fbEventName
    };

    // Handle upsell data
    if (event.upsell) {
      params.content_ids = [event.upsell.package_id];
      params.content_name = event.upsell.package_name || `Package ${event.upsell.package_id}`;
      
      if (event.upsell.value !== undefined) {
        params.value = parseFloat(this.formatCurrency(event.upsell.value));
      }
      if (event.upsell.price !== undefined) {
        params.value = parseFloat(this.formatCurrency(event.upsell.price));
      }
      if (event.upsell.currency) {
        params.currency = event.upsell.currency;
      }
      if (event.upsell.quantity !== undefined) {
        params.num_items = event.upsell.quantity;
      }
    }

    return params;
  }

  /**
   * Build generic parameters for other events
   */
  private buildGenericParams(event: DataLayerEvent): any {
    const data = event.data || {};
    const params: any = {};

    // Copy over common parameters
    if (data.value !== undefined) {
      params.value = data.value;
    }
    if (data.currency) {
      params.currency = data.currency;
    }
    if (data.content_name) {
      params.content_name = data.content_name;
    }
    if (data.content_type) {
      params.content_type = data.content_type;
    }
    if (data.content_category) {
      params.content_category = data.content_category;
    }

    return params;
  }
}