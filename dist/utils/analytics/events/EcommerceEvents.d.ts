import { DataLayerEvent } from '../types';
import { CartItem, EnrichedCartLine } from '../../../types/global';
export declare class EcommerceEvents {
    static createViewItemListEvent(items: (CartItem | EnrichedCartLine | any)[], listId?: string, listName?: string): DataLayerEvent;
    static createViewItemEvent(item: CartItem | EnrichedCartLine | any): DataLayerEvent;
    static createAddToCartEvent(item: CartItem | EnrichedCartLine | any, listId?: string, listName?: string): DataLayerEvent;
    static createRemoveFromCartEvent(item: CartItem | EnrichedCartLine | any): DataLayerEvent;
    static createPackageSwappedEvent(previousItem: CartItem | any, newItem: CartItem | any, priceDifference: number): DataLayerEvent;
    static createSelectItemEvent(item: CartItem | EnrichedCartLine | any, listId?: string, listName?: string): DataLayerEvent;
    static createBeginCheckoutEvent(): DataLayerEvent;
    static createPurchaseEvent(orderData: any): DataLayerEvent;
    static createViewCartEvent(): DataLayerEvent;
    static createAddShippingInfoEvent(shippingTier?: string): DataLayerEvent;
    static createAddPaymentInfoEvent(paymentType?: string): DataLayerEvent;
}
//# sourceMappingURL=EcommerceEvents.d.ts.map