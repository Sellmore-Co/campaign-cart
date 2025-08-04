/**
 * Display Context Provider
 * Provides robust context inheritance for display elements
 */

export interface DisplayContext {
  packageId?: number;
  cartItemId?: string;
  shippingMethodId?: string;
  orderId?: string;
  selectionId?: string;
  [key: string]: any;
}

export class DisplayContextProvider {
  private static contexts = new WeakMap<HTMLElement, DisplayContext>();
  private static contextElements = new Set<HTMLElement>();
  
  /**
   * Provide context to an element and its descendants
   */
  static provide(element: HTMLElement, context: DisplayContext): void {
    this.contexts.set(element, context);
    this.contextElements.add(element);
    
    // Add data attribute for debugging
    if (process.env.NODE_ENV === 'development') {
      element.setAttribute('data-display-context', JSON.stringify(context));
    }
  }
  
  /**
   * Resolve context for an element by traversing up the DOM tree
   */
  static resolve(element: HTMLElement): DisplayContext | null {
    let current: HTMLElement | null = element;
    
    while (current) {
      // Check if this element has a context
      if (this.contexts.has(current)) {
        return this.contexts.get(current)!;
      }
      
      // Check data attributes as fallback
      const packageId = current.getAttribute('data-next-package-id');
      const cartItemId = current.getAttribute('data-next-cart-item-id');
      const shippingId = current.getAttribute('data-next-shipping-id');
      const selectionId = current.getAttribute('data-next-selector-id');
      
      if (packageId || cartItemId || shippingId || selectionId) {
        const context: DisplayContext = {};
        if (packageId) context.packageId = parseInt(packageId, 10);
        if (cartItemId) context.cartItemId = cartItemId;
        if (shippingId) context.shippingMethodId = shippingId;
        if (selectionId) context.selectionId = selectionId;
        
        // Cache this context
        this.provide(current, context);
        return context;
      }
      
      current = current.parentElement;
    }
    
    return null;
  }
  
  /**
   * Merge contexts, with child context taking precedence
   */
  static merge(parentContext: DisplayContext | null, childContext: DisplayContext | null): DisplayContext | null {
    if (!parentContext) return childContext;
    if (!childContext) return parentContext;
    
    return {
      ...parentContext,
      ...childContext
    };
  }
  
  /**
   * Clear context for an element
   */
  static clear(element: HTMLElement): void {
    this.contexts.delete(element);
    this.contextElements.delete(element);
    
    if (process.env.NODE_ENV === 'development') {
      element.removeAttribute('data-display-context');
    }
  }
  
  /**
   * Clear all contexts (useful for cleanup)
   */
  static clearAll(): void {
    this.contextElements.forEach(element => {
      if (process.env.NODE_ENV === 'development') {
        element.removeAttribute('data-display-context');
      }
    });
    
    this.contexts = new WeakMap();
    this.contextElements.clear();
  }
  
  /**
   * Get all elements with contexts (for debugging)
   */
  static getContextElements(): HTMLElement[] {
    return Array.from(this.contextElements);
  }
  
  /**
   * Validate context has required fields
   */
  static validate(context: DisplayContext, requiredFields: string[]): boolean {
    return requiredFields.every(field => context[field] !== undefined);
  }
}

/**
 * Context-aware helper to set up context providers on common elements
 */
export function setupContextProviders(): void {
  // Package contexts
  document.querySelectorAll('[data-next-package-id]').forEach(element => {
    const packageId = element.getAttribute('data-next-package-id');
    if (packageId) {
      DisplayContextProvider.provide(element as HTMLElement, {
        packageId: parseInt(packageId, 10)
      });
    }
  });
  
  // Cart item contexts
  document.querySelectorAll('[data-next-cart-item-id]').forEach(element => {
    const cartItemId = element.getAttribute('data-next-cart-item-id');
    if (cartItemId) {
      DisplayContextProvider.provide(element as HTMLElement, {
        cartItemId
      });
    }
  });
  
  // Shipping contexts
  document.querySelectorAll('[data-next-shipping-id]').forEach(element => {
    const shippingMethodId = element.getAttribute('data-next-shipping-id');
    if (shippingMethodId) {
      DisplayContextProvider.provide(element as HTMLElement, {
        shippingMethodId
      });
    }
  });
  
  // Selection contexts
  document.querySelectorAll('[data-next-selector-id]').forEach(element => {
    const selectionId = element.getAttribute('data-next-selector-id');
    if (selectionId) {
      DisplayContextProvider.provide(element as HTMLElement, {
        selectionId
      });
    }
  });
}