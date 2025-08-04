// Development config module with HMR support

// This config is ONLY loaded in debug mode (?debug=true) via loader.js
// In production, merchants provide their own window.nextConfig

const config = {
    apiKey: "kLGpgEfCX3iUZG16hpI5zrCH9qxcOdahDY1im6ud",
    debug: true, // Always true since this file only loads in debug mode
    paymentConfig: {
      expressCheckout: {
        // enabled: false,         DEPRECATED: FETCHED FROM CAMPAIGN API
        // methods: {              DEPRECATED: FETCHED FROM CAMPAIGN API
        //   paypal: true,         DEPRECATED: FETCHED FROM CAMPAIGN API
        //   applePay: true,       DEPRECATED: FETCHED FROM CAMPAIGN API
        //   googlePay: true       DEPRECATED: FETCHED FROM CAMPAIGN API
        // },                      DEPRECATED: FETCHED FROM CAMPAIGN API
        // Optional: Require form validation for express payment methods in combo form
        // By default (false), express payments skip all validation for quick checkout
        // Set to true if you need to collect customer information before express checkout
        requireValidation: true,
        requiredFields: ['email', 'fname', 'lname']
      }
    },
    addressConfig: {
      defaultCountry: "US",
      showCountries: ["US", "CA", "GB", "BR"],
      dontShowStates: ["AS", "GU", "PR", "VI"]
    },
    discounts: {
      SAVE10: {
        code: "SAVE10",
        type: "percentage",
        value: 10,
        scope: "order",
        description: "10% off entire order",
        combinable: true
      }
    },
    googleMaps: {
      apiKey: "AIzaSyBmrv1QRE41P9FhFOTwUhRMGg6LcFH1ehs",
      region: "US",
      enableAutocomplete: true
    },
    tracking: "auto",
    analytics: {
      enabled: true,
      mode: 'auto', // auto | manual | disabled
      providers: {
        nextCampaign: {
          enabled: true
        },
        gtm: {
          enabled: true,
          settings: {
            containerId: "GTM-MCGB3JBM",
            dataLayerName: "dataLayer"
          }
        },
        facebook: {
          enabled: true,
          settings: {
            pixelId: "286865669194576"
          }
        },
        rudderstack: {
          enabled: true,
          settings: {
            // RudderStack configuration is handled by the RudderStack SDK itself
            // This just enables the adapter
          }
        },
        custom: {
          enabled: false,
          settings: {
            endpoint: "https://your-analytics.com/track",
            apiKey: "your-api-key"
          }
        }
      }
    },
    // Error monitoring removed - add externally via HTML/scripts if needed,
    utmTransfer: {
      enabled: true,
      applyToExternalLinks: false,
      debug: true,
      // excludedDomains: ['example.com', 'test.org'],
      // paramsToCopy: ['utm_source', 'utm_medium']
    }
};

// Set on window for compatibility
(window as any).nextConfig = config;

// Enable HMR
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log('[Config] Hot update received');
    window.location.reload();
  });
}

export default config;