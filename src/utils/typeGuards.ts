/**
 * Enterprise-grade type guards and validation utilities
 * Provides runtime type safety for optional properties and complex types
 */

import type { CartItem, Package, SelectorItem } from '@/types/global';

/**
 * Type guard for checking if a value is a valid non-null string
 */
export function isValidString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Type guard for checking if a value is a valid positive number
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Type guard for checking if a value is a valid positive number (including zero)
 */
export function isValidPositiveNumber(value: unknown): value is number {
  return isValidNumber(value) && value >= 0;
}

/**
 * Type guard for checking if a value is a valid price (positive number or zero)
 */
export function isValidPrice(value: unknown): value is number {
  return isValidPositiveNumber(value);
}

/**
 * Type guard for CartItem with all required properties validated
 */
export function isValidCartItem(item: unknown): item is CartItem {
  if (!item || typeof item !== 'object') return false;
  
  const candidate = item as Partial<CartItem>;
  
  return (
    isValidNumber(candidate.id) &&
    isValidNumber(candidate.packageId) &&
    isValidPositiveNumber(candidate.quantity) &&
    isValidPrice(candidate.price) &&
    isValidString(candidate.title)
  );
}

/**
 * Type guard for checking if CartItem has valid optional properties
 */
export function hasValidOptionalCartItemProps(
  item: CartItem
): item is CartItem & {
  image: string;
  sku: string;
} {
  return (
    (item.image === undefined || isValidString(item.image)) &&
    (item.sku === undefined || isValidString(item.sku))
  );
}

/**
 * Type guard for Package data validation
 */
export function isValidPackage(pkg: unknown): pkg is Package {
  if (!pkg || typeof pkg !== 'object') return false;
  
  const candidate = pkg as Partial<Package>;
  
  return (
    isValidNumber(candidate.ref_id) &&
    isValidNumber(candidate.external_id) &&
    isValidString(candidate.name) &&
    isValidString(candidate.price) &&
    isValidString(candidate.price_total) &&
    isValidPositiveNumber(candidate.qty) &&
    typeof candidate.is_recurring === 'boolean'
  );
}

/**
 * Type guard for SelectorItem with proper price validation
 */
export function hasValidPrice(item: { price: number | undefined }): item is { price: number } {
  return item.price !== undefined && isValidPrice(item.price);
}

/**
 * Type guard for SelectorItem with proper name validation
 */
export function hasValidName(item: { name: string | undefined }): item is { name: string } {
  return item.name !== undefined && isValidString(item.name);
}

/**
 * Type guard for SelectorItem with shipping ID validation
 */
export function hasValidShippingId(item: { shippingId: string | undefined }): item is { shippingId: string } {
  return item.shippingId !== undefined && isValidString(item.shippingId);
}

/**
 * Comprehensive SelectorItem validation
 */
export function isValidSelectorItem(item: unknown): item is Required<SelectorItem> {
  if (!item || typeof item !== 'object') return false;
  
  const candidate = item as Partial<SelectorItem>;
  
  return (
    candidate.element instanceof HTMLElement &&
    isValidNumber(candidate.packageId) &&
    isValidPositiveNumber(candidate.quantity) &&
    hasValidPrice(candidate as { price: number | undefined }) &&
    hasValidName(candidate as { name: string | undefined }) &&
    typeof candidate.isPreSelected === 'boolean' &&
    hasValidShippingId(candidate as { shippingId: string | undefined })
  );
}

/**
 * Safe array access with type guard
 */
export function safeArrayAccess<T>(
  array: T[],
  index: number
): T | undefined {
  return index >= 0 && index < array.length ? array[index] : undefined;
}

/**
 * Safe object property access with type guard
 */
export function safeObjectAccess<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  key: K | undefined
): T[K] | undefined {
  return key !== undefined && key in obj ? obj[key] : undefined;
}

/**
 * Type assertion helper for when we know a value should exist
 */
export function assertExists<T>(
  value: T | undefined | null,
  message?: string
): asserts value is T {
  if (value === undefined || value === null) {
    throw new Error(message || 'Expected value to exist but received undefined or null');
  }
}

/**
 * Type guard for checking if a value is defined (not undefined)
 */
export function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

/**
 * Type guard for checking if a value is not null
 */
export function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}

/**
 * Type guard for checking if a value exists (not null or undefined)
 */
export function exists<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Parse and validate price from string
 */
export function parseValidPrice(priceString: string | undefined): number | undefined {
  if (!isValidString(priceString)) return undefined;
  
  const priceMatch = priceString.match(/\$?(\d+\.?\d*)/);
  if (!priceMatch || !priceMatch[1]) return undefined;
  
  const parsed = parseFloat(priceMatch[1]);
  return isValidPrice(parsed) ? parsed : undefined;
}

/**
 * Validate and extract package ID
 */
export function parseValidPackageId(value: string | null | undefined): number | undefined {
  if (!isValidString(value)) return undefined;
  
  const parsed = parseInt(value, 10);
  return isValidNumber(parsed) && parsed > 0 ? parsed : undefined;
}

/**
 * Validate and extract quantity
 */
export function parseValidQuantity(value: string | null | undefined, defaultValue = 1): number {
  if (!isValidString(value)) return defaultValue;
  
  const parsed = parseInt(value, 10);
  return isValidPositiveNumber(parsed) && parsed > 0 ? parsed : defaultValue;
}

/**
 * Type guard for DOM element validation
 */
export function isValidElement(element: unknown): element is HTMLElement {
  return element instanceof HTMLElement;
}

/**
 * Enhanced error with type context
 */
export class TypeValidationError extends Error {
  constructor(
    message: string,
    public readonly expectedType: string,
    public readonly receivedValue: unknown,
    public readonly context?: string
  ) {
    super(`Type Validation Error: ${message}`);
    this.name = 'TypeValidationError';
  }
}

/**
 * Validate with detailed error reporting
 */
export function validateOrThrow<T>(
  value: unknown,
  guard: (value: unknown) => value is T,
  typeName: string,
  context?: string
): T {
  if (!guard(value)) {
    throw new TypeValidationError(
      `Expected ${typeName} but received ${typeof value}`,
      typeName,
      value,
      context
    );
  }
  return value;
}