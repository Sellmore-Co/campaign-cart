import { DataLayerEvent } from '../types';
import { CartItem, EnrichedCartLine } from '../../../types/global';
export declare class EcommerceEvents {
    /**
     * Create view_item_list event with impressions array
     */
    static createViewItemListEvent(items: (CartItem | EnrichedCartLine | any)[], listId?: string, listName?: string): DataLayerEvent;
    /**
     * Create view_item event
     */
    static createViewItemEvent(item: CartItem | EnrichedCartLine | any): DataLayerEvent;
    /**
     * Create add_to_cart event with list attribution
     */
    static createAddToCartEvent(item: CartItem | EnrichedCartLine | any, listId?: string, listName?: string): DataLayerEvent;
    /**
     * Create remove_from_cart event
     */
    static createRemoveFromCartEvent(item: CartItem | EnrichedCartLine | any): DataLayerEvent;
    /**
     * Create select_item event (product click)
     */
    static createSelectItemEvent(item: CartItem | EnrichedCartLine | any, listId?: string, listName?: string): DataLayerEvent;
    /**
     * Create begin_checkout event
     */
    static createBeginCheckoutEvent(): DataLayerEvent;
    /**
     * Create purchase event
     */
    static createPurchaseEvent(orderData: any): DataLayerEvent;
    /**
     * Create view_cart event
     */
    static createViewCartEvent(): DataLayerEvent;
}
//# sourceMappingURL=EcommerceEvents.d.ts.map