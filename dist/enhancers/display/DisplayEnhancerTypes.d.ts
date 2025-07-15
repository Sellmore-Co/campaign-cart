/**
 * Display Enhancer Types and Constants
 * Consolidated type definitions and constants for all display enhancers
 *
 * DISPLAY FORMATTING PIPELINE:
 *
 * 1. Property Mapping (PROPERTY_MAPPINGS):
 *    - Maps display properties to data paths
 *    - Indicates if values are pre-formatted with { preformatted: true }
 *    - Example: cart.total -> { path: 'totals.total.formatted', preformatted: true }
 *
 * 2. Format Detection (PROPERTY_FORMAT_REGISTRY + getDefaultFormatType):
 *    - Explicit format registry for properties that need formatting
 *    - Fallback to name-based detection for unmapped properties
 *    - Only applies to raw values, not pre-formatted ones
 *
 * 3. Value Formatting (DisplayFormatter):
 *    - Pre-formatted values bypass formatting entirely
 *    - Raw values are formatted based on detected format type
 *    - Validation is applied during formatting
 *
 * BEST PRACTICES:
 * - Cart/Order data: Use pre-formatted values from store (e.g., cart.total)
 * - Package data: Use raw values that need formatting (e.g., package.price)
 * - For calculations: Use .raw suffix to get numeric values (e.g., cart.total.raw)
 */
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
/**
 * Get property configuration for a given object type and property name
 * This is the single source of truth for property mappings
 */
export declare function getPropertyConfig(objectType: keyof typeof PROPERTY_MAPPINGS, propertyName: string): PropertyConfig | null;
/**
 * Get property mapping path (for backward compatibility)
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
export {};
//# sourceMappingURL=DisplayEnhancerTypes.d.ts.map