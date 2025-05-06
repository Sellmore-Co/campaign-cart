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
    this.#processCartUpdates(false);
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
        if (parsedState.cart && Array.isArray(parsedState.cart.items)) {
          parsedState.cart.items = parsedState.cart.items.map(item => ({
            ...item,
            applied_coupon_discount_amount: item.applied_coupon_discount_amount || '0.00' 
          }));
        } else if (parsedState.cart) {
          parsedState.cart.items = [];
        }
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
        cart: this.#state.cart,
        user: this.#state.user
      };
      sessionStorage.setItem('os_state', JSON.stringify(stateToSave));
      this.#logger.debug('State saved to sessionStorage');
    } catch (error) {
      this.#logger.error('Error saving state to sessionStorage:', error);
    }
  }

  getState(path = null) {
    if (!path) return this.#state;
    return path.split('.').reduce((obj, key) => obj?.[key] ?? null, this.#state);
  }

  setState(path, value, notify = true) {
    let current = this.#state;
    const parts = path.split('.');
    let parent = this.#state;
    let finalPart = parts[0];

    for (const [i, part] of parts.entries()) {
      if (i === parts.length - 1) {
        current[part] = value;
        finalPart = part;
      } else {
        current[part] ??= {};
        parent = current;
        current = current[part];
      }
    }

    const cartRelatedChange = path.startsWith('cart.items') || 
                              path === 'cart.couponDetails' || 
                              path === 'cart.couponCode' || 
                              path.startsWith('cart.shippingMethod');

    if (cartRelatedChange) {
      this.#processCartUpdates(notify, path);
    } else {
      this.#saveState();
      if (notify) {
        this.#notifySubscribers(path, value);
      }
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
      this.#logger.error('Invalid item for addToCart:', item);
      throw new Error('Invalid item. Must have id, name, and price.');
    }
    const cart = this.getState('cart');
    const packageData = this.#app.campaignData?.packages?.find(pkg => 
      pkg.ref_id.toString() === item.id.toString() || pkg.external_id?.toString() === item.id.toString()
    );
    const itemPackageId = packageData?.ref_id?.toString() || item.id.toString();
    const quantityToAdd = item.quantity || 1;

    const existingItemIndex = this.#state.cart.items.findIndex(i => i.id === item.id && i.package_id === itemPackageId);

    let newItems;
    if (existingItemIndex >= 0) {
      newItems = this.#state.cart.items.map((cartItem, index) => {
        if (index === existingItemIndex) {
          const newQuantity = (cartItem.quantity || 1) + quantityToAdd;
          return {
            ...cartItem,
            quantity: newQuantity,
            price_total: (cartItem.price || 0) * newQuantity,
            ...(cartItem.retail_price && { retail_price_total: (cartItem.retail_price || 0) * newQuantity }),
            ...(cartItem.price_recurring && { price_recurring_total: (cartItem.price_recurring || 0) * newQuantity })
          };
        }
        return cartItem;
      });
    } else {
      const enhancedItem = {
        ...item,
        package_id: itemPackageId,
        quantity: quantityToAdd,
        price: Number.parseFloat(packageData?.price || item.price),
        price_total: (Number.parseFloat(packageData?.price || item.price)) * quantityToAdd,
        retail_price: Number.parseFloat(packageData?.price_retail) ?? undefined,
        retail_price_total: packageData?.price_retail ? (Number.parseFloat(packageData.price_retail) * quantityToAdd) : undefined,
        is_recurring: packageData?.is_recurring ?? false,
        price_recurring: packageData?.price_recurring ? Number.parseFloat(packageData.price_recurring) : undefined,
        price_recurring_total: packageData?.price_recurring ? (Number.parseFloat(packageData.price_recurring) * quantityToAdd) : undefined,
        interval: packageData?.interval ?? undefined,
        interval_count: packageData?.interval_count ?? undefined,
        image: packageData?.image || item.image,
        external_id: packageData?.external_id ?? undefined,
        applied_coupon_discount_amount: '0.00'
      };
      newItems = [...this.#state.cart.items, enhancedItem];
    }
    
    this.setState('cart.items', newItems);
    this.#logger.info(`Item added/updated in cart: ${item.name}`);
    return this.getState('cart');
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
    return this.getState('cart');
  }

  removeFromCart(itemId) {
    const updatedItems = this.getState('cart').items.filter(item => item.id !== itemId);
    this.setState('cart.items', updatedItems);
    this.#logger.info(`Item removed from cart: ${itemId}`);
    return this.getState('cart');
  }

  clearCart() {
    this.setState('cart.items', []);
    this.setState('cart.couponCode', null);
    this.setState('cart.couponDetails', null);
    this.setState('cart.shippingMethod', null);
    this.#logger.info('Cart cleared');
    return this.getState('cart');
  }

  setShippingMethod(shippingMethod) {
    this.setState('cart.shippingMethod', shippingMethod);
    this.#logger.info(`Shipping method set: ${shippingMethod.code}`);
    return this.getState('cart');
  }

  applyCoupon(couponCode, discountType = 'percentage', discountValue = 0, applicableProductIds = []) {
    this.setState('cart.couponDetails', {
      code: couponCode,
      type: discountType,
      value: parseFloat(discountValue),
      applicable_product_ids: applicableProductIds
    });
    this.setState('cart.couponCode', couponCode);
    this.#logger.info(`Attempted to apply coupon: ${couponCode}`);
    return this.getState('cart');
  }

  removeCoupon() {
    this.setState('cart.couponDetails', null);
    this.setState('cart.couponCode', null);
    this.#logger.info('Coupon removed');
    return this.getState('cart');
  }

  #processCartUpdates(notify = true, changedPath = 'cart') {
    this.#logger.debug(`[StateManager] Processing cart updates triggered by: ${changedPath}`);
    this.#updateItemAppliedDiscounts();
    this.#recalculateCart();
    this.#saveState();

    if (notify) {
      if (changedPath !== 'cart') { 
          const changedValue = changedPath.split('.').reduce((obj, key) => obj?.[key] ?? null, this.#state);
          this.#notifySubscribers(changedPath, changedValue);
      }
      this.#notifySubscribers('cart', this.getState('cart')); 
    }
  }

  #updateItemAppliedDiscounts() {
    const { items, couponDetails } = this.#state.cart;
    if (!Array.isArray(items)) {
      this.#logger.warn('[StateManager] #updateItemAppliedDiscounts: cart.items is not an array.');
      return;
    }

    this.#state.cart.items = items.map(item => {
      let itemDiscountAmount = 0;
      const itemBasePricePerUnit = item.price || 0;
      const quantity = item.quantity || 1;

      if (couponDetails && couponDetails.code && this.#app.discount) {
        let isItemApplicableForCoupon = false;
        if (couponDetails.applicable_product_ids && couponDetails.applicable_product_ids.length > 0) {
          if (couponDetails.applicable_product_ids.includes(item.package_id?.toString()) ||
              couponDetails.applicable_product_ids.includes(item.id?.toString())) {
            isItemApplicableForCoupon = true;
          }
        } else {
          isItemApplicableForCoupon = true;
        }

        if (isItemApplicableForCoupon) {
          if (couponDetails.type === 'percentage') {
            itemDiscountAmount = (itemBasePricePerUnit * quantity) * (couponDetails.value / 100);
          } else if (couponDetails.type === 'fixed') {
            if (couponDetails.applicable_product_ids && couponDetails.applicable_product_ids.length > 0) {
              itemDiscountAmount = Math.min((itemBasePricePerUnit * quantity), couponDetails.value);
            } else {
              itemDiscountAmount = 0; 
            }
          }
        }
      }
      return {
        ...item,
        applied_coupon_discount_amount: parseFloat(itemDiscountAmount.toFixed(2)) 
      };
    });
    this.#logger.debug('[StateManager] Updated per-item applied_coupon_discount_amount.');
  }

  #recalculateCart() {
    const { items, shippingMethod, couponDetails } = this.#state.cart;
    const currentItems = Array.isArray(items) ? items : [];

    const subtotalPreDiscount = currentItems.reduce((acc, item) => 
      acc + (item.price_total ?? (item.price * (item.quantity || 1))), 0);

    let totalDiscountFromCoupon = 0;
    if (couponDetails && couponDetails.code && this.#app.discount) {
        totalDiscountFromCoupon = this.#app.discount.calculateDiscount(couponDetails, subtotalPreDiscount, currentItems);
    }
    
    const subtotalAfterDiscount = subtotalPreDiscount - totalDiscountFromCoupon;
    
    const retailSubtotal = currentItems.reduce((acc, item) => 
      acc + (item.retail_price_total ?? ((item.retail_price ?? item.price) * (item.quantity || 1))), 0);
    
    const savings = retailSubtotal - subtotalAfterDiscount;
    const savingsPercentage = retailSubtotal > 0 ? (savings / retailSubtotal) * 100 : 0;
    const recurringTotal = currentItems.reduce((acc, item) => 
      acc + (item.is_recurring && item.price_recurring ? item.price_recurring * (item.quantity || 1) : 0), 0);
    
    let shipping = shippingMethod?.price ? Number.parseFloat(shippingMethod.price) : 0;
    if (couponDetails && couponDetails.type === 'free_shipping') {
      shipping = 0;
    }
    
    const tax = 0;
    const finalTotal = subtotalAfterDiscount + shipping + tax;

    const currency = this.#app.campaignData?.currency ?? 'USD';
    const currencySymbol = { USD: '$', EUR: '€', GBP: '£' }[currency] ?? '$';

    this.#state.cart.totals = {
      subtotal: subtotalAfterDiscount,
      original_subtotal: subtotalPreDiscount,
      retail_subtotal: retailSubtotal,
      savings,
      savings_percentage: savingsPercentage,
      shipping,
      tax,
      total: finalTotal,
      recurring_total: recurringTotal,
      discount: totalDiscountFromCoupon,
      coupon_savings: totalDiscountFromCoupon,
      currency,
      currency_symbol: currencySymbol
    };
    this.#logger.debug('[StateManager] Cart totals recalculated.');
  }

  isItemInCart(itemId) {
    return this.#state.cart.items.some(item => item.id === itemId);
  }

  getCartForApi() {
    const { items, shippingMethod, couponCode, couponDetails, attribution } = this.getState('cart');
    const { email, firstName, lastName, phone } = this.getState('user');
    
    let vouchers = [];
    if (couponCode) {
      if (couponDetails && couponDetails.type && couponDetails.value !== undefined) {
        vouchers.push({
          code: couponCode,
          type: couponDetails.type,
          value: couponDetails.value
        });
      } else {
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