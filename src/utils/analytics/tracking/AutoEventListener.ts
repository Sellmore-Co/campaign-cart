/**
 * AutoEventListener - Listens to EventBus and maps internal events to data layer events
 * Handles cart events, upsell events, and other SDK events
 */

import { createLogger } from '@/utils/logger';
import { EventBus } from '@/utils/events';
import { useCampaignStore } from '@/stores/campaignStore';
import { useCartStore } from '@/stores/cartStore';
import { dataLayer } from '../DataLayerManager';
import { listAttributionTracker } from './ListAttributionTracker';

const logger = createLogger('AutoEventListener');

interface EventDebounceConfig {
  [eventName: string]: number; // milliseconds
}

export class AutoEventListener {
  private static instance: AutoEventListener;
  private eventBus = EventBus.getInstance();
  private isInitialized = false;
  private eventHandlers: Map<string, Function> = new Map();
  private lastEventTimes: Map<string, number> = new Map();
  
  // Debounce configuration for different events
  private debounceConfig: EventDebounceConfig = {
    'cart:item-added': 1000,
    'cart:item-removed': 500,
    'cart:quantity-changed': 500,
    'cart:updated': 1000
  };

  private constructor() {}

  public static getInstance(): AutoEventListener {
    if (!AutoEventListener.instance) {
      AutoEventListener.instance = new AutoEventListener();
    }
    return AutoEventListener.instance;
  }

  /**
   * Initialize the auto event listener
   */
  public initialize(): void {
    if (this.isInitialized) {
      return;
    }

    this.isInitialized = true;
    dataLayer.initialize();

    // Set up event listeners
    this.setupCartEventListeners();
    this.setupUpsellEventListeners();
    this.setupCheckoutEventListeners();
    this.setupPageEventListeners();

    logger.info('AutoEventListener initialized');
  }

  /**
   * Check if event should be processed based on debounce
   */
  private shouldProcessEvent(eventName: string): boolean {
    const now = Date.now();
    const lastTime = this.lastEventTimes.get(eventName) || 0;
    const debounceTime = this.debounceConfig[eventName] || 0;

    if (now - lastTime < debounceTime) {
      logger.debug(`Event ${eventName} debounced`);
      return false;
    }

    this.lastEventTimes.set(eventName, now);
    return true;
  }

  /**
   * Set up cart event listeners
   */
  private setupCartEventListeners(): void {
    // Add to cart
    const handleAddToCart = async (data: any) => {
      if (!this.shouldProcessEvent('cart:item-added')) {
        return;
      }

      const packageId = data.packageId;
      const quantity = data.quantity || 1;
      
      const campaignStore = useCampaignStore.getState();
      const packageData = campaignStore.getPackage(packageId);
      
      if (!packageData) {
        logger.warn('Package not found for add to cart:', packageId);
        return;
      }

      // Get list attribution
      const listContext = listAttributionTracker.getCurrentList();

      const item = {
        item_id: packageData.external_id.toString(), // Use external_id for analytics
        item_name: packageData.name || `Package ${packageId}`,
        currency: campaignStore.data?.currency || 'USD',
        price: parseFloat(packageData.price_total || '0'), // Use total package price
        quantity: 1, // Always 1 for package-based pricing
        item_category: 'uncategorized',
        item_variant: undefined,
        ...(listContext && {
          item_list_id: listContext.listId,
          item_list_name: listContext.listName
        })
      };

      const event = dataLayer.formatEcommerceEvent('dl_add_to_cart', {
        currency: item.currency,
        value: item.price * quantity, // Total value for all packages
        items: [item]
      });

      // Check if this will redirect
      if (data.willRedirect) {
        // The DataLayerManager will handle queuing
        event._willRedirect = true;
      }
      
      dataLayer.push(event);
      logger.debug('Tracked add to cart:', packageId);
    };

    this.eventBus.on('cart:item-added', handleAddToCart);
    this.eventHandlers.set('cart:item-added', handleAddToCart);

    // Remove from cart
    const handleRemoveFromCart = async (data: any) => {
      if (!this.shouldProcessEvent('cart:item-removed')) {
        return;
      }

      const packageId = data.packageId;
      const quantity = data.quantity || 1;
      
      const campaignStore = useCampaignStore.getState();
      const packageData = campaignStore.getPackage(packageId);
      
      if (!packageData) {
        logger.warn('Package not found for remove from cart:', packageId);
        return;
      }

      const item = {
        item_id: packageData.external_id.toString(), // Use external_id for analytics
        item_name: packageData.name || `Package ${packageId}`,
        currency: campaignStore.data?.currency || 'USD',
        price: parseFloat(packageData.price_total || '0'), // Use total package price
        quantity: 1, // Always 1 for package-based pricing
        item_category: 'uncategorized',
        item_variant: undefined
      };

      const event = dataLayer.formatEcommerceEvent('dl_remove_from_cart', {
        currency: item.currency,
        value: item.price * quantity,
        items: [item]
      });

      dataLayer.push(event);
      logger.debug('Tracked remove from cart:', packageId);
    };

    this.eventBus.on('cart:item-removed', handleRemoveFromCart);
    this.eventHandlers.set('cart:item-removed', handleRemoveFromCart);

    // Cart updated (generic cart change)
    const handleCartUpdated = async () => {
      if (!this.shouldProcessEvent('cart:updated')) {
        return;
      }

      // Push a custom event for cart updates
      dataLayer.push({
        event: 'dl_cart_updated',
        cart: this.getCartData()
      });
    };

    this.eventBus.on('cart:updated', handleCartUpdated);
    this.eventHandlers.set('cart:updated', handleCartUpdated);
  }

  /**
   * Set up upsell event listeners
   */
  private setupUpsellEventListeners(): void {
    // Upsell viewed
    const handleUpsellViewed = async (data: any) => {
      const orderId = data.orderId;
      const pagePath = data.pagePath;
      
      // For page-level upsell views, we don't have a specific package ID
      // We'll track this as a general upsell page view
      if (!data.packageId) {
        dataLayer.push({
          event: 'dl_viewed_upsell',
          order_id: orderId,
          page_path: pagePath,
          // Generic upsell data when no specific package
          upsell: {
            package_id: 'page_view',
            package_name: 'Upsell Page View',
            currency: useCampaignStore.getState().data?.currency || 'USD'
          }
        });
        
        logger.info('Tracked upsell page view:', pagePath);
        return;
      }
      
      // Specific package view
      const packageId = data.packageId;
      const campaignStore = useCampaignStore.getState();
      const packageData = campaignStore.getPackage(packageId);
      
      if (!packageData) {
        logger.warn('Package not found for upsell view:', packageId);
        return;
      }

      dataLayer.push({
        event: 'dl_viewed_upsell',
        order_id: orderId,
        upsell: {
          package_id: packageId.toString(),
          package_name: packageData.name || `Package ${packageId}`,
          price: parseFloat(packageData.price || '0'),
          currency: campaignStore.data?.currency || 'USD'
        }
      });

      logger.info('Tracked upsell view:', packageId);
    };

    this.eventBus.on('upsell:viewed', handleUpsellViewed);
    this.eventHandlers.set('upsell:viewed', handleUpsellViewed);

    // Upsell accepted
    const handleUpsellAccepted = async (data: any) => {
      const packageId = data.packageId;
      const quantity = data.quantity || 1;
      const orderId = data.orderId || data.order?.ref_id;
      
      // Calculate value
      let value = data.value;
      if (value === undefined) {
        const campaignStore = useCampaignStore.getState();
        const packageData = campaignStore.getPackage(packageId);
        if (packageData?.price) {
          value = parseFloat(packageData.price) * quantity;
        }
      }

      const acceptedUpsellEvent = {
        event: 'dl_accepted_upsell',
        order_id: orderId,
        upsell: {
          package_id: packageId.toString(),
          package_name: data.packageName || `Package ${packageId}`,
          quantity: quantity,
          value: value || 0,
          currency: data.currency || 'USD'
        }
      };
      
      // Mark for queueing if will redirect
      logger.debug('Upsell accepted event data:', { willRedirect: data.willRedirect, data });
      if (data.willRedirect) {
        (acceptedUpsellEvent as any)._willRedirect = true;
        logger.debug('Marked upsell event for queueing due to redirect');
      }
      
      dataLayer.push(acceptedUpsellEvent);
      logger.info('Tracked upsell accepted:', packageId);
    };

    this.eventBus.on('upsell:accepted', handleUpsellAccepted);
    this.eventBus.on('upsell:added', handleUpsellAccepted);
    this.eventHandlers.set('upsell:accepted', handleUpsellAccepted);
    this.eventHandlers.set('upsell:added', handleUpsellAccepted);

    // Upsell skipped
    const handleUpsellSkipped = async (data: any) => {
      dataLayer.push({
        event: 'dl_skipped_upsell',
        order_id: data.orderId,
        upsell: {
          package_id: data.packageId?.toString() || 'unknown',
          package_name: data.packageName || 'Unknown Package'
        }
      });

      logger.info('Tracked upsell skipped:', data.packageId);
    };

    this.eventBus.on('upsell:skipped', handleUpsellSkipped);
    this.eventHandlers.set('upsell:skipped', handleUpsellSkipped);
  }

  /**
   * Set up checkout event listeners
   */
  private setupCheckoutEventListeners(): void {
    // Checkout started
    const handleCheckoutStarted = async (data: any) => {
      const cartStore = useCartStore.getState();
      const campaignStore = useCampaignStore.getState();
      
      const items = cartStore.items.map((item, index) => {
        const packageData = campaignStore.getPackage(item.packageId);
        return {
          item_id: packageData?.external_id?.toString() || item.packageId.toString(), // Use external_id for analytics
          item_name: packageData?.name || `Package ${item.packageId}`,
          currency: campaignStore.data?.currency || 'USD',
          price: parseFloat(packageData?.price_total || '0'), // Use total package price
          quantity: item.quantity, // This is the number of packages in cart
          item_category: campaignStore.data?.name || 'uncategorized',
          item_variant: undefined,
          index: index
        };
      });

      const event = dataLayer.formatEcommerceEvent('dl_begin_checkout', {
        currency: campaignStore.data?.currency || 'USD',
        value: cartStore.total || cartStore.subtotal || 0,
        items: items,
        coupon: data.coupon
      });

      dataLayer.push(event);
      logger.info('Tracked checkout started');
    };

    this.eventBus.on('checkout:started', handleCheckoutStarted);
    this.eventHandlers.set('checkout:started', handleCheckoutStarted);

    // Express checkout started
    const handleExpressCheckoutStarted = async (data: any) => {
      const cartStore = useCartStore.getState();
      const campaignStore = useCampaignStore.getState();
      
      const items = cartStore.items.map((item, index) => {
        const packageData = campaignStore.getPackage(item.packageId);
        return {
          item_id: packageData?.external_id?.toString() || item.packageId.toString(),
          item_name: packageData?.name || `Package ${item.packageId}`,
          currency: campaignStore.data?.currency || 'USD',
          price: parseFloat(packageData?.price_total || '0'),
          quantity: item.quantity,
          item_category: campaignStore.data?.name || 'uncategorized',
          item_variant: undefined,
          index: index
        };
      });

      const event = dataLayer.formatEcommerceEvent('dl_begin_checkout', {
        currency: campaignStore.data?.currency || 'USD',
        value: cartStore.total || cartStore.subtotal || 0,
        items: items,
        coupon: cartStore.appliedCoupons?.[0]?.code,
        payment_type: data.method || 'express'
      });

      dataLayer.push(event);
      logger.info('Tracked express checkout started', { method: data.method });
    };

    this.eventBus.on('express-checkout:started', handleExpressCheckoutStarted);
    this.eventHandlers.set('express-checkout:started', handleExpressCheckoutStarted);

    // Order completed
    const handleOrderCompleted = async (order: any) => {
      // The data passed is the order object itself
      const orderId = order.ref_id || order.number || order.order_id || order.transaction_id;
      const total = parseFloat(order.total_incl_tax || order.total || '0');
      
      // Get items from order lines
      let items = [];
      if (order.lines && Array.isArray(order.lines)) {
        const campaignStore = useCampaignStore.getState();
        items = order.lines.map((line: any, index: number) => ({
          item_id: line.product_sku || line.id?.toString() || `line_${index}`,
          item_name: line.product_title || line.product_description || `Item ${line.id}`,
          currency: order.currency || 'USD',
          price: parseFloat(line.price_incl_tax || line.price || '0'),
          quantity: parseInt(line.quantity?.toString() || '1'),
          item_category: campaignStore.data?.name || 'uncategorized',
          item_variant: line.variant_title,
          discount: parseFloat(line.price_incl_tax_excl_discounts || '0') - parseFloat(line.price_incl_tax || '0'),
          index: index
        }));
      } else {
        // Fallback to cart store
        const cartStore = useCartStore.getState();
        const campaignStore = useCampaignStore.getState();
        
        items = cartStore.items.map((item, index) => {
          const packageData = campaignStore.getPackage(item.packageId);
          return {
            item_id: packageData?.external_id?.toString() || item.packageId.toString(), // Use external_id for analytics
            item_name: packageData?.name || `Package ${item.packageId}`,
            currency: campaignStore.data?.currency || 'USD',
            price: parseFloat(packageData?.price_total || '0'), // Use total package price
            quantity: item.quantity, // This is the number of packages in cart
            item_category: campaignStore.data?.name || 'uncategorized',
            index: index
          };
        });
      }

      const purchaseData = {
        transaction_id: orderId,
        order_number: order.number, // Add the actual order number
        currency: order.currency || 'USD',
        value: total || 0,
        items: items,
        coupon: order.discounts?.[0]?.code || order.coupon_code || order.coupon,
        shipping: parseFloat(order.shipping_incl_tax || order.shipping || '0'),
        tax: parseFloat(order.total_tax || order.tax || '0')
      };

      const event = dataLayer.formatEcommerceEvent('dl_purchase', purchaseData);
      
      // Purchase events ALWAYS redirect to confirmation/upsell pages
      (event as any)._willRedirect = true;
      logger.debug('Marked purchase event for queueing with _willRedirect = true');

      dataLayer.push(event);
      logger.info('Tracked purchase:', orderId);
    };

    this.eventBus.on('order:completed', handleOrderCompleted);
    this.eventHandlers.set('order:completed', handleOrderCompleted);
  }

  /**
   * Set up page event listeners
   */
  private setupPageEventListeners(): void {
    // Page view
    const handlePageView = async (data: any) => {
      dataLayer.push({
        event: 'dl_page_view',
        page: {
          title: data.title || document.title,
          url: data.url || window.location.href,
          path: data.path || window.location.pathname,
          referrer: document.referrer
        }
      });
    };

    (this.eventBus as any).on('page:viewed', handlePageView);
    this.eventHandlers.set('page:viewed', handlePageView);

    // Route changed
    const handleRouteChanged = async (data: any) => {
      dataLayer.push({
        event: 'dl_route_changed',
        route: {
          from: data.from,
          to: data.to,
          path: data.path || window.location.pathname
        }
      });
    };

    (this.eventBus as any).on('route:changed', handleRouteChanged);
    this.eventHandlers.set('route:changed', handleRouteChanged);
  }

  /**
   * Get current cart data
   */
  private getCartData(): any {
    try {
      const cartStore = useCartStore.getState();
      const campaignStore = useCampaignStore.getState();
      
      return {
        total_value: cartStore.total || cartStore.subtotal || 0,
        total_items: cartStore.totalQuantity || 0,
        currency: campaignStore.data?.currency || 'USD',
        items: cartStore.items.map(item => ({
          package_id: item.packageId,
          quantity: item.quantity,
          price: campaignStore.getPackage(item.packageId)?.price || 0
        }))
      };
    } catch (error) {
      logger.error('Error getting cart data:', error);
      return null;
    }
  }

  /**
   * Reset the auto event listener (called by NextAnalytics)
   */
  public reset(): void {
    // Clear debounce timers but keep listeners active
    this.lastEventTimes.clear();
    logger.debug('AutoEventListener reset');
  }

  /**
   * Clean up the auto event listener
   */
  public destroy(): void {
    // Remove all event listeners
    this.eventHandlers.forEach((handler, eventName) => {
      this.eventBus.off(eventName as any, handler);
    });
    this.eventHandlers.clear();
    this.lastEventTimes.clear();
    
    this.isInitialized = false;
    logger.debug('AutoEventListener destroyed');
  }

  /**
   * Get listener status
   */
  public getStatus(): {
    initialized: boolean;
    listenersCount: number;
    debounceConfig: EventDebounceConfig;
  } {
    return {
      initialized: this.isInitialized,
      listenersCount: this.eventHandlers.size,
      debounceConfig: { ...this.debounceConfig }
    };
  }

  /**
   * Update debounce configuration
   */
  public setDebounceConfig(config: Partial<EventDebounceConfig>): void {
    Object.assign(this.debounceConfig, config);
    logger.debug('Updated debounce config:', this.debounceConfig);
  }
}

// Export singleton instance
export const autoEventListener = AutoEventListener.getInstance();