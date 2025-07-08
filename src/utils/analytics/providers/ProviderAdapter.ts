import { DataLayerEvent } from '../types';

/**
 * Base adapter class for analytics providers
 */
export abstract class ProviderAdapter {
  protected name: string;
  protected enabled: boolean = true;

  constructor(name: string) {
    this.name = name;
  }

  /**
   * Enable or disable the adapter
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if the adapter is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Track event - called by DataLayerManager
   */
  trackEvent(event: DataLayerEvent): void {
    this.sendEvent(event);
  }

  /**
   * Send event to the provider
   */
  abstract sendEvent(event: DataLayerEvent): void;

  /**
   * Transform event data to provider-specific format
   */
  protected transformEvent(event: DataLayerEvent): any {
    // Default implementation - can be overridden by subclasses
    return {
      event: event.event,
      ...event.data
    };
  }

  /**
   * Log debug information
   */
  protected debug(message: string, data?: any): void {
    if (typeof window !== 'undefined' && window.localStorage?.getItem('analytics_debug') === 'true') {
      console.log(`[${this.name}]`, message, data || '');
    }
  }

  /**
   * Check if we're in a browser environment
   */
  protected isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  /**
   * Safe property access helper
   */
  protected getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Format currency values
   */
  protected formatCurrency(value: number): string {
    return value.toFixed(2);
  }

  /**
   * Extract common ecommerce properties
   */
  protected extractEcommerceData(event: DataLayerEvent): any {
    // Check if ecommerce data is in the ecommerce property
    const ecommerceData = event.ecommerce || event.data || {};
    
    return {
      currency: ecommerceData.currency || 'USD',
      value: ecommerceData.value || ecommerceData.total || 0,
      items: ecommerceData.items || ecommerceData.products || [],
      transaction_id: ecommerceData.transaction_id || ecommerceData.order_id,
      coupon: ecommerceData.coupon || ecommerceData.discount_code,
      shipping: ecommerceData.shipping || 0,
      tax: ecommerceData.tax || 0
    };
  }
}