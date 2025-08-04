/**
 * Validation utilities for checkout forms
 */

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (basic validation)
 */
export function isValidPhone(phone: string): boolean {
  // Remove all non-digit characters for validation
  const digits = phone.replace(/\D/g, '');
  // Basic check: at least 10 digits
  return digits.length >= 10;
}

/**
 * Format field name for display (convert snake_case to Title Case)
 */
export function formatFieldName(fieldName: string): string {
  return fieldName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Validate required field
 */
export function isRequired(value: string | undefined | null): boolean {
  return value !== undefined && value !== null && value.trim().length > 0;
}

/**
 * Validate postal/zip code based on country
 */
export function isValidPostalCode(postalCode: string, country: string): boolean {
  const patterns: Record<string, RegExp> = {
    US: /^\d{5}(-\d{4})?$/,
    CA: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
    GB: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i,
    AU: /^\d{4}$/,
    // Add more country patterns as needed
  };
  
  const pattern = patterns[country];
  return pattern ? pattern.test(postalCode) : true;
}