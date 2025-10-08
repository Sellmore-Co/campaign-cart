# Multi-Step Checkout Implementation Guide

## Overview

The `CheckoutFormEnhancer` is currently designed as a **single-page checkout** but has the foundation for multi-step checkout built into the `checkoutStore` (with `step` state management). This guide explains how to implement a Shopify-style multi-step checkout flow.

## Current Architecture

### Store State
The `checkoutStore` already tracks:
- `step`: Current step number (default: 1)
- `formData`: All form field values (persisted across steps)
- `shippingMethod`: Selected shipping option
- `billingAddress`: Billing address data
- `paymentMethod`: Selected payment method
- `paymentToken`: Tokenized payment data

### Single Form Design
Currently, the `CheckoutFormEnhancer`:
- Manages **one form** with all fields
- Validates and submits everything at once
- Uses `data-next-checkout-field` or `os-checkout-field` attributes to identify fields

---

## Multi-Step Checkout Architecture

### Recommended Flow

```
Step 1: Information (/information)
├── Email
├── First Name
├── Last Name
└── Marketing opt-in checkbox

Step 2: Shipping (/shipping)
├── Address 1
├── Address 2 (optional)
├── City
├── Province/State
├── Postal Code
├── Country
├── Phone Number
└── Shipping Method Selection

Step 3: Payment (/payment)
├── Billing Address (if different from shipping)
├── Payment Method Selection
├── Credit Card Fields (Spreedly iframe)
└── Submit Order Button
```

---

## Implementation Options

### Option 1: URL-Based Multi-Step (Recommended)

**Pros:**
- Browser back/forward navigation works naturally
- Each step has its own URL
- Easy to bookmark and share progress
- SEO-friendly

**Implementation:**

#### 1. Create Separate HTML Pages

```
/information.html  (Step 1)
/shipping.html     (Step 2)
/payment.html      (Step 3)
/confirmation.html (Success)
```

#### 2. Initialize CheckoutFormEnhancer on Each Page

**On `/information.html`:**
```html
<form data-next-checkout-form>
  <!-- Email and name fields only -->
  <input data-next-checkout-field="email" type="email" required>
  <input data-next-checkout-field="fname" required>
  <input data-next-checkout-field="lname" required>

  <input
    type="checkbox"
    data-next-checkout-field="accepts_marketing"
    checked
  >
  <label>I want to receive marketing emails</label>

  <button type="submit">Continue to Shipping</button>
</form>

<script>
  // Initialize on step 1
  window.Next.init({
    apiKey: 'your-api-key',
    campaignId: 'your-campaign-id'
  }).then(async (sdk) => {
    const checkoutStore = window.Next.stores.checkout;
    checkoutStore.setStep(1);

    const form = document.querySelector('[data-next-checkout-form]');
    await sdk.enhancers.register('checkout-form', form);

    // Override form submission to go to next step
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Validate fields
      const email = form.querySelector('[data-next-checkout-field="email"]').value;
      const fname = form.querySelector('[data-next-checkout-field="fname"]').value;
      const lname = form.querySelector('[data-next-checkout-field="lname"]').value;

      if (!email || !fname || !lname) {
        alert('Please fill in all required fields');
        return;
      }

      // Data is already saved to checkoutStore via CheckoutFormEnhancer
      // Move to next step
      checkoutStore.setStep(2);
      window.location.href = '/shipping.html';
    });
  });
</script>
```

**On `/shipping.html`:**
```html
<form data-next-checkout-form>
  <!-- Display customer info from previous step (read-only) -->
  <div class="customer-summary">
    <p id="customer-email"></p>
    <a href="/information.html">Change</a>
  </div>

  <!-- Shipping address fields -->
  <input data-next-checkout-field="address1" required>
  <input data-next-checkout-field="address2">
  <input data-next-checkout-field="city" required>
  <select data-next-checkout-field="province" required></select>
  <input data-next-checkout-field="postal" required>
  <select data-next-checkout-field="country" required></select>
  <input data-next-checkout-field="phone" type="tel" required>

  <!-- Shipping method selection -->
  <div data-next-shipping-methods>
    <label>
      <input type="radio" name="shipping_method" value="1" checked>
      Standard Shipping - $5.00
    </label>
    <label>
      <input type="radio" name="shipping_method" value="2">
      Express Shipping - $15.00
    </label>
  </div>

  <button type="submit">Continue to Payment</button>
</form>

<script>
  window.Next.init({
    apiKey: 'your-api-key',
    campaignId: 'your-campaign-id'
  }).then(async (sdk) => {
    const checkoutStore = window.Next.stores.checkout;

    // Check if step 1 was completed
    if (!checkoutStore.getState().formData.email) {
      window.location.href = '/information.html';
      return;
    }

    checkoutStore.setStep(2);

    // Display customer info from step 1
    document.getElementById('customer-email').textContent =
      checkoutStore.getState().formData.email;

    const form = document.querySelector('[data-next-checkout-form]');
    await sdk.enhancers.register('checkout-form', form);

    // Override form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Validate shipping fields
      const address1 = checkoutStore.getState().formData.address1;
      const city = checkoutStore.getState().formData.city;
      const province = checkoutStore.getState().formData.province;
      const postal = checkoutStore.getState().formData.postal;
      const country = checkoutStore.getState().formData.country;

      if (!address1 || !city || !province || !postal || !country) {
        alert('Please fill in all required shipping fields');
        return;
      }

      checkoutStore.setStep(3);
      window.location.href = '/payment.html';
    });
  });
</script>
```

**On `/payment.html`:**
```html
<form data-next-checkout-form>
  <!-- Summary of previous steps -->
  <div class="checkout-summary">
    <div class="customer-summary">
      <h3>Contact</h3>
      <p id="customer-email"></p>
      <a href="/information.html">Change</a>
    </div>

    <div class="shipping-summary">
      <h3>Ship to</h3>
      <p id="shipping-address"></p>
      <a href="/shipping.html">Change</a>
    </div>

    <div class="shipping-method-summary">
      <h3>Method</h3>
      <p id="shipping-method"></p>
    </div>
  </div>

  <!-- Billing address toggle -->
  <input type="checkbox" name="use_shipping_address" checked>
  <label>Same as shipping address</label>

  <!-- Billing form (hidden by default) -->
  <div data-next-component="different-billing-address">
    <div data-next-component="billing-form">
      <!-- Billing fields will be auto-generated by CheckoutFormEnhancer -->
    </div>
  </div>

  <!-- Payment method selection -->
  <div class="payment-methods">
    <label>
      <input type="radio" data-next-checkout-field="payment-method" value="credit" checked>
      Credit Card
    </label>
  </div>

  <!-- Credit card fields (Spreedly) -->
  <div id="spreedly-number"></div>
  <div id="spreedly-cvv"></div>
  <input data-next-checkout-field="cc-month" required>
  <input data-next-checkout-field="cc-year" required>

  <button type="submit">Complete Order</button>
</form>

<script>
  window.Next.init({
    apiKey: 'your-api-key',
    campaignId: 'your-campaign-id',
    spreedlyEnvironmentKey: 'your-spreedly-key'
  }).then(async (sdk) => {
    const checkoutStore = window.Next.stores.checkout;

    // Check if previous steps were completed
    if (!checkoutStore.getState().formData.email) {
      window.location.href = '/information.html';
      return;
    }
    if (!checkoutStore.getState().formData.address1) {
      window.location.href = '/shipping.html';
      return;
    }

    checkoutStore.setStep(3);

    // Display summaries
    const state = checkoutStore.getState();
    document.getElementById('customer-email').textContent = state.formData.email;
    document.getElementById('shipping-address').textContent =
      `${state.formData.address1}, ${state.formData.city}, ${state.formData.province} ${state.formData.postal}`;
    document.getElementById('shipping-method').textContent =
      state.shippingMethod?.name || 'Standard Shipping';

    const form = document.querySelector('[data-next-checkout-form]');
    await sdk.enhancers.register('checkout-form', form);

    // Form submission will create the order (default CheckoutFormEnhancer behavior)
  });
</script>
```

---

### Option 2: Single Page with Step Visibility (Client-Side)

**Pros:**
- All in one page
- No page reloads
- Faster navigation between steps

**Cons:**
- URL doesn't change (can use hash routing)
- Browser back button doesn't work naturally
- All step HTML loaded at once

**Implementation:**

```html
<form data-next-checkout-form>
  <!-- Step 1: Information -->
  <div data-checkout-step="1" class="checkout-step active">
    <h2>Contact Information</h2>
    <input data-next-checkout-field="email" type="email" required>
    <input data-next-checkout-field="fname" required>
    <input data-next-checkout-field="lname" required>
    <button type="button" data-step-button="next">Continue to Shipping</button>
  </div>

  <!-- Step 2: Shipping -->
  <div data-checkout-step="2" class="checkout-step hidden">
    <h2>Shipping Address</h2>
    <input data-next-checkout-field="address1" required>
    <input data-next-checkout-field="city" required>
    <!-- ... other shipping fields -->
    <button type="button" data-step-button="prev">Back</button>
    <button type="button" data-step-button="next">Continue to Payment</button>
  </div>

  <!-- Step 3: Payment -->
  <div data-checkout-step="3" class="checkout-step hidden">
    <h2>Payment</h2>
    <!-- ... payment fields -->
    <button type="button" data-step-button="prev">Back</button>
    <button type="submit">Complete Order</button>
  </div>
</form>

<style>
  .checkout-step.hidden {
    display: none;
  }
  .checkout-step.active {
    display: block;
  }
</style>

<script>
  window.Next.init({
    apiKey: 'your-api-key',
    campaignId: 'your-campaign-id'
  }).then(async (sdk) => {
    const checkoutStore = window.Next.stores.checkout;
    const form = document.querySelector('[data-next-checkout-form]');
    await sdk.enhancers.register('checkout-form', form);

    // Step navigation logic
    let currentStep = 1;

    function showStep(stepNumber) {
      document.querySelectorAll('[data-checkout-step]').forEach(step => {
        step.classList.remove('active');
        step.classList.add('hidden');
      });

      const stepEl = document.querySelector(`[data-checkout-step="${stepNumber}"]`);
      stepEl.classList.add('active');
      stepEl.classList.remove('hidden');

      currentStep = stepNumber;
      checkoutStore.setStep(stepNumber);
    }

    // Next button handlers
    document.querySelectorAll('[data-step-button="next"]').forEach(btn => {
      btn.addEventListener('click', () => {
        // Validate current step before proceeding
        if (currentStep === 1) {
          const email = checkoutStore.getState().formData.email;
          const fname = checkoutStore.getState().formData.fname;
          const lname = checkoutStore.getState().formData.lname;

          if (!email || !fname || !lname) {
            alert('Please fill in all required fields');
            return;
          }
        }

        if (currentStep === 2) {
          const address1 = checkoutStore.getState().formData.address1;
          const city = checkoutStore.getState().formData.city;

          if (!address1 || !city) {
            alert('Please fill in all required shipping fields');
            return;
          }
        }

        showStep(currentStep + 1);
      });
    });

    // Previous button handlers
    document.querySelectorAll('[data-step-button="prev"]').forEach(btn => {
      btn.addEventListener('click', () => {
        showStep(currentStep - 1);
      });
    });
  });
</script>
```

---

## Key Considerations

### 1. Data Persistence
- The `checkoutStore` automatically persists `formData` across steps
- All fields using `data-next-checkout-field` are auto-saved
- No manual state management needed

### 2. Validation
- CheckoutFormEnhancer has built-in validation via `CheckoutValidator`
- Validate each step before allowing navigation to next step
- Use `checkoutStore.getState().formData` to check field values

### 3. Analytics
- `begin_checkout` event fires on step 1 (email entry)
- `add_shipping_info` fires when shipping address is complete (step 2)
- `add_payment_info` fires when payment method is selected (step 3)
- `purchase` fires on successful order completion

### 4. Field Attributes Required

All form fields must have either:
- `data-next-checkout-field="fieldname"`
- `os-checkout-field="fieldname"`

Example:
```html
<input type="email" data-next-checkout-field="email" required>
```

### 5. Express Checkout Compatibility

The multi-step flow should handle express checkout (Apple Pay, Google Pay, PayPal) by:
1. Collecting express payment data
2. Skipping directly to confirmation
3. Bypassing intermediate steps

---

## Recommended Approach

**Use Option 1 (URL-Based Multi-Step)** for:
- Better UX with browser navigation
- Clearer progress tracking
- Easier debugging and testing
- Standard e-commerce behavior

**Use Option 2 (Single Page)** for:
- Faster step transitions
- Single form submission
- Simpler deployment (one HTML file)

---

## Next Steps

1. Choose your approach (URL-based or single-page)
2. Create the HTML structure for each step
3. Initialize `CheckoutFormEnhancer` on each page/step
4. Add step validation before navigation
5. Test the complete flow end-to-end
6. Add progress indicators (step counter, breadcrumbs)

---

## Example Step Indicator

```html
<div class="checkout-progress">
  <div class="step active">
    <span class="step-number">1</span>
    <span class="step-name">Information</span>
  </div>
  <div class="step">
    <span class="step-number">2</span>
    <span class="step-name">Shipping</span>
  </div>
  <div class="step">
    <span class="step-number">3</span>
    <span class="step-name">Payment</span>
  </div>
</div>

<script>
  const checkoutStore = window.Next.stores.checkout;
  const currentStep = checkoutStore.getState().step;

  document.querySelectorAll('.checkout-progress .step').forEach((el, index) => {
    if (index + 1 === currentStep) {
      el.classList.add('active');
    }
  });
</script>
```

---

## Support

The `CheckoutFormEnhancer` is **fully compatible** with multi-step checkout because:
- ✅ Store state persists across page loads (when using proper initialization)
- ✅ Field scanning works on partial forms (only the fields present on current step)
- ✅ Validation runs independently on each step
- ✅ Form submission only happens on final step

You don't need to modify the core `CheckoutFormEnhancer` code - just structure your HTML and navigation logic appropriately!
