# Order Attributes

Display order confirmation data. Requires order ID in URL (?ref_id=ORDER_ID) or manual loading.

## Basic Order Properties

```html
<!-- Order identification -->
<span data-next-display="order.id">Order ID</span>
<span data-next-display="order.number">Order number</span>
<span data-next-display="order.ref_id">Reference ID (snake_case)</span>
<span data-next-display="order.refId">Reference ID (camelCase)</span>

<!-- Order status -->
<span data-next-display="order.status">Order status</span>
<span data-next-display="order.is_test">Is test order (boolean)</span>
<span data-next-display="order.isTest">Is test order (alias)</span>
<span data-next-display="order.testBadge">Shows "🧪 TEST ORDER" if test</span>

<!-- Order URLs -->
<a data-next-display="order.order_status_url">View Order Status</a>
<a data-next-display="order.statusUrl">View Order Status (alias)</a>

<!-- Order metadata -->
<span data-next-display="order.created_at">Creation date</span>
<span data-next-display="order.createdAt">Creation date (alias)</span>
<span data-next-display="order.currency">Currency code</span>
<span data-next-display="order.supports_upsells">Supports upsells</span>
<span data-next-display="order.supportsUpsells">Supports upsells (alias)</span>
```

## Order Financial Data

```html
<!-- Main totals -->
<span data-next-display="order.total_incl_tax">Grand total including tax and shipping</span>
<span data-next-display="order.total">Grand total (alias for total_incl_tax)</span>
<span data-next-display="order.subtotal">Line items only (excludes shipping and tax)</span>
<span data-next-display="order.subtotalExclShipping">Line items only (alias for subtotal)</span>
<span data-next-display="order.total_excl_tax">Total excl tax but INCLUDES shipping</span>

<!-- Tax & Shipping -->
<span data-next-display="order.total_tax">Tax amount (snake_case)</span>
<span data-next-display="order.tax">Tax amount (alias)</span>
<span data-next-display="order.shipping_incl_tax">Shipping including tax (snake_case)</span>
<span data-next-display="order.shipping">Shipping including tax (alias)</span>
<span data-next-display="order.shipping_excl_tax">Shipping excluding tax (snake_case)</span>
<span data-next-display="order.shippingExclTax">Shipping excluding tax (alias)</span>
<span data-next-display="order.shipping_tax">Shipping tax amount (snake_case)</span>
<span data-next-display="order.shippingTax">Shipping tax amount (alias)</span>

<!-- Discounts & Savings -->
<span data-next-display="order.total_discounts">Total discounts (snake_case)</span>
<span data-next-display="order.discounts">Total discounts (alias)</span>
<span data-next-display="order.savingsAmount">Calculated savings amount</span>
<span data-next-display="order.savingsPercentage">Savings percentage</span>

<!-- Payment & Shipping Methods -->
<span data-next-display="order.payment_method">Payment method</span>
<span data-next-display="order.paymentMethod">Payment method (alias)</span>
<span data-next-display="order.shipping_method">Shipping method</span>
<span data-next-display="order.shippingMethod">Shipping method (alias)</span>

<!-- Raw values (unformatted) -->
<span data-next-display="order.total.raw">Total as number</span>
<span data-next-display="order.subtotal.raw">Subtotal as number</span>
<span data-next-display="order.tax.raw">Tax as number</span>
<span data-next-display="order.shipping.raw">Shipping as number</span>
<span data-next-display="order.discounts.raw">Discounts as number</span>
```

## Customer Information

```html
<!-- Basic customer info -->
<span data-next-display="order.customer.name">Full customer name</span>
<span data-next-display="order.customer.firstName">First name only</span>
<span data-next-display="order.customer.lastName">Last name only</span>
<span data-next-display="order.customer.email">Customer email</span>
<span data-next-display="order.customer.phone">Customer phone</span>

<!-- Additional customer properties -->
<span data-next-display="order.customer.acceptsMarketing">Accepts marketing (boolean)</span>
<span data-next-display="order.customer.language">Customer language</span>
<span data-next-display="order.customer.ip">Customer IP address</span>

<!-- User is an alias for customer -->
<span data-next-display="order.user.name">Full name</span>
<span data-next-display="order.user.email">Email</span>
<span data-next-display="order.user.firstName">First name</span>
<span data-next-display="order.user.lastName">Last name</span>
<span data-next-display="order.user.phone">Phone</span>
```

## Address Information

```html
<!-- Shipping Address -->
<span data-next-display="order.shippingAddress.full">Full formatted address</span>
<span data-next-display="order.shippingAddress.name">Recipient name</span>
<span data-next-display="order.shippingAddress.line1">Address line 1</span>
<span data-next-display="order.shippingAddress.line2">Address line 2</span>
<span data-next-display="order.shippingAddress.city">City</span>
<span data-next-display="order.shippingAddress.state">State/Province</span>
<span data-next-display="order.shippingAddress.zip">ZIP code</span>
<span data-next-display="order.shippingAddress.postcode">Postcode (alias)</span>
<span data-next-display="order.shippingAddress.country">Country</span>
<span data-next-display="order.shippingAddress.phone">Phone number</span>

<!-- Billing Address (same properties as shipping) -->
<span data-next-display="order.billingAddress.full">Full formatted address</span>
<span data-next-display="order.billingAddress.name">Recipient name</span>
<span data-next-display="order.billingAddress.line1">Address line 1</span>
<span data-next-display="order.billingAddress.line2">Address line 2</span>
<span data-next-display="order.billingAddress.city">City</span>
<span data-next-display="order.billingAddress.state">State/Province</span>
<span data-next-display="order.billingAddress.zip">ZIP code</span>
<span data-next-display="order.billingAddress.postcode">Postcode (alias)</span>
<span data-next-display="order.billingAddress.country">Country</span>
<span data-next-display="order.billingAddress.phone">Phone number</span>
```

## Line Items / Products

```html
<!-- Line items aggregate data -->
<span data-next-display="order.lines.count">Number of line items</span>
<span data-next-display="order.lines.totalQuantity">Total quantity of all items</span>
<span data-next-display="order.lines.upsellCount">Number of upsell items</span>
<span data-next-display="order.lines.mainProduct">Main product title (first item)</span>
<span data-next-display="order.lines.mainProductSku">Main product SKU (first item)</span>

<!-- Items is an alias for lines -->
<span data-next-display="order.items.count">Number of line items</span>
<span data-next-display="order.items.totalQuantity">Total quantity</span>

<!-- Access specific line items by index -->
<span data-next-display="order.lines[0].title">First item title</span>
<span data-next-display="order.lines[0].product_title">First item title (snake_case)</span>
<span data-next-display="order.lines[0].sku">First item SKU</span>
<span data-next-display="order.lines[0].product_sku">First item SKU (snake_case)</span>
<span data-next-display="order.lines[0].quantity">First item quantity</span>
<span data-next-display="order.lines[0].image">First item image URL</span>

<!-- Line item pricing (formatted) -->
<span data-next-display="order.lines[0].price">Unit price incl tax (formatted)</span>
<span data-next-display="order.lines[0].priceExclTax">Unit price excl tax (formatted)</span>
<span data-next-display="order.lines[0].priceExclTaxExclDiscounts">Original price before discounts</span>
<span data-next-display="order.lines[0].priceInclTaxExclDiscounts">Original price incl tax before discounts</span>
<span data-next-display="order.lines[0].total">Line total incl tax (formatted)</span>
<span data-next-display="order.lines[0].totalExclTax">Line total excl tax (formatted)</span>

<!-- Line item pricing (raw values) -->
<span data-next-display="order.lines[0].price.raw">Unit price as number</span>
<span data-next-display="order.lines[0].priceExclTax.raw">Unit price excl tax as number</span>
<span data-next-display="order.lines[0].priceExclTaxExclDiscounts.raw">Original price as number</span>
<span data-next-display="order.lines[0].priceInclTaxExclDiscounts.raw">Original price incl tax as number</span>
<span data-next-display="order.lines[0].total.raw">Line total as number</span>
<span data-next-display="order.lines[0].totalExclTax.raw">Line total excl tax as number</span>

<!-- Line item flags -->
<span data-next-display="order.lines[0].isUpsell">Is upsell item (boolean)</span>

<!-- Access any line item by index (0, 1, 2, etc.) -->
<span data-next-display="order.lines[1].title">Second item title</span>
<span data-next-display="order.lines[2].title">Third item title</span>
```

## Attribution / UTM Tracking

```html
<!-- UTM parameters -->
<span data-next-display="order.attribution.utm_source">UTM source</span>
<span data-next-display="order.attribution.source">UTM source (alias)</span>
<span data-next-display="order.attribution.utm_medium">UTM medium</span>
<span data-next-display="order.attribution.medium">UTM medium (alias)</span>
<span data-next-display="order.attribution.utm_campaign">UTM campaign</span>
<span data-next-display="order.attribution.campaign">UTM campaign (alias)</span>
<span data-next-display="order.attribution.utm_term">UTM term</span>
<span data-next-display="order.attribution.term">UTM term (alias)</span>
<span data-next-display="order.attribution.utm_content">UTM content</span>
<span data-next-display="order.attribution.content">UTM content (alias)</span>

<!-- Other tracking -->
<span data-next-display="order.attribution.gclid">Google Click ID</span>
<span data-next-display="order.attribution.funnel">Funnel name</span>
<span data-next-display="order.attribution.affiliate">Affiliate code</span>
<span data-next-display="order.attribution.hasTracking">Has any tracking (boolean)</span>
```

## Order Boolean Properties

```html
<!-- Order state flags -->
<div data-next-show="order.exists">Order found</div>
<div data-next-show="order.isLoading">Order is loading</div>
<div data-next-show="order.hasError">Unable to load order</div>
<div data-next-show="order.isTest">Test order</div>

<!-- Order content flags -->
<div data-next-show="order.hasItems">Order has items</div>
<div data-next-show="order.isEmpty">Order is empty</div>
<div data-next-show="order.hasShipping">Shipping charged</div>
<div data-next-show="order.hasTax">Tax charged</div>
<div data-next-show="order.hasDiscounts">Order has discounts</div>
<div data-next-show="order.hasSavings">Order has savings</div>
<div data-next-show="order.hasUpsells">Order has upsell items</div>

<!-- Order support flags -->
<div data-next-show="order.supportsUpsells">Order accepts additional items</div>
<div data-next-show="order.supports_upsells">Order accepts additional items (snake_case)</div>

<!-- Order timing (if implemented) -->
<div data-next-show="order.isRecent">Order placed less than 15 minutes ago</div>
<div data-next-show="order.isExpired">Order placed more than 15 minutes ago</div>
<div data-next-show="order.isNewOrder">New order (placed < 15 min ago)</div>
```

## Loading States

```html
<!-- Loading indicator -->
<div data-next-show="order.isLoading" class="loading-spinner">
  <span>Loading order...</span>
</div>

<!-- Error handling -->
<div data-next-show="order.hasError" class="error-message">
  <p>Error: <span data-next-display="order.errorMessage">Unable to load order</span></p>
</div>

<!-- Success state -->
<div data-next-show="order.exists" data-next-hide="order.isLoading">
  <!-- Order content here -->
</div>
```

## Special Features

### Auto-Loading from URL

The order will automatically be loaded if the URL contains `?ref_id=XXX`:
```
https://example.com/confirmation?ref_id=ORDER_123
```

### CSS Classes

The enhancer automatically adds classes to elements:
- `next-loading` - Added when order is loading
- `next-loaded` - Added when order is successfully loaded
- `next-error` - Added when there's an error loading the order

### Link Handling

When using order status URL on `<a>` tags, the href is automatically set:
```html
<!-- This link's href will be automatically set to the order status URL -->
<a data-next-display="order.statusUrl">View Order Status</a>
```

## Important: Order Total Breakdown

### Understanding Order Totals

When displaying order totals, it's important to understand what each attribute includes:

- **`order.subtotal`** - Line items only (excludes shipping and tax) 
  - Example: $53.99 (just the products)
  
- **`order.total_excl_tax`** - Total excluding tax but INCLUDING shipping
  - Example: $63.98 (products $53.99 + shipping $9.99)
  
- **`order.total`** or **`order.total_incl_tax`** - Grand total (includes everything)
  - Example: $69.10 (products + shipping + all taxes)

### Shopify-like Order Summary Example

```html
<!-- Line items subtotal -->
<div>Subtotal: <span data-next-display="order.subtotal">$0.00</span></div>

<!-- Shipping -->
<div>Shipping: <span data-next-display="order.shipping">$0.00</span></div>

<!-- Tax -->
<div>Tax: <span data-next-display="order.tax">$0.00</span></div>

<!-- Discounts (if any) -->
<div data-next-show="order.hasDiscounts">
  Discount: -<span data-next-display="order.discounts">$0.00</span>
</div>

<!-- Grand total -->
<div>Total: <span data-next-display="order.total">$0.00</span></div>
```

## Complete Order Confirmation Example

```html
<div class="order-confirmation">
  <!-- Loading state -->
  <div data-next-show="order.isLoading" class="loading">
    <p>Loading your order...</p>
  </div>
  
  <!-- Error state -->
  <div data-next-show="order.hasError" class="error">
    <h2>Order Not Found</h2>
    <p>Error: <span data-next-display="order.errorMessage">Unknown error</span></p>
    <p>Please check your email for the order confirmation.</p>
  </div>
  
  <!-- Order found -->
  <div data-next-show="order.exists" data-next-hide="order.isLoading">
    <h1>Thank You for Your Order!</h1>
    
    <!-- Test order warning -->
    <div class="test-banner" data-next-show="order.isTest">
      <p data-next-display="order.testBadge">🧪 TEST ORDER</p>
    </div>
    
    <div class="order-header">
      <p>Order #<span data-next-display="order.number">-</span></p>
      <p>Reference: <span data-next-display="order.refId">-</span></p>
      <p>Placed on <span data-next-display="order.createdAt">-</span></p>
      <p>Status: <span data-next-display="order.status">Processing</span></p>
    </div>
    
    <div class="customer-info">
      <h3>Customer Information</h3>
      <p><span data-next-display="order.customer.name">-</span></p>
      <p><span data-next-display="order.customer.email">-</span></p>
      <p data-next-show="order.customer.phone">
        Phone: <span data-next-display="order.customer.phone">-</span>
      </p>
      <p data-next-show="order.customer.acceptsMarketing">
        ✓ Subscribed to marketing emails
      </p>
    </div>
    
    <div class="addresses">
      <div class="shipping-info">
        <h3>Shipping Address</h3>
        <address>
          <span data-next-display="order.shippingAddress.name">-</span><br>
          <span data-next-display="order.shippingAddress.line1">-</span><br>
          <span data-next-show="order.shippingAddress.line2">
            <span data-next-display="order.shippingAddress.line2">-</span><br>
          </span>
          <span data-next-display="order.shippingAddress.city">-</span>, 
          <span data-next-display="order.shippingAddress.state">-</span> 
          <span data-next-display="order.shippingAddress.zip">-</span><br>
          <span data-next-display="order.shippingAddress.country">-</span>
        </address>
        <p>Method: <span data-next-display="order.shippingMethod">-</span></p>
      </div>
      
      <div class="billing-info">
        <h3>Billing Address</h3>
        <address data-next-display="order.billingAddress.full">-</address>
      </div>
    </div>
    
    <div class="order-items">
      <h3>Order Items (<span data-next-display="order.lines.count">0</span>)</h3>
      <p>Total Quantity: <span data-next-display="order.lines.totalQuantity">0</span></p>
      
      <!-- Main product -->
      <div class="main-product">
        <h4 data-next-display="order.lines.mainProduct">-</h4>
        <p>SKU: <span data-next-display="order.lines.mainProductSku">-</span></p>
      </div>
      
      <!-- Upsell count -->
      <p data-next-show="order.hasUpsells">
        Includes <span data-next-display="order.lines.upsellCount">0</span> upsell item(s)
      </p>
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
        
        <div class="line-item savings" data-next-show="order.hasSavings">
          <span>You saved:</span>
          <span>
            <span data-next-display="order.savingsAmount">$0.00</span>
            (<span data-next-display="order.savingsPercentage">0</span>%)
          </span>
        </div>
        
        <div class="line-item total">
          <span>Total:</span>
          <span data-next-display="order.total">$0.00</span>
        </div>
      </div>
      
      <p>Payment Method: <span data-next-display="order.paymentMethod">-</span></p>
    </div>
    
    <!-- Attribution data (if tracking) -->
    <div class="attribution" data-next-show="order.attribution.hasTracking">
      <h3>Campaign Information</h3>
      <p data-next-show="order.attribution.utm_source">
        Source: <span data-next-display="order.attribution.utm_source">-</span>
      </p>
      <p data-next-show="order.attribution.utm_campaign">
        Campaign: <span data-next-display="order.attribution.utm_campaign">-</span>
      </p>
      <p data-next-show="order.attribution.affiliate">
        Affiliate: <span data-next-display="order.attribution.affiliate">-</span>
      </p>
    </div>
    
    <!-- Order status link -->
    <div class="order-actions">
      <a data-next-display="order.statusUrl" class="btn btn-primary">
        View Order Status
      </a>
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

#### Original Pricing Before Discounts (formatted)
- `{item.priceExclDiscounts}` - Original unit price before discounts (including tax)
- `{item.priceExclTaxExclDiscounts}` - Original unit price before discounts and tax
- `{item.lineTotalExclDiscounts}` - Original line total before discounts (including tax)
- `{item.lineTotalExclTaxExclDiscounts}` - Original line total before discounts and tax
- `{item.unitDiscount}` - Discount amount per unit
- `{item.lineDiscount}` - Total discount amount for the line

#### Status Flags
- `{item.isUpsell}` - "true" or "false" if item is an upsell
- `{item.upsellBadge}` - "UPSELL" text or empty
- `{item.hasImage}` - "true" or "false"
- `{item.hasDescription}` - "true" or "false"
- `{item.hasVariant}` - "true" or "false"
- `{item.hasTax}` - "true" or "false"
- `{item.hasDiscount}` - "true" or "false" if item has a discount

#### Conditional Display Classes
- `{item.showUpsell}` - "show" or "hide" for upsell badge
- `{item.showImage}` - "show" or "hide" based on image availability
- `{item.showDescription}` - "show" or "hide" if has description
- `{item.showVariant}` - "show" or "hide" if has variant
- `{item.showTax}` - "show" or "hide" if has tax
- `{item.showDiscount}` - "show" or "hide" if item has a discount

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
      <!-- Shopify-like pricing with strike-through for discounts -->
      <div class="unit-price">
        <span class="original-price {item.showDiscount}" style="text-decoration: line-through; color: #999;">
          {item.priceExclTaxExclDiscounts}
        </span>
        <span class="sale-price">{item.priceExclTax} each</span>
      </div>
      <div class="line-total">{item.lineTotal}</div>
      <div class="tax-info {item.showTax}">Tax: {item.lineTax}</div>
      <div class="discount-info {item.showDiscount}">You saved: {item.lineDiscount}</div>
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

## Test Order Banner

```html
<div class="test-banner" data-next-show="order.isTest">
  <p>⚠️ This is a test order</p>
  <span data-next-display="order.testBadge"></span>
</div>
```

## Best Practices

1. **Error Handling**: Always include loading and error states
2. **Test Orders**: Clearly indicate test orders with the testBadge
3. **Upsell Window**: Show upsells only when `order.supportsUpsells` is true
4. **Complete Info**: Display all relevant order details for customer reference
5. **Loading State**: Handle the three states: loading, error, and success
6. **Raw Values**: Use `.raw` suffix when you need numeric values for calculations
7. **Attribution**: Show campaign data when available for marketing insights
8. **Line Items**: Use the order items renderer for complex item displays