import { u as useCartStore, E as EventBus, d as configStore, b as useCheckoutStore, a as useCampaignStore, L as Logger } from "./index-B40VgCtc.js";
class DebugEventManager {
  constructor() {
    this.eventLog = [];
    this.maxEvents = 100;
    this.initializeEventCapture();
  }
  initializeEventCapture() {
    const events = [
      "next:cart-updated",
      "next:checkout-step",
      "next:item-added",
      "next:item-removed",
      "next:timer-expired",
      "next:validation-error",
      "next:payment-success",
      "next:payment-error"
    ];
    events.forEach((eventType) => {
      document.addEventListener(eventType, (e) => {
        this.logEvent(eventType.replace("next:", ""), e.detail, "CustomEvent");
      });
    });
    this.interceptFetch();
  }
  interceptFetch() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = args[0].toString();
      if (url.includes("29next.com") || url.includes("campaigns.")) {
        this.logEvent("api-request", {
          url,
          method: args[1]?.method || "GET"
        }, "API");
      }
      return originalFetch.apply(window, args);
    };
  }
  logEvent(type, data, source) {
    this.eventLog.push({
      timestamp: /* @__PURE__ */ new Date(),
      type,
      data,
      source
    });
    if (this.eventLog.length > this.maxEvents) {
      this.eventLog.shift();
    }
  }
  getEvents(limit) {
    const events = limit ? this.eventLog.slice(-limit) : this.eventLog;
    return events.reverse();
  }
  clearEvents() {
    this.eventLog = [];
  }
  exportEvents() {
    return JSON.stringify(this.eventLog, null, 2);
  }
}
class EnhancedDebugUI {
  static createOverlayHTML(panels, activePanel, isExpanded, activePanelTab) {
    const activePanelData = panels.find((p) => p.id === activePanel);
    return `
      <div class="enhanced-debug-overlay ${isExpanded ? "expanded" : "collapsed"}">
        ${this.createBottomBar(isExpanded)}
        ${isExpanded ? this.createExpandedContent(panels, activePanelData, activePanel, activePanelTab) : ""}
      </div>
    `;
  }
  static createBottomBar(isExpanded) {
    return `
      <div class="debug-bottom-bar">
        <div class="debug-logo-section">
          ${this.get29NextLogo()}
          <span class="debug-title">Debug Tools</span>
          <div class="debug-status">
            <div class="status-indicator active"></div>
            <span class="status-text">Active</span>
          </div>
        </div>
        
        <div class="debug-quick-stats">
          <div class="stat-item">
            <span class="stat-value" data-debug-stat="cart-items">0</span>
            <span class="stat-label">Items</span>
          </div>
          <div class="stat-item">
            <span class="stat-value" data-debug-stat="cart-total">$0.00</span>
            <span class="stat-label">Total</span>
          </div>
          <div class="stat-item">
            <span class="stat-value" data-debug-stat="enhanced-elements">0</span>
            <span class="stat-label">Enhanced</span>
          </div>
        </div>

        <div class="debug-controls">
          <button class="debug-control-btn" data-action="toggle-mini-cart" title="Toggle Mini Cart">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17,18C15.89,18 15,18.89 15,20A2,2 0 0,0 17,22A2,2 0 0,0 19,20C19,18.89 18.1,18 17,18M1,2V4H3L6.6,11.59L5.24,14.04C5.09,14.32 5,14.65 5,15A2,2 0 0,0 7,17H19V15H7.42A0.25,0.25 0 0,1 7.17,14.75C7.17,14.7 7.18,14.66 7.2,14.63L8.1,13H15.55C16.3,13 16.96,12.58 17.3,11.97L20.88,5.5C20.95,5.34 21,5.17 21,5A1,1 0 0,0 20,4H5.21L4.27,2M7,18C5.89,18 5,18.89 5,20A2,2 0 0,0 7,22A2,2 0 0,0 9,20C9,18.89 8.1,18 7,18Z"/>
            </svg>
          </button>
          <button class="debug-control-btn" data-action="clear-cart" title="Clear Cart">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
          <button class="debug-control-btn" data-action="toggle-xray" title="Toggle X-Ray View">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 3C3.89 3 3 3.9 3 5V19C3 20.11 3.89 21 5 21H19C20.11 21 21 20.11 21 19V5C21 3.9 20.11 3 19 3H5M5 5H19V19H5V5M7 7V9H9V7H7M11 7V9H13V7H11M15 7V9H17V7H15M7 11V13H9V11H7M11 11V13H13V11H11M15 11V13H17V11H15M7 15V17H9V15H7M11 15V17H13V15H11M15 15V17H17V15H15Z"/>
            </svg>
          </button>
          <button class="debug-control-btn" data-action="export-data" title="Export Debug Data">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"/>
            </svg>
          </button>
          <button class="debug-expand-btn" data-action="toggle-expand" title="${isExpanded ? "Collapse" : "Expand"}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" class="expand-icon ${isExpanded ? "rotated" : ""}">
              <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
            </svg>
          </button>
          <button class="debug-control-btn close-btn" data-action="close" title="Close Debug Tools">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }
  static createExpandedContent(panels, activePanel, activePanelId, activePanelTab) {
    return `
      <div class="debug-expanded-content">
        <div class="debug-sidebar">
          ${this.createPanelTabs(panels, activePanelId)}
        </div>
        
        <div class="debug-main-content">
          ${this.createPanelContent(activePanel, activePanelTab)}
        </div>
      </div>
    `;
  }
  static createPanelTabs(panels, activePanel) {
    return `
      <div class="debug-panel-tabs">
        ${panels.map((panel) => `
          <button class="debug-panel-tab ${panel.id === activePanel ? "active" : ""}" 
                  data-panel="${panel.id}">
            <span class="tab-icon">${panel.icon}</span>
            <span class="tab-label">${panel.title}</span>
            ${panel.id === "events" ? '<div class="tab-badge" data-debug-badge="events">0</div>' : ""}
          </button>
        `).join("")}
      </div>
    `;
  }
  static createPanelContent(activePanel, activePanelTab) {
    if (!activePanel) return "";
    const tabs = activePanel.getTabs?.() || [];
    const hasHorizontalTabs = tabs.length > 0;
    if (hasHorizontalTabs) {
      const activeTabId = activePanelTab || tabs[0]?.id;
      const activeTab = tabs.find((tab) => tab.id === activeTabId) || tabs[0];
      return `
        <div class="debug-panel-container">
          <div class="panel-header">
            <div class="panel-title">
              <span class="panel-icon">${activePanel.icon}</span>
              <h2>${activePanel.title}</h2>
            </div>
            ${activePanel.getActions ? `
              <div class="panel-actions">
                ${activePanel.getActions().map((action) => `
                  <button class="panel-action-btn ${action.variant || "primary"}" 
                          data-panel-action="${action.label}">
                    ${action.label}
                  </button>
                `).join("")}
              </div>
            ` : ""}
          </div>
          
          <div class="panel-horizontal-tabs">
            ${tabs.map((tab) => `
              <button class="horizontal-tab ${tab.id === activeTabId ? "active" : ""}" 
                      data-panel-tab="${tab.id}">
                ${tab.icon ? `<span class="tab-icon">${tab.icon}</span>` : ""}
                <span class="tab-label">${tab.label}</span>
              </button>
            `).join("")}
          </div>
          
          <div class="panel-content">
            ${activeTab ? activeTab.getContent() : ""}
          </div>
        </div>
      `;
    }
    return `
      <div class="debug-panel-container">
        <div class="panel-header">
          <div class="panel-title">
            <span class="panel-icon">${activePanel.icon}</span>
            <h2>${activePanel.title}</h2>
          </div>
          ${activePanel.getActions ? `
            <div class="panel-actions">
              ${activePanel.getActions().map((action) => `
                <button class="panel-action-btn ${action.variant || "primary"}" 
                        data-panel-action="${action.label}">
                  ${action.label}
                </button>
              `).join("")}
            </div>
          ` : ""}
        </div>
        <div class="panel-content">
          ${activePanel.getContent()}
        </div>
      </div>
    `;
  }
  static get29NextLogo() {
    return `
      <svg class="debug-logo" width="32" height="32" viewBox="0 0 518.2 99" fill="none">
        <g>
          <path d="M17.5,0c3.4,0,6.8,1,9.6,2.9l58.8,40v12.6L20.7,12.6c-1-0.6-2.1-1-3.2-1c-3.2,0-5.8,2.6-5.8,5.8v64c0,3.2,2.6,5.8,5.8,5.8h3.1V99h-3.1C7.8,99,0,91.2,0,81.5v-64C0,7.8,7.8,0,17.5,0z" fill="currentColor"/>
          <path d="M95.4,99c-3.4,0-6.8-1-9.6-2.9L27,56.1V43.5l65.2,42.8c1,0.6,2.1,1,3.2,1c3.2,0,5.8-2.6,5.8-5.8v-64c0-3.2-2.6-5.8-5.8-5.8h-3.1V0h3.1c9.7,0,17.5,7.8,17.5,17.5v64C112.9,91.2,105.1,99,95.4,99z" fill="currentColor"/>
        </g>
        <g>
          <path d="M161.1,69.5c1.9-1.9,3.8-3.5,5.9-4.9l10.1-7.5c4.4-3.2,7.9-6.6,10.4-10.2c2.5-3.7,3.8-7.8,3.8-12.5c0-4.6-1-8.7-3.2-12.2c-2.2-3.5-5.2-6.3-9.2-8.3s-8.8-3-14.3-3c-4.8,0-9.1,1-12.9,2.9c-3.8,1.9-6.9,4.4-9.2,7.5c-2.4,3.1-3.9,6.5-4.6,10.1l15,2.6c0.4-1.7,1.1-3.3,2.2-4.7c1.1-1.5,2.4-2.6,4.1-3.5c1.7-0.9,3.6-1.3,5.7-1.3c2.5,0,4.6,0.4,6.3,1.3c1.7,0.9,3,2.1,3.9,3.6c0.9,1.5,1.3,3.2,1.3,5.1c0,1.5-0.4,3.1-1.3,4.7c-0.9,1.6-2,3.1-3.4,4.5c-1.4,1.4-2.8,2.6-4.4,3.7L156,55.6c-3.1,2.1-5.7,4.5-8,7c-2.2,2.6-4,5.1-5.3,7.6s-1.9,4.8-1.9,6.9l0.1,0.1V88h51.5V75h-35.2C158.3,73,159.6,71.1,161.1,69.5z" fill="currentColor"/>
          <path d="M248.3,20.8c-2.2-3.2-5.1-5.7-8.6-7.6c-3.5-1.9-7.8-2.8-12.8-2.8c-5.3,0-10,1-14.2,3.1c-4,2.1-7.1,5-9.3,8.6c-2.2,3.6-3.3,7.8-3.3,12.6c0,4.9,1,9.2,3.1,13c2,3.8,4.9,6.8,8.6,9.1s7.9,3.4,12.6,3.4c4.7,0,8.8-1.2,12.2-3.6c1.7-1.2,3.2-2.6,4.5-4.2c-0.4,6.9-1.8,12.2-4.2,15.9c-3.1,4.9-7.5,7.4-13,7.4c-2.1,0-4.4-0.3-6.9-1.1c-2.5-0.8-4.9-1.9-7.2-3.4L202.7,82c3,2.1,6.4,3.7,10.1,4.9c3.7,1.2,7.5,1.8,11.4,1.8c5.4,0,10-1.1,13.8-3.4s7-5.4,9.4-9.3c2.5-3.9,4.3-8.4,5.5-13.6c1.2-5.2,1.8-10.7,1.8-16.5c0-4.9-0.5-9.5-1.5-13.8C252.2,27.8,250.5,24,248.3,20.8z M237.6,41.9c-1.1,1.9-2.6,3.4-4.4,4.5c-1.9,1.1-4,1.6-6.3,1.6c-2.4,0-4.5-0.5-6.3-1.6c-1.9-1-3.3-2.6-4.4-4.5c-1.1-1.9-1.6-4.1-1.6-6.6s0.5-4.6,1.6-6.5c1.1-1.8,2.6-3.3,4.4-4.4c1.9-1.1,4-1.6,6.3-1.6c2.4,0,4.5,0.5,6.3,1.6c1.8,1,3.3,2.5,4.4,4.4c1.1,1.9,1.6,4,1.6,6.5S238.7,40,237.6,41.9z" fill="currentColor"/>
        </g>
      </svg>
    `;
  }
  static addStyles() {
    console.log("Debug styles loaded via CSS modules");
  }
  static removeStyles() {
    console.log("Debug styles will be cleaned up by DebugStyleLoader");
  }
}
function generateXrayStyles() {
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
const _XrayManager = class _XrayManager {
  static initialize() {
    const savedState = localStorage.getItem(this.STORAGE_KEY);
    if (savedState === "true") {
      this.activate();
    }
  }
  static toggle() {
    if (this.isActive) {
      this.deactivate();
    } else {
      this.activate();
    }
    return this.isActive;
  }
  static activate() {
    if (this.isActive) return;
    this.styleElement = document.createElement("style");
    this.styleElement.id = "debug-xray-styles";
    this.styleElement.textContent = generateXrayStyles();
    document.head.appendChild(this.styleElement);
    document.body.classList.add("debug-xray-active");
    this.isActive = true;
    localStorage.setItem(this.STORAGE_KEY, "true");
    console.log("🔍 X-Ray mode activated");
  }
  static deactivate() {
    if (!this.isActive) return;
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }
    document.body.classList.remove("debug-xray-active");
    this.isActive = false;
    localStorage.setItem(this.STORAGE_KEY, "false");
    console.log("🔍 X-Ray mode deactivated");
  }
  static isXrayActive() {
    return this.isActive;
  }
};
_XrayManager.styleElement = null;
_XrayManager.isActive = false;
_XrayManager.STORAGE_KEY = "debug-xray-active";
let XrayManager = _XrayManager;
class CartPanel {
  constructor() {
    this.id = "cart";
    this.title = "Cart State";
    this.icon = "🛒";
  }
  getContent() {
    const tabs = this.getTabs();
    return tabs[0]?.getContent() || "";
  }
  getTabs() {
    return [
      {
        id: "overview",
        label: "Overview",
        icon: "📊",
        getContent: () => this.getOverviewContent()
      },
      {
        id: "items",
        label: "Items",
        icon: "📦",
        getContent: () => this.getItemsContent()
      },
      {
        id: "raw",
        label: "Raw Data",
        icon: "🔧",
        getContent: () => this.getRawDataContent()
      }
    ];
  }
  getOverviewContent() {
    const cartState = useCartStore.getState();
    return `
      <div class="enhanced-panel">
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon">📦</div>
            <div class="metric-content">
              <div class="metric-value">${cartState.items.length}</div>
              <div class="metric-label">Unique Items</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🔢</div>
            <div class="metric-content">
              <div class="metric-value">${cartState.totalQuantity}</div>
              <div class="metric-label">Total Quantity</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">💰</div>
            <div class="metric-content">
              <div class="metric-value">${cartState.totals.subtotal.formatted}</div>
              <div class="metric-label">Subtotal</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🚚</div>
            <div class="metric-content">
              <div class="metric-value">${cartState.totals.shipping.formatted}</div>
              <div class="metric-label">Shipping</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">📊</div>
            <div class="metric-content">
              <div class="metric-value">${cartState.totals.tax.formatted}</div>
              <div class="metric-label">Tax</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">💳</div>
            <div class="metric-content">
              <div class="metric-value">${cartState.totals.total.formatted}</div>
              <div class="metric-label">Total</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  getItemsContent() {
    const cartState = useCartStore.getState();
    return `
      <div class="enhanced-panel">
        <div class="section">
          ${cartState.items.length === 0 ? `
            <div class="empty-state">
              <div class="empty-icon">🛒</div>
              <div class="empty-text">Cart is empty</div>
              <button class="empty-action" onclick="window.nextDebug.addTestItems()">Add Test Items</button>
            </div>
          ` : `
            <div class="cart-items-list">
              ${cartState.items.map((item) => `
                <div class="cart-item-card">
                  <div class="item-info">
                    <div class="item-title">${item.title}</div>
                    <div class="item-details">
                      Package ID: ${item.packageId} • Price: $${item.price}
                    </div>
                  </div>
                  <div class="item-quantity">
                    <button onclick="window.nextDebug.updateQuantity(${item.packageId}, ${item.quantity - 1})" 
                            class="qty-btn">-</button>
                    <span class="qty-value">${item.quantity}</span>
                    <button onclick="window.nextDebug.updateQuantity(${item.packageId}, ${item.quantity + 1})" 
                            class="qty-btn">+</button>
                  </div>
                  <div class="item-total">$${(item.price * item.quantity).toFixed(2)}</div>
                  <button onclick="window.nextDebug.removeItem(${item.packageId})" 
                          class="remove-btn">×</button>
                </div>
              `).join("")}
            </div>
          `}
        </div>
      </div>
    `;
  }
  getRawDataContent() {
    const cartState = useCartStore.getState();
    return `
      <div class="enhanced-panel">
        <div class="section">
          <div class="json-viewer">
            <pre><code>${JSON.stringify(cartState, null, 2)}</code></pre>
          </div>
        </div>
      </div>
    `;
  }
  getActions() {
    return [
      {
        label: "Clear Cart",
        action: () => useCartStore.getState().clear(),
        variant: "danger"
      },
      {
        label: "Add Test Items",
        action: this.addTestItems,
        variant: "secondary"
      },
      {
        label: "Recalculate",
        action: () => useCartStore.getState().calculateTotals(),
        variant: "primary"
      },
      {
        label: "Export Cart",
        action: this.exportCart,
        variant: "secondary"
      }
    ];
  }
  addTestItems() {
    const cartStore = useCartStore.getState();
    const testItems = [
      { packageId: 999, quantity: 1, price: 19.99, title: "Debug Test Item 1", isUpsell: false },
      { packageId: 998, quantity: 2, price: 29.99, title: "Debug Test Item 2", isUpsell: false },
      { packageId: 997, quantity: 1, price: 9.99, title: "Debug Test Item 3", isUpsell: false }
    ];
    testItems.forEach((item) => cartStore.addItem(item));
  }
  exportCart() {
    const cartState = useCartStore.getState();
    const data = JSON.stringify(cartState, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cart-state-${(/* @__PURE__ */ new Date()).toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
class EventsPanel {
  constructor(events) {
    this.events = events;
    this.id = "events";
    this.title = "Event Timeline";
    this.icon = "📋";
  }
  getContent() {
    const tabs = this.getTabs();
    return tabs[0]?.getContent() || "";
  }
  getTabs() {
    return [
      {
        id: "overview",
        label: "Overview",
        icon: "📊",
        getContent: () => this.getOverviewContent()
      },
      {
        id: "timeline",
        label: "Timeline",
        icon: "⏰",
        getContent: () => this.getTimelineContent()
      },
      {
        id: "analytics",
        label: "Analytics",
        icon: "📈",
        getContent: () => this.getAnalyticsContent()
      }
    ];
  }
  getOverviewContent() {
    const eventTypes = [...new Set(this.events.map((e) => e.type))];
    return `
      <div class="enhanced-panel">
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon">📊</div>
            <div class="metric-content">
              <div class="metric-value">${this.events.length}</div>
              <div class="metric-label">Total Events</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🎯</div>
            <div class="metric-content">
              <div class="metric-value">${eventTypes.length}</div>
              <div class="metric-label">Event Types</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">⏱️</div>
            <div class="metric-content">
              <div class="metric-value">${this.getEventsPerMinute()}</div>
              <div class="metric-label">Events/min</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h3 class="section-title">Event Types</h3>
          <div class="event-types">
            ${eventTypes.map((type) => {
      const count = this.events.filter((e) => e.type === type).length;
      return `
                <div class="event-type-card" onclick="window.nextDebug.filterEvents('${type}')">
                  <div class="event-type-name">${type}</div>
                  <div class="event-type-count">${count}</div>
                </div>
              `;
    }).join("")}
          </div>
        </div>
      </div>
    `;
  }
  getTimelineContent() {
    const recentEvents = this.events.slice(0, 30);
    return `
      <div class="enhanced-panel">
        <div class="section">
          <div class="events-timeline">
            ${recentEvents.length === 0 ? `
              <div class="empty-state">
                <div class="empty-icon">📋</div>
                <div class="empty-text">No events logged yet</div>
              </div>
            ` : recentEvents.map((event) => `
              <div class="timeline-event">
                <div class="event-time">${event.timestamp.toLocaleTimeString()}</div>
                <div class="event-content">
                  <div class="event-header">
                    <span class="event-type-badge">${event.type}</span>
                    <span class="event-source">${event.source}</span>
                  </div>
                  <div class="event-data-preview">
                    ${this.formatEventData(event.data)}
                  </div>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;
  }
  getAnalyticsContent() {
    const eventTypes = [...new Set(this.events.map((e) => e.type))];
    const sourceStats = this.getSourceStatistics();
    return `
      <div class="enhanced-panel">
        <div class="section">
          <h3 class="section-title">Event Distribution</h3>
          <div class="analytics-charts">
            ${eventTypes.map((type) => {
      const count = this.events.filter((e) => e.type === type).length;
      const percentage = this.events.length > 0 ? (count / this.events.length * 100).toFixed(1) : 0;
      return `
                <div class="analytics-bar">
                  <div class="bar-label">${type}</div>
                  <div class="bar-container">
                    <div class="bar-fill" style="width: ${percentage}%"></div>
                    <div class="bar-value">${count} (${percentage}%)</div>
                  </div>
                </div>
              `;
    }).join("")}
          </div>
        </div>
        
        <div class="section">
          <h3 class="section-title">Source Statistics</h3>
          <div class="source-stats">
            ${Object.entries(sourceStats).map(([source, count]) => `
              <div class="source-stat-item">
                <span class="source-name">${source}</span>
                <span class="source-count">${count}</span>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;
  }
  getActions() {
    return [
      {
        label: "Clear Events",
        action: () => this.clearEvents(),
        variant: "danger"
      },
      {
        label: "Export Timeline",
        action: () => this.exportEvents(),
        variant: "secondary"
      },
      {
        label: "Start Recording",
        action: () => this.startRecording(),
        variant: "primary"
      }
    ];
  }
  getEventsPerMinute() {
    const now = /* @__PURE__ */ new Date();
    const oneMinuteAgo = new Date(now.getTime() - 6e4);
    const recentEvents = this.events.filter((e) => e.timestamp > oneMinuteAgo);
    return recentEvents.length;
  }
  getSourceStatistics() {
    const stats = {};
    this.events.forEach((event) => {
      stats[event.source] = (stats[event.source] || 0) + 1;
    });
    return stats;
  }
  formatEventData(data) {
    if (typeof data === "object" && data !== null) {
      const keys = Object.keys(data);
      if (keys.length === 0) return "No data";
      if (keys.length === 1) {
        const firstKey = keys[0];
        return firstKey ? `${firstKey}: ${data[firstKey] || "undefined"}` : "No data";
      }
      return `${keys.slice(0, 2).join(", ")}${keys.length > 2 ? "..." : ""}`;
    }
    return String(data);
  }
  clearEvents() {
    this.events.length = 0;
    document.dispatchEvent(new CustomEvent("debug:update-content"));
  }
  exportEvents() {
    const data = JSON.stringify(this.events, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `debug-events-${(/* @__PURE__ */ new Date()).toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  startRecording() {
    console.log("Event recording started");
  }
}
class EventTimelinePanel {
  constructor() {
    this.id = "event-timeline";
    this.title = "Events";
    this.icon = "⚡";
    this.events = [];
    this.maxEvents = 1e3;
    this.isRecording = true;
    this.filters = {
      types: /* @__PURE__ */ new Set(["dataLayer", "internal", "dom"]),
      sources: /* @__PURE__ */ new Set(),
      search: "",
      timeRange: 30
      // last 30 minutes
    };
    this.startTime = Date.now();
    this.eventBus = EventBus.getInstance();
    this.initializeEventWatching();
  }
  initializeEventWatching() {
    this.watchDataLayer();
    this.watchInternalEvents();
    this.watchDOMEvents();
    this.watchPerformanceEvents();
  }
  watchDataLayer() {
    if (typeof window === "undefined") return;
    window.dataLayer = window.dataLayer || [];
    const originalPush = window.dataLayer.push;
    window.dataLayer.push = (...args) => {
      if (this.isRecording) {
        args.forEach((event) => {
          let source = "GTM DataLayer";
          if (event.event && event.event.startsWith("gtm_")) {
            source = "GTM Internal";
          } else if (event.timestamp || event.event_context) {
            source = "Analytics Manager";
          }
          this.addEvent({
            type: "dataLayer",
            name: event.event || "dataLayer.push",
            data: event,
            source
          });
        });
      }
      return originalPush.apply(window.dataLayer, args);
    };
    if (window.dataLayer.length > 0) {
      window.dataLayer.forEach((event, index) => {
        if (typeof event === "object" && event.event) {
          this.addEvent({
            type: "dataLayer",
            name: event.event,
            data: event,
            source: "GTM DataLayer (existing)",
            timestamp: this.startTime + index * 10
            // Approximate timing
          });
        }
      });
    }
  }
  watchInternalEvents() {
    const internalEvents = [
      "cart:updated",
      "cart:item-added",
      "cart:item-removed",
      "cart:quantity-changed",
      "campaign:loaded",
      "checkout:started",
      "checkout:form-initialized",
      "order:completed",
      "payment:tokenized",
      "payment:error",
      "coupon:applied",
      "coupon:removed",
      "upsell:added",
      "upsell:skipped",
      "config:updated",
      "error:occurred"
    ];
    internalEvents.forEach((eventName) => {
      this.eventBus.on(eventName, (data) => {
        if (this.isRecording) {
          this.addEvent({
            type: "internal",
            name: eventName,
            data,
            source: "SDK Internal"
          });
        }
      });
    });
  }
  watchDOMEvents() {
    if (typeof document === "undefined") return;
    const domEvents = [
      "next:initialized",
      "next:cart-updated",
      "next:item-added",
      "next:item-removed",
      "next:checkout-started",
      "next:payment-success",
      "next:payment-error",
      "next:timer-expired",
      "next:coupon-applied",
      "next:display-ready"
    ];
    domEvents.forEach((eventName) => {
      document.addEventListener(eventName, (event) => {
        if (this.isRecording) {
          const customEvent = event;
          this.addEvent({
            type: "dom",
            name: eventName,
            data: customEvent.detail,
            source: "DOM CustomEvent"
          });
        }
      });
    });
  }
  watchPerformanceEvents() {
    if (typeof window === "undefined" || !window.performance) return;
    const originalMark = performance.mark;
    const originalMeasure = performance.measure;
    const self = this;
    performance.mark = function(name) {
      const result = originalMark.call(performance, name);
      if (self.isRecording) {
        self.addEvent({
          type: "performance",
          name: `mark: ${name}`,
          data: { markName: name, timestamp: performance.now() },
          source: "Performance API"
        });
      }
      return result;
    };
    performance.measure = function(name, startMark, endMark) {
      const result = originalMeasure.call(performance, name, startMark, endMark);
      if (self.isRecording) {
        self.addEvent({
          type: "performance",
          name: `measure: ${name}`,
          data: { measureName: name, startMark, endMark },
          source: "Performance API"
        });
      }
      return result;
    };
  }
  addEvent(eventData) {
    const now = Date.now();
    const event = {
      id: `event_${now}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: eventData.timestamp || now,
      type: eventData.type || "internal",
      name: eventData.name || "unknown",
      data: eventData.data || {},
      source: eventData.source || "Unknown",
      relativeTime: this.formatRelativeTime(eventData.timestamp || now)
    };
    this.events.unshift(event);
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents);
    }
    if (event.source && event.source !== "Unknown") {
      this.filters.sources.add(event.source);
    }
    if (typeof document !== "undefined") {
      const activeElement = document.activeElement;
      const isUserTyping = activeElement && (activeElement.tagName === "INPUT" || activeElement.tagName === "SELECT");
      if (!isUserTyping) {
        setTimeout(() => {
          document.dispatchEvent(new CustomEvent("debug:update-content"));
        }, 100);
      }
    }
  }
  formatRelativeTime(timestamp) {
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1e3);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m ago`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s ago`;
    if (seconds > 0) return `${seconds}s ago`;
    return "just now";
  }
  getFilteredEvents() {
    const cutoffTime = Date.now() - this.filters.timeRange * 60 * 1e3;
    return this.events.filter((event) => {
      if (event.timestamp < cutoffTime) return false;
      if (!this.filters.types.has(event.type)) return false;
      if (this.filters.sources.size > 0 && !this.filters.sources.has(event.source)) return false;
      if (this.filters.search) {
        const searchLower = this.filters.search.toLowerCase();
        return event.name.toLowerCase().includes(searchLower) || event.source.toLowerCase().includes(searchLower) || JSON.stringify(event.data).toLowerCase().includes(searchLower);
      }
      return true;
    });
  }
  // getEventIcon method removed - unused
  getEventTypeColor(type) {
    const colors = {
      dataLayer: "#4CAF50",
      // Green
      internal: "#2196F3",
      // Blue  
      dom: "#FF9800",
      // Orange
      performance: "#9C27B0"
      // Purple
    };
    return colors[type] || "#666";
  }
  getTabs() {
    return [
      {
        id: "timeline",
        label: "Events",
        icon: "📅",
        getContent: () => this.getTimelineContent()
      },
      {
        id: "analytics",
        label: "Stats",
        icon: "📊",
        getContent: () => this.getAnalyticsContent()
      },
      {
        id: "filters",
        label: "Filter",
        icon: "🔍",
        getContent: () => this.getFiltersContent()
      }
    ];
  }
  getTimelineContent() {
    const filteredEvents = this.getFilteredEvents();
    if (filteredEvents.length === 0) {
      return `<div style="padding: 20px; text-align: center; color: #666;">No events yet</div>`;
    }
    let eventsHtml = "";
    filteredEvents.slice(0, 20).forEach((event) => {
      eventsHtml += `
        <div style="border-bottom: 1px solid #333; padding: 8px; background: #1a1a1a;">
          <div style="font-weight: bold; color: ${this.getEventTypeColor(event.type)};">
            ${event.name} <span style="float: right; font-weight: normal; color: #999;">${event.relativeTime}</span>
          </div>
          <div style="color: #999; font-size: 11px; margin: 4px 0;">${event.source}</div>
          <div style="background: #2a2a2a; padding: 4px; border-radius: 3px; font-family: monospace; font-size: 10px; overflow: hidden; color: #ccc;">
            ${JSON.stringify(event.data).length > 100 ? JSON.stringify(event.data).substring(0, 100) + "..." : JSON.stringify(event.data)}
          </div>
        </div>
      `;
    });
    return `
      <div style="padding: 10px; border-bottom: 1px solid #444; background: #2a2a2a; color: #fff;">
        <strong>Total Events: ${this.events.length}</strong>
        <span style="float: right;">
          <button onclick="this.closest('.debug-panel').dispatchEvent(new CustomEvent('timeline-action', {detail: 'toggle'}))" style="margin-right: 5px; background: #444; color: #fff; border: 1px solid #666; padding: 4px 8px; cursor: pointer;">
            ${this.isRecording ? "Pause" : "Record"}
          </button>
          <button onclick="this.closest('.debug-panel').dispatchEvent(new CustomEvent('timeline-action', {detail: 'clear'}))" style="background: #444; color: #fff; border: 1px solid #666; padding: 4px 8px; cursor: pointer;">
            Clear
          </button>
        </span>
      </div>
      <div style="max-height: 300px; overflow-y: auto; background: #1a1a1a;">
        ${eventsHtml}
      </div>
    `;
  }
  getAnalyticsContent() {
    const stats = this.getEventStats();
    const typeDistribution = this.getTypeDistribution();
    return `
      <div style="padding: 15px; background: #1a1a1a; color: #fff;">
        <h4 style="color: #fff;">Event Statistics</h4>
        <p>Total Events: <strong>${stats.total}</strong></p>
        <p>Events Per Minute: <strong>${stats.eventsPerMinute}</strong></p>
        <p>Most Active Type: <strong>${stats.mostActiveType}</strong></p>
        
        <h4 style="margin-top: 20px; color: #fff;">Event Types</h4>
        ${Object.entries(typeDistribution).map(([type, count]) => `
          <p style="margin: 5px 0;">
            <span style="color: ${this.getEventTypeColor(type)};">${type}:</span> 
            <strong>${count}</strong>
          </p>
        `).join("")}
      </div>
    `;
  }
  getFiltersContent() {
    const availableTypes = ["dataLayer", "internal", "dom", "performance"];
    return `
      <div style="padding: 15px; background: #1a1a1a; color: #fff;">
        <h4 style="color: #fff;">Search Events</h4>
        <input type="text" 
               placeholder="Search event names or data..." 
               value="${this.filters.search || ""}"
               style="width: 100%; padding: 8px; margin-bottom: 15px; border: 1px solid #666; border-radius: 4px; background: #2a2a2a; color: #fff;">
        
        <h4 style="color: #fff;">Event Types</h4>
        ${availableTypes.map((type) => `
          <label style="display: block; margin: 8px 0; color: #fff;">
            <input type="checkbox" ${this.filters.types.has(type) ? "checked" : ""} style="margin-right: 8px;">
            ${type}
          </label>
        `).join("")}
        
        <h4 style="margin-top: 20px; color: #fff;">Time Range</h4>
        <select style="width: 100%; padding: 8px; border: 1px solid #666; border-radius: 4px; background: #2a2a2a; color: #fff;">
          <option value="5">Last 5 minutes</option>
          <option value="15">Last 15 minutes</option>
          <option value="30" selected>Last 30 minutes</option>
          <option value="60">Last hour</option>
        </select>
      </div>
    `;
  }
  getEventStats() {
    const now = Date.now();
    const oneMinuteAgo = now - 6e4;
    const recentEvents = this.events.filter((e) => e?.timestamp && e.timestamp > oneMinuteAgo);
    const typeCounts = this.events.reduce((acc, event) => {
      if (event?.type) {
        acc[event.type] = (acc[event.type] || 0) + 1;
      }
      return acc;
    }, {});
    const mostActiveType = Object.entries(typeCounts).sort(([, a], [, b]) => (b || 0) - (a || 0))[0]?.[0];
    return {
      total: this.events.length,
      eventsPerMinute: recentEvents.length,
      mostActiveType: mostActiveType || "None"
    };
  }
  getTypeDistribution() {
    return this.events.reduce((acc, event) => {
      if (event?.type) {
        acc[event.type] = (acc[event.type] || 0) + 1;
      }
      return acc;
    }, {});
  }
  getSourceDistribution() {
    return this.events.reduce((acc, event) => {
      if (event?.source) {
        acc[event.source] = (acc[event.source] || 0) + 1;
      }
      return acc;
    }, {});
  }
  // getTimelineChart method removed - unused
  getActions() {
    return [
      {
        label: this.isRecording ? "⏸️ Pause Recording" : "▶️ Start Recording",
        action: () => {
          this.isRecording = !this.isRecording;
          console.log(`Event recording ${this.isRecording ? "started" : "paused"}`);
        }
      },
      {
        label: "🗑️ Clear Events",
        action: () => {
          this.events = [];
          console.log("Event timeline cleared");
        }
      },
      {
        label: "💾 Export Events",
        action: () => this.exportEvents()
      },
      {
        label: "🧪 Test Events",
        action: () => this.generateTestEvents()
      }
    ];
  }
  exportEvents() {
    const exportData = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      totalEvents: this.events.length,
      filters: {
        types: Array.from(this.filters.types),
        sources: Array.from(this.filters.sources),
        search: this.filters.search,
        timeRange: this.filters.timeRange
      },
      events: this.events,
      stats: this.getEventStats(),
      typeDistribution: this.getTypeDistribution(),
      sourceDistribution: this.getSourceDistribution()
    };
    const data = JSON.stringify(exportData, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `event-timeline-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  generateTestEvents() {
    const testEvents = [
      { type: "dataLayer", name: "add_to_cart", data: { item_id: "123", value: 29.99 }, source: "Test" },
      { type: "internal", name: "cart:updated", data: { itemCount: 2 }, source: "Test" },
      { type: "dom", name: "next:item-added", data: { packageId: 123 }, source: "Test" },
      { type: "performance", name: "navigation", data: { loadTime: 1234 }, source: "Test" }
    ];
    testEvents.forEach((event, index) => {
      setTimeout(() => {
        this.addEvent(event);
      }, index * 200);
    });
    console.log("Generated test events for timeline");
  }
  getContent() {
    return this.getTimelineContent();
  }
}
class ConfigPanel {
  constructor() {
    this.id = "config";
    this.title = "Configuration";
    this.icon = "⚙️";
  }
  getContent() {
    const tabs = this.getTabs();
    return tabs[0]?.getContent() || "";
  }
  getTabs() {
    return [
      {
        id: "overview",
        label: "Overview",
        icon: "📊",
        getContent: () => this.getOverviewContent()
      },
      {
        id: "settings",
        label: "Settings",
        icon: "⚙️",
        getContent: () => this.getSettingsContent()
      },
      {
        id: "raw",
        label: "Raw Data",
        icon: "🔧",
        getContent: () => this.getRawDataContent()
      }
    ];
  }
  getOverviewContent() {
    const config = configStore.getState();
    return `
      <div class="enhanced-panel">
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon">🔧</div>
            <div class="metric-content">
              <div class="metric-value">${config.debug ? "ON" : "OFF"}</div>
              <div class="metric-label">Debug Mode</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🌍</div>
            <div class="metric-content">
              <div class="metric-value">${config.environment || "production"}</div>
              <div class="metric-label">Environment</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🔑</div>
            <div class="metric-content">
              <div class="metric-value">${config.apiKey ? "SET" : "MISSING"}</div>
              <div class="metric-label">API Key</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">📋</div>
            <div class="metric-content">
              <div class="metric-value">${config.campaignId || "NONE"}</div>
              <div class="metric-label">Campaign ID</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  getSettingsContent() {
    const config = configStore.getState();
    return `
      <div class="enhanced-panel">
        <div class="section">
          <div class="config-groups">
            <div class="config-group">
              <h4 class="config-group-title">Core Settings</h4>
              <div class="config-items">
                <div class="config-item">
                  <span class="config-key">Campaign ID:</span>
                  <span class="config-value">${config.campaignId || "Not set"}</span>
                </div>
                <div class="config-item">
                  <span class="config-key">API Key:</span>
                  <span class="config-value">${config.apiKey ? `${config.apiKey.substring(0, 8)}...` : "Not set"}</span>
                </div>
                <div class="config-item">
                  <span class="config-key">Environment:</span>
                  <span class="config-value">${config.environment || "production"}</span>
                </div>
                <div class="config-item">
                  <span class="config-key">Base URL:</span>
                  <span class="config-value">https://campaigns.apps.29next.com</span>
                </div>
              </div>
            </div>

            <div class="config-group">
              <h4 class="config-group-title">Feature Flags</h4>
              <div class="config-items">
                <div class="config-item">
                  <span class="config-key">Debug Mode:</span>
                  <span class="config-value ${config.debug ? "enabled" : "disabled"}">${config.debug ? "Enabled" : "Disabled"}</span>
                </div>
                <div class="config-item">
                  <span class="config-key">Test Mode:</span>
                  <span class="config-value ${config.testMode ?? false ? "enabled" : "disabled"}">${config.testMode ?? false ? "Enabled" : "Disabled"}</span>
                </div>
                <div class="config-item">
                  <span class="config-key">Analytics:</span>
                  <span class="config-value ${config.enableAnalytics ?? true ? "enabled" : "disabled"}">${config.enableAnalytics ?? true ? "Enabled" : "Disabled"}</span>
                </div>
                <div class="config-item">
                  <span class="config-key">Auto Initialize:</span>
                  <span class="config-value ${config.autoInit ?? true ? "enabled" : "disabled"}">${config.autoInit ?? true ? "Enabled" : "Disabled"}</span>
                </div>
              </div>
            </div>

            <div class="config-group">
              <h4 class="config-group-title">Performance</h4>
              <div class="config-items">
                <div class="config-item">
                  <span class="config-key">Rate Limit:</span>
                  <span class="config-value">${config.rateLimit ?? 4} req/sec</span>
                </div>
                <div class="config-item">
                  <span class="config-key">Cache TTL:</span>
                  <span class="config-value">${config.cacheTtl ?? 300}s</span>
                </div>
                <div class="config-item">
                  <span class="config-key">Retry Attempts:</span>
                  <span class="config-value">${config.retryAttempts ?? 3}</span>
                </div>
                <div class="config-item">
                  <span class="config-key">Timeout:</span>
                  <span class="config-value">${config.timeout ?? 1e4}ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  getRawDataContent() {
    const config = configStore.getState();
    return `
      <div class="enhanced-panel">
        <div class="section">
          <div class="json-viewer">
            <pre><code>${JSON.stringify(config, null, 2)}</code></pre>
          </div>
        </div>
      </div>
    `;
  }
  getActions() {
    return [
      {
        label: "Toggle Debug",
        action: () => this.toggleDebug(),
        variant: "primary"
      },
      {
        label: "Toggle Test Mode",
        action: () => this.toggleTestMode(),
        variant: "secondary"
      },
      {
        label: "Export Config",
        action: () => this.exportConfig(),
        variant: "secondary"
      },
      {
        label: "Reset Config",
        action: () => this.resetConfig(),
        variant: "danger"
      }
    ];
  }
  toggleDebug() {
    const configStore$1 = configStore.getState();
    configStore$1.updateConfig({ debug: !configStore$1.debug });
    document.dispatchEvent(new CustomEvent("debug:update-content"));
  }
  toggleTestMode() {
    const configStore$1 = configStore.getState();
    configStore$1.updateConfig({ testMode: !(configStore$1.testMode ?? false) });
    document.dispatchEvent(new CustomEvent("debug:update-content"));
  }
  exportConfig() {
    const config = configStore.getState();
    const data = JSON.stringify(config, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `next-config-${(/* @__PURE__ */ new Date()).toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  resetConfig() {
    if (confirm("Are you sure you want to reset the configuration to defaults?")) {
      const configStore$1 = configStore.getState();
      configStore$1.reset();
      document.dispatchEvent(new CustomEvent("debug:update-content"));
    }
  }
}
class CheckoutPanel {
  constructor() {
    this.id = "checkout";
    this.title = "Checkout State";
    this.icon = "💳";
  }
  getContent() {
    const tabs = this.getTabs();
    return tabs[0]?.getContent() || "";
  }
  getTabs() {
    return [
      {
        id: "overview",
        label: "Overview",
        icon: "📊",
        getContent: () => this.getOverviewContent()
      },
      {
        id: "customer",
        label: "Customer Info",
        icon: "👤",
        getContent: () => this.getCustomerContent()
      },
      {
        id: "validation",
        label: "Validation",
        icon: "✅",
        getContent: () => this.getValidationContent()
      },
      {
        id: "raw",
        label: "Raw Data",
        icon: "🔧",
        getContent: () => this.getRawDataContent()
      }
    ];
  }
  getOverviewContent() {
    const checkoutState = useCheckoutStore.getState();
    return `
      <div class="enhanced-panel">
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon">📋</div>
            <div class="metric-content">
              <div class="metric-value">${checkoutState.step || "Not Started"}</div>
              <div class="metric-label">Current Step</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">${checkoutState.isProcessing ? "⏳" : "✅"}</div>
            <div class="metric-content">
              <div class="metric-value">${checkoutState.isProcessing ? "PROCESSING" : "READY"}</div>
              <div class="metric-label">Form Status</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🔒</div>
            <div class="metric-content">
              <div class="metric-value">${checkoutState.paymentMethod || "None"}</div>
              <div class="metric-label">Payment Method</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🚚</div>
            <div class="metric-content">
              <div class="metric-value">${checkoutState.shippingMethod?.name || "None"}</div>
              <div class="metric-label">Shipping Method</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h3 class="section-title">Form Fields Status</h3>
          <div class="form-fields-grid">
            ${this.renderFormFields(checkoutState)}
          </div>
        </div>
        
        <div class="section">
          <h3 class="section-title">Current Form Data</h3>
          <div class="form-data-summary">
            ${Object.keys(checkoutState.formData).length > 0 ? Object.entries(checkoutState.formData).map(([key, value]) => `
                <div class="form-field-row">
                  <span class="field-name">${this.formatFieldName(key)}</span>
                  <span class="field-value">${value || "Empty"}</span>
                </div>
              `).join("") : '<div class="empty-state">No form data yet</div>'}
          </div>
        </div>
      </div>
    `;
  }
  getCustomerContent() {
    const checkoutState = useCheckoutStore.getState();
    const formData = checkoutState.formData;
    const hasFormData = Object.keys(formData).length > 0;
    return `
      <div class="enhanced-panel">
        <div class="section">
          <div class="customer-info">
            ${hasFormData ? `
              <div class="info-card">
                <h4>Contact Information</h4>
                <div class="info-row">
                  <span class="info-label">Email:</span>
                  <span class="info-value">${formData.email || "Not provided"}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Phone:</span>
                  <span class="info-value">${formData.phone || "Not provided"}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Name:</span>
                  <span class="info-value">${formData.fname || ""} ${formData.lname || ""}</span>
                </div>
              </div>
              
              <div class="info-card">
                <h4>Shipping Address</h4>
                <div class="address-info">
                  ${formData.address1 ? `
                    <div class="info-row">
                      <span class="info-label">Address:</span>
                      <span class="info-value">${formData.address1}</span>
                    </div>
                    ${formData.address2 ? `
                      <div class="info-row">
                        <span class="info-label">Address 2:</span>
                        <span class="info-value">${formData.address2}</span>
                      </div>
                    ` : ""}
                    <div class="info-row">
                      <span class="info-label">City:</span>
                      <span class="info-value">${formData.city || "Not provided"}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">State/Province:</span>
                      <span class="info-value">${formData.province || "Not provided"}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Postal Code:</span>
                      <span class="info-value">${formData.postal || "Not provided"}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Country:</span>
                      <span class="info-value">${formData.country || "Not provided"}</span>
                    </div>
                  ` : '<div class="info-empty">Not provided</div>'}
                </div>
              </div>

              <div class="info-card">
                <h4>Billing Address</h4>
                <div class="address-info">
                  ${checkoutState.sameAsShipping ? `
                    <div class="info-same">Same as shipping address</div>
                  ` : checkoutState.billingAddress ? `
                    <div class="info-row">
                      <span class="info-label">Name:</span>
                      <span class="info-value">${checkoutState.billingAddress.first_name} ${checkoutState.billingAddress.last_name}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Address:</span>
                      <span class="info-value">${checkoutState.billingAddress.address1}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">City:</span>
                      <span class="info-value">${checkoutState.billingAddress.city}, ${checkoutState.billingAddress.province} ${checkoutState.billingAddress.postal}</span>
                    </div>
                  ` : '<div class="info-empty">Not provided</div>'}
                </div>
              </div>
            ` : `
              <div class="empty-state">
                <div class="empty-icon">👤</div>
                <div class="empty-text">No customer information yet</div>
                <div class="empty-subtitle">Fill out the checkout form to see data here</div>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  }
  getValidationContent() {
    const checkoutState = useCheckoutStore.getState();
    return `
      <div class="enhanced-panel">
        <div class="section">
          <div class="validation-errors">
            ${checkoutState.errors && Object.keys(checkoutState.errors).length > 0 ? `
              ${Object.entries(checkoutState.errors).map(([field, error]) => `
                <div class="error-item">
                  <span class="error-field">${field}:</span>
                  <span class="error-message">${error}</span>
                </div>
              `).join("")}
            ` : `
              <div class="empty-state">
                <div class="empty-icon">✅</div>
                <div class="empty-text">No validation errors</div>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  }
  getRawDataContent() {
    const checkoutState = useCheckoutStore.getState();
    return `
      <div class="enhanced-panel">
        <div class="section">
          <div class="json-viewer">
            <pre><code>${JSON.stringify(checkoutState, null, 2)}</code></pre>
          </div>
        </div>
      </div>
    `;
  }
  getActions() {
    return [
      {
        label: "Fill Test Data",
        action: () => this.fillTestData(),
        variant: "primary"
      },
      {
        label: "Validate Form",
        action: () => this.validateForm(),
        variant: "secondary"
      },
      {
        label: "Clear Errors",
        action: () => this.clearErrors(),
        variant: "secondary"
      },
      {
        label: "Reset Checkout",
        action: () => this.resetCheckout(),
        variant: "danger"
      },
      {
        label: "Export State",
        action: () => this.exportState(),
        variant: "secondary"
      }
    ];
  }
  renderFormFields(checkoutState) {
    const requiredFields = [
      "email",
      "fname",
      "lname",
      "address1",
      "city",
      "province",
      "postal",
      "phone",
      "country"
    ];
    return requiredFields.map((field) => {
      const hasValue = this.hasFieldValue(checkoutState, field);
      const hasError = checkoutState.errors && checkoutState.errors[field];
      return `
        <div class="field-status-card ${hasValue ? "filled" : "empty"} ${hasError ? "error" : ""}">
          <div class="field-name">${this.formatFieldName(field)}</div>
          <div class="field-status">
            ${hasValue ? "✅" : "⏳"}
            ${hasError ? " ❌" : ""}
          </div>
        </div>
      `;
    }).join("");
  }
  hasFieldValue(checkoutState, field) {
    if (checkoutState.formData && checkoutState.formData[field]) {
      return checkoutState.formData[field].toString().trim().length > 0;
    }
    if (checkoutState.billingAddress && checkoutState.billingAddress[field]) {
      return checkoutState.billingAddress[field].toString().trim().length > 0;
    }
    return false;
  }
  formatFieldName(field) {
    const fieldNames = {
      fname: "First Name",
      lname: "Last Name",
      email: "Email",
      phone: "Phone",
      address1: "Address",
      address2: "Address 2",
      city: "City",
      province: "State/Province",
      postal: "Postal Code",
      country: "Country",
      accepts_marketing: "Accepts Marketing"
    };
    return fieldNames[field] || field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()).trim();
  }
  fillTestData() {
    const checkoutStore = useCheckoutStore.getState();
    const testFormData = {
      email: "test@test.com",
      fname: "Test",
      lname: "Order",
      phone: "+14807581224",
      address1: "Test Address 123",
      address2: "",
      city: "Tempe",
      province: "AZ",
      postal: "85281",
      country: "US",
      accepts_marketing: false
    };
    checkoutStore.clearAllErrors();
    checkoutStore.updateFormData(testFormData);
    checkoutStore.setPaymentMethod("credit-card");
    checkoutStore.setSameAsShipping(true);
    checkoutStore.setShippingMethod({
      id: 1,
      name: "Standard Shipping",
      price: 0,
      code: "standard"
    });
    console.log("✅ Test data filled successfully");
    document.dispatchEvent(new CustomEvent("debug:update-content"));
    setTimeout(() => {
      document.dispatchEvent(new CustomEvent("checkout:test-data-filled", {
        detail: testFormData
      }));
    }, 100);
  }
  validateForm() {
    const checkoutStore = useCheckoutStore.getState();
    const formData = checkoutStore.formData;
    const requiredFields = ["email", "fname", "lname", "address1", "city", "country"];
    let hasErrors = false;
    checkoutStore.clearAllErrors();
    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field].toString().trim() === "") {
        checkoutStore.setError(field, `${this.formatFieldName(field)} is required`);
        hasErrors = true;
      }
    });
    if (!hasErrors) {
      console.log("✅ Form validation passed");
    }
    document.dispatchEvent(new CustomEvent("debug:update-content"));
  }
  clearErrors() {
    const checkoutStore = useCheckoutStore.getState();
    checkoutStore.clearAllErrors();
    document.dispatchEvent(new CustomEvent("debug:update-content"));
  }
  resetCheckout() {
    if (confirm("Are you sure you want to reset the checkout state?")) {
      const checkoutStore = useCheckoutStore.getState();
      checkoutStore.reset();
      document.dispatchEvent(new CustomEvent("debug:update-content"));
    }
  }
  exportState() {
    const checkoutState = useCheckoutStore.getState();
    const data = JSON.stringify(checkoutState, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `checkout-state-${(/* @__PURE__ */ new Date()).toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
class StoragePanel {
  constructor() {
    this.id = "storage";
    this.title = "Storage";
    this.icon = "💾";
  }
  getContent() {
    const tabs = this.getTabs();
    return tabs[0]?.getContent() || "";
  }
  getTabs() {
    return [
      {
        id: "overview",
        label: "Overview",
        icon: "📊",
        getContent: () => this.getOverviewContent()
      },
      {
        id: "next-data",
        label: "Next Data",
        icon: "🏷️",
        getContent: () => this.getNextContent()
      },
      {
        id: "local-storage",
        label: "Local Storage",
        icon: "💾",
        getContent: () => this.getLocalStorageContent()
      },
      {
        id: "session-storage",
        label: "Session Storage",
        icon: "⏰",
        getContent: () => this.getSessionStorageContent()
      }
    ];
  }
  getOverviewContent() {
    const localStorage2 = this.getLocalStorageData();
    const sessionStorage2 = this.getSessionStorageData();
    return `
      <div class="enhanced-panel">
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon">💾</div>
            <div class="metric-content">
              <div class="metric-value">${localStorage2.length}</div>
              <div class="metric-label">LocalStorage Items</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">⏰</div>
            <div class="metric-content">
              <div class="metric-value">${sessionStorage2.length}</div>
              <div class="metric-label">SessionStorage Items</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">📊</div>
            <div class="metric-content">
              <div class="metric-value">${this.getStorageSize()}KB</div>
              <div class="metric-label">Total Size</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🏷️</div>
            <div class="metric-content">
              <div class="metric-value">${this.getNextItems().length}</div>
              <div class="metric-label">Next Items</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  getNextContent() {
    return `
      <div class="enhanced-panel">
        <div class="section">
          <div class="storage-items">
            ${this.getNextItems().length === 0 ? `
              <div class="empty-state">
                <div class="empty-icon">💾</div>
                <div class="empty-text">No Next storage items found</div>
              </div>
            ` : `
              ${this.getNextItems().map((item) => `
                <div class="storage-item-card next-item">
                  <div class="storage-item-header">
                    <span class="storage-key">${item.key}</span>
                    <span class="storage-type ${item.type}">${item.type}</span>
                    <button class="storage-delete-btn" onclick="window.nextDebug.deleteStorageItem('${item.key}', '${item.type}')">×</button>
                  </div>
                  <div class="storage-item-size">${item.size} bytes</div>
                  <div class="storage-item-value">
                    <pre><code>${item.formattedValue}</code></pre>
                  </div>
                </div>
              `).join("")}
            `}
          </div>
        </div>
      </div>
    `;
  }
  getLocalStorageContent() {
    const localStorage2 = this.getLocalStorageData();
    return `
      <div class="enhanced-panel">
        <div class="section">
          <div class="storage-items">
            ${localStorage2.length === 0 ? `
              <div class="empty-state">
                <div class="empty-icon">💾</div>
                <div class="empty-text">No localStorage items</div>
              </div>
            ` : `
              ${localStorage2.map((item) => `
                <div class="storage-item-card ${item.key.includes("next") ? "next-item" : ""}">
                  <div class="storage-item-header">
                    <span class="storage-key">${item.key}</span>
                    <span class="storage-type local">local</span>
                    <button class="storage-delete-btn" onclick="window.nextDebug.deleteStorageItem('${item.key}', 'local')">×</button>
                  </div>
                  <div class="storage-item-size">${item.size} bytes</div>
                  <div class="storage-item-value">
                    <pre><code>${item.formattedValue}</code></pre>
                  </div>
                </div>
              `).join("")}
            `}
          </div>
        </div>
      </div>
    `;
  }
  getSessionStorageContent() {
    const sessionStorage2 = this.getSessionStorageData();
    return `
      <div class="enhanced-panel">
        <div class="section">
          <div class="storage-items">
            ${sessionStorage2.length === 0 ? `
              <div class="empty-state">
                <div class="empty-icon">⏰</div>
                <div class="empty-text">No sessionStorage items</div>
              </div>
            ` : `
              ${sessionStorage2.map((item) => `
                <div class="storage-item-card ${item.key.includes("next") ? "next-item" : ""}">
                  <div class="storage-item-header">
                    <span class="storage-key">${item.key}</span>
                    <span class="storage-type session">session</span>
                    <button class="storage-delete-btn" onclick="window.nextDebug.deleteStorageItem('${item.key}', 'session')">×</button>
                  </div>
                  <div class="storage-item-size">${item.size} bytes</div>
                  <div class="storage-item-value">
                    <pre><code>${item.formattedValue}</code></pre>
                  </div>
                </div>
              `).join("")}
            `}
          </div>
        </div>
      </div>
    `;
  }
  getActions() {
    return [
      {
        label: "Clear Next Data",
        action: () => this.clearNextStorage(),
        variant: "danger"
      },
      {
        label: "Clear All Local",
        action: () => this.clearLocalStorage(),
        variant: "danger"
      },
      {
        label: "Clear All Session",
        action: () => this.clearSessionStorage(),
        variant: "danger"
      },
      {
        label: "Export Storage",
        action: () => this.exportStorage(),
        variant: "secondary"
      }
    ];
  }
  getLocalStorageData() {
    const items = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || "";
        items.push({
          key,
          value,
          size: new Blob([value]).size,
          formattedValue: this.formatValue(value)
        });
      }
    }
    return items.sort((a, b) => a.key.localeCompare(b.key));
  }
  getSessionStorageData() {
    const items = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        const value = sessionStorage.getItem(key) || "";
        items.push({
          key,
          value,
          size: new Blob([value]).size,
          formattedValue: this.formatValue(value)
        });
      }
    }
    return items.sort((a, b) => a.key.localeCompare(b.key));
  }
  getNextItems() {
    const items = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes("next") || key.includes("29next") || key.includes("campaign"))) {
        const value = localStorage.getItem(key) || "";
        items.push({
          key,
          value,
          size: new Blob([value]).size,
          formattedValue: this.formatValue(value),
          type: "local"
        });
      }
    }
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.includes("next") || key.includes("29next") || key.includes("campaign"))) {
        const value = sessionStorage.getItem(key) || "";
        items.push({
          key,
          value,
          size: new Blob([value]).size,
          formattedValue: this.formatValue(value),
          type: "session"
        });
      }
    }
    return items.sort((a, b) => a.key.localeCompare(b.key));
  }
  formatValue(value) {
    try {
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed, null, 2);
    } catch {
      if (value.length > 200) {
        return value.substring(0, 200) + "...";
      }
      return value;
    }
  }
  getStorageSize() {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || "";
        total += new Blob([key + value]).size;
      }
    }
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        const value = sessionStorage.getItem(key) || "";
        total += new Blob([key + value]).size;
      }
    }
    return Math.round(total / 1024);
  }
  clearNextStorage() {
    if (confirm("Are you sure you want to clear all Next storage data?")) {
      const nextItems = this.getNextItems();
      nextItems.forEach((item) => {
        if (item.type === "local") {
          localStorage.removeItem(item.key);
        } else {
          sessionStorage.removeItem(item.key);
        }
      });
      document.dispatchEvent(new CustomEvent("debug:update-content"));
    }
  }
  clearLocalStorage() {
    if (confirm("Are you sure you want to clear ALL localStorage data?")) {
      localStorage.clear();
      document.dispatchEvent(new CustomEvent("debug:update-content"));
    }
  }
  clearSessionStorage() {
    if (confirm("Are you sure you want to clear ALL sessionStorage data?")) {
      sessionStorage.clear();
      document.dispatchEvent(new CustomEvent("debug:update-content"));
    }
  }
  exportStorage() {
    const data = {
      localStorage: this.getLocalStorageData(),
      sessionStorage: this.getSessionStorageData(),
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `storage-data-${(/* @__PURE__ */ new Date()).toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
class EnhancedCampaignPanel {
  constructor() {
    this.id = "campaign";
    this.title = "Campaign Data";
    this.icon = "📊";
  }
  getContent() {
    const tabs = this.getTabs();
    return tabs[0]?.getContent() || "";
  }
  getTabs() {
    return [
      {
        id: "overview",
        label: "Overview",
        icon: "📊",
        getContent: () => this.getOverviewContent()
      },
      {
        id: "packages",
        label: "Packages",
        icon: "📦",
        getContent: () => this.getPackagesContent()
      },
      {
        id: "shipping",
        label: "Shipping",
        icon: "🚚",
        getContent: () => this.getShippingContent()
      },
      {
        id: "raw",
        label: "Raw Data",
        icon: "🔧",
        getContent: () => this.getRawDataContent()
      }
    ];
  }
  getOverviewContent() {
    const campaignState = useCampaignStore.getState();
    const campaignData = campaignState.data;
    if (!campaignData) {
      return `
        <div class="enhanced-panel">
          <div class="empty-state">
            <div class="empty-icon">📊</div>
            <div class="empty-text">No campaign data loaded</div>
            <button class="empty-action" onclick="window.nextDebug.loadCampaign()">Load Campaign</button>
          </div>
        </div>
      `;
    }
    return `
      <div class="enhanced-panel">
        ${this.getCampaignOverview(campaignData)}
      </div>
    `;
  }
  getPackagesContent() {
    const campaignState = useCampaignStore.getState();
    const cartState = useCartStore.getState();
    const campaignData = campaignState.data;
    if (!campaignData) {
      return `
        <div class="enhanced-panel">
          <div class="empty-state">
            <div class="empty-icon">📦</div>
            <div class="empty-text">No campaign data loaded</div>
          </div>
        </div>
      `;
    }
    return `
      <div class="enhanced-panel">
        ${this.getPackagesSection(campaignData.packages, cartState)}
      </div>
    `;
  }
  getShippingContent() {
    const campaignState = useCampaignStore.getState();
    const campaignData = campaignState.data;
    if (!campaignData) {
      return `
        <div class="enhanced-panel">
          <div class="empty-state">
            <div class="empty-icon">🚚</div>
            <div class="empty-text">No campaign data loaded</div>
          </div>
        </div>
      `;
    }
    return `
      <div class="enhanced-panel">
        ${this.getShippingMethodsSection(campaignData.shipping_methods)}
      </div>
    `;
  }
  getRawDataContent() {
    const campaignState = useCampaignStore.getState();
    const campaignData = campaignState.data;
    if (!campaignData) {
      return `
        <div class="enhanced-panel">
          <div class="empty-state">
            <div class="empty-icon">🔧</div>
            <div class="empty-text">No campaign data loaded</div>
          </div>
        </div>
      `;
    }
    return `
      <div class="enhanced-panel">
        <div class="section">
          <div class="json-viewer">
            <pre><code>${JSON.stringify(campaignData, null, 2)}</code></pre>
          </div>
        </div>
      </div>
    `;
  }
  getCampaignOverview(data) {
    return `
      <div class="campaign-overview">
        <div class="campaign-header">
          <h2 class="campaign-name">${data.name}</h2>
          <div class="campaign-badges">
            <span class="campaign-badge currency">${data.currency}</span>
            <span class="campaign-badge language">${data.language.toUpperCase()}</span>
          </div>
        </div>
        
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon">📦</div>
            <div class="metric-content">
              <div class="metric-value">${data.packages.length}</div>
              <div class="metric-label">Total Packages</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🚚</div>
            <div class="metric-content">
              <div class="metric-value">${data.shipping_methods.length}</div>
              <div class="metric-label">Shipping Methods</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🔄</div>
            <div class="metric-content">
              <div class="metric-value">${data.packages.filter((p) => p.is_recurring).length}</div>
              <div class="metric-label">Recurring Items</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">💰</div>
            <div class="metric-content">
              <div class="metric-value">${this.getPriceRange(data.packages)}</div>
              <div class="metric-label">Price Range</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  getPackagesSection(packages, cartState) {
    return `
      <div class="section">
        <div class="section-header">
          <h3 class="section-title">Available Packages</h3>
          <div class="section-controls">
            <button class="sort-btn" onclick="window.nextDebug.sortPackages('price')">Sort by Price</button>
            <button class="sort-btn" onclick="window.nextDebug.sortPackages('name')">Sort by Name</button>
          </div>
        </div>
        
        <div class="packages-grid">
          ${packages.map((pkg) => this.getPackageCard(pkg, cartState)).join("")}
        </div>
      </div>
    `;
  }
  getPackageCard(pkg, cartState) {
    const isInCart = cartState.items.some((item) => item.packageId === pkg.ref_id);
    const cartItem = cartState.items.find((item) => item.packageId === pkg.ref_id);
    const savings = parseFloat(pkg.price_retail_total) - parseFloat(pkg.price_total);
    const savingsPercent = Math.round(savings / parseFloat(pkg.price_retail_total) * 100);
    return `
      <div class="package-card ${isInCart ? "in-cart" : ""}" data-package-id="${pkg.ref_id}">
        <div class="package-image-container">
          <img src="${pkg.image}" alt="${pkg.name}" class="package-image" loading="lazy" />
          ${pkg.is_recurring ? '<div class="recurring-badge">🔄 Recurring</div>' : ""}
          ${isInCart ? `<div class="cart-badge">In Cart (${cartItem?.quantity || 0})</div>` : ""}
        </div>
        
        <div class="package-info">
          <div class="package-header">
            <h4 class="package-name">${pkg.name}</h4>
            <div class="package-id">ID: ${pkg.ref_id}</div>
          </div>
          
          <div class="package-details">
            <div class="package-qty">Quantity: ${pkg.qty}</div>
            <div class="package-external-id">External ID: ${pkg.external_id}</div>
          </div>
          
          <div class="package-pricing">
            <div class="price-row">
              <span class="price-label">Sale Price:</span>
              <span class="price-value sale-price">$${pkg.price_total}</span>
            </div>
            ${pkg.price_retail_total !== pkg.price_total ? `
              <div class="price-row">
                <span class="price-label">Retail Price:</span>
                <span class="price-value retail-price">$${pkg.price_retail_total}</span>
              </div>
              <div class="savings">
                Save $${savings.toFixed(2)} (${savingsPercent}%)
              </div>
            ` : ""}
            
            ${pkg.is_recurring && pkg.price_recurring ? `
              <div class="recurring-pricing">
                <div class="price-row recurring">
                  <span class="price-label">Recurring:</span>
                  <span class="price-value recurring-price">
                    $${pkg.price_recurring_total}/${pkg.interval}
                  </span>
                </div>
              </div>
            ` : ""}
          </div>
          
          <div class="package-actions">
            ${isInCart ? `
              <button class="package-btn remove-btn" onclick="window.nextDebug.removeFromCart(${pkg.ref_id})">
                Remove from Cart
              </button>
              <div class="qty-controls">
                <button onclick="window.nextDebug.updateQuantity(${pkg.ref_id}, ${(cartItem?.quantity || 1) - 1})">-</button>
                <span>${cartItem?.quantity || 0}</span>
                <button onclick="window.nextDebug.updateQuantity(${pkg.ref_id}, ${(cartItem?.quantity || 1) + 1})">+</button>
              </div>
            ` : `
              <button class="package-btn add-btn" onclick="window.nextDebug.addToCart(${pkg.ref_id})">
                Add to Cart - $${pkg.price_total}
              </button>
            `}
            <button class="package-btn inspect-btn" onclick="window.nextDebug.inspectPackage(${pkg.ref_id})">
              Inspect
            </button>
          </div>
        </div>
      </div>
    `;
  }
  getShippingMethodsSection(shippingMethods) {
    return `
      <div class="section">
        <h3 class="section-title">Shipping Methods</h3>
        
        <div class="shipping-methods">
          ${shippingMethods.map((method) => `
            <div class="shipping-method-card">
              <div class="shipping-info">
                <div class="shipping-name">${method.code}</div>
                <div class="shipping-id">ID: ${method.ref_id}</div>
              </div>
              <div class="shipping-price">
                ${parseFloat(method.price) === 0 ? "FREE" : `$${method.price}`}
              </div>
              <button class="shipping-test-btn" onclick="window.nextDebug.testShippingMethod(${method.ref_id})">
                Test
              </button>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }
  getPriceRange(packages) {
    const prices = packages.map((p) => parseFloat(p.price_total)).filter((p) => p > 0);
    if (prices.length === 0) return "Free";
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) return `$${min}`;
    return `$${min} - $${max}`;
  }
  getActions() {
    return [
      {
        label: "Refresh Campaign",
        action: () => {
          const configStore$1 = configStore.getState();
          const campaignStore = useCampaignStore.getState();
          if (configStore$1.apiKey) {
            campaignStore.loadCampaign(configStore$1.apiKey);
          } else {
            console.error("No API key available to load campaign");
          }
        },
        variant: "primary"
      },
      {
        label: "Export Packages",
        action: () => this.exportPackages(),
        variant: "secondary"
      },
      {
        label: "Test All Packages",
        action: () => this.testAllPackages(),
        variant: "secondary"
      },
      {
        label: "Clear Cart",
        action: () => useCartStore.getState().clear(),
        variant: "danger"
      }
    ];
  }
  exportPackages() {
    const campaignState = useCampaignStore.getState();
    const data = campaignState.data;
    if (!data) return;
    const exportData = {
      campaign: data.name,
      packages: data.packages,
      shipping_methods: data.shipping_methods,
      export_date: (/* @__PURE__ */ new Date()).toISOString()
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campaign-packages-${data.name.toLowerCase().replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  testAllPackages() {
    const campaignState = useCampaignStore.getState();
    const cartStore = useCartStore.getState();
    const data = campaignState.data;
    if (!data) return;
    data.packages.slice(0, 3).forEach((pkg) => {
      cartStore.addItem({
        packageId: pkg.ref_id,
        quantity: 1,
        title: pkg.name,
        isUpsell: false
      });
    });
  }
}
const _DebugOverlay = class _DebugOverlay {
  constructor() {
    this.visible = false;
    this.isExpanded = false;
    this.container = null;
    this.activePanel = "cart";
    this.updateInterval = null;
    this.logger = new Logger("DebugOverlay");
    this.panels = [];
    this.handleContainerClick = (event) => {
      const target = event.target;
      const action = target.getAttribute("data-action") || target.closest("[data-action]")?.getAttribute("data-action");
      if (action) {
        switch (action) {
          case "toggle-expand":
            this.isExpanded = !this.isExpanded;
            localStorage.setItem(_DebugOverlay.EXPANDED_STORAGE_KEY, this.isExpanded.toString());
            this.updateBodyHeight();
            this.updateOverlay();
            break;
          case "close":
            this.hide();
            break;
          case "clear-cart":
            this.clearCart();
            break;
          case "export-data":
            this.exportAllData();
            break;
          case "toggle-mini-cart":
            this.toggleMiniCart();
            break;
          case "toggle-xray":
            this.toggleXray();
            break;
        }
        return;
      }
      const panelTab = target.closest(".debug-panel-tab");
      if (panelTab) {
        const panelId = panelTab.getAttribute("data-panel");
        if (panelId && panelId !== this.activePanel) {
          this.activePanel = panelId;
          this.activePanelTab = void 0;
          this.updateOverlay();
        }
        return;
      }
      const horizontalTab = target.closest(".horizontal-tab");
      if (horizontalTab) {
        const tabId = horizontalTab.getAttribute("data-panel-tab");
        if (tabId && tabId !== this.activePanelTab) {
          this.activePanelTab = tabId;
          this.updateOverlay();
        }
        return;
      }
      const panelActionBtn = target.closest(".panel-action-btn");
      if (panelActionBtn) {
        const actionLabel = panelActionBtn.getAttribute("data-panel-action");
        const activePanel = this.panels.find((p) => p.id === this.activePanel);
        const panelAction = activePanel?.getActions?.()?.find((a) => a.label === actionLabel);
        if (panelAction) {
          panelAction.action();
          setTimeout(() => this.updateContent(), 100);
        }
        return;
      }
    };
    this.eventManager = new DebugEventManager();
    this.initializePanels();
    this.setupEventListeners();
    const savedExpandedState = localStorage.getItem(_DebugOverlay.EXPANDED_STORAGE_KEY);
    if (savedExpandedState === "true") {
      this.isExpanded = true;
    }
  }
  static getInstance() {
    if (!_DebugOverlay.instance) {
      _DebugOverlay.instance = new _DebugOverlay();
    }
    return _DebugOverlay.instance;
  }
  initializePanels() {
    this.panels = [
      new CartPanel(),
      new ConfigPanel(),
      new EnhancedCampaignPanel(),
      new CheckoutPanel(),
      new EventTimelinePanel(),
      new StoragePanel()
    ];
  }
  setupEventListeners() {
    document.addEventListener("debug:update-content", () => {
      this.updateContent();
    });
  }
  initialize() {
    const urlParams = new URLSearchParams(window.location.search);
    const isDebugMode = urlParams.get("debugger") === "true";
    if (isDebugMode) {
      this.show();
      this.logger.info("Debug overlay initialized");
    }
  }
  async show() {
    if (this.visible) return;
    this.visible = true;
    await this.createOverlay();
    this.startAutoUpdate();
    XrayManager.initialize();
    if (XrayManager.isXrayActive()) {
      const xrayButton = this.container?.querySelector('[data-action="toggle-xray"]');
      if (xrayButton) {
        xrayButton.classList.add("active");
        xrayButton.setAttribute("title", "Disable X-Ray View");
      }
    }
    const savedMiniCartState = localStorage.getItem("debug-mini-cart-visible");
    if (savedMiniCartState === "true") {
      this.toggleMiniCart();
    }
  }
  hide() {
    if (!this.visible) return;
    this.visible = false;
    this.stopAutoUpdate();
    document.body.classList.remove("debug-body-expanded");
    document.documentElement.classList.remove("debug-body-expanded");
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
    EnhancedDebugUI.removeStyles();
  }
  async toggle() {
    if (this.visible) {
      this.hide();
    } else {
      await this.show();
    }
  }
  isVisible() {
    return this.visible;
  }
  async createOverlay() {
    const { DebugStyleLoader } = await import("./DebugStyleLoader-C5EOCirb.js");
    await DebugStyleLoader.loadDebugStyles();
    this.container = document.createElement("div");
    this.container.className = "debug-overlay";
    this.updateOverlay();
    this.addEventListeners();
    document.body.appendChild(this.container);
  }
  updateOverlay() {
    if (!this.container) return;
    this.panels = this.panels.map(
      (panel) => panel.id === "events" ? new EventsPanel(this.eventManager.getEvents()) : panel
    );
    this.container.innerHTML = EnhancedDebugUI.createOverlayHTML(
      this.panels,
      this.activePanel,
      this.isExpanded,
      this.activePanelTab
    );
    this.addEventListeners();
    this.updateButtonStates();
  }
  updateContent() {
    if (!this.container) return;
    const panelContent = this.container.querySelector(".panel-content");
    if (panelContent) {
      const activePanel = this.panels.find((p) => p.id === this.activePanel);
      if (activePanel) {
        const tabs = activePanel.getTabs?.() || [];
        if (tabs.length > 0) {
          const activeTabId = this.activePanelTab || tabs[0]?.id;
          const activeTab = tabs.find((tab) => tab.id === activeTabId) || tabs[0];
          if (activeTab) {
            panelContent.innerHTML = activeTab.getContent();
          }
        } else {
          panelContent.innerHTML = activePanel.getContent();
        }
      }
    }
  }
  addEventListeners() {
    if (!this.container) return;
    this.container.removeEventListener("click", this.handleContainerClick);
    this.container.addEventListener("click", this.handleContainerClick);
  }
  updateBodyHeight() {
    if (this.isExpanded) {
      document.body.classList.add("debug-body-expanded");
      document.documentElement.classList.add("debug-body-expanded");
    } else {
      document.body.classList.remove("debug-body-expanded");
      document.documentElement.classList.remove("debug-body-expanded");
    }
  }
  startAutoUpdate() {
    this.updateInterval = window.setInterval(() => {
      this.updateQuickStats();
      if (this.activePanel === "cart" || this.activePanel === "config") {
        this.updateContent();
      }
    }, 1e3);
  }
  stopAutoUpdate() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
  // Public API for external access
  getEventManager() {
    return this.eventManager;
  }
  getPanels() {
    return this.panels;
  }
  setActivePanel(panelId) {
    if (this.panels.find((p) => p.id === panelId)) {
      this.activePanel = panelId;
      this.updateOverlay();
    }
  }
  logEvent(type, data, source = "Manual") {
    this.eventManager.logEvent(type, data, source);
  }
  // Enhanced debug methods for global access
  clearCart() {
    useCartStore.getState().clear();
    this.updateContent();
  }
  exportAllData() {
    const debugData = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      cart: useCartStore.getState(),
      config: configStore.getState(),
      events: this.eventManager.getEvents(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    const data = JSON.stringify(debugData, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `debug-session-${(/* @__PURE__ */ new Date()).toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  toggleMiniCart() {
    let miniCart = document.getElementById("debug-mini-cart-display");
    if (!miniCart) {
      miniCart = document.createElement("div");
      miniCart.id = "debug-mini-cart-display";
      miniCart.className = "debug-mini-cart-display";
      document.body.appendChild(miniCart);
      useCartStore.subscribe(() => {
        if (miniCart && miniCart.classList.contains("show")) {
          this.updateMiniCart();
        }
      });
      const savedState = localStorage.getItem("debug-mini-cart-visible");
      if (savedState === "true") {
        miniCart.classList.add("show");
        this.updateMiniCart();
      }
    } else {
      miniCart.classList.toggle("show");
      localStorage.setItem("debug-mini-cart-visible", miniCart.classList.contains("show").toString());
      if (miniCart.classList.contains("show")) {
        this.updateMiniCart();
      }
    }
    const cartButton = this.container?.querySelector('[data-action="toggle-mini-cart"]');
    if (cartButton && miniCart) {
      if (miniCart.classList.contains("show")) {
        cartButton.classList.add("active");
        cartButton.setAttribute("title", "Hide Mini Cart");
      } else {
        cartButton.classList.remove("active");
        cartButton.setAttribute("title", "Toggle Mini Cart");
      }
    }
  }
  updateMiniCart() {
    const miniCart = document.getElementById("debug-mini-cart-display");
    if (!miniCart || !miniCart.classList.contains("show")) return;
    const cartState = useCartStore.getState();
    if (!cartState.items || cartState.items.length === 0) {
      miniCart.innerHTML = `
        <div class="debug-mini-cart-header">
          <span>🛒 Debug Cart</span>
          <button class="mini-cart-close" onclick="document.getElementById('debug-mini-cart-display').classList.remove('show'); localStorage.setItem('debug-mini-cart-visible', 'false')">×</button>
        </div>
        <div class="debug-mini-cart-empty">Cart empty</div>
      `;
      return;
    }
    let itemsHtml = "";
    cartState.items.forEach((item) => {
      const isUpsell = item.is_upsell;
      const upsellBadge = isUpsell ? '<span class="mini-cart-upsell-badge">UPSELL</span>' : "";
      itemsHtml += `
        <div class="debug-mini-cart-item">
          <div class="mini-cart-item-info">
            <span class="mini-cart-item-id">ID: ${item.packageId}</span>
            ${upsellBadge}
            <span class="mini-cart-item-qty">×${item.quantity}</span>
          </div>
          <div class="mini-cart-item-title">${item.title || "Unknown"}</div>
          <div class="mini-cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
        </div>
      `;
    });
    miniCart.innerHTML = `
      <div class="debug-mini-cart-header">
        <span>🛒 Debug Cart</span>
        <button class="mini-cart-close" onclick="document.getElementById('debug-mini-cart-display').classList.remove('show'); localStorage.setItem('debug-mini-cart-visible', 'false')">×</button>
      </div>
      <div class="debug-mini-cart-items">${itemsHtml}</div>
      <div class="debug-mini-cart-footer">
        <div class="mini-cart-stat">
          <span>Items:</span>
          <span>${cartState.totalQuantity}</span>
        </div>
        <div class="mini-cart-stat">
          <span>Total:</span>
          <span class="mini-cart-total">${cartState.totals.total.formatted}</span>
        </div>
      </div>
    `;
  }
  toggleXray() {
    const isActive = XrayManager.toggle();
    const xrayButton = this.container?.querySelector('[data-action="toggle-xray"]');
    if (xrayButton) {
      if (isActive) {
        xrayButton.classList.add("active");
        xrayButton.setAttribute("title", "Disable X-Ray View");
      } else {
        xrayButton.classList.remove("active");
        xrayButton.setAttribute("title", "Toggle X-Ray View");
      }
    }
    this.eventManager.logEvent("debug:xray-toggled", { active: isActive }, "Debug");
  }
  updateButtonStates() {
    if (XrayManager.isXrayActive()) {
      const xrayButton = this.container?.querySelector('[data-action="toggle-xray"]');
      if (xrayButton) {
        xrayButton.classList.add("active");
        xrayButton.setAttribute("title", "Disable X-Ray View");
      }
    }
    const miniCart = document.getElementById("debug-mini-cart-display");
    if (miniCart && miniCart.classList.contains("show")) {
      const cartButton = this.container?.querySelector('[data-action="toggle-mini-cart"]');
      if (cartButton) {
        cartButton.classList.add("active");
        cartButton.setAttribute("title", "Hide Mini Cart");
      }
    }
  }
  updateQuickStats() {
    if (!this.container) return;
    const cartState = useCartStore.getState();
    const cartItemsEl = this.container.querySelector('[data-debug-stat="cart-items"]');
    const cartTotalEl = this.container.querySelector('[data-debug-stat="cart-total"]');
    const enhancedElementsEl = this.container.querySelector('[data-debug-stat="enhanced-elements"]');
    if (cartItemsEl) cartItemsEl.textContent = cartState.totalQuantity.toString();
    if (cartTotalEl) cartTotalEl.textContent = cartState.totals.total.formatted;
    if (enhancedElementsEl) enhancedElementsEl.textContent = document.querySelectorAll("[data-next-]").length.toString();
  }
};
_DebugOverlay.EXPANDED_STORAGE_KEY = "debug-overlay-expanded";
let DebugOverlay = _DebugOverlay;
const debugOverlay = DebugOverlay.getInstance();
if (typeof window !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    debugOverlay.initialize();
  });
}
export {
  DebugOverlay,
  debugOverlay
};
