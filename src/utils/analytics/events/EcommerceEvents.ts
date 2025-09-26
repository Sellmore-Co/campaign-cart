/**
 * Ecommerce Events
 * Builder methods for standardized e-commerce analytics events
 */

import type { DataLayerEvent, EcommerceData, EcommerceItem } from '../types';
import { EventBuilder } from './EventBuilder';
import { useCartStore } from '@/stores/cartStore';
import { useCampaignStore } from '@/stores/campaignStore';
import type { CartItem, EnrichedCartLine } from '@/types/global';

export class EcommerceEvents {
  /**
   * Create view_item_list event with impressions array (Elevar format)
   */
  static createViewItemListEvent(
    items: (CartItem | EnrichedCartLine | any)[],
    listId?: string,
    listName?: string
  ): DataLayerEvent {
    const currency = EventBuilder.getCurrency();

    // Format items as impressions
    const impressions = items.map((item, index) =>
      EventBuilder.formatElevarImpression(item, index, listId || listName)
    );

    // Store list attribution for future events
    EventBuilder.setListAttribution(listId, listName);

    const ecommerce: any = {
      currencyCode: currency,
      impressions: impressions
    };

    return EventBuilder.createEvent('dl_view_item_list', {
      user_properties: EventBuilder.getUserProperties(),
      ecommerce
    });
  }

  /**
   * Create view_item event (Elevar format)
   */
  static createViewItemEvent(
    item: CartItem | EnrichedCartLine | any
  ): DataLayerEvent {
    const currency = EventBuilder.getCurrency();
    const formattedItem = EventBuilder.formatElevarProduct(item);
    const list = EventBuilder.getListAttribution();

    const ecommerce: any = {
      currencyCode: currency,
      detail: {
        actionField: {
          list: list?.name || list?.id || location.pathname,
          action: 'detail'
        },
        products: [formattedItem]
      }
    };

    return EventBuilder.createEvent('dl_view_item', {
      user_properties: EventBuilder.getUserProperties(),
      ecommerce
    });
  }

  /**
   * Create add_to_cart event with list attribution (Elevar format)
   */
  static createAddToCartEvent(
    item: CartItem | EnrichedCartLine | any,
    listId?: string,
    listName?: string
  ): DataLayerEvent {
    const currency = EventBuilder.getCurrency();

    // Use provided list info or get from session
    const list = EventBuilder.getListAttribution();
    const listPath = listName || listId || list?.name || list?.id || location.pathname;

    const formattedItem = EventBuilder.formatElevarProduct(item);

    const ecommerce: any = {
      currencyCode: currency,
      add: {
        actionField: {
          list: listPath
        },
        products: [formattedItem]
      }
    };

    return EventBuilder.createEvent('dl_add_to_cart', {
      user_properties: EventBuilder.getUserProperties(),
      ecommerce
    });
  }

  /**
   * Create remove_from_cart event (Elevar format)
   */
  static createRemoveFromCartEvent(
    item: CartItem | EnrichedCartLine | any
  ): DataLayerEvent {
    const currency = EventBuilder.getCurrency();
    const formattedItem = EventBuilder.formatElevarProduct(item);
    const list = EventBuilder.getListAttribution();

    const ecommerce: any = {
      currencyCode: currency,
      remove: {
        actionField: {
          list: list?.name || list?.id || location.pathname
        },
        products: [formattedItem]
      }
    };

    return EventBuilder.createEvent('dl_remove_from_cart', {
      user_properties: EventBuilder.getUserProperties(),
      ecommerce
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
   * Create select_item event (product click) (Elevar format)
   */
  static createSelectItemEvent(
    item: CartItem | EnrichedCartLine | any,
    listId?: string,
    listName?: string
  ): DataLayerEvent {
    const currency = EventBuilder.getCurrency();
    const list = listName || listId || location.pathname;
    const formattedItem = EventBuilder.formatElevarProduct(item);

    const ecommerce: any = {
      currencyCode: currency,
      click: {
        actionField: {
          list: list,
          action: 'click'
        },
        products: [formattedItem]
      }
    };

    return EventBuilder.createEvent('dl_select_item', {
      user_properties: EventBuilder.getUserProperties(),
      ecommerce
    });
  }

  /**
   * Create begin_checkout event (Elevar format)
   */
  static createBeginCheckoutEvent(): DataLayerEvent {
    const cartState = useCartStore.getState();
    const currency = EventBuilder.getCurrency();

    // Use raw cart items, not enrichedItems, as they have the proper package data
    const products = cartState.items.map((item, index) =>
      EventBuilder.formatElevarProduct(item, index)
    );

    // Build Elevar-style ecommerce object with checkout action
    const ecommerce: any = {
      currencyCode: currency,
      checkout: {
        actionField: {
          step: 1,
          option: 'Checkout'
        },
        products: products
      }
    };

    // Add coupon if applied
    if (cartState.appliedCoupons?.[0]?.code) {
      ecommerce.checkout.actionField.coupon = cartState.appliedCoupons[0].code;
    }

    return EventBuilder.createEvent('dl_begin_checkout', {
      user_properties: EventBuilder.getUserProperties(),
      cart_total: String(cartState.totals.total.value || '0.00'),
      ecommerce
    });
  }

  /**
   * Create purchase event (Elevar format)
   */
  static createPurchaseEvent(orderData: any): DataLayerEvent {
    const cartState = useCartStore.getState();
    const currency = EventBuilder.getCurrency();
    const campaignStore = useCampaignStore.getState();

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
    const orderSubtotal = orderTotal - orderTax - orderShipping;

    // Format order items as Elevar products
    let products: any[] = [];
    if (order.lines && order.lines.length > 0) {
      products = order.lines.map((line: any, index: number) => {
        // Try to get package data from campaign
        const packageData = campaignStore.data?.packages?.find((p: any) =>
          String(p.ref_id) === String(line.package)
        );

        return {
          id: line.product_sku || (packageData as any)?.product_sku || line.sku || `SKU-${line.product_id || line.id}`,
          name: line.product_title || line.name || 'Unknown Product',
          product_id: String(line.product_id || (packageData as any)?.product_id || line.package),
          variant_id: String(line.variant_id || (packageData as any)?.product_variant_id || line.package),
          price: String(line.price_incl_tax || line.price || 0),
          brand: (packageData as any)?.product_name || campaignStore.data?.name || '',
          category: line.campaign_name || campaignStore.data?.name || 'Campaign',
          variant: line.package_profile || line.variant || '',
          quantity: String(line.quantity || 1)
        };
      });
    } else if (orderData.items || cartState.enrichedItems.length > 0) {
      // Fallback to provided items or cart items
      products = (orderData.items || cartState.enrichedItems).map(
        (item: any, index: number) => EventBuilder.formatElevarProduct(item, index)
      );
    }

    // Build Elevar-style ecommerce object with purchase action
    const ecommerce: any = {
      currencyCode: order.currency || currency,
      purchase: {
        actionField: {
          id: orderId,
          order_name: orderId,
          revenue: String(orderTotal),
          tax: String(orderTax),
          shipping: String(orderShipping),
          sub_total: String(orderSubtotal),
          affiliation: 'Online Store'
        },
        products: products
      }
    };

    // Add coupon if present
    const coupon = order.vouchers?.[0]?.code || orderData.coupon ||
                  cartState.appliedCoupons?.[0]?.code;
    if (coupon) {
      ecommerce.purchase.actionField.coupon = coupon;
    }

    // Add discount amount if present
    const discountAmount = order.discount || orderData.discountAmount || 0;
    if (discountAmount) {
      ecommerce.purchase.actionField.discountAmount = String(discountAmount);
    }

    // Clear list attribution after purchase
    EventBuilder.clearListAttribution();

    // Extract user properties from order data if available
    let userProperties = EventBuilder.getUserProperties();
    if (order.user || order.billing_address) {
      // Override with order data which is more reliable at purchase time
      userProperties = {
        ...userProperties,
        visitor_type: order.user ? 'logged_in' : 'guest',
        ...(order.user?.email && { customer_email: order.user.email }),
        ...(order.user?.first_name && { customer_first_name: order.user.first_name }),
        ...(order.user?.last_name && { customer_last_name: order.user.last_name }),
        ...(order.user?.phone_number && { customer_phone: order.user.phone_number }),
        // Use billing address from order
        ...(order.billing_address && {
          customer_first_name: order.billing_address.first_name || order.user?.first_name,
          customer_last_name: order.billing_address.last_name || order.user?.last_name,
          customer_address_1: order.billing_address.line1 || '',
          customer_address_2: order.billing_address.line2 || '',
          customer_city: order.billing_address.line4 || '', // line4 is city in this format
          customer_province: order.billing_address.state || '',
          customer_province_code: order.billing_address.state || '',
          customer_zip: order.billing_address.postcode || '',
          customer_country: order.billing_address.country || '',
          customer_phone: order.billing_address.phone_number || order.user?.phone_number
        })
      };
    }

    return EventBuilder.createEvent('dl_purchase', {
      pageType: 'purchase',
      event_id: orderId,
      user_properties: userProperties,
      ecommerce
    });
  }

  /**
   * Create view_search_results event (Elevar format)
   */
  static createViewSearchResultsEvent(
    items: (CartItem | EnrichedCartLine | any)[],
    searchTerm?: string
  ): DataLayerEvent {
    const currency = EventBuilder.getCurrency();

    // Format items as impressions
    const impressions = items.map((item, index) =>
      EventBuilder.formatElevarImpression(item, index)
    );

    const ecommerce: any = {
      currencyCode: currency,
      actionField: {
        list: 'search results'
      },
      impressions: impressions
    };

    return EventBuilder.createEvent('dl_view_search_results', {
      user_properties: EventBuilder.getUserProperties(),
      ecommerce,
      search_term: searchTerm
    });
  }

  /**
   * Create view_cart event (Elevar format)
   */
  static createViewCartEvent(): DataLayerEvent {
    const cartState = useCartStore.getState();
    const currency = EventBuilder.getCurrency();

    // Format all cart items as impressions with quantity
    const impressions = cartState.enrichedItems.map((item, index) => {
      const impression = EventBuilder.formatElevarImpression(item, index);
      impression.quantity = String(item.quantity || 1);
      return impression;
    });

    const ecommerce: any = {
      currencyCode: currency,
      actionField: {},
      impressions: impressions
    };

    return EventBuilder.createEvent('dl_view_cart', {
      user_properties: EventBuilder.getUserProperties(),
      cart_total: String(cartState.totals.total.value || '0.00'),
      ecommerce
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
      currencyCode: currency, // Add currencyCode for Elevar compatibility
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

  /**
   * Create accepted_upsell event (dl_upsell_purchase format)
   * Fires when user accepts an upsell offer
   * Uses Elevar's dl_upsell_purchase format with full ecommerce.purchase structure
   */
  static createAcceptedUpsellEvent(data: {
    orderId: string;
    packageId: number | string;
    packageName?: string;
    quantity?: number;
    value?: number;
    currency?: string;
    upsellNumber?: number;
    item?: any;
  }): DataLayerEvent {
    const {
      orderId,
      packageId,
      packageName,
      quantity = 1,
      value = 0,
      currency = 'USD',
      upsellNumber = 1,
      item
    } = data;

    // Format upsell order ID with -US suffix (US1, US2, etc.)
    const upsellOrderId = `${orderId}-US${upsellNumber}`;

    // Get campaign store for additional product data
    let campaignStore: any;
    let packageData: any;
    try {
      if (typeof window !== 'undefined') {
        campaignStore = (window as any).campaignStore;
        if (campaignStore) {
          const campaign = campaignStore.getState().data;
          if (campaign?.packages) {
            packageData = campaign.packages.find((p: any) =>
              String(p.ref_id) === String(packageId)
            );
          }
        }
      }
    } catch (error) {
      console.warn('Could not access campaign store for upsell data:', error);
    }

    // Format the upsell item as an Elevar product
    const upsellProduct = item ?
      EventBuilder.formatElevarProduct(item) :
      {
        id: packageData?.product_sku || `SKU-${packageId}`,
        name: packageName || packageData?.product_name || `Package ${packageId}`,
        product_id: String(packageData?.product_id || packageId),
        variant_id: String(packageData?.product_variant_id || packageId),
        price: String(value),
        brand: packageData?.product_name || campaignStore?.getState().data?.name || '',
        category: campaignStore?.getState().data?.name || 'Campaign',
        variant: packageData?.product_variant_name || '',
        quantity: String(quantity)
      };

    // Calculate the additional revenue (just the upsell value, not total order)
    const additionalRevenue = value * quantity;

    // Build Elevar-style ecommerce.purchase structure for upsell
    const ecommerce: any = {
      currencyCode: currency,
      purchase: {
        actionField: {
          id: upsellOrderId,
          order_name: upsellOrderId,
          revenue: String(additionalRevenue), // Additional revenue from upsell only
          tax: "0", // Upsells typically don't show separate tax
          shipping: "0", // No additional shipping for upsells
          sub_total: String(additionalRevenue), // Same as revenue for upsells
          affiliation: 'Upsell'
        },
        products: [upsellProduct]
      }
    };

    // Get user properties to match Elevar standard
    const userProperties = EventBuilder.getUserProperties();

    // Create the dl_upsell_purchase event with _willRedirect flag
    return EventBuilder.createEvent('dl_upsell_purchase', {
      pageType: 'upsell',
      event_id: upsellOrderId,
      user_properties: userProperties,
      ecommerce,
      // Flag for pending events handler to queue this event
      _willRedirect: true,
      // Additional metadata for tracking
      upsell_metadata: {
        original_order_id: orderId,
        upsell_number: upsellNumber,
        package_id: packageId.toString(),
        package_name: packageName || `Package ${packageId}`
      }
    });
  }
}