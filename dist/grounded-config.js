  window.nextConfig = {
      // Profile configurations for Grounded Sheets
  profiles: {
    // Default profile doesn't need to be defined - SDK handles it automatically
    // Note: buy_1, buy_2, buy_3 profiles are not needed as they're just tier selections
    
    // Exit 10% Profile - Maps ALL packages (all tiers) to their Exit 10% variants
    "exit_10": {
      name: "Exit 10% Discount",
      description: "10% off all items across all tiers",
      packageMappings: {
        // Single quantity mappings (1-24 → 74-97)
        1: 78,   // Twin Obsidian Grey → Exit 10%
        2: 79,   // Twin Chateau Ivory → Exit 10%
        3: 82,   // Double Obsidian Grey → Exit 10%
        4: 83,   // Double Chateau Ivory → Exit 10%
        5: 86,   // Queen Obsidian Grey → Exit 10%
        6: 90,   // King Obsidian Grey → Exit 10%
        7: 87,   // Queen Chateau Ivory → Exit 10%
        8: 91,   // King Chateau Ivory → Exit 10%
        9: 80,   // Twin Scribe Blue → Exit 10%
        10: 84,  // Double Scribe Blue → Exit 10%
        11: 88,  // Queen Scribe Blue → Exit 10%
        12: 92,  // King Scribe Blue → Exit 10%
        13: 81,  // Twin Verdant Sage → Exit 10%
        14: 85,  // Double Verdant Sage → Exit 10%
        15: 89,  // Queen Verdant Sage → Exit 10%
        16: 93,  // King Verdant Sage → Exit 10%
        17: 74,  // Single Obsidian Grey → Exit 10%
        18: 94,  // Cali King Obsidian Grey → Exit 10%
        19: 75,  // Single Chateau Ivory → Exit 10%
        20: 95,  // Cali King Chateau Ivory → Exit 10%
        21: 76,  // Single Scribe Blue → Exit 10%
        22: 96,  // Cali King Scribe Blue → Exit 10%
        23: 77,  // Single Verdant Sage → Exit 10%
        24: 97,  // Cali King Verdant Sage → Exit 10%
        
        // 2-pack mappings (25-48 → 98-121)
        25: 98,  // Single Obsidian Grey 2-pack → Exit 10%
        26: 99,  // Single Chateau Ivory 2-pack → Exit 10%
        27: 100, // Single Scribe Blue 2-pack → Exit 10%
        28: 101, // Single Verdant Sage 2-pack → Exit 10%
        29: 102, // Twin Obsidian Grey 2-pack → Exit 10%
        30: 103, // Twin Chateau Ivory 2-pack → Exit 10%
        31: 104, // Twin Scribe Blue 2-pack → Exit 10%
        32: 105, // Twin Verdant Sage 2-pack → Exit 10%
        33: 106, // Double Obsidian Grey 2-pack → Exit 10%
        34: 107, // Double Chateau Ivory 2-pack → Exit 10%
        35: 108, // Double Scribe Blue 2-pack → Exit 10%
        36: 109, // Double Verdant Sage 2-pack → Exit 10%
        37: 110, // Queen Obsidian Grey 2-pack → Exit 10%
        38: 111, // Queen Chateau Ivory 2-pack → Exit 10%
        39: 112, // Queen Scribe Blue 2-pack → Exit 10%
        40: 113, // Queen Verdant Sage 2-pack → Exit 10%
        41: 114, // King Obsidian Grey 2-pack → Exit 10%
        42: 115, // King Chateau Ivory 2-pack → Exit 10%
        43: 116, // King Scribe Blue 2-pack → Exit 10%
        44: 117, // King Verdant Sage 2-pack → Exit 10%
        45: 118, // Cali King Obsidian Grey 2-pack → Exit 10%
        46: 119, // Cali King Chateau Ivory 2-pack → Exit 10%
        47: 120, // Cali King Scribe Blue 2-pack → Exit 10%
        48: 121, // Cali King Verdant Sage 2-pack → Exit 10%
        
        // 3-pack mappings (49-73 → 122-145) - Note: ID 55 is missing in original
        49: 122, // Single Obsidian Grey 3-pack → Exit 10%
        50: 123, // Single Chateau Ivory 3-pack → Exit 10%
        51: 124, // Single Scribe Blue 3-pack → Exit 10%
        52: 125, // Single Verdant Sage 3-pack → Exit 10%
        53: 126, // Twin Obsidian Grey 3-pack → Exit 10%
        54: 127, // Twin Chateau Ivory 3-pack → Exit 10%
        56: 128, // Twin Scribe Blue 3-pack → Exit 10%
        57: 129, // Twin Verdant Sage 3-pack → Exit 10%
        58: 130, // Double Obsidian Grey 3-pack → Exit 10%
        59: 131, // Double Chateau Ivory 3-pack → Exit 10%
        60: 132, // Double Scribe Blue 3-pack → Exit 10%
        61: 133, // Double Verdant Sage 3-pack → Exit 10%
        62: 134, // Queen Obsidian Grey 3-pack → Exit 10%
        63: 135, // Queen Chateau Ivory 3-pack → Exit 10%
        64: 136, // Queen Scribe Blue 3-pack → Exit 10%
        65: 137, // Queen Verdant Sage 3-pack → Exit 10%
        66: 138, // King Obsidian Grey 3-pack → Exit 10%
        67: 139, // King Chateau Ivory 3-pack → Exit 10%
        68: 140, // King Scribe Blue 3-pack → Exit 10%
        69: 141, // King Verdant Sage 3-pack → Exit 10%
        70: 142, // Cali King Obsidian Grey 3-pack → Exit 10%
        71: 143, // Cali King Chateau Ivory 3-pack → Exit 10%
        72: 144, // Cali King Scribe Blue 3-pack → Exit 10%
        73: 145  // Cali King Verdant Sage 3-pack → Exit 10%
      }
    }
  },
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

