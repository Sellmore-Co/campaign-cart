# Google Maps Address Autocomplete

The 29next client library includes support for Google Maps address autocomplete to enhance the user checkout experience. This feature allows customers to easily input their address by suggesting full addresses as they type, which reduces errors and improves conversion rates.

## Configuration Options

You can configure Google Maps autocomplete using the following options:

1. **API Key**: Your Google Maps API key (required for the feature to work)
2. **Region**: Bias results towards a specific region (e.g., "US")
3. **Enable/Disable**: Toggle the autocomplete functionality on or off

## Setup Method

Add the following JavaScript configuration before loading the 29next library:

```javascript
// Initialize global configuration object
window.osConfig = window.osConfig || {};

// Google Maps configuration
window.osConfig.googleMaps = {
  apiKey: 'YOUR_GOOGLE_MAPS_API_KEY',  // Replace with your actual API key
  region: 'US',                         // Bias results to this region
  enableAutocomplete: true              // Enable address autocomplete
};
```

## Example Implementation

Here's a complete example showing how to implement Google Maps autocomplete on your checkout page:

```html
<script>
  // Initialize global configuration object
  window.osConfig = window.osConfig || {};
  
  // Google Maps configuration
  window.osConfig.googleMaps = {
    apiKey: 'AIzaSyCs8HJLLltLJvlgBIEoma8O1j0AV0EGU5k',  // Replace with your actual API key
    region: 'US',                                        // Bias results to this region
    enableAutocomplete: true                             // Enable address autocomplete
  };
</script>

<!-- Load the 29next client library after the configuration -->
<script src="/static/js/29next.min.js"></script>
```

## How It Works

When enabled, the address autocomplete feature:

1. Loads the Google Maps API with the Places library
2. Attaches autocomplete functionality to shipping and billing address fields
3. When a user selects an address, it automatically fills in:
   - Street address
   - City
   - State/Province
   - ZIP/Postal code
   - Country

## Fallback Behavior

If the Google Maps API fails to load or autocomplete is disabled, the system will fall back to a basic input behavior. In these cases:

- Address fields will be shown in their standard form
- Validation will proceed normally without suggestions
- Location fields will be made visible once the user has entered sufficient text in the address field

## Required API Permissions

For this feature to work properly, your Google Maps API key needs the following permissions:

- **Places API**: Used for address autocomplete functionality
- **Geocoding API**: Used to convert addresses to map coordinates (optional, enhances accuracy)

## Performance Considerations

The Google Maps API is loaded asynchronously and only when needed, so it won't block your page loading. The API is approximately 160KB in size.

## Privacy Considerations

When using Google Maps autocomplete, be aware that:

- User address inputs are sent to Google's servers
- This may have privacy implications depending on your jurisdiction
- Consider updating your privacy policy to reflect the use of Google services

## Troubleshooting

If autocomplete isn't working as expected, check the following:

1. Make sure your API key is correct and has the proper permissions
2. Check that `enableAutocomplete` is set to `true`
3. Look for errors in the browser console
4. Verify that the API hasn't exceeded its quota or been restricted

## Disabling Autocomplete

If you need to disable Google Maps autocomplete, you can set:

```javascript
window.osConfig.googleMaps = {
  enableAutocomplete: false
};
```

Or you can completely omit the Google Maps configuration to use the default behavior. 