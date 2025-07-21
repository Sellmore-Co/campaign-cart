import { Logger } from '../../../utils/logger';

export declare class TestOrderManager {
    private logger;
    private emitCallback;
    constructor(logger: Logger, emitCallback: (event: string, data: any) => void);
    handleTestDataFilled(fields: Map<string, HTMLElement>): void;
    handleKonamiActivation(event: Event, createTestOrderCallback: () => Promise<any>, handleOrderRedirectCallback: (order: any) => void, updateFormDataCallback: (data: Record<string, any>) => void, setPaymentMethodCallback: (method: string) => void, setPaymentTokenCallback: (token: string) => void, setSameAsShippingCallback: (same: boolean) => void, setShippingMethodCallback: (method: any) => void, clearAllErrorsCallback: () => void, populateFormDataCallback: () => void, isCartEmptyCallback: () => boolean): Promise<void>;
    private fillTestDataAndCreateOrder;
    private showTestOrderError;
}
//# sourceMappingURL=TestOrderManager.d.ts.map