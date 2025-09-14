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
  profiles: { 1: 'default', 2: '2_pack', 3: '3_pack' },
  exitProfiles: { 1: 'exit_10', 2: 'exit_10_2pack', 3: 'exit_10_3pack' },
  autoSelectAvailable: true,
  displayOrder: {
    sizes: ['Twin', 'Single', 'Double', 'Queen', 'King', 'California King'],
    colors: ['Obsidian Grey', 'Chateau Ivory', 'Scribe Blue', 'Verdant Sage']
  },
  sizePreferenceOrder: [
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
    if (oldValue !== newValue) this.onAttributeChange?.(name, oldValue, newValue);
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
    this._elements = {};
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
    
    toggle.addEventListener('click', e => { e.stopPropagation(); this.toggleDropdown(); });
    toggle.addEventListener('keydown', this._handleKeyboard.bind(this));
    this.addEventListener('dropdown-item-select', this._handleItemSelect.bind(this));
    document.addEventListener('click', e => !this.contains(e.target) && this.isOpen && this.closeDropdown());
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
      this._value = value;
      requestAnimationFrame(() => this._updateToggleContent());
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

    // On mobile, make dropdown full width of parent
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      // Use parent's width for full-width dropdown on mobile
      const toggleRect = toggle.getBoundingClientRect();
      const parentRect = this.getBoundingClientRect();

      // Calculate available space
      const spaceBelow = window.innerHeight - toggleRect.bottom;
      const spaceAbove = toggleRect.top;
      const menuHeight = menu.scrollHeight || 300; // Estimate if not yet rendered

      // Determine if we should flip to top
      const shouldFlipToTop = spaceBelow < menuHeight + 20 && spaceAbove > spaceBelow;

      const styles = {
        left: '0',
        right: '0',
        width: `${parentRect.width}px`,
        maxWidth: 'calc(100vw - 32px)',
        transform: 'none'
      };

      if (shouldFlipToTop) {
        // Position above the toggle
        styles.bottom = `${toggleRect.height + 8}px`;
        styles.top = 'auto';
        menu.className = menu.className.replace(/placement-\w+/g, '') + ' placement-top';
      } else {
        // Position below the toggle (default)
        styles.top = `${toggleRect.height + 8}px`;
        styles.bottom = 'auto';
        menu.className = menu.className.replace(/placement-\w+/g, '') + ' placement-bottom';
      }

      Object.assign(menu.style, styles);
      return;
    }

    // Desktop: use FloatingUI for positioning but maintain full width
    const toggleRect = toggle.getBoundingClientRect();
    const parentRect = this.getBoundingClientRect();

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

    // Use FloatingUI for vertical positioning but set width to match parent
    Object.assign(menu.style, {
      left: `${x}px`,
      top: `${y}px`,
      width: `${parentRect.width}px`, // Full width of parent
      minWidth: `${parentRect.width}px`, // Ensure minimum width
      transform: 'none'
    });
    menu.className = menu.className.replace(/placement-\w+/g, '') + ` placement-${placement.split('-')[0]}`;

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

    // Set initial visibility state
    menu.style.opacity = '1';
    menu.style.visibility = 'visible';
    menu.classList.add('show');
    toggle.setAttribute('aria-expanded', 'true');

    await this._updateDropdownPosition();

    // Use autoUpdate on desktop, and add scroll listener on mobile
    if (window.innerWidth > 768) {
      this.cleanupAutoUpdate = autoUpdate(toggle, menu, () => this._updateDropdownPosition());
    } else {
      // On mobile, update position on scroll to handle viewport changes
      this._scrollHandler = () => this._updateDropdownPosition();
      window.addEventListener('scroll', this._scrollHandler, { passive: true });
    }

    OSDropdown.openDropdowns.add(this);
    this.querySelector('os-dropdown-item:not([disabled])')?.focus();
  }

  closeDropdown() {
    const { toggle, menu, arrow } = this._elements;

    this.removeAttribute('open');
    toggle.classList.remove('active');
    menu.classList.remove('show');
    toggle.setAttribute('aria-expanded', 'false');

    // Reset visibility state (keep position until fully hidden)
    menu.style.opacity = '0';
    menu.style.visibility = 'hidden';

    // Clean up event listeners
    this.cleanupAutoUpdate?.();
    this.cleanupAutoUpdate = null;

    if (this._scrollHandler) {
      window.removeEventListener('scroll', this._scrollHandler);
      this._scrollHandler = null;
    }

    // Delay position reset until after transition completes
    setTimeout(() => {
      if (!this.isOpen) {  // Only reset if still closed
        menu.className = menu.className.replace(/placement-\w+/g, '');
        Object.assign(menu.style, {
          left: '',
          top: '',
          right: '',
          bottom: '',
          width: '',
          transform: ''
        });

        if (arrow) Object.assign(arrow.style, { left: '', top: '', right: '', bottom: '' });
      }
    }, 200); // Match transition duration

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

    // Apply initial styles but don't override mobile-specific positioning
    const initialStyles = {
      position: 'absolute',
      zIndex: '1000',
      transition: 'opacity 0.2s ease, visibility 0.2s ease',
      opacity: '0',
      visibility: 'hidden'
    };

    Object.assign(this.style, initialStyles);
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
    this.baseProductId = null;
    this.currentProfile = null;
    this.exitDiscountActive = false;
    this._domCache = new Map();
    this._cartUpdateTimer = null;
    this._cartUpdateDelay = 300;
    this._eventCleanup = [];

    this.init();
  }

  async init() {
    await this._waitForSDK();
    await window.next.clearCart();
    await window.next.revertProfile();

    this._getProductIdFromCampaign();
    this._bindEvents();
    this._initializeDefaultState();
    
    // Restore exit discount state if it was active
    const shouldRestoreDiscount = await this._checkAndRestoreExitDiscount();
    
    this._populateAllDropdowns();
    await this._setInitialSelections();
    this._initializeUI();
    this._setupProfileListeners();
    this._updateCTAButtons();
    
    // Simple, direct update of savings percentages
    this._displaySavingsPercentages();
    
    // Also update after a delay to catch any lazy-loaded elements
    setTimeout(() => this._displaySavingsPercentages(), 500);
    setTimeout(() => this._displaySavingsPercentages(), 1000);
  }

  _getCachedElements(selector, forceRefresh = false) {
    if (!this._domCache.has(selector) || forceRefresh) {
      this._domCache.set(selector, document.querySelectorAll(selector));
    }
    return this._domCache.get(selector);
  }

  _getCachedElement(selector, forceRefresh = false) {
    const key = `single_${selector}`;
    if (!this._domCache.has(key) || forceRefresh) {
      this._domCache.set(key, document.querySelector(selector));
    }
    return this._domCache.get(key);
  }

  async _checkAndRestoreExitDiscount() {
    const exitDiscountStored = sessionStorage.getItem('grounded-exit-discount-active');
    if (exitDiscountStored === 'true') {
      this.exitDiscountActive = true;
      console.log('Restoring exit discount state from previous session');

      await this._applyTierProfile(this.currentTier);
      this._getProductIdFromCampaign();
      
      // Update pricing for all active slots
      for (let i = 1; i <= this.currentTier; i++) {
        this._updateSlotPricing(i);
      }
      
      this._debouncedCartUpdate();
      return true;
    }
    return false;
  }

  async _ensurePricesDisplayed() {
    // Just update the savings - keep it simple
    this._displaySavingsPercentages();
    
    // Update slot pricing
    for (let i = 1; i <= this.currentTier; i++) {
      this._updateSlotPricing(i);
    }
  }

  _waitForSDK() {
    return new Promise(resolve => {
      const check = () => {
        // Wait for SDK and campaign data to be fully ready
        if (window.next?.getCampaignData && window.next?.getPackage) {
          // Give SDK a moment to fully initialize
          setTimeout(resolve, 50);
        } else {
          setTimeout(check, 100);
        }
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

    if (!this.baseProductId && this.productId) {
      this.baseProductId = this.productId;
    }

    if (!this.productId) {
      console.error('Warning: Product ID not found. Some features may not work correctly.');
    }
  }

  _bindEvents() {
    const tierCards = this._getCachedElements('[data-next-tier]');
    tierCards.forEach(card => {
      const handler = () => {
        const tier = parseInt(card.getAttribute('data-next-tier'));
        this.selectTier(tier);
      };
      card.addEventListener('click', handler);
      this._eventCleanup.push(() => card.removeEventListener('click', handler));
    });

    const variantHandler = e => this._handleVariantSelection(e.detail);
    document.addEventListener('variantSelected', variantHandler);
    this._eventCleanup.push(() => document.removeEventListener('variantSelected', variantHandler));
  }

  cleanup() {
    this._eventCleanup.forEach(cleanup => cleanup());
    this._eventCleanup = [];
    if (this._cartUpdateTimer) {
      clearTimeout(this._cartUpdateTimer);
      this._cartUpdateTimer = null;
    }
  }

  async selectTier(tierNumber) {
    if (tierNumber === this.currentTier) return;

    const previousTier = this.currentTier;
    this.currentTier = tierNumber;

    this._updateTierCardStates(tierNumber);
    this._updateSlotStates(tierNumber);

    const currentSelections = new Map(this.selectedVariants);

    await this._applyTierProfile(tierNumber);
    this._getProductIdFromCampaign();

    const updates = [];
    for (let i = 1; i <= tierNumber; i++) {
      if (currentSelections.has(i)) {
        this.selectedVariants.set(i, currentSelections.get(i));
      } else if (i > previousTier) {
        const slot1Selection = this.selectedVariants.get(1);
        if (slot1Selection && slot1Selection.color && slot1Selection.size) {
          this.selectedVariants.set(i, { ...slot1Selection });
          const newSlot = document.querySelector(`[next-tier-slot="${i}"]`);
          if (newSlot) {
            this._updateDropdownValue(newSlot, 'color', slot1Selection.color);
            this._updateDropdownValue(newSlot, 'size', slot1Selection.size);
            this._updateColorSwatch(newSlot.querySelector('os-dropdown[next-variant-option="color"]'), slot1Selection.color);
            this._updateSlotImage(newSlot, slot1Selection.color);
          }
        } else {
          updates.push(this._autoSelectFirstOptions(i));
        }
      }
    }

    if (updates.length > 0) {
      await Promise.all(updates);
    }

    await this._swapCartWithSelections();

    // Ensure pricing is updated after profile change
    await this._ensurePricesDisplayed();
    this._updateCTAButtons();
  }

  async _applyTierProfile(tierNumber) {
    const profileConfig = this.exitDiscountActive ? CONFIG.exitProfiles : CONFIG.profiles;
    const profile = profileConfig[tierNumber];

    if (profile) {
      await window.next.setProfile(profile);
    } else {
      await window.next.revertProfile();
    }

    await new Promise(resolve => requestAnimationFrame(resolve));
  }

  async activateExitDiscount() {
    this.exitDiscountActive = true;
    sessionStorage.setItem('grounded-exit-discount-active', 'true');
    console.log('Exit discount activated - applying 10% off to current tier');

    await this._applyTierProfile(this.currentTier);
    this._getProductIdFromCampaign();

    // Ensure pricing updates are visible
    await this._ensurePricesDisplayed();
    
    this._debouncedCartUpdate();
    this._showExitDiscountIndicator();
  }

  _showExitDiscountIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'exit-discount-badge';
    indicator.innerHTML = '🎉 Extra 10% OFF Applied!';
    indicator.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      z-index: 9999;
      animation: slideIn 0.5s ease;
    `;
    document.body.appendChild(indicator);
    setTimeout(() => indicator.remove(), 5000);
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
    const slots = this._getCachedElements('[next-tier-slot]');
    slots.forEach(slot => {
      const slotNumber = parseInt(slot.getAttribute('next-tier-slot'));
      const isActive = slotNumber <= tierNumber;

      slot.classList.toggle('active', isActive);
      slot.style.display = isActive ? 'flex' : 'none';
    });
  }

  async _autoSelectFirstOptions(slotNumber) {
    const slot = document.querySelector(`[next-tier-slot="${slotNumber}"]`);
    if (!slot) return;

    const productIdToUse = (slotNumber === 1 && this.baseProductId) ? this.baseProductId : this.productId;

    const availableColors = window.next.getAvailableVariantAttributes(productIdToUse, 'color');
    const availableSizes = window.next.getAvailableVariantAttributes(productIdToUse, 'size');

    if (!this.selectedVariants.has(slotNumber)) {
      this.selectedVariants.set(slotNumber, {});
    }
    const slotVariants = this.selectedVariants.get(slotNumber);

    if (availableColors.length > 0 && !slotVariants.color) {
      const selectedColor = availableColors.find(color => 
        color.toLowerCase().includes('obsidian')
      ) || availableColors[0];
      
      slotVariants.color = selectedColor;
      this._updateDropdownValue(slot, 'color', selectedColor);
      this._updateColorSwatch(slot.querySelector('os-dropdown[next-variant-option="color"]'), selectedColor);
      this._updateSlotImage(slot, selectedColor);
    }

    if (availableSizes.length > 0 && !slotVariants.size) {
      const selectedSize = availableSizes.find(size =>
        size.toLowerCase() === 'king'
      ) || availableSizes[0];

      slotVariants.size = selectedSize;
      this._updateDropdownValue(slot, 'size', selectedSize);
    }

    this._updateSlotPricing(slotNumber);

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

    if (CONFIG.autoSelectAvailable && slotVariants.color && slotVariants.size) {
      const isOOS = this._isCompleteVariantOutOfStock(slotNumber, slotVariants);

      if (isOOS) {
        const alternative = this._findAvailableAlternative(slotNumber, variantType, value, previousValue);

        if (alternative) {
          console.log(`Auto-selecting available ${variantType === 'color' ? 'size' : 'color'}: ${alternative}`);
          const otherType = variantType === 'color' ? 'size' : 'color';
          slotVariants[otherType] = alternative;
          this._updateDropdownValue(slot, otherType, alternative);

          if (otherType === 'color') {
            const colorDropdown = slot.querySelector(`os-dropdown[next-variant-option="color"]`);
            this._updateColorSwatch(colorDropdown, alternative);
            this._updateSlotImage(slot, alternative);
          }

          this._notifyAutoSelection(variantType, value, otherType, alternative);
        }
      }
    }

    if (variantType === 'color') {
      this._updateColorSwatch(component, value);
      this._updateSlotImage(slot, value);
    }

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
      this._debouncedCartUpdate();
    }
    this._updateCTAButtons();
    return hasColor && hasSize;
  }

  _debouncedCartUpdate() {
    if (this._cartUpdateTimer) {
      clearTimeout(this._cartUpdateTimer);
    }

    this._cartUpdateTimer = setTimeout(() => {
      this._swapCartWithSelections();
      this._cartUpdateTimer = null;
    }, this._cartUpdateDelay);
  }

  async _swapCartWithSelections() {
    const itemsToSwap = [];
    this._getProductIdFromCampaign();

    for (let i = 1; i <= this.currentTier; i++) {
      const slotVariants = this.selectedVariants.get(i);
      const hasValidColor = slotVariants?.color && slotVariants.color !== 'select-color';
      const hasValidSize = slotVariants?.size && slotVariants.size !== 'select-size';

      if (hasValidColor && hasValidSize) {
        const productIdToUse = this.baseProductId || this.productId;

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
        try {
          await new Promise(resolve => setTimeout(resolve, 100));
          await window.next.swapCart(itemsToSwap);
        } catch (retryError) {
          console.error('Retry failed:', retryError);
        }
      }
    }
  }

  _populateAllDropdowns() {
    if (!this.productId) return;

    const slots = this._getCachedElements('[next-tier-slot]');

    requestAnimationFrame(() => {
      slots.forEach(slot => {
        const slotNumber = parseInt(slot.getAttribute('next-tier-slot'));
        if (slotNumber <= this.currentTier) {
          this._populateSlotDropdowns(slot, slotNumber);
          this._updateSlotPricing(slotNumber);
        }
      });
    });
  }

  _populateSlotDropdowns(slot, slotNumber) {
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

    menu.querySelectorAll('os-dropdown-item, .dropdown-arrow').forEach(el => el.remove());

    const sortedOptions = this._sortOptionsByDisplayOrder(options, variantType);

    sortedOptions.forEach(option => {
      menu.appendChild(itemCreator(option, slotNumber));
    });

    if (dropdown._value) {
      dropdown._updateToggleContent();
    }
  }

  _sortOptionsByDisplayOrder(options, variantType) {
    const orderConfig = CONFIG.displayOrder[variantType === 'color' ? 'colors' : 'sizes'];

    if (!orderConfig || orderConfig.length === 0) {
      return options;
    }

    const orderMap = new Map();
    orderConfig.forEach((item, index) => {
      orderMap.set(item.toLowerCase(), index);
    });

    return [...options].sort((a, b) => {
      const aIndex = orderMap.get(a.toLowerCase());
      const bIndex = orderMap.get(b.toLowerCase());

      if (aIndex !== undefined && bIndex !== undefined) {
        return aIndex - bIndex;
      }

      if (aIndex !== undefined) return -1;
      if (bIndex !== undefined) return 1;

      return 0;
    });
  }

  _createColorItem(color, slotNumber) {
    const item = document.createElement('os-dropdown-item');
    const colorKey = color.toLowerCase().replace(/\s+/g, '-');

    item.setAttribute('value', color);

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

    let matchingPackage;

    const basePackage = window.next.getPackageByVariantSelection(
      this.baseProductId || this.productId,
      { color: slotVariants.color, size: slotVariants.size }
    );

    if (basePackage) {
      if (this.currentTier === 1 && !this.exitDiscountActive) {
        matchingPackage = basePackage;
      } else {
        let profileName;

        if (this.exitDiscountActive) {
          if (this.currentTier === 1) {
            profileName = 'exit_10';
          } else if (this.currentTier === 2) {
            profileName = 'exit_10_2pack';
          } else {
            profileName = 'exit_10_3pack';
          }
        } else {
          profileName = this.currentTier === 2 ? '2_pack' : '3_pack';
        }

        if (window.nextConfig?.profiles?.[profileName]?.packageMappings) {
          const mappedPackageId = window.nextConfig.profiles[profileName].packageMappings[basePackage.ref_id];
          if (mappedPackageId) {
            matchingPackage = window.next.getPackage(mappedPackageId);
          }
        }
      }
    }

    if (matchingPackage) {
      this._setPricing(slot, matchingPackage);
    } else {
      this._resetSlotPricing(slot);
    }
  }

  _setPricing(slot, pkg) {
    const elements = {
      reg: slot.querySelector('[data-option="reg"]'),
      price: slot.querySelector('[data-option="price"]'),
      savingPct: slot.querySelector('[data-option="savingPct"]'),
      priceContainer: slot.querySelector('.os-card__price.os--current')
    };

    const displayPrice = parseFloat(pkg.price);
    const displayRetailPrice = parseFloat(pkg.price_retail);

    if (elements.reg) elements.reg.textContent = `$${displayRetailPrice.toFixed(2)}`;
    if (elements.price) elements.price.textContent = `$${displayPrice.toFixed(2)}`;

    if (elements.priceContainer) {
      elements.priceContainer.innerHTML = `<span data-option="price">$${displayPrice.toFixed(2)}</span>/ea`;
    }

    if (elements.savingPct && pkg.price_retail && pkg.price) {
      const savingPct = Math.round(((displayRetailPrice - displayPrice) / displayRetailPrice) * 100);
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
    requestAnimationFrame(() => {
      this._initializeColorSwatches();
      this._initializeSlotImages();
    });
  }

  _initializeColorSwatches() {
    const colorDropdowns = this._getCachedElements('os-dropdown[next-variant-option="color"]');
    colorDropdowns.forEach(dropdown => {
      const currentValue = dropdown.getAttribute('value');
      if (currentValue && currentValue !== 'select-color') {
        this._updateColorSwatch(dropdown, currentValue);
      }
    });
  }

  _initializeSlotImages() {
    const slots = this._getCachedElements('[next-tier-slot]');
    slots.forEach(slot => {
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

    const defaultColor = availableColors.find(color =>
      color.toLowerCase().includes('obsidian')
    ) || availableColors[0];

    const defaultSize = availableSizes.find(size =>
      size.toLowerCase() === 'king'
    ) || availableSizes[0];

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

      if (defaultColor && defaultSize) {
        this._updateDropdownStockStatus(slot, 'color', i);
        this._updateDropdownStockStatus(slot, 'size', i);
      }
    }

    await this._swapCartWithSelections();
    
    // Ensure prices are displayed after initial selections
    await this._ensurePricesDisplayed();
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
    window.next.on('profile:applied', async (data) => {
      this.currentProfile = data.profileId;
      await this._handleProfileChange();
    });

    window.next.on('profile:reverted', async () => {
      this.currentProfile = null;
      await this._handleProfileChange();
    });
  }

  async _handleProfileChange() {
    this._getProductIdFromCampaign();

    if (this.currentTier > 1) {
      this._populateAllDropdowns();
    }
    
    // Always ensure prices are updated after profile change
    await this._ensurePricesDisplayed();
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

      let variantToCheck;
      if (variantType === 'color') {
        variantToCheck = { color: value, size: slotVariants.size };
      } else {
        variantToCheck = { color: slotVariants.color, size: value };
      }

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
        item.classList.remove('next-oos');
      }
    });
  }

  _checkStockStatus(slotNumber, variant, isPartial = false) {
    let fullVariant = variant;
    if (isPartial) {
      const slotVariants = this.selectedVariants.get(slotNumber) || {};
      fullVariant = {
        color: variant.color || slotVariants.color,
        size: variant.size || slotVariants.size
      };
    }

    if (!fullVariant.color || !fullVariant.size ||
        fullVariant.color === 'select-color' || fullVariant.size === 'select-size') {
      return false;
    }

    const productIdToUse = (slotNumber === 1 && this.baseProductId) ? this.baseProductId : this.productId;

    const matchingPackage = window.next.getPackageByVariantSelection(
      productIdToUse,
      fullVariant
    );

    if (matchingPackage) {
      return matchingPackage.product_inventory_availability === 'out_of_stock' ||
             matchingPackage.product_purchase_availability === 'unavailable';
    }

    return false;
  }

  _isVariantOutOfStock(slotNumber, partialVariant) {
    return this._checkStockStatus(slotNumber, partialVariant, true);
  }

  _isCompleteVariantOutOfStock(slotNumber, fullVariant) {
    return this._checkStockStatus(slotNumber, fullVariant, false);
  }

  _findAvailableAlternative(slotNumber, changedType, newValue, previousValue) {
    const productIdToUse = (slotNumber === 1 && this.baseProductId) ? this.baseProductId : this.productId;
    const slotVariants = this.selectedVariants.get(slotNumber);

    if (changedType === 'color') {
      const availableSizes = window.next.getAvailableVariantAttributes(productIdToUse, 'size');
      const currentSize = slotVariants.size;

      const sizeOrder = this._getSizePreferenceOrder(currentSize, availableSizes);

      for (const size of sizeOrder) {
        if (!this._isCompleteVariantOutOfStock(slotNumber, { color: newValue, size })) {
          return size;
        }
      }
    } else if (changedType === 'size') {
      const availableColors = window.next.getAvailableVariantAttributes(productIdToUse, 'color');
      const currentColor = slotVariants.color;

      if (!this._isCompleteVariantOutOfStock(slotNumber, { color: currentColor, size: newValue })) {
        return currentColor;
      }

      for (const color of availableColors) {
        if (!this._isCompleteVariantOutOfStock(slotNumber, { color, size: newValue })) {
          return color;
        }
      }
    }

    return null;
  }

  _getSizePreferenceOrder(currentSize, availableSizes) {
    let preferenceOrder = [];

    for (const order of CONFIG.sizePreferenceOrder) {
      if (order[0].toLowerCase() === currentSize.toLowerCase()) {
        preferenceOrder = order;
        break;
      }
    }

    if (preferenceOrder.length === 0) {
      return availableSizes;
    }

    return preferenceOrder.filter(size =>
      availableSizes.some(availSize => availSize.toLowerCase() === size.toLowerCase())
    );
  }

  _notifyAutoSelection(selectedType, selectedValue, autoType, autoValue) {
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
    const pendingCTA = this._getCachedElement('[data-cta="selection-pending"]');
    const completeCTA = this._getCachedElement('[data-cta="selection-complete"]');

    if (pendingCTA && completeCTA) {
      pendingCTA.classList.toggle('active', !allComplete);
      completeCTA.classList.toggle('active', allComplete);
    }
  }

  _calculateHighestSavings(tierNumber) {
    // Use hardcoded values as fallback for reliability
    const fallbackSavings = {
      normal: { 1: 50, 2: 55, 3: 60 },
      exit: { 1: 55, 2: 60, 3: 65 }
    };
    
    if (!this.productId) {
      console.log('[TierController] No product ID, using fallback savings');
      return this.exitDiscountActive ? 
        fallbackSavings.exit[tierNumber] || 0 : 
        fallbackSavings.normal[tierNumber] || 0;
    }

    if (this.exitDiscountActive) {
      let samplePackageId;

      if (tierNumber === 1) {
        samplePackageId = 90;
      } else if (tierNumber === 2) {
        samplePackageId = 114;
      } else if (tierNumber === 3) {
        samplePackageId = 138;
      }

      const pkg = window.next.getPackage(samplePackageId);
      if (pkg && pkg.price_retail && pkg.price) {
        const savings = Math.round(((pkg.price_retail - pkg.price) / pkg.price_retail) * 100);
        console.log(`[TierController] Exit discount tier ${tierNumber}: ${savings}% off`);
        return savings;
      }
      console.log(`[TierController] No package found, using fallback for exit discount tier ${tierNumber}`);
      return fallbackSavings.exit[tierNumber] || 0;
    }

    let highestSavingPct = 0;
    let packageIds = [];

    if (tierNumber === 1) {
      packageIds = Array.from({ length: 24 }, (_, i) => i + 1);
    } else {
      const profileName = tierNumber === 2 ? '2_pack' : '3_pack';
      if (window.nextConfig?.profiles?.[profileName]?.packageMappings) {
        packageIds = Object.values(window.nextConfig.profiles[profileName].packageMappings);
      }
    }

    packageIds.forEach(packageId => {
      const pkg = window.next.getPackage(packageId);
      if (pkg && pkg.price_retail && pkg.price) {
        const savingPct = Math.round(((pkg.price_retail - pkg.price) / pkg.price_retail) * 100);
        if (savingPct > highestSavingPct) {
          highestSavingPct = savingPct;
        }
      }
    });

    return highestSavingPct;
  }

  _displaySavingsPercentages() {
    // Simple hardcoded values that ALWAYS work
    const savingsMap = {
      normal: { 1: '50', 2: '55', 3: '60' },
      exit: { 1: '55', 2: '60', 3: '65' }
    };
    
    const savings = this.exitDiscountActive ? savingsMap.exit : savingsMap.normal;
    
    // Update tier 1
    const tier1Elements = document.querySelectorAll('[data-next-tier="1"] [data-next-display*="bestSavingsPercentage"], [data-next-tier="1"] .next-cart-has-items');
    tier1Elements.forEach(el => {
      if (el && el.textContent !== savings[1] + '%') {
        el.textContent = savings[1] + '%';
      }
    });
    
    // Update tier 2
    const tier2Elements = document.querySelectorAll('[data-next-tier="2"] [data-next-display*="bestSavingsPercentage"], [data-next-tier="2"] .next-cart-has-items');
    tier2Elements.forEach(el => {
      if (el && el.textContent !== savings[2] + '%') {
        el.textContent = savings[2] + '%';
      }
    });
    
    // Update tier 3
    const tier3Elements = document.querySelectorAll('[data-next-tier="3"] [data-next-display*="bestSavingsPercentage"], [data-next-tier="3"] .next-cart-has-items');
    tier3Elements.forEach(el => {
      if (el && el.textContent !== savings[3] + '%') {
        el.textContent = savings[3] + '%';
      }
    });
    
    console.log('[TierController] Savings updated:', savings);
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
    requestAnimationFrame(() => this._checkVisibility());
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
  window.tierController = new TierController();
  
  // Brute force update savings every second for 5 seconds after load
  // This ensures it ALWAYS works regardless of timing issues
  let updateCount = 0;
  const forceUpdate = setInterval(() => {
    if (window.tierController) {
      window.tierController._displaySavingsPercentages();
    }
    updateCount++;
    if (updateCount >= 5) {
      clearInterval(forceUpdate);
    }
  }, 1000);
  
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
});

// Initialize progress bar immediately
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.progressBarController = new ProgressBarController();
  });
} else {
  window.progressBarController = new ProgressBarController();
}

// EXIT INTENT POPUP
window.addEventListener('next:initialized', function() {
  window.next.exitIntent({
    image: 'https://cdn.prod.website-files.com/6894e401ee6c8582aece90a0/68bed75cd9973567c4ab6a25_modal-bare-earth.png',
    action: async () => {
      if (window.tierController) {
        await window.tierController.activateExitDiscount();
      } else {
        await window.next.setProfile('exit_10');
      }
    },
  });
});