# Troubleshooting

Common issues and solutions when working with the Next Commerce JS SDK.

## SDK Not Loading

### Check API Key
Ensure your API key meta tag is present:
```html
<meta name="next-api-key" content="your-api-key-here">
```

### Verify Script URL
Make sure the script URL is correct:
```html
<script src="https://campaign-cart-v2.pages.dev/loader.js"></script>
```

### Check Initialization
Listen for the initialized event:
```javascript
window.addEventListener('next:initialized', function() {
  console.log('SDK is ready');
});
```

## Debug Mode

Enable debug mode to see detailed logs:
```html
<meta name="next-debug" content="true">
```

## Common Issues

### Attributes Not Working

TODO: Add troubleshooting for attribute issues

### Cart Not Updating

TODO: Add troubleshooting for cart update issues

### Upsells Not Showing

TODO: Add troubleshooting for upsell issues

### Events Not Firing

TODO: Add troubleshooting for event issues

## Browser Console

Check the browser console for errors:
- Open DevTools (F12)
- Check Console tab for errors
- Look for "next:" prefixed messages

## Getting Help

TODO: Add support contact information