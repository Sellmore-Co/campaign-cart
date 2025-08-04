# Selection Upsells

Multiple options to choose from. Uses selector ID instead of package ID.

## Card Selection Pattern

Let customers choose from multiple options:

```html
<!-- Selector mode: uses selector ID -->
<div data-next-upsell-selector data-next-selector-id="protection">
  <h3>Choose Your Protection Plan</h3>
  
  <div data-next-upsell-option data-next-package-id="7">
    <h4>Basic Protection</h4>
    <p>1 Year Coverage</p>
    <span data-next-display="package.price">$14.99</span>
  </div>
  
  <div data-next-upsell-option data-next-package-id="9" data-next-selected="true">
    <h4>Premium Protection</h4>
    <p>2 Year Coverage + Accidental Damage</p>
    <span data-next-display="package.price">$24.99</span>
  </div>
  
  <div data-next-upsell-option data-next-package-id="10">
    <h4>Ultimate Protection</h4>
    <p>3 Year Coverage + Everything</p>
    <span data-next-display="package.price">$39.99</span>
  </div>
  
  <button data-next-upsell-action="add">
    Add Selected Protection
  </button>
  <button data-next-upsell-action="skip">
    Continue Without Protection
  </button>
</div>
```

## Dropdown Selection Pattern

Compact selection using native select element:

```html
<!-- Wrap in upsell container -->
<div data-next-upsell-selector data-next-selector-id="training">
  <h3>Add Training Course?</h3>
  
  <select data-next-upsell-select="training">
    <option value="">Choose a course...</option>
    <option value="2">Beginner Course - $29.99</option>
    <option value="3" selected>Advanced Course - $49.99</option>
    <option value="4">Master Course - $79.99</option>
  </select>
  
  <button data-next-upsell-action="add">
    Add Course to Order
  </button>
  <button data-next-upsell-action="skip">
    No Thanks
  </button>
</div>
```

## Display Selection Info

Show details about the selected option:

```html
<div data-next-upsell-selector data-next-selector-id="warranty">
  <!-- Option cards here -->
  
  <div class="selection-summary">
    <p>Selected: <span data-next-display="selection.warranty.name">None</span></p>
    <p>Price: <span data-next-display="selection.warranty.price">$0</span></p>
    <p data-next-show="selection.warranty.hasSavings">
      You save: <span data-next-display="selection.warranty.savingsAmount">$0</span>
    </p>
  </div>
  
  <button data-next-upsell-action="add">Add to Order</button>
</div>
```

## Grid Layout Example

```html
<div data-next-upsell-selector data-next-selector-id="accessories">
  <h3>Popular Accessories</h3>
  
  <div class="upsell-grid">
    <div class="upsell-card" data-next-upsell-option data-next-package-id="11">
      <img src="case.jpg" alt="Carrying Case">
      <h4>Carrying Case</h4>
      <span data-next-display="package.price">$19.99</span>
    </div>
    
    <div class="upsell-card" data-next-upsell-option data-next-package-id="12">
      <img src="filters.jpg" alt="Filter Set">
      <h4>Filter Set</h4>
      <span data-next-display="package.price">$39.99</span>
    </div>
    
    <div class="upsell-card" data-next-upsell-option data-next-package-id="13">
      <img src="props.jpg" alt="Extra Props">
      <h4>Extra Props</h4>
      <span data-next-display="package.price">$24.99</span>
    </div>
  </div>
  
  <button data-next-upsell-action="add">Add Selected Item</button>
  <button data-next-upsell-action="skip">Continue</button>
</div>
```

## Key Attributes

### Container
- `data-next-upsell-selector` - Marks as selection upsell
- `data-next-selector-id` - Unique ID for this selector

### Options
- `data-next-upsell-option` - Individual option card
- `data-next-package-id` - Package for this option
- `data-next-selected="true"` - Default selection

### Dropdown
- `data-next-upsell-select` - Native select element
- Option `value` - Package ID for that option

## CSS Classes

Options automatically get classes:
- `.next-selected` - Currently selected option
- `.next-upsell-option` - All option cards

## Best Practices

1. **Highlight Best Value**: Mark recommended option
2. **Show Comparisons**: Display savings or features
3. **Default Selection**: Pre-select most popular option
4. **Clear Pricing**: Show price for each option
5. **Visual Hierarchy**: Make selection clear