export interface DataLayerEvent {
    event: string;
    event_id?: string;
    id?: string;
    event_time?: string;
    timestamp?: number;
    event_category?: string;
    event_label?: string;
    event_value?: number;
    user_properties?: UserProperties;
    ecommerce?: EcommerceData;
    custom_properties?: Record<string, any>;
    _metadata?: EventMetadata;
    data?: any;
    cart_total?: string | number;
    order_id?: string;
    upsell?: UpsellData;
    [key: string]: any;
}
export interface UserProperties {
    visitor_type?: 'guest' | 'customer' | 'returning_customer';
    customer_id?: string;
    customer_email?: string;
    customer_phone?: string;
    customer_first_name?: string;
    customer_last_name?: string;
    customer_address_city?: string;
    customer_address_country?: string;
    customer_address_country_code?: string;
    customer_address_province?: string;
    customer_address_province_code?: string;
    customer_address_zip?: string;
    customer_tags?: string[];
    customer_order_count?: number;
    customer_total_spent?: number;
    [key: string]: any;
}
export interface EcommerceData {
    currency?: string;
    value?: number;
    items?: EcommerceItem[];
    transaction_id?: string;
    affiliation?: string;
    tax?: number;
    shipping?: number;
    coupon?: string;
    discount?: number;
}
export interface EcommerceItem {
    item_id: string;
    item_name: string;
    item_brand?: string;
    item_category?: string;
    item_category2?: string;
    item_category3?: string;
    item_category4?: string;
    item_category5?: string;
    item_variant?: string;
    price?: number;
    quantity?: number;
    currency?: string;
    discount?: number;
    affiliation?: string;
    coupon?: string;
    index?: number;
    item_list_id?: string;
    item_list_name?: string;
}
export interface EventContext {
    page_location?: string;
    page_title?: string;
    page_referrer?: string;
    user_agent?: string;
    screen_resolution?: string;
    viewport_size?: string;
    session_id?: string;
    timestamp?: number;
}
export interface EventMetadata {
    pushed_at: number;
    debug_mode?: boolean;
    session_id?: string;
    sequence_number?: number;
    source?: string;
    version?: string;
}
export interface UpsellData {
    package_id: string;
    package_name: string;
    price?: number;
    quantity?: number;
    value?: number;
    currency?: string;
}
export interface UpsellViewedEvent extends DataLayerEvent {
    event: 'dl_viewed_upsell';
    order_id: string;
    upsell: UpsellData;
}
export interface UpsellAcceptedEvent extends DataLayerEvent {
    event: 'dl_accepted_upsell';
    order_id: string;
    upsell: UpsellData;
}
export interface UpsellSkippedEvent extends DataLayerEvent {
    event: 'dl_skipped_upsell';
    order_id: string;
    upsell: Pick<UpsellData, 'package_id' | 'package_name'>;
}
export type DataLayerTransformFn = (event: DataLayerEvent) => DataLayerEvent | null;
export interface AnalyticsProvider {
    name: string;
    enabled: boolean;
    config?: Record<string, any>;
    initialize?: () => Promise<void>;
    trackEvent?: (event: DataLayerEvent) => void;
}
export type AnalyticsEvent = DataLayerEvent;
export interface AnalyticsConfig {
    enabled: boolean;
    debug?: boolean;
    mode?: 'auto' | 'manual';
    providers?: {
        gtm?: {
            enabled: boolean;
            settings?: Record<string, any>;
            blockedEvents?: string[];
        };
        facebook?: {
            enabled: boolean;
            settings?: {
                pixelId: string;
                [key: string]: any;
            };
            blockedEvents?: string[];
        };
        custom?: {
            enabled: boolean;
            settings?: {
                endpoint: string;
                [key: string]: any;
            };
            blockedEvents?: string[];
        };
        rudderstack?: {
            enabled: boolean;
            settings?: Record<string, any>;
            blockedEvents?: string[];
        };
        nextCampaign?: {
            enabled: boolean;
            settings?: Record<string, any>;
            blockedEvents?: string[];
        };
    };
}
export interface TrackingItem {
    id: string;
    name: string;
    category?: string;
    price?: number;
    quantity?: number;
    variant?: string;
    brand?: string;
    [key: string]: any;
}
export interface EcommerceEvent extends DataLayerEvent {
    ecommerce: EcommerceData;
}
export interface DebugOptions {
    enabled: boolean;
    verbose?: boolean;
    logEvents?: boolean;
    logErrors?: boolean;
    persistInLocalStorage?: boolean;
}
export interface DataLayerConfig {
    debug?: DebugOptions;
    providers?: (AnalyticsProvider | any)[];
    transformFn?: DataLayerTransformFn;
    enrichContext?: boolean;
    sessionTimeout?: number;
    eventValidation?: boolean;
}
//# sourceMappingURL=types.d.ts.map