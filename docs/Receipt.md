# Receipt Page Documentation

This document describes the components and attributes available on the receipt page for displaying order information.

## Overview

The receipt page displays information about the customer's completed order, including:
- Customer details
- Order summary
- Billing and shipping information
- Payment details
- Order reference information

## Data Attributes

The receipt page uses `data-os-receipt` attributes to identify elements that should be populated with order data. The ReceiptPage component automatically updates these elements with the appropriate values from the API response.

### Available Attributes

| Attribute | Description | Data Source |
|-----------|-------------|------------|
| `fname` | Customer's first name | `order.user.first_name` |
| `billing_fname` | Full name on billing address | Combination of `billing_address.first_name` and `billing_address.last_name` |
| `billing_address` | Billing address (street address) | Formatted from `billing_address.line1` and `billing_address.line2` |
| `billing_location` | Billing location (city, state, zip) | Formatted from `billing_address.line4`, `billing_address.state`, and `billing_address.postcode` |
| `billing_country` | Billing country | Mapped from `billing_address.country` code to full name |
| `shipping_fname` | Full name on shipping address | Combination of `shipping_address.first_name` and `shipping_address.last_name` |
| `shipping_address` | Shipping address (street address) | Formatted from `shipping_address.line1` and `shipping_address.line2` |
| `shipping_location` | Shipping location (city, state, zip) | Formatted from `shipping_address.line4`, `shipping_address.state`, and `shipping_address.postcode` |
| `shipping_country` | Shipping country | Mapped from `shipping_address.country` code to full name |
| `payment_method` | Payment method used | Formatted from `payment_detail.payment_method` or `payment_method` |
| `shipping-method` | Shipping method (hyphen version) | `shipping_method` |
| `shipping_method` | Shipping method (underscore version) | `shipping_method` |
| `shipping-container` | Container for shipping information | Always displayed, regardless of shipping price |
| `shipping-price` | Price of shipping | Formatted from `shipping_excl_tax` |
| `tax-container` | Container for tax information | Shows/hides based on tax amount |
| `taxes` | Tax amount | Formatted from `total_tax` |
| `total` | Order total | Formatted from `total_incl_tax` |
| `order_number` | Order number | `number` |
| `order_reference` | Order reference ID | `ref_id` |
| `order-lines` | Container for order line items | Populated with `lines` data |

### Product Line Attributes

Within a product line template (`product-line`), the following attributes are available:

| Attribute | Description | Data Source |
|-----------|-------------|------------|
| `line-title` | Product title | `product_title` or `title` or `package_title` |
| `line-saving` | Savings percentage display | Calculated from `price_excl_tax_excl_discounts` and `price_excl_tax` |
| `line-compare` | Original price (if discounted) | Formatted from `price_excl_tax_excl_discounts` |
| `line-subtotal` | Current price | Formatted from `price_excl_tax` |

## Implementation Example

Here's an example of how to structure the shipping information in your HTML:

```html
<div data-os-receipt="shipping-container" class="cart-summary__line">
  <div class="cart-summary__line-item">
    <div>Shipping</div>
  </div>
  <div class="cart-summary__line-item">
    <div data-os-receipt="shipping-price">$0.00</div>
  </div>
</div>
```

## API Response Structure

The order data from the API includes the following structure:

```json
{
  "number": "107261",
  "ref_id": "aa2c7a2e4d914cb98f1fc85644e0049c",
  "user": {
    "email": "test@test.com",
    "first_name": "test",
    "last_name": "success"
    // Additional user fields...
  },
  "lines": [
    {
      "id": 5215,
      "quantity": 3,
      "product_title": "Product Name",
      "price_excl_tax": "285.00",
      "price_incl_tax": "308.09",
      "is_upsell": false,
      "product_sku": "SKU123",
      "image": "https://example.com/image.png",
      "price_excl_tax_excl_discounts": "285.00",
      "price_incl_tax_excl_discounts": "308.09"
    }
    // Additional line items...
  ],
  "shipping_excl_tax": "0.00",
  "shipping_incl_tax": "0.00",
  "total_incl_tax": "382.68",
  "total_excl_tax": "354.00",
  "total_discounts": "0.00",
  "total_tax": "28.68",
  "shipping_tax": "0.00",
  "display_taxes": "TAX",
  "shipping_method": "Standard Shipping",
  "shipping_code": "default",
  "currency": "USD",
  "shipping_address": {
    // Shipping address fields...
  },
  "billing_address": {
    // Billing address fields...
  }
  // Additional order fields...
}
```

## Notes

- The ReceiptPage component will automatically format currency values according to the order's currency (defaulting to USD).
- Containers like `tax-container` will be shown or hidden based on the presence and value of their respective data, but the `shipping-container` is always displayed.
- If a specific data attribute is not found in the DOM, the component will silently skip updating it without causing errors. 