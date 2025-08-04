/**
 * Attribute Parser
 * Parses and validates data attributes for enhancers
 */

import { createLogger } from '@/utils/logger';

export interface ParsedAttribute {
  raw: string | null;
  parsed: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
}

export class AttributeParser {
  private static logger = createLogger('AttributeParser');

  public static parseDataAttribute(element: HTMLElement, attribute: string): ParsedAttribute {
    const value = element.getAttribute(attribute);
    
    return {
      raw: value,
      parsed: this.parseValue(value),
      type: this.inferType(value),
    };
  }

  public static parseValue(value: string | null): any {
    if (value === null || value === '') {
      return null;
    }

    // Try to parse as JSON first
    if (value.startsWith('{') || value.startsWith('[')) {
      try {
        return JSON.parse(value);
      } catch {
        // Fall through to other parsing
      }
    }

    // Parse boolean
    if (value === 'true') return true;
    if (value === 'false') return false;

    // Parse number
    if (/^-?\d+(\.\d+)?$/.test(value)) {
      const num = parseFloat(value);
      return Number.isNaN(num) ? value : num;
    }

    // Return as string
    return value;
  }

  public static inferType(value: string | null): ParsedAttribute['type'] {
    if (value === null || value === '') {
      return 'string';
    }

    if (value === 'true' || value === 'false') {
      return 'boolean';
    }

    if (/^-?\d+(\.\d+)?$/.test(value)) {
      return 'number';
    }

    if (value.startsWith('{') && value.endsWith('}')) {
      return 'object';
    }

    if (value.startsWith('[') && value.endsWith(']')) {
      return 'array';
    }

    return 'string';
  }

  public static getEnhancerTypes(element: HTMLElement): string[] {
    const types: string[] = [];

    // Check for display enhancer
    if (element.hasAttribute('data-next-display')) {
      types.push('display');
    }

    // Check for toggle enhancer
    if (element.hasAttribute('data-next-toggle')) {
      types.push('toggle');
    }

    // Check for action button enhancer
    if (element.hasAttribute('data-next-action')) {
      types.push('action');
    }

    // Check for timer enhancer
    if (element.hasAttribute('data-next-timer')) {
      types.push('timer');
    }

    // Check for conditional display enhancer
    if (element.hasAttribute('data-next-show') || element.hasAttribute('data-next-hide')) {
      types.push('conditional');
    }

    // Check for checkout form enhancer - ONLY apply to form elements
    // Individual fields are handled by the form enhancer, not separately
    if (element instanceof HTMLFormElement && element.hasAttribute('data-next-checkout')) {
      types.push('checkout');
    }
    
    // Check for express checkout enhancer
    if (element.hasAttribute('data-next-express-checkout')) {
      const checkoutType = element.getAttribute('data-next-express-checkout');
      if (checkoutType === 'container') {
        types.push('express-checkout-container');
      } else if (checkoutType === 'paypal' || checkoutType === 'apple_pay' || checkoutType === 'google_pay') {
        types.push('express-checkout');
      }
    }



    // Check for cart items list enhancer
    if (element.hasAttribute('data-next-cart-items')) {
      types.push('cart-items');
    }

    // Check for order items list enhancer
    if (element.hasAttribute('data-next-order-items')) {
      types.push('order-items');
    }

    // Check for quantity control enhancer - only if it has a control action
    if (element.hasAttribute('data-next-quantity')) {
      const quantityAction = element.getAttribute('data-next-quantity');
      // Only treat as quantity control if it has control actions, not just numeric values
      if (quantityAction && ['increase', 'decrease', 'set'].includes(quantityAction)) {
        types.push('quantity');
      }
    }

    // Check for remove item enhancer
    if (element.hasAttribute('data-next-remove-item')) {
      types.push('remove-item');
    }

    // Check for selector enhancer
    // Only treat as selector if it's the container, not action buttons that reference selectors
    if (element.hasAttribute('data-next-selector') || 
        element.hasAttribute('data-next-cart-selector') ||
        (element.hasAttribute('data-next-selector-id') && !element.hasAttribute('data-next-action'))) {
      types.push('selector');
    }

    // Order display is now handled via data-next-display="order.xxx" pattern
    // No separate 'order' enhancer type needed

    // Check for upsell enhancer (handles both direct and selector modes)
    if (element.hasAttribute('data-next-upsell') || 
        element.hasAttribute('data-next-upsell-selector') || 
        element.hasAttribute('data-next-upsell-select')) {
      types.push('upsell');
    }

    // Check for coupon enhancer - only apply to input containers, not display containers
    if (element.hasAttribute('data-next-coupon')) {
      const couponType = element.getAttribute('data-next-coupon');
      if (couponType === 'input' || couponType === '') {
        types.push('coupon');
      }
    }

    // Check for accordion enhancer
    if (element.hasAttribute('data-next-accordion')) {
      types.push('accordion');
    }

    // Check for tooltip enhancer
    if (element.hasAttribute('data-next-tooltip')) {
      types.push('tooltip');
    }

    // Check for scroll hint enhancer
    if (element.hasAttribute('data-next-component') && 
        element.getAttribute('data-next-component') === 'scroll-hint') {
      types.push('scroll-hint');
    }
    
    // Check for quantity text enhancer
    if (element.hasAttribute('data-next-quantity-text')) {
      types.push('quantity-text');
    }

    // Remove duplicates (just in case)
    return [...new Set(types)];
  }

  public static parseDisplayPath(path: string): { object: string; property: string } {
    const parts = path.split('.');
    
    if (parts.length === 1) {
      // Single property without explicit prefix - default to cart
      return { object: 'cart', property: parts[0] ?? '' };
    }
    
    return {
      object: parts[0] ?? 'cart',
      property: parts.slice(1).join('.'),
    };
  }


  public static parseCondition(condition: string): any {
    try {
      // Support simple conditions like "cart.hasItems" or complex ones like "cart.total > 50"
      if (condition.includes('(') && condition.includes(')')) {
        // Function call format: cart.hasItem(123)
        const match = condition.match(/^(\w+)\.(\w+)\(([^)]*)\)$/);
        if (match) {
          return {
            type: 'function',
            object: match[1] ?? '',
            method: match[2] ?? '',
            args: match[3] ? match[3].split(',').map(arg => this.parseValue(arg.trim())) : [],
          };
        }
      }
      
      if (condition.includes(' ')) {
        // Comparison format: cart.total > 50
        const operators = ['>=', '<=', '>', '<', '===', '==', '!==', '!='];
        for (const op of operators) {
          if (condition.includes(op)) {
            const [left, right] = condition.split(op).map(s => s.trim());
            return {
              type: 'comparison',
              left: this.parseDisplayPath(left ?? ''),
              operator: op,
              right: this.parseValue(right ?? ''),
            };
          }
        }
      }
      
      // Simple property access: cart.hasItems
      return {
        type: 'property',
        ...this.parseDisplayPath(condition),
      };
    } catch (error) {
      this.logger.error('Failed to parse condition:', condition, error);
      return { type: 'property', object: 'cart', property: 'isEmpty' };
    }
  }
}