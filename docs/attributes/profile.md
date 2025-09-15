# Profile Attributes

Complete reference for profile-related HTML attributes and display properties.

## Profile Display Properties

Display current profile information and state.

### Basic Profile Properties
```html
<!-- Display active profile ID -->
<span data-next-display="profile.id">exit_10</span>
<span data-next-display="profile.active">exit_10</span>

<!-- Display profile name -->
<span data-next-display="profile.name">Exit 10% Discount</span>

<!-- Check if any profile is active -->
<span data-next-display="profile.isActive">true</span>
```

## Profile Conditional Display

Show or hide elements based on active profile.

### Simple Profile Conditionals
```html
<!-- Show only when specific profile is active -->
<div data-next-show-if-profile="black_friday">
  Black Friday prices are active! Save up to 50%!
</div>

<!-- Hide when specific profile is active -->
<div data-next-hide-if-profile="regular">
  Special promotional content
</div>

<!-- Multiple profile examples -->
<div data-next-show-if-profile="vip">
  Welcome VIP member! Enjoy exclusive pricing.
</div>

<div data-next-show-if-profile="exit_10">
  Don't leave! Here's your 10% discount.
</div>
```

### Complex Profile Conditionals
```html
<!-- Check if specific profile is active -->
<div data-next-show="profile.active === 'black_friday'">
  Black Friday Sale Active
</div>

<!-- Check if any profile is active -->
<div data-next-show="profile.isActive">
  A special profile is currently active
</div>

<!-- Using profile functions -->
<div data-next-show="profile.is('vip')">
  VIP pricing applied
</div>

<!-- Check if profile exists (not necessarily active) -->
<div data-next-show="profile.has('seasonal_sale')">
  Seasonal sale profile available
</div>
```

## Profile Switcher Attributes

Create interactive profile switching elements.

### Profile Switch Button
```html
<!-- Basic profile switcher -->
<button data-next-profile="black_friday">
  Activate Black Friday Prices
</button>

<!-- With options -->
<button data-next-profile="vip"
        data-next-clear-cart="false"
        data-next-preserve-quantities="true"
        data-next-active-text="VIP Active ✓"
        data-next-inactive-text="Activate VIP">
  Activate VIP
</button>

<!-- Multiple profile buttons -->
<div class="profile-switcher-group">
  <button data-next-profile="regular">Regular Prices</button>
  <button data-next-profile="black_friday">Black Friday</button>
  <button data-next-profile="vip">VIP Member</button>
</div>
```

### Profile Selector Dropdown
```html
<!-- Auto-populated dropdown -->
<select data-next-profile-selector
        data-next-auto-populate="true"
        data-next-clear-cart="false">
</select>

<!-- Manual dropdown with options -->
<select data-next-profile-selector>
  <option value="">Select Profile</option>
  <option value="regular">Regular Prices</option>
  <option value="black_friday">Black Friday Sale</option>
  <option value="vip">VIP Member</option>
</select>
```

## Profile Switcher Options

### data-next-clear-cart
Clears the cart before applying the new profile.
- **Values**: `true` | `false`
- **Default**: `false`

```html
<button data-next-profile="sale" 
        data-next-clear-cart="true">
  Switch to Sale Prices (Cart will be cleared)
</button>
```

### data-next-preserve-quantities
Maintains item quantities when swapping packages.
- **Values**: `true` | `false`
- **Default**: `true`

```html
<button data-next-profile="bulk" 
        data-next-preserve-quantities="false">
  Switch to Bulk Pricing
</button>
```

### data-next-active-text / data-next-inactive-text
Dynamic button text based on profile state.

```html
<button data-next-profile="member"
        data-next-active-text="Member Pricing Active ✓"
        data-next-inactive-text="Activate Member Pricing">
  Activate Member Pricing
</button>
```

## CSS Classes

Automatically applied classes for styling profile elements.

### Profile State Classes
- `.next-profile-active` - Applied when the profile is active
- `.next-profile-switcher` - Applied to profile switcher buttons
- `.next-profile-selector` - Applied to profile selector dropdowns
- `.next-profile-loading` - Applied during profile switching

### Conditional Display Classes
- `.next-condition-met` - Applied when profile condition is true
- `.next-condition-not-met` - Applied when profile condition is false
- `.next-visible` - Applied when element should be shown
- `.next-hidden` - Applied when element should be hidden

## Real-World Examples

### Exit Intent Profile
```html
<!-- Exit intent popup with special profile -->
<div class="exit-popup" data-next-show-if-profile="exit_10">
  <h2>Wait! Don't Leave Yet!</h2>
  <p>We've activated a special 10% discount just for you!</p>
  <span data-next-display="profile.name"></span>
  <button data-next-action="checkout">Claim Your Discount</button>
</div>
```

### VIP Member Dashboard
```html
<!-- VIP member exclusive content -->
<div class="vip-dashboard" data-next-show-if-profile="vip">
  <h1>Welcome VIP Member!</h1>
  <div class="benefits">
    <p>Your Benefits:</p>
    <ul>
      <li>Exclusive VIP pricing</li>
      <li>Free shipping on all orders</li>
      <li>Priority customer support</li>
    </ul>
  </div>
  <button data-next-profile="regular"
          data-next-active-text="Switch to Regular Pricing"
          data-next-inactive-text="VIP Pricing Active">
    VIP Pricing Active
  </button>
</div>
```

### Dynamic Pricing Display
```html
<!-- Show different content based on active profile -->
<div class="pricing-display">
  <!-- Regular pricing -->
  <div data-next-hide-if-profile="black_friday">
    <h3>Regular Price</h3>
    <span data-next-display="package.price">$99.99</span>
  </div>
  
  <!-- Black Friday pricing -->
  <div data-next-show-if-profile="black_friday">
    <h3>BLACK FRIDAY DEAL!</h3>
    <span class="strike" data-next-display="package.price_retail">$99.99</span>
    <span class="sale-price" data-next-display="package.price">$49.99</span>
    <span class="savings">Save 50%!</span>
  </div>
</div>
```

### Profile-Based Navigation
```html
<!-- Show different navigation based on profile -->
<nav class="main-nav">
  <!-- Always visible -->
  <a href="/shop">Shop</a>
  <a href="/about">About</a>
  
  <!-- VIP only -->
  <a href="/vip-lounge" data-next-show-if-profile="vip">VIP Lounge</a>
  
  <!-- Show during sales -->
  <a href="/deals" data-next-show-if-profile="black_friday">Black Friday Deals</a>
  
  <!-- Profile switcher in nav -->
  <select data-next-profile-selector 
          data-next-auto-populate="true"
          class="profile-dropdown">
  </select>
</nav>
```

## JavaScript Events

Listen for profile-related events:

```javascript
// Profile applied
window.next.on('profile:applied', (data) => {
  console.log(`Profile ${data.profileId} applied`);
  console.log(`${data.itemsSwapped} items updated`);
});

// Profile reverted
window.next.on('profile:reverted', (data) => {
  console.log(`Reverted from ${data.previousProfileId}`);
});

// Profile switched
window.next.on('profile:switched', (data) => {
  console.log(`Switched from ${data.fromProfileId} to ${data.toProfileId}`);
});
```

## Notes

1. **Profile Priority**: Only one profile can be active at a time
2. **Package Mapping**: Profiles map package IDs to different packages (e.g., regular → sale version)
3. **Cart Persistence**: By default, cart items are swapped to mapped packages when profiles change
4. **URL Parameters**: Profiles can be activated via URL: `?profile=black_friday` or `?forceProfile=vip`
5. **Session Storage**: Active profile persists across page refreshes in the same session