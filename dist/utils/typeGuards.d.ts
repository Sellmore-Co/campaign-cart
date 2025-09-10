import { CartItem, Package, SelectorItem } from '../types/global';
export declare function isValidString(value: unknown): value is string;
export declare function isValidNumber(value: unknown): value is number;
export declare function isValidPositiveNumber(value: unknown): value is number;
export declare function isValidPrice(value: unknown): value is number;
export declare function isValidCartItem(item: unknown): item is CartItem;
export declare function hasValidOptionalCartItemProps(item: CartItem): item is CartItem & {
    image: string;
    sku: string;
};
export declare function isValidPackage(pkg: unknown): pkg is Package;
export declare function hasValidPrice(item: {
    price: number | undefined;
}): item is {
    price: number;
};
export declare function hasValidName(item: {
    name: string | undefined;
}): item is {
    name: string;
};
export declare function hasValidShippingId(item: {
    shippingId: string | undefined;
}): item is {
    shippingId: string;
};
export declare function isValidSelectorItem(item: unknown): item is Required<SelectorItem>;
export declare function safeArrayAccess<T>(array: T[], index: number): T | undefined;
export declare function safeObjectAccess<T extends Record<string, unknown>, K extends keyof T>(obj: T, key: K | undefined): T[K] | undefined;
export declare function assertExists<T>(value: T | undefined | null, message?: string): asserts value is T;
export declare function isDefined<T>(value: T | undefined): value is T;
export declare function isNotNull<T>(value: T | null): value is T;
export declare function exists<T>(value: T | null | undefined): value is T;
export declare function parseValidPrice(priceString: string | undefined): number | undefined;
export declare function parseValidPackageId(value: string | null | undefined): number | undefined;
export declare function parseValidQuantity(value: string | null | undefined, defaultValue?: number): number;
export declare function isValidElement(element: unknown): element is HTMLElement;
export declare class TypeValidationError extends Error {
    readonly expectedType: string;
    readonly receivedValue: unknown;
    readonly context?: string | undefined;
    constructor(message: string, expectedType: string, receivedValue: unknown, context?: string | undefined);
}
export declare function validateOrThrow<T>(value: unknown, guard: (value: unknown) => value is T, typeName: string, context?: string): T;
//# sourceMappingURL=typeGuards.d.ts.map