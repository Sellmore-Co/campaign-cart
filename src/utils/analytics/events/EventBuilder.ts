/**
 * Event Builder
 * Base class for creating standardized analytics events
 */

import type { DataLayerEvent, UserProperties, EventContext, EventMetadata, EcommerceItem } from '../types';

// Define minimal types to avoid external dependencies
interface MinimalCartItem {
  id?: string | number;
  packageId?: string | number;
  package_id?: string | number;
  title?: string;
  name?: string;
  product_title?: string;
  price?: number | string | {
    excl_tax: { value: number; formatted: string };
    incl_tax: { value: number; formatted: string };
    original: { value: number; formatted: string };
    savings: { value: number; formatted: string };
  };
  price_incl_tax?: number | string;
  quantity?: number;
  package_profile?: string;
  variant?: string;
  product?: {
    title?: string;
  };
}

export class EventBuilder {
  /**
   * Create base event with standard properties
   */
  static createEvent(
    eventName: string,
    eventData: Partial<DataLayerEvent> = {}
  ): DataLayerEvent {
    const event: DataLayerEvent = {
      event: eventName,
      event_id: this.generateEventId(),
      event_time: new Date().toISOString(),
      user_properties: this.getUserProperties(),
      ...this.getEventContext(),
      ...eventData,
      _metadata: this.getEventMetadata()
    };

    return event;
  }

  /**
   * Generate unique event ID
   */
  private static generateEventId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Get user properties from stores
   */
  static getUserProperties(): UserProperties {
    const userProperties: UserProperties = {
      visitor_type: 'guest', // Default to guest, can be overridden if we have customer data
    };

    // Try to get store states safely
    try {
      if (typeof window !== 'undefined') {
        // Try to import stores dynamically
        const checkoutStore = (window as any).checkoutStore;
        // const cartStore = (window as any).cartStore;
        
        if (checkoutStore) {
          const checkoutState = checkoutStore.getState();
          
          // Add billing address info if available
          if (checkoutState.billingAddress) {
            const billing = checkoutState.billingAddress;
            userProperties.customer_first_name = billing.first_name;
            userProperties.customer_last_name = billing.last_name;
            userProperties.customer_address_city = billing.city;
            userProperties.customer_address_province = billing.province;
            userProperties.customer_address_province_code = billing.province; // Using province as code for now
            userProperties.customer_address_zip = billing.postal;
            userProperties.customer_address_country = billing.country;
            userProperties.customer_phone = billing.phone;
          }

          // Add customer email if available from form data
          if (checkoutState.formData?.email) {
            userProperties.customer_email = checkoutState.formData.email;
          }

          // Add customer ID if available (from order or other sources)
          if (checkoutState.formData?.customerId) {
            userProperties.customer_id = String(checkoutState.formData.customerId);
            userProperties.visitor_type = 'customer';
          }
        }
      }
    } catch (error) {
      // Fallback to default properties if store access fails
      console.warn('Could not access store state for user properties:', error);
    }

    return userProperties;
  }

  /**
   * Get event context (page info, session, etc.)
   */
  static getEventContext(): EventContext {
    const context: EventContext = {};

    if (typeof window !== 'undefined') {
      context.page_location = window.location.href;
      context.page_title = document.title;
      context.page_referrer = document.referrer;
      context.user_agent = navigator.userAgent;
      context.screen_resolution = `${window.screen.width}x${window.screen.height}`;
      context.viewport_size = `${window.innerWidth}x${window.innerHeight}`;
      context.session_id = this.getSessionId();
      context.timestamp = Date.now();
    }

    return context;
  }

  /**
   * Get event metadata
   */
  private static getEventMetadata(): EventMetadata {
    return {
      pushed_at: Date.now(),
      debug_mode: false, // Can be controlled via config
      session_id: this.getSessionId(),
      sequence_number: this.getNextSequenceNumber(),
      source: 'campaign-cart',
      version: '0.2.0'
    };
  }

  /**
   * Get or create session ID
   */
  static getSessionId(): string {
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('analytics_session_id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem('analytics_session_id', sessionId);
      }
      return sessionId;
    }
    return `session_${Date.now()}`;
  }

  /**
   * Get next sequence number for event ordering
   */
  private static getNextSequenceNumber(): number {
    if (typeof window !== 'undefined') {
      const current = parseInt(sessionStorage.getItem('analytics_sequence') || '0', 10);
      const next = current + 1;
      sessionStorage.setItem('analytics_sequence', String(next));
      return next;
    }
    return 0;
  }

  /**
   * Get currency from campaign store
   */
  static getCurrency(): string {
    try {
      if (typeof window !== 'undefined') {
        const campaignStore = (window as any).campaignStore;
        if (campaignStore) {
          const campaign = campaignStore.getState().data;
          return campaign?.currency || 'USD';
        }
      }
    } catch (error) {
      console.warn('Could not access campaign store for currency:', error);
    }
    return 'USD';
  }

  /**
   * Format cart item to ecommerce item
   */
  static formatEcommerceItem(
    item: MinimalCartItem,
    index?: number,
    list?: { id?: string; name?: string }
  ): EcommerceItem {
    const currency = this.getCurrency();
    let campaignName = 'Campaign';
    
    try {
      if (typeof window !== 'undefined') {
        const campaignStore = (window as any).campaignStore;
        if (campaignStore) {
          const campaign = campaignStore.getState().data;
          campaignName = campaign?.name || 'Campaign';
        }
      }
    } catch (error) {
      console.warn('Could not access campaign store for item formatting:', error);
    }

    // Handle different item formats
    const itemId = String(item.packageId || item.package_id || item.id);
    const itemName = item.product?.title || 
                    item.title || 
                    item.product_title ||
                    item.name ||
                    `Package ${itemId}`;
    let price: number = 0;
    if (item.price_incl_tax) {
      price = typeof item.price_incl_tax === 'string' ? parseFloat(item.price_incl_tax) : item.price_incl_tax;
    } else if (item.price) {
      if (typeof item.price === 'object' && 'incl_tax' in item.price) {
        price = item.price.incl_tax.value;
      } else {
        price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
      }
    }
    const quantity = item.quantity || 1;

    const ecommerceItem: EcommerceItem = {
      item_id: itemId,
      item_name: itemName,
      item_category: campaignName,
      price: typeof price === 'string' ? parseFloat(price) : price,
      quantity,
      currency,
    };

    // Add optional fields
    if (item.package_profile || item.variant) {
      const variant = item.package_profile || item.variant;
      if (variant !== undefined) {
        ecommerceItem.item_variant = variant;
      }
    }

    if (index !== undefined) {
      ecommerceItem.index = index;
    }

    // Add list attribution if provided
    if (list?.id) {
      ecommerceItem.item_list_id = list.id;
    }
    if (list?.name) {
      ecommerceItem.item_list_name = list.name;
    }

    return ecommerceItem;
  }

  /**
   * Get list attribution from sessionStorage
   */
  static getListAttribution(): { id?: string; name?: string } | undefined {
    if (typeof window !== 'undefined') {
      const listId = sessionStorage.getItem('analytics_list_id');
      const listName = sessionStorage.getItem('analytics_list_name');
      
      if (listId || listName) {
        const result: { id?: string; name?: string } = {};
        if (listId) result.id = listId;
        if (listName) result.name = listName;
        return result;
      }
    }
    return undefined;
  }

  /**
   * Set list attribution in sessionStorage
   */
  static setListAttribution(listId?: string, listName?: string): void {
    if (typeof window !== 'undefined') {
      if (listId) {
        sessionStorage.setItem('analytics_list_id', listId);
      }
      if (listName) {
        sessionStorage.setItem('analytics_list_name', listName);
      }
    }
  }

  /**
   * Clear list attribution
   */
  static clearListAttribution(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('analytics_list_id');
      sessionStorage.removeItem('analytics_list_name');
    }
  }
}