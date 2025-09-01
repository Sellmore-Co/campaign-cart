/**
 * Cart Panel Component
 * Displays cart state, items, and provides cart manipulation controls
 */

import { useCartStore } from '../../../stores/cartStore';
import { DebugPanel, PanelAction, PanelTab } from '../DebugPanels';
import { RawDataHelper } from './RawDataHelper';

export class CartPanel implements DebugPanel {
  id = 'cart';
  title = 'Cart State';
  icon = '🛒';

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
        id: 'items',
        label: 'Items',
        icon: '📦',
        getContent: () => this.getItemsContent()
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

  private getItemsContent(): string {
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
              ${cartState.items.map(item => `
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
              `).join('')}
            </div>
          `}
        </div>
      </div>
    `;
  }

  private getRawDataContent(): string {
    const cartState = useCartStore.getState();
    return RawDataHelper.generateRawDataContent(cartState);
  }

  getActions(): PanelAction[] {
    return [
      {
        label: 'Clear Cart',
        action: () => useCartStore.getState().clear(),
        variant: 'danger'
      },
      {
        label: 'Add Test Items',
        action: this.addTestItems,
        variant: 'secondary'
      },
      {
        label: 'Recalculate',
        action: () => useCartStore.getState().calculateTotals(),
        variant: 'primary'
      },
      {
        label: 'Export Cart',
        action: this.exportCart,
        variant: 'secondary'
      }
    ];
  }

  private addTestItems(): void {
    const cartStore = useCartStore.getState();
    const testItems = [
      { packageId: 999, quantity: 1, price: 19.99, title: 'Debug Test Item 1', isUpsell: false },
      { packageId: 998, quantity: 2, price: 29.99, title: 'Debug Test Item 2', isUpsell: false },
      { packageId: 997, quantity: 1, price: 9.99, title: 'Debug Test Item 3', isUpsell: false }
    ];
    
    testItems.forEach(item => cartStore.addItem(item));
  }

  private exportCart(): void {
    const cartState = useCartStore.getState();
    const data = JSON.stringify(cartState, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cart-state-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}