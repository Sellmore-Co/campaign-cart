# Order Conditionals Guide

This guide covers all available order conditional attributes that allow you to show/hide elements based on order state, existence, and freshness.

## Order Existence & State

### Basic Order Existence

```html
<!-- Check if order exists in store -->
<div data-next-show="order.exists">Order found!</div>
<div data-next-show="order.hasOrder">Same as order.exists</div>

<!-- Hide content when no order exists -->
<div data-next-hide="order.exists">No order data available</div>
```

### Order Loading States

```html
<!-- Check if order is fully loaded (not loading, no error) -->
<div data-next-show="order.isLoaded">Order fully loaded</div>

<!-- Show loading indicator -->
<div data-next-show="order.isLoading">
  <div class="spinner">Loading order...</div>
</div>

<!-- Show error state -->
<div data-next-show="order.hasError">
  <div class="error">Error loading order. Please try again.</div>
</div>
```

## Order Freshness 

Simple and clear properties for checking when orders were placed:

### Order Age (When Order Was Placed)

```html
<!-- Show content for orders PLACED less than 15 minutes ago -->
<div data-next-show="order.isRecent">
  <div class="success-banner">
    ✅ Thank you! Your order was just placed.
  </div>
</div>

<!-- Alternative names (all do the same thing) -->
<div data-next-show="order.isRecentOrder">Same as isRecent</div>
<div data-next-show="order.isNewOrder">Same as isRecent</div>
<div data-next-show="order.wasPlacedRecently">Same as isRecent</div>

<!-- Show content for older orders -->
<div data-next-show="order.isExpired">
  This order was placed more than 15 minutes ago
</div>

<!-- Alternative names -->
<div data-next-show="order.isOldOrder">Same as isExpired</div>
<div data-next-show="order.wasPlacedLongAgo">Same as isExpired</div>
```

### Cache Status (Advanced Use Only)

For debugging or advanced use cases, you can check cache status:

```html
<!-- Check if cache is fresh (loaded < 15 min ago) -->
<div data-next-show="order.isCacheFresh">
  Cache is fresh
</div>

<!-- Check if cache is expired (loaded ≥ 15 min ago) -->
<div data-next-show="order.isCacheExpired">
  Cache needs refresh
</div>
```

### Real-World Examples

```html
<!-- Success message for recent orders -->
<div data-next-show="order.isRecent">
  🎉 Thank you for your order! You'll receive an email confirmation shortly.
</div>

<!-- Different message for older orders -->
<div data-next-show="order.isExpired">
  📋 Viewing order #<span data-next-display="order.number"></span>
</div>

<!-- Simple order age indicator -->
<div class="order-status">
  <span data-next-show="order.isRecent" class="new">✨ New Order</span>
  <span data-next-show="order.isExpired" class="old">📋 Past Order</span>
</div>
```

## Order Content Properties

These require an order to exist in the store:

### Order Status

```html
<!-- Test order badge -->
<div data-next-show="order.isTest">
  <span class="test-badge">🧪 TEST ORDER</span>
</div>

<!-- Order has items -->
<div data-next-show="order.hasItems">Order contains items</div>
<div data-next-show="order.isEmpty">Order is empty</div>
```

### Financial Conditions

```html
<!-- Shipping conditions -->
<div data-next-show="order.hasShipping">
  Shipping charges apply: <span data-next-display="order.shipping"></span>
</div>

<!-- Tax conditions -->
<div data-next-show="order.hasTax">
  Tax: <span data-next-display="order.tax"></span>
</div>

<!-- Discount conditions -->
<div data-next-show="order.hasDiscounts">
  Discounts applied: <span data-next-display="order.discounts"></span>
</div>

<!-- Upsell conditions -->
<div data-next-show="order.hasUpsells">
  This order includes additional products
</div>

<!-- Check if order accepts post-purchase upsells -->
<div data-next-show="order.supportsUpsells">
  <div class="upsell-opportunity">
    🎁 Add more items to your order!
  </div>
</div>
```

### Order Value Comparisons

```html
<!-- High value orders -->
<div data-next-show="order.total > 100">
  🎉 Thank you for your large order!
</div>

<!-- Bulk orders -->
<div data-next-show="order.totalQuantity >= 3">
  📦 Bulk order - expedited processing
</div>

<!-- Free shipping threshold -->
<div data-next-show="order.total >= 50">
  🚚 You qualified for free shipping!
</div>

<!-- Low shipping orders -->
<div data-next-hide="order.shipping < 5">
  Hidden when shipping is under $5
</div>
```

## Practical Use Cases

### Order Confirmation Page

```html
<!-- Main order confirmation (only for recent, existing orders) -->
<div data-next-show="order.exists && order.isRecent">
  <div class="order-confirmation">
    <h1>Order Confirmed!</h1>
    <p>Order #<span data-next-display="order.number"></span></p>
    <p>Total: <span data-next-display="order.total"></span></p>
    
    <!-- Show test warning if applicable -->
    <div data-next-show="order.isTest" class="test-warning">
      🧪 This is a test order - no charges were made
    </div>
  </div>
</div>

<!-- Loading state -->
<div data-next-show="order.isLoading">
  <div class="loading">
    <div class="spinner"></div>
    <p>Loading your order details...</p>
  </div>
</div>

<!-- Error state -->
<div data-next-show="order.hasError">
  <div class="error-state">
    <h2>Unable to load order</h2>
    <p>Please check your order link and try again.</p>
    <button onclick="location.reload()">Retry</button>
  </div>
</div>

<!-- Expired order warning -->
<div data-next-show="order.isExpired">
  <div class="expired-warning">
    ⚠️ This order information may be outdated.
    <button onclick="location.reload()">Refresh</button>
  </div>
</div>

<!-- No order found -->
<div data-next-hide="order.exists">
  <div class="no-order">
    <h2>No order found</h2>
    <p>Please check your order link or contact support.</p>
  </div>
</div>
```

### Order Status Dashboard

```html
<div class="order-dashboard">
  <!-- Order exists and is loaded -->
  <div data-next-show="order.isLoaded">
    <div class="order-summary">
      <h2>Order Summary</h2>
      
      <!-- Basic info always shown -->
      <div class="basic-info">
        <p>Order: <span data-next-display="order.number"></span></p>
        <p>Status: <span data-next-display="order.status"></span></p>
        <p>Total: <span data-next-display="order.total"></span></p>
      </div>
      
      <!-- Conditional sections -->
      <div data-next-show="order.hasShipping" class="shipping-section">
        <h3>Shipping</h3>
        <p>Method: <span data-next-display="order.shippingMethod"></span></p>
        <p>Cost: <span data-next-display="order.shipping"></span></p>
      </div>
      
      <div data-next-show="order.hasTax" class="tax-section">
        <h3>Tax</h3>
        <p>Tax: <span data-next-display="order.tax"></span></p>
      </div>
      
      <div data-next-show="order.hasDiscounts" class="discount-section">
        <h3>Discounts</h3>
        <p>Savings: <span data-next-display="order.discounts"></span></p>
      </div>
      
      <!-- Order age indicator -->
      <div class="order-age">
        <span data-next-show="order.isRecent" class="fresh">📅 Recent order</span>
        <span data-next-show="order.isExpired" class="expired">⏰ Order cache expired</span>
      </div>
    </div>
  </div>
</div>
```

### Marketing Messages

```html
<!-- Thank you message for high-value recent orders -->
<div data-next-show="order.isRecent && order.total > 200">
  <div class="vip-message">
    🌟 Thank you for being a valued customer!
    Your order qualifies for VIP support.
  </div>
</div>

<!-- Upsell opportunity for recent orders that support upsells -->
<div data-next-show="order.isRecent && order.supportsUpsells && !order.hasUpsells">
  <div class="upsell-banner">
    💡 Complete your order with these recommended accessories
  </div>
</div>

<!-- Show upsell button only if order accepts upsells -->
<div data-next-show="order.supportsUpsells">
  <button class="add-to-order">Add More Items</button>
</div>

<!-- Different message for orders that don't support upsells -->
<div data-next-hide="order.supportsUpsells">
  <p>This order is finalized and cannot be modified.</p>
</div>

<!-- Shipping promotion for qualifying orders -->
<div data-next-show="order.isRecent && order.total >= 50">
  <div class="shipping-message">
    🚚 Congratulations! You qualified for free shipping.
  </div>
</div>
```

## Technical Notes

### Order Date/Time
The order API response doesn't include a `created_at` field. When using `order.createdAt`, the SDK uses the `attribution.metadata.timestamp` field which represents when the order was placed. This timestamp is in milliseconds since epoch.

### Order Cache Expiration

- Orders are cached in sessionStorage for **15 minutes**
- `order.isRecent` returns `true` for orders less than 15 minutes old
- `order.isExpired` returns `true` for orders 15+ minutes old
- Expired orders are automatically refetched when accessed

### Order Loading Process

1. **No order**: `order.exists = false`
2. **Loading**: `order.isLoading = true`, `order.exists = false`
3. **Loaded**: `order.isLoaded = true`, `order.exists = true`, `order.isRecent = true`
4. **Error**: `order.hasError = true`, `order.exists = false`
5. **Expired**: `order.isExpired = true` (after 15 minutes)

### Performance Tips

- Use `order.exists` to check if any order data is available
- Use `order.isLoaded` to ensure order is fully loaded without errors
- Use `order.isRecent` for time-sensitive content like confirmations
- Combine conditions: `order.exists && order.isRecent && order.total > 50`

## Complete Property Reference

| Property | Type | Description |
|----------|------|-------------|
| `order.exists` | Boolean | Order exists in store |
| `order.hasOrder` | Boolean | Same as `exists` |
| `order.isLoaded` | Boolean | Order fully loaded (no loading, no error) |
| `order.isLoading` | Boolean | Order is currently loading |
| `order.hasError` | Boolean | Error occurred loading order |
| `order.isRecent` | Boolean | Order was placed < 15 minutes ago |
| `order.isRecentOrder` | Boolean | Same as `isRecent` |
| `order.isNewOrder` | Boolean | Same as `isRecent` |
| `order.wasPlacedRecently` | Boolean | Same as `isRecent` |
| `order.isExpired` | Boolean | Order was placed ≥ 15 minutes ago |
| `order.isOldOrder` | Boolean | Same as `isExpired` |
| `order.wasPlacedLongAgo` | Boolean | Same as `isExpired` |
| `order.isCacheFresh` | Boolean | Cache loaded < 15 minutes ago |
| `order.isCacheExpired` | Boolean | Cache loaded ≥ 15 minutes ago |
| `order.isTest` | Boolean | Test order flag |
| `order.hasItems` | Boolean | Order has line items |
| `order.isEmpty` | Boolean | Order has no items |
| `order.hasShipping` | Boolean | Shipping cost > $0 |
| `order.hasTax` | Boolean | Tax amount > $0 |
| `order.hasDiscounts` | Boolean | Discount amount > $0 |
| `order.hasUpsells` | Boolean | Order contains upsell items |
| `order.supportsUpsells` | Boolean | Order accepts post-purchase upsells |
| `order.acceptsUpsells` | Boolean | Same as `supportsUpsells` |
| `order.supportsPostPurchaseUpsells` | Boolean | Same as `supportsUpsells` |
| `order.total` | Number | Order total (for comparisons) |
| `order.subtotal` | Number | Order subtotal |
| `order.tax` | Number | Tax amount |
| `order.shipping` | Number | Shipping cost |
| `order.discounts` | Number | Discount amount |
| `order.itemCount` | Number | Number of line items |
| `order.totalQuantity` | Number | Total quantity of all items |