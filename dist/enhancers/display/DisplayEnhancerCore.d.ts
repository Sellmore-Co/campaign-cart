import { BaseEnhancer } from '../base/BaseEnhancer';
import { FormatType } from './DisplayEnhancerTypes';
export declare class DisplayFormatter {
    private static dateFormatter;
    static formatValue(value: any, format?: FormatType, options?: {
        hideZeroCents?: boolean;
    }): string;
    static formatCurrency(value: any, hideZeroCents?: boolean): string;
    static formatNumber(value: any): string;
    static formatBoolean(value: any): string;
    static formatDate(value: any): string;
    static formatPercentage(value: any): string;
    static formatAuto(value: any, options?: {
        hideZeroCents?: boolean;
    }): string;
}
export declare class PropertyResolver {
    static getNestedProperty(obj: any, path: string): any;
    static hasProperty(obj: any, path: string): boolean;
    static getPropertyWithFallbacks(obj: any, paths: string[]): any;
}
export declare abstract class BaseDisplayEnhancer extends BaseEnhancer {
    protected displayPath?: string;
    protected property?: string | undefined;
    protected formatType: FormatType;
    protected hideIfZero: boolean;
    protected hideIfFalse: boolean;
    protected hideZeroCents: boolean;
    protected divideBy?: number;
    protected multiplyBy?: number;
    protected lastValue?: any;
    private debugMode;
    initialize(): Promise<void>;
    protected setupCurrencyChangeListener(): void;
    protected parseDisplayAttributes(): void;
    protected getDefaultFormatType(property: string): FormatType;
    protected abstract setupStoreSubscriptions(): void;
    protected abstract getPropertyValue(): any;
    protected getPropertyValueWithValidation(): any;
    protected performInitialUpdate(): Promise<void>;
    protected updateDisplay(): Promise<void>;
    protected shouldHideElement(value: any): boolean;
    protected updateElementContent(value: string): void;
    protected hideElement(): void;
    protected showElement(): void;
    update(): void;
}
//# sourceMappingURL=DisplayEnhancerCore.d.ts.map