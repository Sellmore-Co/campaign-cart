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
    private checkAndSetIgnoreFlag;
    private shouldIgnoreAnalytics;
    initialize(): Promise<void>;
    private initializeProviders;
    private initializeAutoTracking;
    track(event: DataLayerEvent): void;
    setDebugMode(enabled: boolean): void;
    setTransformFunction(fn: (event: DataLayerEvent) => DataLayerEvent | null): void;
    invalidateContext(): void;
    getStatus(): any;
    clearIgnoreFlag(): void;
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