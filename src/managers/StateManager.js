/**
 * StateManager - Manages application state
 * 
 * This class provides a centralized state management system for the application,
 * including local cart functionality. It uses a pub/sub pattern to notify
 * subscribers when state changes.
 */

export class StateManager {
  #app;
  #logger;
  #state;
  #subscribers = {};

  constructor(app) {
    this.#app = app;
    this.#logger = app.logger.createModuleLogger('STATE');
    this.#state = this.#initDefaultState();
    this.#loadState();
    this.#recalculateCart(false);
    this.#logger.info('StateManager initialized');
  }

  #initDefaultState() {
    return {
      cart: {
        items: [],
        totals: {
          subtotal: 0,
          retail_subtotal: 0,
          savings: 0,
          savings_percentage: 0,
          shipping: 0,
          tax: 0,
          total: 0,
          recurring_total: 0,
          discount: 0,
          coupon_savings: 0,
          currency: 'USD',
          currency_symbol: '$'
        },
        shippingMethod: null,
        couponCode: null,
        couponDetails: null,
        attribution: {
          utm_source: '',
          utm_medium: '',
          utm_campaign: '',
          utm_content: '',
          utm_term: '',
          gclid: '',
          fbclid: '',
          sub1: '',
          sub2: '',
          sub3: '',
          sub4: '',
          sub5: '',
          referrer: '',
          landing_page: '',
          user_agent: '',
          device_type: '',
          fbc: '',
          fbp: ''
        }
      },
      user: { email: null, firstName: null, lastName: null, phone: null },
      ui: { loading: false, currentStep: 'cart', errors: {} }
    };
  }

  #loadState() {
    try {
      const savedState = sessionStorage.getItem('os_state');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        this.#state = { ...this.#state, ...parsedState, ui: { ...this.#state.ui } };
        this.#logger.info('State loaded from sessionStorage');
      }
    } catch (error) {
      this.#logger.error('Error loading state from sessionStorage:', error);
    }
  }

  #saveState() {
    try {
      const stateToSave = {
        cart: { ...this.#state.cart, totals: this.#calculateCartTotals() },
        user: this.#state.user
      };
      sessionStorage.setItem('os_state', JSON.stringify(stateToSave));
      this.#logger.debug('State saved to sessionStorage');
    } catch (error) {
      this.#logger.error('Error saving state to sessionStorage:', error);
    }
  }

  getState(path = null) {
    if (!path) return { ...this.#state, cart: { ...this.#state.cart, totals: this.#calculateCartTotals() } };
    if (path === 'cart') return { ...this.#state.cart, totals: this.#calculateCartTotals() };
    if (path === 'cart.totals' || path.startsWith('cart.totals.')) return this.#calculateCartTotals();

    return path.split('.').reduce((obj, key) => obj?.[key] ?? null, this.#state);
  }

  setState(path, value, notify = true) {
    let current = this.#state;
    const parts = path.split('.');
    for (const [i, part] of parts.entries()) {
      if (i === parts.length - 1) {
        current[part] = value;
      } else {
        current[part] ??= {};
        current = current[part];
      }
    }

    if (path.startsWith('cart.items')) this.#recalculateCart(false);
    this.#saveState();
    if (notify) {
      this.#notifySubscribers(path, value);
      if (path.startsWith('cart.items')) this.#notifySubscribers('cart', this.getState('cart'));
    }
    return this;
  }

  subscribe(path, callback) {
    this.#subscribers[path] ??= [];
    this.#subscribers[path].push(callback);
    try {
      callback(this.getState(path), path);
    } catch (error) {
      this.#logger.error(`Error in initial subscriber callback for ${path}:`, error);
    }
    return () => this.#subscribers[path] = this.#subscribers[path].filter(cb => cb !== callback);
  }

  #notifySubscribers(path, value) {
    this.#logger.debug(`Notifying subscribers for path: ${path}`);
    
    for (const [subPath, callbacks] of Object.entries(this.#subscribers)) {
      if (subPath === path || subPath === '*' || path.startsWith(`${subPath}.`)) {
        const subValue = subPath === '*' ? this.getState() : this.getState(subPath);
        callbacks.forEach(callback => {
          try {
            callback(subValue, subPath);
          } catch (error) {
            this.#logger.error(`Error in subscriber callback for ${subPath}:`, error);
          }
        });
      }
    }
  }

  clearState() {
    this.#state = this.#initDefaultState();
    sessionStorage.removeItem('os_state');
    this.#notifySubscribers('*', this.#state);
    this.#logger.info('State cleared');
  }

  addToCart(item) {
    if (!item?.id || !item.name || item.price === undefined) {
      this.#logger.error('Invalid item:', item);
      throw new Error('Invalid item. Must have id, name, and price.');
    }

    const cart = this.getState('cart');
    const packageData = this.#app.campaignData?.packages?.find(pkg => 
      pkg.ref_id.toString() === item.id.toString() || pkg.external_id?.toString() === item.id.toString()
    );

    const enhancedItem = {
      ...item,
      ...(packageData && {
        name: packageData.name || item.name,
        price: Number.parseFloat(packageData.price) || item.price,
        price_total: Number.parseFloat(packageData.price_total) || item.price * (item.quantity || 1),
        retail_price: Number.parseFloat(packageData.price_retail) ?? undefined,
        retail_price_total: Number.parseFloat(packageData.price_retail_total) ?? undefined,
        is_recurring: packageData.is_recurring ?? false,
        price_recurring: packageData.price_recurring ? Number.parseFloat(packageData.price_recurring) : undefined,
        price_recurring_total: packageData.price_recurring_total ? Number.parseFloat(packageData.price_recurring_total) : undefined,
        interval: packageData.interval ?? undefined,
        interval_count: packageData.interval_count ?? undefined,
        image: packageData.image || item.image,
        external_id: packageData.external_id ?? undefined
      }),
      quantity: item.quantity || 1
    };

    const existingItemIndex = cart.items.findIndex(i => i.id === item.id);
    const updatedItems = existingItemIndex >= 0
      ? this.#updateExistingItem(cart.items, existingItemIndex, enhancedItem)
      : [...cart.items, enhancedItem];

    this.setState('cart.items', updatedItems);
    this.#logger.info(`Item added to cart: ${enhancedItem.name}`);
    this.#app.triggerEvent('cart.updated', { cart: this.getState('cart') });
    return this.getState('cart');
  }

  #updateExistingItem(items, index, newItem) {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      quantity: (updatedItems[index].quantity || 1) + (newItem.quantity || 1),
      price_total: updatedItems[index].price * (updatedItems[index].quantity || 1 + (newItem.quantity || 1)),
      ...(updatedItems[index].retail_price && {
        retail_price_total: updatedItems[index].retail_price * (updatedItems[index].quantity || 1 + (newItem.quantity || 1))
      }),
      ...(updatedItems[index].price_recurring && {
        price_recurring_total: updatedItems[index].price_recurring * (updatedItems[index].quantity || 1 + (newItem.quantity || 1))
      })
    };
    return updatedItems;
  }

  updateCartItem(itemId, updates) {
    const cart = this.getState('cart');
    const itemIndex = cart.items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      this.#logger.error(`Item not found in cart: ${itemId}`);
      throw new Error(`Item not found in cart: ${itemId}`);
    }

    const updatedItems = [...cart.items];
    updatedItems[itemIndex] = { ...updatedItems[itemIndex], ...updates };
    if (updatedItems[itemIndex].quantity === 0) updatedItems.splice(itemIndex, 1);

    this.setState('cart.items', updatedItems);
    this.#logger.info(`Cart item updated: ${itemId}`);
    this.#app.triggerEvent('cart.updated', { cart: this.getState('cart') });
    return this.getState('cart');
  }

  removeFromCart(itemId) {
    const updatedItems = this.getState('cart').items.filter(item => item.id !== itemId);
    this.setState('cart.items', updatedItems);
    this.#logger.info(`Item removed from cart: ${itemId}`);
    this.#app.triggerEvent('cart.updated', { cart: this.getState('cart') });
    return this.getState('cart');
  }

  clearCart() {
    this.setState('cart.items', []);
    this.setState('cart.couponCode', null);
    this.setState('cart.couponDetails', null);
    this.setState('cart.shippingMethod', null);
    this.#logger.info('Cart cleared');
    this.#app.triggerEvent('cart.updated', { cart: this.getState('cart') });
    return this.getState('cart');
  }

  setShippingMethod(shippingMethod) {
    this.setState('cart.shippingMethod', shippingMethod);
    this.#logger.info(`Shipping method set: ${shippingMethod.code}`);
    this.#app.triggerEvent('cart.updated', { cart: this.getState('cart') });
    return this.getState('cart');
  }

  applyCoupon(couponCode, discountType = 'percentage', discountValue = 0) {
    this.setState('cart.couponCode', couponCode);
    this.setState('cart.couponDetails', {
      code: couponCode,
      type: discountType,
      value: parseFloat(discountValue)
    });
    this.#logger.info(`Coupon applied: ${couponCode} (${discountType}: ${discountValue})`);
    this.#recalculateCart(true);
    this.#app.triggerEvent('cart.updated', { cart: this.getState('cart') });
    return this.getState('cart');
  }

  removeCoupon() {
    this.setState('cart.couponCode', null);
    this.setState('cart.couponDetails', null);
    this.#logger.info('Coupon removed');
    this.#recalculateCart(true);
    this.#app.triggerEvent('cart.updated', { cart: this.getState('cart') });
    return this.getState('cart');
  }

  #calculateCartTotals() {
    const { items, shippingMethod, couponDetails } = this.#state.cart;
    
    // Use price_total if available, otherwise calculate from price * quantity
    const subtotal = items.reduce((acc, item) => 
      acc + (item.price_total ?? (item.price * (item.quantity || 1))), 0);
    
    // Calculate discount if coupon is set
    let discountAmount = 0;
    if (couponDetails && this.#app.discount) {
      discountAmount = this.#app.discount.calculateDiscount(couponDetails, subtotal);
    }
    
    // Apply the discount to get the final subtotal
    const discountedSubtotal = subtotal - discountAmount;
    
    // Use retail_price_total if available, otherwise calculate from retail_price * quantity
    const retailSubtotal = items.reduce((acc, item) => 
      acc + (item.retail_price_total ?? ((item.retail_price ?? item.price) * (item.quantity || 1))), 0);
    
    // Calculate savings (including discount)
    const savings = retailSubtotal - discountedSubtotal;
    const savingsPercentage = retailSubtotal > 0 ? (savings / retailSubtotal) * 100 : 0;
    
    // Calculate recurring total
    const recurringTotal = items.reduce((acc, item) => 
      acc + (item.is_recurring && item.price_recurring ? item.price_recurring * (item.quantity || 1) : 0), 0);
    
    // Calculate shipping (adjust for free shipping coupon)
    let shipping = shippingMethod?.price ? Number.parseFloat(shippingMethod.price) : 0;
    if (couponDetails && couponDetails.type === 'free_shipping') {
      shipping = 0;
    }
    
    // Placeholder for real tax logic - would typically be calculated on the discounted subtotal
    const tax = 0;
    
    // Calculate the new total including discount
    const total = discountedSubtotal + shipping + tax;

    const currency = this.#app.campaignData?.currency ?? 'USD';
    const currencySymbol = { USD: '$', EUR: '€', GBP: '£' }[currency] ?? '$';

    return {
      subtotal: discountedSubtotal, // This is now the discounted subtotal
      original_subtotal: subtotal, // Keep the original subtotal for reference
      retail_subtotal: retailSubtotal,
      savings,
      savings_percentage: savingsPercentage,
      shipping,
      tax,
      total,
      recurring_total: recurringTotal,
      discount: discountAmount,
      coupon_savings: discountAmount,
      currency,
      currency_symbol: currencySymbol
    };
  }

  #recalculateCart(notify = true) {
    const totals = this.#calculateCartTotals();
    this.#state.cart.totals = totals;
    this.#logger.debug('Cart totals recalculated');
    if (notify) {
      this.#notifySubscribers('cart.totals', totals);
      this.#notifySubscribers('cart', this.getState('cart'));
    }
    return totals;
  }

  isItemInCart(itemId) {
    return this.#state.cart.items.some(item => item.id === itemId);
  }

  getCartForApi() {
    const { items, shippingMethod, couponCode, couponDetails, attribution } = this.getState('cart');
    const { email, firstName, lastName, phone } = this.getState('user');
    
    // Create properly formatted vouchers array if coupon is applied
    let vouchers = [];
    if (couponCode) {
      if (couponDetails && couponDetails.type && couponDetails.value !== undefined) {
        // Enhanced format with coupon details
        vouchers.push({
          code: couponCode,
          type: couponDetails.type,
          value: couponDetails.value
        });
      } else {
        // Simple string format for backward compatibility
        vouchers.push(couponCode);
      }
    }
    
    return {
      lines: items.map(item => ({ product_id: item.id, quantity: item.quantity || 1, price: item.price })),
      shipping_method: shippingMethod?.ref_id ?? null,
      coupon_code: couponCode,
      vouchers: vouchers,
      user: { email, first_name: firstName, last_name: lastName, phone },
      attribution: attribution || {}
    };
  }

  async syncCartWithApi() {
    try {
      this.setState('ui.loading', true);
      const apiCart = this.getCartForApi();
      const response = await this.#app.api.createCart(apiCart);
      this.#logger.info('Cart synced with API');
      this.#app.triggerEvent('cart.synced', { cart: response });
      return response;
    } catch (error) {
      this.#logger.error('Error syncing cart with API:', error);
      this.setState('ui.errors.cart', error.message);
      throw error;
    } finally {
      this.setState('ui.loading', false);
    }
  }
}