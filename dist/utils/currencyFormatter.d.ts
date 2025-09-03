export declare class CurrencyFormatter {
    private static formatters;
    private static formattersNoZeroCents;
    private static numberFormatter;
    private static getCurrentCurrency;
    private static getUserLocale;
    static clearCache(): void;
    private static getCurrencyFormatter;
    private static getNumberFormatter;
    static formatCurrency(value: number | string, currency?: string, options?: {
        hideZeroCents?: boolean;
    }): string;
    static formatNumber(value: number | string): string;
    static formatPercentage(value: number, decimals?: number): string;
    static getCurrencySymbol(currency?: string): string;
    static isAlreadyFormatted(value: string, currency?: string): boolean;
}
export declare const formatCurrency: typeof CurrencyFormatter.formatCurrency;
export declare const formatNumber: typeof CurrencyFormatter.formatNumber;
export declare const formatPercentage: typeof CurrencyFormatter.formatPercentage;
export declare const getCurrencySymbol: typeof CurrencyFormatter.getCurrencySymbol;
//# sourceMappingURL=currencyFormatter.d.ts.map