/**
 * Validation utilities for checkout forms
 */
/**
 * Validate email address format
 */
export declare function isValidEmail(email: string): boolean;
/**
 * Validate phone number format (basic validation)
 */
export declare function isValidPhone(phone: string): boolean;
/**
 * Format field name for display (convert snake_case to Title Case)
 */
export declare function formatFieldName(fieldName: string): string;
/**
 * Validate required field
 */
export declare function isRequired(value: string | undefined | null): boolean;
/**
 * Validate postal/zip code based on country
 */
export declare function isValidPostalCode(postalCode: string, country: string): boolean;
//# sourceMappingURL=validation-utils.d.ts.map