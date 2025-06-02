# Multi-Currency Campaign System

This implementation provides a smart multi-currency system that automatically detects user's country and loads the appropriate campaign with correct pricing and currency symbols.

## ✨ Features

- **Smart Country Detection**: Automatically detects user's country via Cloudflare Worker `/location` endpoint
- **Optimal Performance**: Only 1 API call on page load (for detected country's campaign)
- **Dynamic Country Switching**: Seamless switching between countries with automatic cart updates
- **Package Translation**: Automatic mapping of package IDs between different country campaigns
- **Profile System**: Semantic product profiles that automatically handle country-specific package mappings
- **Currency Support**: USD, CAD, GBP, EUR, AUD with proper symbols
- **Event-Driven Updates**: All managers automatically refresh when country changes
- **Testing Support**: Force country with URL parameter `?forceCountry=CA`

## 🏗 Architecture

### Core Components

1. **CountryCampaignManager**: Handles country detection, campaign fetching, and package translation
2. **ProductProfileManager**: Manages semantic profiles with automatic country-aware package mapping
3. **Updated ApiClient**: Uses country-specific campaign IDs for API requests
4. **Enhanced Managers**: All managers listen for country changes and refresh data

### Flow

#### Initial Page Load
```
1. CountryCampaignManager calls /location endpoint
2. Detects country (e.g., "CA") 
3. Looks up CA campaign ID from configuration
4. Updates ApiClient to use CA campaign
5. Fetches ONLY CA campaign data
6. Shows CA prices immediately (C$89, C$139, C$54)
```

#### Country Switching
```
1. User selects US from dropdown
2. CountryCampaignManager.switchCountry('US')
3. Fetches US campaign if not cached
4. Translates cart package IDs using packageMaps
5. Updates all cart items with US prices
6. Triggers 'os:country.changed' event
7. All managers refresh with US data ($69, $109, $42)
```

## 📝 Configuration

Add this configuration to your HTML page **before** loading the 29next SDK:

```html
<script>
window.osConfig = {
  // Your existing configuration...
  
  // Multi-currency configuration
  countryCampaigns: {
    // Map countries to campaign IDs
    campaignIds: {
      'US': 'VKfNQPC2Sh9haYMJWZJbocoUnYRKvTcAjY6xaPzz',
      'CA': 'mvjijeLnHTVTePB5BDdTvBZs8kEJY97Oel69hbOo'
    },
    
    // Map external package IDs to internal campaign package IDs (for legacy package system)
    packageMaps: {
      'US': { '1': '1', '2': '2', '6': '6' },
      'CA': { '1': '1', '2': '2', '6': '6' }
    }
  },

  // Product profiles configuration (recommended for multi-currency)
  productProfiles: {
    'starter-kit': {
      name: 'Starter Facial Kit',
      description: 'Perfect introduction to our facial system',
      campaignMappings: {
        'US': { packageId: '1', quantity: 1 },
        'CA': { packageId: '1', quantity: 1 }
      },
      metadata: {
        category: 'kits',
        featured: true,
        tags: ['beginner', 'essential']
      }
    },
    'value-bundle': {
      name: '2-Month Value Bundle', 
      description: 'Best value for regular users',
      campaignMappings: {
        'US': { packageId: '2', quantity: 1 },
        'CA': { packageId: '2', quantity: 1 }
      },
      metadata: {
        category: 'bundles',
        featured: false,
        tags: ['value', 'popular']
      }
    },
    'premium-package': {
      name: '3-Month Premium Package',
      description: 'Maximum savings with bonus items',
      campaignMappings: {
        'US': { packageId: '6', quantity: 1 },
        'CA': { packageId: '6', quantity: 1 }
      },
      metadata: {
        category: 'bundles',
        featured: true,
        tags: ['premium', 'savings', 'bonus']
      }
    }
  }
};
</script>
```

## 🎯 Package vs Profile Approaches

### Legacy Package Approach
```html
<!-- Package-based (still supported) -->
<div data-os-action="toggle-item" data-os-package="1">Add to Cart</div>
<span data-os-package-price="total-sale" data-os-package-id="1">$69.99</span>
```

### Profile Approach (Recommended)
```html
<!-- Profile-based (recommended for multi-currency) -->
<div data-os-action="toggle-item" data-os-profile="starter-kit">Add to Cart</div>
<span data-os-profile-price="total-sale" data-os-profile-id="starter-kit">$69.99</span>
```

### Why Profiles for Multi-Currency?

| Feature | Package Approach | Profile Approach |
|---------|-----------------|------------------|
| **Setup Complexity** | Medium | Simple |
| **Country Switching** | Manual package mapping required | Automatic |
| **Maintenance** | Update HTML when package IDs change | Update config only |
| **Semantic Clarity** | Technical IDs (`data-os-package="1"`) | Meaningful names (`data-os-profile="starter-kit"`) |
| **Multi-Country** | Requires packageMaps configuration | Built-in country awareness |
| **Recommended For** | Single country or simple setups | Multi-country implementations |

## 🎯 Implementation

### 1. Country Selector HTML

```html
<select id="country-selector" onchange="switchCountry(this.value)">
  <option value="US">United States (USD)</option>
  <option value="CA">Canada (CAD)</option>
  <option value="GB">United Kingdom (GBP)</option>
  <option value="AU">Australia (AUD)</option>
</select>

<div data-currency class="currency-display">USD</div>
```

### 2. JavaScript Integration

```javascript
// Switch country function
function switchCountry(countryCode) {
  if (window.osCountryCampaignManager) {
    window.osCountryCampaignManager.switchCountry(countryCode)
      .then((result) => {
        console.log('Country switched successfully:', result);
        updateCountryUI(result.newCountry, result.campaignData);
      })
      .catch((error) => {
        console.error('Failed to switch country:', error);
        alert('Failed to switch country. Please try again.');
      });
  }
}

// Profile-based cart operations (recommended)
window.on29NextReady = window.on29NextReady || [];
window.on29NextReady.push(function(client) {
  // Add profile to cart (automatically handles country-specific packages)
  document.querySelectorAll('[data-action="add-to-cart"]').forEach(btn => {
    btn.addEventListener('click', async function() {
      const profileId = this.dataset.profileId; // e.g., "starter-kit"
      
      try {
        const result = await client.profiles.addToCart(profileId);
        if (result) {
          console.log(`Added ${profileId} to cart in current country`);
        }
      } catch (error) {
        console.error('Failed to add profile to cart:', error);
      }
    });
  });
});

// Update UI after country change
function updateCountryUI(country, campaignData) {
  // Update country selector
  const selector = document.getElementById('country-selector');
  if (selector) selector.value = country;
  
  // Update currency displays
  const currencyElements = document.querySelectorAll('[data-currency]');
  currencyElements.forEach(el => {
    el.textContent = campaignData.currency;
  });
  
  // Update any country-specific content
  document.body.setAttribute('data-country', country);
}

// Listen for country changes
document.addEventListener('os:country.changed', (event) => {
  const { country, campaignData, previousCountry } = event.detail;
  console.log(`Country changed from ${previousCountry} to ${country}`, campaignData);
  updateCountryUI(country, campaignData);
});

// Initialize UI when page loads
document.addEventListener('DOMContentLoaded', () => {
  // Wait for CountryCampaignManager to be ready
  const checkManager = () => {
    if (window.osCountryCampaignManager) {
      const currentCountry = window.osCountryCampaignManager.getCurrentCountry();
      const currentCampaign = window.osCountryCampaignManager.getCurrentCampaignData();
      
      if (currentCountry && currentCampaign) {
        updateCountryUI(currentCountry, currentCampaign);
      }
    } else {
      setTimeout(checkManager, 100);
    }
  };
  checkManager();
});
```

## 🧪 Testing

### URL Parameters
- `?forceCountry=CA` - Force Canadian pricing
- `?forceCountry=US` - Force US pricing
- `?forceCountry=GB` - Force UK pricing

### Console Testing
```javascript
// Country management
window.osCountryCampaignManager.getCurrentCountry(); // "CA"
window.osCountryCampaignManager.switchCountry('US');
window.osCountryCampaignManager.getCurrentCampaignData();
window.osCountryCampaignManager.getCachedCampaigns();
window.osCountryCampaignManager.getAvailableCountries();

// Profile management (when using profiles)
window.twentyNineNext.profiles.getProfile('starter-kit');
window.twentyNineNext.profiles.getPrice('starter-kit'); // Gets price in current country
window.twentyNineNext.profiles.getFormattedPrice('starter-kit'); // "C$89.00" or "$69.00"
window.twentyNineNext.profiles.isInCart('starter-kit');
window.twentyNineNext.profiles.addToCart('starter-kit');
window.twentyNineNext.profiles.removeFromCart('starter-kit');
```

### Network Monitoring
1. **Initial Load**: Should see only 1 `/campaigns/[ID]` call for detected country
2. **Country Switch**: Should see additional `/campaigns/[ID]` call only on first switch to new country
3. **Repeat Switch**: Should be instant (no API call) when switching back to cached country

## 🎨 Currency Symbols

The system automatically maps currencies to their symbols:

| Currency | Symbol | Example |
|----------|--------|---------|
| USD      | $      | $69.99  |
| CAD      | C$     | C$89.99 |
| GBP      | £      | £55.99  |
| EUR      | €      | €65.99  |
| AUD      | A$     | A$95.99 |

## 🔄 Package Translation

### Package Approach (Legacy)
The `packageMaps` configuration translates package IDs between campaigns:

```html
<!-- Example: Package "1" in HTML -->
<div data-os-package="1">Package 1</div>
<span data-os-package-price="total-sale" data-os-package-id="1">$69.99</span>

<!-- US Campaign: data-os-package="1" → Campaign package ref_id: 1 -->
<!-- CA Campaign: data-os-package="1" → Campaign package ref_id: 1 (same mapping) -->
<!-- But different campaigns = different prices ($69 vs C$89) -->
```

### Profile Approach (Recommended)
Profiles automatically handle country-specific package mapping:

```html
<!-- Example: Profile "starter-kit" in HTML -->
<div data-os-profile="starter-kit">Starter Kit</div>
<span data-os-profile-price="total-sale" data-os-profile-id="starter-kit">$69.99</span>

<!-- US: profile "starter-kit" → packageId: "1" in US campaign → $69.99 -->
<!-- CA: profile "starter-kit" → packageId: "1" in CA campaign → C$89.99 -->
<!-- Automatic country detection and package mapping! -->
```

## 📊 Performance Benefits

| Metric | Before | After |
|--------|--------|-------|
| Initial API calls | 6+ campaigns | 1 campaign |
| Page load | Wrong prices shown | Correct prices immediately |
| Country switch | Instant (pre-loaded) | ~500ms (on-demand) |
| Memory usage | All campaigns loaded | Only needed campaigns |

## 🎯 Events

### Listening for Country Changes
```javascript
document.addEventListener('os:country.changed', (event) => {
  const { country, campaignData, previousCountry, manager } = event.detail;
  
  console.log(`Country: ${previousCountry} → ${country}`);
  console.log('Campaign:', campaignData);
  
  // Your custom logic here
  updatePriceDisplays(campaignData);
  updateShippingRates(country);
  trackCountryChange(previousCountry, country);
});
```

### Manual Country Changes
```javascript
// Programmatically switch country
window.osCountryCampaignManager.switchCountry('CA')
  .then(result => {
    console.log('Switched to Canada:', result);
  })
  .catch(error => {
    console.error('Switch failed:', error);
  });
```

## 🛠 Integration with Existing Managers

All existing managers automatically support the multi-currency system:

- **StateManager**: Updates cart currency and recalculates totals
- **CartDisplayManager**: Refreshes with new currency symbols
- **SelectorManager**: Updates unit pricing with new campaign data
- **DisplayManager**: Refreshes display elements for packages and profiles
- **CartManager**: Handles package ID translation during country switches
- **ProductProfileManager**: Automatically maps profiles to country-specific packages
- **ToggleManager**: Supports both package and profile toggles with country awareness

## 🚨 Error Handling

The system includes comprehensive error handling:

- **Location API Failures**: Falls back to US
- **Campaign Not Found**: Uses fallback campaign
- **Network Errors**: Graceful degradation
- **Invalid Configurations**: Detailed logging

## 💡 Best Practices

1. **Configuration**: 
   - For packages: Include fallback mappings in `packageMaps`
   - For profiles: Configure `productProfiles` with all target countries
2. **Testing**: Test with `?forceCountry=XX` parameters
3. **UI**: Provide clear country selection interface
4. **Loading**: Show loading states during country switches
5. **Errors**: Handle country switch failures gracefully
6. **Profiles**: Use profiles for new implementations, especially multi-country sites

## 🔧 Troubleshooting

### Common Issues

1. **Country not switching**: Check `osConfig.countryCampaigns` configuration
2. **Wrong prices**: 
   - For packages: Verify campaign IDs and package mappings
   - For profiles: Check `productProfiles` configuration and `campaignMappings`
3. **Network errors**: Check `/location` endpoint availability
4. **Package not found**: 
   - For packages: Ensure package mappings are complete
   - For profiles: Verify profile exists in `productProfiles` with correct country mappings
5. **Profile pricing not working**: Ensure both `countryCampaigns` and `productProfiles` are configured

### Debug Mode

Enable debug logging to troubleshoot issues:
```html
<meta name="os-debug" content="true">
```

Or via URL parameter:
```
?debug=true
```

## 📈 Monitoring

Monitor the system with these console commands:

```javascript
// System status
console.log('Current Country:', window.osCountryCampaignManager.getCurrentCountry());
console.log('Available Countries:', window.osCountryCampaignManager.getAvailableCountries());
console.log('Cached Campaigns:', window.osCountryCampaignManager.getCachedCampaigns());

// Performance metrics
console.log('Manager Status:', window.osCountryCampaignManager.isInitialized);
console.log('Campaign Data:', window.osCountryCampaignManager.getCurrentCampaignData());
```

## 🎯 Complete Multi-Currency Example

Here's a complete example showing both package and profile approaches working together:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Multi-Currency Store</title>
  <script>
    // Configuration (must be before 29next SDK)
    window.osConfig = {
      countryCampaigns: {
        campaignIds: {
          'US': 'us-campaign-id',
          'CA': 'ca-campaign-id'
        },
        packageMaps: {
          'US': { '1': '1', '2': '2', '6': '6' },
          'CA': { '1': '1', '2': '2', '6': '6' }
        }
      },
      productProfiles: {
        'starter-kit': {
          name: 'Starter Kit',
          campaignMappings: {
            'US': { packageId: '1', quantity: 1 },
            'CA': { packageId: '1', quantity: 1 }
          }
        },
        'premium-bundle': {
          name: 'Premium Bundle',
          campaignMappings: {
            'US': { packageId: '6', quantity: 1 },
            'CA': { packageId: '6', quantity: 1 }
          }
        }
      }
    };
  </script>
</head>
<body>
  <!-- Country Selector -->
  <select id="country-selector" onchange="switchCountry(this.value)">
    <option value="US">United States (USD)</option>
    <option value="CA">Canada (CAD)</option>
  </select>

  <!-- Legacy Package Approach (still works) -->
  <div class="package-section">
    <h3>Legacy Package System</h3>
    <div data-os-action="toggle-item" data-os-package="1">
      Package 1: <span data-os-package-price="total-sale" data-os-package-id="1">$69.99</span>
    </div>
    <div data-os-action="toggle-item" data-os-package="6">
      Package 6: <span data-os-package-price="total-sale" data-os-package-id="6">$199.99</span>
    </div>
  </div>

  <!-- Profile Approach (recommended) -->
  <div class="profile-section">
    <h3>Profile System (Recommended)</h3>
    <div data-os-action="toggle-item" data-os-profile="starter-kit">
      Starter Kit: <span data-os-profile-price="total-sale" data-os-profile-id="starter-kit">$69.99</span>
    </div>
    <div data-os-action="toggle-item" data-os-profile="premium-bundle">
      Premium Bundle: <span data-os-profile-price="total-sale" data-os-profile-id="premium-bundle">$199.99</span>
    </div>
  </div>

  <!-- 29next SDK -->
  <script src="https://your-sdk-url/29next.js"></script>
  
  <script>
    function switchCountry(countryCode) {
      if (window.osCountryCampaignManager) {
        window.osCountryCampaignManager.switchCountry(countryCode)
          .then(() => console.log(`Switched to ${countryCode}`))
          .catch(error => console.error('Switch failed:', error));
      }
    }

    // Listen for country changes
    document.addEventListener('os:country.changed', (event) => {
      const { country, campaignData } = event.detail;
      console.log(`Now showing ${campaignData.currency} prices for ${country}`);
      
      // Update country selector
      document.getElementById('country-selector').value = country;
    });
  </script>
</body>
</html>
``` 