# Multi-Step Checkout Implementation Example

## Overview
The `CheckoutFormEnhancer` now supports multi-step checkout with step-based validation. Here's how to implement it:

## Step 1: Information Page (information.html)

### Key Changes Required:

1. **Add form wrapper with step attributes**:
   ```html
   <form data-next-checkout="form"
         data-next-checkout-step="shipping.html"
         data-next-step-number="1">
   ```

2. **Keep your existing fields** - all fields with `data-next-checkout-field` attributes will auto-save to the store

3. **Button should remain type="submit"** - the enhancer will intercept and validate

### Complete Example for information.html:

```html
<form data-next-checkout="form"
      data-next-checkout-step="shipping.html"
      data-next-step-number="1">

  <!-- Contact Section -->
  <div class="form-section form-section--first">
    <h2 class="form-section__title">Contact</h2>
    <div class="form-group">
      <input autocomplete="email"
             os-checkout-validate="required"
             name="email"
             type="email"
             id="email"
             placeholder="Email*"
             data-next-checkout-field="email"
             class="input-flds">
    </div>
  </div>

  <!-- Shipping Section -->
  <div pb-checkout-section="shipping" class="form-section">
    <h1 class="form-section__title">Shipping</h1>

    <!-- Country -->
    <div class="form-group">
      <select os-checkout-validate="required"
              data-next-checkout-field="country"
              class="input-flds select-field">
        <option value="">Select Country</option>
        <option value="US">United States</option>
        <!-- ... more countries ... -->
      </select>
    </div>

    <!-- First Name & Last Name -->
    <div class="form-grid__row">
      <input os-checkout-validate="required"
             placeholder="First Name*"
             name="shipping_fname"
             type="text"
             data-next-checkout-field="fname"
             class="input-flds">

      <input os-checkout-validate="required"
             placeholder="Last Name*"
             name="shipping_lname"
             type="text"
             data-next-checkout-field="lname"
             class="input-flds">
    </div>

    <!-- Address -->
    <input os-checkout-validate="required"
           placeholder="Address*"
           data-next-checkout-field="address1"
           class="input-flds">

    <!-- Address 2 (optional) -->
    <input placeholder="Apartment, suite, etc. (optional)"
           data-next-checkout-field="address2"
           class="input-flds">

    <!-- City, State, ZIP -->
    <div class="form-grid__row">
      <input os-checkout-validate="required"
             placeholder="City*"
             data-next-checkout-field="city"
             class="input-flds">

      <select os-checkout-validate="required"
              data-next-checkout-field="province"
              class="input-flds select-field">
        <option value="">Select State</option>
        <!-- States populated dynamically -->
      </select>

      <input os-checkout-validate="required"
             placeholder="ZIP Code*"
             data-next-checkout-field="postal"
             class="input-flds">
    </div>

    <!-- Phone -->
    <input name="phone"
           type="tel"
           id="phone"
           placeholder="Phone*"
           data-next-checkout-field="phone"
           required
           class="input-flds">
  </div>

  <!-- Submit Button -->
  <div class="submit-section">
    <button type="submit" class="submit-button">
      Continue to Shipping
    </button>
  </div>
</form>
```

## Step 2: Shipping Page (shipping.html)

```html
<form data-next-checkout="form"
      data-next-checkout-step="payment.html"
      data-next-step-number="2">

  <!-- Display customer info from step 1 (read-only) -->
  <div class="customer-summary">
    <h3>Contact</h3>
    <p id="customer-email"></p>
    <a href="information.html">Change</a>
  </div>

  <div class="shipping-summary">
    <h3>Ship to</h3>
    <p id="shipping-address"></p>
    <a href="information.html">Change</a>
  </div>

  <!-- Shipping method selection -->
  <div class="shipping-methods">
    <h2>Shipping Method</h2>
    <label>
      <input type="radio" name="shipping_method" value="standard" checked>
      Standard Shipping - $5.00
    </label>
    <label>
      <input type="radio" name="shipping_method" value="express">
      Express Shipping - $15.00
    </label>
  </div>

  <button type="submit" class="submit-button">
    Continue to Payment
  </button>
</form>

<script>
  // Populate summary from stored data
  window.Next.init({
    apiKey: 'your-api-key',
    campaignId: 'your-campaign-id'
  }).then(async (sdk) => {
    const checkoutStore = window.Next.stores.checkout;
    const state = checkoutStore.getState();

    // Redirect back if step 1 not completed
    if (!state.formData.email) {
      window.location.href = 'information.html';
      return;
    }

    // Display info from step 1
    document.getElementById('customer-email').textContent = state.formData.email;
    document.getElementById('shipping-address').textContent =
      `${state.formData.address1}, ${state.formData.city}, ${state.formData.province} ${state.formData.postal}`;

    // Register the form enhancer (optional - auto-detected)
    const form = document.querySelector('[data-next-checkout="form"]');
    await sdk.enhancers.register('checkout', form);
  });
</script>
```

## Step 3: Payment Page (payment.html)

```html
<form data-next-checkout="form">
  <!-- No step attribute = final step, will process payment -->

  <!-- Summary sections -->
  <div class="checkout-summary">
    <!-- Contact, Shipping, Method summaries -->
  </div>

  <!-- Payment fields -->
  <div id="spreedly-number"></div>
  <div id="spreedly-cvv"></div>
  <input data-next-checkout-field="cc-month" required>
  <input data-next-checkout-field="cc-year" required>

  <button type="submit" class="submit-button">
    Complete Order
  </button>
</form>
```

## How It Works

1. **Automatic Field Saving**: All fields with `data-next-checkout-field` are automatically saved to `checkoutStore` on change
2. **Step Detection**: When form has `data-next-checkout-step` attribute, it's treated as a navigation step
3. **Step Validation**: Only validates fields required for current step (defined in `CheckoutValidator.validateStep()`)
4. **Data Persistence**: `checkoutStore` persists across page navigations (uses Zustand with localStorage)
5. **Final Step**: Page without `data-next-checkout-step` triggers full validation + order creation

## Attributes Reference

| Attribute | Required | Description | Example |
|-----------|----------|-------------|---------|
| `data-next-checkout` | Yes | Marks the form for CheckoutFormEnhancer (must be "form") | `<form data-next-checkout="form">` |
| `data-next-checkout-step` | Step 1 & 2 | URL to navigate to after validation | `data-next-checkout-step="shipping.html"` |
| `data-next-step-number` | Optional | Current step number (default: 1) | `data-next-step-number="1"` |
| `data-next-checkout-field` | Yes | Field name for auto-save | `data-next-checkout-field="email"` |

## Step 1 Required Fields

The validator checks these fields for step 1:
- `email`
- `fname`
- `lname`
- `country`
- `address1`
- `city`
- `postal`
- `province` (if country requires it)
- `phone` (if marked as required in HTML)

## Notes

- Data is automatically persisted via `checkoutStore`
- No need for manual `checkoutStore.updateFormData()` - the enhancer handles it
- You can access stored data via `window.Next.stores.checkout.getState().formData`
- Phone validation uses intl-tel-input if available
- Postal code validation is country-specific
