// Warranty Upsell System
// Adds warranty based on quantity from previous page

// Simple LoadingOverlay implementation (same as sheets)
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

class WarrantyUpsellController {
  constructor() {
    this.warrantyPackageId = 179;
    this.quantity = 0;
    this.acceptButton = null;
    this.declineButton = null;
    this.originalPriceElement = null;
    this.currentPriceElement = null;
    this.savingsElement = null;
    this.loadingOverlay = new LoadingOverlay();

    this.init();
  }

  async init() {
    await this._waitForSDK();
    this._getQuantityFromURL();
    this._cacheElements();
    this._bindEvents();
    this._updatePricing();
    this._updateButtonText();
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

  _getQuantityFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    this.quantity = parseInt(urlParams.get('quantity')) || 0;

    console.log('Warranty quantity from URL:', this.quantity);

    // If quantity is 0, they declined the previous offer
    if (this.quantity === 0) {
      console.log('User declined previous offer, no warranty to add');
    }
  }

  _cacheElements() {
    this.acceptButton = document.querySelector('[data-next-upsell-action="add"]');
    this.declineButton = document.querySelector('[data-next-upsell-action="skip"]');
    this.originalPriceElement = document.getElementById('originalPrice');
    this.currentPriceElement = document.getElementById('currentPrice');
    this.savingsElement = document.querySelector('[data-next-display="package.savingsPercentage"]');
  }

  _bindEvents() {
    // Accept button click
    if (this.acceptButton) {
      this.acceptButton.addEventListener('click', async (e) => {
        e.preventDefault();
        await this.acceptWarranty();
      });
    }

    // Decline button click (if exists)
    if (this.declineButton) {
      this.declineButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.declineWarranty();
      });
    }
  }

  _updatePricing() {
    // Skip if no quantity
    if (this.quantity === 0) {
      // Hide the offer or show a different message
      this._showNoWarrantyMessage();
      return;
    }

    // Get warranty package details
    const warrantyPackage = window.next.getPackage(this.warrantyPackageId);

    if (!warrantyPackage) {
      console.error('Warranty package not found:', this.warrantyPackageId);
      return;
    }

    // For warranty, we only show the actual price (no retail/compare price)
    const unitPrice = parseFloat(warrantyPackage.price) || 21.25;

    // Calculate total price based on quantity
    const totalPrice = unitPrice * this.quantity;

    // Update current price display only
    if (this.currentPriceElement) {
      this.currentPriceElement.textContent = `$${totalPrice.toFixed(2)}`;
    }

    // Don't update original price or savings for warranty
    // Keep them as designed in the HTML

    console.log('Warranty pricing updated:', {
      quantity: this.quantity,
      unitPrice: unitPrice,
      totalPrice: totalPrice
    });
  }

  _updateButtonText() {
    if (this.quantity === 0) {
      return;
    }

    // Update button text to show quantity
    if (this.acceptButton) {
      const buttonContent = this.acceptButton.querySelector('[data-button="content"] div');
      if (buttonContent) {
        if (this.quantity === 1) {
          buttonContent.textContent = 'Yes, Add Protection to My Order';
        } else {
          buttonContent.textContent = `Yes, Add ${this.quantity} Protection Plans to My Order`;
        }
      }
    }
  }

  _showNoWarrantyMessage() {
    // If user declined sheets, redirect to next page or show message
    const acceptUrlMeta = document.querySelector('meta[name="next-upsell-accept-url"]');
    const declineUrlMeta = document.querySelector('meta[name="next-upsell-decline-url"]');
    const nextUrl = declineUrlMeta?.getAttribute('content') || acceptUrlMeta?.getAttribute('content');

    if (nextUrl) {
      const url = new URL(nextUrl, window.location.origin);

      // Pass the quantity (0 since they declined sheets)
      url.searchParams.set('quantity', '0');

      // Preserve existing parameters
      const currentParams = new URLSearchParams(window.location.search);
      ['debug', 'debugger', 'ref_id'].forEach(param => {
        if (currentParams.has(param)) {
          url.searchParams.set(param, currentParams.get(param));
        }
      });

      const finalUrl = url.pathname + url.search;
      console.log('No items to protect, redirecting to:', finalUrl);
      window.location.href = finalUrl;
    }
  }

  async acceptWarranty() {
    // Disable button and show loading
    this.acceptButton.classList.add('is-submitting');
    this.acceptButton.disabled = true;

    // Show loading overlay
    this.loadingOverlay.show();

    try {
      // Skip if no quantity
      if (this.quantity === 0) {
        console.log('No warranty to add');
        this._redirectToNext();
        return;
      }

      // Add warranty upsell
      const upsellData = {
        packageId: this.warrantyPackageId,
        quantity: this.quantity
      };

      console.log('Adding warranty upsell:', upsellData);

      await window.next.addUpsell(upsellData);

      console.log(' Warranty added successfully');

      // Redirect to next page (keep overlay showing during redirect)
      this._redirectToNext();

    } catch (error) {
      console.error('❌ Failed to add warranty:', error);
      this.loadingOverlay.hide(); // Hide immediately on error
      alert('Failed to add protection plan. Please try again.');

      // Re-enable button
      this.acceptButton.classList.remove('is-submitting');
      this.acceptButton.disabled = false;
    }
  }

  declineWarranty() {
    console.log('Declining warranty');

    // Get redirect URL from meta tag
    const declineUrlMeta = document.querySelector('meta[name="next-upsell-decline-url"]');
    const declineUrl = declineUrlMeta?.getAttribute('content');

    if (declineUrl) {
      const url = new URL(declineUrl, window.location.origin);

      // Pass the original quantity from sheets (they declined warranty but may have accepted sheets)
      url.searchParams.set('quantity', this.quantity);

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
      console.warn('No decline URL found');
    }
  }

  _redirectToNext() {
    // Get redirect URL from meta tag
    const acceptUrlMeta = document.querySelector('meta[name="next-upsell-accept-url"]');
    const acceptUrl = acceptUrlMeta?.getAttribute('content');

    if (acceptUrl) {
      const url = new URL(acceptUrl, window.location.origin);

      // Pass the quantity (they accepted warranty)
      url.searchParams.set('quantity', this.quantity);

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
      console.log('No redirect URL found');
    }
  }
}

// Initialize when SDK is ready
window.addEventListener('next:initialized', function() {
  window.warrantyController = new WarrantyUpsellController();
});

// If SDK is already initialized
if (window.next?.addUpsell) {
  window.warrantyController = new WarrantyUpsellController();
}