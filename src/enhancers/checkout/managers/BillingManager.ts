/**
 * Billing Manager - Handles billing form cloning and toggling
 */

import { BILLING_CONTAINER_SELECTOR, SHIPPING_FORM_SELECTOR, BILLING_FORM_CONTAINER_SELECTOR } from '../constants/selectors';
import { BILLING_FIELD_MAPPING } from '../constants/field-mappings';
import type { Logger } from '@/utils/logger';
import type { CheckoutState } from '@/stores/checkoutStore';

export class BillingManager {
  constructor(
    private form: HTMLFormElement,
    private billingFields: Map<string, HTMLElement>,
    private logger: Logger
  ) {}

  public setupBillingForm(): boolean {
    // Find the billing form container
    const billingContainer = document.querySelector(BILLING_CONTAINER_SELECTOR);
    if (!billingContainer) {
      this.logger.debug('No billing container found with os-checkout-element="different-billing-address"');
      return false;
    }

    // Find the shipping form to clone
    const shippingForm = document.querySelector(SHIPPING_FORM_SELECTOR);
    if (!shippingForm) {
      this.logger.debug('No shipping form found to clone');
      return false;
    }

    // Find the billing form container within the billing address section
    const billingFormContainer = billingContainer.querySelector(BILLING_FORM_CONTAINER_SELECTOR);
    if (!billingFormContainer) {
      this.logger.debug('No billing form container found');
      return false;
    }

    // Clone the shipping form
    const billingForm = shippingForm.cloneNode(true) as HTMLElement;
    
    // Update all field attributes from shipping to billing
    this.convertShippingFieldsToBilling(billingForm);
    
    // Clear the billing form container and append the cloned form
    billingFormContainer.innerHTML = '';
    billingFormContainer.appendChild(billingForm);
    
    this.logger.debug('Billing form cloned from shipping form');
    
    // Return true to indicate successful cloning
    return true;
  }

  public convertShippingFieldsToBilling(billingForm: HTMLElement): void {
    // Update data-next-checkout-field attributes
    billingForm.querySelectorAll('[data-next-checkout-field]').forEach(field => {
      const currentValue = field.getAttribute('data-next-checkout-field');
      if (currentValue && !currentValue.startsWith('billing-')) {
        field.setAttribute('data-next-checkout-field', `billing-${currentValue}`);
      }
    });

    // Update os-checkout-field attributes
    billingForm.querySelectorAll('[os-checkout-field]').forEach(field => {
      const currentValue = field.getAttribute('os-checkout-field');
      if (currentValue && !currentValue.startsWith('billing-')) {
        field.setAttribute('os-checkout-field', `billing-${currentValue}`);
      }
    });

    // Update name attributes
    billingForm.querySelectorAll('[name], select:not([name]), input:not([name])').forEach(field => {
      const element = field as HTMLInputElement | HTMLSelectElement;
      
      // Get the field type from data-next-checkout-field or os-checkout-field
      const checkoutField = element.getAttribute('data-next-checkout-field') || 
                           element.getAttribute('os-checkout-field') || '';
      
      // Set name based on checkout field if no name exists
      if (!element.name && checkoutField) {
        // Use the checkout field name as the basis for the name attribute
        const fieldName = checkoutField.replace('billing-', '');
        element.name = `billing_${fieldName}`;
      } else if (element.name && !element.name.startsWith('billing_')) {
        // Replace shipping_ prefix with billing_ or add billing_ prefix
        if (element.name.startsWith('shipping_')) {
          element.name = element.name.replace('shipping_', 'billing_');
        } else {
          element.name = `billing_${element.name}`;
        }
      }
    });

    // Update id attributes
    billingForm.querySelectorAll('[id], select:not([id]), input:not([id])').forEach(field => {
      const element = field as HTMLElement;
      
      // Get the field type from data-next-checkout-field or os-checkout-field
      const checkoutField = element.getAttribute('data-next-checkout-field') || 
                           element.getAttribute('os-checkout-field') || '';
      
      // Set id based on checkout field if no id exists
      if (!element.id && checkoutField) {
        // Use the checkout field name as the basis for the id
        const fieldName = checkoutField.replace('billing-', '');
        element.id = `billing_${fieldName}`;
      } else if (element.id && !element.id.startsWith('billing_')) {
        // Replace shipping_ prefix with billing_ or add billing_ prefix
        if (element.id.startsWith('shipping_')) {
          element.id = element.id.replace('shipping_', 'billing_');
        } else {
          element.id = `billing_${element.id}`;
        }
      }
    });

    // Update data-name attributes
    billingForm.querySelectorAll('[data-name]').forEach(field => {
      const element = field as HTMLElement;
      const currentDataName = element.getAttribute('data-name');
      if (currentDataName && !currentDataName.includes('Billing')) {
        // Replace Shipping with Billing in data-name
        element.setAttribute('data-name', currentDataName.replace('Shipping', 'Billing'));
      }
    });



    // Update labels to indicate billing
    billingForm.querySelectorAll('label').forEach(label => {
      const labelText = label.textContent || '';
      if (labelText && !labelText.includes('Billing')) {
        // Add (Billing) prefix to labels
        const forAttr = label.getAttribute('for');
        if (forAttr && forAttr.includes('billing')) {
          // Update the for attribute to match the new billing field id
          const newForAttr = forAttr.startsWith('shipping_') 
            ? forAttr.replace('shipping_', 'billing_')
            : `billing_${forAttr}`;
          label.setAttribute('for', newForAttr);
        }
      }
    });

    // Clear all field values
    billingForm.querySelectorAll('input, select, textarea').forEach(field => {
      const element = field as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
      if (element.type === 'checkbox' || element.type === 'radio') {
        (element as HTMLInputElement).checked = false;
      } else {
        element.value = '';
      }
    });
  }

  public setInitialBillingFormState(): void {
    // Find the billing toggle checkbox
    const billingToggle = this.form.querySelector('input[name="use_shipping_address"]') as HTMLInputElement;
    const billingSection = document.querySelector(BILLING_CONTAINER_SELECTOR) as HTMLElement;
    
    if (billingToggle && billingSection) {
      // Set initial state based on checkbox
      if (billingToggle.checked) {
        // Start collapsed
        billingSection.style.height = '0';
        billingSection.style.padding = '2px';
        billingSection.style.marginTop = '0';
        billingSection.style.overflow = 'hidden';
        billingSection.classList.add('billing-form-collapsed');
      } else {
        // Start expanded
        billingSection.style.height = 'auto';
        billingSection.style.padding = '20px 2px';
        billingSection.style.marginTop = '20px';
        billingSection.style.overflow = 'visible';
        billingSection.classList.add('billing-form-expanded');
      }
    }
  }

  public handleBillingAddressToggle(
    checked: boolean,
    setSameAsShippingCallback: (same: boolean) => void,
    copyShippingToBillingCallback?: () => void
  ): void {
    setSameAsShippingCallback(checked);
    
    // Show/hide billing address fields - look for the os-checkout-element attribute
    const billingSection = document.querySelector(BILLING_CONTAINER_SELECTOR);
    if (billingSection instanceof HTMLElement) {
      if (checked) {
        // Collapse the billing form
        this.collapseBillingForm(billingSection);
      } else {
        // Expand the billing form
        this.expandBillingForm(billingSection);
        // Copy shipping values after a small delay to ensure form is visible
        if (copyShippingToBillingCallback) {
          setTimeout(() => {
            copyShippingToBillingCallback();
          }, 50);
        }
      }
    }
    
    this.logger.debug(`Billing same as shipping: ${checked}`);
  }

  public expandBillingForm(billingSection: HTMLElement): void {
    // First, temporarily set height to auto to get the full height
    billingSection.style.transition = 'none';
    billingSection.style.height = 'auto';
    const fullHeight = billingSection.offsetHeight;
    
    // Set back to 0 height without transition
    billingSection.style.height = '0';
    
    // Force a reflow to ensure the height change takes effect
    billingSection.offsetHeight;
    
    // Now enable transition and set to full height
    billingSection.style.transition = 'height 0.3s ease-in-out, padding 0.3s ease-in-out, margin-top 0.3s ease-in-out';
    billingSection.style.height = `${fullHeight}px`;
    billingSection.style.padding = '20px 2px'; // Adjust padding as needed
    billingSection.style.marginTop = '20px'; // Add some margin
    billingSection.style.overflow = 'visible';
    
    // After transition completes, set height to auto for responsive behavior
    setTimeout(() => {
      billingSection.style.height = 'auto';
    }, 300);
    
    // Add expanded class for additional styling if needed
    billingSection.classList.add('billing-form-expanded');
    billingSection.classList.remove('billing-form-collapsed');
  }

  public collapseBillingForm(billingSection: HTMLElement): void {
    // Get current height before collapsing
    const currentHeight = billingSection.offsetHeight;
    
    // Set explicit height to enable transition
    billingSection.style.height = `${currentHeight}px`;
    billingSection.style.overflow = 'hidden';
    
    // Force a reflow
    billingSection.offsetHeight;
    
    // Enable transition and collapse
    billingSection.style.transition = 'height 0.3s ease-in-out, padding 0.3s ease-in-out, margin-top 0.3s ease-in-out';
    billingSection.style.height = '0';
    billingSection.style.padding = '2px';
    billingSection.style.marginTop = '0';
    
    // Add collapsed class for additional styling if needed
    billingSection.classList.add('billing-form-collapsed');
    billingSection.classList.remove('billing-form-expanded');
  }

  public copyShippingToBilling(
    shippingData: Record<string, any>,
    setBillingAddressCallback: (address: CheckoutState['billingAddress']) => void,
    updateBillingStateOptionsCallback: (country: string) => void
  ): void {
    // First set the billing address data in the store
    const billingAddress = {
      first_name: shippingData.fname || '',
      last_name: shippingData.lname || '',
      address1: shippingData.address1 || '',
      address2: shippingData.address2,
      city: shippingData.city || '',
      province: shippingData.province || '',
      postal: shippingData.postal || '',
      country: shippingData.country || '',
      phone: shippingData.phone || ''
    };
    setBillingAddressCallback(billingAddress);
    
    // Copy values from shipping to billing fields
    Object.entries(BILLING_FIELD_MAPPING).forEach(([shippingField, billingField]) => {
      const shippingValue = shippingData[shippingField];
      const billingElement = this.billingFields.get(billingField);
      
      if (shippingValue && billingElement) {
        if (billingElement instanceof HTMLInputElement || billingElement instanceof HTMLSelectElement) {
          billingElement.value = shippingValue;
        }
      }
    });
    
    // Also trigger country change to load states for billing
    const billingCountryField = this.billingFields.get('billing-country');
    if (billingCountryField && shippingData.country) {
      setTimeout(() => {
        updateBillingStateOptionsCallback(shippingData.country);
      }, 100);
    }
    
    this.logger.debug('Copied shipping data to billing fields');
  }
}