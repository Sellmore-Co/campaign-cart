import { useCheckoutStore } from '@/stores/checkoutStore';
import { useCartStore } from '@/stores/cartStore';
import type { Logger } from '@/utils/logger';

export class CheckoutFormHandler {
  private form: HTMLFormElement;
  private fields: Map<string, HTMLElement>;
  private paymentButtons: Map<string, HTMLElement>;
  private logger: Logger;
  
  // Event handlers
  private submitHandler?: (event: Event) => void;
  private changeHandler?: (event: Event) => void;
  private paymentMethodChangeHandler?: (event: Event) => void;
  private shippingMethodChangeHandler?: (event: Event) => void;
  private billingAddressToggleHandler?: (event: Event) => void;

  constructor(
    form: HTMLFormElement,
    fields: Map<string, HTMLElement>,
    paymentButtons: Map<string, HTMLElement>,
    logger: Logger
  ) {
    this.form = form;
    this.fields = fields;
    this.paymentButtons = paymentButtons;
    this.logger = logger;
  }

  public setupEventHandlers(
    onSubmit: (event: Event) => Promise<void>,
    onChange: (event: Event) => Promise<void>,
    onPaymentMethodChange: (event: Event) => void,
    onShippingMethodChange: (event: Event) => void,
    onBillingAddressToggle: (event: Event) => void,
    onExpressCheckout: (method: string) => Promise<void>
  ): void {
    // Form submission handler
    this.submitHandler = onSubmit;
    this.form.addEventListener('submit', this.submitHandler);
    
    // Field change handler (NO real-time validation - only change/blur)
    this.changeHandler = onChange;
    this.fields.forEach((field) => {
      if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) {
        field.addEventListener('change', this.changeHandler!);
        field.addEventListener('blur', this.changeHandler!);
      }
    });
    
    // Payment method change handler
    this.paymentMethodChangeHandler = onPaymentMethodChange;
    const paymentRadios = this.form.querySelectorAll('input[name="payment_method"]');
    paymentRadios.forEach(radio => {
      radio.addEventListener('change', this.paymentMethodChangeHandler!);
    });
    
    // Shipping method change handler
    this.shippingMethodChangeHandler = onShippingMethodChange;
    const shippingRadios = this.form.querySelectorAll('input[name="shipping_method"]');
    shippingRadios.forEach(radio => {
      radio.addEventListener('change', this.shippingMethodChangeHandler!);
    });
    
    // Billing address toggle handler
    this.billingAddressToggleHandler = onBillingAddressToggle;
    const billingToggle = this.form.querySelector('input[name="use_shipping_address"]');
    if (billingToggle) {
      billingToggle.addEventListener('change', this.billingAddressToggleHandler);
    }
    
    // Payment button handlers
    this.paymentButtons.forEach((button, method) => {
      if (method !== 'combo') { // combo is the main submit button
        button.addEventListener('click', (event) => {
          event.preventDefault();
          onExpressCheckout(method);
        });
      }
    });
  }

  public async handleFieldChange(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    const fieldName = this.getFieldNameFromElement(target);
    
    if (!fieldName) return;
    
    const checkoutStore = useCheckoutStore.getState();
    
    // Update form data in store
    checkoutStore.updateFormData({
      [fieldName]: target.value
    });
    
    // Clear any existing errors for this field
    checkoutStore.clearError(fieldName);
    
    this.logger.debug(`Field updated: ${fieldName} = ${target.value}`);
  }

  public handlePaymentMethodChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const checkoutStore = useCheckoutStore.getState();
    
    const paymentMethodMap: Record<string, 'card_token' | 'paypal' | 'apple_pay' | 'google_pay' | 'credit-card'> = {
      'credit': 'credit-card',
      'paypal': 'paypal',
      'apple-pay': 'apple_pay',
      'google-pay': 'google_pay'
    };
    
    const method = paymentMethodMap[target.value] || 'credit-card';
    checkoutStore.setPaymentMethod(method);
    
    // Show/hide payment forms based on selection
    this.updatePaymentFormVisibility(target.value);
    
    this.logger.debug(`Payment method changed to: ${method}`);
  }

  public handleShippingMethodChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const checkoutStore = useCheckoutStore.getState();
    
    // Parse shipping method data (you might want to store this in data attributes)
    const shippingMethods = [
      { id: 1, name: 'Standard Shipping', price: 0, code: 'standard' },
      { id: 2, name: 'Subscription Shipping', price: 5, code: 'subscription' },
      { id: 3, name: 'Expedited: Standard Overnight', price: 28, code: 'overnight' }
    ];
    
    const selectedMethod = shippingMethods.find(m => m.id === parseInt(target.value));
    if (selectedMethod) {
      checkoutStore.setShippingMethod(selectedMethod);
      
      // Update cart store with shipping method for total calculation
      const cartStore = useCartStore.getState();
      cartStore.setShippingMethod(selectedMethod.id);
    }
    
    this.logger.debug(`Shipping method changed to: ${target.value}`);
  }

  public handleBillingAddressToggle(event: Event): void {
    const target = event.target as HTMLInputElement;
    const checkoutStore = useCheckoutStore.getState();
    
    checkoutStore.setSameAsShipping(target.checked);
    
    // Show/hide billing address fields
    const billingSection = this.form.querySelector('.billing-address-section');
    if (billingSection instanceof HTMLElement) {
      billingSection.style.display = target.checked ? 'none' : 'block';
    }
    
    this.logger.debug(`Billing same as shipping: ${target.checked}`);
  }

  public handleCheckoutUpdate(state: any): void {
    // Update UI based on checkout state
    if (state.errors) {
      this.displayErrors(state.errors);
    }
    
    if (state.isProcessing) {
      this.disableForm();
    } else {
      this.enableForm();
    }
  }

  public scrollToField(fieldName: string): void {
    const fieldElement = this.fields.get(fieldName);
    if (!fieldElement) {
      this.logger.warn(`Field '${fieldName}' not found for scrolling`);
      return;
    }
    
    // Find the container to scroll to (prefer .frm-flds parent for better visual context)
    const scrollTarget = fieldElement.closest('.frm-flds') || fieldElement;
    
    // Calculate offset to account for fixed headers or other UI elements
    const offset = 100; // Adjust this value based on your page layout
    const elementRect = scrollTarget.getBoundingClientRect();
    const absoluteElementTop = elementRect.top + window.scrollY;
    const scrollPosition = absoluteElementTop - offset;
    
    // Smooth scroll to the field
    window.scrollTo({
      top: Math.max(0, scrollPosition),
      behavior: 'smooth'
    });
    
    // Focus the field after a small delay to ensure scrolling completes
    // Only focus if the field is an input/select/textarea
    if (fieldElement instanceof HTMLInputElement || 
        fieldElement instanceof HTMLSelectElement || 
        fieldElement instanceof HTMLTextAreaElement) {
      setTimeout(() => {
        try {
          fieldElement.focus();
          // Add a subtle highlight effect
          fieldElement.style.outline = '2px solid #ff6b6b';
          fieldElement.style.outlineOffset = '2px';
          
          // Remove the highlight after a short time
          setTimeout(() => {
            fieldElement.style.outline = '';
            fieldElement.style.outlineOffset = '';
          }, 2000);
        } catch (error) {
          // Focus might fail in some cases, just log it
          this.logger.debug('Could not focus field after scroll:', error);
        }
      }, 300);
    }
    
    this.logger.debug(`Scrolled to field: ${fieldName}`);
  }

  private updatePaymentFormVisibility(paymentMethod: string): void {
    const paymentForms = this.form.querySelectorAll('.payment-form, .payment-info');
    paymentForms.forEach(form => {
      if (form instanceof HTMLElement) {
        const parent = form.closest('.payment-option');
        if (parent) {
          const radio = parent.querySelector('input[type="radio"]') as HTMLInputElement;
          form.style.display = radio && radio.value === paymentMethod ? 'block' : 'none';
        }
      }
    });
  }

  private getFieldNameFromElement(element: HTMLElement): string | null {
    // Check for checkout field attributes
    const fieldName = element.getAttribute('data-next-checkout-field') || 
                     element.getAttribute('os-checkout-field');
    
    if (fieldName) return fieldName;
    
    // Fallback to name attribute
    if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement) {
      return element.name || null;
    }
    
    return null;
  }

  private displayErrors(errors: Record<string, string>): void {
    // Clear existing errors
    this.form.querySelectorAll('.next-error').forEach(error => {
      error.remove();
    });
    
    // Display new errors
    Object.entries(errors).forEach(([field, message]) => {
      const fieldElement = this.fields.get(field);
      if (fieldElement) {
        const errorElement = document.createElement('div');
        errorElement.className = 'next-error';
        errorElement.textContent = message;
        errorElement.style.color = 'red';
        errorElement.style.fontSize = '0.875rem';
        errorElement.style.marginTop = '0.25rem';
        
        // Find the .frm-flds parent container
        const frmFldsContainer = fieldElement.closest('.frm-flds');
        if (frmFldsContainer) {
          // Append error as last child of .frm-flds
          frmFldsContainer.appendChild(errorElement);
        } else {
          // Fallback to field's parent if .frm-flds not found
          fieldElement.parentElement?.appendChild(errorElement);
        }
        
        fieldElement.classList.add('next-error-field');
      }
    });
  }

  private disableForm(): void {
    this.fields.forEach(field => {
      if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement) {
        field.disabled = true;
      }
    });
    
    this.paymentButtons.forEach(button => {
      if (button instanceof HTMLButtonElement) {
        button.disabled = true;
      }
    });
  }

  private enableForm(): void {
    this.fields.forEach(field => {
      if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement) {
        field.disabled = false;
      }
    });
    
    this.paymentButtons.forEach(button => {
      if (button instanceof HTMLButtonElement) {
        button.disabled = false;
      }
    });
  }

  public cleanup(): void {
    if (this.submitHandler) {
      this.form.removeEventListener('submit', this.submitHandler);
    }
    
    if (this.changeHandler) {
      this.fields.forEach(field => {
        field.removeEventListener('change', this.changeHandler!);
        field.removeEventListener('blur', this.changeHandler!);
      });
    }
    
    if (this.paymentMethodChangeHandler) {
      const paymentRadios = this.form.querySelectorAll('input[name="payment_method"]');
      paymentRadios.forEach(radio => {
        radio.removeEventListener('change', this.paymentMethodChangeHandler!);
      });
    }
    
    if (this.shippingMethodChangeHandler) {
      const shippingRadios = this.form.querySelectorAll('input[name="shipping_method"]');
      shippingRadios.forEach(radio => {
        radio.removeEventListener('change', this.shippingMethodChangeHandler!);
      });
    }
    
    if (this.billingAddressToggleHandler) {
      const billingToggle = this.form.querySelector('input[name="use_shipping_address"]');
      if (billingToggle) {
        billingToggle.removeEventListener('change', this.billingAddressToggleHandler!);
      }
    }
    
    this.paymentButtons.forEach(button => {
      button.removeEventListener('click', () => {});
    });
  }

  public destroy(): void {
    this.cleanup();
  }
}