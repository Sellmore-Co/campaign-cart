/**
 * Ecommerce Events
 * Builder methods for standardized e-commerce analytics events
 */

import type { DataLayerEvent, EcommerceData, EcommerceItem } from '../types';
import { EventBuilder } from './EventBuilder';
import { useCartStore } from '@/stores/cartStore';
// import { useCampaignStore } from '@/stores/campaignStore'; - removed unused import
// import { useCheckoutStore } from '@/stores/checkoutStore'; - removed unused import
import type { CartItem, EnrichedCartLine } from '@/types/global';

export class EcommerceEvents {
  /**
   * Create view_item_list event with impressions array
   */
  static createViewItemListEvent(
    items: (CartItem | EnrichedCartLine | any)[],
    listId?: string,
    listName?: string
  ): DataLayerEvent {
    const currency = EventBuilder.getCurrency();
    
    // Format items with index
    const formattedItems: EcommerceItem[] = items.map((item, index) => 
      EventBuilder.formatEcommerceItem(item, index, listId !== undefined || listName !== undefined ? { 
        ...(listId !== undefined && { id: listId }),
        ...(listName !== undefined && { name: listName })
      } : undefined)
    );

    // Calculate total value
    const totalValue = formattedItems.reduce(
      (sum, item) => sum + ((item.price || 0) * (item.quantity || 1)),
      0
    );

    // Store list attribution for future events
    EventBuilder.setListAttribution(listId, listName);

    const ecommerce: EcommerceData = {
      currency,
      value: totalValue,
      items: formattedItems
    };

    return EventBuilder.createEvent('dl_view_item_list', {
      ecommerce,
      event_category: 'ecommerce',
      event_label: listName || 'Product List'
    });
  }

  /**
   * Create view_item event
   */
  static createViewItemEvent(
    item: CartItem | EnrichedCartLine | any
  ): DataLayerEvent {
    const currency = EventBuilder.getCurrency();
    const formattedItem = EventBuilder.formatEcommerceItem(item);

    const ecommerce: EcommerceData = {
      currency,
      value: (formattedItem.price || 0) * (formattedItem.quantity || 1),
      items: [formattedItem]
    };

    return EventBuilder.createEvent('dl_view_item', {
      ecommerce,
      event_category: 'ecommerce',
      event_label: formattedItem.item_name
    });
  }

  /**
   * Create add_to_cart event with list attribution
   */
  static createAddToCartEvent(
    item: CartItem | EnrichedCartLine | any,
    listId?: string,
    listName?: string
  ): DataLayerEvent {
    const currency = EventBuilder.getCurrency();
    
    // Use provided list info or get from session
    const list = listId || listName 
      ? {
          ...(listId !== undefined && { id: listId }),
          ...(listName !== undefined && { name: listName })
        }
      : EventBuilder.getListAttribution();
    
    const formattedItem = EventBuilder.formatEcommerceItem(item, undefined, list);

    const ecommerce: EcommerceData = {
      currency,
      value: (formattedItem.price || 0) * (formattedItem.quantity || 1),
      items: [formattedItem]
    };

    return EventBuilder.createEvent('dl_add_to_cart', {
      ecommerce,
      event_category: 'ecommerce',
      event_label: formattedItem.item_name,
      list: list?.id || list?.name ? list : undefined
    });
  }

  /**
   * Create remove_from_cart event
   */
  static createRemoveFromCartEvent(
    item: CartItem | EnrichedCartLine | any
  ): DataLayerEvent {
    const currency = EventBuilder.getCurrency();
    const formattedItem = EventBuilder.formatEcommerceItem(item);

    const ecommerce: EcommerceData = {
      currency,
      value: (formattedItem.price || 0) * (formattedItem.quantity || 1),
      items: [formattedItem]
    };

    return EventBuilder.createEvent('dl_remove_from_cart', {
      ecommerce,
      event_category: 'ecommerce',
      event_label: formattedItem.item_name
    });
  }

  /**
   * Create package_swapped event for atomic package swaps
   */
  static createPackageSwappedEvent(
    previousItem: CartItem | any,
    newItem: CartItem | any,
    priceDifference: number
  ): DataLayerEvent {
    const currency = EventBuilder.getCurrency();
    const formattedPreviousItem = EventBuilder.formatEcommerceItem(previousItem);
    const formattedNewItem = EventBuilder.formatEcommerceItem(newItem);

    const ecommerce: EcommerceData = {
      currency,
      value_change: priceDifference,
      items_removed: [formattedPreviousItem],
      items_added: [formattedNewItem]
    };

    return EventBuilder.createEvent('dl_package_swapped', {
      ecommerce,
      event_category: 'ecommerce',
      event_action: 'swap',
      event_label: `${formattedPreviousItem.item_name} → ${formattedNewItem.item_name}`,
      swap_details: {
        previous_package_id: previousItem.packageId,
        new_package_id: newItem.packageId,
        price_difference: priceDifference
      }
    });
  }

  /**
   * Create select_item event (product click)
   */
  static createSelectItemEvent(
    item: CartItem | EnrichedCartLine | any,
    listId?: string,
    listName?: string
  ): DataLayerEvent {
    const currency = EventBuilder.getCurrency();
    
    // Use provided list info or get from session
    const list = listId || listName 
      ? {
          ...(listId !== undefined && { id: listId }),
          ...(listName !== undefined && { name: listName })
        }
      : EventBuilder.getListAttribution();
    
    const formattedItem = EventBuilder.formatEcommerceItem(item, undefined, list);

    const ecommerce: EcommerceData = {
      currency,
      value: (formattedItem.price || 0) * (formattedItem.quantity || 1),
      items: [formattedItem]
    };

    return EventBuilder.createEvent('dl_select_item', {
      ecommerce,
      event_category: 'ecommerce',
      event_label: formattedItem.item_name,
      list: list?.id || list?.name ? list : undefined
    });
  }

  /**
   * Create begin_checkout event
   */
  static createBeginCheckoutEvent(): DataLayerEvent {
    const cartState = useCartStore.getState();
    const currency = EventBuilder.getCurrency();
    
    // Format all cart items
    const formattedItems = cartState.enrichedItems.map((item, index) => 
      EventBuilder.formatEcommerceItem(item, index)
    );

    const ecommerce: EcommerceData = {
      currency,
      value: cartState.totals.total.value,
      items: formattedItems
    };

    // Add coupon if applied
    if (cartState.appliedCoupons?.[0]?.code) {
      ecommerce.coupon = cartState.appliedCoupons[0].code;
    }

    return EventBuilder.createEvent('dl_begin_checkout', {
      ecommerce,
      event_category: 'ecommerce',
      event_value: cartState.totals.total.value
    });
  }

  /**
   * Create purchase event
   */
  static createPurchaseEvent(orderData: any): DataLayerEvent {
    const cartState = useCartStore.getState();
    const currency = EventBuilder.getCurrency();
    
    // Handle order object structure from API
    const order = orderData.order || orderData;
    const orderId = order.ref_id || order.number || orderData.orderId || 
                   orderData.transactionId || `order_${Date.now()}`;
    
    // Parse order totals
    const orderTotal = parseFloat(
      order.total_incl_tax || order.total || orderData.total || 
      cartState.totals.total.value || 0
    );
    const orderTax = parseFloat(
      order.total_tax || orderData.tax || cartState.totals.tax.value || 0
    );
    const orderShipping = parseFloat(
      order.shipping_incl_tax || orderData.shipping || 
      cartState.totals.shipping.value || 0
    );
    
    // Format order items
    let formattedItems: EcommerceItem[] = [];
    if (order.lines && order.lines.length > 0) {
      formattedItems = order.lines.map((line: any, index: number) => ({
        item_id: String(line.package || line.product_id || line.id),
        item_name: line.product_title || line.name || 'Unknown Product',
        item_category: line.campaign_name || 'Campaign',
        item_variant: line.package_profile || line.variant,
        price: parseFloat(line.price_incl_tax || line.price || 0),
        quantity: line.quantity || 1,
        currency: order.currency || currency,
        index
      }));
    } else if (orderData.items || cartState.enrichedItems.length > 0) {
      // Fallback to provided items or cart items
      formattedItems = (orderData.items || cartState.enrichedItems).map(
        (item: any, index: number) => EventBuilder.formatEcommerceItem(item, index)
      );
    }

    const ecommerce: EcommerceData = {
      transaction_id: orderId,
      currency: order.currency || currency,
      value: orderTotal,
      items: formattedItems,
      tax: orderTax,
      shipping: orderShipping
    };

    // Add coupon if present
    const coupon = order.vouchers?.[0]?.code || orderData.coupon || 
                  cartState.appliedCoupons?.[0]?.code;
    if (coupon) {
      ecommerce.coupon = coupon;
    }

    // Clear list attribution after purchase
    EventBuilder.clearListAttribution();

    return EventBuilder.createEvent('dl_purchase', {
      ecommerce,
      event_category: 'ecommerce',
      event_value: orderTotal
    });
  }

  /**
   * Create view_cart event
   */
  static createViewCartEvent(): DataLayerEvent {
    const cartState = useCartStore.getState();
    const currency = EventBuilder.getCurrency();
    
    // Format all cart items
    const formattedItems = cartState.enrichedItems.map((item, index) => 
      EventBuilder.formatEcommerceItem(item, index, { id: 'cart', name: 'Shopping Cart' })
    );

    const ecommerce: EcommerceData = {
      currency,
      value: cartState.totals.total.value,
      items: formattedItems
    };

    // Add coupon if applied
    if (cartState.appliedCoupons?.[0]?.code) {
      ecommerce.coupon = cartState.appliedCoupons[0].code;
    }

    return EventBuilder.createEvent('dl_view_cart', {
      ecommerce,
      event_category: 'ecommerce',
      event_value: cartState.totals.total.value
    });
  }

  /**
   * Create add_shipping_info event
   * Fires when user enters or confirms shipping details
   */
  static createAddShippingInfoEvent(shippingTier?: string): DataLayerEvent {
    const cartState = useCartStore.getState();
    const currency = EventBuilder.getCurrency();
    
    // Format all cart items
    const formattedItems = cartState.enrichedItems.map((item, index) => 
      EventBuilder.formatEcommerceItem(item, index)
    );

    const ecommerce: EcommerceData = {
      currency,
      value: cartState.totals.total.value,
      items: formattedItems,
      ...(shippingTier && { shipping_tier: shippingTier })
    };

    // Add coupon if applied
    if (cartState.appliedCoupons?.[0]?.code) {
      ecommerce.coupon = cartState.appliedCoupons[0].code;
    }

    return EventBuilder.createEvent('dl_add_shipping_info', {
      ecommerce,
      event_category: 'ecommerce',
      event_value: cartState.totals.total.value,
      shipping_tier: shippingTier
    });
  }

  /**
   * Create add_payment_info event
   * Fires when user enters or confirms payment method
   */
  static createAddPaymentInfoEvent(paymentType?: string): DataLayerEvent {
    const cartState = useCartStore.getState();
    const currency = EventBuilder.getCurrency();
    
    // Format all cart items
    const formattedItems = cartState.enrichedItems.map((item, index) => 
      EventBuilder.formatEcommerceItem(item, index)
    );

    const ecommerce: EcommerceData = {
      currency,
      value: cartState.totals.total.value,
      items: formattedItems,
      ...(paymentType && { payment_type: paymentType })
    };

    // Add coupon if applied
    if (cartState.appliedCoupons?.[0]?.code) {
      ecommerce.coupon = cartState.appliedCoupons[0].code;
    }

    return EventBuilder.createEvent('dl_add_payment_info', {
      ecommerce,
      event_category: 'ecommerce',
      event_value: cartState.totals.total.value,
      payment_type: paymentType
    });
  }
}