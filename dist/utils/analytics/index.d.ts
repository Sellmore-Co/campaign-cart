import { DataLayerEvent } from './types';
import { CartItem, EnrichedCartLine } from '../../types/global';

export declare class NextAnalytics {
    private static instance;
    private initialized;
    private providers;
    private validator;
    private listTracker;
    private viewTracker;
    private userTracker;
    private autoListener;
    private constructor();
    static getInstance(): NextAnalytics;
    /**
     * Initialize the analytics system
     */
    initialize(): Promise<void>;
    /**
     * Initialize analytics providers
     */
    private initializeProviders;
    /**
     * Initialize automatic tracking features
     */
    private initializeAutoTracking;
    /**
     * Track an event
     */
    track(event: DataLayerEvent): void;
    /**
     * Enable/disable debug mode
     */
    setDebugMode(enabled: boolean): void;
    /**
     * Set transform function for events
     */
    setTransformFunction(fn: (event: DataLayerEvent) => DataLayerEvent | null): void;
    /**
     * Handle route changes (for SPAs)
     */
    invalidateContext(): void;
    /**
     * Get analytics status
     */
    getStatus(): any;
    /**
     * Convenience methods for common events
     */
    trackViewItemList(items: (CartItem | EnrichedCartLine | any)[], listId?: string, listName?: string): void;
    trackViewItem(item: CartItem | EnrichedCartLine | any): void;
    trackAddToCart(item: CartItem | EnrichedCartLine | any, listId?: string, listName?: string): void;
    trackBeginCheckout(): void;
    trackPurchase(orderData: any): void;
    trackSignUp(email?: string): void;
    trackLogin(email?: string): void;
}
export declare const nextAnalytics: NextAnalytics;
export * from './types';
export { EventValidator } from './validation/EventValidator';
export { EcommerceEvents } from './events/EcommerceEvents';
export { UserEvents } from './events/UserEvents';
export { dataLayer } from './DataLayerManager';
//# sourceMappingURL=index.d.ts.map