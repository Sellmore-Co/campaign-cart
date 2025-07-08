export interface PackageMetrics {
    totalPrice: number;
    totalRetailPrice: number;
    totalSavings: number;
    totalSavingsPercentage: number;
    unitPrice: number;
    unitRetailPrice: number;
    unitSavings: number;
    unitSavingsPercentage: number;
    hasSavings: boolean;
}
export declare class PriceCalculator {
    /**
     * Calculate savings amount
     * @param retailPrice Original/compare price
     * @param currentPrice Sale/current price
     * @returns Savings amount (always >= 0)
     */
    static calculateSavings(retailPrice: number, currentPrice: number): number;
    /**
     * Calculate savings percentage
     * @param retailPrice Original/compare price
     * @param currentPrice Sale/current price
     * @returns Savings percentage (0-100)
     */
    static calculateSavingsPercentage(retailPrice: number, currentPrice: number): number;
    /**
     * Calculate unit price from total
     * @param totalPrice Total package price
     * @param quantity Number of units
     * @returns Price per unit
     */
    static calculateUnitPrice(totalPrice: number, quantity: number): number;
    /**
     * Calculate line total
     * @param unitPrice Price per unit
     * @param quantity Number of units
     * @returns Total price
     */
    static calculateLineTotal(unitPrice: number, quantity: number): number;
    /**
     * Calculate complete price metrics for a package
     * Note: 'price' from API is per-unit price, 'price_total' is for all units
     */
    static calculatePackageMetrics(params: {
        price: number;
        retailPrice: number;
        quantity: number;
        priceTotal?: number;
        retailPriceTotal?: number;
    }): PackageMetrics;
}
//# sourceMappingURL=PriceCalculator.d.ts.map