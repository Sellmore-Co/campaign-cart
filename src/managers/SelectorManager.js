/**
 * SelectorManager - Manages selector components
 */

import { DebugUtils } from '../utils/DebugUtils.js';

export class SelectorManager {
  #app;
  #logger;
  #selectors = {};
  #selectedItems = {};
  #isDebugMode = false;

  constructor(app) {
    this.#app = app;
    this.#logger = app.logger.createModuleLogger('SELECTOR');
    this.#isDebugMode = DebugUtils.initDebugMode();
    this.#initSelectors();
    this.#logger.info('SelectorManager initialized');
    if (this.#isDebugMode) {
      this.#logger.info('Debug mode enabled for selectors');
    }
  }

  #initSelectors() {
    document.querySelectorAll('[data-os-component="selector"][data-os-selection-mode="swap"]').forEach(selector => this.#initSelector(selector));
    setTimeout(() => this.#syncWithCart(), 0);
    this.#app.state?.subscribe('cart', () => this.#syncWithCart());
  }

  #initSelector(selectorElement) {
    const selectorId = selectorElement.getAttribute('data-os-id');
    if (!selectorId) {
      this.#logger.warn('Selector missing data-os-id', selectorElement);
      return;
    }

    const mode = selectorElement.getAttribute('data-os-selection-mode') || 'swap';
    
    this.#selectors[selectorId] = { 
      element: selectorElement, 
      items: [],
      mode
    };
    
    this.#selectedItems[selectorId] = null;
    selectorElement.querySelectorAll('[data-os-element="card"]').forEach(card => this.#initCard(selectorId, card));
    
    if (this.#isDebugMode) {
      DebugUtils.addDebugOverlay(selectorElement, selectorId, 'overlay', { 'Mode': mode });
    }
  }

  #initCard(selectorId, cardElement) {
    const packageId = cardElement.getAttribute('data-os-package');
    if (!packageId) {
      this.#logger.warn('Card missing data-os-package', cardElement);
      return;
    }

    const priceElement = cardElement.querySelector('.pb-quantity__price.pb--current');
    const priceText = priceElement?.textContent.trim() ?? '$0.00 USD';
    const price = Number.parseFloat(priceText.match(/\$(\d+\.\d+)/)?.[1] ?? '0');

    const nameElement = cardElement.querySelector('.card-title');
    const name = nameElement?.textContent.trim() ?? `Package ${packageId}`;

    const quantity = Number.parseInt(cardElement.getAttribute('data-os-quantity') ?? '1', 10);
    const isPreSelected = cardElement.getAttribute('data-os-selected') === 'true';

    const item = {
      element: cardElement,
      packageId,
      quantity,
      price,
      name,
      isPreSelected
    };

    this.#selectors[selectorId].items.push(item);
    cardElement.addEventListener('click', () => this.#handleClick(selectorId, item));
    
    if (this.#isDebugMode) {
      DebugUtils.addDebugOverlay(cardElement, packageId, 'card', {
        'Price': `$${price}`,
        'Qty': quantity,
        'PreSel': isPreSelected ? 'Yes' : 'No'
      });
    }
  }

  #handleClick(selectorId, item) {
    const previous = this.#selectedItems[selectorId];
    this.#selectItem(selectorId, item);
    this.#updateCart(selectorId, previous);
  }

  #selectItem(selectorId, item) {
    if (this.#selectedItems[selectorId] === item) return;

    this.#selectors[selectorId].items.forEach(i => {
      i.element.classList.remove('os--selected');
      i.element.setAttribute('data-os-selected', 'false');
      i.isSelected = false;
    });

    item.element.classList.add('os--selected');
    item.element.setAttribute('data-os-selected', 'true');
    item.isSelected = true;
    this.#selectedItems[selectorId] = item;
    this.#logger.debug(`Selected item ${item.packageId} in selector ${selectorId}`);
  }

  #updateCart(selectorId, previousItem) {
    if (!this.#app.cart) {
      this.#logger.error('Cart manager not available');
      return;
    }

    const selected = this.#selectedItems[selectorId];
    if (!selected) return;

    if (previousItem && previousItem.packageId !== selected.packageId) {
      this.#removeItemFromCart(previousItem);
    }

    if (!this.#app.cart.isItemInCart(selected.packageId)) {
      this.#addItemToCart(selected);
    }
  }

  #addItemToCart(item) {
    if (!this.#app.cart) {
      this.#logger.error('Cart manager not available in addItemToCart');
      return;
    }
    if (typeof this.#app.cart.addToCart !== 'function') {
      this.#logger.error('addToCart is not a function on this.#app.cart:', this.#app.cart);
      return;
    }

    this.#logger.info(`Adding item ${item.packageId} to cart`);
    this.#app.cart.addToCart({
      id: item.packageId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      type: 'package'
    });

    item.element.classList.add('os--active');
    item.element.setAttribute('data-os-active', 'true');
  }

  #removeItemFromCart(item) {
    if (!this.#app.cart) {
      this.#logger.error('Cart manager not available in removeItemFromCart');
      return;
    }
    if (typeof this.#app.cart.removeFromCart !== 'function') {
      this.#logger.error('removeFromCart is not a function on this.#app.cart:', this.#app.cart);
      return;
    }

    this.#logger.info(`Removing item ${item.packageId} from cart`);
    this.#app.cart.removeFromCart(item.packageId);

    item.element.classList.remove('os--active');
    item.element.setAttribute('data-os-active', 'false');
  }

  #syncWithCart() {
    if (!this.#app.cart) {
      this.#logger.debug('Cart manager not available for sync');
      return;
    }

    const cart = this.#app.state?.getState('cart');
    if (!cart) {
      this.#logger.debug('Cart state not available');
      return;
    }

    this.#logger.debug('Syncing with cart, this.#app.cart:', this.#app.cart);

    Object.keys(this.#selectors).forEach(selectorId => {
      const items = this.#selectors[selectorId].items;
      const cartItemsInSelector = items.filter(item => this.#app.cart.isItemInCart(item.packageId));

      if (cartItemsInSelector.length > 0) {
        const itemInCart = cartItemsInSelector[0];
        this.#selectItem(selectorId, itemInCart);
        cartItemsInSelector.forEach(item => {
          if (item.packageId !== itemInCart.packageId) this.#removeItemFromCart(item);
        });
      } else if (!this.#selectedItems[selectorId]) {
        const preSelected = items.find(item => item.isPreSelected);
        if (preSelected) {
          this.#selectItem(selectorId, preSelected);
          this.#addItemToCart(preSelected);
        }
      }

      items.forEach(item => {
        const isInCart = this.#app.cart.isItemInCart(item.packageId);
        item.element.classList.toggle('os--active', isInCart);
        item.element.setAttribute('data-os-active', isInCart.toString());
      });
    });
  }
}