import { Logger } from '../../utils/logger';
export declare class CheckoutFormHandler {
    private form;
    private fields;
    private paymentButtons;
    private logger;
    private submitHandler?;
    private changeHandler?;
    private paymentMethodChangeHandler?;
    private shippingMethodChangeHandler?;
    private billingAddressToggleHandler?;
    constructor(form: HTMLFormElement, fields: Map<string, HTMLElement>, paymentButtons: Map<string, HTMLElement>, logger: Logger);
    setupEventHandlers(onSubmit: (event: Event) => Promise<void>, onChange: (event: Event) => Promise<void>, onPaymentMethodChange: (event: Event) => void, onShippingMethodChange: (event: Event) => void, onBillingAddressToggle: (event: Event) => void, onExpressCheckout: (method: string) => Promise<void>): void;
    handleFieldChange(event: Event): Promise<void>;
    handlePaymentMethodChange(event: Event): void;
    handleShippingMethodChange(event: Event): void;
    handleBillingAddressToggle(event: Event): void;
    handleCheckoutUpdate(state: any): void;
    scrollToField(fieldName: string): void;
    private updatePaymentFormVisibility;
    private getFieldNameFromElement;
    private displayErrors;
    private disableForm;
    private enableForm;
    cleanup(): void;
    destroy(): void;
}
//# sourceMappingURL=CheckoutFormHandler.d.ts.map