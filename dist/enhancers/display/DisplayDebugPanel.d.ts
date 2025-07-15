/**
 * Display Debug Panel
 * Enhanced debugging tools for the display formatting system
 */
export declare class DisplayDebugPanel {
    private static panel;
    private static isEnabled;
    private static hoveredElement;
    private static updateTimer;
    /**
     * Initialize the debug panel
     */
    static init(): void;
    /**
     * Create the debug panel UI
     */
    private static createPanel;
    /**
     * Setup event listeners for hover detection
     */
    private static setupEventListeners;
    /**
     * Update debug information for an element
     */
    private static updateDebugInfo;
    /**
     * Extract debug information from element attributes
     */
    private static extractDebugInfo;
    /**
     * Render debug information as HTML
     */
    private static renderDebugInfo;
    /**
     * Format value for display
     */
    private static formatValue;
    /**
     * Escape HTML for safe display
     */
    private static escapeHtml;
    /**
     * Show the debug panel
     */
    static show(): void;
    /**
     * Hide the debug panel
     */
    static hide(): void;
    /**
     * Toggle panel visibility
     */
    static toggle(): void;
    /**
     * Destroy the debug panel
     */
    static destroy(): void;
    /**
     * Log all display elements to console
     */
    static logAllElements(): void;
}
//# sourceMappingURL=DisplayDebugPanel.d.ts.map