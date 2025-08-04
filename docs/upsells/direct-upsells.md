# Direct Upsells

Simple yes/no decision for a single item. Package ID is on the container.

## Basic Pattern

```html
<!-- Direct mode: package ID on container -->
<div data-next-upsell="offer" data-next-package-id="7">
  <h3>Add Extra Battery?</h3>
  <p>Extend your flight time with an extra battery pack</p>
  <button data-next-upsell-action="add">Yes, Add for $29</button>
  <button data-next-upsell-action="skip">No Thanks</button>
</div>
```

## With Product Display

Show product details using display attributes:

```html
<div data-next-upsell="offer" data-next-package-id="8">
  <img src="battery-image.jpg" alt="Extra Battery">
  <h3><span data-next-display="package.name">Extra Battery Pack</span></h3>
  <p>Price: <span data-next-display="package.price">$29.99</span></p>
  <p data-next-show="package.hasSavings">
    Save <span data-next-display="package.savingsPercentage">50%</span>
  </p>
  
  <button data-next-upsell-action="add">Yes, Add It!</button>
  <button data-next-upsell-action="skip">No, Continue</button>
</div>
```

## Styling Examples

### Card Style

```html
<div class="upsell-card" data-next-upsell="offer" data-next-package-id="7">
  <div class="upsell-header">
    <h3>Special Offer!</h3>
  </div>
  <div class="upsell-body">
    <p>Add protection for your purchase</p>
    <div class="price">
      Only <span data-next-display="package.price">$14.99</span>
    </div>
  </div>
  <div class="upsell-actions">
    <button class="btn-accept" data-next-upsell-action="add">
      Protect My Order
    </button>
    <button class="btn-decline" data-next-upsell-action="skip">
      Skip Protection
    </button>
  </div>
</div>
```

### Minimal Style

```html
<div data-next-upsell="offer" data-next-package-id="9">
  <p>Add expedited shipping for just $9.99?</p>
  <button data-next-upsell-action="add">Yes</button>
  <button data-next-upsell-action="skip">No</button>
</div>
```

## Best Practices

1. **Clear Value Proposition**: Explain why they need the item
2. **Show Savings**: Highlight discounts or special pricing
3. **Easy to Decline**: Make "No" option clear and accessible
4. **Single Focus**: One product per direct upsell
5. **Urgency**: Mention if offer is time-limited

## Action Attributes

| Attribute | Description |
|-----------|-------------|
| `data-next-upsell-action="add"` | Accept upsell and add to order |
| `data-next-upsell-action="skip"` | Decline upsell and continue |

## Container Attributes

| Attribute | Description |
|-----------|-------------|
| `data-next-upsell="offer"` | Marks container as upsell offer |
| `data-next-package-id` | Package to add if accepted |