// Keep existing structure but rename to avoid conflicts
const groundedSheetsVariantsOriginal = [
  // Single quantity variants
  { id: 1, size: "Twin", color: "Obsidian Grey", quantity: 1 },
  { id: 2, size: "Twin", color: "Chateau Ivory", quantity: 1 },
  { id: 3, size: "Double", color: "Obsidian Grey", quantity: 1 },
  { id: 4, size: "Double", color: "Chateau Ivory", quantity: 1 },
  { id: 5, size: "Queen", color: "Obsidian Grey", quantity: 1 },
  { id: 6, size: "King", color: "Obsidian Grey", quantity: 1 },
  { id: 7, size: "Queen", color: "Chateau Ivory", quantity: 1 },
  { id: 8, size: "King", color: "Chateau Ivory", quantity: 1 },
  { id: 9, size: "Twin", color: "Scribe Blue", quantity: 1 },
  { id: 10, size: "Double", color: "Scribe Blue", quantity: 1 },
  { id: 11, size: "Queen", color: "Scribe Blue", quantity: 1 },
  { id: 12, size: "King", color: "Scribe Blue", quantity: 1 },
  { id: 13, size: "Twin", color: "Verdant Sage", quantity: 1 },
  { id: 14, size: "Double", color: "Verdant Sage", quantity: 1 },
  { id: 15, size: "Queen", color: "Verdant Sage", quantity: 1 },
  { id: 16, size: "King", color: "Verdant Sage", quantity: 1 },
  { id: 17, size: "Single", color: "Obsidian Grey", quantity: 1 },
  { id: 18, size: "Cali King", color: "Obsidian Grey", quantity: 1 },
  { id: 19, size: "Single", color: "Chateau Ivory", quantity: 1 },
  { id: 20, size: "Cali King", color: "Chateau Ivory", quantity: 1 },
  { id: 21, size: "Single", color: "Scribe Blue", quantity: 1 },
  { id: 22, size: "Cali King", color: "Scribe Blue", quantity: 1 },
  { id: 23, size: "Single", color: "Verdant Sage", quantity: 1 },
  { id: 24, size: "Cali King", color: "Verdant Sage", quantity: 1 },
  
  // 2-pack variants
  { id: 25, size: "Single", color: "Obsidian Grey", quantity: 2 },
  { id: 26, size: "Single", color: "Chateau Ivory", quantity: 2 },
  { id: 27, size: "Single", color: "Scribe Blue", quantity: 2 },
  { id: 28, size: "Single", color: "Verdant Sage", quantity: 2 },
  { id: 29, size: "Twin", color: "Obsidian Grey", quantity: 2 },
  { id: 30, size: "Twin", color: "Chateau Ivory", quantity: 2 },
  { id: 31, size: "Twin", color: "Scribe Blue", quantity: 2 },
  { id: 32, size: "Twin", color: "Verdant Sage", quantity: 2 },
  { id: 33, size: "Double", color: "Obsidian Grey", quantity: 2 },
  { id: 34, size: "Double", color: "Chateau Ivory", quantity: 2 },
  { id: 35, size: "Double", color: "Scribe Blue", quantity: 2 },
  { id: 36, size: "Double", color: "Verdant Sage", quantity: 2 },
  { id: 37, size: "Queen", color: "Obsidian Grey", quantity: 2 },
  { id: 38, size: "Queen", color: "Chateau Ivory", quantity: 2 },
  { id: 39, size: "Queen", color: "Scribe Blue", quantity: 2 },
  { id: 40, size: "Queen", color: "Verdant Sage", quantity: 2 },
  { id: 41, size: "King", color: "Obsidian Grey", quantity: 2 },
  { id: 42, size: "King", color: "Chateau Ivory", quantity: 2 },
  { id: 43, size: "King", color: "Scribe Blue", quantity: 2 },
  { id: 44, size: "King", color: "Verdant Sage", quantity: 2 },
  { id: 45, size: "Cali King", color: "Obsidian Grey", quantity: 2 },
  { id: 46, size: "Cali King", color: "Chateau Ivory", quantity: 2 },
  { id: 47, size: "Cali King", color: "Scribe Blue", quantity: 2 },
  { id: 48, size: "Cali King", color: "Verdant Sage", quantity: 2 },
  
  // 3-pack variants
  { id: 49, size: "Single", color: "Obsidian Grey", quantity: 3 },
  { id: 50, size: "Single", color: "Chateau Ivory", quantity: 3 },
  { id: 51, size: "Single", color: "Scribe Blue", quantity: 3 },
  { id: 52, size: "Single", color: "Verdant Sage", quantity: 3 },
  { id: 53, size: "Twin", color: "Obsidian Grey", quantity: 3 },
  { id: 54, size: "Twin", color: "Chateau Ivory", quantity: 3 },
  { id: 56, size: "Twin", color: "Scribe Blue", quantity: 3 },
  { id: 57, size: "Twin", color: "Verdant Sage", quantity: 3 },
  { id: 58, size: "Double", color: "Obsidian Grey", quantity: 3 },
  { id: 59, size: "Double", color: "Chateau Ivory", quantity: 3 },
  { id: 60, size: "Double", color: "Scribe Blue", quantity: 3 },
  { id: 61, size: "Double", color: "Verdant Sage", quantity: 3 },
  { id: 62, size: "Queen", color: "Obsidian Grey", quantity: 3 },
  { id: 63, size: "Queen", color: "Chateau Ivory", quantity: 3 },
  { id: 64, size: "Queen", color: "Scribe Blue", quantity: 3 },
  { id: 65, size: "Queen", color: "Verdant Sage", quantity: 3 },
  { id: 66, size: "King", color: "Obsidian Grey", quantity: 3 },
  { id: 67, size: "King", color: "Chateau Ivory", quantity: 3 },
  { id: 68, size: "King", color: "Scribe Blue", quantity: 3 },
  { id: 69, size: "King", color: "Verdant Sage", quantity: 3 },
  { id: 70, size: "Cali King", color: "Obsidian Grey", quantity: 3 },
  { id: 71, size: "Cali King", color: "Chateau Ivory", quantity: 3 },
  { id: 72, size: "Cali King", color: "Scribe Blue", quantity: 3 },
  { id: 73, size: "Cali King", color: "Verdant Sage", quantity: 3 },
  
  // Exit 10% discount variants - Single quantity
  { id: 74, size: "Single", color: "Obsidian Grey", quantity: 1, discount: "Exit 10%" },
  { id: 75, size: "Single", color: "Chateau Ivory", quantity: 1, discount: "Exit 10%" },
  { id: 76, size: "Single", color: "Scribe Blue", quantity: 1, discount: "Exit 10%" },
  { id: 77, size: "Single", color: "Verdant Sage", quantity: 1, discount: "Exit 10%" },
  { id: 78, size: "Twin", color: "Obsidian Grey", quantity: 1, discount: "Exit 10%" },
  { id: 79, size: "Twin", color: "Chateau Ivory", quantity: 1, discount: "Exit 10%" },
  { id: 80, size: "Twin", color: "Scribe Blue", quantity: 1, discount: "Exit 10%" },
  { id: 81, size: "Twin", color: "Verdant Sage", quantity: 1, discount: "Exit 10%" },
  { id: 82, size: "Double", color: "Obsidian Grey", quantity: 1, discount: "Exit 10%" },
  { id: 83, size: "Double", color: "Chateau Ivory", quantity: 1, discount: "Exit 10%" },
  { id: 84, size: "Double", color: "Scribe Blue", quantity: 1, discount: "Exit 10%" },
  { id: 85, size: "Double", color: "Verdant Sage", quantity: 1, discount: "Exit 10%" },
  { id: 86, size: "Queen", color: "Obsidian Grey", quantity: 1, discount: "Exit 10%" },
  { id: 87, size: "Queen", color: "Chateau Ivory", quantity: 1, discount: "Exit 10%" },
  { id: 88, size: "Queen", color: "Scribe Blue", quantity: 1, discount: "Exit 10%" },
  { id: 89, size: "Queen", color: "Verdant Sage", quantity: 1, discount: "Exit 10%" },
  { id: 90, size: "King", color: "Obsidian Grey", quantity: 1, discount: "Exit 10%" },
  { id: 91, size: "King", color: "Chateau Ivory", quantity: 1, discount: "Exit 10%" },
  { id: 92, size: "King", color: "Scribe Blue", quantity: 1, discount: "Exit 10%" },
  { id: 93, size: "King", color: "Verdant Sage", quantity: 1, discount: "Exit 10%" },
  { id: 94, size: "Cali King", color: "Obsidian Grey", quantity: 1, discount: "Exit 10%" },
  { id: 95, size: "Cali King", color: "Chateau Ivory", quantity: 1, discount: "Exit 10%" },
  { id: 96, size: "Cali King", color: "Scribe Blue", quantity: 1, discount: "Exit 10%" },
  { id: 97, size: "Cali King", color: "Verdant Sage", quantity: 1, discount: "Exit 10%" },
  
  // Exit 10% discount variants - 2-pack
  { id: 98, size: "Single", color: "Obsidian Grey", quantity: 2, discount: "Exit 10%" },
  { id: 99, size: "Single", color: "Chateau Ivory", quantity: 2, discount: "Exit 10%" },
  { id: 100, size: "Single", color: "Scribe Blue", quantity: 2, discount: "Exit 10%" },
  { id: 101, size: "Single", color: "Verdant Sage", quantity: 2, discount: "Exit 10%" },
  { id: 102, size: "Twin", color: "Obsidian Grey", quantity: 2, discount: "Exit 10%" },
  { id: 103, size: "Twin", color: "Chateau Ivory", quantity: 2, discount: "Exit 10%" },
  { id: 104, size: "Twin", color: "Scribe Blue", quantity: 2, discount: "Exit 10%" },
  { id: 105, size: "Twin", color: "Verdant Sage", quantity: 2, discount: "Exit 10%" },
  { id: 106, size: "Double", color: "Obsidian Grey", quantity: 2, discount: "Exit 10%" },
  { id: 107, size: "Double", color: "Chateau Ivory", quantity: 2, discount: "Exit 10%" },
  { id: 108, size: "Double", color: "Scribe Blue", quantity: 2, discount: "Exit 10%" },
  { id: 109, size: "Double", color: "Verdant Sage", quantity: 2, discount: "Exit 10%" },
  { id: 110, size: "Queen", color: "Obsidian Grey", quantity: 2, discount: "Exit 10%" },
  { id: 111, size: "Queen", color: "Chateau Ivory", quantity: 2, discount: "Exit 10%" },
  { id: 112, size: "Queen", color: "Scribe Blue", quantity: 2, discount: "Exit 10%" },
  { id: 113, size: "Queen", color: "Verdant Sage", quantity: 2, discount: "Exit 10%" },
  { id: 114, size: "King", color: "Obsidian Grey", quantity: 2, discount: "Exit 10%" },
  { id: 115, size: "King", color: "Chateau Ivory", quantity: 2, discount: "Exit 10%" },
  { id: 116, size: "King", color: "Scribe Blue", quantity: 2, discount: "Exit 10%" },
  { id: 117, size: "King", color: "Verdant Sage", quantity: 2, discount: "Exit 10%" },
  { id: 118, size: "Cali King", color: "Obsidian Grey", quantity: 2, discount: "Exit 10%" },
  { id: 119, size: "Cali King", color: "Chateau Ivory", quantity: 2, discount: "Exit 10%" },
  { id: 120, size: "Cali King", color: "Scribe Blue", quantity: 2, discount: "Exit 10%" },
  { id: 121, size: "Cali King", color: "Verdant Sage", quantity: 2, discount: "Exit 10%" },
  
  // Exit 10% discount variants - 3-pack
  { id: 122, size: "Single", color: "Obsidian Grey", quantity: 3, discount: "Exit 10%" },
  { id: 123, size: "Single", color: "Chateau Ivory", quantity: 3, discount: "Exit 10%" },
  { id: 124, size: "Single", color: "Scribe Blue", quantity: 3, discount: "Exit 10%" },
  { id: 125, size: "Single", color: "Verdant Sage", quantity: 3, discount: "Exit 10%" },
  { id: 126, size: "Twin", color: "Obsidian Grey", quantity: 3, discount: "Exit 10%" },
  { id: 127, size: "Twin", color: "Chateau Ivory", quantity: 3, discount: "Exit 10%" },
  { id: 128, size: "Twin", color: "Scribe Blue", quantity: 3, discount: "Exit 10%" },
  { id: 129, size: "Twin", color: "Verdant Sage", quantity: 3, discount: "Exit 10%" },
  { id: 130, size: "Double", color: "Obsidian Grey", quantity: 3, discount: "Exit 10%" },
  { id: 131, size: "Double", color: "Chateau Ivory", quantity: 3, discount: "Exit 10%" },
  { id: 132, size: "Double", color: "Scribe Blue", quantity: 3, discount: "Exit 10%" },
  { id: 133, size: "Double", color: "Verdant Sage", quantity: 3, discount: "Exit 10%" },
  { id: 134, size: "Queen", color: "Obsidian Grey", quantity: 3, discount: "Exit 10%" },
  { id: 135, size: "Queen", color: "Chateau Ivory", quantity: 3, discount: "Exit 10%" },
  { id: 136, size: "Queen", color: "Scribe Blue", quantity: 3, discount: "Exit 10%" },
  { id: 137, size: "Queen", color: "Verdant Sage", quantity: 3, discount: "Exit 10%" },
  { id: 138, size: "King", color: "Obsidian Grey", quantity: 3, discount: "Exit 10%" },
  { id: 139, size: "King", color: "Chateau Ivory", quantity: 3, discount: "Exit 10%" },
  { id: 140, size: "King", color: "Scribe Blue", quantity: 3, discount: "Exit 10%" },
  { id: 141, size: "King", color: "Verdant Sage", quantity: 3, discount: "Exit 10%" },
  { id: 142, size: "Cali King", color: "Obsidian Grey", quantity: 3, discount: "Exit 10%" },
  { id: 143, size: "Cali King", color: "Chateau Ivory", quantity: 3, discount: "Exit 10%" },
  { id: 144, size: "Cali King", color: "Scribe Blue", quantity: 3, discount: "Exit 10%" },
  { id: 145, size: "Cali King", color: "Verdant Sage", quantity: 3, discount: "Exit 10%" }
];



/// Function to get prices from campaign data
function getPricesFromCampaign() {
  try {
    // Check if campaign data exists in sessionStorage (not localStorage)
    const cacheData = sessionStorage.getItem('next-campaign-cache');
    console.log('[Grounded] Cache data exists:', !!cacheData);
    
    if (!cacheData) {
      console.log('[Grounded] No cache data found in sessionStorage');
      return null;
    }
    
    const cache = JSON.parse(cacheData);
    console.log('[Grounded] Parsed cache:', cache);
    
    if (!cache.campaign || !cache.campaign.packages) {
      console.log('[Grounded] No campaign or packages in cache');
      return null;
    }
    
    const packages = cache.campaign.packages;
    console.log('[Grounded] Found packages:', packages.length);
    
    const priceMap = {};
    
    // Build a map of ref_id to prices
    packages.forEach(pkg => {
      console.log('[Grounded] Processing package:', pkg.ref_id, pkg.price, pkg.price_retail);
      if (pkg.ref_id && pkg.price && pkg.price_retail) {
        priceMap[pkg.ref_id] = {
          salePrice: parseFloat(pkg.price),
          regularPrice: parseFloat(pkg.price_retail)
        };
      }
    });
    
    console.log('[Grounded] Built price map:', priceMap);
    return priceMap;
  } catch (error) {
    console.warn('[Grounded] Could not load prices from campaign data:', error);
    return null;
  }
}

// Variant mapping placeholder - add your variants here
// Pricing structure for Grounded Sheets (fallback prices)
const sizePricing = {
  "Single": { regular: 898, sale: 449 },
  "Twin": { regular: 998, sale: 499 },
  "Double": { regular: 1198, sale: 599 },
  "Queen": { regular: 1398, sale: 649 },
  "King": { regular: 1598, sale: 749 },
  "Cali King": { regular: 1598, sale: 749 }
};

// Function to enhance variants with prices
function enhanceVariantsWithPrices(variants, campaignPrices = null) {
  return variants.map(variant => {
    // Check if we have campaign price for this variant
    if (campaignPrices && campaignPrices[variant.id]) {
      console.log(`[Grounded] Using campaign price for variant ${variant.id}:`, campaignPrices[variant.id]);
      return {
        ...variant,
        regularPrice: campaignPrices[variant.id].regularPrice,
        salePrice: campaignPrices[variant.id].salePrice
      };
    }
    
    // Otherwise use fallback prices based on size and quantity
    const basePrice = sizePricing[variant.size];
    if (basePrice) {
      console.log(`[Grounded] Using fallback price for variant ${variant.id}:`, basePrice);
      return {
        ...variant,
        regularPrice: basePrice.regular * variant.quantity,
        salePrice: basePrice.sale * variant.quantity
      };
    }
    
    // Return variant as-is if no pricing found
    console.log(`[Grounded] No pricing found for variant ${variant.id}`);
    return variant;
  });
}

// Initialize variants without prices first
let groundedSheetsVariants = [...groundedSheetsVariantsOriginal];

const helpers = {
  getBySize: (size) => groundedSheetsVariants.filter(v => v.size === size),
  getByColor: (color) => groundedSheetsVariants.filter(v => v.color === color),
  getByQuantity: (qty) => groundedSheetsVariants.filter(v => v.quantity === qty),
  getDiscounted: () => groundedSheetsVariants.filter(v => v.discount),
  getRegular: () => groundedSheetsVariants.filter(v => !v.discount),
  getById: (id) => groundedSheetsVariants.find(v => v.id === id),
  getUniqueSizes: () => [...new Set(groundedSheetsVariants.map(v => v.size))],
  getUniqueColors: () => [...new Set(groundedSheetsVariants.map(v => v.color))],
  getFiltered: (filters) => {
    return groundedSheetsVariants.filter(v => {
      return (!filters.size || v.size === filters.size) &&
             (!filters.color || v.color === filters.color) &&
             (!filters.quantity || v.quantity === filters.quantity) &&
             (!filters.hasDiscount || (filters.hasDiscount && v.discount) || (!filters.hasDiscount && !v.discount));
    });
  }
};

// Base element class
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

  mount(signal) {
    // Override in subclasses
  }

  onAttributeChange(name, oldValue, newValue) {
    // Override in subclasses
  }
}

// Dropdown components with Floating UI
const { computePosition, flip, offset, autoUpdate, arrow } = window.FloatingUIDOM;

/**
 * Main dropdown component that coordinates the toggle and menu
 */
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
    if (this.isOpen) {
      this.closeDropdown();
    }
    if (this.cleanupAutoUpdate) {
      this.cleanupAutoUpdate();
      this.cleanupAutoUpdate = null;
    }
    OSDropdown.openDropdowns.delete(this);
  }

  init() {
    // Find toggle button
    this.toggle = this.querySelector('button, [role="button"]');
    if (!this.toggle) {
      console.warn('OSDropdown: No toggle button found');
      return;
    }

    // Find or create menu
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

    // Find or create arrow element
    if (this.menu) {
      this.arrow = this.menu.querySelector('.dropdown-arrow');
      if (!this.arrow) {
        this.arrow = document.createElement('div');
        this.arrow.className = 'dropdown-arrow';
        this.menu.appendChild(this.arrow);
      }
    }

    if (!this.menu) {
      console.warn('OSDropdown: No menu found');
      return;
    }

    this.setupEventListeners();

    // Initialize value
    if (this.hasAttribute('value')) {
      this.value = this.getAttribute('value');
    } else {
      const selectedItem = this.querySelector('os-dropdown-item[selected]');
      if (selectedItem) {
        this._value = selectedItem.value;
        this.updateToggleContent();
      }
    }

    // Set ARIA attributes
    this.toggle.setAttribute('role', 'button');
    this.toggle.setAttribute('aria-haspopup', 'listbox');
    this.toggle.setAttribute('aria-expanded', 'false');
  }

  setupEventListeners() {
    if (!this.toggle || !this.menu) return;

    // Toggle dropdown
    this.toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleDropdown();
    });

    // Handle keyboard on toggle
    this.toggle.addEventListener('keydown', (e) => {
      this.handleKeyboard(e);
    });

    // Listen for item selection events
    this.addEventListener('dropdown-item-select', (e) => {
      this.handleItemSelect(e.detail.item);
    });

    // Global click handler
    document.addEventListener('click', (e) => {
      if (!this.contains(e.target) && this.isOpen) {
        this.closeDropdown();
      }
    });
  }

  async updateDropdownPosition() {
    if (!this.isOpen || !this.toggle || !this.menu) return;

    const middleware = [
      offset(8),
      flip({
        fallbackPlacements: ['top-start', 'bottom-end', 'top-end']
      })
    ];

    if (this.arrow) {
      middleware.push(arrow({ element: this.arrow }));
    }

    const { x, y, placement, middlewareData } = await computePosition(this.toggle, this.menu, {
      placement: 'bottom-start',
      middleware
    });

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
          right: 'left'
        }[side]]: '-4px'
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
      this.cleanupAutoUpdate = autoUpdate(
        this.toggle,
        this.menu,
        () => this.updateDropdownPosition()
      );
    }

    OSDropdown.openDropdowns.add(this);

    const firstItem = this.querySelector('os-dropdown-item:not([disabled])');
    if (firstItem) {
      firstItem.focus();
    }
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
        bottom: ''
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
      
      const animationType = this.getAttribute('animate-selection');
      
      if (animationType && animationType !== 'none') {
        let contentWrapper = this.toggle.querySelector('.os-dropdown__content');
        if (!contentWrapper) {
          contentWrapper = document.createElement('div');
          contentWrapper.className = 'os-dropdown__content';
          
          while (existingContent.parentNode && existingContent.parentNode.firstChild) {
            if (existingContent.parentNode.firstChild === existingContent) {
              contentWrapper.appendChild(existingContent.parentNode.firstChild);
              break;
            }
            existingContent.parentNode.firstChild.remove();
          }
          
          const icon = this.toggle.querySelector('.os-card__variant-dropdown-icon');
          if (icon) {
            this.toggle.insertBefore(contentWrapper, icon);
          } else {
            this.toggle.appendChild(contentWrapper);
          }
        }
        
        const menu = this.menu;
        const isAbove = menu && menu.classList.contains('placement-top');
        
        existingContent.setAttribute('data-animating', 'out');
        existingContent.setAttribute('data-animation-type', animationType);
        if (isAbove) {
          existingContent.setAttribute('data-placement', 'top');
        }
        
        newContent.setAttribute('data-animating', 'in');
        newContent.setAttribute('data-animation-type', animationType);
        if (isAbove) {
          newContent.setAttribute('data-placement', 'top');
        }
        newContent.setAttribute('data-current', '');
        
        existingContent.classList.add('os-dropdown__option');
        newContent.classList.add('os-dropdown__option');
        
        const duration = this.getAttribute('animation-duration') || '300';
        contentWrapper.style.setProperty('--animation-duration', `${duration}ms`);
        
        contentWrapper.appendChild(newContent);
        
        requestAnimationFrame(() => {
          newContent.removeAttribute('data-animating');
          
          const duration = parseInt(this.getAttribute('animation-duration') || '300');
          setTimeout(() => {
            existingContent.remove();
          }, duration);
        });
      } else {
        existingContent.replaceWith(newContent);
      }
    }
  }

  handleItemSelect(item) {
    this._value = item.value;
    this.setAttribute('value', this._value || '');
    
    const items = this.querySelectorAll('os-dropdown-item');
    items.forEach(i => {
      // Explicitly remove selected class and attribute from all items first
      i.classList.remove('selected');
      i.removeAttribute('selected');
      // Then set the selected state properly
      i.selected = i === item;
    });

    this.updateToggleContent();
    this.closeDropdown();

    this.dispatchEvent(new Event('change', { bubbles: true }));
    
    this.dispatchEvent(new CustomEvent('variantSelected', {
      detail: {
        value: item.value,
        item,
        component: this,
        type: 'dropdown'
      },
      bubbles: true
    }));
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
      // Clean up any legacy classes and selected state first
      item.classList.remove('os-card__variant-dropdown-item', 'selected');
      item.removeAttribute('selected');
      // Set the selected state properly
      item.selected = item.value === val;
    });
    
    this.updateToggleContent();
  }

  get isOpen() {
    return this.hasAttribute('open');
  }
}

/**
 * Dropdown menu container
 */
class OSDropdownMenu extends ConversionElement {
  mount() {
    this.setAttribute('role', 'listbox');
    this.classList.add('os-dropdown-menu');
    
    if (this.classList.contains('os-card__variant-dropdown-menu') ||
        this.classList.contains('os-card__variant-dropdown-menu-v2')) {
      this.classList.add('os-dropdown-menu');
    }

    this.style.position = 'absolute';
    this.style.zIndex = '1000';
  }
}

/**
 * Individual dropdown item
 */
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
      if (!this.disabled) {
        this.select();
      }
    });

    this.addEventListener('keydown', (e) => {
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
      dropdown.dispatchEvent(new CustomEvent('dropdown-item-select', {
        detail: { item: this },
        bubbles: true
      }));
    }
  }

  getDisplayContent() {
    return this.innerHTML;
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

// Tier Controller
class TierController {
  constructor() {
    this.currentTier = 1;
    this.selectedVariants = new Map();
    this.slotCartMapping = new Map(); // Track which variant ID is in cart for each slot

    // Image mapping for colors
    this.colorImages = {
      'obsidian-grey': 'https://cdn.29next.store/media/bareearth/uploads/obsidian-grey.png',
      'chateau-ivory': 'https://cdn.29next.store/media/bareearth/uploads/chateau-ivory.png',
      'scribe-blue': 'https://cdn.29next.store/media/bareearth/uploads/scribe-blue.png',
      'verdant-sage': 'https://cdn.29next.store/media/bareearth/uploads/verdant-sage.png'
    };

    // Color styles mapping
    this.colorStyles = {
      'obsidian-grey': '#9699a6',
      'chateau-ivory': '#e4e4e5',
      'scribe-blue': '#4a90e2',
      'verdant-sage': '#87a96b'
    };

    // Value to variant name mapping
    this.valueToVariantMap = {
      'obsidian-grey': 'Obsidian Grey',
      'chateau-ivory': 'Chateau Ivory',
      'scribe-blue': 'Scribe Blue',
      'verdant-sage': 'Verdant Sage',
      'single': 'Single',
      'twin': 'Twin',
      'double': 'Double',
      'queen': 'Queen',
      'king': 'King',
      'cali-king': 'Cali King'
    };

    this.init();
  }

  init() {
    // Clear cart on page load to start fresh
    this.clearCartOnPageLoad();
    
    this.bindTierSelection();
    this.bindDropdownEvents();
    this.initializeDefaultState();
    this.populateAllDropdowns();
    this.updateExistingColorItems();
    this.initializeColorSwatches();
    this.initializeSlotImages();
    this.setupCampaignCartListeners();
    
    // Apply campaign prices if available
    this.refreshPricesFromCampaign();
    
    // Initialize CTA button states based on current selections
    this.updateCTAButtons();
  }
  
  refreshPricesFromCampaign() {
    console.log('[Grounded] Refreshing prices from campaign data');
    const campaignPrices = getPricesFromCampaign();
    
    if (campaignPrices) {
      console.log('[Grounded] Found campaign prices, updating variants');
      // Update all variants with campaign prices
      groundedSheetsVariants = enhanceVariantsWithPrices(groundedSheetsVariantsOriginal, campaignPrices);
      
      // Refresh all dropdowns to show updated prices
      this.populateAllDropdowns();
      console.log('[Grounded] Prices refreshed from campaign data');
    } else {
      console.log('[Grounded] No campaign prices found, using fallback prices');
      // Use fallback prices
      groundedSheetsVariants = enhanceVariantsWithPrices(groundedSheetsVariantsOriginal, null);
    }
  }

  // Consolidated selection checking methods
  checkAllSelectionsComplete() {
    let completeCount = 0;
    let totalSlots = this.currentTier;
    
    console.log(`[Grounded] Checking completion status for ${totalSlots} slots`);
    
    for (let i = 1; i <= totalSlots; i++) {
      const slotVariants = this.selectedVariants.get(i);
      const hasColor = slotVariants?.color && slotVariants.color !== 'select-color';
      const hasSize = slotVariants?.size && slotVariants.size !== 'select-size';
      
      console.log(`[Grounded] Slot ${i}: color=${slotVariants?.color}, size=${slotVariants?.size}, complete=${hasColor && hasSize}`);
      
      if (hasColor && hasSize) {
        completeCount++;
      }
    }
    
    const allComplete = completeCount === totalSlots;
    console.log(`[Grounded] Selection status: ${completeCount}/${totalSlots} complete = ${allComplete}`);
    
    return allComplete;
  }

  updateCTAButtons() {
    const allComplete = this.checkAllSelectionsComplete();
    const pendingCTA = document.querySelector('[data-cta="selection-pending"]');
    const completeCTA = document.querySelector('[data-cta="selection-complete"]');
    
    console.log(`[Grounded] Updating CTA buttons - All complete: ${allComplete}`);
    
    if (pendingCTA && completeCTA) {
      if (allComplete) {
        // Show complete button, hide pending button
        pendingCTA.classList.remove('active');
        completeCTA.classList.add('active');
        console.log('[Grounded] ✅ Switched to complete CTA - all selections done');
      } else {
        // Show pending button, hide complete button
        pendingCTA.classList.add('active');
        completeCTA.classList.remove('active');
        console.log('[Grounded] ⏳ Switched to pending CTA - selections incomplete');
      }
    } else {
      console.warn('[Grounded] CTA buttons not found in DOM');
    }
  }

  findFirstIncompleteSlot() {
    for (let i = 1; i <= this.currentTier; i++) {
      if (!this.checkCompleteSelection(i, false)) {
        return i;
      }
    }
    return null;
  }

  scrollToIncompleteSlot() {
    const incompleteSlot = this.findFirstIncompleteSlot();
    if (incompleteSlot) {
      const slotElement = document.querySelector(`[next-tier-slot="${incompleteSlot}"]`);
      if (slotElement) {
        slotElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        console.log(`[Grounded] Scrolled to incomplete slot ${incompleteSlot}`);
        return true;
      }
    }
    return false;
  }

  handleVerifyButtonClick() {
    const allComplete = this.checkAllSelectionsComplete();
    
    if (allComplete) {
      // All selections complete, switch to complete button
      this.updateCTAButtons();
      return true;
    } else {
      // Scroll to first incomplete slot
      this.scrollToIncompleteSlot();
      return false;
    }
  }

  // Consolidated dropdown update methods
  updateDropdownsForTierChange(newTier, previousTier) {
    if (newTier === previousTier) return;
    
    console.log(`[Grounded] Updating dropdowns for tier change: ${previousTier} → ${newTier}`);
    
    const slots = document.querySelectorAll('[next-tier-slot]');
    
    slots.forEach(slot => {
      const slotNumber = parseInt(slot.getAttribute('next-tier-slot'));
      
      // Only update active slots
      if (slotNumber <= newTier) {
        const colorDropdown = slot.querySelector('os-dropdown[next-variant-option="color"]');
        const sizeDropdown = slot.querySelector('os-dropdown[next-variant-option="size"]');
        
        // Get current selections
        const currentColorValue = colorDropdown?.value;
        const currentSizeValue = sizeDropdown?.value;
        
        // Repopulate dropdowns with new tier data
        this.populateSlotDropdowns(slot, slotNumber);
        
        // Restore selections but DON'T trigger cart updates - just update internal state
        if (currentColorValue && currentColorValue !== 'select-color') {
          colorDropdown.value = currentColorValue;
          // Update internal state without triggering cart updates
          const variantType = 'color';
          if (!this.selectedVariants.has(slotNumber)) {
            this.selectedVariants.set(slotNumber, {});
          }
          this.selectedVariants.get(slotNumber)[variantType] = currentColorValue;
        }
        
        if (currentSizeValue && currentSizeValue !== 'select-size') {
          sizeDropdown.value = currentSizeValue;
          // Update internal state without triggering cart updates
          const variantType = 'size';
          if (!this.selectedVariants.has(slotNumber)) {
            this.selectedVariants.set(slotNumber, {});
          }
          this.selectedVariants.get(slotNumber)[variantType] = currentSizeValue;
        }
      }
    });
  }
  
  // Consolidated cart management methods
  clearCartOnPageLoad() {
    // Wait for SDK to be ready before clearing
    if (typeof window.next !== 'undefined' && window.next.clearCart) {
      console.log('[Grounded] Clearing cart on page load for fresh start');
      window.next.clearCart();
      // Also clear our internal mappings
      this.slotCartMapping.clear();
      this.selectedVariants.clear();
    } else {
      // If SDK isn't ready yet, wait for it
      window.addEventListener('next:initialized', () => {
        console.log('[Grounded] SDK initialized, clearing cart for fresh start');
        if (window.next && window.next.clearCart) {
          window.next.clearCart();
          this.slotCartMapping.clear();
          this.selectedVariants.clear();
        }
      });
    }
  }
  
  setupCampaignCartListeners() {
    const setupListeners = () => {
      if (typeof window.next !== 'undefined' && window.next.on) {
        // Listen for cart updates
        window.next.on('cart:updated', (cartState) => {
          console.log('[Grounded] Cart updated:', cartState);
        });
        
        // Listen for item additions
        window.next.on('cart:item-added', (item) => {
          console.log('[Grounded] Item added to cart:', item);
        });
        
        // Listen for cart clear
        window.next.on('cart:cleared', () => {
          console.log('[Grounded] Cart cleared');
        });
        
        // Listen for checkout started
        window.next.on('checkout:started', () => {
          console.log('[Grounded] Checkout started');
          // You can add any additional logic here when checkout starts
        });
        
        console.log('[Grounded] Campaign cart listeners set up');
      } else {
        console.warn('[Grounded] window.next not available after initialization');
      }
    };

    // Wait for SDK to be fully initialized
    window.addEventListener('next:initialized', () => {
      console.log('[Grounded] SDK initialized, setting up listeners');
      setupListeners();
    });
    
    // If SDK is already initialized, set up listeners immediately
    if (typeof window.next !== 'undefined' && window.next.on) {
      console.log('[Grounded] SDK already initialized, setting up listeners immediately');
      setupListeners();
    }
  }

  bindTierSelection() {
    const tierCards = document.querySelectorAll('[data-next-tier]');
    tierCards.forEach(card => {
      card.addEventListener('click', (e) => {
        const tier = parseInt(card.getAttribute('data-next-tier'));
        this.selectTier(tier);
      });
    });
  }

  updateColorSwatch(dropdown, colorValue) {
    const toggle = dropdown.querySelector('button');
    const swatch = toggle?.querySelector('.os-card__variant-swatch');
    
    if (swatch && colorValue) {
      // You can add CSS classes or styles based on the color
      swatch.className = 'os-card__variant-swatch'; // Reset classes
      swatch.classList.add(`swatch-${colorValue}`);
      
      // Set background color directly
      if (this.colorStyles[colorValue]) {
        swatch.style.backgroundColor = this.colorStyles[colorValue];
      }
    }
  }

  bindDropdownEvents() {
    document.addEventListener('variantSelected', (e) => {
      this.handleVariantSelection(e.detail);
    });

    document.addEventListener('change', (e) => {
      if (e.target.matches('os-dropdown')) {
        this.handleDropdownChange(e.target);
      }
    });
  }

  populateAllDropdowns() {
    const slots = document.querySelectorAll('[next-tier-slot]');
    
    slots.forEach(slot => {
      const slotNumber = parseInt(slot.getAttribute('next-tier-slot'));
      
      // Only populate active slots
      if (slotNumber <= this.currentTier) {
        this.populateSlotDropdowns(slot, slotNumber);
        // Update pricing for this slot
        this.updateSlotPricing(slotNumber);
      }
    });
  }

  populateSlotDropdowns(slot, slotNumber) {
    const currentQuantity = this.currentTier;
    const availableVariants = helpers.getByQuantity(currentQuantity);
    
    // Populate color dropdown
    const colorDropdown = slot.querySelector('os-dropdown[next-variant-option="color"]');
    if (colorDropdown) {
      this.populateColorDropdown(colorDropdown, availableVariants);
      // Update toggle content if dropdown has a value
      if (colorDropdown.value && colorDropdown.value !== 'select-color') {
        colorDropdown.updateToggleContent();
      }
    }
    
    // Populate size dropdown
    const sizeDropdown = slot.querySelector('os-dropdown[next-variant-option="size"]');
    if (sizeDropdown) {
      this.populateSizeDropdown(sizeDropdown, availableVariants);
      // Update toggle content if dropdown has a value
      if (sizeDropdown.value && sizeDropdown.value !== 'select-size') {
        sizeDropdown.updateToggleContent();
      }
    }
  }

  populateColorDropdown(dropdown, availableVariants) {
    const menu = dropdown.querySelector('os-dropdown-menu');
    if (!menu) return;

    // Get unique colors from available variants
    const availableColors = [...new Set(availableVariants.map(v => v.color))];
    
    // Clear existing items (except default/placeholder items)
    const existingItems = menu.querySelectorAll('os-dropdown-item');
    existingItems.forEach(item => {
      const value = item.getAttribute('value');
      if (value && !value.includes('select') && !availableColors.some(color => 
        color.toLowerCase().replace(/\s+/g, '-') === value
      )) {
        item.remove();
      }
    });

    // Add missing color options
    availableColors.forEach(color => {
      const colorValue = color.toLowerCase().replace(/\s+/g, '-');
      
      // Check if item already exists
      const existingItem = menu.querySelector(`os-dropdown-item[value="${colorValue}"]`);
      if (!existingItem) {
        this.createColorDropdownItem(menu, color, colorValue);
      }
    });
  }

  updateExistingColorItems() {
    const colorDropdowns = document.querySelectorAll('os-dropdown[next-variant-option="color"]');
    
    colorDropdowns.forEach(dropdown => {
      const menu = dropdown.querySelector('os-dropdown-menu');
      if (!menu) return;
      
      const colorItems = menu.querySelectorAll('os-dropdown-item');
      colorItems.forEach(item => {
        const value = item.getAttribute('value');
        const toggleOption = item.querySelector('.os-card__toggle-option');
        
        if (value && this.colorStyles[value] && toggleOption) {
          // Check if it already has the swatch structure
          const existingSwatch = toggleOption.querySelector('.os-card__variant-swatch');
          if (!existingSwatch) {
            // Update the structure to include swatch
            const colorName = toggleOption.querySelector('.os-card__variant-toggle-name')?.textContent;
            if (colorName) {
              toggleOption.innerHTML = `
                <div class="os-card__variant-toggle-info">
                  <div data-swatch="color" class="os-card__variant-swatch" style="background-color: ${this.colorStyles[value]}"></div>
                  <div class="os-card__variant-toggle-name">${colorName}</div>
                </div>
              `;
            }
          }
        }
      });
    });
  }

  populateSizeDropdown(dropdown, availableVariants) {
    const menu = dropdown.querySelector('os-dropdown-menu');
    if (!menu) return;

    // Get unique sizes from available variants
    const availableSizes = [...new Set(availableVariants.map(v => v.size))];
    
    // Sort sizes by price (cheapest to most expensive)
    const sizesWithPrices = availableSizes.map(size => {
      const variantWithPrice = availableVariants.find(v => v.size === size);
      return {
        size,
        salePrice: variantWithPrice?.salePrice || 0,
        variant: variantWithPrice
      };
    }).sort((a, b) => a.salePrice - b.salePrice);
    
    // Clear existing items (except default/placeholder items)
    const existingItems = menu.querySelectorAll('os-dropdown-item');
    existingItems.forEach(item => {
      // Clean up any legacy selected classes
      item.classList.remove('os-card__variant-dropdown-item');
      
      const value = item.getAttribute('value');
      if (value && !value.includes('select') && !availableSizes.some(size => 
        size.toLowerCase().replace(/\s+/g, '-') === value
      )) {
        item.remove();
      }
    });

    // Add missing size options with price data in sorted order
    sizesWithPrices.forEach(({ size, variant }) => {
      const sizeValue = size.toLowerCase().replace(/\s+/g, '-');
      
      // Check if item already exists
      const existingItem = menu.querySelector(`os-dropdown-item[value="${sizeValue}"]`);
      if (!existingItem) {
        this.createSizeDropdownItem(menu, size, sizeValue, variant);
      } else {
        // Check if existing item has content
        const hasContent = existingItem.querySelector('.os-card__toggle-option');
        if (!hasContent) {
          // Item exists but is empty, recreate its content without prices
          existingItem.innerHTML = `
            <div class="os-card__toggle-option os--distribute">
              <div class="os-card__variant-toggle-info">
                <div class="os-card__variant-toggle-name">${size}</div>
              </div>
            </div>
          `;
        } else {
          // No longer updating prices in dropdown items
          // Just ensure the item has the correct structure
          const hasCorrectStructure = existingItem.querySelector('.os-card__variant-toggle-name');
          if (!hasCorrectStructure) {
            existingItem.innerHTML = `
              <div class="os-card__toggle-option os--distribute">
                <div class="os-card__variant-toggle-info">
                  <div class="os-card__variant-toggle-name">${size}</div>
                </div>
              </div>
            `;
          }
        }
        // Move existing item to correct position
        menu.appendChild(existingItem);
      }
    });
  }

  createColorDropdownItem(menu, colorName, colorValue) {
    const item = document.createElement('os-dropdown-item');
    item.setAttribute('value', colorValue);
    
    item.innerHTML = `
      <div class="os-card__toggle-option os--distribute">
        <div class="os-card__variant-toggle-info">
          <div data-swatch="color" class="os-card__variant-swatch" style="background-color: ${this.colorStyles[colorValue] || '#ccc'}"></div>
          <div class="os-card__variant-toggle-name">${colorName}</div>
        </div>
      </div>
    `;
    
    menu.appendChild(item);
  }

  createSizeDropdownItem(menu, sizeName, sizeValue, variant = null) {
    const item = document.createElement('os-dropdown-item');
    item.setAttribute('value', sizeValue);
    
    // No longer showing prices in the dropdown
    item.innerHTML = `
      <div class="os-card__toggle-option os--distribute">
        <div class="os-card__variant-toggle-info">
          <div class="os-card__variant-toggle-name">${sizeName}</div>
        </div>
      </div>
    `;
    
    menu.appendChild(item);
  }

  // Update the selectTier method to refresh images
  selectTier(tierNumber) {
    console.log(`Selecting tier: ${tierNumber}`);
    
    const previousTier = this.currentTier;
    
    // Early exit if tier hasn't actually changed
    if (tierNumber === previousTier) {
      console.log(`[Grounded] Tier unchanged: ${tierNumber}, skipping reprocessing`);
      this.updateTierCardStates(tierNumber);
      this.updateSlotStates(tierNumber);
      this.populateAllDropdowns();
      this.initializeSlotImages();
      this.updateCTAButtons();
      this.dispatchTierChangeEvent(tierNumber);
      return;
    }
    
    this.currentTier = tierNumber;
    this.updateTierCardStates(tierNumber);
    this.updateSlotStates(tierNumber);
    
    console.log(`[Grounded] Tier changed from ${previousTier} to ${tierNumber}`);
    
    // Clear all cart items when tier changes since quantities are different
    this.clearAllCartItems();
    
    // If decreasing tier, remove selections for slots that are no longer active
    if (tierNumber < previousTier) {
      for (let i = tierNumber + 1; i <= previousTier; i++) {
        this.selectedVariants.delete(i);
        this.slotCartMapping.delete(i);
        console.log(`[Grounded] Removed selection for slot ${i} (no longer active)`);
      }
    }
    
    // Update dropdowns for the tier change BEFORE populating
    this.updateDropdownsForTierChange(tierNumber, previousTier);
    
    // Re-add items to cart with new tier quantities
    this.reprocessAllSelections();
    
    this.initializeSlotImages();
    
    // Update pricing display for all active slots
    for (let i = 1; i <= tierNumber; i++) {
      this.updateSlotPricing(i);
    }
    
    this.updateCTAButtons();
    this.dispatchTierChangeEvent(tierNumber);
  }

  // Consolidated cart operation methods
  clearAllCartItems() {
    if (typeof window.next !== 'undefined' && window.next.clearCart) {
      try {
        window.next.clearCart();
        this.slotCartMapping.clear();
        console.log('[Grounded] All cart items cleared for tier change');
      } catch (error) {
        console.error('[Grounded] Error clearing cart:', error);
      }
    }
  }

  reprocessAllSelections() {
    // Wait a bit for cart clear to process
    setTimeout(() => {
      console.log('[Grounded] Reprocessing all selections after tier change');
      
      // Count how many slots selected each variant
      const variantSlotCount = new Map(); // variant.id -> count of slots that selected it
      
      // Process each slot to count variant selections
      for (let i = 1; i <= this.currentTier; i++) {
        const slotVariants = this.selectedVariants.get(i);
        if (slotVariants && slotVariants.color && slotVariants.size) {
          const colorName = this.valueToVariantMap[slotVariants.color];
          const sizeName = this.valueToVariantMap[slotVariants.size];
          
          const matchingVariant = groundedSheetsVariants.find(v => 
            v.color === colorName && 
            v.size === sizeName && 
            v.quantity === this.currentTier
          );
          
          if (matchingVariant) {
            // Count how many slots selected this variant
            const currentCount = variantSlotCount.get(matchingVariant.id) || 0;
            variantSlotCount.set(matchingVariant.id, currentCount + 1);
            
            // Track which variant this slot maps to (for UI purposes)
            this.slotCartMapping.set(i, matchingVariant.id);
          }
        }
      }
      
      // Add each variant to cart with the correct quantity (number of slots that selected it)
      variantSlotCount.forEach((slotCount, variantId) => {
        const variant = groundedSheetsVariants.find(v => v.id === variantId);
        if (variant) {
          // Check if item is already in cart to avoid duplicates
          const cartHasVariant = window.next.hasItem && window.next.hasItem(variantId);
          
          if (!cartHasVariant) {
            console.log(`[Grounded] Re-adding variant ${variantId} to cart with quantity ${slotCount} (${slotCount} slots selected it):`, variant);
            
            const cartItem = {
              packageId: variant.id,
              quantity: slotCount  // This is the key fix - quantity = number of slots that selected this variant
            };
            
            window.next.addItem(cartItem);
          } else {
            console.log(`[Grounded] Variant ${variantId} already in cart, skipping`);
          }
        }
      });
      
    }, 200);
  }

  clearCampaignCart() {
    if (typeof window.next !== 'undefined' && window.next.clearCart) {
      try {
        window.next.clearCart();
        console.log('[Grounded] Cart cleared');
      } catch (error) {
        console.error('[Grounded] Error clearing cart:', error);
      }
    }
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

  // Add this new method to initialize slot images based on current selections
  initializeSlotImages() {
    const slots = document.querySelectorAll('[next-tier-slot]');
    
    slots.forEach(slot => {
      const slotNumber = parseInt(slot.getAttribute('next-tier-slot'));
      if (slotNumber <= this.currentTier) {
        const colorDropdown = slot.querySelector('os-dropdown[next-variant-option="color"]');
        if (colorDropdown) {
          const currentColor = colorDropdown.getAttribute('value');
          if (currentColor && this.colorImages[currentColor]) {
            this.updateSlotImage(slot, currentColor);
          }
        }
      }
    });
  }

  // Add this new method to update slot images
  updateSlotImage(slot, colorValue) {
    const imageElement = slot.querySelector('[next-tier-slot-element="image"]');
    if (imageElement && this.colorImages[colorValue]) {
      // Add a smooth transition
      imageElement.style.transition = 'opacity 0.3s ease-in-out';
      imageElement.style.opacity = '0.5';
      
      // Update the image source
      imageElement.src = this.colorImages[colorValue];
      
      // Handle image load to restore opacity
      imageElement.onload = () => {
        imageElement.style.opacity = '1';
      };
      
      // Fallback in case onload doesn't fire
      setTimeout(() => {
        imageElement.style.opacity = '1';
      }, 300);
    }
  }

  // Update slot pricing display based on selected variant
  updateSlotPricing(slotNumber) {
    const slot = document.querySelector(`[next-tier-slot="${slotNumber}"]`);
    if (!slot) {
      console.log(`[Grounded] Slot ${slotNumber} not found in DOM`);
      return;
    }
    
    const slotVariants = this.selectedVariants.get(slotNumber);
    console.log(`[Grounded] updateSlotPricing for slot ${slotNumber}, variants:`, slotVariants);
    
    if (!slotVariants || !slotVariants.color || !slotVariants.size) {
      // Reset to placeholder prices if selection is incomplete
      console.log(`[Grounded] Incomplete selection for slot ${slotNumber}, resetting prices`);
      this.resetSlotPricing(slot);
      return;
    }
    
    const colorName = this.valueToVariantMap[slotVariants.color];
    const sizeName = this.valueToVariantMap[slotVariants.size];
    
    console.log(`[Grounded] Looking for variant - Color: ${colorName}, Size: ${sizeName}, Quantity: ${this.currentTier}`);
    
    // Find the matching variant
    const matchingVariant = groundedSheetsVariants.find(v => 
      v.color === colorName && 
      v.size === sizeName && 
      v.quantity === this.currentTier
    );
    
    if (matchingVariant && matchingVariant.regularPrice && matchingVariant.salePrice) {
      console.log(`[Grounded] Found matching variant:`, matchingVariant);
      
      // Update price elements in the slot
      const regPriceElement = slot.querySelector('[data-option="reg"]');
      const salePriceElement = slot.querySelector('[data-option="price"]');
      const savingPctElement = slot.querySelector('[data-option="savingPct"]');
      
      if (regPriceElement) {
        regPriceElement.textContent = `$${matchingVariant.regularPrice.toFixed(2)}`;
      }
      
      if (salePriceElement) {
        salePriceElement.textContent = `$${matchingVariant.salePrice.toFixed(2)}`;
      }
      
      if (savingPctElement) {
        const savingPct = Math.round(((matchingVariant.regularPrice - matchingVariant.salePrice) / matchingVariant.regularPrice) * 100);
        savingPctElement.textContent = `${savingPct}%`;
      }
      
      console.log(`[Grounded] Updated slot ${slotNumber} pricing:`, matchingVariant);
    } else {
      console.log(`[Grounded] No matching variant found or missing prices`);
    }
  }
  
  // Reset slot pricing to placeholder values
  resetSlotPricing(slot) {
    const regPriceElement = slot.querySelector('[data-option="reg"]');
    const salePriceElement = slot.querySelector('[data-option="price"]');
    const savingPctElement = slot.querySelector('[data-option="savingPct"]');
    
    if (regPriceElement) {
      regPriceElement.textContent = '$XX.XX';
    }
    
    if (salePriceElement) {
      salePriceElement.textContent = '$XX.XX';
    }
    
    if (savingPctElement) {
      savingPctElement.textContent = 'XX%';
    }
  }

  handleVariantSelection(detail) {
    const { value, item, component, type } = detail;
    
    const slot = component.closest('[next-tier-slot]');
    if (!slot) return;
    
    const slotNumber = parseInt(slot.getAttribute('next-tier-slot'));
    const variantType = component.getAttribute('next-variant-option');
    
    if (!this.selectedVariants.has(slotNumber)) {
      this.selectedVariants.set(slotNumber, {});
    }
    
    const slotVariants = this.selectedVariants.get(slotNumber);
    
    // Check if this is actually a change
    if (slotVariants[variantType] === value) {
      console.log(`[Grounded] No change detected for slot ${slotNumber} ${variantType}: ${value}`);
      return; // Exit early if no actual change
    }
    
    // Store the old selection to detect changes
    const oldSelection = { ...slotVariants };
    
    // Before updating, check if the other dropdown already has a pre-selected value
    if (!slotVariants.color && variantType === 'size') {
      const colorDropdown = slot.querySelector('os-dropdown[next-variant-option="color"]');
      if (colorDropdown) {
        const colorValue = colorDropdown.value || colorDropdown.getAttribute('value');
        if (colorValue && colorValue !== 'select-color' && colorValue !== '') {
          slotVariants.color = colorValue;
          console.log(`[Grounded] Found pre-selected color while selecting size: ${colorValue}`);
        }
      }
    } else if (!slotVariants.size && variantType === 'color') {
      const sizeDropdown = slot.querySelector('os-dropdown[next-variant-option="size"]');
      if (sizeDropdown) {
        const sizeValue = sizeDropdown.value || sizeDropdown.getAttribute('value');
        if (sizeValue && sizeValue !== 'select-size' && sizeValue !== '') {
          slotVariants.size = sizeValue;
          console.log(`[Grounded] Found pre-selected size while selecting color: ${sizeValue}`);
        }
      }
    }
    
    slotVariants[variantType] = value;
    
    console.log(`Slot ${slotNumber} ${variantType} selected:`, value);
    
    // Update color swatch if color was selected
    if (variantType === 'color') {
      this.updateColorSwatch(component, value);
      this.updateSlotImage(slot, value);
    }
    
    // Update slot pricing display when any variant changes
    this.updateSlotPricing(slotNumber);
    
    this.updateAvailableOptions(slotNumber, variantType);
    
    // Check if we had a complete selection before that's now changing
    const hadCompleteSelection = oldSelection.color && oldSelection.size;
    const hasCompleteSelection = slotVariants.color && slotVariants.size;
    
    if (hadCompleteSelection || hasCompleteSelection) {
      // If we had a complete selection or now have one, recalculate the entire cart
      console.log(`[Grounded] Selection change detected for slot ${slotNumber}, recalculating cart`);
      
      // Small delay to ensure all UI updates are complete
      setTimeout(() => {
        this.recalculateEntireCart();
      }, 50);
    }
    
    this.checkCompleteSelection(slotNumber);
    // Note: updateCTAButtons() is called from checkCompleteSelection
  }

  handleDropdownChange(dropdown) {
    const value = dropdown.value;
    const variantType = dropdown.getAttribute('next-variant-option');
    
    if (!variantType) return;
    
    const slot = dropdown.closest('[next-tier-slot]');
    if (!slot) return;
    
    const slotNumber = parseInt(slot.getAttribute('next-tier-slot'));
    
    console.log(`[Grounded] Dropdown change event for slot ${slotNumber} ${variantType}: ${value}`);
    
    // Only handle UI updates here, not selection logic
    // The selection logic is handled by handleVariantSelection
    
    // Update color swatch if this is a color dropdown
    if (variantType === 'color') {
      this.updateColorSwatch(dropdown, value);
      this.updateSlotImage(slot, value);
    }
    
    // Update dependent dropdowns (enable/disable options)
    this.updateDependentDropdowns(slotNumber, variantType);
  }

  updateAvailableOptions(slotNumber, changedVariantType) {
    const slot = document.querySelector(`[next-tier-slot="${slotNumber}"]`);
    if (!slot) return;
    
    const slotVariants = this.selectedVariants.get(slotNumber) || {};
    const currentQuantity = this.currentTier;
    
    let availableVariants = helpers.getByQuantity(currentQuantity);
    
    // Update the appropriate dropdown based on what changed
    if (changedVariantType === 'color') {
      // When color changes, filter sizes based on selected color
      if (slotVariants.color) {
        const colorName = this.valueToVariantMap[slotVariants.color];
        if (colorName) {
          const filteredVariants = availableVariants.filter(v => v.color === colorName);
          this.updateSizeDropdown(slot, filteredVariants);
        }
      }
      // Update color swatch
      const colorDropdown = slot.querySelector('os-dropdown[next-variant-option="color"]');
      if (colorDropdown) {
        this.updateColorSwatch(colorDropdown, slotVariants.color);
      }
    }
    
    if (changedVariantType === 'size') {
      // When size changes, filter colors based on selected size
      if (slotVariants.size) {
        const sizeName = this.valueToVariantMap[slotVariants.size];
        if (sizeName) {
          const filteredVariants = availableVariants.filter(v => v.size === sizeName);
          this.updateColorDropdown(slot, filteredVariants);
        }
      }
    }
  }

  updateSizeDropdown(slot, availableVariants) {
    const sizeDropdown = slot.querySelector('os-dropdown[next-variant-option="size"]');
    if (!sizeDropdown) return;
    
    const availableSizes = [...new Set(availableVariants.map(v => v.size))];
    const sizeItems = sizeDropdown.querySelectorAll('os-dropdown-item');
    
    sizeItems.forEach(item => {
      const sizeName = item.querySelector('.os-card__variant-toggle-name')?.textContent?.trim();
      if (sizeName && !availableSizes.includes(sizeName)) {
        item.setAttribute('disabled', '');
        item.classList.add('disabled');
      } else {
        item.removeAttribute('disabled');
        item.classList.remove('disabled');
      }
    });
  }

  updateColorDropdown(slot, availableVariants) {
    const colorDropdown = slot.querySelector('os-dropdown[next-variant-option="color"]');
    if (!colorDropdown) return;
    
    const availableColors = [...new Set(availableVariants.map(v => v.color))];
    const colorItems = colorDropdown.querySelectorAll('os-dropdown-item');
    
    colorItems.forEach(item => {
      const colorName = item.querySelector('.os-card__variant-toggle-name')?.textContent?.trim();
      if (colorName && !availableColors.includes(colorName)) {
        item.setAttribute('disabled', '');
        item.classList.add('disabled');
      } else {
        item.removeAttribute('disabled');
        item.classList.remove('disabled');
      }
    });
  }

  updateDependentDropdowns(slotNumber, changedVariantType) {
    this.updateAvailableOptions(slotNumber, changedVariantType);
  }

  checkCompleteSelection(slotNumber, shouldDispatchEvent = true) {
    const slotVariants = this.selectedVariants.get(slotNumber);
    console.log(`[Grounded] Checking complete selection for slot ${slotNumber}:`, slotVariants);
    
    if (!slotVariants) {
      console.log(`[Grounded] No variants selected for slot ${slotNumber}`);
      // Update CTA buttons for incomplete state
      if (shouldDispatchEvent) {
        setTimeout(() => this.updateCTAButtons(), 100);
      }
      return false;
    }
    
    const hasColor = slotVariants.color && slotVariants.color !== 'select-color';
    const hasSize = slotVariants.size && slotVariants.size !== 'select-size';
    
    console.log(`[Grounded] Slot ${slotNumber} - hasColor: ${hasColor} (${slotVariants.color}), hasSize: ${hasSize} (${slotVariants.size})`);
    
    if (hasColor && hasSize) {
      const colorName = this.valueToVariantMap[slotVariants.color];
      const sizeName = this.valueToVariantMap[slotVariants.size];
      
      console.log(`[Grounded] Looking for variant - Color: ${colorName}, Size: ${sizeName}, Quantity: ${this.currentTier}`);
      
      const matchingVariant = groundedSheetsVariants.find(v => 
        v.color === colorName && 
        v.size === sizeName && 
        v.quantity === this.currentTier
      );
      
      if (matchingVariant) {
        console.log(`[Grounded] ✅ Complete selection for slot ${slotNumber}:`, matchingVariant);
        
        // Update cart for this specific slot
        if (shouldDispatchEvent) {
          this.updateCampaignCart(slotNumber, matchingVariant);
          
          // Dispatch event for this slot
          this.dispatchVariantCompleteEvent(slotNumber, matchingVariant);
          
          // Update CTA buttons after a delay to ensure cart operations complete
          setTimeout(() => this.updateCTAButtons(), 200);
        }
        return true;
      } else {
        console.log(`[Grounded] ❌ No matching variant found for combination`);
      }
    }
    
    // Update CTA buttons for incomplete selections
    if (shouldDispatchEvent) {
      setTimeout(() => this.updateCTAButtons(), 100);
    }
    
    return false;
  }

  // Update the resetVariantSelections method to reset images
  resetVariantSelections() {
    this.selectedVariants.clear();
    
    const dropdowns = document.querySelectorAll('os-dropdown[next-variant-option]');
    dropdowns.forEach(dropdown => {
      const defaultValue = dropdown.getAttribute('next-variant-option') === 'color' ? 
        'obsidian-grey' : 'select-size';
      dropdown.value = defaultValue;
      
      // Reset images to default (obsidian-grey)
      if (dropdown.getAttribute('next-variant-option') === 'color') {
        const slot = dropdown.closest('[next-tier-slot]');
        if (slot) {
          this.updateSlotImage(slot, 'obsidian-grey');
        }
      }
    });
  }

  // Add a method to preload images for better performance
  preloadImages() {
    Object.values(this.colorImages).forEach(imageUrl => {
      const img = new Image();
      img.src = imageUrl;
    });
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

  initializeDefaultState() {
    const defaultSelectedCard = document.querySelector('.os-card.next-selected');
    if (defaultSelectedCard) {
      const tier = parseInt(defaultSelectedCard.getAttribute('data-next-tier'));
      if (tier) {
        this.currentTier = tier;
        this.updateSlotStates(tier);
      }
    }
    
    // Check for pre-selected dropdowns on page load
    this.initializePreselectedValues();
  }
  
  initializePreselectedValues() {
    // Delay checking to ensure dropdowns are fully initialized
    setTimeout(() => {
      console.log('[Grounded] Checking for pre-selected values...');
      const slots = document.querySelectorAll('[next-tier-slot]');
      
      slots.forEach(slot => {
        const slotNumber = parseInt(slot.getAttribute('next-tier-slot'));
        
        // Only check active slots
        if (slotNumber <= this.currentTier) {
          const colorDropdown = slot.querySelector('os-dropdown[next-variant-option="color"]');
          const sizeDropdown = slot.querySelector('os-dropdown[next-variant-option="size"]');
          
          let hasPreselection = false;
          
          // Check for pre-selected color
          if (colorDropdown) {
            const colorValue = colorDropdown.value || colorDropdown.getAttribute('value');
            if (colorValue && colorValue !== 'select-color' && colorValue !== '') {
              if (!this.selectedVariants.has(slotNumber)) {
                this.selectedVariants.set(slotNumber, {});
              }
              this.selectedVariants.get(slotNumber).color = colorValue;
              hasPreselection = true;
              console.log(`[Grounded] Pre-selected color for slot ${slotNumber}: ${colorValue}`);
            }
          }
          
          // Check for pre-selected size
          if (sizeDropdown) {
            const sizeValue = sizeDropdown.value || sizeDropdown.getAttribute('value');
            if (sizeValue && sizeValue !== 'select-size' && sizeValue !== '') {
              if (!this.selectedVariants.has(slotNumber)) {
                this.selectedVariants.set(slotNumber, {});
              }
              this.selectedVariants.get(slotNumber).size = sizeValue;
              hasPreselection = true;
              console.log(`[Grounded] Pre-selected size for slot ${slotNumber}: ${sizeValue}`);
            }
          }
          
          // Check if we have a complete selection after initialization
          if (hasPreselection) {
            this.checkCompleteSelection(slotNumber);
            // Update pricing display for this slot
            this.updateSlotPricing(slotNumber);
          }
        }
      });
    }, 100); // Small delay to ensure DOM is ready
  }

  dispatchTierChangeEvent(tierNumber) {
    const event = new CustomEvent('tierChange', {
      detail: {
        tier: tierNumber,
        previousTier: this.currentTier,
        controller: this
      },
      bubbles: true
    });
    
    document.dispatchEvent(event);
  }

  dispatchVariantCompleteEvent(slotNumber, variant) {
    const event = new CustomEvent('variantComplete', {
      detail: {
        slot: slotNumber,
        variant: variant,
        tier: this.currentTier,
        controller: this
      },
      bubbles: true
    });
    
    document.dispatchEvent(event);
    
    // Note: updateCampaignCart is called from checkCompleteSelection, not here
    // to avoid double-calling it
  }
  
  // Replace the updateCampaignCart method
  updateCampaignCart(slotNumber, variant) {
    console.log('[Grounded] updateCampaignCart called for slot', slotNumber, variant);
    
    // Check if next is available
    if (typeof window.next === 'undefined') {
      console.warn('[Grounded] window.next not available');
      return;
    }
    
    try {
      // Get the previous variant for this slot (if any)
      const previousVariantId = this.slotCartMapping.get(slotNumber);
      
      // If this slot had a different variant before, we need to recalculate the entire cart
      if (previousVariantId && previousVariantId !== variant.id) {
        console.log(`[Grounded] Slot ${slotNumber} changed from variant ${previousVariantId} to ${variant.id}, recalculating cart`);
        this.recalculateEntireCart(slotNumber, variant);
        return;
      }
      
      // If this is the same variant for this slot, no change needed
      if (previousVariantId === variant.id) {
        console.log(`[Grounded] Slot ${slotNumber} already has variant ${variant.id}, no change needed`);
        return;
      }
      
      // This is a new selection for this slot
      this.slotCartMapping.set(slotNumber, variant.id);
      
      // Add the variant to cart
      const cartItem = {
        packageId: variant.id,
        quantity: 1  // Always 1 because variant already contains correct quantity for tier
      };
      
      console.log('[Grounded] Adding new variant to cart:', cartItem);
      window.next.addItem(cartItem);
      
      console.log(`[Grounded] Successfully added to cart - Slot ${slotNumber}:`, variant);
      
    } catch (error) {
      console.error('[Grounded] Error updating cart:', error);
    }
  }

  // Add this new method to properly recalculate the entire cart
  recalculateEntireCart(changedSlotNumber = null, newVariant = null) {
    console.log('[Grounded] Recalculating entire cart...');
    
    // Clear the cart completely
    if (typeof window.next !== 'undefined' && window.next.clearCart) {
      window.next.clearCart();
    }
    
    // Update the slot mapping for the changed slot
    if (changedSlotNumber && newVariant) {
      this.slotCartMapping.set(changedSlotNumber, newVariant.id);
    }
    
    // Count how many slots selected each variant
    const variantSlotCount = new Map(); // variant.id -> count of slots that selected it
    
    // Go through all active slots and count variant selections
    for (let i = 1; i <= this.currentTier; i++) {
      const slotVariants = this.selectedVariants.get(i);
      if (slotVariants && slotVariants.color && slotVariants.size) {
        const colorName = this.valueToVariantMap[slotVariants.color];
        const sizeName = this.valueToVariantMap[slotVariants.size];
        
        const matchingVariant = groundedSheetsVariants.find(v => 
          v.color === colorName && 
          v.size === sizeName && 
          v.quantity === this.currentTier
        );
        
        if (matchingVariant) {
          // Update slot mapping
          this.slotCartMapping.set(i, matchingVariant.id);
          
          // Count how many slots selected this variant
          const currentCount = variantSlotCount.get(matchingVariant.id) || 0;
          variantSlotCount.set(matchingVariant.id, currentCount + 1);
        }
      }
    }
    
    // Add each variant to cart with the correct quantity (number of slots that selected it)
    variantSlotCount.forEach((slotCount, variantId) => {
      const variant = groundedSheetsVariants.find(v => v.id === variantId);
      if (variant) {
        console.log(`[Grounded] Adding variant ${variantId} with quantity ${slotCount} to cart (${slotCount} slots selected it)`);
        
        const cartItem = {
          packageId: variantId,
          quantity: slotCount  // Key fix: quantity = number of slots that selected this variant
        };
        
        window.next.addItem(cartItem);
      }
    });
    
    // Update CTA buttons after cart operations complete
    setTimeout(() => {
      this.updateCTAButtons();
    }, 300);
    
    console.log('[Grounded] Cart recalculation complete');
  }

  checkAllSlotsComplete() {
    let completeCount = 0;
    for (let i = 1; i <= this.currentTier; i++) {
      // Pass false to prevent dispatching events (avoid infinite loop)
      if (this.checkCompleteSelection(i, false)) {
        completeCount++;
      }
    }
    
    const allComplete = completeCount === this.currentTier;
    
    if (allComplete) {
      console.log('[Grounded] All slots complete for tier', this.currentTier);
      // Only emit the completion event once
      const event = new CustomEvent('grounded:selection-complete', {
        detail: {
          tier: this.currentTier,
          selections: this.getCompleteSelections()
        },
        bubbles: true
      });
      document.dispatchEvent(event);
    }
    
    return allComplete;
  }

  // Public API methods
  getCurrentTier() {
    return this.currentTier;
  }

  getSelectedVariants() {
    return this.selectedVariants;
  }

  getCompleteSelections() {
    const complete = [];
    for (let i = 1; i <= this.currentTier; i++) {
      // Pass false to prevent dispatching events
      if (this.checkCompleteSelection(i, false)) {
        const slotVariants = this.selectedVariants.get(i);
        
        const colorName = this.valueToVariantMap[slotVariants.color];
        const sizeName = this.valueToVariantMap[slotVariants.size];
        
        const variant = groundedSheetsVariants.find(v => 
          v.color === colorName && 
          v.size === sizeName && 
          v.quantity === this.currentTier
        );
        if (variant) {
          complete.push({ slot: i, variant });
        }
      }
    }
    return complete;
  }

  programmaticSelectTier(tierNumber) {
    if (tierNumber >= 1 && tierNumber <= 3) {
      this.selectTier(tierNumber);
    }
  }
}

// Register all components
customElements.define('os-dropdown', OSDropdown);
customElements.define('os-dropdown-menu', OSDropdownMenu);
customElements.define('os-dropdown-item', OSDropdownItem);

// Initialize when DOM is ready
// Check for campaign prices periodically until found or timeout
let priceCheckAttempts = 0;
const maxAttempts = 10;

const checkForCampaignPrices = () => {
  priceCheckAttempts++;
  const campaignPrices = getPricesFromCampaign();
  
  if (campaignPrices) {
    console.log('[Grounded] Found campaign prices on attempt', priceCheckAttempts);
    // Apply campaign prices to variants
    groundedSheetsVariants = enhanceVariantsWithPrices(groundedSheetsVariantsOriginal, campaignPrices);
    
    // Initialize controller
    window.tierController = new TierController();
    window.tierController.preloadImages();
    
    // Set up event listeners
    setupEventListeners();
  } else if (priceCheckAttempts < maxAttempts) {
    console.log('[Grounded] Campaign prices not found, attempt', priceCheckAttempts, 'of', maxAttempts);
    setTimeout(checkForCampaignPrices, 500);
  } else {
    console.log('[Grounded] Max attempts reached, using fallback prices');
    // Use fallback prices
    groundedSheetsVariants = enhanceVariantsWithPrices(groundedSheetsVariantsOriginal, null);
    
    // Initialize controller
    window.tierController = new TierController();
    window.tierController.preloadImages();
    
    // Set up event listeners
    setupEventListeners();
  }
};

const setupEventListeners = () => {
  // Global event listeners for debugging/monitoring
  document.addEventListener('tierChange', (e) => {
    console.log('Tier changed:', e.detail);
  });
  
  document.addEventListener('variantComplete', (e) => {
    console.log('Variant selection complete:', e.detail);
  });
  
  // Add verify button click handler
  const verifyButton = document.querySelector('[os-checkout="verify-step"]');
  if (verifyButton) {
    verifyButton.addEventListener('click', (e) => {
      if (window.tierController) {
        const isComplete = window.tierController.handleVerifyButtonClick();
        if (!isComplete) {
          // Prevent the default action if selections are incomplete
          e.preventDefault();
          e.stopPropagation();
        }
      }
    });
  }
};

// Start checking for campaign prices
checkForCampaignPrices();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TierController, OSDropdown, OSDropdownMenu, OSDropdownItem, groundedSheetsVariants, helpers };
}

class ProgressBarController {
  constructor() {
    this.progressItems = document.querySelectorAll('[data-progress]');
    this.sections = document.querySelectorAll('[data-progress-trigger]');
    this.currentActiveStep = null;
    this.completedSteps = new Set(); // Track permanently completed steps
    
    this.init();
  }

  init() {
    console.log('Found sections:', this.sections.length);
    console.log('Found progress items:', this.progressItems.length);
    
    // Reset all steps on init
    this.resetAllSteps();
    
    // Setup scroll listener
    this.setupScrollListener();
    
    // Initial check
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
    const viewportCenter = scrollTop + (windowHeight / 2);
    
    let activeSection = null;
    let activeSectionName = null;

    // Find which section is currently in view
    this.sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const sectionTop = scrollTop + rect.top;
      const sectionBottom = sectionTop + rect.height;
      
      // Check if viewport center is within this section
      if (viewportCenter >= sectionTop && viewportCenter <= sectionBottom) {
        activeSection = section;
        activeSectionName = section.getAttribute('data-progress-trigger');
      }
    });

    // If no section is active, check if we're above the first section
    if (!activeSection && this.sections.length > 0) {
      const firstSection = this.sections[0];
      const firstSectionTop = scrollTop + firstSection.getBoundingClientRect().top;
      
      if (viewportCenter < firstSectionTop) {
        // We're above all sections, activate first step
        activeSectionName = firstSection.getAttribute('data-progress-trigger');
      }
    }

    // Mark steps as completed when we've moved past them
    this.markCompletedSteps(viewportCenter, scrollTop);

    // Update progress bar if active step changed
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
      
      // Mark as completed if we've scrolled well past this section
      if (viewportCenter > sectionBottom) {
        this.completedSteps.add(stepName);
      }
    });
  }

  updateProgressBar(activeStepName) {
    console.log('Active step:', activeStepName, 'Completed:', Array.from(this.completedSteps));
    
    this.progressItems.forEach(item => {
      const stepName = item.getAttribute('data-progress');
      
      // Remove existing classes
      item.classList.remove('active', 'completed');
      
      // Once completed, always stay completed
      if (this.completedSteps.has(stepName)) {
        item.classList.add('completed');
      } else if (stepName === activeStepName) {
        // Current step = active (only if not already completed)
        item.classList.add('active');
      }
      // Steps that haven't been reached = no class (default state)
    });
  }

  // Manual control methods
  setActiveStep(stepName) {
    this.currentActiveStep = stepName;
    this.updateProgressBar(stepName);
  }

  completeStep(stepName) {
    this.completedSteps.add(stepName);
    this.updateProgressBar(this.currentActiveStep);
  }

  reset() {
    this.currentActiveStep = null;
    this.resetAllSteps();
  }
}

// Initialize
window.progressBarController = new ProgressBarController();

console.log('loadeds');


// EXIT INTENT POPUP

   // Wait for SDK to be fully initialized
    window.addEventListener('next:initialized', function() {
      console.log('SDK initialized, setting up exit intent...');
      
      // Exit intent setup with profile switching
      next.exitIntent({
        image: 'https://cdn.prod.website-files.com/6894e401ee6c8582aece90a0/68bed75cd9973567c4ab6a25_modal-bare-earth.png',
        action: async () => {
          // Apply the exit_10 profile for 10% discount on ALL items (all tiers)
          await next.setProfile('exit_10');
          console.log('Exit 10% discount profile applied - all tiers updated');
        }
      });

      // Optional: Listen to events for analytics
      next.on('exit-intent:shown', (data) => {
        console.log('Exit intent popup shown:', data.imageUrl);
      });

      next.on('exit-intent:clicked', (data) => {
        console.log('Exit intent popup clicked:', data.imageUrl);
      });

      next.on('exit-intent:dismissed', (data) => {
        console.log('Exit intent popup dismissed:', data.imageUrl);
      });
      
      // Listen for profile change events
      next.on('profile:applied', (data) => {
        console.log(`Profile ${data.profileId} applied, ${data.itemsSwapped} items updated`);
      });
    });
  