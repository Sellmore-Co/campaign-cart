  window.nextConfig = {
      // Profile configurations for Grounded Sheets
  profiles: {
    // 1-Pack Profile - Maps to itself (identity mapping) to maintain consistent display
    "1_pack": {
      name: "1-Pack Single",
      description: "Single sheet at regular price",
      packageMappings: {
        // Identity mappings - each package maps to itself
        1: 1,   // Twin Obsidian Grey
        2: 2,   // Twin Chateau Ivory
        3: 3,   // Double Obsidian Grey
        4: 4,   // Double Chateau Ivory
        5: 5,   // Queen Obsidian Grey
        6: 6,   // King Obsidian Grey
        7: 7,   // Queen Chateau Ivory
        8: 8,   // King Chateau Ivory
        9: 9,   // Twin Scribe Blue
        10: 10, // Double Scribe Blue
        11: 11, // Queen Scribe Blue
        12: 12, // King Scribe Blue
        13: 13, // Twin Verdant Sage
        14: 14, // Double Verdant Sage
        15: 15, // Queen Verdant Sage
        16: 16, // King Verdant Sage
        17: 17, // Single Obsidian Grey
        18: 18, // Cali King Obsidian Grey
        19: 19, // Single Chateau Ivory
        20: 20, // Cali King Chateau Ivory
        21: 21, // Single Scribe Blue
        22: 22, // Cali King Scribe Blue
        23: 23, // Single Verdant Sage
        24: 24  // Cali King Verdant Sage
      }
    },

    // 2-Pack Profile - Maps single quantity items to 2-pack variants
    "2_pack": {
      name: "2-Pack Bundle",
      description: "Bundle of 2 sheets at a discounted price",
      packageMappings: {
        // Single → 2-pack mappings
        1: 29,   // Twin Obsidian Grey → 2-pack
        2: 30,   // Twin Chateau Ivory → 2-pack
        3: 33,   // Double Obsidian Grey → 2-pack
        4: 34,   // Double Chateau Ivory → 2-pack
        5: 37,   // Queen Obsidian Grey → 2-pack
        6: 41,   // King Obsidian Grey → 2-pack
        7: 38,   // Queen Chateau Ivory → 2-pack
        8: 42,   // King Chateau Ivory → 2-pack
        9: 31,   // Twin Scribe Blue → 2-pack
        10: 35,  // Double Scribe Blue → 2-pack
        11: 39,  // Queen Scribe Blue → 2-pack
        12: 43,  // King Scribe Blue → 2-pack
        13: 32,  // Twin Verdant Sage → 2-pack
        14: 36,  // Double Verdant Sage → 2-pack
        15: 40,  // Queen Verdant Sage → 2-pack
        16: 44,  // King Verdant Sage → 2-pack
        17: 25,  // Single Obsidian Grey → 2-pack
        18: 45,  // Cali King Obsidian Grey → 2-pack
        19: 26,  // Single Chateau Ivory → 2-pack
        20: 46,  // Cali King Chateau Ivory → 2-pack
        21: 27,  // Single Scribe Blue → 2-pack
        22: 47,  // Cali King Scribe Blue → 2-pack
        23: 28,  // Single Verdant Sage → 2-pack
        24: 48,  // Cali King Verdant Sage → 2-pack
      }
    },

    // 3-Pack Profile - Maps single quantity items to 3-pack variants  
    "3_pack": {
      name: "3-Pack Bundle",
      description: "Bundle of 3 sheets at a discounted price",
      packageMappings: {
        // Single → 3-pack mappings
        1: 53,   // Twin Obsidian Grey → 3-pack
        2: 54,   // Twin Chateau Ivory → 3-pack
        3: 58,   // Double Obsidian Grey → 3-pack
        4: 59,   // Double Chateau Ivory → 3-pack
        5: 62,   // Queen Obsidian Grey → 3-pack
        6: 66,   // King Obsidian Grey → 3-pack
        7: 63,   // Queen Chateau Ivory → 3-pack
        8: 67,   // King Chateau Ivory → 3-pack
        9: 56,   // Twin Scribe Blue → 3-pack (note: 55 is missing)
        10: 60,  // Double Scribe Blue → 3-pack
        11: 64,  // Queen Scribe Blue → 3-pack
        12: 68,  // King Scribe Blue → 3-pack
        13: 57,  // Twin Verdant Sage → 3-pack
        14: 61,  // Double Verdant Sage → 3-pack
        15: 65,  // Queen Verdant Sage → 3-pack
        16: 69,  // King Verdant Sage → 3-pack
        17: 49,  // Single Obsidian Grey → 3-pack
        18: 70,  // Cali King Obsidian Grey → 3-pack
        19: 50,  // Single Chateau Ivory → 3-pack
        20: 71,  // Cali King Chateau Ivory → 3-pack
        21: 51,  // Single Scribe Blue → 3-pack
        22: 72,  // Cali King Scribe Blue → 3-pack
        23: 52,  // Single Verdant Sage → 3-pack
        24: 73,  // Cali King Verdant Sage → 3-pack
      }
    },
    
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
    },

    // Exit 10% + 1-Pack Profile - Single items with 10% discount
    "exit_10_1pack": {
      name: "Exit 10% Discount - 1 Pack",
      description: "10% off single items",
      packageMappings: {
        // Maps single items to Exit 10% single variants (same as exit_10 first section)
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
        24: 97   // Cali King Verdant Sage → Exit 10%
      }
    },

    // Exit 10% + 2-Pack Profile - Combines 2-pack bundle with 10% discount
    "exit_10_2pack": {
      name: "Exit 10% Discount - 2 Pack",
      description: "10% off 2-pack bundles",
      packageMappings: {
        // Maps single items directly to Exit 10% 2-pack variants
        1: 102,  // Twin Obsidian Grey → Exit 10% 2-pack
        2: 103,  // Twin Chateau Ivory → Exit 10% 2-pack
        3: 106,  // Double Obsidian Grey → Exit 10% 2-pack
        4: 107,  // Double Chateau Ivory → Exit 10% 2-pack
        5: 110,  // Queen Obsidian Grey → Exit 10% 2-pack
        6: 114,  // King Obsidian Grey → Exit 10% 2-pack
        7: 111,  // Queen Chateau Ivory → Exit 10% 2-pack
        8: 115,  // King Chateau Ivory → Exit 10% 2-pack
        9: 104,  // Twin Scribe Blue → Exit 10% 2-pack
        10: 108, // Double Scribe Blue → Exit 10% 2-pack
        11: 112, // Queen Scribe Blue → Exit 10% 2-pack
        12: 116, // King Scribe Blue → Exit 10% 2-pack
        13: 105, // Twin Verdant Sage → Exit 10% 2-pack
        14: 109, // Double Verdant Sage → Exit 10% 2-pack
        15: 113, // Queen Verdant Sage → Exit 10% 2-pack
        16: 117, // King Verdant Sage → Exit 10% 2-pack
        17: 98,  // Single Obsidian Grey → Exit 10% 2-pack
        18: 118, // Cali King Obsidian Grey → Exit 10% 2-pack
        19: 99,  // Single Chateau Ivory → Exit 10% 2-pack
        20: 119, // Cali King Chateau Ivory → Exit 10% 2-pack
        21: 100, // Single Scribe Blue → Exit 10% 2-pack
        22: 120, // Cali King Scribe Blue → Exit 10% 2-pack
        23: 101, // Single Verdant Sage → Exit 10% 2-pack
        24: 121, // Cali King Verdant Sage → Exit 10% 2-pack
        
        // Also map 2-pack to Exit 10% 2-pack (if already selected)
        25: 98,  // 2-pack Single Obsidian Grey → Exit 10% 2-pack
        26: 99,  // 2-pack Single Chateau Ivory → Exit 10% 2-pack
        27: 100, // 2-pack Single Scribe Blue → Exit 10% 2-pack
        28: 101, // 2-pack Single Verdant Sage → Exit 10% 2-pack
        29: 102, // 2-pack Twin Obsidian Grey → Exit 10% 2-pack
        30: 103, // 2-pack Twin Chateau Ivory → Exit 10% 2-pack
        31: 104, // 2-pack Twin Scribe Blue → Exit 10% 2-pack
        32: 105, // 2-pack Twin Verdant Sage → Exit 10% 2-pack
        33: 106, // 2-pack Double Obsidian Grey → Exit 10% 2-pack
        34: 107, // 2-pack Double Chateau Ivory → Exit 10% 2-pack
        35: 108, // 2-pack Double Scribe Blue → Exit 10% 2-pack
        36: 109, // 2-pack Double Verdant Sage → Exit 10% 2-pack
        37: 110, // 2-pack Queen Obsidian Grey → Exit 10% 2-pack
        38: 111, // 2-pack Queen Chateau Ivory → Exit 10% 2-pack
        39: 112, // 2-pack Queen Scribe Blue → Exit 10% 2-pack
        40: 113, // 2-pack Queen Verdant Sage → Exit 10% 2-pack
        41: 114, // 2-pack King Obsidian Grey → Exit 10% 2-pack
        42: 115, // 2-pack King Chateau Ivory → Exit 10% 2-pack
        43: 116, // 2-pack King Scribe Blue → Exit 10% 2-pack
        44: 117, // 2-pack King Verdant Sage → Exit 10% 2-pack
        45: 118, // 2-pack Cali King Obsidian Grey → Exit 10% 2-pack
        46: 119, // 2-pack Cali King Chateau Ivory → Exit 10% 2-pack
        47: 120, // 2-pack Cali King Scribe Blue → Exit 10% 2-pack
        48: 121  // 2-pack Cali King Verdant Sage → Exit 10% 2-pack
      }
    },

    // Exit 10% + 3-Pack Profile - Combines 3-pack bundle with 10% discount
    "exit_10_3pack": {
      name: "Exit 10% Discount - 3 Pack",
      description: "10% off 3-pack bundles",
      packageMappings: {
        // Maps single items directly to Exit 10% 3-pack variants
        1: 126,  // Twin Obsidian Grey → Exit 10% 3-pack
        2: 127,  // Twin Chateau Ivory → Exit 10% 3-pack
        3: 130,  // Double Obsidian Grey → Exit 10% 3-pack
        4: 131,  // Double Chateau Ivory → Exit 10% 3-pack
        5: 134,  // Queen Obsidian Grey → Exit 10% 3-pack
        6: 138,  // King Obsidian Grey → Exit 10% 3-pack
        7: 135,  // Queen Chateau Ivory → Exit 10% 3-pack
        8: 139,  // King Chateau Ivory → Exit 10% 3-pack
        9: 128,  // Twin Scribe Blue → Exit 10% 3-pack
        10: 132, // Double Scribe Blue → Exit 10% 3-pack
        11: 136, // Queen Scribe Blue → Exit 10% 3-pack
        12: 140, // King Scribe Blue → Exit 10% 3-pack
        13: 129, // Twin Verdant Sage → Exit 10% 3-pack
        14: 133, // Double Verdant Sage → Exit 10% 3-pack
        15: 137, // Queen Verdant Sage → Exit 10% 3-pack
        16: 141, // King Verdant Sage → Exit 10% 3-pack
        17: 122, // Single Obsidian Grey → Exit 10% 3-pack
        18: 142, // Cali King Obsidian Grey → Exit 10% 3-pack
        19: 123, // Single Chateau Ivory → Exit 10% 3-pack
        20: 143, // Cali King Chateau Ivory → Exit 10% 3-pack
        21: 124, // Single Scribe Blue → Exit 10% 3-pack
        22: 144, // Cali King Scribe Blue → Exit 10% 3-pack
        23: 125, // Single Verdant Sage → Exit 10% 3-pack
        24: 145, // Cali King Verdant Sage → Exit 10% 3-pack
        
        // Also map 3-pack to Exit 10% 3-pack (if already selected)
        49: 122, // 3-pack Single Obsidian Grey → Exit 10% 3-pack
        50: 123, // 3-pack Single Chateau Ivory → Exit 10% 3-pack
        51: 124, // 3-pack Single Scribe Blue → Exit 10% 3-pack
        52: 125, // 3-pack Single Verdant Sage → Exit 10% 3-pack
        53: 126, // 3-pack Twin Obsidian Grey → Exit 10% 3-pack
        54: 127, // 3-pack Twin Chateau Ivory → Exit 10% 3-pack
        56: 128, // 3-pack Twin Scribe Blue → Exit 10% 3-pack
        57: 129, // 3-pack Twin Verdant Sage → Exit 10% 3-pack
        58: 130, // 3-pack Double Obsidian Grey → Exit 10% 3-pack
        59: 131, // 3-pack Double Chateau Ivory → Exit 10% 3-pack
        60: 132, // 3-pack Double Scribe Blue → Exit 10% 3-pack
        61: 133, // 3-pack Double Verdant Sage → Exit 10% 3-pack
        62: 134, // 3-pack Queen Obsidian Grey → Exit 10% 3-pack
        63: 135, // 3-pack Queen Chateau Ivory → Exit 10% 3-pack
        64: 136, // 3-pack Queen Scribe Blue → Exit 10% 3-pack
        65: 137, // 3-pack Queen Verdant Sage → Exit 10% 3-pack
        66: 138, // 3-pack King Obsidian Grey → Exit 10% 3-pack
        67: 139, // 3-pack King Chateau Ivory → Exit 10% 3-pack
        68: 140, // 3-pack King Scribe Blue → Exit 10% 3-pack
        69: 141, // 3-pack King Verdant Sage → Exit 10% 3-pack
        70: 142, // 3-pack Cali King Obsidian Grey → Exit 10% 3-pack
        71: 143, // 3-pack Cali King Chateau Ivory → Exit 10% 3-pack
        72: 144, // 3-pack Cali King Scribe Blue → Exit 10% 3-pack
        73: 145  // 3-pack Cali King Verdant Sage → Exit 10% 3-pack
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

