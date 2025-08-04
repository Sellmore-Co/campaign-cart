export interface Campaign {
    currency: string;
    language: string;
    name: string;
    packages: Package[];
    payment_env_key: string;
    shipping_methods: ShippingOption[];
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
//# sourceMappingURL=campaign.d.ts.map