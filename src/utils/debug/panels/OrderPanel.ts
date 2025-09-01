/**
 * Order Panel Component
 * Displays order state, items, upsells, and provides order management controls
 */

import { useOrderStore } from '../../../stores/orderStore';
import { DebugPanel, PanelAction, PanelTab } from '../DebugPanels';

export class OrderPanel implements DebugPanel {
  id = 'order';
  title = 'Order State';
  icon = '📦';

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
        id: 'lines',
        label: 'Order Lines',
        icon: '📋',
        getContent: () => this.getOrderLinesContent()
      },
      {
        id: 'addresses',
        label: 'Addresses',
        icon: '📍',
        getContent: () => this.getAddressesContent()
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
    const orderState = useOrderStore.getState();
    const order = orderState.order;
    
    if (!order) {
      return this.getEmptyState();
    }

    const orderTotal = orderState.getOrderTotal();
    const canAddUpsells = orderState.canAddUpsells();
    
    return `
      <div class="enhanced-panel">
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon">🔖</div>
            <div class="metric-content">
              <div class="metric-value">${order.number || 'N/A'}</div>
              <div class="metric-label">Order Number</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🆔</div>
            <div class="metric-content">
              <div class="metric-value" style="font-size: 0.9em; word-break: break-all;">${orderState.refId || 'N/A'}</div>
              <div class="metric-label">Reference ID</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">📦</div>
            <div class="metric-content">
              <div class="metric-value">${order.lines?.length || 0}</div>
              <div class="metric-label">Total Lines</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🎯</div>
            <div class="metric-content">
              <div class="metric-value">${order.lines?.filter((l: any) => l.is_upsell).length || 0}</div>
              <div class="metric-label">Upsells</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">💰</div>
            <div class="metric-content">
              <div class="metric-value">$${orderTotal.toFixed(2)}</div>
              <div class="metric-label">Order Total</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">${canAddUpsells ? '✅' : '❌'}</div>
            <div class="metric-content">
              <div class="metric-value">${canAddUpsells ? 'Yes' : 'No'}</div>
              <div class="metric-label">Can Add Upsells</div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h4>Order Details</h4>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Status:</span>
              <span class="info-value">Active</span>
            </div>
            <div class="info-item">
              <span class="info-label">Currency:</span>
              <span class="info-value">${order.currency || 'USD'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Loaded At:</span>
              <span class="info-value">${orderState.orderLoadedAt ? new Date(orderState.orderLoadedAt).toLocaleString() : 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Shipping Method:</span>
              <span class="info-value">${order.shipping_method || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Order URL:</span>
              <span class="info-value" style="font-size: 0.8em; word-break: break-all;">${order.order_status_url ? 'Available' : 'N/A'}</span>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h4>Totals Breakdown</h4>
          <div class="totals-breakdown">
            <div class="total-item">
              <span>Subtotal (excl. tax):</span>
              <span>$${parseFloat(order.total_excl_tax || '0').toFixed(2)}</span>
            </div>
            <div class="total-item">
              <span>Shipping:</span>
              <span>$${parseFloat(order.shipping_excl_tax || '0').toFixed(2)}</span>
            </div>
            <div class="total-item">
              <span>Tax:</span>
              <span>$${parseFloat(order.total_tax || '0').toFixed(2)}</span>
            </div>
            <div class="total-item total-final">
              <span>Total (incl. tax):</span>
              <span>$${parseFloat(order.total_incl_tax || '0').toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private getOrderLinesContent(): string {
    const orderState = useOrderStore.getState();
    const order = orderState.order;
    
    if (!order || !order.lines || order.lines.length === 0) {
      return this.getEmptyState('No order lines available');
    }

    // Separate main items and upsells
    const mainItems = order.lines.filter((line: any) => !line.is_upsell);
    const upsellItems = order.lines.filter((line: any) => line.is_upsell);

    return `
      <div class="enhanced-panel">
        <div class="section">
          <style>
            .order-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 0.9em;
            }
            .order-table th {
              background: rgba(255, 255, 255, 0.05);
              padding: 8px;
              text-align: left;
              border-bottom: 2px solid rgba(255, 255, 255, 0.1);
              font-weight: 600;
            }
            .order-table td {
              padding: 8px;
              border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }
            .order-table tr:hover {
              background: rgba(255, 255, 255, 0.02);
            }
            .order-table .upsell-row {
              background: rgba(255, 215, 0, 0.05);
            }
            .order-table .upsell-badge {
              background: #ffd700;
              color: #000;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 0.75em;
              font-weight: bold;
              margin-left: 8px;
            }
            .order-table .section-header {
              background: rgba(255, 255, 255, 0.08);
              font-weight: bold;
              text-transform: uppercase;
              font-size: 0.85em;
            }
            .order-table .text-right {
              text-align: right;
            }
            .order-table .text-center {
              text-align: center;
            }
          </style>
          
          <table class="order-table">
            <thead>
              <tr>
                <th style="width: 5%">#</th>
                <th style="width: 35%">Product</th>
                <th style="width: 15%">SKU</th>
                <th style="width: 10%" class="text-center">Qty</th>
                <th style="width: 12%" class="text-right">Price</th>
                <th style="width: 11%" class="text-right">Tax</th>
                <th style="width: 12%" class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${mainItems.length > 0 ? `
                <tr class="section-header">
                  <td colspan="7">Main Order Items</td>
                </tr>
                ${mainItems.map((line: any, index: number) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${line.product_title || line.title || 'Unknown Product'}</td>
                    <td>${line.product_sku || 'N/A'}</td>
                    <td class="text-center">${line.quantity || 1}</td>
                    <td class="text-right">$${parseFloat(line.price_excl_tax || '0').toFixed(2)}</td>
                    <td class="text-right">$${(parseFloat(line.price_incl_tax || '0') - parseFloat(line.price_excl_tax || '0')).toFixed(2)}</td>
                    <td class="text-right"><strong>$${parseFloat(line.price_incl_tax || '0').toFixed(2)}</strong></td>
                  </tr>
                `).join('')}
              ` : ''}
              
              ${upsellItems.length > 0 ? `
                <tr class="section-header">
                  <td colspan="7">Upsell Items</td>
                </tr>
                ${upsellItems.map((line: any, index: number) => `
                  <tr class="upsell-row">
                    <td>${mainItems.length + index + 1}</td>
                    <td>
                      ${line.product_title || line.title || 'Unknown Product'}
                      <span class="upsell-badge">UPSELL</span>
                    </td>
                    <td>${line.product_sku || 'N/A'}</td>
                    <td class="text-center">${line.quantity || 1}</td>
                    <td class="text-right">$${parseFloat(line.price_excl_tax || '0').toFixed(2)}</td>
                    <td class="text-right">$${(parseFloat(line.price_incl_tax || '0') - parseFloat(line.price_excl_tax || '0')).toFixed(2)}</td>
                    <td class="text-right"><strong>$${parseFloat(line.price_incl_tax || '0').toFixed(2)}</strong></td>
                  </tr>
                `).join('')}
              ` : ''}
              
              <tr style="border-top: 2px solid rgba(255, 255, 255, 0.1);">
                <td colspan="6" class="text-right"><strong>Order Total:</strong></td>
                <td class="text-right"><strong>$${parseFloat(order.total_incl_tax || '0').toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  private getAddressesContent(): string {
    const orderState = useOrderStore.getState();
    const order = orderState.order;
    
    if (!order) {
      return this.getEmptyState();
    }

    const formatAddress = (address: any) => {
      if (!address) return 'No address provided';
      
      return `
        <div class="address-card">
          <div class="address-name">${address.first_name || ''} ${address.last_name || ''}</div>
          ${address.line1 ? `<div>${address.line1}</div>` : ''}
          ${address.line2 ? `<div>${address.line2}</div>` : ''}
          ${address.line4 ? `<div>${address.line4}${address.state ? `, ${address.state}` : ''} ${address.postcode || ''}</div>` : ''}
          ${address.country ? `<div>${address.country}</div>` : ''}
          ${address.phone_number ? `<div>📞 ${address.phone_number}</div>` : ''}
        </div>
      `;
    };

    return `
      <div class="enhanced-panel">
        <div class="section">
          <h4>Billing Address</h4>
          ${formatAddress(order.billing_address)}
        </div>
        
        <div class="section">
          <h4>Shipping Address</h4>
          ${formatAddress(order.shipping_address)}
        </div>
        
        <div class="section">
          <h4>Customer Information</h4>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Name:</span>
              <span class="info-value">${order.user?.first_name || ''} ${order.user?.last_name || ''}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Email:</span>
              <span class="info-value">${order.user?.email || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Phone:</span>
              <span class="info-value">${order.user?.phone_number || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Removed getUpsellsContent method as it's no longer needed

  private getRawDataContent(): string {
    const orderState = useOrderStore.getState();
    
    return `
      <div class="enhanced-panel">
        <div class="section">
          <div class="json-viewer">
            <pre><code>${JSON.stringify({
              order: orderState.order,
              refId: orderState.refId,
              orderLoadedAt: orderState.orderLoadedAt,
              isLoading: orderState.isLoading,
              isProcessingUpsell: orderState.isProcessingUpsell,
              error: orderState.error,
              upsellError: orderState.upsellError,
              pendingUpsells: orderState.pendingUpsells,
              completedUpsellPages: orderState.completedUpsellPages,
              viewedUpsellPages: orderState.viewedUpsellPages,
              upsellJourney: orderState.upsellJourney
            }, null, 2)}</code></pre>
          </div>
        </div>
      </div>
    `;
  }

  private getEmptyState(message: string = 'No order loaded'): string {
    return `
      <div class="enhanced-panel">
        <div class="empty-state">
          <div class="empty-icon">📦</div>
          <div class="empty-text">${message}</div>
          <div class="empty-hint">Load an order to see details here</div>
        </div>
      </div>
    `;
  }

  getActions(): PanelAction[] {
    const orderState = useOrderStore.getState();
    const actions: PanelAction[] = [];

    if (orderState.order) {
      actions.push({
        label: 'Clear Order',
        action: () => orderState.clearOrder(),
        variant: 'danger'
      });
      
      actions.push({
        label: 'Reload Order',
        action: async () => {
          if (orderState.refId) {
            // Force reload by clearing first
            orderState.clearOrder();
            // Note: This would need the API client instance
            console.log('Reload order functionality requires API client');
          }
        },
        variant: 'primary'
      });

      if (orderState.pendingUpsells.length > 0) {
        actions.push({
          label: 'Clear Pending',
          action: () => orderState.clearPendingUpsells(),
          variant: 'secondary'
        });
      }

      actions.push({
        label: 'Export Order',
        action: this.exportOrder,
        variant: 'secondary'
      });
    }

    actions.push({
      label: 'Reset Store',
      action: () => orderState.reset(),
      variant: 'danger'
    });

    return actions;
  }

  private exportOrder(): void {
    const orderState = useOrderStore.getState();
    const data = JSON.stringify({
      order: orderState.order,
      refId: orderState.refId,
      upsellJourney: orderState.upsellJourney,
      completedUpsellPages: orderState.completedUpsellPages,
      exportedAt: new Date().toISOString()
    }, null, 2);
    
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order-state-${orderState.refId || 'unknown'}-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}