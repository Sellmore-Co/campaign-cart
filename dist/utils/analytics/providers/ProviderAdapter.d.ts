import { DataLayerEvent } from '../types';
/**
 * Base adapter class for analytics providers
 */
export declare abstract class ProviderAdapter {
    protected name: string;
    protected enabled: boolean;
    constructor(name: string);
    /**
     * Enable or disable the adapter
     */
    setEnabled(enabled: boolean): void;
    /**
     * Check if the adapter is enabled
     */
    isEnabled(): boolean;
    /**
     * Track event - called by DataLayerManager
     */
    trackEvent(event: DataLayerEvent): void;
    /**
     * Send event to the provider
     */
    abstract sendEvent(event: DataLayerEvent): void;
    /**
     * Transform event data to provider-specific format
     */
    protected transformEvent(event: DataLayerEvent): any;
    /**
     * Log debug information
     */
    protected debug(message: string, data?: any): void;
    /**
     * Check if we're in a browser environment
     */
    protected isBrowser(): boolean;
    /**
     * Safe property access helper
     */
    protected getNestedProperty(obj: any, path: string): any;
    /**
     * Format currency values
     */
    protected formatCurrency(value: number): string;
    /**
     * Extract common ecommerce properties
     */
    protected extractEcommerceData(event: DataLayerEvent): any;
}
//# sourceMappingURL=ProviderAdapter.d.ts.map