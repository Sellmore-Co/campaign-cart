export declare function trackEvent(eventName: string, properties?: Record<string, any>): Promise<void>;
export declare function trackPageView(): Promise<void>;
export declare function trackSDKInitialized(data: {
    initializationTime: number;
    campaignLoadTime: number;
    fromCache: boolean;
    retryAttempts: number;
    elementsEnhanced: number;
    debugMode: boolean;
    forcePackageId?: string | null;
    forceShippingId?: string | null;
}): Promise<void>;
export declare function trackSDKInitializationFailed(data: {
    errorMessage: string;
    errorStage: 'config_load' | 'campaign_load' | 'dom_scan' | 'attribution';
    retryAttempt: number;
}): Promise<void>;
export declare function trackCampaignLoaded(data: {
    loadTime: number;
    fromCache: boolean;
    cacheAge?: number;
    packageCount: number;
    shippingMethodsCount: number;
    currency: string;
}): Promise<void>;
export declare function trackCampaignLoadFailed(data: {
    errorType: 'network' | 'auth' | 'timeout' | 'invalid_response';
    statusCode?: number;
    retryCount: number;
}): Promise<void>;
export declare function trackAPICall(data: {
    endpoint: string;
    method: string;
    statusCode: number;
    responseTime: number;
    requestType: 'campaign' | 'cart' | 'order' | 'upsell' | 'prospect_cart';
    success: boolean;
    errorMessage?: string;
    errorType?: 'network' | 'rate_limit' | 'auth' | 'server_error' | 'client_error';
    retryAfter?: number;
}): Promise<void>;
export declare function trackCartLoaded(data: {
    itemsCount: number;
    cartValue: number;
    loadTime: number;
    fromStorage: boolean;
}): Promise<void>;
export declare function trackCheckoutStarted(data: {
    cartValue: number;
    itemsCount: number;
    detectedCountry: string;
    paymentMethod: string;
}): Promise<void>;
export declare function trackCheckoutSubmitted(data: {
    cartValue: number;
    itemsCount: number;
    country: string;
    paymentMethod: string;
    timeOnPage: number;
    state?: string;
    city?: string;
    postalCode?: string;
    email?: string;
    sameAsShipping?: boolean;
    billingCountry?: string;
    billingState?: string;
    billingCity?: string;
    billingPostalCode?: string;
}): Promise<void>;
export declare function trackCheckoutValidationFailed(data: {
    validationErrors: string[];
    errorCount: number;
    firstErrorField: string;
    country: string;
    paymentMethod: string;
    errorDetails?: Record<string, {
        value: any;
        error: string;
        category?: string;
        errorType?: string;
    }>;
    formValues?: Record<string, any>;
    errorsByCategory?: Record<string, string[]>;
}): Promise<void>;
export declare function trackCheckoutCompleted(data: {
    orderRefId: string;
    orderValue: number;
    itemsCount: number;
    country: string;
    paymentMethod: string;
    timeToComplete: number;
    state?: string;
    city?: string;
    postalCode?: string;
    email?: string;
    sameAsShipping?: boolean;
    billingCountry?: string;
    billingState?: string;
    billingCity?: string;
    billingPostalCode?: string;
}): Promise<void>;
export declare function trackCheckoutFailed(data: {
    errorMessage: string;
    errorType: 'payment' | 'api' | 'validation' | 'network' | 'unknown';
    paymentResponseCode?: string;
    cartValue: number;
    itemsCount: number;
    country: string;
    paymentMethod: string;
    timeOnPage: number;
}): Promise<void>;
export declare function trackEmptyCartCheckoutAttempt(data: {
    paymentMethod: string;
    buttonLocation?: string;
}): Promise<void>;
export declare function trackDuplicateOrderPrevention(data: {
    orderRefId: string;
    orderNumber: string;
    userAction: 'close' | 'back';
    timeOnPage?: number;
}): Promise<void>;
export declare function trackUpsellPageView(data: {
    orderRefId: string;
    upsellPackageIds: number[];
    orderValue: number;
    upsellsCompleted: string[];
}): Promise<void>;
export declare function trackUpsellAction(data: {
    action: 'accepted' | 'declined';
    packageId: number;
    packageValue: number;
    orderRefId: string;
    newOrderTotal?: number;
}): Promise<void>;
export declare const AmplitudeAnalytics: {
    trackEvent: typeof trackEvent;
    trackPageView: typeof trackPageView;
    trackSDKInitialized: typeof trackSDKInitialized;
    trackSDKInitializationFailed: typeof trackSDKInitializationFailed;
    trackCampaignLoaded: typeof trackCampaignLoaded;
    trackCampaignLoadFailed: typeof trackCampaignLoadFailed;
    trackAPICall: typeof trackAPICall;
    trackCartLoaded: typeof trackCartLoaded;
    trackCheckoutStarted: typeof trackCheckoutStarted;
    trackCheckoutSubmitted: typeof trackCheckoutSubmitted;
    trackCheckoutValidationFailed: typeof trackCheckoutValidationFailed;
    trackCheckoutCompleted: typeof trackCheckoutCompleted;
    trackCheckoutFailed: typeof trackCheckoutFailed;
    trackEmptyCartCheckoutAttempt: typeof trackEmptyCartCheckoutAttempt;
    trackDuplicateOrderPrevention: typeof trackDuplicateOrderPrevention;
    trackUpsellPageView: typeof trackUpsellPageView;
    trackUpsellAction: typeof trackUpsellAction;
};
//# sourceMappingURL=amplitude.d.ts.map