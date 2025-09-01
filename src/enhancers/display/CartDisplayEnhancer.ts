/**
 * Cart Display Enhancer
 * Displays cart-related data with automatic updates
 */

import { BaseDisplayEnhancer, PropertyResolver } from './DisplayEnhancerCore';
import { getPropertyConfig } from './DisplayEnhancerTypes';
import { AttributeParser } from '../base/AttributeParser';
import { PackageContextResolver } from '@/utils/dom/PackageContextResolver';
import { useCartStore } from '@/stores/cartStore';
import type { CartState } from '@/types/global';

export class CartDisplayEnhancer extends BaseDisplayEnhancer {
  private cartState?: CartState;
  private includeDiscounts: boolean = false;

  override async initialize(): Promise<void> {
    // Check for include discounts attribute early
    this.includeDiscounts = this.element.hasAttribute('data-include-discounts');
    
    await super.initialize();
  }

  protected setupStoreSubscriptions(): void {
    // Subscribe to cart store updates
    this.subscribe(useCartStore, this.handleCartUpdate.bind(this));
    
    // Get initial cart state - this should now have rehydrated data
    this.cartState = useCartStore.getState();
    
    // If cart has items but totals haven't been calculated yet, trigger recalculation
    // This handles edge cases where rehydration might not have completed fully
    if (this.cartState.items.length > 0 && this.cartState.totals.isEmpty) {
      this.logger.debug('Cart has items but totals are empty, triggering recalculation');
      useCartStore.getState().calculateTotals();
    }
  }

  private handleCartUpdate(cartState: CartState): void {
    this.cartState = cartState;
    
    // Add/remove empty state classes
    this.toggleClass('next-cart-empty', cartState.isEmpty);
    this.toggleClass('next-cart-has-items', !cartState.isEmpty);
    
    this.updateDisplay();
  }

  protected getPropertyValue(): any {
    if (!this.cartState || !this.property) return undefined;

    // Special handling for subtotal with discounts
    if (this.includeDiscounts && this.property === 'subtotal') {
      // Calculate subtotal minus discounts
      const subtotalValue = this.cartState.totals?.subtotal?.value || 0;
      const discountsValue = this.cartState.totals?.discounts?.value || 0;
      const discountedSubtotal = subtotalValue - discountsValue;
      
      // Return formatted value to match expected format
      const formatted = new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD' 
      }).format(discountedSubtotal);
      
      return { _preformatted: true, value: formatted };
    }
    
    // Special handling for raw subtotal with discounts
    if (this.includeDiscounts && this.property === 'subtotal.raw') {
      const subtotalValue = this.cartState.totals?.subtotal?.value || 0;
      const discountsValue = this.cartState.totals?.discounts?.value || 0;
      return subtotalValue - discountsValue;
    }

    // Get property configuration - single source of truth
    const config = getPropertyConfig('cart', this.property);
    
    if (config) {
      const { path, preformatted } = config;
      
      // Handle negation for hasItems (!isEmpty)
      if (path.startsWith('!')) {
        const actualPath = path.substring(1);
        const value = PropertyResolver.getNestedProperty(this.cartState, actualPath);
        return !value;
      }
      
      // Get the value
      const value = PropertyResolver.getNestedProperty(this.cartState, path);
      
      // If pre-formatted, wrap to prevent double formatting
      if (preformatted) {
        return { _preformatted: true, value };
      }
      
      return value;
    }

    // Fallback to direct property access for unmapped properties
    return PropertyResolver.getNestedProperty(this.cartState, this.property);
  }
  
  protected override async performInitialUpdate(): Promise<void> {
    // Add warning for incorrect usage
    if (this.displayPath) {
      const parsed = AttributeParser.parseDisplayPath(this.displayPath);
      if (parsed.object === 'package') {
        this.logger.warn(`CartDisplayEnhancer is handling package property "${this.displayPath}" - this may be incorrect!`, {
          element: this.element.outerHTML.substring(0, 200) + '...',
          hasPackageContext: PackageContextResolver.findPackageId(this.element) !== undefined
        });
      }
    }
    
    await super.performInitialUpdate();
  }

  public getCartProperty(cartState: CartState, property: string): any {
    const oldCartState = this.cartState;
    const oldProperty = this.property;
    
    this.cartState = cartState;
    this.property = property;
    
    const value = this.getPropertyValue();
    
    // Restore original state - only assign if not undefined
    if (oldCartState !== undefined) {
      this.cartState = oldCartState;
    }
    if (oldProperty !== undefined) {
      this.property = oldProperty;
    }
    
    return value;
  }

  public refreshDisplay(): void {
    this.updateDisplay();
  }
}