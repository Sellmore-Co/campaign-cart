/**
 * Locale Selector for Debug Mode
 * Fixed position locale switcher for testing multi-locale functionality
 */

import { Logger } from '@/utils/logger';

export class LocaleSelector {
  private static instance: LocaleSelector;
  private container: HTMLDivElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private logger = new Logger('LocaleSelector');
  private isChanging = false;
  private listenersAttached = false;
  private renderDebounceTimer: NodeJS.Timeout | null = null;
  private hasInitiallyRendered = false;

  // Common locales for testing
  private locales = [
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
    { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
    { code: 'en-CA', name: 'English (CA)', flag: '🇨🇦' },
    { code: 'en-AU', name: 'English (AU)', flag: '🇦🇺' },
    { code: 'pt-BR', name: 'Português (BR)', flag: '🇧🇷' },
    { code: 'es-ES', name: 'Español (ES)', flag: '🇪🇸' },
    { code: 'es-MX', name: 'Español (MX)', flag: '🇲🇽' },
    { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
    { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it-IT', name: 'Italiano', flag: '🇮🇹' },
    { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
    { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
    { code: 'ko-KR', name: '한국어', flag: '🇰🇷' },
    { code: 'ru-RU', name: 'Русский', flag: '🇷🇺' },
    { code: 'ar-SA', name: 'العربية', flag: '🇸🇦' },
    { code: 'hi-IN', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'nl-NL', name: 'Nederlands', flag: '🇳🇱' },
    { code: 'sv-SE', name: 'Svenska', flag: '🇸🇪' },
    { code: 'pl-PL', name: 'Polski', flag: '🇵🇱' },
    { code: 'tr-TR', name: 'Türkçe', flag: '🇹🇷' }
  ];

  public static getInstance(): LocaleSelector {
    if (!LocaleSelector.instance) {
      LocaleSelector.instance = new LocaleSelector();
    }
    return LocaleSelector.instance;
  }

  private constructor() {}

  public initialize(): void {
    this.createContainer();
    this.render();
    this.setupEventListeners();
    this.logger.info('Locale selector initialized');
  }

  private createContainer(): void {
    // Remove existing container if any
    if (this.container) {
      this.container.remove();
    }

    // Create container
    this.container = document.createElement('div');
    this.container.id = 'debug-locale-selector';
    this.container.style.cssText = `
      position: relative;
      pointer-events: auto;
    `;

    // Create shadow root for style isolation
    this.shadowRoot = this.container.attachShadow({ mode: 'open' });

    // Add to body (will be moved to selector container)
    document.body.appendChild(this.container);
  }

  private getCurrentLocale(): string {
    // Check for saved locale in session storage
    const savedLocale = sessionStorage.getItem('next_selected_locale');
    if (savedLocale) {
      return savedLocale;
    }
    
    // Fall back to browser locale
    return navigator.language || 'en-US';
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

    const currentLocale = this.getCurrentLocale();
    const detectedLocale = navigator.language || 'en-US';
    
    // Make sure container is visible
    if (this.container) {
      this.container.style.display = 'block';
    }
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        .locale-selector {
          background: linear-gradient(135deg, #222 0%, #1a1a1a 100%);
          backdrop-filter: blur(10px);
          border: 1px solid #333;
          border-radius: 4px;
          padding: 4px 8px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          transition: all 0.2s ease;
        }

        .locale-selector:hover {
          background: linear-gradient(135deg, #2a2a2a 0%, #222 100%);
          border-color: #444;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        }

        .locale-label {
          color: rgba(255, 255, 255, 0.9);
          font-size: 11px;
          font-weight: 500;
          white-space: nowrap;
        }

        .locale-select {
          appearance: none;
          background: #2a2a2a;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 3px;
          padding: 2px 20px 2px 6px;
          font-size: 11px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.9);
          cursor: pointer;
          min-width: 100px;
          max-width: 140px;
        }

        .locale-select option {
          background: #2a2a2a;
          color: rgba(255, 255, 255, 0.9);
          padding: 4px;
        }

        .locale-select:hover {
          background: #333;
          border-color: rgba(255, 255, 255, 0.3);
        }

        .locale-select:focus {
          outline: none;
          border-color: #4299e1;
          background: #333;
        }

        .locale-select:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .select-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .select-arrow {
          position: absolute;
          right: 4px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: rgba(255, 255, 255, 0.6);
          width: 10px;
          height: 10px;
        }

        .loading-indicator {
          display: none;
          width: 10px;
          height: 10px;
          border: 1px solid #cbd5e0;
          border-top-color: #4299e1;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .loading-indicator.active {
          display: inline-block;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .reset-button {
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 3px;
          color: #ff6b6b;
          padding: 2px 6px;
          font-size: 10px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .reset-button:hover {
          background: rgba(239, 68, 68, 0.3);
          border-color: rgba(239, 68, 68, 0.4);
          color: #ff8787;
        }

        .detected-info {
          color: rgba(255, 255, 255, 0.5);
          font-size: 10px;
          font-weight: 400;
          white-space: nowrap;
          padding-left: 6px;
          border-left: 1px solid rgba(255, 255, 255, 0.2);
        }

        .detected-value {
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
        }
      </style>

      <div class="locale-selector">
        <span class="locale-label">🌐</span>
        
        <div class="select-wrapper">
          <select class="locale-select" id="locale-select">
            ${this.locales.map(locale => `
              <option value="${locale.code}" ${locale.code === currentLocale ? 'selected' : ''}>
                ${locale.flag} ${locale.code}
              </option>
            `).join('')}
          </select>
          <svg class="select-arrow" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
          </svg>
        </div>

        <div class="loading-indicator" id="loading-indicator"></div>

        ${detectedLocale !== currentLocale ? `
          <button class="reset-button" id="reset-button" title="Reset to browser locale: ${detectedLocale}">
            Reset
          </button>
        ` : ''}

        <div class="detected-info">
          Browser: <span class="detected-value">${detectedLocale}</span>
        </div>
      </div>
    `;
    
    // Mark as initially rendered
    if (!this.hasInitiallyRendered) {
      this.hasInitiallyRendered = true;
    }
  }

  private setupEventListeners(): void {
    if (!this.shadowRoot || this.listenersAttached) return;

    // Handle locale selection changes
    this.shadowRoot.addEventListener('change', async (e) => {
      const target = e.target as HTMLElement;
      
      if (target && target.id === 'locale-select') {
        const selectElement = target as HTMLSelectElement;
        const newLocale = selectElement.value;
        
        if (this.isChanging) {
          this.logger.warn('Locale change already in progress');
          return;
        }

        this.logger.debug(`Locale select changed to: ${newLocale}`);
        await this.handleLocaleChange(newLocale);
      }
    });

    // Handle reset button clicks
    this.shadowRoot.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement;
      
      if (target && target.id === 'reset-button') {
        const detectedLocale = navigator.language || 'en-US';
        
        this.logger.debug('Resetting to browser locale:', detectedLocale);
        await this.handleLocaleChange(detectedLocale, true);
      }
    });

    // Listen for locale changes from other sources
    document.addEventListener('next:locale-changed', () => {
      this.logger.debug('External locale change detected, re-rendering selector');
      this.render();
    });
    
    this.listenersAttached = true;
    this.logger.debug('Event listeners attached to locale selector');
  }

  private async handleLocaleChange(newLocale: string, isReset: boolean = false): Promise<void> {
    this.isChanging = true;
    
    const select = this.shadowRoot?.getElementById('locale-select') as HTMLSelectElement;
    const loadingIndicator = this.shadowRoot?.getElementById('loading-indicator');
    
    if (select) select.disabled = true;
    if (loadingIndicator) loadingIndicator.classList.add('active');

    try {
      this.logger.info(`Changing locale to ${newLocale}`);
      
      const oldLocale = this.getCurrentLocale();
      
      if (isReset) {
        // Clear forced locale from session
        sessionStorage.removeItem('next_selected_locale');
        this.logger.info('Cleared selected locale override, using browser locale');
      } else {
        // Save forced locale to session
        sessionStorage.setItem('next_selected_locale', newLocale);
        this.logger.info(`Saved selected locale to session: ${newLocale}`);
      }
      
      // Clear currency formatter cache when locale changes
      const { CurrencyFormatter } = await import('@/utils/currencyFormatter');
      CurrencyFormatter.clearCache();
      
      // Import and refresh display enhancers
      const { useCartStore } = await import('@/stores/cartStore');
      
      // Trigger cart recalculation to update formatted values
      const cartStore = useCartStore.getState();
      await cartStore.calculateTotals();
      
      // Emit locale change event for other components to react
      document.dispatchEvent(new CustomEvent('next:locale-changed', {
        detail: { 
          from: oldLocale,
          to: newLocale,
          source: 'locale-selector'
        }
      }));
      
      // Trigger display updates
      document.dispatchEvent(new CustomEvent('debug:update-content'));
      
      // Force update all display enhancers
      document.dispatchEvent(new CustomEvent('next:display-refresh'));
      
      // Find and update all elements with currency displays
      this.refreshAllCurrencyDisplays();
      
      // Show success feedback
      this.showSuccessFeedback(newLocale);
      
      // Re-render to update UI
      this.render();
      
      // Log format examples for the new locale
      this.logFormatExamples(newLocale);
      
    } catch (error) {
      this.logger.error('Failed to change locale:', error);
      this.showErrorFeedback();
      
      // Revert selection
      const currentLocale = this.getCurrentLocale();
      if (select) select.value = currentLocale;
      
    } finally {
      this.isChanging = false;
      if (select) select.disabled = false;
      if (loadingIndicator) loadingIndicator.classList.remove('active');
    }
  }

  private refreshAllCurrencyDisplays(): void {
    // Find all elements with data-next-display attribute
    const displayElements = document.querySelectorAll('[data-next-display]');
    
    displayElements.forEach(element => {
      const displayType = element.getAttribute('data-next-display');
      
      // Check if it's a price/currency related display
      if (displayType?.includes('price') || 
          displayType?.includes('total') || 
          displayType?.includes('subtotal') ||
          displayType?.includes('cost') ||
          displayType?.includes('amount')) {
        
        // Trigger a custom event on the element to force refresh
        element.dispatchEvent(new CustomEvent('next:refresh-display', { bubbles: true }));
      }
    });
    
    // Also find all elements with Next commerce classes that might contain prices
    const priceElements = document.querySelectorAll(
      '.next-price, .next-total, .next-subtotal, .next-amount, ' +
      '[class*="price"], [class*="total"], [class*="amount"]'
    );
    
    priceElements.forEach(element => {
      // Check if element contains currency-like content
      const text = element.textContent || '';
      if (/[$£€¥₹₽¢]/u.test(text) || /\d+[.,]\d{2}/.test(text)) {
        // Trigger refresh
        element.dispatchEvent(new CustomEvent('next:refresh-display', { bubbles: true }));
      }
    });
    
    this.logger.debug(`Refreshed ${displayElements.length + priceElements.length} potential currency displays`);
  }

  private logFormatExamples(locale: string): void {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
      currencyDisplay: 'narrowSymbol'
    });
    
    const dateFormatter = new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const numberFormatter = new Intl.NumberFormat(locale);
    
    console.log(`%c[LocaleSelector] Format examples for ${locale}:`, 'color: #4299e1; font-weight: bold');
    console.log('Currency:', formatter.format(1234.56));
    console.log('Date:', dateFormatter.format(new Date()));
    console.log('Number:', numberFormatter.format(1234567.89));
  }

  private showSuccessFeedback(_locale: string): void {
    const selector = this.shadowRoot?.querySelector('.locale-selector') as HTMLElement;
    if (!selector) return;

    selector.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    
    setTimeout(() => {
      selector.style.background = 'linear-gradient(135deg, #222 0%, #1a1a1a 100%)';
    }, 1000);
  }

  private showErrorFeedback(): void {
    const selector = this.shadowRoot?.querySelector('.locale-selector') as HTMLElement;
    if (!selector) return;

    selector.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    
    setTimeout(() => {
      selector.style.background = 'linear-gradient(135deg, #222 0%, #1a1a1a 100%)';
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
export const localeSelector = LocaleSelector.getInstance();