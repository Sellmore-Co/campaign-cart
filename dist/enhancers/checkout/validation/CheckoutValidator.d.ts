import { CountryConfig } from '../../../utils/countryService';
import { Logger } from '../../../utils/logger';
import { CreditCardService } from '../services/CreditCardService';
export declare const VALIDATION_PATTERNS: {
    readonly EMAIL: RegExp;
    readonly PHONE: RegExp;
    readonly NAME: RegExp;
    readonly CITY: RegExp;
};
export interface ValidationRule {
    type: 'required' | 'email' | 'phone' | 'postal' | 'name' | 'city' | 'custom';
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
    private phoneValidator?;
    private rules;
    private errors;
    constructor(logger: Logger, countryService: any, phoneInputManager?: any);
    setCreditCardService(creditCardService: CreditCardService): void;
    setPhoneValidator(validator: (phoneNumber: string, type?: 'shipping' | 'billing') => boolean): void;
    private initializeValidationRules;
    validateField(name: string, value: any, context?: any): ValidationResult;
    validateStep(step: number, formData: Record<string, any>, countryConfigs: Map<string, CountryConfig>, currentCountryConfig?: CountryConfig): Promise<FormValidationResult>;
    validateForm(formData: Record<string, any>, countryConfigs: Map<string, CountryConfig>, currentCountryConfig?: CountryConfig, includePayment?: boolean, billingAddress?: any, sameAsShipping?: boolean): Promise<FormValidationResult>;
    private findFirstErrorFieldInDOM;
    private applyRule;
    isValidEmail(email: string): boolean;
    isValidPhone(phone: string): boolean;
    isValidName(name: string): boolean;
    isValidCity(city: string): boolean;
    private formatFieldName;
    private validateBillingAddress;
    setError(fieldName: string, message: string): void;
    clearError(fieldName: string): void;
    clearAllErrors(): void;
    showError(fieldName: string, message: string): void;
    private hideErrorOnly;
    private findFormField;
    focusFirstErrorField(firstErrorField?: string): void;
    private focusCreditCardErrorField;
    isValid(): boolean;
    destroy(): void;
}
//# sourceMappingURL=CheckoutValidator.d.ts.map