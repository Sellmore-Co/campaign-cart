# Complete Data Attributes Reference

Comprehensive reference of all Next Commerce JS SDK HTML data attributes.

## Display Attributes

### Basic Display
| Attribute | Description | Example |
|-----------|-------------|---------|
| `data-next-display` | Display dynamic data | `data-next-display="cart.total"` |
| `data-next-await` | Show loading skeleton | `data-next-await` |

### Campaign Display
| Attribute | Description | Example |
|-----------|-------------|---------|
| `data-next-display="campaign.name"` | Campaign name | My Campaign |
| `data-next-display="campaign.currency"` | Currency code | USD |
| `data-next-display="campaign.language"` | Language code | en |

### Package Display
| Attribute | Description | Example |
|-----------|-------------|---------|
| `data-next-display="package.name"` | Package name | Premium Bundle |
| `data-next-display="package.price"` | Formatted price | $99.99 |
| `data-next-display="package.price_total"` | Total price | $299.97 |
| `data-next-display="package.qty"` | Quantity in package | 3 |
| `data-next-display="package.savingsPercentage"` | Savings % | 30% |
| `data-next-display="package.image"` | Image URL | https://... |

### Cart Display
| Attribute | Description | Example |
|-----------|-------------|---------|
| `data-next-display="cart.total"` | Cart total | $199.99 |
| `data-next-display="cart.quantity"` | Total items | 5 |
| `data-next-display="cart.subtotal"` | Subtotal | $179.99 |
| `data-next-display="cart.shipping"` | Shipping cost | $20.00 |
| `data-next-display="cart.discounts"` | Discount amount | -$10.00 |

### Selection Display
| Attribute | Description | Example |
|-----------|-------------|---------|
| `data-next-display="selection.{id}.name"` | Selected name | Package A |
| `data-next-display="selection.{id}.price"` | Selected price | $99.99 |
| `data-next-display="selection.{id}.total"` | Selected total | $299.97 |

### Order Display
| Attribute | Description | Example |
|-----------|-------------|---------|
| `data-next-display="order.number"` | Order number | #12345 |
| `data-next-display="order.total"` | Order total | $199.99 |
| `data-next-display="order.customer.name"` | Customer name | John Doe |
| `data-next-display="order.customer.email"` | Email | john@example.com |

## Conditional Attributes

### Show/Hide
| Attribute | Description | Example |
|-----------|-------------|---------|
| `data-next-show` | Show when true | `data-next-show="cart.hasItems"` |
| `data-next-hide` | Hide when true | `data-next-hide="cart.isEmpty"` |

### Common Conditionals
| Attribute | Description |
|-----------|-------------|
| `data-next-show="cart.isEmpty"` | Show when cart empty |
| `data-next-show="cart.hasItems"` | Show when cart has items |
| `data-next-show="cart.total > 50"` | Show when total over $50 |
| `data-next-show="package.hasSavings"` | Show when package has savings |
| `data-next-show="order.exists"` | Show when order found |

### Profile Conditionals
| Attribute | Description | Example |
|-----------|-------------|---------|
| `data-next-show-if-profile` | Show when profile active | `data-next-show-if-profile="black_friday"` |
| `data-next-hide-if-profile` | Hide when profile active | `data-next-hide-if-profile="regular"` |
| `data-next-show="profile.active === 'id'"` | Show when specific profile | `data-next-show="profile.active === 'vip'"` |
| `data-next-show="profile.is('id')"` | Profile check function | `data-next-show="profile.is('sale')"` |

## Action Attributes

### Cart Actions
| Attribute | Description | Required With |
|-----------|-------------|---------------|
| `data-next-action="add-to-cart"` | Add to cart action | `data-next-package-id` |
| `data-next-package-id` | Package to add | Number |
| `data-next-quantity` | Quantity to add | Number (optional) |
| `data-next-url` | Redirect after add | URL (optional) |
| `data-next-clear-cart` | Clear cart first | true/false (optional) |

### Toggle Actions
| Attribute | Description | Required With |
|-----------|-------------|---------------|
| `data-next-toggle` | Toggle item in cart | `data-next-package-id` |
| `data-add-text` | Text when not in cart | String (optional) |
| `data-remove-text` | Text when in cart | String (optional) |
| `data-next-package-sync` | Sync with packages | Package IDs (optional) |

## Selector Attributes

### Container
| Attribute | Description | Values |
|-----------|-------------|---------|
| `data-next-cart-selector` | Selector container | - |
| `data-next-selector-id` | Unique selector ID | String |
| `data-next-selection-mode` | Selection mode | `swap`, `select` |

### Cards
| Attribute | Description | Values |
|-----------|-------------|---------|
| `data-next-selector-card` | Selector option | - |
| `data-next-package-id` | Package for card | Number |
| `data-next-selected` | Default selection | `true` |

## Upsell Attributes

### Direct Upsell
| Attribute | Description | Values |
|-----------|-------------|---------|
| `data-next-upsell="offer"` | Upsell container | - |
| `data-next-package-id` | Package to offer | Number |
| `data-next-upsell-action="add"` | Accept upsell | - |
| `data-next-upsell-action="skip"` | Decline upsell | - |

### Selection Upsell
| Attribute | Description | Values |
|-----------|-------------|---------|
| `data-next-upsell-selector` | Selection container | - |
| `data-next-upsell-option` | Upsell option | - |
| `data-next-upsell-select` | Dropdown select | String ID |

### Quantity Upsell
| Attribute | Description | Values |
|-----------|-------------|---------|
| `data-next-upsell-quantity="increase"` | Increase qty | - |
| `data-next-upsell-quantity="decrease"` | Decrease qty | - |
| `data-next-upsell-quantity="display"` | Show qty | - |
| `data-next-upsell-quantity-toggle` | Set specific qty | Number |

## Formatting Attributes

### Format Types
| Attribute | Description | Values |
|-----------|-------------|---------|
| `data-format` | Value format | `currency`, `number` |
| `data-hide-if-zero` | Hide if zero | `true` |
| `data-hide-if-false` | Hide if false | `true` |
| `data-hide-zero-cents` | Hide cents if .00 | `true` |
| `data-multiply-by` | Multiply value | Number |
| `data-divide-by` | Divide value | Number |

## Profile Attributes

### Profile Switcher
| Attribute | Description | Values |
|-----------|-------------|--------|
| `data-next-profile` | Profile switcher button | Profile ID |
| `data-next-profile-selector` | Profile dropdown selector | - |
| `data-next-clear-cart` | Clear cart on switch | `true`/`false` |
| `data-next-preserve-quantities` | Keep item quantities | `true`/`false` |
| `data-next-active-text` | Text when profile active | String |
| `data-next-inactive-text` | Text when profile inactive | String |

## State Classes (Automatic)

### Cart State
| Class | Applied When |
|-------|--------------|
| `.next-in-cart` | Item is in cart |
| `.next-active` | Toggle is active |
| `.next-disabled` | Action disabled |

### Selection State
| Class | Applied When |
|-------|--------------|
| `.next-selected` | Option selected |
| `.next-selector-active` | Has selection |

### Page State
| Class | Applied When |
|-------|--------------|
| `.next-display-ready` | SDK initialized |
| `.next-loading` | Loading data |

### Profile State
| Class | Applied When |
|-------|--------------|
| `.next-profile-active` | Profile is active |
| `.next-profile-switcher` | Profile switcher element |
| `.next-profile-selector` | Profile selector element |

## Meta Tag Configuration

| Meta Name | Description | Values |
|-----------|-------------|---------|
| `next-api-key` | Campaign API key | String |
| `next-debug` | Debug mode | `true`/`false` |
| `next-page-type` | Page type | `product`, `checkout`, `upsell`, `receipt` |
| `next-next-url` | Post-order URL | URL path |
| `next-prevent-back-navigation` | Prevent back | `true`/`false` |
| `next-upsell-accept-url` | Upsell accept URL | URL path |
| `next-upsell-decline-url` | Upsell decline URL | URL path |