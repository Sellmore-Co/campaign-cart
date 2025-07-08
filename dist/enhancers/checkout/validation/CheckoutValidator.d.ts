import { CountryConfig } from '../../../utils/countryService';
import { Logger } from '../../../utils/logger';
import { CreditCardService } from '../services/CreditCardService';

export declare const VALIDATION_PATTERNS: {
    readonly EMAIL: RegExp;
    readonly PHONE: RegExp;
    readonly NAME: RegExp;
};
export interface ValidationRule {
    type: 'required' | 'email' | 'phone' | 'postal' | 'name' | 'custom';
    message?: string;
    validator?: (value: any, context?: any) => boolean;
}
export interface ValidationResult {
    isValid: boolean;
    message?: string;
}
export interface FormValidationResult {
    isValid: boolean;
    firstErrorField?: string;
    errors: Record<string, string>;
}
export declare class CheckoutValidator {
    private logger;
    private countryService;
    private phoneInputManager?;
    private errorManager;
    private creditCardService?;
    private rules;
    private errors;
    constructor(logger: Logger, countryService: any, phoneInputManager?: any);
    /**
     * Set credit card service for payment validation
     */
    setCreditCardService(creditCardService: CreditCardService): void;
    private initializeValidationRules;
    /**
     * Validate a single field based on its rules
     */
    validateField(name: string, value: any, context?: any): ValidationResult;
    /**
     * Validate entire form including billing address if needed
     */
    validateForm(formData: Record<string, any>, countryConfigs: Map<string, CountryConfig>, currentCountryConfig?: CountryConfig, includePayment?: boolean, billingAddress?: any, sameAsShipping?: boolean): Promise<FormValidationResult>;
    private applyRule;
    isValidEmail(email: string): boolean;
    isValidPhone(phone: string): boolean;
    isValidName(name: string): boolean;
    private formatFieldName;
    private validateBillingAddress;
    setError(fieldName: string, message: string): void;
    clearError(fieldName: string): void;
    clearAllErrors(): void;
    showError(fieldName: string, message: string): void;
    private hideError;
    private findFormField;
    focusFirstErrorField(firstErrorField?: string): void;
    private focusCreditCardErrorField;
    isValid(): boolean;
    destroy(): void;
}
//# sourceMappingURL=CheckoutValidator.d.ts.map