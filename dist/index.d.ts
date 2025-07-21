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
export { useCartStore } from './stores/cartStore';
export { useCampaignStore } from './stores/campaignStore';
export { useConfigStore } from './stores/configStore';
export { useCheckoutStore } from './stores/checkoutStore';
export { useOrderStore } from './stores/orderStore';
export type * from './types/global';
export { Logger } from './utils/logger';
export { EventBus } from './utils/events';
export { ApiClient } from './api/client';
export declare const VERSION = "__VERSION__";
//# sourceMappingURL=index.d.ts.map