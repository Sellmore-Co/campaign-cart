/**
 * Order Panel Component
 * Displays order state, items, upsells, and provides order management controls
 */

import { useOrderStore } from '../../../stores/orderStore';
import { DebugPanel, PanelAction, PanelTab } from '../DebugPanels';
import { RawDataHelper } from './RawDataHelper';

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
    const currency = order.currency || 'USD';
    const currencySymbol = this.getCurrencySymbol(currency);
    
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
              <div class="metric-value">${currencySymbol}${orderTotal.toFixed(2)}</div>
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
              <span>${currencySymbol}${parseFloat(order.total_excl_tax || '0').toFixed(2)}</span>
            </div>
            <div class="total-item">
              <span>Shipping:</span>
              <span>${currencySymbol}${parseFloat(order.shipping_excl_tax || '0').toFixed(2)}</span>
            </div>
            <div class="total-item">
              <span>Tax:</span>
              <span>${currencySymbol}${parseFloat(order.total_tax || '0').toFixed(2)}</span>
            </div>
            <div class="total-item total-final">
              <span>Total (incl. tax):</span>
              <span>${currencySymbol}${parseFloat(order.total_incl_tax || '0').toFixed(2)}</span>
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

    const currency = order.currency || 'USD';
    const currencySymbol = this.getCurrencySymbol(currency);

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
              display: inline-block;
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
              ${order.lines.map((line: any, index: number) => `
                <tr ${line.is_upsell ? 'class="upsell-row"' : ''}>
                  <td>${index + 1}</td>
                  <td>
                    ${line.product_title || line.title || 'Unknown Product'}
                    ${line.is_upsell ? '<span class="upsell-badge">POST-PURCHASE</span>' : ''}
                  </td>
                  <td>${line.product_sku || 'N/A'}</td>
                  <td class="text-center">${line.quantity || 1}</td>
                  <td class="text-right">${currencySymbol}${parseFloat(line.price_excl_tax || '0').toFixed(2)}</td>
                  <td class="text-right">${currencySymbol}${(parseFloat(line.price_incl_tax || '0') - parseFloat(line.price_excl_tax || '0')).toFixed(2)}</td>
                  <td class="text-right"><strong>${currencySymbol}${parseFloat(line.price_incl_tax || '0').toFixed(2)}</strong></td>
                </tr>
              `).join('')}
              
              <tr style="border-top: 2px solid rgba(255, 255, 255, 0.1);">
                <td colspan="6" class="text-right"><strong>Order Total:</strong></td>
                <td class="text-right"><strong>${currencySymbol}${parseFloat(order.total_incl_tax || '0').toFixed(2)} ${currency}</strong></td>
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

    const formatAddressTable = (address: any, type: 'shipping' | 'billing') => {
      const icon = type === 'shipping' ? '📦' : '💳';
      const title = type === 'shipping' ? 'Shipping Address' : 'Billing Address';
      
      if (!address) {
        return `
          <div class="address-table-container">
            <div class="address-header">
              <span class="address-icon">${icon}</span>
              <h4>${title}</h4>
            </div>
            <div class="address-empty">No ${type} address provided</div>
          </div>
        `;
      }
      
      return `
        <div class="address-table-container">
          <div class="address-header">
            <span class="address-icon">${icon}</span>
            <h4>${title}</h4>
          </div>
          <table class="address-table">
            <tbody>
              ${address.first_name || address.last_name ? `
                <tr>
                  <td class="field-label">Name</td>
                  <td class="field-value">${address.first_name || ''} ${address.last_name || ''}</td>
                </tr>
              ` : ''}
              ${address.line1 ? `
                <tr>
                  <td class="field-label">Address 1</td>
                  <td class="field-value">${address.line1}</td>
                </tr>
              ` : ''}
              ${address.line2 ? `
                <tr>
                  <td class="field-label">Address 2</td>
                  <td class="field-value">${address.line2}</td>
                </tr>
              ` : ''}
              ${address.line4 || address.state || address.postcode ? `
                <tr>
                  <td class="field-label">City/State/Zip</td>
                  <td class="field-value">${address.line4 || ''}${address.state ? `, ${address.state}` : ''} ${address.postcode || ''}</td>
                </tr>
              ` : ''}
              ${address.country ? `
                <tr>
                  <td class="field-label">Country</td>
                  <td class="field-value">${address.country}</td>
                </tr>
              ` : ''}
              ${address.phone_number ? `
                <tr>
                  <td class="field-label">Phone</td>
                  <td class="field-value">${address.phone_number}</td>
                </tr>
              ` : ''}
            </tbody>
          </table>
        </div>
      `;
    };

    return `
      <div class="enhanced-panel">
        <style>
          .addresses-container {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
          }
          .address-table-container {
            flex: 1;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            overflow: hidden;
          }
          .address-header {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 16px;
            background: rgba(255, 255, 255, 0.05);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }
          .address-header h4 {
            margin: 0;
            font-size: 1em;
            font-weight: 600;
          }
          .address-icon {
            font-size: 1.2em;
          }
          .address-table {
            width: 100%;
            border-collapse: collapse;
          }
          .address-table td {
            padding: 10px 16px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          }
          .address-table tr:last-child td {
            border-bottom: none;
          }
          .field-label {
            width: 40%;
            color: rgba(255, 255, 255, 0.6);
            font-size: 0.9em;
          }
          .field-value {
            color: rgba(255, 255, 255, 0.9);
            font-size: 0.9em;
          }
          .address-empty {
            padding: 30px;
            text-align: center;
            color: rgba(255, 255, 255, 0.4);
            font-style: italic;
          }
          .customer-info-section {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            overflow: hidden;
          }
          .customer-header {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 16px;
            background: rgba(255, 255, 255, 0.05);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }
          .customer-header h4 {
            margin: 0;
            font-size: 1em;
            font-weight: 600;
          }
          .customer-table {
            width: 100%;
            border-collapse: collapse;
          }
          .customer-table td {
            padding: 10px 16px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          }
          .customer-table tr:last-child td {
            border-bottom: none;
          }
        </style>
        
        <div class="addresses-container">
          ${formatAddressTable(order.shipping_address, 'shipping')}
          ${formatAddressTable(order.billing_address, 'billing')}
        </div>
        
        <div class="customer-info-section">
          <div class="customer-header">
            <span class="address-icon">👤</span>
            <h4>Customer Information</h4>
          </div>
          <table class="customer-table">
            <tbody>
              <tr>
                <td class="field-label">Name</td>
                <td class="field-value">${order.user?.first_name || ''} ${order.user?.last_name || ''}</td>
              </tr>
              <tr>
                <td class="field-label">Email</td>
                <td class="field-value">${order.user?.email || 'N/A'}</td>
              </tr>
              <tr>
                <td class="field-label">Phone</td>
                <td class="field-value">${order.user?.phone_number || 'N/A'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // Removed getUpsellsContent method as it's no longer needed

  private getRawDataContent(): string {
    const orderState = useOrderStore.getState();
    return RawDataHelper.generateRawDataContent({
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
    });
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

  private getCurrencySymbol(currency: string): string {
    const symbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'AUD': '$',
      'CAD': '$',
      'JPY': '¥',
      'CNY': '¥',
      'INR': '₹',
      'KRW': '₩',
      'BRL': 'R$',
      'MXN': '$',
      'CHF': 'Fr',
      'SEK': 'kr',
      'NOK': 'kr',
      'DKK': 'kr',
      'PLN': 'zł',
      'RUB': '₽',
      'ZAR': 'R',
      'NZD': '$',
      'SGD': '$',
      'HKD': '$',
      'THB': '฿',
      'PHP': '₱',
      'IDR': 'Rp',
      'MYR': 'RM',
      'VND': '₫',
      'TRY': '₺',
      'AED': 'د.إ',
      'SAR': '﷼',
      'ILS': '₪',
      'EGP': '£',
      'COP': '$',
      'CLP': '$',
      'ARS': '$',
      'PEN': 'S/'
    };
    return symbols[currency] || currency + ' ';
  }
}