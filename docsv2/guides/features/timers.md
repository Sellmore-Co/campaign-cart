# Timers Guide

Complete guide to implementing countdown timers for limited-time offers, flash sales, and time-sensitive content.

## Overview

Campaign Cart's timer system creates countdown timers that update every second and can persist across page loads. Timers are perfect for creating urgency, flash sales, limited-time offers, and deadline-driven promotions.

## Basic Timer Implementation

### Simple Countdown Timer

```html
<!-- Basic timer element -->
<span data-os-element="timer" 
      data-os-duration="3600">
  Loading...
</span>

<!-- Timer with container and formatting -->
<div data-os-element="timer-text" 
     data-os-timer-duration="3600"
     data-os-timer-format="hh:mm:ss">
  Sale ends in: <span data-os-element="timer">Loading...</span>
</div>
```

### Complete Timer Example

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Flash Sale Timer</title>
  
  <meta name="os-api-key" content="YOUR_API_KEY">
  
  <script src="https://rtc2.29next.com/campaign-cart/29next.min.js"></script>
  
  <style>
    .sale-banner { background: linear-gradient(45deg, #ff6b6b, #ff8e8e); color: white; padding: 2rem; text-align: center; border-radius: 8px; margin: 2rem 0; }
    .sale-title { font-size: 2rem; font-weight: bold; margin-bottom: 1rem; }
    .timer-display { font-size: 2.5rem; font-weight: bold; background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; margin: 1rem 0; }
    [data-os-element="timer"] { color: #ffff00; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
    .sale-button { background: #28a745; color: white; padding: 1rem 2rem; border: none; border-radius: 4px; font-size: 1.2rem; cursor: pointer; text-decoration: none; display: inline-block; margin-top: 1rem; }
  </style>
</head>
<body>
  
  <div class="sale-banner">
    <div data-os-element="timer-text" 
         data-os-timer-duration="7200"
         data-os-timer-persistence-id="flash-sale"
         data-os-timer-expiry-text="<div style='color: #ffcccc;'>Sale Ended - Thanks for your interest!</div>"
         data-os-timer-replace-entire-content="true">
      
      <div class="sale-title">⚡ FLASH SALE ⚡</div>
      <div class="sale-offer">50% OFF EVERYTHING!</div>
      
      <div class="timer-display">
        <span data-os-element="timer" data-os-format="hh:mm:ss">Loading...</span>
      </div>
      
      <p>Don't miss out on this limited-time offer!</p>
      <a href="/shop" class="sale-button">Shop Now</a>
      
    </div>
  </div>
  
</body>
</html>
```

## Timer Attributes

### Timer Element

```html
<!-- Basic timer -->
<span data-os-element="timer" 
      data-os-duration="3600"
      data-os-persistence-id="my-timer"
      data-os-format="mm:ss"
      data-os-expiry-text="Expired!">
</span>
```

### Timer Container (Recommended)

```html
<!-- Container with full configuration -->
<div data-os-element="timer-text" 
     data-os-timer-duration="3600"
     data-os-timer-persistence-id="sale-timer"
     data-os-timer-format="hh:mm:ss"
     data-os-timer-expiry-text="Offer Expired!"
     data-os-timer-replace-entire-content="true">
  
  Time remaining: <span data-os-element="timer">Loading...</span>
  
</div>
```

## Timer Configuration Options

| Attribute | Description | Example |
|-----------|-------------|---------|
| `data-os-duration` | Duration in seconds | `3600` (1 hour) |
| `data-os-persistence-id` | Unique ID for persistence | `flash-sale-2024` |
| `data-os-format` | Time display format | `hh:mm:ss`, `mm:ss`, `ss`, `auto` |
| `data-os-expiry-text` | Text/HTML when expired | `Sale Ended!` |
| `data-os-replace-entire-content` | Replace container on expiry | `true` or `false` |

## Time Formats

### Format Options

```html
<!-- Auto format (default) - shows only necessary units -->
<span data-os-element="timer" data-os-format="auto">59:30</span>

<!-- Hours, minutes, seconds -->
<span data-os-element="timer" data-os-format="hh:mm:ss">01:59:30</span>

<!-- Minutes and seconds only -->
<span data-os-element="timer" data-os-format="mm:ss">59:30</span>

<!-- Seconds only -->
<span data-os-element="timer" data-os-format="ss">3570</span>
```

### Format Examples

```javascript
// Duration: 3661 seconds (1 hour, 1 minute, 1 second)

// auto format: "01:01:01" (shows hours when > 0)
// hh:mm:ss format: "01:01:01" 
// mm:ss format: "61:01" (shows total minutes)
// ss format: "3661" (shows total seconds)
```

## Timer Persistence

### Persistent Timers

```html
<!-- Timer persists across page reloads -->
<div data-os-element="timer-text" 
     data-os-timer-duration="86400"
     data-os-timer-persistence-id="daily-deal-nov-2024">
  
  24-hour sale ends in: <span data-os-element="timer"></span>
  
</div>
```

### Session-Only Timers

```html
<!-- Timer resets on each page load -->
<span data-os-element="timer" 
      data-os-duration="600">
  10:00
</span>
```

## Advanced Timer Examples

### Product Page Timer

```html
<div class="product-urgency">
  <div data-os-element="timer-text" 
       data-os-timer-duration="1800"
       data-os-timer-persistence-id="product-offer-123"
       data-os-timer-expiry-text="<span style='color: #999;'>Offer expired</span>">
    
    🔥 <strong>Limited Time:</strong> 
    Get 25% off in the next 
    <span data-os-element="timer" 
          data-os-format="mm:ss" 
          style="color: #e74c3c; font-weight: bold;">
      30:00
    </span>
    
  </div>
</div>
```

### Cart Abandonment Timer

```html
<div class="cart-urgency">
  <div data-os-element="timer-text" 
       data-os-timer-duration="900"
       data-os-timer-persistence-id="cart-hold"
       data-os-timer-expiry-text="Your cart has been released. Items may no longer be available."
       data-os-timer-replace-entire-content="true">
    
    <div class="urgency-message">
      ⏰ Your cart is being held for 
      <span data-os-element="timer" 
            data-os-format="mm:ss" 
            style="background: #ffeb3b; padding: 2px 6px; border-radius: 3px;">
        15:00
      </span>
    </div>
    
  </div>
</div>
```

### Multi-Timer Layout

```html
<div class="sale-countdown">
  <h2>Mega Sale Countdown</h2>
  
  <div class="countdown-grid">
    
    <!-- Days -->
    <div class="countdown-unit">
      <div data-os-element="timer-text" 
           data-os-timer-duration="259200"
           data-os-timer-format="auto">
        <div class="countdown-number" data-os-element="timer">72:00:00</div>
        <div class="countdown-label">Hours</div>
      </div>
    </div>
    
    <!-- Flash deals timer -->
    <div class="flash-deal">
      <div data-os-element="timer-text" 
           data-os-timer-duration="3600"
           data-os-timer-persistence-id="hourly-flash"
           data-os-timer-expiry-text="Next flash deal in 1 hour!"
           data-os-timer-replace-entire-content="true">
        
        <h3>⚡ Current Flash Deal</h3>
        <p>Ends in: <span data-os-element="timer" data-os-format="mm:ss">60:00</span></p>
        
      </div>
    </div>
    
  </div>
</div>

<style>
.countdown-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 2rem 0; }
.countdown-unit { text-align: center; background: #f8f9fa; padding: 2rem; border-radius: 8px; }
.countdown-number { font-size: 3rem; font-weight: bold; color: #e74c3c; }
.countdown-label { font-size: 1.2rem; color: #666; margin-top: 0.5rem; }
.flash-deal { background: linear-gradient(45deg, #ff6b6b, #ff8e8e); color: white; padding: 2rem; border-radius: 8px; }
</style>
```

## Timer Events and JavaScript

### Listening to Timer Events

```javascript
// Timer updated every second
document.addEventListener('os:timer.updated', (e) => {
  const { timerElement, remaining, formattedTime, config } = e.detail;
  
  console.log('Timer updated:', formattedTime);
  console.log('Remaining:', remaining); // { hours, minutes, seconds }
  
  // Add urgency styling when time is low
  if (remaining.hours === 0 && remaining.minutes < 5) {
    timerElement.classList.add('urgent');
  }
  
  // Flash timer when very low
  if (remaining.hours === 0 && remaining.minutes < 1) {
    timerElement.classList.add('flash');
  }
});

// Timer expired
document.addEventListener('os:timer.expired', (e) => {
  const { timerElement, config } = e.detail;
  
  console.log('Timer expired!', config.persistenceId);
  
  // Trigger custom actions
  if (config.persistenceId === 'flash-sale') {
    // Hide sale banner
    document.querySelector('.sale-banner').style.display = 'none';
    
    // Show "missed it" message
    showMissedSaleModal();
  }
});
```

### Dynamic Timer Creation

```javascript
// Create timer programmatically
function createTimer(containerId, duration, message) {
  const container = document.getElementById(containerId);
  
  container.innerHTML = `
    <div data-os-element="timer-text" 
         data-os-timer-duration="${duration}"
         data-os-timer-persistence-id="dynamic-${Date.now()}"
         data-os-timer-format="mm:ss">
      ${message} <span data-os-element="timer">Loading...</span>
    </div>
  `;
  
  // Refresh timers to initialize the new one
  if (window.twentyNineNext && window.twentyNineNext.timer) {
    window.twentyNineNext.timer.refreshTimers();
  }
}

// Usage
createTimer('promo-container', 1800, 'Special offer ends in:');
```

## Styling Timers

### Basic Timer Styles

```css
/* Timer element styling */
[data-os-element="timer"] {
  font-family: 'Courier New', monospace;
  font-weight: bold;
  font-size: 1.2em;
  color: #e74c3c;
  background: rgba(231, 76, 60, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #e74c3c;
}

/* Container styling */
[data-os-element="timer-text"] {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}

/* Urgency states */
[data-os-element="timer"].urgent {
  color: #ff0000;
  background: rgba(255, 0, 0, 0.1);
  border-color: #ff0000;
}

[data-os-element="timer"].flash {
  animation: flash 1s infinite;
}

@keyframes flash {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
```

### Advanced Timer Designs

```html
<div class="premium-timer">
  <div data-os-element="timer-text" 
       data-os-timer-duration="7200"
       data-os-timer-persistence-id="premium-sale">
    
    <div class="timer-header">
      <h3>🎯 Premium Deal</h3>
      <p>Limited time offer</p>
    </div>
    
    <div class="timer-countdown">
      <span data-os-element="timer" data-os-format="hh:mm:ss">02:00:00</span>
    </div>
    
    <div class="timer-footer">
      <p>Don't miss out!</p>
    </div>
    
  </div>
</div>

<style>
.premium-timer {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  padding: 0;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0,0,0,0.3);
}

.timer-header {
  background: rgba(0,0,0,0.2);
  padding: 1rem;
  text-align: center;
}

.timer-header h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.timer-header p {
  margin: 0;
  opacity: 0.9;
}

.timer-countdown {
  padding: 2rem;
  text-align: center;
  background: rgba(255,255,255,0.1);
}

.timer-countdown [data-os-element="timer"] {
  font-size: 3rem;
  font-weight: bold;
  color: #ffeb3b;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  background: none;
  border: none;
  padding: 0;
}

.timer-footer {
  background: rgba(0,0,0,0.2);
  padding: 1rem;
  text-align: center;
}

.timer-footer p {
  margin: 0;
  font-weight: bold;
}
</style>
```

## Timer Management

### Refreshing Timers

```javascript
// Refresh all timers (useful after adding dynamic content)
window.twentyNineNext.onReady(() => {
  window.twentyNineNext.timer.refreshTimers();
});

// Get all active timers
const activeTimers = window.twentyNineNext.timer.getTimers();
console.log('Active timers:', activeTimers.size);
```

### Timer Storage

```javascript
// Timers use localStorage with this format:
// Key: 'os-timer-{persistence-id}'
// Value: timestamp when timer started

// Example: Check timer status
const timerId = 'flash-sale';
const startTime = localStorage.getItem(`os-timer-${timerId}`);
if (startTime) {
  const elapsed = (Date.now() - parseInt(startTime)) / 1000;
  console.log(`Timer has been running for ${elapsed} seconds`);
}
```

## Common Timer Patterns

### Product Page Urgency

```html
<div class="product-urgency">
  <div data-os-element="timer-text" 
       data-os-timer-duration="3600"
       data-os-timer-persistence-id="product-urgency"
       data-os-timer-expiry-text="Special offer expired">
    
    🔥 <strong>Limited Time:</strong> 
    Save 30% for the next 
    <span data-os-element="timer" data-os-format="mm:ss">60:00</span>!
    
  </div>
</div>
```

### Checkout Page Timer

```html
<div class="checkout-timer">
  <div data-os-element="timer-text" 
       data-os-timer-duration="600"
       data-os-timer-persistence-id="checkout-timer"
       data-os-timer-expiry-text="Session expired. Please refresh to continue."
       data-os-timer-replace-entire-content="true">
    
    ⏰ Complete your order in 
    <span data-os-element="timer" data-os-format="mm:ss">10:00</span>
    
  </div>
</div>
```

### Homepage Banner

```html
<div class="homepage-banner">
  <div data-os-element="timer-text" 
       data-os-timer-duration="86400"
       data-os-timer-persistence-id="daily-deal"
       data-os-timer-format="hh:mm:ss">
    
    <h2>Today Only: 40% Off Everything!</h2>
    <p>Sale ends in: <span data-os-element="timer">24:00:00</span></p>
    
  </div>
</div>
```

## Best Practices

1. **Use persistence IDs** - For timers that should continue across page loads
2. **Clear expiry messages** - Provide helpful information when timers expire
3. **Appropriate durations** - Match timer length to offer urgency
4. **Visual hierarchy** - Make timers prominent but not overwhelming
5. **Mobile optimization** - Ensure timers are readable on small screens
6. **Loading states** - Show "Loading..." while timer initializes
7. **Accessibility** - Include screen reader friendly text

## Troubleshooting

### Timer Not Starting

```javascript
// Check if timer element exists
const timerElements = document.querySelectorAll('[data-os-element="timer"]');
console.log('Timer elements found:', timerElements.length);

// Check timer configuration
timerElements.forEach(element => {
  console.log('Duration:', element.dataset.osDuration);
  console.log('Persistence ID:', element.dataset.osPersistenceId);
});
```

### Timer Not Persisting

```javascript
// Check localStorage
const persistenceId = 'your-timer-id';
const storageKey = `os-timer-${persistenceId}`;
const storedTime = localStorage.getItem(storageKey);
console.log('Stored timer start time:', storedTime);

// Clear timer storage (for testing)
localStorage.removeItem(storageKey);
```

### Timer Events Not Firing

```javascript
// Test event listeners
document.addEventListener('os:timer.updated', (e) => {
  console.log('Timer updated event:', e.detail);
});

document.addEventListener('os:timer.expired', (e) => {
  console.log('Timer expired event:', e.detail);
});
```

## Next Steps

- [Upsells Guide](upsells.md) - Time-limited post-purchase offers
- [Shopping Cart Guide](shopping-cart.md) - Cart abandonment timers
- [Events Reference](../../api/events-reference.md) - All timer events