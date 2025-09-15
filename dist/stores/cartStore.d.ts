import { CartState, CartItem, CartTotals, DiscountDefinition, AppliedCoupon } from '../types/global';
interface CartActions {
    addItem: (item: Partial<CartItem> & {
        isUpsell: boolean | undefined;
    }) => Promise<void>;
    removeItem: (packageId: number) => Promise<void>;
    updateQuantity: (packageId: number, quantity: number) => Promise<void>;
    swapPackage: (removePackageId: number, addItem: Partial<CartItem> & {
        isUpsell: boolean | undefined;
    }) => Promise<void>;
    clear: () => Promise<void>;
    swapCart: (items: Array<{
        packageId: number;
        quantity: number;
    }>) => Promise<void>;
    syncWithAPI: () => Promise<void>;
    calculateTotals: () => void;
    calculateShipping: () => number;
    calculateTax: () => number;
    calculateEnrichedItems: () => Promise<void>;
    refreshItemPrices: () => Promise<void>;
    setShippingMethod: (methodId: number) => Promise<void>;
    hasItem: (packageId: number) => boolean;
    getItem: (packageId: number) => CartItem | undefined;
    getItemQuantity: (packageId: number) => number;
    getTotalWeight: () => number;
    getTotalItemCount: () => number;
    reset: () => void;
    setLastCurrency: (currency: string) => void;
    applyCoupon: (code: string) => Promise<{
        success: boolean;
        message: string;
    }>;
    removeCoupon: (code: string) => void;
    getCoupons: () => AppliedCoupon[];
    validateCoupon: (code: string) => {
        valid: boolean;
        message?: string;
    };
    calculateDiscountAmount: (coupon: DiscountDefinition) => number;
}
export declare const cartStore: import('zustand').UseBoundStore<Omit<Omit<import('zustand').StoreApi<CartState & CartActions>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import('zustand/middleware').PersistOptions<CartState & CartActions, {
            items: CartItem[];
            appliedCoupons: AppliedCoupon[];
            subtotal: number;
            shipping: number;
            shippingMethod: import('../types/global').ShippingMethod | undefined;
            tax: number;
            total: number;
            totalQuantity: number;
            isEmpty: boolean;
            totals: CartTotals;
            enrichedItems: never[];
        }>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: CartState & CartActions) => void) => () => void;
        onFinishHydration: (fn: (state: CartState & CartActions) => void) => () => void;
        getOptions: () => Partial<import('zustand/middleware').PersistOptions<CartState & CartActions, {
            items: CartItem[];
            appliedCoupons: AppliedCoupon[];
            subtotal: number;
            shipping: number;
            shippingMethod: import('../types/global').ShippingMethod | undefined;
            tax: number;
            total: number;
            totalQuantity: number;
            isEmpty: boolean;
            totals: CartTotals;
            enrichedItems: never[];
        }>>;
    };
}, "subscribe"> & {
    subscribe: {
        (listener: (selectedState: CartState & CartActions, previousSelectedState: CartState & CartActions) => void): () => void;
        <U>(selector: (state: CartState & CartActions) => U, listener: (selectedState: U, previousSelectedState: U) => void, options?: {
            equalityFn?: ((a: U, b: U) => boolean) | undefined;
            fireImmediately?: boolean;
        } | undefined): () => void;
    };
}>;
export declare const useCartStore: import('zustand').UseBoundStore<Omit<Omit<import('zustand').StoreApi<CartState & CartActions>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import('zustand/middleware').PersistOptions<CartState & CartActions, {
            items: CartItem[];
            appliedCoupons: AppliedCoupon[];
            subtotal: number;
            shipping: number;
            shippingMethod: import('../types/global').ShippingMethod | undefined;
            tax: number;
            total: number;
            totalQuantity: number;
            isEmpty: boolean;
            totals: CartTotals;
            enrichedItems: never[];
        }>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: CartState & CartActions) => void) => () => void;
        onFinishHydration: (fn: (state: CartState & CartActions) => void) => () => void;
        getOptions: () => Partial<import('zustand/middleware').PersistOptions<CartState & CartActions, {
            items: CartItem[];
            appliedCoupons: AppliedCoupon[];
            subtotal: number;
            shipping: number;
            shippingMethod: import('../types/global').ShippingMethod | undefined;
            tax: number;
            total: number;
            totalQuantity: number;
            isEmpty: boolean;
            totals: CartTotals;
            enrichedItems: never[];
        }>>;
    };
}, "subscribe"> & {
    subscribe: {
        (listener: (selectedState: CartState & CartActions, previousSelectedState: CartState & CartActions) => void): () => void;
        <U>(selector: (state: CartState & CartActions) => U, listener: (selectedState: U, previousSelectedState: U) => void, options?: {
            equalityFn?: ((a: U, b: U) => boolean) | undefined;
            fireImmediately?: boolean;
        } | undefined): () => void;
    };
}>;
export {};
//# sourceMappingURL=cartStore.d.ts.map