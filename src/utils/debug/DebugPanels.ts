/**
 * Debug Panels
 * Individual panel content generators for debug overlay
 */

import { useCartStore } from '../../stores/cartStore';
import { useConfigStore } from '../../stores/configStore';
import { useCampaignStore } from '../../stores/campaignStore';
import { DebugEvent } from './DebugEventManager';

export interface DebugPanel {
  id: string;
  title: string;
  icon: string;
  getContent: () => string;
  getActions?: () => PanelAction[];
  getTabs?: () => PanelTab[];
}

export interface PanelTab {
  id: string;
  label: string;
  icon?: string;
  getContent: () => string;
}

export interface PanelAction {
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export class CartPanel implements DebugPanel {
  id = 'cart';
  title = 'Cart State';
  icon = '🛒';

  getContent(): string {
    const cartState = useCartStore.getState();
    
    const metrics = [
      ['Items Count', cartState.items.length.toString()],
      ['Total Quantity', cartState.totalQuantity.toString()],
      ['Subtotal', cartState.totals.subtotal.formatted],
      ['Shipping', cartState.totals.shipping.formatted],
      ['Tax', cartState.totals.tax.formatted],
      ['Total', cartState.totals.total.formatted],
      ['Is Empty', cartState.isEmpty.toString()]
    ];

    return `
      <div class="debug-metrics">
        ${metrics.map(([label, value]) => `
          <div class="debug-metric">
            <span class="metric-label">${label}</span>
            <span class="metric-value">${value}</span>
          </div>
        `).join('')}
      </div>
      
      <h4 style="color: #fff; margin: 20px 0 10px 0;">Cart Items</h4>
      <div class="debug-json">${JSON.stringify(cartState.items, null, 2)}</div>
    `;
  }

  getActions(): PanelAction[] {
    return [
      {
        label: 'Clear Cart',
        action: () => useCartStore.getState().clear(),
        variant: 'danger'
      },
      {
        label: 'Add Test Item',
        action: this.addTestItem,
        variant: 'secondary'
      },
      {
        label: 'Recalculate',
        action: () => useCartStore.getState().calculateTotals(),
        variant: 'primary'
      }
    ];
  }

  private addTestItem(): void {
    const cartStore = useCartStore.getState();
    cartStore.addItem({
      packageId: 999,
      quantity: 1,
      price: 19.99,
      title: 'Debug Test Item',
      isUpsell: false
    });
  }
}

export class ConfigPanel implements DebugPanel {
  id = 'config';
  title = 'Configuration';
  icon = '⚙️';

  getContent(): string {
    const configState = useConfigStore.getState();
    
    const metrics = [
      ['API Key', configState.apiKey ? '✓ Set' : '✗ Missing'],
      ['Campaign ID', configState.campaignId || 'Not set'],
      ['Debug Mode', configState.debug.toString()],
      ['Page Type', configState.pageType]
    ];

    return `
      <div class="debug-metrics">
        ${metrics.map(([label, value]) => `
          <div class="debug-metric">
            <span class="metric-label">${label}</span>
            <span class="metric-value">${value}</span>
          </div>
        `).join('')}
      </div>
      
      <h4 style="color: #fff; margin: 20px 0 10px 0;">Full Configuration</h4>
      <div class="debug-json">${JSON.stringify(configState, null, 2)}</div>
    `;
  }

  getActions(): PanelAction[] {
    return [
      {
        label: 'Reload Config',
        action: this.reloadConfig,
        variant: 'primary'
      },
      {
        label: 'Test API',
        action: this.testApiConnection,
        variant: 'secondary'
      }
    ];
  }

  private reloadConfig(): void {
    const configStore = useConfigStore.getState();
    configStore.loadFromMeta();
    configStore.loadFromWindow();
  }

  private async testApiConnection(): Promise<void> {
    try {
      const response = await fetch('https://campaigns.apps.29next.com/health');
      console.log(response.ok ? 'API connection successful' : 'API connection failed');
    } catch (error) {
      console.error('API connection error:', error);
    }
  }
}

export class CampaignPanel implements DebugPanel {
  id = 'campaign';
  title = 'Campaign Data';
  icon = '📊';

  getContent(): string {
    const campaignState = useCampaignStore.getState();
    return `<div class="debug-json">${JSON.stringify(campaignState, null, 2)}</div>`;
  }

  getActions(): PanelAction[] {
    return [
      {
        label: 'Refresh Campaign',
        action: () => {
          const { useConfigStore } = require('../../stores/configStore');
          const apiKey = useConfigStore.getState().apiKey;
          if (apiKey) {
            useCampaignStore.getState().loadCampaign(apiKey);
          }
        },
        variant: 'primary'
      }
    ];
  }
}

// CheckoutPanel moved to panels/CheckoutPanel.ts for enhanced functionality
// This simple version is kept for backward compatibility but shouldn't be used

export class EventsPanel implements DebugPanel {
  id = 'events';
  title = 'Event Log';
  icon = '📋';
  
  constructor(private events: DebugEvent[]) {}

  getContent(): string {
    const recentEvents = this.events.slice(0, 20);
    
    if (recentEvents.length === 0) {
      return '<p style="color: #666; text-align: center; padding: 20px;">No events logged yet</p>';
    }

    return `
      <div class="event-list">
        ${recentEvents.map(event => `
          <div class="event-item">
            <div class="event-header">
              <span class="event-type">${event.type}</span>
              <span class="event-time">${event.timestamp.toLocaleTimeString()}</span>
            </div>
            <div class="event-source">${event.source}</div>
            <div class="event-data">${JSON.stringify(event.data, null, 2)}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  getActions(): PanelAction[] {
    return [
      {
        label: 'Clear Log',
        action: () => {
          this.events.length = 0;
          // Trigger update
          document.dispatchEvent(new CustomEvent('debug:update-content'));
        },
        variant: 'danger'
      },
      {
        label: 'Export Log',
        action: this.exportEvents.bind(this),
        variant: 'secondary'
      }
    ];
  }

  private exportEvents(): void {
    const data = JSON.stringify(this.events, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-events-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export class StoragePanel implements DebugPanel {
  id = 'storage';
  title = 'Storage';
  icon = '💾';

  getContent(): string {
    const sessionData = Object.keys(sessionStorage).reduce((acc, key) => {
      acc[key] = sessionStorage.getItem(key);
      return acc;
    }, {} as Record<string, string | null>);

    const localData = Object.keys(localStorage).reduce((acc, key) => {
      acc[key] = localStorage.getItem(key);
      return acc;
    }, {} as Record<string, string | null>);

    return `
      <h4 style="color: #fff; margin: 0 0 10px 0;">Session Storage</h4>
      <div class="debug-json">${JSON.stringify(sessionData, null, 2)}</div>
      
      <h4 style="color: #fff; margin: 20px 0 10px 0;">Local Storage</h4>
      <div class="debug-json">${JSON.stringify(localData, null, 2)}</div>
    `;
  }

  getActions(): PanelAction[] {
    return [
      {
        label: 'Clear All',
        action: this.clearAllStorage,
        variant: 'danger'
      },
      {
        label: 'Export Data',
        action: this.exportStorageData,
        variant: 'secondary'
      }
    ];
  }

  private clearAllStorage(): void {
    if (confirm('Clear all storage data? This cannot be undone.')) {
      sessionStorage.clear();
      localStorage.clear();
      document.dispatchEvent(new CustomEvent('debug:update-content'));
    }
  }

  private exportStorageData(): void {
    const data = {
      sessionStorage: Object.fromEntries(
        Object.keys(sessionStorage).map(key => [key, sessionStorage.getItem(key)])
      ),
      localStorage: Object.fromEntries(
        Object.keys(localStorage).map(key => [key, localStorage.getItem(key)])
      )
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `storage-data-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}