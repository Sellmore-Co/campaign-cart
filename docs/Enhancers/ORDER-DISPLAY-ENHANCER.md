# Order Display Enhancer - Attributes Reference

The `OrderDisplayEnhancer` displays order data using the unified `data-next-display="order.xxx"` pattern. It automatically loads order data from URL parameters and provides real-time updates when order data changes.

## Table of Contents

- [Core Display Attributes](#core-display-attributes)
- [Auto-Loading Behavior](#auto-loading-behavior)
- [Basic Order Properties](#basic-order-properties)
- [Financial Properties](#financial-properties)
- [Customer/User Properties](#customer-user-properties)
- [Address Properties](#address-properties)
- [Line Items/Products Properties](#line-items-products-properties)
- [Attribution Properties](#attribution-properties)
- [Calculated/Boolean Properties](#calculated-boolean-properties)
- [Formatting & Conditional Attributes](#formatting--conditional-attributes)
- [Complete Examples](#complete-examples)
- [Best Practices](#best-practices)

---

## Core Display Attributes

### Primary Display Attribute

```html
data-next-display="order.{property}"
```

This is the main attribute that tells the enhancer what property to display from the loaded order data.

### Auto-Loading Support

The enhancer automatically loads order data when a `ref_id` parameter is found in the URL:
```
https://yoursite.com/receipt?ref_id=ORD123456
```

---

## Auto-Loading Behavior

The OrderDisplayEnhancer automatically:

1. **Checks URL for `ref_id` parameter** on initialization
2. **Loads order data** from the API if `ref_id` is found
3. **Updates all display elements** when order data loads
4. **Handles loading states** with CSS classes:
   - `next-loading` - Applied while loading
   - `next-loaded` - Applied when successfully loaded
   - `next-error` - Applied on load errors

---

## Basic Order Properties

| Property | Description | Example Output |
|----------|-------------|----------------|
| `number` | Order number | `"ORD-123456"` |
| `status` | Order status | `"Completed"` |
| `refId` | Order reference ID | `"abc123def456"` |
| `currency` | Order currency | `"USD"` |
| `created_at` | Formatted creation date | `"Jan 15, 2024"` |
| `created_at.raw` | Raw ISO date string | `"2024-01-15T10:30:00Z"` |
| `isTest` | Boolean if test order | `true`/`false` |
| `testBadge` | Test order indicator | `"🧪 TEST ORDER"` or `""` |
| `statusUrl` | Order status page URL | `"https://..."` |
| `supportsUpsells` | Boolean for upsell support | `true`/`false` |
| `paymentMethod` | Payment method used | `"Credit Card"` |
| `shippingMethod` | Shipping method | `"Standard Shipping"` |
| `shippingCode` | Shipping service code | `"USPS_GROUND"` |

### Examples

```html
<!-- Basic order info -->
<h1>Order #<span data-next-display="order.number">Loading...</span></h1>
<p>Status: <span data-next-display="order.status">Loading...</span></p>
<p>Date: <span data-next-display="order.created_at">Loading...</span></p>

<!-- Test order badge -->
<div data-next-display="order.testBadge" data-next-hide-if-empty="true" class="test-badge">
  🧪 TEST ORDER
</div>

<!-- Order status link -->
<a data-next-display="order.statusUrl" href="#">View Order Status</a>
```

---

## Financial Properties

| Property | Formatted | Raw | Description |
|----------|-----------|-----|-------------|
| `total` | ✅ | `total.raw` | Total including tax |
| `subtotal` | ✅ | `subtotal.raw` | Total excluding tax |
| `tax` | ✅ | `tax.raw` | Tax amount |
| `shipping` | ✅ | `shipping.raw` | Shipping cost |
| `discounts` | ✅ | `discounts.raw` | Total discounts |

### Examples

```html
<!-- Formatted currency (default) -->
<div class="order-summary">
  <div class="line">
    <span>Subtotal:</span>
    <span data-next-display="order.subtotal">$0.00</span>
  </div>
  <div class="line">
    <span>Shipping:</span>
    <span data-next-display="order.shipping">$0.00</span>
  </div>
  <div class="line" data-next-display="order.hasTax" data-next-hide-if-false="true">
    <span>Tax:</span>
    <span data-next-display="order.tax">$0.00</span>
  </div>
  <div class="line" data-next-display="order.hasDiscounts" data-next-hide-if-false="true">
    <span>Discounts:</span>
    <span data-next-display="order.discounts">-$0.00</span>
  </div>
  <div class="total-line">
    <span>Total:</span>
    <span data-next-display="order.total">$0.00</span>
  </div>
</div>

<!-- Raw values for calculations -->
<div data-next-display="order.total.raw*0.1">Tax (10%): $0.00</div>
<div data-next-display="order.subtotal.raw+5.99">Subtotal + Handling: $0.00</div>
```

---

## Customer/User Properties

Access customer information with `order.user.{property}` or `order.customer.{property}`:

| Property | Description | Example Output |
|----------|-------------|----------------|
| `name` | Full name (first + last) | `"John Smith"` |
| `email` | Email address | `"john@example.com"` |
| `firstName` | First name only | `"John"` |
| `lastName` | Last name only | `"Smith"` |
| `phone` | Phone number | `"+1234567890"` |
| `acceptsMarketing` | Marketing consent | `true`/`false` |
| `language` | Customer language | `"en"` |
| `ip` | IP address | `"192.168.1.1"` |

### Examples

```html
<!-- Customer details -->
<div class="customer-info">
  <h3>Customer Information</h3>
  <p><strong>Name:</strong> <span data-next-display="order.user.name">Loading...</span></p>
  <p><strong>Email:</strong> <span data-next-display="order.user.email">Loading...</span></p>
  <p><strong>Phone:</strong> <span data-next-display="order.user.phone">N/A</span></p>
</div>

<!-- Conditional marketing status -->
<div data-next-display="order.user.acceptsMarketing" data-next-hide-if-false="true">
  ✅ Subscribed to marketing emails
</div>
```

---

## Address Properties

### Shipping Address: `order.shippingAddress.{property}`
### Billing Address: `order.billingAddress.{property}`

| Property | Description | Example Output |
|----------|-------------|----------------|
| `full` | Complete formatted address | `"123 Main St, City, State, 12345, Country"` |
| `name` | Full name on address | `"John Smith"` |
| `line1` | Street address line 1 | `"123 Main Street"` |
| `line2` | Street address line 2 | `"Apt 4B"` |
| `city` | City | `"New York"` |
| `state` | State/Province | `"NY"` |
| `zip` / `postcode` | ZIP/Postal code | `"10001"` |
| `country` | Country | `"United States"` |
| `phone` | Phone number | `"+1234567890"` |

### Examples

```html
<!-- Shipping address -->
<div class="shipping-address">
  <h3>Shipping Address</h3>
  <div data-next-display="order.shippingAddress.name">Name</div>
  <div data-next-display="order.shippingAddress.line1">Address Line 1</div>
  <div data-next-display="order.shippingAddress.line2" data-next-hide-if-empty="true">Line 2</div>
  <div>
    <span data-next-display="order.shippingAddress.city">City</span>,
    <span data-next-display="order.shippingAddress.state">State</span>
    <span data-next-display="order.shippingAddress.zip">ZIP</span>
  </div>
  <div data-next-display="order.shippingAddress.country">Country</div>
</div>

<!-- Billing address (if different) -->
<div class="billing-address">
  <h3>Billing Address</h3>
  <div data-next-display="order.billingAddress.full">Full address</div>
</div>

<!-- One-liner address -->
<p>Ship to: <span data-next-display="order.shippingAddress.full">Loading...</span></p>
```

---

## Line Items/Products Properties

Access order items with `order.items.{property}` or `order.lines.{property}`:

### Summary Properties

| Property | Description | Example Output |
|----------|-------------|----------------|
| `count` | Number of line items | `3` |
| `totalQuantity` | Total quantity across all items | `5` |
| `upsellCount` | Number of upsell items | `1` |
| `mainProduct` | Title of first product | `"Premium Supplement"` |
| `mainProductSku` | SKU of first product | `"SUP-001"` |

### Individual Item Properties: `order.lines[0].{property}`

| Property | Formatted | Raw | Description |
|----------|-----------|-----|-------------|
| `title` / `product_title` | - | - | Product title |
| `sku` / `product_sku` | - | - | Product SKU |
| `quantity` | - | - | Item quantity |
| `price` | ✅ | `price.raw` | Unit price |
| `total` | ✅ | `total.raw` | Line total |
| `isUpsell` | - | - | Boolean if upsell item |
| `image` | - | - | Product image URL |

### Examples

```html
<!-- Order summary -->
<div class="order-items-summary">
  <p>Items: <span data-next-display="order.items.count">0</span></p>
  <p>Total Quantity: <span data-next-display="order.items.totalQuantity">0</span></p>
  <p>Main Product: <span data-next-display="order.items.mainProduct">Loading...</span></p>
</div>

<!-- First product details -->
<div class="main-product">
  <h3 data-next-display="order.lines[0].title">Product Name</h3>
  <p>SKU: <span data-next-display="order.lines[0].sku">Loading...</span></p>
  <p>Quantity: <span data-next-display="order.lines[0].quantity">1</span></p>
  <p>Price: <span data-next-display="order.lines[0].price">$0.00</span></p>
  <p>Total: <span data-next-display="order.lines[0].total">$0.00</span></p>
</div>

<!-- Upsell indicator -->
<div data-next-display="order.hasUpsells" data-next-hide-if-false="true">
  🎉 Includes <span data-next-display="order.items.upsellCount">0</span> bonus items!
</div>

<!-- Product image -->
<img data-next-display="order.lines[0].image" src="#" alt="Product" style="max-width: 100px;">
```

---

## Attribution Properties

Access marketing attribution with `order.attribution.{property}`:

| Property | Aliases | Description | Example Output |
|----------|---------|-------------|----------------|
| `source` | `utm_source` | Traffic source | `"google"` |
| `medium` | `utm_medium` | Traffic medium | `"cpc"` |
| `campaign` | `utm_campaign` | Campaign name | `"summer_sale"` |
| `term` | `utm_term` | Campaign term | `"supplements"` |
| `content` | `utm_content` | Campaign content | `"banner_ad"` |
| `gclid` | - | Google Click ID | `"abc123def456"` |
| `funnel` | - | Funnel name | `"main_funnel"` |
| `affiliate` | - | Affiliate ID | `"AFF001"` |
| `hasTracking` | - | Boolean if any tracking data | `true`/`false` |

### Examples

```html
<!-- Attribution details -->
<div class="attribution-info" data-next-display="order.attribution.hasTracking" data-next-hide-if-false="true">
  <h3>Marketing Attribution</h3>
  <p>Source: <span data-next-display="order.attribution.source">Direct</span></p>
  <p>Medium: <span data-next-display="order.attribution.medium">N/A</span></p>
  <p>Campaign: <span data-next-display="order.attribution.campaign">N/A</span></p>
</div>

<!-- Affiliate tracking -->
<div data-next-display="order.attribution.affiliate" data-next-hide-if-empty="true">
  Referred by: <span data-next-display="order.attribution.affiliate">Affiliate</span>
</div>
```

---

## Calculated/Boolean Properties

| Property | Description | Example Output |
|----------|-------------|----------------|
| `hasItems` | Boolean if order has items | `true`/`false` |
| `isEmpty` | Boolean if order is empty | `true`/`false` |
| `hasShipping` | Boolean if shipping cost > 0 | `true`/`false` |
| `hasTax` | Boolean if tax amount > 0 | `true`/`false` |
| `hasDiscounts` | Boolean if discounts applied | `true`/`false` |
| `hasUpsells` | Boolean if order contains upsells | `true`/`false` |

### Examples

```html
<!-- Conditional sections -->
<div data-next-display="order.hasShipping" data-next-hide-if-false="true">
  <p>Shipping: <span data-next-display="order.shipping">$0.00</span></p>
</div>

<div data-next-display="order.hasDiscounts" data-next-hide-if-false="true">
  <div class="discount-applied">
    💰 You saved <span data-next-display="order.discounts">$0.00</span>!
  </div>
</div>

<div data-next-display="order.isEmpty" data-next-hide-if-false="true">
  <p>No items found in this order.</p>
</div>
```

---

## Formatting & Conditional Attributes

Since `OrderDisplayEnhancer` extends `BaseDisplayEnhancer`, it inherits powerful formatting and conditional display capabilities:

### Mathematical Transformations

```html
<!-- Calculate tips or fees -->
<div data-next-display="order.total.raw*0.15">Suggested tip (15%): $0.00</div>
<div data-next-display="order.subtotal.raw+2.99">Subtotal + Processing: $0.00</div>

<!-- Per-item calculations -->
<div data-next-display="order.total.raw/items.totalQuantity">Average per item: $0.00</div>
```

### Conditional Display

```html
<!-- Hide if value is zero -->
<div data-next-display="order.tax" data-next-hide-if-zero="true">Tax: $0.00</div>

<!-- Hide if empty -->
<div data-next-display="order.user.phone" data-next-hide-if-empty="true">Phone: N/A</div>

<!-- Show only for test orders -->
<div data-next-display="order.isTest" data-next-hide-if-false="true" class="test-warning">
  ⚠️ This is a test order
</div>
```

### Custom Format Types

```html
<!-- Force specific formatting -->
<div data-next-display="order.total" data-next-format="currency">$99.99</div>
<div data-next-display="order.items.count" data-next-format="number">3</div>
<div data-next-display="order.created_at" data-next-format="date">Jan 15, 2024</div>
```

---

## Complete Examples

### Receipt Page

```html
<!DOCTYPE html>
<html>
<head>
  <title>Order Receipt</title>
</head>
<body>
  <!-- Order loads automatically from ?ref_id=xxx in URL -->
  
  <div class="receipt-container">
    <!-- Header -->
    <header class="receipt-header">
      <h1>Order Confirmation</h1>
      <div class="order-number">
        Order #<span data-next-display="order.number">Loading...</span>
      </div>
      <div class="order-date" data-next-display="order.created_at">Loading...</div>
      
      <!-- Test order badge -->
      <div data-next-display="order.testBadge" data-next-hide-if-empty="true" class="test-badge">
        🧪 TEST ORDER
      </div>
    </header>

    <!-- Customer Info -->
    <section class="customer-section">
      <h2>Customer Information</h2>
      <div class="customer-details">
        <p><strong>Name:</strong> <span data-next-display="order.user.name">Loading...</span></p>
        <p><strong>Email:</strong> <span data-next-display="order.user.email">Loading...</span></p>
        <p><strong>Phone:</strong> <span data-next-display="order.user.phone" data-next-hide-if-empty="true">N/A</span></p>
      </div>
    </section>

    <!-- Shipping Address -->
    <section class="shipping-section">
      <h2>Shipping Address</h2>
      <div class="address-block">
        <div data-next-display="order.shippingAddress.name">Name</div>
        <div data-next-display="order.shippingAddress.line1">Address</div>
        <div data-next-display="order.shippingAddress.line2" data-next-hide-if-empty="true">Line 2</div>
        <div>
          <span data-next-display="order.shippingAddress.city">City</span>,
          <span data-next-display="order.shippingAddress.state">State</span>
          <span data-next-display="order.shippingAddress.zip">ZIP</span>
        </div>
        <div data-next-display="order.shippingAddress.country">Country</div>
      </div>
    </section>

    <!-- Order Items -->
    <section class="items-section">
      <h2>Order Items (<span data-next-display="order.items.count">0</span>)</h2>
      
      <!-- Main product -->
      <div class="order-item">
        <div class="item-details">
          <h3 data-next-display="order.lines[0].title">Product Name</h3>
          <p>SKU: <span data-next-display="order.lines[0].sku">Loading...</span></p>
          <p>Quantity: <span data-next-display="order.lines[0].quantity">1</span></p>
        </div>
        <div class="item-price">
          <span data-next-display="order.lines[0].total">$0.00</span>
        </div>
      </div>
      
      <!-- Upsell indicator -->
      <div data-next-display="order.hasUpsells" data-next-hide-if-false="true" class="upsell-notice">
        🎉 Includes <span data-next-display="order.items.upsellCount">0</span> bonus items!
      </div>
    </section>

    <!-- Order Summary -->
    <section class="summary-section">
      <h2>Order Summary</h2>
      <div class="summary-lines">
        <div class="summary-line">
          <span>Subtotal:</span>
          <span data-next-display="order.subtotal">$0.00</span>
        </div>
        <div class="summary-line" data-next-display="order.hasShipping" data-next-hide-if-false="true">
          <span>Shipping (<span data-next-display="order.shippingMethod">Standard</span>):</span>
          <span data-next-display="order.shipping">$0.00</span>
        </div>
        <div class="summary-line" data-next-display="order.hasTax" data-next-hide-if-false="true">
          <span>Tax:</span>
          <span data-next-display="order.tax">$0.00</span>
        </div>
        <div class="summary-line discount" data-next-display="order.hasDiscounts" data-next-hide-if-false="true">
          <span>Discounts:</span>
          <span data-next-display="order.discounts">-$0.00</span>
        </div>
        <div class="summary-line total">
          <span><strong>Total:</strong></span>
          <span><strong data-next-display="order.total">$0.00</strong></span>
        </div>
      </div>
    </section>

    <!-- Attribution (for internal tracking) -->
    <section class="attribution-section" data-next-display="order.attribution.hasTracking" data-next-hide-if-false="true">
      <details>
        <summary>Marketing Attribution</summary>
        <p>Source: <span data-next-display="order.attribution.source">Direct</span></p>
        <p>Medium: <span data-next-display="order.attribution.medium">N/A</span></p>
        <p>Campaign: <span data-next-display="order.attribution.campaign">N/A</span></p>
      </details>
    </section>

    <!-- Footer -->
    <footer class="receipt-footer">
      <p>Payment Method: <span data-next-display="order.paymentMethod">Credit Card</span></p>
      <p>Order Status: <span data-next-display="order.status">Completed</span></p>
      <a data-next-display="order.statusUrl" href="#" class="status-link">Track Your Order</a>
    </footer>
  </div>
</body>
</html>
```

### Admin Order Details

```html
<div class="admin-order-details">
  <!-- Order Header -->
  <div class="order-header">
    <h1>Order #<span data-next-display="order.number">Loading...</span></h1>
    <div class="order-meta">
      <span class="status" data-next-display="order.status">Status</span>
      <span class="date" data-next-display="order.created_at">Date</span>
      <span data-next-display="order.testBadge" data-next-hide-if-empty="true" class="test-badge">TEST</span>
    </div>
  </div>

  <!-- Quick Stats -->
  <div class="quick-stats">
    <div class="stat">
      <label>Total</label>
      <value data-next-display="order.total">$0.00</value>
    </div>
    <div class="stat">
      <label>Items</label>
      <value data-next-display="order.items.count">0</value>
    </div>
    <div class="stat">
      <label>Quantity</label>
      <value data-next-display="order.items.totalQuantity">0</value>
    </div>
    <div class="stat" data-next-display="order.hasUpsells" data-next-hide-if-false="true">
      <label>Upsells</label>
      <value data-next-display="order.items.upsellCount">0</value>
    </div>
  </div>

  <!-- Technical Details -->
  <div class="technical-details">
    <h3>Technical Information</h3>
    <p>Order ID: <code data-next-display="order.refId">Loading...</code></p>
    <p>Currency: <span data-next-display="order.currency">USD</span></p>
    <p>Customer IP: <span data-next-display="order.user.ip">N/A</span></p>
    <p>Language: <span data-next-display="order.user.language">en</span></p>
    <p>Marketing Consent: <span data-next-display="order.user.acceptsMarketing">false</span></p>
  </div>

  <!-- Raw Data (for debugging) -->
  <div class="raw-calculations">
    <h3>Raw Values (for calculations)</h3>
    <p>Subtotal (raw): $<span data-next-display="order.subtotal.raw">0</span></p>
    <p>Tax (raw): $<span data-next-display="order.tax.raw">0</span></p>
    <p>Shipping (raw): $<span data-next-display="order.shipping.raw">0</span></p>
    <p>Total (raw): $<span data-next-display="order.total.raw">0</span></p>
    
    <!-- Custom calculations -->
    <p>Commission (5%): $<span data-next-display="order.total.raw*0.05">0.00</span></p>
    <p>Processing Fee: $<span data-next-display="order.total.raw*0.029+0.30">0.00</span></p>
  </div>
</div>
```

---

## Best Practices

### 1. Provide Loading States

```html
<!-- Good: Meaningful loading text -->
<div data-next-display="order.total">Loading...</div>
<div data-next-display="order.user.name">Loading customer...</div>

<!-- Poor: Empty or unclear -->
<div data-next-display="order.total"></div>
```

### 2. Use Conditional Display for Optional Data

```html
<!-- Good: Hide empty fields -->
<div data-next-display="order.user.phone" data-next-hide-if-empty="true">
  Phone: <span data-next-display="order.user.phone">N/A</span>
</div>

<!-- Good: Show sections only when relevant -->
<div data-next-display="order.hasDiscounts" data-next-hide-if-false="true">
  <h3>Discounts Applied</h3>
  <p>You saved <span data-next-display="order.discounts">$0.00</span>!</p>
</div>
```

### 3. Handle Test Orders Appropriately

```html
<!-- Good: Clear test order indication -->
<div data-next-display="order.isTest" data-next-hide-if-false="true" class="test-warning">
  ⚠️ This is a test order and will not be fulfilled
</div>

<!-- Good: Test badge -->
<span data-next-display="order.testBadge" data-next-hide-if-empty="true" class="badge">
  🧪 TEST ORDER
</span>
```

### 4. Use Raw Values for Calculations

```html
<!-- Good: Use raw values for math -->
<div data-next-display="order.total.raw*0.15">Tip (15%): $0.00</div>
<div data-next-display="order.subtotal.raw+order.shipping.raw">Subtotal + Shipping: $0.00</div>

<!-- Poor: Don't calculate with formatted strings -->
<div data-next-display="order.total*0.15">Won't work correctly</div>
```

### 5. Structure Information Logically

```html
<!-- Good: Organized sections -->
<section class="customer-info">
  <h2>Customer</h2>
  <p data-next-display="order.user.name">Name</p>
  <p data-next-display="order.user.email">Email</p>
</section>

<section class="shipping-info">
  <h2>Shipping</h2>
  <div data-next-display="order.shippingAddress.full">Address</div>
</section>
```

---

## Error Handling

### Loading States

The enhancer automatically applies CSS classes for different states:

```css
/* Style loading state */
.next-loading {
  opacity: 0.6;
  pointer-events: none;
}

/* Style loaded state */
.next-loaded {
  opacity: 1;
}

/* Style error state */
.next-error {
  color: #e74c3c;
}
.next-error::after {
  content: " (Error loading data)";
  font-size: 0.8em;
}
```

### Fallback Content

Always provide meaningful fallback content:

```html
<!-- Good fallbacks -->
<div data-next-display="order.number">Order not found</div>
<div data-next-display="order.user.name">Guest Customer</div>
<div data-next-display="order.total">$0.00</div>
```

---

## Troubleshooting

### Common Issues

1. **Order not loading**: Check that `ref_id` parameter is in the URL
2. **Empty displays**: Verify the property names match your order data structure
3. **Formatting issues**: Use `.raw` suffix for calculations, formatted version for display
4. **Missing data**: Use conditional display attributes to hide empty fields

### Debug Tips

- Check browser console for API errors
- Verify order data structure matches expected properties
- Use browser dev tools to inspect element classes (`next-loading`, `next-loaded`, `next-error`)
- Test with a known valid `ref_id` parameter

### URL Parameter Format

```
✅ Correct: https://site.com/receipt?ref_id=abc123
❌ Wrong: https://site.com/receipt?order_id=abc123
❌ Wrong: https://site.com/receipt?id=abc123
```

The parameter must be exactly `ref_id` to trigger auto-loading. 