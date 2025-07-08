/**
 * Credit Card Service - Consolidated credit card processing
 * Handles Spreedly integration, validation, and tokenization
 */
declare global {
    interface Window {
        Spreedly: any;
    }
}
export interface CreditCardData {
    full_name: string;
    month: string;
    year: string;
}
export interface CreditCardValidationState {
    number: {
        isValid: boolean;
        hasError: boolean;
        errorMessage?: string;
    };
    cvv: {
        isValid: boolean;
        hasError: boolean;
        errorMessage?: string;
    };
    month: {
        isValid: boolean;
        hasError: boolean;
        errorMessage?: string;
    };
    year: {
        isValid: boolean;
        hasError: boolean;
        errorMessage?: string;
    };
}
export declare class CreditCardService {
    private logger;
    private environmentKey;
    private isReady;
    private validationState;
    private onReadyCallback?;
    private onErrorCallback?;
    private onTokenCallback?;
    private numberField?;
    private cvvField?;
    private monthField?;
    private yearField?;
    constructor(environmentKey: string);
    /**
     * Initialize the credit card service
     */
    initialize(): Promise<void>;
    /**
     * Tokenize credit card data
     */
    tokenizeCard(cardData: CreditCardData): Promise<string>;
    /**
     * Validate credit card form data
     */
    validateCreditCard(cardData: CreditCardData): {
        isValid: boolean;
        errors?: Record<string, string>;
    };
    /**
     * Check if Spreedly fields are ready for validation
     */
    checkSpreedlyFieldsReady(): {
        hasEmptyFields: boolean;
        errors: Array<{
            field: string;
            message: string;
        }>;
    };
    /**
     * Clear all credit card errors
     */
    clearAllErrors(): void;
    /**
     * Set callbacks
     */
    setOnReady(callback: () => void): void;
    setOnError(callback: (errors: string[]) => void): void;
    setOnToken(callback: (token: string, pmData: any) => void): void;
    /**
     * Check if service is ready
     */
    get ready(): boolean;
    private initializeValidationState;
    private findCreditCardFields;
    private loadSpreedlyScript;
    private setupSpreedly;
    private setupSpreedlyEventListeners;
    private applySpreedlyConfig;
    private handleSpreedlyFieldEvent;
    private showSpreedlyErrors;
    private setCreditCardFieldValid;
    private setCreditCardFieldError;
    private clearCreditCardFieldError;
    private getFieldElement;
    destroy(): void;
}
//# sourceMappingURL=CreditCardService.d.ts.map