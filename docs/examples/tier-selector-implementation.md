# Tier Selector Implementation with Profiles

This guide shows how to implement a pricing tier selector (Buy 1, Buy 2, Buy 3) using profiles combined with the variant system.

## How It Works

1. **Profiles** handle switching between pricing tiers (Buy 1 → Buy 2 → Buy 3)
2. **Variants** handle product options (Color, Size)
3. **Combined** they create a seamless tier + variant selection experience

## Step 1: Configure Profiles for Each Tier

```javascript
window.nextConfig = {
  profiles: {
    "buy_1": {
      name: "Buy 1 - Regular Price",
      description: "Single item purchase",
      packageMappings: {
        // Map default package IDs to Buy 1 tier packages
        // Using a placeholder mapping approach
      }
    },
    "buy_2": {
      name: "Buy 2 - Save 10%",
      description: "Buy 2 and save",
      packageMappings: {
        // Chateau Ivory / Single
        19: 26,  // Buy 1 (ref_id: 19) → Buy 2 (ref_id: 26)
        // Obsidian Grey / Single  
        17: 25,  // Buy 1 (ref_id: 17) → Buy 2 (ref_id: 25)
        // Add all other variant mappings...
      }
    },
    "buy_3": {
      name: "Buy 3 - Save 20%",
      description: "Best value - Buy 3",
      packageMappings: {
        // Map to Buy 3 tier packages
        // (if they exist in your campaign)
      }
    }
  },
  defaultProfile: "buy_1" // Start with Buy 1 tier
};
```

## Step 2: Create Dynamic Profile Mappings

Since you have many variants, generate the mappings dynamically:

```javascript
// Helper function to build profile mappings dynamically
async function buildTierProfiles() {
  const campaign = window.next.getCampaignData();
  if (!campaign) return;

  const profiles = {
    buy_1: { name: "Buy 1", packageMappings: {} },
    buy_2: { name: "Buy 2", packageMappings: {} },
    buy_3: { name: "Buy 3", packageMappings: {} }
  };

  // Group packages by variant and tier
  const variantGroups = {};
  
  campaign.packages.forEach(pkg => {
    // Create variant key from attributes
    const variantKey = window.next.createVariantKey(
      pkg.product_variant_attribute_values?.reduce((acc, attr) => {
        acc[attr.code] = attr.value;
        return acc;
      }, {}) || {}
    );
    
    // Extract tier from package name
    const tierMatch = pkg.name.match(/Buy (\d+)/i);
    const tier = tierMatch ? `buy_${tierMatch[1]}` : 'buy_1';
    
    // Store package by variant and tier
    if (!variantGroups[variantKey]) {
      variantGroups[variantKey] = {};
    }
    variantGroups[variantKey][tier] = pkg.ref_id;
  });

  // Build mappings for each profile
  Object.values(variantGroups).forEach(variant => {
    if (variant.buy_1 && variant.buy_2) {
      profiles.buy_2.packageMappings[variant.buy_1] = variant.buy_2;
    }
    if (variant.buy_1 && variant.buy_3) {
      profiles.buy_3.packageMappings[variant.buy_1] = variant.buy_3;
    }
  });

  // Register the profiles
  Object.entries(profiles).forEach(([id, profile]) => {
    window.next.registerProfile({
      id,
      ...profile
    });
  });
}

// Initialize on SDK ready
window.nextReady.push(buildTierProfiles);
```

## Step 3: HTML Implementation

### Tier Selector UI

```html
<!-- Tier Selector Buttons -->
<div class="tier-selector">
  <h3>Select Quantity Tier:</h3>
  
  <button data-next-profile="buy_1"
          data-next-active-text="✓ Buy 1 Selected"
          data-next-inactive-text="Buy 1 - Regular Price"
          class="tier-button">
    Buy 1 - Regular Price
  </button>
  
  <button data-next-profile="buy_2"
          data-next-active-text="✓ Buy 2 Selected"
          data-next-inactive-text="Buy 2 - Save 10%"
          class="tier-button">
    Buy 2 - Save 10%
  </button>
  
  <button data-next-profile="buy_3"
          data-next-active-text="✓ Buy 3 Selected"
          data-next-inactive-text="Buy 3 - Save 20%"
          class="tier-button">
    Buy 3 - Save 20%
  </button>
</div>

<!-- Or as a dropdown -->
<select data-next-profile-selector class="tier-dropdown">
  <option value="">Select Quantity</option>
  <option value="buy_1">Buy 1 - Regular Price</option>
  <option value="buy_2">Buy 2 - Save 10%</option>
  <option value="buy_3">Buy 3 - Save 20%</option>
</select>
```

### Variant Selector with Tier-Aware Pricing

```html
<div class="product-selector">
  <!-- Variant selectors -->
  <div class="variant-options">
    <label>Color:</label>
    <select id="color-select">
      <option value="">Select Color</option>
      <option value="Obsidian Grey">Obsidian Grey</option>
      <option value="Chateau Ivory">Chateau Ivory</option>
      <option value="Scribe Blue">Scribe Blue</option>
    </select>
    
    <label>Size:</label>
    <select id="size-select">
      <option value="">Select Size</option>
      <option value="Single">Single</option>
      <option value="Twin">Twin</option>
      <option value="Double">Double</option>
      <option value="Queen">Queen</option>
      <option value="King">King</option>
    </select>
  </div>
  
  <!-- Dynamic price display based on tier -->
  <div class="price-display">
    <!-- Buy 1 pricing -->
    <div data-next-show-if-profile="buy_1">
      <span class="price-label">Price:</span>
      <span id="buy-1-price">$0.00</span>
    </div>
    
    <!-- Buy 2 pricing -->
    <div data-next-show-if-profile="buy_2">
      <span class="price-label">Price (Buy 2):</span>
      <span id="buy-2-price">$0.00</span>
      <span class="savings">Save 10%!</span>
    </div>
    
    <!-- Buy 3 pricing -->
    <div data-next-show-if-profile="buy_3">
      <span class="price-label">Price (Buy 3):</span>
      <span id="buy-3-price">$0.00</span>
      <span class="savings">Save 20%!</span>
    </div>
  </div>
  
  <button id="add-to-cart">Add to Cart</button>
</div>
```

## Step 4: JavaScript Implementation

```javascript
class TierVariantSelector {
  constructor() {
    this.productId = 3; // Grounded Sheets
    this.selectedVariant = {};
    this.init();
  }

  async init() {
    // Wait for SDK
    await new Promise(resolve => window.nextReady.push(resolve));
    
    // Build tier profiles
    await this.buildTierProfiles();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Initialize display
    this.updateDisplay();
  }

  setupEventListeners() {
    // Variant selectors
    document.getElementById('color-select').addEventListener('change', (e) => {
      this.selectedVariant.color = e.target.value;
      this.updateDisplay();
    });
    
    document.getElementById('size-select').addEventListener('change', (e) => {
      this.selectedVariant.size = e.target.value;
      this.updateDisplay();
    });
    
    // Add to cart button
    document.getElementById('add-to-cart').addEventListener('click', () => {
      this.addToCart();
    });
    
    // Listen for profile changes
    window.next.on('profile:applied', () => {
      this.updateDisplay();
    });
  }

  updateDisplay() {
    // Check if variant is fully selected
    if (!this.selectedVariant.color || !this.selectedVariant.size) {
      document.getElementById('add-to-cart').disabled = true;
      return;
    }
    
    // Get current profile (tier)
    const currentProfile = window.next.getActiveProfile() || 'buy_1';
    
    // Get package for selected variant
    const pkg = window.next.getPackageByVariantSelection(
      this.productId, 
      this.selectedVariant
    );
    
    if (pkg) {
      // The profile system will have already mapped to the correct tier package
      // So pkg will be the correct package for the active tier
      this.updatePriceDisplay(currentProfile, pkg.price);
      document.getElementById('add-to-cart').disabled = false;
    }
  }

  updatePriceDisplay(tier, price) {
    const priceElement = document.getElementById(`${tier.replace('_', '-')}-price`);
    if (priceElement) {
      priceElement.textContent = `$${price}`;
    }
  }

  async addToCart() {
    const pkg = window.next.getPackageByVariantSelection(
      this.productId,
      this.selectedVariant
    );
    
    if (pkg) {
      await window.next.addItem({
        packageId: pkg.ref_id,
        quantity: 1
      });
      
      // Show success message
      this.showNotification('Added to cart!');
    }
  }

  showNotification(message) {
    // Implementation for showing notifications
    console.log(message);
  }

  async buildTierProfiles() {
    // Use the implementation from Step 2
    // This builds profiles dynamically based on campaign data
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  new TierVariantSelector();
});
```

## Step 5: Advanced Implementation with Tier Comparison

```html
<!-- Tier comparison table -->
<div class="tier-comparison">
  <table>
    <thead>
      <tr>
        <th>Quantity</th>
        <th>Price Each</th>
        <th>Total</th>
        <th>Savings</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr data-tier="buy_1">
        <td>Buy 1</td>
        <td class="price-each">$0.00</td>
        <td class="price-total">$0.00</td>
        <td>-</td>
        <td>
          <button data-next-profile="buy_1">Select</button>
        </td>
      </tr>
      <tr data-tier="buy_2" class="recommended">
        <td>Buy 2</td>
        <td class="price-each">$0.00</td>
        <td class="price-total">$0.00</td>
        <td class="savings">Save 10%</td>
        <td>
          <button data-next-profile="buy_2">Select</button>
        </td>
      </tr>
      <tr data-tier="buy_3" class="best-value">
        <td>Buy 3</td>
        <td class="price-each">$0.00</td>
        <td class="price-total">$0.00</td>
        <td class="savings">Save 20%</td>
        <td>
          <button data-next-profile="buy_3">Select</button>
        </td>
      </tr>
    </tbody>
  </table>
</div>

<script>
// Update tier comparison table
function updateTierComparison(variantKey) {
  const productId = 3;
  const tiers = ['buy_1', 'buy_2', 'buy_3'];
  
  tiers.forEach(tier => {
    const pricingTiers = window.next.getVariantPricingTiers(productId, variantKey);
    const tierData = pricingTiers.find(t => 
      t.tierType.toLowerCase().replace(' ', '_') === tier
    );
    
    if (tierData) {
      const row = document.querySelector(`tr[data-tier="${tier}"]`);
      row.querySelector('.price-each').textContent = `$${tierData.price}`;
      
      const quantity = parseInt(tier.split('_')[1]);
      const total = parseFloat(tierData.price) * quantity;
      row.querySelector('.price-total').textContent = `$${total.toFixed(2)}`;
    }
  });
}
</script>
```

## Key Benefits

1. **Clean Separation**: Profiles handle tier switching, variants handle product options
2. **Automatic Mapping**: When user switches tiers, all cart items automatically update to new tier packages
3. **Session Persistence**: Selected tier persists across page refreshes
4. **URL Parameters**: Share tier-specific links: `?profile=buy_2`
5. **Easy Testing**: Switch between tiers without complex logic
6. **Cart Intelligence**: Items stay in cart when switching tiers

## Best Practices

1. **Default Tier**: Always set a default profile (usually "buy_1")
2. **Clear Naming**: Use consistent tier naming (buy_1, buy_2, etc.)
3. **Visual Feedback**: Show active tier clearly
4. **Price Comparison**: Display savings to encourage bulk purchases
5. **Mobile Friendly**: Ensure tier selector works on mobile

## URL-Based Tier Selection

Users can link directly to specific tiers:

```
https://yoursite.com/product?profile=buy_2
https://yoursite.com/product?forceProfile=buy_3  // Clears cart first
```

## CSS Styling

```css
.tier-selector {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.tier-button {
  flex: 1;
  padding: 1rem;
  border: 2px solid #ddd;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
}

.tier-button:hover {
  border-color: #007bff;
}

.tier-button.next-profile-active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.tier-comparison .recommended {
  background: #f0f8ff;
}

.tier-comparison .best-value {
  background: #f0fff0;
  font-weight: bold;
}
```

This approach leverages the profile system perfectly for tier-based pricing while maintaining clean, maintainable code.