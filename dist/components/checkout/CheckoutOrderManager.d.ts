import { ApiClient } from '../../api/client';
import { CheckoutRedirectHandler } from '../../utils/checkout/checkoutRedirectHandler';
import { Logger } from '../../utils/logger';

export declare class CheckoutOrderManager {
    private apiClient;
    private redirectHandler;
    private logger;
    constructor(apiClient: ApiClient, redirectHandler: CheckoutRedirectHandler, logger: Logger);
    createOrder(): Promise<any>;
    createExpressOrder(paymentMethod: 'paypal' | 'apple_pay' | 'google_pay'): Promise<any>;
    private mapPaymentMethod;
    private getUrlParam;
    destroy(): void;
}
//# sourceMappingURL=CheckoutOrderManager.d.ts.map