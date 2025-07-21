import { CreditCardService } from './CreditCardService';
import { Logger } from '../../../utils/logger';

declare global {
    interface Window {
        intlTelInput: any;
        intlTelInputUtils: any;
    }
}
export interface ValidationResult {
    isValid: boolean;
    errors?: Record<string, string>;
    firstErrorField?: string;
}
export interface PaymentResult {
    success: boolean;
    token?: string;
    error?: string;
    paymentMethod?: string;
}
export declare class PaymentService {
    private logger;
    private addClassCallback;
    private removeClassCallback;
    private emitCallback;
    private form;
    private creditCardService;
    private phoneInputs;
    private paymentButtons;
    private isIntlTelInputAvailable;
    private paymentMethodChangeHandler?;
    private expressCheckoutHandlers;
    constructor(form: HTMLFormElement, logger: Logger, addClassCallback: (className: string) => void, removeClassCallback: (className: string) => void, emitCallback: (event: string, data: any) => void);
    /**
     * Initialize the payment service
     */
    initialize(spreedlyEnvironmentKey?: string, debug?: boolean): Promise<void>;
    /**
     * Initialize credit card processing
     */
    private initializeCreditCardService;
    /**
     * Check if intl-tel-input is available
     */
    private checkIntlTelInputAvailability;
    /**
     * Scan for payment buttons in the form
     */
    private scanPaymentButtons;
    /**
     * Extract payment method from selector
     */
    private extractPaymentMethod;
    /**
     * Initialize phone input fields with intl-tel-input
     */
    initializePhoneFields(shippingPhoneField?: HTMLElement, billingPhoneField?: HTMLElement, updateFormDataCallback?: (data: Record<string, any>) => void, updateBillingDataCallback?: (data: Record<string, any>) => void): void;
    /**
     * Initialize a single phone input field
     */
    private initializePhoneInput;
    /**
     * Initialize billing phone input (wrapper for consistency)
     */
    private initializeBillingPhoneInput;
    /**
     * Setup payment method selection
     */
    setupPaymentMethod(method: string): void;
    /**
     * Update payment form visibility based on selected method
     */
    private updatePaymentFormVisibility;
    /**
     * Validate payment data
     */
    validatePaymentData(): ValidationResult;
    /**
     * Validate phone numbers
     */
    private validatePhoneNumbers;
    /**
     * Submit payment (tokenize credit card)
     */
    submitPayment(): Promise<PaymentResult>;
    /**
     * Handle express checkout
     */
    handleExpressCheckout(method: string): Promise<void>;
    /**
     * Format phone number for a specific input
     */
    formatPhoneNumber(input: HTMLInputElement): void;
    /**
     * Sync phone country with address country
     */
    syncPhoneCountryWithAddressCountry(addressCountryCode: string, isShipping?: boolean): void;
    /**
     * Set phone number programmatically
     */
    setPhoneNumber(phoneNumber: string, isShipping?: boolean): void;
    /**
     * Get formatted phone number
     */
    getFormattedPhoneNumber(isShipping?: boolean): string;
    /**
     * Setup payment event handlers
     */
    private setupPaymentEventHandlers;
    /**
     * Handle payment method change
     */
    private handlePaymentMethodChange;
    /**
     * Handle tokenized payment callback
     */
    private handleTokenizedPayment;
    /**
     * Get card data from form
     */
    private getCardDataFromForm;
    /**
     * Get utils script path for intl-tel-input
     */
    private getUtilsScriptPath;
    /**
     * Check if credit card service is ready
     */
    isCreditCardReady(): boolean;
    /**
     * Get credit card service for validator integration
     */
    getCreditCardService(): CreditCardService | undefined;
    /**
     * Update configuration
     */
    handleConfigUpdate(configState: any): Promise<void>;
    /**
     * Update service (re-scan for new elements)
     */
    update(): void;
    /**
     * Cleanup and destroy
     */
    destroy(): void;
}
//# sourceMappingURL=PaymentService.d.ts.map