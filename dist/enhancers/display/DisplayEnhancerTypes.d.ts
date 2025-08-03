export type FormatType = 'currency' | 'number' | 'boolean' | 'date' | 'percentage' | 'text' | 'auto';
export interface DisplayProperty {
    path: string;
    property: string;
    format?: FormatType;
    hideIfZero?: boolean;
    hideIfFalse?: boolean;
    divideBy?: number;
    multiplyBy?: number;
}
export interface DisplayValue<T = any> {
    value: T;
    format: FormatType;
    metadata?: {
        decimals?: number;
        prefix?: string;
        suffix?: string;
        locale?: string;
    };
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
    readonly HIDE_ZERO_CENTS: "data-hide-zero-cents";
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
export interface PropertyConfig {
    path: string;
    format?: FormatType;
    preformatted?: boolean;
    validator?: (value: any) => any;
    fallback?: any;
    debugInfo?: boolean;
}
type PropertyMap = Record<string, string | PropertyConfig | boolean>;
export declare const PROPERTY_MAPPINGS: Record<string, PropertyMap>;
export declare function getPropertyConfig(objectType: keyof typeof PROPERTY_MAPPINGS, propertyName: string): PropertyConfig | null;
export declare function getPropertyMapping(objectType: keyof typeof PROPERTY_MAPPINGS, propertyName: string): string | undefined;
export declare function isRawValueProperty(propertyName: string): boolean;
export declare function isFormattedValueProperty(propertyName: string): boolean;
export declare function getBasePropertyName(propertyName: string): string;
export declare function supportsExpressions(objectType: keyof typeof PROPERTY_MAPPINGS): boolean;
export {};
//# sourceMappingURL=DisplayEnhancerTypes.d.ts.map