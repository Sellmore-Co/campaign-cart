import { CartTotals, Campaign, CallbackType, CallbackData, EventMap, AppliedCoupon, DiscountDefinition } from '../types/global';

export declare class NextCommerce {
    private static instance;
    private logger;
    private eventBus;
    private callbacks;
    private exitIntentEnhancer;
    private constructor();
    static getInstance(): NextCommerce;
    hasItemInCart(options: {
        packageId?: number;
    }): boolean;
    addItem(options: {
        packageId?: number;
        quantity?: number;
    }): Promise<void>;
    removeItem(options: {
        packageId?: number;
    }): Promise<void>;
    updateQuantity(options: {
        packageId?: number;
        quantity: number;
    }): Promise<void>;
    clearCart(): Promise<void>;
    getCartData(): CallbackData;
    getCartTotals(): CartTotals;
    getCartCount(): number;
    getCampaignData(): Campaign | null;
    getPackage(id: number): any | null;
    on<K extends keyof EventMap>(event: K, handler: (data: EventMap[K]) => void): void;
    off<K extends keyof EventMap>(event: K, handler: Function): void;
    registerCallback(type: CallbackType, callback: (data: CallbackData) => void): void;
    unregisterCallback(type: CallbackType, callback: Function): void;
    triggerCallback(type: CallbackType, data: CallbackData): void;
    trackViewItemList(packageIds: (string | number)[], _listId?: string, listName?: string): Promise<void>;
    trackViewItem(packageId: string | number): Promise<void>;
    trackAddToCart(packageId: string | number, quantity?: number): Promise<void>;
    trackRemoveFromCart(packageId: string | number, quantity?: number): Promise<void>;
    trackBeginCheckout(): Promise<void>;
    trackPurchase(orderData: any): Promise<void>;
    trackCustomEvent(eventName: string, data?: Record<string, any>): Promise<void>;
    trackSignUp(email: string): Promise<void>;
    trackLogin(email: string): Promise<void>;
    setDebugMode(enabled: boolean): Promise<void>;
    invalidateAnalyticsContext(): Promise<void>;
    getShippingMethods(): Array<{
        ref_id: number;
        code: string;
        price: string;
    }>;
    getSelectedShippingMethod(): {
        id: number;
        name: string;
        price: number;
        code: string;
    } | null;
    setShippingMethod(methodId: number): Promise<void>;
    formatPrice(amount: number, currency?: string): string;
    validateCheckout(): {
        valid: boolean;
        errors: string[];
    };
    applyCoupon(code: string): Promise<{
        success: boolean;
        message: string;
    }>;
    removeCoupon(code: string): void;
    getCoupons(): AppliedCoupon[];
    validateCoupon(code: string): {
        valid: boolean;
        message?: string;
    };
    calculateDiscountAmount(coupon: DiscountDefinition): number;
    exitIntent(options: {
        image: string;
        action?: () => void | Promise<void>;
    }): Promise<void>;
    disableExitIntent(): void;
    private fomoEnhancer;
    fomo(config?: {
        items?: Array<{
            text: string;
            image: string;
        }>;
        customers?: {
            [country: string]: string[];
        };
        maxMobileShows?: number;
        displayDuration?: number;
        delayBetween?: number;
        initialDelay?: number;
    }): Promise<void>;
    stopFomo(): void;
}
//# sourceMappingURL=NextCommerce.d.ts.map