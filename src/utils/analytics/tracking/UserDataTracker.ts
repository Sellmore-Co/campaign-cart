/**
 * UserDataTracker - Tracks user data and cart contents
 * Fires dl_user_data event on page load and route changes
 */

import { createLogger } from '@/utils/logger';
import { useCartStore } from '@/stores/cartStore';
import { dataLayer } from '../DataLayerManager';
import { EventBus } from '@/utils/events';
import { userDataStorage } from '../userDataStorage';
import { UserEvents } from '../events/UserEvents';

const logger = createLogger('UserDataTracker');

interface UserData {
  userId?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  cartValue?: number;
  cartItems?: number;
  cartProducts?: string[];
  [key: string]: any;
}

export class UserDataTracker {
  private static instance: UserDataTracker;
  private eventBus = EventBus.getInstance();
  private lastTrackTime = 0;
  private trackDebounceMs = 1000; // 1 second debounce
  private isInitialized = false;
  private unsubscribers: (() => void)[] = [];
  private hasTrackedInitial = false; // Track if initial event has been fired

  private constructor() {}

  public static getInstance(): UserDataTracker {
    if (!UserDataTracker.instance) {
      UserDataTracker.instance = new UserDataTracker();
    }
    return UserDataTracker.instance;
  }

  /**
   * Initialize the tracker
   */
  public initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') {
      return;
    }

    this.isInitialized = true;
    dataLayer.initialize();

    // CRITICAL: Force immediate user data tracking without debounce
    // This ensures dl_user_data is ALWAYS the first event on page load
    this.lastTrackTime = 0;  // Reset to bypass debounce
    this.trackUserData();
    this.hasTrackedInitial = true;

    // Set up listeners AFTER initial tracking
    // Add delay to prevent cart store initialization from triggering duplicate
    setTimeout(() => {
      this.setupListeners();
      logger.debug('User data tracking listeners set up after initial tracking');
    }, 200);

    logger.info('UserDataTracker initialized - dl_user_data fired first');
  }

  /**
   * Track user data event
   */
  public trackUserData(): void {
    const now = Date.now();

    // Log call stack for debugging duplicate events
    if (this.hasTrackedInitial) {
      const stack = new Error().stack;
      logger.debug('trackUserData called after initial:', {
        timeSinceLastTrack: now - this.lastTrackTime,
        willDebounce: now - this.lastTrackTime < this.trackDebounceMs,
        stack: stack?.split('\n').slice(1, 4).join('\n')
      });
    }

    if (now - this.lastTrackTime < this.trackDebounceMs) {
      logger.debug('User data tracking debounced');
      return;
    }
    this.lastTrackTime = now;

    const userData = this.collectUserData();

    if (!userData || Object.keys(userData).length === 0) {
      logger.debug('No user data to track');
      return;
    }

    // Convert userData to UserProperties format for UserEvents
    const userProperties: any = {
      customer_email: userData.email,
      customer_phone: userData.phone,
      customer_first_name: userData.firstName,
      customer_last_name: userData.lastName,
      visitor_type: userData.userId ? 'logged_in' : 'guest'
    };

    // Remove undefined values
    Object.keys(userProperties).forEach(key => {
      if (userProperties[key] === undefined) {
        delete userProperties[key];
      }
    });

    // Use UserEvents.createUserDataEvent to properly format the event with cart_contents
    const event = UserEvents.createUserDataEvent('dl_user_data', userProperties);
    dataLayer.push(event);

    logger.debug('Tracked user data:', {
      hasUserId: !!userData.userId,
      hasEmail: !!userData.email,
      cartValue: userData.cartValue,
      cartItems: userData.cartItems
    });
  }

  /**
   * Collect user data from stores
   */
  private collectUserData(): UserData {
    // Get user data from our storage utility (includes cookie data)
    const userData: UserData = userDataStorage.getUserData();
    
    // Update from form fields if on checkout page
    userDataStorage.updateFromFormFields();

    // Get cart data from cart store
    try {
      const cartState = useCartStore.getState();
      
      if (cartState.items && cartState.items.length > 0) {
        userData.cartValue = cartState.total || cartState.subtotal || 0;
        userData.cartItems = cartState.totalQuantity || 0;
        userData.cartProducts = cartState.items.map(item => 
          item.packageId?.toString() || 'unknown'
        );
      } else {
        userData.cartValue = 0;
        userData.cartItems = 0;
        userData.cartProducts = [];
      }
    } catch (error) {
      logger.debug('Cart store not available or error accessing:', error);
    }

    // Get checkout data if in checkout flow
    try {
      const checkoutData = this.getCheckoutData();
      if (checkoutData) {
        Object.assign(userData, checkoutData);
      }
    } catch (error) {
      logger.debug('Error getting checkout data:', error);
    }

    return userData;
  }

  /**
   * Get checkout data from form fields if available
   */
  private getCheckoutData(): Partial<UserData> | null {
    if (typeof document === 'undefined') {
      return null;
    }

    const checkoutData: Partial<UserData> = {};

    // Common checkout field selectors
    const fieldMappings = [
      { selector: '[name="email"], #email, [type="email"]', key: 'email' },
      { selector: '[name="phone"], #phone, [type="tel"]', key: 'phone' },
      { selector: '[name="first_name"], [name="firstName"], #first-name', key: 'firstName' },
      { selector: '[name="last_name"], [name="lastName"], #last-name', key: 'lastName' },
      { selector: '[name="address"], [name="address1"], #address', key: 'address' },
      { selector: '[name="city"], #city', key: 'city' },
      { selector: '[name="state"], [name="province"], #state', key: 'state' },
      { selector: '[name="zip"], [name="postal_code"], #zip', key: 'postalCode' },
      { selector: '[name="country"], #country', key: 'country' }
    ];

    fieldMappings.forEach(({ selector, key }) => {
      const element = document.querySelector(selector) as HTMLInputElement;
      if (element && element.value) {
        checkoutData[key] = element.value;
      }
    });

    return Object.keys(checkoutData).length > 0 ? checkoutData : null;
  }

  /**
   * Set up event listeners
   */
  private setupListeners(): void {
    // Listen for route changes (using any cast for custom events)
    (this.eventBus as any).on('route:changed', () => {
      logger.debug('Route changed, tracking user data');
      this.trackUserData();
    });

    // Listen for Next SDK route invalidation
    (this.eventBus as any).on('sdk:route-invalidated', () => {
      logger.debug('SDK route invalidated, tracking user data');
      this.trackUserData();
    });

    // Listen for user login/logout
    (this.eventBus as any).on('user:logged-in', () => {
      logger.debug('User logged in, tracking user data');
      setTimeout(() => this.trackUserData(), 100); // Small delay to ensure stores are updated
    });

    (this.eventBus as any).on('user:logged-out', () => {
      logger.debug('User logged out, tracking user data');
      setTimeout(() => this.trackUserData(), 100);
    });

    // REMOVED: cart:updated listener - causes duplicate tracking
    // The cart:updated event is already tracked by AutoEventListener as dl_cart_updated
    // We don't need to also fire dl_user_data on every cart change

    // REMOVED: Cart store subscription - causes duplicate tracking
    // User data is already tracked on route changes and significant user actions
    // Cart changes are tracked separately via dl_cart_updated event

    // Listen for browser navigation
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', () => {
        logger.debug('Browser navigation, tracking user data');
        this.trackUserData();
      });

      // Override pushState and replaceState
      // Only track on pushState (actual navigation), not replaceState (URL updates)
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;

      let lastUrl = window.location.href;

      history.pushState = function(...args) {
        originalPushState.apply(history, args);
        const newUrl = window.location.href;
        // Only track if URL actually changed (not just query params)
        if (newUrl !== lastUrl) {
          const oldPath = new URL(lastUrl).pathname;
          const newPath = new URL(newUrl).pathname;
          if (oldPath !== newPath) {
            lastUrl = newUrl;
            logger.debug('pushState changed path, tracking user data');
            setTimeout(() => UserDataTracker.getInstance().trackUserData(), 0);
          }
        }
      };

      history.replaceState = function(...args) {
        originalReplaceState.apply(history, args);
        // Do NOT track on replaceState - it's used for query param updates
        // which shouldn't trigger user data events
        logger.debug('replaceState called, not tracking user data (query param update)');
      };
    }

    logger.debug('User data tracking listeners set up');
  }

  /**
   * Force track user data (bypasses debounce)
   */
  public forceTrack(): void {
    this.lastTrackTime = 0;
    this.trackUserData();
  }

  /**
   * Reset the tracker (called by NextAnalytics)
   */
  public reset(): void {
    this.lastTrackTime = 0;
    this.trackUserData();
    logger.debug('UserDataTracker reset');
  }

  /**
   * Clean up the tracker
   */
  public destroy(): void {
    // Unsubscribe from stores
    this.unsubscribers.forEach(unsubscribe => unsubscribe());
    this.unsubscribers = [];

    // Remove event listeners (using any cast for custom events)
    (this.eventBus as any).removeAllListeners('route:changed');
    (this.eventBus as any).removeAllListeners('sdk:route-invalidated');
    (this.eventBus as any).removeAllListeners('user:logged-in');
    (this.eventBus as any).removeAllListeners('user:logged-out');

    this.isInitialized = false;
    logger.debug('UserDataTracker destroyed');
  }

  /**
   * Get tracking status
   */
  public getStatus(): {
    initialized: boolean;
    lastTrackTime: number;
    listenersCount: number;
  } {
    return {
      initialized: this.isInitialized,
      lastTrackTime: this.lastTrackTime,
      listenersCount: this.unsubscribers.length
    };
  }
}

// Export singleton instance
export const userDataTracker = UserDataTracker.getInstance();