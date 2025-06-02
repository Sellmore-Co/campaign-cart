# Multi-Currency Troubleshooting Guide

## Issue 1: Package Pricing Not Showing with Country Switching

### Problem
When using `?forceCountry=CA`, pricing elements with `data-os-package-id="12"` are not displaying values.

### Root Cause
The DisplayManager wasn't translating package IDs like the ToggleManager does. When you switch countries, package "12" in your HTML needs to be translated to whatever package ID exists in the CA campaign.

### Solution ✅
Updated DisplayManager to translate package IDs before looking up pricing data.

### How to Debug

1. **Check your country campaign configuration:**
```javascript
// In your osConfig, ensure you have mappings for package "12"
window.osConfig = {
  countryCampaigns: {
    campaignIds: {
      'US': 'your-us-campaign-id',
      'CA': 'your-ca-campaign-id'
    },
    packageMaps: {
      'US': { '12': '12' },  // US: package 12 maps to package 12
      'CA': { '12': '1' }    // CA: package 12 maps to package 1 (or whatever exists in CA campaign)
    }
  }
};
```

2. **Check browser console for translation logs:**
```
DisplayManager: Translated package ID: 12 -> 1 for country CA
DisplayManager: Updated pricing: Package 12 -> 1, Type total-sale, Value: C$65.00
```

3. **Verify the CA campaign has the mapped package:**
```javascript
// In browser console
window.osClient.campaignData.packages.forEach(pkg => {
  console.log(`Package ref_id: ${pkg.ref_id}, name: ${pkg.name}, price: ${pkg.price}`);
});
```

## Issue 2: Checkout Script Not Working with Country Switching

### Problem
Original script looks for package ref_id === 12 directly in campaign data, but after country switching, the CA campaign might not have package "12".

### Root Cause
```javascript
// ❌ This doesn't work with country switching
const selectedPackage = campaignData.packages.find(pkg => pkg.ref_id === 12);
```

### Solution ✅
Use the fixed script that translates package IDs:

```javascript
// ✅ This works with country switching
// 1. Translate package ID based on current country
const originalPackageId = "12";
let targetPackageId = originalPackageId;

if (window.osCountryCampaignManager) {
  const currentCountry = window.osCountryCampaignManager.getCurrentCountry();
  const packageMaps = window.osConfig?.countryCampaigns?.packageMaps?.[currentCountry];
  
  if (packageMaps && packageMaps[originalPackageId] !== undefined) {
    targetPackageId = packageMaps[originalPackageId].toString();
  }
}

// 2. Find the translated package in current campaign
const selectedPackage = campaignData.packages.find(pkg => 
  pkg.ref_id?.toString() === targetPackageId || 
  pkg.id?.toString() === targetPackageId
);
```

## Common Issues & Solutions

### Issue: Pricing shows "$0.00" or empty

**Possible Causes:**
1. Package not found in campaign data
2. Package mapping not configured
3. Wrong price field names

**Debug Steps:**
```javascript
// Check if package exists
console.log('Available packages:', window.osClient.campaignData.packages);

// Check country and mapping
console.log('Current country:', window.osCountryCampaignManager?.getCurrentCountry());
console.log('Package maps:', window.osConfig?.countryCampaigns?.packageMaps);

// Check specific package
const pkg = window.osClient.campaignData.packages.find(p => p.ref_id === "1");
console.log('Package data:', pkg);
```

### Issue: Wrong currency symbol

**Solution:**
Ensure your campaign data includes currency information:
```javascript
// Campaign should have currency field
{
  "currency": "CAD",
  "packages": [...],
  ...
}
```

### Issue: Package not found after country switch

**Check:**
1. Does the target campaign have the mapped package?
2. Is the package mapping configured correctly?
3. Are the ref_ids matching exactly?

```javascript
// Debug package mapping
const originalId = "12";
const country = window.osCountryCampaignManager.getCurrentCountry();
const mappedId = window.osConfig.countryCampaigns.packageMaps[country]?.[originalId];
console.log(`${originalId} → ${mappedId} for ${country}`);
```

## Testing Checklist

### 1. Package Pricing Display
- [ ] Pricing shows correctly on default country
- [ ] Pricing updates when switching countries via `?forceCountry=XX`
- [ ] Currency symbols change correctly
- [ ] Package mappings work (package 12 → mapped package in new country)

### 2. Checkout Functionality  
- [ ] Checkout button works on default country
- [ ] Checkout button works after country switching
- [ ] Correct package is added to cart (mapped package, not original)
- [ ] Cart displays correct prices and currency

### 3. Console Debugging
```javascript
// Test package pricing translation
window.osClient.display.refreshPackagePricing();

// Test country switching
window.osCountryCampaignManager.switchCountry('CA');

// Test checkout script
// (Click checkout button and check console logs)
```

## Expected Behavior

### With `?forceCountry=CA`:
1. Page loads with CA campaign data
2. Package "12" in HTML gets translated to mapped package (e.g., "1") 
3. Pricing elements show CA prices with C$ currency
4. Checkout script uses translated package ID
5. Cart contains correct CA package with CA pricing

### Console Logs Should Show:
```
CountryCampaignManager: Country detected/forced: CA
DisplayManager: Translated package ID: 12 -> 1 for country CA  
DisplayManager: Updated pricing: Package 12 -> 1, Type total-sale, Value: C$65.00
Checkout: Package translated: 12 → 1 for country CA
``` 