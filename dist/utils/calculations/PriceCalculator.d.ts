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
    static calculateSavings(retailPrice: number, currentPrice: number): number;
    static calculateSavingsPercentage(retailPrice: number, currentPrice: number): number;
    static calculateUnitPrice(totalPrice: number, quantity: number): number;
    static calculateLineTotal(unitPrice: number, quantity: number): number;
    static calculatePackageMetrics(params: {
        price: number;
        retailPrice: number;
        quantity: number;
        priceTotal?: number;
        retailPriceTotal?: number;
    }): PackageMetrics;
}
//# sourceMappingURL=PriceCalculator.d.ts.map