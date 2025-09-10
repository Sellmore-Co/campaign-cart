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
    show(): Promise<string>;
    private createModal;
    private getDefaultButtonStyles;
    private handleEscapeKey;
    private handleAction;
    private handleDismiss;
    private cleanup;
    static show(options: ModalOptions): Promise<string>;
    static showDuplicateUpsell(): Promise<boolean>;
    static showRecentPurchaseWarning(): Promise<string>;
}
//# sourceMappingURL=GeneralModal.d.ts.map