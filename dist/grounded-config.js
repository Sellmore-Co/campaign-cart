  window.nextConfig = {
    // Profile configurations now embedded in grounded-footwear-refactored.js
    debug: false,
    paymentConfig: {
      expressCheckout: {
        enabled: true,
        methods: {
          paypal: false,
          applePay: true,
          googlePay: false
        }
      }
    },
    addressConfig: {
      defaultCountry: "US",
      showCountries: ["US"],
      dontShowStates: [
          "AS", "GU", "HI", "MP", "PR", "VI", 
          "UM-81", "UM-84", "UM-86", "UM-67", "UM-89", 
          "UM-71", "UM-76", "UM-95", "UM", "UM-79"
        ]
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
                enabled: false,
                settings: {
                    containerId: "XXX",
                    dataLayerName: "dataLayer"
                }
            },
            facebook: {
                enabled: true,
                settings: {
                    pixelId: "xxx"
                },
             	blockedEvents: ["purchase", "dl_purchase"]
            },
        }
    },
    utmTransfer: {
        enabled: true,                    // Enable/disable feature
        applyToExternalLinks: false,      // Apply to external domains
        excludedDomains: ['example.com'], // Domains to exclude
        paramsToCopy: []                  // Specific params (empty = all)
    }
  };

