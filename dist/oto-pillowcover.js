// Pillow Cover Upsell System
// Auto-matches sheet selections from previous page

// Keep existing dropdown components (reuse from sheets page)
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

// Simple LoadingOverlay implementation
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

    setTimeout(() => {
      if (this.overlay && this.overlay.parentNode) {
        this.overlay.parentNode.removeChild(this.overlay);
        this.overlay = null;
      }
    }, 500);
  }
}

// Pillow Cover Controller - Auto-matches sheet selections
class PillowCoverController {
  constructor() {
    this.sheetsQuantity = 0;
    this.currentQuantity = 1;
    this.sheetSelections = null;
    this.selectedVariants = new Map();
    this.pillowSize = null;
    this.variantsContainer = null;
    this.quantityButtons = null;
    this.acceptButton = null;
    this.declineButton = null;
    this.loadingOverlay = new LoadingOverlay();

    // Package mapping for pillow covers
    this.packageMapping = {
      'double/queen': {
        'obsidian grey': 170,
        'chateau ivory': 171,
        'scribe blue': 172,
        'verdant sage': 173
      },
      'king': {
        'obsidian grey': 174,
        'chateau ivory': 175,
        'scribe blue': 176,
        'verdant sage': 177
      }
    };

    this.init();
  }

  async init() {
    await this._waitForSDK();
    this._getSheetSelectionsFromStorage();
    this._getQuantityFromURL();
    this._determinePillowSize();
    this._cacheElements();
    this._bindEvents();
    this._initializeRows();
    this._updatePricing();
  }

  _waitForSDK() {
    return new Promise(resolve => {
      const check = () => {
        if (window.next?.addUpsell && window.next?.getPackage) {
          resolve();
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  }

  _getSheetSelectionsFromStorage() {
    try {
      const stored = sessionStorage.getItem('sheet-selections');
      if (stored) {
        this.sheetSelections = JSON.parse(stored);
        console.log('Retrieved sheet selections from storage:', this.sheetSelections);
      }
    } catch (error) {
      console.error('Failed to retrieve sheet selections:', error);
    }
  }

  _getQuantityFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    this.sheetsQuantity = parseInt(urlParams.get('quantity')) || 0;

    // If we have sheet selections in storage, use that quantity
    if (this.sheetSelections?.quantity) {
      this.sheetsQuantity = this.sheetSelections.quantity;
      this.currentQuantity = this.sheetsQuantity; // Auto-select same quantity
    }

    console.log('Sheets quantity:', this.sheetsQuantity);

    if (this.sheetsQuantity === 0) {
      console.log('User declined previous offers, redirecting...');
      this._redirectToNext();
    }
  }

  _determinePillowSize() {
    // Based on the rules:
    // Quantity 1-4: Double/Queen pillows
    // Quantity 5-6: King pillows
    if (this.sheetsQuantity >= 5) {
      this.pillowSize = 'king';
    } else {
      this.pillowSize = 'double/queen';
    }

    console.log('Pillow size determined:', this.pillowSize);
  }

  _cacheElements() {
    this.variantsContainer = document.querySelector('.os-card__variant-options');
    this.quantityButtons = document.querySelectorAll('[data-next-upsell-quantity-toggle]');
    this.acceptButton = document.querySelector('[data-next-upsell-action="add"]');
    this.declineButton = document.querySelector('[data-next-upsell-action="skip"]');
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
    if (this.declineButton) {
      this.declineButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.declineUpsell();
      });
    }

    // Listen for variant selections
    document.addEventListener('variantSelected', (e) => this._handleVariantSelection(e.detail));
  }

  _initializeRows() {
    // Auto-select quantity button based on sheets quantity
    this.quantityButtons.forEach(btn => {
      const btnQty = parseInt(btn.getAttribute('data-next-upsell-quantity-toggle'));
      btn.classList.toggle('next-selected', btnQty === this.currentQuantity);
    });

    // Create rows based on quantity
    this._updateRows(this.currentQuantity);

    // If we have sheet selections, auto-populate the colors
    if (this.sheetSelections?.selections) {
      this._autoPopulateFromSheets();
    }
  }

  _autoPopulateFromSheets() {
    const allRows = this.variantsContainer.querySelectorAll('.os-card__upsell-grid');

    this.sheetSelections.selections.forEach((sheetSelection, index) => {
      const rowNumber = index + 1;
      const row = allRows[index];

      if (row) {
        // Store the selection
        this.selectedVariants.set(rowNumber, {
          color: sheetSelection.color
        });

        // Update the color dropdown
        const colorDropdown = row.querySelector('os-dropdown[next-variant-option="color"]');
        if (colorDropdown) {
          // Populate dropdown first
          this._populateColorDropdown(colorDropdown);
          // Then set the value
          colorDropdown.value = sheetSelection.color;
        }

        console.log(`Auto-populated row ${rowNumber} with color: ${sheetSelection.color}`);
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

    // Populate color dropdown
    const colorDropdown = newRow.querySelector('os-dropdown[next-variant-option="color"]');
    if (colorDropdown) {
      this._populateColorDropdown(colorDropdown);
    }

    // Hide size dropdown if it exists (pillow covers only need color)
    const sizeDropdown = newRow.querySelector('os-dropdown[next-variant-option="size"]');
    if (sizeDropdown) {
      sizeDropdown.style.display = 'none';
    }

    this.variantsContainer.appendChild(newRow);

    // Auto-populate from sheet selection if available
    if (this.sheetSelections?.selections[rowNumber - 1]) {
      const sheetSelection = this.sheetSelections.selections[rowNumber - 1];
      this.selectedVariants.set(rowNumber, {
        color: sheetSelection.color
      });

      if (colorDropdown) {
        colorDropdown.value = sheetSelection.color;
      }
    } else {
      // Copy from row 1 if no sheet selection
      const row1Variants = this.selectedVariants.get(1);
      if (row1Variants) {
        this.selectedVariants.set(rowNumber, { ...row1Variants });
        if (colorDropdown) colorDropdown.value = row1Variants.color;
      }
    }
  }

  _populateColorDropdown(dropdown) {
    const menu = dropdown.querySelector('os-dropdown-menu');
    if (!menu) return;

    // Clear existing items
    menu.innerHTML = '';

    // Color options
    const colors = [
      { value: 'Obsidian Grey', display: 'Obsidian Grey' },
      { value: 'Chateau Ivory', display: 'Chateau Ivory' },
      { value: 'Scribe Blue', display: 'Scribe Blue' },
      { value: 'Verdant Sage', display: 'Verdant Sage' }
    ];

    colors.forEach(color => {
      const item = document.createElement('os-dropdown-item');
      item.setAttribute('value', color.value);
      item.innerHTML = `
        <div class="os-card__toggle-option">
          <div class="os-card__variant-toggle-info">
            <div class="os-card__variant-toggle-name">${color.display}</div>
          </div>
        </div>
      `;
      menu.appendChild(item);
    });
  }

  _handleVariantSelection({ value, component }) {
    const row = component.closest('.os-card__upsell-grid');
    if (!row) return;

    // Get row number
    const rowNumberElement = row.querySelector('.os-card__variant-number div');
    const rowNumber = parseInt(rowNumberElement?.textContent.replace('#', '') || '1');

    const variantType = component.getAttribute('next-variant-option');

    if (variantType === 'color') {
      if (!this.selectedVariants.has(rowNumber)) {
        this.selectedVariants.set(rowNumber, {});
      }

      const rowVariants = this.selectedVariants.get(rowNumber);
      rowVariants.color = value;

      console.log(`Row ${rowNumber} - Selected color: ${value}`);

      this._updatePricing();
    }
  }

  _updatePricing() {
    let totalRetail = 0;
    let totalSale = 0;

    // Get a sample package to determine pricing
    const samplePackageId = this.packageMapping[this.pillowSize]?.['obsidian grey'];
    if (!samplePackageId) return;

    const samplePackage = window.next.getPackage(samplePackageId);
    if (!samplePackage) {
      console.error('Could not fetch package for pricing:', samplePackageId);
      return;
    }

    const unitPrice = parseFloat(samplePackage.price);
    const unitRetailPrice = parseFloat(samplePackage.price_retail);

    totalRetail = unitRetailPrice * this.currentQuantity;
    totalSale = unitPrice * this.currentQuantity;

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
    this.loadingOverlay.show();

    try {
      const upsellItems = [];

      // Collect all selected items
      for (let i = 1; i <= this.currentQuantity; i++) {
        const variants = this.selectedVariants.get(i);

        if (variants?.color) {
          const colorKey = variants.color.toLowerCase();
          const packageId = this.packageMapping[this.pillowSize]?.[colorKey];

          if (packageId) {
            upsellItems.push({
              packageId: packageId,
              quantity: 1
            });

            console.log(`Row ${i} - Adding pillow cover:`, {
              color: variants.color,
              size: this.pillowSize,
              packageId: packageId
            });
          }
        }
      }

      if (upsellItems.length === 0) {
        alert('Please select colors for all pillow covers');
        throw new Error('No valid items selected');
      }

      // Add upsells using the Next SDK
      const upsellData = {
        items: upsellItems.map(item => ({
          packageId: item.packageId,
          quantity: item.quantity
        }))
      };

      console.log('Adding pillow cover upsells:', upsellData);

      await window.next.addUpsell(upsellData);

      console.log('✅ Pillow covers added successfully');

      // Redirect to next page
      this._redirectToNext(true);

    } catch (error) {
      console.error('❌ Failed to add pillow covers:', error);
      this.loadingOverlay.hide();
      alert('Failed to add pillow covers. Please try again.');

      // Re-enable button
      this.acceptButton.classList.remove('is-submitting');
      this.acceptButton.disabled = false;
    }
  }

  declineUpsell() {
    console.log('Declining pillow cover offer');
    this._redirectToNext(false);
  }

  _redirectToNext(accepted = false) {
    // Get redirect URL from meta tag
    const metaName = accepted ? 'next-upsell-accept-url' : 'next-upsell-decline-url';
    const urlMeta = document.querySelector(`meta[name="${metaName}"]`);
    const redirectUrl = urlMeta?.getAttribute('content');

    if (redirectUrl) {
      const url = new URL(redirectUrl, window.location.origin);

      // Pass the sheets quantity to next page
      url.searchParams.set('quantity', this.sheetsQuantity);

      // Add pillow cover info if accepted
      if (accepted) {
        url.searchParams.set('pillowcovers', this.currentQuantity);
      }

      // Preserve existing parameters
      const currentParams = new URLSearchParams(window.location.search);
      ['debug', 'debugger', 'ref_id'].forEach(param => {
        if (currentParams.has(param)) {
          url.searchParams.set(param, currentParams.get(param));
        }
      });

      const finalUrl = url.pathname + url.search;
      console.log('Redirecting to:', finalUrl);
      window.location.href = finalUrl;
    } else {
      console.warn('No redirect URL found');
    }
  }
}

// Initialize when SDK is ready
window.addEventListener('next:initialized', function() {
  window.pillowCoverController = new PillowCoverController();
});

// If SDK is already initialized
if (window.next?.addUpsell) {
  window.pillowCoverController = new PillowCoverController();
}