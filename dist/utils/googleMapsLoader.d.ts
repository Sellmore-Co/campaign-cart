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
    loadGoogleMapsAPI(): Promise<void>;
    private performLoad;
    isLoaded(): boolean;
    isLoading(): boolean;
    getGoogleMaps(): any | null;
    isPlacesAvailable(): boolean;
}
export declare const googleMapsLoader: GoogleMapsLoader;
//# sourceMappingURL=googleMapsLoader.d.ts.map