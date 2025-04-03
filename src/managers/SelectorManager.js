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
    
    // Initialize unit pricing for all selectors
    this.initUnitPricing();
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

  /**
   * Initialize unit pricing for all selectors
   * This populates any elements with data-card-price attributes
   */
  initUnitPricing() {
    this.#logger.info('Initializing unit pricing for selectors');
    // Add a delay to ensure campaign data is loaded
    setTimeout(() => {
      Object.keys(this.#selectors).forEach(selectorId => {
        this.#initUnitPricingForSelector(selectorId);
      });
    }, 100);
  }

  /**
   * Initialize unit pricing for a specific selector
   * @param {string} selectorId - The ID of the selector
   */
  #initUnitPricingForSelector(selectorId) {
    const selector = this.#selectors[selectorId];
    if (!selector) {
      this.#logger.warn(`Selector ${selectorId} not found for unit pricing`);
      return;
    }

    // Get package data from the campaign data
    const campaignData = this.#app?.campaignData;
    if (!campaignData || !campaignData.packages) {
      this.#logger.warn('Campaign data not available for unit pricing');
      return;
    }

    selector.items.forEach(item => {
      this.#updateUnitPricingForCard(item, campaignData.packages);
    });
  }

  /**
   * Update unit pricing for a specific card
   * @param {Object} item - The item object
   * @param {Array} packages - The packages array from campaign data
   */
  #updateUnitPricingForCard(item, packages) {
    // Find the package data for this card
    const packageData = packages.find(pkg => 
      pkg.ref_id.toString() === item.packageId.toString() || 
      (pkg.external_id && pkg.external_id.toString() === item.packageId.toString())
    );

    if (!packageData) {
      this.#logger.debug(`Package data not found for item ${item.packageId}`);
      return;
    }

    const cardElement = item.element;
    
    // Log package data for debugging
    this.#logger.debug(`Processing unit pricing for package ${item.packageId}:`, {
      packageId: item.packageId,
      name: packageData.name,
      price: packageData.price,
      price_total: packageData.price_total,
      price_retail: packageData.price_retail,
      price_retail_total: packageData.price_retail_total,
      qty: packageData.qty
    });
    
    // Calculate unit metrics
    const totalUnits = packageData.qty || 1;
    const totalPrice = Number.parseFloat(packageData.price_total) || Number.parseFloat(packageData.price) * totalUnits;
    const totalRetailPrice = Number.parseFloat(packageData.price_retail_total) || 
                             (Number.parseFloat(packageData.price_retail) * totalUnits) || 
                             totalPrice;
    
    // Calculate unit prices
    const unitPrice = totalPrice / totalUnits;
    const unitRetailPrice = totalRetailPrice / totalUnits;
    const unitSavings = unitRetailPrice - unitPrice;
    const unitSavingsPercentage = unitRetailPrice > 0 ? (unitSavings / unitRetailPrice) * 100 : 0;
    
    // Calculate total savings
    const totalSavings = totalRetailPrice - totalPrice;
    const totalSavingsPercentage = totalRetailPrice > 0 ? (totalSavings / totalRetailPrice) * 100 : 0;
    
    // Log calculated values for debugging
    this.#logger.debug(`Calculated prices for package ${item.packageId}:`, {
      totalUnits,
      totalPrice,
      totalRetailPrice,
      totalSavings,
      totalSavingsPercentage,
      unitPrice,
      unitRetailPrice,
      unitSavings,
      unitSavingsPercentage
    });
    
    // Format prices
    const formatPrice = (price) => {
      if (this.#app.campaign?.formatPrice) {
        return this.#app.campaign.formatPrice(price);
      }
      return `$${price.toFixed(2)}`;
    };
    
    // Track which elements have been processed with data-divide-by
    const processedElements = new Set();
    
    // Look for any data-divide-by elements to calculate subunit pricing (e.g., price per facial)
    const subunitElements = cardElement.querySelectorAll('[data-divide-by]');
    if (subunitElements.length > 0) {
      this.#logger.debug(`Found ${subunitElements.length} elements with data-divide-by in card ${item.packageId}`);
      
      subunitElements.forEach(element => {
        const divisor = parseFloat(element.getAttribute('data-divide-by'));
        if (!isNaN(divisor) && divisor > 0) {
          const type = element.getAttribute('data-card-price');
          
          // Skip elements without a data-card-price attribute
          if (!type) {
            this.#logger.debug(`Skipping element with data-divide-by but no data-card-price attribute`);
            return;
          }
          
          let value;
          
          // Calculate the subunit value based on the type
          switch (type) {
            case 'each-sale':
              value = unitPrice / divisor;
              break;
            case 'each-regular':
              value = unitRetailPrice / divisor;
              break;
            case 'saving-amount':
              value = unitSavings / divisor;
              break;
            case 'saving-percentage':
              value = unitSavingsPercentage; // Percentage stays the same regardless of division
              break;
            case 'total-sale':
              value = totalPrice / divisor;
              break;
            case 'total-regular':
              value = totalRetailPrice / divisor;
              break;
            case 'total-saving-amount':
              value = totalSavings / divisor;
              break;
            case 'total-saving-percentage':
              value = totalSavingsPercentage; // Percentage stays the same
              break;
            default:
              this.#logger.debug(`Unknown price type: ${type}`);
              return;
          }
          
          // Format the value
          let formattedValue;
          if (type.includes('percentage')) {
            formattedValue = `${Math.round(value)}%`;
          } else {
            formattedValue = formatPrice(value);
          }
          
          // Update the element
          this.#logger.debug(`Setting price for element with data-divide-by="${divisor}":`, {
            attributeType: type,
            originalValue: element.textContent,
            calculatedValue: value,
            formattedValue: formattedValue,
            element: element.outerHTML
          });
          
          element.textContent = formattedValue;
          
          // Mark this element as processed
          processedElements.add(element);
          
          this.#logger.debug(`Updated element with data-divide-by="${divisor}" for ${type}: ${formattedValue}`);
        }
      });
    }

    // UNIT PRICING - Update elements with data-card-price attribute (skip those already processed)
    this.#updatePriceElement(cardElement, 'each-sale', formatPrice(unitPrice), processedElements);
    this.#updatePriceElement(cardElement, 'each-regular', formatPrice(unitRetailPrice), processedElements);
    this.#updatePriceElement(cardElement, 'saving-amount', formatPrice(unitSavings), processedElements);
    this.#updatePriceElement(cardElement, 'saving-percentage', `${Math.round(unitSavingsPercentage)}%`, processedElements);
    
    // TOTAL PRICING - Add support for total package prices
    this.#updatePriceElement(cardElement, 'total-sale', formatPrice(totalPrice), processedElements);
    this.#updatePriceElement(cardElement, 'total-regular', formatPrice(totalRetailPrice), processedElements);
    this.#updatePriceElement(cardElement, 'total-saving-amount', formatPrice(totalSavings), processedElements);
    this.#updatePriceElement(cardElement, 'total-saving-percentage', `${Math.round(totalSavingsPercentage)}%`, processedElements);
    
    this.#logger.debug(`Updated pricing for card ${item.packageId}: ${formatPrice(unitPrice)} per unit, ${formatPrice(totalPrice)} total`);
  }

  /**
   * Format a price with currency symbol
   * @param {number} price - Price to format
   * @returns {string} Formatted price
   */
  #formatPrice(price) {
    // Use the campaign's formatPrice method if available
    if (this.#app.campaign?.formatPrice) {
      return this.#app.campaign.formatPrice(price);
    }
    
    // Otherwise, use a simple formatter
    return `$${price.toFixed(2)}`;
  }

  /**
   * Update a price element with the calculated value
   * @param {HTMLElement} cardElement - The card element
   * @param {string} type - The price type
   * @param {string} value - The formatted price value
   * @param {Set} processedElements - Set of elements that have already been processed
   */
  #updatePriceElement(cardElement, type, value, processedElements = new Set()) {
    const priceElements = cardElement.querySelectorAll(`[data-card-price="${type}"]`);
    
    if (priceElements.length > 0) {
      priceElements.forEach(element => {
        // Skip elements that have already been processed with data-divide-by
        if (processedElements.has(element)) {
          return;
        }
        
        element.textContent = value;
        
        // If the price is 0 or negative, optionally hide the element
        const hideIfZero = element.getAttribute('data-hide-if-zero') === 'true';
        const numericValue = parseFloat(value.replace(/[^0-9.-]+/g, ''));
        
        if (hideIfZero && (numericValue <= 0)) {
          element.style.display = 'none';
          // Also hide parent if it has data-container attribute
          const container = element.closest('[data-container="true"]');
          if (container) container.style.display = 'none';
        } else {
          element.style.display = '';
          // Show parent if it was hidden
          const container = element.closest('[data-container="true"]');
          if (container) container.style.display = '';
        }
      });
    }
  }

  /**
   * Refresh unit pricing for all selectors
   * This can be called after campaign data is updated
   */
  refreshUnitPricing() {
    this.initUnitPricing();
  }
}