export interface CartItem {
    id: number;
    packageId: number;
    quantity: number;
    price: number;
    image?: string;
    title: string;
    sku?: string;
    is_upsell?: boolean;
}
export interface CartState {
    items: CartItem[];
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    totalQuantity: number;
    isEmpty: boolean;
    coupon?: Coupon;
    shippingMethod?: ShippingMethod;
    enrichedItems: EnrichedCartLine[];
    totals: CartTotals;
    swapInProgress?: boolean;
}
export interface CartTotals {
    subtotal: {
        value: number;
        formatted: string;
    };
    shipping: {
        value: number;
        formatted: string;
    };
    tax: {
        value: number;
        formatted: string;
    };
    discounts: {
        value: number;
        formatted: string;
    };
    total: {
        value: number;
        formatted: string;
    };
    count: number;
    isEmpty: boolean;
}
export interface EnrichedCartLine {
    id: number;
    packageId: number;
    quantity: number;
    price: {
        excl_tax: {
            value: number;
            formatted: string;
        };
        incl_tax: {
            value: number;
            formatted: string;
        };
        original: {
            value: number;
            formatted: string;
        };
        savings: {
            value: number;
            formatted: string;
        };
    };
    product: {
        title: string;
        sku: string;
        image: string;
    };
    is_upsell: boolean;
    is_recurring: boolean;
    interval?: 'day' | 'month';
    is_bundle: boolean;
    bundleComponents?: number[];
}
export interface Coupon {
    code: string;
    amount: number;
    type: 'fixed' | 'percentage';
}
export interface ShippingMethod {
    id: number;
    name: string;
    price: number;
    code: string;
}
//# sourceMappingURL=cart.d.ts.map