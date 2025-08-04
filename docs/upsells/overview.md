# Post Purchase Upsells Overview

Maximize order value with post-purchase upsell flows. The SDK provides flexible patterns for presenting additional offers after checkout.

## How Upsells Work

1. Customer completes initial purchase
2. Redirect to upsell page(s)
3. Present relevant offers
4. Customer accepts or declines
5. Continue to next upsell or receipt

## Configuration

Set upsell URLs in meta tags:

```html
<!-- Upsell URLs -->
<meta name="next-upsell-accept-url" content="/demo/receipt">
<meta name="next-upsell-decline-url" content="/demo/receipt">
```

## Upsell Patterns

### 1. Direct Upsell
Simple yes/no decision for a single item.

### 2. Selection Upsell
Multiple options to choose from (cards or dropdown).

### 3. Quantity Upsell
Let customers choose quantity before accepting.

## Basic Example

```html
<!-- Simple upsell offer -->
<div data-next-upsell="offer" data-next-package-id="7">
  <h3>Add Extra Battery Pack?</h3>
  <p>Never run out of power - 50% off!</p>
  
  <button data-next-upsell-action="add">Yes, Add It</button>
  <button data-next-upsell-action="skip">No Thanks</button>
</div>
```

## Upsell Flow

1. **Initial Order**: Customer completes checkout
2. **Upsell Page 1**: First offer presented
3. **Accept/Decline**: Customer makes choice
4. **Next Step**: Either next upsell or receipt page
5. **Order Update**: Accepted items added to order

## Best Practices

- Keep offers relevant to original purchase
- Highlight value and savings
- Make declining easy and clear
- Limit number of upsell steps
- Show order summary on upsell pages

## Learn More

- [Direct Upsells](direct-upsells.md) - Simple yes/no offers
- [Selection Upsells](selection-upsells.md) - Multiple choice offers
- [Quantity Upsells](quantity-upsells.md) - Quantity-based offers
- [Configuration](configuration.md) - Advanced upsell settings