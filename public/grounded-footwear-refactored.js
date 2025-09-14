// Grounded Footwear - Optimized Compact Version
// Reduced size while maintaining exact functionality

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
  // Profile definitions embedded directly
  profileDefinitions: {
    '2_pack': {
      name: '2-Pack Bundle',
      description: 'Bundle of 2 sheets at a discounted price',
      packageMappings: {
        1: 29, 2: 30, 3: 33, 4: 34, 5: 37, 6: 41, 7: 38, 8: 42,
        9: 31, 10: 35, 11: 39, 12: 43, 13: 32, 14: 36, 15: 40, 16: 44,
        17: 25, 18: 45, 19: 26, 20: 46, 21: 27, 22: 47, 23: 28, 24: 48
      }
    },
    '3_pack': {
      name: '3-Pack Bundle',
      description: 'Bundle of 3 sheets at a discounted price',
      packageMappings: {
        1: 53, 2: 54, 3: 58, 4: 59, 5: 62, 6: 66, 7: 63, 8: 67,
        9: 56, 10: 60, 11: 64, 12: 68, 13: 57, 14: 61, 15: 65, 16: 69,
        17: 49, 18: 70, 19: 50, 20: 71, 21: 51, 22: 72, 23: 52, 24: 73
      }
    },
    'exit_10': {
      name: 'Exit 10% Discount',
      description: '10% off all items',
      packageMappings: {
        1: 78, 2: 79, 3: 82, 4: 83, 5: 86, 6: 90, 7: 87, 8: 91,
        9: 80, 10: 84, 11: 88, 12: 92, 13: 81, 14: 85, 15: 89, 16: 93,
        17: 74, 18: 94, 19: 75, 20: 95, 21: 76, 22: 96, 23: 77, 24: 97,
        25: 98, 26: 99, 27: 100, 28: 101, 29: 102, 30: 103, 31: 104, 32: 105,
        33: 106, 34: 107, 35: 108, 36: 109, 37: 110, 38: 111, 39: 112, 40: 113,
        41: 114, 42: 115, 43: 116, 44: 117, 45: 118, 46: 119, 47: 120, 48: 121,
        49: 122, 50: 123, 51: 124, 52: 125, 53: 126, 54: 127, 56: 128, 57: 129,
        58: 130, 59: 131, 60: 132, 61: 133, 62: 134, 63: 135, 64: 136, 65: 137,
        66: 138, 67: 139, 68: 140, 69: 141, 70: 142, 71: 143, 72: 144, 73: 145
      }
    },
    'exit_10_2pack': {
      name: 'Exit 10% - 2 Pack',
      description: '10% off 2-pack bundles',
      packageMappings: {
        1: 102, 2: 103, 3: 106, 4: 107, 5: 110, 6: 114, 7: 111, 8: 115,
        9: 104, 10: 108, 11: 112, 12: 116, 13: 105, 14: 109, 15: 113, 16: 117,
        17: 98, 18: 118, 19: 99, 20: 119, 21: 100, 22: 120, 23: 101, 24: 121,
        25: 98, 26: 99, 27: 100, 28: 101, 29: 102, 30: 103, 31: 104, 32: 105,
        33: 106, 34: 107, 35: 108, 36: 109, 37: 110, 38: 111, 39: 112, 40: 113,
        41: 114, 42: 115, 43: 116, 44: 117, 45: 118, 46: 119, 47: 120, 48: 121
      }
    },
    'exit_10_3pack': {
      name: 'Exit 10% - 3 Pack',  
      description: '10% off 3-pack bundles',
      packageMappings: {
        1: 126, 2: 127, 3: 130, 4: 131, 5: 134, 6: 138, 7: 135, 8: 139,
        9: 128, 10: 132, 11: 136, 12: 140, 13: 129, 14: 133, 15: 137, 16: 141,
        17: 122, 18: 142, 19: 123, 20: 143, 21: 124, 22: 144, 23: 125, 24: 145,
        49: 122, 50: 123, 51: 124, 52: 125, 53: 126, 54: 127, 56: 128, 57: 129,
        58: 130, 59: 131, 60: 132, 61: 133, 62: 134, 63: 135, 64: 136, 65: 137,
        66: 138, 67: 139, 68: 140, 69: 141, 70: 142, 71: 143, 72: 144, 73: 145
      }
    }
  },
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
  ],
  savings: {
    normal: { 1: '50', 2: '55', 3: '60' },
    exit: { 1: '55', 2: '60', 3: '65' }
  }
};

// Base element class
class ConversionElement extends HTMLElement {
  connectedCallback() {
    if (!this._mounted) {
      this._mounted = true;
      this.mount();
    }
  }
  disconnectedCallback() {
    this._mounted = false;
  }
  attributeChangedCallback(n, o, v) {
    if (o !== v) this.onAttributeChange?.(n, o, v);
  }
  mount() {}
  onAttributeChange() {}
}

// Dropdown implementation
const { computePosition, flip, offset, autoUpdate } = window.FloatingUIDOM;

class OSDropdown extends ConversionElement {
  static observedAttributes = ['value', 'name', 'disabled'];
  static openDropdowns = new Set();

  mount() {
    this._toggle = this.querySelector('button, [role="button"]');
    this._menu = this.querySelector('os-dropdown-menu') || this._createMenu();
    if (!this._toggle || !this._menu) return;
    
    this._value = this.getAttribute('value') || null;
    this._setupEvents();
    
    const selected = this.querySelector('os-dropdown-item[selected]');
    if (selected) {
      this._value = selected.value;
      this._updateToggleContent();
    }
  }

  _createMenu() {
    const legacy = this.querySelector('[os-element="dropdown-menu"]');
    if (!legacy) return null;
    const menu = document.createElement('os-dropdown-menu');
    menu.append(...legacy.childNodes);
    legacy.replaceWith(menu);
    return menu;
  }

  _setupEvents() {
    this._toggle.addEventListener('click', e => {
      e.stopPropagation();
      this.toggleDropdown();
    });
    
    this.addEventListener('dropdown-item-select', e => {
      const item = e.detail.item;
      this._value = item.value;
      this.setAttribute('value', item.value);
      this._updateSelection(item);
      this._updateToggleContent();
      this.closeDropdown();
      this.dispatchEvent(new Event('change', { bubbles: true }));
      this.dispatchEvent(new CustomEvent('variantSelected', {
        detail: { value: item.value, item, component: this },
        bubbles: true
      }));
    });
    
    document.addEventListener('click', e => {
      if (!this.contains(e.target) && this.isOpen) this.closeDropdown();
    });
  }

  _updateSelection(selected) {
    this.querySelectorAll('os-dropdown-item').forEach(item => {
      const isSelected = item === selected;
      item.classList.toggle('selected', isSelected);
      item.selected = isSelected;
    });
  }

  _updateToggleContent() {
    if (!this._toggle || !this._value) return;
    const selected = this.querySelector(`os-dropdown-item[value="${this._value}"]`);
    const content = selected?.querySelector('.os-card__toggle-option');
    const existing = this._toggle.querySelector('.os-card__toggle-option');
    if (existing && content) {
      const newContent = content.cloneNode(true);
      newContent.classList.remove('os--distribute');
      newContent.classList.add('os--main');
      existing.replaceWith(newContent);
    }
  }

  toggleDropdown() {
    this.isOpen ? this.closeDropdown() : this.openDropdown();
  }

  async openDropdown() {
    OSDropdown.closeAllDropdowns();
    this.setAttribute('open', '');
    this._toggle.classList.add('active');
    this._menu.style.opacity = '1';
    this._menu.style.visibility = 'visible';
    this._menu.classList.add('show');
    
    // Simple positioning
    const rect = this.getBoundingClientRect();
    Object.assign(this._menu.style, {
      position: 'absolute',
      top: `${this._toggle.offsetHeight + 8}px`,
      left: '0',
      width: `${rect.width}px`,
      zIndex: '1000'
    });
    
    OSDropdown.openDropdowns.add(this);
  }

  closeDropdown() {
    this.removeAttribute('open');
    this._toggle.classList.remove('active');
    this._menu.classList.remove('show');
    this._menu.style.opacity = '0';
    this._menu.style.visibility = 'hidden';
    OSDropdown.openDropdowns.delete(this);
  }

  static closeAllDropdowns() {
    OSDropdown.openDropdowns.forEach(d => d.closeDropdown());
  }

  get value() { return this._value; }
  set value(val) {
    this._value = val;
    this.setAttribute('value', val);
    this._updateSelection(this.querySelector(`os-dropdown-item[value="${val}"]`));
    this._updateToggleContent();
  }

  get isOpen() { return this.hasAttribute('open'); }
}

class OSDropdownMenu extends ConversionElement {
  mount() {
    this.setAttribute('role', 'listbox');
    this.classList.add('os-dropdown-menu');
    Object.assign(this.style, {
      position: 'absolute',
      zIndex: '1000',
      transition: 'opacity 0.2s ease, visibility 0.2s ease',
      opacity: '0',
      visibility: 'hidden'
    });
  }
}

class OSDropdownItem extends ConversionElement {
  static observedAttributes = ['value', 'selected', 'disabled'];

  mount() {
    this.setAttribute('role', 'option');
    this._value = this.getAttribute('value') || '';
    this._selected = this.hasAttribute('selected');
    
    this.addEventListener('click', () => {
      if (!this.disabled) {
        this.closest('os-dropdown')?.dispatchEvent(
          new CustomEvent('dropdown-item-select', {
            detail: { item: this },
            bubbles: true
          })
        );
      }
    });
  }

  get value() { return this._value; }
  set value(val) {
    this._value = val;
    this.setAttribute('value', val);
  }

  get selected() { return this._selected; }
  set selected(val) {
    this._selected = val;
    this.classList.toggle('selected', val);
  }

  get disabled() { return this.hasAttribute('disabled'); }

  onAttributeChange(name, _, newValue) {
    if (name === 'value') this._value = newValue || '';
    else if (name === 'selected') this.selected = newValue !== null;
  }
}

// Tier Controller - Optimized
class TierController {
  constructor() {
    this.currentTier = 1;
    this.selectedVariants = new Map();
    this.productId = null;
    this.baseProductId = null;
    this.exitDiscountActive = false;
    this._cartTimer = null;
    this.init();
  }

  async init() {
    await this._waitForSDK();
    
    // Register profiles with SDK
    this._registerProfiles();
    
    // Setup event listeners FIRST before any profile changes
    this._setupListeners();
    
    await window.next.clearCart();
    await window.next.revertProfile();

    this._getProductId();
    this._bindEvents();
    this._initState();
    
    // Check for exit discount
    if (sessionStorage.getItem('grounded-exit-discount-active') === 'true') {
      this.exitDiscountActive = true;
      await this._applyProfile(this.currentTier);
    }
    
    this._setupDropdowns();
    await this._setDefaults();
    this._updatePrices();
    this._updateSavings();
  }

  _waitForSDK() {
    return new Promise(resolve => {
      const check = () => {
        // Wait for SDK to be ready
        if (window.next?.getCampaignData && window.next?.getPackage) {
          resolve();
        } else {
          setTimeout(check, 50);
        }
      };
      check();
    });
  }

  _getProductId() {
    const campaign = window.next.getCampaignData();
    this.productId = campaign?.packages?.[0]?.product_id;
    if (!this.productId) {
      try {
        const cache = JSON.parse(sessionStorage.getItem('next-campaign-cache') || '{}');
        this.productId = cache.campaign?.packages?.[0]?.product_id;
      } catch {}
    }
    if (!this.baseProductId && this.productId) {
      this.baseProductId = this.productId;
    }
  }

  _bindEvents() {
    // Tier selection
    document.querySelectorAll('[data-next-tier]').forEach(card => {
      card.addEventListener('click', () => {
        this.selectTier(parseInt(card.getAttribute('data-next-tier')));
      });
    });

    // Variant selection
    document.addEventListener('variantSelected', e => {
      this._handleVariant(e.detail);
    });
  }

  _initState() {
    const selected = document.querySelector('.os-card.next-selected');
    if (selected) {
      const tier = parseInt(selected.getAttribute('data-next-tier'));
      if (tier) {
        this.currentTier = tier;
        this._updateSlots(tier);
      }
    } else {
      // Default to tier 1 if none selected
      this._updateSlots(1);
    }
  }

  async selectTier(tier) {
    if (tier === this.currentTier) return;

    const prev = this.currentTier;
    this.currentTier = tier;

    // Update UI
    document.querySelectorAll('[data-next-tier]').forEach(card => {
      const t = parseInt(card.getAttribute('data-next-tier'));
      card.classList.toggle('next-selected', t === tier);
      const radio = card.querySelector('.radio-style-1');
      if (radio) radio.setAttribute('data-selected', String(t === tier));
    });

    // Create/update slots dynamically
    this._updateSlots(tier);

    // Apply profile - the event listener will handle the UI updates
    await this._applyProfile(tier);

    // Copy selections from slot 1 to new slots
    if (tier > prev) {
      const slot1 = this.selectedVariants.get(1);
      if (slot1?.color && slot1?.size) {
        for (let i = prev + 1; i <= tier; i++) {
          this.selectedVariants.set(i, { ...slot1 });
          this._updateSlot(i, slot1);
          this._updateSlotPrice(i);
          this._updateStock(document.querySelector(`[next-tier-slot="${i}"]`), i);
        }
      }
    }

    await this._updateCart();
    this._updateCTA();
  }

  _updateSlots(tier) {
    const container = document.querySelector('.os-slots');
    if (!container) return;

    // Get the first slot as template
    let template = container.querySelector('[next-tier-slot="1"]');
    
    // Hide all existing slots first
    container.querySelectorAll('[next-tier-slot]').forEach(slot => {
      const num = parseInt(slot.getAttribute('next-tier-slot'));
      if (num > tier) {
        slot.style.display = 'none';
        slot.classList.remove('active');
      }
    });

    // Create or show slots up to current tier
    for (let i = 1; i <= tier; i++) {
      let slot = container.querySelector(`[next-tier-slot="${i}"]`);
      
      if (!slot && template) {
        // Clone the template to create new slot
        slot = template.cloneNode(true);
        slot.setAttribute('next-tier-slot', String(i));
        
        // Update slot number display
        const stepLabel = slot.querySelector('.os-slot__step div');
        if (stepLabel) {
          stepLabel.textContent = `Set ${String(i).padStart(2, '0')}`;
        }
        
        // Clear any existing dropdown values
        slot.querySelectorAll('os-dropdown').forEach(dropdown => {
          dropdown.removeAttribute('value');
        });
        
        container.appendChild(slot);
      }
      
      if (slot) {
        slot.style.display = 'flex';
        slot.classList.add('active');
        
        // Setup dropdowns for this slot with OOS checking
        this._populateDropdowns(slot, i);
        
        // Update price for this slot
        this._updateSlotPrice(i);
      }
    }
  }

  _updateSlot(slotNum, variants) {
    const slot = document.querySelector(`[next-tier-slot="${slotNum}"]`);
    if (!slot) return;

    if (variants.color) {
      const colorDrop = slot.querySelector('os-dropdown[next-variant-option="color"]');
      if (colorDrop) {
        colorDrop.value = variants.color;
        this._updateSwatch(colorDrop, variants.color);
        this._updateImage(slot, variants.color);
      }
    }

    if (variants.size) {
      const sizeDrop = slot.querySelector('os-dropdown[next-variant-option="size"]');
      if (sizeDrop) sizeDrop.value = variants.size;
    }
  }

  async _applyProfile(tier) {
    const profiles = this.exitDiscountActive ? CONFIG.exitProfiles : CONFIG.profiles;
    const profile = profiles[tier];
    
    try {
      if (profile && profile !== 'default') {
        await window.next.setProfile(profile);
      } else {
        await window.next.revertProfile();
      }
    } catch (error) {
      console.warn(`Failed to apply profile ${profile}`, error);
      // Continue with default pricing rather than breaking
      try {
        await window.next.revertProfile();
      } catch {}
    }
  }

  async activateExitDiscount() {
    this.exitDiscountActive = true;
    sessionStorage.setItem('grounded-exit-discount-active', 'true');
    
    // Apply profile - the event listener will handle the UI updates
    await this._applyProfile(this.currentTier);
    this._cartDebounce();
    
    // Show indicator
    const badge = document.createElement('div');
    badge.className = 'exit-discount-badge';
    badge.innerHTML = '🎉 Extra 10% OFF Applied!';
    badge.style.cssText = 'position:fixed;top:20px;right:20px;background:#4CAF50;color:white;padding:10px 20px;border-radius:5px;z-index:9999;';
    document.body.appendChild(badge);
    setTimeout(() => badge.remove(), 5000);
  }

  _handleVariant({ value, component }) {
    const slot = component.closest('[next-tier-slot]');
    if (!slot) return;

    const slotNum = parseInt(slot.getAttribute('next-tier-slot'));
    const type = component.getAttribute('next-variant-option');

    if (!this.selectedVariants.has(slotNum)) {
      this.selectedVariants.set(slotNum, {});
    }

    const variants = this.selectedVariants.get(slotNum);
    variants[type] = value;
    
    // Save selections to localStorage
    this._saveSelectionsToStorage();

    // Auto-select available variant if current selection is out of stock
    if (CONFIG.autoSelectAvailable && variants.color && variants.size) {
      const isOOS = this._isCompleteVariantOutOfStock(slotNum, variants);
      
      if (isOOS) {
        const alternative = this._findAvailableAlternative(slotNum, type, value);
        
        if (alternative) {
          const otherType = type === 'color' ? 'size' : 'color';
          variants[otherType] = alternative;
          this._updateSlot(slotNum, { [otherType]: alternative });
        }
      }
    }

    if (type === 'color') {
      this._updateSwatch(component, value);
      this._updateImage(slot, value);
    }

    this._updateStock(slot, slotNum);
    this._updateSlotPrice(slotNum);
    
    if (variants.color && variants.size) {
      this._cartDebounce();
    }
    this._updateCTA();
  }

  _updateSwatch(dropdown, color) {
    const swatch = dropdown?.querySelector('.os-card__variant-swatch');
    if (swatch && color) {
      const key = color.toLowerCase().replace(/\s+/g, '-');
      if (CONFIG.colors.styles[key]) {
        swatch.style.backgroundColor = CONFIG.colors.styles[key];
      }
    }
  }

  _updateImage(slot, color) {
    const img = slot.querySelector('[next-tier-slot-element="image"]');
    if (img && color) {
      const key = color.toLowerCase().replace(/\s+/g, '-');
      if (CONFIG.colors.images[key]) {
        img.style.opacity = '0.5';
        img.src = CONFIG.colors.images[key];
        img.onload = () => img.style.opacity = '1';
      }
    }
  }

  _cartDebounce() {
    clearTimeout(this._cartTimer);
    this._cartTimer = setTimeout(() => this._updateCart(), 300);
  }

  async _updateCart() {
    const items = [];
    this._getProductId();

    for (let i = 1; i <= this.currentTier; i++) {
      const v = this.selectedVariants.get(i);
      if (v?.color && v?.size) {
        const pkg = window.next.getPackageByVariantSelection(
          this.baseProductId || this.productId,
          { color: v.color, size: v.size }
        );
        if (pkg) {
          items.push({ packageId: pkg.ref_id, quantity: 1 });
        }
      }
    }

    if (items.length > 0) {
      try {
        await window.next.swapCart(items);
      } catch {
        // Retry once
        setTimeout(() => window.next.swapCart(items), 100);
      }
    }
  }

  _setupDropdowns() {
    if (!this.productId) return;

    // Use _updateSlots to ensure slots exist and are populated
    this._updateSlots(this.currentTier);
  }

  _populateDropdowns(slot, slotNum) {
    const pid = (slotNum === 1 && this.baseProductId) || this.productId;
    const colors = window.next.getAvailableVariantAttributes(pid, 'color');
    const sizes = window.next.getAvailableVariantAttributes(pid, 'size');

    this._fillDropdown(slot, 'color', colors, slotNum);
    this._fillDropdown(slot, 'size', sizes, slotNum);
  }

  _fillDropdown(slot, type, options, slotNum) {
    const dropdown = slot.querySelector(`os-dropdown[next-variant-option="${type}"]`);
    const menu = dropdown?.querySelector('os-dropdown-menu');
    if (!menu) return;

    menu.innerHTML = '';
    
    const sorted = this._sortOptions(options, type);
    const currentVariants = this.selectedVariants.get(slotNum) || {};
    
    sorted.forEach(opt => {
      const item = document.createElement('os-dropdown-item');
      item.setAttribute('value', opt);
      
      // Check if this specific combination would be out of stock
      const testVariants = { ...currentVariants, [type]: opt };
      
      // Only check OOS if we have both size and color
      if (testVariants.color && testVariants.size) {
        const isOutOfStock = this._isCompleteVariantOutOfStock(slotNum, testVariants);
        if (isOutOfStock) {
          item.classList.add('next-oos');
        }
      } else if (currentVariants[type === 'color' ? 'size' : 'color']) {
        // Check partial variant if we have the other attribute
        const isOutOfStock = this._isVariantOutOfStock(slotNum, { [type]: opt });
        if (isOutOfStock) {
          item.classList.add('next-oos');
        }
      }
      
      if (type === 'color') {
        const key = opt.toLowerCase().replace(/\s+/g, '-');
        item.innerHTML = `
          <div class="os-card__toggle-option os--distribute">
            <div class="os-card__variant-toggle-info">
              <div class="os-card__variant-swatch" style="background-color:${CONFIG.colors.styles[key] || '#ccc'}"></div>
              <div class="os-card__variant-toggle-name">${opt}</div>
            </div>
          </div>`;
      } else {
        item.innerHTML = `
          <div class="os-card__toggle-option os--distribute">
            <div class="os-card__variant-toggle-info">
              <div class="os-card__variant-toggle-name">${opt}</div>
            </div>
          </div>`;
      }
      
      menu.appendChild(item);
    });
  }

  _sortOptions(options, type) {
    const order = CONFIG.displayOrder[type === 'color' ? 'colors' : 'sizes'];
    if (!order) return options;
    
    const map = new Map(order.map((v, i) => [v.toLowerCase(), i]));
    return [...options].sort((a, b) => {
      const ai = map.get(a.toLowerCase());
      const bi = map.get(b.toLowerCase());
      if (ai !== undefined && bi !== undefined) return ai - bi;
      if (ai !== undefined) return -1;
      if (bi !== undefined) return 1;
      return 0;
    });
  }

  async _setDefaults() {
    // Try to load saved selections first
    const savedSelections = this._loadSelectionsFromStorage();
    
    const colors = window.next.getAvailableVariantAttributes(this.productId, 'color');
    const sizes = window.next.getAvailableVariantAttributes(this.productId, 'size');
    
    const defaultColor = colors.find(c => c.toLowerCase().includes('obsidian')) || colors[0];
    const defaultSize = sizes.find(s => s.toLowerCase() === 'king') || sizes[0];

    for (let i = 1; i <= this.currentTier; i++) {
      if (!this.selectedVariants.has(i)) {
        this.selectedVariants.set(i, {});
      }
      const v = this.selectedVariants.get(i);
      
      // Use saved selections if available, otherwise use defaults
      const saved = savedSelections?.[i];
      
      // Try to use saved color, but validate it's in stock
      if (!v.color) {
        let colorToUse = saved?.color || defaultColor;
        
        // If we have a saved selection, validate it's still available
        if (saved?.color && saved?.size) {
          const isOOS = this._isCompleteVariantOutOfStock(i, { color: saved.color, size: saved.size });
          if (isOOS) {
            // Saved combination is OOS, find alternative
            const altColor = this._findAvailableColor(i, saved.size);
            const altSize = this._findAvailableSize(i, saved.color);
            
            if (altSize && !altColor) {
              // Keep color, change size
              v.color = saved.color;
              v.size = altSize;
            } else if (altColor && !altSize) {
              // Keep size, change color
              v.color = altColor;
              v.size = saved.size;
            } else {
              // Both or neither work, use defaults
              v.color = defaultColor;
              v.size = defaultSize;
            }
          } else {
            // Saved selection is valid
            v.color = saved.color;
            v.size = saved.size;
          }
        } else {
          // No complete saved selection, use color preference
          v.color = colorToUse;
          v.size = saved?.size || defaultSize;
        }
        
        // Update UI
        if (v.color) this._updateSlot(i, { color: v.color });
        if (v.size) this._updateSlot(i, { size: v.size });
      }
      
      this._updateSlotPrice(i);
      this._updateStock(document.querySelector(`[next-tier-slot="${i}"]`), i);
    }

    await this._updateCart();
  }
  
  _findAvailableColor(slotNum, size) {
    const pid = (slotNum === 1 && this.baseProductId) || this.productId;
    const colors = window.next.getAvailableVariantAttributes(pid, 'color');
    
    for (const color of colors) {
      if (!this._isCompleteVariantOutOfStock(slotNum, { color, size })) {
        return color;
      }
    }
    return null;
  }
  
  _findAvailableSize(slotNum, color) {
    const pid = (slotNum === 1 && this.baseProductId) || this.productId;
    const sizes = window.next.getAvailableVariantAttributes(pid, 'size');
    
    for (const size of sizes) {
      if (!this._isCompleteVariantOutOfStock(slotNum, { color, size })) {
        return size;
      }
    }
    return null;
  }
  
  _saveSelectionsToStorage() {
    try {
      const selections = {};
      this.selectedVariants.forEach((value, key) => {
        selections[key] = value;
      });
      localStorage.setItem('grounded-selections', JSON.stringify(selections));
    } catch {}
  }
  
  _loadSelectionsFromStorage() {
    try {
      const saved = localStorage.getItem('grounded-selections');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  _updatePrices() {
    for (let i = 1; i <= this.currentTier; i++) {
      this._updateSlotPrice(i);
    }
    this._updateSavings();
  }

  _updateSlotPrice(slotNum) {
    const slot = document.querySelector(`[next-tier-slot="${slotNum}"]`);
    if (!slot) return;

    const v = this.selectedVariants.get(slotNum);
    if (!v?.color || !v?.size) {
      this._resetPrice(slot);
      return;
    }

    // Always use baseProductId for initial lookup
    const basePkg = window.next.getPackageByVariantSelection(
      this.baseProductId || this.productId,
      { color: v.color, size: v.size }
    );

    if (!basePkg) {
      this._resetPrice(slot);
      return;
    }

    let pkg = basePkg;
    
    // Get mapped package for tier/profile
    if (this.currentTier > 1 || this.exitDiscountActive) {
      const profileName = this.exitDiscountActive 
        ? CONFIG.exitProfiles[this.currentTier]
        : CONFIG.profiles[this.currentTier];
      
      if (profileName && CONFIG.profileDefinitions[profileName]) {
        const mappedId = CONFIG.profileDefinitions[profileName].packageMappings[basePkg.ref_id];
        if (mappedId) {
          const mappedPkg = window.next.getPackage(mappedId);
          if (mappedPkg) {
            pkg = mappedPkg;
          }
        }
      }
    }

    // Update prices
    const price = parseFloat(pkg.price);
    const retail = parseFloat(pkg.price_retail);
    
    const priceEl = slot.querySelector('[data-option="price"]');
    const regEl = slot.querySelector('[data-option="reg"]');
    const pctEl = slot.querySelector('[data-option="savingPct"]');
    
    if (priceEl) priceEl.textContent = `$${price.toFixed(2)}`;
    if (regEl) regEl.textContent = `$${retail.toFixed(2)}`;
    if (pctEl && retail > price) {
      pctEl.textContent = `${Math.round(((retail - price) / retail) * 100)}%`;
    }
    
    // Also update the price container if it has /ea format
    const priceContainer = slot.querySelector('.os-card__price.os--current');
    if (priceContainer) {
      priceContainer.innerHTML = `<span data-option="price">$${price.toFixed(2)}</span>/ea`;
    }
  }

  _resetPrice(slot) {
    const els = ['[data-option="reg"]', '[data-option="price"]', '[data-option="savingPct"]'];
    const vals = ['$XX.XX', '$XX.XX', 'XX%'];
    els.forEach((sel, i) => {
      const el = slot.querySelector(sel);
      if (el) el.textContent = vals[i];
    });
  }

  _updateStock(slot, slotNum) {
    if (!slot) return;
    
    const v = this.selectedVariants.get(slotNum) || {};
    const pid = (slotNum === 1 && this.baseProductId) || this.productId;

    ['color', 'size'].forEach(type => {
      const dropdown = slot.querySelector(`os-dropdown[next-variant-option="${type}"]`);
      if (!dropdown) return;
      
      dropdown.querySelectorAll('os-dropdown-item').forEach(item => {
        const val = item.getAttribute('value');
        const check = type === 'color' 
          ? { color: val, size: v.size }
          : { color: v.color, size: val };
        
        if (check.color && check.size) {
          const pkg = window.next.getPackageByVariantSelection(pid, check);
          const oos = !pkg || 
            pkg.product_inventory_availability === 'out_of_stock' ||
            pkg.product_purchase_availability === 'unavailable';
          item.classList.toggle('next-oos', oos);
        }
      });
    });
  }

  _updateSavings() {
    const savings = this.exitDiscountActive ? CONFIG.savings.exit : CONFIG.savings.normal;
    
    [1, 2, 3].forEach(tier => {
      const els = document.querySelectorAll(
        `[data-next-tier="${tier}"] [data-next-display*="bestSavingsPercentage"], 
         [data-next-tier="${tier}"] .next-cart-has-items`
      );
      els.forEach(el => {
        if (el) el.textContent = savings[tier] + '%';
      });
    });
  }

  _updateCTA() {
    const complete = this._isComplete();
    const pending = document.querySelector('[data-cta="selection-pending"]');
    const ready = document.querySelector('[data-cta="selection-complete"]');
    
    if (pending) pending.classList.toggle('active', !complete);
    if (ready) ready.classList.toggle('active', complete);
  }

  _isComplete() {
    for (let i = 1; i <= this.currentTier; i++) {
      const v = this.selectedVariants.get(i);
      if (!v?.color || !v?.size) return false;
    }
    return true;
  }

  _registerProfiles() {
    if (!window.next.registerProfile) return;
    
    try {
      // Register profiles from embedded CONFIG
      Object.entries(CONFIG.profileDefinitions).forEach(([id, profile]) => {
        window.next.registerProfile({
          id,
          name: profile.name,
          description: profile.description,
          packageMappings: profile.packageMappings
        });
      });
    } catch (e) {
      console.warn('Failed to register profiles:', e);
    }
  }

  _setupListeners() {
    // Listen for profile applied event
    window.next.on('profile:applied', () => {
      // Profile has been applied, update UI
      this._onProfileChanged();
    });
    
    // Listen for profile reverted event
    window.next.on('profile:reverted', () => {
      // Profile has been reverted, update UI
      this._onProfileChanged();
    });
  }
  
  _onProfileChanged() {
    // Get the new product ID after profile change
    this._getProductId();
    
    // Re-setup dropdowns with new packages
    this._setupDropdowns();
    
    // Update all slot prices with new profile
    setTimeout(() => {
      for (let i = 1; i <= this.currentTier; i++) {
        this._updateSlotPrice(i);
      }
    }, 100);
    
    // Update savings display
    this._updateSavings();
  }

  handleVerifyClick() {
    if (!this._isComplete()) {
      for (let i = 1; i <= this.currentTier; i++) {
        const v = this.selectedVariants.get(i);
        if (!v?.color || !v?.size) {
          document.querySelector(`[next-tier-slot="${i}"]`)?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
          break;
        }
      }
    }
    this._updateCTA();
    return this._isComplete();
  }
  
  // Helper methods for stock checking and auto-selection
  _isVariantOutOfStock(slotNum, partialVariant) {
    const slotVariants = this.selectedVariants.get(slotNum) || {};
    const fullVariant = {
      color: partialVariant.color || slotVariants.color,
      size: partialVariant.size || slotVariants.size
    };
    
    if (!fullVariant.color || !fullVariant.size) {
      return false;
    }
    
    const pid = (slotNum === 1 && this.baseProductId) || this.productId;
    const pkg = window.next.getPackageByVariantSelection(pid, fullVariant);
    
    if (!pkg) return true;
    return pkg.product_inventory_availability === 'out_of_stock' ||
           pkg.product_purchase_availability === 'unavailable';
  }
  
  _isCompleteVariantOutOfStock(slotNum, fullVariant) {
    if (!fullVariant.color || !fullVariant.size) {
      return false;
    }
    
    const pid = (slotNum === 1 && this.baseProductId) || this.productId;
    const pkg = window.next.getPackageByVariantSelection(pid, fullVariant);
    
    if (!pkg) return true;
    return pkg.product_inventory_availability === 'out_of_stock' ||
           pkg.product_purchase_availability === 'unavailable';
  }
  
  _findAvailableAlternative(slotNum, changedType, newValue) {
    const pid = (slotNum === 1 && this.baseProductId) || this.productId;
    const slotVariants = this.selectedVariants.get(slotNum);
    
    if (changedType === 'color') {
      // Find available size for the new color
      const availableSizes = window.next.getAvailableVariantAttributes(pid, 'size');
      const currentSize = slotVariants.size;
      
      // Try to keep current size if available
      if (!this._isCompleteVariantOutOfStock(slotNum, { color: newValue, size: currentSize })) {
        return currentSize;
      }
      
      // Find best alternative size
      const sizeOrder = this._getSizePreferenceOrder(currentSize, availableSizes);
      for (const size of sizeOrder) {
        if (!this._isCompleteVariantOutOfStock(slotNum, { color: newValue, size })) {
          return size;
        }
      }
    } else if (changedType === 'size') {
      // Find available color for the new size
      const availableColors = window.next.getAvailableVariantAttributes(pid, 'color');
      const currentColor = slotVariants.color;
      
      // Try to keep current color if available
      if (!this._isCompleteVariantOutOfStock(slotNum, { color: currentColor, size: newValue })) {
        return currentColor;
      }
      
      // Find any available color
      for (const color of availableColors) {
        if (!this._isCompleteVariantOutOfStock(slotNum, { color, size: newValue })) {
          return color;
        }
      }
    }
    
    return null;
  }
  
  _getSizePreferenceOrder(currentSize, availableSizes) {
    // Find matching preference order
    for (const order of CONFIG.sizePreferenceOrder) {
      if (order[0].toLowerCase() === currentSize.toLowerCase()) {
        return order.filter(size => 
          availableSizes.some(avail => avail.toLowerCase() === size.toLowerCase())
        );
      }
    }
    
    // Default to available sizes if no preference found
    return availableSizes;
  }
}

// Progress Bar with optimized scroll handling
class ProgressBar {
  constructor() {
    this.items = document.querySelectorAll('[data-progress]');
    this.sections = document.querySelectorAll('[data-progress-trigger]');
    this.completed = new Set();
    this._ticking = false;
    this._init();
  }

  _init() {
    const check = () => {
      const center = window.pageYOffset + window.innerHeight / 2;
      
      // Mark completed
      this.sections.forEach(s => {
        const rect = s.getBoundingClientRect();
        const bottom = window.pageYOffset + rect.top + rect.height;
        if (center > bottom) {
          this.completed.add(s.getAttribute('data-progress-trigger'));
        }
      });
      
      // Find active
      let active = null;
      for (const s of this.sections) {
        const rect = s.getBoundingClientRect();
        const top = window.pageYOffset + rect.top;
        const bottom = top + rect.height;
        if (center >= top && center <= bottom) {
          active = s.getAttribute('data-progress-trigger');
          break;
        }
      }
      
      // Update UI
      this.items.forEach(item => {
        const name = item.getAttribute('data-progress');
        item.classList.remove('active', 'completed');
        if (this.completed.has(name)) {
          item.classList.add('completed');
        } else if (name === active) {
          item.classList.add('active');
        }
      });
      
      this._ticking = false;
    };
    
    // Debounced scroll handler
    const handleScroll = () => {
      if (!this._ticking) {
        requestAnimationFrame(check);
        this._ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    check();
  }
}

// Register elements
customElements.define('os-dropdown', OSDropdown);
customElements.define('os-dropdown-menu', OSDropdownMenu);
customElements.define('os-dropdown-item', OSDropdownItem);

// Initialize
window.addEventListener('next:initialized', () => {
  window.tierController = new TierController();
  
  // Force update savings periodically
  let count = 0;
  const interval = setInterval(() => {
    window.tierController?._updateSavings();
    if (++count >= 5) clearInterval(interval);
  }, 1000);
  
  // Verify button
  const btn = document.querySelector('[os-checkout="verify-step"]');
  if (btn) {
    btn.addEventListener('click', e => {
      if (window.tierController && !window.tierController.handleVerifyClick()) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
  }
});

// Progress bar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.progressBar = new ProgressBar();
  });
} else {
  window.progressBar = new ProgressBar();
}

// Exit intent
window.addEventListener('next:initialized', () => {
  window.next.exitIntent({
    image: 'https://cdn.prod.website-files.com/6894e401ee6c8582aece90a0/68bed75cd9973567c4ab6a25_modal-bare-earth.png',
    action: async () => {
      if (window.tierController) {
        await window.tierController.activateExitDiscount();
      } else {
        await window.next.setProfile('exit_10');
      }
    }
  });
});