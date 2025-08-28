export declare function isApplePayAvailable(): boolean;
export declare function isGooglePayAvailable(): boolean;
export declare function isPayPalAvailable(): boolean;
export declare function filterAvailablePaymentMethods(methods: string[]): string[];
export declare function getPaymentCapabilities(): {
    applePay: boolean;
    googlePay: boolean;
    paypal: boolean;
    userAgent: string;
    platform: string;
};
//# sourceMappingURL=paymentAvailability.d.ts.map