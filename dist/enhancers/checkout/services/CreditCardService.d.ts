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
    private hasTrackedPaymentInfo;
    private onFieldFocusCallback?;
    private onFieldBlurCallback?;
    private onFieldInputCallback?;
    private fieldHasValue;
    private originalPlaceholders;
    private labelBehavior;
    constructor(environmentKey: string);
    initialize(): Promise<void>;
    tokenizeCard(cardData: CreditCardData): Promise<string>;
    validateCreditCard(cardData: CreditCardData): {
        isValid: boolean;
        errors?: Record<string, string>;
    };
    checkSpreedlyFieldsReady(): {
        hasEmptyFields: boolean;
        errors: Array<{
            field: string;
            message: string;
        }>;
    };
    clearAllErrors(): void;
    clearFields(): void;
    private hidePaymentErrorContainers;
    setOnReady(callback: () => void): void;
    setOnError(callback: (errors: string[]) => void): void;
    setOnToken(callback: (token: string, pmData: any) => void): void;
    setFloatingLabelCallbacks(onFocus: (fieldName: 'number' | 'cvv') => void, onBlur: (fieldName: 'number' | 'cvv', hasValue: boolean) => void, onInput: (fieldName: 'number' | 'cvv', hasValue: boolean) => void): void;
    get ready(): boolean;
    focusField(field: 'number' | 'cvv'): void;
    private initializeValidationState;
    private findCreditCardFields;
    private loadSpreedlyScript;
    private setupSpreedly;
    private addFocusStyles;
    private setupFieldClickHandlers;
    private setupSpreedlyEventListeners;
    private applySpreedlyConfig;
    private handleSpreedlyFieldEvent;
    private checkAndTrackPaymentInfo;
    private handleFieldFocus;
    private handleFieldBlur;
    private showSpreedlyErrors;
    private setCreditCardFieldValid;
    private setCreditCardFieldError;
    private clearCreditCardFieldError;
    private getFieldElement;
    destroy(): void;
}
//# sourceMappingURL=CreditCardService.d.ts.map