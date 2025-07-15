/**
 * Cart Item List Enhancer
 * Displays individual cart items with product details, quantity, and actions
 */

import { BaseEnhancer } from '@/enhancers/base/BaseEnhancer';
import { useCartStore } from '@/stores/cartStore';
import { useCampaignStore } from '@/stores/campaignStore';
import { TemplateRenderer, TemplateFormatters } from '@/shared/utils/TemplateRenderer';
import { PriceCalculator } from '@/utils/calculations/PriceCalculator';
import { DisplayFormatter } from '@/enhancers/display/DisplayEnhancerCore';
import type { CartState, CartItem } from '@/types/global';

export class CartItemListEnhancer extends BaseEnhancer {
  private template?: string;
  private emptyTemplate?: string;
  private titleMap?: Record<string, string>;

  public async initialize(): Promise<void> {
    this.validateElement();

    // Get template from data attribute or use original content
    this.template = this.getAttribute('data-item-template') || this.element.innerHTML.trim();
    
    // If template is empty or just comments, use default template
    if (!this.template || this.template.replace(/<!--[\s\S]*?-->/g, '').trim() === '') {
      this.template = this.getDefaultItemTemplate();
    }
    
    this.emptyTemplate = this.getAttribute('data-empty-template') || 
      '<div class="cart-empty">Your cart is empty</div>';

    // Load title mapping from data attribute
    const titleMapAttr = this.getAttribute('data-title-map');
    if (titleMapAttr) {
      try {
        this.titleMap = JSON.parse(titleMapAttr);
      } catch (error) {
        this.logger.warn('Invalid title map JSON:', error);
      }
    }

    // Subscribe to cart changes
    this.subscribe(useCartStore, this.handleCartUpdate.bind(this));

    // Initial render
    this.handleCartUpdate(useCartStore.getState());

    this.logger.debug('CartItemListEnhancer initialized');
  }

  public update(data?: any): void {
    if (data) {
      this.handleCartUpdate(data);
    }
  }

  private async handleCartUpdate(cartState: CartState): Promise<void> {
    try {
      if (cartState.isEmpty || cartState.items.length === 0) {
        this.renderEmptyCart();
      } else {
        await this.renderCartItems(cartState.items);
      }
    } catch (error) {
      this.handleError(error, 'handleCartUpdate');
    }
  }

  private renderEmptyCart(): void {
    this.element.innerHTML = this.emptyTemplate || '';
    this.addClass('cart-empty');
    this.removeClass('cart-has-items');
  }

  private async renderCartItems(items: CartItem[]): Promise<void> {
    this.removeClass('cart-empty');
    this.addClass('cart-has-items');

    const campaignStore = useCampaignStore.getState();
    const itemsHTML: string[] = [];

    for (const item of items) {
      const itemHTML = await this.renderCartItem(item, campaignStore);
      if (itemHTML) {
        itemsHTML.push(itemHTML);
      }
    }

    this.element.innerHTML = itemsHTML.join('');

    // Re-enhance any new elements
    await this.enhanceNewElements();
  }

  private async renderCartItem(item: CartItem, campaignStore: any): Promise<string> {
    try {
      // Get package data for additional details
      const packageData = campaignStore.getPackage(item.packageId);
      
      if (!packageData) {
        this.logger.warn(`Package data not found for item ${item.packageId}`);
        return '';
      }

      // Prepare all cart item data
      const itemData = this.prepareCartItemData(item, packageData);

      // Default template if none provided
      const template = this.template || this.getDefaultItemTemplate();

      // Use TemplateRenderer with formatters
      const formatters: TemplateFormatters = {
        ...TemplateRenderer.createDefaultFormatters(),
        currency: (value: any) => DisplayFormatter.formatCurrency(value)
      };

      return TemplateRenderer.render(template, {
        data: { item: itemData },
        formatters
      });

    } catch (error) {
      this.logger.error('Error rendering cart item:', error);
      return '';
    }
  }

  private getDefaultItemTemplate(): string {
    return `
      <div class="cart-item" data-cart-item-id="{item.id}" data-package-id="{item.packageId}">
        <div class="cart-item-image">
          <img src="{item.image}" alt="{item.name}" onerror="this.style.display='none';">
          <span style="font-size: 1.5em;">📦</span>
        </div>
        <div class="cart-item-details">
          <h4 class="cart-item-name">{item.name}</h4>
          <div class="cart-item-pricing">
            <div class="current-price">{item.price} each</div>
            <div class="compare-price {item.showCompare}" style="text-decoration: line-through; color: #999;">{item.comparePrice}</div>
            <div class="savings {item.showSavings}" style="color: #0d7519; font-weight: bold;">Save {item.savingsAmount} ({item.savingsPct})</div>
            <div class="frequency">{item.frequency}</div>
            <div class="recurring-price {item.showRecurring}" style="color: #666;">Then {item.recurringPrice} recurring</div>
          </div>
        </div>
        <div class="quantity-controls">
          <button class="quantity-btn" data-next-quantity="decrease" data-package-id="{item.packageId}">-</button>
          <span class="quantity-display">{item.quantity}</span>
          <button class="quantity-btn" data-next-quantity="increase" data-package-id="{item.packageId}">+</button>
        </div>
        <div class="cart-item-total">
          <div class="line-total">{item.lineTotal}</div>
          <div class="line-compare {item.showCompare}" style="text-decoration: line-through; color: #999; font-size: 0.9em;">{item.lineCompare}</div>
        </div>
        <button class="remove-btn" data-next-remove-item data-package-id="{item.packageId}" data-confirm="true" data-confirm-message="Remove this item from your cart?">Remove</button>
      </div>
    `.trim();
  }

  private async enhanceNewElements(): Promise<void> {
    // Find and enhance any new quantity controls and remove buttons
    const quantityButtons = this.element.querySelectorAll('[data-next-quantity]');
    const removeButtons = this.element.querySelectorAll('[data-next-remove-item]');

    // Import and manually enhance the new elements
    if (quantityButtons.length > 0) {
      const { QuantityControlEnhancer } = await import('@/enhancers/cart/QuantityControlEnhancer');
      for (const button of Array.from(quantityButtons)) {
        if (button instanceof HTMLElement) {
          try {
            const enhancer = new QuantityControlEnhancer(button);
            await enhancer.initialize();
            this.logger.debug('Enhanced quantity control button', button);
          } catch (error) {
            this.logger.error('Failed to enhance quantity button:', error, button);
          }
        }
      }
    }

    if (removeButtons.length > 0) {
      const { RemoveItemEnhancer } = await import('@/enhancers/cart/RemoveItemEnhancer');
      for (const button of Array.from(removeButtons)) {
        if (button instanceof HTMLElement) {
          try {
            const enhancer = new RemoveItemEnhancer(button);
            await enhancer.initialize();
            this.logger.debug('Enhanced remove button', button);
          } catch (error) {
            this.logger.error('Failed to enhance remove button:', error, button);
          }
        }
      }
    }

    this.logger.debug(`Enhanced ${quantityButtons.length} quantity buttons and ${removeButtons.length} remove buttons`);
  }

  private prepareCartItemData(item: CartItem, packageData: any): any {
    // Enhanced pricing calculations with ALL campaign data
    // Note: item.price contains the total package price, not per-unit price
    const packageCurrentPrice = item.price;
    const lineTotal = packageCurrentPrice * item.quantity;
    
    // Package-level pricing (from campaign API)
    const packagePrice = parseFloat(packageData.price || '0');
    const packagePriceTotal = parseFloat(packageData.price_total || '0');
    const packageRetailPrice = parseFloat(packageData.price_retail || packageData.price || '0');
    const packageRetailTotal = parseFloat(packageData.price_retail_total || '0');
    const packageQty = packageData.qty || 1;
    
    // Use PriceCalculator for all price metrics
    const metrics = PriceCalculator.calculatePackageMetrics({
      price: packagePrice,
      retailPrice: packageRetailPrice,
      quantity: packageQty,
      priceTotal: packagePriceTotal,
      retailPriceTotal: packageRetailTotal
    });
    
    // Line calculations (package price * cart quantity)
    const retailLineTotal = metrics.totalRetailPrice * item.quantity;
    const lineSavings = metrics.totalSavings * item.quantity;
    
    // Recurring pricing
    const recurringPrice = parseFloat(packageData.price_recurring || '0');
    const recurringTotal = parseFloat(packageData.price_recurring_total || '0');
    const hasRecurring = packageData.is_recurring && recurringPrice > 0;
    
    // Frequency text
    const frequencyText = hasRecurring ? 
      (packageData.interval_count && packageData.interval_count > 1 ? 
        `Every ${packageData.interval_count} ${packageData.interval}s` : 
        `Per ${packageData.interval}`) : 'One time';

    // Check for custom title mapping (instance level takes priority, then global config)
    const globalTitleMap = (window as any).nextConfig?.productTitleMap || {};
    const titleMap = this.titleMap || globalTitleMap;
    let customTitle = titleMap[item.packageId] || titleMap[String(item.packageId)];
    
    // Apply transform function if available
    const titleTransform = (window as any).nextConfig?.productTitleTransform;
    if (!customTitle && typeof titleTransform === 'function') {
      try {
        customTitle = titleTransform(item.packageId, packageData.name);
      } catch (error) {
        this.logger.warn('Error in productTitleTransform:', error);
      }
    }
    
    return {
      // Basic item data
      id: item.id,
      packageId: item.packageId,
      title: customTitle || item.title || packageData.name,
      name: customTitle || packageData.name,
      quantity: item.quantity,
      
      // Pricing - will be formatted by TemplateRenderer
      price: packageCurrentPrice, // Total package price (e.g., $47.97 for 3x Drone)
      unitPrice: metrics.unitPrice, // Individual unit price (e.g., $15.99 per drone)
      lineTotal: lineTotal,
      lineCompare: metrics.hasSavings ? retailLineTotal : 0,
      comparePrice: metrics.hasSavings ? metrics.totalRetailPrice : 0,
      unitComparePrice: metrics.unitRetailPrice, // Individual unit retail price (e.g., $39.99 per drone)
      recurringPrice: hasRecurring ? recurringPrice : 0,
      savingsAmount: lineSavings > 0 ? lineSavings : 0,
      unitSavings: metrics.unitSavings, // Per-unit savings
      
      // Package-level pricing
      packagePrice: packagePrice,
      packagePriceTotal: metrics.totalPrice,
      packageRetailPrice: packageRetailPrice,
      packageRetailTotal: metrics.totalRetailPrice,
      packageSavings: metrics.totalSavings > 0 ? metrics.totalSavings : 0,
      recurringTotal: hasRecurring ? recurringTotal : 0,
      
      // Calculated fields
      savingsPct: metrics.totalSavingsPercentage > 0 ? `${Math.round(metrics.totalSavingsPercentage)}%` : '',
      packageSavingsPct: metrics.totalSavingsPercentage > 0 ? `${Math.round(metrics.totalSavingsPercentage)}%` : '',
      packageQty: packageQty,
      frequency: frequencyText,
      isRecurring: hasRecurring ? 'true' : 'false',
      hasSavings: lineSavings > 0 ? 'true' : 'false',
      hasPackageSavings: metrics.hasSavings ? 'true' : 'false',
      
      // Product data
      image: packageData.image || '',
      sku: packageData.external_id ? String(packageData.external_id) : '',
      
      // Raw values (unformatted)
      'price.raw': packageCurrentPrice,
      'unitPrice.raw': metrics.unitPrice,
      'lineTotal.raw': lineTotal,
      'lineCompare.raw': retailLineTotal,
      'comparePrice.raw': metrics.totalRetailPrice,
      'unitComparePrice.raw': metrics.unitRetailPrice,
      'recurringPrice.raw': recurringPrice,
      'savingsAmount.raw': lineSavings,
      'unitSavings.raw': metrics.unitSavings,
      'packagePrice.raw': packagePrice,
      'packagePriceTotal.raw': metrics.totalPrice,
      'packageRetailPrice.raw': packageRetailPrice,
      'packageRetailTotal.raw': metrics.totalRetailPrice,
      'packageSavings.raw': metrics.totalSavings,
      'recurringTotal.raw': recurringTotal,
      'savingsPct.raw': Math.round(metrics.totalSavingsPercentage),
      'packageSavingsPct.raw': Math.round(metrics.totalSavingsPercentage),
      
      // Conditional display helpers
      showCompare: metrics.hasSavings ? 'show' : 'hide',
      showSavings: lineSavings > 0 ? 'show' : 'hide',
      showUnitPrice: packageQty > 1 ? 'show' : 'hide', // Show unit price for multi-item packages
      showUnitCompare: packageQty > 1 && metrics.unitSavings > 0 ? 'show' : 'hide',
      showUnitSavings: packageQty > 1 && metrics.unitSavings > 0 ? 'show' : 'hide',
      showRecurring: hasRecurring ? 'show' : 'hide',
      showPackageSavings: metrics.totalSavings > 0 ? 'show' : 'hide',
      showPackageTotal: metrics.totalPrice > 0 ? 'show' : 'hide',
      showRecurringTotal: hasRecurring && recurringTotal > 0 ? 'show' : 'hide'
    };
  }


  public getItemCount(): number {
    return this.element.querySelectorAll('[data-cart-item-id]').length;
  }

  public getItemElements(): NodeListOf<Element> {
    return this.element.querySelectorAll('[data-cart-item-id]');
  }

  public refreshItem(_packageId: number): void {
    const cartState = useCartStore.getState();
    this.handleCartUpdate(cartState);
  }
}