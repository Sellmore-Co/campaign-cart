/**
 * 29Next Campaign Cart SDKv v0.2.0
 * 
 * Modern TypeScript SDK for seamless e-commerce integration via data attributes.
 * Provides progressive enhancement without disrupting existing HTML/CSS.
 * 
 * @version 0.2.0
 * @author Next Commerce
 * @license MIT
 */

export { NextCommerce } from './core/NextCommerce';
export { SDKInitializer } from './enhancers/core/SDKInitializer';

// Store exports
export { useCartStore } from './stores/cartStore';
export { useCampaignStore } from './stores/campaignStore';
export { useConfigStore } from './stores/configStore';
export { useCheckoutStore } from './stores/checkoutStore';
export { useOrderStore } from './stores/orderStore';

// Type exports
export type * from './types/global';

// Utility exports
export { Logger } from './utils/logger';
export { EventBus } from './utils/events';

// API client export
export { ApiClient } from './api/client';

// Version
export const VERSION = '__VERSION__';

// Auto-initialization
import { SDKInitializer } from './enhancers/core/SDKInitializer';

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      SDKInitializer.initialize();
    });
  } else {
    // DOM already loaded
    SDKInitializer.initialize();
  }
  
  // Smart module preloading after SDK initialization
  window.addEventListener('next:ready', () => {
    // Use requestIdleCallback for non-blocking preloading
    if ('requestIdleCallback' in window) {
      // Phase 1: Critical modules (preload immediately)
      requestIdleCallback(() => {
        // Cart enhancers - most commonly used
        import('./enhancers/display/CartDisplayEnhancer');
        import('./enhancers/cart/CartToggleEnhancer');
        import('./enhancers/cart/PackageSelectorEnhancer');
        
        // Display enhancers
        import('./enhancers/display/ProductDisplayEnhancer');
        import('./enhancers/display/SelectionDisplayEnhancer');
        import('./enhancers/display/TimerEnhancer');
      }, { timeout: 5000 });
      
      // Phase 2: Secondary modules (preload after critical)
      requestIdleCallback(() => {
        // Checkout flow
        import('./enhancers/checkout/CheckoutFormEnhancer');
        import('./enhancers/checkout/ExpressCheckoutContainerEnhancer');
        
        // Order/Upsell
        import('./enhancers/display/OrderDisplayEnhancer');
        import('./enhancers/order/UpsellEnhancer');
        
        // Attribution
        import('./utils/attribution/AttributionCollector');
        
        // Cart UI components
        import('./enhancers/cart/CartItemListEnhancer');
        import('./enhancers/cart/QuantityControlEnhancer');
      }, { timeout: 5000 });
      
      // Phase 3: Tertiary modules (preload when truly idle)
      requestIdleCallback(() => {
        // Less common enhancers
        import('./enhancers/ui/AccordionEnhancer');
        import('./enhancers/CouponEnhancer');
        
        // Behavior enhancers
        import('./enhancers/behavior/SimpleExitIntentEnhancer');
        
        // Checkout services (heavier modules)
        import('./enhancers/checkout/services/AddressService');
      }, { timeout: 5000 });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        // Just preload critical modules
        import('./enhancers/display/CartDisplayEnhancer');
        import('./enhancers/display/ProductDisplayEnhancer');
        import('./utils/analytics');
      }, 1000);
    }
  });
}