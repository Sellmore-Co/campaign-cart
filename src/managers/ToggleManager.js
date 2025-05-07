/**
 * ToggleManager - Manages toggle item buttons in the DOM
 * 
 * This class handles toggle item buttons that can add/remove items from the cart.
 */

import { DebugUtils } from '../utils/DebugUtils.js';

export class ToggleManager {
  #packageToggles = {}; // Renamed and restructured: Key is packageId
  #app;
  #logger;
  #isDebugMode = false;

  constructor(app) {
    this.#app = app;
    this.#logger = app.logger.createModuleLogger('TOGGLE');
    this.#isDebugMode = DebugUtils.initDebugMode();
    this.#initAndRegisterToggleElements();
    this.#app.state.subscribe('cart', () => this.#updateAllToggleUIs()); // Changed method name
    this.#logger.info('ToggleManager initialized');
    if (this.#isDebugMode) {
      this.#logger.info('Debug mode enabled for toggle items');
    }
  }

  #initAndRegisterToggleElements() {
    const toggleElements = document.querySelectorAll('[data-os-action="toggle-item"]');
    if (!toggleElements.length) {
      this.#logger.debug('No toggle item buttons found.');
      return;
    }
    this.#logger.info(`Found ${toggleElements.length} toggle item button elements.`);
    toggleElements.forEach(element => this.#registerToggleElement(element));
    this.#updateAllToggleUIs(); // Initial UI update based on loaded cart state
  }

  #registerToggleElement(toggleElement) {
    const packageId = toggleElement.getAttribute('data-os-package');
    if (!packageId) {
      this.#logger.warn('Toggle element missing data-os-package attribute', toggleElement);
      return;
    }

    const quantity = Number.parseInt(toggleElement.getAttribute('data-os-quantity') ?? '1', 10);

    // If this packageId hasn't been seen, initialize its entry
    if (!this.#packageToggles[packageId]) {
      this.#packageToggles[packageId] = {
        packageId: packageId,
        quantity: quantity, // Assume quantity is consistent for the package
        elements: [] // Array to hold all DOM elements for this package
      };
      this.#logger.debug(`[INIT] Creating new toggle registration for packageId: ${packageId}`);
    } else {
       // Optional: Warn if quantity differs between buttons for the same package
       if (this.#packageToggles[packageId].quantity !== quantity) {
           this.#logger.warn(`Toggle button for package ${packageId} has different quantity (${quantity}) than previously registered (${this.#packageToggles[packageId].quantity}). Using first quantity found.`);
       }
    }

    // Add the current DOM element to the list for this packageId
    this.#packageToggles[packageId].elements.push(toggleElement);
    this.#logger.debugWithTime(`[INIT] Registered element for packageId: ${packageId}. Total elements for this package: ${this.#packageToggles[packageId].elements.length}`);

    // Add event listener to this specific element
    toggleElement.addEventListener('click', event => {
      event.preventDefault();
      this.#processToggleAction(packageId, toggleElement); // Pass packageId and the clicked element
    });

    // Add debug overlay if needed
    if (this.#isDebugMode) {
      this.#addDebugOverlay(toggleElement, packageId, quantity);
    }
  }

  // Note: Removed toggleId parameter as it's not the primary key anymore
  #addDebugOverlay(element, packageId, quantity) { 
    const packageData = this.#getPackageDataFromCampaign(packageId);
    const price = packageData ? packageData.price : 'N/A';
    const isUpsell = element.hasAttribute('data-os-upsell') ? 
      element.getAttribute('data-os-upsell') === 'true' : 
      (element.closest('[data-os-upsell-section]') !== null);
    
    // Use packageId or a unique element identifier if needed for the DebugUtils key
    DebugUtils.addDebugOverlay(element, `toggle-${packageId}-${this.#packageToggles[packageId]?.elements.length || 0}`, 'toggle', {
      'Package': packageId,
      'Qty': quantity,
      'Price': price,
      'Upsell': isUpsell ? 'Yes' : 'No'
    });
  }

  // Renamed from #toggleItem, takes packageId and the specific element clicked
  #processToggleAction(packageId, clickedElement) {
    const packageInfo = this.#packageToggles[packageId];
    if (!packageInfo) {
      this.#logger.error(`Toggle package info for packageId ${packageId} not found`);
      return;
    }

    const { quantity } = packageInfo; // Use quantity from registered package info
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

      // Check if THIS SPECIFIC clicked element represents an upsell
      const isUpsell = clickedElement.hasAttribute('data-os-upsell') ? 
        clickedElement.getAttribute('data-os-upsell') === 'true' : 
        (clickedElement.closest('[data-os-upsell-section]') !== null);

      this.#addItemToCart({
        // Use packageId consistently for ID unless your cart expects something else
        id: packageId, 
        name: packageData.name,
        price: Number.parseFloat(packageData.price),
        quantity,
        type: 'package',
        is_upsell: isUpsell
      });
      
      this.#logger.info(`Toggled ON item ${packageId}${isUpsell ? ' (upsell)' : ''}`);
    }

    // UI update is now handled centrally by the state subscription calling #updateAllToggleUIs
    // No need to call #updateToggleItemUI directly here.

    // Trigger event with packageId and new state
    this.#app.triggerEvent('toggle.changed', { packageId, isActive: !isInCart });
  }

  #getPackageDataFromCampaign(packageId) {
    if (!this.#app.campaignData?.packages) {
      this.#logger.error('Campaign data not available');
      return null;
    }
    return this.#app.campaignData.packages.find(pkg => pkg.ref_id?.toString() === packageId?.toString() || pkg.id?.toString() === packageId?.toString()) ?? null;
  }
  
  // Renamed from #updateAllToggleItemsUI
  #updateAllToggleUIs() {
    this.#logger.debugWithTime(`[UPDATE_ALL] Cart state changed. Updating ALL package toggle UIs.`);
    Object.values(this.#packageToggles).forEach(packageInfo => { 
        this.#updateUIForPackage(packageInfo);
    });
  }

  // New method to update all elements for a given package
  #updateUIForPackage(packageInfo) {
      const { packageId, elements } = packageInfo;
      if (!elements || elements.length === 0) return;
      
      const isInCart = this.#isItemInCart(packageId);
      this.#logger.debugWithTime(`[UPDATE_PKG_UI] Updating UI for package ${packageId}. IsInCart: ${isInCart}. Element count: ${elements.length}`);
      
      elements.forEach(element => {
        element.classList.toggle('os--active', isInCart);
        element.setAttribute('data-os-active', isInCart.toString());
    
        const wrapper = element.closest('[data-os-toggle-wrapper]');
        if (wrapper) {
          wrapper.classList.toggle('os--active', isInCart);
          this.#logger.debugWithTime(`  > Toggled wrapper class for element of package ${packageId}`);
        } else {
          this.#logger.debugWithTime(`  > No wrapper found via closest() for element of package ${packageId}`);
        }
      });
  }

  #isItemInCart(itemId) {
    // Use item.package_id now that StateManager provides it reliably
    const items = this.#app.state.getState('cart')?.items || [];
    const found = items.some(item => item.package_id?.toString() === itemId?.toString());
    this.#logger.debugWithTime(`[isItemInCart] Checking for packageId: "${itemId}". Found: ${found}`);
    return found; 
  }

  #addItemToCart(item) {
    if (!this.#app.cart) {
      this.#logger.error('Cart manager not available');
      return;
    }
    this.#app.cart.addToCart(item);
  }

  #removeItemFromCart(packageIdToRemove) { // Renamed param for clarity
    if (!this.#app.cart) {
      this.#logger.error('Cart manager not available');
      return;
    }
    // Assuming CartManager.removeFromCart expects the packageId/ID used in the cart items
    this.#app.cart.removeFromCart(packageIdToRemove);
  }
}