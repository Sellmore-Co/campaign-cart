export interface ProductSchema {
    item_id: string;
    item_name: string;
    affiliation?: string;
    coupon?: string;
    currency?: string;
    discount?: number;
    index?: number;
    item_brand?: string;
    item_category?: string;
    item_category2?: string;
    item_category3?: string;
    item_category4?: string;
    item_category5?: string;
    item_list_id?: string;
    item_list_name?: string;
    item_variant?: string;
    location_id?: string;
    price?: number;
    quantity?: number;
}
export interface ImpressionSchema {
    item_id: string;
    item_name: string;
    affiliation?: string;
    coupon?: string;
    currency?: string;
    discount?: number;
    index?: number;
    item_brand?: string;
    item_category?: string;
    item_category2?: string;
    item_category3?: string;
    item_category4?: string;
    item_category5?: string;
    item_list_id?: string;
    item_list_name?: string;
    item_variant?: string;
    location_id?: string;
    price?: number;
    quantity?: number;
}
export interface UserPropertiesSchema {
    visitor_type?: string;
    customer_id?: string;
    customer_email?: string;
    customer_phone?: string;
    customer_first_name?: string;
    customer_last_name?: string;
    customer_address_city?: string;
    customer_address_province?: string;
    customer_address_province_code?: string;
    customer_address_country?: string;
    customer_address_country_code?: string;
    customer_address_zip?: string;
    customer_order_count?: number;
    customer_total_spent?: number;
    customer_tags?: string;
    [key: string]: any;
}
export interface BaseEventSchema {
    event: string;
    event_id?: string;
    timestamp?: number;
    user_properties?: UserPropertiesSchema;
    ecommerce?: {
        currency?: string;
        value?: number;
        coupon?: string;
        items?: ProductSchema[];
        impressions?: ImpressionSchema[];
        [key: string]: any;
    };
    [key: string]: any;
}
export interface FieldDefinition {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required?: boolean;
    properties?: Record<string, FieldDefinition>;
    items?: FieldDefinition;
    enum?: any[];
}
export interface EventSchema {
    name: string;
    fields: Record<string, FieldDefinition>;
}
export declare const eventSchemas: Record<string, EventSchema>;
export declare function validateEventSchema(eventData: any, schema: EventSchema): {
    valid: boolean;
    errors: string[];
};
export declare function getEventSchema(eventName: string): EventSchema | undefined;
//# sourceMappingURL=index.d.ts.map