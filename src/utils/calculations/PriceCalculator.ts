export interface PackageMetrics {
  // Totals
  totalPrice: number;
  totalRetailPrice: number;
  totalSavings: number;
  totalSavingsPercentage: number;
  
  // Units
  unitPrice: number;
  unitRetailPrice: number;
  unitSavings: number;
  unitSavingsPercentage: number;
  
  // Helpers
  hasSavings: boolean;
}

export class PriceCalculator {
  /**
   * Calculate savings amount
   * @param retailPrice Original/compare price
   * @param currentPrice Sale/current price
   * @returns Savings amount (always >= 0)
   */
  static calculateSavings(retailPrice: number, currentPrice: number): number {
    return Math.max(0, retailPrice - currentPrice);
  }

  /**
   * Calculate savings percentage
   * @param retailPrice Original/compare price
   * @param currentPrice Sale/current price
   * @returns Savings percentage (0-100)
   */
  static calculateSavingsPercentage(retailPrice: number, currentPrice: number): number {
    const savings = this.calculateSavings(retailPrice, currentPrice);
    if (retailPrice <= 0 || savings <= 0) return 0;
    // Return rounded percentage to avoid decimal confusion with currency formatting
    const percentage = (savings / retailPrice) * 100;
    return Math.round(percentage);
  }

  /**
   * Calculate unit price from total
   * @param totalPrice Total package price
   * @param quantity Number of units
   * @returns Price per unit
   */
  static calculateUnitPrice(totalPrice: number, quantity: number): number {
    return quantity > 0 ? totalPrice / quantity : 0;
  }

  /**
   * Calculate line total
   * @param unitPrice Price per unit
   * @param quantity Number of units
   * @returns Total price
   */
  static calculateLineTotal(unitPrice: number, quantity: number): number {
    return unitPrice * quantity;
  }

  /**
   * Calculate complete price metrics for a package
   * Note: 'price' from API is per-unit price, 'price_total' is for all units
   */
  static calculatePackageMetrics(params: {
    price: number; // Per-unit price from API
    retailPrice: number;
    quantity: number;
    priceTotal?: number;
    retailPriceTotal?: number;
  }): PackageMetrics {
    const totalPrice = params.priceTotal || params.price * params.quantity;
    const totalRetailPrice = params.retailPriceTotal || params.retailPrice * params.quantity;
    
    const unitPrice = this.calculateUnitPrice(totalPrice, params.quantity);
    const unitRetailPrice = this.calculateUnitPrice(totalRetailPrice, params.quantity);
    
    return {
      // Totals
      totalPrice,
      totalRetailPrice,
      totalSavings: this.calculateSavings(totalRetailPrice, totalPrice),
      totalSavingsPercentage: this.calculateSavingsPercentage(totalRetailPrice, totalPrice),
      
      // Units
      unitPrice,
      unitRetailPrice,
      unitSavings: this.calculateSavings(unitRetailPrice, unitPrice),
      unitSavingsPercentage: this.calculateSavingsPercentage(unitRetailPrice, unitPrice),
      
      // Helpers
      hasSavings: totalRetailPrice > totalPrice
    };
  }
}