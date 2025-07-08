export declare class ElementDataExtractor {
    private static readonly PRICE_SELECTORS;
    private static readonly NAME_SELECTORS;
    /**
     * Extract price from an element using common price selectors
     */
    static extractPrice(element: HTMLElement): number | undefined;
    /**
     * Extract name/title from an element using common selectors
     */
    static extractName(element: HTMLElement): string | undefined;
    /**
     * Extract quantity from element attributes
     */
    static extractQuantity(element: HTMLElement): number;
}
//# sourceMappingURL=ElementDataExtractor.d.ts.map