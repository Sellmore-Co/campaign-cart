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
export interface VariantAttribute {
    code: string;
    name: string;
    value: string;
}
export interface ProductVariant {
    id: number;
    name: string;
    attributes: VariantAttribute[];
    sku?: string | null;
}
export interface Product {
    id: number;
    name: string;
    variant: ProductVariant;
    purchase_availability: 'available' | 'unavailable' | string;
    inventory_availability: 'untracked' | 'tracked' | 'out_of_stock' | string;
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
    product?: Product;
    product_variant_id?: number;
    product_variant_name?: string;
    product_id?: number;
    product_name?: string;
    product_sku?: string | null;
    product_purchase_availability?: string;
    product_inventory_availability?: string;
    product_variant_attribute_values?: VariantAttribute[];
}
export interface ShippingOption {
    ref_id: number;
    code: string;
    price: string;
}
//# sourceMappingURL=campaign.d.ts.map