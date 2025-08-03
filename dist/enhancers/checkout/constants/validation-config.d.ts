import { isValidEmail, isValidPhone } from '../utils/validation-utils';
export interface CreditCardValidationPattern {
    regex?: RegExp;
    minLength?: number;
    maxLength?: number;
    errorMessage: string;
    realTimeValidation: boolean;
}
export declare class ValidationConfig {
    static readonly CREDIT_CARD_PATTERNS: Record<string, CreditCardValidationPattern>;
    static readonly US_PATTERNS: Record<string, CreditCardValidationPattern>;
    static readonly NAME_PATTERNS: {
        firstName: RegExp;
        lastName: RegExp;
    };
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
    static readonly ERROR_CONTAINERS: Record<string, string>;
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
    static validateCreditCardField(fieldName: string, value: string): {
        isValid: boolean;
        errorMessage?: string;
    };
    static validateFieldWithPattern(fieldName: string, value: string, countryCode?: string): {
        isValid: boolean;
        errorMessage?: string;
    };
    static shouldValidateRealTime(fieldName: string): boolean;
    static getErrorContainer(fieldName: string): string | undefined;
    static getFormattedFieldName(field: string, _countryConfig?: any): string;
    static isValidEmail: typeof isValidEmail;
    static isValidPhone: typeof isValidPhone;
}
//# sourceMappingURL=validation-config.d.ts.map