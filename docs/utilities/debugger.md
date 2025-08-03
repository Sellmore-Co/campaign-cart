# Debug Mode

The Next Commerce JS SDK includes a comprehensive debug overlay system that helps developers inspect state, monitor events, and troubleshoot issues during development.

## Enabling Debug Mode

Add the `?debugger=true` parameter to any page URL:

```
https://yoursite.com/checkout?debugger=true
```

This will automatically:
1. Load and display the debug overlay at the bottom of the page
2. Create the global `nextDebug` object for console access
3. Set the logger to DEBUG level for verbose logging

**Note:** The `nextDebug` object is only available when debug mode is enabled via the URL parameter. If you try to access it without the parameter, you'll get a "nextDebug is not defined" error.

## Debug Overlay Features

The debug overlay provides multiple panels for inspecting different aspects of the SDK:

### 1. Cart Panel
- View current cart state and items
- Inspect cart totals, discounts, and calculations
- Monitor cart updates in real-time
- Test cart operations directly

### 2. Config Panel
- View current SDK configuration
- Inspect API keys and endpoints
- Check feature flags and settings
- Monitor configuration changes

### 3. Campaign Panel
- View campaign data and settings
- Inspect product/package information
- Monitor campaign-specific state
- Test campaign operations

### 4. Checkout Panel
- Monitor checkout form state
- Inspect validation errors
- View payment method selections
- Debug checkout flow issues

### 5. Event Timeline Panel
- Real-time event monitoring
- Visual timeline of SDK events
- Event details and payloads
- Performance timing information

### 6. Storage Panel
- Inspect localStorage data
- View sessionStorage contents
- Monitor storage changes
- Clear storage for testing

## Using Debug Mode

### Global Access

When debug mode is active (via `?debugger=true`), a global `nextDebug` object is available in the console:

```javascript
// Access debug overlay controls
nextDebug.overlay.show()
nextDebug.overlay.hide()
nextDebug.overlay.toggle()
nextDebug.overlay.isVisible()

// Debug mode management
nextDebug.enableDebug()    // Enables debug mode programmatically
nextDebug.disableDebug()   // Disables debug mode and removes URL param
nextDebug.toggleDebug()     // Toggles debug mode on/off
nextDebug.isDebugMode()    // Returns true/false

// Access to SDK stores
nextDebug.stores.cart       // Cart store
nextDebug.stores.campaign   // Campaign store
nextDebug.stores.config     // Config store
nextDebug.stores.checkout   // Checkout store
nextDebug.stores.order      // Order store
nextDebug.stores.attribution // Attribution store

// SDK instance
nextDebug.sdk              // NextCommerce instance

// Utility methods
nextDebug.reinitialize()   // Reinitialize the SDK
nextDebug.getStats()       // Get initialization statistics
```

### Keyboard Shortcuts

When the debug overlay is visible:
- `ESC` - Toggle overlay visibility
- `Tab` - Switch between panels
- `↑/↓` - Navigate within panels

### Panel-Specific Features

#### Cart Panel Actions
- Add/remove test items
- Apply test discounts
- Clear cart
- Simulate cart errors

#### Event Timeline
- Filter events by type
- Export event log
- Clear timeline
- Pause/resume monitoring

#### Storage Panel
- Search storage keys
- Edit values directly
- Export/import storage
- Clear specific keys

## Visual Debugging

### X-Ray Mode
The debugger includes an X-Ray mode that highlights SDK-enhanced elements:
- Blue outline: Active SDK attributes
- Green outline: Conditional visibility elements
- Red outline: Error states
- Yellow outline: Loading states

Toggle X-Ray mode from any panel's toolbar.

### Performance Monitoring
- Track render times
- Monitor API call durations
- Identify performance bottlenecks
- View memory usage

## Advanced Features

### Cart Operations

```javascript
// Add items to cart
nextDebug.addToCart(packageId, quantity)

// Remove items from cart
nextDebug.removeFromCart(packageId)

// Update quantity
nextDebug.updateQuantity(packageId, quantity)

// Add test items (packages 2, 7, 9)
nextDebug.addTestItems()
```

### Campaign Inspection

```javascript
// Reload campaign data
nextDebug.loadCampaign()

// Clear campaign cache
nextDebug.clearCampaignCache()

// Get cache information
nextDebug.getCacheInfo()

// Inspect specific package details
nextDebug.inspectPackage(packageId)

// Test shipping methods
nextDebug.testShippingMethod(methodId)
```

### Analytics Debugging

```javascript
// Get analytics status
await nextDebug.analytics.getStatus()

// View active providers
await nextDebug.analytics.getProviders()

// Track custom event
await nextDebug.analytics.track('custom_event', { data: 'value' })

// Enable analytics debug mode
await nextDebug.analytics.setDebugMode(true)

// Invalidate analytics context
await nextDebug.analytics.invalidateContext()
```

### Attribution Debugging

```javascript
// Debug attribution data
nextDebug.attribution.debug()

// Get attribution for API
nextDebug.attribution.get()

// Set funnel name
nextDebug.attribution.setFunnel('FUNNEL_NAME')

// Set Everflow click ID
nextDebug.attribution.setEvclid('click_id')

// Get current funnel
nextDebug.attribution.getFunnel()

// Clear persisted funnel
nextDebug.attribution.clearFunnel()
```

### Order Management

```javascript
// View upsell journey
nextDebug.order.getJourney()

// Check if order is expired
nextDebug.order.isExpired()

// Clear order cache
nextDebug.order.clearCache()

// Get order statistics
nextDebug.order.getStats()
```

### Accordion Controls

```javascript
// Open accordion
nextDebug.accordion.open('accordion-id')

// Close accordion
nextDebug.accordion.close('accordion-id')

// Toggle accordion
nextDebug.accordion.toggle('accordion-id')
```

### Custom Event Logging

```javascript
// Log custom events to the timeline
window.dispatchEvent(new CustomEvent('debug:log', {
  detail: {
    type: 'custom',
    message: 'My debug message',
    data: { /* any data */ }
  }
}));

// Update debug content
window.dispatchEvent(new CustomEvent('debug:update-content'));
```

### State Snapshots
- Save current state for later comparison
- Export state as JSON
- Import saved states for testing
- Compare state differences

### Network Monitoring
- View API requests and responses
- Inspect request headers
- Monitor request timing
- Simulate network errors

## Best Practices

1. **Development Only** - Never enable debug mode in production
2. **Performance** - Debug mode adds overhead; disable when testing performance
3. **Privacy** - Debug overlay may display sensitive data
4. **Storage** - Clear debug storage regularly to avoid conflicts

## Troubleshooting

### Debug Overlay Not Appearing
1. Ensure `?debugger=true` is in the URL
2. Check browser console for errors
3. Verify SDK is properly loaded
4. Try hard refresh (Ctrl+F5)

### Performance Issues
1. Disable event timeline if too many events
2. Clear storage panel data
3. Reduce update frequency in settings
4. Use panel-specific views instead of "All"

### Console Errors

#### nextDebug is undefined
This happens when debug mode is not enabled. Solutions:

1. **Add the URL parameter:**
   ```
   https://yoursite.com?debugger=true
   ```

2. **Enable programmatically (if SDK is loaded):**
   ```javascript
   // First, check if the SDK is loaded
   if (window.next) {
     // Add debugger=true to URL and reload
     const url = new URL(window.location.href);
     url.searchParams.set('debugger', 'true');
     window.location.href = url.toString();
   }
   ```

3. **For local development, use the debug config:**
   ```javascript
   // In your config.js
   window.nextConfig = {
     debug: true,
     // other config...
   };
   ```

#### Panel-specific errors
```javascript
// Refresh specific panel
nextDebug.overlay.updateContent()

// Reinitialize debug overlay
nextDebug.reinitialize()
```

## Security Considerations

- Debug mode exposes internal state and sensitive data
- Never use in production environments
- Be cautious when sharing debug screenshots
- Clear sensitive data from storage panel
- The debug overlay displays:
  - API keys and configuration
  - Cart and order details
  - Customer information
  - Analytics data
  - Internal SDK state

## Related URL Parameters

For debugging purposes, you may also use:
- `?debugger=true` - Enable debug mode and overlay

For functional URL parameters like `forcePackageId` and `ref_id`, see [URL Parameters](../getting-started/url-parameters.md).

## Meta Tag Configuration

You can also enable debug mode via meta tag:

```html
<meta name="next-debug" content="true">
```

Or via JavaScript configuration:

```javascript
window.nextConfig = {
  debug: true
};
```

## Integration with Dev Tools

The debug overlay complements browser dev tools:
- Console logs include debug context
- Network tab shows SDK requests
- Elements panel highlights SDK attributes
- Performance profiler includes SDK marks