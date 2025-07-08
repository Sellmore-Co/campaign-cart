import { Logger } from '../../../utils/logger';
import { CartState } from '../../../types/global';

export declare class UIService {
    private form;
    private fields;
    private billingFields?;
    private logger;
    private errorManager;
    private eventManager;
    private floatingLabels;
    private periodicCheckInterval?;
    private loadingStates;
    private lastErrorsString;
    constructor(form: HTMLFormElement, fields: Map<string, HTMLElement>, logger: Logger, billingFields?: Map<string, HTMLElement>);
    /**
     * Initialize the UI service with all functionality
     */
    initialize(): void;
    /**
     * Show loading state for a specific section
     */
    showLoading(section: string): void;
    /**
     * Hide loading state for a specific section
     */
    hideLoading(section: string): void;
    /**
     * Update progress indicator
     */
    updateProgress(step: number): void;
    /**
     * Display form validation errors
     */
    displayErrors(errors: Record<string, string>, scrollToField?: string): void;
    /**
     * Focus and scroll to the first error field
     */
    focusFirstError(fieldName: string): void;
    /**
     * Update field state with visual indicators
     */
    updateFieldState(fieldName: string, state: 'valid' | 'invalid' | 'neutral'): void;
    /**
     * Handle checkout state updates
     */
    handleCheckoutUpdate(state: any, displayErrors: (errors: Record<string, string>) => void): void;
    /**
     * Handle cart state updates
     */
    handleCartUpdate(cartState: CartState): void;
    /**
     * Update payment form visibility based on selected payment method
     */
    updatePaymentFormVisibility(paymentMethod: string): void;
    /**
     * Smoothly expand a payment form with animation
     */
    private expandPaymentForm;
    /**
     * Smoothly collapse a payment form with animation
     */
    private collapsePaymentForm;
    /**
     * Clear validation errors from a payment form when it's collapsed
     */
    private clearPaymentFormErrors;
    /**
     * Initialize floating labels for all form fields in the container
     */
    private initializeFloatingLabels;
    /**
     * Set up floating label behavior for a specific field
     */
    setupFloatingLabel(field: HTMLInputElement | HTMLSelectElement, label?: HTMLLabelElement): void;
    /**
     * Set up label positioning and transition styles
     */
    private setupLabelStyles;
    /**
     * Set up field styles to accommodate floating label
     */
    private setupFieldStyles;
    /**
     * Handle input events - triggered when user types
     */
    private handleInput;
    /**
     * Handle focus events - triggered when field gains focus
     */
    private handleFocus;
    /**
     * Handle blur events - triggered when field loses focus
     */
    private handleBlur;
    /**
     * Handle autofill detection - Chrome triggers animation when autofilling
     */
    private handleAutofill;
    /**
     * Update label state based on field value
     */
    private updateLabelState;
    /**
     * Check if field has a value
     */
    private hasValue;
    /**
     * Float label up (when field has value)
     */
    private floatLabelUp;
    /**
     * Float label down (when field is empty)
     */
    private floatLabelDown;
    /**
     * Start periodic check for autocomplete detection (fallback method)
     */
    private startPeriodicCheck;
    /**
     * Check all fields for value changes (autocomplete detection)
     */
    private checkAllFieldsForChanges;
    /**
     * Update floating labels when form data is populated programmatically
     */
    updateLabelsForPopulatedData(): void;
    /**
     * Handle responsive UI adjustments
     */
    handleResponsiveUI(): void;
    /**
     * Enhance accessibility features
     */
    enhanceAccessibility(): void;
    /**
     * Clean up event listeners and restore original state
     */
    destroy(): void;
}
//# sourceMappingURL=UIService.d.ts.map