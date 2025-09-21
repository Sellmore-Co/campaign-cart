/**
 * Main SDK class providing programmatic API access
 * This is the public interface for advanced users who need direct access to SDK functionality
 */

declare global {
  interface Window {
    __NEXT_SDK_VERSION__?: string;
  }
}

import type { 
  CartTotals, 
  Campaign, 
  CallbackType, 
  CallbackData,
  EventMap,
  AppliedCoupon,
  DiscountDefinition
} from '@/types/global';
import type { AddUpsellLine } from '@/types/api';
import { useCartStore } from '@/stores/cartStore';
import { useCampaignStore } from '@/stores/campaignStore';
import { useCheckoutStore } from '@/stores/checkoutStore';
import { useOrderStore } from '@/stores/orderStore';
import { useConfigStore } from '@/stores/configStore';
import { useAttributionStore } from '@/stores/attributionStore';
import { useProfileStore } from '@/stores/profileStore';
import { useParameterStore } from '@/stores/parameterStore';
import { EventBus } from '@/utils/events';
import { Logger } from '@/utils/logger';
import { ApiClient } from '@/api/client';

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

  public async swapCart(items: Array<{ packageId: number; quantity: number }>): Promise<void> {
    const cartStore = useCartStore.getState();
    
    // Use a new method in cartStore if available, or do it manually
    if (typeof cartStore.swapCart === 'function') {
      await cartStore.swapCart(items);
    } else {
      // Fallback: clear and add all items
      await cartStore.clear();
      
      // Add all new items
      for (const item of items) {
        await cartStore.addItem({
          packageId: item.packageId,
          quantity: item.quantity,
          isUpsell: false
        });
      }
    }
    
    this.logger.debug(`Cart swapped with ${items.length} items`);
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

  // Product variant methods
  public getVariantsByProductId(productId: number): any | null {
    const campaignStore = useCampaignStore.getState();
    return campaignStore.getVariantsByProductId(productId);
  }

  public getAvailableVariantAttributes(productId: number, attributeCode: string): string[] {
    const campaignStore = useCampaignStore.getState();
    return campaignStore.getAvailableVariantAttributes(productId, attributeCode);
  }

  public getPackageByVariantSelection(productId: number, selectedAttributes: Record<string, string>): any | null {
    const campaignStore = useCampaignStore.getState();
    return campaignStore.getPackageByVariantSelection(productId, selectedAttributes);
  }

  // Enhanced pricing tier methods
  public getProductVariantsWithPricing(productId: number): any | null {
    const campaignStore = useCampaignStore.getState();
    return campaignStore.getProductVariantsWithPricing(productId);
  }

  public getVariantPricingTiers(productId: number, variantKey: string): any[] {
    const campaignStore = useCampaignStore.getState();
    return campaignStore.getVariantPricingTiers(productId, variantKey);
  }

  public getLowestPriceForVariant(productId: number, variantKey: string): any | null {
    const campaignStore = useCampaignStore.getState();
    return campaignStore.getLowestPriceForVariant(productId, variantKey);
  }

  public createVariantKey(attributes: Record<string, string>): string {
    // Helper method to create consistent variant keys
    return Object.entries(attributes)
      .map(([code, value]) => `${code}:${value}`)
      .sort()
      .join('|');
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

  // Attribution metadata methods
  public addMetadata(key: string, value: any): void {
    try {
      const store = useAttributionStore.getState();
      const currentMetadata = store.metadata || {};
      
      store.updateAttribution({
        metadata: {
          ...currentMetadata,
          [key]: value
        }
      });
      
      this.logger.debug(`Attribution metadata added: ${key}`, value);
    } catch (error) {
      this.logger.error('Failed to add attribution metadata:', error);
    }
  }

  public setMetadata(metadata: Record<string, any>): void {
    try {
      const store = useAttributionStore.getState();
      const currentMetadata = store.metadata || {};
      
      // Merge with existing metadata to preserve automatic fields
      store.updateAttribution({ 
        metadata: {
          ...currentMetadata,
          ...metadata
        }
      });
      
      this.logger.debug('Attribution metadata set:', metadata);
    } catch (error) {
      this.logger.error('Failed to set attribution metadata:', error);
    }
  }

  public clearMetadata(): void {
    try {
      const store = useAttributionStore.getState();
      
      store.updateAttribution({ 
        metadata: {
          // Preserve automatic fields
          landing_page: store.metadata?.landing_page || '',
          referrer: store.metadata?.referrer || '',
          device: store.metadata?.device || '',
          device_type: store.metadata?.device_type || 'desktop',
          domain: store.metadata?.domain || '',
          timestamp: store.metadata?.timestamp || Date.now()
        }
      });
      
      this.logger.debug('Attribution metadata cleared');
    } catch (error) {
      this.logger.error('Failed to clear attribution metadata:', error);
    }
  }

  public getMetadata(): Record<string, any> | undefined {
    try {
      const store = useAttributionStore.getState();
      return store.metadata;
    } catch (error) {
      this.logger.error('Failed to get attribution metadata:', error);
      return undefined;
    }
  }

  public setAttribution(attribution: Record<string, any>): void {
    try {
      const store = useAttributionStore.getState();
      store.updateAttribution(attribution);
      
      this.logger.debug('Attribution set:', attribution);
    } catch (error) {
      this.logger.error('Failed to set attribution:', error);
    }
  }

  public getAttribution(): Record<string, any> | undefined {
    try {
      const store = useAttributionStore.getState();
      return store.getAttributionForApi();
    } catch (error) {
      this.logger.error('Failed to get attribution:', error);
      return undefined;
    }
  }

  public debugAttribution(): void {
    try {
      const store = useAttributionStore.getState();
      store.debug();
    } catch (error) {
      this.logger.error('Failed to debug attribution:', error);
    }
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
  public getVersion(): string {
    // Return the runtime detected version from loader, or fallback to build version
    if (typeof window !== 'undefined' && window.__NEXT_SDK_VERSION__) {
      return window.__NEXT_SDK_VERSION__;
    }
    return '__VERSION__'; // Will be replaced at build time
  }

  public formatPrice(amount: number, currency?: string): string {
    const { formatCurrency } = require('@/utils/currencyFormatter');
    const campaignStore = useCampaignStore.getState();
    const useCurrency = currency ?? campaignStore.data?.currency ?? 'USD';
    
    return formatCurrency(amount, useCurrency);
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
    image?: string;
    template?: string;
    action?: () => void | Promise<void>;
    disableOnMobile?: boolean;
    mobileScrollTrigger?: boolean;
    maxTriggers?: number;
    useSessionStorage?: boolean;
    sessionStorageKey?: string;
    overlayClosable?: boolean;
    showCloseButton?: boolean;
    imageClickable?: boolean;
    actionButtonText?: string;
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

  // Upsell methods
  public async addUpsell(options: {
    packageId?: number;
    quantity?: number;
    items?: Array<{ packageId: number; quantity?: number }>;
  }): Promise<any> {
    const orderStore = useOrderStore.getState();
    const configStore = useConfigStore.getState();
    
    // Check if order exists
    if (!orderStore.order) {
      throw new Error('No order found. Upsells can only be added after order completion.');
    }
    
    // Check if order supports upsells
    if (!orderStore.canAddUpsells()) {
      throw new Error('Order does not support post-purchase upsells or is currently processing.');
    }
    
    // Create API client
    const apiClient = new ApiClient(configStore.apiKey);
    
    // Build upsell data - support both single item and multiple items
    let lines: Array<{ package_id: number; quantity: number }> = [];
    
    if (options.items && options.items.length > 0) {
      // Multiple items provided
      lines = options.items.map(item => ({
        package_id: item.packageId,
        quantity: item.quantity || 1
      }));
    } else if (options.packageId) {
      // Single item provided
      lines = [{
        package_id: options.packageId,
        quantity: options.quantity || 1
      }];
    } else {
      throw new Error('Either packageId or items array must be provided');
    }
    
    const upsellData: AddUpsellLine = { lines };
    
    this.logger.info('Adding upsell(s) via SDK:', upsellData);
    
    try {
      // Store previous line IDs to identify new additions
      const previousLineIds = orderStore.order?.lines?.map((line: any) => line.id) || [];
      
      // Add the upsell(s)
      const updatedOrder = await orderStore.addUpsell(upsellData, apiClient);
      
      if (!updatedOrder) {
        throw new Error('Failed to add upsell - no updated order returned');
      }
      
      // Find all newly added upsell lines
      const addedLines = updatedOrder.lines?.filter((line: any) => 
        line.is_upsell && !previousLineIds.includes(line.id)
      ) || [];
      
      // Calculate total value of added upsells
      const totalUpsellValue = addedLines.reduce((sum: number, line: any) => {
        return sum + (line.price_incl_tax ? parseFloat(line.price_incl_tax) : 0);
      }, 0);
      
      // Emit event for each added item
      lines.forEach((line, index) => {
        const addedLine = addedLines[index];
        const value = addedLine?.price_incl_tax ? parseFloat(addedLine.price_incl_tax) : 0;
        
        this.eventBus.emit('upsell:added', {
          packageId: line.package_id,
          quantity: line.quantity,
          order: updatedOrder,
          value: value
        });
      });
      
      return {
        order: updatedOrder,
        addedLines: addedLines,
        totalValue: totalUpsellValue
      };
    } catch (error) {
      this.logger.error('Failed to add upsell(s) via SDK:', error);
      throw error;
    }
  }

  public canAddUpsells(): boolean {
    const orderStore = useOrderStore.getState();
    return orderStore.canAddUpsells();
  }

  public getCompletedUpsells(): string[] {
    const orderStore = useOrderStore.getState();
    return orderStore.completedUpsells;
  }

  public isUpsellAlreadyAdded(packageId: number): boolean {
    const orderStore = useOrderStore.getState();
    
    // Check in completed upsells
    if (orderStore.completedUpsells.includes(packageId.toString())) {
      return true;
    }
    
    // Also check in upsell journey for accepted items
    const acceptedInJourney = orderStore.upsellJourney.some(
      entry => entry.packageId === packageId.toString() && entry.action === 'accepted'
    );
    
    return acceptedInJourney;
  }
  
  // Profile Management Methods
  public async setProfile(profileId: string, options?: { clearCart?: boolean; preserveQuantities?: boolean }): Promise<void> {
    try {
      const { ProfileManager } = await import('@/core/ProfileManager');
      const profileManager = ProfileManager.getInstance();
      await profileManager.applyProfile(profileId, options);
      this.logger.info(`Profile "${profileId}" applied via API`);
    } catch (error) {
      this.logger.error(`Failed to set profile "${profileId}":`, error);
      throw error;
    }
  }
  
  public async revertProfile(): Promise<void> {
    try {
      const { ProfileManager } = await import('@/core/ProfileManager');
      const profileManager = ProfileManager.getInstance();
      await profileManager.revertProfile();
      this.logger.info('Profile reverted via API');
    } catch (error) {
      this.logger.error('Failed to revert profile:', error);
      throw error;
    }
  }
  
  public getActiveProfile(): string | null {
    const profileStore = useProfileStore.getState();
    return profileStore.activeProfileId;
  }
  
  public getProfileInfo(profileId?: string): any | null {
    const profileStore = useProfileStore.getState();
    return profileId 
      ? profileStore.getProfileById(profileId)
      : profileStore.getActiveProfile();
  }
  
  public getMappedPackageId(originalId: number): number {
    const profileStore = useProfileStore.getState();
    return profileStore.getMappedPackageId(originalId);
  }
  
  public getOriginalPackageId(mappedId: number): number | null {
    const profileStore = useProfileStore.getState();
    return profileStore.getOriginalPackageId(mappedId);
  }
  
  public listProfiles(): string[] {
    const profileStore = useProfileStore.getState();
    return Array.from(profileStore.profiles.keys());
  }
  
  public hasProfile(profileId: string): boolean {
    const profileStore = useProfileStore.getState();
    return profileStore.hasProfile(profileId);
  }
  
  public registerProfile(profile: { id: string; name: string; description?: string; packageMappings: Record<number, number> }): void {
    const profileStore = useProfileStore.getState();
    profileStore.registerProfile(profile);
    this.logger.info(`Profile "${profile.id}" registered via API`);
  }

  // URL Parameter Methods
  public setParam(key: string, value: string): void {
    const paramStore = useParameterStore.getState();
    paramStore.updateParam(key, value);
    this.logger.debug(`URL parameter set: ${key}=${value}`);
  }

  public setParams(params: Record<string, string>): void {
    const paramStore = useParameterStore.getState();
    paramStore.updateParams(params);
    this.logger.debug('URL parameters set:', params);
  }

  public getParam(key: string): string | null {
    const paramStore = useParameterStore.getState();
    const value = paramStore.getParam(key);
    return value !== undefined ? value : null;
  }

  public getAllParams(): Record<string, string> {
    const paramStore = useParameterStore.getState();
    return paramStore.params;
  }

  public hasParam(key: string): boolean {
    const paramStore = useParameterStore.getState();
    return paramStore.hasParam(key);
  }

  public clearParam(key: string): void {
    const paramStore = useParameterStore.getState();
    const newParams = { ...paramStore.params };
    delete newParams[key];
    paramStore.updateParams(newParams);
    this.logger.debug(`URL parameter cleared: ${key}`);
  }

  public clearAllParams(): void {
    const paramStore = useParameterStore.getState();
    paramStore.updateParams({});
    this.logger.debug('All URL parameters cleared');
  }

  public mergeParams(params: Record<string, string>): void {
    const paramStore = useParameterStore.getState();
    paramStore.mergeParams(params);
    this.logger.debug('URL parameters merged:', params);
  }
}