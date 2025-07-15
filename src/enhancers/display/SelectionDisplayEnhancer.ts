/**
 * Selection Display Enhancer
 * Displays values based on the currently selected package in a selector
 */

import { BaseDisplayEnhancer, PropertyResolver } from './DisplayEnhancerCore';
import { PriceCalculator } from '@/utils/calculations/PriceCalculator';
import { useCampaignStore } from '@/stores/campaignStore';
import { useCartStore } from '@/stores/cartStore';
import type { Package, SelectorItem, CartState } from '@/types/global';

export class SelectionDisplayEnhancer extends BaseDisplayEnhancer {
  private selectorId?: string;
  private selectedItem: SelectorItem | null = null;
  private packageData?: Package;
  private campaignState?: any;
  private cartState?: CartState;
  private selectionChangeHandler: ((event: any) => void) | null = null;

  override async initialize(): Promise<void> {
    this.validateElement();
    this.parseDisplayAttributes();
    
    // Find associated selector
    this.findAssociatedSelector();
    
    this.setupStoreSubscriptions();
    
    // Load package data if we found a selected item
    if (this.selectedItem) {
      this.loadPackageData();
    }
    
    await this.performInitialUpdate();
    
    this.logger.debug(`SelectionDisplayEnhancer initialized:`, {
      displayPath: this.displayPath,
      selectorId: this.selectorId
    });
  }

  protected override parseDisplayAttributes(): void {
    super.parseDisplayAttributes();
    
    // Check if selector ID is embedded in the display path
    // Format: selection.{selectorId}.{property}
    const pathParts = this.displayPath!.split('.');
    if (pathParts.length >= 3 && pathParts[0] === 'selection') {
      // Extract selector ID from path
      const selectorId = pathParts[1];
      if (selectorId) {
        this.selectorId = selectorId;
      }
      // Update property to be the remaining parts
      this.property = pathParts.slice(2).join('.');
      
      this.logger.debug('Extracted selector ID from display path:', {
        displayPath: this.displayPath,
        selectorId: this.selectorId,
        property: this.property
      });
    } else {
      // Fallback to attribute or context-based detection
      const selectorId = this.getAttribute('data-next-selector-id') || 
                         this.getAttribute('data-selector-id') ||
                         this.findSelectorIdFromContext();
      if (selectorId) {
        this.selectorId = selectorId;
      }
    }
    
    if (!this.selectorId) {
      this.logger.warn('No selector ID found for SelectionDisplayEnhancer');
    }
  }

  private findSelectorIdFromContext(): string | undefined {
    let current: HTMLElement | null = this.element.parentElement;
    
    while (current) {
      const selectorId = current.getAttribute('data-next-selector-id') ?? undefined;
      if (selectorId) return selectorId;
      
      // Check if this is a selector element itself
      if (current.hasAttribute('data-next-cart-selector')) {
        return current.getAttribute('data-next-selector-id') ?? 
               current.getAttribute('data-next-id') ?? undefined;
      }
      
      current = current.parentElement;
    }
    
    return undefined;
  }

  private findAssociatedSelector(): void {
    if (!this.selectorId) return;
    
    // Find the selector element
    const selectorElement = document.querySelector(
      `[data-next-selector-id="${this.selectorId}"]`
    ) as HTMLElement;
    
    if (selectorElement) {
      // Try to get the selected item from the selector's exposed methods
      const getSelectedItem = (selectorElement as any)._getSelectedItem;
      if (typeof getSelectedItem === 'function') {
        this.selectedItem = getSelectedItem();
        this.logger.debug('Got initial selected item from selector:', this.selectedItem);
      } else {
        // Fallback: Find the selected card directly if selector hasn't initialized yet
        const selectedCard = selectorElement.querySelector('[data-next-selected="true"]') as HTMLElement;
        if (selectedCard) {
          const packageId = parseInt(selectedCard.getAttribute('data-next-package-id') || '0', 10);
          const quantity = parseInt(selectedCard.getAttribute('data-next-quantity') || '1', 10);
          
          if (packageId > 0) {
            this.selectedItem = {
              packageId,
              quantity,
              element: selectedCard,
              name: undefined,
              price: undefined,
              shippingId: selectedCard.getAttribute('data-next-shipping-id') || undefined,
              isPreSelected: true
            };
            this.logger.debug('Found selected item from DOM:', this.selectedItem);
          }
        }
      }
    } else {
      this.logger.debug(`Selector element not found for ID: ${this.selectorId}`);
    }
  }

  protected setupStoreSubscriptions(): void {
    // Subscribe to campaign store for package data
    this.subscribe(useCampaignStore, this.handleCampaignUpdate.bind(this));
    this.campaignState = useCampaignStore.getState();
    
    // Subscribe to cart store only if needed for discount properties
    if (this.needsCartData()) {
      this.subscribe(useCartStore, this.handleCartUpdate.bind(this));
      this.cartState = useCartStore.getState();
    }
    
    // Create bound handler for proper cleanup
    this.selectionChangeHandler = this.handleSelectionChange.bind(this);
    
    // Subscribe to global selector events
    this.eventBus.on('selector:selection-changed', this.selectionChangeHandler);
    this.eventBus.on('selector:item-selected', this.selectionChangeHandler);
  }

  private needsCartData(): boolean {
    // Check if the property requires cart data for discount calculations
    const discountProperties = [
      'discountedPrice',
      'finalPrice',
      'discountAmount',
      'appliedDiscountAmount',
      'hasDiscount',
      'appliedDiscounts',
      'discountPercentage'
    ];
    
    return this.property ? discountProperties.includes(this.property) : false;
  }

  private handleCampaignUpdate(campaignState: any): void {
    this.campaignState = campaignState;
    this.loadPackageData();
    this.updateDisplay();
  }

  private handleCartUpdate(cartState: CartState): void {
    this.cartState = cartState;
    this.updateDisplay();
  }

  private handleSelectionChange(event: any): void {
    // Only handle events for our selector
    if (event.selectorId !== this.selectorId) return;
    
    this.logger.debug('Selection changed:', event);
    
    // Update selected item
    if (event.item) {
      this.selectedItem = event.item;
    } else if (event.packageId) {
      // Try to find the selector and get the item
      const selectorElement = document.querySelector(
        `[data-next-selector-id="${this.selectorId}"]`
      ) as HTMLElement;
      
      if (selectorElement) {
        const getSelectedItem = (selectorElement as any)._getSelectedItem;
        if (typeof getSelectedItem === 'function') {
          this.selectedItem = getSelectedItem();
        }
      }
    }
    
    this.loadPackageData();
    this.updateDisplay();
  }

  private loadPackageData(): void {
    if (!this.selectedItem || !this.campaignState) return;
    
    this.packageData = this.campaignState.packages?.find(
      (pkg: Package) => pkg.ref_id === this.selectedItem!.packageId
    );
    
    if (!this.packageData) {
      this.logger.warn(`Package ${this.selectedItem.packageId} not found in campaign data`);
    }
  }

  protected getPropertyValue(): any {
    if (!this.selectedItem || !this.property) return undefined;
    
    // Handle selection properties
    switch (this.property) {
      case 'hasSelection':
        return this.selectedItem !== null;
      
      case 'packageId':
        return this.selectedItem.packageId;
      
      case 'quantity':
        return this.selectedItem.quantity;
      
      case 'name':
        return this.packageData?.name || this.selectedItem.name || '';
      
      // Pricing properties
      case 'price':
        return this.getSelectionPrice();
      
      case 'total':
      case 'price_total':
        return this.getSelectionTotal();
      
      case 'compareTotal':
      case 'price_retail_total':
        return this.getSelectionCompareTotal();
      
      case 'savings':
      case 'savingsAmount':
        return this.getSelectionSavingsAmount();
      
      case 'savingsPercentage':
        return this.getSelectionSavingsPercentageFormatted();
      
      case 'hasSavings':
        return this.getSelectionHasSavings();
      
      // Additional calculated fields
      case 'unitPrice':
      case 'pricePerUnit':
        return this.getSelectionUnitPrice();
      
      case 'totalUnits':
      case 'totalQuantity':
        return this.getSelectionTotalUnits();
      
      case 'discountAmount':
        return this.getSelectionDiscountAmount();
      
      // Cart discount properties
      case 'discountedPrice':
      case 'finalPrice':
        return this.calculateSelectionDiscountedPrice();
      
      case 'appliedDiscountAmount':
        return this.calculateSelectionDiscountAmount();
      
      case 'hasDiscount':
        return this.getSelectionHasDiscount();
      
      case 'discountPercentage':
        return this.getSelectionDiscountPercentage();
      
      case 'appliedDiscounts':
        return this.getSelectionAppliedDiscounts();
      
      case 'isMultiPack':
      case 'isBundle':
        return this.getSelectionIsBundle();
      
      case 'isSingleUnit':
        return !this.getSelectionIsBundle();
      
      default:
        // Check for custom calculated fields with operators
        const calculatedValue = this.parseCalculatedField(this.property);
        if (calculatedValue !== undefined) {
          return calculatedValue;
        }
        
        // Try to get from package data
        if (this.packageData) {
          return PropertyResolver.getNestedProperty(this.packageData, this.property);
        }
        return undefined;
    }
  }

  private getSelectionPrice(): number {
    if (!this.selectedItem) return 0;
    
    if (this.packageData) {
      return parseFloat(this.packageData.price || '0');
    }
    
    return this.selectedItem.price || 0;
  }

  private getSelectionTotal(): number {
    if (!this.selectedItem) return 0;
    
    if (this.packageData) {
      return parseFloat(this.packageData.price_total || '0') || 
             (parseFloat(this.packageData.price || '0') * this.selectedItem.quantity);
    }
    
    return (this.selectedItem.price || 0) * this.selectedItem.quantity;
  }

  private getSelectionCompareTotal(): number {
    if (!this.selectedItem || !this.packageData) return 0;
    
    const retailTotal = parseFloat(this.packageData.price_retail_total || '0');
    if (retailTotal > 0) return retailTotal;
    
    const retailPrice = parseFloat(this.packageData.price_retail || '0');
    if (retailPrice > 0) {
      return retailPrice * this.selectedItem.quantity;
    }
    
    return this.getSelectionTotal();
  }

  private getSelectionMetrics() {
    const total = this.getSelectionTotal();
    const compareTotal = this.getSelectionCompareTotal();
    
    return {
      total,
      compareTotal,
      savings: PriceCalculator.calculateSavings(compareTotal, total),
      savingsPercentage: PriceCalculator.calculateSavingsPercentage(compareTotal, total)
    };
  }
  
  private getSelectionSavingsAmount(): number {
    return this.getSelectionMetrics().savings;
  }
  
  private getSelectionSavingsPercentageFormatted(): number {
    return this.getSelectionMetrics().savingsPercentage;
  }
  
  private getSelectionHasSavings(): boolean {
    return this.getSelectionMetrics().savings > 0;
  }

  private getSelectionUnitPrice(): number {
    const total = this.getSelectionTotal();
    const units = this.getSelectionTotalUnits();
    return units > 0 ? total / units : 0;
  }

  private getSelectionTotalUnits(): number {
    if (!this.selectedItem) return 0;
    // Return package qty (units in the package) not cart quantity
    return this.packageData?.qty || 1;
  }

  private getSelectionDiscountAmount(): number {
    // Same as savings but might be used for different display contexts
    return this.getSelectionSavingsAmount();
  }

  private getSelectionIsBundle(): boolean {
    return this.getSelectionTotalUnits() > 1;
  }

  // Discount calculation methods
  private calculateSelectionDiscountAmount(): number {
    if (!this.selectedItem || !this.packageData || !this.cartState?.appliedCoupons?.length) {
      return 0;
    }

    let totalDiscount = 0;
    const basePrice = this.getSelectionPrice();
    const quantity = this.selectedItem.quantity;

    // Check each applied coupon to see if it applies to this package
    for (const coupon of this.cartState.appliedCoupons) {
      // Package-specific discount
      if (coupon.definition.packageIds && coupon.definition.packageIds.includes(this.selectedItem.packageId)) {
        if (coupon.definition.type === 'percentage') {
          totalDiscount += (basePrice * quantity * coupon.definition.value) / 100;
        } else if (coupon.definition.type === 'fixed') {
          totalDiscount += coupon.definition.value * quantity;
        }
      }
      // Order-level discount
      else if (!coupon.definition.packageIds || coupon.definition.packageIds.length === 0) {
        if (coupon.definition.type === 'percentage') {
          totalDiscount += (basePrice * quantity * coupon.definition.value) / 100;
        } else if (coupon.definition.type === 'fixed') {
          // For fixed order-level discounts, distribute proportionally
          const packageTotal = basePrice * quantity;
          const cartSubtotal = this.cartState.totals.subtotal.value;
          if (cartSubtotal > 0) {
            const proportion = packageTotal / cartSubtotal;
            totalDiscount += coupon.definition.value * proportion;
          }
        }
      }
    }

    return totalDiscount;
  }

  private calculateSelectionDiscountedPrice(): number {
    const unitPrice = this.getSelectionPrice();
    const discountAmount = this.calculateSelectionDiscountAmount();
    const quantity = this.selectedItem?.quantity || 1;
    
    // Calculate the unit price after discounts
    const discountPerUnit = quantity > 0 ? discountAmount / quantity : 0;
    return Math.max(0, unitPrice - discountPerUnit);
  }

  private getSelectionHasDiscount(): boolean {
    return this.calculateSelectionDiscountAmount() > 0;
  }

  private getSelectionDiscountPercentage(): number {
    const total = this.getSelectionTotal();
    const discount = this.calculateSelectionDiscountAmount();
    
    if (total <= 0) return 0;
    return (discount / total) * 100;
  }

  private getSelectionAppliedDiscounts(): Array<{code: string; amount: number}> {
    if (!this.selectedItem || !this.packageData || !this.cartState?.appliedCoupons?.length) {
      return [];
    }

    const discounts: Array<{code: string; amount: number}> = [];
    
    for (const coupon of this.cartState.appliedCoupons) {
      let discountAmount = 0;
      
      // Package-specific discount
      if (coupon.definition.packageIds && coupon.definition.packageIds.includes(this.selectedItem.packageId)) {
        if (coupon.definition.type === 'percentage') {
          discountAmount = (this.getSelectionTotal() * coupon.definition.value) / 100;
        } else if (coupon.definition.type === 'fixed') {
          discountAmount = coupon.definition.value * this.selectedItem.quantity;
        }
      }
      // Order-level discount
      else if (!coupon.definition.packageIds || coupon.definition.packageIds.length === 0) {
        if (coupon.definition.type === 'percentage') {
          discountAmount = (this.getSelectionTotal() * coupon.definition.value) / 100;
        } else if (coupon.definition.type === 'fixed') {
          // Proportional distribution
          const packageTotal = this.getSelectionTotal();
          const cartSubtotal = this.cartState.totals.subtotal.value;
          if (cartSubtotal > 0) {
            const proportion = packageTotal / cartSubtotal;
            discountAmount = coupon.definition.value * proportion;
          }
        }
      }
      
      if (discountAmount > 0) {
        discounts.push({
          code: coupon.code,
          amount: discountAmount
        });
      }
    }
    
    return discounts;
  }

  // Parse custom calculated fields with mathematical expressions
  private parseCalculatedField(field: string): number | undefined {
    if (!this.selectedItem || !field) return undefined;
    
    // Support expressions like "total*0.1" for 10% of total
    // or "price+5" for price plus 5
    const operators = ['+', '-', '*', '/'];
    
    for (const op of operators) {
      if (field.includes(op)) {
        const parts = field.split(op);
        if (parts.length === 2) {
          const leftProperty = parts[0]?.trim() || '';
          const rightValue = parseFloat(parts[1]?.trim() || '0');
          
          // Get the base value for the left side
          let leftValue: number = 0;
          switch (leftProperty) {
            case 'total':
            case 'price_total':
              leftValue = this.getSelectionTotal();
              break;
            case 'price':
              leftValue = this.getSelectionPrice();
              break;
            case 'savings':
            case 'savingsAmount':
              leftValue = this.getSelectionSavingsAmount();
              break;
            case 'compareTotal':
              leftValue = this.getSelectionCompareTotal();
              break;
            default:
              // Try to get the property value
              const oldProperty = this.property;
              this.property = leftProperty;
              const value = this.getPropertyValue();
              this.property = oldProperty;
              leftValue = typeof value === 'number' ? value : 0;
          }
          
          if (!isNaN(rightValue)) {
            switch (op) {
              case '+': return leftValue + rightValue;
              case '-': return leftValue - rightValue;
              case '*': return leftValue * rightValue;
              case '/': return rightValue !== 0 ? leftValue / rightValue : 0;
            }
          }
        }
      }
    }
    
    return undefined;
  }

  protected override async performInitialUpdate(): Promise<void> {
    // If we don't have a selected item yet, wait a bit for selector to initialize
    if (!this.selectedItem && this.selectorId) {
      // Give selector a chance to initialize
      await new Promise(resolve => setTimeout(resolve, 50));
      this.findAssociatedSelector();
      if (this.selectedItem) {
        this.loadPackageData();
      }
    }
    
    await this.updateDisplay();
  }

  // Override to handle empty selection
  protected override async updateDisplay(): Promise<void> {
    // Handle empty selection
    if (this.selectedItem === null && this.property !== 'hasSelection') {
      this.hideElement();
      return;
    }
    
    // Use the base class implementation which uses the clean pipeline
    await super.updateDisplay();
  }

  public override destroy(): void {
    // Clean up event listeners
    if (this.selectionChangeHandler) {
      this.eventBus.off('selector:selection-changed', this.selectionChangeHandler);
      this.eventBus.off('selector:item-selected', this.selectionChangeHandler);
    }
    
    super.destroy();
  }
}