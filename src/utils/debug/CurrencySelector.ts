/**
 * Currency Selector for Debug Mode
 * Fixed position currency switcher for testing multi-currency functionality
 */

import { useConfigStore } from '@/stores/configStore';
import { useCampaignStore } from '@/stores/campaignStore';
import { useCartStore } from '@/stores/cartStore';
import { Logger } from '@/utils/logger';

export class CurrencySelector {
  private static instance: CurrencySelector;
  private container: HTMLDivElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private logger = new Logger('CurrencySelector');
  private isChanging = false;
  private listenersAttached = false;
  private renderDebounceTimer: NodeJS.Timeout | null = null;
  private hasInitiallyRendered = false;

  public static getInstance(): CurrencySelector {
    if (!CurrencySelector.instance) {
      CurrencySelector.instance = new CurrencySelector();
    }
    return CurrencySelector.instance;
  }

  private constructor() {}

  public initialize(): void {
    // Only show in debug mode
    const configStore = useConfigStore.getState();
    if (!configStore.debug) {
      return;
    }

    this.createContainer();
    this.render();
    this.setupEventListeners();
    this.setupStoreSubscriptions();
    this.logger.info('Currency selector initialized');
  }

  private setupStoreSubscriptions(): void {
    // Subscribe to campaign store changes to re-render when campaign data loads
    const unsubscribe = useCampaignStore.subscribe((state, prevState) => {
      // Skip if we're currently changing currency (to avoid re-render during our own change)
      if (this.isChanging) {
        return;
      }
      
      // Only re-render if the currency actually changed or data was loaded for the first time
      const currencyChanged = state.data?.currency !== prevState?.data?.currency;
      const dataLoaded = !prevState?.data && state.data;
      
      if (currencyChanged || dataLoaded) {
        this.logger.debug('Campaign currency changed or data loaded, re-rendering currency selector');
        this.render();
      }
    });
    
    // Store unsubscribe function for cleanup
    (this as any)._unsubscribeCampaign = unsubscribe;
  }

  private createContainer(): void {
    // Remove existing container if any
    if (this.container) {
      this.container.remove();
    }

    // Create container
    this.container = document.createElement('div');
    this.container.id = 'debug-currency-selector';
    this.container.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      z-index: 999999;
      pointer-events: auto;
    `;

    // Create shadow root for style isolation
    this.shadowRoot = this.container.attachShadow({ mode: 'open' });

    // Add to body
    document.body.appendChild(this.container);
  }

  private getAvailableCurrencies(): Array<{ code: string; label: string }> {
    const campaignStore = useCampaignStore.getState();
    
    // Get currencies from campaign data if available
    if (campaignStore.data?.available_currencies && campaignStore.data.available_currencies.length > 0) {
      return campaignStore.data.available_currencies;
    }
    
    // Fallback to a default set if campaign doesn't have available_currencies
    return [
      { code: 'USD', label: '$ USD' },
      { code: 'EUR', label: '€ EUR' },
      { code: 'GBP', label: '£ GBP' }
    ];
  }

  private render(): void {
    // Debounce renders to prevent excessive updates
    if (this.renderDebounceTimer) {
      clearTimeout(this.renderDebounceTimer);
    }
    
    this.renderDebounceTimer = setTimeout(() => {
      this.doRender();
    }, 50);
  }
  
  private doRender(): void {
    if (!this.shadowRoot) return;

    const configStore = useConfigStore.getState();
    const campaignStore = useCampaignStore.getState();
    const currentCurrency = configStore.selectedCurrency || configStore.detectedCurrency || 'USD';
    const availableCurrencies = this.getAvailableCurrencies();
    
    // Don't render if no campaign data yet
    if (!campaignStore.data) {
      this.logger.debug('No campaign data available yet, skipping currency selector render');
      // Retry render after a delay
      setTimeout(() => this.doRender(), 1000);
      return;
    }
    
    // Don't show selector if only one currency is available
    if (availableCurrencies.length <= 1) {
      this.logger.debug('Only one currency available, hiding currency selector');
      if (this.container) {
        this.container.style.display = 'none';
      }
      return;
    }
    
    // Make sure container is visible if we have multiple currencies
    if (this.container) {
      this.container.style.display = 'block';
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        .currency-selector {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          padding: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          ${!this.hasInitiallyRendered ? 'animation: slideIn 0.3s ease;' : ''}
        }

        @keyframes slideIn {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .currency-selector:hover {
          box-shadow: 0 6px 30px rgba(0, 0, 0, 0.35);
          transform: translateY(-2px);
        }

        .currency-label {
          color: white;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 4px;
          opacity: 0.9;
        }

        .currency-select-wrapper {
          position: relative;
          display: inline-block;
        }

        .currency-select {
          appearance: none;
          background: rgba(255, 255, 255, 0.95);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          padding: 6px 32px 6px 12px;
          font-size: 14px;
          font-weight: 600;
          color: #4a5568;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 100px;
        }

        .currency-select:hover {
          background: white;
          border-color: rgba(255, 255, 255, 0.5);
        }

        .currency-select:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
        }

        .currency-select:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .select-arrow {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #4a5568;
        }

        .currency-flag {
          display: inline-block;
          width: 20px;
          height: 20px;
          margin-right: 6px;
          vertical-align: middle;
          font-size: 16px;
        }

        .loading-indicator {
          display: none;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        .loading-indicator.active {
          display: inline-block;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .currency-info {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 6px;
          padding: 4px 8px;
          color: white;
          font-size: 11px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .detected-label {
          opacity: 0.8;
        }

        .detected-value {
          font-weight: 700;
        }
      </style>

      <div class="currency-selector">
        <span class="currency-label">💱 Currency</span>
        
        <div class="currency-select-wrapper">
          <select class="currency-select" id="currency-select">
            ${availableCurrencies.map(currency => `
              <option value="${currency.code}" ${currency.code === currentCurrency ? 'selected' : ''}>
                ${currency.label}
              </option>
            `).join('')}
          </select>
          <svg class="select-arrow" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
          </svg>
        </div>

        <div class="loading-indicator" id="loading-indicator"></div>

        ${configStore.detectedCurrency ? `
          <div class="currency-info">
            <span class="detected-label">Detected:</span>
            <span class="detected-value">${configStore.detectedCurrency}</span>
          </div>
        ` : ''}
      </div>
    `;
    
    // Mark as initially rendered to prevent animation on subsequent renders
    if (!this.hasInitiallyRendered) {
      this.hasInitiallyRendered = true;
    }
  }

  private setupEventListeners(): void {
    if (!this.shadowRoot || this.listenersAttached) return;

    // Use event delegation on shadowRoot to handle select changes
    // This ensures the event listener persists even after re-renders
    this.shadowRoot.addEventListener('change', async (e) => {
      const target = e.target as HTMLElement;
      
      // Check if the change event is from the currency select
      if (target && target.id === 'currency-select') {
        const selectElement = target as HTMLSelectElement;
        const newCurrency = selectElement.value;
        
        if (this.isChanging) {
          this.logger.warn('Currency change already in progress');
          return;
        }

        this.logger.debug(`Currency select changed to: ${newCurrency}`);
        await this.handleCurrencyChange(newCurrency);
      }
    });

    // Listen for currency changes from other sources
    document.addEventListener('next:currency-changed', (e) => {
      const customEvent = e as CustomEvent;
      // Skip if this change was initiated by this selector (to avoid self-triggering)
      if ((customEvent.detail as any)?.source === 'currency-selector') {
        return;
      }
      
      // Debounce re-renders to avoid loops
      clearTimeout((this as any)._rerenderTimeout);
      (this as any)._rerenderTimeout = setTimeout(() => {
        this.logger.debug('External currency change detected, re-rendering selector');
        this.render();
      }, 100);
    });
    
    this.listenersAttached = true;
    this.logger.debug('Event listeners attached to currency selector');
  }

  private async handleCurrencyChange(newCurrency: string): Promise<void> {
    this.isChanging = true;
    
    const select = this.shadowRoot?.getElementById('currency-select') as HTMLSelectElement;
    const loadingIndicator = this.shadowRoot?.getElementById('loading-indicator');
    
    if (select) select.disabled = true;
    if (loadingIndicator) loadingIndicator.classList.add('active');

    try {
      this.logger.info(`Changing currency to ${newCurrency}`);
      
      const configStore = useConfigStore.getState();
      const campaignStore = useCampaignStore.getState();
      const cartStore = useCartStore.getState();
      
      // Store the old currency for event
      const oldCurrency = configStore.selectedCurrency || configStore.detectedCurrency || 'USD';
      
      // Clear the cache for the CURRENT currency before switching
      // This ensures we don't use stale data when switching back
      campaignStore.clearCache();
      
      // Now update the selected currency in config
      configStore.updateConfig({
        selectedCurrency: newCurrency
      });
      
      // Save to sessionStorage for persistence across page refreshes
      sessionStorage.setItem('next_selected_currency', newCurrency);
      this.logger.info(`Saved currency preference to session: ${newCurrency}`);
      
      // Reload campaign data with new currency
      await campaignStore.loadCampaign(configStore.apiKey);
      
      // Refresh cart item prices with new campaign data
      await cartStore.refreshItemPrices();
      
      // Note: refreshItemPrices already calls calculateTotals internally
      
      this.logger.info(`Currency changed successfully to ${newCurrency}`);
      
      // Emit event for other components (mark as from selector to avoid self-triggering)
      document.dispatchEvent(new CustomEvent('next:currency-changed', {
        detail: { 
          from: oldCurrency,
          to: newCurrency,
          source: 'currency-selector'
        }
      }));
      
      // Trigger display updates
      document.dispatchEvent(new CustomEvent('debug:update-content'));
      
      // Show success feedback
      this.showSuccessFeedback(newCurrency);
      
    } catch (error) {
      this.logger.error('Failed to change currency:', error);
      this.showErrorFeedback();
      
      // Revert selection
      const configStore = useConfigStore.getState();
      const currentCurrency = configStore.selectedCurrency || 'USD';
      if (select) select.value = currentCurrency;
      
    } finally {
      this.isChanging = false;
      if (select) select.disabled = false;
      if (loadingIndicator) loadingIndicator.classList.remove('active');
    }
  }

  private showSuccessFeedback(_currency: string): void {
    const selector = this.shadowRoot?.querySelector('.currency-selector') as HTMLElement;
    if (!selector) return;

    // Add success animation
    selector.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    
    setTimeout(() => {
      selector.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }, 1000);
  }

  private showErrorFeedback(): void {
    const selector = this.shadowRoot?.querySelector('.currency-selector') as HTMLElement;
    if (!selector) return;

    // Add error animation
    selector.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    
    setTimeout(() => {
      selector.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }, 1000);
  }

  public destroy(): void {
    // Clean up store subscriptions
    if ((this as any)._unsubscribeCampaign) {
      (this as any)._unsubscribeCampaign();
      (this as any)._unsubscribeCampaign = null;
    }
    if (this.renderDebounceTimer) {
      clearTimeout(this.renderDebounceTimer);
    }
    if ((this as any)._rerenderTimeout) {
      clearTimeout((this as any)._rerenderTimeout);
    }
    
    if (this.container) {
      this.container.remove();
      this.container = null;
      this.shadowRoot = null;
    }
  }

  public hide(): void {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }

  public show(): void {
    if (this.container) {
      this.container.style.display = 'block';
    }
  }
}

// Export singleton instance
export const currencySelector = CurrencySelector.getInstance();