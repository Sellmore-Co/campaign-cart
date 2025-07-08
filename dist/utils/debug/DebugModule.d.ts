/**
 * Debug Module - Lazy-loaded debug overlay system
 * Only loads when debug mode is activated
 */
export interface DebugModuleInterface {
    initialize(): void;
    show(): void;
    hide(): void;
    toggle(): void;
    isVisible(): boolean;
}
export declare class DebugModule {
    private static logger;
    /**
     * Lazy load and initialize the debug overlay
     */
    static loadDebugOverlay(): Promise<DebugModuleInterface>;
    /**
     * Initialize debug mode if enabled
     */
    static initializeIfEnabled(): Promise<void>;
    /**
     * Manually enable debug mode
     */
    static enableDebugMode(): Promise<DebugModuleInterface>;
    /**
     * Disable debug mode and cleanup
     */
    static disableDebugMode(): void;
    /**
     * Check if debug mode is currently active
     */
    static isDebugMode(): boolean;
    /**
     * Toggle debug mode on/off
     */
    static toggleDebugMode(): Promise<void>;
    /**
     * Set up global debug access for console usage
     */
    private static setupGlobalDebugAccess;
}
export default DebugModule;
//# sourceMappingURL=DebugModule.d.ts.map