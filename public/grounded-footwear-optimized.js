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
    
    // Initialize SDK with profiles if available
    if (window.nextConfig?.profiles && window.next.registerProfiles) {
      try {
        window.next.registerProfiles(window.nextConfig.profiles);
      } catch (e) {
        // SDK will pick up profiles automatically from window.nextConfig
      }
    }
    
    // Setup listeners FIRST before any profile changes
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
    
    // Update savings immediately and after delays
    this._updateSavings();
    setTimeout(() => this._updateSavings(), 500);
    setTimeout(() => this._updateSavings(), 1000);
    
  }

  _waitForSDK() {
    return new Promise(resolve => {
      const check = () => {
        // Wait for SDK and config to be ready
        if (window.next?.getCampaignData && window.next?.getPackage && window.nextConfig) {
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
        this._updateSlotVisibility(tier);
      }
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

    this._updateSlotVisibility(tier);

    // Apply profile and copy selections
    await this._applyProfile(tier);
    this._getProductId();
    
    // Re-populate dropdowns with new tier's products
    this._setupDropdowns();

    // Copy selections from slot 1 to new slots
    if (tier > prev) {
      const slot1 = this.selectedVariants.get(1);
      if (slot1?.color && slot1?.size) {
        for (let i = prev + 1; i <= tier; i++) {
          this.selectedVariants.set(i, { ...slot1 });
          this._updateSlot(i, slot1);
        }
      }
    }

    // Force update all prices
    for (let i = 1; i <= tier; i++) {
      this._updateSlotPrice(i);
    }

    await this._updateCart();
    this._updateCTA();
  }

  _updateSlotVisibility(tier) {
    document.querySelectorAll('[next-tier-slot]').forEach(slot => {
      const num = parseInt(slot.getAttribute('next-tier-slot'));
      const active = num <= tier;
      slot.classList.toggle('active', active);
      slot.style.display = active ? 'flex' : 'none';
    });
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
        // Check if profile exists in config before trying to apply
        if (window.nextConfig?.profiles?.[profile]) {
          await window.next.setProfile(profile);
        } else {
          console.warn(`Profile ${profile} not found in config, using default`);
          await window.next.revertProfile();
        }
      } else {
        await window.next.revertProfile();
      }
    } catch (error) {
      console.warn(`Failed to apply profile ${profile}, using default pricing`, error);
      // Continue with default pricing rather than breaking
      try {
        await window.next.revertProfile();
      } catch {}
    }
  }

  async activateExitDiscount() {
    this.exitDiscountActive = true;
    sessionStorage.setItem('grounded-exit-discount-active', 'true');
    
    await this._applyProfile(this.currentTier);
    this._getProductId();
    this._updatePrices();
    this._updateSavings();
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

    document.querySelectorAll('[next-tier-slot]').forEach(slot => {
      const num = parseInt(slot.getAttribute('next-tier-slot'));
      if (num <= this.currentTier) {
        this._populateDropdowns(slot, num);
      }
    });
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
    sorted.forEach(opt => {
      const item = document.createElement('os-dropdown-item');
      item.setAttribute('value', opt);
      
      // Check if this option is out of stock
      const isOutOfStock = this._isVariantOutOfStock(slotNum, { [type]: opt });
      if (isOutOfStock) {
        item.classList.add('next-oos');
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
      
      if (!v.color) {
        v.color = saved?.color || defaultColor;
        if (v.color) this._updateSlot(i, { color: v.color });
      }
      
      if (!v.size) {
        v.size = saved?.size || defaultSize;
        if (v.size) this._updateSlot(i, { size: v.size });
      }
      
      this._updateSlotPrice(i);
      this._updateStock(document.querySelector(`[next-tier-slot="${i}"]`), i);
    }

    await this._updateCart();
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
      
      if (profileName && window.nextConfig?.profiles?.[profileName]?.packageMappings) {
        const mappedId = window.nextConfig.profiles[profileName].packageMappings[basePkg.ref_id];
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

  _setupListeners() {
    window.next.on('profile:applied', async () => {
      this._getProductId();
      // Re-setup dropdowns to get new mapped packages
      this._setupDropdowns();
      // Update all slot prices with new profile
      for (let i = 1; i <= this.currentTier; i++) {
        this._updateSlotPrice(i);
      }
      this._updateSavings();
    });
    
    window.next.on('profile:reverted', async () => {
      this._getProductId();
      // Re-setup dropdowns to get original packages
      this._setupDropdowns();
      // Update all slot prices
      for (let i = 1; i <= this.currentTier; i++) {
        this._updateSlotPrice(i);
      }
      this._updateSavings();
    });
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