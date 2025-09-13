// Grounded Sheets Upsell System
// Dynamic slot creation based on quantity selection with upsell handling

// Static configurations
const CONFIG = {
  colors: {
    images: {
      'obsidian-grey': 'https://cdn.29next.store/media/bareearth/uploads/obsidian-grey.png',
      'chateau-ivory': 'https://cdn.29next.store/media/bareearth/uploads/chateau-ivory.png',
      'scribe-blue': 'https://cdn.29next.store/media/bareearth/uploads/scribe-blue.png',
      'verdant-sage': 'https://cdn.29next.store/media/bareearth/uploads/verdant-sage.png',
    },
    styles: {
      'obsidian-grey': '#9699a6',
      'chateau-ivory': '#e4e4e5',
      'scribe-blue': '#4a90e2',
      'verdant-sage': '#87a96b',
    }
  },
  displayOrder: {
    sizes: ['Twin', 'Single', 'Double', 'Queen', 'King', 'California King'],
    colors: ['Obsidian Grey', 'Chateau Ivory', 'Scribe Blue', 'Verdant Sage']
  },
  // Package mapping for upsells based on color/size combinations
  packageMapping: {
    'obsidian-grey': {
      'twin': 146,
      'single': 166,
      'double': 150,
      'queen': 154,
      'king': 158,
      'california king': 162,
      'cali king': 162 // Alias
    },
    'chateau-ivory': {
      'twin': 147,
      'single': 167,
      'double': 151,
      'queen': 155,
      'king': 159,
      'california king': 163,
      'cali king': 163
    },
    'scribe-blue': {
      'twin': 148,
      'single': 168,
      'double': 152,
      'queen': 156,
      'king': 160,
      'california king': 164,
      'cali king': 164
    },
    'verdant-sage': {
      'twin': 149,
      'single': 169,
      'double': 153,
      'queen': 157,
      'king': 161,
      'california king': 165,
      'cali king': 165
    }
  },
  // Pricing per size (for display)
  pricing: {
    'twin': { retail: 299.98, sale: 74.99 },
    'single': { retail: 219.98, sale: 54.99 },
    'double': { retail: 339.98, sale: 84.99 },
    'queen': { retail: 339.98, sale: 84.99 },
    'king': { retail: 379.98, sale: 94.99 },
    'california king': { retail: 379.98, sale: 94.99 },
    'cali king': { retail: 379.98, sale: 94.99 }
  }
};

// Upsell Controller Class
class UpsellController {
  constructor() {
    this.currentQuantity = 1;
    this.selectedVariants = new Map();
    this.slotsContainer = null;
    this.quantityButtons = null;
    this.acceptButton = null;
    this._domCache = new Map();
    this._eventCleanup = [];

    this.init();
  }

  async init() {
    await this._waitForSDK();
    this._cacheElements();
    this._bindEvents();
    this._initializeSlots();
    this._updatePricing();
  }

  _waitForSDK() {
    return new Promise(resolve => {
      const check = () => {
        if (window.next?.addUpsell) {
          resolve();
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  }

  _cacheElements() {
    this.slotsContainer = document.querySelector('.os-slots.slot-upsell');
    this.quantityButtons = document.querySelectorAll('[data-next-upsell-quantity-toggle]');
    this.acceptButton = document.querySelector('[data-next-upsell-action="add"]');
    this.originalPriceElement = document.getElementById('originalPrice');
    this.currentPriceElement = document.getElementById('currentPrice');
    this.savingsElement = document.querySelector('[data-next-display="package.savingsPercentage"]');
  }

  _bindEvents() {
    // Quantity button clicks
    this.quantityButtons.forEach(button => {
      button.addEventListener('click', () => {
        const quantity = parseInt(button.getAttribute('data-next-upsell-quantity-toggle'));
        this.selectQuantity(quantity);
      });
    });

    // Accept button click
    if (this.acceptButton) {
      this.acceptButton.addEventListener('click', async (e) => {
        e.preventDefault();
        await this.acceptUpsell();
      });
    }

    // Listen for variant selections
    document.addEventListener('variantSelected', (e) => this._handleVariantSelection(e.detail));
  }

  selectQuantity(quantity) {
    if (quantity === this.currentQuantity) return;

    this.currentQuantity = quantity;

    // Update button states
    this.quantityButtons.forEach(btn => {
      const btnQty = parseInt(btn.getAttribute('data-next-upsell-quantity-toggle'));
      btn.classList.toggle('next-selected', btnQty === quantity);
    });

    // Update slots
    this._updateSlots(quantity);

    // Update pricing
    this._updatePricing();
  }

  _updateSlots(quantity) {
    const existingSlots = this.slotsContainer.querySelectorAll('[next-tier-slot]');
    const currentCount = existingSlots.length;

    if (quantity > currentCount) {
      // Add new slots
      for (let i = currentCount + 1; i <= quantity; i++) {
        this._createSlot(i);
      }
    } else if (quantity < currentCount) {
      // Hide extra slots
      existingSlots.forEach((slot, index) => {
        if (index >= quantity) {
          slot.style.display = 'none';
        }
      });
    }

    // Show needed slots
    for (let i = 0; i < quantity; i++) {
      existingSlots[i].style.display = 'flex';
    }
  }

  _createSlot(slotNumber) {
    const templateSlot = this.slotsContainer.querySelector('[next-tier-slot="1"]');
    if (!templateSlot) return;

    const newSlot = templateSlot.cloneNode(true);
    newSlot.setAttribute('next-tier-slot', slotNumber);

    // Update step number
    const stepElement = newSlot.querySelector('.os-slot__step');
    if (stepElement) {
      stepElement.innerHTML = `<div>${String(slotNumber).padStart(2, '0')}</div>`;
    }

    // Reset dropdowns
    const dropdowns = newSlot.querySelectorAll('os-dropdown');
    dropdowns.forEach(dropdown => {
      // Re-initialize dropdown for new slot
      if (dropdown._mounted) {
        dropdown._mounted = false;
        dropdown.connectedCallback();
      }
    });

    this.slotsContainer.appendChild(newSlot);

    // Copy selection from slot 1 if it exists
    const slot1Variants = this.selectedVariants.get(1);
    if (slot1Variants) {
      this.selectedVariants.set(slotNumber, { ...slot1Variants });
      this._updateSlotSelection(newSlot, slot1Variants);
    }
  }

  _initializeSlots() {
    // Initialize first slot with default selection
    const firstSlot = this.slotsContainer.querySelector('[next-tier-slot="1"]');
    if (firstSlot) {
      // Set default to Obsidian Grey / Single
      const defaultVariants = {
        color: 'obsidian-grey',
        size: 'single'
      };

      this.selectedVariants.set(1, defaultVariants);
      this._updateSlotSelection(firstSlot, defaultVariants);
    }
  }

  _updateSlotSelection(slot, variants) {
    // Update color dropdown
    const colorDropdown = slot.querySelector('os-dropdown[next-variant-option="color"]');
    if (colorDropdown && variants.color) {
      colorDropdown.value = variants.color;
      this._updateColorSwatch(colorDropdown, variants.color);
      this._updateSlotImage(slot, variants.color);
    }

    // Update size dropdown
    const sizeDropdown = slot.querySelector('os-dropdown[next-variant-option="size"]');
    if (sizeDropdown && variants.size) {
      sizeDropdown.value = variants.size;
    }
  }

  _handleVariantSelection({ value, component }) {
    const slot = component.closest('[next-tier-slot]');
    if (!slot) return;

    const slotNumber = parseInt(slot.getAttribute('next-tier-slot'));
    const variantType = component.getAttribute('next-variant-option');

    if (!this.selectedVariants.has(slotNumber)) {
      this.selectedVariants.set(slotNumber, {});
    }

    const slotVariants = this.selectedVariants.get(slotNumber);
    slotVariants[variantType] = value;

    if (variantType === 'color') {
      this._updateColorSwatch(component, value);
      this._updateSlotImage(slot, value);
    }

    this._updatePricing();
  }

  _updateColorSwatch(dropdown, colorValue) {
    const swatch = dropdown.querySelector('.os-card__variant-swatch');
    if (swatch && colorValue) {
      const colorKey = colorValue.toLowerCase().replace(/\s+/g, '-');
      if (CONFIG.colors.styles[colorKey]) {
        swatch.style.backgroundColor = CONFIG.colors.styles[colorKey];
      }
    }
  }

  _updateSlotImage(slot, colorValue) {
    const imageElement = slot.querySelector('[next-tier-slot-element="image"]');
    if (imageElement && colorValue) {
      const colorKey = colorValue.toLowerCase().replace(/\s+/g, '-');
      if (CONFIG.colors.images[colorKey]) {
        imageElement.style.opacity = '0.5';
        imageElement.src = CONFIG.colors.images[colorKey];
        imageElement.onload = () => imageElement.style.opacity = '1';
      }
    }
  }

  _updatePricing() {
    let totalRetail = 0;
    let totalSale = 0;

    for (let i = 1; i <= this.currentQuantity; i++) {
      const variants = this.selectedVariants.get(i);
      if (variants?.size) {
        const sizeKey = variants.size.toLowerCase();
        const pricing = CONFIG.pricing[sizeKey];
        if (pricing) {
          totalRetail += pricing.retail;
          totalSale += pricing.sale;
        }
      }
    }

    // Update price displays
    if (this.originalPriceElement) {
      this.originalPriceElement.textContent = `$${totalRetail.toFixed(2)}`;
    }

    if (this.currentPriceElement) {
      this.currentPriceElement.textContent = `$${totalSale.toFixed(2)}`;
    }

    // Update savings percentage
    if (this.savingsElement && totalRetail > 0) {
      const savings = Math.round(((totalRetail - totalSale) / totalRetail) * 100);
      this.savingsElement.textContent = `${savings}%`;
    }
  }

  async acceptUpsell() {
    // Disable button and show loading
    this.acceptButton.classList.add('is-submitting');
    this.acceptButton.disabled = true;

    try {
      const upsellItems = [];

      // Collect all selected items
      for (let i = 1; i <= this.currentQuantity; i++) {
        const variants = this.selectedVariants.get(i);
        if (variants?.color && variants?.size) {
          const colorKey = variants.color.toLowerCase().replace(/\s+/g, '-');
          const sizeKey = variants.size.toLowerCase();

          const packageId = CONFIG.packageMapping[colorKey]?.[sizeKey];
          if (packageId) {
            upsellItems.push({
              packageId: packageId,
              quantity: 1
            });
          }
        }
      }

      if (upsellItems.length === 0) {
        console.error('No valid items selected');
        return;
      }

      // Add upsells using the Next SDK
      console.log('Adding upsells:', upsellItems);

      // Call the addUpsell method
      await window.next.addUpsell(upsellItems);

      // Success - redirect or show success message
      console.log('Upsells added successfully');

      // If there's a next URL, redirect
      const nextUrl = this.acceptButton.getAttribute('data-next-url');
      if (nextUrl) {
        window.location.href = nextUrl;
      }

    } catch (error) {
      console.error('Failed to add upsells:', error);
      // Show error message
      alert('Failed to add items to your order. Please try again.');
    } finally {
      // Re-enable button
      this.acceptButton.classList.remove('is-submitting');
      this.acceptButton.disabled = false;
    }
  }

  cleanup() {
    this._eventCleanup.forEach(cleanup => cleanup());
    this._eventCleanup = [];
  }
}

// Initialize when SDK is ready
window.addEventListener('next:initialized', function() {
  window.upsellController = new UpsellController();
});

// If SDK is already initialized
if (window.next?.addUpsell) {
  window.upsellController = new UpsellController();
}