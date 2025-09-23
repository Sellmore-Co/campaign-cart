import { BaseEnhancer } from '../base/BaseEnhancer';
export interface ProspectCartConfig {
    autoCreate?: boolean;
    triggerOn?: 'formStart' | 'emailEntry' | 'manual';
    emailField?: string;
    includeUtmData?: boolean;
    sessionTimeout?: number;
}
export interface ProspectCart {
    id: string;
    prospect_id: string;
    email?: string;
    created_at: string;
    expires_at: string;
    utm_data?: Record<string, string>;
    cart_data?: any;
}
export declare class ProspectCartEnhancer extends BaseEnhancer {
    private config;
    private apiClient;
    private prospectCart;
    private emailField?;
    private hasTriggered;
    initialize(): Promise<void>;
    update(data?: any): void;
    private loadConfig;
    private findEmailField;
    private getFormattedPhoneNumber;
    private setupTriggers;
    private setupFormStartTrigger;
    private emailInputTimeout;
    private emailBlurTimeout;
    private setupEmailEntryTrigger;
    private checkExistingProspectCart;
    private createProspectCart;
    private updateProspectCart;
    private collectUtmData;
    private getCurrency;
    private isValidEmail;
    private isValidName;
    private handleCartUpdate;
    private updateTimeout;
    private emitProspectEvent;
    createCartManually(): Promise<ProspectCart | null>;
    getCurrentProspectCart(): ProspectCart | null;
    abandonCart(): Promise<void>;
    convertCart(): Promise<void>;
    private updateEmailTimeout;
    updateEmail(email: string): void;
    checkAndCreateCart(): void;
}
//# sourceMappingURL=ProspectCartEnhancer.d.ts.map