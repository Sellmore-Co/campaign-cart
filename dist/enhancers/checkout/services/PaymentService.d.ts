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
    private uiService;
    private paymentMethodChangeHandler?;
    private expressCheckoutHandlers;
    constructor(form: HTMLFormElement, logger: Logger, addClassCallback: (className: string) => void, removeClassCallback: (className: string) => void, emitCallback: (event: string, data: any) => void);
    initialize(spreedlyEnvironmentKey?: string, debug?: boolean): Promise<void>;
    private initializeCreditCardService;
    private connectFloatingLabelCallbacks;
    private checkIntlTelInputAvailability;
    private scanPaymentButtons;
    private extractPaymentMethod;
    initializePhoneFields(shippingPhoneField?: HTMLElement, billingPhoneField?: HTMLElement, updateFormDataCallback?: (data: Record<string, any>) => void, updateBillingDataCallback?: (data: Record<string, any>) => void): void;
    private initializePhoneInput;
    private initializeBillingPhoneInput;
    setupPaymentMethod(method: string): void;
    private updatePaymentFormVisibility;
    validatePaymentData(): ValidationResult;
    private validatePhoneNumbers;
    submitPayment(): Promise<PaymentResult>;
    handleExpressCheckout(method: string): Promise<void>;
    formatPhoneNumber(input: HTMLInputElement): void;
    syncPhoneCountryWithAddressCountry(addressCountryCode: string, isShipping?: boolean): void;
    setPhoneNumber(phoneNumber: string, isShipping?: boolean): void;
    getFormattedPhoneNumber(isShipping?: boolean): string;
    private setupPaymentEventHandlers;
    private handlePaymentMethodChange;
    private handleTokenizedPayment;
    private getCardDataFromForm;
    private getUtilsScriptPath;
    isCreditCardReady(): boolean;
    getCreditCardService(): CreditCardService | undefined;
    setUIService(uiService: any): void;
    handleConfigUpdate(configState: any): Promise<void>;
    update(): void;
    destroy(): void;
}
//# sourceMappingURL=PaymentService.d.ts.map