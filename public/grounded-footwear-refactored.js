// Grounded Footwear - Optimized Version
// Maintains exact same functionality with performance improvements

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
  profiles: {
    1: null,
    2: '2_pack',
    3: '3_pack'
  },
  exitProfiles: {
    1: 'exit_10',
    2: 'exit_10_2pack',
    3: 'exit_10_3pack'
  },
  autoSelectAvailable: true, // Enable auto-selection of available variants when OOS option is clicked
  // Display order for dropdowns (smallest to largest for sizes, preferred order for colors)
  displayOrder: {
    sizes: ['Twin', 'Single', 'Double', 'Queen', 'King', 'California King'],
    colors: ['Obsidian Grey', 'Chateau Ivory', 'Scribe Blue', 'Verdant Sage']
  },
  sizePreferenceOrder: [ // Order of size preference for auto-selection (closest match first)
    ['King', 'California King', 'Queen', 'Double', 'Single', 'Twin'],
    ['California King', 'King', 'Queen', 'Double', 'Single', 'Twin'],
    ['Queen', 'King', 'California King', 'Double', 'Single', 'Twin'],
    ['Double', 'Queen', 'King', 'Single', 'Twin', 'California King'],
    ['Single', 'Twin', 'Double', 'Queen', 'King', 'California King'],
    ['Twin', 'Single', 'Double', 'Queen', 'King', 'California King']
  ]
};

// Optimized base element class
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
    this._abortController?.abort();
    this._abortController = null;
    this._mounted = false;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.onAttributeChange?.(name, oldValue, newValue);
    }
  }

  mount() {}
  onAttributeChange() {}
}

// Optimized dropdown with reduced DOM queries
const { computePosition, flip, offset, autoUpdate, arrow } = window.FloatingUIDOM;

class OSDropdown extends ConversionElement {
  static observedAttributes = ['value', 'name', 'disabled', 'animate-selection', 'animation-duration'];
  static openDropdowns = new Set();

  constructor() {
    super();
    this._elements = {}; // Cache DOM elements
    this._value = null;
    this.cleanupAutoUpdate = null;
  }

  mount() {
    this._cacheElements();
    if (!this._elements.toggle || !this._elements.menu) return;
    
    this._setupEventListeners();
    this._initializeState();
    this._setupAccessibility();
  }

  _cacheElements() {
    this._elements.toggle = this.querySelector('button, [role="button"]');
    this._elements.menu = this.querySelector('os-dropdown-menu') || this._createMenuFromLegacy();
    this._elements.arrow = this._elements.menu?.querySelector('.dropdown-arrow') || this._createArrow();
  }

  _createMenuFromLegacy() {
    const legacyMenu = this.querySelector('[os-element="dropdown-menu"]');
    if (!legacyMenu) return null;
    
    const menu = document.createElement('os-dropdown-menu');
    menu.append(...legacyMenu.childNodes);
    legacyMenu.replaceWith(menu);
    return menu;
  }

  _createArrow() {
    if (!this._elements.menu) return null;
    const arrow = document.createElement('div');
    arrow.className = 'dropdown-arrow';
    this._elements.menu.appendChild(arrow);
    return arrow;
  }

  _setupEventListeners() {
    const { toggle } = this._elements;
    
    toggle.addEventListener('click', this._handleToggleClick.bind(this));
    toggle.addEventListener('keydown', this._handleKeyboard.bind(this));
    this.addEventListener('dropdown-item-select', this._handleItemSelect.bind(this));
    document.addEventListener('click', this._handleOutsideClick.bind(this));
  }

  _handleToggleClick(e) {
    e.stopPropagation();
    this.toggleDropdown();
  }

  _handleOutsideClick(e) {
    if (!this.contains(e.target) && this.isOpen) {
      this.closeDropdown();
    }
  }

  _handleItemSelect(e) {
    const item = e.detail.item;
    this._updateValue(item.value);
    this._updateSelection(item);
    this._updateToggleContent();
    this.closeDropdown();
    this._dispatchEvents(item);
  }

  _updateValue(value) {
    this._value = value;
    this.setAttribute('value', value || '');
  }

  _updateSelection(selectedItem) {
    this.querySelectorAll('os-dropdown-item').forEach(item => {
      const isSelected = item === selectedItem;
      item.classList.toggle('selected', isSelected);
      item.toggleAttribute('selected', isSelected);
      item.selected = isSelected;
    });
  }

  _dispatchEvents(item) {
    this.dispatchEvent(new Event('change', { bubbles: true }));
    this.dispatchEvent(new CustomEvent('variantSelected', {
      detail: { value: item.value, item, component: this, type: 'dropdown' },
      bubbles: true,
    }));
  }

  _initializeState() {
    const value = this.getAttribute('value');
    const selectedItem = this.querySelector('os-dropdown-item[selected]');
    
    if (value) {
      this.value = value;
    } else if (selectedItem) {
      this._value = selectedItem.value;
      this._updateToggleContent();
    }
  }

  _setupAccessibility() {
    const { toggle } = this._elements;
    toggle.setAttribute('role', 'button');
    toggle.setAttribute('aria-haspopup', 'listbox');
    toggle.setAttribute('aria-expanded', 'false');
  }

  async _updateDropdownPosition() {
    if (!this.isOpen) return;

    const { toggle, menu, arrow } = this._elements;
    const middleware = [
      offset(8),
      flip({ fallbackPlacements: ['top-start', 'bottom-end', 'top-end'] }),
    ];

    if (arrow && window.FloatingUIDOM.arrow) {
      middleware.push(window.FloatingUIDOM.arrow({ element: arrow }));
    }

    const { x, y, placement, middlewareData } = await computePosition(toggle, menu, {
      placement: 'bottom-start',
      middleware,
    });

    Object.assign(menu.style, { left: `${x}px`, top: `${y}px` });
    
    // Update placement classes
    menu.className = menu.className.replace(/placement-\w+/g, '') + ` placement-${placement.split('-')[0]}`;

    // Update arrow position
    if (arrow && middlewareData.arrow) {
      this._updateArrowPosition(arrow, middlewareData.arrow, placement);
    }
  }

  _updateArrowPosition(arrow, arrowData, placement) {
    const { x: arrowX, y: arrowY } = arrowData;
    const side = placement.split('-')[0];
    const oppositeSide = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' }[side];

    Object.assign(arrow.style, {
      left: arrowX != null ? `${arrowX}px` : '',
      top: arrowY != null ? `${arrowY}px` : '',
      right: '', bottom: '',
      [oppositeSide]: '-4px',
    });
  }

  toggleDropdown() {
    this.isOpen ? this.closeDropdown() : this.openDropdown();
  }

  async openDropdown() {
    OSDropdown.closeAllDropdowns();
    
    const { toggle, menu } = this._elements;
    this.setAttribute('open', '');
    toggle.classList.add('active');
    menu.classList.add('show');
    toggle.setAttribute('aria-expanded', 'true');

    await this._updateDropdownPosition();
    this.cleanupAutoUpdate = autoUpdate(toggle, menu, () => this._updateDropdownPosition());
    
    OSDropdown.openDropdowns.add(this);
    this.querySelector('os-dropdown-item:not([disabled])')?.focus();
  }

  closeDropdown() {
    const { toggle, menu, arrow } = this._elements;
    
    this.removeAttribute('open');
    toggle.classList.remove('active');
    menu.classList.remove('show');
    toggle.setAttribute('aria-expanded', 'false');

    this.cleanupAutoUpdate?.();
    this.cleanupAutoUpdate = null;

    menu.className = menu.className.replace(/placement-\w+/g, '');
    if (arrow) Object.assign(arrow.style, { left: '', top: '', right: '', bottom: '' });

    OSDropdown.openDropdowns.delete(this);
    toggle.focus();
  }

  _updateToggleContent() {
    if (!this._elements.toggle || this._value === null) return;

    const selectedItem = this.querySelector(`os-dropdown-item[value="${this._value}"]`);
    const itemContent = selectedItem?.querySelector('.os-card__toggle-option');
    const existingContent = this._elements.toggle.querySelector('.os-card__toggle-option');

    if (existingContent && itemContent) {
      const newContent = itemContent.cloneNode(true);
      newContent.classList.remove('os--distribute');
      newContent.classList.add('os--main');
      existingContent.replaceWith(newContent);
    }
  }

  _handleKeyboard(e) {
    const actions = {
      'Enter': () => !this.isOpen && this.openDropdown(),
      ' ': () => !this.isOpen && this.openDropdown(),
      'Escape': () => this.isOpen && this.closeDropdown(),
      'ArrowDown': () => this.isOpen && this._navigateItems(1),
      'ArrowUp': () => this.isOpen && this._navigateItems(-1),
    };

    const action = actions[e.key];
    if (action) {
      e.preventDefault();
      action();
    }
  }

  _navigateItems(direction) {
    const items = Array.from(this.querySelectorAll('os-dropdown-item:not([disabled])'));
    const currentIndex = items.findIndex(item => item.selected);
    const newIndex = Math.max(0, Math.min(items.length - 1, currentIndex + direction));

    if (newIndex !== currentIndex && items[newIndex]) {
      items[newIndex].focus();
      this._handleItemSelect({ detail: { item: items[newIndex] } });
    }
  }

  static closeAllDropdowns() {
    OSDropdown.openDropdowns.forEach(dropdown => dropdown.closeDropdown());
  }

  get value() { return this._value; }
  set value(val) {
    this._updateValue(val);
    this._updateSelection(this.querySelector(`os-dropdown-item[value="${val}"]`));
    this._updateToggleContent();
  }

  get isOpen() { return this.hasAttribute('open'); }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.isOpen) this.closeDropdown();
    this.cleanupAutoUpdate?.();
    OSDropdown.openDropdowns.delete(this);
  }
}

// Simplified dropdown menu and item classes
class OSDropdownMenu extends ConversionElement {
  mount() {
    this.setAttribute('role', 'listbox');
    this.classList.add('os-dropdown-menu');
    Object.assign(this.style, { position: 'absolute', zIndex: '1000' });
  }
}

class OSDropdownItem extends ConversionElement {
  static observedAttributes = ['value', 'selected', 'disabled'];

  constructor() {
    super();
    this._selected = false;
    this._value = '';
  }

  mount() {
    this.setAttribute('role', 'option');
    this.setAttribute('tabindex', '-1');
    
    this.addEventListener('click', () => !this.disabled && this._select());
    this.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && !this.disabled) {
        e.preventDefault();
        this._select();
      }
    });

    this._value = this.getAttribute('value') || this.getAttribute('data-value') || '';
    if (this.hasAttribute('selected')) {
      this._selected = true;
      this.setAttribute('aria-selected', 'true');
    }
  }

  _select() {
    this.closest('os-dropdown')?.dispatchEvent(
      new CustomEvent('dropdown-item-select', {
        detail: { item: this },
        bubbles: true,
      })
    );
  }

  get value() { return this._value; }
  set value(val) {
    this._value = val;
    this.setAttribute('value', val);
  }

  get selected() { return this._selected; }
  set selected(val) {
    this._selected = val;
    this.setAttribute('aria-selected', String(val));
    this.classList.toggle('selected', val);
    this.toggleAttribute('selected', val);
  }

  get disabled() { return this.hasAttribute('disabled'); }

  onAttributeChange(name, _oldValue, newValue) {
    switch (name) {
      case 'value': this._value = newValue || ''; break;
      case 'selected': this.selected = newValue !== null; break;
      case 'disabled': 
        this.setAttribute('aria-disabled', String(newValue !== null));
        this.classList.toggle('disabled', newValue !== null);
        break;
    }
  }
}

// Optimized Tier Controller with reduced redundancy
class TierController {
  constructor() {
    this.currentTier = 1;
    this.selectedVariants = new Map();
    this.productId = null;
    this.baseProductId = null; // Store original product ID
    this.currentProfile = null;
    this._cachedElements = new Map();

    this.init();
  }

  async init() {
    await this._waitForSDK();
    this._getProductIdFromCampaign();
    this._bindEvents();
    this._initializeDefaultState();
    this._populateAllDropdowns();
    await this._setInitialSelections();
    this._initializeUI();
    this._setupProfileListeners();
    this._updateCTAButtons();
  }

  _waitForSDK() {
    return new Promise(resolve => {
      const check = () => {
        window.next?.getCampaignData ? resolve() : setTimeout(check, 100);
      };
      check();
    });
  }

  _getProductIdFromCampaign() {
    const campaign = window.next.getCampaignData();
    this.productId = campaign?.packages?.[0]?.product_id;

    if (!this.productId) {
      try {
        const cache = JSON.parse(sessionStorage.getItem('next-campaign-cache') || '{}');
        this.productId = cache.campaign?.packages?.[0]?.product_id;
      } catch (error) {
        console.error('Failed to get product ID from cache:', error);
      }
    }

    // Store the base product ID on first load (before any profile changes)
    if (!this.baseProductId && this.productId) {
      this.baseProductId = this.productId;
    }

    if (!this.productId) {
      console.error('Warning: Product ID not found. Some features may not work correctly.');
    }
  }

  _bindEvents() {
    // Tier selection
    document.querySelectorAll('[data-next-tier]').forEach(card => {
      card.addEventListener('click', () => {
        const tier = parseInt(card.getAttribute('data-next-tier'));
        this.selectTier(tier);
      });
    });

    // Variant selection
    document.addEventListener('variantSelected', e => this._handleVariantSelection(e.detail));
  }

  async selectTier(tierNumber) {
    if (tierNumber === this.currentTier) return;

    const previousTier = this.currentTier;
    this.currentTier = tierNumber;
    
    this._updateTierCardStates(tierNumber);
    this._updateSlotStates(tierNumber);

    const currentSelections = new Map(this.selectedVariants);
    await this._applyTierProfile(tierNumber);
    await new Promise(resolve => setTimeout(resolve, 300));

    // Restore/auto-select variants
    for (let i = 1; i <= tierNumber; i++) {
      if (currentSelections.has(i)) {
        // Restore previous selection for this slot
        this.selectedVariants.set(i, currentSelections.get(i));
      } else if (i > previousTier) {
        // Only auto-select for NEW slots that appear when increasing tier
        await this._autoSelectFirstOptions(i);
      }
    }

    await this._swapCartWithSelections();
    this._updateCTAButtons();
  }

  async _applyTierProfile(tierNumber) {
    const profileKey = this.currentProfile?.includes('exit_10') ? 'exitProfiles' : 'profiles';
    const profile = CONFIG[profileKey][tierNumber];
    
    if (profile) {
      await window.next.setProfile(profile);
    } else {
      await window.next.revertProfile();
    }
  }

  _updateTierCardStates(selectedTier) {
    document.querySelectorAll('[data-next-tier]').forEach(card => {
      const tier = parseInt(card.getAttribute('data-next-tier'));
      const isSelected = tier === selectedTier;
      
      card.classList.toggle('next-selected', isSelected);
      const radioButton = card.querySelector('.radio-style-1');
      radioButton?.setAttribute('data-selected', String(isSelected));
    });
  }

  _updateSlotStates(tierNumber) {
    document.querySelectorAll('[next-tier-slot]').forEach(slot => {
      const slotNumber = parseInt(slot.getAttribute('next-tier-slot'));
      const isActive = slotNumber <= tierNumber;
      
      slot.classList.toggle('active', isActive);
      slot.style.display = isActive ? 'flex' : 'none';
    });
  }

  async _autoSelectFirstOptions(slotNumber) {
    const slot = document.querySelector(`[next-tier-slot="${slotNumber}"]`);
    if (!slot) return;

    // Use base product for slot 1, current product for others
    const productIdToUse = (slotNumber === 1 && this.baseProductId) ? this.baseProductId : this.productId;

    const availableColors = window.next.getAvailableVariantAttributes(productIdToUse, 'color');
    const availableSizes = window.next.getAvailableVariantAttributes(productIdToUse, 'size');

    if (!this.selectedVariants.has(slotNumber)) {
      this.selectedVariants.set(slotNumber, {});
    }
    const slotVariants = this.selectedVariants.get(slotNumber);

    // Auto-select Obsidian Grey or first color
    if (availableColors.length > 0 && !slotVariants.color) {
      const selectedColor = availableColors.find(color => 
        color.toLowerCase().includes('obsidian')
      ) || availableColors[0];
      
      slotVariants.color = selectedColor;
      this._updateDropdownValue(slot, 'color', selectedColor);
      this._updateColorSwatch(slot.querySelector('os-dropdown[next-variant-option="color"]'), selectedColor);
      this._updateSlotImage(slot, selectedColor);
    }

    // Auto-select King or first size
    if (availableSizes.length > 0 && !slotVariants.size) {
      const selectedSize = availableSizes.find(size =>
        size.toLowerCase() === 'king'
      ) || availableSizes[0];

      slotVariants.size = selectedSize;
      this._updateDropdownValue(slot, 'size', selectedSize);
    }

    this._updateSlotPricing(slotNumber);

    // Update stock status for both dropdowns after auto-selection
    if (slotVariants.color && slotVariants.size) {
      this._updateDropdownStockStatus(slot, 'color', slotNumber);
      this._updateDropdownStockStatus(slot, 'size', slotNumber);
    }
  }

  _updateDropdownValue(slot, variantType, value) {
    const dropdown = slot.querySelector(`os-dropdown[next-variant-option="${variantType}"]`);
    if (dropdown) dropdown.value = value;
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
    const previousValue = slotVariants[variantType];
    slotVariants[variantType] = value;

    // Check if the selected variant combination is out of stock
    if (CONFIG.autoSelectAvailable && slotVariants.color && slotVariants.size) {
      const isOOS = this._isCompleteVariantOutOfStock(slotNumber, slotVariants);

      if (isOOS) {
        // Try to find an available alternative
        const alternative = this._findAvailableAlternative(slotNumber, variantType, value, previousValue);

        if (alternative) {
          // Auto-select the available alternative
          console.log(`Auto-selecting available ${variantType === 'color' ? 'size' : 'color'}: ${alternative}`);
          const otherType = variantType === 'color' ? 'size' : 'color';
          slotVariants[otherType] = alternative;
          this._updateDropdownValue(slot, otherType, alternative);

          // Update UI elements if we auto-selected a different color
          if (otherType === 'color') {
            const colorDropdown = slot.querySelector(`os-dropdown[next-variant-option="color"]`);
            this._updateColorSwatch(colorDropdown, alternative);
            this._updateSlotImage(slot, alternative);
          }

          // Show a subtle notification (optional - you can implement a toast notification here)
          this._notifyAutoSelection(variantType, value, otherType, alternative);
        }
      }
    }

    if (variantType === 'color') {
      this._updateColorSwatch(component, value);
      this._updateSlotImage(slot, value);
    } else if (variantType === 'size') {
      // Nothing specific needed here since color updates happen after auto-selection
    }

    // Always update both dropdowns' stock status after any change
    // This ensures correct OOS marking after auto-selection
    this._updateDropdownStockStatus(slot, 'color', slotNumber);
    this._updateDropdownStockStatus(slot, 'size', slotNumber);

    this._updateSlotPricing(slotNumber);
    this._checkCompleteSelection(slotNumber);
  }

  _updateColorSwatch(dropdown, colorValue) {
    const swatch = dropdown.querySelector('.os-card__variant-swatch');
    if (swatch && colorValue) {
      const colorKey = colorValue.toLowerCase().replace(/\s+/g, '-');
      swatch.className = 'os-card__variant-swatch';
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
        Object.assign(imageElement.style, { transition: 'opacity 0.3s ease-in-out', opacity: '0.5' });
        imageElement.src = CONFIG.colors.images[colorKey];
        imageElement.onload = () => imageElement.style.opacity = '1';
      }
    }
  }

  async _checkCompleteSelection(slotNumber) {
    const slotVariants = this.selectedVariants.get(slotNumber);
    const hasColor = slotVariants?.color && slotVariants.color !== 'select-color';
    const hasSize = slotVariants?.size && slotVariants.size !== 'select-size';
    
    if (hasColor && hasSize) {
      await this._swapCartWithSelections();
    }
    this._updateCTAButtons();
    return hasColor && hasSize;
  }

  async _swapCartWithSelections() {
    const itemsToSwap = [];

    for (let i = 1; i <= this.currentTier; i++) {
      const slotVariants = this.selectedVariants.get(i);
      const hasValidColor = slotVariants?.color && slotVariants.color !== 'select-color';
      const hasValidSize = slotVariants?.size && slotVariants.size !== 'select-size';

      if (hasValidColor && hasValidSize) {
        // Use base product ID for slot 1 to ensure consistent cart items
        const productIdToUse = (i === 1 && this.baseProductId) ? this.baseProductId : this.productId;

        const matchingPackage = window.next.getPackageByVariantSelection(
          productIdToUse,
          { color: slotVariants.color, size: slotVariants.size }
        );

        if (matchingPackage) {
          console.log(`Slot ${i} - Found package:`, matchingPackage);
          console.log(`Adding to cart: Package ID ${matchingPackage.ref_id} - ${slotVariants.color} / ${slotVariants.size}`);
          itemsToSwap.push({ packageId: matchingPackage.ref_id, quantity: 1 });
        } else {
          console.log(`Slot ${i} - No package found for:`, slotVariants.color, slotVariants.size);
        }
      }
    }

    if (itemsToSwap.length > 0) {
      try {
        await window.next.swapCart(itemsToSwap);
      } catch (error) {
        console.error('Failed to swap cart:', error);
        await this._reprocessAllSelections();
      }
    }
  }

  async _reprocessAllSelections() {
    await window.next.clearCart();
    
    for (let i = 1; i <= this.currentTier; i++) {
      const slotVariants = this.selectedVariants.get(i);
      if (slotVariants?.color && slotVariants?.size) {
        const matchingPackage = window.next.getPackageByVariantSelection(
          this.productId,
          { color: slotVariants.color, size: slotVariants.size }
        );

        if (matchingPackage) {
          try {
            await window.next.addItem({ packageId: matchingPackage.ref_id, quantity: 1 });
          } catch (error) {
            console.error(`Failed to add item for slot ${i}:`, error);
          }
        }
      }
    }
  }

  _populateAllDropdowns() {
    if (!this.productId) return;
    
    document.querySelectorAll('[next-tier-slot]').forEach(slot => {
      const slotNumber = parseInt(slot.getAttribute('next-tier-slot'));
      if (slotNumber <= this.currentTier) {
        this._populateSlotDropdowns(slot, slotNumber);
        this._updateSlotPricing(slotNumber);
      }
    });
  }

  _populateSlotDropdowns(slot, slotNumber) {
    // Always use base product ID for slot 1 to maintain consistency
    const productIdToUse = (slotNumber === 1 && this.baseProductId) ? this.baseProductId : this.productId;

    const availableColors = window.next.getAvailableVariantAttributes(productIdToUse, 'color');
    const availableSizes = window.next.getAvailableVariantAttributes(productIdToUse, 'size');

    this._populateDropdown(slot, 'color', availableColors, this._createColorItem.bind(this));
    this._populateDropdown(slot, 'size', availableSizes, this._createSizeItem.bind(this));
  }

  _populateDropdown(slot, variantType, options, itemCreator) {
    const dropdown = slot.querySelector(`os-dropdown[next-variant-option="${variantType}"]`);
    const menu = dropdown?.querySelector('os-dropdown-menu');
    if (!menu) return;

    const slotNumber = parseInt(slot.getAttribute('next-tier-slot'));

    // Clear existing items
    menu.querySelectorAll('os-dropdown-item, .dropdown-arrow').forEach(el => el.remove());

    // Sort options according to display order configuration
    const sortedOptions = this._sortOptionsByDisplayOrder(options, variantType);

    // Add new options in sorted order
    sortedOptions.forEach(option => {
      menu.appendChild(itemCreator(option, slotNumber));
    });
  }

  _sortOptionsByDisplayOrder(options, variantType) {
    const orderConfig = CONFIG.displayOrder[variantType === 'color' ? 'colors' : 'sizes'];

    if (!orderConfig || orderConfig.length === 0) {
      return options; // Return unsorted if no order config
    }

    // Create a map for order indices (case-insensitive)
    const orderMap = new Map();
    orderConfig.forEach((item, index) => {
      orderMap.set(item.toLowerCase(), index);
    });

    // Sort options based on the order map
    return [...options].sort((a, b) => {
      const aIndex = orderMap.get(a.toLowerCase());
      const bIndex = orderMap.get(b.toLowerCase());

      // If both are in the order config, sort by their index
      if (aIndex !== undefined && bIndex !== undefined) {
        return aIndex - bIndex;
      }

      // If only one is in the order config, it comes first
      if (aIndex !== undefined) return -1;
      if (bIndex !== undefined) return 1;

      // If neither is in the order config, maintain original order
      return 0;
    });
  }

  _createColorItem(color, slotNumber) {
    const item = document.createElement('os-dropdown-item');
    const colorKey = color.toLowerCase().replace(/\s+/g, '-');

    item.setAttribute('value', color);

    // Check if this color option is out of stock for the current slot
    const isOutOfStock = this._isVariantOutOfStock(slotNumber, { color });
    if (isOutOfStock) {
      item.classList.add('next-oos');
    }

    item.innerHTML = `
      <div class="os-card__toggle-option os--distribute">
        <div class="os-card__variant-toggle-info">
          <div data-swatch="color" class="os-card__variant-swatch" style="background-color: ${CONFIG.colors.styles[colorKey] || '#ccc'}"></div>
          <div class="os-card__variant-toggle-name">${color}</div>
        </div>
      </div>
    `;

    return item;
  }

  _createSizeItem(size, slotNumber) {
    const item = document.createElement('os-dropdown-item');
    item.setAttribute('value', size);

    // Check if this size option is out of stock for the current slot
    const isOutOfStock = this._isVariantOutOfStock(slotNumber, { size });
    if (isOutOfStock) {
      item.classList.add('next-oos');
    }

    item.innerHTML = `
      <div class="os-card__toggle-option os--distribute">
        <div class="os-card__variant-toggle-info">
          <div class="os-card__variant-toggle-name">${size}</div>
        </div>
      </div>
    `;

    return item;
  }

  _updateSlotPricing(slotNumber) {
    const slot = document.querySelector(`[next-tier-slot="${slotNumber}"]`);
    if (!slot) return;

    const slotVariants = this.selectedVariants.get(slotNumber);

    if (!slotVariants?.color || !slotVariants?.size) {
      this._resetSlotPricing(slot);
      return;
    }

    // Always use base product ID for slot 1 to maintain consistent pricing
    const productIdToUse = (slotNumber === 1 && this.baseProductId) ? this.baseProductId : this.productId;

    const matchingPackage = window.next.getPackageByVariantSelection(
      productIdToUse,
      { color: slotVariants.color, size: slotVariants.size }
    );

    if (matchingPackage) {
      this._setPricing(slot, matchingPackage);
    }
  }

  _setPricing(slot, pkg) {
    const elements = {
      reg: slot.querySelector('[data-option="reg"]'),
      price: slot.querySelector('[data-option="price"]'),
      savingPct: slot.querySelector('[data-option="savingPct"]')
    };

    if (elements.reg) elements.reg.textContent = `$${parseFloat(pkg.price_retail).toFixed(2)}`;
    if (elements.price) elements.price.textContent = `$${parseFloat(pkg.price).toFixed(2)}`;
    
    if (elements.savingPct && pkg.price_retail && pkg.price) {
      const savingPct = Math.round(((pkg.price_retail - pkg.price) / pkg.price_retail) * 100);
      elements.savingPct.textContent = `${savingPct}%`;
    }
  }

  _resetSlotPricing(slot) {
    const selectors = ['[data-option="reg"]', '[data-option="price"]', '[data-option="savingPct"]'];
    const values = ['$XX.XX', '$XX.XX', 'XX%'];
    
    selectors.forEach((selector, i) => {
      const element = slot.querySelector(selector);
      if (element) element.textContent = values[i];
    });
  }

  _initializeUI() {
    this._initializeColorSwatches();
    this._initializeSlotImages();
  }

  _initializeColorSwatches() {
    document.querySelectorAll('os-dropdown[next-variant-option="color"]').forEach(dropdown => {
      const currentValue = dropdown.getAttribute('value');
      if (currentValue && currentValue !== 'select-color') {
        this._updateColorSwatch(dropdown, currentValue);
      }
    });
  }

  _initializeSlotImages() {
    document.querySelectorAll('[next-tier-slot]').forEach(slot => {
      const slotNumber = parseInt(slot.getAttribute('next-tier-slot'));
      if (slotNumber <= this.currentTier) {
        const colorDropdown = slot.querySelector('os-dropdown[next-variant-option="color"]');
        const currentColor = colorDropdown?.getAttribute('value');
        if (currentColor && currentColor !== 'select-color') {
          this._updateSlotImage(slot, currentColor);
        }
      }
    });
  }

  async _setInitialSelections() {
    const availableColors = window.next.getAvailableVariantAttributes(this.productId, 'color');
    const availableSizes = window.next.getAvailableVariantAttributes(this.productId, 'size');

    console.log('Available colors:', availableColors);
    console.log('Available sizes:', availableSizes);

    const defaultColor = availableColors.find(color =>
      color.toLowerCase().includes('obsidian')
    ) || availableColors[0];

    const defaultSize = availableSizes.find(size =>
      size.toLowerCase() === 'king'
    ) || availableSizes[0];

    console.log('Default selections:', { defaultColor, defaultSize });

    for (let i = 1; i <= this.currentTier; i++) {
      const slot = document.querySelector(`[next-tier-slot="${i}"]`);
      if (!slot) continue;

      if (!this.selectedVariants.has(i)) {
        this.selectedVariants.set(i, {});
      }
      const slotVariants = this.selectedVariants.get(i);

      if (defaultColor) {
        slotVariants.color = defaultColor;
        this._updateDropdownValue(slot, 'color', defaultColor);
        this._updateColorSwatch(slot.querySelector('os-dropdown[next-variant-option="color"]'), defaultColor);
        this._updateSlotImage(slot, defaultColor);
      }

      if (defaultSize) {
        slotVariants.size = defaultSize;
        this._updateDropdownValue(slot, 'size', defaultSize);
      }

      this._updateSlotPricing(i);

      // Update stock status for both dropdowns after initial selections
      if (defaultColor && defaultSize) {
        this._updateDropdownStockStatus(slot, 'color', i);
        this._updateDropdownStockStatus(slot, 'size', i);
      }
    }

    await this._swapCartWithSelections();
  }

  _initializeDefaultState() {
    const defaultSelectedCard = document.querySelector('.os-card.next-selected');
    if (defaultSelectedCard) {
      const tier = parseInt(defaultSelectedCard.getAttribute('data-next-tier'));
      if (tier) {
        this.currentTier = tier;
        this._updateSlotStates(tier);
      }
    }
  }

  _setupProfileListeners() {
    window.next.on('profile:applied', (data) => {
      this.currentProfile = data.profileId;
      this._handleProfileChange();
    });

    window.next.on('profile:reverted', () => {
      this.currentProfile = null;
      this._handleProfileChange();
    });
  }

  _handleProfileChange() {
    // Update the current product ID from campaign
    this._getProductIdFromCampaign();

    // Only repopulate dropdowns if we're on tier 2 or 3
    // For tier 1, keep using the base product to maintain consistency
    if (this.currentTier > 1) {
      this._populateAllDropdowns();
      for (let i = 1; i <= this.currentTier; i++) {
        this._updateSlotPricing(i);
      }
    }
  }

  _checkAllSelectionsComplete() {
    for (let i = 1; i <= this.currentTier; i++) {
      const slotVariants = this.selectedVariants.get(i);
      if (!slotVariants?.color || !slotVariants?.size || 
          slotVariants.color === 'select-color' || slotVariants.size === 'select-size') {
        return false;
      }
    }
    return true;
  }

  _updateDropdownStockStatus(slot, variantType, slotNumber) {
    const dropdown = slot.querySelector(`os-dropdown[next-variant-option="${variantType}"]`);
    if (!dropdown) return;

    const slotVariants = this.selectedVariants.get(slotNumber) || {};
    const productIdToUse = (slotNumber === 1 && this.baseProductId) ? this.baseProductId : this.productId;

    const items = dropdown.querySelectorAll('os-dropdown-item');
    items.forEach(item => {
      const value = item.getAttribute('value');

      // Check stock for this specific option with the current selection of the other variant type
      let variantToCheck;
      if (variantType === 'color') {
        // Checking color options - use current size
        variantToCheck = { color: value, size: slotVariants.size };
      } else {
        // Checking size options - use current color
        variantToCheck = { color: slotVariants.color, size: value };
      }

      // Only check if we have both attributes
      if (variantToCheck.color && variantToCheck.size &&
          variantToCheck.color !== 'select-color' && variantToCheck.size !== 'select-size') {

        const matchingPackage = window.next.getPackageByVariantSelection(productIdToUse, variantToCheck);
        const isOutOfStock = !matchingPackage ||
                            matchingPackage.product_inventory_availability === 'out_of_stock' ||
                            matchingPackage.product_purchase_availability === 'unavailable';

        if (isOutOfStock) {
          item.classList.add('next-oos');
        } else {
          item.classList.remove('next-oos');
        }
      } else {
        // Can't determine stock without both selections
        item.classList.remove('next-oos');
      }
    });
  }

  _isVariantOutOfStock(slotNumber, partialVariant) {
    // Get the current selections for this slot
    const slotVariants = this.selectedVariants.get(slotNumber) || {};

    // Merge partial variant with current selections
    const fullVariant = {
      color: partialVariant.color || slotVariants.color,
      size: partialVariant.size || slotVariants.size
    };

    // If we don't have both color and size, we can't determine stock status
    if (!fullVariant.color || !fullVariant.size ||
        fullVariant.color === 'select-color' || fullVariant.size === 'select-size') {
      return false;
    }

    // Use base product ID for slot 1
    const productIdToUse = (slotNumber === 1 && this.baseProductId) ? this.baseProductId : this.productId;

    // Get the package for this variant combination
    const matchingPackage = window.next.getPackageByVariantSelection(
      productIdToUse,
      fullVariant
    );

    // Check if package exists and its stock status
    if (matchingPackage) {
      const isOutOfStock = matchingPackage.product_inventory_availability === 'out_of_stock' ||
                          matchingPackage.product_purchase_availability === 'unavailable';
      return isOutOfStock;
    }

    return false;
  }

  _isCompleteVariantOutOfStock(slotNumber, fullVariant) {
    // Check if a complete variant (both color and size) is out of stock
    if (!fullVariant.color || !fullVariant.size ||
        fullVariant.color === 'select-color' || fullVariant.size === 'select-size') {
      return false;
    }

    const productIdToUse = (slotNumber === 1 && this.baseProductId) ? this.baseProductId : this.productId;
    const matchingPackage = window.next.getPackageByVariantSelection(productIdToUse, fullVariant);

    if (matchingPackage) {
      return matchingPackage.product_inventory_availability === 'out_of_stock' ||
             matchingPackage.product_purchase_availability === 'unavailable';
    }

    return false;
  }

  _findAvailableAlternative(slotNumber, changedType, newValue, previousValue) {
    const productIdToUse = (slotNumber === 1 && this.baseProductId) ? this.baseProductId : this.productId;
    const slotVariants = this.selectedVariants.get(slotNumber);

    if (changedType === 'color') {
      // User selected a new color, find an available size
      const availableSizes = window.next.getAvailableVariantAttributes(productIdToUse, 'size');
      const currentSize = slotVariants.size;

      // Get the preferred size order based on current size
      const sizeOrder = this._getSizePreferenceOrder(currentSize, availableSizes);

      // Find first available size in preference order
      for (const size of sizeOrder) {
        if (!this._isCompleteVariantOutOfStock(slotNumber, { color: newValue, size })) {
          return size;
        }
      }
    } else if (changedType === 'size') {
      // User selected a new size, find an available color
      const availableColors = window.next.getAvailableVariantAttributes(productIdToUse, 'color');
      const currentColor = slotVariants.color;

      // Try to keep the current color if it's available with the new size
      if (!this._isCompleteVariantOutOfStock(slotNumber, { color: currentColor, size: newValue })) {
        return currentColor;
      }

      // Otherwise find first available color
      for (const color of availableColors) {
        if (!this._isCompleteVariantOutOfStock(slotNumber, { color, size: newValue })) {
          return color;
        }
      }
    }

    return null;
  }

  _getSizePreferenceOrder(currentSize, availableSizes) {
    // Find the preference order for the current size
    let preferenceOrder = [];

    for (const order of CONFIG.sizePreferenceOrder) {
      if (order[0].toLowerCase() === currentSize.toLowerCase()) {
        preferenceOrder = order;
        break;
      }
    }

    // If no preference order found, use available sizes as-is
    if (preferenceOrder.length === 0) {
      return availableSizes;
    }

    // Filter preference order to only include available sizes
    return preferenceOrder.filter(size =>
      availableSizes.some(availSize => availSize.toLowerCase() === size.toLowerCase())
    );
  }

  _notifyAutoSelection(selectedType, selectedValue, autoType, autoValue) {
    // Optional: Implement a toast notification or console log
    console.log(`Note: ${selectedValue} ${selectedType} is out of stock. Auto-selected ${autoValue} ${autoType} instead.`);

    // Dispatch a custom event from the document for UI notifications
    document.dispatchEvent(new CustomEvent('autoVariantSelection', {
      detail: {
        selectedType,
        selectedValue,
        autoType,
        autoValue
      },
      bubbles: true
    }));
  }

  _updateCTAButtons() {
    const allComplete = this._checkAllSelectionsComplete();
    const pendingCTA = document.querySelector('[data-cta="selection-pending"]');
    const completeCTA = document.querySelector('[data-cta="selection-complete"]');

    if (pendingCTA && completeCTA) {
      pendingCTA.classList.toggle('active', !allComplete);
      completeCTA.classList.toggle('active', allComplete);
    }
  }

  handleVerifyButtonClick() {
    const allComplete = this._checkAllSelectionsComplete();
    
    if (!allComplete) {
      for (let i = 1; i <= this.currentTier; i++) {
        const slotVariants = this.selectedVariants.get(i);
        if (!slotVariants?.color || !slotVariants?.size || 
            slotVariants.color === 'select-color' || slotVariants.size === 'select-size') {
          document.querySelector(`[next-tier-slot="${i}"]`)?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          break;
        }
      }
    }
    
    this._updateCTAButtons();
    return allComplete;
  }
}

// Optimized Progress Bar Controller
class ProgressBarController {
  constructor() {
    this.progressItems = document.querySelectorAll('[data-progress]');
    this.sections = document.querySelectorAll('[data-progress-trigger]');
    this.currentActiveStep = null;
    this.completedSteps = new Set();
    this._ticking = false;
    this.init();
  }

  init() {
    this._resetAllSteps();
    this._setupScrollListener();
    setTimeout(() => this._checkVisibility(), 100);
  }

  _resetAllSteps() {
    this.progressItems.forEach(item => item.classList.remove('active', 'completed'));
    this.completedSteps.clear();
  }

  _setupScrollListener() {
    const handleScroll = () => {
      if (!this._ticking) {
        requestAnimationFrame(() => {
          this._checkVisibility();
          this._ticking = false;
        });
        this._ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
  }

  _checkVisibility() {
    const scrollTop = window.pageYOffset;
    const viewportCenter = scrollTop + window.innerHeight / 2;

    let activeSectionName = this._findActiveSection(viewportCenter, scrollTop);
    this._markCompletedSteps(viewportCenter, scrollTop);

    if (activeSectionName !== this.currentActiveStep) {
      this.currentActiveStep = activeSectionName;
      this._updateProgressBar(activeSectionName);
    }
  }

  _findActiveSection(viewportCenter, scrollTop) {
    for (const section of this.sections) {
      const rect = section.getBoundingClientRect();
      const sectionTop = scrollTop + rect.top;
      const sectionBottom = sectionTop + rect.height;

      if (viewportCenter >= sectionTop && viewportCenter <= sectionBottom) {
        return section.getAttribute('data-progress-trigger');
      }
    }

    // Check if above first section
    if (this.sections.length > 0) {
      const firstSection = this.sections[0];
      const firstSectionTop = scrollTop + firstSection.getBoundingClientRect().top;
      if (viewportCenter < firstSectionTop) {
        return firstSection.getAttribute('data-progress-trigger');
      }
    }

    return null;
  }

  _markCompletedSteps(viewportCenter, scrollTop) {
    this.sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const sectionBottom = scrollTop + rect.top + rect.height;
      const stepName = section.getAttribute('data-progress-trigger');

      if (viewportCenter > sectionBottom) {
        this.completedSteps.add(stepName);
      }
    });
  }

  _updateProgressBar(activeStepName) {
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

  // Exit intent setup
  window.next.exitIntent({
    image: 'https://cdn.prod.website-files.com/6894e401ee6c8582aece90a0/68bed75cd9973567c4ab6a25_modal-bare-earth.png',
    action: async () => {
      const profile = CONFIG.exitProfiles[window.tierController?.currentTier || 1];
      await window.next.setProfile(profile);
      console.log(`Exit ${window.tierController?.currentTier || 1}-pack discount applied`);
    },
  });
});

window.progressBarController = new ProgressBarController();