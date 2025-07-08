import { BaseEnhancer } from '../base/BaseEnhancer';
import { FormatType } from './DisplayEnhancerTypes';

export declare class DisplayFormatter {
    private static currencyFormatter;
    private static numberFormatter;
    private static dateFormatter;
    static formatValue(value: any, format?: FormatType): string;
    static formatCurrency(value: any): string;
    static formatNumber(value: any): string;
    static formatBoolean(value: any): string;
    static formatDate(value: any): string;
    static formatPercentage(value: any): string;
    static formatAuto(value: any): string;
    private static toNumber;
}
export declare class PropertyResolver {
    /**
     * Safely gets nested property value from an object
     */
    static getNestedProperty(obj: any, path: string): any;
    /**
     * Checks if a property path exists in an object
     */
    static hasProperty(obj: any, path: string): boolean;
    /**
     * Gets property with fallback values
     */
    static getPropertyWithFallbacks(obj: any, paths: string[]): any;
}
export declare abstract class BaseDisplayEnhancer extends BaseEnhancer {
    protected displayPath?: string;
    protected property?: string | undefined;
    protected formatType: FormatType;
    protected hideIfZero: boolean;
    protected hideIfFalse: boolean;
    protected divideBy?: number;
    protected multiplyBy?: number;
    protected lastValue?: any;
    initialize(): Promise<void>;
    /**
     * Parses display-related attributes from the element
     * Note: Subclasses should NOT override unless they need custom parsing logic
     * (e.g., SelectionDisplayEnhancer extracts selector ID from path)
     */
    protected parseDisplayAttributes(): void;
    /**
     * Determines the default format type based on property name
     * This enables smart formatting for common property patterns
     */
    protected getDefaultFormatType(property: string): FormatType;
    protected abstract setupStoreSubscriptions(): void;
    protected abstract getPropertyValue(): any;
    protected performInitialUpdate(): Promise<void>;
    protected updateDisplay(): Promise<void>;
    protected shouldHideElement(value: any): boolean;
    protected updateElementContent(value: string): void;
    protected hideElement(): void;
    protected showElement(): void;
    update(): void;
}
//# sourceMappingURL=DisplayEnhancerCore.d.ts.map