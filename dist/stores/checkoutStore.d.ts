export interface CheckoutState {
    step: number;
    isProcessing: boolean;
    errors: Record<string, string>;
    formData: Record<string, any>;
    paymentToken?: string;
    paymentMethod: 'card_token' | 'paypal' | 'apple_pay' | 'google_pay' | 'credit-card';
    shippingMethod?: {
        id: number;
        name: string;
        price: number;
        code: string;
    } | undefined;
    billingAddress?: {
        first_name: string;
        last_name: string;
        address1: string;
        address2?: string | undefined;
        city: string;
        province: string;
        postal: string;
        country: string;
        phone: string;
    } | undefined;
    sameAsShipping: boolean;
    testMode: boolean;
    vouchers: string[];
}
interface CheckoutActions {
    setStep: (step: number) => void;
    setProcessing: (processing: boolean) => void;
    setError: (field: string, error: string) => void;
    clearError: (field: string) => void;
    clearAllErrors: () => void;
    updateFormData: (data: Record<string, any>) => void;
    setPaymentToken: (token: string) => void;
    setPaymentMethod: (method: CheckoutState['paymentMethod']) => void;
    setShippingMethod: (method: CheckoutState['shippingMethod']) => void;
    setBillingAddress: (address: CheckoutState['billingAddress']) => void;
    setSameAsShipping: (same: boolean) => void;
    setTestMode: (testMode: boolean) => void;
    addVoucher: (code: string) => void;
    removeVoucher: (code: string) => void;
    reset: () => void;
}
export declare const useCheckoutStore: import('zustand').UseBoundStore<Omit<import('zustand').StoreApi<CheckoutState & CheckoutActions>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import('zustand/middleware').PersistOptions<CheckoutState & CheckoutActions, CheckoutState & CheckoutActions>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: CheckoutState & CheckoutActions) => void) => () => void;
        onFinishHydration: (fn: (state: CheckoutState & CheckoutActions) => void) => () => void;
        getOptions: () => Partial<import('zustand/middleware').PersistOptions<CheckoutState & CheckoutActions, CheckoutState & CheckoutActions>>;
    };
}>;
export {};
//# sourceMappingURL=checkoutStore.d.ts.map