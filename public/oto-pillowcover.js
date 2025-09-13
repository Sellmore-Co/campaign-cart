// Grounded Sheets Upsell System
// Dynamic row creation based on quantity selection with upsell handling

// Base element class for custom elements
class ConversionElement extends HTMLElement {
  constructor() {
    super();
    this._mounted = false;
  }

  connectedCallback() {
    if (!this._mounted) {
      this.mount();
      this._mounted = true;
    }
  }

  disconnectedCallback() {
    this._mounted = false;
  }

  mount() {}
}

// Dropdown component
class OSDropdown extends ConversionElement {
  static observedAttributes = ['value', 'name', 'disabled'];
  static openDropdowns = new Set();

  constructor() {
    super();
    this._elements = {};
    this._value = null;
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
    this._elements.menu = this.querySelector('os-dropdown-menu');
  }

  _setupEventListeners() {
    const { toggle } = this._elements;

    toggle.addEventListener('click', e => {
      e.stopPropagation();
      this.toggleDropdown();
    });

    this.addEventListener('dropdown-item-select', this._handleItemSelect.bind(this));

    // Close on outside click
    document.addEventListener('click', e => {
      if (!this.contains(e.target) && this.isOpen) {
        this.closeDropdown();
      }
    });
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
    if (value) {
      this._value = value;
      requestAnimationFrame(() => this._updateToggleContent());
    }
  }

  _setupAccessibility() {
    const { toggle } = this._elements;
    toggle.setAttribute('role', 'button');
    toggle.setAttribute('aria-haspopup', 'listbox');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggleDropdown() {
    this.isOpen ? this.closeDropdown() : this.openDropdown();
  }

  openDropdown() {
    OSDropdown.closeAllDropdowns();

    const { toggle, menu } = this._elements;
    this.setAttribute('open', '');
    toggle.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');

    // Show menu with animation
    menu.style.transition = 'opacity 0.2s ease, visibility 0.2s ease, transform 0.2s ease';
    menu.style.display = 'block';
    menu.style.position = 'absolute';
    menu.style.zIndex = '1000';
    menu.style.top = '100%';
    menu.style.left = '0';
    menu.style.minWidth = '100%';
    menu.style.width = 'max-content';
    menu.style.maxWidth = '300px';
    menu.style.marginTop = '8px';
    menu.style.transform = 'translateY(-4px)';
    menu.style.whiteSpace = 'nowrap';

    // Trigger reflow before animation
    menu.offsetHeight;

    // Animate in
    menu.style.opacity = '1';
    menu.style.visibility = 'visible';
    menu.style.transform = 'translateY(0)';

    OSDropdown.openDropdowns.add(this);
  }

  closeDropdown() {
    const { toggle, menu } = this._elements;

    this.removeAttribute('open');
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');

    // Animate out
    menu.style.opacity = '0';
    menu.style.visibility = 'hidden';
    menu.style.transform = 'translateY(-4px)';

    // Hide after animation completes
    setTimeout(() => {
      if (menu.style.opacity === '0') {
        menu.style.display = 'none';
      }
    }, 200);

    OSDropdown.openDropdowns.delete(this);
  }

  _updateToggleContent() {
    if (!this._elements.toggle || this._value === null) return;

    const selectedItem = this.querySelector(`os-dropdown-item[value="${this._value}"]`);
    const toggleText = this._elements.toggle.querySelector('.os-card__variant-toggle-name');

    if (toggleText && selectedItem) {
      const itemText = selectedItem.querySelector('.os-card__variant-toggle-name')?.textContent;
      if (itemText) {
        toggleText.textContent = itemText;
      }
    }

    // Update image if this is a color dropdown
    if (this.getAttribute('next-variant-option') === 'color') {
      const imgElement = this._elements.toggle.querySelector('img');
      const colorKey = this._value?.toLowerCase().replace(/\s+/g, '-');
      if (imgElement && CONFIG.colors.images[colorKey]) {
        imgElement.src = CONFIG.colors.images[colorKey];
      }
    }
  }

  static closeAllDropdowns() {
    OSDropdown.openDropdowns.forEach(dropdown => dropdown.closeDropdown());
  }

  get value() { return this._value; }
  set value(val) {
    this._updateValue(val);
    const item = this.querySelector(`os-dropdown-item[value="${val}"]`);
    if (item) {
      this._updateSelection(item);
      this._updateToggleContent();
    }
  }

  get isOpen() { return this.hasAttribute('open'); }
}

// Dropdown menu component
class OSDropdownMenu extends ConversionElement {
  mount() {
    this.setAttribute('role', 'listbox');
    // Initial hidden state
    this.style.display = 'none';
    this.style.position = 'absolute';
    this.style.zIndex = '1000';
    this.style.opacity = '0';
    this.style.visibility = 'hidden';
  }
}

// Dropdown item component
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

    this._value = this.getAttribute('value') || '';
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
}

// Register custom elements
customElements.define('os-dropdown', OSDropdown);
customElements.define('os-dropdown-menu', OSDropdownMenu);
customElements.define('os-dropdown-item', OSDropdownItem);

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
  // Size preference order - when current size is unavailable, try these sizes in order
  sizePreferenceOrder: [
    ['King', 'California King', 'Queen', 'Double', 'Single', 'Twin'],
    ['California King', 'King', 'Queen', 'Double', 'Single', 'Twin'],
    ['Queen', 'King', 'California King', 'Double', 'Single', 'Twin'],
    ['Double', 'Queen', 'King', 'Single', 'Twin', 'California King'],
    ['Single', 'Twin', 'Double', 'Queen', 'King', 'California King'],
    ['Twin', 'Single', 'Double', 'Queen', 'King', 'California King']
  ],
  // Upsell package mapping - these are specific package IDs for upsells
  upsellPackageMapping: {
    'obsidian grey': {
      'twin': 146,
      'single': 166,
      'double': 150,
      'queen': 154,
      'king': 158,
      'california king': 162
    },
    'chateau ivory': {
      'twin': 147,
      'single': 167,
      'double': 151,
      'queen': 155,
      'king': 159,
      'california king': 163
    },
    'scribe blue': {
      'twin': 148,
      'single': 168,
      'double': 152,
      'queen': 156,
      'king': 160,
      'california king': 164
    },
    'verdant sage': {
      'twin': 149,
      'single': 169,
      'double': 153,
      'queen': 157,
      'king': 161,
      'california king': 165
    }
  }
};

// Simple LoadingOverlay implementation (mimics SDK version)
class LoadingOverlay {
  constructor() {
    this.overlay = null;
  }

  show() {
    if (this.overlay) return;

    this.overlay = document.createElement('div');
    this.overlay.className = 'next-loading-overlay';
    this.overlay.innerHTML = `
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .next-loading-spinner .spinner {
          width: 30px;
          height: 30px;
          border: 3px solid rgba(0, 0, 0, 0.1);
          border-top-color: var(--brand--color--primary, #000);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
      </style>
      <div class="next-loading-spinner">
        <div class="spinner"></div>
      </div>
    `;

    Object.assign(this.overlay.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: '9999'
    });

    document.body.appendChild(this.overlay);
  }

  hide() {
    if (!this.overlay) return;

    // Hide after a short delay for success feedback
    setTimeout(() => {
      if (this.overlay && this.overlay.parentNode) {
        this.overlay.parentNode.removeChild(this.overlay);
        this.overlay = null;
      }
    }, 500);
  }
}

// Upsell Controller Class
class UpsellController {
  constructor() {
    this.currentQuantity = 1;
    this.selectedVariants = new Map();
    this.variantsContainer = null;
    this.quantityButtons = null;
    this.acceptButton = null;
    this.productId = null;
    this._eventCleanup = [];
    this.loadingOverlay = new LoadingOverlay();

    this.init();
  }

  async init() {
    await this._waitForSDK();
    this._getProductIdFromCampaign();
    this._cacheElements();
    this._bindEvents();
    this._populateDropdowns();
    this._initializeFirstRow();
    this._updatePricing();
  }

  _waitForSDK() {
    return new Promise(resolve => {
      const check = () => {
        if (window.next?.addUpsell && window.next?.getCampaignData) {
          resolve();
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
      // Try to get from cache
      try {
        const cache = JSON.parse(sessionStorage.getItem('next-campaign-cache') || '{}');
        this.productId = cache.campaign?.packages?.[0]?.product_id;
      } catch (error) {
        console.error('Failed to get product ID from cache:', error);
      }
    }

    if (!this.productId) {
      console.error('Warning: Product ID not found. Some features may not work correctly.');
    }
  }

  _cacheElements() {
    this.variantsContainer = document.querySelector('.os-card__variant-options');
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

    // Decline button click
    const declineButton = document.querySelector('[data-next-upsell-action="skip"]');
    if (declineButton) {
      declineButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.declineUpsell();
      });
    }

    // Listen for variant selections from dropdowns
    document.addEventListener('variantSelected', (e) => this._handleVariantSelection(e.detail));
  }

  _populateDropdowns() {
    if (!this.productId) {
      console.error('Cannot populate dropdowns without product ID');
      return;
    }

    // Get available variants from SDK
    const availableColors = window.next.getAvailableVariantAttributes(this.productId, 'color');
    const availableSizes = window.next.getAvailableVariantAttributes(this.productId, 'size');

    // Populate color dropdowns
    const colorDropdowns = document.querySelectorAll('os-dropdown[next-variant-option="color"]');
    colorDropdowns.forEach(dropdown => {
      const menu = dropdown.querySelector('os-dropdown-menu');
      if (menu) {
        // Clear existing items
        menu.innerHTML = '';

        // Add color options based on available variants
        availableColors.forEach(color => {
          const colorKey = color.toLowerCase().replace(/\s+/g, '-');
          const item = document.createElement('os-dropdown-item');
          item.setAttribute('value', color);
          item.innerHTML = `
            <div class="os-card__toggle-option">
              <div class="os-card__variant-toggle-info">
                <div class="os-card__variant-swatch is-upsell" style="background-color: ${CONFIG.colors.styles[colorKey] || '#ccc'}"></div>
                <div class="os-card__variant-toggle-name">${color}</div>
              </div>
            </div>
          `;
          menu.appendChild(item);
        });
      }
    });

    // Populate size dropdowns
    const sizeDropdowns = document.querySelectorAll('os-dropdown[next-variant-option="size"]');
    sizeDropdowns.forEach(dropdown => {
      const menu = dropdown.querySelector('os-dropdown-menu');
      if (menu) {
        // Clear existing items
        menu.innerHTML = '';

        // Add size options based on available variants
        availableSizes.forEach(size => {
          const item = document.createElement('os-dropdown-item');
          item.setAttribute('value', size);
          item.innerHTML = `
            <div class="os-card__toggle-option">
              <div class="os-card__variant-toggle-info">
                <div class="os-card__variant-toggle-name">${size}</div>
              </div>
            </div>
          `;
          menu.appendChild(item);
        });
      }
    });

    // Update stock status for all populated dropdowns
    const allRows = document.querySelectorAll('.os-card__upsell-grid');
    allRows.forEach((row, index) => {
      const rowNumber = index + 1;
      if (this.selectedVariants.has(rowNumber)) {
        this._updateDropdownStockStatus(row, 'color', rowNumber);
        this._updateDropdownStockStatus(row, 'size', rowNumber);
      }
    });
  }

  selectQuantity(quantity) {
    if (quantity === this.currentQuantity) return;

    this.currentQuantity = quantity;

    // Update button states
    this.quantityButtons.forEach(btn => {
      const btnQty = parseInt(btn.getAttribute('data-next-upsell-quantity-toggle'));
      btn.classList.toggle('next-selected', btnQty === quantity);
    });

    // Update rows
    this._updateRows(quantity);

    // Update pricing
    this._updatePricing();
  }

  _updateRows(quantity) {
    const existingRows = this.variantsContainer.querySelectorAll('.os-card__upsell-grid');
    const currentCount = existingRows.length;

    if (quantity > currentCount) {
      // Add new rows
      for (let i = currentCount + 1; i <= quantity; i++) {
        this._createRow(i);
      }
    } else {
      // Hide extra rows
      existingRows.forEach((row, index) => {
        row.style.display = index < quantity ? 'grid' : 'none';
      });
    }
  }

  _createRow(rowNumber) {
    const templateRow = this.variantsContainer.querySelector('.os-card__upsell-grid');
    if (!templateRow) return;

    const newRow = templateRow.cloneNode(true);

    // Update row number
    const numberElement = newRow.querySelector('.os-card__variant-number div');
    if (numberElement) {
      numberElement.textContent = `#${rowNumber}`;
    }

    // Get available variants from SDK
    const availableColors = window.next.getAvailableVariantAttributes(this.productId, 'color');
    const availableSizes = window.next.getAvailableVariantAttributes(this.productId, 'size');

    // Populate dropdowns for new row
    const colorDropdown = newRow.querySelector('os-dropdown[next-variant-option="color"]');
    const sizeDropdown = newRow.querySelector('os-dropdown[next-variant-option="size"]');

    if (colorDropdown) {
      const menu = colorDropdown.querySelector('os-dropdown-menu');
      if (menu) {
        menu.innerHTML = '';
        availableColors.forEach(color => {
          const colorKey = color.toLowerCase().replace(/\s+/g, '-');
          const item = document.createElement('os-dropdown-item');
          item.setAttribute('value', color);
          item.innerHTML = `
            <div class="os-card__toggle-option">
              <div class="os-card__variant-toggle-info">
                <div class="os-card__variant-swatch" style="background-color: ${CONFIG.colors.styles[colorKey] || '#ccc'}"></div>
                <div class="os-card__variant-toggle-name">${color}</div>
              </div>
            </div>
          `;
          menu.appendChild(item);
        });
      }
    }

    if (sizeDropdown) {
      const menu = sizeDropdown.querySelector('os-dropdown-menu');
      if (menu) {
        menu.innerHTML = '';
        availableSizes.forEach(size => {
          const item = document.createElement('os-dropdown-item');
          item.setAttribute('value', size);
          item.innerHTML = `
            <div class="os-card__toggle-option">
              <div class="os-card__variant-toggle-info">
                <div class="os-card__variant-toggle-name">${size}</div>
              </div>
            </div>
          `;
          menu.appendChild(item);
        });
      }
    }

    this.variantsContainer.appendChild(newRow);

    // Copy selection from row 1 if it exists
    const row1Variants = this.selectedVariants.get(1);
    if (row1Variants) {
      this.selectedVariants.set(rowNumber, { ...row1Variants });
      if (colorDropdown) colorDropdown.value = row1Variants.color;
      if (sizeDropdown) sizeDropdown.value = row1Variants.size;
    }
  }

  _initializeFirstRow() {
    if (!this.productId) return;

    // Get available variants from SDK
    const availableColors = window.next.getAvailableVariantAttributes(this.productId, 'color');
    const availableSizes = window.next.getAvailableVariantAttributes(this.productId, 'size');

    // Find default selections
    const defaultColor = availableColors.find(color =>
      color.toLowerCase().includes('obsidian')
    ) || availableColors[0];

    const defaultSize = availableSizes.find(size =>
      size.toLowerCase() === 'king'
    ) || availableSizes[0];

    // Initialize first row with default selection
    const firstRow = this.variantsContainer?.querySelector('.os-card__upsell-grid');
    if (firstRow) {
      const colorDropdown = firstRow.querySelector('os-dropdown[next-variant-option="color"]');
      const sizeDropdown = firstRow.querySelector('os-dropdown[next-variant-option="size"]');

      const defaultVariants = {
        color: defaultColor || 'Obsidian Grey',
        size: defaultSize || 'Single'
      };

      this.selectedVariants.set(1, defaultVariants);

      // Set dropdown values
      if (colorDropdown) {
        colorDropdown.value = defaultVariants.color;
        this._updateColorSwatchInToggle(colorDropdown, defaultVariants.color);
      }
      if (sizeDropdown) sizeDropdown.value = defaultVariants.size;

      // Update stock status for both dropdowns after setting initial values
      this._updateDropdownStockStatus(firstRow, 'color', 1);
      this._updateDropdownStockStatus(firstRow, 'size', 1);
    }
  }

  _updateColorSwatchInToggle(dropdown, colorValue) {
    if (!dropdown || !colorValue) return;

    const toggle = dropdown.querySelector('button, [role="button"]');
    if (!toggle) return;

    const swatch = toggle.querySelector('.os-card__variant-swatch');
    if (swatch) {
      const colorKey = colorValue.toLowerCase().replace(/\s+/g, '-');
      if (CONFIG.colors.styles[colorKey]) {
        swatch.style.backgroundColor = CONFIG.colors.styles[colorKey];
      }
    }

    // Also update the image if present
    const imgElement = toggle.querySelector('img');
    if (imgElement) {
      const colorKey = colorValue.toLowerCase().replace(/\s+/g, '-');
      if (CONFIG.colors.images[colorKey]) {
        imgElement.src = CONFIG.colors.images[colorKey];
      }
    }
  }

  _handleVariantSelection({ value, component }) {
    const row = component.closest('.os-card__upsell-grid');
    if (!row) return;

    // Get row number
    const rowNumberElement = row.querySelector('.os-card__variant-number div');
    const rowNumber = parseInt(rowNumberElement?.textContent.replace('#', '') || '1');

    const variantType = component.getAttribute('next-variant-option');

    if (!this.selectedVariants.has(rowNumber)) {
      this.selectedVariants.set(rowNumber, {});
    }

    const rowVariants = this.selectedVariants.get(rowNumber);
    const previousValue = rowVariants[variantType];
    rowVariants[variantType] = value;

    console.log(`Row ${rowNumber} - Selected ${variantType}: ${value}`);

    // Check if we have both color and size to look up package
    if (rowVariants.color && rowVariants.size) {
      // Log the package lookup
      const testPackage = window.next.getPackageByVariantSelection(
        this.productId,
        { color: rowVariants.color, size: rowVariants.size }
      );

      console.log(`Row ${rowNumber} - Looking up package:`, {
        productId: this.productId,
        color: rowVariants.color,
        size: rowVariants.size,
        foundPackage: testPackage ? {
          id: testPackage.ref_id,
          name: testPackage.name,
          price: testPackage.price,
          priceRetail: testPackage.price_retail,
          inventory: testPackage.product_inventory_availability,
          availability: testPackage.product_purchase_availability
        } : 'NO PACKAGE FOUND'
      });

      const isOOS = this._isCompleteVariantOutOfStock(rowNumber, rowVariants);

      if (isOOS) {
        const alternative = this._findAvailableAlternative(rowNumber, variantType, value, previousValue);

        if (alternative) {
          console.log(`Auto-selecting available ${variantType === 'color' ? 'size' : 'color'}: ${alternative}`);
          const otherType = variantType === 'color' ? 'size' : 'color';
          rowVariants[otherType] = alternative;

          // Update the other dropdown
          const otherDropdown = row.querySelector(`os-dropdown[next-variant-option="${otherType}"]`);
          if (otherDropdown) {
            otherDropdown.value = alternative;

            // If we're auto-selecting a color, update the swatch in the toggle
            if (otherType === 'color') {
              this._updateColorSwatchInToggle(otherDropdown, alternative);
            }
          }

          // Show notification
          this._notifyAutoSelection(variantType, value, otherType, alternative);
        }
      }
    }

    // Update visual elements
    if (variantType === 'color') {
      this._updateColorSwatchInToggle(component, value);
    }

    // Update stock status for this row
    this._updateDropdownStockStatus(row, 'color', rowNumber);
    this._updateDropdownStockStatus(row, 'size', rowNumber);

    this._updatePricing();
  }

  _updateDropdownStockStatus(row, variantType, rowNumber) {
    const dropdown = row.querySelector(`os-dropdown[next-variant-option="${variantType}"]`);
    if (!dropdown) return;

    const rowVariants = this.selectedVariants.get(rowNumber) || {};
    const items = dropdown.querySelectorAll('os-dropdown-item');

    items.forEach(item => {
      const value = item.getAttribute('value');

      let variantToCheck;
      if (variantType === 'color') {
        variantToCheck = { color: value, size: rowVariants.size };
      } else {
        variantToCheck = { color: rowVariants.color, size: value };
      }

      if (variantToCheck.color && variantToCheck.size) {
        const matchingPackage = window.next.getPackageByVariantSelection(
          this.productId,
          variantToCheck
        );

        const isOutOfStock = !matchingPackage ||
          matchingPackage.product_inventory_availability === 'out_of_stock' ||
          matchingPackage.product_purchase_availability === 'unavailable';

        if (isOutOfStock) {
          item.classList.add('next-oos');
        } else {
          item.classList.remove('next-oos');
        }
      }
    });
  }

  _updatePricing() {
    let totalRetail = 0;
    let totalSale = 0;

    for (let i = 1; i <= this.currentQuantity; i++) {
      const variants = this.selectedVariants.get(i);
      if (variants?.color && variants?.size) {
        // Get the upsell package ID from mapping
        const colorKey = variants.color.toLowerCase();
        const sizeKey = variants.size.toLowerCase();
        const upsellPackageId = CONFIG.upsellPackageMapping[colorKey]?.[sizeKey];

        if (upsellPackageId) {
          // Get the upsell package directly by ID
          const upsellPackage = window.next.getPackage(upsellPackageId);

          console.log(`Row ${i} - Pricing lookup:`, {
            color: variants.color,
            size: variants.size,
            upsellPackageId: upsellPackageId,
            upsellPackage: upsellPackage ? {
              id: upsellPackage.ref_id,
              name: upsellPackage.name,
              price: upsellPackage.price,
              priceRetail: upsellPackage.price_retail
            } : 'PACKAGE NOT FOUND'
          });

          if (upsellPackage) {
            const salePrice = parseFloat(upsellPackage.price);
            const retailPrice = parseFloat(upsellPackage.price_retail);
            totalSale += salePrice;
            totalRetail += retailPrice;
          }
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

  _isCompleteVariantOutOfStock(rowNumber, fullVariant) {
    if (!fullVariant.color || !fullVariant.size || !this.productId) {
      return false;
    }

    const matchingPackage = window.next.getPackageByVariantSelection(
      this.productId,
      { color: fullVariant.color, size: fullVariant.size }
    );

    if (matchingPackage) {
      return matchingPackage.product_inventory_availability === 'out_of_stock' ||
             matchingPackage.product_purchase_availability === 'unavailable';
    }

    return true; // No package found means it's unavailable
  }

  _findAvailableAlternative(rowNumber, changedType, newValue, previousValue) {
    const rowVariants = this.selectedVariants.get(rowNumber);

    if (changedType === 'color') {
      // User changed color, find available size using preference order
      const availableSizes = window.next.getAvailableVariantAttributes(this.productId, 'size');
      const currentSize = rowVariants.size;

      // Try to keep current size if available
      if (!this._isCompleteVariantOutOfStock(rowNumber, { color: newValue, size: currentSize })) {
        return currentSize;
      }

      // Get size preference order based on current size
      const sizeOrder = this._getSizePreferenceOrder(currentSize, availableSizes);

      // Try sizes in preference order (next bigger size first)
      for (const size of sizeOrder) {
        if (!this._isCompleteVariantOutOfStock(rowNumber, { color: newValue, size })) {
          return size;
        }
      }
    } else if (changedType === 'size') {
      // User changed size, find available color
      const availableColors = window.next.getAvailableVariantAttributes(this.productId, 'color');
      const currentColor = rowVariants.color;

      // Try to keep current color if available
      if (!this._isCompleteVariantOutOfStock(rowNumber, { color: currentColor, size: newValue })) {
        return currentColor;
      }

      // Find first available color
      for (const color of availableColors) {
        if (!this._isCompleteVariantOutOfStock(rowNumber, { color, size: newValue })) {
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

    // If no specific order found, use available sizes as-is
    if (preferenceOrder.length === 0) {
      return availableSizes;
    }

    // Filter preference order to only include available sizes
    return preferenceOrder.filter(size =>
      availableSizes.some(availSize => availSize.toLowerCase() === size.toLowerCase())
    );
  }

  _notifyAutoSelection(selectedType, selectedValue, autoType, autoValue) {
    // Create a subtle notification
    const notification = document.createElement('div');
    notification.className = 'auto-selection-notification';
    notification.textContent = `Updated ${autoType} to ${autoValue} (in stock)`;
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      z-index: 10000;
      animation: slideInUp 0.3s ease;
      font-size: 14px;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);

    // Dispatch custom event for tracking
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

  async acceptUpsell() {
    // Disable button and show loading
    this.acceptButton.classList.add('is-submitting');
    this.acceptButton.disabled = true;

    // Show loading overlay
    this.loadingOverlay.show();

    try {
      const upsellItems = [];

      console.log('=== ACCEPT UPSELL - Collecting items ===');
      console.log('Product ID being used:', this.productId);

      // Collect all selected items using upsell package mapping
      for (let i = 1; i <= this.currentQuantity; i++) {
        const variants = this.selectedVariants.get(i);
        console.log(`Row ${i} variants:`, variants);

        if (variants?.color && variants?.size) {
          // Use the upsell package mapping instead of SDK lookup
          const colorKey = variants.color.toLowerCase();
          const sizeKey = variants.size.toLowerCase();

          const upsellPackageId = CONFIG.upsellPackageMapping[colorKey]?.[sizeKey];

          console.log(`Row ${i} - Upsell package lookup:`, {
            color: variants.color,
            size: variants.size,
            colorKey: colorKey,
            sizeKey: sizeKey,
            upsellPackageId: upsellPackageId || 'NOT FOUND IN MAPPING'
          });

          if (upsellPackageId) {
            upsellItems.push({
              packageId: upsellPackageId,
              quantity: 1
            });
          } else {
            console.warn(`No upsell package mapping found for ${variants.color} / ${variants.size}`);
          }
        }
      }

      if (upsellItems.length === 0) {
        console.error('No valid items selected');
        alert('Please select color and size for all items');
        return;
      }

      // Add upsells using the Next SDK
      console.log('=== SENDING UPSELLS TO SDK ===');
      console.log('Upsell items to add:', upsellItems);

      // Format the data correctly for the SDK
      const upsellData = {
        items: upsellItems.map(item => ({
          packageId: item.packageId,
          quantity: item.quantity
        }))
      };

      console.log('📦 Formatted upsell data for SDK:', upsellData);

      // Call the addUpsell method with correct format
      await window.next.addUpsell(upsellData);

      // Success - redirect or show success message
      console.log('✅ Upsells added successfully');

      // Get redirect URL from meta tag
      const acceptUrlMeta = document.querySelector('meta[name="next-upsell-accept-url"]');
      const acceptUrl = acceptUrlMeta?.getAttribute('content');

      if (acceptUrl) {
        // Add quantity parameter to URL
        const url = new URL(acceptUrl, window.location.origin);
        url.searchParams.set('quantity', this.currentQuantity);

        // Preserve existing parameters
        const currentParams = new URLSearchParams(window.location.search);
        ['debug', 'debugger', 'ref_id'].forEach(param => {
          if (currentParams.has(param)) {
            url.searchParams.set(param, currentParams.get(param));
          }
        });

        const finalUrl = url.pathname + url.search;

        console.log('Redirecting to:', finalUrl);
        // Keep overlay showing during redirect
        window.location.href = finalUrl;
      } else {
        // Hide overlay after success
        this.loadingOverlay.hide();
      }

    } catch (error) {
      console.error('❌ Failed to add upsells:', error);
      this.loadingOverlay.hide(); // Hide immediately on error
      alert('Failed to add items to your order. Please try again.');
    } finally {
      // Re-enable button
      this.acceptButton.classList.remove('is-submitting');
      this.acceptButton.disabled = false;
    }
  }

  declineUpsell() {
    // Get redirect URL from meta tag
    const declineUrlMeta = document.querySelector('meta[name="next-upsell-decline-url"]');
    const declineUrl = declineUrlMeta?.getAttribute('content');

    if (declineUrl) {
      // Add quantity parameter to URL (0 for decline)
      const url = new URL(declineUrl, window.location.origin);
      url.searchParams.set('quantity', '0');

      // Preserve existing parameters
      const currentParams = new URLSearchParams(window.location.search);
      ['debug', 'debugger', 'ref_id'].forEach(param => {
        if (currentParams.has(param)) {
          url.searchParams.set(param, currentParams.get(param));
        }
      });

      const finalUrl = url.pathname + url.search;

      console.log('Declining upsell, redirecting to:', finalUrl);
      window.location.href = finalUrl;
    } else {
      console.warn('No decline URL found in meta tags');
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