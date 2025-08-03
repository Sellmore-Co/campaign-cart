import { isValidEmail, isValidPhone } from '../utils/validation-utils';
export interface CreditCardValidationPattern {
    regex?: RegExp;
    minLength?: number;
    maxLength?: number;
    errorMessage: string;
    realTimeValidation: boolean;
}
export declare class ValidationConfig {
    /**
     * Credit card validation patterns from example.js
     */
    static readonly CREDIT_CARD_PATTERNS: Record<string, CreditCardValidationPattern>;
    /**
     * US-specific validation patterns from example.js
     */
    static readonly US_PATTERNS: Record<string, CreditCardValidationPattern>;
    /**
     * Name validation patterns from example.js
     */
    static readonly NAME_PATTERNS: {
        firstName: RegExp;
        lastName: RegExp;
    };
    /**
     * CSS classes for validation states (from example.js)
     */
    static readonly CSS_CLASSES: {
        valid: string;
        invalid: string;
        errorField: string;
        errorMessage: string;
        errorIcon: string;
        validIcon: string;
        processing: string;
        hasValue: string;
    };
    /**
     * Error container selectors from example.js
     */
    static readonly ERROR_CONTAINERS: Record<string, string>;
    /**
     * Validation messages
     */
    static readonly MESSAGES: {
        creditCard: {
            number: string;
            cvv: string;
            month: string;
            year: string;
            name: string;
            expired: string;
        };
        general: {
            required: string;
            invalid: string;
            tooShort: string;
            tooLong: string;
        };
    };
    /**
     * Validate credit card field
     */
    static validateCreditCardField(fieldName: string, value: string): {
        isValid: boolean;
        errorMessage?: string;
    };
    /**
     * Validate field with country-specific patterns
     */
    static validateFieldWithPattern(fieldName: string, value: string, countryCode?: string): {
        isValid: boolean;
        errorMessage?: string;
    };
    /**
     * Check if field should have real-time validation
     */
    static shouldValidateRealTime(fieldName: string): boolean;
    /**
     * Get error container selector for a field
     */
    static getErrorContainer(fieldName: string): string | undefined;
    /**
     * Get formatted field name using existing utility
     */
    static getFormattedFieldName(field: string, _countryConfig?: any): string;
    /**
     * Use existing validation utilities
     */
    static isValidEmail: typeof isValidEmail;
    static isValidPhone: typeof isValidPhone;
}
//# sourceMappingURL=validation-config.d.ts.map