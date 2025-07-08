/**
 * Google Maps API Loader
 * Handles lazy loading of Google Maps API with Places library
 */

import { createLogger } from '@/utils/logger';
import { useConfigStore } from '@/stores/configStore';

const logger = createLogger('GoogleMapsLoader');

// Declare Google Maps types
declare global {
  interface Window {
    google: any;
  }
}

export class GoogleMapsLoader {
  private static instance: GoogleMapsLoader;
  private loaded = false;
  private loading = false;
  private loadPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): GoogleMapsLoader {
    if (!GoogleMapsLoader.instance) {
      GoogleMapsLoader.instance = new GoogleMapsLoader();
    }
    return GoogleMapsLoader.instance;
  }

  /**
   * Loads Google Maps API with Places library
   */
  public async loadGoogleMapsAPI(): Promise<void> {
    const configStore = useConfigStore.getState();
    const googleMapsConfig = configStore.googleMapsConfig;

    // Skip loading if autocomplete is disabled
    if (googleMapsConfig.enableAutocomplete === false) {
      logger.debug('Google Maps Autocomplete is disabled in configuration');
      return;
    }

    // Check if API key is available
    if (!googleMapsConfig.apiKey) {
      logger.warn('Google Maps API key not found. Autocomplete will be disabled.');
      return;
    }

    if (this.loaded) {
      logger.debug('Google Maps API already loaded');
      return;
    }

    if (this.loading) {
      logger.debug('Google Maps API loading in progress, waiting...');
      return this.loadPromise!;
    }

    this.loading = true;
    this.loadPromise = this.performLoad(googleMapsConfig);
    
    try {
      await this.loadPromise;
      this.loaded = true;
      logger.info('Google Maps API loaded successfully');
    } catch (error) {
      logger.error('Failed to load Google Maps API:', error);
      // Don't throw - autocomplete failure shouldn't break checkout
    } finally {
      this.loading = false;
    }
  }

  private async performLoad(config: any): Promise<void> {
    // Check if Google Maps is already loaded
    if (typeof window.google !== 'undefined' && typeof window.google.maps !== 'undefined') {
      logger.debug('Google Maps API already available');
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const regionParam = config.region ? `&region=${config.region}` : '';
      
      script.src = `https://maps.googleapis.com/maps/api/js?key=${config.apiKey}&libraries=places${regionParam}&loading=async`;
      script.async = true;
      script.defer = true;
      
      script.onload = async () => {
        logger.debug('Google Maps API script loaded successfully');
        
        // Wait a bit for the API to fully initialize
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts) {
          if (typeof window.google !== 'undefined' && 
              typeof window.google.maps !== 'undefined' && 
              typeof window.google.maps.places !== 'undefined' &&
              typeof window.google.maps.places.Autocomplete !== 'undefined') {
            logger.debug('Google Maps Places API fully initialized');
            resolve();
            return;
          }
          
          attempts++;
          logger.debug(`Waiting for Google Maps API to initialize... (attempt ${attempts}/${maxAttempts})`);
          await new Promise(r => setTimeout(r, 100));
        }
        
        // If we get here, something went wrong
        reject(new Error('Google Maps API not fully available after script load'));
      };
      
      script.onerror = () => {
        const error = new Error('Failed to load Google Maps API script');
        logger.error(error.message);
        reject(error);
      };

      // Check if script is already loading/loaded
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
      if (existingScript) {
        logger.debug('Google Maps script already in DOM, waiting for load...');
        
        // Check if already fully loaded
        if (typeof window.google !== 'undefined' && 
            typeof window.google.maps !== 'undefined' && 
            typeof window.google.maps.places !== 'undefined' &&
            typeof window.google.maps.places.Autocomplete !== 'undefined') {
          resolve();
          return;
        }
        
        // Wait for existing script to fully load
        const waitForExisting = async () => {
          let attempts = 0;
          const maxAttempts = 10;
          
          while (attempts < maxAttempts) {
            if (typeof window.google !== 'undefined' && 
                typeof window.google.maps !== 'undefined' && 
                typeof window.google.maps.places !== 'undefined' &&
                typeof window.google.maps.places.Autocomplete !== 'undefined') {
              logger.debug('Existing Google Maps script fully loaded');
              resolve();
              return;
            }
            
            attempts++;
            await new Promise(r => setTimeout(r, 100));
          }
          
          reject(new Error('Existing Google Maps script failed to fully initialize'));
        };
        
        waitForExisting();
        return;
      }

      document.head.appendChild(script);
    });
  }

  /**
   * Check if Google Maps API is loaded and ready
   */
  public isLoaded(): boolean {
    return this.loaded && typeof window.google !== 'undefined' && typeof window.google.maps !== 'undefined';
  }

  /**
   * Check if Google Maps API is currently loading
   */
  public isLoading(): boolean {
    return this.loading;
  }

  /**
   * Get Google Maps API reference (only if loaded)
   */
  public getGoogleMaps(): any | null {
    if (this.isLoaded()) {
      return window.google.maps;
    }
    return null;
  }

  /**
   * Check if Places API is available
   */
  public isPlacesAvailable(): boolean {
    return this.isLoaded() && 
           typeof window.google.maps.places !== 'undefined' &&
           typeof window.google.maps.places.Autocomplete !== 'undefined';
  }
}

// Export singleton instance
export const googleMapsLoader = GoogleMapsLoader.getInstance();