/**
 * Next Analytics v2 - Clean, Elevar-inspired analytics system
 * 
 * This is the main entry point for the analytics system.
 * It provides a simple API for tracking events following industry best practices.
 */

import { dataLayer } from './DataLayerManager';
import { GTMAdapter } from './providers/GTMAdapter';
import { FacebookAdapter } from './providers/FacebookAdapter';
import { RudderStackAdapter } from './providers/RudderStackAdapter';
import { NextCampaignAdapter } from './providers/NextCampaignAdapter';
import { CustomAdapter } from './providers/CustomAdapter';
import { ListAttributionTracker } from './tracking/ListAttributionTracker';
import { ViewItemListTracker } from './tracking/ViewItemListTracker';
import { UserDataTracker } from './tracking/UserDataTracker';
import { AutoEventListener } from './tracking/AutoEventListener';
import { PendingEventsHandler } from './tracking/PendingEventsHandler';
import { EventValidator } from './validation/EventValidator';
import { EcommerceEvents } from './events/EcommerceEvents';
import { UserEvents } from './events/UserEvents';
import { createLogger } from '@/utils/logger';
import { useConfigStore } from '@/stores/configStore';
import type { DataLayerEvent } from './types';
import type { CartItem, EnrichedCartLine } from '@/types/global';

const logger = createLogger('NextAnalytics');

export class NextAnalytics {
  private static instance: NextAnalytics;
  private initialized = false;
  private providers: Map<string, any> = new Map();
  private validator = new EventValidator();
  private listTracker = ListAttributionTracker.getInstance();
  private viewTracker = ViewItemListTracker.getInstance();
  private userTracker = UserDataTracker.getInstance();
  private autoListener = AutoEventListener.getInstance();

  private constructor() {
    // Set up global transform function support
    if (typeof window !== 'undefined') {
      (window as any).NextDataLayerTransformFn = null;
      // Check and set ignore flag on initialization
      this.checkAndSetIgnoreFlag();
    }
  }

  public static getInstance(): NextAnalytics {
    if (!NextAnalytics.instance) {
      NextAnalytics.instance = new NextAnalytics();
    }
    return NextAnalytics.instance;
  }

  /**
   * Check URL for ignore parameter and set session storage flag
   */
  private checkAndSetIgnoreFlag(): void {
    if (typeof window === 'undefined') return;

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const ignoreParam = urlParams.get('ignore');
      
      if (ignoreParam === 'true') {
        // Set session storage flag
        sessionStorage.setItem('analytics_ignore', 'true');
        logger.info('Analytics ignore flag set from URL parameter');
      }
    } catch (error) {
      logger.error('Error checking ignore parameter:', error);
    }
  }

  /**
   * Check if analytics should be ignored
   */
  private shouldIgnoreAnalytics(): boolean {
    if (typeof window === 'undefined') return false;

    try {
      // Check session storage first
      const sessionIgnore = sessionStorage.getItem('analytics_ignore');
      if (sessionIgnore === 'true') {
        return true;
      }

      // Also check current URL in case it was just set
      const urlParams = new URLSearchParams(window.location.search);
      const ignoreParam = urlParams.get('ignore');
      return ignoreParam === 'true';
    } catch (error) {
      logger.error('Error checking ignore status:', error);
      return false;
    }
  }

  /**
   * Check if analytics is initialized
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Initialize the analytics system
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      logger.debug('Analytics already initialized');
      return;
    }

    // Check for ignore parameter in URL or session storage
    if (this.shouldIgnoreAnalytics()) {
      logger.info('Analytics ignored due to ignore parameter');
      return;
    }

    try {
      const config = useConfigStore.getState();
      
      // Check if analytics is enabled
      if (!config.analytics?.enabled) {
        logger.info('Analytics disabled in configuration');
        return;
      }

      // Initialize data layer
      dataLayer.initialize();

      // Set debug mode from config
      if (config.analytics.debug) {
        dataLayer.setDebugMode(true);
      }

      // Initialize providers based on configuration FIRST
      await this.initializeProviders(config.analytics, config.storeName);

      // CRITICAL: Fire dl_user_data FIRST, before any other tracking
      // This must happen before any other events
      if (config.analytics.mode === 'auto') {
        // Initialize UserDataTracker first and wait for it to fire
        this.userTracker.initialize();

        // Wait a moment to ensure dl_user_data is processed
        await new Promise(resolve => setTimeout(resolve, 100));

        // Now initialize other trackers (they may fire view/list events)
        this.listTracker.initialize();
        this.viewTracker.initialize();
        this.autoListener.initialize();

        logger.info('Auto-tracking initialized (user data fired first)');
      }

      // Process any pending events from previous page AFTER everything is initialized
      // Adding delay to ensure all initial events are processed first
      setTimeout(() => {
        PendingEventsHandler.getInstance().processPendingEvents();
      }, 200);

      this.initialized = true;
      logger.info('NextAnalytics initialized successfully', {
        providers: Array.from(this.providers.keys()),
        mode: config.analytics.mode
      });
    } catch (error) {
      logger.error('Failed to initialize analytics:', error);
      throw error;
    }
  }

  /**
   * Initialize analytics providers
   */
  private async initializeProviders(config: any, storeName?: string): Promise<void> {
    // NextCampaign Adapter (29Next's own analytics)
    if (config.providers?.nextCampaign?.enabled) {
      const nextCampaignAdapter = new NextCampaignAdapter();
      await nextCampaignAdapter.initialize();
      this.providers.set('nextCampaign', nextCampaignAdapter);
      dataLayer.addProvider(nextCampaignAdapter);
      logger.info('NextCampaign adapter initialized');
    }

    // GTM Adapter
    if (config.providers?.gtm?.enabled) {
      const gtmAdapter = new GTMAdapter();
      this.providers.set('gtm', gtmAdapter);
      dataLayer.addProvider(gtmAdapter);
      logger.info('GTM adapter initialized');
    }

    // Facebook Pixel Adapter
    if (config.providers?.facebook?.enabled && config.providers.facebook.settings?.pixelId) {
      const fbConfig = {
        ...config.providers.facebook,
        storeName: storeName  // Pass storeName from root config
      };
      const fbAdapter = new FacebookAdapter(fbConfig);
      this.providers.set('facebook', fbAdapter);
      dataLayer.addProvider(fbAdapter);
      logger.info('Facebook Pixel adapter initialized', {
        blockedEvents: config.providers.facebook.blockedEvents || [],
        storeName: storeName
      });

      // DO NOT process historical events - this causes duplicates
      // Events will be tracked properly as they occur
    }

    // RudderStack Adapter
    if (config.providers?.rudderstack?.enabled) {
      const rudderAdapter = new RudderStackAdapter();
      this.providers.set('rudderstack', rudderAdapter);
      dataLayer.addProvider(rudderAdapter);
      logger.info('RudderStack adapter initialized');
    }

    // Custom Adapter
    if (config.providers?.custom?.enabled && config.providers.custom.settings?.endpoint) {
      const customAdapter = new CustomAdapter(config.providers.custom.settings);
      this.providers.set('custom', customAdapter);
      dataLayer.addProvider(customAdapter);
      logger.info('Custom adapter initialized');
    }
  }

  /**
   * Initialize automatic tracking features
   * NOTE: This method is no longer used - tracking is initialized inline
   * in the initialize() method to ensure proper ordering
   */
  private initializeAutoTracking(): void {
    // Deprecated - see initialize() method for current implementation
    logger.warn('initializeAutoTracking called but is deprecated');
  }

  /**
   * Track an event
   */
  public track(event: DataLayerEvent): void {
    // Skip tracking if analytics should be ignored
    if (this.shouldIgnoreAnalytics()) {
      logger.debug('Event tracking skipped due to ignore flag:', event.event);
      return;
    }

    if (!this.initialized) {
      logger.warn('Analytics not initialized, queuing event:', event.event);
      // Events will be queued in DataLayerManager
    }

    // Validate event if in debug mode
    if (dataLayer.isDebugMode()) {
      const validation = this.validator.validateEvent(event);
      if (!validation.valid) {
        logger.error('Event validation failed:', validation.errors);
        if (validation.warnings.length > 0) {
          logger.warn('Event validation warnings:', validation.warnings);
        }
      }
    }

    // Push to data layer
    dataLayer.push(event);
  }

  /**
   * Enable/disable debug mode
   */
  public setDebugMode(enabled: boolean): void {
    dataLayer.setDebugMode(enabled);
    logger.info(`Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Set transform function for events
   */
  public setTransformFunction(fn: (event: DataLayerEvent) => DataLayerEvent | null): void {
    dataLayer.setTransformFunction(fn);
  }

  /**
   * Handle route changes (for SPAs)
   */
  public invalidateContext(): void {
    dataLayer.invalidateContext();

    // Call Elevar's invalidate context if available
    if (typeof window !== 'undefined' && window.ElevarInvalidateContext) {
      window.ElevarInvalidateContext();
      logger.debug('Called ElevarInvalidateContext');
    }

    // Reset trackers
    this.viewTracker.reset();
    // Track new user data
    this.track(UserEvents.createUserDataEvent('dl_user_data'));
  }

  /**
   * Get analytics status
   */
  public getStatus(): any {
    return {
      initialized: this.initialized,
      debugMode: dataLayer.isDebugMode(),
      providers: Array.from(this.providers.keys()),
      eventsTracked: dataLayer.getEventCount(),
      ignored: this.shouldIgnoreAnalytics()
    };
  }

  /**
   * Clear the analytics ignore flag from session storage
   */
  public clearIgnoreFlag(): void {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('analytics_ignore');
        logger.info('Analytics ignore flag cleared');
      } catch (error) {
        logger.error('Error clearing ignore flag:', error);
      }
    }
  }

  /**
   * Convenience methods for common events
   */
  public trackViewItemList(items: (CartItem | EnrichedCartLine | any)[], listId?: string, listName?: string): void {
    this.track(EcommerceEvents.createViewItemListEvent(items, listId, listName));
  }

  public trackViewItem(item: CartItem | EnrichedCartLine | any): void {
    this.track(EcommerceEvents.createViewItemEvent(item));
  }

  public trackAddToCart(item: CartItem | EnrichedCartLine | any, listId?: string, listName?: string): void {
    this.track(EcommerceEvents.createAddToCartEvent(item, listId, listName));
  }

  public trackBeginCheckout(): void {
    this.track(EcommerceEvents.createBeginCheckoutEvent());
  }

  public trackPurchase(orderData: any): void {
    this.track(EcommerceEvents.createPurchaseEvent(orderData));
  }

  public trackSignUp(email?: string): void {
    const userData = email ? { customer_email: email } : undefined;
    this.track(UserEvents.createSignUpEvent('email', userData));
  }

  public trackLogin(email?: string): void {
    const userData = email ? { customer_email: email } : undefined;
    this.track(UserEvents.createLoginEvent('email', userData));
  }
}

// Export singleton instance
export const nextAnalytics = NextAnalytics.getInstance();

// Export types and utilities
export * from './types';
export { EventValidator } from './validation/EventValidator';
export { EcommerceEvents } from './events/EcommerceEvents';
export { UserEvents } from './events/UserEvents';
export { dataLayer } from './DataLayerManager';

// Set up global access for debugging
if (typeof window !== 'undefined') {
  (window as any).NextAnalytics = nextAnalytics;
  (window as any).NextDataLayerManager = dataLayer;
  
  // Set up route change handling
  (window as any).NextInvalidateContext = () => {
    nextAnalytics.invalidateContext();
  };
  
  // Set up ignore flag management
  (window as any).NextAnalyticsClearIgnore = () => {
    nextAnalytics.clearIgnoreFlag();
  };
}