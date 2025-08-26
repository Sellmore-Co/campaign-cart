import { CreateOrder } from '../../../types/api';
export declare class OrderBuilder {
    buildOrder(checkoutFormData: Record<string, any>, cartItems: any[], paymentMethod: string, paymentToken?: string, billingAddress?: any, sameAsShipping?: boolean, shippingMethod?: any, vouchers?: string[]): CreateOrder;
    buildExpressOrder(cartItems: any[], paymentMethod: 'paypal' | 'apple_pay' | 'google_pay', vouchers?: string[]): CreateOrder;
    buildTestOrder(cartItems: any[], vouchers?: string[]): any;
    private mapPaymentMethod;
    private getTestAttribution;
}
//# sourceMappingURL=OrderBuilder.d.ts.map