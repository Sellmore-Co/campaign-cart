/**
 * Order Item List Enhancer
 * Displays individual order items with product details, quantities, and pricing
 * Supports template-based rendering with {item.xxx} placeholders
 */

import { BaseEnhancer } from '@/enhancers/base/BaseEnhancer';
import { useOrderStore } from '@/stores/orderStore';
import { useConfigStore } from '@/stores/configStore';
import { ApiClient } from '@/api/client';
import { TemplateRenderer, TemplateFormatters } from '@/shared/utils/TemplateRenderer';
import { DisplayFormatter } from '@/enhancers/display/DisplayEnhancerCore';
import type { OrderLine } from '@/types/api';
// Order type is imported but not used in this file
// import type { Order, OrderLine } from '@/types/api';

export class OrderItemListEnhancer extends BaseEnhancer {
  private template?: string;
  private emptyTemplate?: string;
  private apiClient?: ApiClient;

  public async initialize(): Promise<void> {
    this.validateElement();

    // Get template from template ID, selector, data attribute or use original content
    const templateId = this.getAttribute('data-item-template-id');
    const templateSelector = this.getAttribute('data-item-template-selector');
    
    if (templateId) {
      const templateElement = document.getElementById(templateId);
      this.template = templateElement?.innerHTML.trim() ?? '';
    } else if (templateSelector) {
      const templateElement = document.querySelector(templateSelector);
      this.template = templateElement?.innerHTML.trim() ?? '';
    } else {
      this.template = this.getAttribute('data-item-template') || this.element.innerHTML.trim();
    }
    
    // If template is empty or just comments, use default template
    if (!this.template || this.template.replace(/<!--[\s\S]*?-->/g, '').trim() === '') {
      this.template = this.getDefaultItemTemplate();
    }
    
    this.emptyTemplate = this.getAttribute('data-empty-template') || 
      '<div class="order-empty">No items found in order</div>';

    // Check for ref_id in URL and auto-load order
    await this.checkAndLoadOrderFromUrl();

    // Subscribe to order changes
    this.subscribe(useOrderStore, this.handleOrderUpdate.bind(this));

    // Initial render
    this.handleOrderUpdate(useOrderStore.getState());

    this.logger.debug('OrderItemListEnhancer initialized');
  }

  public update(data?: any): void {
    if (data) {
      this.handleOrderUpdate(data);
    }
  }

  private async checkAndLoadOrderFromUrl(): Promise<void> {
    const urlParams = new URLSearchParams(window.location.search);
    const refId = urlParams.get('ref_id');
    
    if (refId) {
      const orderStore = useOrderStore.getState();
      
      // Only load if not already loaded or loading
      if (!orderStore.order && !orderStore.isLoading && orderStore.refId !== refId) {
        try {
          const config = useConfigStore.getState();
          this.apiClient = new ApiClient(config.apiKey);
          
          await orderStore.loadOrder(refId, this.apiClient);
        } catch (error) {
          this.logger.error('Failed to auto-load order:', error);
        }
      }
    }
  }

  private async handleOrderUpdate(orderState: any): Promise<void> {
    try {
      const order = orderState.order;
      
      if (orderState.isLoading) {
        this.element.innerHTML = '<div class="status-message">Loading order items...</div>';
        this.addClass('order-loading');
        this.removeClass('order-has-items');
        this.removeClass('order-empty');
        return;
      }

      if (orderState.error) {
        this.element.innerHTML = '<div class="status-message">Error loading order items</div>';
        this.addClass('order-error');
        this.removeClass('order-has-items');
        this.removeClass('order-empty');
        this.removeClass('order-loading');
        return;
      }

      if (!order || !order.lines || order.lines.length === 0) {
        this.renderEmptyOrder();
      } else {
        await this.renderOrderItems(order.lines);
      }
    } catch (error) {
      this.handleError(error, 'handleOrderUpdate');
    }
  }

  private renderEmptyOrder(): void {
    this.element.innerHTML = this.emptyTemplate || '';
    this.addClass('order-empty');
    this.removeClass('order-has-items');
    this.removeClass('order-loading');
    this.removeClass('order-error');
  }

  private async renderOrderItems(lines: OrderLine[]): Promise<void> {
    this.removeClass('order-empty');
    this.removeClass('order-loading');
    this.removeClass('order-error');
    this.addClass('order-has-items');

    const itemsHTML: string[] = [];

    for (const line of lines) {
      const itemHTML = this.renderOrderItem(line);
      if (itemHTML) {
        itemsHTML.push(itemHTML);
      }
    }

    this.element.innerHTML = itemsHTML.join('');
  }

  private renderOrderItem(line: OrderLine): string {
    try {
      const itemData = this.prepareOrderLineData(line);
      const template = this.template || this.getDefaultItemTemplate();
      
      // Use TemplateRenderer with formatters (matching CartItemListEnhancer)
      const formatters: TemplateFormatters = {
        ...TemplateRenderer.createDefaultFormatters(),
        currency: (value: any) => DisplayFormatter.formatCurrency(value)
      };
      
      return TemplateRenderer.render(template, {
        data: { item: itemData },
        formatters
      });
    } catch (error) {
      this.logger.error('Error rendering order item:', error);
      return '';
    }
  }

  private getDefaultItemTemplate(): string {
    return `
      <div class="order-item" data-order-line-id="{item.id}">
        <div class="order-item-image {item.showImage}">
          <img src="{item.image}" alt="{item.name}" onerror="this.style.display='none';">
          <span class="item-fallback-icon" style="font-size: 1.5em;">📦</span>
        </div>
        <div class="order-item-details">
          <h4 class="order-item-name">
            {item.name}
            <span class="upsell-badge {item.showUpsell}" style="background: #e7f3ff; color: #0056b3; padding: 2px 6px; border-radius: 10px; font-size: 0.8em; margin-left: 8px;">{item.upsellBadge}</span>
          </h4>
          <div class="order-item-meta">
            <div class="item-sku">SKU: {item.sku}</div>
            <div class="item-variant {item.showVariant}">Variant: {item.variant}</div>
            <div class="item-description {item.showDescription}" style="color: #6c757d; font-size: 0.9em;">{item.description}</div>
          </div>
          <div class="order-item-pricing">
            <div class="unit-price">{item.price} each</div>
            <div class="tax-info {item.showTax}" style="color: #666; font-size: 0.9em;">Tax: {item.unitTax}</div>
          </div>
        </div>
        <div class="quantity-info">
          <span class="quantity-label">Qty:</span>
          <span class="quantity-value">{item.quantity}</span>
        </div>
        <div class="order-item-total">
          <div class="line-total">{item.lineTotal}</div>
          <div class="line-tax {item.showTax}" style="color: #666; font-size: 0.9em;">Tax: {item.lineTax}</div>
        </div>
      </div>
    `.trim();
  }

  // formatCurrency is not used in this class as currency formatting is handled differently
  // private formatCurrency(amount: number): string {
  //   return new Intl.NumberFormat('en-US', {
  //     style: 'currency',
  //     currency: 'USD'
  //   }).format(amount);
  // }

  private prepareOrderLineData(line: OrderLine): any {
    // API returns line totals, not unit prices
    const lineTotal = parseFloat(line.price_incl_tax || '0');
    const lineTotalExclTax = parseFloat(line.price_excl_tax || '0');
    const quantity = line.quantity || 1;
    
    // Get original prices before discounts
    const lineTotalExclDiscounts = parseFloat(line.price_incl_tax_excl_discounts || line.price_incl_tax || '0');
    const lineTotalExclTaxExclDiscounts = parseFloat(line.price_excl_tax_excl_discounts || line.price_excl_tax || '0');
    
    // Calculate unit prices from line totals
    const unitPrice = quantity > 0 ? lineTotal / quantity : lineTotal;
    const unitPriceExclTax = quantity > 0 ? lineTotalExclTax / quantity : lineTotalExclTax;
    
    // Calculate unit prices before discounts
    const unitPriceExclDiscounts = quantity > 0 ? lineTotalExclDiscounts / quantity : lineTotalExclDiscounts;
    const unitPriceExclTaxExclDiscounts = quantity > 0 ? lineTotalExclTaxExclDiscounts / quantity : lineTotalExclTaxExclDiscounts;
    
    // Tax calculations
    const unitTax = unitPrice - unitPriceExclTax;
    const lineTax = lineTotal - lineTotalExclTax;
    
    // Discount calculations
    const unitDiscount = unitPriceExclDiscounts - unitPrice;
    const lineDiscount = lineTotalExclDiscounts - lineTotal;
    const hasDiscount = unitDiscount > 0.01; // Check if discount is significant
    
    // Upsell badge
    const upsellBadge = line.is_upsell ? 'UPSELL' : '';
    
    return {
      // Basic item data
      id: String(line.id || ''),
      title: line.product_title || 'Unknown Product',
      name: line.product_title || 'Unknown Product',
      sku: line.product_sku || '',
      quantity: String(quantity),
      
      // Current pricing - will be formatted by TemplateRenderer
      price: unitPrice,
      priceExclTax: unitPriceExclTax,
      unitTax: unitTax,
      lineTotal: lineTotal,
      lineTotalExclTax: lineTotalExclTax,
      lineTax: lineTax,
      
      // Original pricing before discounts
      priceExclDiscounts: unitPriceExclDiscounts,
      priceExclTaxExclDiscounts: unitPriceExclTaxExclDiscounts,
      lineTotalExclDiscounts: lineTotalExclDiscounts,
      lineTotalExclTaxExclDiscounts: lineTotalExclTaxExclDiscounts,
      
      // Discount amounts
      unitDiscount: unitDiscount,
      lineDiscount: lineDiscount,
      
      // Product data
      image: line.image || '',
      description: line.product_description || '',
      variant: line.variant_title || '',
      
      // Flags and status
      isUpsell: line.is_upsell ? 'true' : 'false',
      upsellBadge: upsellBadge,
      hasImage: line.image ? 'true' : 'false',
      hasDescription: line.product_description ? 'true' : 'false',
      hasVariant: line.variant_title ? 'true' : 'false',
      hasTax: unitTax > 0 ? 'true' : 'false',
      hasDiscount: hasDiscount ? 'true' : 'false',
      
      // Conditional display helpers
      showUpsell: line.is_upsell ? 'show' : 'hide',
      showImage: line.image ? 'show' : 'hide',
      showDescription: line.product_description ? 'show' : 'hide',
      showVariant: line.variant_title ? 'show' : 'hide',
      showTax: unitTax > 0 ? 'show' : 'hide',
      showDiscount: hasDiscount ? 'show' : 'hide'
    };
  }

  public getItemCount(): number {
    return this.element.querySelectorAll('[data-order-line-id]').length;
  }

  public getItemElements(): NodeListOf<Element> {
    return this.element.querySelectorAll('[data-order-line-id]');
  }
}