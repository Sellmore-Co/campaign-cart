import { DataLayerEvent, UserProperties, EventContext, EcommerceItem } from '../types';

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
    };
    price_incl_tax?: number | string;
    quantity?: number;
    package_profile?: string;
    variant?: string;
    product?: {
        title?: string;
    };
}
export declare class EventBuilder {
    /**
     * Create base event with standard properties
     */
    static createEvent(eventName: string, eventData?: Partial<DataLayerEvent>): DataLayerEvent;
    /**
     * Generate unique event ID
     */
    private static generateEventId;
    /**
     * Get user properties from stores
     */
    static getUserProperties(): UserProperties;
    /**
     * Get event context (page info, session, etc.)
     */
    static getEventContext(): EventContext;
    /**
     * Get event metadata
     */
    private static getEventMetadata;
    /**
     * Get or create session ID
     */
    static getSessionId(): string;
    /**
     * Get next sequence number for event ordering
     */
    private static getNextSequenceNumber;
    /**
     * Get currency from campaign store
     */
    static getCurrency(): string;
    /**
     * Format cart item to ecommerce item
     */
    static formatEcommerceItem(item: MinimalCartItem, index?: number, list?: {
        id?: string;
        name?: string;
    }): EcommerceItem;
    /**
     * Get list attribution from sessionStorage
     */
    static getListAttribution(): {
        id?: string;
        name?: string;
    } | undefined;
    /**
     * Set list attribution in sessionStorage
     */
    static setListAttribution(listId?: string, listName?: string): void;
    /**
     * Clear list attribution
     */
    static clearListAttribution(): void;
}
export {};
//# sourceMappingURL=EventBuilder.d.ts.map