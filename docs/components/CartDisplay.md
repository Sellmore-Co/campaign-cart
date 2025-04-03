# Cart Display System

The Cart Display system allows you to display cart information anywhere on your page by using data attributes. The CartDisplayManager automatically finds elements with these attributes and updates them when the cart changes.

## Available Attributes

### Cart Totals

| Attribute | Description | Example Display |
|-----------|-------------|-----------------|
| `data-os-cart-summary="grand-total"` | Displays the final total (subtotal + shipping + tax) | $285.00 |
| `data-os-cart-summary="subtotal"` | Displays the cart subtotal | $285.00 |
| `data-os-cart-summary="compare-total"` | Displays the original/retail price total | $354.00 |
| `data-os-cart-summary="savings-amount"` | Displays the amount saved | $69.00 |
| `data-os-cart-summary="savings-percentage"` | Displays the percentage saved | 20% OFF |

### Line Items and Cart Contents

| Attribute | Description |
|-----------|-------------|
| `data-os-cart-summary="line-display"` | Container for displaying line items |
| `data-os-cart-summary="line-item"` | Template for a single line item |
| `data-os-cart-summary="line-title"` | Displays the item name |
| `data-os-cart-summary="line-image"` | Displays the item image |
| `data-os-cart-summary="line-compare"` | Displays the original/retail price for a line item |
| `data-os-cart-summary="line-sale"` | Displays the current price for a line item |
| `data-os-cart-summary="line-saving-percent"` | Displays the savings percentage for a line item |

### Shipping Information

| Attribute | Description |
|-----------|-------------|
| `data-os-cart-summary="shipping-bar"` | Container for shipping information |
| `data-os-cart-summary="shipping-compare"` | Displays the original shipping cost |
| `data-os-cart-summary="shipping-current"` | Displays the current shipping cost |

### Savings Information

| Attribute | Description |
|-----------|-------------|
| `data-os-cart-summary="savings"` | Container for savings information |
| `data-os-cart-summary="savings-amount"` | Displays the total amount saved |
| `data-os-cart-summary="savings-percentage"` | Displays the total savings percentage |

### Other Elements

| Attribute | Description |
|-----------|-------------|
| `data-os-cart="summary"` | Container for the entire cart summary |
| `data-os-cart-summary="summary-scroll"` | Scroll indicator for line items (shows when items > 2) |
| `os-checkout-element="summary-bar"` | Clickable bar to toggle summary visibility on mobile |
| `os-checkout-element="summary-mobile"` | The mobile summary panel that expands/collapses |
| `os-checkout-element="summary-text"` | Text that changes between "Show/Hide Order Summary" |
| `os-summary-icon` | Icon that rotates when summary is expanded/collapsed |

## Configuration Attributes

You can configure the CartDisplayManager's behavior by adding these data attributes to elements with `data-os-cart="summary"`:

| Configuration Attribute | Description | Default |
|-------------------------|-------------|---------|
| `data-show-compare-pricing` | Whether to show compare prices | `true` |
| `data-show-product-images` | Whether to show product images | `true` |
| `data-show-tax-pending-message` | Whether to show tax calculation pending message | `true` |
| `data-currency-symbol` | Currency symbol to use | `$` |

## Line Item Savings Format

The line item savings percentage can be formatted in different ways:

| Format Value | Example |
|--------------|---------|
| `default` | 20% OFF |
| `parenthesis` | (20% OFF) |

Use the `data-os-format` attribute on elements with `data-os-cart-summary="line-saving-percent"` to set the format:

```html
<div data-os-cart-summary="line-saving-percent" data-os-format="parenthesis"></div>
```

## Compare Total Configuration

The compare total element can be configured to display different types of totals:

| Type | Description |
|------|-------------|
| `retail` (default) | Shows the retail subtotal |
| `recurring` | Shows the recurring total for subscription products |

Use the `data-total-type` attribute on elements with `data-os-cart-summary="compare-total"` to set the type:

```html
<div data-os-cart-summary="compare-total" data-total-type="retail"></div>
```

## Example Usage

Here's a simple example of a cart summary:

```html
<div data-os-cart="summary">
  <div class="cart-summary-header">
    <h2>Order Summary</h2>
  </div>
  
  <div data-os-cart-summary="line-display"></div>
  
  <div class="cart-summary-totals">
    <div class="cart-row">
      <span>Subtotal:</span>
      <span data-os-cart-summary="subtotal"></span>
    </div>
    
    <div class="cart-row" data-os-cart-summary="savings">
      <span>You Save:</span>
      <span data-os-cart-summary="savings-amount"></span>
      (<span data-os-cart-summary="savings-percentage"></span>)
    </div>
    
    <div class="cart-row" data-os-cart-summary="shipping-bar">
      <span>Shipping:</span>
      <span data-os-cart-summary="shipping-current"></span>
      <span data-os-cart-summary="shipping-compare"></span>
    </div>
    
    <div class="cart-row cart-total">
      <span>Total:</span>
      <span>
        <span data-os-cart-summary="compare-total" class="compare-price"></span>
        <span data-os-cart-summary="grand-total" class="current-price"></span>
      </span>
    </div>
  </div>
</div>
```

## Integration with CartDisplayManager

The CartDisplayManager automatically looks for elements with these attributes when it initializes and updates them when the cart changes. You don't need to manually refresh the display unless you dynamically add or remove display elements after initialization.

If you do add or remove display elements after initialization, call the `refresh()` method on the CartDisplayManager:

```javascript
window.os.cartDisplay.refresh();
``` 