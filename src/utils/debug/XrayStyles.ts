/**
 * X-Ray Styles Configuration
 * Structured system for visualizing data-next attributes
 */

export interface XrayAttributeConfig {
  selector: string;
  color: string;
  label?: string;
  labelPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  description?: string;
}

export interface XrayStyleConfig {
  attributes: XrayAttributeConfig[];
  baseStyles: string;
  hoverStyles: string;
  activeStateStyles: string;
}

export const xrayConfig: XrayStyleConfig = {
  attributes: [
    // Display attributes
    {
      selector: '[data-next-display]',
      color: '#4ecdc4',
      description: 'Display binding'
    },
    
    // Visibility attributes
    {
      selector: '[data-next-show]',
      color: '#ffe66d',
      description: 'Conditional visibility'
    },
    
    // Checkout attributes
    {
      selector: '[data-next-checkout]',
      color: '#ff6b6b',
      description: 'Checkout element'
    },
    
    // Selector attributes
    {
      selector: '[data-next-selector-id]',
      color: '#a8e6cf',
      label: 'attr(data-next-selector-id)',
      labelPosition: 'top-right',
      description: 'Package selector'
    },
    
    // Selector cards
    {
      selector: '[data-next-selector-card]',
      color: '#95e1d3',
      description: 'Selector card'
    },
    
    // Cart status
    {
      selector: '[data-next-in-cart]',
      color: '#c7ceea',
      description: 'Cart status'
    },
    
    // Selection status
    {
      selector: '[data-next-selected]',
      color: '#ffa502',
      description: 'Selection status'
    },
    
    // Package IDs
    {
      selector: '[data-next-package-id]',
      color: '#ff8b94',
      label: '"PKG " attr(data-next-package-id)',
      labelPosition: 'top-left',
      description: 'Package ID'
    },
    
    // Shipping
    {
      selector: '[data-next-shipping-id]',
      color: '#b4a7d6',
      label: '"SHIP " attr(data-next-shipping-id)',
      labelPosition: 'bottom-right',
      description: 'Shipping method'
    },
    
    // Package sync
    {
      selector: '[data-next-package-sync]',
      color: '#ff7979',
      label: '"SYNC " attr(data-next-package-sync)',
      labelPosition: 'top-right',
      description: 'Package sync'
    },
    
    // Bump/Toggle
    {
      selector: '[data-next-bump]',
      color: '#6c5ce7',
      description: 'Bump/toggle element'
    },
    
    // Toggle specific
    {
      selector: '[data-next-toggle]',
      color: '#a29bfe',
      description: 'Toggle control'
    },
    
    // Active states
    {
      selector: '[data-next-active]',
      color: '#fdcb6e',
      description: 'Active element'
    },
    
    // Payment methods
    {
      selector: '[data-next-payment-method]',
      color: '#e17055',
      description: 'Payment method'
    },
    
    // Form fields
    {
      selector: '[data-next-checkout-field]',
      color: '#74b9ff',
      description: 'Checkout field'
    },
    
    // Express checkout
    {
      selector: '[data-next-express-checkout]',
      color: '#00b894',
      description: 'Express checkout'
    },
    
    // Quantity
    {
      selector: '[data-next-quantity]',
      color: '#fab1a0',
      label: '"QTY " attr(data-next-quantity)',
      labelPosition: 'bottom-left',
      description: 'Quantity'
    },
    
    // Cart selector
    {
      selector: '[data-next-cart-selector]',
      color: '#81ecec',
      description: 'Cart selector'
    },
    
    // Selection mode
    {
      selector: '[data-next-selection-mode]',
      color: '#55a3ff',
      label: 'attr(data-next-selection-mode)',
      labelPosition: 'top-left',
      description: 'Selection mode'
    }
  ],
  
  baseStyles: `
    /* X-RAY BASE STYLES */
    /* Only apply position relative to elements with data-next attributes */
    .debug-xray-active [data-next-display],
    .debug-xray-active [data-next-show],
    .debug-xray-active [data-next-checkout],
    .debug-xray-active [data-next-selector-id],
    .debug-xray-active [data-next-cart-selector],
    .debug-xray-active [data-next-selection-mode],
    .debug-xray-active [data-next-shipping-id],
    .debug-xray-active [data-next-selector-card],
    .debug-xray-active [data-next-package-id],
    .debug-xray-active [data-next-quantity],
    .debug-xray-active [data-next-selected],
    .debug-xray-active [data-next-await],
    .debug-xray-active [data-next-in-cart],
    .debug-xray-active [data-next-express-checkout],
    .debug-xray-active [data-next-payment-method],
    .debug-xray-active [data-next-checkout-field],
    .debug-xray-active [data-next-payment-form],
    .debug-xray-active [data-next-bump],
    .debug-xray-active [data-next-toggle],
    .debug-xray-active [data-next-active],
    .debug-xray-active [data-next-package-sync] {
      position: relative !important;
    }
  `,
  
  hoverStyles: `
    /* Hover tooltips */
    .debug-xray-active [data-next-display]:hover::after,
    .debug-xray-active [data-next-show]:hover::after,
    .debug-xray-active [data-next-selector-card]:hover::after,
    .debug-xray-active [data-next-package-id]:hover::after,
    .debug-xray-active [data-next-shipping-id]:hover::after,
    .debug-xray-active [data-next-bump]:hover::after,
    .debug-xray-active [data-next-toggle]:hover::after {
      position: absolute !important;
      z-index: 99999 !important;
      pointer-events: none !important;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace !important;
      font-size: 11px !important;
      padding: 6px 10px !important;
      border-radius: 4px !important;
      white-space: nowrap !important;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15) !important;
      bottom: 100% !important;
      left: 0 !important;
      margin-bottom: 4px !important;
      backdrop-filter: blur(8px) !important;
    }
    
    .debug-xray-active [data-next-display]:hover::after {
      content: "display: " attr(data-next-display) !important;
      background: rgba(78, 205, 196, 0.95) !important;
      color: white !important;
    }
    
    .debug-xray-active [data-next-show]:hover::after {
      content: "show: " attr(data-next-show) !important;
      background: rgba(255, 230, 109, 0.95) !important;
      color: #333 !important;
    }
    
    .debug-xray-active [data-next-selector-card]:hover::after {
      content: "pkg:" attr(data-next-package-id) " | selected:" attr(data-next-selected) " | in-cart:" attr(data-next-in-cart) !important;
      background: rgba(149, 225, 211, 0.95) !important;
      color: #333 !important;
    }
    
    .debug-xray-active [data-next-package-id]:hover::after {
      content: "Package #" attr(data-next-package-id) " | Qty: " attr(data-next-quantity) !important;
      background: rgba(255, 139, 148, 0.95) !important;
      color: white !important;
    }
    
    .debug-xray-active [data-next-shipping-id]:hover::after {
      content: "Shipping Method #" attr(data-next-shipping-id) !important;
      background: rgba(180, 167, 214, 0.95) !important;
      color: white !important;
    }
    
    .debug-xray-active [data-next-bump]:hover::after,
    .debug-xray-active [data-next-toggle]:hover::after {
      content: "Toggle | Active: " attr(data-next-active) " | In Cart: " attr(data-next-in-cart) !important;
      background: rgba(108, 92, 231, 0.95) !important;
      color: white !important;
    }
  `,
  
  activeStateStyles: `
    /* Special highlighting for active states */
    .debug-xray-active [data-next-selected="true"] {
      outline-width: 2px !important;
      outline-style: solid !important;
      box-shadow: 0 0 0 3px rgba(255, 165, 2, 0.2) !important;
    }
    
    .debug-xray-active [data-next-in-cart="true"] {
      background-color: rgba(199, 206, 234, 0.1) !important;
    }
    
    .debug-xray-active [data-next-active="true"] {
      background-color: rgba(253, 203, 110, 0.1) !important;
    }
    
    /* Animation for newly added items */
    @keyframes xray-pulse {
      0% { outline-color: var(--xray-color); }
      50% { outline-color: transparent; }
      100% { outline-color: var(--xray-color); }
    }
    
    .debug-xray-active [data-next-in-cart="true"][data-just-added] {
      animation: xray-pulse 1s ease-in-out 3;
    }
  `
};

export function generateXrayStyles(): string {
  return `
    /* X-RAY WIREFRAME CSS - PURE CSS, NO JS */

    /* Subtle outlines for all data attributes */
    [data-next-display],
    [data-next-show],
    [data-next-checkout],
    [data-next-selector-id],
    [data-next-cart-selector],
    [data-next-selection-mode],
    [data-next-shipping-id],
    [data-next-selector-card],
    [data-next-package-id],
    [data-next-quantity],
    [data-next-selected],
    [data-next-await],
    [data-next-in-cart],
    [data-next-express-checkout],
    [data-next-payment-method],
    [data-next-checkout-field],
    [data-next-payment-form] {
      position: relative !important;
      outline: 1px dashed rgba(0, 0, 0, 0.3) !important;
      outline-offset: -1px !important;
    }

    /* Color coding for different attribute types */
    [data-next-display] {
      outline-color: #4ecdc4 !important;
    }

    [data-next-show] {
      outline-color: #ffe66d !important;
    }

    [data-next-checkout] {
      outline-color: #ff6b6b !important;
    }

    [data-next-selector-id] {
      outline-color: #a8e6cf !important;
    }

    [data-next-selector-card] {
      outline-color: #95e1d3 !important;
    }

    [data-next-in-cart] {
      outline-color: #c7ceea !important;
    }

    [data-next-selected] {
      outline-color: #ffa502 !important;
    }

    [data-next-package-id] {
      outline-color: #ff8b94 !important;
    }

    /* Small corner labels */
    [data-next-selector-id]::before {
      content: attr(data-next-selector-id) !important;
      position: absolute !important;
      top: 2px !important;
      right: 2px !important;
      background: rgba(168, 230, 207, 0.9) !important;
      color: #333 !important;
      padding: 2px 4px !important;
      font-size: 9px !important;
      font-family: monospace !important;
      line-height: 1 !important;
      border-radius: 2px !important;
      pointer-events: none !important;
      z-index: 10 !important;
    }

    [data-next-package-id]::before {
      content: "PKG " attr(data-next-package-id) !important;
      position: absolute !important;
      top: 2px !important;
      left: 2px !important;
      background: rgba(255, 139, 148, 0.9) !important;
      color: white !important;
      padding: 2px 4px !important;
      font-size: 9px !important;
      font-family: monospace !important;
      font-weight: bold !important;
      line-height: 1 !important;
      border-radius: 2px !important;
      pointer-events: none !important;
      z-index: 10 !important;
    }

    /* Special highlighting for active states */
    [data-next-selected="true"] {
      outline-width: 2px !important;
      outline-style: solid !important;
    }

    [data-next-in-cart="true"] {
      background-color: rgba(199, 206, 234, 0.1) !important;
    }

    /* Hover tooltips */
    [data-next-display]:hover::after,
    [data-next-show]:hover::after,
    [data-next-selector-card]:hover::after {
      position: absolute !important;
      z-index: 99999 !important;
      pointer-events: none !important;
      font-family: monospace !important;
      font-size: 10px !important;
      padding: 4px 6px !important;
      border-radius: 3px !important;
      white-space: nowrap !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
      bottom: 100% !important;
      left: 0 !important;
      margin-bottom: 4px !important;
    }

    [data-next-display]:hover::after {
      content: "display: " attr(data-next-display) !important;
      background: #4ecdc4 !important;
      color: white !important;
    }

    [data-next-show]:hover::after {
      content: "show: " attr(data-next-show) !important;
      background: #ffe66d !important;
      color: #333 !important;
    }

    [data-next-selector-card]:hover::after {
      content: "pkg:" attr(data-next-package-id) " | selected:" attr(data-next-selected) " | in-cart:" attr(data-next-in-cart) !important;
      background: #95e1d3 !important;
      color: #333 !important;
    }
  `;
}


export class XrayManager {
  private static styleElement: HTMLStyleElement | null = null;
  private static isActive = false;
  private static readonly STORAGE_KEY = 'debug-xray-active';
  
  static initialize(): void {
    // Check localStorage on initialization
    const savedState = localStorage.getItem(this.STORAGE_KEY);
    if (savedState === 'true') {
      this.activate();
    }
  }
  
  static toggle(): boolean {
    if (this.isActive) {
      this.deactivate();
    } else {
      this.activate();
    }
    return this.isActive;
  }
  
  static activate(): void {
    if (this.isActive) return;
    
    // Create and inject styles
    this.styleElement = document.createElement('style');
    this.styleElement.id = 'debug-xray-styles';
    this.styleElement.textContent = generateXrayStyles();
    document.head.appendChild(this.styleElement);
    
    // Add active class to body
    document.body.classList.add('debug-xray-active');
    
    this.isActive = true;
    
    // Save to localStorage
    localStorage.setItem(this.STORAGE_KEY, 'true');
    
    // Log activation
    console.log('🔍 X-Ray mode activated');
  }
  
  static deactivate(): void {
    if (!this.isActive) return;
    
    // Remove styles
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }
    
    // Remove active class
    document.body.classList.remove('debug-xray-active');
    
    this.isActive = false;
    
    // Save to localStorage
    localStorage.setItem(this.STORAGE_KEY, 'false');
    
    // Log deactivation
    console.log('🔍 X-Ray mode deactivated');
  }
  
  static isXrayActive(): boolean {
    return this.isActive;
  }
}