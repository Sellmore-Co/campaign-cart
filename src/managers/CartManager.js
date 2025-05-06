/**
 * CartManager - Manages cart operations
 * 
 * This class provides a simplified interface for cart operations,
 * using the StateManager for state management.
 */

export class CartManager {
  #app;
  #stateManager;
  #logger;
  #cartElements;

  constructor(app) {
    this.#app = app;
    this.#stateManager = app.state;
    this.#logger = app.logger.createModuleLogger('CART');
    this.#initCartUI();
    this.#logger.info('CartManager initialized');
  }

  #initCartUI() {
    this.#cartElements = {
      addToCartButtons: document.querySelectorAll('[data-os-add-to-cart]'),
      cartCount: document.querySelectorAll('[data-os-cart-count]'),
      cartTotal: document.querySelectorAll('[data-os-cart-total]'),
      cartItems: document.querySelector('[data-os-cart-items]'),
      cartEmpty: document.querySelector('[data-os-cart-empty]'),
      cartContainer: document.querySelector('[data-os-cart-container]')
    };

    this.#cartElements.addToCartButtons.forEach(button => {
      button.addEventListener('click', event => {
        event.preventDefault();
        const item = {
          id: button.getAttribute('data-os-product-id'),
          name: button.getAttribute('data-os-product-name'),
          price: Number.parseFloat(button.getAttribute('data-os-product-price')),
          quantity: Number.parseInt(button.getAttribute('data-os-product-quantity') ?? '1', 10)
        };
        if (item.id && item.name && item.price) this.#addToCart(item);
        else this.#logger.error('Invalid product data for add to cart button');
      });
    });

    this.#stateManager.subscribe('cart', () => this.#updateCartUI());
    this.#updateCartUI();
  }

  #updateCartUI() {
    const cart = this.#stateManager.getState('cart');

    this.#cartElements.cartCount.forEach(element => {
      const itemCount = cart.items.reduce((count, item) => count + (item.quantity || 1), 0);
      element.textContent = itemCount.toString();
      element.classList.toggle('hidden', itemCount === 0);
    });

    const formatPrice = price => this.#app.campaign?.formatPrice(price) ?? price.toFixed(2);
    this.#cartElements.cartTotal.forEach(element => element.textContent = formatPrice(cart.totals.total));

    const updateElement = (selector, value, hideIfZero = false) => {
      const element = document.querySelector(selector);
      if (element) {
        element.textContent = hideIfZero ? `${Math.round(value)}%` : formatPrice(value);
        if (hideIfZero && value === 0) element.parentElement?.classList.add('hidden');
        else element.parentElement?.classList.remove('hidden');
      }
    };

    updateElement('[data-os-cart-retail-subtotal]', cart.totals.retail_subtotal);
    updateElement('[data-os-cart-savings]', cart.totals.savings, true);
    updateElement('[data-os-cart-savings-percentage]', cart.totals.savings_percentage, true);
    updateElement('[data-os-cart-recurring-total]', cart.totals.recurring_total, true);
    updateElement('[data-os-cart-subtotal]', cart.totals.subtotal);
    updateElement('[data-os-cart-shipping]', cart.totals.shipping);
    updateElement('[data-os-cart-original-subtotal]', cart.totals.original_subtotal);
    updateElement('[data-os-cart-discount]', cart.totals.discount);
    updateElement('[data-os-cart-coupon-savings]', cart.totals.coupon_savings);
    
    // Update coupon display
    const couponElement = document.querySelector('[data-os-cart-coupon]');
    const couponContainer = document.querySelector('[data-os-cart-coupon-container]');
    
    if (couponElement && couponContainer) {
      if (cart.couponDetails && cart.couponCode) {
        couponElement.textContent = this.#app.discount?.getCouponDisplayText(cart.couponDetails) || cart.couponCode;
        couponContainer.classList.remove('hidden');
      } else {
        couponContainer.classList.add('hidden');
      }
    }

    if (this.#cartElements.cartItems) {
      this.#cartElements.cartItems.innerHTML = '';
      cart.items.forEach(item => this.#cartElements.cartItems.appendChild(this.#createCartItemElement(item)));
    }

    if (this.#cartElements.cartEmpty && this.#cartElements.cartContainer) {
      const isEmpty = cart.items.length === 0;
      this.#cartElements.cartEmpty.classList.toggle('hidden', !isEmpty);
      this.#cartElements.cartContainer.classList.toggle('hidden', isEmpty);
    }
  }

  #createCartItemElement(item) {
    const formatPrice = price => this.#app.campaign?.formatPrice(price) ?? price.toFixed(2);
    const itemElement = document.createElement('div');
    itemElement.className = 'os-cart-item';
    itemElement.setAttribute('data-os-cart-item-id', item.id);

    const price = formatPrice(item.price);
    const retailPrice = item.retail_price ? formatPrice(item.retail_price) : '';
    const total = formatPrice(item.price * (item.quantity || 1));
    const savings = item.retail_price ? (item.retail_price - item.price) * (item.quantity || 1) : 0;
    const savingsHtml = savings ? `
      <div class="os-cart-item-savings">
        <span class="os-cart-item-savings-label">You save:</span>
        <span class="os-cart-item-savings-value">${formatPrice(savings)} (${Math.round(savings / (item.retail_price * (item.quantity || 1)) * 100)}%)</span>
      </div>
    ` : '';
    const recurringHtml = item.is_recurring && item.price_recurring ? `
      <div class="os-cart-item-recurring">
        <span class="os-cart-item-recurring-label">Recurring:</span>
        <span class="os-cart-item-recurring-value">${formatPrice(item.price_recurring)} ${item.interval_count > 1 ? `every ${item.interval_count} ${item.interval}s` : `per ${item.interval}`}</span>
      </div>
    ` : '';
    const imageHtml = item.image ? `
      <div class="os-cart-item-image">
        <img src="${item.image}" alt="${item.name}" />
      </div>
    ` : '';

    itemElement.innerHTML = `
      ${imageHtml}
      <div class="os-cart-item-details">
        <div class="os-cart-item-name">${item.name}</div>
        <div class="os-cart-item-price-container">
          <div class="os-cart-item-price">${price}</div>
          ${retailPrice ? `<div class="os-cart-item-retail-price">${retailPrice}</div>` : ''}
        </div>
        ${savingsHtml}
        ${recurringHtml}
      </div>
      <div class="os-cart-item-quantity">
        <button class="os-cart-item-decrease" data-os-cart-decrease="${item.id}">-</button>
        <span class="os-cart-item-quantity-value">${item.quantity || 1}</span>
        <button class="os-cart-item-increase" data-os-cart-increase="${item.id}">+</button>
      </div>
      <div class="os-cart-item-total">${total}</div>
      <button class="os-cart-item-remove" data-os-cart-remove="${item.id}">×</button>
    `;

    itemElement.querySelector(`[data-os-cart-decrease="${item.id}"]`)?.addEventListener('click', () => this.#updateCartItemQuantity(item.id, (item.quantity || 1) - 1));
    itemElement.querySelector(`[data-os-cart-increase="${item.id}"]`)?.addEventListener('click', () => this.#updateCartItemQuantity(item.id, (item.quantity || 1) + 1));
    itemElement.querySelector(`[data-os-cart-remove="${item.id}"]`)?.addEventListener('click', () => this.#removeFromCart(item.id));

    return itemElement;
  }

  #addToCart(item) {
    try {
      const result = this.#stateManager.addToCart(item);
      // this.#showMessage(`${item.name} added to cart`);
      return result;
    } catch (error) {
      this.#logger.error('Error adding item to cart:', error);
      // this.#showMessage('Error adding item to cart', 'error');
      throw error;
    }
  }

  #updateCartItemQuantity(itemId, quantity) {
    try {
      return quantity <= 0 ? this.#removeFromCart(itemId) : this.#stateManager.updateCartItem(itemId, { quantity });
    } catch (error) {
      this.#logger.error('Error updating cart item quantity:', error);
      // this.#showMessage('Error updating cart', 'error');
      throw error;
    }
  }

  #removeFromCart(itemId) {
    try {
      return this.#stateManager.removeFromCart(itemId);
    } catch (error) {
      this.#logger.error('Error removing item from cart:', error);
      // this.#showMessage('Error removing item from cart', 'error');
      throw error;
    }
  }

  clearCart() {
    try {
      return this.#stateManager.clearCart();
    } catch (error) {
      this.#logger.error('Error clearing cart:', error);
      // this.#showMessage('Error clearing cart', 'error');
      throw error;
    }
  }

  addToCart(item) {
    return this.#addToCart(item);
  }

  removeFromCart(itemId) {
    return this.#removeFromCart(itemId);
  }

  setShippingMethod(shippingMethodId) {
    try {
      // Ensure campaignData and shipping_methods are available
      const campaignData = this.#app.campaignData;
      if (!campaignData || !Array.isArray(campaignData.shipping_methods)) {
        this.#logger.error('Campaign data or shipping methods not available.');
        throw new Error('Shipping methods not loaded.');
      }
      
      // Find the shipping method object by its ref_id
      const selectedMethod = campaignData.shipping_methods.find(
        method => method.ref_id?.toString() === shippingMethodId?.toString()
      );
      
      if (!selectedMethod) {
        this.#logger.error(`Shipping method with ID ${shippingMethodId} not found.`);
        throw new Error(`Shipping method ID ${shippingMethodId} not found.`);
      }
      
      // Pass the found object to the state manager
      this.#logger.info(`Setting shipping method to:`, selectedMethod);
      return this.#stateManager.setShippingMethod(selectedMethod);
    } catch (error) {
      this.#logger.error('Error setting shipping method:', error);
      // this.#showMessage('Error setting shipping method', 'error');
      throw error;
    }
  }

  applyCoupon(couponCode, discountType = 'percentage', discountValue = 0, applicableProductIds = []) {
    try {
      // Pass applicableProductIds to StateManager
      const result = this.#stateManager.applyCoupon(couponCode, discountType, discountValue, applicableProductIds);
      
      // Refresh unit pricing calculations if SelectorManager is available
      if (this.#app.selector && typeof this.#app.selector.refreshUnitPricing === 'function') {
        setTimeout(() => this.#app.selector.refreshUnitPricing(), 10);
      }
      
      return result;
    } catch (error) {
      this.#logger.error('Error applying coupon:', error);
      // this.#showMessage('Error applying coupon', 'error');
      throw error;
    }
  }

  removeCoupon() {
    try {
      const result = this.#stateManager.removeCoupon();
      
      // Refresh unit pricing calculations if SelectorManager is available
      if (this.#app.selector && typeof this.#app.selector.refreshUnitPricing === 'function') {
        setTimeout(() => this.#app.selector.refreshUnitPricing(), 10);
      }
      
      return result;
    } catch (error) {
      this.#logger.error('Error removing coupon:', error);
      // this.#showMessage('Error removing coupon', 'error');
      throw error;
    }
  }

  getCouponDetails() {
    const cart = this.#stateManager.getState('cart');
    return cart.couponDetails;
  }

  async syncCartWithApi() {
    try {
      return await this.#stateManager.syncCartWithApi();
    } catch (error) {
      this.#logger.error('Error syncing cart with API:', error);
      // this.#showMessage('Error syncing cart with server', 'error');
      throw error;
    }
  }

  isItemInCart(itemId) {
    return this.#stateManager.isItemInCart?.(itemId) ?? this.#stateManager.getState('cart').items.some(item => item.id === itemId);
  }

  // #showMessage(message, type = 'success') {
  //   const messageElement = document.createElement('div');
  //   messageElement.className = `os-message os-message-${type}`;
  //   messageElement.textContent = message;
  //   document.body.appendChild(messageElement);
  //   setTimeout(() => {
  //     messageElement.classList.add('os-message-hide');
  //     setTimeout(() => document.body.removeChild(messageElement), 300);
  //   }, 3000);
  // }
}