// Keep existing structure but rename to avoid conflicts
const groundedSheetsVariantsOriginal = [
  // Single quantity variants
  { id: 1, size: 'Twin', color: 'Obsidian Grey', quantity: 1 },
  { id: 2, size: 'Twin', color: 'Chateau Ivory', quantity: 1 },
  { id: 3, size: 'Double', color: 'Obsidian Grey', quantity: 1 },
  { id: 4, size: 'Double', color: 'Chateau Ivory', quantity: 1 },
  { id: 5, size: 'Queen', color: 'Obsidian Grey', quantity: 1 },
  { id: 6, size: 'King', color: 'Obsidian Grey', quantity: 1 },
  { id: 7, size: 'Queen', color: 'Chateau Ivory', quantity: 1 },
  { id: 8, size: 'King', color: 'Chateau Ivory', quantity: 1 },
  { id: 9, size: 'Twin', color: 'Scribe Blue', quantity: 1 },
  { id: 10, size: 'Double', color: 'Scribe Blue', quantity: 1 },
  { id: 11, size: 'Queen', color: 'Scribe Blue', quantity: 1 },
  { id: 12, size: 'King', color: 'Scribe Blue', quantity: 1 },
  { id: 13, size: 'Twin', color: 'Verdant Sage', quantity: 1 },
  { id: 14, size: 'Double', color: 'Verdant Sage', quantity: 1 },
  { id: 15, size: 'Queen', color: 'Verdant Sage', quantity: 1 },
  { id: 16, size: 'King', color: 'Verdant Sage', quantity: 1 },
  { id: 17, size: 'Single', color: 'Obsidian Grey', quantity: 1 },
  { id: 18, size: 'Cali King', color: 'Obsidian Grey', quantity: 1 },
  { id: 19, size: 'Single', color: 'Chateau Ivory', quantity: 1 },
  { id: 20, size: 'Cali King', color: 'Chateau Ivory', quantity: 1 },
  { id: 21, size: 'Single', color: 'Scribe Blue', quantity: 1 },
  { id: 22, size: 'Cali King', color: 'Scribe Blue', quantity: 1 },
  { id: 23, size: 'Single', color: 'Verdant Sage', quantity: 1 },
  { id: 24, size: 'Cali King', color: 'Verdant Sage', quantity: 1 },

  // 2-pack variants
  { id: 25, size: 'Single', color: 'Obsidian Grey', quantity: 2 },
  { id: 26, size: 'Single', color: 'Chateau Ivory', quantity: 2 },
  { id: 27, size: 'Single', color: 'Scribe Blue', quantity: 2 },
  { id: 28, size: 'Single', color: 'Verdant Sage', quantity: 2 },
  { id: 29, size: 'Twin', color: 'Obsidian Grey', quantity: 2 },
  { id: 30, size: 'Twin', color: 'Chateau Ivory', quantity: 2 },
  { id: 31, size: 'Twin', color: 'Scribe Blue', quantity: 2 },
  { id: 32, size: 'Twin', color: 'Verdant Sage', quantity: 2 },
  { id: 33, size: 'Double', color: 'Obsidian Grey', quantity: 2 },
  { id: 34, size: 'Double', color: 'Chateau Ivory', quantity: 2 },
  { id: 35, size: 'Double', color: 'Scribe Blue', quantity: 2 },
  { id: 36, size: 'Double', color: 'Verdant Sage', quantity: 2 },
  { id: 37, size: 'Queen', color: 'Obsidian Grey', quantity: 2 },
  { id: 38, size: 'Queen', color: 'Chateau Ivory', quantity: 2 },
  { id: 39, size: 'Queen', color: 'Scribe Blue', quantity: 2 },
  { id: 40, size: 'Queen', color: 'Verdant Sage', quantity: 2 },
  { id: 41, size: 'King', color: 'Obsidian Grey', quantity: 2 },
  { id: 42, size: 'King', color: 'Chateau Ivory', quantity: 2 },
  { id: 43, size: 'King', color: 'Scribe Blue', quantity: 2 },
  { id: 44, size: 'King', color: 'Verdant Sage', quantity: 2 },
  { id: 45, size: 'Cali King', color: 'Obsidian Grey', quantity: 2 },
  { id: 46, size: 'Cali King', color: 'Chateau Ivory', quantity: 2 },
  { id: 47, size: 'Cali King', color: 'Scribe Blue', quantity: 2 },
  { id: 48, size: 'Cali King', color: 'Verdant Sage', quantity: 2 },

  // 3-pack variants
  { id: 49, size: 'Single', color: 'Obsidian Grey', quantity: 3 },
  { id: 50, size: 'Single', color: 'Chateau Ivory', quantity: 3 },
  { id: 51, size: 'Single', color: 'Scribe Blue', quantity: 3 },
  { id: 52, size: 'Single', color: 'Verdant Sage', quantity: 3 },
  { id: 53, size: 'Twin', color: 'Obsidian Grey', quantity: 3 },
  { id: 54, size: 'Twin', color: 'Chateau Ivory', quantity: 3 },
  { id: 56, size: 'Twin', color: 'Scribe Blue', quantity: 3 },
  { id: 57, size: 'Twin', color: 'Verdant Sage', quantity: 3 },
  { id: 58, size: 'Double', color: 'Obsidian Grey', quantity: 3 },
  { id: 59, size: 'Double', color: 'Chateau Ivory', quantity: 3 },
  { id: 60, size: 'Double', color: 'Scribe Blue', quantity: 3 },
  { id: 61, size: 'Double', color: 'Verdant Sage', quantity: 3 },
  { id: 62, size: 'Queen', color: 'Obsidian Grey', quantity: 3 },
  { id: 63, size: 'Queen', color: 'Chateau Ivory', quantity: 3 },
  { id: 64, size: 'Queen', color: 'Scribe Blue', quantity: 3 },
  { id: 65, size: 'Queen', color: 'Verdant Sage', quantity: 3 },
  { id: 66, size: 'King', color: 'Obsidian Grey', quantity: 3 },
  { id: 67, size: 'King', color: 'Chateau Ivory', quantity: 3 },
  { id: 68, size: 'King', color: 'Scribe Blue', quantity: 3 },
  { id: 69, size: 'King', color: 'Verdant Sage', quantity: 3 },
  { id: 70, size: 'Cali King', color: 'Obsidian Grey', quantity: 3 },
  { id: 71, size: 'Cali King', color: 'Chateau Ivory', quantity: 3 },
  { id: 72, size: 'Cali King', color: 'Scribe Blue', quantity: 3 },
  { id: 73, size: 'Cali King', color: 'Verdant Sage', quantity: 3 },

  // Exit 10% discount variants - Single quantity
  {
    id: 74,
    size: 'Single',
    color: 'Obsidian Grey',
    quantity: 1,
    discount: 'Exit 10%',
  },
  {
    id: 75,
    size: 'Single',
    color: 'Chateau Ivory',
    quantity: 1,
    discount: 'Exit 10%',
  },
  {
    id: 76,
    size: 'Single',
    color: 'Scribe Blue',
    quantity: 1,
    discount: 'Exit 10%',
  },
  {
    id: 77,
    size: 'Single',
    color: 'Verdant Sage',
    quantity: 1,
    discount: 'Exit 10%',
  },
  {
    id: 78,
    size: 'Twin',
    color: 'Obsidian Grey',
    quantity: 1,
    discount: 'Exit 10%',
  },
  {
    id: 79,
    size: 'Twin',
    color: 'Chateau Ivory',
    quantity: 1,
    discount: 'Exit 10%',
  },
  {
    id: 80,
    size: 'Twin',
    color: 'Scribe Blue',
    quantity: 1,
    discount: 'Exit 10%',
  },
  {
    id: 81,
    size: 'Twin',
    color: 'Verdant Sage',
    quantity: 1,
    discount: 'Exit 10%',
  },
  {
    id: 82,
    size: 'Double',
    color: 'Obsidian Grey',
    quantity: 1,
    discount: 'Exit 10%',
  },
  {
    id: 83,
    size: 'Double',
    color: 'Chateau Ivory',
    quantity: 1,
    discount: 'Exit 10%',
  },
  {
    id: 84,
    size: 'Double',
    color: 'Scribe Blue',
    quantity: 1,
    discount: 'Exit 10%',
  },
  {
    id: 85,
    size: 'Double',
    color: 'Verdant Sage',
    quantity: 1,
    discount: 'Exit 10%',
  },
  {
    id: 86,
    size: 'Queen',
    color: 'Obsidian Grey',
    quantity: 1,
    discount: 'Exit 10%',
  },
  {
    id: 87,
    size: 'Queen',
    color: 'Chateau Ivory',
    quantity: 1,
    discount: 'Exit 10%',
  },
  {
    id: 88,
    size: 'Queen',
    color: 'Scribe Blue',
    quantity: 1,
    discount: 'Exit 10%',
  },
  {
    id: 89,
    size: 'Queen',
    color: 'Verdant Sage',
    quantity: 1,
    discount: 'Exit 10%',
  },
  {
    id: 90,
    size: 'King',
    color: 'Obsidian Grey',
    quantity: 1,
    discount: 'Exit 10%',
  },
  {
    id: 91,
    size: 'King',
    color: 'Chateau Ivory',
    quantity: 1,
    discount: 'Exit 10%',
  },
  {
    id: 92,
    size: 'King',
    color: 'Scribe Blue',
    quantity: 1,
    discount: 'Exit 10%',
  },
  {
    id: 93,
    size: 'King',
    color: 'Verdant Sage',
    quantity: 1,
    discount: 'Exit 10%',
  },
  {
    id: 94,
    size: 'Cali King',
    color: 'Obsidian Grey',
    quantity: 1,
    discount: 'Exit 10%',
  },
  {
    id: 95,
    size: 'Cali King',
    color: 'Chateau Ivory',
    quantity: 1,
    discount: 'Exit 10%',
  },
  {
    id: 96,
    size: 'Cali King',
    color: 'Scribe Blue',
    quantity: 1,
    discount: 'Exit 10%',
  },
  {
    id: 97,
    size: 'Cali King',
    color: 'Verdant Sage',
    quantity: 1,
    discount: 'Exit 10%',
  },

  // Exit 10% discount variants - 2-pack
  {
    id: 98,
    size: 'Single',
    color: 'Obsidian Grey',
    quantity: 2,
    discount: 'Exit 10%',
  },
  {
    id: 99,
    size: 'Single',
    color: 'Chateau Ivory',
    quantity: 2,
    discount: 'Exit 10%',
  },
  {
    id: 100,
    size: 'Single',
    color: 'Scribe Blue',
    quantity: 2,
    discount: 'Exit 10%',
  },
  {
    id: 101,
    size: 'Single',
    color: 'Verdant Sage',
    quantity: 2,
    discount: 'Exit 10%',
  },
  {
    id: 102,
    size: 'Twin',
    color: 'Obsidian Grey',
    quantity: 2,
    discount: 'Exit 10%',
  },
  {
    id: 103,
    size: 'Twin',
    color: 'Chateau Ivory',
    quantity: 2,
    discount: 'Exit 10%',
  },
  {
    id: 104,
    size: 'Twin',
    color: 'Scribe Blue',
    quantity: 2,
    discount: 'Exit 10%',
  },
  {
    id: 105,
    size: 'Twin',
    color: 'Verdant Sage',
    quantity: 2,
    discount: 'Exit 10%',
  },
  {
    id: 106,
    size: 'Double',
    color: 'Obsidian Grey',
    quantity: 2,
    discount: 'Exit 10%',
  },
  {
    id: 107,
    size: 'Double',
    color: 'Chateau Ivory',
    quantity: 2,
    discount: 'Exit 10%',
  },
  {
    id: 108,
    size: 'Double',
    color: 'Scribe Blue',
    quantity: 2,
    discount: 'Exit 10%',
  },
  {
    id: 109,
    size: 'Double',
    color: 'Verdant Sage',
    quantity: 2,
    discount: 'Exit 10%',
  },
  {
    id: 110,
    size: 'Queen',
    color: 'Obsidian Grey',
    quantity: 2,
    discount: 'Exit 10%',
  },
  {
    id: 111,
    size: 'Queen',
    color: 'Chateau Ivory',
    quantity: 2,
    discount: 'Exit 10%',
  },
  {
    id: 112,
    size: 'Queen',
    color: 'Scribe Blue',
    quantity: 2,
    discount: 'Exit 10%',
  },
  {
    id: 113,
    size: 'Queen',
    color: 'Verdant Sage',
    quantity: 2,
    discount: 'Exit 10%',
  },
  {
    id: 114,
    size: 'King',
    color: 'Obsidian Grey',
    quantity: 2,
    discount: 'Exit 10%',
  },
  {
    id: 115,
    size: 'King',
    color: 'Chateau Ivory',
    quantity: 2,
    discount: 'Exit 10%',
  },
  {
    id: 116,
    size: 'King',
    color: 'Scribe Blue',
    quantity: 2,
    discount: 'Exit 10%',
  },
  {
    id: 117,
    size: 'King',
    color: 'Verdant Sage',
    quantity: 2,
    discount: 'Exit 10%',
  },
  {
    id: 118,
    size: 'Cali King',
    color: 'Obsidian Grey',
    quantity: 2,
    discount: 'Exit 10%',
  },
  {
    id: 119,
    size: 'Cali King',
    color: 'Chateau Ivory',
    quantity: 2,
    discount: 'Exit 10%',
  },
  {
    id: 120,
    size: 'Cali King',
    color: 'Scribe Blue',
    quantity: 2,
    discount: 'Exit 10%',
  },
  {
    id: 121,
    size: 'Cali King',
    color: 'Verdant Sage',
    quantity: 2,
    discount: 'Exit 10%',
  },

  // Exit 10% discount variants - 3-pack
  {
    id: 122,
    size: 'Single',
    color: 'Obsidian Grey',
    quantity: 3,
    discount: 'Exit 10%',
  },
  {
    id: 123,
    size: 'Single',
    color: 'Chateau Ivory',
    quantity: 3,
    discount: 'Exit 10%',
  },
  {
    id: 124,
    size: 'Single',
    color: 'Scribe Blue',
    quantity: 3,
    discount: 'Exit 10%',
  },
  {
    id: 125,
    size: 'Single',
    color: 'Verdant Sage',
    quantity: 3,
    discount: 'Exit 10%',
  },
  {
    id: 126,
    size: 'Twin',
    color: 'Obsidian Grey',
    quantity: 3,
    discount: 'Exit 10%',
  },
  {
    id: 127,
    size: 'Twin',
    color: 'Chateau Ivory',
    quantity: 3,
    discount: 'Exit 10%',
  },
  {
    id: 128,
    size: 'Twin',
    color: 'Scribe Blue',
    quantity: 3,
    discount: 'Exit 10%',
  },
  {
    id: 129,
    size: 'Twin',
    color: 'Verdant Sage',
    quantity: 3,
    discount: 'Exit 10%',
  },
  {
    id: 130,
    size: 'Double',
    color: 'Obsidian Grey',
    quantity: 3,
    discount: 'Exit 10%',
  },
  {
    id: 131,
    size: 'Double',
    color: 'Chateau Ivory',
    quantity: 3,
    discount: 'Exit 10%',
  },
  {
    id: 132,
    size: 'Double',
    color: 'Scribe Blue',
    quantity: 3,
    discount: 'Exit 10%',
  },
  {
    id: 133,
    size: 'Double',
    color: 'Verdant Sage',
    quantity: 3,
    discount: 'Exit 10%',
  },
  {
    id: 134,
    size: 'Queen',
    color: 'Obsidian Grey',
    quantity: 3,
    discount: 'Exit 10%',
  },
  {
    id: 135,
    size: 'Queen',
    color: 'Chateau Ivory',
    quantity: 3,
    discount: 'Exit 10%',
  },
  {
    id: 136,
    size: 'Queen',
    color: 'Scribe Blue',
    quantity: 3,
    discount: 'Exit 10%',
  },
  {
    id: 137,
    size: 'Queen',
    color: 'Verdant Sage',
    quantity: 3,
    discount: 'Exit 10%',
  },
  {
    id: 138,
    size: 'King',
    color: 'Obsidian Grey',
    quantity: 3,
    discount: 'Exit 10%',
  },
  {
    id: 139,
    size: 'King',
    color: 'Chateau Ivory',
    quantity: 3,
    discount: 'Exit 10%',
  },
  {
    id: 140,
    size: 'King',
    color: 'Scribe Blue',
    quantity: 3,
    discount: 'Exit 10%',
  },
  {
    id: 141,
    size: 'King',
    color: 'Verdant Sage',
    quantity: 3,
    discount: 'Exit 10%',
  },
  {
    id: 142,
    size: 'Cali King',
    color: 'Obsidian Grey',
    quantity: 3,
    discount: 'Exit 10%',
  },
  {
    id: 143,
    size: 'Cali King',
    color: 'Chateau Ivory',
    quantity: 3,
    discount: 'Exit 10%',
  },
  {
    id: 144,
    size: 'Cali King',
    color: 'Scribe Blue',
    quantity: 3,
    discount: 'Exit 10%',
  },
  {
    id: 145,
    size: 'Cali King',
    color: 'Verdant Sage',
    quantity: 3,
    discount: 'Exit 10%',
  },
];

function getPricesFromCampaign() {
  try {
    const cacheData = sessionStorage.getItem('next-campaign-cache');
    if (!cacheData) return null;

    const cache = JSON.parse(cacheData);
    if (!cache.campaign?.packages) return null;

    const priceMap = {};
    cache.campaign.packages.forEach(pkg => {
      if (pkg.ref_id && pkg.price && pkg.price_retail) {
        priceMap[pkg.ref_id] = {
          salePrice: parseFloat(pkg.price),
          regularPrice: parseFloat(pkg.price_retail),
        };
      }
    });
    return priceMap;
  } catch (error) {
    return null;
  }
}

const sizePricing = {
  Single: { regular: 898, sale: 449 },
  Twin: { regular: 998, sale: 499 },
  Double: { regular: 1198, sale: 599 },
  Queen: { regular: 1398, sale: 649 },
  King: { regular: 1598, sale: 749 },
  'Cali King': { regular: 1598, sale: 749 },
};

function enhanceVariantsWithPrices(variants, campaignPrices = null) {
  return variants.map(variant => {
    if (campaignPrices?.[variant.id]) {
      return {
        ...variant,
        regularPrice: campaignPrices[variant.id].regularPrice,
        salePrice: campaignPrices[variant.id].salePrice,
      };
    }

    const basePrice = sizePricing[variant.size];
    if (basePrice) {
      return {
        ...variant,
        regularPrice: basePrice.regular * variant.quantity,
        salePrice: basePrice.sale * variant.quantity,
      };
    }

    return variant;
  });
}

let groundedSheetsVariants = [...groundedSheetsVariantsOriginal];

const helpers = {
  getBySize: size => groundedSheetsVariants.filter(v => v.size === size),
  getByColor: color => groundedSheetsVariants.filter(v => v.color === color),
  getByQuantity: qty => groundedSheetsVariants.filter(v => v.quantity === qty),
  getById: id => groundedSheetsVariants.find(v => v.id === id),
  getUniqueSizes: () => [...new Set(groundedSheetsVariants.map(v => v.size))],
  getUniqueColors: () => [...new Set(groundedSheetsVariants.map(v => v.color))],
  getFiltered: filters => {
    return groundedSheetsVariants.filter(v => {
      return (
        (!filters.size || v.size === filters.size) &&
        (!filters.color || v.color === filters.color) &&
        (!filters.quantity || v.quantity === filters.quantity)
      );
    });
  },
};

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

const { computePosition, flip, offset, autoUpdate, arrow } =
  window.FloatingUIDOM;

class OSDropdown extends ConversionElement {
  constructor() {
    super();
    this.toggle = null;
    this.menu = null;
    this.arrow = null;
    this._value = null;
    this.cleanupAutoUpdate = null;
  }

  static observedAttributes = [
    'value',
    'name',
    'disabled',
    'animate-selection',
    'animation-duration',
  ];
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

    this.menu.classList.remove(
      'placement-top',
      'placement-bottom',
      'placement-left',
      'placement-right'
    );
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

    this.menu.classList.remove(
      'placement-top',
      'placement-bottom',
      'placement-left',
      'placement-right'
    );

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

    const selectedItem = this.querySelector(
      `os-dropdown-item[value="${this._value}"]`
    );
    if (!selectedItem) return;

    const itemContent = selectedItem.querySelector('.os-card__toggle-option');
    if (!itemContent) return;

    const existingContent = this.toggle.querySelector(
      '.os-card__toggle-option'
    );

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

          while (
            existingContent.parentNode &&
            existingContent.parentNode.firstChild
          ) {
            if (existingContent.parentNode.firstChild === existingContent) {
              contentWrapper.appendChild(existingContent.parentNode.firstChild);
              break;
            }
            existingContent.parentNode.firstChild.remove();
          }

          const icon = this.toggle.querySelector(
            '.os-card__variant-dropdown-icon'
          );
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
        if (isAbove) existingContent.setAttribute('data-placement', 'top');

        newContent.setAttribute('data-animating', 'in');
        newContent.setAttribute('data-animation-type', animationType);
        if (isAbove) newContent.setAttribute('data-placement', 'top');
        newContent.setAttribute('data-current', '');

        existingContent.classList.add('os-dropdown__option');
        newContent.classList.add('os-dropdown__option');

        const duration = this.getAttribute('animation-duration') || '300';
        contentWrapper.style.setProperty(
          '--animation-duration',
          `${duration}ms`
        );

        contentWrapper.appendChild(newContent);

        requestAnimationFrame(() => {
          newContent.removeAttribute('data-animating');

          const duration = parseInt(
            this.getAttribute('animation-duration') || '300'
          );
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
    const items = Array.from(
      this.querySelectorAll('os-dropdown-item:not([disabled])')
    );
    const currentIndex = items.findIndex(item => item.selected);
    const newIndex = Math.max(
      0,
      Math.min(items.length - 1, currentIndex + direction)
    );

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

class TierController {
  constructor() {
    this.currentTier = 1;
    this.selectedVariants = new Map();
    this.slotCartMapping = new Map();

    this.colorImages = {
      'obsidian-grey':
        'https://cdn.29next.store/media/bareearth/uploads/obsidian-grey.png',
      'chateau-ivory':
        'https://cdn.29next.store/media/bareearth/uploads/chateau-ivory.png',
      'scribe-blue':
        'https://cdn.29next.store/media/bareearth/uploads/scribe-blue.png',
      'verdant-sage':
        'https://cdn.29next.store/media/bareearth/uploads/verdant-sage.png',
    };

    this.colorStyles = {
      'obsidian-grey': '#9699a6',
      'chateau-ivory': '#e4e4e5',
      'scribe-blue': '#4a90e2',
      'verdant-sage': '#87a96b',
    };

    this.valueToVariantMap = {
      'obsidian-grey': 'Obsidian Grey',
      'chateau-ivory': 'Chateau Ivory',
      'scribe-blue': 'Scribe Blue',
      'verdant-sage': 'Verdant Sage',
      single: 'Single',
      twin: 'Twin',
      double: 'Double',
      queen: 'Queen',
      king: 'King',
      'cali-king': 'Cali King',
    };

    this.init();
  }

  init() {
    this.clearCartOnPageLoad();
    this.bindTierSelection();
    this.bindDropdownEvents();
    this.initializeDefaultState();
    this.populateAllDropdowns();
    this.updateExistingColorItems();
    this.initializeColorSwatches();
    this.initializeSlotImages();
    this.setupCampaignCartListeners();
    this.setupProfileListeners();
    this.initializeWithSDK();
    this.updateCTAButtons();
  }

  setupProfileListeners() {
    this.lastKnownProfile = this.getCurrentProfile();

    const setupSDKListeners = () => {
      if (typeof window.next !== 'undefined' && window.next.on) {
        window.next.on('profile:applied', data => {
          setTimeout(() => {
            this.refreshPricesFromCampaign();
          }, 100);
        });

        window.next.on('profile:reverted', data => {
          setTimeout(() => {
            this.refreshPricesFromCampaign();
          }, 100);
        });

        return true;
      }
      return false;
    };

    if (!setupSDKListeners()) {
      window.addEventListener('next:initialized', () => {
        setupSDKListeners();
        this.refreshPricesFromCampaign();
      });
    }

    document.addEventListener('profile:applied', event => {
      this.refreshPricesFromCampaign();
    });

    document.addEventListener('profile:reverted', () => {
      this.refreshPricesFromCampaign();
    });

    window.addEventListener('storage', event => {
      if (event.key === 'next-profile-store') {
        this.refreshPricesFromCampaign();
      }
    });

    this.profileCheckInterval = setInterval(() => {
      const currentProfile = this.getCurrentProfile();
      if (currentProfile !== this.lastKnownProfile) {
        this.lastKnownProfile = currentProfile;
        this.refreshPricesFromCampaign();
      }
    }, 500);
  }

  getCurrentProfile() {
    try {
      const profileStoreData = sessionStorage.getItem('next-profile-store');
      if (profileStoreData) {
        const profileStore = JSON.parse(profileStoreData);
        return profileStore?.state?.activeProfileId || null;
      }
    } catch (error) {}
    return null;
  }

  // In initializeWithSDK(), add more robust checking:
  initializeWithSDK() {
    const maxAttempts = 50; // 5 seconds max wait
    let attempts = 0;

    const waitForSDK = () => {
      return new Promise((resolve, reject) => {
        const checkSDK = () => {
          attempts++;

          // Check if SDK is fully ready with all required methods
          if (
            typeof window.next !== 'undefined' &&
            window.next.addItem &&
            window.next.clearCart
          ) {
            console.log('[Debug] SDK fully ready with all methods');
            resolve();
          } else if (attempts >= maxAttempts) {
            console.error('[Debug] SDK failed to load after maximum attempts');
            reject(new Error('SDK timeout'));
          } else {
            // Log what's missing for debugging
            if (typeof window.next === 'undefined') {
              console.log('[Debug] SDK not ready, window.next is undefined');
            } else {
              console.log('[Debug] SDK partially ready, missing methods:', {
                addItem: !!window.next.addItem,
                clearCart: !!window.next.clearCart,
              });
            }
            setTimeout(checkSDK, 100);
          }
        };

        checkSDK();
      });
    };

    waitForSDK()
      .then(() => {
        console.log('[Debug] SDK ready, processing preselected values');

        // Clear cart if it was pending
        if (this.pendingCartClear && !this.cartCleared) {
          console.log('[Debug] Executing pending cart clear');
          window.next.clearCart();
          this.slotCartMapping.clear();
          this.selectedVariants.clear();
          this.cartCleared = true;
          this.pendingCartClear = false;
        }

        this.refreshPricesFromCampaign();

        // Initialize preselected values after SDK is ready
        this.initializePreselectedValues();

        // Also recheck all slots after a short delay
        setTimeout(() => {
          this.recheckAllSlots();
        }, 500);
      })
      .catch(error => {
        console.error('[Debug] SDK initialization failed:', error);
      });
  }

  // Add this method to recheck all slots
  recheckAllSlots() {
    console.log('[Debug] Rechecking all slots for cart additions');

    // Process any pending cart updates first
    if (this.pendingCartUpdates && this.pendingCartUpdates.length > 0) {
      console.log(
        `[Debug] Processing ${this.pendingCartUpdates.length} pending cart updates`
      );
      const pending = [...this.pendingCartUpdates];
      this.pendingCartUpdates = [];

      pending.forEach(({ slotNumber, variant }) => {
        console.log(`[Debug] Retrying cart update for slot ${slotNumber}`);
        this.updateCampaignCart(slotNumber, variant);
      });
    }

    // Then check all slots
    for (let i = 1; i <= this.currentTier; i++) {
      const slotVariants = this.selectedVariants.get(i);
      if (slotVariants?.color && slotVariants?.size) {
        console.log(`[Debug] Slot ${i} has complete selection, adding to cart`);
        this.checkCompleteSelection(i, true);
      }
    }
  }

  // Add method to sync with existing cart
  syncWithExistingCart() {
    console.log('[Debug] Syncing with existing cart state');

    const cartState = window.next?.getCartState?.() || window.next?.cart;
    if (!cartState) {
      console.log('[Debug] Cart state not available for sync');
      return;
    }
    if (!cartState?.items || cartState.items.length === 0) {
      console.log('[Debug] Cart is empty, nothing to sync');
      return;
    }

    console.log(
      `[Debug] Found ${cartState.items.length} items in existing cart`
    );

    // Map cart items back to slots
    cartState.items.forEach(item => {
      // Find which slot this package belongs to
      for (let i = 1; i <= this.currentTier; i++) {
        if (this.slotCartMapping.get(i) === item.packageId) {
          console.log(
            `[Debug] Cart item ${item.packageId} belongs to slot ${i}`
          );
          // Mark this slot as having an item
          // This prevents re-adding it
        }
      }
    });
  }

  refreshPricesFromCampaign() {
    const campaignPrices = getPricesFromCampaign();

    if (campaignPrices) {
      let profileMappings = null;
      let activeProfileId = null;

      if (typeof window.next !== 'undefined' && window.next.getActiveProfile) {
        try {
          activeProfileId = window.next.getActiveProfile();
        } catch (error) {}
      }

      if (!activeProfileId) {
        const profileStoreData = sessionStorage.getItem('next-profile-store');
        if (profileStoreData) {
          try {
            const profileStore = JSON.parse(profileStoreData);
            activeProfileId = profileStore?.state?.activeProfileId;
          } catch (error) {}
        }
      }

      if (
        activeProfileId &&
        activeProfileId !== 'default' &&
        window.nextConfig?.profiles?.[activeProfileId]
      ) {
        profileMappings =
          window.nextConfig.profiles[activeProfileId].packageMappings;
      }

      const profileAwarePrices = {};

      groundedSheetsVariantsOriginal.forEach(variant => {
        if (profileMappings && profileMappings[variant.id]) {
          const mappedPackageId = profileMappings[variant.id];
          const mappedPrices = campaignPrices[mappedPackageId];

          if (mappedPrices) {
            profileAwarePrices[variant.id] = {
              salePrice: mappedPrices.salePrice,
              regularPrice: mappedPrices.regularPrice,
            };
          } else {
            const basePrices = campaignPrices[variant.id];
            if (basePrices) {
              profileAwarePrices[variant.id] = basePrices;
            }
          }
        } else {
          const basePrices = campaignPrices[variant.id];
          if (basePrices) {
            profileAwarePrices[variant.id] = basePrices;
          }
        }
      });

      groundedSheetsVariants = enhanceVariantsWithPrices(
        groundedSheetsVariantsOriginal,
        profileAwarePrices
      );

      this.populateAllDropdowns();

      for (let i = 1; i <= this.currentTier; i++) {
        this.updateSlotPricing(i);
      }
    } else {
      groundedSheetsVariants = enhanceVariantsWithPrices(
        groundedSheetsVariantsOriginal,
        null
      );
    }
  }

  checkAllSelectionsComplete() {
    let completeCount = 0;
    let totalSlots = this.currentTier;

    for (let i = 1; i <= totalSlots; i++) {
      const slotVariants = this.selectedVariants.get(i);
      const hasColor =
        slotVariants?.color && slotVariants.color !== 'select-color';
      const hasSize = slotVariants?.size && slotVariants.size !== 'select-size';

      if (hasColor && hasSize) {
        completeCount++;
      }
    }

    return completeCount === totalSlots;
  }

  updateCTAButtons() {
    const allComplete = this.checkAllSelectionsComplete();
    const pendingCTA = document.querySelector('[data-cta="selection-pending"]');
    const completeCTA = document.querySelector(
      '[data-cta="selection-complete"]'
    );

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
      const slotElement = document.querySelector(
        `[next-tier-slot="${incompleteSlot}"]`
      );
      if (slotElement) {
        slotElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        return true;
      }
    }
    return false;
  }

  handleVerifyButtonClick() {
    const allComplete = this.checkAllSelectionsComplete();

    if (allComplete) {
      this.updateCTAButtons();
      return true;
    } else {
      this.scrollToIncompleteSlot();
      return false;
    }
  }

  updateDropdownsForTierChange(newTier, previousTier) {
    if (newTier === previousTier) return;

    const slots = document.querySelectorAll('[next-tier-slot]');

    slots.forEach(slot => {
      const slotNumber = parseInt(slot.getAttribute('next-tier-slot'));

      if (slotNumber <= newTier) {
        const colorDropdown = slot.querySelector(
          'os-dropdown[next-variant-option="color"]'
        );
        const sizeDropdown = slot.querySelector(
          'os-dropdown[next-variant-option="size"]'
        );

        const currentColorValue = colorDropdown?.value;
        const currentSizeValue = sizeDropdown?.value;

        this.populateSlotDropdowns(slot, slotNumber);

        if (currentColorValue && currentColorValue !== 'select-color') {
          colorDropdown.value = currentColorValue;
          const variantType = 'color';
          if (!this.selectedVariants.has(slotNumber)) {
            this.selectedVariants.set(slotNumber, {});
          }
          this.selectedVariants.get(slotNumber)[variantType] =
            currentColorValue;
        }

        if (currentSizeValue && currentSizeValue !== 'select-size') {
          sizeDropdown.value = currentSizeValue;
          const variantType = 'size';
          if (!this.selectedVariants.has(slotNumber)) {
            this.selectedVariants.set(slotNumber, {});
          }
          this.selectedVariants.get(slotNumber)[variantType] = currentSizeValue;
        }
      }
    });
  }

  clearCartOnPageLoad() {
    // Set a flag to track if we've already cleared
    if (this.cartCleared) {
      return;
    }

    if (typeof window.next !== 'undefined' && window.next.clearCart) {
      window.next.clearCart();
      this.slotCartMapping.clear();
      this.selectedVariants.clear();
      this.cartCleared = true;
    } else {
      // Don't use next:initialized event as it fires too late
      // Instead, we'll clear the cart when SDK is ready in initializeWithSDK
      this.pendingCartClear = true;
    }
  }

  setupCampaignCartListeners() {
    const setupListeners = () => {
      if (typeof window.next !== 'undefined' && window.next.on) {
        window.next.on('cart:updated', cartState => {});
        window.next.on('cart:item-added', item => {});
        window.next.on('cart:cleared', () => {});
        window.next.on('checkout:started', () => {});
      }
    };

    window.addEventListener('next:initialized', () => {
      setupListeners();
    });

    if (typeof window.next !== 'undefined' && window.next.on) {
      setupListeners();
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

  updateColorSwatch(dropdown, colorValue) {
    const toggle = dropdown.querySelector('button');
    const swatch = toggle?.querySelector('.os-card__variant-swatch');

    if (swatch && colorValue) {
      swatch.className = 'os-card__variant-swatch';
      swatch.classList.add(`swatch-${colorValue}`);

      if (this.colorStyles[colorValue]) {
        swatch.style.backgroundColor = this.colorStyles[colorValue];
      }
    }
  }

  bindDropdownEvents() {
    document.addEventListener('variantSelected', e => {
      this.handleVariantSelection(e.detail);
    });

    document.addEventListener('change', e => {
      if (e.target.matches('os-dropdown')) {
        this.handleDropdownChange(e.target);
      }
    });
  }

  populateAllDropdowns() {
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
    const currentQuantity = this.currentTier;
    const availableVariants = helpers.getByQuantity(currentQuantity);

    const colorDropdown = slot.querySelector(
      'os-dropdown[next-variant-option="color"]'
    );
    if (colorDropdown) {
      this.populateColorDropdown(colorDropdown, availableVariants);
      if (colorDropdown.value && colorDropdown.value !== 'select-color') {
        colorDropdown.updateToggleContent();
      }
    }

    const sizeDropdown = slot.querySelector(
      'os-dropdown[next-variant-option="size"]'
    );
    if (sizeDropdown) {
      this.populateSizeDropdown(sizeDropdown, availableVariants);
      if (sizeDropdown.value && sizeDropdown.value !== 'select-size') {
        sizeDropdown.updateToggleContent();
      }
    }
  }

  populateColorDropdown(dropdown, availableVariants) {
    const menu = dropdown.querySelector('os-dropdown-menu');
    if (!menu) return;

    const availableColors = [...new Set(availableVariants.map(v => v.color))];

    const existingItems = menu.querySelectorAll('os-dropdown-item');
    existingItems.forEach(item => {
      const value = item.getAttribute('value');
      if (
        value &&
        !value.includes('select') &&
        !availableColors.some(
          color => color.toLowerCase().replace(/\s+/g, '-') === value
        )
      ) {
        item.remove();
      }
    });

    availableColors.forEach(color => {
      const colorValue = color.toLowerCase().replace(/\s+/g, '-');

      const existingItem = menu.querySelector(
        `os-dropdown-item[value="${colorValue}"]`
      );
      if (!existingItem) {
        this.createColorDropdownItem(menu, color, colorValue);
      }
    });
  }

  updateExistingColorItems() {
    const colorDropdowns = document.querySelectorAll(
      'os-dropdown[next-variant-option="color"]'
    );

    colorDropdowns.forEach(dropdown => {
      const menu = dropdown.querySelector('os-dropdown-menu');
      if (!menu) return;

      const colorItems = menu.querySelectorAll('os-dropdown-item');
      colorItems.forEach(item => {
        const value = item.getAttribute('value');
        const toggleOption = item.querySelector('.os-card__toggle-option');

        if (value && this.colorStyles[value] && toggleOption) {
          const existingSwatch = toggleOption.querySelector(
            '.os-card__variant-swatch'
          );
          if (!existingSwatch) {
            const colorName = toggleOption.querySelector(
              '.os-card__variant-toggle-name'
            )?.textContent;
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

    const availableSizes = [...new Set(availableVariants.map(v => v.size))];

    const sizesWithPrices = availableSizes
      .map(size => {
        const variantWithPrice = availableVariants.find(v => v.size === size);
        return {
          size,
          salePrice: variantWithPrice?.salePrice || 0,
          variant: variantWithPrice,
        };
      })
      .sort((a, b) => a.salePrice - b.salePrice);

    const existingItems = menu.querySelectorAll('os-dropdown-item');
    existingItems.forEach(item => {
      item.classList.remove('os-card__variant-dropdown-item');

      const value = item.getAttribute('value');
      if (
        value &&
        !value.includes('select') &&
        !availableSizes.some(
          size => size.toLowerCase().replace(/\s+/g, '-') === value
        )
      ) {
        item.remove();
      }
    });

    sizesWithPrices.forEach(({ size, variant }) => {
      const sizeValue = size.toLowerCase().replace(/\s+/g, '-');

      const existingItem = menu.querySelector(
        `os-dropdown-item[value="${sizeValue}"]`
      );
      if (!existingItem) {
        this.createSizeDropdownItem(menu, size, sizeValue, variant);
      } else {
        const hasContent = existingItem.querySelector(
          '.os-card__toggle-option'
        );
        if (!hasContent) {
          existingItem.innerHTML = `
            <div class="os-card__toggle-option os--distribute">
              <div class="os-card__variant-toggle-info">
                <div class="os-card__variant-toggle-name">${size}</div>
              </div>
            </div>
          `;
        } else {
          const hasCorrectStructure = existingItem.querySelector(
            '.os-card__variant-toggle-name'
          );
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

    item.innerHTML = `
      <div class="os-card__toggle-option os--distribute">
        <div class="os-card__variant-toggle-info">
          <div class="os-card__variant-toggle-name">${sizeName}</div>
        </div>
      </div>
    `;

    menu.appendChild(item);
  }

  selectTier(tierNumber) {
    const previousTier = this.currentTier;

    if (tierNumber === previousTier) {
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

    this.clearAllCartItems();

    if (tierNumber < previousTier) {
      for (let i = tierNumber + 1; i <= previousTier; i++) {
        this.selectedVariants.delete(i);
        this.slotCartMapping.delete(i);
      }
    }

    this.updateDropdownsForTierChange(tierNumber, previousTier);

    this.reprocessAllSelections();

    this.initializeSlotImages();

    for (let i = 1; i <= tierNumber; i++) {
      this.updateSlotPricing(i);
    }

    this.updateCTAButtons();
    this.dispatchTierChangeEvent(tierNumber);
  }

  clearAllCartItems() {
    if (typeof window.next !== 'undefined' && window.next.clearCart) {
      try {
        window.next.clearCart();
        this.slotCartMapping.clear();
      } catch (error) {}
    }
  }

  reprocessAllSelections() {
    setTimeout(() => {
      const variantSlotCount = new Map();

      for (let i = 1; i <= this.currentTier; i++) {
        const slotVariants = this.selectedVariants.get(i);
        if (slotVariants && slotVariants.color && slotVariants.size) {
          const colorName = this.valueToVariantMap[slotVariants.color];
          const sizeName = this.valueToVariantMap[slotVariants.size];

          const matchingVariant = groundedSheetsVariants.find(
            v =>
              v.color === colorName &&
              v.size === sizeName &&
              v.quantity === this.currentTier
          );

          if (matchingVariant) {
            const currentCount = variantSlotCount.get(matchingVariant.id) || 0;
            variantSlotCount.set(matchingVariant.id, currentCount + 1);

            this.slotCartMapping.set(i, matchingVariant.id);
          }
        }
      }

      variantSlotCount.forEach((slotCount, variantId) => {
        const variant = groundedSheetsVariants.find(v => v.id === variantId);
        if (variant) {
          const cartHasVariant =
            window.next.hasItem && window.next.hasItem(variantId);

          if (!cartHasVariant) {
            const cartItem = {
              packageId: variant.id,
              quantity: slotCount,
            };

            window.next.addItem(cartItem);
          }
        }
      });
    }, 200);
  }

  clearCampaignCart() {
    if (typeof window.next !== 'undefined' && window.next.clearCart) {
      try {
        window.next.clearCart();
      } catch (error) {}
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

  initializeSlotImages() {
    const slots = document.querySelectorAll('[next-tier-slot]');

    slots.forEach(slot => {
      const slotNumber = parseInt(slot.getAttribute('next-tier-slot'));
      if (slotNumber <= this.currentTier) {
        const colorDropdown = slot.querySelector(
          'os-dropdown[next-variant-option="color"]'
        );
        if (colorDropdown) {
          const currentColor = colorDropdown.getAttribute('value');
          if (currentColor && this.colorImages[currentColor]) {
            this.updateSlotImage(slot, currentColor);
          }
        }
      }
    });
  }

  updateSlotImage(slot, colorValue) {
    const imageElement = slot.querySelector('[next-tier-slot-element="image"]');
    if (imageElement && this.colorImages[colorValue]) {
      imageElement.style.transition = 'opacity 0.3s ease-in-out';
      imageElement.style.opacity = '0.5';

      imageElement.src = this.colorImages[colorValue];

      imageElement.onload = () => {
        imageElement.style.opacity = '1';
      };

      setTimeout(() => {
        imageElement.style.opacity = '1';
      }, 300);
    }
  }

  updateSlotPricing(slotNumber) {
    const slot = document.querySelector(`[next-tier-slot="${slotNumber}"]`);
    if (!slot) return;

    const slotVariants = this.selectedVariants.get(slotNumber);

    if (!slotVariants || !slotVariants.color || !slotVariants.size) {
      this.resetSlotPricing(slot);
      return;
    }

    const colorName = this.valueToVariantMap[slotVariants.color];
    const sizeName = this.valueToVariantMap[slotVariants.size];

    const matchingVariant = groundedSheetsVariants.find(
      v =>
        v.color === colorName &&
        v.size === sizeName &&
        v.quantity === this.currentTier
    );

    if (
      matchingVariant &&
      matchingVariant.regularPrice &&
      matchingVariant.salePrice
    ) {
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
        const savingPct = Math.round(
          ((matchingVariant.regularPrice - matchingVariant.salePrice) /
            matchingVariant.regularPrice) *
            100
        );
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

    if (slotVariants[variantType] === value) return;

    const oldSelection = { ...slotVariants };

    if (!slotVariants.color && variantType === 'size') {
      const colorDropdown = slot.querySelector(
        'os-dropdown[next-variant-option="color"]'
      );
      if (colorDropdown) {
        const colorValue =
          colorDropdown.value || colorDropdown.getAttribute('value');
        if (colorValue && colorValue !== 'select-color' && colorValue !== '') {
          slotVariants.color = colorValue;
        }
      }
    } else if (!slotVariants.size && variantType === 'color') {
      const sizeDropdown = slot.querySelector(
        'os-dropdown[next-variant-option="size"]'
      );
      if (sizeDropdown) {
        const sizeValue =
          sizeDropdown.value || sizeDropdown.getAttribute('value');
        if (sizeValue && sizeValue !== 'select-size' && sizeValue !== '') {
          slotVariants.size = sizeValue;
        }
      }
    }

    slotVariants[variantType] = value;

    if (variantType === 'color') {
      this.updateColorSwatch(component, value);
      this.updateSlotImage(slot, value);
    }

    this.updateSlotPricing(slotNumber);

    this.updateAvailableOptions(slotNumber, variantType);

    const hadCompleteSelection = oldSelection.color && oldSelection.size;
    const hasCompleteSelection = slotVariants.color && slotVariants.size;

    if (hadCompleteSelection || hasCompleteSelection) {
      setTimeout(() => {
        this.recalculateEntireCart();
      }, 50);
    }

    this.checkCompleteSelection(slotNumber);
  }

  handleDropdownChange(dropdown) {
    const value = dropdown.value;
    const variantType = dropdown.getAttribute('next-variant-option');

    if (!variantType) return;

    const slot = dropdown.closest('[next-tier-slot]');
    if (!slot) return;

    const slotNumber = parseInt(slot.getAttribute('next-tier-slot'));

    if (variantType === 'color') {
      this.updateColorSwatch(dropdown, value);
      this.updateSlotImage(slot, value);
    }

    this.updateDependentDropdowns(slotNumber, variantType);
  }

  updateAvailableOptions(slotNumber, changedVariantType) {
    const slot = document.querySelector(`[next-tier-slot="${slotNumber}"]`);
    if (!slot) return;

    const slotVariants = this.selectedVariants.get(slotNumber) || {};
    const currentQuantity = this.currentTier;

    let availableVariants = helpers.getByQuantity(currentQuantity);

    if (changedVariantType === 'color') {
      if (slotVariants.color) {
        const colorName = this.valueToVariantMap[slotVariants.color];
        if (colorName) {
          const filteredVariants = availableVariants.filter(
            v => v.color === colorName
          );
          this.updateSizeDropdown(slot, filteredVariants);
        }
      }
      const colorDropdown = slot.querySelector(
        'os-dropdown[next-variant-option="color"]'
      );
      if (colorDropdown) {
        this.updateColorSwatch(colorDropdown, slotVariants.color);
      }
    }

    if (changedVariantType === 'size') {
      if (slotVariants.size) {
        const sizeName = this.valueToVariantMap[slotVariants.size];
        if (sizeName) {
          const filteredVariants = availableVariants.filter(
            v => v.size === sizeName
          );
          this.updateColorDropdown(slot, filteredVariants);
        }
      }
    }
  }

  updateSizeDropdown(slot, availableVariants) {
    const sizeDropdown = slot.querySelector(
      'os-dropdown[next-variant-option="size"]'
    );
    if (!sizeDropdown) return;

    const availableSizes = [...new Set(availableVariants.map(v => v.size))];
    const sizeItems = sizeDropdown.querySelectorAll('os-dropdown-item');

    sizeItems.forEach(item => {
      const sizeName = item
        .querySelector('.os-card__variant-toggle-name')
        ?.textContent?.trim();
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
    const colorDropdown = slot.querySelector(
      'os-dropdown[next-variant-option="color"]'
    );
    if (!colorDropdown) return;

    const availableColors = [...new Set(availableVariants.map(v => v.color))];
    const colorItems = colorDropdown.querySelectorAll('os-dropdown-item');

    colorItems.forEach(item => {
      const colorName = item
        .querySelector('.os-card__variant-toggle-name')
        ?.textContent?.trim();
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

    if (!slotVariants) {
      if (shouldDispatchEvent) {
        setTimeout(() => this.updateCTAButtons(), 100);
      }
      return false;
    }

    const hasColor =
      slotVariants.color && slotVariants.color !== 'select-color';
    const hasSize = slotVariants.size && slotVariants.size !== 'select-size';

    if (hasColor && hasSize) {
      const colorName = this.valueToVariantMap[slotVariants.color];
      const sizeName = this.valueToVariantMap[slotVariants.size];

      const matchingVariant = groundedSheetsVariants.find(
        v =>
          v.color === colorName &&
          v.size === sizeName &&
          v.quantity === this.currentTier
      );

      if (matchingVariant) {
        if (shouldDispatchEvent) {
          this.updateCampaignCart(slotNumber, matchingVariant);

          this.dispatchVariantCompleteEvent(slotNumber, matchingVariant);

          setTimeout(() => this.updateCTAButtons(), 200);
        }
        return true;
      }
    }

    if (shouldDispatchEvent) {
      setTimeout(() => this.updateCTAButtons(), 100);
    }

    return false;
  }

  resetVariantSelections() {
    this.selectedVariants.clear();

    const dropdowns = document.querySelectorAll(
      'os-dropdown[next-variant-option]'
    );
    dropdowns.forEach(dropdown => {
      const defaultValue =
        dropdown.getAttribute('next-variant-option') === 'color'
          ? 'obsidian-grey'
          : 'select-size';
      dropdown.value = defaultValue;

      if (dropdown.getAttribute('next-variant-option') === 'color') {
        const slot = dropdown.closest('[next-tier-slot]');
        if (slot) {
          this.updateSlotImage(slot, 'obsidian-grey');
        }
      }
    });
  }

  preloadImages() {
    Object.values(this.colorImages).forEach(imageUrl => {
      const img = new Image();
      img.src = imageUrl;
    });
  }

  initializeColorSwatches() {
    const colorDropdowns = document.querySelectorAll(
      'os-dropdown[next-variant-option="color"]'
    );

    colorDropdowns.forEach(dropdown => {
      const currentValue = dropdown.getAttribute('value');
      if (currentValue && currentValue !== 'select-color') {
        this.updateColorSwatch(dropdown, currentValue);
      }
    });
  }

  initializeDefaultState() {
    const defaultSelectedCard = document.querySelector(
      '.os-card.next-selected'
    );
    if (defaultSelectedCard) {
      const tier = parseInt(defaultSelectedCard.getAttribute('data-next-tier'));
      if (tier) {
        this.currentTier = tier;
        this.updateSlotStates(tier);
      }
    }

    // Don't initialize preselected values here - wait for SDK to be ready
    // this.initializePreselectedValues();
  }

  initializePreselectedValues() {
    // No need for setTimeout since we're already waiting for SDK
    console.log('[Debug] Checking for preselected values (SDK is ready)...');
    const slots = document.querySelectorAll('[next-tier-slot]');

    slots.forEach(slot => {
      const slotNumber = parseInt(slot.getAttribute('next-tier-slot'));

      if (slotNumber <= this.currentTier) {
        const colorDropdown = slot.querySelector(
          'os-dropdown[next-variant-option="color"]'
        );
        const sizeDropdown = slot.querySelector(
          'os-dropdown[next-variant-option="size"]'
        );

        console.log(
          `[Debug] Slot ${slotNumber} - Color dropdown:`,
          colorDropdown
        );
        console.log(
          `[Debug] Slot ${slotNumber} - Size dropdown:`,
          sizeDropdown
        );

        let hasPreselection = false;

        if (colorDropdown) {
          // Check multiple ways to get the value
          const colorValue =
            colorDropdown.value ||
            colorDropdown.getAttribute('value') ||
            colorDropdown.getAttribute('data-value') ||
            colorDropdown._value;

          console.log(`[Debug] Slot ${slotNumber} color value:`, colorValue);

          if (
            colorValue &&
            colorValue !== 'select-color' &&
            colorValue !== ''
          ) {
            if (!this.selectedVariants.has(slotNumber)) {
              this.selectedVariants.set(slotNumber, {});
            }
            this.selectedVariants.get(slotNumber).color = colorValue;
            hasPreselection = true;
            console.log(
              `[Debug] Set color for slot ${slotNumber}:`,
              colorValue
            );
          }
        }

        if (sizeDropdown) {
          const sizeValue =
            sizeDropdown.value ||
            sizeDropdown.getAttribute('value') ||
            sizeDropdown.getAttribute('data-value') ||
            sizeDropdown._value;

          console.log(`[Debug] Slot ${slotNumber} size value:`, sizeValue);

          if (sizeValue && sizeValue !== 'select-size' && sizeValue !== '') {
            if (!this.selectedVariants.has(slotNumber)) {
              this.selectedVariants.set(slotNumber, {});
            }
            this.selectedVariants.get(slotNumber).size = sizeValue;
            hasPreselection = true;
            console.log(`[Debug] Set size for slot ${slotNumber}:`, sizeValue);
          }
        }

        if (hasPreselection) {
          console.log(
            `[Debug] Slot ${slotNumber} has preselection, checking completion`
          );
          // Immediately check selection since SDK is ready
          this.checkCompleteSelection(slotNumber, true);
          this.updateSlotPricing(slotNumber);
        }
      }
    });
  }

  dispatchTierChangeEvent(tierNumber) {
    const event = new CustomEvent('tierChange', {
      detail: {
        tier: tierNumber,
        previousTier: this.currentTier,
        controller: this,
      },
      bubbles: true,
    });

    document.dispatchEvent(event);
  }

  dispatchVariantCompleteEvent(slotNumber, variant) {
    const event = new CustomEvent('variantComplete', {
      detail: {
        slot: slotNumber,
        variant: variant,
        tier: this.currentTier,
        controller: this,
      },
      bubbles: true,
    });

    document.dispatchEvent(event);
  }

  updateCampaignCart(slotNumber, variant) {
    console.log('[Debug] updateCampaignCart called:', {
      slotNumber,
      variant: variant.id,
    });

    if (typeof window.next === 'undefined' || !window.next.addItem) {
      console.error('[Debug] SDK not ready yet, queuing cart update for later');
      // Queue this update to be retried when SDK is ready
      if (!this.pendingCartUpdates) {
        this.pendingCartUpdates = [];
      }
      this.pendingCartUpdates.push({ slotNumber, variant });
      return;
    }

    try {
      const previousVariantId = this.slotCartMapping.get(slotNumber);
      console.log('[Debug] Previous variant for slot:', previousVariantId);

      if (previousVariantId && previousVariantId !== variant.id) {
        console.log('[Debug] Variant changed, recalculating entire cart');
        this.recalculateEntireCart(slotNumber, variant);
        return;
      }

      if (previousVariantId === variant.id) {
        console.log('[Debug] Same variant, no change needed');
        return;
      }

      this.slotCartMapping.set(slotNumber, variant.id);

      const cartItem = {
        packageId: variant.id,
        quantity: 1,
      };

      console.log('[Debug] Adding item to cart:', cartItem);
      const result = window.next.addItem(cartItem);
      console.log('[Debug] Add item result:', result);
    } catch (error) {
      console.error('[Debug] Error in updateCampaignCart:', error);
    }
  }

  recalculateEntireCart(changedSlotNumber = null, newVariant = null) {
    if (typeof window.next !== 'undefined' && window.next.clearCart) {
      window.next.clearCart();
    }

    if (changedSlotNumber && newVariant) {
      this.slotCartMapping.set(changedSlotNumber, newVariant.id);
    }

    const variantSlotCount = new Map();

    for (let i = 1; i <= this.currentTier; i++) {
      const slotVariants = this.selectedVariants.get(i);
      if (slotVariants && slotVariants.color && slotVariants.size) {
        const colorName = this.valueToVariantMap[slotVariants.color];
        const sizeName = this.valueToVariantMap[slotVariants.size];

        const matchingVariant = groundedSheetsVariants.find(
          v =>
            v.color === colorName &&
            v.size === sizeName &&
            v.quantity === this.currentTier
        );

        if (matchingVariant) {
          this.slotCartMapping.set(i, matchingVariant.id);

          const currentCount = variantSlotCount.get(matchingVariant.id) || 0;
          variantSlotCount.set(matchingVariant.id, currentCount + 1);
        }
      }
    }

    variantSlotCount.forEach((slotCount, variantId) => {
      const variant = groundedSheetsVariants.find(v => v.id === variantId);
      if (variant) {
        const cartItem = {
          packageId: variantId,
          quantity: slotCount,
        };

        window.next.addItem(cartItem);
      }
    });

    setTimeout(() => {
      this.updateCTAButtons();
    }, 300);
  }

  checkAllSlotsComplete() {
    let completeCount = 0;
    for (let i = 1; i <= this.currentTier; i++) {
      if (this.checkCompleteSelection(i, false)) {
        completeCount++;
      }
    }

    const allComplete = completeCount === this.currentTier;

    if (allComplete) {
      const event = new CustomEvent('grounded:selection-complete', {
        detail: {
          tier: this.currentTier,
          selections: this.getCompleteSelections(),
        },
        bubbles: true,
      });
      document.dispatchEvent(event);
    }

    return allComplete;
  }

  getCurrentTier() {
    return this.currentTier;
  }

  getSelectedVariants() {
    return this.selectedVariants;
  }

  getCompleteSelections() {
    const complete = [];
    for (let i = 1; i <= this.currentTier; i++) {
      if (this.checkCompleteSelection(i, false)) {
        const slotVariants = this.selectedVariants.get(i);

        const colorName = this.valueToVariantMap[slotVariants.color];
        const sizeName = this.valueToVariantMap[slotVariants.size];

        const variant = groundedSheetsVariants.find(
          v =>
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

customElements.define('os-dropdown', OSDropdown);
customElements.define('os-dropdown-menu', OSDropdownMenu);
customElements.define('os-dropdown-item', OSDropdownItem);

let priceCheckAttempts = 0;
const maxAttempts = 10;

const checkForCampaignPrices = () => {
  priceCheckAttempts++;
  const campaignPrices = getPricesFromCampaign();

  if (campaignPrices) {
    groundedSheetsVariants = enhanceVariantsWithPrices(
      groundedSheetsVariantsOriginal,
      campaignPrices
    );

    window.tierController = new TierController();
    window.tierController.preloadImages();

    setupEventListeners();
  } else if (priceCheckAttempts < maxAttempts) {
    setTimeout(checkForCampaignPrices, 500);
  } else {
    groundedSheetsVariants = enhanceVariantsWithPrices(
      groundedSheetsVariantsOriginal,
      null
    );

    window.tierController = new TierController();
    window.tierController.preloadImages();

    setupEventListeners();
  }
};

const setupEventListeners = () => {
  document.addEventListener('tierChange', e => {});

  document.addEventListener('variantComplete', e => {});

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
};

checkForCampaignPrices();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TierController,
    OSDropdown,
    OSDropdownMenu,
    OSDropdownItem,
    groundedSheetsVariants,
    helpers,
  };
}

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
      const firstSectionTop =
        scrollTop + firstSection.getBoundingClientRect().top;

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

window.progressBarController = new ProgressBarController();

// EXIT INTENT POPUP

// Wait for SDK to be fully initialized
window.addEventListener('next:initialized', function () {
  console.log('SDK initialized, setting up exit intent...');

  // Exit intent setup with profile switching
  next.exitIntent({
    image:
      'https://cdn.prod.website-files.com/6894e401ee6c8582aece90a0/68bed75cd9973567c4ab6a25_modal-bare-earth.png',
    action: async () => {
      // Apply the exit_10 profile for 10% discount on ALL items (all tiers)
      await next.setProfile('exit_10');
      console.log('Exit 10% discount profile applied - all tiers updated');
    },
  });

  // Optional: Listen to events for analytics
  next.on('exit-intent:shown', data => {
    console.log('Exit intent popup shown:', data.imageUrl);
  });

  next.on('exit-intent:clicked', data => {
    console.log('Exit intent popup clicked:', data.imageUrl);
  });

  next.on('exit-intent:dismissed', data => {
    console.log('Exit intent popup dismissed:', data.imageUrl);
  });

  // Listen for profile change events
  next.on('profile:applied', data => {
    console.log(
      `Profile ${data.profileId} applied, ${data.itemsSwapped} items updated`
    );
  });
});
