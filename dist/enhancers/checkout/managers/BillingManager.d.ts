import { Logger } from '../../../utils/logger';
import { CheckoutState } from '../../../stores/checkoutStore';

export declare class BillingManager {
    private form;
    private billingFields;
    private logger;
    constructor(form: HTMLFormElement, billingFields: Map<string, HTMLElement>, logger: Logger);
    setupBillingForm(): boolean;
    convertShippingFieldsToBilling(billingForm: HTMLElement): void;
    setInitialBillingFormState(): void;
    handleBillingAddressToggle(checked: boolean, setSameAsShippingCallback: (same: boolean) => void, copyShippingToBillingCallback?: () => void): void;
    expandBillingForm(billingSection: HTMLElement): void;
    collapseBillingForm(billingSection: HTMLElement): void;
    copyShippingToBilling(shippingData: Record<string, any>, setBillingAddressCallback: (address: CheckoutState['billingAddress']) => void, updateBillingStateOptionsCallback: (country: string) => void): void;
}
//# sourceMappingURL=BillingManager.d.ts.map