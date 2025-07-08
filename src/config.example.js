/**
 * Example production configuration for Campaign Cart SDK
 * Copy this file and customize for your environment
 */

// Production config example
window.nextConfig = {
  // Your Campaign Cart API key
  apiKey: "YOUR_API_KEY_HERE",
  
  // Set to false in production
  debug: false,
  
  // Payment configuration
  paymentConfig: {
    expressCheckout: {
      enabled: true,
      methods: {
        paypal: true,
        applePay: true,
        googlePay: true
      }
    }
  },
  
  // Address configuration
  addressConfig: {
    defaultCountry: "US",
    showCountries: ["US", "CA", "GB"],
    dontShowStates: ["AS", "GU", "PR", "VI"]
  },
  
  // Google Maps for address autocomplete
  googleMaps: {
    apiKey: "YOUR_GOOGLE_MAPS_API_KEY",
    region: "US",
    enableAutocomplete: true
  },
  
  // Analytics configuration
  analytics: {
    enabled: true,
    mode: 'auto',
    providers: {
      gtm: {
        enabled: true,
        settings: {
          containerId: "YOUR_GTM_CONTAINER_ID",
          dataLayerName: "dataLayer"
        }
      },
      facebook: {
        enabled: true,
        settings: {
          pixelId: "YOUR_FACEBOOK_PIXEL_ID"
        }
      }
    }
  },
  
  // Sentry error monitoring (optional but recommended)
  monitoring: {
    sentry: {
      enabled: true,
      dsn: "YOUR_SENTRY_DSN", // Get from https://sentry.io
      
      // Set your environment
      environment: "production", // or "staging"
      
      // Recommended production settings:
      // - 5-10% performance monitoring to control costs
      // - 0% general session replay (privacy)
      // - 10-25% replay on errors for debugging
      tracesSampleRate: 0.05, // 5% of transactions
      replaysSessionSampleRate: 0, // No general session recording
      replaysOnErrorSampleRate: 0.1, // 10% of error sessions
      
      // Optional: Custom error filtering
      beforeSend: (event) => {
        // Filter out known non-critical errors
        const ignoredErrors = [
          'ResizeObserver loop limit exceeded',
          'Non-Error promise rejection captured'
        ];
        
        const error = event.exception?.values?.[0];
        if (error && ignoredErrors.some(msg => error.value?.includes(msg))) {
          return null; // Don't send to Sentry
        }
        
        return event;
      }
    }
  }
};