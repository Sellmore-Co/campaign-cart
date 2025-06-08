# Form Validation Guide

[← Basic Configuration](basic-config.md) | [Payment Configuration →](payment-config.md)

Campaign Cart provides automatic, client-side form validation for your checkout fields using standard HTML5 attributes.

## How Automatic Validation Works

1.  **Attribute-Based**: You add standard validation attributes like `required`, `minlength`, and `pattern` directly to your HTML inputs.
2.  **Automatic Listeners**: The SDK automatically detects these attributes and validates the fields as the user interacts with them.
3.  **CSS Classes**: When a field's state changes, the SDK adds classes like `.is-valid` or `.is-invalid` to the field's parent container for easy styling.
4.  **Error Messages**: It displays a relevant error message when a field is invalid.

You don't need to write any custom JavaScript for standard validation to work.

## Basic Implementation

To enable validation, simply add HTML5 validation attributes to your `os-checkout-field` inputs.

```html
<form os-checkout="form" novalidate>

  <!-- Required field -->
  <div class="form-group">
    <label>First Name</label>
    <input type="text" os-checkout-field="fname" required>
    <div class="error-message"></div>
  </div>

  <!-- Email and length validation -->
  <div class="form-group">
    <label>Email</label>
    <input type="email" os-checkout-field="email" required minlength="5">
    <div class="error-message"></div>
  </div>
  
  <!-- Pattern validation for ZIP code -->
  <div class="form-group">
    <label>ZIP Code</label>
    <input type="text" os-checkout-field="postal" required pattern="[0-9]{5}">
    <div class="error-message"></div>
  </div>

</form>
```
The `novalidate` attribute on the `<form>` tag is important—it prevents the browser's default validation popups, allowing the SDK to handle error display consistently.

## Styling Validation States

The SDK adds classes to the parent element of an input field (in this case, `.form-group`) so you can style the feedback.

-   `.is-valid`: Added when the field's input is valid.
-   `.is-invalid`: Added when the field's input is invalid.

```css
.form-group .error-message {
  display: none;
  color: #e74c3c;
  font-size: 0.9em;
  margin-top: 5px;
}

.form-group.is-invalid .error-message {
  display: block;
}

.form-group .form-input {
  border: 1px solid #ccc;
  transition: border-color 0.2s;
}

/* Style the input border based on validation state */
.form-group.is-invalid .form-input {
  border-color: #e74c3c;
}

.form-group.is-valid .form-input {
  border-color: #2ecc71;
}
```

## Custom Error Messages

You can override the default browser validation messages with your own using the `data-os-error-message` attribute.

```html
<div class="form-group">
  <label>ZIP Code</label>
  <input 
    type="text" 
    os-checkout-field="postal" 
    required 
    pattern="[0-9]{5}"
    data-os-error-message="Please enter a 5-digit US ZIP code."
  >
  <div class="error-message"></div>
</div>
```
If the input for this field is invalid, the text "Please enter a 5-digit US ZIP code." will be displayed in the `.error-message` div, instead of the browser's default message.

## Payment Field Validation

Credit card fields (`cc-number` and `cvv`) receive enhanced validation through our secure Spreedly integration.

-   **Real-time Formatting**: The card number is formatted automatically as the user types.
-   **Card Type Detection**: The SDK detects the card type (Visa, Mastercard, etc.) and can display the corresponding icon.
-   **Luhn Algorithm Check**: Ensures the card number is mathematically valid.

This happens automatically when you use the correct `os-checkout-field` attributes.

```html
<div class="form-group">
  <label>Card Number</label>
  <input type="text" os-checkout-field="cc-number" required>
  <div class="error-message"></div>
</div>

<div class="form-group">
  <label>CVV</label>
  <input type="text" os-checkout-field="cvv" required>
  <div class="error-message"></div>
</div>
```

> For more details on styling these secure fields, see the [Payment Configuration Guide](payment-config.md).

## Advanced Validation

For complex scenarios that go beyond what HTML5 attributes can handle, you can use the SDK's event system.

By listening to the `field.validation` event, you can implement custom logic or integrate with third-party validation libraries.

> See the [Events Reference](../api/events-reference.md) for more details on event-based handling.