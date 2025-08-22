/**
 * UI Service - Consolidated UI management functionality
 * 
 * Consolidates functionality from:
 * - UIManager: Error display, form state management, payment form visibility
 * - FloatingLabelManager: Shopify-style floating label animations
 * - UI state management: Loading states, progress indicators
 */

import type { Logger } from '@/utils/logger';
import type { CartState } from '@/types/global';
import { ErrorDisplayManager } from '../utils/error-display-utils';
import { EventHandlerManager } from '../utils/event-handler-utils';

export class UIService {
  private form: HTMLFormElement;
  private fields: Map<string, HTMLElement>;
  private billingFields?: Map<string, HTMLElement>;
  private logger: Logger;
  
  // Utility managers
  private errorManager: ErrorDisplayManager;
  private eventManager: EventHandlerManager;
  
  // Floating label management
  private floatingLabels: Map<HTMLElement, HTMLLabelElement> = new Map();
  private periodicCheckInterval?: number;
  
  // Loading state management
  private loadingStates: Map<string, boolean> = new Map();
  
  // Error state tracking
  private lastErrorsString: string = '';

  constructor(
    form: HTMLFormElement,
    fields: Map<string, HTMLElement>,
    logger: Logger,
    billingFields?: Map<string, HTMLElement>
  ) {
    this.form = form;
    this.fields = fields;
    this.logger = logger;
    if (billingFields) {
      this.billingFields = billingFields;
    }
    
    // Initialize utility managers
    this.errorManager = new ErrorDisplayManager();
    this.eventManager = new EventHandlerManager();
  }

  /**
   * Initialize the UI service with all functionality
   */
  public initialize(): void {
    this.initializeFloatingLabels();
    this.logger.debug('UIService initialized');
  }

  // ============================================================================
  // LOADING STATE MANAGEMENT
  // ============================================================================

  /**
   * Show loading state for a specific section
   */
  public showLoading(section: string): void {
    this.loadingStates.set(section, true);
    
    // Add loading class to form
    this.form.classList.add('next-processing');
    
    // Add loading class to specific section if it exists
    const sectionElement = this.form.querySelector(`[data-section="${section}"]`);
    if (sectionElement instanceof HTMLElement) {
      sectionElement.classList.add('next-loading');
    }
    
    this.logger.debug(`Showing loading state for section: ${section}`);
  }

  /**
   * Hide loading state for a specific section
   */
  public hideLoading(section: string): void {
    this.loadingStates.set(section, false);
    
    // Check if any sections are still loading
    const hasActiveLoading = Array.from(this.loadingStates.values()).some(isLoading => isLoading);
    
    if (!hasActiveLoading) {
      this.form.classList.remove('next-processing');
    }
    
    // Remove loading class from specific section
    const sectionElement = this.form.querySelector(`[data-section="${section}"]`);
    if (sectionElement instanceof HTMLElement) {
      sectionElement.classList.remove('next-loading');
    }
    
    this.logger.debug(`Hiding loading state for section: ${section}`);
  }

  /**
   * Update progress indicator
   */
  public updateProgress(step: number): void {
    const progressBar = this.form.querySelector('.next-progress-bar');
    if (progressBar instanceof HTMLElement) {
      const progressFill = progressBar.querySelector('.next-progress-fill');
      if (progressFill instanceof HTMLElement) {
        const percentage = Math.min(100, Math.max(0, step * 25)); // Assuming 4 steps
        progressFill.style.width = `${percentage}%`;
        progressFill.setAttribute('aria-valuenow', percentage.toString());
      }
    }
    
    this.logger.debug(`Updated progress to step: ${step}`);
  }

  // ============================================================================
  // ERROR MANAGEMENT
  // ============================================================================

  /**
   * Display form validation errors
   */
  public displayErrors(errors: Record<string, string>, scrollToField?: string): void {
    // Clear all existing errors first
    this.errorManager.clearAllErrors(this.form);
    
    // Filter out Spreedly fields that are already marked as valid
    const filteredErrors: Record<string, string> = {};
    
    Object.entries(errors).forEach(([field, message]) => {
      // Skip Spreedly fields that are already marked as valid
      if (field === 'cc-number' || field === 'cvv') {
        const spreedlyField = field === 'cc-number' ? 'spreedly-number' : 'spreedly-cvv';
        const spreedlyElement = document.getElementById(spreedlyField);
        if (spreedlyElement && spreedlyElement.classList.contains('no-error')) {
          // Field is valid, skip displaying error
          return;
        }
      }
      filteredErrors[field] = message;
    });
    
    // Display errors for each field
    Object.entries(filteredErrors).forEach(([fieldName, message]) => {
      // Check regular fields first
      let fieldElement = this.fields.get(fieldName);
      
      // If not found in regular fields and it's a billing field, check billing fields
      if (!fieldElement && fieldName.startsWith('billing-') && this.billingFields) {
        fieldElement = this.billingFields.get(fieldName);
      }
      
      if (fieldElement) {
        this.errorManager.showFieldError(fieldElement, message);
      } else {
        this.logger.warn(`Field element not found for error: ${fieldName}`);
      }
    });
    
    // Scroll to the first error field if specified
    if (scrollToField) {
      this.focusFirstError(scrollToField);
    }
  }

  /**
   * Focus and scroll to the first error field
   */
  public focusFirstError(fieldName: string): void {
    // Check regular fields first
    let fieldElement = this.fields.get(fieldName);
    
    // If not found in regular fields and it's a billing field, check billing fields
    if (!fieldElement && fieldName.startsWith('billing-') && this.billingFields) {
      fieldElement = this.billingFields.get(fieldName);
    }
    
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

  /**
   * Update field state with visual indicators
   */
  public updateFieldState(fieldName: string, state: 'valid' | 'invalid' | 'neutral'): void {
    let fieldElement = this.fields.get(fieldName);
    
    if (!fieldElement && fieldName.startsWith('billing-') && this.billingFields) {
      fieldElement = this.billingFields.get(fieldName);
    }
    
    if (!fieldElement) {
      this.logger.warn(`Field '${fieldName}' not found for state update`);
      return;
    }
    
    // Remove existing state classes
    fieldElement.classList.remove('next-error-field', 'next-valid-field', 'next-neutral-field');
    
    // Add appropriate state class
    switch (state) {
      case 'valid':
        fieldElement.classList.add('next-valid-field');
        break;
      case 'invalid':
        fieldElement.classList.add('next-error-field');
        break;
      case 'neutral':
        fieldElement.classList.add('next-neutral-field');
        break;
    }
    
    this.logger.debug(`Updated field ${fieldName} state to: ${state}`);
  }

  // ============================================================================
  // CHECKOUT STATE MANAGEMENT
  // ============================================================================

  /**
   * Handle checkout state updates
   */
  public handleCheckoutUpdate(state: any, displayErrors: (errors: Record<string, string>) => void): void {
    // Only update errors if they actually changed
    const currentErrorsString = JSON.stringify(state.errors || {});
    if (currentErrorsString !== this.lastErrorsString) {
      this.lastErrorsString = currentErrorsString;
      
      // Update UI based on checkout state
      if (state.errors && Object.keys(state.errors).length > 0) {
        displayErrors(state.errors);
      } else {
        // Clear all errors when there are no errors in state
        displayErrors({});
      }
    }
    
    if (state.isProcessing) {
      this.showLoading('checkout');
    } else {
      this.hideLoading('checkout');
    }
  }

  /**
   * Handle cart state updates
   */
  public handleCartUpdate(cartState: CartState): void {
    // Update order summary or handle empty cart
    if (cartState.isEmpty) {
      this.logger.warn('Cart is empty, redirecting to cart page');
      // Optionally redirect to cart page
    }
  }

  // ============================================================================
  // PAYMENT FORM MANAGEMENT
  // ============================================================================

  /**
   * Initialize payment forms based on their current state in the DOM
   */
  public initializePaymentForms(): void {
    this.logger.debug('Initializing payment forms');
    
    const paymentMethods = this.form.querySelectorAll('[data-next-payment-method]');
    
    paymentMethods.forEach(paymentMethodElement => {
      if (paymentMethodElement instanceof HTMLElement) {
        const radio = paymentMethodElement.querySelector('input[type="radio"]');
        const paymentForm = paymentMethodElement.querySelector('[data-next-payment-form]');
        
        if (!(radio instanceof HTMLInputElement) || !(paymentForm instanceof HTMLElement)) {
          return;
        }
        
        // Check the current state from HTML
        const isExpanded = paymentForm.getAttribute('data-next-payment-state') === 'expanded' ||
                          paymentForm.classList.contains('payment-method__form--expanded');
        const isChecked = radio.checked;
        
        // Sync the state
        if (isChecked || isExpanded) {
          // Ensure it's properly expanded
          paymentMethodElement.classList.add('next-selected');
          paymentForm.setAttribute('data-next-payment-state', 'expanded');
          paymentForm.classList.add('payment-method__form--expanded');
          paymentForm.classList.remove('payment-method__form--collapsed');
          paymentForm.classList.remove('payment-method__form--collapsing');
          paymentForm.classList.remove('payment-method__form--expanding');
          paymentForm.style.height = '';
          paymentForm.style.overflow = '';
          paymentForm.style.transition = '';
        } else {
          // Ensure it's properly collapsed
          paymentMethodElement.classList.remove('next-selected');
          paymentForm.setAttribute('data-next-payment-state', 'collapsed');
          paymentForm.classList.add('payment-method__form--collapsed');
          paymentForm.classList.remove('payment-method__form--expanded');
          paymentForm.classList.remove('payment-method__form--expanding');
          paymentForm.classList.remove('payment-method__form--collapsing');
          paymentForm.style.height = '0px';
          paymentForm.style.overflow = 'hidden';
          paymentForm.style.transition = '';
        }
      }
    });
  }

  /**
   * Update payment form visibility based on selected payment method
   */
  public updatePaymentFormVisibility(paymentMethod: string): void {
    this.logger.debug('Updating payment form visibility for method:', paymentMethod);
    
    // Handle payment method forms using data attributes (preferred approach)
    const paymentMethods = this.form.querySelectorAll('[data-next-payment-method]');
    
    paymentMethods.forEach(paymentMethodElement => {
      if (paymentMethodElement instanceof HTMLElement) {
        const radio = paymentMethodElement.querySelector('input[type="radio"]');
        const paymentForm = paymentMethodElement.querySelector('[data-next-payment-form]');
        
        if (!(radio instanceof HTMLInputElement) || !(paymentForm instanceof HTMLElement)) {
          return; // Use return instead of continue in forEach
        }
        
        if (radio && paymentForm) {
          const isSelected = radio.value === paymentMethod;
          
          this.logger.debug(`Payment method ${radio.value}: ${isSelected ? 'selected' : 'not selected'}`);
          
          if (isSelected) {
            // Add next-selected class to the payment method container
            paymentMethodElement.classList.add('next-selected');
            
            // Set data attribute for expanded state
            paymentForm.setAttribute('data-next-payment-state', 'expanded');
            
            // Smooth expand animation
            this.expandPaymentForm(paymentForm);
            
            // Clear any existing errors when switching payment methods
            this.clearPaymentFormErrors(paymentForm);
            
          } else {
            // Remove next-selected class from non-selected payment methods
            paymentMethodElement.classList.remove('next-selected');
            
            // Set data attribute for collapsed state
            paymentForm.setAttribute('data-next-payment-state', 'collapsed');
            
            // Smooth collapse animation
            this.collapsePaymentForm(paymentForm);
            
            // Clear errors from collapsed forms
            this.clearPaymentFormErrors(paymentForm);
          }
        }
      }
    });
  }

  /**
   * Smoothly expand a payment form with animation
   */
  private expandPaymentForm(paymentForm: HTMLElement): void {
    // Check if already expanded to avoid duplicate animations
    if (paymentForm.classList.contains('payment-method__form--expanded')) {
      return;
    }
    
    // Ensure overflow is hidden for animation
    paymentForm.style.overflow = 'hidden';
    
    // Get current height (should be 0 from collapsed state)
    const startHeight = paymentForm.offsetHeight;
    
    // Remove collapsed class and add expanding class for animation
    paymentForm.classList.remove('payment-method__form--collapsed');
    paymentForm.classList.add('payment-method__form--expanding');
    
    // Calculate target height
    paymentForm.style.height = 'auto';
    const targetHeight = paymentForm.scrollHeight;
    
    // Reset to start height
    paymentForm.style.height = startHeight + 'px';
    
    // Force a reflow to ensure browser registers the starting state
    void paymentForm.offsetHeight;
    
    // Use requestAnimationFrame to ensure smooth animation in production
    requestAnimationFrame(() => {
      // Set transition
      paymentForm.style.transition = 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      
      // Animate to target height
      paymentForm.style.height = targetHeight + 'px';
      
      // Clean up after animation completes
      setTimeout(() => {
        paymentForm.classList.remove('payment-method__form--expanding');
        paymentForm.classList.add('payment-method__form--expanded');
        paymentForm.style.height = '';
        paymentForm.style.transition = '';
        paymentForm.style.overflow = '';
      }, 300); // Match transition duration
    });
    
    this.logger.debug('Expanded payment form');
  }

  /**
   * Smoothly collapse a payment form with animation
   */
  private collapsePaymentForm(paymentForm: HTMLElement): void {
    // Check if already collapsed to avoid duplicate animations
    if (paymentForm.classList.contains('payment-method__form--collapsed')) {
      return;
    }
    
    // Ensure overflow is hidden for animation
    paymentForm.style.overflow = 'hidden';
    
    // Get current height for animation
    const currentHeight = paymentForm.scrollHeight;
    
    // Remove expanded class and add collapsing class for animation
    paymentForm.classList.remove('payment-method__form--expanded');
    paymentForm.classList.add('payment-method__form--collapsing');
    
    // Set explicit height for starting point
    paymentForm.style.height = currentHeight + 'px';
    
    // Force a reflow to ensure browser registers the starting state
    void paymentForm.offsetHeight;
    
    // Use requestAnimationFrame to ensure smooth animation in production
    requestAnimationFrame(() => {
      // Set transition
      paymentForm.style.transition = 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      
      // Animate to 0 height
      paymentForm.style.height = '0px';
      
      // Clean up after animation completes
      setTimeout(() => {
        paymentForm.classList.remove('payment-method__form--collapsing');
        paymentForm.classList.add('payment-method__form--collapsed');
        paymentForm.style.transition = '';
      }, 300); // Match transition duration
    });
    
    this.logger.debug('Collapsed payment form');
  }

  /**
   * Clear validation errors from a payment form when it's collapsed
   */
  private clearPaymentFormErrors(paymentForm: HTMLElement): void {
    // Use error manager to clear all errors in the payment form
    this.errorManager.clearAllErrors(paymentForm);
    
    // Remove validation classes from fields when clearing errors
    // Don't add 'no-error' to empty fields - that should only happen after successful validation
    const fields = paymentForm.querySelectorAll('input, select, textarea');
    fields.forEach(field => {
      field.classList.remove('no-error', 'has-error', 'next-error-field');
      // Also remove validation icon classes from parent elements
      const formGroup = field.closest('.form-group');
      if (formGroup) {
        formGroup.classList.remove('addTick', 'addErrorIcon', 'has-error');
      }
      const formInput = field.closest('.form-input');
      if (formInput) {
        formInput.classList.remove('addTick', 'addErrorIcon');
      }
    });
    
    this.logger.debug('Cleared payment form errors');
  }

  // ============================================================================
  // FLOATING LABEL MANAGEMENT
  // ============================================================================

  /**
   * Initialize floating labels for all form fields in the container
   */
  private initializeFloatingLabels(): void {
    this.logger.debug('Initializing floating labels');
    
    // Find all form groups with labels
    const formGroups = this.form.querySelectorAll('.form-group');
    
    formGroups.forEach(formGroup => {
      const label = formGroup.querySelector('.label-checkout');
      const input = formGroup.querySelector('input[data-next-checkout-field], input[os-checkout-field], select[data-next-checkout-field], select[os-checkout-field]');
      
      if (label instanceof HTMLLabelElement && (input instanceof HTMLInputElement || input instanceof HTMLSelectElement)) {
        this.setupFloatingLabel(input, label);
      }
      
    });
    
    // Also setup Spreedly fields (credit card and CVV)
    this.setupSpreedlyFloatingLabels();
    
    this.logger.debug(`Initialized ${this.floatingLabels.size} floating labels`);
    
    // Start periodic check for autocomplete detection
    this.startPeriodicCheck();
  }

  /**
   * Setup floating labels for Spreedly iframe fields
   */
  private setupSpreedlyFloatingLabels(): void {
    // Setup credit card number field
    const ccNumberContainer = this.form.querySelector('[data-next-checkout-field="cc-number"], #spreedly-number') as HTMLElement;
    if (ccNumberContainer) {
      const label = ccNumberContainer.parentElement?.querySelector('.label-checkout');
      if (label instanceof HTMLLabelElement) {
        this.floatingLabels.set(ccNumberContainer, label);
        this.setupLabelStyles(label);
        
        // Check if it has placeholder behavior
        const behavior = ccNumberContainer.getAttribute('data-label-behavior');
        if (behavior === 'placeholder') {
          // Initially float down (will be handled by Spreedly events)
          this.floatLabelDown(label, ccNumberContainer as HTMLInputElement);
        }
        
        this.logger.debug('Set up Spreedly floating label for credit card number');
      }
    }
    
    // Setup CVV field
    const cvvContainer = this.form.querySelector('[data-next-checkout-field="cvv"], #spreedly-cvv') as HTMLElement;
    if (cvvContainer) {
      const label = cvvContainer.parentElement?.querySelector('.label-checkout');
      if (label instanceof HTMLLabelElement) {
        this.floatingLabels.set(cvvContainer, label);
        this.setupLabelStyles(label);
        
        // Check if it has placeholder behavior
        const behavior = cvvContainer.getAttribute('data-label-behavior');
        if (behavior === 'placeholder') {
          // Initially float down (will be handled by Spreedly events)
          this.floatLabelDown(label, cvvContainer as HTMLInputElement);
        }
        
        this.logger.debug('Set up Spreedly floating label for CVV');
      }
    }
  }

  /**
   * Handle Spreedly field focus event
   */
  public handleSpreedlyFieldFocus(fieldName: 'number' | 'cvv'): void {
    const fieldId = fieldName === 'number' ? 'spreedly-number' : 'spreedly-cvv';
    const field = document.getElementById(fieldId) || 
                  this.form.querySelector(`[data-next-checkout-field="${fieldName === 'number' ? 'cc-number' : 'cvv'}"]`) as HTMLElement;
    
    if (!field) {
      this.logger.warn(`Spreedly field not found: ${fieldName}`);
      return;
    }
    
    const label = this.floatingLabels.get(field);
    if (label) {
      const behavior = field.getAttribute('data-label-behavior');
      
      if (behavior === 'placeholder') {
        // Placeholder behavior: always float up on focus
        this.floatLabelUp(label, field as HTMLInputElement, 'focus');
      }
      
      this.logger.debug(`Spreedly field focused: ${fieldName}`);
    }
  }

  /**
   * Handle Spreedly field blur event
   */
  public handleSpreedlyFieldBlur(fieldName: 'number' | 'cvv', hasValue: boolean): void {
    const fieldId = fieldName === 'number' ? 'spreedly-number' : 'spreedly-cvv';
    const field = document.getElementById(fieldId) || 
                  this.form.querySelector(`[data-next-checkout-field="${fieldName === 'number' ? 'cc-number' : 'cvv'}"]`) as HTMLElement;
    
    if (!field) {
      this.logger.warn(`Spreedly field not found: ${fieldName}`);
      return;
    }
    
    const label = this.floatingLabels.get(field);
    if (label) {
      const behavior = field.getAttribute('data-label-behavior');
      
      if (behavior === 'placeholder') {
        // Placeholder behavior: only keep floating if field has value
        if (!hasValue) {
          this.floatLabelDown(label, field as HTMLInputElement);
        }
      } else {
        // Default behavior
        if (hasValue) {
          this.floatLabelUp(label, field as HTMLInputElement);
        } else {
          this.floatLabelDown(label, field as HTMLInputElement);
        }
      }
      
      this.logger.debug(`Spreedly field blurred: ${fieldName}, hasValue: ${hasValue}`);
    }
  }

  /**
   * Handle Spreedly field input event
   */
  public handleSpreedlyFieldInput(fieldName: 'number' | 'cvv', hasValue: boolean): void {
    const fieldId = fieldName === 'number' ? 'spreedly-number' : 'spreedly-cvv';
    const field = document.getElementById(fieldId) || 
                  this.form.querySelector(`[data-next-checkout-field="${fieldName === 'number' ? 'cc-number' : 'cvv'}"]`) as HTMLElement;
    
    if (!field) {
      this.logger.warn(`Spreedly field not found: ${fieldName}`);
      return;
    }
    
    const label = this.floatingLabels.get(field);
    if (label) {
      const behavior = field.getAttribute('data-label-behavior');
      const isFocused = field.classList.contains('next-focused') || field.classList.contains('has-focus');
      
      if (behavior === 'placeholder') {
        // For placeholder behavior, keep floating if focused or has value
        if (isFocused || hasValue) {
          this.floatLabelUp(label, field as HTMLInputElement, isFocused ? 'focus' : 'value');
        } else {
          this.floatLabelDown(label, field as HTMLInputElement);
        }
      } else {
        // Default behavior
        if (hasValue) {
          this.floatLabelUp(label, field as HTMLInputElement);
        } else {
          this.floatLabelDown(label, field as HTMLInputElement);
        }
      }
      
      this.logger.debug(`Spreedly field input: ${fieldName}, hasValue: ${hasValue}`);
    }
  }

  /**
   * Set up floating label behavior for a specific field
   */
  public setupFloatingLabel(field: HTMLInputElement | HTMLSelectElement, label?: HTMLLabelElement): void {
    // If no label provided, try to find it
    if (!label) {
      const formGroup = field.closest('.form-group');
      if (formGroup) {
        const labelElement = formGroup.querySelector('.label-checkout');
        if (labelElement instanceof HTMLLabelElement) {
          label = labelElement;
        }
      }
    }
    
    if (!label) {
      this.logger.warn('No label found for floating label setup');
      return;
    }
    
    // Store the relationship
    this.floatingLabels.set(field, label);
    
    // Set initial positioning styles on the label
    this.setupLabelStyles(label);
    
    // Set initial field styles
    this.setupFieldStyles(field);
    
    // Check initial state (in case field already has value)
    this.updateLabelState(field, label);
    
    // Add event listeners using EventHandlerManager
    this.eventManager.addHandler(field, 'input', (e: Event) => this.handleInput(e));
    this.eventManager.addHandler(field, 'focus', (e: Event) => this.handleFocus(e));
    this.eventManager.addHandler(field, 'blur', (e: Event) => this.handleBlur(e));
    this.eventManager.addHandler(field, 'change', (e: Event) => this.handleInput(e)); // Handle autocomplete
    this.eventManager.addHandler(field, 'animationstart', (e: Event) => this.handleAutofill(e)); // Chrome autofill detection
    
    this.logger.debug('Set up floating label for field:', field.getAttribute('data-next-checkout-field') || field.name);
  }

  /**
   * Set up label positioning and transition styles
   */
  private setupLabelStyles(label: HTMLLabelElement): void {
    // Ensure the label has the transition for smooth animation
    if (!label.style.transition) {
      label.style.transition = 'all 0.15s ease-in-out';
    }
  }

  /**
   * Set up field styles to accommodate floating label
   */
  private setupFieldStyles(field: HTMLInputElement | HTMLSelectElement): void {
    // Ensure relative positioning for absolute label
    const formInput = field.closest('.form-input');
    if (formInput instanceof HTMLElement) {
      formInput.style.position = 'relative';
    }
  }

  /**
   * Handle input events - triggered when user types
   */
  private handleInput(event: Event): void {
    const field = event.target as HTMLInputElement | HTMLSelectElement;
    const label = this.floatingLabels.get(field);
    
    if (label) {
      this.updateLabelState(field, label);
    }
  }

  /**
   * Handle focus events - triggered when field gains focus
   */
  private handleFocus(event: Event): void {
    const field = event.target as HTMLInputElement | HTMLSelectElement;
    const label = this.floatingLabels.get(field);
    
    if (label) {
      const behavior = field.getAttribute('data-label-behavior');
      
      if (behavior === 'placeholder') {
        // Placeholder behavior: always float up on focus
        this.floatLabelUp(label, field as HTMLInputElement, 'focus');
      } else {
        // Default Shopify behavior: only float up if field has value
        if (this.hasValue(field)) {
          this.floatLabelUp(label, field);
        }
      }
    }
  }

  /**
   * Handle blur events - triggered when field loses focus
   */
  private handleBlur(event: Event): void {
    const field = event.target as HTMLInputElement | HTMLSelectElement;
    const label = this.floatingLabels.get(field);
    
    if (label) {
      const behavior = field.getAttribute('data-label-behavior');
      
      if (behavior === 'placeholder') {
        // Placeholder behavior: only keep floating if field has value
        if (!this.hasValue(field)) {
          this.floatLabelDown(label, field);
        }
      } else {
        // Default behavior
        this.updateLabelState(field, label);
      }
    }
  }

  /**
   * Handle autofill detection - Chrome triggers animation when autofilling
   */
  private handleAutofill(event: Event): void {
    const animationEvent = event as AnimationEvent;
    if (animationEvent.animationName === 'autofill') {
      const field = event.target as HTMLInputElement | HTMLSelectElement;
      const label = this.floatingLabels.get(field);
      
      if (label) {
        // Delay slightly to ensure autofill is complete
        setTimeout(() => {
          this.updateLabelState(field, label);
        }, 100);
      }
    }
  }

  /**
   * Update label state based on field value
   */
  private updateLabelState(field: HTMLInputElement | HTMLSelectElement, label: HTMLLabelElement): void {
    const behavior = field.getAttribute('data-label-behavior');
    
    // For placeholder behavior, check if field is currently focused
    if (behavior === 'placeholder') {
      const isFocused = document.activeElement === field;
      
      if (isFocused || this.hasValue(field)) {
        this.floatLabelUp(label, field, isFocused ? 'focus' : 'value');
      } else {
        this.floatLabelDown(label, field);
      }
    } else {
      // Default behavior
      if (this.hasValue(field)) {
        this.floatLabelUp(label, field);
      } else {
        this.floatLabelDown(label, field);
      }
    }
  }

  /**
   * Check if field has a value
   */
  private hasValue(field: HTMLInputElement | HTMLSelectElement): boolean {
    if (field instanceof HTMLSelectElement) {
      return field.value !== '' && field.value !== field.querySelector('option')?.value;
    }
    return field.value.trim() !== '';
  }

  /**
   * Float label up (when field has value or on focus for placeholder behavior)
   */
  private floatLabelUp(label: HTMLLabelElement, field: HTMLInputElement | HTMLSelectElement, reason: 'value' | 'focus' = 'value'): void {
    if (label.classList.contains('has-value')) {
      // If already floating but now focused, add is-focused class
      if (reason === 'focus' && !label.classList.contains('is-focused')) {
        label.classList.add('is-focused');
      }
      return;
    }
    
    // Add has-value class for CSS animation
    label.classList.add('has-value');
    
    // Track if this is due to focus (for placeholder behavior)
    if (reason === 'focus') {
      label.classList.add('is-focused');
    }
    
    // Add padding-top to input field
    field.style.paddingTop = '14px';
    
    // Hide placeholder when label is floating (for placeholder behavior)
    const behavior = field.getAttribute('data-label-behavior');
    if (behavior === 'placeholder' && field instanceof HTMLInputElement) {
      field.setAttribute('data-original-placeholder', field.placeholder || '');
      field.placeholder = '';
    }
    
    this.logger.debug(`Added has-value class for field (${reason}):`, field.getAttribute('data-next-checkout-field') || field.name);
  }

  /**
   * Float label down (when field is empty)
   */
  private floatLabelDown(label: HTMLLabelElement, field: HTMLInputElement | HTMLSelectElement): void {
    if (!label.classList.contains('has-value')) return;
    
    // Remove has-value and is-focused classes for CSS animation
    label.classList.remove('has-value', 'is-focused');
    
    // Reset padding-top on input field
    field.style.paddingTop = '';
    
    // Restore placeholder when label floats down (for placeholder behavior)
    const behavior = field.getAttribute('data-label-behavior');
    if (behavior === 'placeholder' && field instanceof HTMLInputElement) {
      const originalPlaceholder = field.getAttribute('data-original-placeholder');
      if (originalPlaceholder !== null) {
        field.placeholder = originalPlaceholder;
      }
    }
    
    this.logger.debug('Removed has-value class for field:', field.getAttribute('data-next-checkout-field') || field.name);
  }

  /**
   * Start periodic check for autocomplete detection (fallback method)
   */
  private startPeriodicCheck(): void {
    // Check every 500ms for autocomplete changes
    this.periodicCheckInterval = window.setInterval(() => {
      this.checkAllFieldsForChanges();
    }, 500);
  }

  /**
   * Check all fields for value changes (autocomplete detection)
   */
  private checkAllFieldsForChanges(): void {
    this.floatingLabels.forEach((label, field) => {
      if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement) {
        this.updateLabelState(field, label);
      }
    });
  }

  /**
   * Update floating labels when form data is populated programmatically
   */
  public updateLabelsForPopulatedData(): void {
    this.floatingLabels.forEach((label, field) => {
      if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement) {
        this.updateLabelState(field, label);
      }
    });
    
    this.logger.debug('Updated all floating labels for populated data');
  }

  // ============================================================================
  // RESPONSIVE UI HANDLING
  // ============================================================================

  /**
   * Handle responsive UI adjustments
   */
  public handleResponsiveUI(): void {
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;
    
    // Add responsive classes to form
    this.form.classList.toggle('next-mobile', isMobile);
    this.form.classList.toggle('next-tablet', isTablet);
    this.form.classList.toggle('next-desktop', !isMobile && !isTablet);
    
    // Adjust floating label behavior for mobile
    if (isMobile) {
      // On mobile, always float labels up when focused for better UX
      this.floatingLabels.forEach((label, field) => {
        const focusHandler = () => {
          this.floatLabelUp(label, field as HTMLInputElement | HTMLSelectElement);
        };
        field.addEventListener('focus', focusHandler);
      });
    }
    
    this.logger.debug(`Handled responsive UI adjustments for ${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}`);
  }

  // ============================================================================
  // ACCESSIBILITY FEATURES
  // ============================================================================

  /**
   * Enhance accessibility features
   */
  public enhanceAccessibility(): void {
    // Add ARIA labels and descriptions
    this.fields.forEach((field, fieldName) => {
      if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement) {
        // Add aria-describedby for error messages
        const errorElement = field.parentElement?.querySelector('.next-error-label');
        if (errorElement) {
          const errorId = `${fieldName}-error`;
          errorElement.id = errorId;
          field.setAttribute('aria-describedby', errorId);
          field.setAttribute('aria-invalid', 'true');
        } else {
          field.removeAttribute('aria-describedby');
          field.setAttribute('aria-invalid', 'false');
        }
        
        // Add aria-required for required fields
        const isRequired = field.hasAttribute('required') || field.getAttribute('data-required') === 'true';
        if (isRequired) {
          field.setAttribute('aria-required', 'true');
        }
      }
    });
    
    this.logger.debug('Enhanced accessibility features');
  }

  // ============================================================================
  // CLEANUP AND DESTRUCTION
  // ============================================================================

  /**
   * Clean up event listeners and restore original state
   */
  public destroy(): void {
    // Clear periodic check
    if (this.periodicCheckInterval) {
      clearInterval(this.periodicCheckInterval);
      delete this.periodicCheckInterval;
    }
    
    // Remove all event handlers using EventHandlerManager
    this.eventManager.removeAllHandlers();
    
    // Clear maps
    this.floatingLabels.clear();
    this.loadingStates.clear();
    
    this.logger.debug('UIService destroyed');
  }
}