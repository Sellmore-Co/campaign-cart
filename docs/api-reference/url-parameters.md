# URL Parameters API

The SDK provides a comprehensive API for managing URL parameters programmatically. These methods allow you to control parameter-based visibility and behavior without relying solely on URL query strings.

## Overview

URL parameters are automatically captured from the page URL when the SDK initializes and stored in sessionStorage for the entire session. You can also programmatically set, get, and clear parameters using the JavaScript API.

## Methods

All parameter methods are available on the global `next` object after the SDK initializes.

### setParam(key, value)

Sets a single URL parameter.

**Parameters:**
- `key` (string) - The parameter name
- `value` (string) - The parameter value

**Example:**
```javascript
// Hide banner elements
next.setParam('banner', 'n');

// Enable debug mode
next.setParam('debug', 'true');
```

### setParams(params)

Sets multiple parameters at once, replacing all existing parameters.

**Parameters:**
- `params` (object) - Key-value pairs of parameters

**Example:**
```javascript
next.setParams({
  timer: 'n',
  reviews: 'n',
  banner: 'n',
  exit: 'n'
});
```

### mergeParams(params)

Merges new parameters with existing ones, preserving parameters not included in the merge.

**Parameters:**
- `params` (object) - Key-value pairs to merge

**Example:**
```javascript
// Existing: { timer: 'n', banner: 'y' }
next.mergeParams({
  campaign: 'summer2024',
  banner: 'n'
});
// Result: { timer: 'n', banner: 'n', campaign: 'summer2024' }
```

### getParam(key)

Gets the value of a specific parameter.

**Parameters:**
- `key` (string) - The parameter name

**Returns:**
- `string | null` - The parameter value or null if not set

**Example:**
```javascript
const timerValue = next.getParam('timer');
if (timerValue === 'n') {
  console.log('Timer is disabled');
}
```

### getAllParams()

Gets all stored parameters as an object.

**Returns:**
- `object` - All parameters as key-value pairs

**Example:**
```javascript
const allParams = next.getAllParams();
console.log('Current parameters:', allParams);
// Output: { timer: 'n', banner: 'n', debug: 'true' }
```

### hasParam(key)

Checks if a parameter exists (regardless of its value).

**Parameters:**
- `key` (string) - The parameter name

**Returns:**
- `boolean` - True if the parameter exists

**Example:**
```javascript
if (next.hasParam('debug')) {
  console.log('Debug mode is active');
}
```

### clearParam(key)

Removes a specific parameter.

**Parameters:**
- `key` (string) - The parameter name to remove

**Example:**
```javascript
// Remove debug mode
next.clearParam('debug');
```

### clearAllParams()

Removes all stored parameters.

**Example:**
```javascript
// Clear all parameters
next.clearAllParams();
```

## Usage Examples

### Feature Toggles

Create a simple feature toggle system:

```javascript
class FeatureToggle {
  static enable(feature) {
    next.setParam(`feature_${feature}`, 'enabled');
  }

  static disable(feature) {
    next.setParam(`feature_${feature}`, 'disabled');
  }

  static isEnabled(feature) {
    return next.getParam(`feature_${feature}`) === 'enabled';
  }

  static toggle(feature) {
    if (this.isEnabled(feature)) {
      this.disable(feature);
    } else {
      this.enable(feature);
    }
  }
}

// Usage
FeatureToggle.enable('new_checkout');
if (FeatureToggle.isEnabled('new_checkout')) {
  // Show new checkout flow
}
```

### A/B Testing

Implement A/B test variants:

```javascript
function setABTestVariant(testName, variant) {
  next.setParam(`ab_${testName}`, variant);
}

function getABTestVariant(testName) {
  return next.getParam(`ab_${testName}`) || 'control';
}

// Set variant
setABTestVariant('checkout_flow', 'variant_b');

// Use variant
const variant = getABTestVariant('checkout_flow');
switch(variant) {
  case 'variant_a':
    // Show variant A
    break;
  case 'variant_b':
    // Show variant B
    break;
  default:
    // Show control
}
```

### User Preferences

Store user preferences without cookies:

```javascript
const UserPreferences = {
  hideAnnoyances() {
    next.setParams({
      timer: 'n',
      exit: 'n',
      loading: 'n',
      banner: 'n',
      reviews: 'n'
    });
  },

  showAll() {
    next.clearAllParams();
  },

  setTheme(theme) {
    next.setParam('theme', theme);
  },

  getTheme() {
    return next.getParam('theme') || 'light';
  }
};

// Usage
UserPreferences.hideAnnoyances();
UserPreferences.setTheme('dark');
```

### Debug Mode

Toggle debug mode programmatically:

```javascript
function toggleDebug() {
  if (next.hasParam('debug')) {
    next.clearParam('debug');
    console.log('Debug mode disabled');
  } else {
    next.setParam('debug', 'true');
    console.log('Debug mode enabled');
    // Reload to apply debug mode
    window.location.reload();
  }
}

// Add keyboard shortcut (Ctrl+Shift+D)
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'D') {
    toggleDebug();
  }
});
```

### Campaign Tracking

Track marketing campaigns:

```javascript
function trackCampaign(source, medium, campaign) {
  next.mergeParams({
    utm_source: source,
    utm_medium: medium,
    utm_campaign: campaign,
    campaign_timestamp: Date.now().toString()
  });
}

function getCampaignInfo() {
  return {
    source: next.getParam('utm_source'),
    medium: next.getParam('utm_medium'),
    campaign: next.getParam('utm_campaign'),
    timestamp: next.getParam('campaign_timestamp')
  };
}

// Track a campaign
trackCampaign('email', 'newsletter', 'summer_sale_2024');

// Get campaign info
const campaign = getCampaignInfo();
```

## Integration with Conditional Display

Parameters set via the JavaScript API work seamlessly with the conditional display attributes:

```html
<!-- This element will be hidden after calling next.setParam('banner', 'n') -->
<div data-next-hide="param.banner=='n'">
  Promotional banner
</div>

<!-- This element will show after calling next.setParam('debug', 'true') -->
<div data-next-show="param.debug=='true'">
  Debug information
</div>
```

## Storage and Persistence

- Parameters are stored in sessionStorage with the key `next-url-params`
- They persist across page navigation within the same session
- New URL parameters override stored values with the same key
- Parameters are cleared when the browser session ends

## Best Practices

1. **Use consistent naming conventions**: Prefix related parameters (e.g., `feature_*`, `ab_*`, `utm_*`)

2. **Document your parameters**: Keep a list of all parameters your application uses

3. **Handle missing parameters gracefully**: Always provide defaults
   ```javascript
   const theme = next.getParam('theme') || 'light';
   ```

4. **Clean up unused parameters**: Remove parameters that are no longer needed
   ```javascript
   next.clearParam('temporary_flag');
   ```

5. **Use type-safe wrappers**: Create utility functions for commonly used parameters
   ```javascript
   const ParamUtils = {
     isFeatureEnabled: (feature) => next.getParam(feature) === 'true',
     setFeature: (feature, enabled) => next.setParam(feature, enabled ? 'true' : 'false')
   };
   ```

## See Also

- [URL Parameters (Attributes)](../attributes/url-parameters.md) - Using parameters with HTML attributes
- [Conditional Display](../attributes/conditional-display.md) - Show/hide elements based on conditions
- [Events](./events.md) - Parameter-related events