import { CartItem, Package, SelectorItem } from '../types/global';
/**
 * Type guard for checking if a value is a valid non-null string
 */
export declare function isValidString(value: unknown): value is string;
/**
 * Type guard for checking if a value is a valid positive number
 */
export declare function isValidNumber(value: unknown): value is number;
/**
 * Type guard for checking if a value is a valid positive number (including zero)
 */
export declare function isValidPositiveNumber(value: unknown): value is number;
/**
 * Type guard for checking if a value is a valid price (positive number or zero)
 */
export declare function isValidPrice(value: unknown): value is number;
/**
 * Type guard for CartItem with all required properties validated
 */
export declare function isValidCartItem(item: unknown): item is CartItem;
/**
 * Type guard for checking if CartItem has valid optional properties
 */
export declare function hasValidOptionalCartItemProps(item: CartItem): item is CartItem & {
    image: string;
    sku: string;
};
/**
 * Type guard for Package data validation
 */
export declare function isValidPackage(pkg: unknown): pkg is Package;
/**
 * Type guard for SelectorItem with proper price validation
 */
export declare function hasValidPrice(item: {
    price: number | undefined;
}): item is {
    price: number;
};
/**
 * Type guard for SelectorItem with proper name validation
 */
export declare function hasValidName(item: {
    name: string | undefined;
}): item is {
    name: string;
};
/**
 * Type guard for SelectorItem with shipping ID validation
 */
export declare function hasValidShippingId(item: {
    shippingId: string | undefined;
}): item is {
    shippingId: string;
};
/**
 * Comprehensive SelectorItem validation
 */
export declare function isValidSelectorItem(item: unknown): item is Required<SelectorItem>;
/**
 * Safe array access with type guard
 */
export declare function safeArrayAccess<T>(array: T[], index: number): T | undefined;
/**
 * Safe object property access with type guard
 */
export declare function safeObjectAccess<T extends Record<string, unknown>, K extends keyof T>(obj: T, key: K | undefined): T[K] | undefined;
/**
 * Type assertion helper for when we know a value should exist
 */
export declare function assertExists<T>(value: T | undefined | null, message?: string): asserts value is T;
/**
 * Type guard for checking if a value is defined (not undefined)
 */
export declare function isDefined<T>(value: T | undefined): value is T;
/**
 * Type guard for checking if a value is not null
 */
export declare function isNotNull<T>(value: T | null): value is T;
/**
 * Type guard for checking if a value exists (not null or undefined)
 */
export declare function exists<T>(value: T | null | undefined): value is T;
/**
 * Parse and validate price from string
 */
export declare function parseValidPrice(priceString: string | undefined): number | undefined;
/**
 * Validate and extract package ID
 */
export declare function parseValidPackageId(value: string | null | undefined): number | undefined;
/**
 * Validate and extract quantity
 */
export declare function parseValidQuantity(value: string | null | undefined, defaultValue?: number): number;
/**
 * Type guard for DOM element validation
 */
export declare function isValidElement(element: unknown): element is HTMLElement;
/**
 * Enhanced error with type context
 */
export declare class TypeValidationError extends Error {
    readonly expectedType: string;
    readonly receivedValue: unknown;
    readonly context?: string | undefined;
    constructor(message: string, expectedType: string, receivedValue: unknown, context?: string | undefined);
}
/**
 * Validate with detailed error reporting
 */
export declare function validateOrThrow<T>(value: unknown, guard: (value: unknown) => value is T, typeName: string, context?: string): T;
//# sourceMappingURL=typeGuards.d.ts.map