import { CartTotals, Campaign, CallbackType, CallbackData, EventMap, AppliedCoupon, DiscountDefinition } from '../types/global';
declare global {
    interface Window {
        __NEXT_SDK_VERSION__?: string;
    }
}
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
    swapCart(items: Array<{
        packageId: number;
        quantity: number;
    }>): Promise<void>;
    getCartData(): CallbackData;
    getCartTotals(): CartTotals;
    getCartCount(): number;
    getCampaignData(): Campaign | null;
    getPackage(id: number): any | null;
    getVariantsByProductId(productId: number): any | null;
    getAvailableVariantAttributes(productId: number, attributeCode: string): string[];
    getPackageByVariantSelection(productId: number, selectedAttributes: Record<string, string>): any | null;
    getProductVariantsWithPricing(productId: number): any | null;
    getVariantPricingTiers(productId: number, variantKey: string): any[];
    getLowestPriceForVariant(productId: number, variantKey: string): any | null;
    createVariantKey(attributes: Record<string, string>): string;
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
    addMetadata(key: string, value: any): void;
    setMetadata(metadata: Record<string, any>): void;
    clearMetadata(): void;
    getMetadata(): Record<string, any> | undefined;
    setAttribution(attribution: Record<string, any>): void;
    getAttribution(): Record<string, any> | undefined;
    debugAttribution(): void;
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
    getVersion(): string;
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
        image?: string;
        template?: string;
        action?: () => void | Promise<void>;
        disableOnMobile?: boolean;
        mobileScrollTrigger?: boolean;
        maxTriggers?: number;
        useSessionStorage?: boolean;
        sessionStorageKey?: string;
        overlayClosable?: boolean;
        showCloseButton?: boolean;
        imageClickable?: boolean;
        actionButtonText?: string;
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
    addUpsell(options: {
        packageId?: number;
        quantity?: number;
        items?: Array<{
            packageId: number;
            quantity?: number;
        }>;
    }): Promise<any>;
    canAddUpsells(): boolean;
    getCompletedUpsells(): string[];
    isUpsellAlreadyAdded(packageId: number): boolean;
    setProfile(profileId: string, options?: {
        clearCart?: boolean;
        preserveQuantities?: boolean;
    }): Promise<void>;
    revertProfile(): Promise<void>;
    getActiveProfile(): string | null;
    getProfileInfo(profileId?: string): any | null;
    getMappedPackageId(originalId: number): number;
    getOriginalPackageId(mappedId: number): number | null;
    listProfiles(): string[];
    hasProfile(profileId: string): boolean;
    registerProfile(profile: {
        id: string;
        name: string;
        description?: string;
        packageMappings: Record<number, number>;
    }): void;
    setParam(key: string, value: string): void;
    setParams(params: Record<string, string>): void;
    getParam(key: string): string | null;
    getAllParams(): Record<string, string>;
    hasParam(key: string): boolean;
    clearParam(key: string): void;
    clearAllParams(): void;
    mergeParams(params: Record<string, string>): void;
}
//# sourceMappingURL=NextCommerce.d.ts.map