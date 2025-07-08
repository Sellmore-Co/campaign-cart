# TimerManager

The TimerManager creates countdown timers that can be used for limited-time offers, flash sales, or other time-sensitive content. Timers can be configured to persist across page loads and can trigger actions when they expire.

## Basic Usage

Add a timer to your HTML with the required attributes:

```html
<!-- Simple timer with direct configuration -->
<span data-os-element="timer" 
      data-os-duration="3600" 
      data-os-persistence-id="offer-timer"></span>

<!-- Timer with parent container for more options -->
<div data-os-element="timer-text" 
     data-os-timer-duration="3600"
     data-os-timer-persistence-id="flash-sale"
     data-os-timer-expiry-text="Offer Expired!"
     data-os-timer-format="mm:ss">
  Time remaining: <span data-os-element="timer"></span>
</div>
```

## How It Works

1. The TimerManager automatically:
   - Initializes countdown timers found on the page
   - Updates them every second
   - Handles expiry text when the timer reaches zero
   - Can persist timer values across page loads

2. Each timer requires:
   - `data-os-element="timer"` - Identifies this as a timer element
   - The duration (in seconds) can be specified using:
     - `data-os-duration="3600"` directly on the timer element, or
     - `data-os-timer-duration="3600"` on a parent element with `data-os-element="timer-text"`

## Configuration Options

The timer can be configured with these attributes:

| Attribute | Parent Attribute | Description |
|-----------|------------------|-------------|
| `data-os-duration` | `data-os-timer-duration` | Duration in seconds |
| `data-os-persistence-id` | `data-os-timer-persistence-id` | ID to persist timer across page loads |
| `data-os-expiry-text` | `data-os-timer-expiry-text` | Text to display when timer expires |
| `data-os-format` | `data-os-timer-format` | Format: 'auto', 'hh:mm:ss', 'mm:ss', or 'ss' |
| `data-os-replace-entire-content` | `data-os-timer-replace-entire-content` | Whether to replace parent content on expiry |

## Time Formats

The TimerManager supports several time formats:

- `hh:mm:ss` - Hours, minutes, and seconds (e.g., "01:30:45")
- `mm:ss` - Minutes and seconds only (e.g., "30:45")
- `ss` - Seconds only (e.g., "45")
- `auto` - Automatically selects the appropriate format based on the remaining time

## Timer Persistence

Timers can persist across page loads by providing a persistence ID:

```html
<span data-os-element="timer" 
      data-os-duration="86400" 
      data-os-persistence-id="daily-sale"></span>
```

When a user leaves and returns to the page, the timer will continue from where it left off, using the browser's localStorage.

## Expiry Actions

You can specify custom text or HTML to display when a timer expires:

```html
<div data-os-element="timer-text" 
     data-os-timer-duration="3600"
     data-os-timer-persistence-id="limited-offer"
     data-os-timer-expiry-text="<strong>Offer Expired!</strong> <a href='/offers'>View other offers</a>"
     data-os-timer-replace-entire-content="true">
  <div class="offer-timer">
    <div class="offer-timer-label">Limited time offer!</div>
    <div class="offer-timer-countdown">
      Expires in <span data-os-element="timer"></span>
    </div>
  </div>
</div>
```

## Events

The TimerManager emits the following events:

- `timer.updated` - Triggered every second as the timer updates
  - Event data: `{ timerElement, parentElement, config, remaining, formattedTime }`
  
- `timer.expired` - Triggered when a timer reaches zero
  - Event data: `{ timerElement, parentElement, config }`

## Example Usage with Events

```javascript
window.on29NextReady.push(function(client) {
  // React to timer expiry
  client.on('timer.expired', function(data) {
    console.log('Timer expired!', data);
    
    // Show a modal when the flash sale timer expires
    if (data.config.persistenceId === 'flash-sale') {
      showModal('Sorry, this offer has expired!');
    }
  });
  
  // React to timer updates
  client.on('timer.updated', function(data) {
    // Flash the timer when less than 5 minutes remain
    if (data.remaining.hours === 0 && data.remaining.minutes < 5) {
      data.timerElement.classList.toggle('flash');
    }
    
    // Add urgency message when less than 1 hour remains
    if (data.remaining.hours < 1 && !document.querySelector('.urgency-message')) {
      const urgencyMsg = document.createElement('div');
      urgencyMsg.className = 'urgency-message';
      urgencyMsg.textContent = 'Hurry, offer ending soon!';
      data.parentElement.appendChild(urgencyMsg);
    }
  });
});
```

## Styling Timers

You can style your timers with CSS:

```css
[data-os-element="timer"] {
  font-weight: bold;
  color: #cc0000;
}

/* Add a flashing effect for urgent timers */
[data-os-element="timer"].flash {
  animation: flash 1s infinite;
}

@keyframes flash {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

## Refreshing Timers

If you dynamically add timers to the page after it loads, you can refresh them:

```javascript
window.twentyNineNext.timer.refreshTimers();
```

## Example: Flash Sale Banner

Here's an example of creating a flash sale banner with a timer:

```html
<div class="flash-sale-banner">
  <div data-os-element="timer-text" 
       data-os-timer-duration="7200"
       data-os-timer-persistence-id="flash-sale-homepage"
       data-os-timer-expiry-text="<div class='sale-ended'>Sale Ended</div>"
       data-os-timer-replace-entire-content="true">
    <div class="sale-content">
      <div class="sale-title">FLASH SALE</div>
      <div class="sale-offer">25% OFF EVERYTHING</div>
      <div class="sale-timer">
        Ends in: 
        <div class="timer-display">
          <span data-os-element="timer" data-os-format="hh:mm:ss"></span>
        </div>
      </div>
      <a href="/sale" class="sale-button">Shop Now</a>
    </div>
  </div>
</div>
``` 