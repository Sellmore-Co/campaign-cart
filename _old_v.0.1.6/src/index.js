/**
 * 29next Client - Checkout Focus
 * A streamlined JavaScript utility for connecting 29next campaigns with checkout functionality.
 * 
 * This is the main entry point for the library. It handles auto-initialization
 * and exports the TwentyNineNext class for manual initialization.
 */

import { TwentyNineNext } from './core/TwentyNineNext.js';

// Initialize the client
const initialize = () => {
  try {
    // Skip initialization if explicitly disabled
    if (document.querySelector('meta[name="os-disable-auto-init"]')) {
      console.log('29next Client: Auto-initialization disabled');
      return;
    }

    // Get configuration from meta tags
    const config = {
      apiKey: document.querySelector('meta[name="os-api-key"]')?.getAttribute('content') ?? null,
      campaignId: document.querySelector('meta[name="os-campaign-id"]')?.getAttribute('content') ?? null,
      debug: document.querySelector('meta[name="os-debug"]')?.getAttribute('content') === 'true',
      paypalClientId: document.querySelector('meta[name="os-paypal-client-id"]')?.getAttribute('content') ?? null,
    };
    
    // Log initialization attempt
    console.log('29next Client: Initializing with config', 
      JSON.stringify({
        apiKey: config.apiKey ? '✓ Set' : '✗ Not set',
        campaignId: config.campaignId ? '✓ Set' : '✗ Not set',
        debug: config.debug
      })
    );
    
    // Set up the on29NextReady array if it doesn't exist yet
    window.on29NextReady = Array.isArray(window.on29NextReady) ? window.on29NextReady : [];
    
    // Store the original callbacks
    const callbacks = [...window.on29NextReady];
    
    // Create the client instance
    window.twentyNineNext = new TwentyNineNext(config);
    
    // Process existing callbacks
    callbacks.forEach(callback => {
      window.twentyNineNext.onReady(callback);
    });
    
    // Replace the array with an object that uses onReady for future callbacks
    window.on29NextReady = {
      push: callback => window.twentyNineNext.onReady(callback)
    };
  } catch (error) {
    console.error('29next Client: Error during initialization', error);
  }
};

// Initialize now if the DOM is already loaded, otherwise wait for DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

export { TwentyNineNext };