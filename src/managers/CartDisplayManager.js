/**
 * CartDisplayManager - Manages cart display in the checkout page
 * 
 * This class handles updating the cart summary display based on cart contents,
 * including line items, totals, savings, and shipping information.
 */

export class CartDisplayManager {
  #app;
  #logger;
  #elements = {
    lineDisplays: [], // Changed to array to support multiple displays
    summaryContainers: [], // Changed to array to support multiple containers
    savingsBars: [], // Changed to array
    shippingBars: [], // Changed to array
    grandTotals: [], // Changed to array
    subtotals: [], // Added for subtotal elements
    // Summary toggle elements
    summaryBars: [], // Changed to array
    summaryPanels: [], // Changed to array
    summaryTexts: [], // Changed to array
    summaryIcons: [], // Changed to array
    // Compare total elements
    compareTotalElements: []
  };
  #config = {
    currencySymbol: '$',
    showComparePricing: true,
    showProductImages: true,
    showTaxPendingMessage: true
  };
  #lineItemTemplate = null;

  constructor(app) {
    this.#app = app;
    this.#logger = app.logger.createModuleLogger('CART_DISPLAY');
    this.#initCartDisplay();
    
    // Subscribe to cart updates
    this.#app.state.subscribe('cart', () => this.updateCartDisplay());
    
    this.#logger.infoWithTime('CartDisplayManager initialized');
  }

  /**
   * Initialize the cart display elements
   */
  #initCartDisplay() {
    this.#logger.infoWithTime('Initializing cart display');
    
    // Find all cart display elements using querySelectorAll for everything
    this.#elements.lineDisplays = document.querySelectorAll('[data-os-cart-summary="line-display"]');
    this.#elements.summaryContainers = document.querySelectorAll('[data-os-cart="summary"]');
    this.#elements.savingsBars = document.querySelectorAll('[data-os-cart-summary="savings"]');
    this.#elements.shippingBars = document.querySelectorAll('[data-os-cart-summary="shipping-bar"]');
    this.#elements.grandTotals = document.querySelectorAll('[data-os-cart-summary="grand-total"]');
    this.#elements.subtotals = document.querySelectorAll('[data-os-cart-summary="subtotal"]');
    
    // Find all summary toggle elements
    this.#elements.summaryBars = document.querySelectorAll('[os-checkout-element="summary-bar"]');
    this.#elements.summaryPanels = document.querySelectorAll('[os-checkout-element="summary-mobile"]');
    this.#elements.summaryTexts = document.querySelectorAll('[os-checkout-element="summary-text"]');
    this.#elements.summaryIcons = document.querySelectorAll('[os-summary-icon]');
    
    // Find all compare-total elements across all containers
    this.#elements.compareTotalElements = document.querySelectorAll('[data-os-cart-summary="compare-total"]');
    
    // Log what elements were found for debugging
    this.#logger.debugWithTime(`Line displays found: ${this.#elements.lineDisplays.length}`);
    this.#logger.debugWithTime(`Summary containers found: ${this.#elements.summaryContainers.length}`);
    this.#logger.debugWithTime(`Savings bars found: ${this.#elements.savingsBars.length}`);
    this.#logger.debugWithTime(`Shipping bars found: ${this.#elements.shippingBars.length}`);
    this.#logger.debugWithTime(`Grand total elements found: ${this.#elements.grandTotals.length}`);
    this.#logger.debugWithTime(`Subtotal elements found: ${this.#elements.subtotals.length}`);
    this.#logger.debugWithTime(`Summary bars found: ${this.#elements.summaryBars.length}`);
    this.#logger.debugWithTime(`Summary panels found: ${this.#elements.summaryPanels.length}`);
    this.#logger.debugWithTime(`Summary texts found: ${this.#elements.summaryTexts.length}`);
    this.#logger.debugWithTime(`Summary icons found: ${this.#elements.summaryIcons.length}`);
    this.#logger.debugWithTime(`Compare total elements found: ${this.#elements.compareTotalElements.length}`);
    
    // Get configuration from attributes if available
    // Use the first summary container for configuration, but apply to all
    if (this.#elements.summaryContainers.length > 0) {
      const firstContainer = this.#elements.summaryContainers[0];
      this.#config.showComparePricing = firstContainer.dataset.showComparePricing !== 'false';
      this.#config.showProductImages = firstContainer.dataset.showProductImages !== 'false';
      this.#config.showTaxPendingMessage = firstContainer.dataset.showTaxPendingMessage !== 'false';
      this.#config.currencySymbol = firstContainer.dataset.currencySymbol || '$';
    }
    
    // Store a template of the line item if available
    const existingLineItem = document.querySelector('[data-os-cart-summary="line-item"]');
    if (existingLineItem) {
      this.#lineItemTemplate = existingLineItem.cloneNode(true);
    }
    
    // Initialize summary toggle functionality
    this.#initSummaryToggle();
    
    this.#logger.debugWithTime('Cart display elements initialized');
    
    // Initial update
    this.updateCartDisplay();
  }

  /**
   * Initialize the summary toggle functionality
   */
  #initSummaryToggle() {
    const { summaryBars, summaryPanels, summaryTexts, summaryIcons } = this.#elements;
    
    if (!summaryBars.length || !summaryPanels.length) {
      this.#logger.debugWithTime('Summary toggle elements not found, skipping initialization');
      return;
    }
    
    this.#logger.debugWithTime('Initializing summary toggle');
    
    // Initialize each summary panel
    summaryPanels.forEach((panel, index) => {
      // Add a class to prevent transitions during initialization
      panel.classList.add('no-transition');
      
      // Set initial styles if not already expanded
      if (!panel.classList.contains('cc-expanded')) {
        panel.style.height = '0';
        panel.style.opacity = '0';
        panel.style.overflow = 'hidden';
        
        // Set initial text content for corresponding text element
        const textElement = summaryTexts[index];
        if (textElement) {
          textElement.textContent = 'Show Order Summary';
        }
      }
      
      // Force reflow and remove no-transition class
      requestAnimationFrame(() => {
        panel.classList.remove('no-transition');
        panel.style.transition = 'height 0.3s ease-out, opacity 0.25s ease-out';
      });
    });
    
    // Add click event listener to each summary bar
    summaryBars.forEach((bar, index) => {
      bar.addEventListener('click', (e) => {
        e.preventDefault();
        this.#toggleSummary(index);
      });
    });
    
    // Add resize listener to handle window size changes
    window.addEventListener('resize', this.#debounce(() => {
      summaryPanels.forEach(panel => {
        if (panel.classList.contains('cc-expanded')) {
          panel.style.height = 'auto';
        }
      });
    }, 250));
    
    this.#logger.debugWithTime('Summary toggle initialized');
  }

  /**
   * Toggle the summary panel between expanded and collapsed states
   * @param {number} index - Index of the summary panel to toggle
   */
  #toggleSummary(index = 0) {
    const { summaryPanels, summaryTexts, summaryIcons } = this.#elements;
    
    const panel = summaryPanels[index];
    const text = summaryTexts[index];
    const icon = summaryIcons[index];
    
    if (!panel) return;
    
    const isExpanded = panel.classList.contains('cc-expanded');
    
    if (!isExpanded) {
      // Expanding
      panel.classList.add('cc-expanded');
      panel.style.height = `${panel.scrollHeight}px`;
      panel.style.opacity = '1';
      
      if (text) {
        text.textContent = 'Hide Order Summary';
      }
      
      if (icon) {
        icon.style.transform = 'rotate(180deg)';
      }
      
      panel.addEventListener('transitionend', () => {
        if (panel.classList.contains('cc-expanded')) {
          panel.style.height = 'auto';
        }
      }, { once: true });
      
      this.#logger.debugWithTime('Summary panel expanded');
    } else {
      // Collapsing
      const currentHeight = panel.scrollHeight;
      panel.style.height = `${currentHeight}px`;
      panel.offsetHeight; // Force reflow
      
      panel.style.height = '0';
      panel.style.opacity = '0';
      
      if (text) {
        text.textContent = 'Show Order Summary';
      }
      
      if (icon) {
        icon.style.transform = 'rotate(0deg)';
      }
      
      panel.addEventListener('transitionend', () => {
        if (panel.style.height === '0px') {
          panel.classList.remove('cc-expanded');
        }
      }, { once: true });
      
      this.#logger.debugWithTime('Summary panel collapsed');
    }
  }

  /**
   * Update the cart display with current cart data
   */
  updateCartDisplay() {
    this.#logger.debugWithTime('Updating cart display');
    
    const cart = this.#app.state.getState('cart');
    if (!cart) {
      this.#logger.warnWithTime('Cart data not available');
      return;
    }
    
    this.#logger.debugWithTime(`Cart data: ${JSON.stringify(cart)}`);
    
    // Update line items
    this.#updateLineItems(cart.items);
    
    // Update summary
    this.#updateSummary(cart.totals);
    
    // Update shipping
    this.#updateShipping(cart.totals.shipping, cart.shippingMethod);
    
    // Update savings
    this.#updateSavings(cart.totals);
    
    // Update grand total
    this.#updateGrandTotal(cart.totals.total);
    
    // Update compare total elements
    this.#updateCompareTotals(cart.totals);
    
    this.#logger.debugWithTime('Cart display updated');
  }

  /**
   * Update the line items display
   * @param {Array} items - Cart items
   */
  #updateLineItems(items) {
    if (!this.#elements.lineDisplays.length || !this.#lineItemTemplate) {
      this.#logger.warnWithTime('Line displays or template not found');
      return;
    }
    
    if (!items || items.length === 0) {
      this.#logger.debugWithTime('No items in cart');
      return;
    }
    
    // Update each line display container
    this.#elements.lineDisplays.forEach(lineDisplay => {
      // Clear existing line items
      lineDisplay.innerHTML = '';
      
      // Add each item to the display
      items.forEach(item => {
        const lineItemElement = this.#createLineItemElement(item);
        lineDisplay.appendChild(lineItemElement);
      });
    });
    
    // Check if we need to show the scroll indicator
    const scrollIndicators = document.querySelectorAll('[data-os-cart-summary="summary-scroll"]');
    if (scrollIndicators.length) {
      const shouldShowScroll = items.length > 2;
      scrollIndicators.forEach(indicator => {
        indicator.classList.toggle('hide', !shouldShowScroll);
      });
    }
  }

  /**
   * Create a line item element
   * @param {Object} item - Cart item
   * @returns {HTMLElement} Line item element
   */
  #createLineItemElement(item) {
    const lineItem = this.#lineItemTemplate.cloneNode(true);
    
    // Set item title
    const titleElement = lineItem.querySelector('[data-os-cart-summary="line-title"]');
    if (titleElement) {
      titleElement.textContent = item.name;
    }
    
    // Set item image if available
    if (this.#config.showProductImages) {
      const imageElement = lineItem.querySelector('[data-os-cart-summary="line-image"]');
      if (imageElement && item.image) {
        imageElement.src = item.image;
        imageElement.alt = item.name;
      }
    }
    
    // Set item quantity
    const qtyElement = lineItem.querySelector('[os-cart="line_item-qty"]');
    if (qtyElement) {
      qtyElement.textContent = item.quantity || 1;
    }
    
    // Set item prices
    const comparePrice = lineItem.querySelector('[data-os-cart-summary="line-compare"]');
    const salePrice = lineItem.querySelector('[data-os-cart-summary="line-sale"]');
    
    if (comparePrice && item.retail_price && this.#config.showComparePricing) {
      comparePrice.textContent = this.#formatPrice(item.retail_price * (item.quantity || 1));
      comparePrice.classList.remove('hide');
    } else if (comparePrice) {
      comparePrice.classList.add('hide');
    }
    
    if (salePrice) {
      salePrice.textContent = this.#formatPrice(item.price * (item.quantity || 1));
    }
    
    // Set savings percentage
    const savingsPercentElement = lineItem.querySelector('[data-os-cart-summary="line-saving-percent"]');
    if (savingsPercentElement && item.retail_price) {
      const savingsPercent = Math.round((1 - (item.price / item.retail_price)) * 100);
      if (savingsPercent > 0) {
        const format = savingsPercentElement.dataset.osFormat || 'default';
        let savingsText = `${savingsPercent}% OFF`;
        
        if (format === 'parenthesis') {
          savingsText = `(${savingsPercent}% OFF)`;
        }
        
        savingsPercentElement.textContent = savingsText;
        savingsPercentElement.classList.remove('hide');
      } else {
        savingsPercentElement.classList.add('hide');
      }
    } else if (savingsPercentElement) {
      savingsPercentElement.classList.add('hide');
    }
    
    return lineItem;
  }

  /**
   * Update the summary section
   * @param {Object} totals - Cart totals
   */
  #updateSummary(totals) {
    if (!totals) return;
    
    // Update subtotal elements
    if (this.#elements.subtotals.length) {
      this.#elements.subtotals.forEach(element => {
        element.textContent = this.#formatPrice(totals.subtotal);
      });
      this.#logger.debugWithTime(`Updated subtotal to: ${this.#formatPrice(totals.subtotal)}`);
    }
    
    // Update coupon discount elements if coupon is applied
    if (totals.discount > 0) {
      const discountElements = document.querySelectorAll('[data-os-cart-summary="discount-amount"]');
      const discountRows = document.querySelectorAll('[data-os-cart-summary="discount-row"]');
      
      // Update discount amount elements
      discountElements.forEach(element => {
        element.textContent = `-${this.#formatPrice(totals.discount)}`;
      });
      
      // Show discount rows
      discountRows.forEach(row => {
        row.classList.remove('hide');
      });
      
      this.#logger.debugWithTime(`Updated discount amount to: -${this.#formatPrice(totals.discount)}`);
      
      // Also update any original subtotal elements to show the pre-discount amount
      const originalSubtotalElements = document.querySelectorAll('[data-os-cart-summary="original-subtotal"]');
      originalSubtotalElements.forEach(element => {
        element.textContent = this.#formatPrice(totals.original_subtotal || totals.subtotal + totals.discount);
        element.classList.remove('hide');
      });
    } else {
      // Hide discount rows if no discount
      const discountRows = document.querySelectorAll('[data-os-cart-summary="discount-row"]');
      discountRows.forEach(row => {
        row.classList.add('hide');
      });
      
      // Hide original subtotal elements
      const originalSubtotalElements = document.querySelectorAll('[data-os-cart-summary="original-subtotal"]');
      originalSubtotalElements.forEach(element => {
        element.classList.add('hide');
      });
    }
  }

  /**
   * Update the shipping information
   * @param {number} shippingCost - Shipping cost
   * @param {Object} shippingMethod - Selected shipping method
   */
  #updateShipping(shippingCost, shippingMethod) {
    if (!this.#elements.shippingBars.length) {
      this.#logger.warnWithTime('Shipping bars not found');
      return;
    }
    
    // Update all shipping bars
    this.#elements.shippingBars.forEach(shippingBar => {
      const shippingCompare = shippingBar.querySelector('[data-os-cart-summary="shipping-compare"]');
      const shippingCurrent = shippingBar.querySelector('[data-os-cart-summary="shipping-current"]');
      
      if (shippingCompare && shippingCurrent) {
        // If shipping is free but there was a standard shipping cost
        if (shippingCost === 0 && shippingMethod?.standard_cost > 0) {
          shippingCompare.textContent = this.#formatPrice(shippingMethod.standard_cost);
          shippingCurrent.textContent = 'FREE';
          shippingCompare.classList.remove('hide');
        } 
        // If shipping has a cost
        else if (shippingCost > 0) {
          shippingCurrent.textContent = this.#formatPrice(shippingCost);
          shippingCompare.classList.add('hide');
        } 
        // If shipping is just free
        else {
          shippingCurrent.textContent = 'FREE';
          shippingCompare.classList.add('hide');
        }
      }
    });
  }

  /**
   * Update the savings information
   * @param {Object} totals - Cart totals
   */
  #updateSavings(totals) {
    if (!this.#elements.savingsBars.length) {
      this.#logger.warnWithTime('Savings bars not found');
      return;
    }
    
    // Update all savings bars
    this.#elements.savingsBars.forEach(savingsBar => {
      // Find elements within this specific savings bar
      const savingsAmount = savingsBar.querySelector('[data-os-cart-summary="savings-amount"]');
      const savingsPercentage = savingsBar.querySelector('[data-os-cart-summary="savings-percentage"]');
      
      if (totals.savings > 0 && totals.savings_percentage > 0) {
        if (savingsAmount) {
          savingsAmount.textContent = this.#formatPrice(totals.savings);
          this.#logger.debugWithTime(`Updated savings amount to: ${this.#formatPrice(totals.savings)}`);
        }
        
        if (savingsPercentage) {
          savingsPercentage.textContent = `${Math.round(totals.savings_percentage)}% OFF`;
          this.#logger.debugWithTime(`Updated savings percentage to: ${Math.round(totals.savings_percentage)}% OFF`);
        }
        
        savingsBar.classList.remove('hide');
      } else {
        savingsBar.classList.add('hide');
      }
    });
    
    // Also update any standalone savings elements that might be outside the savings bars
    const allSavingsAmounts = document.querySelectorAll('[data-os-cart-summary="savings-amount"]');
    const allSavingsPercentages = document.querySelectorAll('[data-os-cart-summary="savings-percentage"]');
    
    if (totals.savings > 0 && totals.savings_percentage > 0) {
      allSavingsAmounts.forEach(element => {
        element.textContent = this.#formatPrice(totals.savings);
      });
      
      allSavingsPercentages.forEach(element => {
        element.textContent = `${Math.round(totals.savings_percentage)}% OFF`;
      });
    }
  }

  /**
   * Update the grand total
   * @param {number} total - Cart total
   */
  #updateGrandTotal(total) {
    if (!this.#elements.grandTotals.length) {
      this.#logger.warnWithTime('Grand total elements not found');
      return;
    }
    
    // Update all grand total elements
    this.#elements.grandTotals.forEach(element => {
      element.textContent = this.#formatPrice(total);
    });
    
    this.#logger.debugWithTime(`Updated grand total to: ${this.#formatPrice(total)}`);
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
    return `${this.#config.currencySymbol}${price.toFixed(2)} USD`;
  }

  /**
   * Simple debounce function for resize events
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  #debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Update the compare total elements
   * @param {Object} totals - Cart totals
   */
  #updateCompareTotals(totals) {
    if (!this.#elements.compareTotalElements.length) {
      this.#logger.debugWithTime('No compare-total elements found');
      return;
    }
    
    this.#logger.debugWithTime('Updating compare-total elements');
    this.#logger.debugWithTime(`Cart totals: ${JSON.stringify(totals)}`);
    
    // Add debug attribute to body to help inspect the totals in browser
    document.body.setAttribute('data-debug-cart-totals', JSON.stringify({
      total: totals.total,
      subtotal: totals.subtotal,
      original_subtotal: totals.original_subtotal,
      retail_subtotal: totals.retail_subtotal,
      discount: totals.discount
    }));
    
    this.#elements.compareTotalElements.forEach(element => {
      // Get the data attribute that specifies which total to use
      const totalType = element.dataset.totalType || 'retail';
      let compareValue = null;
      
      // Priority order for compare value:
      // 1. If retail_subtotal exists and is higher than subtotal, use that (hardcoded product discount)
      // 2. If a coupon is applied, use original_subtotal (coupon discount)
      // 3. Fall back to specified totalType
      
      // Check for retail pricing first (highest priority)
      if (totals.retail_subtotal && totals.retail_subtotal > totals.subtotal) {
        compareValue = totals.retail_subtotal;
        this.#logger.debugWithTime(`Using retail_subtotal (${compareValue}) as compare value - product has built-in discount`);
      }
      // Then check for coupon discount
      else if (totals.discount > 0) {
        // If we have original_subtotal, use it, otherwise calculate it
        compareValue = totals.original_subtotal || (totals.subtotal + totals.discount);
        this.#logger.debugWithTime(`Using original_subtotal (${compareValue}) as compare value because a coupon is applied`);
      }
      // Finally fall back to the specified type
      else {
        switch (totalType) {
          case 'retail':
            compareValue = totals.retail_subtotal;
            break;
          case 'recurring':
            compareValue = totals.recurring_total;
            break;
          case 'subtotal_compare':
          case 'original':
          case 'msrp':
            compareValue = totals[totalType] || null;
            break;
          default:
            compareValue = totals.retail_subtotal;
        }
      }
      
      // Special case: If retail_subtotal exists AND coupon is applied, show the higher of the two
      if (totals.retail_subtotal && totals.discount > 0) {
        const couponCompareValue = totals.original_subtotal || (totals.subtotal + totals.discount);
        if (totals.retail_subtotal > couponCompareValue) {
          compareValue = totals.retail_subtotal;
          this.#logger.debugWithTime(`Using retail_subtotal (${compareValue}) as it's higher than original_subtotal with coupon`);
        } else {
          compareValue = couponCompareValue;
          this.#logger.debugWithTime(`Using original_subtotal (${compareValue}) as it's higher than retail_subtotal`);
        }
      }
      
      // Special handling for diagonal-line style elements
      const hasStyleAttr = element.hasAttribute('data-style');
      const style = element.getAttribute('data-style');
      const isDiagonalLine = style === 'diagonal-line';
      
      // Log details about the element for debugging
      this.#logger.debugWithTime(`Element ${element.outerHTML} has style? ${hasStyleAttr}, style=${style}, isDiagonal=${isDiagonalLine}`);
      this.#logger.debugWithTime(`Compare value: ${compareValue}, Total: ${totals.total}, Should show? ${compareValue && compareValue > totals.total}`);
      
      // Set a data attribute with the compare value for debugging
      element.setAttribute('data-compare-value', compareValue || 'none');
      
      // Different handling based on styling of the element
      if (isDiagonalLine) {
        if (compareValue && compareValue > totals.total) {
          // For diagonal-line style, add the "diagonal-strike" class instead of hiding
          element.classList.add('diagonal-strike');
          element.textContent = this.#formatPrice(compareValue);
          element.classList.remove('hide');
          this.#logger.debugWithTime(`Updated diagonal-line compare-total to: ${this.#formatPrice(compareValue)}`);
        } else {
          // Hide if no valid compare value
          element.classList.remove('diagonal-strike');
          element.classList.add('hide');
        }
      } else {
        // Standard handling for other elements
        if (compareValue && compareValue > totals.total) {
          element.textContent = this.#formatPrice(compareValue);
          element.classList.remove('hide');
          this.#logger.debugWithTime(`Updated compare-total to: ${this.#formatPrice(compareValue)}`);
        } else {
          // Hide the element if there's no compare value or it's not greater than the current total
          element.classList.add('hide');
          this.#logger.debugWithTime(`Hiding compare-total element: compareValue=${compareValue}, total=${totals.total}`);
        }
      }
    });
  }

  /**
   * Find all elements with a specific data attribute across all summary containers
   * @param {string} attribute - The data attribute to search for
   * @returns {NodeList} - All matching elements
   */
  #findAllSummaryElements(attribute) {
    return document.querySelectorAll(`[${attribute}]`);
  }

  /**
   * Refresh the cart display and re-find all elements
   * This can be called after dynamic content is loaded or when the viewport changes
   */
  refresh() {
    this.#logger.infoWithTime('Manually refreshing cart display');
    this.#initCartDisplay();
  }
} 