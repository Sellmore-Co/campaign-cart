import { AttributionState } from '../../stores/attributionStore';
export declare class AttributionCollector {
    /**
     * Collect attribution data from all available sources
     */
    collect(): Promise<AttributionState>;
    /**
     * Collect metadata including device info, referrer, and tracking data
     */
    private collectMetadata;
    /**
     * Get value from URL parameters, sessionStorage, or localStorage
     * Priority: URL > sessionStorage > localStorage
     */
    private getStoredValue;
    /**
     * Get cookie value by name
     */
    private getCookie;
    /**
     * Detect device type based on user agent
     */
    private getDeviceType;
    /**
     * Get funnel name from meta tag or campaign
     * Once a funnel is set, it persists and won't be overwritten
     */
    private getFunnelName;
    /**
     * Handle Everflow click ID tracking
     */
    private handleEverflowClickId;
    /**
     * Collect custom tracking tags from meta elements
     */
    private collectTrackingTags;
    /**
     * Try to detect Facebook Pixel ID from the page
     */
    private getFacebookPixelId;
    /**
     * Get the first visit timestamp
     */
    private getFirstVisitTimestamp;
}
//# sourceMappingURL=AttributionCollector.d.ts.map