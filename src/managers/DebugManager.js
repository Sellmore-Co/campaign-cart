/**
 * DebugManager - Provides debugging tools for developers
 * 
 * This class provides debugging tools for developers, including a mini-cart widget
 * that can be toggled via console commands.
 */

import { DebugUtils } from '../utils/DebugUtils.js';

export class DebugManager {
  #app;
  #logger;
  #miniCartVisible = false;
  #miniCartElement = null;
  #debugBarElement = null;
  #isDebugMode = false;

  constructor(app) {
    this.#app = app;
    this.#logger = app.logger.createModuleLogger('DEBUG');
    this.#isDebugMode = DebugUtils.initDebugMode();
    this.#init();
    this.#logger.info('DebugManager initialized');
  }

  #init() {
    // Expose debug methods to window object
    window.showMiniCart = () => this.#showMiniCart();
    window.hideMiniCart = () => this.#hideMiniCart();
    window.toggleMiniCart = () => this.#toggleMiniCart();
    window.toggleXray = (enabled) => this.#toggleXray(enabled);

    // Check for URL parameter ?debugger=true
    if (this.#isDebugMode) {
      this.#logger.info('Debug mode activated via URL parameter');
      this.#createDebugBar();
      
      // Show mini-cart if it was previously visible
      if (localStorage.getItem('os_debug_mini_cart_visible') === 'true') {
        this.#showMiniCart();
      }
    }

    this.#app.state?.subscribe('cart', () => {
      if (this.#miniCartVisible) this.#updateMiniCart();
    });

    this.#logger.debug('Debug methods exposed to window object');
  }

  #createDebugBar() {
    if (this.#debugBarElement) return;

    const debugBar = document.createElement('div');
    debugBar.className = 'os-debug-bar';

    // Left section with title
    const leftSection = document.createElement('div');
    leftSection.className = 'os-debug-bar-left';
    
    const title = document.createElement('span');
    title.className = 'os-debug-bar-title';
    title.textContent = '29next Debug Tools';
    
    leftSection.appendChild(title);

    // Right section with controls
    const rightSection = document.createElement('div');
    rightSection.className = 'os-debug-bar-controls';

    // X-ray toggle
    const xrayControl = document.createElement('div');
    xrayControl.className = 'os-debug-bar-control';
    
    const xrayLabel = document.createElement('span');
    xrayLabel.textContent = 'X-ray View';
    
    const xrayToggle = document.createElement('label');
    xrayToggle.className = 'os-debug-bar-toggle';
    
    const xrayCheckbox = document.createElement('input');
    xrayCheckbox.type = 'checkbox';
    xrayCheckbox.checked = DebugUtils.isXrayEnabled();
    xrayCheckbox.addEventListener('change', () => this.#toggleXray(xrayCheckbox.checked));
    
    const xraySlider = document.createElement('span');
    xraySlider.className = 'os-debug-bar-slider';
    
    xrayToggle.append(xrayCheckbox, xraySlider);
    xrayControl.append(xrayLabel, xrayToggle);

    // Mini-cart toggle
    const cartControl = document.createElement('div');
    cartControl.className = 'os-debug-bar-control';
    
    const cartButton = document.createElement('button');
    cartButton.className = 'os-debug-bar-button';
    cartButton.textContent = 'Toggle Mini-Cart';
    cartButton.addEventListener('click', () => this.#toggleMiniCart());
    
    cartControl.appendChild(cartButton);

    // Add controls to right section
    rightSection.append(xrayControl, cartControl);

    // Add sections to debug bar
    debugBar.append(leftSection, rightSection);

    // Add debug bar to document
    document.body.appendChild(debugBar);
    this.#debugBarElement = debugBar;
  }

  #toggleXray(enabled) {
    const isEnabled = DebugUtils.toggleXray(enabled);
    
    // Update checkbox if it exists
    if (this.#debugBarElement) {
      const checkbox = this.#debugBarElement.querySelector('input[type="checkbox"]');
      if (checkbox) checkbox.checked = isEnabled;
    }
    
    this.#logger.info(`X-ray view ${isEnabled ? 'enabled' : 'disabled'}`);
    return isEnabled;
  }

  #showMiniCart() {
    if (this.#miniCartVisible) {
      this.#logger.debug('Mini-cart already visible');
      return;
    }

    this.#logger.info('Showing mini-cart widget');
    this.#miniCartElement ??= this.#createMiniCartElement();
    this.#miniCartElement.style.display = 'block';
    this.#miniCartVisible = true;
    localStorage.setItem('os_debug_mini_cart_visible', 'true');
    this.#updateMiniCart();
  }

  #hideMiniCart() {
    if (!this.#miniCartVisible) {
      this.#logger.debug('Mini-cart already hidden');
      return;
    }

    this.#logger.info('Hiding mini-cart widget');
    if (this.#miniCartElement) {
      this.#miniCartElement.style.display = 'none';
    }
    this.#miniCartVisible = false;
    localStorage.setItem('os_debug_mini_cart_visible', 'false');
  }

  #toggleMiniCart() {
    this.#miniCartVisible ? this.#hideMiniCart() : this.#showMiniCart();
  }

  #createMiniCartElement() {
    const miniCart = document.createElement('div');
    miniCart.className = 'os-debug-mini-cart';
    miniCart.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 300px;
      max-height: 400px;
      overflow-y: auto;
      background-color: white;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 14px;
      display: none;
    `;

    const header = document.createElement('div');
    header.className = 'os-debug-mini-cart-header';
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 15px;
      background-color: #f5f5f5;
      border-bottom: 1px solid #eee;
    `;

    const title = document.createElement('div');
    title.className = 'os-debug-mini-cart-title';
    title.textContent = 'Debug Mini-Cart';
    title.style.fontWeight = '600';

    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.alignItems = 'center';

    const refreshButton = document.createElement('button');
    refreshButton.className = 'os-debug-mini-cart-refresh';
    refreshButton.textContent = '↻';
    refreshButton.title = 'Refresh cart data';
    refreshButton.style.cssText = `
      background: none;
      border: none;
      font-size: 16px;
      cursor: pointer;
      padding: 0 8px;
      line-height: 1;
      color: #666;
    `;
    refreshButton.addEventListener('click', () => {
      this.#updateMiniCart();
      this.#logger.info('Mini-cart data refreshed manually');
    });

    const closeButton = document.createElement('button');
    closeButton.className = 'os-debug-mini-cart-close';
    closeButton.textContent = '×';
    closeButton.style.cssText = `
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      padding: 0;
      line-height: 1;
    `;
    closeButton.addEventListener('click', () => this.#hideMiniCart());

    buttonContainer.append(refreshButton, closeButton);
    header.append(title, buttonContainer);

    const content = document.createElement('div');
    content.className = 'os-debug-mini-cart-content';
    content.style.padding = '15px';

    const footer = document.createElement('div');
    footer.className = 'os-debug-mini-cart-footer';
    footer.style.cssText = `
      padding: 10px 15px;
      background-color: #f5f5f5;
      border-top: 1px solid #eee;
      font-size: 12px;
      color: #666;
      text-align: center;
    `;
    footer.textContent = 'Use window.hideMiniCart() to hide this widget';

    miniCart.append(header, content, footer);
    document.body.appendChild(miniCart);

    return miniCart;
  }

  #updateMiniCart() {
    if (!this.#miniCartElement) return;

    const content = this.#miniCartElement.querySelector('.os-debug-mini-cart-content');
    if (!content) return;

    const cart = this.#app.state?.getState('cart');
    if (!cart) {
      content.innerHTML = '<div style="color: #999; text-align: center;">Cart data not available</div>';
      return;
    }

    this.#logger.debug('Updating mini-cart with cart data:', cart);

    const formatPrice = price => this.#app.campaign?.formatPrice(price) ?? `$${price.toFixed(2)}`;
    let html = '';

    if (!cart.items?.length) {
      html += '<div style="color: #999; text-align: center; margin-bottom: 15px;">Cart is empty</div>';
    } else {
      html += '<div style="margin-bottom: 15px;">';
      html += '<div style="font-weight: 600; margin-bottom: 10px;">Items:</div>';
      html += '<ul style="list-style: none; padding: 0; margin: 0;">';
      cart.items.forEach(item => {
        // Check if item is marked as an upsell
        const isUpsell = !!item.is_upsell;
        
        // Create upsell badge if needed
        const upsellBadge = isUpsell ? 
          `<span style="display: inline-block; background-color: #4CAF50; color: white; font-size: 10px; padding: 2px 5px; border-radius: 3px; margin-left: 5px;">UPSELL</span>` : 
          '';
        
        html += `
          <li style="padding: 5px 0; border-bottom: 1px solid #eee; ${isUpsell ? 'background-color: rgba(76, 175, 80, 0.1);' : ''}">
            <div style="display: flex; justify-content: space-between;">
              <div style="font-weight: 500;">${item.name}${upsellBadge}</div>
              <div>${item.quantity} × ${formatPrice(item.price)}</div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 5px;">
              <div style="color: #666; font-size: 12px;">
                ID: ${item.id}
                ${isUpsell ? '<span style="color: #4CAF50; margin-left: 5px;">✓ is_upsell=true</span>' : ''}
              </div>
              <div style="font-weight: 500;">${formatPrice(item.price * item.quantity)}</div>
            </div>
          </li>
        `;
      });
      html += '</ul></div>';
    }

    if (cart.totals) {
      html += '<div>';
      html += '<div style="font-weight: 600; margin-bottom: 10px;">Totals:</div>';
      html += '<ul style="list-style: none; padding: 0; margin: 0;">';
      html += `
        <li style="display: flex; justify-content: space-between; padding: 3px 0;">
          <div>Subtotal:</div>
          <div>${formatPrice(cart.totals.subtotal)}</div>
        </li>
      `;
      if (cart.totals.retail_subtotal > cart.totals.subtotal) {
        html += `
          <li style="display: flex; justify-content: space-between; padding: 3px 0;">
            <div>Retail Subtotal:</div>
            <div>${formatPrice(cart.totals.retail_subtotal)}</div>
          </li>
        `;
        if (cart.totals.savings) {
          html += `
            <li style="display: flex; justify-content: space-between; padding: 3px 0; color: #e53935;">
              <div>Savings:</div>
              <div>${formatPrice(cart.totals.savings)} (${Math.round(cart.totals.savings_percentage)}%)</div>
            </li>
          `;
        }
      }
      if (cart.totals.shipping > 0) {
        html += `
          <li style="display: flex; justify-content: space-between; padding: 3px 0;">
            <div>Shipping:</div>
            <div>${formatPrice(cart.totals.shipping)}</div>
          </li>
        `;
      }
      if (cart.totals.recurring_total > 0) {
        html += `
          <li style="display: flex; justify-content: space-between; padding: 3px 0; color: #2196f3;">
            <div>Recurring Total:</div>
            <div>${formatPrice(cart.totals.recurring_total)}</div>
          </li>
        `;
      }
      html += `
        <li style="display: flex; justify-content: space-between; padding: 3px 0; font-weight: 600; margin-top: 5px; border-top: 1px solid #eee;">
          <div>Total:</div>
          <div>${formatPrice(cart.totals.total)}</div>
        </li>
      `;
      html += '</ul></div>';
    } else {
      html += '<div style="color: #999; text-align: center; margin-bottom: 15px;">Cart totals not available</div>';
    }

    content.innerHTML = html;
  }
}