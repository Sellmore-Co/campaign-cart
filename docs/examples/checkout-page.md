# Checkout Page Example

Complete checkout page implementation with cart summary, form validation, express checkout, and bump offers.

## Full HTML Example

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Checkout</title>
  <meta content="width=device-width, initial-scale=1" name="viewport">
  
  <!-- Campaign Configuration -->
  <script src="../config.js"></script>
  <!-- Campaign Loader Script -->
  <script src="https://campaign-cart-v2.pages.dev/loader.js"></script>
  
  <!-- NEXT Metatags -->
  <meta name="next-success-url" content="/demo/upsell1">
  <meta name="next-page-type" content="checkout">
  <meta name="next-funnel" content="CH01">
  
  <!-- Styles -->
  <link href="../css/normalize.css" rel="stylesheet" type="text/css">
  <link href="../css/components.css" rel="stylesheet" type="text/css">
  <link href="../css/next-staging-core.css" rel="stylesheet" type="text/css">
  <link href="../css/custom.css" rel="stylesheet" type="text/css">
  
  <!-- Loading States -->
  <style>
    html:not(.next-display-ready) [data-next-await] {
      position: relative;
      overflow: hidden;
      border-color: transparent !important;
      box-shadow: none !important;
    }
    
    [data-next-await] * {
      opacity: 0;
      transition: opacity 0.2s ease;
    }
    
    [data-next-await]::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #e0e0e0;
      animation: pulse-gray 1.5s ease-in-out infinite;
      z-index: 1;
      pointer-events: none;
    }
    
    @keyframes pulse-gray {
      0%, 100% {
        background-color: #e0e0e0;
        opacity: 0.6;
      }
      50% {
        background-color: #f5f5f5;
        opacity: 0.8;
      }
    }
  </style>
</head>
<body>
  <div class="checkout-page">
    <!-- Mobile Order Summary Accordion -->
    <div class="order-summary-mobile">
      <div data-initial-state="closed" 
           data-next-accordion="order-summary" 
           data-open-text="Hide Order Summary" 
           data-close-text="Show Order Summary" 
           data-toggle-class="next-expanded" 
           class="order-summary-mobile__accordion">
        
        <div data-next-accordion-trigger="order-summary" class="accordion__trigger">
          <div class="accordion__inner">
            <div class="accordion__left">
              <div class="summary-toggle">
                <div data-next-accordion-text="order-summary" class="summary-toggle__text">
                  Show Order Summary
                </div>
              </div>
            </div>
            <div data-next-show="cart.hasItems" class="accordion__right">
              <div data-next-show="cart.hasSavings" 
                   data-next-display="cart.compareTotal" 
                   class="summary_price price--crossed">$109.96</div>
              <div data-next-display="cart.total" class="summary_price price--total">$109.96</div>
            </div>
          </div>
        </div>
        
        <div data-next-accordion-panel="order-summary" class="accordion__panel">
          <!-- Cart Items -->
          <div data-next-hide="cart.isEmpty">
            <div data-next-cart-items="" class="cart-items__list">
              <div data-cart-item-id="{item.id}" class="cart-item">
                <div class="cart-item__wrapper">
                  <div class="cart-item__image-container">
                    <div class="cart-item__quantity-badge">
                      <div class="cart-item__quantity">{item.quantity}</div>
                    </div>
                    <img src="{item.image}" class="cart-item__image">
                  </div>
                  <div class="cart-item__details">
                    <div class="cart-item__content">
                      <div class="cart-item__description">
                        <div class="cart-item__title">{item.name}</div>
                        <div class="cart-item__frequency">One time purchase</div>
                      </div>
                      <div class="cart-item__pricing">
                        <div class="cart-price price--original">{item.unitComparePrice}</div>
                        <div class="checkout__line-item__final-price">{item.unitPrice}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Coupon Section -->
          <div data-next-hide="cart.isEmpty" class="coupon-section">
            <div class="coupon-form">
              <div data-auto-apply="true" 
                   data-next-coupon="input" 
                   data-placeholder="Promo code (optional)" 
                   data-button-text="Apply" 
                   class="coupon-form__row">
                <div class="form-group">
                  <input type="text" placeholder="Promo code (optional)" class="input-flds">
                </div>
                <button class="coupon-button">APPLY</button>
              </div>
              <div data-template="tag" data-next-coupon="display" class="coupon-tags">
                <!-- Applied coupons will appear here -->
              </div>
            </div>
          </div>
          
          <!-- Order Totals -->
          <div data-next-hide="cart.isEmpty" class="order-totals">
            <div class="order-totals__section">
              <div class="order-totals__line">
                <div class="order-totals__label">Subtotal</div>
                <div data-next-display="cart.subtotal" class="order-totals__value">$0.00</div>
              </div>
            </div>
            
            <div data-next-show="cart.hasShipping" class="order-totals__section">
              <div class="order-totals__line">
                <div class="order-totals__label">Shipping</div>
                <div data-next-display="cart.shipping" class="order-totals__value">FREE</div>
              </div>
            </div>
            
            <div data-next-show="cart.hasSavings" class="order-totals__section">
              <div class="order-totals__line">
                <div class="order-totals__label-group">
                  <div class="order-totals__label">Today You Saved</div>
                  <div class="badge badge--small">
                    <span data-next-display="cart.totalSavingsPercentage">0%</span> OFF
                  </div>
                </div>
                <div class="order-totals__value-group">
                  <div class="order-totals__label">Discount:</div>
                  <div data-next-display="cart.totalSavingsAmount" class="order-totals__value">$0.00</div>
                </div>
              </div>
            </div>
            
            <div class="order-totals__section cc-total">
              <div class="order-totals__line order-totals__line--total">
                <div class="order-totals__label order-totals__label--total">Grand Total:</div>
                <div class="order-totals__value-group">
                  <div class="summary-total__coin">USD</div>
                  <div data-next-display="cart.total" class="order-totals__value order-totals__value--total">$0.00</div>
                </div>
              </div>
              
              <div data-next-show="cart.hasSavings" class="order-totals__savings">
                <div class="order-totals__savings-content">
                  <div class="order-totals__savings-text">
                    TOTAL SAVINGS <span data-next-display="cart.savingsAmount">$0.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Empty Cart Message -->
          <div data-next-show="cart.isEmpty" class="next-empty-cart">
            <div class="tw-600">YOUR CART IS EMPTY</div>
            <a href="/demo/test-product.php" class="empty-cart__link">Continue Shopping</a>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Bump Offer -->
    <div data-next-await="" data-next-show="cart.hasItems">
      <div data-next-package-sync="2,3,4" 
           data-next-bump="" 
           data-next-package-id="6" 
           class="upsell">
        <div data-next-toggle="toggle" class="upsell__header">
          <div class="upsell__header-content">
            <div class="upsell-checkbox">
              <div class="checkbox__icon">✓</div>
            </div>
            <div class="upsell__title">YES, I Will Take It</div>
          </div>
        </div>
        <div class="upsell__body">
          <div class="upsell__content">
            <img data-next-display="package.6.image" src="../images/icon.svg" class="upsell__image">
            <div class="upsell__description">
              Get peace of mind with <span data-next-display="package.6.name">Shipping Guarantee</span> 
              in the event your delivery is damaged, stolen, or lost during transit for 
              <span data-next-display="package.6.price">$1.99</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Express Checkout -->
    <div data-next-express-checkout="container" class="exp-checkout">
      <div class="express-checkout__title">Express Checkout</div>
      
      <div data-next-component="express-error" class="next-toast-handler">
        <div class="tip1_bar is-warning">
          <div data-next-component="express-error-text" class="text-sm">Error message</div>
        </div>
      </div>
      
      <div data-next-express-checkout="buttons" class="express-checkout__buttons">
        <button data-next-express-checkout="paypal" data-action="submit" class="payment-btn cc-paypal">
          PayPal
        </button>
        <button data-next-express-checkout="apple_pay" data-action="submit" class="payment-btn cc-apple-pay">
          Apple Pay
        </button>
        <button data-next-express-checkout="google_pay" data-action="submit" class="payment-btn cc-google-pay">
          Google Pay
        </button>
      </div>
    </div>
    
    <!-- Checkout Form -->
    <div class="checkout-form">
      <form data-next-checkout="form" id="combo_form" method="post">
        <div class="form-content">
          <!-- Contact Information -->
          <div class="form-section">
            <h2 class="form-section__title">Contact Information</h2>
            <div class="form-group">
              <label for="email" class="label-checkout">Email</label>
              <input type="email" 
                     name="email" 
                     id="email" 
                     placeholder="Email*" 
                     data-next-checkout-field="email" 
                     class="input-flds" 
                     required>
            </div>
          </div>
          
          <!-- Shipping Information -->
          <div class="form-section">
            <h1 class="form-section__title">Shipping Information</h1>
            <div class="form-grid">
              <div data-next-component="shipping-field-row" class="form-grid__row">
                <div class="form-group">
                  <label for="shipping_country" class="label-checkout">Country</label>
                  <select data-next-checkout-field="country" class="input-flds select-field" required>
                    <option value="">Select Country</option>
                  </select>
                </div>
              </div>
              
              <div data-next-component="shipping-field-row" class="form-grid__row">
                <div class="form-group">
                  <label for="shipping_fname" class="label-checkout">First Name</label>
                  <input type="text" 
                         name="shipping_fname" 
                         id="shipping_fname" 
                         placeholder="First Name*" 
                         data-next-checkout-field="fname" 
                         class="input-flds" 
                         required>
                </div>
                <div class="form-group">
                  <label for="shipping_lname" class="label-checkout">Last Name</label>
                  <input type="text" 
                         name="shipping_lname" 
                         id="shipping_lname" 
                         placeholder="Last Name*" 
                         data-next-checkout-field="lname" 
                         class="input-flds" 
                         required>
                </div>
              </div>
              
              <div data-next-component="shipping-field-row" class="form-grid__row">
                <div class="form-group">
                  <label for="shipping_address1" class="label-checkout">Address</label>
                  <input type="text" 
                         placeholder="Address*" 
                         data-next-checkout-field="address1" 
                         class="input-flds" 
                         required>
                </div>
              </div>
              
              <div data-next-component="shipping-field-row" class="form-grid__row">
                <div class="form-group">
                  <label for="shipping_address2" class="label-checkout">Apartment, suite, etc. (optional)</label>
                  <input type="text" 
                         name="shipping_address2" 
                         id="shipping_address2" 
                         placeholder="Apartment, suite, etc. (optional)" 
                         data-next-checkout-field="address2" 
                         class="input-flds">
                </div>
              </div>
              
              <div data-next-component="shipping-field-row" class="form-grid__row">
                <div class="form-group">
                  <label for="shipping_city" class="label-checkout">City</label>
                  <input type="text" 
                         name="shipping_city" 
                         id="shipping_city" 
                         placeholder="City*" 
                         data-next-checkout-field="city" 
                         class="input-flds" 
                         required>
                </div>
                <div class="form-group">
                  <label for="shipping_province" class="label-checkout">State</label>
                  <select name="shipping_province" 
                          id="shipping_province" 
                          data-next-checkout-field="province" 
                          class="input-flds select-field" 
                          required>
                    <option value="">Select State</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="shipping_postal_code" class="label-checkout">ZIP Code</label>
                  <input type="text" 
                         name="shipping_postal_code" 
                         id="shipping_postal_code" 
                         placeholder="ZIP Code*" 
                         data-next-checkout-field="postal" 
                         class="input-flds" 
                         pattern="(^\d{5}$)|(^\d{5}-\d{4}$)" 
                         required>
                </div>
              </div>
              
              <div data-next-component="shipping-field-row" class="form-grid__row">
                <div class="form-group">
                  <label for="phone" class="label-checkout">Phone</label>
                  <input type="tel" 
                         name="phone" 
                         id="phone" 
                         placeholder="201-555-0123" 
                         data-next-checkout-field="phone" 
                         class="input-flds">
                </div>
              </div>
            </div>
          </div>
          
          <!-- Payment Details -->
          <div class="form-section form-section--last">
            <h1 class="form-section__title">Payment Details</h1>
            <div class="form-section__subtitle">All transactions are secure and encrypted.</div>
            
            <div class="payment-methods">
              <div data-next-payment-method="credit" class="payment-method next-selected">
                <div class="payment-method__header">
                  <label class="payment-method__label">
                    <input type="radio" name="payment_method" value="credit" checked>
                    <div class="payment-method__title">Credit Card</div>
                    <div class="payment-method__icons">
                      <!-- Card brand icons -->
                    </div>
                  </label>
                </div>
                
                <div data-next-payment-form="credit" class="payment-method__form payment-method__form--expanded">
                  <div data-next-component="credit-error" class="next-toast-handler">
                    <div class="tip1_bar is-warning">
                      <div data-next-component="credit-error-text" class="text-sm">Error message</div>
                    </div>
                  </div>
                  
                  <div class="form-grid">
                    <div class="form-grid__row">
                      <div class="form-group">
                        <div data-next-checkout-field="cc-number" class="input-flds spreedly-field"></div>
                      </div>
                    </div>
                    <!-- Additional payment fields handled by SDK -->
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Submit Button -->
        <button type="submit" class="checkout-button" data-next-show="cart.hasItems">
          Complete Order
        </button>
      </form>
    </div>
  </div>
</body>
</html>
```

## Key SDK Attributes Used

### Cart Display & Management
- `data-next-cart-items=""` - Container for dynamic cart items
- `data-next-display="cart.total"` - Display cart total
- `data-next-display="cart.subtotal"` - Display subtotal
- `data-next-display="cart.shipping"` - Display shipping cost
- `data-next-display="cart.savingsAmount"` - Display savings amount
- `data-next-display="cart.totalSavingsAmount"` - Display total savings amount in currency
- `data-next-display="cart.totalSavingsPercentage"` - Display savings percentage
- `data-next-display="cart.compareTotal"` - Display original price before discounts
- `data-next-show="cart.hasItems"` - Show when cart has items
- `data-next-show="cart.isEmpty"` - Show when cart is empty
- `data-next-show="cart.hasSavings"` - Show when there are savings
- `data-next-show="cart.hasShipping"` - Show when shipping is applicable
- `data-next-hide="cart.isEmpty"` - Hide when cart is empty

### Accordion Component
- `data-next-accordion="order-summary"` - Define accordion container
- `data-next-accordion-trigger="order-summary"` - Accordion trigger button
- `data-next-accordion-panel="order-summary"` - Accordion content panel
- `data-next-accordion-text="order-summary"` - Dynamic text for open/close states
- `data-initial-state="closed"` - Set initial accordion state
- `data-open-text="Hide Order Summary"` - Text when accordion is open
- `data-close-text="Show Order Summary"` - Text when accordion is closed
- `data-toggle-class="next-expanded"` - CSS class to toggle

### Coupon Management
- `data-next-coupon="input"` - Coupon input configuration
- `data-next-coupon="display"` - Container for applied coupons
- `data-auto-apply="true"` - Auto-apply coupon on valid input
- `data-placeholder="Promo code (optional)"` - Input placeholder text
- `data-button-text="Apply"` - Button text

### Bump Offers
- `data-next-bump=""` - Mark container as bump offer
- `data-next-package-id="6"` - Package ID for the bump offer
- `data-next-toggle="toggle"` - Enable toggle functionality
- `data-next-package-sync="2,3,4"` - Sync quantity with other packages

### Express Checkout
- `data-next-express-checkout="container"` - Express checkout container
- `data-next-express-checkout="buttons"` - Button container
- `data-next-express-checkout="paypal"` - PayPal button
- `data-next-express-checkout="apple_pay"` - Apple Pay button
- `data-next-express-checkout="google_pay"` - Google Pay button

### Checkout Form
- `data-next-checkout="form"` - Main checkout form
- `data-next-checkout-field="email"` - Email field
- `data-next-checkout-field="fname"` - First name field
- `data-next-checkout-field="lname"` - Last name field
- `data-next-checkout-field="address1"` - Address line 1
- `data-next-checkout-field="address2"` - Address line 2
- `data-next-checkout-field="city"` - City field
- `data-next-checkout-field="country"` - Country selector
- `data-next-checkout-field="province"` - State/Province selector
- `data-next-checkout-field="postal"` - ZIP/Postal code
- `data-next-checkout-field="phone"` - Phone number
- `data-next-checkout-field="cc-number"` - Credit card number (secure field)
- `data-next-checkout-field="exp-month"` - Credit card expiration month
- `data-next-checkout-field="exp-year"` - Credit card expiration year
- `data-next-checkout-field="cvv"` - Credit card CVV code

### Payment Methods
- `data-next-payment-method="credit"` - Credit card payment method
- `data-next-payment-method="paypal"` - PayPal payment method
- `data-next-payment-form="credit"` - Credit card form container
- `data-next-payment-form="paypal"` - PayPal form container

### Error Handling
- `data-next-component="express-error"` - Express checkout error container
- `data-next-component="express-error-text"` - Express checkout error message
- `data-next-component="credit-error"` - Credit card error container
- `data-next-component="credit-error-text"` - Credit card error message
- `data-next-component="paypal-error"` - PayPal error container
- `data-next-component="paypal-error-text"` - PayPal error message

### Loading States
- `data-next-await=""` - Show loading skeleton while data loads
- `data-next-skeleton=""` - Skeleton loading indicator

### Other Utilities
- `data-next-content=""` - Mark dynamic content area
- `data-animate="right"` - Animation direction for right arrow
- `data-animate="left"` - Animation direction for left arrow
- `data-next-component="shipping-field-row"` - Container for shipping form field rows
- `data-next-component="scroll-hint"` - Scroll hint for long cart item lists
- `data-next-tooltip=""` - Add tooltip to form fields
- `data-checkout-tooltip=""` - Tooltip content
- `data-checkout-tooltip-position="top"` - Tooltip position
- `data-template="tag"` - Template type for coupon display
- `data-action="submit"` - Action trigger for buttons

## Features Demonstrated

1. **Mobile-First Design** - Accordion for order summary on mobile
2. **Dynamic Cart Display** - Real-time cart items with quantity badges
3. **Coupon System** - Apply and display discount codes with auto-apply option
4. **Bump Offers** - Pre-checkout upsell with toggle functionality and package syncing
5. **Express Checkout** - PayPal, Apple Pay, Google Pay options
6. **Form Validation** - Required fields, pattern validation, and autocomplete attributes
7. **Secure Payment** - PCI-compliant credit card fields with Spreedly integration
8. **Loading States** - Skeleton screens while data loads
9. **Error Handling** - Toast notifications for errors across payment methods
10. **Conditional Display** - Show/hide based on cart state
11. **Scroll Hints** - Visual indicators for scrollable cart items
12. **Multiple Payment Methods** - Credit card and PayPal options
13. **Billing Address** - Option to use shipping address as billing
14. **Field Tooltips** - Help text for form fields
15. **Security Indicators** - Visual security badges and messaging

## Security Note

The SDK handles all sensitive payment data securely:
- Credit card fields are tokenized using Spreedly
- No sensitive data is stored client-side
- All transactions are encrypted (100% Encrypted & Secure Checkout)
- PCI compliance is maintained
- Secure field indicators with lock icons
- SSL/TLS encryption for all data transmission

## Additional Implementation Details

### Meta Tags
Required meta tags for checkout functionality:
```html
<meta name="next-success-url" content="/demo/upsell1">
<meta name="next-page-type" content="checkout">
<meta name="next-funnel" content="CH01">
```

### CSS Classes
The SDK automatically adds these classes:
- `next-selected` - Applied to selected payment methods
- `next-active` - Applied to active bump offers
- `next-expanded` - Applied when accordion is expanded
- `next-disabled` - Applied to disabled buttons
- `next-in-cart` - Applied to items in cart
- `next-display-ready` - Applied to HTML when SDK is ready

### Form Validation Patterns
- ZIP Code: `pattern="(^\d{5}$)|(^\d{5}-\d{4}$)"`
- City: `pattern="^[A-Za-z\s]+$"`
- Phone: Uses international tel input library

### Autocomplete Support
All form fields include proper autocomplete attributes:
- `autocomplete="email"`
- `autocomplete="given-name"`
- `autocomplete="family-name"`
- `autocomplete="address-line1"`
- `autocomplete="address-line2"`
- `autocomplete="address-level2"` (city)
- `autocomplete="address-level1"` (state)
- `autocomplete="postal-code"`
- `autocomplete="tel"`
- `autocomplete="cc-number"`
- `autocomplete="cc-exp-month"`
- `autocomplete="cc-exp-year"`