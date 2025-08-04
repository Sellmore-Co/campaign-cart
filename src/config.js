window.nextConfig = {
    apiKey: "kLGpgEfCX3iUZG16hpI5zrCH9qxcOdahDY1im6ud",
    debug: true,
    paymentConfig: {
      expressCheckout: {
        enabled: true,
        // methods: {
        //   paypal: true,
        //   applePay: true,
        //   googlePay: true
        // },
        // Optional: Require form validation for express payment methods in combo form
        // By default (false), express payments skip all validation for quick checkout
        // Set to true if you need to collect customer information before express checkout
        requireValidation: false,
        requiredFields: ['email', 'fname', 'lname']
      }
    },
    addressConfig: {
      defaultCountry: "US",
      showCountries: ["US", "CA", "GB"],
      // dontShowStates: ["AS", "GU", "PR", "VI"]
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
  };