export interface XrayAttributeConfig {
    selector: string;
    color: string;
    label?: string;
    labelPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    description?: string;
}
export interface XrayStyleConfig {
    attributes: XrayAttributeConfig[];
    baseStyles: string;
    hoverStyles: string;
    activeStateStyles: string;
}
export declare const xrayConfig: XrayStyleConfig;
export declare function generateXrayStyles(): string;
export declare class XrayManager {
    private static styleElement;
    private static isActive;
    private static readonly STORAGE_KEY;
    static initialize(): void;
    static toggle(): boolean;
    static activate(): void;
    static deactivate(): void;
    static isXrayActive(): boolean;
}
//# sourceMappingURL=XrayStyles.d.ts.map