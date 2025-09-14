# Refactoring Suggestions: From Custom Implementation to Reusable SDK Solution

## Current State Analysis

### What You Have Now
1. **Profile System**: Working well for exit intent (10% discount across all tiers)
2. **Manual Variant Mapping**: Hard-coded variant IDs (1-145) with manual mappings
3. **Tier Controller**: Custom 2000+ line JavaScript managing tier selection and variants
4. **Static Configuration**: Everything is hard-coded for Grounded Sheets product

### Main Issues
1. **Not Reusable**: Completely tied to Grounded Sheets specific IDs
2. **Maintenance Nightmare**: 145 hard-coded package IDs with manual mappings
3. **No Dynamic Discovery**: Can't adapt to new products or campaigns
4. **Duplicated Logic**: SDK already has these capabilities but they're reimplemented

## Proposed Solution: Dynamic Tier & Variant System

### 1. **Replace Hard-Coded IDs with Dynamic Discovery**

Instead of:
```javascript
// Current approach - brittle and product-specific
const groundedSheetsVariants = [
  { id: 1, size: 'Twin', color: 'Obsidian Grey', quantity: 1 },
  { id: 2, size: 'Twin', color: 'Chateau Ivory', quantity: 1 },
  // ... 145 more hard-coded entries
];
```

Use SDK's dynamic discovery:
```javascript
// Proposed approach - works for any product
class UniversalTierController {
  async initialize() {
    // Dynamically discover all variants from campaign
    const campaign = window.next.getCampaignData();
    const productGroups = this.groupProductsByTier(campaign.packages);
    
    // Auto-generate tier profiles
    this.generateTierProfiles(productGroups);
    
    // Build UI dynamically
    this.buildVariantSelectors(productGroups);
  }
  
  groupProductsByTier(packages) {
    // Group by "Buy 1", "Buy 2", "Buy 3" automatically
    return packages.reduce((groups, pkg) => {
      const tier = this.extractTier(pkg.name); // "Buy 1", "Buy 2", etc.
      const variant = this.extractVariant(pkg);
      
      if (!groups[tier]) groups[tier] = [];
      groups[tier].push({ ...pkg, variant });
      
      return groups;
    }, {});
  }
}
```

### 2. **Leverage SDK's Profile System for Tiers**

Instead of manually managing tier switching:

```javascript
// Current approach - manual tier management
selectTier(tierNumber) {
  this.currentTier = tierNumber;
  this.clearAllCartItems();
  this.reprocessAllSelections();
  // ... hundreds of lines of manual updates
}
```

Use profiles for tier switching:
```javascript
// Proposed approach - let profiles handle it
class TierProfileManager {
  async setupTierProfiles() {
    const campaign = window.next.getCampaignData();
    
    // Auto-generate profiles for each tier
    const tierProfiles = this.buildTierProfiles(campaign.packages);
    
    // Register profiles with SDK
    tierProfiles.forEach(profile => {
      window.next.registerProfile(profile);
    });
  }
  
  async switchTier(tier) {
    // Simply switch profile - SDK handles everything
    await window.next.setProfile(`tier_${tier}`);
  }
  
  buildTierProfiles(packages) {
    // Automatically map Buy 1 → Buy 2 → Buy 3
    const tiers = this.groupByTier(packages);
    
    return Object.keys(tiers).map(tierName => ({
      id: `tier_${tierName}`,
      name: tierName,
      packageMappings: this.buildMappings(tiers['Buy 1'], tiers[tierName])
    }));
  }
}
```

### 3. **Use SDK's Variant Organization**

Replace manual variant tracking with SDK's built-in system:

```javascript
// Proposed approach - use SDK's variant methods
class VariantSelector {
  constructor(productId) {
    this.productId = productId;
  }
  
  async initialize() {
    // Get organized variant data from SDK
    const variantData = window.next.getProductVariantsWithPricing(this.productId);
    
    // Build UI from SDK data
    this.buildColorSelector(variantData.attributeTypes);
    this.buildSizeSelector(variantData.attributeTypes);
    
    // Use SDK's pricing tier info
    this.displayPricingOptions(variantData.variants);
  }
  
  onVariantSelected(color, size) {
    // Use SDK to find the right package
    const pkg = window.next.getPackageByVariantSelection(this.productId, {
      color: color,
      size: size
    });
    
    // Add to cart via SDK
    window.next.addItem({ packageId: pkg.ref_id });
  }
}
```

### 4. **Create a Reusable Component Library**

Build modular components that any merchant can use:

```javascript
// Universal tier selector component
class TierSelector extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="tier-selector" data-product-id="${this.getAttribute('product-id')}">
        <!-- Auto-populated from campaign data -->
      </div>
    `;
    this.initialize();
  }
  
  async initialize() {
    const productId = this.getAttribute('product-id');
    const tiers = await this.discoverTiers(productId);
    this.render(tiers);
  }
}

// Register as custom element
customElements.define('next-tier-selector', TierSelector);
```

### 5. **Configuration-Driven Approach**

Replace hard-coded logic with configuration:

```javascript
// Merchant configuration (minimal)
window.nextTierConfig = {
  product: 'auto', // Auto-detect from campaign
  tiers: {
    display: 'buttons', // or 'dropdown', 'cards'
    labels: {
      1: 'Single Item',
      2: 'Buy 2 - Save 10%',
      3: 'Buy 3 - Save 20%'
    }
  },
  variants: {
    display: 'dropdowns', // or 'swatches', 'grid'
    order: ['color', 'size'] // Display order
  },
  profiles: {
    exit: 'exit_10', // Exit intent profile
    default: 'tier_1' // Default tier
  }
};
```

## Implementation Roadmap

### Phase 1: SDK Enhancement (Already Done ✓)
- ✅ Added variant organization methods
- ✅ Added pricing tier support
- ✅ Enhanced profile system integration

### Phase 2: Build Universal Components
1. **Create TierManager Class**
   - Auto-discovers tiers from campaign
   - Generates profiles dynamically
   - Handles tier switching via profiles

2. **Create VariantSelector Class**
   - Uses SDK's variant methods
   - Supports any product structure
   - Handles multi-slot selection

3. **Create PriceDisplay Class**
   - Shows tier-based pricing
   - Updates with profile changes
   - Handles discounts automatically

### Phase 3: Replace Custom Implementation
1. **Remove hard-coded variant arrays**
2. **Replace TierController with TierManager**
3. **Use SDK methods instead of manual tracking**
4. **Simplify from 2000+ lines to ~500 lines**

### Phase 4: Package as Reusable Module
```javascript
// Final usage - works for ANY merchant
import { TierVariantSelector } from '@next/tier-selector';

// That's it! Auto-configures from campaign data
const selector = new TierVariantSelector({
  container: '#product-selector',
  onComplete: (selections) => {
    console.log('User selected:', selections);
  }
});
```

## Key Benefits of Refactoring

### 1. **Universal Compatibility**
- Works with ANY product, not just Grounded Sheets
- Auto-adapts to campaign structure
- No hard-coded IDs needed

### 2. **Maintainability**
- Reduce from 2000+ lines to ~500 lines
- No manual ID mappings to maintain
- Automatic tier discovery

### 3. **SDK Integration**
- Leverages existing SDK capabilities
- Profiles handle tier switching
- Variant methods handle selection

### 4. **Merchant-Friendly**
- Simple configuration
- Works out-of-the-box
- Customizable via CSS

### 5. **Future-Proof**
- New products work automatically
- New tiers detected dynamically
- Profile system handles discounts

## Example: Simplified Implementation

Here's how simple the final implementation could be:

```html
<!-- HTML - Universal for any merchant -->
<div id="product-selector"></div>

<script>
// JavaScript - Works for any product
window.nextReady.push(async (sdk) => {
  // Auto-initialize tier selector
  const selector = new NextTierSelector({
    container: '#product-selector',
    
    // Optional configuration
    config: {
      showImages: true,
      tierDisplay: 'cards',
      variantDisplay: 'dropdowns'
    },
    
    // Event handlers
    onTierChange: (tier) => {
      console.log('Tier changed to:', tier);
    },
    
    onSelectionComplete: (selections) => {
      console.log('All slots filled:', selections);
    }
  });
  
  // That's it! Everything else is automatic
});
</script>
```

## Migration Strategy

### Step 1: Build New Components Alongside Existing
- Don't break current implementation
- Test new components in parallel
- Ensure feature parity

### Step 2: Gradual Replacement
- Replace one feature at a time
- Start with tier selection
- Then variant selection
- Finally cart management

### Step 3: Remove Legacy Code
- Once new system is proven
- Remove hard-coded arrays
- Delete manual mapping logic

### Step 4: Package and Document
- Create npm package
- Write merchant documentation
- Provide migration guide

## Technical Improvements

### 1. **Use Web Components**
```javascript
// Modern, reusable components
class NextTierSelector extends HTMLElement {
  // Self-contained, works anywhere
}
customElements.define('next-tier-selector', NextTierSelector);
```

### 2. **Event-Driven Architecture**
```javascript
// Clean event system
selector.addEventListener('tier-changed', (e) => {
  // Handle tier change
});

selector.addEventListener('selection-complete', (e) => {
  // Handle completion
});
```

### 3. **Async/Await Throughout**
```javascript
// Modern async patterns
async function initializeSelector() {
  const campaign = await sdk.getCampaignData();
  const tiers = await buildTiers(campaign);
  await renderUI(tiers);
}
```

### 4. **TypeScript Support**
```typescript
// Type safety for merchants
interface TierSelectorConfig {
  container: string | HTMLElement;
  productId?: number;
  config?: {
    tierDisplay: 'buttons' | 'cards' | 'dropdown';
    variantDisplay: 'dropdowns' | 'swatches' | 'grid';
  };
  onTierChange?: (tier: number) => void;
  onSelectionComplete?: (selections: VariantSelection[]) => void;
}
```

## Conclusion

The current implementation works but is not scalable or maintainable. By leveraging the SDK's capabilities and building universal components, we can:

1. **Reduce code by 75%** (from 2000+ to ~500 lines)
2. **Support any product** without modifications
3. **Eliminate manual mappings** and hard-coded IDs
4. **Make it merchant-ready** with simple configuration
5. **Future-proof** the solution for new products/campaigns

The key insight is that the SDK already has all the capabilities needed - we just need to use them instead of reimplementing everything manually. The profile system perfectly handles tier switching, and the new variant methods handle product selection. By combining these with modern web components, we can create a truly universal solution.