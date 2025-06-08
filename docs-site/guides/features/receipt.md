# Receipt Page Guide

Complete guide to implementing order confirmation receipt pages that automatically display order details.

## Overview

The receipt page is shown after a successful order completion and displays comprehensive order information including customer details, order summary, billing/shipping addresses, payment information, and order totals. Campaign Cart automatically populates receipt elements using order data fetched via the order reference ID.

## How Receipt Pages Work

1. **URL Parameter** - Receipt page gets order reference via `?ref_id=ORDER_REF_ID`
2. **API Fetch** - Campaign Cart automatically fetches order details using the ref_id
3. **DOM Update** - All elements with `data-os-receipt` attributes are populated with order data
4. **Currency Formatting** - Prices are automatically formatted based on order currency

## Basic Receipt Implementation

### Meta Configuration

```html
<meta name="os-api-key" content="YOUR_API_KEY">
<meta name="os-page-type" content="receipt">
```

### Complete Receipt Page Example

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Order Confirmation</title>
  
  <meta name="os-api-key" content="YOUR_API_KEY">
  <meta name="os-page-type" content="receipt">
  
  <script src="https://rtc2.29next.com/campaign-cart/29next.min.js"></script>
  
  <style>
    .receipt-container { max-width: 800px; margin: 2rem auto; padding: 2rem; font-family: Arial, sans-serif; }
    .receipt-header { text-align: center; margin-bottom: 3rem; padding: 2rem; background: #f8f9fa; border-radius: 8px; }
    .receipt-section { margin: 2rem 0; padding: 1.5rem; border: 1px solid #ddd; border-radius: 8px; }
    .receipt-row { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #eee; }
    .receipt-row:last-child { border-bottom: none; }
    .receipt-total { font-weight: bold; font-size: 1.2rem; background: #f8f9fa; padding: 1rem; margin-top: 1rem; }
    .receipt-address { margin: 1rem 0; padding: 1rem; background: #f8f9fa; border-radius: 4px; }
    .order-lines { margin: 1rem 0; }
    .order-line { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border: 1px solid #eee; margin: 0.5rem 0; border-radius: 4px; }
    .line-details { flex: 1; }
    .line-title { font-weight: bold; margin-bottom: 0.5rem; }
    .line-saving { color: #e74c3c; font-size: 0.9rem; }
    .line-compare { text-decoration: line-through; color: #999; margin-right: 0.5rem; }
    .line-subtotal { font-weight: bold; color: #2ecc71; }
    .hidden { display: none; }
  </style>
</head>
<body>
  <div class="receipt-container">
    
    <!-- Header -->
    <div class="receipt-header">
      <h1>🎉 Thank You for Your Order!</h1>
      <p>Your order has been confirmed and is being processed.</p>
      <p><strong>Order #<span data-os-receipt="order_number">Loading...</span></strong></p>
      <p>Reference: <span data-os-receipt="order_reference">Loading...</span></p>
    </div>
    
    <!-- Customer Information -->
    <div class="receipt-section">
      <h2>Customer Information</h2>
      <p><strong>Name:</strong> <span data-os-receipt="fname">Loading...</span></p>
    </div>
    
    <!-- Order Details -->
    <div class="receipt-section">
      <h2>Order Summary</h2>
      
      <!-- Order lines container -->
      <div class="order-lines" data-os-receipt="order-lines">
        <!-- Product line template (hidden, used for cloning) -->
        <div data-os-receipt="product-line" class="order-line" style="display: none;">
          <div class="line-details">
            <div data-os-receipt="line-title" class="line-title">Product Name</div>
            <div data-os-receipt="line-saving" class="line-saving">(20% OFF)</div>
          </div>
          <div class="line-pricing">
            <span data-os-receipt="line-compare" class="line-compare">$99.99</span>
            <span data-os-receipt="line-subtotal" class="line-subtotal">$79.99</span>
          </div>
        </div>
      </div>
      
      <!-- Order totals -->
      <div class="receipt-totals">
        
        <!-- Shipping -->
        <div data-os-receipt="shipping-container" class="receipt-row">
          <span>Shipping (<span data-os-receipt="shipping_method">Standard Shipping</span>):</span>
          <span data-os-receipt="shipping-price">$0.00</span>
        </div>
        
        <!-- Tax (only shown if taxes exist) -->
        <div data-os-receipt="tax-container" class="receipt-row" style="display: none;">
          <span>Tax:</span>
          <span data-os-receipt="taxes">$0.00</span>
        </div>
        
        <!-- Total -->
        <div class="receipt-row receipt-total">
          <span><strong>Total:</strong></span>
          <span><strong data-os-receipt="total">$0.00</strong></span>
        </div>
        
      </div>
    </div>
    
    <!-- Billing Address -->
    <div class="receipt-section">
      <h2>Billing Information</h2>
      <div class="receipt-address">
        <p><strong>Name:</strong> <span data-os-receipt="billing_fname">Loading...</span></p>
        <p><strong>Address:</strong> <span data-os-receipt="billing_address">Loading...</span></p>
        <p><strong>Location:</strong> <span data-os-receipt="billing_location">Loading...</span></p>
        <p><strong>Country:</strong> <span data-os-receipt="billing_country">Loading...</span></p>
      </div>
    </div>
    
    <!-- Shipping Address -->
    <div class="receipt-section">
      <h2>Shipping Information</h2>
      <div class="receipt-address">
        <p><strong>Name:</strong> <span data-os-receipt="shipping_fname">Loading...</span></p>
        <p><strong>Address:</strong> <span data-os-receipt="shipping_address">Loading...</span></p>
        <p><strong>Location:</strong> <span data-os-receipt="shipping_location">Loading...</span></p>
        <p><strong>Country:</strong> <span data-os-receipt="shipping_country">Loading...</span></p>
      </div>
    </div>
    
    <!-- Payment Information -->
    <div class="receipt-section">
      <h2>Payment Information</h2>
      <p><strong>Payment Method:</strong> <span data-os-receipt="payment_method">Loading...</span></p>
    </div>
    
    <!-- Next Steps -->
    <div class="receipt-section">
      <h2>What's Next?</h2>
      <ul>
        <li>You will receive an email confirmation shortly</li>
        <li>Your order will be processed within 1-2 business days</li>
        <li>You'll receive tracking information once shipped</li>
        <li>Questions? Contact our support team</li>
      </ul>
    </div>
    
  </div>
</body>
</html>
```

## Receipt Data Attributes

### Customer Information

```html
<!-- Customer name -->
<span data-os-receipt="fname">Customer Name</span>
```

### Order Information

```html
<!-- Order identification -->
<span data-os-receipt="order_number">Order Number</span>
<span data-os-receipt="order_reference">Reference ID</span>

<!-- Order lines container -->
<div data-os-receipt="order-lines">
  <!-- Product line template -->
  <div data-os-receipt="product-line">
    <span data-os-receipt="line-title">Product Name</span>
    <span data-os-receipt="line-saving">(20% OFF)</span>
    <span data-os-receipt="line-compare">$99.99</span>
    <span data-os-receipt="line-subtotal">$79.99</span>
  </div>
</div>
```

### Billing Address

```html
<span data-os-receipt="billing_fname">Full Name</span>
<span data-os-receipt="billing_address">Street Address</span>
<span data-os-receipt="billing_location">City, State ZIP</span>
<span data-os-receipt="billing_country">Country</span>
```

### Shipping Address

```html
<span data-os-receipt="shipping_fname">Full Name</span>
<span data-os-receipt="shipping_address">Street Address</span>
<span data-os-receipt="shipping_location">City, State ZIP</span>
<span data-os-receipt="shipping_country">Country</span>
```

### Payment and Totals

```html
<!-- Payment method -->
<span data-os-receipt="payment_method">Credit Card</span>

<!-- Shipping (always shown) -->
<div data-os-receipt="shipping-container">
  <span>Shipping (<span data-os-receipt="shipping_method">Standard</span>):</span>
  <span data-os-receipt="shipping-price">$5.99</span>
</div>

<!-- Tax (only shown if taxes exist) -->
<div data-os-receipt="tax-container">
  <span>Tax:</span>
  <span data-os-receipt="taxes">$8.50</span>
</div>

<!-- Total -->
<span data-os-receipt="total">$89.99</span>
```

## Advanced Receipt Features

### Conditional Display

```html
<!-- Tax container - automatically hidden if no taxes -->
<div data-os-receipt="tax-container" class="tax-line">
  <span>Tax:</span>
  <span data-os-receipt="taxes">$0.00</span>
</div>

<!-- Product savings - hidden if no discount -->
<div data-os-receipt="line-saving" class="savings-text">
  (25% OFF)
</div>
```

### Custom Receipt Styling

```css
/* Receipt-specific styling */
.receipt-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  font-family: 'Arial', sans-serif;
  background: white;
  box-shadow: 0 0 20px rgba(0,0,0,0.1);
}

.receipt-header {
  text-align: center;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.receipt-section {
  margin: 2rem 0;
  padding: 1.5rem;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  background: #fafbfc;
}

.receipt-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e1e8ed;
}

.receipt-row:last-child {
  border-bottom: none;
}

.receipt-total {
  background: #2ecc71;
  color: white;
  padding: 1rem;
  border-radius: 4px;
  font-weight: bold;
  margin-top: 1rem;
}

.order-line {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  border: 1px solid #e1e8ed;
  border-radius: 4px;
  margin: 0.5rem 0;
  background: white;
}

.line-title {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.line-saving {
  color: #e74c3c;
  font-size: 0.9rem;
  font-weight: bold;
}

.line-compare {
  text-decoration: line-through;
  color: #999;
  margin-right: 0.5rem;
}

.line-subtotal {
  color: #2ecc71;
  font-weight: bold;
  font-size: 1.1rem;
}

/* Print-friendly styles */
@media print {
  .receipt-container {
    box-shadow: none;
    margin: 0;
  }
  
  .receipt-header {
    background: #f8f9fa !important;
    color: #333 !important;
  }
}
```

### Mobile-Optimized Receipt

```html
<div class="mobile-receipt">
  <!-- Responsive receipt design -->
  <div class="mobile-header">
    <h1>Order Confirmed ✅</h1>
    <div class="order-badge">
      Order #<span data-os-receipt="order_number">Loading...</span>
    </div>
  </div>
  
  <div class="mobile-section">
    <h3>📦 Your Items</h3>
    <div data-os-receipt="order-lines" class="mobile-items">
      <div data-os-receipt="product-line" class="mobile-item">
        <div class="item-info">
          <div data-os-receipt="line-title" class="item-name">Product</div>
          <div data-os-receipt="line-saving" class="item-discount">Discount</div>
        </div>
        <div class="item-price">
          <div data-os-receipt="line-compare" class="price-original">$99</div>
          <div data-os-receipt="line-subtotal" class="price-final">$79</div>
        </div>
      </div>
    </div>
  </div>
  
  <div class="mobile-total">
    <div class="total-line">
      <span>Total</span>
      <span data-os-receipt="total" class="total-amount">$79.99</span>
    </div>
  </div>
</div>

<style>
@media (max-width: 768px) {
  .mobile-receipt { padding: 1rem; }
  .mobile-header { text-align: center; margin-bottom: 2rem; }
  .order-badge { background: #2ecc71; color: white; padding: 0.5rem 1rem; border-radius: 20px; display: inline-block; margin-top: 1rem; }
  .mobile-section { margin: 1.5rem 0; }
  .mobile-item { display: flex; justify-content: space-between; padding: 1rem; border-bottom: 1px solid #eee; }
  .item-info { flex: 1; }
  .item-name { font-weight: bold; }
  .item-discount { color: #e74c3c; font-size: 0.9rem; }
  .item-price { text-align: right; }
  .price-original { text-decoration: line-through; color: #999; font-size: 0.9rem; }
  .price-final { font-weight: bold; color: #2ecc71; }
  .mobile-total { background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-top: 1rem; }
  .total-line { display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: bold; }
  .total-amount { color: #2ecc71; }
}
</style>
```

## Receipt Events and Customization

### JavaScript Customization

```javascript
// Wait for receipt data to load
document.addEventListener('DOMContentLoaded', () => {
  // Check if this is a receipt page
  const isReceiptPage = document.querySelector('meta[name="os-page-type"]')?.content === 'receipt';
  
  if (isReceiptPage) {
    // Add custom receipt functionality
    setTimeout(() => {
      customizeReceiptDisplay();
      addReceiptInteractions();
    }, 1000); // Wait for receipt data to load
  }
});

function customizeReceiptDisplay() {
  // Add print button
  const printButton = document.createElement('button');
  printButton.textContent = '🖨️ Print Receipt';
  printButton.onclick = () => window.print();
  printButton.style.cssText = 'padding: 0.75rem 1.5rem; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; margin: 1rem 0;';
  
  document.querySelector('.receipt-container').appendChild(printButton);
  
  // Add email receipt option
  const emailButton = document.createElement('button');
  emailButton.textContent = '📧 Email Receipt';
  emailButton.onclick = sendReceiptEmail;
  emailButton.style.cssText = 'padding: 0.75rem 1.5rem; background: #2ecc71; color: white; border: none; border-radius: 4px; cursor: pointer; margin: 1rem;';
  
  document.querySelector('.receipt-container').appendChild(emailButton);
}

function addReceiptInteractions() {
  // Add click-to-copy for order reference
  const orderRef = document.querySelector('[data-os-receipt="order_reference"]');
  if (orderRef) {
    orderRef.style.cursor = 'pointer';
    orderRef.title = 'Click to copy';
    orderRef.onclick = () => {
      navigator.clipboard.writeText(orderRef.textContent);
      orderRef.style.background = '#2ecc71';
      orderRef.style.color = 'white';
      setTimeout(() => {
        orderRef.style.background = '';
        orderRef.style.color = '';
      }, 1000);
    };
  }
}

function sendReceiptEmail() {
  const orderNumber = document.querySelector('[data-os-receipt="order_number"]')?.textContent;
  const email = prompt('Enter email address to send receipt:');
  
  if (email && orderNumber) {
    // Call your API to send receipt email
    console.log(`Sending receipt for order ${orderNumber} to ${email}`);
    alert('Receipt sent!');
  }
}
```

## API Data Structure

The receipt page receives order data in this format:

```javascript
{
  "number": "107261",
  "ref_id": "aa2c7a2e4d914cb98f1fc85644e0049c",
  "currency": "USD",
  "total_incl_tax": "382.68",
  "total_excl_tax": "354.00",
  "total_tax": "28.68",
  "shipping_excl_tax": "0.00",
  "shipping_method": "Standard Shipping",
  
  "user": {
    "email": "customer@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  
  "lines": [
    {
      "product_title": "Starter Kit",
      "price_excl_tax": "285.00",
      "price_excl_tax_excl_discounts": "285.00",
      "quantity": 1
    }
  ],
  
  "billing_address": {
    "first_name": "John",
    "last_name": "Doe",
    "line1": "123 Main St",
    "line2": "Apt 4B",
    "line4": "New York",
    "state": "NY",
    "postcode": "10001",
    "country": "US"
  },
  
  "shipping_address": {
    "first_name": "John",
    "last_name": "Doe",
    "line1": "123 Main St",
    "line4": "New York",
    "state": "NY",
    "postcode": "10001",
    "country": "US"
  },
  
  "payment_detail": {
    "payment_method": "card_token"
  }
}
```

## Best Practices

1. **Loading States** - Show "Loading..." text initially
2. **Error Handling** - Display helpful messages if order can't be loaded
3. **Print Styling** - Include print-friendly CSS
4. **Mobile Responsive** - Optimize for mobile viewing
5. **Security** - Never display sensitive payment information
6. **Accessibility** - Use proper headings and labels
7. **SEO** - Use descriptive page titles and meta tags

## Troubleshooting

### Receipt Data Not Loading

```javascript
// Check if ref_id is in URL
const urlParams = new URLSearchParams(window.location.search);
const refId = urlParams.get('ref_id');
console.log('Order ref_id:', refId);

// Check for receipt elements
const receiptElements = document.querySelectorAll('[data-os-receipt]');
console.log('Receipt elements found:', receiptElements.length);

// Wait for receipt manager to initialize
setTimeout(() => {
  const orderNumber = document.querySelector('[data-os-receipt="order_number"]')?.textContent;
  console.log('Order number loaded:', orderNumber);
}, 2000);
```

### API Errors

```javascript
// Listen for API errors
document.addEventListener('receipt.error', (e) => {
  console.error('Receipt error:', e.detail);
  // Show user-friendly error message
  document.querySelector('.receipt-container').innerHTML = `
    <div style="text-align: center; padding: 2rem;">
      <h2>Unable to Load Order</h2>
      <p>Please check your order reference and try again.</p>
    </div>
  `;
});
```

## Next Steps

- [Upsells Guide](upsells.md) - Post-purchase offers before receipt
- [Analytics Integration](../configuration/events.md) - Track receipt page views
- [Email Integration](../advanced/email-integration.md) - Send receipt copies via email