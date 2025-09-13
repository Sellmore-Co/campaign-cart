// Grounded Footwear - Refactored to use SDK variant methods
// This version leverages the SDK's built-in variant handling and profiles

// Color configuration (static images and swatch colors)
const colorConfig = {
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
};

// Value mappings for dropdowns
const valueToDisplayName = {
  'obsidian-grey': 'Obsidian Grey',
  'chateau-ivory': 'Chateau Ivory',
  'scribe-blue': 'Scribe Blue',
  'verdant-sage': 'Verdant Sage',
  'single': 'Single',
  'twin': 'Twin',
  'double': 'Double',
  'queen': 'Queen',
  'king': 'King',
  'cali-king': 'Cali King',
  'california-king': 'Cali King', // Alternative mapping
};

// Base HTML element classes remain the same
class ConversionElement extends HTMLElement {
  constructor() {
    super();
    this._mounted = false;
    this._abortController = null;
  }

  connectedCallback() {
    if (!this._mounted) {
      this._abortController = new AbortController();
      this.mount(this._abortController.signal);
      this._mounted = true;
    }
  }

  disconnectedCallback() {
    if (this._abortController) {
      this._abortController.abort();
      this._abortController = null;
    }
    this._mounted = false;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.onAttributeChange?.(name, oldValue, newValue);
    }
  }

  mount(signal) {}
  onAttributeChange(name, oldValue, newValue) {}
}

// Keep the dropdown classes as they handle UI interactions
const { computePosition, flip, offset, autoUpdate, arrow } = window.FloatingUIDOM;

class OSDropdown extends ConversionElement {
  constructor() {
    super();
    this.toggle = null;
    this.menu = null;
    this.arrow = null;
    this._value = null;
    this.cleanupAutoUpdate = null;
  }

  static observedAttributes = ['value', 'name', 'disabled', 'animate-selection', 'animation-duration'];
  static openDropdowns = new Set();

  mount(signal) {
    this.init();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.isOpen) this.closeDropdown();
    if (this.cleanupAutoUpdate) {
      this.cleanupAutoUpdate();
      this.cleanupAutoUpdate = null;
    }
    OSDropdown.openDropdowns.delete(this);
  }

  init() {
    this.toggle = this.querySelector('button, [role="button"]');
    if (!this.toggle) return;

    this.menu = this.querySelector('os-dropdown-menu');
    if (!this.menu) {
      const legacyMenu = this.querySelector('[os-element="dropdown-menu"]');
      if (legacyMenu) {
        this.menu = document.createElement('os-dropdown-menu');
        while (legacyMenu.firstChild) {
          this.menu.appendChild(legacyMenu.firstChild);
        }
        legacyMenu.replaceWith(this.menu);
      }
    }

    if (this.menu) {
      this.arrow = this.menu.querySelector('.dropdown-arrow');
      if (!this.arrow) {
        this.arrow = document.createElement('div');
        this.arrow.className = 'dropdown-arrow';
        this.menu.appendChild(this.arrow);
      }
    }

    if (!this.menu) return;

    this.setupEventListeners();

    if (this.hasAttribute('value')) {
      this.value = this.getAttribute('value');
    } else {
      const selectedItem = this.querySelector('os-dropdown-item[selected]');
      if (selectedItem) {
        this._value = selectedItem.value;
        this.updateToggleContent();
      }
    }

    this.toggle.setAttribute('role', 'button');
    this.toggle.setAttribute('aria-haspopup', 'listbox');
    this.toggle.setAttribute('aria-expanded', 'false');
  }

  setupEventListeners() {
    if (!this.toggle || !this.menu) return;

    this.toggle.addEventListener('click', e => {
      e.stopPropagation();
      this.toggleDropdown();
    });

    this.toggle.addEventListener('keydown', e => {
      this.handleKeyboard(e);
    });

    this.addEventListener('dropdown-item-select', e => {
      this.handleItemSelect(e.detail.item);
    });

    document.addEventListener('click', e => {
      if (!this.contains(e.target) && this.isOpen) {
        this.closeDropdown();
      }
    });
  }

  async updateDropdownPosition() {
    if (!this.isOpen || !this.toggle || !this.menu) return;

    const middleware = [
      offset(8),
      flip({ fallbackPlacements: ['top-start', 'bottom-end', 'top-end'] }),
    ];

    if (this.arrow) {
      middleware.push(arrow({ element: this.arrow }));
    }

    const { x, y, placement, middlewareData } = await computePosition(
      this.toggle,
      this.menu,
      {
        placement: 'bottom-start',
        middleware,
      }
    );

    Object.assign(this.menu.style, {
      left: `${x}px`,
      top: `${y}px`,
    });

    this.menu.classList.remove('placement-top', 'placement-bottom', 'placement-left', 'placement-right');
    this.menu.classList.add(`placement-${placement.split('-')[0]}`);

    if (this.arrow && middlewareData.arrow) {
      const { x: arrowX, y: arrowY } = middlewareData.arrow;
      const side = placement.split('-')[0];

      Object.assign(this.arrow.style, {
        left: arrowX != null ? `${arrowX}px` : '',
        top: arrowY != null ? `${arrowY}px` : '',
        right: '',
        bottom: '',
        [{
          top: 'bottom',
          bottom: 'top',
          left: 'right',
          right: 'left',
        }[side]]: '-4px',
      });
    }
  }

  toggleDropdown() {
    if (this.isOpen) {
      this.closeDropdown();
    } else {
      OSDropdown.closeAllDropdowns();
      this.openDropdown();
    }
  }

  async openDropdown() {
    if (!this.toggle || !this.menu) return;

    this.setAttribute('open', '');
    this.toggle.classList.add('active');
    this.menu.classList.add('show');
    this.toggle.setAttribute('aria-expanded', 'true');

    await this.updateDropdownPosition();

    if (this.toggle && this.menu) {
      this.cleanupAutoUpdate = autoUpdate(this.toggle, this.menu, () =>
        this.updateDropdownPosition()
      );
    }

    OSDropdown.openDropdowns.add(this);

    const firstItem = this.querySelector('os-dropdown-item:not([disabled])');
    if (firstItem) firstItem.focus();
  }

  closeDropdown() {
    if (!this.toggle || !this.menu) return;

    this.removeAttribute('open');
    this.toggle.classList.remove('active');
    this.menu.classList.remove('show');
    this.toggle.setAttribute('aria-expanded', 'false');

    if (this.cleanupAutoUpdate) {
      this.cleanupAutoUpdate();
      this.cleanupAutoUpdate = null;
    }

    this.menu.classList.remove('placement-top', 'placement-bottom', 'placement-left', 'placement-right');

    if (this.arrow) {
      Object.assign(this.arrow.style, {
        left: '',
        top: '',
        right: '',
        bottom: '',
      });
    }

    OSDropdown.openDropdowns.delete(this);
    this.toggle.focus();
  }

  updateToggleContent() {
    if (!this.toggle || this._value === null) return;

    const selectedItem = this.querySelector(`os-dropdown-item[value="${this._value}"]`);
    if (!selectedItem) return;

    const itemContent = selectedItem.querySelector('.os-card__toggle-option');
    if (!itemContent) return;

    const existingContent = this.toggle.querySelector('.os-card__toggle-option');

    if (existingContent && itemContent) {
      const newContent = itemContent.cloneNode(true);
      newContent.classList.remove('os--distribute');

      if (!newContent.classList.contains('os--main')) {
        newContent.classList.add('os--main');
      }

      existingContent.replaceWith(newContent);
    }
  }

  handleItemSelect(item) {
    this._value = item.value;
    this.setAttribute('value', this._value || '');

    const items = this.querySelectorAll('os-dropdown-item');
    items.forEach(i => {
      i.classList.remove('selected');
      i.removeAttribute('selected');
      i.selected = i === item;
    });

    this.updateToggleContent();
    this.closeDropdown();

    this.dispatchEvent(new Event('change', { bubbles: true }));

    this.dispatchEvent(
      new CustomEvent('variantSelected', {
        detail: {
          value: item.value,
          item,
          component: this,
          type: 'dropdown',
        },
        bubbles: true,
      })
    );
  }

  handleKeyboard(e) {
    if (!this.isOpen && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      this.openDropdown();
    } else if (this.isOpen && e.key === 'Escape') {
      e.preventDefault();
      this.closeDropdown();
    } else if (this.isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault();
      this.navigateItems(e.key === 'ArrowDown' ? 1 : -1);
    }
  }

  navigateItems(direction) {
    const items = Array.from(this.querySelectorAll('os-dropdown-item:not([disabled])'));
    const currentIndex = items.findIndex(item => item.selected);
    const newIndex = Math.max(0, Math.min(items.length - 1, currentIndex + direction));

    if (newIndex !== currentIndex && items[newIndex]) {
      items[newIndex].focus();
      this.handleItemSelect(items[newIndex]);
    }
  }

  static closeAllDropdowns() {
    OSDropdown.openDropdowns.forEach(dropdown => {
      dropdown.closeDropdown();
    });
  }

  get value() {
    return this._value;
  }

  set value(val) {
    this._value = val;
    this.setAttribute('value', val || '');

    const items = this.querySelectorAll('os-dropdown-item');
    items.forEach(item => {
      item.classList.remove('os-card__variant-dropdown-item', 'selected');
      item.removeAttribute('selected');
      item.selected = item.value === val;
    });

    this.updateToggleContent();
  }

  get isOpen() {
    return this.hasAttribute('open');
  }
}

class OSDropdownMenu extends ConversionElement {
  mount() {
    this.setAttribute('role', 'listbox');
    this.classList.add('os-dropdown-menu');

    if (
      this.classList.contains('os-card__variant-dropdown-menu') ||
      this.classList.contains('os-card__variant-dropdown-menu-v2')
    ) {
      this.classList.add('os-dropdown-menu');
    }

    this.style.position = 'absolute';
    this.style.zIndex = '1000';
  }
}

class OSDropdownItem extends ConversionElement {
  constructor() {
    super();
    this._selected = false;
    this._value = '';
  }

  static observedAttributes = ['value', 'selected', 'disabled'];

  mount() {
    this.setAttribute('role', 'option');
    this.setAttribute('tabindex', '-1');

    this.addEventListener('click', () => {
      if (!this.disabled) this.select();
    });

    this.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && !this.disabled) {
        e.preventDefault();
        this.select();
      }
    });

    if (this.hasAttribute('value')) {
      this._value = this.getAttribute('value');
    }
    if (this.hasAttribute('selected')) {
      this._selected = true;
      this.setAttribute('aria-selected', 'true');
    }

    if (this.hasAttribute('data-value')) {
      this._value = this.getAttribute('data-value');
    }
  }

  select() {
    const dropdown = this.closest('os-dropdown');
    if (dropdown) {
      dropdown.dispatchEvent(
        new CustomEvent('dropdown-item-select', {
          detail: { item: this },
          bubbles: true,
        })
      );
    }
  }

  get value() {
    return this._value;
  }

  set value(val) {
    this._value = val;
    this.setAttribute('value', val);
  }

  get selected() {
    return this._selected;
  }

  set selected(val) {
    this._selected = val;
    this.setAttribute('aria-selected', String(val));
    this.classList.toggle('selected', val);

    if (val) {
      this.setAttribute('selected', '');
    } else {
      this.removeAttribute('selected');
    }
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  onAttributeChange(name, _oldValue, newValue) {
    switch (name) {
      case 'value':
        this._value = newValue || '';
        break;
      case 'selected':
        this.selected = newValue !== null;
        break;
      case 'disabled':
        this.setAttribute('aria-disabled', String(newValue !== null));
        this.classList.toggle('disabled', newValue !== null);
        break;
    }
  }
}

// Simplified Tier Controller using SDK methods
class TierController {
  constructor() {
    this.currentTier = 1;
    this.selectedVariants = new Map();
    this.productId = null; // Will be set from campaign data
    this.currentProfile = null;
    
    this.init();
  }

  async init() {
    await this.waitForSDK();
    this.getProductIdFromCampaign();
    this.bindTierSelection();
    this.bindDropdownEvents();
    this.initializeDefaultState();
    this.populateAllDropdowns();
    await this.setInitialSelections(); // Set default Obsidian Grey and King
    this.initializeColorSwatches();
    this.initializeSlotImages();
    this.setupProfileListeners();
    this.updateCTAButtons();
  }

  waitForSDK() {
    return new Promise((resolve) => {
      const check = () => {
        if (typeof window.next !== 'undefined' && window.next.getCampaignData) {
          resolve();
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  }

  getProductIdFromCampaign() {
    const campaign = window.next.getCampaignData();
    if (campaign?.packages?.length > 0) {
      // Get the first package's product_id as they should all be from the same product
      this.productId = campaign.packages[0].product_id;
      console.log('Product ID detected:', this.productId);
    } else {
      // Fallback: try to get from sessionStorage cache
      try {
        const cacheData = sessionStorage.getItem('next-campaign-cache');
        if (cacheData) {
          const cache = JSON.parse(cacheData);
          if (cache.campaign?.packages?.length > 0) {
            this.productId = cache.campaign.packages[0].product_id;
            console.log('Product ID detected from cache:', this.productId);
          }
        }
      } catch (error) {
        console.error('Failed to get product ID from cache:', error);
      }
    }
    
    if (!this.productId) {
      console.error('Warning: Product ID not found. Some features may not work correctly.');
    }
  }

  setupProfileListeners() {
    // Listen for profile changes
    window.next.on('profile:applied', (data) => {
      this.currentProfile = data.profileId;
      this.handleProfileChange();
    });

    window.next.on('profile:reverted', () => {
      this.currentProfile = null;
      this.handleProfileChange();
    });
  }

  handleProfileChange() {
    // Re-get product ID in case it changed with profile
    this.getProductIdFromCampaign();
    
    // Refresh dropdowns and pricing when profile changes
    this.populateAllDropdowns();
    for (let i = 1; i <= this.currentTier; i++) {
      this.updateSlotPricing(i);
    }
  }

  bindTierSelection() {
    const tierCards = document.querySelectorAll('[data-next-tier]');
    tierCards.forEach(card => {
      card.addEventListener('click', e => {
        const tier = parseInt(card.getAttribute('data-next-tier'));
        this.selectTier(tier);
      });
    });
  }

  async selectTier(tierNumber) {
    const previousTier = this.currentTier;
    
    if (tierNumber === previousTier) {
      return;
    }

    this.currentTier = tierNumber;
    this.updateTierCardStates(tierNumber);
    this.updateSlotStates(tierNumber);

    // Store current selections before switching
    const currentSelections = new Map(this.selectedVariants);

    // Apply the appropriate profile based on tier
    const profileMap = {
      1: null, // Default profile (no profile)
      2: '2_pack',
      3: '3_pack'
    };

    if (this.currentProfile?.includes('exit_10')) {
      // If exit discount is active, use the exit variant
      const exitProfileMap = {
        1: 'exit_10',
        2: 'exit_10_2pack',
        3: 'exit_10_3pack'
      };
      await window.next.setProfile(exitProfileMap[tierNumber]);
    } else if (profileMap[tierNumber]) {
      await window.next.setProfile(profileMap[tierNumber]);
    } else {
      await window.next.revertProfile();
    }

    // Wait for profile to be fully applied
    await new Promise(resolve => setTimeout(resolve, 300));

    // Restore selections for valid slots and auto-select first options for new slots
    for (let i = 1; i <= tierNumber; i++) {
      if (currentSelections.has(i)) {
        this.selectedVariants.set(i, currentSelections.get(i));
      } else {
        // Auto-select first available options for new slots
        await this.autoSelectFirstOptions(i);
      }
    }

    // Use swapCart to replace entire cart at once
    await this.swapCartWithSelections();
    this.updateCTAButtons();
  }

  async autoSelectFirstOptions(slotNumber) {
    const slot = document.querySelector(`[next-tier-slot="${slotNumber}"]`);
    if (!slot) return;

    // Get available options from SDK
    const availableColors = window.next.getAvailableVariantAttributes(this.productId, 'color');
    const availableSizes = window.next.getAvailableVariantAttributes(this.productId, 'size');

    // Initialize slot variants if not exists
    if (!this.selectedVariants.has(slotNumber)) {
      this.selectedVariants.set(slotNumber, {});
    }
    const slotVariants = this.selectedVariants.get(slotNumber);

    // Auto-select Obsidian Grey if available, otherwise first color
    if (availableColors.length > 0 && !slotVariants.color) {
      const obsidianGrey = availableColors.find(color =>
        color.toLowerCase() === 'obsidian grey' ||
        color.toLowerCase() === 'obsidian gray'
      );
      const selectedColor = obsidianGrey || availableColors[0];
      slotVariants.color = selectedColor;

      // Update the dropdown UI
      const colorDropdown = slot.querySelector('os-dropdown[next-variant-option="color"]');
      if (colorDropdown) {
        colorDropdown.value = selectedColor;
        this.updateColorSwatch(colorDropdown, selectedColor);
        this.updateSlotImage(slot, selectedColor);
      }
    }

    // Auto-select King if available, otherwise first size
    if (availableSizes.length > 0 && !slotVariants.size) {
      const king = availableSizes.find(size =>
        size.toLowerCase() === 'king'
      );
      const selectedSize = king || availableSizes[0];
      slotVariants.size = selectedSize;

      // Update the dropdown UI
      const sizeDropdown = slot.querySelector('os-dropdown[next-variant-option="size"]');
      if (sizeDropdown) {
        sizeDropdown.value = selectedSize;
      }
    }

    // Update pricing for this slot
    this.updateSlotPricing(slotNumber);
  }

  updateTierCardStates(selectedTier) {
    const tierCards = document.querySelectorAll('[data-next-tier]');
    tierCards.forEach(card => {
      const tier = parseInt(card.getAttribute('data-next-tier'));
      if (tier === selectedTier) {
        card.classList.add('next-selected');
        const radioButton = card.querySelector('.radio-style-1');
        if (radioButton) {
          radioButton.setAttribute('data-selected', 'true');
        }
      } else {
        card.classList.remove('next-selected');
        const radioButton = card.querySelector('.radio-style-1');
        if (radioButton) {
          radioButton.setAttribute('data-selected', 'false');
        }
      }
    });
  }

  updateSlotStates(tierNumber) {
    const slots = document.querySelectorAll('[next-tier-slot]');
    slots.forEach(slot => {
      const slotNumber = parseInt(slot.getAttribute('next-tier-slot'));
      if (slotNumber <= tierNumber) {
        slot.classList.add('active');
        slot.style.display = 'flex';
      } else {
        slot.classList.remove('active');
        slot.style.display = 'none';
      }
    });
  }

  bindDropdownEvents() {
    document.addEventListener('variantSelected', e => {
      this.handleVariantSelection(e.detail);
    });
  }

  handleVariantSelection(detail) {
    const { value, component } = detail;
    
    const slot = component.closest('[next-tier-slot]');
    if (!slot) return;

    const slotNumber = parseInt(slot.getAttribute('next-tier-slot'));
    const variantType = component.getAttribute('next-variant-option');

    if (!this.selectedVariants.has(slotNumber)) {
      this.selectedVariants.set(slotNumber, {});
    }

    // Store the value directly from API (no normalization needed)
    const slotVariants = this.selectedVariants.get(slotNumber);
    slotVariants[variantType] = value;

    if (variantType === 'color') {
      this.updateColorSwatch(component, value);
      this.updateSlotImage(slot, value);
    }

    this.updateSlotPricing(slotNumber);
    this.checkCompleteSelection(slotNumber);
  }

  updateColorSwatch(dropdown, colorValue) {
    const toggle = dropdown.querySelector('button');
    const swatch = toggle?.querySelector('.os-card__variant-swatch');

    if (swatch && colorValue) {
      // Create normalized key for color config lookup
      const colorKey = colorValue.toLowerCase().replace(/\s+/g, '-');
      swatch.className = 'os-card__variant-swatch';
      if (colorConfig.styles[colorKey]) {
        swatch.style.backgroundColor = colorConfig.styles[colorKey];
      }
    }
  }

  updateSlotImage(slot, colorValue) {
    const imageElement = slot.querySelector('[next-tier-slot-element="image"]');
    if (imageElement && colorValue) {
      // Create normalized key for color config lookup
      const colorKey = colorValue.toLowerCase().replace(/\s+/g, '-');
      if (colorConfig.images[colorKey]) {
        imageElement.style.transition = 'opacity 0.3s ease-in-out';
        imageElement.style.opacity = '0.5';
        imageElement.src = colorConfig.images[colorKey];
        imageElement.onload = () => {
          imageElement.style.opacity = '1';
        };
      }
    }
  }

  async checkCompleteSelection(slotNumber) {
    const slotVariants = this.selectedVariants.get(slotNumber);
    
    // Check if both color AND size are selected
    const hasColor = slotVariants?.color && slotVariants.color !== 'select-color';
    const hasSize = slotVariants?.size && slotVariants.size !== 'select-size';
    
    if (!hasColor || !hasSize) {
      this.updateCTAButtons();
      return false;
    }

    // Only swap cart when BOTH color and size are selected
    await this.swapCartWithSelections();
    this.updateCTAButtons();
    return true;
  }

  async swapCartWithSelections() {
    console.log('Swapping cart for tier:', this.currentTier);
    
    // Build array of items to swap
    const itemsToSwap = [];
    
    for (let i = 1; i <= this.currentTier; i++) {
      const slotVariants = this.selectedVariants.get(i);
      
      // Skip slots that don't have BOTH color and size selected
      const hasValidColor = slotVariants?.color && slotVariants.color !== 'select-color';
      const hasValidSize = slotVariants?.size && slotVariants.size !== 'select-size';
      
      if (hasValidColor && hasValidSize) {
        // Use API values directly (they're already the correct format)
        const selectedAttributes = {
          color: slotVariants.color,
          size: slotVariants.size
        };

        const matchingPackage = window.next.getPackageByVariantSelection(
          this.productId,
          selectedAttributes
        );

        if (matchingPackage) {
          itemsToSwap.push({
            packageId: matchingPackage.ref_id,
            quantity: 1
          });
          console.log(`Found package for slot ${i}: ${slotVariants.color} ${slotVariants.size} - Package ID: ${matchingPackage.ref_id}`);
        } else {
          console.warn(`No matching package found for slot ${i}: ${slotVariants.color} ${slotVariants.size}`);
        }
      } else {
        console.log(`Slot ${i} incomplete - Color: ${slotVariants?.color || 'none'}, Size: ${slotVariants?.size || 'none'}`);
      }
    }

    // Use the new swapCart method for atomic cart replacement
    if (itemsToSwap.length > 0) {
      try {
        await window.next.swapCart(itemsToSwap);
        console.log(`Cart swapped successfully with ${itemsToSwap.length} items`);
      } catch (error) {
        console.error('Failed to swap cart:', error);
        // Fallback to old method if swapCart fails
        await this.reprocessAllSelections();
      }
    } else {
      // Don't clear cart if selections are incomplete
      console.log('No complete selections to add to cart');
    }
  }

  async reprocessAllSelections() {
    console.log('Reprocessing all selections (fallback method) for tier:', this.currentTier);
    
    // Clear and re-add all selected items
    await window.next.clearCart();
    
    for (let i = 1; i <= this.currentTier; i++) {
      const slotVariants = this.selectedVariants.get(i);
      if (slotVariants?.color && slotVariants?.size) {
        // Use API values directly
        const selectedAttributes = {
          color: slotVariants.color,
          size: slotVariants.size
        };

        const matchingPackage = window.next.getPackageByVariantSelection(
          this.productId,
          selectedAttributes
        );

        if (matchingPackage) {
          try {
            await window.next.addItem({
              packageId: matchingPackage.ref_id,
              quantity: 1
            });
            console.log(`Added to cart: Slot ${i} - ${slotVariants.color} ${slotVariants.size}`);
          } catch (error) {
            console.error(`Failed to add item for slot ${i}:`, error);
          }
        }
      }
    }
  }

  populateAllDropdowns() {
    if (!this.productId) return;
    
    const slots = document.querySelectorAll('[next-tier-slot]');
    slots.forEach(slot => {
      const slotNumber = parseInt(slot.getAttribute('next-tier-slot'));
      if (slotNumber <= this.currentTier) {
        this.populateSlotDropdowns(slot, slotNumber);
        this.updateSlotPricing(slotNumber);
      }
    });
  }

  populateSlotDropdowns(slot, slotNumber) {
    // Get available variant attributes from SDK
    const availableColors = window.next.getAvailableVariantAttributes(this.productId, 'color');
    const availableSizes = window.next.getAvailableVariantAttributes(this.productId, 'size');

    const colorDropdown = slot.querySelector('os-dropdown[next-variant-option="color"]');
    if (colorDropdown) {
      // Reset dropdown value first to clear any malformed state
      colorDropdown.removeAttribute('value');
      colorDropdown._value = null;
      this.populateColorDropdown(colorDropdown, availableColors);
    }

    const sizeDropdown = slot.querySelector('os-dropdown[next-variant-option="size"]');
    if (sizeDropdown) {
      // Reset dropdown value first to clear any malformed state
      sizeDropdown.removeAttribute('value');
      sizeDropdown._value = null;
      this.populateSizeDropdown(sizeDropdown, availableSizes);
    }
  }

  populateColorDropdown(dropdown, availableColors) {
    const menu = dropdown.querySelector('os-dropdown-menu');
    if (!menu) return;

    // Clear ALL existing items (including malformed ones)
    const existingItems = menu.querySelectorAll('os-dropdown-item');
    existingItems.forEach(item => item.remove());

    // Also remove any misplaced arrow elements
    const existingArrows = menu.querySelectorAll('.dropdown-arrow');
    existingArrows.forEach(arrow => arrow.remove());

    // Add color options - use the API value directly
    availableColors.forEach(color => {
      const item = document.createElement('os-dropdown-item');
      item.setAttribute('value', color); // Use API value as-is
      item.setAttribute('data-display-name', color);
      
      // For styling, create a normalized version
      const colorKey = color.toLowerCase().replace(/\s+/g, '-');
      
      item.innerHTML = `
        <div class="os-card__toggle-option os--distribute">
          <div class="os-card__variant-toggle-info">
            <div data-swatch="color" class="os-card__variant-swatch" style="background-color: ${colorConfig.styles[colorKey] || '#ccc'}"></div>
            <div class="os-card__variant-toggle-name">${color}</div>
          </div>
        </div>
      `;
      
      menu.appendChild(item);
    });
  }

  populateSizeDropdown(dropdown, availableSizes) {
    const menu = dropdown.querySelector('os-dropdown-menu');
    if (!menu) return;

    // Clear ALL existing items (including malformed ones)
    const existingItems = menu.querySelectorAll('os-dropdown-item');
    existingItems.forEach(item => item.remove());

    // Also remove any misplaced arrow elements
    const existingArrows = menu.querySelectorAll('.dropdown-arrow');
    existingArrows.forEach(arrow => arrow.remove());

    // Add size options - use the API value directly
    availableSizes.forEach(size => {
      const item = document.createElement('os-dropdown-item');
      item.setAttribute('value', size); // Use API value as-is
      item.setAttribute('data-display-name', size);
      
      item.innerHTML = `
        <div class="os-card__toggle-option os--distribute">
          <div class="os-card__variant-toggle-info">
            <div class="os-card__variant-toggle-name">${size}</div>
          </div>
        </div>
      `;
      
      menu.appendChild(item);
    });
  }

  updateSlotPricing(slotNumber) {
    const slot = document.querySelector(`[next-tier-slot="${slotNumber}"]`);
    if (!slot) return;

    const slotVariants = this.selectedVariants.get(slotNumber);
    
    if (!slotVariants?.color || !slotVariants?.size) {
      this.resetSlotPricing(slot);
      return;
    }

    // Use API values directly
    const selectedAttributes = {
      color: slotVariants.color,
      size: slotVariants.size
    };

    const matchingPackage = window.next.getPackageByVariantSelection(
      this.productId,
      selectedAttributes
    );

    if (matchingPackage) {
      const regPriceElement = slot.querySelector('[data-option="reg"]');
      const salePriceElement = slot.querySelector('[data-option="price"]');
      const savingPctElement = slot.querySelector('[data-option="savingPct"]');

      if (regPriceElement) {
        regPriceElement.textContent = `$${parseFloat(matchingPackage.price_retail).toFixed(2)}`;
      }

      if (salePriceElement) {
        salePriceElement.textContent = `$${parseFloat(matchingPackage.price).toFixed(2)}`;
      }

      if (savingPctElement && matchingPackage.price_retail && matchingPackage.price) {
        const regular = parseFloat(matchingPackage.price_retail);
        const sale = parseFloat(matchingPackage.price);
        const savingPct = Math.round(((regular - sale) / regular) * 100);
        savingPctElement.textContent = `${savingPct}%`;
      }
    }
  }

  resetSlotPricing(slot) {
    const regPriceElement = slot.querySelector('[data-option="reg"]');
    const salePriceElement = slot.querySelector('[data-option="price"]');
    const savingPctElement = slot.querySelector('[data-option="savingPct"]');

    if (regPriceElement) regPriceElement.textContent = '$XX.XX';
    if (salePriceElement) salePriceElement.textContent = '$XX.XX';
    if (savingPctElement) savingPctElement.textContent = 'XX%';
  }

  initializeColorSwatches() {
    const colorDropdowns = document.querySelectorAll('os-dropdown[next-variant-option="color"]');
    colorDropdowns.forEach(dropdown => {
      const currentValue = dropdown.getAttribute('value');
      if (currentValue && currentValue !== 'select-color') {
        this.updateColorSwatch(dropdown, currentValue);
      }
    });
  }

  initializeSlotImages() {
    const slots = document.querySelectorAll('[next-tier-slot]');
    slots.forEach(slot => {
      const slotNumber = parseInt(slot.getAttribute('next-tier-slot'));
      if (slotNumber <= this.currentTier) {
        const colorDropdown = slot.querySelector('os-dropdown[next-variant-option="color"]');
        if (colorDropdown) {
          const currentColor = colorDropdown.getAttribute('value');
          if (currentColor && currentColor !== 'select-color') {
            this.updateSlotImage(slot, currentColor);
          }
        }
      }
    });
  }

  async setInitialSelections() {
    // Set default selections for all active slots on page load
    for (let i = 1; i <= this.currentTier; i++) {
      const slot = document.querySelector(`[next-tier-slot="${i}"]`);
      if (!slot) continue;

      // Get available options from SDK
      const availableColors = window.next.getAvailableVariantAttributes(this.productId, 'color');
      const availableSizes = window.next.getAvailableVariantAttributes(this.productId, 'size');

      // Initialize slot variants if not exists
      if (!this.selectedVariants.has(i)) {
        this.selectedVariants.set(i, {});
      }
      const slotVariants = this.selectedVariants.get(i);

      // Set Obsidian Grey as default color
      const obsidianGrey = availableColors.find(color =>
        color.toLowerCase() === 'obsidian grey' ||
        color.toLowerCase() === 'obsidian gray'
      );
      const defaultColor = obsidianGrey || availableColors[0];

      if (defaultColor) {
        slotVariants.color = defaultColor;
        const colorDropdown = slot.querySelector('os-dropdown[next-variant-option="color"]');
        if (colorDropdown) {
          colorDropdown.value = defaultColor;
          this.updateColorSwatch(colorDropdown, defaultColor);
          this.updateSlotImage(slot, defaultColor);
        }
      }

      // Set King as default size
      const king = availableSizes.find(size =>
        size.toLowerCase() === 'king'
      );
      const defaultSize = king || availableSizes[0];

      if (defaultSize) {
        slotVariants.size = defaultSize;
        const sizeDropdown = slot.querySelector('os-dropdown[next-variant-option="size"]');
        if (sizeDropdown) {
          sizeDropdown.value = defaultSize;
        }
      }

      // Update pricing for this slot
      this.updateSlotPricing(i);
    }

    // Update cart with initial selections
    await this.swapCartWithSelections();
  }

  initializeDefaultState() {
    const defaultSelectedCard = document.querySelector('.os-card.next-selected');
    if (defaultSelectedCard) {
      const tier = parseInt(defaultSelectedCard.getAttribute('data-next-tier'));
      if (tier) {
        this.currentTier = tier;
        this.updateSlotStates(tier);
      }
    }
  }

  checkAllSelectionsComplete() {
    for (let i = 1; i <= this.currentTier; i++) {
      const slotVariants = this.selectedVariants.get(i);
      if (!slotVariants?.color || !slotVariants?.size || 
          slotVariants.color === 'select-color' || slotVariants.size === 'select-size') {
        return false;
      }
    }
    return true;
  }

  updateCTAButtons() {
    const allComplete = this.checkAllSelectionsComplete();
    const pendingCTA = document.querySelector('[data-cta="selection-pending"]');
    const completeCTA = document.querySelector('[data-cta="selection-complete"]');

    if (pendingCTA && completeCTA) {
      if (allComplete) {
        pendingCTA.classList.remove('active');
        completeCTA.classList.add('active');
      } else {
        pendingCTA.classList.add('active');
        completeCTA.classList.remove('active');
      }
    }
  }

  handleVerifyButtonClick() {
    const allComplete = this.checkAllSelectionsComplete();
    
    if (!allComplete) {
      // Find first incomplete slot and scroll to it
      for (let i = 1; i <= this.currentTier; i++) {
        const slotVariants = this.selectedVariants.get(i);
        if (!slotVariants?.color || !slotVariants?.size || 
            slotVariants.color === 'select-color' || slotVariants.size === 'select-size') {
          const slotElement = document.querySelector(`[next-tier-slot="${i}"]`);
          if (slotElement) {
            slotElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          return false;
        }
      }
    }
    
    this.updateCTAButtons();
    return allComplete;
  }
}

// Register custom elements
customElements.define('os-dropdown', OSDropdown);
customElements.define('os-dropdown-menu', OSDropdownMenu);
customElements.define('os-dropdown-item', OSDropdownItem);

// Initialize when SDK is ready
window.addEventListener('next:initialized', function() {
  console.log('SDK initialized, starting Grounded Footwear controller...');
  
  window.tierController = new TierController();
  
  // Setup verify button
  const verifyButton = document.querySelector('[os-checkout="verify-step"]');
  if (verifyButton) {
    verifyButton.addEventListener('click', e => {
      if (window.tierController) {
        const isComplete = window.tierController.handleVerifyButtonClick();
        if (!isComplete) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    });
  }

  // Exit intent setup with profile switching
  window.next.exitIntent({
    image: 'https://cdn.prod.website-files.com/6894e401ee6c8582aece90a0/68bed75cd9973567c4ab6a25_modal-bare-earth.png',
    action: async () => {
      // Apply the appropriate exit profile based on current tier
      const exitProfiles = {
        1: 'exit_10',
        2: 'exit_10_2pack',
        3: 'exit_10_3pack'
      };
      
      const profile = exitProfiles[window.tierController?.currentTier || 1];
      await window.next.setProfile(profile);
      console.log(`Exit ${window.tierController?.currentTier || 1}-pack discount applied`);
    },
  });
});

// Progress Bar Controller (keeping as is since it's UI-only)
class ProgressBarController {
  constructor() {
    this.progressItems = document.querySelectorAll('[data-progress]');
    this.sections = document.querySelectorAll('[data-progress-trigger]');
    this.currentActiveStep = null;
    this.completedSteps = new Set();
    this.init();
  }

  init() {
    this.resetAllSteps();
    this.setupScrollListener();
    setTimeout(() => {
      this.checkVisibility();
    }, 100);
  }

  resetAllSteps() {
    this.progressItems.forEach(item => {
      item.classList.remove('active', 'completed');
    });
    this.completedSteps.clear();
  }

  setupScrollListener() {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.checkVisibility();
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
  }

  checkVisibility() {
    const scrollTop = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const viewportCenter = scrollTop + windowHeight / 2;

    let activeSection = null;
    let activeSectionName = null;

    this.sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const sectionTop = scrollTop + rect.top;
      const sectionBottom = sectionTop + rect.height;

      if (viewportCenter >= sectionTop && viewportCenter <= sectionBottom) {
        activeSection = section;
        activeSectionName = section.getAttribute('data-progress-trigger');
      }
    });

    if (!activeSection && this.sections.length > 0) {
      const firstSection = this.sections[0];
      const firstSectionTop = scrollTop + firstSection.getBoundingClientRect().top;
      if (viewportCenter < firstSectionTop) {
        activeSectionName = firstSection.getAttribute('data-progress-trigger');
      }
    }

    this.markCompletedSteps(viewportCenter, scrollTop);

    if (activeSectionName !== this.currentActiveStep) {
      this.currentActiveStep = activeSectionName;
      this.updateProgressBar(activeSectionName);
    }
  }

  markCompletedSteps(viewportCenter, scrollTop) {
    this.sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const sectionTop = scrollTop + rect.top;
      const sectionBottom = sectionTop + rect.height;
      const stepName = section.getAttribute('data-progress-trigger');

      if (viewportCenter > sectionBottom) {
        this.completedSteps.add(stepName);
      }
    });
  }

  updateProgressBar(activeStepName) {
    this.progressItems.forEach(item => {
      const stepName = item.getAttribute('data-progress');
      item.classList.remove('active', 'completed');

      if (this.completedSteps.has(stepName)) {
        item.classList.add('completed');
      } else if (stepName === activeStepName) {
        item.classList.add('active');
      }
    });
  }
}

window.progressBarController = new ProgressBarController();