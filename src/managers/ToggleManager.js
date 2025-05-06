/**
 * ToggleManager - Manages toggle item buttons in the DOM
 * 
 * This class handles toggle item buttons that can add/remove items from the cart.
 */

import { DebugUtils } from '../utils/DebugUtils.js';

export class ToggleManager {
  #toggleItems = {};
  #app;
  #logger;
  #isDebugMode = false;

  constructor(app) {
    this.#app = app;
    this.#logger = app.logger.createModuleLogger('TOGGLE');
    this.#isDebugMode = DebugUtils.initDebugMode();
    this.#initToggleItems();
    this.#app.state.subscribe('cart', () => this.#updateAllToggleItemsUI());
    this.#logger.info('ToggleManager initialized');
    if (this.#isDebugMode) {
      this.#logger.info('Debug mode enabled for toggle items');
    }
  }

  #initToggleItems() {
    const toggleElements = document.querySelectorAll('[data-os-action="toggle-item"]');
    
    if (!toggleElements.length) {
      this.#logger.debug('No toggle item buttons found in the DOM');
      return;
    }
    
    this.#logger.info(`Found ${toggleElements.length} toggle item buttons`);
    toggleElements.forEach(element => this.#initToggleItem(element));
  }

  #initToggleItem(toggleElement) {
    const packageId = toggleElement.getAttribute('data-os-package');
    if (!packageId) {
      this.#logger.warn('Toggle item missing data-os-package attribute', toggleElement);
      return;
    }

    const quantity = Number.parseInt(toggleElement.getAttribute('data-os-quantity') ?? '1', 10);
    const toggleId = toggleElement.getAttribute('data-os-id') ?? `toggle-${packageId}`;

    this.#toggleItems[toggleId] = { element: toggleElement, packageId, quantity };
    this.#updateToggleItemUI(toggleElement, packageId);

    toggleElement.addEventListener('click', event => {
      event.preventDefault();
      this.#toggleItem(toggleId);
    });

    if (this.#isDebugMode) {
      this.#addDebugOverlay(toggleElement, toggleId, packageId, quantity);
    }

    this.#logger.debug(`Initialized toggle item ${toggleId} for package ${packageId}`);
  }

  #addDebugOverlay(element, toggleId, packageId, quantity) {
    const packageData = this.#getPackageDataFromCampaign(packageId);
    const price = packageData ? packageData.price : 'N/A';
    
    // Check if this is an upsell toggle
    const isUpsell = element.hasAttribute('data-os-upsell') ? 
      element.getAttribute('data-os-upsell') === 'true' : 
      (element.closest('[data-os-upsell-section]') !== null);
    
    DebugUtils.addDebugOverlay(element, toggleId, 'toggle', {
      'Package': packageId,
      'Qty': quantity,
      'Price': price,
      'Upsell': isUpsell ? 'Yes' : 'No'
    });
  }

  #toggleItem(toggleId) {
    const toggleItem = this.#toggleItems[toggleId];
    if (!toggleItem) {
      this.#logger.error(`Toggle item ${toggleId} not found`);
      return;
    }

    const { packageId, quantity, element } = toggleItem;
    const isInCart = this.#isItemInCart(packageId);

    if (isInCart) {
      this.#removeItemFromCart(packageId);
      this.#logger.info(`Toggled OFF item ${packageId}`);
    } else {
      const packageData = this.#getPackageDataFromCampaign(packageId);
      if (!packageData) {
        this.#logger.error(`Package ${packageId} not found in campaign data`);
        return;
      }

      // Check if this is an upsell toggle
      const isUpsell = element.hasAttribute('data-os-upsell') ? 
        element.getAttribute('data-os-upsell') === 'true' : 
        (element.closest('[data-os-upsell-section]') !== null);

      this.#addItemToCart({
        id: packageId,
        name: packageData.name,
        price: Number.parseFloat(packageData.price),
        quantity,
        type: 'package',
        is_upsell: isUpsell
      });
      
      this.#logger.info(`Toggled ON item ${packageId}${isUpsell ? ' (upsell)' : ''}`);
    }

    this.#updateToggleItemUI(element, packageId);
    this.#app.triggerEvent('toggle.changed', { toggleId, packageId, isActive: !isInCart });
  }

  #getPackageDataFromCampaign(packageId) {
    if (!this.#app.campaignData?.packages) {
      this.#logger.error('Campaign data not available');
      return null;
    }
    
    return this.#app.campaignData.packages.find(pkg => pkg.ref_id.toString() === packageId.toString()) ?? null;
  }

  #updateToggleItemUI(element, packageId) {
    const isInCart = this.#isItemInCart(packageId);
    element.classList.toggle('os--active', isInCart);
    element.setAttribute('data-os-active', isInCart.toString());

    // Find the parent wrapper and toggle its class as well
    const wrapper = element.closest('[data-os-toggle-wrapper]');
    if (wrapper) {
      wrapper.classList.toggle('os--active', isInCart);
      this.#logger.debug(`Toggled os--active class on wrapper for package ${packageId} to ${isInCart}`);
    } else {
      // Optional: Log if a wrapper isn't found, for debugging purposes
      // this.#logger.debug(`No [data-os-toggle-wrapper] found for toggle item of package ${packageId}`);
    }
  }

  #updateAllToggleItemsUI() {
    Object.values(this.#toggleItems).forEach(({ element, packageId }) => 
      this.#updateToggleItemUI(element, packageId)
    );
  }

  #isItemInCart(itemId) {
    return this.#app.state.getState('cart').items.some(item => item.id === itemId);
  }

  #addItemToCart(item) {
    if (!this.#app.cart) {
      this.#logger.error('Cart manager not available');
      return;
    }
    this.#app.cart.addToCart(item);
  }

  #removeItemFromCart(itemId) {
    if (!this.#app.cart) {
      this.#logger.error('Cart manager not available');
      return;
    }
    this.#app.cart.removeFromCart(itemId);
  }
}