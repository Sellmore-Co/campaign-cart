/**
 * PaymentSelector - Handles payment method selection and form toggling
 */

export class PaymentSelector {
  #logger;
  #container;
  #radioInputs;
  #forms;
  #activeTransitions = new Map();
  #currentMode = null;

  constructor(logger) {
    this.#logger = logger;
    this.#container = document.querySelector('[os-payment-mode]');
    this.#radioInputs = document.querySelectorAll('input[name="combo_mode"]');
    this.#forms = document.querySelectorAll('[os-checkout-element$="-form"]');

    if (this.#container && this.#radioInputs.length > 0) {
      this.#logger.debug('PaymentSelector initialized with elements found');
      this.#init();
    } else {
      this.#logger.warn('PaymentSelector elements not found');
    }
  }

  #init() {
    const checkedRadio = document.querySelector('input[name="combo_mode"]:checked');
    if (checkedRadio && this.#container) {
      this.#setPaymentMode(checkedRadio.value, false);
    }

    this.#radioInputs.forEach(radio => 
      radio.addEventListener('change', e => this.#setPaymentMode(e.target.value, true))
    );

    this.#logger.debug('PaymentSelector event listeners attached');
  }

  #setPaymentMode(mode, animate = true) {
    this.#logger.debug(`Setting payment mode to: ${mode}, animate: ${animate}`);
    
    this.#container?.setAttribute('os-payment-mode', mode);
    this.#currentMode = mode;

    // Clear os--active from all headers first and add to the selected one
    const creditHeader = this.#container?.querySelector('.cc-header');
    const paypalHeader = this.#container?.querySelector('.paypal-header');
    
    creditHeader?.classList.remove('os--active');
    paypalHeader?.classList.remove('os--active');

    if (mode === 'credit' && creditHeader) {
        creditHeader.classList.add('os--active');
        this.#logger.debug('Added os--active to .cc-header');
    } else if (mode === 'paypal' && paypalHeader) {
        paypalHeader.classList.add('os--active');
        this.#logger.debug('Added os--active to .paypal-header');
    }

    this.#forms.forEach(form => {
      form.style.transition = 'none';
      form.offsetHeight; // Force reflow
      form.style.transition = '';
    });

    this.#forms.forEach(form => {
      const formType = form.getAttribute('os-checkout-element');
      const isSelected = formType === `${mode}-form`;

      if (this.#activeTransitions.has(form)) {
        const oldHandler = this.#activeTransitions.get(form);
        form.removeEventListener('transitionend', oldHandler);
        this.#activeTransitions.delete(form);
      }

      if (animate) {
        form.style.display = 'block';
        form.style.overflow = 'hidden';
        const currentHeight = form.scrollHeight;
        form.style.height = `${currentHeight}px`;
        form.offsetHeight; // Force reflow

        const transitionEndHandler = e => {
          if (e.propertyName === 'height') {
            if (isSelected) {
              form.style.height = 'auto';
              form.style.overflow = '';
            } else {
              form.style.display = 'none';
            }
            this.#activeTransitions.delete(form);
          }
        };

        this.#activeTransitions.set(form, transitionEndHandler);
        form.addEventListener('transitionend', transitionEndHandler, { once: true });

        requestAnimationFrame(() => {
          form.style.height = isSelected ? `${form.scrollHeight}px` : '0';
          form.style.opacity = isSelected ? '1' : '0';
        });
      } else {
        form.style.transition = 'none';
        Object.assign(form.style, {
          display: isSelected ? 'block' : 'none',
          height: isSelected ? 'auto' : '0',
          opacity: isSelected ? '1' : '0',
          overflow: ''
        });
        form.offsetHeight; // Force reflow
        form.style.transition = '';
      }
    });

    document.dispatchEvent(new CustomEvent('payment-method-changed', { detail: { mode } }));
  }
}