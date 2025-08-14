import { ProviderAdapter } from './ProviderAdapter';
import { DataLayerEvent } from '../types';
import { createLogger } from '@/utils/logger';

const logger = createLogger('RudderStack');

declare global {
  interface Window {
    rudderanalytics: {
      track: (event: string, properties?: any, options?: any) => void;
      page: (category?: string, name?: string, properties?: any, options?: any) => void;
      identify: (userId: string, traits?: any, options?: any) => void;
      reset: () => void;
      ready: (callback: () => void) => void;
    };
  }
}

/**
 * RudderStack Analytics adapter
 * Maps SDK events to RudderStack events matching the old integration format
 */
export class RudderStackAdapter extends ProviderAdapter {
  private pageViewSent = false;

  constructor() {
    super('RudderStack');
  }

  /**
   * Track event - called by DataLayerManager
   */
  override trackEvent(event: DataLayerEvent): void {
    this.sendEvent(event);
  }

  /**
   * Check if RudderStack is loaded
   */
  private isRudderStackLoaded(): boolean {
    return this.isBrowser() && typeof window.rudderanalytics === 'object' && 
           typeof window.rudderanalytics.track === 'function';
  }

  /**
   * Send event to RudderStack
   */
  sendEvent(event: DataLayerEvent): void {
    if (!this.enabled) {
      this.debug('RudderStack adapter disabled');
      return;
    }

    // Log all events being sent to RudderStack
    logger.info(`Processing event "${event.event}"`, {
      eventName: event.event,
      eventData: event
    });

    // If RudderStack is not loaded yet, wait for it
    if (!this.isRudderStackLoaded()) {
      this.waitForRudderStack().then(() => {
        this.sendEventInternal(event);
      }).catch(() => {
        this.debug('RudderStack failed to load, skipping event:', event.event);
      });
      return;
    }

    this.sendEventInternal(event);
  }

  /**
   * Wait for RudderStack to be loaded
   */
  private async waitForRudderStack(timeout: number = 5000): Promise<void> {
    const start = Date.now();
    
    return new Promise((resolve, reject) => {
      // Check if ready callback is available
      if (window.rudderanalytics?.ready) {
        window.rudderanalytics.ready(() => resolve());
        
        // Still set a timeout in case ready never fires
        setTimeout(() => {
          if (this.isRudderStackLoaded()) {
            resolve();
          } else {
            reject(new Error('RudderStack ready timeout'));
          }
        }, timeout);
      } else {
        // Fallback to polling
        const checkInterval = setInterval(() => {
          if (this.isRudderStackLoaded()) {
            clearInterval(checkInterval);
            resolve();
          } else if (Date.now() - start > timeout) {
            clearInterval(checkInterval);
            reject(new Error('RudderStack load timeout'));
          }
        }, 100);
      }
    });
  }

  /**
   * Internal method to send event after RudderStack is confirmed loaded
   */
  private sendEventInternal(event: DataLayerEvent): void {
    try {
      // Handle special events
      switch (event.event) {
        case 'dl_page_view':
        case 'page_view':
          this.handlePageView(event);
          break;
        
        case 'dl_user_data':
        case 'user_data':
          this.handleUserData(event);
          break;
        
        default:
          // Map to RudderStack event names
          const rudderEventName = this.mapEventName(event.event);
          if (rudderEventName) {
            const properties = this.buildEventProperties(event, rudderEventName);
            window.rudderanalytics.track(rudderEventName, properties);
            this.debug(`Event sent to RudderStack: ${rudderEventName}`, properties);
          }
      }
    } catch (error) {
      console.error('Error sending event to RudderStack:', error);
    }
  }

  /**
   * Handle page view events
   */
  private handlePageView(event: DataLayerEvent): void {
    // Skip duplicate page views
    if (this.pageViewSent) {
      this.debug('Page view already sent, skipping duplicate');
      return;
    }

    const data = event.data || {};
    const pageType = data.page_type || 'unknown';
    const pageName = data.page_name || 'unknown';
    
    // Get campaign data from event or context
    const campaignData = this.getCampaignData(data);
    
    const properties = {
      path: data.page_location || window.location.pathname,
      url: data.page_location || window.location.href,
      title: data.page_title || document.title,
      referrer: data.page_referrer || document.referrer,
      campaignName: campaignData.campaignName,
      campaignApiKey: campaignData.campaignApiKey,
      campaignCurrency: campaignData.campaignCurrency,
      campaignLanguage: campaignData.campaignLanguage
    };

    // Send standard page call
    window.rudderanalytics.page(pageType, pageName, properties);
    
    // Send custom page type event (matching old format)
    const pageTypeCapitalized = pageType.charAt(0).toUpperCase() + pageType.slice(1);
    const eventName = `${pageTypeCapitalized} Page View`;
    
    window.rudderanalytics.track(eventName, {
      pageName: pageName,
      ...properties
    });
    
    this.pageViewSent = true;
    this.debug('Page View tracked', { pageType, pageName, eventName });
  }

  /**
   * Handle user data events for identification
   */
  private handleUserData(event: DataLayerEvent): void {
    const userData = event.user_properties || event.data || {};
    
    if (userData.customer_email || userData.email || userData.user_id) {
      const userId = userData.user_id || userData.customer_email || userData.email;
      
      const traits = {
        email: userData.customer_email || userData.email,
        firstName: userData.customer_first_name || userData.firstName || userData.first_name,
        lastName: userData.customer_last_name || userData.lastName || userData.last_name,
        phone: userData.customer_phone || userData.phone,
        city: userData.customer_city || userData.city,
        state: userData.customer_state || userData.state,
        country: userData.customer_country || userData.country,
        postalCode: userData.customer_zip || userData.postalCode || userData.postal_code,
        acceptsMarketing: userData.customer_accepts_marketing || userData.acceptsMarketing || userData.accepts_marketing
      };
      
      // Remove undefined values
      Object.keys(traits).forEach(key => 
        traits[key as keyof typeof traits] === undefined && delete traits[key as keyof typeof traits]
      );
      
      window.rudderanalytics.identify(userId, traits);
      this.debug('User Identified', { userId, traits });
    }
  }

  /**
   * Map data layer event names to RudderStack event names
   */
  private mapEventName(eventName: string): string | null {
    // Event name mapping to match old integration
    const eventMapping: Record<string, string> = {
      // Ecommerce events
      'dl_view_item': 'Product Viewed',
      'dl_view_item_list': 'Product List Viewed',
      'dl_add_to_cart': 'Product Added',
      'dl_remove_from_cart': 'Product Removed',
      'dl_view_cart': 'Cart Viewed',
      'dl_cart_updated': 'Cart Viewed',
      'dl_begin_checkout': 'Checkout Started',
      'dl_add_shipping_info': 'Shipping Info Added',
      'dl_add_payment_info': 'Payment Info Added',
      'dl_purchase': 'Order Completed',
      
      // Standard names
      'view_item': 'Product Viewed',
      'view_item_list': 'Product List Viewed',
      'add_to_cart': 'Product Added',
      'remove_from_cart': 'Product Removed',
      'view_cart': 'Cart Viewed',
      'begin_checkout': 'Checkout Started',
      'add_shipping_info': 'Shipping Info Added',
      'add_payment_info': 'Payment Info Added',
      'purchase': 'Order Completed',
      
      // Upsell events
      'dl_viewed_upsell': 'Upsell Viewed',
      'dl_accepted_upsell': 'Upsell Accepted',
      'dl_skipped_upsell': 'Upsell Skipped',
      
      // User events
      'dl_sign_up': 'Signed Up',
      'dl_login': 'Logged In',
      'sign_up': 'Signed Up',
      'login': 'Logged In'
    };

    return eventMapping[eventName] || null;
  }

  /**
   * Build event properties based on event type
   */
  private buildEventProperties(event: DataLayerEvent, rudderEventName: string): any {
    const data = event.data || event.ecommerce || {};
    const pageMetadata = this.getPageMetadata();
    const campaignData = this.getCampaignData(data);

    // Base properties
    const baseProps = {
      pageType: pageMetadata.pageType,
      pageName: pageMetadata.pageName,
      campaignName: campaignData.campaignName,
      campaignApiKey: campaignData.campaignApiKey
    };

    switch (rudderEventName) {
      case 'Product Viewed':
        return this.buildProductViewedProps(data, baseProps);
      
      case 'Product List Viewed':
        return this.buildProductListViewedProps(data, baseProps);
      
      case 'Product Added':
      case 'Product Removed':
        return this.buildProductAddedRemovedProps(data, baseProps);
      
      case 'Cart Viewed':
        return this.buildCartViewedProps(data, baseProps);
      
      case 'Checkout Started':
        return this.buildCheckoutStartedProps(data, baseProps);
      
      case 'Shipping Info Added':
        return this.buildShippingInfoProps(data, baseProps);
      
      case 'Payment Info Added':
        return this.buildPaymentInfoProps(data, baseProps);
      
      case 'Order Completed':
        return this.buildOrderCompletedProps(data, baseProps);
      
      case 'Upsell Viewed':
      case 'Upsell Accepted':
      case 'Upsell Skipped':
        return this.buildUpsellProps(event, rudderEventName, baseProps);
      
      default:
        return { ...data, ...baseProps };
    }
  }

  /**
   * Build Product Viewed properties
   */
  private buildProductViewedProps(data: any, baseProps: any): any {
    const items = data.items || [];
    const item = items[0] || {};
    
    return {
      product_id: item.item_id || '',
      sku: item.item_id || '',
      name: item.item_name || '',
      price: parseFloat(item.price) || 0,
      currency: data.currency || 'USD',
      quantity: parseInt(item.quantity) || 1,
      position: item.position || 0,
      url: window.location.href,
      ...baseProps
    };
  }

  /**
   * Build Product List Viewed properties
   */
  private buildProductListViewedProps(data: any, baseProps: any): any {
    const products = this.formatProducts(data.items || []);
    
    return {
      list_id: data.list_id || 'main-product-list',
      category: baseProps.pageType,
      products: products,
      currency: data.currency || 'USD',
      ...baseProps
    };
  }

  /**
   * Build Product Added/Removed properties
   */
  private buildProductAddedRemovedProps(data: any, baseProps: any): any {
    const items = data.items || [];
    const item = items[0] || {};
    const campaignData = this.getCampaignData(data);
    
    return {
      cart_id: `cart-${Date.now()}`,
      product_id: item.item_id || '',
      sku: item.item_id || '',
      name: item.item_name || '',
      price: parseFloat(item.price) || 0,
      currency: data.currency || campaignData.campaignCurrency || 'USD',
      quantity: parseInt(item.quantity) || 1,
      category: item.item_category || '',
      position: item.position || 0,
      url: window.location.href,
      ...baseProps
    };
  }

  /**
   * Build Cart Viewed properties
   */
  private buildCartViewedProps(data: any, baseProps: any): any {
    const products = this.formatProducts(data.items || []);
    const campaignData = this.getCampaignData(data);
    
    return {
      cart_id: `cart-${Date.now()}`,
      products: products,
      currency: data.currency || campaignData.campaignCurrency || 'USD',
      value: parseFloat(data.value) || 0,
      ...baseProps
    };
  }

  /**
   * Build Shipping Info Added properties
   */
  private buildShippingInfoProps(data: any, baseProps: any): any {
    const products = this.formatProducts(data.items || []);
    const campaignData = this.getCampaignData(data);
    
    return {
      checkout_id: `checkout-${Date.now()}`,
      value: parseFloat(data.value) || 0,
      currency: data.currency || campaignData.campaignCurrency || 'USD',
      shipping_tier: data.shipping_tier || 'standard',
      products: products,
      ...baseProps
    };
  }

  /**
   * Build Payment Info Added properties
   */
  private buildPaymentInfoProps(data: any, baseProps: any): any {
    const products = this.formatProducts(data.items || []);
    const campaignData = this.getCampaignData(data);
    
    return {
      checkout_id: `checkout-${Date.now()}`,
      value: parseFloat(data.value) || 0,
      currency: data.currency || campaignData.campaignCurrency || 'USD',
      payment_type: data.payment_type || 'credit_card',
      products: products,
      ...baseProps
    };
  }

  /**
   * Build Checkout Started properties
   */
  private buildCheckoutStartedProps(data: any, baseProps: any): any {
    const products = this.formatProducts(data.items || []);
    const campaignData = this.getCampaignData(data);
    
    return {
      order_id: `pending-${Date.now()}`,
      value: parseFloat(data.value) || 0,
      revenue: parseFloat(data.value) || 0,
      currency: data.currency || campaignData.campaignCurrency || 'USD',
      products: products,
      ...baseProps
    };
  }

  /**
   * Build Order Completed properties
   */
  private buildOrderCompletedProps(data: any, baseProps: any): any {
    const products = this.formatProducts(data.items || []);
    const campaignData = this.getCampaignData(data);
    
    const props: any = {
      checkout_id: `checkout-${Date.now()}`,
      order_id: data.transaction_id || '',
      affiliation: data.affiliation || campaignData.campaignName || 'Funnels',
      total: parseFloat(data.value) || 0,
      revenue: parseFloat(data.value) || 0,
      shipping: parseFloat(data.shipping) || 0,
      tax: parseFloat(data.tax) || 0,
      discount: parseFloat(data.discount) || 0,
      coupon: data.coupon || '',
      currency: data.currency || campaignData.campaignCurrency || 'USD',
      products: products,
      ...baseProps
    };

    // Handle user identification on purchase
    if (data.email_hash || data.firstname) {
      const userId = data.email_hash || `user-${data.transaction_id}`;
      const traits = {
        firstName: data.firstname || '',
        lastName: data.lastname || '',
        city: data.city || '',
        state: data.state || '',
        postalCode: data.zipcode || '',
        country: data.country || ''
      };
      
      // Remove empty values
      Object.keys(traits).forEach(key => 
        traits[key as keyof typeof traits] === '' && delete traits[key as keyof typeof traits]
      );
      
      if (Object.keys(traits).length > 0) {
        window.rudderanalytics.identify(userId, traits);
        this.debug('User Identified on Purchase', { userId });
      }
    }

    return props;
  }

  /**
   * Build Upsell properties
   */
  private buildUpsellProps(event: DataLayerEvent, eventName: string, baseProps: any): any {
    const data = event.data || event;
    const campaignData = this.getCampaignData(data);
    
    if (eventName === 'Upsell Accepted') {
      // Also track as Product Added for accepted upsells
      const productProps = {
        cart_id: `cart-upsell-${Date.now()}`,
        product_id: data.upsell_id || '',
        sku: data.upsell_id || '',
        name: data.upsell_name || '',
        price: parseFloat(data.upsell_price) || 0,
        currency: data.currency || campaignData.campaignCurrency || 'USD',
        quantity: 1,
        url: window.location.href,
        isUpsell: true,
        upsellRef: data.upsell_id || '',
        originalOrderId: data.order_id || data.transaction_id || '',
        ...baseProps
      };
      
      window.rudderanalytics.track('Product Added', productProps);
    }
    
    // Track the upsell event
    return {
      order_id: data.order_id || data.transaction_id || '',
      product_id: data.upsell_id || '',
      product_name: data.upsell_name || '',
      price: parseFloat(data.upsell_price) || 0,
      quantity: 1,
      total: parseFloat(data.value || data.upsell_price) || 0,
      currency: data.currency || campaignData.campaignCurrency || 'USD',
      ref_id: data.upsell_id || '',
      ...baseProps
    };
  }

  /**
   * Format products array to match old integration format
   */
  private formatProducts(items: any[]): any[] {
    if (!items || !Array.isArray(items)) return [];
    
    return items.map(item => ({
      product_id: item.item_id || item.id || '',
      sku: item.item_id || item.id || '',
      name: item.item_name || item.name || '',
      price: parseFloat(item.price) || 0,
      quantity: parseInt(item.quantity) || 1,
      category: item.item_category || item.category || '',
      brand: item.item_brand || item.brand || '',
      variant: item.item_variant || '',
      position: item.position || 0,
      url: window.location.href,
      image_url: item.image_url || ''
    }));
  }

  /**
   * Get page metadata
   */
  private getPageMetadata(): { pageType: string; pageName: string } {
    const pageType = document.querySelector('meta[name="next-page-type"]')?.getAttribute('content') || 'unknown';
    const pageName = document.querySelector('meta[name="next-page-name"]')?.getAttribute('content') || 'unknown';
    return { pageType, pageName };
  }

  /**
   * Get campaign data from event or SDK
   */
  private getCampaignData(data: any): any {
    // Try to get from event data first
    if (data.campaignName) {
      return {
        campaignName: data.campaignName,
        campaignApiKey: data.campaignApiKey || '',
        campaignCurrency: data.campaignCurrency || 'USD',
        campaignLanguage: data.campaignLanguage || ''
      };
    }

    // Try to get from SDK if available
    if (this.isBrowser() && (window as any).next) {
      const sdk = (window as any).next;
      const campaignData = sdk.getCampaignData?.();
      if (campaignData) {
        return {
          campaignName: campaignData.name || '',
          campaignApiKey: (window as any).nextDebug?.stores?.config?.getState()?.apiKey || '',
          campaignCurrency: campaignData.currency || 'USD',
          campaignLanguage: campaignData.language || ''
        };
      }
    }

    return {
      campaignName: '',
      campaignApiKey: '',
      campaignCurrency: 'USD',
      campaignLanguage: ''
    };
  }
}