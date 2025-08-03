/**
 * General Modal Component
 * A reusable modal dialog with customizable content and actions
 */
export interface ModalButton {
    text: string;
    className?: string;
    style?: string;
    action: 'confirm' | 'cancel' | 'custom';
    href?: string;
    target?: string;
}
export interface ModalOptions {
    title: string;
    content: string;
    buttons: ModalButton[];
    className?: string;
    backdropDismiss?: boolean;
}
export declare class GeneralModal {
    private backdrop;
    private modal;
    private style;
    private resolve;
    private options;
    constructor(options: ModalOptions);
    /**
     * Shows the modal dialog
     * @returns Promise that resolves to the action taken ('confirm', 'cancel', 'custom', or 'backdrop')
     */
    show(): Promise<string>;
    private createModal;
    private getDefaultButtonStyles;
    private handleEscapeKey;
    private handleAction;
    private handleDismiss;
    private cleanup;
    /**
     * Static method for convenience - creates and shows a modal in one call
     */
    static show(options: ModalOptions): Promise<string>;
    /**
     * Static convenience method for duplicate upsell modal
     */
    static showDuplicateUpsell(): Promise<boolean>;
    /**
     * Static convenience method for recent purchase warning
     */
    static showRecentPurchaseWarning(): Promise<string>;
}
//# sourceMappingURL=GeneralModal.d.ts.map