# SelectorManager

The SelectorManager handles product selectors that allow users to choose between different packages or options. It's ideal for creating product selection interfaces where users can choose one option from a set of alternatives.

## Basic Usage

Add a selector component to your HTML with the required attributes:

```html
<div data-os-component="selector" data-os-selection-mode="swap" data-os-id="plan-selector">
  <!-- Option 1 -->
  <div data-os-element="card" data-os-package="1" data-os-quantity="1" data-os-selected="true">
    <h3 class="card-title">Basic Plan</h3>
    <div class="pb-quantity__price pb--current">$19.99 USD</div>
    <!-- Additional content -->
  </div>
  
  <!-- Option 2 -->
  <div data-os-element="card" data-os-package="2" data-os-quantity="1">
    <h3 class="card-title">Premium Plan</h3>
    <div class="pb-quantity__price pb--current">$39.99 USD</div>
    <!-- Additional content -->
  </div>
</div>
```

## How It Works

1. When a user clicks on a card, the SelectorManager:
   - Updates the UI to highlight the selected card
   - Adds the selected item to the cart
   - Removes any previously selected item from the same selector group
   
2. Each selector requires:
   - `data-os-component="selector"` - Identifies this as a selector component
   - `data-os-selection-mode="swap"` - Sets the selection behavior (only "swap" mode is currently supported)
   - `data-os-id="unique-id"` - Unique identifier for this selector

3. Each card requires:
   - `data-os-element="card"` - Identifies this as a selectable card
   - `data-os-package="id"` - The package ID of the product
   - `data-os-quantity="1"` - The quantity to add to cart (optional, defaults to 1)
   - `data-os-selected="true"` - Set to pre-select this item (optional)
   - `data-os-shipping-id="id"` - The ID of the shipping method to apply when this card is selected (optional). If present, selecting this card will call `cart.setShippingMethod()` with this ID.

## CSS Classes

The SelectorManager applies these CSS classes for styling:

- `.os--selected` - Applied to the currently selected card
- `.os--active` - Applied when the item is in the cart

You can style these classes in your CSS:

```css
[data-os-element="card"] {
  border: 1px solid #ccc;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

[data-os-element="card"].os--selected {
  border-color: #0066cc;
  background-color: rgba(0, 102, 204, 0.05);
}

[data-os-element="card"].os--active {
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
```

## Events

No direct events are emitted by the SelectorManager, but cart updates will trigger the `cart.updated` event.

```javascript
window.on29NextReady.push(function(client) {
  client.on('cart.updated', function(data) {
    console.log('Cart updated after selection:', data.cart);
  });
});
```

## Multiple Selectors

You can have multiple selectors on a page by giving each a unique ID:

```html
<!-- First selector for plan selection -->
<div data-os-component="selector" data-os-selection-mode="swap" data-os-id="plan-selector">
  <!-- Plan options here -->
</div>

<!-- Second selector for color selection -->
<div data-os-component="selector" data-os-selection-mode="swap" data-os-id="color-selector">
  <!-- Color options here -->
</div>
```

## Example: Product Configuration

Here's an example of using selectors to create a product configuration interface:

```html
<div class="product-configurator">
  <h2>Choose Your Plan</h2>
  <div data-os-component="selector" data-os-selection-mode="swap" data-os-id="plan-selector">
    <div class="option-cards">
      <div data-os-element="card" data-os-package="plan-basic" data-os-selected="true">
        <h3>Basic</h3>
        <div class="pb-quantity__price pb--current">$9.99/month</div>
        <ul>
          <li>5 users</li>
          <li>10GB storage</li>
          <li>Email support</li>
        </ul>
      </div>
      
      <div data-os-element="card" data-os-package="plan-pro">
        <h3>Professional</h3>
        <div class="pb-quantity__price pb--current">$19.99/month</div>
        <ul>
          <li>10 users</li>
          <li>50GB storage</li>
          <li>Priority support</li>
        </ul>
      </div>
      
      <div data-os-element="card" data-os-package="plan-enterprise">
        <h3>Enterprise</h3>
        <div class="pb-quantity__price pb--current">$49.99/month</div>
        <ul>
          <li>Unlimited users</li>
          <li>250GB storage</li>
          <li>24/7 phone support</li>
        </ul>
      </div>
    </div>
  </div>
</div>
``` 