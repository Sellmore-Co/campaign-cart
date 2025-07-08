/**
 * Debug Style Loader
 * Lazy loads debug CSS files only when debug mode is active
 */
export declare class DebugStyleLoader {
    private static styleElement;
    private static isLoading;
    static loadDebugStyles(): Promise<void>;
    static removeDebugStyles(): void;
}
//# sourceMappingURL=DebugStyleLoader.d.ts.map