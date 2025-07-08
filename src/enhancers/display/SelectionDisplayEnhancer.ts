/**
 * Selection Display Enhancer
 * Displays values based on the currently selected package in a selector
 */

import { BaseDisplayEnhancer, PropertyResolver, DisplayFormatter } from './DisplayEnhancerCore';
// import { getPropertyMapping } from './DisplayEnhancerTypes'; - removed unused import
// import { AttributeParser } from '../base/AttributeParser'; - removed unused import
import { PriceCalculator } from '@/utils/calculations/PriceCalculator';
import { useCampaignStore } from '@/stores/campaignStore';
import type { Package, SelectorItem } from '@/types/global';

export class SelectionDisplayEnhancer extends BaseDisplayEnhancer {
  private selectorId?: string;
  private selectedItem: SelectorItem | null = null;
  private packageData?: Package;
  private campaignState?: any;
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
    
    // Create bound handler for proper cleanup
    this.selectionChangeHandler = this.handleSelectionChange.bind(this);
    
    // Subscribe to global selector events
    this.eventBus.on('selector:selection-changed', this.selectionChangeHandler);
    this.eventBus.on('selector:item-selected', this.selectionChangeHandler);
  }

  private handleCampaignUpdate(campaignState: any): void {
    this.campaignState = campaignState;
    this.loadPackageData();
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
      
      case 'monthlyPrice':
        return this.getSelectionMonthlyPrice();
      
      case 'yearlyPrice':
        return this.getSelectionYearlyPrice();
      
      case 'pricePerDay':
        return this.getSelectionPricePerDay();
      
      case 'savingsPerUnit':
        return this.getSelectionSavingsPerUnit();
      
      case 'discountAmount':
        return this.getSelectionDiscountAmount();
      
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

  private getSelectionMonthlyPrice(): number {
    // For subscription products, return the monthly price
    // Otherwise return total divided by a standard period
    if (this.packageData?.is_recurring && this.packageData?.interval === 'month') {
      return this.getSelectionTotal();
    }
    // For one-time purchases, you might want to show monthly cost over a period
    // e.g., cost spread over 12 months
    return this.getSelectionTotal() / 12;
  }

  private getSelectionYearlyPrice(): number {
    if (this.packageData?.is_recurring) {
      if (this.packageData.interval === 'month') {
        return this.getSelectionTotal() * 12;
      }
    }
    // For one-time purchases, just return the total
    return this.getSelectionTotal();
  }

  private getSelectionPricePerDay(): number {
    // Calculate daily cost (yearly price / 365)
    return this.getSelectionYearlyPrice() / 365;
  }

  private getSelectionSavingsPerUnit(): number {
    const totalSavings = this.getSelectionSavingsAmount();
    const units = this.getSelectionTotalUnits();
    return units > 0 ? totalSavings / units : 0;
  }

  private getSelectionDiscountAmount(): number {
    // Same as savings but might be used for different display contexts
    return this.getSelectionSavingsAmount();
  }

  private getSelectionIsBundle(): boolean {
    return this.getSelectionTotalUnits() > 1;
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

  // Override formatting to handle special cases
  protected override async updateDisplay(): Promise<void> {
    try {
      let value = this.getPropertyValue();
      
      // Handle empty selection
      if (this.selectedItem === null && this.property !== 'hasSelection') {
        this.hideElement();
        return;
      }
      
      // Apply mathematical transformations
      if (typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)))) {
        const numValue = Number(value);
        if (this.divideBy) value = numValue / this.divideBy;
        if (this.multiplyBy) value = numValue * this.multiplyBy;
      }
      
      // Handle conditional hiding
      if (this.shouldHideElement(value)) {
        this.hideElement();
        return;
      }
      
      // Format based on property type
      let formattedValue: string;
      
      // Force number formatting for quantity-related properties
      if (this.property === 'totalUnits' || 
          this.property === 'totalQuantity' || 
          this.property === 'quantity') {
        formattedValue = DisplayFormatter.formatValue(value, 'number');
      } else if (this.property?.includes('price') || 
          this.property?.includes('total') || 
          this.property === 'savings' ||
          this.property === 'monthlyPrice' ||
          this.property === 'yearlyPrice' ||
          this.property === 'pricePerDay' ||
          this.property === 'unitPrice' ||
          this.property === 'savingsPerUnit' ||
          this.property === 'discountAmount') {
        formattedValue = DisplayFormatter.formatCurrency(value);
      } else if (this.property === 'savingsPercentage') {
        formattedValue = `${Math.round(value)}%`;
      } else {
        formattedValue = DisplayFormatter.formatValue(value, this.formatType);
      }
      
      this.updateElementContent(formattedValue);
      this.showElement();
      
    } catch (error) {
      this.handleError(error, 'updateDisplay');
      this.updateElementContent('--');
    }
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