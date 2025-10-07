import { DataLayerConfig, DebugOptions, AnalyticsProvider } from './types';
export declare const DEFAULT_DEBUG_CONFIG: DebugOptions;
export declare const DEFAULT_CONFIG: DataLayerConfig;
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
export declare const EVENT_VALIDATION_RULES: {
    required: string[];
    eventSpecific: {
        dl_purchase: string[];
        dl_add_to_cart: string[];
        dl_remove_from_cart: string[];
        dl_view_item: string[];
        dl_view_item_list: string[];
        dl_view_search_results: string[];
        dl_select_item: string[];
        dl_begin_checkout: string[];
        dl_view_cart: string[];
        dl_add_payment_info: string[];
        dl_add_shipping_info: string[];
        dl_user_data: string[];
        dl_sign_up: string[];
        dl_login: string[];
        dl_subscribe: string[];
        dl_package_swapped: string[];
        dl_upsell_purchase: string[];
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
        cart_total: string;
        lead_type: string;
        pageType: string;
        'ecommerce.currencyCode': string;
        'ecommerce.currency': string;
        'ecommerce.value': string;
        'ecommerce.purchase.actionField.revenue': string;
        'ecommerce.purchase.actionField.tax': string;
        'ecommerce.purchase.actionField.shipping': string;
        'ecommerce.purchase.actionField.sub_total': string;
        'ecommerce.purchase.actionField.id': string;
        'ecommerce.purchase.actionField.order_name': string;
        'user_properties.visitor_type': string;
        'user_properties.customer_id': string;
        'user_properties.customer_order_count': string;
        'user_properties.customer_total_spent': string;
    };
};
export declare const STORAGE_KEYS: {
    readonly DEBUG_MODE: "nextDataLayer_debugMode";
    readonly SESSION_ID: "nextDataLayer_sessionId";
    readonly SESSION_START: "nextDataLayer_sessionStart";
    readonly USER_PROPERTIES: "nextDataLayer_userProperties";
};
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
export declare function getProviderConfig(providerName: keyof typeof PROVIDER_SETTINGS): typeof PROVIDER_SETTINGS[keyof typeof PROVIDER_SETTINGS];
export declare function validateProviderConfig(provider: AnalyticsProvider, settings: typeof PROVIDER_SETTINGS[keyof typeof PROVIDER_SETTINGS]): boolean;
//# sourceMappingURL=config.d.ts.map