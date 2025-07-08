/**
 * Google Maps API Loader
 * Handles lazy loading of Google Maps API with Places library
 */
declare global {
    interface Window {
        google: any;
    }
}
export declare class GoogleMapsLoader {
    private static instance;
    private loaded;
    private loading;
    private loadPromise;
    private constructor();
    static getInstance(): GoogleMapsLoader;
    /**
     * Loads Google Maps API with Places library
     */
    loadGoogleMapsAPI(): Promise<void>;
    private performLoad;
    /**
     * Check if Google Maps API is loaded and ready
     */
    isLoaded(): boolean;
    /**
     * Check if Google Maps API is currently loading
     */
    isLoading(): boolean;
    /**
     * Get Google Maps API reference (only if loaded)
     */
    getGoogleMaps(): any | null;
    /**
     * Check if Places API is available
     */
    isPlacesAvailable(): boolean;
}
export declare const googleMapsLoader: GoogleMapsLoader;
//# sourceMappingURL=googleMapsLoader.d.ts.map