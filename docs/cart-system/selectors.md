# Cart Selectors

Cart selectors allow users to choose products before adding them to cart. The SDK supports multiple selection patterns.

## Swap Mode Selector

In swap mode, clicking a card immediately replaces the current item in the cart. No button needed.

```html
<div data-next-cart-selector data-next-selection-mode="swap">
  <div data-next-selector-card data-next-package-id="2">
    <h3>Basic Package</h3>
    <span data-next-display="package.price">$99</span>
  </div>
  <div data-next-selector-card data-next-package-id="3" data-next-selected="true">
    <h3>Premium Package</h3>
    <span data-next-display="package.price">$199</span>
  </div>
</div>
```

### Key Attributes
- `data-next-cart-selector`: Defines the selector container
- `data-next-selection-mode="swap"`: Auto-adds to cart on selection
- `data-next-selector-card`: Individual selectable cards
- `data-next-package-id`: Package ID to add
- `data-next-selected="true"`: Default selection

## Select Mode with Button

Select first, then click button to add. Button is disabled until selection is made.

```html
<div data-next-cart-selector 
     data-next-selector-id="button-selector"
     data-next-selection-mode="select">
  <div data-next-selector-card data-next-package-id="3">
    <h3>Package Option 1</h3>
  </div>
  <div data-next-selector-card data-next-package-id="4">
    <h3>Package Option 2</h3>
  </div>
</div>

<button data-next-action="add-to-cart" 
        data-next-selector-id="button-selector">
  Add to Cart
</button>
```

### Key Attributes
- `data-next-selection-mode="select"`: Requires button to add
- `data-next-selector-id`: Links selector to button
- `data-next-action="add-to-cart"`: Add to cart action

## Displaying Selection Data

Show data about the currently selected package:

```html
<div data-next-cart-selector data-next-selector-id="my-selector">
  <!-- Selector cards here -->
</div>

<!-- Display selected package info -->
<div>
  Selected: <span data-next-display="selection.my-selector.name">None</span>
  Price: <span data-next-display="selection.my-selector.price">$0</span>
</div>
```

## CSS Classes

Selectors automatically get CSS classes:
- `.next-selected` - Applied to selected card
- `.next-selector-active` - Applied when selector has selection

## Advanced Features

### Multiple Selectors
You can have multiple selectors on the same page with different IDs:

```html
<!-- Main product selector -->
<div data-next-cart-selector data-next-selector-id="main-product">
  <!-- Cards -->
</div>

<!-- Warranty selector -->
<div data-next-cart-selector data-next-selector-id="warranty">
  <!-- Cards -->
</div>
```

### Conditional Display
Show/hide elements based on selection:

```html
<div data-next-show="selection.my-selector.hasSelection">
  You've selected a package!
</div>
```