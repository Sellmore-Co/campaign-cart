# Accessibility Guide

Making Next Commerce JS SDK implementations accessible to all users.

## ARIA Attributes

### Interactive Elements
```html
<!-- Buttons with clear labels -->
<button data-next-action="add-to-cart" 
        data-next-package-id="1"
        aria-label="Add Premium Drone Bundle to cart">
  Add to Cart
</button>

<!-- Toggle buttons with state -->
<button data-next-toggle
        data-next-package-id="10"
        aria-pressed="false"
        aria-label="Add extra battery to order">
  Add Battery
</button>

<!-- Update aria-pressed with JavaScript -->
<script>
document.addEventListener('click', (e) => {
  if (e.target.matches('[data-next-toggle]')) {
    const isInCart = e.target.classList.contains('next-in-cart');
    e.target.setAttribute('aria-pressed', isInCart);
  }
});
</script>
```

### Selectors
```html
<!-- Radio group pattern for selectors -->
<div data-next-cart-selector 
     role="radiogroup"
     aria-label="Choose package option">
  
  <div data-next-selector-card 
       data-next-package-id="1"
       role="radio"
       aria-checked="false"
       tabindex="0">
    <h3 id="package-1-label">Basic Package</h3>
    <p id="package-1-desc">1 drone, standard accessories</p>
  </div>
  
  <div data-next-selector-card 
       data-next-package-id="2"
       role="radio"
       aria-checked="true"
       tabindex="0"
       data-next-selected="true">
    <h3 id="package-2-label">Premium Package</h3>
    <p id="package-2-desc">1 drone, extra batteries, case</p>
  </div>
</div>
```

## Keyboard Navigation

### Focus Management
```css
/* Visible focus indicators */
:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

/* Don't remove outline without providing alternative */
button:focus-visible {
  outline: 3px solid #007bff;
  outline-offset: 2px;
}

/* Skip hidden elements */
[data-next-hide="true"] {
  display: none; /* Removes from tab order */
}
```

### Keyboard Handlers
```javascript
// Handle keyboard navigation for selectors
document.querySelectorAll('[data-next-cart-selector]').forEach(selector => {
  const cards = selector.querySelectorAll('[data-next-selector-card]');
  
  cards.forEach((card, index) => {
    card.addEventListener('keydown', (e) => {
      let newIndex;
      
      switch(e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          newIndex = (index + 1) % cards.length;
          cards[newIndex].focus();
          cards[newIndex].click();
          break;
          
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          newIndex = (index - 1 + cards.length) % cards.length;
          cards[newIndex].focus();
          cards[newIndex].click();
          break;
          
        case 'Enter':
        case ' ':
          e.preventDefault();
          card.click();
          break;
      }
    });
  });
});
```

## Screen Reader Support

### Loading States
```html
<!-- Announce loading states -->
<div data-next-await aria-live="polite" aria-busy="true">
  <span class="sr-only">Loading product information</span>
  <span data-next-display="package.name">...</span>
</div>

<!-- Screen reader only class -->
<style>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border: 0;
}
</style>
```

### Dynamic Updates
```html
<!-- Announce cart updates -->
<div aria-live="polite" aria-atomic="true" class="sr-only">
  <span data-next-show="cart.hasItems">
    Cart updated. 
    <span data-next-display="cart.quantity">0</span> items, 
    total <span data-next-display="cart.total">$0</span>
  </span>
</div>

<!-- Status messages -->
<div role="status" aria-live="polite" id="status-message"></div>

<script>
next.on('cart:item-added', (data) => {
  const status = document.getElementById('status-message');
  status.textContent = `${data.item.name} added to cart`;
  
  // Clear after delay
  setTimeout(() => {
    status.textContent = '';
  }, 3000);
});
</script>
```

## Form Accessibility

### Labels and Instructions
```html
<!-- Proper form labeling -->
<form>
  <div class="form-group">
    <label for="quantity-select">
      Select quantity
      <span class="required" aria-label="required">*</span>
    </label>
    <select id="quantity-select" 
            required
            aria-describedby="quantity-help">
      <option value="">Choose quantity</option>
      <option value="1">1 unit</option>
      <option value="3">3 units (Save 10%)</option>
      <option value="5">5 units (Save 20%)</option>
    </select>
    <span id="quantity-help" class="help-text">
      Bulk quantities include automatic discount
    </span>
  </div>
</form>
```

### Error Messages
```html
<!-- Accessible error handling -->
<div class="form-group">
  <label for="coupon-code">Coupon Code</label>
  <input type="text" 
         id="coupon-code"
         aria-invalid="false"
         aria-describedby="coupon-error">
  <span id="coupon-error" 
        class="error-message" 
        role="alert"
        aria-live="assertive"
        hidden>
    Invalid coupon code
  </span>
</div>

<script>
async function applyCoupon() {
  const input = document.getElementById('coupon-code');
  const error = document.getElementById('coupon-error');
  
  const result = await next.applyCoupon(input.value);
  
  if (!result.success) {
    input.setAttribute('aria-invalid', 'true');
    error.hidden = false;
    error.textContent = result.message;
  } else {
    input.setAttribute('aria-invalid', 'false');
    error.hidden = true;
  }
}
</script>
```

## Color and Contrast

### Sufficient Contrast
```css
/* Ensure WCAG AA compliance (4.5:1 for normal text) */
.price {
  color: #333; /* On white background: 12.63:1 ✓ */
  background: white;
}

.savings {
  color: #1a7f1a; /* On white: 4.52:1 ✓ */
}

/* Don't rely on color alone */
.out-of-stock {
  color: #dc3545;
  text-decoration: line-through;
}

.out-of-stock::after {
  content: " (Out of Stock)";
}
```

## Responsive and Zoom

### Scalable Text
```css
/* Use relative units */
body {
  font-size: 1rem; /* 16px default */
}

h1 {
  font-size: 2rem; /* 32px */
}

/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Touch Targets
```css
/* Minimum 44x44px touch targets */
button,
a,
[role="button"] {
  min-height: 44px;
  min-width: 44px;
  padding: 12px;
}

/* Spacing between targets */
.button-group > * + * {
  margin-left: 8px;
}
```

## Testing Accessibility

### Keyboard Testing
1. Navigate using only Tab, Shift+Tab, Arrow keys, Enter, and Space
2. Ensure all interactive elements are reachable
3. Check focus indicators are visible
4. Verify expected keyboard behaviors work

### Screen Reader Testing
1. Test with NVDA (Windows), JAWS, or VoiceOver (Mac)
2. Ensure all content is announced properly
3. Check dynamic updates are announced
4. Verify form labels and errors are clear

### Automated Testing
```javascript
// Example using axe-core
import axe from 'axe-core';

async function runAccessibilityTests() {
  const results = await axe.run();
  
  if (results.violations.length) {
    console.error('Accessibility violations:', results.violations);
  }
}
```

## Checklist

### General
- [ ] All images have appropriate alt text
- [ ] Page has proper heading hierarchy (h1 → h2 → h3)
- [ ] Links have descriptive text (not "click here")
- [ ] Page language is specified (`<html lang="en">`)

### Interactive Elements
- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible
- [ ] Buttons have accessible labels
- [ ] Form inputs have associated labels

### Dynamic Content
- [ ] Loading states are announced
- [ ] Cart updates are announced
- [ ] Error messages are announced
- [ ] Success messages are announced

### Visual Design
- [ ] Text has sufficient contrast (4.5:1 minimum)
- [ ] Information isn't conveyed by color alone
- [ ] Page is usable at 200% zoom
- [ ] Touch targets are at least 44x44px

### Assistive Technology
- [ ] Page works with screen readers
- [ ] ARIA attributes are used correctly
- [ ] Semantic HTML is used appropriately
- [ ] Skip links are provided for navigation

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/TR/wai-aria-practices-1.1/)
- [WebAIM Resources](https://webaim.org/resources/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)