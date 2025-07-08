/**
 * Main SDK class providing programmatic API access
 * This is the public interface for advanced users who need direct access to SDK functionality
 */

import type { 
  CartTotals, 
  Campaign, 
  CallbackType, 
  CallbackData,
  EventMap,
  AppliedCoupon,
  DiscountDefinition
} from '@/types/global';
import { useCartStore } from '@/stores/cartStore';
import { useCampaignStore } from '@/stores/campaignStore';
import { useCheckoutStore } from '@/stores/checkoutStore';
import { EventBus } from '@/utils/events';
import { Logger } from '@/utils/logger';

export class NextCommerce {
  private static instance: NextCommerce;
  private logger: Logger;
  private eventBus: EventBus;
  private callbacks = new Map<CallbackType, Set<Function>>();
  private exitIntentEnhancer: any = null;

  private constructor() {
    this.logger = new Logger('NextCommerce');
    this.eventBus = EventBus.getInstance();
  }

  public static getInstance(): NextCommerce {
    if (!NextCommerce.instance) {
      NextCommerce.instance = new NextCommerce();
    }
    return NextCommerce.instance;
  }

  // Cart manipulation methods
  public hasItemInCart(options: { packageId?: number }): boolean {
    const cartStore = useCartStore.getState();
    
    if (options.packageId) {
      return cartStore.items.some(item => item.packageId === options.packageId);
    }
    
    return false;
  }

  public async addItem(options: { 
    packageId?: number; 
    quantity?: number; 
  }): Promise<void> {
    const cartStore = useCartStore.getState();
    const quantity = options.quantity ?? 1;
    
    if (options.packageId) {
      await cartStore.addItem({
        packageId: options.packageId,
        quantity,
        isUpsell: false
      });
    }
  }

  public async removeItem(options: { packageId?: number }): Promise<void> {
    const cartStore = useCartStore.getState();
    
    if (options.packageId) {
      await cartStore.removeItem(options.packageId);
    }
  }

  public async updateQuantity(options: {
    packageId?: number;
    quantity: number;
  }): Promise<void> {
    const cartStore = useCartStore.getState();
    
    if (options.packageId) {
      await cartStore.updateQuantity(options.packageId, options.quantity);
    }
  }

  public async clearCart(): Promise<void> {
    const cartStore = useCartStore.getState();
    await cartStore.clear();
  }

  // Cart data access
  public getCartData(): CallbackData {
    const cartStore = useCartStore.getState();
    const campaignStore = useCampaignStore.getState();
    
    return {
      cartLines: cartStore.enrichedItems,
      cartTotals: cartStore.totals,
      campaignData: campaignStore.data,
      appliedCoupons: cartStore.getCoupons(),
    };
  }

  public getCartTotals(): CartTotals {
    const cartStore = useCartStore.getState();
    return cartStore.totals;
  }

  public getCartCount(): number {
    const cartStore = useCartStore.getState();
    return cartStore.totalQuantity;
  }


  // Campaign data access
  public getCampaignData(): Campaign | null {
    const campaignStore = useCampaignStore.getState();
    return campaignStore.data;
  }

  public getPackage(id: number): any | null {
    const campaignStore = useCampaignStore.getState();
    return campaignStore.getPackage(id);
  }

  // Event and callback registration
  public on<K extends keyof EventMap>(event: K, handler: (data: EventMap[K]) => void): void {
    this.eventBus.on(event, handler);
  }

  public off<K extends keyof EventMap>(event: K, handler: Function): void {
    this.eventBus.off(event, handler);
  }

  public registerCallback(type: CallbackType, callback: (data: CallbackData) => void): void {
    if (!this.callbacks.has(type)) {
      this.callbacks.set(type, new Set());
    }
    this.callbacks.get(type)!.add(callback);
  }

  public unregisterCallback(type: CallbackType, callback: Function): void {
    this.callbacks.get(type)?.delete(callback);
  }

  public triggerCallback(type: CallbackType, data: CallbackData): void {
    this.callbacks.get(type)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        this.logger.error(`Callback error for ${type}:`, error);
      }
    });
  }

  // Analytics methods (v2 system)
  public async trackViewItemList(packageIds: (string | number)[], _listId?: string, listName?: string): Promise<void> {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics } = await import('@/utils/analytics/index');
        nextAnalytics.trackViewItemList(packageIds, listName);
      } catch (error) {
        this.logger.debug('Analytics tracking failed (non-critical):', error);
      }
    });
  }

  public async trackViewItem(packageId: string | number): Promise<void> {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics } = await import('@/utils/analytics/index');
        nextAnalytics.trackViewItem(packageId);
      } catch (error) {
        this.logger.debug('Analytics tracking failed (non-critical):', error);
      }
    });
  }

  public async trackAddToCart(packageId: string | number, quantity?: number): Promise<void> {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics } = await import('@/utils/analytics/index');
        // Create a minimal item object for tracking
        const item = {
          id: String(packageId),
          packageId: packageId,
          quantity: quantity || 1
        };
        nextAnalytics.trackAddToCart(item);
      } catch (error) {
        this.logger.debug('Analytics tracking failed (non-critical):', error);
      }
    });
  }

  public async trackRemoveFromCart(packageId: string | number, quantity?: number): Promise<void> {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics, EcommerceEvents } = await import('@/utils/analytics/index');
        nextAnalytics.track(EcommerceEvents.createRemoveFromCartEvent({ packageId, quantity: quantity || 1 }));
      } catch (error) {
        this.logger.debug('Analytics tracking failed (non-critical):', error);
      }
    });
  }

  public async trackBeginCheckout(): Promise<void> {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics } = await import('@/utils/analytics/index');
        nextAnalytics.trackBeginCheckout();
      } catch (error) {
        this.logger.debug('Analytics tracking failed (non-critical):', error);
      }
    });
  }

  public async trackPurchase(orderData: any): Promise<void> {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics } = await import('@/utils/analytics/index');
        nextAnalytics.trackPurchase(orderData);
      } catch (error) {
        this.logger.debug('Analytics tracking failed (non-critical):', error);
      }
    });
  }

  public async trackCustomEvent(eventName: string, data?: Record<string, any>): Promise<void> {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics } = await import('@/utils/analytics/index');
        nextAnalytics.track({ event: eventName, ...data });
      } catch (error) {
        this.logger.debug('Analytics tracking failed (non-critical):', error);
      }
    });
  }

  // User tracking methods
  public async trackSignUp(email: string): Promise<void> {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics } = await import('@/utils/analytics/index');
        nextAnalytics.trackSignUp(email);
      } catch (error) {
        this.logger.debug('Analytics tracking failed (non-critical):', error);
      }
    });
  }

  public async trackLogin(email: string): Promise<void> {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics } = await import('@/utils/analytics/index');
        nextAnalytics.trackLogin(email);
      } catch (error) {
        this.logger.debug('Analytics tracking failed (non-critical):', error);
      }
    });
  }

  // Advanced analytics methods
  public async setDebugMode(enabled: boolean): Promise<void> {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics } = await import('@/utils/analytics/index');
        nextAnalytics.setDebugMode(enabled);
      } catch (error) {
        this.logger.debug('Analytics debug mode failed (non-critical):', error);
      }
    });
  }

  public async invalidateAnalyticsContext(): Promise<void> {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics } = await import('@/utils/analytics/index');
        nextAnalytics.invalidateContext();
      } catch (error) {
        this.logger.debug('Analytics context invalidation failed (non-critical):', error);
      }
    });
  }

  // Shipping methods
  public getShippingMethods(): Array<{ref_id: number; code: string; price: string}> {
    const campaignStore = useCampaignStore.getState();
    return campaignStore.data?.shipping_methods || [];
  }

  public getSelectedShippingMethod(): {id: number; name: string; price: number; code: string} | null {
    const checkoutStore = useCheckoutStore.getState();
    return checkoutStore.shippingMethod || null;
  }

  public async setShippingMethod(methodId: number): Promise<void> {
    // Delegate to cart store which handles validation and syncing
    const cartStore = useCartStore.getState();
    await cartStore.setShippingMethod(methodId);
  }

  // Utility methods
  public formatPrice(amount: number, currency?: string): string {
    const campaignStore = useCampaignStore.getState();
    const useCurrency = currency ?? campaignStore.data?.currency ?? 'USD';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: useCurrency,
    }).format(amount);
  }

  public validateCheckout(): { valid: boolean; errors: string[] } {
    const cartStore = useCartStore.getState();
    const errors: string[] = [];
    
    if (cartStore.items.length === 0) {
      errors.push('Cart is empty');
    }
    
    // Add more validation logic as needed
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Coupon methods
  public async applyCoupon(code: string): Promise<{ success: boolean; message: string }> {
    const cartStore = useCartStore.getState();
    return await cartStore.applyCoupon(code);
  }

  public removeCoupon(code: string): void {
    const cartStore = useCartStore.getState();
    cartStore.removeCoupon(code);
  }

  public getCoupons(): AppliedCoupon[] {
    const cartStore = useCartStore.getState();
    return cartStore.getCoupons();
  }

  public validateCoupon(code: string): { valid: boolean; message?: string } {
    const cartStore = useCartStore.getState();
    return cartStore.validateCoupon(code);
  }

  public calculateDiscountAmount(coupon: DiscountDefinition): number {
    const cartStore = useCartStore.getState();
    return cartStore.calculateDiscountAmount(coupon);
  }

  // Exit Intent - Simple approach
  public async exitIntent(options: {
    image: string;
    action?: () => void | Promise<void>;
  }): Promise<void> {
    try {
      // Lazy load the enhancer
      if (!this.exitIntentEnhancer) {
        const { ExitIntentEnhancer } = await import('@/enhancers/behavior/SimpleExitIntentEnhancer');
        this.exitIntentEnhancer = new ExitIntentEnhancer();
        await this.exitIntentEnhancer.initialize();
      }

      // Set up exit intent with simple config
      this.exitIntentEnhancer.setup(options);
      this.logger.debug('Exit intent configured with image:', options.image);
    } catch (error) {
      this.logger.error('Failed to setup exit intent:', error);
      throw error;
    }
  }

  public disableExitIntent(): void {
    if (this.exitIntentEnhancer) {
      this.exitIntentEnhancer.disable();
    }
  }

  // FOMO Popup - Simple social proof
  private fomoEnhancer: any = null;

  public async fomo(config?: {
    items?: Array<{ text: string; image: string }>;
    customers?: { [country: string]: string[] };
    maxMobileShows?: number;
    displayDuration?: number;
    delayBetween?: number;
    initialDelay?: number;
  }): Promise<void> {
    try {
      // Lazy load the enhancer
      if (!this.fomoEnhancer) {
        const { FomoPopupEnhancer } = await import('@/enhancers/behavior/FomoPopupEnhancer');
        this.fomoEnhancer = new FomoPopupEnhancer();
        await this.fomoEnhancer.initialize();
      }

      // Configure and start
      this.fomoEnhancer.setup(config);
      this.fomoEnhancer.start();
      this.logger.debug('FOMO popup started');
    } catch (error) {
      this.logger.error('Failed to start FOMO popup:', error);
      throw error;
    }
  }

  public stopFomo(): void {
    if (this.fomoEnhancer) {
      this.fomoEnhancer.stop();
    }
  }
}