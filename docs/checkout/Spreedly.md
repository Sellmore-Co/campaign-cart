# Spreedly Configuration Guide

This document explains how to customize the Spreedly credit card fields using the global configuration object.

## Overview

Spreedly is used to securely handle credit card information through iframe fields. The 29next platform allows you to customize these fields to match your site's design and provide a better user experience.

## How It Works

The Spreedly integration now uses your existing input fields directly, instead of creating new elements. This means:

1. Your existing input elements are used as containers for the Spreedly iframes
2. The styling is more consistent with your site's design
3. Error handling is more intuitive and integrated with your form

## Basic Setup

To customize Spreedly, you need to add a script tag to your HTML that sets up the `window.osConfig.spreedlyConfig` object:

```html
<script>
window.osConfig = window.osConfig || {};
window.osConfig.spreedlyConfig = {
  // Your configuration here
};
</script>
```

This script should be placed in the `<head>` of your HTML document, before loading the 29next client.

## Required HTML Structure

Your form should include the following fields with the proper attributes:

```html
<!-- Card Number field -->
<input type="text" id="cc-number" os-checkout-field="cc-number" placeholder="Card Number">

<!-- CVV field -->
<input type="text" id="cvv" os-checkout-field="cvv" placeholder="CVV">

<!-- Expiration Month and Year -->
<select id="cc-month" os-checkout-field="cc-month"></select>
<select id="cc-year" os-checkout-field="cc-year"></select>

<!-- Cardholder Name -->
<input type="text" id="cc-name" os-checkout-field="cc-name" placeholder="Name on Card">
```

The important attributes are:
- `os-checkout-field="cc-number"` for the card number field
- `os-checkout-field="cvv"` for the CVV field

## Configuration Options

The following options are available for customizing Spreedly:

### Field Types

Control the input type of the iframe fields. This is useful for controlling which keyboard appears on mobile devices.

```javascript
fieldType: {
  number: 'tel', // Options: 'text', 'tel', 'number'
  cvv: 'tel'
}
```

### Number Format

Set the card number format display.

```javascript
numberFormat: 'prettyFormat' // Options: 'prettyFormat', 'plainFormat', 'maskedFormat'
```

- `prettyFormat`: Displays the card number with spaces (e.g., `4111 1111 1111 1111`)
- `plainFormat`: Displays the card number without formatting (e.g., `4111111111111111`)
- `maskedFormat`: Masks the card number with asterisks (e.g., `****************`)

### Placeholder Text

Set the placeholder text for each field.

```javascript
placeholder: {
  number: 'Card Number',
  cvv: 'Security Code'
}
```

### Labels

Set the labels for screen readers and other accessibility devices.

```javascript
labels: {
  number: 'Credit Card Number',
  cvv: 'Card Verification Value'
}
```

### Title Attributes

Set the title attributes for hover tooltips and accessibility.

```javascript
titles: {
  number: 'Enter your credit card number',
  cvv: 'Enter the 3 or 4 digit security code'
}
```

### Styling

Apply CSS styles to the iframe fields. Note that since we're using your existing fields, you should make sure the styling is compatible with your form layout.

```javascript
styling: {
  number: 'color: #333; font-size: 16px; font-family: Arial; width: 100%; height: 100%;',
  cvv: 'color: #333; font-size: 16px; font-family: Arial; width: 100%; height: 100%;'
}
```

### Placeholder Styling

Style the placeholder text in both fields.

```javascript
placeholder_styling: 'color: #999; font-style: italic;'
```

### Required Attributes

Set whether fields should be marked as required for accessibility.

```javascript
required: {
  number: true,
  cvv: true
}
```

### Autocomplete

Enable or disable browser autocomplete functionality.

```javascript
autocomplete: true // or false
```

## Complete Example

Here's a complete example of a Spreedly configuration:

```html
<script>
window.osConfig = window.osConfig || {};
window.osConfig.spreedlyConfig = {
  fieldType: {
    number: 'tel',
    cvv: 'tel'
  },
  numberFormat: 'prettyFormat',
  placeholder: {
    number: 'Card Number',
    cvv: 'Security Code'
  },
  labels: {
    number: 'Credit Card Number',
    cvv: 'Card Verification Value'
  },
  titles: {
    number: 'Enter your credit card number',
    cvv: 'Enter the 3 or 4 digit security code'
  },
  styling: {
    number: 'color: #333; font-size: 16px; font-family: Arial; width: 100%; height: 100%;',
    cvv: 'color: #333; font-size: 16px; font-family: Arial; width: 100%; height: 100%;'
  },
  placeholder_styling: 'color: #999; font-style: italic;',
  required: {
    number: true,
    cvv: true
  },
  autocomplete: true
};
</script>
```

## Notes

- All configuration properties are optional. If not provided, default values will be used.
- CSS styling should be vanilla CSS. External fonts or images cannot be imported due to iframe CORS settings.
- Most browser web standard font-families are supported (Arial, Courier New, Tahoma, Lato, etc.).
- Ensure your styling works well with your form layout. Since we're using your existing fields, the styling should complement your existing CSS.

## Troubleshooting

If your styles are not applying correctly:

1. Make sure the configuration is set before the 29next client is loaded
2. Check for any JavaScript errors in the console
3. Verify that your CSS is valid and compatible with iframe restrictions
4. Ensure the proper elements exist in your checkout form with the correct attributes
5. Check that your form has the field attributes required: `os-checkout-field="cc-number"` and `os-checkout-field="cvv"`

For additional help, please refer to the Spreedly documentation or contact support. 