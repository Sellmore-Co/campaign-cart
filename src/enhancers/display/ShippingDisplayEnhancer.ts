/**
 * Shipping Display Enhancer
 * Displays shipping data based on data-next-shipping-id context
 */

import { BaseDisplayEnhancer, DisplayFormatter } from './DisplayEnhancerCore';
import { getPropertyMapping } from './DisplayEnhancerTypes';
import { useCampaignStore } from '@/stores/campaignStore';
// import { useCartStore } from '@/stores/cartStore'; - removed unused import
import type { ShippingOption } from '@/types/api';

export class ShippingDisplayEnhancer extends BaseDisplayEnhancer {
  private shippingId?: number;
  private shippingMethod?: ShippingOption;

  override async initialize(): Promise<void> {
    this.validateElement();
    this.parseDisplayAttributes();
    
    // Find shipping context
    this.detectShippingContext();
    
    if (!this.shippingId) {
      this.logger.warn('ShippingDisplayEnhancer requires data-next-shipping-id context');
      return;
    }
    
    this.setupStoreSubscriptions();
    await this.performInitialUpdate();
    
    this.logger.debug(`ShippingDisplayEnhancer initialized with shipping ID ${this.shippingId}`);
  }

  protected setupStoreSubscriptions(): void {
    // Subscribe to campaign store for shipping methods
    this.subscribe(useCampaignStore, this.handleCampaignUpdate.bind(this));
    
    // Get initial shipping method
    this.loadShippingMethod();
  }

  private handleCampaignUpdate(): void {
    this.loadShippingMethod();
    this.updateDisplay();
  }

  private detectShippingContext(): void {
    // Find the closest parent element with data-next-shipping-id
    const shippingElement = this.element.closest('[data-next-shipping-id]') as HTMLElement;
    
    if (!shippingElement) {
      return;
    }
    
    const shippingIdStr = shippingElement.getAttribute('data-next-shipping-id');
    if (shippingIdStr) {
      this.shippingId = parseInt(shippingIdStr, 10);
    }
  }

  private loadShippingMethod(): void {
    if (!this.shippingId) return;
    
    const campaignStore = useCampaignStore.getState();
    const shippingMethods = campaignStore.data?.shipping_methods || [];
    
    const method = shippingMethods.find(
      method => method.ref_id === this.shippingId
    );
    if (method) {
      this.shippingMethod = method;
    }
    
    if (!this.shippingMethod) {
      this.logger.warn(`Shipping method ${this.shippingId} not found in campaign data`);
    }
  }

  protected getPropertyValue(): any {
    if (!this.shippingMethod || !this.property) return undefined;

    // Handle calculated properties
    const mappedPath = getPropertyMapping('shipping', this.property);
    if (mappedPath && mappedPath.startsWith('_calculated.')) {
      const calculatedProp = mappedPath.replace('_calculated.', '');
      return this.getCalculatedProperty(calculatedProp);
    }

    // Direct property access
    switch (this.property) {
      case 'isFree':
        return parseFloat(this.shippingMethod.price || '0') === 0;
      
      case 'cost':
      case 'price':
        return DisplayFormatter.formatValue(parseFloat(this.shippingMethod.price || '0'), 'currency');
      
      case 'cost.raw':
      case 'price.raw':
        return parseFloat(this.shippingMethod.price || '0');
      
      case 'name':
      case 'code':
        return this.shippingMethod.code;
      
      case 'id':
      case 'refId':
        return this.shippingMethod.ref_id;
      
      case 'method':
        return this.shippingMethod;
      
      default:
        return undefined;
    }
  }

  private getCalculatedProperty(property: string): any {
    if (!this.shippingMethod) return undefined;

    switch (property) {
      case 'isFree':
        return parseFloat(this.shippingMethod.price || '0') === 0;
      
      case 'cost':
      case 'price':
        return DisplayFormatter.formatValue(parseFloat(this.shippingMethod.price || '0'), 'currency');
      
      case 'name':
      case 'code':
        return this.shippingMethod.code;
      
      case 'id':
      case 'refId':
        return this.shippingMethod.ref_id;
      
      case 'method':
        return this.shippingMethod;
      
      default:
        return undefined;
    }
  }

  public override update(): void {
    this.updateDisplay();
  }
}