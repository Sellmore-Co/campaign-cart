export interface EventMap {
    'cart:updated': CartState;
    'cart:item-added': {
        packageId: number;
        quantity?: number;
        source?: string;
    };
    'cart:item-removed': {
        packageId: number;
    };
    'cart:quantity-changed': {
        packageId: number;
        quantity: number;
        oldQuantity: number;
    };
    'cart:package-swapped': {
        previousPackageId: number;
        newPackageId: number;
        previousItem?: CartItem;
        newItem?: CartItem;
        priceDifference: number;
        source?: string;
    };
    'campaign:loaded': Campaign;
    'checkout:started': CheckoutData;
    'checkout:form-initialized': {
        form: HTMLFormElement;
    };
    'checkout:spreedly-ready': {};
    'checkout:express-started': {
        method: 'paypal' | 'apple_pay' | 'google_pay';
    };
    'order:completed': OrderData;
    'order:redirect-missing': {
        order: any;
    };
    'error:occurred': ErrorData;
    'currency:fallback': {
        requested: string;
        actual: string;
        reason: 'cached' | 'api';
    };
    'timer:expired': {
        persistenceId: string;
    };
    'config:updated': ConfigState;
    'coupon:applied': {
        coupon: AppliedCoupon;
    } | {
        code: string;
    };
    'coupon:removed': {
        code: string;
    };
    'coupon:validation-failed': {
        code: string;
        message: string;
    };
    'selector:item-selected': {
        selectorId: string;
        packageId: number;
        previousPackageId: number | undefined;
        mode: string;
        pendingAction: boolean | undefined;
        item?: SelectorItem;
    };
    'selector:action-completed': {
        selectorId: string;
        packageId: number;
        previousPackageId: number | undefined;
        mode: string;
    };
    'selector:selection-changed': {
        selectorId: string;
        packageId?: number;
        quantity?: number;
        item?: SelectorItem;
    };
    'shipping:method-selected': {
        shippingId: string;
        selectorId: string;
    };
    'shipping:method-changed': {
        methodId: number;
        method: any;
    };
    'action:success': {
        action: string;
        data?: any;
    };
    'action:failed': {
        action: string;
        error: Error;
    };
    'upsell:accepted': {
        packageId: number;
        quantity: number;
        orderId: string;
        value?: number;
    };
    'upsell-selector:item-selected': {
        selectorId: string;
        packageId: number;
    };
    'upsell:quantity-changed': {
        selectorId?: string | undefined;
        quantity: number;
        packageId?: number | undefined;
    };
    'upsell:option-selected': {
        selectorId: string;
        packageId: number;
    };
    'message:displayed': {
        message: string;
        type: string;
    };
    'payment:tokenized': {
        token: string;
        pmData: any;
        paymentMethod: string;
    };
    'payment:error': {
        errors: string[];
    };
    'checkout:express-completed': {
        method: string;
        success: boolean;
    };
    'checkout:express-failed': {
        method: string;
        error: string;
    };
    'express-checkout:initialized': {
        method: 'paypal' | 'apple_pay' | 'google_pay';
        element: HTMLElement;
    };
    'express-checkout:error': {
        method: 'paypal' | 'apple_pay' | 'google_pay';
        error: string;
    };
    'express-checkout:started': {
        method: 'paypal' | 'apple_pay' | 'google_pay';
        cartTotal: {
            value: number;
            formatted: string;
        };
        itemCount: number;
    };
    'express-checkout:failed': {
        method: 'paypal' | 'apple_pay' | 'google_pay';
        error: string;
    };
    'express-checkout:completed': {
        method: 'paypal' | 'apple_pay' | 'google_pay';
        order: any;
    };
    'express-checkout:redirect-missing': {
        order: any;
    };
    'address:autocomplete-filled': {
        type: 'shipping' | 'billing';
        components: Record<string, {
            long: string;
            short: string;
        }>;
    };
    'address:location-fields-shown': {};
    'checkout:location-fields-shown': {};
    'checkout:billing-location-fields-shown': {};
    'upsell:initialized': {
        packageId: number;
        element: HTMLElement;
    };
    'upsell:adding': {
        packageId: number;
    };
    'upsell:added': {
        packageId: number;
        quantity: number;
        order: any;
        value?: number;
        willRedirect?: boolean;
    };
    'upsell:error': {
        packageId: number;
        error: string;
    };
    'accordion:toggled': {
        id: string;
        isOpen: boolean;
        element: HTMLElement;
    };
    'accordion:opened': {
        id: string;
        element: HTMLElement;
    };
    'accordion:closed': {
        id: string;
        element: HTMLElement;
    };
    'upsell:skipped': {
        packageId?: number;
        orderId?: string;
    };
    'upsell:viewed': {
        packageId?: number;
        pagePath?: string;
        orderId?: string;
    };
    'exit-intent:shown': {
        imageUrl?: string;
        template?: string;
    };
    'exit-intent:clicked': {
        imageUrl?: string;
        template?: string;
    };
    'exit-intent:dismissed': {
        imageUrl?: string;
        template?: string;
    };
    'exit-intent:closed': {
        imageUrl?: string;
        template?: string;
    };
    'exit-intent:action': {
        action: string;
        couponCode?: string;
    };
    'fomo:shown': {
        customer: string;
        product: string;
        image: string;
    };
    'sdk:url-parameters-processed': {};
    'profile:applied': {
        profileId: string;
        previousProfileId?: string | null;
        itemsSwapped: number;
        originalItems?: number;
        cleared?: boolean;
        profile?: any;
    };
    'profile:reverted': {
        previousProfileId?: string | null;
        itemsRestored: number;
    };
    'profile:switched': {
        fromProfileId?: string | null;
        toProfileId: string;
        itemsAffected: number;
    };
    'profile:registered': {
        profileId: string;
        mappingsCount: number;
    };
}
export interface CartItem {
    id: number;
    packageId: number;
    originalPackageId?: number;
    quantity: number;
    price: number;
    image: string | undefined;
    title: string;
    sku: string | undefined;
    is_upsell: boolean | undefined;
    price_per_unit?: string | undefined;
    qty?: number | undefined;
    price_total?: string | undefined;
    price_retail?: string | undefined;
    price_retail_total?: string | undefined;
    price_recurring?: string | undefined;
    price_recurring_total?: string | undefined;
    is_recurring?: boolean | undefined;
    interval?: string | null | undefined;
    interval_count?: number | null | undefined;
    productId?: number | undefined;
    productName?: string | undefined;
    variantId?: number | undefined;
    variantName?: string | undefined;
    variantAttributes?: Array<{
        code: string;
        name: string;
        value: string;
    }> | undefined;
    variantSku?: string | undefined;
    groupedItemIds?: number[] | undefined;
}
export interface SelectorItem {
    element: HTMLElement;
    packageId: number;
    quantity: number;
    price: number | undefined;
    name: string | undefined;
    isPreSelected: boolean;
    shippingId: string | undefined;
}
export interface CartState {
    items: CartItem[];
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    totalQuantity: number;
    isEmpty: boolean;
    coupon?: Coupon;
    appliedCoupons: AppliedCoupon[];
    shippingMethod?: ShippingMethod;
    enrichedItems: EnrichedCartLine[];
    totals: CartTotals;
    swapInProgress?: boolean;
    lastCurrency?: string;
}
export interface CartTotals {
    subtotal: {
        value: number;
        formatted: string;
    };
    shipping: {
        value: number;
        formatted: string;
    };
    tax: {
        value: number;
        formatted: string;
    };
    discounts: {
        value: number;
        formatted: string;
    };
    total: {
        value: number;
        formatted: string;
    };
    totalExclShipping: {
        value: number;
        formatted: string;
    };
    count: number;
    isEmpty: boolean;
    savings: {
        value: number;
        formatted: string;
    };
    savingsPercentage: {
        value: number;
        formatted: string;
    };
    compareTotal: {
        value: number;
        formatted: string;
    };
    hasSavings: boolean;
    totalSavings: {
        value: number;
        formatted: string;
    };
    totalSavingsPercentage: {
        value: number;
        formatted: string;
    };
    hasTotalSavings: boolean;
}
export interface EnrichedCartLine {
    id: number;
    packageId: number;
    quantity: number;
    price: {
        excl_tax: {
            value: number;
            formatted: string;
        };
        incl_tax: {
            value: number;
            formatted: string;
        };
        original: {
            value: number;
            formatted: string;
        };
        savings: {
            value: number;
            formatted: string;
        };
    };
    product: {
        title: string;
        sku: string;
        image: string;
    };
    is_upsell: boolean;
    is_recurring: boolean;
    interval?: 'day' | 'month';
    is_bundle: boolean;
    bundleComponents?: number[];
}
export interface Campaign {
    currency: string;
    language: string;
    name: string;
    packages: Package[];
    payment_env_key: string;
    shipping_methods: ShippingOption[];
    available_currencies?: Array<{
        code: string;
        label: string;
    }>;
}
export interface Package {
    ref_id: number;
    external_id: number;
    name: string;
    price: string;
    price_total: string;
    price_retail?: string;
    price_retail_total?: string;
    price_recurring?: string;
    price_recurring_total?: string;
    qty: number;
    image: string;
    is_recurring: boolean;
    interval?: 'day' | 'month' | null;
    interval_count?: number | null;
}
export interface ShippingOption {
    ref_id: number;
    code: string;
    price: string;
}
export interface GoogleMapsConfig {
    apiKey?: string;
    region?: string;
    enableAutocomplete?: boolean;
    autocompleteOptions?: any;
}
export interface AddressConfig {
    defaultCountry?: string;
    showCountries?: string[];
    dontShowStates?: string[];
    countries?: Array<{
        code: string;
        name: string;
    }>;
}
export interface ConfigState {
    apiKey: string;
    campaignId: string;
    debug: boolean;
    pageType: PageType;
    storeName?: string;
    spreedlyEnvironmentKey?: string | undefined;
    paymentConfig: PaymentConfig;
    googleMapsConfig: GoogleMapsConfig;
    addressConfig: AddressConfig;
    detectedCountry?: string;
    detectedCurrency?: string;
    selectedCurrency?: string;
    locationData?: any;
    currencyBehavior?: 'auto' | 'manual';
    currencyFallbackOccurred?: boolean;
    autoInit: boolean | undefined;
    rateLimit: number | undefined;
    cacheTtl: number | undefined;
    retryAttempts: number | undefined;
    timeout: number | undefined;
    testMode: boolean | undefined;
    maxRetries: number | undefined;
    requestTimeout: number | undefined;
    enableAnalytics: boolean | undefined;
    enableDebugMode: boolean | undefined;
    environment: 'development' | 'staging' | 'production' | undefined;
    version?: string | undefined;
    buildTimestamp?: string | undefined;
    discounts: Record<string, DiscountDefinition>;
    utmTransfer?: {
        enabled: boolean;
        applyToExternalLinks?: boolean;
        excludedDomains?: string[];
        paramsToCopy?: string[];
    };
    tracking?: 'auto' | 'manual' | 'disabled';
    analytics?: {
        enabled: boolean;
        mode: 'auto' | 'manual' | 'disabled';
        debug: boolean;
        providers: {
            gtm: {
                enabled: boolean;
                settings: {
                    containerId?: string;
                    dataLayerName?: string;
                    environment?: string;
                };
            };
            facebook: {
                enabled: boolean;
                settings: {
                    pixelId: string;
                    accessToken?: string;
                    testEventCode?: string;
                };
                blockedEvents?: string[];
            };
            custom: {
                enabled: boolean;
                settings: {
                    endpoint: string;
                    apiKey?: string;
                    batchSize?: number;
                    timeout?: number;
                };
            };
        };
    };
    profiles?: Record<string, {
        name: string;
        description?: string;
        packageMappings: Record<number, number>;
    }>;
    defaultProfile?: string;
    activeProfile?: string;
}
export type PageType = 'product' | 'cart' | 'checkout' | 'upsell' | 'receipt';
export interface PaymentConfig {
    spreedly?: {
        fieldType?: {
            number?: string;
            cvv?: string;
        };
    };
    expressCheckout?: {
        enabled: boolean;
        methods: {
            paypal?: boolean;
            applePay?: boolean;
            googlePay?: boolean;
        };
        requireValidation?: boolean;
        requiredFields?: string[];
    };
}
export type CallbackType = 'beforeRender' | 'afterRender' | 'beforeCheckout' | 'afterCheckout' | 'beforeRedirect' | 'itemAdded' | 'itemRemoved' | 'cartCleared';
export interface CallbackData {
    cartLines: EnrichedCartLine[];
    cartTotals: CartTotals;
    campaignData: Campaign | null;
    appliedCoupons: AppliedCoupon[];
}
export interface DiscountDefinition {
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    scope: 'order' | 'package';
    packageIds?: number[];
    minOrderValue?: number;
    maxDiscount?: number;
    description?: string;
    usageLimit?: number;
    combinable?: boolean;
}
export interface AppliedCoupon {
    code: string;
    discount: number;
    definition: DiscountDefinition;
}
export interface Coupon {
    code: string;
    amount: number;
    type: 'fixed' | 'percentage';
}
export interface ShippingMethod {
    id: number;
    name: string;
    price: number;
    code: string;
}
export interface CheckoutData {
    formData: Record<string, any>;
    paymentMethod: 'card_token' | 'paypal' | 'apple_pay' | 'google_pay' | 'credit-card';
    isProcessing?: boolean;
    step?: number;
}
export interface OrderData {
    ref_id: string;
    number: string;
    currency: string;
    total_incl_tax: string;
    order_status_url: string;
    is_test: boolean;
    lines?: any[];
    user?: any;
}
export interface ErrorData {
    message: string;
    code?: string;
    details?: any;
}
//# sourceMappingURL=global.d.ts.map