# Checkout Components Event System Issues

## 🚨 Critical Event Problems Found

### 1. **AddressAutocomplete.js** - Event Pollution
```javascript
// Lines 54-58: Custom DOM events without cleanup
document.dispatchEvent(new CustomEvent('location-fields-shown'));

// Lines 179-183: Event listeners without removal tracking
field.addEventListener('blur', () => field.value.length > 10 && this.#showLocationFields());

// Lines 207-215: Animation events that can leak
field.addEventListener('animationstart', e => {
  if (e.animationName === 'onAutoFillStart') {
    this.#showLocationFields();
  }
});
```

**Problems:**
- No event cleanup mechanism
- Global DOM events dispatched without namespace
- Animation listeners never removed
- No destruction method

---

### 2. **BillingAddressHandler.js** - Multiple Event System Issues
```javascript
// Lines 158-161: Multiple DOM event listeners for same event type
document.addEventListener('payment-method-changed', () => {...});
document.addEventListener('location-fields-shown', () => {...});
document.addEventListener('google-places-autocomplete-filled', (e) => {...});

// Lines 219-223: Direct event dispatching to billing fields
billingElement.dispatchEvent(new Event('change', { bubbles: true }));

// Lines 266-283: Complex mutation observer setup
const observer = new MutationObserver((mutations) => {...});
```

**Problems:**
- No event deduplication
- Multiple listeners for similar events
- Complex mutation observer never cleaned up
- Direct DOM event dispatching without coordination

---

### 3. **FormValidator.js** - Event Listener Accumulation
```javascript
// Lines 42-48: Multiple form submit listeners
this.#form.addEventListener('submit', e => this.#handleSubmit(e));
document.querySelector('[os-checkout-payment="combo"]')?.addEventListener('click', () => {...});
document.addEventListener('payment-method-changed', () => this.clearAllErrors());

// Lines 51-57: Spreedly event listeners that accumulate
Object.entries(listeners).forEach(([event, handler]) => Spreedly.on(event, handler));

// Lines 560-566: Per-field error listeners that multiply
['input', 'change'].forEach(event => 
  input.addEventListener(event, () => this.clearErrorForField(input)));
```

**Problems:**
- Event listeners never removed
- Same event types attached multiple times
- No cleanup on component destruction
- Spreedly listeners accumulate with each initialization

---

### 4. **PaymentHandler.js** - Global Variable Dependencies + Events
```javascript
// Lines 124-126: Global variable pollution
this.#form.__formValidator = this.#formValidator;

// Lines 174-176: Direct DOM event manipulation
document.dispatchEvent(new CustomEvent('payment-method-changed', {
  detail: { mode: this.#paymentMethod }
}));

// Lines 1253-1269: Multiple event listener setup
submitButtons.forEach((button, index) => {
  button.addEventListener('click', (e) => {...});
});
```

**Problems:**
- Global variable attachment to DOM elements
- Custom events without proper namespacing
- Multiple button event listeners without tracking
- No event cleanup strategy

---

### 5. **PaymentSelector.js** - Event System is Actually Good! ✅
```javascript
// Lines 41-43: Proper event listener setup with cleanup tracking
this.#radioInputs.forEach(radio => 
  radio.addEventListener('change', e => this.#setPaymentMode(e.target.value, true))
);

// Lines 83-85: Proper transition event cleanup
form.addEventListener('transitionend', transitionEndHandler, { once: true });
```

**This component is well-designed!** - Uses proper event cleanup patterns

---

### 6. **ProspectCartHandler.js** - Event System Issues
```javascript
// Lines 119-126: Multiple blur event listeners without tracking
if (this.#fields.email) {
  this.#fields.email.addEventListener('blur', () => this.#handleFieldChange());
}
if (this.#fields.firstName) {
  this.#fields.firstName.addEventListener('blur', () => this.#handleFieldChange());
}

// Lines 129-137: Form submit listener without cleanup
const form = document.querySelector('form[os-checkout="form"]');
if (form) {
  form.addEventListener('submit', () => {...});
}
```

**Problems:**
- No event listener tracking for cleanup
- Multiple field listeners without removal strategy
- No destruction method to clean up events

---

### 7. **PhoneInputHandler.js** - Global Dependencies + Events
```javascript
// Lines 73-78: Global variable access and storage
if (window.osAddressHandler) {
  const forcedCountry = window.osAddressHandler.getForcedCountry();
}

// Lines 166-172: Multiple event listeners per phone input
input.addEventListener('input', () => {...});
input.addEventListener('blur', () => {...});
input.addEventListener('countrychange', () => {...});

// Lines 202-210: Interval-based polling (memory leak potential)
const checkInterval = setInterval(() => {
  if (window.osAddressHandler) {
    clearInterval(checkInterval);
  }
}, 100);
```

**Problems:**
- Heavy reliance on global variables
- Multiple event listeners per input without cleanup tracking
- Interval polling that could leak memory
- No proper dependency injection

---

### 8. **ShippingSelector.js** - State Subscription Pattern (Better)
```javascript
// Lines 58-60: Proper state subscription pattern
this.#app.state.subscribe('cart.shippingMethod', () => this.#syncWithCartState());

// Lines 54-56: Event listeners with proper callback setup
method.input.addEventListener('change', () => this.#handleShippingChange(method.id));
```

**This component follows better patterns!** - Uses state subscriptions instead of raw DOM events

---

## 🔧 Immediate Fixes Needed

### 1. **Create Event Cleanup Pattern**
```javascript
// Add to each component
class ComponentBase {
  #eventCleanup = [];
  
  addEventListenerWithCleanup(element, event, handler) {
    element.addEventListener(event, handler);
    this.#eventCleanup.push(() => element.removeEventListener(event, handler));
  }
  
  destroy() {
    this.#eventCleanup.forEach(cleanup => cleanup());
    this.#eventCleanup = [];
  }
}
```

### 2. **Replace Global Variable Dependencies**
**Files to Fix:**
- `PhoneInputHandler.js` - Lines 73-78, 202-210
- `PaymentHandler.js` - Lines 124-126
- `BillingAddressHandler.js` - Lines 158-161

### 3. **Standardize Custom Events**
**Current Scattered Events:**
- `location-fields-shown` (AddressAutocomplete)
- `payment-method-changed` (PaymentHandler, FormValidator)
- `google-places-autocomplete-filled` (BillingAddressHandler)

**Should be namespaced:**
- `os:location.shown`
- `os:payment.changed`
- `os:autocomplete.filled`

### 4. **Add Destruction Methods**
**Components Missing destroy():**
- AddressAutocomplete.js
- BillingAddressHandler.js
- FormValidator.js
- ProspectCartHandler.js
- PhoneInputHandler.js

## 📊 Component Event Health Score

| Component | Event Issues | Global Dependencies | Cleanup | Score |
|-----------|-------------|-------------------|---------|-------|
| AddressAutocomplete | ❌ High | ❌ Yes | ❌ None | 2/10 |
| BillingAddressHandler | ❌ High | ❌ Yes | ❌ None | 1/10 |
| FormValidator | ❌ Very High | ⚠️ Medium | ❌ None | 1/10 |
| PaymentHandler | ❌ High | ❌ Yes | ❌ None | 2/10 |
| PaymentSelector | ✅ Good | ✅ Good | ✅ Good | 8/10 |
| ProspectCartHandler | ⚠️ Medium | ⚠️ Medium | ❌ None | 4/10 |
| PhoneInputHandler | ❌ High | ❌ High | ❌ None | 1/10 |
| ShippingSelector | ✅ Good | ✅ Good | ⚠️ Partial | 7/10 |

## 🎯 Priority Fixes (This Week)

### **Immediate (Today)**
1. Add `destroy()` methods to all components
2. Create event cleanup utility class
3. Remove global variable dependencies in PhoneInputHandler

### **This Week**
1. Standardize all custom events with `os:` namespace
2. Implement proper dependency injection
3. Replace direct DOM event dispatching with EventBus

### **Next Week**
1. Refactor FormValidator event system
2. Clean up BillingAddressHandler mutation observers
3. Consolidate duplicate event handling logic

This analysis shows that **6 out of 8 checkout components** have serious event system issues that need immediate attention! 