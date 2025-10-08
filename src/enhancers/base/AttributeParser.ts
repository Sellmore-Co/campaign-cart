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

    // Check for generic enhancer attribute (e.g., data-next-enhancer="checkout-review")
    if (element.hasAttribute('data-next-enhancer')) {
      const enhancerType = element.getAttribute('data-next-enhancer');
      if (enhancerType) {
        types.push(enhancerType);
      }
    }

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
    if (element.hasAttribute('data-next-show') || 
        element.hasAttribute('data-next-hide') ||
        element.hasAttribute('data-next-show-if-profile') ||
        element.hasAttribute('data-next-hide-if-profile')) {
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
    
    // Check for profile switcher enhancer
    if (element.hasAttribute('data-next-profile')) {
      types.push('profile-switcher');
    }
    
    // Check for profile selector enhancer (dropdown)
    if (element.hasAttribute('data-next-profile-selector')) {
      types.push('profile-selector');
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
    // Also exclude upsell selectors which are handled by UpsellEnhancer
    if (element.hasAttribute('data-next-selector') || 
        element.hasAttribute('data-next-cart-selector') ||
        (element.hasAttribute('data-next-selector-id') && 
         !element.hasAttribute('data-next-action') &&
         !element.hasAttribute('data-next-upsell') &&
         !element.hasAttribute('data-next-upsell-selector'))) {
      types.push('selector');
    }

    // Order display is now handled via data-next-display="order.xxx" pattern
    // No separate 'order' enhancer type needed

    // Check for upsell enhancer (handles both direct and selector modes)
    // Only data-next-upsell="offer" should create an enhancer
    // data-next-upsell-selector is just a marker for option groups
    // data-next-upsell-select is for select dropdowns within an upsell
    if (element.hasAttribute('data-next-upsell')) {
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
      this.logger.debug('Parsing condition:', condition);

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
      
      if (condition.includes(' ') || condition.includes('==') || condition.includes('!=')) {
        // Comparison format: cart.total > 50 or param.timer==n (without spaces)
        const operators = ['>=', '<=', '>', '<', '===', '==', '!==', '!='];
        for (const op of operators) {
          if (condition.includes(op)) {
            const parts = condition.split(op);
            if (parts.length === 2) {
              const left = parts[0].trim();
              const right = parts[1].trim();

              // Special handling for param comparisons with unquoted values
              // If left side is param.* and right side doesn't look like a number/boolean,
              // treat it as a string literal
              const leftPath = this.parseDisplayPath(left ?? '');
              let rightValue;

              // Check if the right side has quotes
              const rightTrimmed = right.trim();
              const hasQuotes = (rightTrimmed.startsWith('"') && rightTrimmed.endsWith('"')) ||
                               (rightTrimmed.startsWith("'") && rightTrimmed.endsWith("'"));

              if (hasQuotes) {
                // Remove quotes and use the inner value
                rightValue = rightTrimmed.slice(1, -1);
              } else {
                // No quotes - parse normally
                rightValue = this.parseValue(right ?? '');

                // If it's a param comparison and the right value is a string that's not a boolean/number,
                // keep it as-is (it's an unquoted string value like 'n' or 'y')
                if ((leftPath.object === 'param' || leftPath.object === 'params') &&
                    typeof rightValue === 'string' &&
                    right !== 'true' &&
                    right !== 'false' &&
                    !/^-?\d+(\.\d+)?$/.test(right)) {
                  // It's already a string, just use it
                  rightValue = right;
                }
              }

              const result = {
                type: 'comparison',
                left: leftPath,
                operator: op,
                right: rightValue,
              };

              this.logger.debug('Parsed comparison:', {
                original: condition,
                leftPart: left,
                rightPart: right,
                hasQuotes,
                result,
                leftObject: leftPath.object,
                rightValue,
                rightType: typeof rightValue
              });

              return result;
            }
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