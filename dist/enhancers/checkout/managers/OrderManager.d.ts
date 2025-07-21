import { ApiClient } from '../../../api/client';
import { Logger } from '../../../utils/logger';

export declare class OrderManager {
    private apiClient;
    private logger;
    private emitCallback;
    private orderBuilder;
    constructor(apiClient: ApiClient, logger: Logger, emitCallback: (event: string, data: any) => void);
    createOrder(checkoutFormData: Record<string, any>, cartItems: any[], paymentMethod: string, paymentToken?: string, billingAddress?: any, sameAsShipping?: boolean, shippingMethod?: any, vouchers?: string[], resetCartCallback?: () => void): Promise<any>;
    createExpressOrder(cartItems: any[], paymentMethod: 'paypal' | 'apple_pay' | 'google_pay', resetCartCallback?: () => void): Promise<any>;
    createTestOrder(cartItems: any[], resetCartCallback?: () => void): Promise<any>;
    handleOrderRedirect(order: any): void;
    handleTokenizedPayment(token: string, pmData: any, createOrderCallback: () => Promise<any>): Promise<void>;
    /**
     * Get order status for debugging
     */
    getOrderStatus(refId: string): Promise<any>;
}
//# sourceMappingURL=OrderManager.d.ts.map