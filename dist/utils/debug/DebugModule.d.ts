export interface DebugModuleInterface {
    initialize(): void;
    show(): void;
    hide(): void;
    toggle(): void;
    isVisible(): boolean;
}
export declare class DebugModule {
    private static logger;
    static loadDebugOverlay(): Promise<DebugModuleInterface>;
    static initializeIfEnabled(): Promise<void>;
    static enableDebugMode(): Promise<DebugModuleInterface>;
    static disableDebugMode(): void;
    static isDebugMode(): boolean;
    static toggleDebugMode(): Promise<void>;
    private static setupGlobalDebugAccess;
}
export default DebugModule;
//# sourceMappingURL=DebugModule.d.ts.map