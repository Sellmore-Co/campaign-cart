/**
 * Product Display Enhancer
 * Displays package/campaign data with context awareness and advanced calculations
 */

import { BaseDisplayEnhancer, PropertyResolver, DisplayFormatter } from './DisplayEnhancerCore';
import { getPropertyMapping } from './DisplayEnhancerTypes';
import { AttributeParser } from '../base/AttributeParser';
import { PackageContextResolver } from '@/utils/dom/PackageContextResolver';
import { DisplayContextProvider } from './DisplayContextProvider';
import { PriceCalculator } from '@/utils/calculations/PriceCalculator';
import { useCampaignStore } from '@/stores/campaignStore';
import { useCartStore } from '@/stores/cartStore';
import { useProfileStore } from '@/stores/profileStore';
import type { Package } from '@/types/global';

export class ProductDisplayEnhancer extends BaseDisplayEnhancer {
  private campaignState?: any;
  private packageId?: number;
  private contextPackageId?: number | undefined;
  private packageData?: Package;
  private originalPackageData?: Package; // Store original package data for profile-aware calculations
  private multiplyByQuantity: boolean = false;
  private currentQuantity: number = 1;
  private quantitySelectorId?: string;

  override async initialize(): Promise<void> {
    this.validateElement();
    this.parseDisplayAttributes();
    
    // Check for quantity multiplication attribute
    this.multiplyByQuantity = this.element.hasAttribute('data-next-multiply-quantity');
    this.quantitySelectorId = this.getAttribute('data-next-quantity-selector-id') || '';
    
    // PRESERVE: Package context detection
    this.detectPackageContext();
    
    this.setupStoreSubscriptions();
    this.setupQuantityListeners();
    this.setupCurrencyChangeListener();
    this.setupProfileEventListeners();
    await this.performInitialUpdate();
    this.logger.debug(`ProductDisplayEnhancer initialized with package ${this.packageId}, path: ${this.displayPath}, format: ${this.formatType}, multiplyByQuantity: ${this.multiplyByQuantity}`);
  }

  protected setupStoreSubscriptions(): void {
    // Subscribe to campaign store updates
    this.subscribe(useCampaignStore, this.handleCampaignUpdate.bind(this));
    
    // Also subscribe to cart store for discount changes
    this.subscribe(useCartStore, this.handleCartUpdate.bind(this));
    
    // Subscribe to profile store for profile changes
    this.subscribe(useProfileStore, (state) => {
      this.logger.debug(`Profile store changed, active profile: ${state.activeProfileId}`);
      this.handleProfileUpdate();
    });
    
    // Get initial state
    this.campaignState = useCampaignStore.getState();
    // Ensure we have access to all packages from the start
    if (!this.campaignState.packages && this.campaignState.data?.packages) {
      this.campaignState.packages = this.campaignState.data.packages;
    }
    
    // Load package data
    this.loadPackageData();
  }

  private handleCampaignUpdate(campaignState: any): void {
    this.campaignState = campaignState;
    // Ensure we have access to all packages
    if (!this.campaignState.packages && campaignState.data?.packages) {
      this.campaignState.packages = campaignState.data.packages;
    }
    this.loadPackageData();
    this.updateDisplay();
  }

  private handleCartUpdate(): void {
    // Update display when cart changes (discount codes might affect package price)
    this.updateDisplay();
  }
  
  protected override setupCurrencyChangeListener(): void {
    // Call base implementation first
    super.setupCurrencyChangeListener();
    
    // Add our specific handling for package data refresh
    document.addEventListener('next:currency-changed', async () => {
      this.logger.debug('Currency changed, reloading package data');
      
      // Get fresh campaign state
      this.campaignState = useCampaignStore.getState();
      
      // Reload package data with new currency
      this.loadPackageData();
      
      // Force a complete re-render
      await this.updateDisplay();
    });
  }
  
  private handleProfileUpdate(): void {
    this.logger.debug(`Profile update detected for package ${this.packageId}`);
    // Reload package data with new profile mapping
    this.loadPackageData();
    // Update display with new package data
    this.updateDisplay();
    this.logger.debug(`Display updated after profile change for package ${this.packageId}`);
  }
  
  private setupProfileEventListeners(): void {
    // Listen for profile events from the event bus
    this.eventBus.on('profile:applied', (data) => {
      this.logger.debug(`Profile applied event received: ${data.profileId} for package ${this.packageId}`);
      this.handleProfileUpdate();
    });
    
    this.eventBus.on('profile:reverted', (data) => {
      this.logger.debug(`Profile reverted event received for package ${this.packageId}`);
      this.handleProfileUpdate();
    });
  }
  
  private setupQuantityListeners(): void {
    // Listen for quantity changes if multiplication is enabled
    if (!this.multiplyByQuantity) return;
    
    // Listen for quantity change events from UpsellEnhancer
    this.eventBus.on('upsell:quantity-changed', (data) => {
      // Check if this quantity change is relevant to us
      if (this.quantitySelectorId && data.selectorId === this.quantitySelectorId) {
        this.currentQuantity = data.quantity;
        this.updateDisplay();
      } else if (!this.quantitySelectorId && !data.selectorId) {
        // No selector IDs on either side - match by package ID
        if (data.packageId === this.packageId) {
          this.currentQuantity = data.quantity;
          this.updateDisplay();
        }
      } else if (!this.quantitySelectorId) {
        // Check if we're in a container with matching selector ID
        const container = this.element.closest('[data-next-selector-id]');
        if (container) {
          const containerSelectorId = container.getAttribute('data-next-selector-id');
          if (containerSelectorId === data.selectorId) {
            this.currentQuantity = data.quantity;
            this.updateDisplay();
          }
        } else if (data.packageId === this.packageId) {
          // Fallback: match by package ID if no selector context
          this.currentQuantity = data.quantity;
          this.updateDisplay();
        }
      }
    });
    
    // Try to get initial quantity from the container
    if (this.quantitySelectorId) {
      // Check for existing quantity in the UpsellEnhancer's shared state
      const quantityDisplay = document.querySelector(
        `[data-next-upsell-quantity="display"][data-next-quantity-selector-id="${this.quantitySelectorId}"]`
      );
      if (quantityDisplay && quantityDisplay.textContent) {
        const qty = parseInt(quantityDisplay.textContent, 10);
        if (!isNaN(qty)) {
          this.currentQuantity = qty;
        }
      }
    } else {
      // No selector ID - try to find quantity display in same container
      const container = this.element.closest('[data-next-upsell="offer"]');
      if (container) {
        const quantityDisplay = container.querySelector('[data-next-upsell-quantity="display"]');
        if (quantityDisplay && quantityDisplay.textContent) {
          const qty = parseInt(quantityDisplay.textContent, 10);
          if (!isNaN(qty)) {
            this.currentQuantity = qty;
          }
        }
      }
    }
  }

  // PRESERVE: Package context detection
  private detectPackageContext(): void {
    // Try new context provider first
    const context = DisplayContextProvider.resolve(this.element);
    if (context?.packageId) {
      this.contextPackageId = context.packageId;
    } else {
      // Fallback to legacy context resolver
      this.contextPackageId = PackageContextResolver.findPackageId(this.element);
    }
    
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
    
    // Get packages from the correct location in campaign state
    const packages = this.campaignState.data?.packages || this.campaignState.packages;
    
    // Always load the original package data first
    this.originalPackageData = packages?.find((pkg: Package) => pkg.ref_id === this.packageId);
    
    // Apply profile mapping if active
    const profileStore = useProfileStore.getState();
    const mappedPackageId = profileStore.getMappedPackageId(this.packageId);
    
    // If package ID was mapped, use the mapped ID to find the package
    const targetPackageId = mappedPackageId !== this.packageId ? mappedPackageId : this.packageId;
    
    if (mappedPackageId !== this.packageId) {
      this.logger.debug(`Profile mapping applied: ${this.packageId} -> ${mappedPackageId}`);
    }
    
    // First try to find in campaign packages
    this.packageData = packages?.find((pkg: Package) => pkg.ref_id === targetPackageId);
    
    // If not found and it's a mapped package, try to get it from the campaign store directly
    if (!this.packageData && mappedPackageId !== this.packageId) {
      const campaignStore = useCampaignStore.getState();
      // Try to get the package from all packages if available
      if (campaignStore.data?.packages) {
        this.packageData = campaignStore.data.packages.find((pkg: Package) => pkg.ref_id === targetPackageId);
        if (this.packageData) {
          this.logger.debug(`Found package ${targetPackageId} in full campaign data`);
        }
      }
    }
    
    if (!this.packageData) {
      this.logger.warn(`Package ${targetPackageId} not found in campaign data (original: ${this.packageId})`);
      // Log available package IDs for debugging
      const availableIds = packages?.map((p: Package) => p.ref_id).join(', ');
      this.logger.debug(`Available package IDs in campaign state: ${availableIds}`);
      // If mapped package not found, fall back to original
      this.packageData = this.originalPackageData;
      if (this.originalPackageData) {
        this.logger.warn(`Falling back to original package ${this.packageId}`);
      }
    } else if (mappedPackageId !== this.packageId) {
      // Log the price comparison
      this.logger.debug(`Package prices - Original #${this.packageId}: retail=${this.originalPackageData?.price_retail}, sale=${this.originalPackageData?.price} | Mapped #${targetPackageId}: retail=${this.packageData.price_retail}, sale=${this.packageData.price}`);
    } else {
      // Log currency info when loading package
      this.logger.debug(`Package ${this.packageId} loaded with price: ${this.packageData.price} ${this.campaignState.data?.currency || ''}`);
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
      // Apply quantity multiplication if enabled and value is a number
      if (this.multiplyByQuantity && typeof calculatedValue === 'number') {
        return calculatedValue * this.currentQuantity;
      }
      return calculatedValue;
    }

    // Direct property access on package
    const value = this.getPackageValue(this.packageData, this.property);
    
    // Apply quantity multiplication for price-related properties
    if (this.multiplyByQuantity && this.isPriceProperty(this.property)) {
      const numericValue = this.parseNumericValue(value);
      if (numericValue !== null) {
        return numericValue * this.currentQuantity;
      }
    }
    
    return value;
  }
  
  private isPriceProperty(property: string): boolean {
    const priceProperties = [
      'price', 'price_total', 'price_retail', 'price_retail_total',
      'discountedPrice', 'discountedPriceTotal', 'finalPrice', 'finalPriceTotal',
      'savingsAmount', 'discountAmount'
    ];
    return priceProperties.includes(property);
  }
  
  private parseNumericValue(value: any): number | null {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // Remove currency symbols and parse
      const cleaned = value.replace(/[^0-9.-]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? null : parsed;
    }
    return null;
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
    const calculatorInput = {
      price: parseFloat(this.packageData.price || '0'),
      retailPrice: parseFloat(this.packageData.price_retail || '0'),
      quantity: this.packageData.qty || 1,
      priceTotal: parseFloat(this.packageData.price_total || '0'),
      retailPriceTotal: parseFloat(this.packageData.price_retail_total || '0')
    };
    
    const metrics = PriceCalculator.calculatePackageMetrics(calculatorInput);
    
    // Debug logging for savings calculation
    // if (property === 'savingsAmount' || property === 'hasSavings') {
    //   this.logger.debug('[SAVINGS DEBUG] Package savings calculation:', {
    //     packageId: this.packageData.ref_id,
    //     packageName: this.packageData.name,
    //     input: calculatorInput,
    //     output: {
    //       totalSavings: metrics.totalSavings,
    //       hasSavings: metrics.hasSavings,
    //       totalPrice: metrics.totalPrice,
    //       totalRetailPrice: metrics.totalRetailPrice
    //     }
    //   });
    // }

    // Check for mapped properties first
    const mappedPath = getPropertyMapping('package', property);
    if (mappedPath && mappedPath.startsWith('_calculated.')) {
      const calculatedProp = mappedPath.replace('_calculated.', '');
      switch (calculatedProp) {
        case 'savingsAmount':
          return metrics.totalSavings;
        case 'savingsPercentage':
          return metrics.totalSavingsPercentage;
        case 'hasSavings':
          return metrics.hasSavings;
        case 'isBundle':
          return (this.packageData.qty || 1) > 1;
        case 'discountedPrice':
          return this.calculateDiscountedPrice();
        case 'discountedPriceTotal':
          return this.calculateDiscountedPriceTotal();
        case 'discountAmount':
          return this.calculatePackageDiscountAmount();
        case 'hasDiscount':
          return this.calculatePackageDiscountAmount() > 0;
        case 'finalPrice':
          return this.calculateFinalPrice();
        case 'finalPriceTotal':
          return this.calculateFinalPriceTotal();
        case 'totalSavingsAmount':
          return this.calculateTotalSavingsAmount();
        case 'totalSavingsPercentage':
          return this.calculateTotalSavingsPercentage();
        case 'totalSavingsWithDiscounts':
          return this.calculateTotalSavingsAmount(); // Alias
        case 'totalSavingsPercentageWithDiscounts':
          return this.calculateTotalSavingsPercentage(); // Alias
        case 'hasTotalSavings':
          return this.calculateHasTotalSavings();
      }
    }

    switch (property) {
      // Standardized camelCase properties
      case 'savingsAmount':
        return metrics.totalSavings;
      
      case 'savingsPercentage':
        // Check if we should use profile-aware calculation
        if (this.originalPackageData && this.packageData && this.originalPackageData.ref_id !== this.packageData.ref_id) {
          // Profile is active, calculate savings based on original retail price
          const profileSavings = this.calculateProfileAwareSavingsPercentage();
          this.logger.debug(`Profile-aware savings percentage: ${profileSavings}% (was ${metrics.totalSavingsPercentage}%)`);
          return profileSavings;
        }
        this.logger.debug(`Standard savings percentage: ${metrics.totalSavingsPercentage}%`);
        return metrics.totalSavingsPercentage;
      
      case 'unitPrice':
        return DisplayFormatter.formatCurrency(metrics.unitPrice);
      
      case 'unitRetailPrice':
        return DisplayFormatter.formatCurrency(metrics.unitRetailPrice);
      
      case 'unitSavings':
        return DisplayFormatter.formatCurrency(metrics.unitSavings);
      
      case 'unitSavingsPercentage':
        this.logger.warn('[PERCENTAGE DEBUG] ProductDisplayEnhancer returning unitSavingsPercentage:', {
          unitSavingsPercentage: metrics.unitSavingsPercentage,
          unitSavingsPercentageType: typeof metrics.unitSavingsPercentage
        });
        return metrics.unitSavingsPercentage;
      
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
      
      // Discount-adjusted prices
      case 'discountedPrice':
        return this.calculateDiscountedPrice();
      
      case 'discountedPriceTotal':
        return this.calculateDiscountedPriceTotal();
      
      case 'discountAmount':
        return this.calculatePackageDiscountAmount();
      
      case 'hasDiscount':
        return this.calculatePackageDiscountAmount() > 0;
      
      case 'finalPrice':
        return this.calculateFinalPrice();
      
      case 'finalPriceTotal':
        return this.calculateFinalPriceTotal();
      
      // Total savings (retail + discounts)
      case 'totalSavingsAmount':
      case 'totalSavingsWithDiscounts':
        return this.calculateTotalSavingsAmount();
      
      case 'totalSavingsPercentage':
      case 'totalSavingsPercentageWithDiscounts':
        return this.calculateTotalSavingsPercentage();
      
      case 'hasTotalSavings':
        return this.calculateHasTotalSavings();
      
      // Raw values for total savings
      case 'totalSavingsAmount.raw':
      case 'totalSavingsWithDiscounts.raw':
        return this.calculateTotalSavingsAmountRaw();
      
      case 'totalSavingsPercentage.raw':
      case 'totalSavingsPercentageWithDiscounts.raw':
        return this.calculateTotalSavingsPercentageRaw();
      
      default:
        return undefined;
    }
  }

  private calculatePackageDiscountAmount(): number {
    if (!this.packageData) return 0;
    
    const cartStore = useCartStore.getState();
    const appliedCoupons = cartStore.appliedCoupons || [];
    
    let totalDiscount = 0;
    
    // Check each applied coupon to see if it applies to this package
    for (const appliedCoupon of appliedCoupons) {
      const coupon = appliedCoupon.definition;
      
      // Skip if coupon doesn't apply to this package
      if (coupon.scope === 'package' && coupon.packageIds) {
        if (!coupon.packageIds.includes(this.packageData.ref_id)) {
          continue;
        }
      } else if (coupon.scope === 'package') {
        // Package-scoped coupon without specific IDs - skip
        continue;
      }
      
      // Calculate discount for this package
      const packageTotal = parseFloat(this.packageData.price_total || '0') || 
                          (parseFloat(this.packageData.price || '0') * (this.packageData.qty || 1));
      
      if (coupon.type === 'percentage') {
        const discount = packageTotal * (coupon.value / 100);
        totalDiscount += coupon.maxDiscount ? Math.min(discount, coupon.maxDiscount) : discount;
      } else if (coupon.type === 'fixed' && coupon.scope === 'order') {
        // For order-level fixed discounts, distribute proportionally
        const cartSubtotal = cartStore.subtotal;
        if (cartSubtotal > 0) {
          const packageProportion = packageTotal / cartSubtotal;
          totalDiscount += coupon.value * packageProportion;
        }
      }
    }
    
    // Ensure discount doesn't exceed package price
    return Math.min(totalDiscount, parseFloat(this.packageData.price_total || '0'));
  }

  private calculateDiscountedPrice(): number {
    if (!this.packageData) return 0;
    
    const unitPrice = parseFloat(this.packageData.price || '0');
    const quantity = this.packageData.qty || 1;
    const discountAmount = this.calculatePackageDiscountAmount();
    
    // Distribute discount across units
    const discountPerUnit = quantity > 0 ? discountAmount / quantity : 0;
    return Math.max(0, unitPrice - discountPerUnit);
  }

  private calculateDiscountedPriceTotal(): number {
    if (!this.packageData) return 0;
    
    const packageTotal = parseFloat(this.packageData.price_total || '0') || 
                        (parseFloat(this.packageData.price || '0') * (this.packageData.qty || 1));
    const discountAmount = this.calculatePackageDiscountAmount();
    
    return Math.max(0, packageTotal - discountAmount);
  }

  private calculateFinalPrice(): number {
    // Final price is the discounted unit price (same as discountedPrice)
    return this.calculateDiscountedPrice();
  }

  private calculateFinalPriceTotal(): number {
    // Final total is the discounted package total (same as discountedPriceTotal)
    return this.calculateDiscountedPriceTotal();
  }

  private calculateTotalSavingsAmount(): number {
    if (!this.packageData) return 0;
    
    // Get retail savings (vs retail price)
    const calculatorInput = {
      price: parseFloat(this.packageData.price || '0'),
      retailPrice: parseFloat(this.packageData.price_retail || '0'),
      quantity: this.packageData.qty || 1,
      priceTotal: parseFloat(this.packageData.price_total || '0'),
      retailPriceTotal: parseFloat(this.packageData.price_retail_total || '0')
    };
    
    const metrics = PriceCalculator.calculatePackageMetrics(calculatorInput);
    const retailSavings = metrics.totalSavings || 0;
    
    // Get discount amount from cart coupons
    const discountAmount = this.calculatePackageDiscountAmount();
    
    // Total savings = retail savings + discount amount
    return retailSavings + discountAmount;
  }
  
  private calculateTotalSavingsAmountRaw(): number {
    // Return unformatted value
    return this.calculateTotalSavingsAmount();
  }

  private calculateTotalSavingsPercentage(): number {
    if (!this.packageData) return 0;
    
    // Get the original retail price (or regular price if no retail)
    const retailTotal = parseFloat(this.packageData.price_retail_total || '0') || 
                       parseFloat(this.packageData.price_total || '0');
    
    if (retailTotal <= 0) return 0;
    
    // Final price after all discounts
    const finalPrice = this.calculateFinalPriceTotal();
    
    // Calculate percentage saved from original retail price
    const totalSavings = retailTotal - finalPrice;
    const percentage = (totalSavings / retailTotal) * 100;
    
    return Math.min(100, Math.max(0, percentage));
  }
  
  private calculateTotalSavingsPercentageRaw(): number {
    // Return unformatted value
    return this.calculateTotalSavingsPercentage();
  }

  private calculateHasTotalSavings(): boolean {
    if (!this.packageData) return false;
    
    // Check if there's any savings (retail or discount)
    const totalSavings = this.calculateTotalSavingsAmount();
    return totalSavings > 0;
  }
  
  private calculateProfileAwareSavingsPercentage(): number {
    if (!this.originalPackageData || !this.packageData) return 0;
    
    // Use total prices for bundles, unit prices for singles
    const originalRetailTotal = parseFloat(this.originalPackageData.price_retail_total || '0') || 
                                parseFloat(this.originalPackageData.price_retail || '0');
    const currentSaleTotal = parseFloat(this.packageData.price_total || '0') || 
                            parseFloat(this.packageData.price || '0');
    
    if (originalRetailTotal <= 0) {
      this.logger.warn(`No retail price for original package ${this.originalPackageData.ref_id}`);
      return 0;
    }
    
    // Calculate the percentage difference between original retail and current sale price
    const savings = originalRetailTotal - currentSaleTotal;
    const percentage = (savings / originalRetailTotal) * 100;
    
    this.logger.debug(`Profile-aware calculation for package ${this.originalPackageData.ref_id}→${this.packageData.ref_id}: Original retail: $${originalRetailTotal}, Current sale: $${currentSaleTotal}, Savings: ${percentage.toFixed(1)}% (rounded: ${Math.round(percentage)}%)`);
    
    return Math.min(100, Math.max(0, Math.round(percentage)));
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