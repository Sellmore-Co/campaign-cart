window.nextConfig = {
    apiKey: "kLGpgEfCX3iUZG16hpI5zrCH9qxcOdahDY1im6ud",
    debug: true,
    paymentConfig: {
      expressCheckout: {
        enabled: true,
        methods: {
          paypal: false,
          applePay: true,
          googlePay: true
        }
      }
    },
    addressConfig: {
      defaultCountry: "US",
      showCountries: ["US", "CA", "GB"],
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
        custom: {
          enabled: false,
          settings: {
            endpoint: "https://your-analytics.com/track",
            apiKey: "your-api-key"
          }
        }
      }
    },
    monitoring: {
      sentry: {
        enabled: true,
        dsn: "https://YOUR_SENTRY_DSN@sentry.io/YOUR_PROJECT_ID", // Replace with your actual Sentry DSN
        environment: "development",
        tracesSampleRate: 1.0, // 100% in dev, should be lower in production
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0
      }
    }
  };