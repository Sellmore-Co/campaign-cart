/**
 * Display Enhancer Types and Constants
 * Consolidated type definitions and constants for all display enhancers
 */
export type FormatType = 'currency' | 'number' | 'boolean' | 'date' | 'percentage' | 'auto';
export interface DisplayProperty {
    path: string;
    property: string;
    format?: FormatType;
    hideIfZero?: boolean;
    hideIfFalse?: boolean;
    divideBy?: number;
    multiplyBy?: number;
}
export interface DisplayState {
    isVisible: boolean;
    lastValue: any;
    lastFormattedValue: string;
}
export declare const DISPLAY_FORMATS: {
    readonly CURRENCY: "currency";
    readonly NUMBER: "number";
    readonly BOOLEAN: "boolean";
    readonly DATE: "date";
    readonly PERCENTAGE: "percentage";
    readonly AUTO: "auto";
};
export declare const DISPLAY_ATTRIBUTES: {
    readonly DISPLAY: "data-next-display";
    readonly FORMAT: "data-format";
    readonly HIDE_IF_ZERO: "data-hide-if-zero";
    readonly HIDE_IF_FALSE: "data-hide-if-false";
    readonly DIVIDE_BY: "data-divide-by";
    readonly MULTIPLY_BY: "data-multiply-by";
    readonly SELECTOR_ID: "data-next-selector-id";
};
export declare const DISPLAY_OBJECTS: {
    readonly CART: "cart";
    readonly PACKAGE: "package";
    readonly CAMPAIGN: "campaign";
    readonly ORDER: "order";
    readonly SELECTION: "selection";
    readonly SHIPPING: "shipping";
};
export declare const CSS_CLASSES: {
    readonly DISPLAY_VISIBLE: "display-visible";
    readonly DISPLAY_HIDDEN: "display-hidden";
    readonly DISPLAY_ERROR: "display-error";
    readonly DISPLAY_LOADING: "display-loading";
};
export declare const PROPERTY_MAPPINGS: {
    cart: {
        isEmpty: string;
        hasItems: string;
        hasSavings: string;
        quantity: string;
        itemCount: string;
        count: string;
        subtotal: string;
        total: string;
        shipping: string;
        tax: string;
        discounts: string;
        savingsAmount: string;
        savingsPercentage: string;
        compareTotal: string;
        'subtotal.raw': string;
        'total.raw': string;
        'shipping.raw': string;
        'tax.raw': string;
        'discounts.raw': string;
        'savingsAmount.raw': string;
        'savingsPercentage.raw': string;
        'compareTotal.raw': string;
    };
    package: {
        ref_id: string;
        external_id: string;
        qty: string;
        price: string;
        price_total: string;
        price_retail: string;
        price_retail_total: string;
        price_recurring: string;
        is_recurring: string;
        interval: string;
        interval_count: string;
        unitPrice: string;
        unitRetailPrice: string;
        packageTotal: string;
        comparePrice: string;
        compareTotal: string;
        savingsAmount: string;
        savingsPercentage: string;
        hasSavings: string;
        isRecurring: string;
        isBundle: string;
        unitsInPackage: string;
    };
    selection: {
        packageId: string;
        quantity: string;
        name: string;
        total: string;
        compareTotal: string;
        savingsAmount: string;
        savingsPercentage: string;
        unitPrice: string;
        _expression: boolean;
    };
    shipping: {
        isFree: string;
        cost: string;
        price: string;
        name: string;
        code: string;
        method: string;
        id: string;
        refId: string;
    };
    order: {
        ref_id: string;
        created_at: string;
        total_incl_tax: string;
        order_status_url: string;
        is_test: string;
        supports_upsells: string;
        payment_method: string;
        refId: string;
        createdAt: string;
        total: string;
        statusUrl: string;
        isTest: string;
        supportsUpsells: string;
        paymentMethod: string;
        'total.formatted': string;
        'createdAt.formatted': string;
    };
};
/**
 * Get property mapping for a given object type and property name
 */
export declare function getPropertyMapping(objectType: keyof typeof PROPERTY_MAPPINGS, propertyName: string): string | undefined;
/**
 * Check if a property name is a raw value accessor
 */
export declare function isRawValueProperty(propertyName: string): boolean;
/**
 * Check if a property name is a formatted value accessor
 */
export declare function isFormattedValueProperty(propertyName: string): boolean;
/**
 * Get base property name without .raw or .formatted suffix
 */
export declare function getBasePropertyName(propertyName: string): string;
/**
 * Check if expression evaluation is enabled for an object type
 */
export declare function supportsExpressions(objectType: keyof typeof PROPERTY_MAPPINGS): boolean;
//# sourceMappingURL=DisplayEnhancerTypes.d.ts.map