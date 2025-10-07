import { DataLayerEvent, UserProperties, EventContext, EcommerceItem, ElevarProduct, ElevarImpression } from '../types';
interface MinimalCartItem {
    id?: string | number;
    packageId?: string | number;
    package_id?: string | number;
    title?: string;
    name?: string;
    product_title?: string;
    price?: number | string | {
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
        value?: number;
    };
    price_incl_tax?: number | string;
    price_retail?: number | string;
    quantity?: number;
    qty?: number;
    package_profile?: string;
    variant?: string;
    product?: {
        title?: string;
        image?: string;
        sku?: string;
    };
    image?: string;
    imageUrl?: string;
    image_url?: string;
    productId?: string | number;
    productName?: string;
    variantId?: string | number;
    variantName?: string;
    variantSku?: string;
    sku?: string;
    [key: string]: any;
}
export declare class EventBuilder {
    static createEvent(eventName: string, eventData?: Partial<DataLayerEvent>): DataLayerEvent;
    private static generateEventId;
    static getUserProperties(): UserProperties;
    static getEventContext(): EventContext;
    private static getEventMetadata;
    static getSessionId(): string;
    private static getNextSequenceNumber;
    static getCurrency(): string;
    static formatEcommerceItem(item: MinimalCartItem, index?: number, list?: {
        id?: string;
        name?: string;
    }): EcommerceItem;
    static getListAttribution(): {
        id?: string;
        name?: string;
    } | undefined;
    static setListAttribution(listId?: string, listName?: string): void;
    static clearListAttribution(): void;
    static formatElevarProduct(item: MinimalCartItem, index?: number): ElevarProduct;
    static formatElevarImpression(item: MinimalCartItem, index?: number, list?: string): ElevarImpression;
}
export {};
//# sourceMappingURL=EventBuilder.d.ts.map