/**
 * Country Selector for Debug Mode
 * Fixed position country switcher for testing multi-country functionality
 */

import { useConfigStore } from '@/stores/configStore';
import { useCampaignStore } from '@/stores/campaignStore';
import { useCartStore } from '@/stores/cartStore';
import { CountryService } from '@/utils/countryService';
import { Logger } from '@/utils/logger';
import type { Country } from '@/utils/countryService';

export class CountrySelector {
  private static instance: CountrySelector;
  private container: HTMLDivElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private logger = new Logger('CountrySelector');
  private isChanging = false;
  private listenersAttached = false;
  private renderDebounceTimer: NodeJS.Timeout | null = null;
  private hasInitiallyRendered = false;
  private countries: Country[] = [];

  public static getInstance(): CountrySelector {
    if (!CountrySelector.instance) {
      CountrySelector.instance = new CountrySelector();
    }
    return CountrySelector.instance;
  }

  private constructor() {}

  public async initialize(): Promise<void> {
    // Only show in debug mode
    const configStore = useConfigStore.getState();
    if (!configStore.debug) {
      return;
    }

    // Load countries list
    await this.loadCountries();

    this.createContainer();
    this.render();
    this.setupEventListeners();
    this.logger.info('Country selector initialized');
  }

  private async loadCountries(): Promise<void> {
    try {
      const countryService = CountryService.getInstance();
      const locationData = await countryService.getLocationData();
      this.countries = locationData.countries || [];
      this.logger.debug(`Loaded ${this.countries.length} countries`);
    } catch (error) {
      this.logger.error('Failed to load countries:', error);
      this.countries = [];
    }
  }

  private createContainer(): void {
    // Remove existing container if any
    if (this.container) {
      this.container.remove();
    }

    // Create container
    this.container = document.createElement('div');
    this.container.id = 'debug-country-selector';
    this.container.style.cssText = `
      position: fixed;
      top: 60px;
      left: 10px;
      z-index: 999999;
      pointer-events: auto;
    `;

    // Create shadow root for style isolation
    this.shadowRoot = this.container.attachShadow({ mode: 'open' });

    // Add to body
    document.body.appendChild(this.container);
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
    const detectedCountry = configStore.detectedCountry || 'US';
    const currentCountry = sessionStorage.getItem('next_selected_country') || detectedCountry;
    
    // Don't show selector if no countries loaded
    if (this.countries.length === 0) {
      this.logger.debug('No countries available, hiding country selector');
      if (this.container) {
        this.container.style.display = 'none';
      }
      return;
    }
    
    // Make sure container is visible
    if (this.container) {
      this.container.style.display = 'block';
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        .country-selector {
          background: linear-gradient(135deg, #4c6ef5 0%, #5f3dc4 100%);
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

        .country-selector:hover {
          box-shadow: 0 6px 30px rgba(0, 0, 0, 0.35);
          transform: translateY(-2px);
        }

        .country-label {
          color: white;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 4px;
          opacity: 0.9;
        }

        .country-select-wrapper {
          position: relative;
          display: inline-block;
        }

        .country-select {
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
          min-width: 140px;
        }

        .country-select:hover {
          background: white;
          border-color: rgba(255, 255, 255, 0.5);
        }

        .country-select:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
        }

        .country-select:disabled {
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

        .country-info {
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

        .reset-button {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 6px;
          color: white;
          padding: 4px 8px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .reset-button:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      </style>

      <div class="country-selector">
        <span class="country-label">🌍 Country</span>
        
        <div class="country-select-wrapper">
          <select class="country-select" id="country-select">
            ${this.countries.map(country => `
              <option value="${country.code}" ${country.code === currentCountry ? 'selected' : ''}>
                ${country.name}
              </option>
            `).join('')}
          </select>
          <svg class="select-arrow" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
          </svg>
        </div>

        <div class="loading-indicator" id="loading-indicator"></div>

        ${detectedCountry !== currentCountry ? `
          <button class="reset-button" id="reset-button" title="Reset to detected country">
            Reset
          </button>
        ` : ''}

        ${detectedCountry ? `
          <div class="country-info">
            <span class="detected-label">Detected:</span>
            <span class="detected-value">${detectedCountry}</span>
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

    // Handle country selection changes
    this.shadowRoot.addEventListener('change', async (e) => {
      const target = e.target as HTMLElement;
      
      if (target && target.id === 'country-select') {
        const selectElement = target as HTMLSelectElement;
        const newCountry = selectElement.value;
        
        if (this.isChanging) {
          this.logger.warn('Country change already in progress');
          return;
        }

        this.logger.debug(`Country select changed to: ${newCountry}`);
        await this.handleCountryChange(newCountry);
      }
    });

    // Handle reset button clicks
    this.shadowRoot.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement;
      
      if (target && target.id === 'reset-button') {
        const configStore = useConfigStore.getState();
        const detectedCountry = configStore.detectedCountry || 'US';
        
        this.logger.debug('Resetting to detected country:', detectedCountry);
        await this.handleCountryChange(detectedCountry, true);
      }
    });

    // Listen for country changes from other sources
    document.addEventListener('next:country-changed', () => {
      this.logger.debug('External country change detected, re-rendering selector');
      this.render();
    });
    
    this.listenersAttached = true;
    this.logger.debug('Event listeners attached to country selector');
  }

  private async handleCountryChange(newCountry: string, isReset: boolean = false): Promise<void> {
    this.isChanging = true;
    
    const select = this.shadowRoot?.getElementById('country-select') as HTMLSelectElement;
    const loadingIndicator = this.shadowRoot?.getElementById('loading-indicator');
    
    if (select) select.disabled = true;
    if (loadingIndicator) loadingIndicator.classList.add('active');

    try {
      this.logger.info(`Changing country to ${newCountry}`);
      
      const configStore = useConfigStore.getState();
      const campaignStore = useCampaignStore.getState();
      const cartStore = useCartStore.getState();
      const countryService = CountryService.getInstance();
      
      // Store the old country
      const oldCountry = sessionStorage.getItem('next_selected_country') || configStore.detectedCountry || 'US';
      
      if (isReset) {
        // Clear forced country from session
        sessionStorage.removeItem('next_selected_country');
        this.logger.info('Cleared selected country override, using detected country');
      } else {
        // Save forced country to session
        sessionStorage.setItem('next_selected_country', newCountry);
        this.logger.info(`Saved selected country to session: ${newCountry}`);
      }
      
      // Fetch country configuration
      const countryConfig = await countryService.getCountryConfig(newCountry);
      const countryStates = await countryService.getCountryStates(newCountry);
      
      // Update config store with new country data
      configStore.updateConfig({
        locationData: {
          detectedCountryCode: newCountry,
          detectedCountryConfig: countryConfig,
          detectedStates: countryStates.states,
          detectedStateCode: '',
          detectedCity: '',
          countries: this.countries
        }
      });
      
      // If country has a different currency, update it
      if (countryConfig.currencyCode && countryConfig.currencyCode !== configStore.selectedCurrency) {
        this.logger.info(`Country currency is ${countryConfig.currencyCode}, updating...`);
        
        // Don't clear cache - the campaignStore already caches per currency
        // and will reuse cached data if available for each currency
        
        // Update selected currency
        configStore.updateConfig({
          selectedCurrency: countryConfig.currencyCode
        });
        
        // Save currency preference
        sessionStorage.setItem('next_selected_currency', countryConfig.currencyCode);
        
        // Reload campaign with new currency
        await campaignStore.loadCampaign(configStore.apiKey);
        
        // Refresh cart prices
        await cartStore.refreshItemPrices();
        
        // Trigger currency selector update
        document.dispatchEvent(new CustomEvent('next:currency-changed', {
          detail: { 
            from: configStore.selectedCurrency,
            to: countryConfig.currencyCode,
            source: 'country-selector'
          }
        }));
      }
      
      this.logger.info(`Country changed successfully to ${newCountry}`);
      
      // Emit country change event
      document.dispatchEvent(new CustomEvent('next:country-changed', {
        detail: { 
          from: oldCountry,
          to: newCountry,
          currency: countryConfig.currencyCode
        }
      }));
      
      // Trigger display updates
      document.dispatchEvent(new CustomEvent('debug:update-content'));
      
      // Show success feedback
      this.showSuccessFeedback(newCountry);
      
      // Re-render to update UI
      this.render();
      
    } catch (error) {
      this.logger.error('Failed to change country:', error);
      this.showErrorFeedback();
      
      // Revert selection
      const currentCountry = sessionStorage.getItem('next_selected_country') || 
                           useConfigStore.getState().detectedCountry || 'US';
      if (select) select.value = currentCountry;
      
    } finally {
      this.isChanging = false;
      if (select) select.disabled = false;
      if (loadingIndicator) loadingIndicator.classList.remove('active');
    }
  }

  private showSuccessFeedback(_country: string): void {
    const selector = this.shadowRoot?.querySelector('.country-selector') as HTMLElement;
    if (!selector) return;

    selector.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    
    setTimeout(() => {
      selector.style.background = 'linear-gradient(135deg, #4c6ef5 0%, #5f3dc4 100%)';
    }, 1000);
  }

  private showErrorFeedback(): void {
    const selector = this.shadowRoot?.querySelector('.country-selector') as HTMLElement;
    if (!selector) return;

    selector.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    
    setTimeout(() => {
      selector.style.background = 'linear-gradient(135deg, #4c6ef5 0%, #5f3dc4 100%)';
    }, 1000);
  }

  public destroy(): void {
    if (this.renderDebounceTimer) {
      clearTimeout(this.renderDebounceTimer);
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
export const countrySelector = CountrySelector.getInstance();