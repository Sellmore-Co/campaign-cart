/**
 * Order Display Enhancer
 * Displays order data using the unified data-next-display="order.xxx" pattern
 */

import { BaseDisplayEnhancer, PropertyResolver, DisplayFormatter } from './DisplayEnhancerCore';
import { AttributeParser } from '../base/AttributeParser';
import { getPropertyMapping } from './DisplayEnhancerTypes';
import { useOrderStore } from '@/stores/orderStore';
import { useConfigStore } from '@/stores/configStore';
import { ApiClient } from '@/api/client';
import type { Order, OrderLine } from '@/types/api';

export class OrderDisplayEnhancer extends BaseDisplayEnhancer {
  private apiClient?: ApiClient;
  private orderState: any = {};

  public override async initialize(): Promise<void> {
    // Check for ref_id in URL and auto-load order BEFORE parent initialization
    await this.checkAndLoadOrderFromUrl();
    
    // Call parent initialization which handles display attributes and store subscriptions
    await super.initialize();
  }

  protected setupStoreSubscriptions(): void {
    // Subscribe to order store changes
    this.subscribe(useOrderStore, this.handleOrderUpdate.bind(this));
    
    // Initial state
    this.orderState = useOrderStore.getState();
  }

  protected getPropertyValue(): any {
    return this.getDisplayValue(this.orderState, this.displayPath!);
  }

  public override update(data?: any): void {
    if (data) {
      this.handleOrderUpdate(data);
    } else {
      super.update();
    }
  }

  private async checkAndLoadOrderFromUrl(): Promise<void> {
    const urlParams = new URLSearchParams(window.location.search);
    // Check for both ref_id and order_ref_id parameters
    const refId = urlParams.get('ref_id') || urlParams.get('order_ref_id');

    if (refId) {
      const orderStore = useOrderStore.getState();

      // Only load if not already loaded or loading
      if (!orderStore.order && !orderStore.isLoading && orderStore.refId !== refId) {
        try {
          const config = useConfigStore.getState();
          this.apiClient = new ApiClient(config.apiKey);

          await orderStore.loadOrder(refId, this.apiClient);
        } catch (error) {
          this.logger.error('Failed to auto-load order:', error);
        }
      }
    }
  }

  private handleOrderUpdate(orderState: any): void {
    try {
      // Update internal state
      this.orderState = orderState;
      
      // Update loading state classes
      if (orderState.isLoading) {
        this.addClass('next-loading');
        this.removeClass('next-loaded');
        this.removeClass('next-error');
      } else if (orderState.error) {
        this.removeClass('next-loading');
        this.removeClass('next-loaded');
        this.addClass('next-error');
      } else if (orderState.order) {
        this.removeClass('next-loading');
        this.addClass('next-loaded');
        this.removeClass('next-error');
      }
      
      // Trigger display update through parent class
      this.updateDisplay();
      
    } catch (error) {
      this.handleError(error, 'handleOrderUpdate');
      this.updateElementContent('N/A');
      this.addClass('next-error');
    }
  }

  protected override updateElementContent(value: string): void {
    // Special handling for order status URL links
    if (this.element.tagName === 'A' && this.displayPath?.includes('statusUrl')) {
      (this.element as HTMLAnchorElement).href = value;
      if (!this.element.textContent) {
        this.element.textContent = 'View Order Status';
      }
    } else {
      // Use parent implementation for standard cases
      super.updateElementContent(value);
    }
  }

  private getDisplayValue(orderState: any, path: string): any {
    const parsed = AttributeParser.parseDisplayPath(path);
    const property = parsed.property;
    
    if (!property) {
      return '';
    }
    
    // At this point, property is guaranteed to be a non-empty string
    const propertyStr = property as string;
    
    const order = orderState.order;
    
    if (!order) {
      // Handle loading and error states
      if (orderState.isLoading) {
        return 'Loading...';
      } else if (orderState.error) {
        return 'Error';
      }
      return '';
    }
    
    // Check property mappings first
    const mappedPath = getPropertyMapping('order', propertyStr);
    if (mappedPath) {
      // Handle calculated properties
      if (mappedPath.startsWith('_calculated.')) {
        return this.getCalculatedProperty(order, mappedPath.substring(12));
      }
      
      // If we have a mapping, use PropertyResolver to get the value
      // For order object, we need to check if it's a direct property or nested
      if (mappedPath.startsWith('order.')) {
        const value = PropertyResolver.getNestedProperty(order, mappedPath.substring(6));
        if (value !== undefined) {
          return value;
        }
      } else {
        const value = PropertyResolver.getNestedProperty(orderState, mappedPath);
        if (value !== undefined) {
          return value;
        }
      }
    }
    
    // Handle nested properties
    const parts = propertyStr.split('.');
    
    // Try using PropertyResolver for simple nested properties first
    if (parts.length > 1 && parts[0] && !this.isComplexOrderProperty(parts[0])) {
      const resolvedValue = PropertyResolver.getNestedProperty(order, propertyStr);
      if (resolvedValue !== undefined) {
        return resolvedValue;
      }
    }
    
    // Handle complex order-specific properties that need special handling
    switch (parts[0]) {
      case 'created_at':
      case 'createdAt':
        // Order API doesn't have created_at, use metadata timestamp if available
        const timestamp = order.attribution?.metadata?.timestamp;
        if (!timestamp) return '';
        if (parts[1] === 'raw') return timestamp;
        // Convert milliseconds timestamp to date
        return DisplayFormatter.formatDate(new Date(timestamp));
      
      case 'testBadge':
        return order.is_test ? '🧪 TEST ORDER' : '';
        
      // User/Customer properties
      case 'user':
      case 'customer':
        return this.getOrderUserProperty(order, parts.slice(1).join('.') || '');
        
      // Address properties
      case 'shippingAddress':
        return this.getOrderAddressProperty(order.shipping_address, parts.slice(1).join('.') || '');
      case 'billingAddress':
        return this.getOrderAddressProperty(order.billing_address, parts.slice(1).join('.') || '');
        
      // Line items
      case 'items':
      case 'lines':
        return this.getOrderLinesProperty(order, parts.slice(1).join('.') || '');
        
      // Attribution
      case 'attribution':
        return this.getOrderAttributionProperty(order.attribution, parts.slice(1).join('.') || '');
        
      default:
        this.logger.warn(`Unknown order property: ${propertyStr}`);
        return '';
    }
  }

  private getOrderUserProperty(order: Order, property: string): any {
    const user = order.user;
    if (!user) return '';
    
    switch (property) {
      case '':
      case 'name':
        return `${user.first_name || ''} ${user.last_name || ''}`.trim();
      case 'email':
        return String(user.email || '');
      case 'firstName':
        return String(user.first_name || '');
      case 'lastName':
        return String(user.last_name || '');
      case 'phone':
        return String(user.phone_number || '');
      case 'acceptsMarketing':
        return user.accepts_marketing;
      case 'language':
        return String(user.language || '');
      case 'ip':
        return String(user.ip || '');
      default:
        return '';
    }
  }

  private getOrderAddressProperty(address: any, property: string): any {
    if (!address) return '';
    
    switch (property) {
      case '':
      case 'full':
        return this.formatAddress(address);
      case 'name':
        return `${address.first_name || ''} ${address.last_name || ''}`.trim();
      case 'line1':
        return String(address.line1 || '');
      case 'line2':
        return String(address.line2 || '');
      case 'city':
        return String(address.line4 || '');
      case 'state':
        return String(address.state || '');
      case 'zip':
      case 'postcode':
        return String(address.postcode || '');
      case 'country':
        return String(address.country || '');
      case 'phone':
        return String(address.phone_number || '');
      default:
        return '';
    }
  }

  private getOrderLinesProperty(order: Order, property: string): any {
    const lines = order.lines || [];
    
    switch (property) {
      case 'count':
        return lines.length;
      case 'totalQuantity':
        return lines.reduce((sum, line) => sum + (line.quantity || 0), 0);
      case 'upsellCount':
        return lines.filter(line => line.is_upsell).length;
      case 'mainProduct':
        return lines[0]?.product_title || '';
      case 'mainProductSku':
        return lines[0]?.product_sku || '';
      default:
        // Handle array index access like lines[0].title
        const match = property.match(/^\[(\d+)\]\.(.+)$/);
        if (match && match[1] && match[2]) {
          const index = parseInt(match[1], 10);
          const prop = match[2];
          const line = lines[index];
          if (line && prop) {
            return this.getOrderLineProperty(line, prop);
          }
        }
        return '';
    }
  }

  private getOrderLineProperty(line: OrderLine, property: string): any {
    switch (property) {
      case 'title':
      case 'product_title':
        return line.product_title || '';
      case 'sku':
      case 'product_sku':
        return line.product_sku || '';
      case 'quantity':
        return line.quantity || 0;
      case 'price':
        return DisplayFormatter.formatCurrency(parseFloat(line.price_incl_tax || '0'));
      case 'price.raw':
        return parseFloat(line.price_incl_tax || '0');
      case 'priceExclTax':
        return DisplayFormatter.formatCurrency(parseFloat(line.price_excl_tax || '0'));
      case 'priceExclTax.raw':
        return parseFloat(line.price_excl_tax || '0');
      case 'priceExclTaxExclDiscounts':
        return DisplayFormatter.formatCurrency(parseFloat(line.price_excl_tax_excl_discounts || '0'));
      case 'priceExclTaxExclDiscounts.raw':
        return parseFloat(line.price_excl_tax_excl_discounts || '0');
      case 'priceInclTaxExclDiscounts':
        return DisplayFormatter.formatCurrency(parseFloat(line.price_incl_tax_excl_discounts || '0'));
      case 'priceInclTaxExclDiscounts.raw':
        return parseFloat(line.price_incl_tax_excl_discounts || '0');
      case 'total':
        return DisplayFormatter.formatCurrency(parseFloat(line.price_incl_tax || '0') * (line.quantity || 1));
      case 'total.raw':
        return parseFloat(line.price_incl_tax || '0') * (line.quantity || 1);
      case 'totalExclTax':
        return DisplayFormatter.formatCurrency(parseFloat(line.price_excl_tax || '0') * (line.quantity || 1));
      case 'totalExclTax.raw':
        return parseFloat(line.price_excl_tax || '0') * (line.quantity || 1);
      case 'isUpsell':
        return line.is_upsell || false;
      case 'image':
        return line.image || '';
      default:
        return '';
    }
  }

  private getOrderAttributionProperty(attribution: any, property: string): any {
    if (!attribution) return '';
    
    switch (property) {
      case 'source':
      case 'utm_source':
        return attribution.utm_source || '';
      case 'medium':
      case 'utm_medium':
        return attribution.utm_medium || '';
      case 'campaign':
      case 'utm_campaign':
        return attribution.utm_campaign || '';
      case 'term':
      case 'utm_term':
        return attribution.utm_term || '';
      case 'content':
      case 'utm_content':
        return attribution.utm_content || '';
      case 'gclid':
        return attribution.gclid || '';
      case 'funnel':
        return attribution.funnel || '';
      case 'affiliate':
        return attribution.affiliate || '';
      case 'hasTracking':
        return !!(attribution.utm_source || attribution.utm_medium || attribution.gclid);
      default:
        return '';
    }
  }

  private formatAddress(address: any): string {
    if (!address) return '';
    
    const parts = [
      address.line1,
      address.line2,
      address.line4, // city
      address.state,
      address.postcode,
      address.country
    ].filter(Boolean).map(part => String(part));
    
    return parts.join(', ');
  }

  private isComplexOrderProperty(property: string): boolean {
    const complexProperties = [
      'user', 'customer', 'total', 'subtotal', 'tax', 'shipping', 'discounts',
      'shippingAddress', 'billingAddress',
      'items', 'lines', 'attribution', 'created_at'
    ];
    return complexProperties.includes(property);
  }

  private getCalculatedProperty(order: Order, property: string): any {
    switch (property) {
      // Subtotal (line items only, excluding shipping and tax)
      case 'subtotal':
      case 'subtotalExclShipping':
        // Calculate subtotal from line items only (excludes shipping)
        if (order.lines && order.lines.length > 0) {
          return order.lines.reduce((sum: number, line: OrderLine) => {
            return sum + parseFloat(line.price_excl_tax || '0');
          }, 0);
        }
        // Fallback: subtract shipping from total_excl_tax
        const totalExclTax = parseFloat(order.total_excl_tax || '0');
        const shippingExclTax = parseFloat(order.shipping_excl_tax || '0');
        return totalExclTax - shippingExclTax;
      
      // Savings calculations
      case 'savings':
      case 'savingsAmount':
        // Calculate savings from line items if available
        if (order.lines && order.lines.length > 0) {
          const originalTotal = order.lines.reduce((sum: number, line: OrderLine) => {
            return sum + (parseFloat(line.price_incl_tax_excl_discounts || line.price_incl_tax || '0') * line.quantity);
          }, 0);
          const currentTotal = parseFloat(order.total_incl_tax || '0');
          return Math.max(0, originalTotal - currentTotal);
        }
        // Fallback to discounts if no line item data
        return parseFloat(order.total_discounts || '0');
      
      case 'savingsPercentage':
        // Calculate savings percentage from line items if available
        if (order.lines && order.lines.length > 0) {
          const originalPrice = order.lines.reduce((sum: number, line: OrderLine) => {
            return sum + (parseFloat(line.price_incl_tax_excl_discounts || line.price_incl_tax || '0') * line.quantity);
          }, 0);
          const currentPrice = parseFloat(order.total_incl_tax || '0');
          if (originalPrice > 0 && originalPrice > currentPrice) {
            return ((originalPrice - currentPrice) / originalPrice) * 100;
          }
        }
        return 0;
      
      case 'hasSavings':
        // Check if any discounts applied or line items have pre-discount prices
        if (parseFloat(order.total_discounts || '0') > 0) {
          return true;
        }
        if (order.lines && order.lines.length > 0) {
          return order.lines.some((line: OrderLine) => {
            const beforeDiscount = parseFloat(line.price_incl_tax_excl_discounts || '0');
            const afterDiscount = parseFloat(line.price_incl_tax || '0');
            return beforeDiscount > afterDiscount;
          });
        }
        return false;
      
      // Boolean flags
      case 'hasItems':
        return order.lines && order.lines.length > 0;
      case 'isEmpty':
        return !order.lines || order.lines.length === 0;
      case 'hasShipping':
        return parseFloat(order.shipping_incl_tax || '0') > 0;
      case 'hasTax':
        return parseFloat(order.total_tax || '0') > 0;
      case 'hasDiscounts':
        return parseFloat(order.total_discounts || '0') > 0;
      case 'hasUpsells':
        return order.lines?.some((line: OrderLine) => line.is_upsell) || false;
      
      // Line items calculations
      case 'lines.count':
        return order.lines?.length || 0;
      case 'lines.totalQuantity':
        return order.lines?.reduce((sum: number, line: OrderLine) => sum + (line.quantity || 0), 0) || 0;
      case 'lines.upsellCount':
        return order.lines?.filter((line: OrderLine) => line.is_upsell).length || 0;
      case 'lines.mainProduct':
        return order.lines?.[0]?.product_title || '';
      case 'lines.mainProductSku':
        return order.lines?.[0]?.product_sku || '';
      
      default:
        return undefined;
    }
  }
}