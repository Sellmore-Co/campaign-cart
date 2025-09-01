/**
 * Enhanced Campaign Panel - Beautiful package and shipping method display
 */

import { useCampaignStore } from '../../stores/campaignStore';
import { useCartStore } from '../../stores/cartStore';
import { useConfigStore } from '../../stores/configStore';
import { DebugPanel, PanelAction, PanelTab } from './DebugPanels';
import { RawDataHelper } from './panels/RawDataHelper';

interface Package {
  ref_id: number;
  name: string;
  external_id: number;
  qty: number;
  price: string;
  price_total: string;
  price_retail: string;
  price_retail_total: string;
  is_recurring: boolean;
  price_recurring?: string;
  price_recurring_total?: string;
  interval?: string;
  interval_count?: number;
  image: string;
}

interface ShippingMethod {
  ref_id: number;
  code: string;
  price: string;
}

interface CampaignData {
  name: string;
  currency: string;
  language: string;
  payment_env_key: string;
  packages: Package[];
  shipping_methods: ShippingMethod[];
}

export class EnhancedCampaignPanel implements DebugPanel {
  id = 'campaign';
  title = 'Campaign Data';
  icon = '📊';

  getContent(): string {
    // Fallback to first tab's content if tabs are not being used
    const tabs = this.getTabs();
    return tabs[0]?.getContent() || '';
  }

  getTabs(): PanelTab[] {
    return [
      {
        id: 'overview',
        label: 'Overview',
        icon: '📊',
        getContent: () => this.getOverviewContent()
      },
      {
        id: 'packages',
        label: 'Packages',
        icon: '📦',
        getContent: () => this.getPackagesContent()
      },
      {
        id: 'shipping',
        label: 'Shipping',
        icon: '🚚',
        getContent: () => this.getShippingContent()
      },
      {
        id: 'raw',
        label: 'Raw Data',
        icon: '🔧',
        getContent: () => this.getRawDataContent()
      }
    ];
  }

  private getOverviewContent(): string {
    const campaignState = useCampaignStore.getState();
    const campaignData = campaignState.data as CampaignData;
    
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

  private getPackagesContent(): string {
    const campaignState = useCampaignStore.getState();
    const cartState = useCartStore.getState();
    const campaignData = campaignState.data as CampaignData;
    
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

  private getShippingContent(): string {
    const campaignState = useCampaignStore.getState();
    const campaignData = campaignState.data as CampaignData;
    
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

  private getRawDataContent(): string {
    const campaignState = useCampaignStore.getState();
    const campaignData = campaignState.data as CampaignData;
    
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

    return RawDataHelper.generateRawDataContent(campaignData);
  }

  private getCampaignOverview(data: CampaignData): string {
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
              <div class="metric-value">${data.packages.filter(p => p.is_recurring).length}</div>
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

  private getPackagesSection(packages: Package[], cartState: any): string {
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
          ${packages.map(pkg => this.getPackageCard(pkg, cartState)).join('')}
        </div>
      </div>
    `;
  }

  private getPackageCard(pkg: Package, cartState: any): string {
    const isInCart = cartState.items.some((item: any) => item.packageId === pkg.ref_id);
    const cartItem = cartState.items.find((item: any) => item.packageId === pkg.ref_id);
    const savings = parseFloat(pkg.price_retail_total) - parseFloat(pkg.price_total);
    const savingsPercent = Math.round((savings / parseFloat(pkg.price_retail_total)) * 100);

    return `
      <div class="package-card ${isInCart ? 'in-cart' : ''}" data-package-id="${pkg.ref_id}">
        <div class="package-image-container">
          <img src="${pkg.image}" alt="${pkg.name}" class="package-image" loading="lazy" />
          ${pkg.is_recurring ? '<div class="recurring-badge">🔄 Recurring</div>' : ''}
          ${isInCart ? `<div class="cart-badge">In Cart (${cartItem?.quantity || 0})</div>` : ''}
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
            ` : ''}
            
            ${pkg.is_recurring && pkg.price_recurring ? `
              <div class="recurring-pricing">
                <div class="price-row recurring">
                  <span class="price-label">Recurring:</span>
                  <span class="price-value recurring-price">
                    $${pkg.price_recurring_total}/${pkg.interval}
                  </span>
                </div>
              </div>
            ` : ''}
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

  private getShippingMethodsSection(shippingMethods: ShippingMethod[]): string {
    return `
      <div class="section">
        <h3 class="section-title">Shipping Methods</h3>
        
        <div class="shipping-methods">
          ${shippingMethods.map(method => `
            <div class="shipping-method-card">
              <div class="shipping-info">
                <div class="shipping-name">${method.code}</div>
                <div class="shipping-id">ID: ${method.ref_id}</div>
              </div>
              <div class="shipping-price">
                ${parseFloat(method.price) === 0 ? 'FREE' : `$${method.price}`}
              </div>
              <button class="shipping-test-btn" onclick="window.nextDebug.testShippingMethod(${method.ref_id})">
                Test
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }


  private getPriceRange(packages: Package[]): string {
    const prices = packages.map(p => parseFloat(p.price_total)).filter(p => p > 0);
    if (prices.length === 0) return 'Free';
    
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    
    if (min === max) return `$${min}`;
    return `$${min} - $${max}`;
  }

  getActions(): PanelAction[] {
    return [
      {
        label: 'Refresh Campaign',
        action: () => {
          const configStore = useConfigStore.getState();
          const campaignStore = useCampaignStore.getState();
          if (configStore.apiKey) {
            campaignStore.loadCampaign(configStore.apiKey);
          } else {
            console.error('No API key available to load campaign');
          }
        },
        variant: 'primary'
      },
      {
        label: 'Export Packages',
        action: () => this.exportPackages(),
        variant: 'secondary'
      },
      {
        label: 'Test All Packages',
        action: () => this.testAllPackages(),
        variant: 'secondary'
      },
      {
        label: 'Clear Cart',
        action: () => useCartStore.getState().clear(),
        variant: 'danger'
      }
    ];
  }

  private exportPackages(): void {
    const campaignState = useCampaignStore.getState();
    const data = campaignState.data as CampaignData;
    
    if (!data) return;
    
    const exportData = {
      campaign: data.name,
      packages: data.packages,
      shipping_methods: data.shipping_methods,
      export_date: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign-packages-${data.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private testAllPackages(): void {
    const campaignState = useCampaignStore.getState();
    const cartStore = useCartStore.getState();
    const data = campaignState.data as CampaignData;
    
    if (!data) return;
    
    // Add one of each package to cart for testing
    data.packages.slice(0, 3).forEach(pkg => {
      cartStore.addItem({
        packageId: pkg.ref_id,
        quantity: 1,
        title: pkg.name,
        isUpsell: false
      });
    });
  }
}
 