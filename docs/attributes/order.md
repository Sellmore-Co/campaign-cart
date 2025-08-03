# Order Attributes

Display order confirmation data. Requires order ID in URL (?ref_id=ORDER_ID) or manual loading.

## Basic Order Properties

```html
<span data-next-display="order.number">Order number</span>
<span data-next-display="order.refId">Order reference ID</span>
<span data-next-display="order.status">Order status</span>
<span data-next-display="order.createdAt">Order date (formatted)</span>
<span data-next-display="order.currency">Order currency</span>
<span data-next-display="order.paymentMethod">Payment method used</span>
<span data-next-display="order.shippingMethod">Shipping method used</span>
```

## Order Financial Data

```html
<span data-next-display="order.total">Order total including tax (formatted)</span>
<span data-next-display="order.subtotal">Order subtotal excluding tax (formatted)</span>
<span data-next-display="order.tax">Tax amount (formatted)</span>
<span data-next-display="order.shipping">Shipping cost including tax (formatted)</span>
<span data-next-display="order.shippingExclTax">Shipping cost excluding tax (formatted)</span>
<span data-next-display="order.shippingTax">Shipping tax amount (formatted)</span>
<span data-next-display="order.discounts">Discount amount (formatted)</span>
```

## Customer Information

```html
<span data-next-display="order.customer.name">Full customer name</span>
<span data-next-display="order.customer.firstName">First name only</span>
<span data-next-display="order.customer.lastName">Last name only</span>
<span data-next-display="order.customer.email">Customer email</span>
<span data-next-display="order.customer.phone">Customer phone</span>
```

## Address Information

```html
<span data-next-display="order.shippingAddress.full">Full shipping address</span>
<span data-next-display="order.shippingAddress.line1">Address line 1</span>
<span data-next-display="order.shippingAddress.line2">Address line 2</span>
<span data-next-display="order.shippingAddress.city">City</span>
<span data-next-display="order.shippingAddress.state">State/Province</span>
<span data-next-display="order.shippingAddress.country">Country</span>
<span data-next-display="order.billingAddress.full">Full billing address</span>
```

## Order Boolean Properties

```html
<div data-next-show="order.exists">Order found</div>
<div data-next-show="order.supportsUpsells">Order accepts additional items</div>
<div data-next-show="order.isRecent">Order placed less than 15 minutes ago</div>
<div data-next-show="order.isExpired">Order placed more than 15 minutes ago</div>
<div data-next-show="order.isNewOrder">New order (placed < 15 min ago)</div>
<div data-next-show="order.hasError">Unable to load order</div>
<div data-next-show="order.isTest">Test order</div>
<div data-next-show="order.hasItems">Order has items</div>
<div data-next-show="order.hasDiscounts">Order has discount</div>
<div data-next-show="order.hasShipping">Shipping charged</div>
<div data-next-show="order.hasTax">Tax charged</div>
<div data-next-show="order.hasUpsells">Order has upsells</div>
```

## Complete Order Confirmation Example

```html
<div class="order-confirmation">
  <!-- Order not found -->
  <div data-next-show="order.hasError" class="error">
    <h2>Order Not Found</h2>
    <p>We couldn't find your order. Please check your email for the order confirmation.</p>
  </div>
  
  <!-- Order found -->
  <div data-next-show="order.exists">
    <h1>Thank You for Your Order!</h1>
    
    <div class="order-header">
      <p>Order #<span data-next-display="order.number">-</span></p>
      <p>Placed on <span data-next-display="order.createdAt">-</span></p>
    </div>
    
    <div class="customer-info">
      <h3>Customer Information</h3>
      <p><span data-next-display="order.customer.name">-</span></p>
      <p><span data-next-display="order.customer.email">-</span></p>
      <p data-next-show="order.customer.phone">
        <span data-next-display="order.customer.phone">-</span>
      </p>
    </div>
    
    <div class="shipping-info">
      <h3>Shipping Address</h3>
      <address data-next-display="order.shippingAddress.full">-</address>
      <p>Method: <span data-next-display="order.shippingMethod">-</span></p>
    </div>
    
    <div class="order-summary">
      <h3>Order Summary</h3>
      <div class="totals">
        <div class="line-item">
          <span>Subtotal:</span>
          <span data-next-display="order.subtotal">$0.00</span>
        </div>
        
        <div class="line-item" data-next-show="order.hasShipping">
          <span>Shipping:</span>
          <span data-next-display="order.shipping">$0.00</span>
        </div>
        
        <div class="line-item" data-next-show="order.hasTax">
          <span>Tax:</span>
          <span data-next-display="order.tax">$0.00</span>
        </div>
        
        <div class="line-item" data-next-show="order.hasDiscounts">
          <span>Discount:</span>
          <span>-<span data-next-display="order.discounts">$0.00</span></span>
        </div>
        
        <div class="line-item total">
          <span>Total:</span>
          <span data-next-display="order.total">$0.00</span>
        </div>
      </div>
    </div>
    
    <!-- Upsell prompt for recent orders -->
    <div class="upsell-prompt" data-next-show="order.supportsUpsells">
      <h3>Don't Miss Out!</h3>
      <p>Add these items to your order while you can:</p>
      <a href="/upsell?ref_id={order.refId}" class="btn">View Special Offers</a>
    </div>
  </div>
</div>
```

## Order Items Renderer

The `data-next-order-items` attribute dynamically renders order line items using customizable templates.

### Basic Usage

```html
<!-- Container for order items -->
<div data-next-order-items class="order-items-list">
  <!-- Items will be rendered here -->
</div>
```

### Template Configuration

Templates can be specified in multiple ways (in priority order):

#### 1. Template by ID
```html
<!-- Define template -->
<template id="order-item-template">
  <div class="order-item" data-order-line-id="{item.id}">
    <img src="{item.image}" alt="{item.name}">
    <h4>{item.name}</h4>
    <span>Qty: {item.quantity}</span>
    <span>{item.lineTotal}</span>
  </div>
</template>

<!-- Reference template -->
<div data-next-order-items 
     data-item-template-id="order-item-template"
     class="order-items-list">
</div>
```

#### 2. Template by CSS Selector
```html
<!-- Define template -->
<script type="text/x-template" id="custom-order-template">
  <div class="order-item">
    <!-- template content -->
  </div>
</script>

<!-- Reference template -->
<div data-next-order-items 
     data-item-template-selector="#custom-order-template"
     class="order-items-list">
</div>
```

#### 3. Inline Template String
```html
<div data-next-order-items 
     data-item-template='<div class="item">{item.name} x{item.quantity}: {item.lineTotal}</div>'
     class="order-items-list">
</div>
```

#### 4. Default: Inner HTML
```html
<div data-next-order-items class="order-items-list">
  <div class="order-item">
    <span>{item.name}</span>
    <span>{item.quantity}</span>
    <span>{item.lineTotal}</span>
  </div>
</div>
```

### Available Template Variables

#### Basic Item Properties
- `{item.id}` - Order line ID
- `{item.name}` - Product name
- `{item.title}` - Product title (alias for name)
- `{item.sku}` - Product SKU
- `{item.quantity}` - Quantity ordered
- `{item.description}` - Product description
- `{item.variant}` - Variant title (e.g., "Size: Large")
- `{item.image}` - Product image URL

#### Pricing Variables (formatted)
- `{item.price}` - Unit price including tax
- `{item.priceExclTax}` - Unit price excluding tax
- `{item.unitTax}` - Tax per unit
- `{item.lineTotal}` - Line total including tax
- `{item.lineTotalExclTax}` - Line total excluding tax
- `{item.lineTax}` - Total tax for line

#### Status Flags
- `{item.isUpsell}` - "true" or "false" if item is an upsell
- `{item.upsellBadge}` - "UPSELL" text or empty
- `{item.hasImage}` - "true" or "false"
- `{item.hasDescription}` - "true" or "false"
- `{item.hasVariant}` - "true" or "false"
- `{item.hasTax}` - "true" or "false"

#### Conditional Display Classes
- `{item.showUpsell}` - "show" or "hide" for upsell badge
- `{item.showImage}` - "show" or "hide" based on image availability
- `{item.showDescription}` - "show" or "hide" if has description
- `{item.showVariant}` - "show" or "hide" if has variant
- `{item.showTax}` - "show" or "hide" if has tax

### Complete Example

```html
<!-- Template definition -->
<template id="order-item-template">
  <div class="order-item" data-order-line-id="{item.id}">
    <div class="order-item__image {item.showImage}">
      <img src="{item.image}" alt="{item.name}">
    </div>
    
    <div class="order-item__details">
      <h4 class="order-item__name">
        {item.name}
        <span class="upsell-badge {item.showUpsell}">{item.upsellBadge}</span>
      </h4>
      <div class="order-item__sku">SKU: {item.sku}</div>
      <div class="order-item__variant {item.showVariant}">{item.variant}</div>
      <div class="order-item__description {item.showDescription}">{item.description}</div>
    </div>
    
    <div class="order-item__quantity">
      <span>Qty: {item.quantity}</span>
    </div>
    
    <div class="order-item__pricing">
      <div class="unit-price">{item.price} each</div>
      <div class="line-total">{item.lineTotal}</div>
      <div class="tax-info {item.showTax}">Tax: {item.lineTax}</div>
    </div>
  </div>
</template>

<!-- Order items container -->
<div data-next-order-items 
     data-item-template-id="order-item-template"
     data-empty-template='<div class="empty">No items found in order</div>'
     class="order-items-list">
</div>
```

### Additional Attributes

- `data-empty-template` - Template to show when order has no items

```html
<div data-next-order-items
     data-item-template-id="order-item-template"
     data-empty-template="<p>No items found in this order</p>"
     class="order-items-list">
</div>
```

### Auto-Loading from URL

The order items enhancer automatically loads the order if `ref_id` is present in the URL:
```
https://example.com/confirmation?ref_id=ORDER_123
```

## Test Order Banner

```html
<div class="test-banner" data-next-show="order.isTest">
  <p>⚠️ This is a test order</p>
</div>
```

## Order Age Messages

```html
<!-- Recent order -->
<div data-next-show="order.isRecent" class="status-message success">
  <p>✓ Your order has been received and is being processed</p>
</div>

<!-- Older order -->
<div data-next-show="order.isExpired" class="status-message">
  <p>This order has already been processed</p>
</div>
```

## Best Practices

1. **Error Handling**: Always check if order exists
2. **Test Orders**: Indicate test orders clearly
3. **Upsell Window**: Show upsells only for recent orders
4. **Complete Info**: Display all relevant order details
5. **Loading State**: Handle order loading state