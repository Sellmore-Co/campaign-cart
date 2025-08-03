import { DataLayerConfig, DebugOptions, AnalyticsProvider } from './types';
/**
 * Default debug configuration
 */
export declare const DEFAULT_DEBUG_CONFIG: DebugOptions;
/**
 * Default analytics configuration
 */
export declare const DEFAULT_CONFIG: DataLayerConfig;
/**
 * Provider settings structure
 */
export declare const PROVIDER_SETTINGS: {
    readonly GA4: {
        readonly name: "Google Analytics 4";
        readonly requiredConfig: readonly ["measurementId"];
        readonly optionalConfig: readonly ["sendPageView", "debugMode"];
    };
    readonly GTM: {
        readonly name: "Google Tag Manager";
        readonly requiredConfig: readonly ["containerId"];
        readonly optionalConfig: readonly ["dataLayerName", "preview", "auth"];
    };
    readonly FACEBOOK: {
        readonly name: "Facebook Pixel";
        readonly requiredConfig: readonly ["pixelId"];
        readonly optionalConfig: readonly ["autoConfig", "debugMode"];
    };
    readonly SEGMENT: {
        readonly name: "Segment";
        readonly requiredConfig: readonly ["writeKey"];
        readonly optionalConfig: readonly ["cdnURL", "integrations"];
    };
};
/**
 * Event validation rules
 */
export declare const EVENT_VALIDATION_RULES: {
    required: string[];
    eventSpecific: {
        purchase: string[];
        add_to_cart: string[];
        remove_from_cart: string[];
        view_item: string[];
        view_item_list: string[];
        begin_checkout: string[];
        add_payment_info: string[];
        add_shipping_info: string[];
    };
    fieldTypes: {
        event: string;
        event_id: string;
        event_category: string;
        event_label: string;
        event_value: string;
        'ecommerce.value': string;
        'ecommerce.tax': string;
        'ecommerce.shipping': string;
        'ecommerce.discount': string;
    };
};
/**
 * Local storage keys
 */
export declare const STORAGE_KEYS: {
    readonly DEBUG_MODE: "nextDataLayer_debugMode";
    readonly SESSION_ID: "nextDataLayer_sessionId";
    readonly SESSION_START: "nextDataLayer_sessionStart";
    readonly USER_PROPERTIES: "nextDataLayer_userProperties";
};
/**
 * Analytics event names (following GA4 conventions)
 */
export declare const ANALYTICS_EVENTS: {
    readonly VIEW_ITEM: "view_item";
    readonly VIEW_ITEM_LIST: "view_item_list";
    readonly SELECT_ITEM: "select_item";
    readonly ADD_TO_CART: "add_to_cart";
    readonly REMOVE_FROM_CART: "remove_from_cart";
    readonly VIEW_CART: "view_cart";
    readonly BEGIN_CHECKOUT: "begin_checkout";
    readonly ADD_SHIPPING_INFO: "add_shipping_info";
    readonly ADD_PAYMENT_INFO: "add_payment_info";
    readonly PURCHASE: "purchase";
    readonly REFUND: "refund";
    readonly LOGIN: "login";
    readonly SIGN_UP: "sign_up";
    readonly PAGE_VIEW: "page_view";
    readonly SEARCH: "search";
    readonly SHARE: "share";
    readonly CUSTOM: "custom_event";
};
/**
 * Get provider configuration by name
 */
export declare function getProviderConfig(providerName: keyof typeof PROVIDER_SETTINGS): typeof PROVIDER_SETTINGS[keyof typeof PROVIDER_SETTINGS];
/**
 * Validate provider configuration
 */
export declare function validateProviderConfig(provider: AnalyticsProvider, settings: typeof PROVIDER_SETTINGS[keyof typeof PROVIDER_SETTINGS]): boolean;
//# sourceMappingURL=config.d.ts.map