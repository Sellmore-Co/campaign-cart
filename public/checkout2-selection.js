// Grounded Footwear - Ultra-Optimized Version
// All functionality preserved with reduced code size

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
  profileDefinitions: {
    '2_pack': {
      name: '2-Pack Bundle',
      packageMappings: {
        1: 29, 2: 30, 3: 33, 4: 34, 5: 37, 6: 41, 7: 38, 8: 42,
        9: 31, 10: 35, 11: 39, 12: 43, 13: 32, 14: 36, 15: 40, 16: 44,
        17: 25, 18: 45, 19: 26, 20: 46, 21: 27, 22: 47, 23: 28, 24: 48
      }
    },
    '3_pack': {
      name: '3-Pack Bundle',
      packageMappings: {
        1: 53, 2: 54, 3: 58, 4: 59, 5: 62, 6: 66, 7: 63, 8: 67,
        9: 56, 10: 60, 11: 64, 12: 68, 13: 57, 14: 61, 15: 65, 16: 69,
        17: 49, 18: 70, 19: 50, 20: 71, 21: 51, 22: 72, 23: 52, 24: 73
      }
    },
    'exit_10': {
      name: 'Exit 10% Discount',
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
  displayOrder: {
    sizes: ['Single', 'Twin', 'Double', 'Queen', 'King', 'California King'],
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
class BaseElement extends HTMLElement {
  connectedCallback() {
    if (!this._mounted) {
      this._mounted = true;
      this.mount();
    }
  }
  mount() {}
  attributeChangedCallback(n, o, v) {
    if (o !== v) this.onAttributeChange?.(n, o, v);
  }
}

// Dropdown implementation
class OSDropdown extends BaseElement {
  static observedAttributes = ['value'];
  static openDropdowns = new Set();

  mount() {
    this._toggle = this.querySelector('button');
    this._menu = this.querySelector('os-dropdown-menu');
    if (!this._toggle || !this._menu) return;
    
    this._value = this.getAttribute('value');
    this._cleanupFn = null;
    this._setupEvents();
  }

  _setupEvents() {
    this._toggle.onclick = e => {
      e.stopPropagation();
      this.isOpen ? this.closeDropdown() : this.openDropdown();
    };
    
    this.addEventListener('dropdown-item-select', e => {
      const item = e.detail.item;
      this.value = item.value;
      this._updateSelection(item);
      this.closeDropdown();
      this.dispatchEvent(new CustomEvent('variantSelected', {
        detail: { value: item.value, component: this },
        bubbles: true
      }));
    });
    
    document.addEventListener('click', e => {
      if (!this.contains(e.target) && this.isOpen) this.closeDropdown();
    });
  }

  _updateSelection(selected) {
    this.querySelectorAll('os-dropdown-item').forEach(item => {
      item.classList.toggle('selected', item === selected);
    });
    // Update toggle content
    const content = selected?.querySelector('.os-card__toggle-option');
    const existing = this._toggle.querySelector('.os-card__toggle-option');
    if (existing && content) {
      const newContent = content.cloneNode(true);
      newContent.classList.replace('os--distribute', 'os--main');
      existing.replaceWith(newContent);
    }
  }

  openDropdown() {
    OSDropdown.closeAllDropdowns();
    this.setAttribute('open', '');
    this._toggle.classList.add('active');
    
    const updatePosition = () => {
      const toggleRect = this._toggle.getBoundingClientRect();
      const menuHeight = 300;
      const spaceBelow = window.innerHeight - toggleRect.bottom;
      const spaceAbove = toggleRect.top;
      const openAbove = spaceBelow < menuHeight && spaceAbove > spaceBelow;
      
      Object.assign(this._menu.style, {
        opacity: '1',
        visibility: 'visible',
        position: 'absolute',
        width: `${this.getBoundingClientRect().width}px`,
        zIndex: '1000',
        maxHeight: '300px',
        overflowY: 'auto',
        left: '0'
      });
      
      if (openAbove) {
        // When opening above, position from the top of the toggle minus menu height and gap
        this._menu.style.top = 'auto';
        this._menu.style.bottom = `${this.offsetHeight + 8}px`;
        this._menu.style.transform = 'translateY(0)';
      } else {
        // When opening below, position from the bottom of the toggle
        this._menu.style.top = `${this._toggle.offsetHeight + 8}px`;
        this._menu.style.bottom = 'auto';
        this._menu.style.transform = 'translateY(0)';
      }
    };
    
    updatePosition();
    
    // Update position on scroll
    const handleScroll = () => {
      if (this.isOpen) updatePosition();
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    this._cleanupFn = () => window.removeEventListener('scroll', handleScroll);
    
    OSDropdown.openDropdowns.add(this);
  }

  closeDropdown() {
    this.removeAttribute('open');
    this._toggle.classList.remove('active');
    Object.assign(this._menu.style, { opacity: '0', visibility: 'hidden' });
    if (this._cleanupFn) {
      this._cleanupFn();
      this._cleanupFn = null;
    }
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
  }

  get isOpen() { return this.hasAttribute('open'); }
}

class OSDropdownMenu extends BaseElement {
  mount() {
    Object.assign(this.style, {
      position: 'absolute',
      zIndex: '1000',
      transition: 'opacity 0.2s, visibility 0.2s',
      opacity: '0',
      visibility: 'hidden'
    });
  }
}

class OSDropdownItem extends BaseElement {
  mount() {
    this._value = this.getAttribute('value');
    this.onclick = () => {
      if (!this.hasAttribute('disabled')) {
        this.closest('os-dropdown')?.dispatchEvent(
          new CustomEvent('dropdown-item-select', {
            detail: { item: this },
            bubbles: true
          })
        );
      }
    };
  }
  get value() { return this._value; }
}

// Main Controller
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
    this._registerProfiles();
    this._setupListeners();

    // Get initial data
    this._getProductId();
    this._bindEvents();

    // Check if cart has items before clearing
    const cartData = window.next.getCartData();
    const hasCartItems = cartData?.cartLines && cartData.cartLines.length > 0;

    if (hasCartItems) {
      // If cart has items, restore from cart first
      this._initStateFromCart(cartData);
    } else {
      // Only clear cart and setup fresh if empty
      await window.next.clearCart();
      await window.next.revertProfile();
      this._initState();
    }

    if (sessionStorage.getItem('grounded-exit-discount-active') === 'true') {
      this.exitDiscountActive = true;
      await this._applyProfile(this.currentTier);
    }

    // Defer heavy operations
    requestAnimationFrame(() => {
      this._setupDropdowns();

      if (!hasCartItems) {
        this._setDefaultsWithoutCart();
      }

      this._updatePrices();
      this._updateSavings();
    });
  }

  _waitForSDK() {
    return new Promise(r => {
      const check = () => window.next?.getCampaignData ? r() : setTimeout(check, 50);
      check();
    });
  }

  _getProductId() {
    const campaign = window.next.getCampaignData();
    this.productId = campaign?.packages?.[0]?.product_id;
    if (!this.baseProductId && this.productId) {
      this.baseProductId = this.productId;
    }
  }

  _bindEvents() {
    document.querySelectorAll('[data-next-tier]').forEach(card => {
      card.onclick = () => this.selectTier(+card.getAttribute('data-next-tier'));
    });
    document.addEventListener('variantSelected', e => this._handleVariant(e.detail));

    // Handle step navigation buttons
    const selectVariantsBtn = document.querySelector('[data-next-action="select-variants"]');
    if (selectVariantsBtn) {
      selectVariantsBtn.onclick = e => {
        e.preventDefault();
        this._handleStepTransition();
      };
    }

    const checkoutBtn = document.querySelector('[data-next-action="checkout"]');
    if (checkoutBtn) {
      checkoutBtn.onclick = e => {
        e.preventDefault();
        if (!this._isComplete()) {
          this._highlightIncompleteSlots();
        } else {
          // All selections complete, redirect to checkout
          const urlParams = new URLSearchParams(window.location.search);
          const debugParam = urlParams.get('debug');
          const redirectUrl = '/bareearth/checkout-billing' + (debugParam === 'true' ? '?debug=true' : '');
          window.location.href = redirectUrl;
        }
      };
    }
  }

  _initState() {
    const selected = document.querySelector('.os-card.next-selected');
    const tier = selected ? +selected.getAttribute('data-next-tier') : 1;
    this.currentTier = tier;
    this._updateSlots(tier);
  }

  async selectTier(tier, skipCartUpdate = false) {
    if (tier === this.currentTier) return;

    const prev = this.currentTier;
    this.currentTier = tier;

    // Update UI
    document.querySelectorAll('[data-next-tier]').forEach(card => {
      const t = +card.getAttribute('data-next-tier');
      card.classList.toggle('next-selected', t === tier);
      const radio = card.querySelector('.radio-style-1');
      if (radio) radio.setAttribute('data-selected', t === tier);
    });

    this._updateSlots(tier);
    await this._applyProfile(tier);

    // Copy selections from slot 1 to new slots
    if (tier > prev) {
      const slot1 = this.selectedVariants.get(1);
      if (slot1?.color && slot1?.size) {
        for (let i = prev + 1; i <= tier; i++) {
          this.selectedVariants.set(i, { ...slot1 });
          this._updateSlot(i, slot1);
          this._updateSlotPrice(i);
        }
      }
    }

    // Only update cart if not explicitly skipped (prevents loops)
    if (!skipCartUpdate) {
      this._cartDebounce();
    }
    this._updateCTA();
  }

  _updateSlots(tier) {
    const container = document.querySelector('.os-slots');
    if (!container) return;

    const template = container.querySelector('[next-tier-slot="1"]');
    
    // Hide slots beyond tier
    container.querySelectorAll('[next-tier-slot]').forEach(slot => {
      const num = +slot.getAttribute('next-tier-slot');
      slot.style.display = num > tier ? 'none' : 'flex';
      slot.classList.toggle('active', num <= tier);
    });

    // Create missing slots
    for (let i = 2; i <= tier; i++) {
      if (!container.querySelector(`[next-tier-slot="${i}"]`) && template) {
        const slot = template.cloneNode(true);
        slot.setAttribute('next-tier-slot', i);
        const label = slot.querySelector('.os-slot__step div');
        if (label) label.textContent = `Set ${String(i).padStart(2, '0')}`;
        container.appendChild(slot);
      }
    }

    // Populate all visible slots
    for (let i = 1; i <= tier; i++) {
      const slot = container.querySelector(`[next-tier-slot="${i}"]`);
      if (slot) {
        this._populateDropdowns(slot, i);
        this._updateSlotPrice(i);
      }
    }
  }

  _updateSlot(slotNum, variants) {
    const slot = document.querySelector(`[next-tier-slot="${slotNum}"]`);
    if (!slot) return;

    ['color', 'size'].forEach(type => {
      if (variants[type]) {
        const dropdown = slot.querySelector(`os-dropdown[next-variant-option="${type}"]`);
        if (dropdown) {
          dropdown.value = variants[type];
          if (type === 'color') {
            this._updateSwatch(dropdown, variants[type]);
            this._updateImage(slot, variants[type]);
          }
        }
      }
    });
  }

  async _applyProfile(tier) {
    const profiles = this.exitDiscountActive ? CONFIG.exitProfiles : CONFIG.profiles;
    const profile = profiles[tier];

    try {
      if (profile && profile !== 'default') {
        await window.next.setProfile(profile);
        // Give the SDK time to update packages after profile change
        await new Promise(resolve => setTimeout(resolve, 100));
        // Re-fetch product ID after profile is applied
        this._getProductId();
      } else {
        await window.next.revertProfile();
        await new Promise(resolve => setTimeout(resolve, 100));
        this._getProductId();
      }
    } catch (error) {
      console.log('Profile application error:', error);
    }
  }

  async activateExitDiscount() {
    console.log('Activating exit discount for tier:', this.currentTier);
    this.exitDiscountActive = true;
    sessionStorage.setItem('grounded-exit-discount-active', 'true');

    // Apply the exit profile
    await this._applyProfile(this.currentTier);

    // Force price updates after profile is applied
    setTimeout(() => {
      console.log('Forcing price update after exit discount activation');
      this._updateAllPrices();
    }, 300);

    const badge = document.createElement('div');
    badge.innerHTML = '🎉 Extra 10% OFF Applied!';
    badge.style.cssText = 'position:fixed;top:20px;right:20px;background:#4CAF50;color:white;padding:10px 20px;border-radius:5px;z-index:9999;';
    document.body.appendChild(badge);
    setTimeout(() => badge.remove(), 5000);
  }

  _handleVariant({ value, component }) {
    const slot = component.closest('[next-tier-slot]');
    if (!slot) return;

    const slotNum = +slot.getAttribute('next-tier-slot');
    const type = component.getAttribute('next-variant-option');

    if (!this.selectedVariants.has(slotNum)) {
      this.selectedVariants.set(slotNum, {});
    }

    const variants = this.selectedVariants.get(slotNum);
    variants[type] = value;
    
    this._saveSelectionsToStorage();

    // Auto-select if OOS
    if (variants.color && variants.size && this._isVariantOOS(slotNum, variants)) {
      const alt = this._findAvailableAlternative(slotNum, type, value);
      if (alt) {
        const otherType = type === 'color' ? 'size' : 'color';
        variants[otherType] = alt;
        this._updateSlot(slotNum, { [otherType]: alt });
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
    
    for (let i = 1; i <= this.currentTier; i++) {
      const v = this.selectedVariants.get(i);
      if (v?.color && v?.size) {
        const pkg = window.next.getPackageByVariantSelection(
          this.baseProductId || this.productId,
          { color: v.color, size: v.size }
        );
        if (pkg) items.push({ packageId: pkg.ref_id, quantity: 1 });
      }
    }

    if (items.length > 0) {
      try {
        await window.next.swapCart(items);
      } catch {
        setTimeout(() => window.next.swapCart(items), 100);
      }
    }
  }

  _setupDropdowns() {
    if (!this.productId) return;
    this._updateSlots(this.currentTier);
  }

  _populateDropdowns(slot, slotNum) {
    // Always use the current productId after profiles are applied
    const pid = this.productId || this.baseProductId;

    console.log(`Populating dropdowns for slot ${slotNum} with productId: ${pid}`);

    const colors = window.next.getAvailableVariantAttributes(pid, 'color');
    const sizes = window.next.getAvailableVariantAttributes(pid, 'size');

    console.log('Available colors:', colors);
    console.log('Available sizes:', sizes);

    this._fillDropdown(slot, 'color', colors, slotNum);
    this._fillDropdown(slot, 'size', sizes, slotNum);
  }

  _fillDropdown(slot, type, options, slotNum) {
    const dropdown = slot.querySelector(`os-dropdown[next-variant-option="${type}"]`);
    const menu = dropdown?.querySelector('os-dropdown-menu');
    if (!menu) return;

    menu.innerHTML = '';
    const currentVariants = this.selectedVariants.get(slotNum) || {};
    
    this._sortOptions(options, type).forEach(opt => {
      const item = document.createElement('os-dropdown-item');
      item.setAttribute('value', opt);
      
      // Check OOS
      const testVariants = { ...currentVariants, [type]: opt };
      if (testVariants.color && testVariants.size) {
        if (this._isVariantOOS(slotNum, testVariants)) {
          item.classList.add('next-oos');
        }
      }
      
      const key = opt.toLowerCase().replace(/\s+/g, '-');
      item.innerHTML = type === 'color' 
        ? `<div class="os-card__toggle-option os--distribute">
            <div class="os-card__variant-toggle-info">
              <div class="os-card__variant-swatch" style="background-color:${CONFIG.colors.styles[key] || '#ccc'}"></div>
              <div class="os-card__variant-toggle-name">${opt}</div>
            </div>
          </div>`
        : `<div class="os-card__toggle-option os--distribute">
            <div class="os-card__variant-toggle-info">
              <div class="os-card__variant-toggle-name">${opt}</div>
            </div>
          </div>`;
      
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
      return (ai ?? 999) - (bi ?? 999);
    });
  }

  _setDefaultsWithoutCart() {
    // Only called when no cart items exist
    const saved = this._loadSelectionsFromStorage();
    const colors = window.next.getAvailableVariantAttributes(this.productId, 'color');
    const sizes = window.next.getAvailableVariantAttributes(this.productId, 'size');

    const defaultColor = colors.find(c => c.toLowerCase().includes('obsidian')) || colors[0];
    const defaultSize = sizes.find(s => s.toLowerCase() === 'single') || sizes[0];

    for (let i = 1; i <= this.currentTier; i++) {
      if (!this.selectedVariants.has(i)) {
        this.selectedVariants.set(i, {});
      }

      const v = this.selectedVariants.get(i);
      const s = saved?.[i];

      // Validate saved selections or use defaults
      if (s?.color && s?.size) {
        if (this._isVariantOOS(i, s)) {
          // Find alternative
          const altColor = this._findAvailable(i, 'color', s.size);
          const altSize = this._findAvailable(i, 'size', s.color);

          v.color = altColor || defaultColor;
          v.size = altSize || defaultSize;
        } else {
          v.color = s.color;
          v.size = s.size;
        }
      } else {
        v.color = s?.color || defaultColor;
        v.size = s?.size || defaultSize;
      }

      this._updateSlot(i, v);
      this._updateSlotPrice(i);
      this._updateStock(document.querySelector(`[next-tier-slot="${i}"]`), i);
    }

    // Debounce cart update
    this._cartDebounce();
  }

  _initStateFromCart(cartData) {
    // Synchronously initialize state from cart without async operations
    if (!cartData?.cartLines || cartData.cartLines.length === 0) {
      this._initState();
      return;
    }

    // Detect tier based on cart items count
    const detectedTier = Math.min(cartData.cartLines.length, 3);
    this.currentTier = detectedTier;

    // Update UI for tier selection
    document.querySelectorAll('[data-next-tier]').forEach(card => {
      const t = +card.getAttribute('data-next-tier');
      card.classList.toggle('next-selected', t === detectedTier);
      const radio = card.querySelector('.radio-style-1');
      if (radio) radio.setAttribute('data-selected', t === detectedTier);
    });

    // Extract variants from cart items
    cartData.cartLines.forEach((item, index) => {
      const slotNum = index + 1;
      if (slotNum <= 3) {
        const variants = this._extractVariantsFromCartItem(item);
        if (variants.color && variants.size) {
          this.selectedVariants.set(slotNum, variants);
        }
      }
    });

    // Update slots
    this._updateSlots(detectedTier);

    // Batch update UI after slots are created
    requestAnimationFrame(() => {
      for (let i = 1; i <= detectedTier; i++) {
        const variants = this.selectedVariants.get(i);
        if (variants) {
          this._updateSlot(i, variants);
          this._updateSlotPrice(i);
          this._updateStock(document.querySelector(`[next-tier-slot="${i}"]`), i);
        }
      }

      // Save restored selections to localStorage
      this._saveSelectionsToStorage();

      // Auto-open step 2 since we have cart items
      this._autoOpenStepTwo();
    });
  }

  _extractVariantsFromCartItem(item) {
    const variants = {};

    // Method 1: Parse from item.product.title (based on cartdata.json structure)
    if (item.product?.title) {
      const title = item.product.title;

      // Try to extract color
      const colorMatch = title.match(/(Obsidian Grey|Chateau Ivory|Scribe Blue|Verdant Sage)/i);
      if (colorMatch) {
        variants.color = colorMatch[1];
      }

      // Try to extract size
      const sizeMatch = title.match(/(Single|Twin|Double|Queen|King|California King)/i);
      if (sizeMatch) {
        variants.size = sizeMatch[1];
      }
    }

    // Method 2: Try to get from package details using packageId
    if (!variants.color || !variants.size) {
      const pkg = window.next.getPackage(item.packageId);
      if (pkg?.product_variant_attribute_values) {
        pkg.product_variant_attribute_values.forEach(attr => {
          if (attr.code === 'color' && attr.value) {
            variants.color = attr.value;
          }
          if (attr.code === 'size' && attr.value) {
            variants.size = attr.value;
          }
        });
      }
    }

    // Method 3: Check if item has variant_attributes directly (fallback)
    if (!variants.color || !variants.size) {
      if (item.variant_attributes) {
        item.variant_attributes.forEach(attr => {
          if (attr.code === 'color' && attr.value) {
            variants.color = attr.value;
          }
          if (attr.code === 'size' && attr.value) {
            variants.size = attr.value;
          }
        });
      }
    }

    return variants;
  }

  _findAvailable(slotNum, type, otherValue) {
    const pid = (slotNum === 1 && this.baseProductId) || this.productId;
    const options = window.next.getAvailableVariantAttributes(pid, type);
    
    for (const opt of options) {
      const test = type === 'color' 
        ? { color: opt, size: otherValue }
        : { color: otherValue, size: opt };
      if (!this._isVariantOOS(slotNum, test)) return opt;
    }
    return null;
  }

  _saveSelectionsToStorage() {
    try {
      const selections = {};
      this.selectedVariants.forEach((v, k) => selections[k] = v);
      localStorage.setItem('grounded-selections', JSON.stringify(selections));
    } catch {}
  }

  _loadSelectionsFromStorage() {
    try {
      return JSON.parse(localStorage.getItem('grounded-selections'));
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

    // Debug logging
    console.log(`Updating slot ${slotNum} price with variants:`, v);
    console.log('Current productId:', this.productId);
    console.log('Base productId:', this.baseProductId);
    console.log('Exit discount active:', this.exitDiscountActive);
    console.log('Current tier:', this.currentTier);

    // IMPORTANT: For tier 2 and 3, we need to use the mapped package IDs
    // The profile should have already been applied at this point

    // First get the base package to find its ref_id
    const basePkg = window.next.getPackageByVariantSelection(
      this.baseProductId || this.productId,
      { color: v.color, size: v.size }
    );

    if (!basePkg) {
      console.log('No base package found for variants:', v);
      this._resetPrice(slot);
      return;
    }

    console.log('Base package found:', basePkg.ref_id, basePkg.name, basePkg.price);

    // Now check if we need to map to a different package based on tier/profile
    let finalPkg = basePkg;

    if (this.currentTier > 1 || this.exitDiscountActive) {
      // Determine which profile mapping to use
      const profileName = this.exitDiscountActive
        ? CONFIG.exitProfiles[this.currentTier]
        : CONFIG.profiles[this.currentTier];

      console.log('Looking for profile:', profileName);

      // Get the mapped package ID from our config
      const mappedId = CONFIG.profileDefinitions[profileName]?.packageMappings[basePkg.ref_id];

      console.log('Mapped package ID:', mappedId, 'from base ref_id:', basePkg.ref_id);

      if (mappedId) {
        // Try to get the mapped package
        const mappedPkg = window.next.getPackage(mappedId);

        if (mappedPkg) {
          console.log('Found mapped package:', mappedPkg.ref_id, mappedPkg.name, mappedPkg.price);
          finalPkg = mappedPkg;
        } else {
          console.log('Mapped package not found, using base package');
        }
      } else {
        console.log('No mapping found for base package ref_id:', basePkg.ref_id);
      }
    }

    // Display the final package price
    this._displayPrice(slot, finalPkg);
  }

  _displayPrice(slot, pkg) {
    const price = parseFloat(pkg.price);
    const retail = parseFloat(pkg.price_retail);

    const priceEl = slot.querySelector('[data-option="price"]');
    const regEl = slot.querySelector('[data-option="reg"]');

    if (priceEl) priceEl.textContent = `$${price.toFixed(2)}`;
    if (regEl) regEl.textContent = `$${retail.toFixed(2)}`;

    const pctEl = slot.querySelector('[data-option="savingPct"]');
    if (pctEl && retail > price) {
      pctEl.textContent = `${Math.round(((retail - price) / retail) * 100)}%`;
    }

    const priceContainer = slot.querySelector('.os-card__price.os--current');
    if (priceContainer) {
      priceContainer.innerHTML = `<span data-option="price">$${price.toFixed(2)}</span>/ea`;
    }
  }

  _resetPrice(slot) {
    ['[data-option="reg"]', '[data-option="price"]', '[data-option="savingPct"]'].forEach((sel, i) => {
      const el = slot.querySelector(sel);
      if (el) el.textContent = ['$XX.XX', '$XX.XX', 'XX%'][i];
    });
  }

  _updateStock(slot, slotNum) {
    if (!slot) return;
    
    const v = this.selectedVariants.get(slotNum) || {};

    ['color', 'size'].forEach(type => {
      const dropdown = slot.querySelector(`os-dropdown[next-variant-option="${type}"]`);
      dropdown?.querySelectorAll('os-dropdown-item').forEach(item => {
        const val = item.getAttribute('value');
        const check = type === 'color' 
          ? { color: val, size: v.size }
          : { color: v.color, size: val };
        
        if (check.color && check.size) {
          item.classList.toggle('next-oos', this._isVariantOOS(slotNum, check));
        }
      });
    });
  }

  _updateSavings() {
    const savings = this.exitDiscountActive ? CONFIG.savings.exit : CONFIG.savings.normal;
    
    [1, 2, 3].forEach(tier => {
      document.querySelectorAll(
        `[data-next-tier="${tier}"] [data-next-display*="bestSavingsPercentage"], 
         [data-next-tier="${tier}"] .next-cart-has-items`
      ).forEach(el => {
        if (el) el.textContent = savings[tier] + '%';
      });
    });
  }

  _updateCTA() {
    const complete = this._isComplete();
    document.querySelector('[data-cta="selection-pending"]')?.classList.toggle('active', !complete);
    document.querySelector('[data-cta="selection-complete"]')?.classList.toggle('active', complete);
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
      Object.entries(CONFIG.profileDefinitions).forEach(([id, profile]) => {
        window.next.registerProfile({
          id,
          name: profile.name,
          packageMappings: profile.packageMappings
        });
      });
    } catch {}
  }

  _setupListeners() {
    // Listen for profile changes with proper event data
    window.next.on('profile:applied', (data) => {
      console.log('Profile applied event received:', data);
      this._onProfileChanged(data);
    });

    window.next.on('profile:reverted', (data) => {
      console.log('Profile reverted event received:', data);
      this._onProfileChanged(data);
    });

    // Also listen for cart changes that might be profile-related
    window.next.on('cart:updated', () => {
      // Check if a profile is active and update prices
      if (this.profileUpdatePending) {
        this.profileUpdatePending = false;
        this._updateAllPrices();
      }
    });
  }
  
  _onProfileChanged(eventData) {
    console.log('Profile changed, updating prices...', eventData);

    // Mark that we're expecting a profile update
    this.profileUpdatePending = true;

    // Re-fetch the campaign data and product ID
    const campaign = window.next.getCampaignData();
    console.log('Updated campaign data:', campaign);

    // Update the product ID from the refreshed campaign data
    this.productId = campaign?.packages?.[0]?.product_id;
    console.log('Updated product ID:', this.productId);

    // Force immediate price updates
    setTimeout(() => {
      this._updateAllPrices();
      this.profileUpdatePending = false;
    }, 200);
  }

  _updateAllPrices() {
    console.log('Updating all prices for tier:', this.currentTier);

    // Re-populate dropdowns with new profile's packages
    for (let i = 1; i <= this.currentTier; i++) {
      const slot = document.querySelector(`[next-tier-slot="${i}"]`);
      if (slot) {
        // Update the dropdown options
        this._populateDropdowns(slot, i);

        // Force re-selection of current variants
        const variants = this.selectedVariants.get(i);
        if (variants?.color && variants?.size) {
          this._updateSlot(i, variants);
        }
      }
    }

    // Update all prices with new profile pricing
    for (let i = 1; i <= this.currentTier; i++) {
      this._updateSlotPrice(i);
    }

    // Update savings display
    this._updateSavings();

    console.log('Price update complete');
  }

  _handleStepTransition() {
    const stepTwo = document.querySelector('[data-next-component="step-two"]');
    if (stepTwo) {
      // Remove inactive class and add animation class to show step two
      stepTwo.classList.remove('is-inactive');
      stepTwo.classList.add('step-revealed');

      // Hide the first step's CTA wrapper
      const quantityCTA = document.querySelector('[data-next-component="quantity-cta"]');
      if (quantityCTA) {
        quantityCTA.style.display = 'none';
      }

      // Smooth scroll to step two with offset for more top spacing
      setTimeout(() => {
        const elementPosition = stepTwo.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - 100; // 100px offset from top

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }, 100);
    }
  }

  _autoOpenStepTwo() {
    // Similar to _handleStepTransition but without scrolling
    const stepTwo = document.querySelector('[data-next-component="step-two"]');
    if (stepTwo) {
      // Remove inactive class to show step two (no animation on page load)
      stepTwo.classList.remove('is-inactive');

      // Hide the first step's CTA wrapper
      const quantityCTA = document.querySelector('[data-next-component="quantity-cta"]');
      if (quantityCTA) {
        quantityCTA.style.display = 'none';
      }
    }
  }

  _highlightIncompleteSlots() {
    let hasIncomplete = false;

    for (let i = 1; i <= this.currentTier; i++) {
      const v = this.selectedVariants.get(i);
      const slot = document.querySelector(`[next-tier-slot="${i}"]`);

      if (!v?.color || !v?.size) {
        hasIncomplete = true;

        // Add visual feedback for incomplete selection
        if (slot) {
          slot.classList.add('error-highlight');

          // Remove error highlight after animation
          setTimeout(() => {
            slot.classList.remove('error-highlight');
          }, 2000);

          // Scroll to first incomplete slot
          if (hasIncomplete) {
            slot.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
            hasIncomplete = false; // Only scroll to first one
          }
        }

        // Show error message for missing selections
        const missing = [];
        if (!v?.color) missing.push('color');
        if (!v?.size) missing.push('size');

        this._showErrorMessage(`Please select ${missing.join(' and ')} for Set ${String(i).padStart(2, '0')}`);
        break;
      }
    }
  }

  _showErrorMessage(message) {
    // Create or update error message element
    let errorEl = document.querySelector('.selection-error-message');

    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.className = 'selection-error-message';
      errorEl.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #ff4444;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-size: 14px;
        font-weight: 500;
        animation: slideDown 0.3s ease;
      `;
      document.body.appendChild(errorEl);
    }

    errorEl.textContent = message;
    errorEl.style.display = 'block';

    // Auto-hide after 3 seconds
    setTimeout(() => {
      errorEl.style.display = 'none';
    }, 3000);
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
  
  // Consolidated OOS checking
  _isVariantOOS(slotNum, variant) {
    if (!variant.color || !variant.size) return false;
    
    const pid = (slotNum === 1 && this.baseProductId) || this.productId;
    const pkg = window.next.getPackageByVariantSelection(pid, variant);
    
    return !pkg || pkg.product_inventory_availability === 'out_of_stock' || 
           pkg.product_purchase_availability === 'unavailable';
  }
  
  _findAvailableAlternative(slotNum, changedType, newValue) {
    const pid = (slotNum === 1 && this.baseProductId) || this.productId;
    const slotVariants = this.selectedVariants.get(slotNum);
    const options = window.next.getAvailableVariantAttributes(pid, 
      changedType === 'color' ? 'size' : 'color');
    
    const current = changedType === 'color' ? slotVariants.size : slotVariants.color;
    
    // Try to keep current value
    const test = changedType === 'color' 
      ? { color: newValue, size: current }
      : { color: current, size: newValue };
    
    if (!this._isVariantOOS(slotNum, test)) return current;
    
    // Find alternative
    for (const opt of options) {
      const variant = changedType === 'color'
        ? { color: newValue, size: opt }
        : { color: opt, size: newValue };
      if (!this._isVariantOOS(slotNum, variant)) return opt;
    }
    
    return null;
  }
}

// Progress Bar
class ProgressBar {
  constructor() {
    this.items = document.querySelectorAll('[data-progress]');
    this.sections = document.querySelectorAll('[data-progress-trigger]');
    this.completed = new Set();
    this._init();
  }

  _init() {
    const check = () => {
      const center = window.pageYOffset + window.innerHeight / 2;
      
      this.sections.forEach(s => {
        const rect = s.getBoundingClientRect();
        const bottom = window.pageYOffset + rect.top + rect.height;
        if (center > bottom) {
          this.completed.add(s.getAttribute('data-progress-trigger'));
        }
      });
      
      let active = null;
      for (const s of this.sections) {
        const rect = s.getBoundingClientRect();
        const top = window.pageYOffset + rect.top;
        if (center >= top && center <= top + rect.height) {
          active = s.getAttribute('data-progress-trigger');
          break;
        }
      }
      
      this.items.forEach(item => {
        const name = item.getAttribute('data-progress');
        item.classList.remove('active', 'completed');
        if (this.completed.has(name)) {
          item.classList.add('completed');
        } else if (name === active) {
          item.classList.add('active');
        }
      });
    };
    
    const handleScroll = () => requestAnimationFrame(check);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    check();
  }
}

// Register elements
customElements.define('os-dropdown', OSDropdown);
customElements.define('os-dropdown-menu', OSDropdownMenu);
customElements.define('os-dropdown-item', OSDropdownItem);

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from {
      transform: translateX(-50%) translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
  }

  .error-highlight {
    animation: errorPulse 0.5s ease-in-out 2;
    border: 2px solid #ff4444 !important;
    background-color: rgba(255, 68, 68, 0.05) !important;
  }

  @keyframes errorPulse {
    0% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
    100% { transform: translateX(0); }
  }

  [data-next-component="step-two"].step-revealed {
    animation: fadeInUp 0.4s ease;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);

// Initialize
window.addEventListener('next:initialized', () => {
  window.tierController = new TierController();

  // Add global debug method to manually update prices
  window.updatePrices = () => {
    console.log('Manually triggering price update...');
    if (window.tierController) {
      window.tierController._getProductId();
      window.tierController._updateAllPrices();
    }
  };

  // Add method to check current profile
  window.checkProfile = () => {
    const campaign = window.next.getCampaignData();
    const activeProfile = window.next.getActiveProfile ? window.next.getActiveProfile() : 'unknown';
    console.log('Active profile:', activeProfile);
    console.log('Campaign packages:', campaign?.packages?.length);
    console.log('First package:', campaign?.packages?.[0]);
    return activeProfile;
  };

  // Debug method to check if mapped packages exist
  window.checkMappedPackages = () => {
    console.log('Checking if mapped packages exist...');

    // Check for 2-pack mapping for Obsidian Grey / Single
    const pkg25 = window.next.getPackage(25);
    console.log('Package 25 (2-pack Obsidian Grey/Single):', pkg25);

    const pkg49 = window.next.getPackage(49);
    console.log('Package 49 (3-pack Obsidian Grey/Single):', pkg49);

    const pkg74 = window.next.getPackage(74);
    console.log('Package 74 (exit discount Obsidian Grey/Single):', pkg74);

    return { pkg25, pkg49, pkg74 };
  };

  const btn = document.querySelector('[os-checkout="verify-step"]');
  if (btn) {
    btn.onclick = e => {
      if (window.tierController && !window.tierController.handleVerifyClick()) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
  }
  
  // Exit intent
  window.next.exitIntent({
    image: '../../images/groundedsheets/exit-intent.png',
    action: async () => {
      if (window.tierController) {
        await window.tierController.activateExitDiscount();
      } else {
        await window.next.setProfile('exit_10');
      }
    }
  });
});

// Progress bar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.progressBar = new ProgressBar();
  });
} else {
  window.progressBar = new ProgressBar();
}
