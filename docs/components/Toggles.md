# ToggleManager

The ToggleManager creates toggle buttons that add or remove items from the cart. This is perfect for optional add-ons, accessories, or upgrades that users can toggle on or off.

## Basic Usage

Add toggle buttons to your HTML with the required attributes:

```html
<button data-os-action="toggle-item" 
        data-os-package="3"
        data-os-quantity="1"
        data-os-id="addon-toggle">
  Add Service Package
</button>
```

## How It Works

1. When a user clicks a toggle button, the ToggleManager:
   - Adds the item to the cart if it's not already there
   - Removes the item from the cart if it's already there
   - Updates the button's visual state

2. Each toggle button requires:
   - `data-os-action="toggle-item"` - Identifies this as a toggle button
   - `data-os-package="id"` - The package ID of the product
   - `data-os-quantity="1"` - The quantity to add to cart (optional, defaults to 1)
   - `data-os-id="unique-id"` - Unique identifier for this toggle (optional)

## CSS Classes

The ToggleManager applies these CSS classes for styling:

- `.os--active` - Applied when the item is in the cart

You can style this class in your CSS:

```css
[data-os-action="toggle-item"] {
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  padding: 10px 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

[data-os-action="toggle-item"].os--active {
  background-color: #0066cc;
  color: white;
  border-color: #0055aa;
}
```

## Events

The ToggleManager emits the following event:

- `toggle.changed` - Triggered when a toggle button is clicked
  - Event data: `{ toggleId, packageId, isActive }`

## Example Usage with Events

```javascript
window.on29NextReady.push(function(client) {
  client.on('toggle.changed', function(data) {
    console.log('Toggle changed:', data.toggleId, 'Active:', data.isActive);
    
    // Show a message when an add-on is toggled
    if (data.isActive) {
      showNotification('Add-on added to cart!');
    } else {
      showNotification('Add-on removed from cart.');
    }
  });
});
```

## Styling for Different States

You can create different styles for the toggle buttons based on their state:

```html
<button data-os-action="toggle-item" 
        data-os-package="extended-warranty" 
        class="toggle-button">
  <span class="toggle-icon-add">+</span>
  <span class="toggle-icon-remove">-</span>
  <span class="toggle-text-add">Add Extended Warranty</span>
  <span class="toggle-text-remove">Remove Extended Warranty</span>
</button>
```

```css
/* Default state */
.toggle-button .toggle-icon-remove,
.toggle-button .toggle-text-remove {
  display: none;
}

/* Active state */
.toggle-button.os--active .toggle-icon-add,
.toggle-button.os--active .toggle-text-add {
  display: none;
}

.toggle-button.os--active .toggle-icon-remove,
.toggle-button.os--active .toggle-text-remove {
  display: inline;
}
```

## Example: Product Add-ons

Here's an example of using toggle buttons to create product add-ons:

```html
<div class="product-addons">
  <h3>Available Add-ons</h3>
  
  <div class="addon-item">
    <div class="addon-details">
      <h4>Extended Warranty</h4>
      <p>Extend your warranty to 3 years</p>
      <div class="addon-price">$29.99</div>
    </div>
    <button data-os-action="toggle-item" 
            data-os-package="extended-warranty" 
            class="addon-toggle">
      Add to Cart
    </button>
  </div>
  
  <div class="addon-item">
    <div class="addon-details">
      <h4>Premium Support</h4>
      <p>24/7 priority support for one year</p>
      <div class="addon-price">$49.99</div>
    </div>
    <button data-os-action="toggle-item" 
            data-os-package="premium-support" 
            class="addon-toggle">
      Add to Cart
    </button>
  </div>
  
  <div class="addon-item">
    <div class="addon-details">
      <h4>Express Shipping</h4>
      <p>Get your order in 2 business days</p>
      <div class="addon-price">$12.99</div>
    </div>
    <button data-os-action="toggle-item" 
            data-os-package="express-shipping" 
            class="addon-toggle">
      Add to Cart
    </button>
  </div>
</div>
```

## Conditional Display

You can use the toggle state to conditionally show additional content:

```html
<div class="product-option">
  <button data-os-action="toggle-item" data-os-package="gift-wrap" id="gift-wrap-toggle">
    Add Gift Wrapping (+$5.99)
  </button>
  
  <div id="gift-message-container" style="display: none;">
    <label for="gift-message">Gift Message:</label>
    <textarea id="gift-message" placeholder="Enter your gift message here"></textarea>
  </div>
</div>

<script>
  window.on29NextReady.push(function(client) {
    client.on('toggle.changed', function(data) {
      if (data.toggleId === 'gift-wrap-toggle') {
        const messageContainer = document.getElementById('gift-message-container');
        messageContainer.style.display = data.isActive ? 'block' : 'none';
      }
    });
  });
</script> 