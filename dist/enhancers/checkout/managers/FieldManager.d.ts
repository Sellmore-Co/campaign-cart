import { Logger } from '../../../utils/logger';
export declare class FieldManager {
    private form;
    private logger;
    private fields;
    private billingFields;
    private paymentButtons;
    constructor(form: HTMLFormElement, logger: Logger);
    scanCheckoutFields(): void;
    scanPaymentButtons(): void;
    scanBillingFields(): void;
    getExpirationElements(): [HTMLElement | null, HTMLElement | null];
    populateMonthOptions(monthSelect: HTMLSelectElement): void;
    populateYearOptions(yearSelect: HTMLSelectElement): void;
    populateExpirationFields(): void;
    populateFormData(formData: Record<string, any>): void;
    getFieldNameFromElement(element: HTMLElement): string | null;
    setupFieldEventHandlers(changeHandler: (event: Event) => void): void;
    cleanupFieldEventHandlers(changeHandler: (event: Event) => void): void;
    disableFields(): void;
    enableFields(): void;
    getFields(): Map<string, HTMLElement>;
    getBillingFields(): Map<string, HTMLElement>;
    getPaymentButtons(): Map<string, HTMLElement>;
    getField(name: string): HTMLElement | undefined;
    getBillingField(name: string): HTMLElement | undefined;
    getPaymentButton(name: string): HTMLElement | undefined;
    update(): void;
    clear(): void;
}
//# sourceMappingURL=FieldManager.d.ts.map