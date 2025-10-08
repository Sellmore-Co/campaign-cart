# Checkout Review Enhancer

The `CheckoutReviewEnhancer` automatically displays stored checkout data from previous steps, allowing users to review their information before completing their order.

## Features

- ✅ Automatically reads from `checkoutStore`
- ✅ Supports multiple format types (text, address, name, phone, currency)
- ✅ Auto-updates when checkout data changes
- ✅ Supports custom fallback text
- ✅ Works with any container element

## Basic Usage

### Simple Text Fields

Display individual checkout fields:

```html
<div data-next-enhancer="checkout-review">
  <div class="review-row">
    <span class="label">Contact:</span>
    <span data-next-checkout-review="email"></span>
  </div>

  <div class="review-row">
    <span class="label">Phone:</span>
    <span data-next-checkout-review="phone" data-next-format="phone"></span>
  </div>
</div>
```

### Full Address

Display formatted address:

```html
<div data-next-enhancer="checkout-review">
  <div class="review-row">
    <span class="label">Ship to:</span>
    <address data-next-checkout-review="address1" data-next-format="address"></address>
  </div>
</div>
```

### Full Name

Display full name (combines fname + lname):

```html
<div data-next-enhancer="checkout-review">
  <div class="review-row">
    <span class="label">Name:</span>
    <span data-next-checkout-review="fname" data-next-format="name"></span>
  </div>
</div>
```

## Complete Example

Here's a Shopify-style review section:

```html
<section aria-label="Review" class="checkout-review" data-next-enhancer="checkout-review">
  <h2>Review your information</h2>

  <div class="review-table">
    <!-- Contact -->
    <div class="review-row">
      <div class="review-cell">
        <div class="review-label">Contact</div>
        <div class="review-value" data-next-checkout-review="email"></div>
      </div>
      <div class="review-cell">
        <a href="information.html" class="review-change">Change</a>
      </div>
    </div>

    <!-- Shipping Address -->
    <div class="review-row">
      <div class="review-cell">
        <div class="review-label">Ship to</div>
        <address class="review-value" data-next-checkout-review="address1" data-next-format="address"></address>
      </div>
      <div class="review-cell">
        <a href="information.html" class="review-change">Change</a>
      </div>
    </div>

    <!-- Phone -->
    <div class="review-row">
      <div class="review-cell">
        <div class="review-label">Phone</div>
        <div class="review-value" data-next-checkout-review="phone" data-next-format="phone"></div>
      </div>
      <div class="review-cell">
        <a href="information.html" class="review-change">Change</a>
      </div>
    </div>
  </div>
</section>

<style>
  .checkout-review {
    margin: 2rem 0;
    padding: 1.5rem;
    border: 1px solid #ddd;
    border-radius: 8px;
  }

  .review-table {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .review-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 1rem;
    border-bottom: 1px solid #eee;
  }

  .review-row:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .review-cell {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .review-label {
    font-weight: 600;
    color: #333;
  }

  .review-value {
    color: #666;
  }

  .review-change {
    color: #0066cc;
    text-decoration: none;
    font-size: 0.9em;
  }

  .review-change:hover {
    text-decoration: underline;
  }

  /* Empty state styling */
  .next-review-empty {
    color: #999;
    font-style: italic;
  }
</style>
```

## Attributes Reference

| Attribute | Required | Description | Example |
|-----------|----------|-------------|---------|
| `data-next-enhancer` | Yes | Must be "checkout-review" on container | `data-next-enhancer="checkout-review"` |
| `data-next-checkout-review` | Yes | Field name to display | `data-next-checkout-review="email"` |
| `data-next-format` | No | Format type (text, address, name, phone, currency) | `data-next-format="address"` |
| `data-next-fallback` | No | Text to show if field is empty | `data-next-fallback="Not provided"` |

## Available Fields

All fields from `checkoutStore.formData`:

- `email` - Customer email
- `fname` - First name
- `lname` - Last name
- `phone` - Phone number
- `address1` - Street address
- `address2` - Apartment, suite, etc.
- `city` - City
- `province` - State/Province
- `postal` - ZIP/Postal code
- `country` - Country code

## Format Types

### `text` (default)

Displays the raw value as text:

```html
<span data-next-checkout-review="email"></span>
<!-- Output: john@example.com -->
```

### `address`

Combines multiple address fields into a formatted address:

```html
<address data-next-checkout-review="address1" data-next-format="address"></address>
<!-- Output: 1949 East Camelback Road, Phoenix AZ 85016, United States -->
```

Includes: address1, address2 (if provided), city, province, postal, country

### `name`

Combines first and last name:

```html
<span data-next-checkout-review="fname" data-next-format="name"></span>
<!-- Output: John Doe -->
```

### `phone`

Formats phone numbers:

```html
<span data-next-checkout-review="phone" data-next-format="phone"></span>
<!-- Output: (555) 123-4567 -->
```

### `currency`

Formats numeric values as currency:

```html
<span data-next-checkout-review="shippingMethod.price" data-next-format="currency"></span>
<!-- Output: $9.99 -->
```

## Nested Fields

You can access nested fields using dot notation:

```html
<span data-next-checkout-review="billingAddress.city"></span>
```

## Fallback Text

Provide fallback text for empty fields:

```html
<span data-next-checkout-review="address2" data-next-fallback="No apartment number"></span>
```

When the field is empty, it will display "No apartment number" and add the `next-review-empty` CSS class.

## Auto-Updates

The enhancer automatically subscribes to checkout store changes. If the user goes back and updates their information, the review section will update immediately when they return to the review page.

## CSS Classes

The enhancer adds the following CSS classes:

- `next-review-empty` - Added to elements when the field value is empty or uses fallback text

## JavaScript Access

You can also manually register the enhancer:

```javascript
const reviewContainer = document.querySelector('.checkout-review');
const enhancer = await sdk.enhancers.register('checkout-review', reviewContainer);
```

## Notes

- The enhancer must be placed inside a container with `data-next-enhancer="checkout-review"`
- All review fields within the container will be automatically populated
- The enhancer subscribes to checkout store updates for real-time changes
- Country codes are automatically converted to full country names
