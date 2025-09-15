/**
 * Selector Container
 * Manages the container for Currency and Country selectors
 */

import { currencySelector } from './CurrencySelector';
import { countrySelector } from './CountrySelector';
import { localeSelector } from './LocaleSelector';

export class SelectorContainer {
  private static instance: SelectorContainer;
  private container: HTMLDivElement | null = null;
  
  public static getInstance(): SelectorContainer {
    if (!SelectorContainer.instance) {
      SelectorContainer.instance = new SelectorContainer();
    }
    return SelectorContainer.instance;
  }
  
  private constructor() {
    // Listen for debug panel expansion changes
    this.setupPanelListener();
  }
  
  public initialize(): void {
    // Create the container
    this.createContainer();
    
    // Initialize all selectors
    currencySelector.initialize();
    countrySelector.initialize();
    localeSelector.initialize();
    
    // Move selectors into container
    this.moveSelectorsToContainer();
  }
  
  private createContainer(): void {
    if (this.container) {
      this.container.remove();
    }
    
    this.container = document.createElement('div');
    this.container.id = 'debug-selectors-container';
    this.container.style.cssText = `
      position: fixed;
      bottom: 70px;
      right: 20px;
      display: flex;
      gap: 10px;
      align-items: center;
      z-index: 999998;
      pointer-events: auto;
      transition: bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `;
    
    document.body.appendChild(this.container);
  }
  
  private moveSelectorsToContainer(): void {
    if (!this.container) return;
    
    // Wait a bit for selectors to initialize
    setTimeout(() => {
      const currencySel = document.getElementById('debug-currency-selector');
      const countrySel = document.getElementById('debug-country-selector');
      const localeSel = document.getElementById('debug-locale-selector');
      
      if (currencySel) {
        currencySel.style.position = 'relative';
        currencySel.style.bottom = 'auto';
        currencySel.style.left = 'auto';
        currencySel.style.transform = 'none';
        this.container!.appendChild(currencySel);
      }
      
      if (countrySel) {
        countrySel.style.position = 'relative';
        countrySel.style.bottom = 'auto';
        countrySel.style.left = 'auto';
        countrySel.style.transform = 'none';
        this.container!.appendChild(countrySel);
      }
      
      if (localeSel) {
        localeSel.style.position = 'relative';
        localeSel.style.bottom = 'auto';
        localeSel.style.left = 'auto';
        localeSel.style.transform = 'none';
        this.container!.appendChild(localeSel);
      }
    }, 100);
  }
  
  private setupPanelListener(): void {
    // Listen for debug panel state changes
    const checkForOverlay = () => {
      // Find the shadow host
      const shadowHost = document.getElementById('next-debug-overlay-host');
      if (shadowHost && shadowHost.shadowRoot) {
        const debugOverlay = shadowHost.shadowRoot.querySelector('.enhanced-debug-overlay');
        if (debugOverlay) {
          const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target as HTMLElement;
                if (target.classList.contains('enhanced-debug-overlay')) {
                  const isExpanded = target.classList.contains('expanded');
                  this.updatePosition(isExpanded);
                }
              }
            });
          });
          
          observer.observe(debugOverlay, { 
            attributes: true,
            attributeFilter: ['class']
          });
          
          // Check initial state
          const isExpanded = debugOverlay.classList.contains('expanded');
          this.updatePosition(isExpanded);
        }
      }
    };
    
    // Try to find the overlay after a delay
    setTimeout(checkForOverlay, 500);
    
    // Also listen for custom events
    document.addEventListener('debug:panel-toggled', ((e: CustomEvent) => {
      this.updatePosition(e.detail?.isExpanded || false);
    }) as EventListener);
  }
  
  private updatePosition(isExpanded: boolean): void {
    if (!this.container) return;
    
    if (isExpanded) {
      // Move up when panel is expanded (40vh min-height: 450px)
      this.container.style.bottom = 'calc(max(40vh, 450px) + 10px)';
    } else {
      // Default position above collapsed panel
      this.container.style.bottom = '70px';
    }
  }
  
  public destroy(): void {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }
}

// Export singleton instance
export const selectorContainer = SelectorContainer.getInstance();