/**
 * Debug Overlay - Main controller for debug utilities
 * 
 * Provides a comprehensive debugging interface when ?debug=true is present
 * in the URL. Features cart state inspection, store monitoring, and more.
 */

import { Logger } from '../logger';
import { DebugEventManager } from './DebugEventManager';
import { EnhancedDebugUI } from './EnhancedDebugUI';
import { useCartStore } from '../../stores/cartStore';
import { useConfigStore } from '../../stores/configStore';
import { XrayManager } from './XrayStyles';
import {
  CartPanel,
  EventTimelinePanel,
  ConfigPanel,
  CheckoutPanel,
  StoragePanel,
  EnhancedCampaignPanel,
  DebugPanel
} from './panels';

export class DebugOverlay {
  private static instance: DebugOverlay;
  private visible = false;
  private isExpanded = false;
  private container: HTMLDivElement | null = null;
  private activePanel = 'cart';
  private activePanelTab: string | undefined;
  private updateInterval: number | null = null;
  private logger = new Logger('DebugOverlay');
  
  private eventManager: DebugEventManager;
  private panels: DebugPanel[] = [];
  
  // Storage keys
  private static readonly EXPANDED_STORAGE_KEY = 'debug-overlay-expanded';

  public static getInstance(): DebugOverlay {
    if (!DebugOverlay.instance) {
      DebugOverlay.instance = new DebugOverlay();
    }
    return DebugOverlay.instance;
  }

  private constructor() {
    this.eventManager = new DebugEventManager();
    this.initializePanels();
    this.setupEventListeners();
    
    // Restore expanded state from localStorage
    const savedExpandedState = localStorage.getItem(DebugOverlay.EXPANDED_STORAGE_KEY);
    if (savedExpandedState === 'true') {
      this.isExpanded = true;
    }
  }

  private initializePanels(): void {
    this.panels = [
      new CartPanel(),
      new ConfigPanel(),
      new EnhancedCampaignPanel(),
      new CheckoutPanel(),
      new EventTimelinePanel(),
      new StoragePanel()
    ];
  }

  private setupEventListeners(): void {
    // Listen for content updates
    document.addEventListener('debug:update-content', () => {
      this.updateContent();
    });
  }

  public initialize(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const isDebugMode = urlParams.get('debugger') === 'true';
    
    if (isDebugMode) {
      this.show();
      this.logger.info('Debug overlay initialized');
      
      // Test components in development
      if (import.meta.env && import.meta.env.DEV) {

      }
    }
  }

  public async show(): Promise<void> {
    if (this.visible) return;

    this.visible = true;
    await this.createOverlay();
    this.startAutoUpdate();
    
    // Initialize XrayManager with saved state
    XrayManager.initialize();
    
    // Update X-ray button state if active
    if (XrayManager.isXrayActive()) {
      const xrayButton = this.container?.querySelector('[data-action="toggle-xray"]');
      if (xrayButton) {
        xrayButton.classList.add('active');
        xrayButton.setAttribute('title', 'Disable X-Ray View');
      }
    }
    
    // Auto-restore mini cart if it was previously visible
    const savedMiniCartState = localStorage.getItem('debug-mini-cart-visible');
    if (savedMiniCartState === 'true') {
      this.toggleMiniCart();
    }
  }

  public hide(): void {
    if (!this.visible) return;

    this.visible = false;
    this.stopAutoUpdate();
    
    // Remove body height adjustment
    document.body.classList.remove('debug-body-expanded');
    document.documentElement.classList.remove('debug-body-expanded');
    
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
    
    EnhancedDebugUI.removeStyles();
  }

  public async toggle(): Promise<void> {
    if (this.visible) {
      this.hide();
    } else {
      await this.show();
    }
  }

  public isVisible(): boolean {
    return this.visible;
  }

  private async createOverlay(): Promise<void> {
    // Load debug styles using the existing DebugStyleLoader
    const { DebugStyleLoader } = await import('./DebugStyleLoader');
    await DebugStyleLoader.loadDebugStyles();
    
    this.container = document.createElement('div');
    this.container.className = 'debug-overlay';
    
    // Render initial content
    this.updateOverlay();
    
    // Add event listeners
    this.addEventListeners();
    
    document.body.appendChild(this.container);
  }

  private updateOverlay(): void {
    if (!this.container) return;
    
    this.container.innerHTML = EnhancedDebugUI.createOverlayHTML(
      this.panels, 
      this.activePanel, 
      this.isExpanded,
      this.activePanelTab
    );
    
    this.addEventListeners();
    
    // Restore button states
    this.updateButtonStates();
  }

  private updateContent(): void {
    if (!this.container) return;
    
    const panelContent = this.container.querySelector('.panel-content');
    if (panelContent) {
      const activePanel = this.panels.find(p => p.id === this.activePanel);
      if (activePanel) {
        const tabs = activePanel.getTabs?.() || [];
        if (tabs.length > 0) {
          // Panel has horizontal tabs - get content from active tab
          const activeTabId = this.activePanelTab || tabs[0]?.id;
          const activeTab = tabs.find(tab => tab.id === activeTabId) || tabs[0];
          if (activeTab) {
            panelContent.innerHTML = activeTab.getContent();
          }
        } else {
          // Panel doesn't have horizontal tabs - use regular content
          panelContent.innerHTML = activePanel.getContent();
        }
      }
    }
  }

  private addEventListeners(): void {
    if (!this.container) return;

    // Remove any existing listeners to prevent duplicates
    this.container.removeEventListener('click', this.handleContainerClick);
    
    // Use event delegation for all debug actions
    this.container.addEventListener('click', this.handleContainerClick);
  }

  private handleContainerClick = (event: Event) => {
    const target = event.target as HTMLElement;
    const action = target.getAttribute('data-action') || target.closest('[data-action]')?.getAttribute('data-action');
    
    // Handle main debug actions
    if (action) {
      switch (action) {
        case 'toggle-expand':
          this.isExpanded = !this.isExpanded;
          // Save expanded state to localStorage
          localStorage.setItem(DebugOverlay.EXPANDED_STORAGE_KEY, this.isExpanded.toString());
          this.updateBodyHeight();
          this.updateOverlay();
          break;
        case 'close':
          this.hide();
          break;
        case 'clear-cart':
          this.clearCart();
          break;
        case 'export-data':
          this.exportAllData();
          break;
        case 'toggle-mini-cart':
          this.toggleMiniCart();
          break;
        case 'toggle-xray':
          this.toggleXray();
          break;
      }
      return;
    }

    // Handle panel tab switching
    const panelTab = target.closest('.debug-panel-tab') as HTMLElement;
    if (panelTab) {
      const panelId = panelTab.getAttribute('data-panel');
      if (panelId && panelId !== this.activePanel) {
        this.activePanel = panelId;
        this.activePanelTab = undefined; // Reset horizontal tab when switching panels
        this.updateOverlay();
      }
      return;
    }

    // Handle horizontal tab switching within panels
    const horizontalTab = target.closest('.horizontal-tab') as HTMLElement;
    if (horizontalTab) {
      const tabId = horizontalTab.getAttribute('data-panel-tab');
      if (tabId && tabId !== this.activePanelTab) {
        this.activePanelTab = tabId;
        this.updateOverlay();
      }
      return;
    }

    // Handle panel action buttons
    const panelActionBtn = target.closest('.panel-action-btn') as HTMLElement;
    if (panelActionBtn) {
      const actionLabel = panelActionBtn.getAttribute('data-panel-action');
      const activePanel = this.panels.find(p => p.id === this.activePanel);
      const panelAction = activePanel?.getActions?.()?.find(a => a.label === actionLabel);
      
      if (panelAction) {
        panelAction.action();
        // Update content after action
        setTimeout(() => this.updateContent(), 100);
      }
      return;
    }
  };

  private updateBodyHeight(): void {
    if (this.isExpanded) {
      document.body.classList.add('debug-body-expanded');
      document.documentElement.classList.add('debug-body-expanded');
    } else {
      document.body.classList.remove('debug-body-expanded');
      document.documentElement.classList.remove('debug-body-expanded');
    }
  }

  private startAutoUpdate(): void {
    this.updateInterval = window.setInterval(() => {
      // Only update quick stats, not the full content to avoid losing focus
      this.updateQuickStats();
      
      // Only update content for specific panels that need real-time updates
      if (this.activePanel === 'cart' || this.activePanel === 'config') {
        this.updateContent();
      }
    }, 1000);
  }

  private stopAutoUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // Public API for external access
  public getEventManager(): DebugEventManager {
    return this.eventManager;
  }

  public getPanels(): DebugPanel[] {
    return this.panels;
  }

  public setActivePanel(panelId: string): void {
    if (this.panels.find(p => p.id === panelId)) {
      this.activePanel = panelId;
      this.updateOverlay();
    }
  }

  public logEvent(type: string, data: any, source: string = 'Manual'): void {
    this.eventManager.logEvent(type, data, source);
  }

  // Enhanced debug methods for global access
  private clearCart(): void {
    useCartStore.getState().clear();
    this.updateContent();
  }

  private exportAllData(): void {
    const debugData = {
      timestamp: new Date().toISOString(),
      cart: useCartStore.getState(),
      config: useConfigStore.getState(),
      events: this.eventManager.getEvents(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    const data = JSON.stringify(debugData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-session-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private toggleMiniCart(): void {
    let miniCart = document.getElementById('debug-mini-cart-display');
    
    if (!miniCart) {
      // Create mini cart if it doesn't exist
      miniCart = document.createElement('div');
      miniCart.id = 'debug-mini-cart-display';
      miniCart.className = 'debug-mini-cart-display';
      document.body.appendChild(miniCart);
      
      // Subscribe to cart changes for real-time updates
      useCartStore.subscribe(() => {
        if (miniCart && miniCart.classList.contains('show')) {
          this.updateMiniCart();
        }
      });
      
      // Check localStorage for saved state
      const savedState = localStorage.getItem('debug-mini-cart-visible');
      if (savedState === 'true') {
        miniCart.classList.add('show');
        this.updateMiniCart();
      }
    } else {
      // Toggle visibility
      miniCart.classList.toggle('show');
      
      // Save state to localStorage
      localStorage.setItem('debug-mini-cart-visible', miniCart.classList.contains('show').toString());
      
      // Update content if showing
      if (miniCart.classList.contains('show')) {
        this.updateMiniCart();
      }
    }
    
    // Update cart button state
    const cartButton = this.container?.querySelector('[data-action="toggle-mini-cart"]');
    if (cartButton && miniCart) {
      if (miniCart.classList.contains('show')) {
        cartButton.classList.add('active');
        cartButton.setAttribute('title', 'Hide Mini Cart');
      } else {
        cartButton.classList.remove('active');
        cartButton.setAttribute('title', 'Toggle Mini Cart');
      }
    }
  }

  private updateMiniCart(): void {
    const miniCart = document.getElementById('debug-mini-cart-display');
    if (!miniCart || !miniCart.classList.contains('show')) return;
    
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
    
    let itemsHtml = '';
    cartState.items.forEach(item => {
      // Check for upsell flag
      const isUpsell = item.is_upsell;
      const upsellBadge = isUpsell ? '<span class="mini-cart-upsell-badge">UPSELL</span>' : '';
      itemsHtml += `
        <div class="debug-mini-cart-item">
          <div class="mini-cart-item-info">
            <span class="mini-cart-item-id">ID: ${item.packageId}</span>
            ${upsellBadge}
            <span class="mini-cart-item-qty">×${item.quantity}</span>
          </div>
          <div class="mini-cart-item-title">${item.title || 'Unknown'}</div>
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


  private toggleXray(): void {
    const isActive = XrayManager.toggle();
    
    // Update button state
    const xrayButton = this.container?.querySelector('[data-action="toggle-xray"]');
    if (xrayButton) {
      if (isActive) {
        xrayButton.classList.add('active');
        xrayButton.setAttribute('title', 'Disable X-Ray View');
      } else {
        xrayButton.classList.remove('active');
        xrayButton.setAttribute('title', 'Toggle X-Ray View');
      }
    }
    
    // Log event
    this.eventManager.logEvent('debug:xray-toggled', { active: isActive }, 'Debug');
  }

  private updateButtonStates(): void {
    // Update X-ray button state
    if (XrayManager.isXrayActive()) {
      const xrayButton = this.container?.querySelector('[data-action="toggle-xray"]');
      if (xrayButton) {
        xrayButton.classList.add('active');
        xrayButton.setAttribute('title', 'Disable X-Ray View');
      }
    }
    
    // Update mini cart button state
    const miniCart = document.getElementById('debug-mini-cart-display');
    if (miniCart && miniCart.classList.contains('show')) {
      const cartButton = this.container?.querySelector('[data-action="toggle-mini-cart"]');
      if (cartButton) {
        cartButton.classList.add('active');
        cartButton.setAttribute('title', 'Hide Mini Cart');
      }
    }
  }

  public updateQuickStats(): void {
    if (!this.container) return;

    const cartState = useCartStore.getState();
    
    // Update cart stats
    const cartItemsEl = this.container.querySelector('[data-debug-stat="cart-items"]');
    const cartTotalEl = this.container.querySelector('[data-debug-stat="cart-total"]');
    const enhancedElementsEl = this.container.querySelector('[data-debug-stat="enhanced-elements"]');
    
    if (cartItemsEl) cartItemsEl.textContent = cartState.totalQuantity.toString();
    if (cartTotalEl) cartTotalEl.textContent = cartState.totals.total.formatted;
    if (enhancedElementsEl) enhancedElementsEl.textContent = document.querySelectorAll('[data-next-]').length.toString();
  }
}

// Global instance
export const debugOverlay = DebugOverlay.getInstance();

// Auto-initialize if debug mode
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    debugOverlay.initialize();
  });
}