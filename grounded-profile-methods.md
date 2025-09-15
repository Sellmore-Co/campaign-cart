# Profile Feature Methods Used in grounded-footwear.js

## Overview
This document lists all profile-related methods and functionality used in the `public/grounded-footwear.js` file for the Grounded Sheets tier selection system.

## SDK Methods Used

### 1. `window.next.getActiveProfile()`
- **Location**: Line 1024 in `refreshPricesFromCampaign()`
- **Purpose**: Attempts to get the currently active profile ID from the SDK
- **Usage**:
```javascript
if (typeof window.next !== 'undefined' && window.next.getActiveProfile) {
  try {
    activeProfileId = window.next.getActiveProfile();
    console.log(`[Grounded] Active profile from SDK: ${activeProfileId}`);
  } catch (error) {
    console.warn('[Grounded] Could not get profile from SDK:', error);
  }
}
```
- **Note**: This method was previously causing errors due to incorrect `require` statements, now fixed

### 2. `window.next.on('profile:applied', callback)`
- **Location**: Line 896 in `setupProfileListeners()`
- **Purpose**: Listens for profile application events via SDK
- **Usage**:
```javascript
window.next.on('profile:applied', (data) => {
  console.log('[Grounded] Profile applied event received via SDK:', data);
  setTimeout(() => {
    console.log('[Grounded] Refreshing prices after profile apply (with delay)');
    this.refreshPricesFromCampaign();
  }, 100);
});
```

### 3. `window.next.on('profile:reverted', callback)`
- **Location**: Line 905 in `setupProfileListeners()`
- **Purpose**: Listens for profile revert events via SDK
- **Usage**:
```javascript
window.next.on('profile:reverted', (data) => {
  console.log('[Grounded] Profile reverted event received via SDK:', data);
  setTimeout(() => {
    console.log('[Grounded] Refreshing prices after profile revert (with delay)');
    this.refreshPricesFromCampaign();
  }, 100);
});
```

## Internal Methods

### 1. `setupProfileListeners()`
- **Location**: Line 885
- **Purpose**: Sets up all profile-related event listeners
- **Functionality**:
  - Sets up SDK event listeners for profile changes
  - Listens for DOM events (backward compatibility)
  - Monitors storage changes for cross-tab sync
  - Implements polling fallback to detect profile changes
  - Called during initialization

### 2. `getCurrentProfile()`
- **Location**: Line 965
- **Purpose**: Gets the current active profile from sessionStorage
- **Usage**:
```javascript
getCurrentProfile() {
  try {
    const profileStoreData = sessionStorage.getItem('next-profile-store');
    if (profileStoreData) {
      const profileStore = JSON.parse(profileStoreData);
      return profileStore?.state?.activeProfileId || null;
    }
  } catch (error) {
    // Silent fail
  }
  return null;
}
```

### 3. `refreshPricesFromCampaign()`
- **Location**: Line 1011
- **Purpose**: Core method that refreshes all variant prices based on active profile
- **Functionality**:
  - Retrieves campaign prices from cache
  - Checks for active profile (SDK first, then sessionStorage)
  - Applies profile mappings to variant prices
  - Updates all dropdowns with new prices
  - Updates slot pricing displays
- **Profile-specific logic**:
  - Maps variant IDs to profile-specific package IDs
  - Uses `window.nextConfig.profiles[activeProfileId].packageMappings`
  - Falls back to default prices if no profile is active

## Storage Access

### 1. SessionStorage Key: `next-profile-store`
- **Usage**: Throughout the file for profile state persistence
- **Structure**:
```javascript
{
  state: {
    activeProfileId: "exit_10" | "default" | null,
    previousProfileId: string | null,
    // ... other profile state
  }
}
```

### 2. Profile Configuration: `window.nextConfig.profiles`
- **Location**: Referenced in `refreshPricesFromCampaign()`
- **Purpose**: Contains profile definitions and package mappings
- **Structure**:
```javascript
window.nextConfig.profiles = {
  "exit_10": {
    name: "Exit 10% Discount",
    description: "10% off all items",
    packageMappings: {
      1: 78,  // Original variant ID → Mapped package ID
      2: 79,
      // ... etc
    }
  }
}
```

## Event Listeners

### 1. DOM Event: `profile:applied`
- **Location**: Line 936
- **Purpose**: Backward compatibility for profile application events
```javascript
document.addEventListener('profile:applied', (event) => {
  console.log('[Grounded] Profile applied event received via DOM:', event.detail);
  this.refreshPricesFromCampaign();
});
```

### 2. DOM Event: `profile:reverted`
- **Location**: Line 941
- **Purpose**: Backward compatibility for profile revert events
```javascript
document.addEventListener('profile:reverted', () => {
  console.log('[Grounded] Profile reverted event received via DOM');
  this.refreshPricesFromCampaign();
});
```

### 3. Storage Event: `storage`
- **Location**: Line 947
- **Purpose**: Cross-tab synchronization of profile changes
```javascript
window.addEventListener('storage', (event) => {
  if (event.key === 'next-profile-store') {
    console.log('[Grounded] Profile store changed via storage');
    this.refreshPricesFromCampaign();
  }
});
```

### 4. SDK Event: `next:initialized`
- **Location**: Lines 928, 1002
- **Purpose**: Sets up profile listeners after SDK initialization
```javascript
window.addEventListener('next:initialized', () => {
  console.log('[Grounded] SDK initialized event received, setting up profile listeners');
  setupSDKListeners();
  this.refreshPricesFromCampaign();
});
```

## Polling Mechanism

### Profile Change Detection Interval
- **Location**: Line 955
- **Purpose**: Fallback mechanism to detect profile changes
- **Interval**: 500ms
```javascript
this.profileCheckInterval = setInterval(() => {
  const currentProfile = this.getCurrentProfile();
  if (currentProfile !== this.lastKnownProfile) {
    console.log(`[Grounded] Profile changed from ${this.lastKnownProfile} to ${currentProfile}`);
    this.lastKnownProfile = currentProfile;
    this.refreshPricesFromCampaign();
  }
}, 500);
```

## Profile-Aware Price Mapping Logic

### Package Mapping Process
- **Location**: Lines 1071-1116 in `refreshPricesFromCampaign()`
- **Process**:
  1. Iterate through all original variants
  2. Check if active profile has mapping for variant ID
  3. If mapped, get prices from mapped package ID
  4. If not mapped, use original package prices
  5. Build profile-aware price map
  6. Update all variants with new prices

```javascript
if (profileMappings && profileMappings[variant.id]) {
  const mappedPackageId = profileMappings[variant.id];
  const mappedPrices = campaignPrices[mappedPackageId];
  
  if (mappedPrices) {
    profileAwarePrices[variant.id] = {
      salePrice: mappedPrices.salePrice,
      regularPrice: mappedPrices.regularPrice
    };
  }
}
```

## Integration Points

### 1. SDK Initialization Wait
- **Method**: `initializeWithSDK()` (Line 978)
- **Purpose**: Ensures SDK is ready before accessing profile features
- **Max wait time**: 5 seconds (50 attempts × 100ms)

### 2. Price Update Triggers
Profile-aware price updates are triggered by:
- SDK initialization completion
- Profile application events
- Profile revert events
- Storage changes (cross-tab sync)
- Polling detection of profile changes

### 3. UI Updates After Profile Change
When a profile change is detected:
1. `refreshPricesFromCampaign()` is called
2. All variant prices are recalculated with profile mappings
3. All dropdowns are repopulated (`populateAllDropdowns()`)
4. Slot pricing displays are updated for selected items
5. Prices shown to users reflect profile-specific values

## Error Handling

### SDK Method Failures
- Try-catch blocks around `window.next.getActiveProfile()`
- Fallback to sessionStorage if SDK method fails
- Silent failures in `getCurrentProfile()` to prevent disruption

### Profile Not Found
- Graceful handling when profile config doesn't exist
- Falls back to default/original prices
- Logs warnings but doesn't break functionality

## Performance Optimizations

### 1. Logging Reduction
- Only logs first 5 variants/packages/mappings to avoid console spam
- Summary logging for large datasets

### 2. Conditional Updates
- Only updates slot pricing if selections exist
- Prevents unnecessary DOM operations

### 3. Delayed Refresh
- 100ms delay after profile events to ensure store sync
- Prevents race conditions with store updates

## Key Variables

- `activeProfileId`: Current active profile ID
- `profileMappings`: Object mapping variant IDs to package IDs
- `profileAwarePrices`: Computed prices after profile mapping
- `lastKnownProfile`: Cached profile state for change detection
- `profileCheckInterval`: Interval ID for polling mechanism

## Dependencies

- **Next Campaign SDK**: For profile events and methods
- **SessionStorage**: For profile state persistence
- **window.nextConfig**: For profile configurations
- **Campaign Prices**: Base prices from campaign data

## Usage Example Flow

1. Page loads → `initializeWithSDK()` waits for SDK
2. SDK ready → `setupProfileListeners()` registers event handlers
3. Initial prices loaded → `refreshPricesFromCampaign()` checks for active profile
4. User applies profile → SDK emits `profile:applied` event
5. Event handler triggers → `refreshPricesFromCampaign()` with delay
6. Prices recalculated → UI updates with profile-specific prices
7. User selects variant → Displayed price reflects profile mapping