import { DebugPanel, PanelAction, PanelTab } from '../DebugPanels';
export declare class CheckoutPanel implements DebugPanel {
    id: string;
    title: string;
    icon: string;
    getContent(): string;
    getTabs(): PanelTab[];
    private getOverviewContent;
    private getCustomerContent;
    private getValidationContent;
    private getRawDataContent;
    getActions(): PanelAction[];
    private renderFormFields;
    private hasFieldValue;
    private formatFieldName;
    private fillTestData;
    private validateForm;
    private clearErrors;
    private resetCheckout;
    private exportState;
}
//# sourceMappingURL=CheckoutPanel.d.ts.map