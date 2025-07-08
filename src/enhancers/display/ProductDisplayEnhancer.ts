/**
 * Product Display Enhancer
 * Displays package/campaign data with context awareness and advanced calculations
 */

import { BaseDisplayEnhancer, PropertyResolver, DisplayFormatter } from './DisplayEnhancerCore';
import { getPropertyMapping } from './DisplayEnhancerTypes';
import { AttributeParser } from '../base/AttributeParser';
import { PackageContextResolver } from '@/utils/dom/PackageContextResolver';
import { PriceCalculator } from '@/utils/calculations/PriceCalculator';
import { useCampaignStore } from '@/stores/campaignStore';
// import { useCartStore } from '@/stores/cartStore'; - removed unused import
import type { Package } from '@/types/global';

export class ProductDisplayEnhancer extends BaseDisplayEnhancer {
  private campaignState?: any;
  private packageId?: number;
  private contextPackageId?: number | undefined;
  private packageData?: Package;

  override async initialize(): Promise<void> {
    this.validateElement();
    this.parseDisplayAttributes();
    
    // PRESERVE: Package context detection
    this.detectPackageContext();
    
    this.setupStoreSubscriptions();
    await this.performInitialUpdate();
    this.logger.debug(`ProductDisplayEnhancer initialized with package ${this.packageId}, path: ${this.displayPath}`);
  }

  protected setupStoreSubscriptions(): void {
    // Subscribe to campaign store updates
    this.subscribe(useCampaignStore, this.handleCampaignUpdate.bind(this));
    
    // Get initial state
    this.campaignState = useCampaignStore.getState();
    
    // Load package data
    this.loadPackageData();
  }

  private handleCampaignUpdate(campaignState: any): void {
    this.campaignState = campaignState;
    this.loadPackageData();
    this.updateDisplay();
  }

  // PRESERVE: Package context detection
  private detectPackageContext(): void {
    // Try to inherit package ID from parent context first
    this.contextPackageId = PackageContextResolver.findPackageId(this.element);
    
    // Parse the display path to extract package ID if it's a package-specific path
    const parsed = AttributeParser.parseDisplayPath(this.displayPath!);
    if (parsed.object === 'package' && parsed.property.includes('.')) {
      // Format: "package.2.name" or "package.2.price"
      const parts = parsed.property.split('.');
      if (parts[0] && !isNaN(Number(parts[0]))) {
        this.packageId = Number(parts[0]);
        // Update property to remove package ID part
        this.property = parts.slice(1).join('.');
      }
    } else if (this.contextPackageId) {
      // Use context package ID if available
      this.packageId = this.contextPackageId;
    }
    
    if (!this.packageId) {
      this.logger.warn('No package context found - package ID required');
    }
  }

  private loadPackageData(): void {
    if (!this.packageId || !this.campaignState) return;
    
    this.packageData = this.campaignState.packages?.find((pkg: Package) => pkg.ref_id === this.packageId);
    if (!this.packageData) {
      this.logger.warn(`Package ${this.packageId} not found in campaign data`);
    }
  }

  protected getPropertyValue(): any {
    if (!this.packageData || !this.property) return undefined;

    // Handle campaign properties
    if (this.displayPath?.startsWith('campaign.')) {
      return this.getCampaignProperty(this.campaignState, this.property);
    }

    // Handle calculated properties
    const calculatedValue = this.getCalculatedProperty(this.property);
    if (calculatedValue !== undefined) {
      return calculatedValue;
    }

    // Direct property access on package
    return this.getPackageValue(this.packageData, this.property);
  }

  // Override to handle special element types and container hiding
  protected override updateElementContent(value: string): void {
    if (this.element instanceof HTMLInputElement || this.element instanceof HTMLTextAreaElement) {
      this.element.value = value;
    } else if (this.element instanceof HTMLImageElement) {
      this.element.src = value;
      this.element.alt = 'Product image';
    } else {
      this.element.textContent = value;
    }
  }

  // Override to handle container hiding support
  protected override hideElement(): void {
    this.element.style.display = 'none';
    this.addClass('display-hidden');
    this.removeClass('display-visible');
    
    // Also hide parent container if it has data-container attribute
    const container = this.element.closest('[data-container="true"]');
    if (container) {
      (container as HTMLElement).style.display = 'none';
    }
  }

  protected override showElement(): void {
    this.element.style.display = '';
    this.addClass('display-visible');
    this.removeClass('display-hidden');
    
    // Show parent container if it was hidden
    const container = this.element.closest('[data-container="true"]');
    if (container) {
      (container as HTMLElement).style.display = '';
    }
  }

  override update(data?: any): void {
    if (data) {
      this.handleCampaignUpdate(data);
    } else {
      this.updateDisplay();
    }
  }

  // PRESERVE: Advanced calculations
  private getCalculatedProperty(property: string): any {
    if (!this.packageData) return undefined;

    // Use PriceCalculator for all price metrics
    const metrics = PriceCalculator.calculatePackageMetrics({
      price: parseFloat(this.packageData.price || '0'),
      retailPrice: parseFloat(this.packageData.price_retail || '0'),
      quantity: this.packageData.qty || 1,
      priceTotal: parseFloat(this.packageData.price_total || '0'),
      retailPriceTotal: parseFloat(this.packageData.price_retail_total || '0')
    });

    // Check for mapped properties first
    const mappedPath = getPropertyMapping('package', property);
    if (mappedPath && mappedPath.startsWith('_calculated.')) {
      const calculatedProp = mappedPath.replace('_calculated.', '');
      switch (calculatedProp) {
        case 'savingsAmount':
          return DisplayFormatter.formatCurrency(metrics.totalSavings);
        case 'savingsPercentage':
          return `${Math.round(metrics.totalSavingsPercentage)}%`;
        case 'hasSavings':
          return metrics.hasSavings;
        case 'isBundle':
          return (this.packageData.qty || 1) > 1;
      }
    }

    switch (property) {
      // Standardized camelCase properties
      case 'savingsAmount':
        return DisplayFormatter.formatCurrency(metrics.totalSavings);
      
      case 'savingsPercentage':
        this.logger.debug(`Calculating savingsPercentage for package ${this.packageData.ref_id}:`, {
          totalSavingsPercentage: metrics.totalSavingsPercentage,
          totalSavings: metrics.totalSavings,
          unitPrice: metrics.unitPrice,
          unitRetailPrice: metrics.unitRetailPrice,
          packageData: {
            ref_id: this.packageData.ref_id,
            name: this.packageData.name,
            price: this.packageData.price,
            price_retail: this.packageData.price_retail,
            price_total: this.packageData.price_total,
            price_retail_total: this.packageData.price_retail_total
          }
        });
        return `${Math.round(metrics.totalSavingsPercentage)}%`;
      
      case 'unitPrice':
        return DisplayFormatter.formatCurrency(metrics.unitPrice);
      
      case 'unitRetailPrice':
        return DisplayFormatter.formatCurrency(metrics.unitRetailPrice);
      
      case 'unitSavings':
        return DisplayFormatter.formatCurrency(metrics.unitSavings);
      
      case 'unitSavingsPercentage':
        return `${Math.round(metrics.unitSavingsPercentage)}%`;
      
      // Boolean helpers
      case 'hasSavings':
        return metrics.hasSavings;
      
      case 'hasRetailPrice':
        return metrics.unitRetailPrice > 0 && metrics.unitRetailPrice !== metrics.unitPrice;
      
      case 'isBundle':
        return (this.packageData.qty || 1) > 1;
      
      case 'isRecurring':
        return this.packageData.is_recurring === true;
      
      // Raw values for calculations
      case 'savingsAmount.raw':
        return metrics.totalSavings;
      
      case 'savingsPercentage.raw':
        return metrics.totalSavingsPercentage;
      
      case 'unitPrice.raw':
        return metrics.unitPrice;
      
      case 'unitRetailPrice.raw':
        return metrics.unitRetailPrice;
      
      default:
        return undefined;
    }
  }


  private getPackageValue(packageData: Package, property: string): any {
    // Check for mapped properties
    const mappedPath = getPropertyMapping('package', property);
    if (mappedPath && !mappedPath.startsWith('_calculated.')) {
      return PropertyResolver.getNestedProperty(packageData, mappedPath);
    }

    // For unmapped properties, use PropertyResolver for nested access
    return PropertyResolver.getNestedProperty(packageData, property);
  }

  private getCampaignProperty(campaignState: any, property: string): any {
    const campaignData = campaignState.data;
    
    if (!campaignData) {
      return '';
    }
    
    switch (property) {
      case 'name':
        return campaignData.name;
      
      case 'currency':
        return campaignData.currency;
      
      case 'language':
        return campaignData.language;
      
      default:
        this.logger.warn(`Unknown campaign property: ${property}`);
        return '';
    }
  }

  // COMPATIBILITY METHODS
  public getPackageProperty(property: string): any {
    // Compatibility method - delegate to new implementation
    const oldProperty = this.property;
    this.property = property;
    const value = this.getPropertyValue();
    this.property = oldProperty;
    return value;
  }

  public setPackageContext(packageId: number): void {
    // Compatibility method
    this.packageId = packageId;
    this.loadPackageData();
    this.updateDisplay();
  }
}