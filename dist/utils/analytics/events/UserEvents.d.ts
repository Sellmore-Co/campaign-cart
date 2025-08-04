import { DataLayerEvent, UserProperties } from '../types';
export declare class UserEvents {
    static createUserDataEvent(eventName: string, userData?: Partial<UserProperties>, additionalData?: Record<string, any>): DataLayerEvent;
    static createSignUpEvent(method?: string, userData?: Partial<UserProperties>): DataLayerEvent;
    static createLoginEvent(method?: string, userData?: Partial<UserProperties>): DataLayerEvent;
    static createSubscribeEvent(channel?: 'email' | 'sms' | 'push', subscriptionData?: {
        list_id?: string;
        list_name?: string;
        frequency?: string;
        topics?: string[];
    }, userData?: Partial<UserProperties>): DataLayerEvent;
    static createProfileUpdateEvent(updatedFields: string[], userData?: Partial<UserProperties>): DataLayerEvent;
    static createEmailVerificationEvent(status: 'sent' | 'verified' | 'failed', userData?: Partial<UserProperties>): DataLayerEvent;
    static createAccountDeletionEvent(reason?: string, userData?: Partial<UserProperties>): DataLayerEvent;
    static createPasswordResetEvent(step: 'requested' | 'completed' | 'failed', userData?: Partial<UserProperties>): DataLayerEvent;
    static createConsentEvent(consentType: 'marketing' | 'analytics' | 'all', granted: boolean, userData?: Partial<UserProperties>): DataLayerEvent;
}
//# sourceMappingURL=UserEvents.d.ts.map