import { ProviderAdapter } from './ProviderAdapter';
import { DataLayerEvent } from '../types';

declare global {
  interface Window {
    dataLayer: any[];
  }
}

/**
 * Google Tag Manager adapter
 */
export class GTMAdapter extends ProviderAdapter {
  constructor() {
    super('GTM');
  }

  /**
   * Track event - called by DataLayerManager
   */
  override trackEvent(event: DataLayerEvent): void {
    this.sendEvent(event);
  }

  /**
   * Send event to Google Tag Manager
   */
  sendEvent(event: DataLayerEvent): void {
    if (!this.enabled || !this.isBrowser()) {
      return;
    }

    // Ensure dataLayer exists
    window.dataLayer = window.dataLayer || [];

    // Transform event to GTM format
    const gtmEvent = this.transformToGTMFormat(event);

    // Clear ecommerce object before pushing new data (GTM best practice)
    if (this.isEcommerceEvent(event.event)) {
      window.dataLayer.push({ ecommerce: null });
    }

    // Push the event
    window.dataLayer.push(gtmEvent);

    this.debug('Event sent to GTM', gtmEvent);
  }

  /**
   * Transform event to GTM-specific format
   */
  private transformToGTMFormat(event: DataLayerEvent): any {
    const baseEvent = {
      event: event.event,
      event_timestamp: event.timestamp,
      event_id: event.id
    };

    // Handle ecommerce events specially
    if (this.isEcommerceEvent(event.event)) {
      return {
        ...baseEvent,
        ecommerce: this.buildEcommerceObject(event)
      };
    }

    // For non-ecommerce events, spread the data
    return {
      ...baseEvent,
      ...event.data
    };
  }

  /**
   * Build ecommerce object structure for GTM
   */
  private buildEcommerceObject(event: DataLayerEvent): any {
    const ecommerceData = this.extractEcommerceData(event);
    const eventType = this.getEcommerceEventType(event.event);

    const ecommerceObject: any = {
      currency: ecommerceData.currency,
      value: parseFloat(this.formatCurrency(ecommerceData.value))
    };

    // Add items if present
    if (ecommerceData.items.length > 0) {
      ecommerceObject.items = this.formatItems(ecommerceData.items);
    }

    // Add transaction details for purchase events
    if (eventType === 'purchase') {
      ecommerceObject.transaction_id = ecommerceData.transaction_id;
      ecommerceObject.affiliation = event.data?.affiliation || 'Online Store';
      ecommerceObject.tax = ecommerceData.tax;
      ecommerceObject.shipping = ecommerceData.shipping;
      
      if (ecommerceData.coupon) {
        ecommerceObject.coupon = ecommerceData.coupon;
      }
    }

    // Add cart_id for add_to_cart events
    if (eventType === 'add_to_cart' && event.data?.cart_id) {
      ecommerceObject.cart_id = event.data.cart_id;
    }

    // Add list information for view_item_list events
    if (eventType === 'view_item_list' && event.data?.item_list_name) {
      ecommerceObject.item_list_name = event.data.item_list_name;
      ecommerceObject.item_list_id = event.data.item_list_id;
    }

    return ecommerceObject;
  }

  /**
   * Format items array for GTM
   */
  private formatItems(items: any[]): any[] {
    return items.map((item, index) => ({
      item_id: item.item_id || item.id || item.product_id || item.sku,
      item_name: item.item_name || item.name || item.title,
      affiliation: item.affiliation || 'Online Store',
      coupon: item.coupon || undefined,
      discount: item.discount || 0,
      index: item.index || index,
      item_brand: item.item_brand || item.brand,
      item_category: item.item_category || item.category,
      item_category2: item.item_category2 || item.category2,
      item_category3: item.item_category3 || item.category3,
      item_category4: item.item_category4 || item.category4,
      item_category5: item.item_category5 || item.category5,
      item_list_id: item.item_list_id || item.list_id,
      item_list_name: item.item_list_name || item.list_name,
      item_variant: item.item_variant || item.variant,
      location_id: item.location_id,
      price: parseFloat(this.formatCurrency(item.price || 0)),
      quantity: item.quantity || 1
    }));
  }

  /**
   * Check if event is an ecommerce event
   */
  private isEcommerceEvent(eventName: string): boolean {
    const ecommerceEvents = [
      'dl_add_to_cart',
      'dl_remove_from_cart',
      'dl_view_cart',
      'dl_begin_checkout',
      'dl_add_payment_info',
      'dl_add_shipping_info',
      'dl_purchase',
      'dl_view_item',
      'dl_view_item_list',
      'dl_select_item',
      'dl_select_promotion',
      'dl_view_promotion',
      // Standard GA4 ecommerce events
      'add_to_cart',
      'remove_from_cart',
      'view_cart',
      'begin_checkout',
      'add_payment_info',
      'add_shipping_info',
      'purchase',
      'view_item',
      'view_item_list',
      'select_item',
      'select_promotion',
      'view_promotion'
    ];

    return ecommerceEvents.includes(eventName);
  }

  /**
   * Get standardized ecommerce event type
   */
  private getEcommerceEventType(eventName: string): string {
    // Remove 'dl_' prefix if present
    return eventName.replace(/^dl_/, '');
  }
}