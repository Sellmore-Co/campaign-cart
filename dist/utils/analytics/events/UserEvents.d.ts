import { DataLayerEvent, UserProperties } from '../types';

export declare class UserEvents {
    /**
     * Create base user data event
     * This is the foundation for all user-related events
     */
    static createUserDataEvent(eventName: string, userData?: Partial<UserProperties>, additionalData?: Record<string, any>): DataLayerEvent;
    /**
     * Create sign_up event
     */
    static createSignUpEvent(method?: string, userData?: Partial<UserProperties>): DataLayerEvent;
    /**
     * Create login event
     */
    static createLoginEvent(method?: string, userData?: Partial<UserProperties>): DataLayerEvent;
    /**
     * Create subscribe event (for email/SMS subscriptions)
     */
    static createSubscribeEvent(channel?: 'email' | 'sms' | 'push', subscriptionData?: {
        list_id?: string;
        list_name?: string;
        frequency?: string;
        topics?: string[];
    }, userData?: Partial<UserProperties>): DataLayerEvent;
    /**
     * Create user profile update event
     */
    static createProfileUpdateEvent(updatedFields: string[], userData?: Partial<UserProperties>): DataLayerEvent;
    /**
     * Create email verification event
     */
    static createEmailVerificationEvent(status: 'sent' | 'verified' | 'failed', userData?: Partial<UserProperties>): DataLayerEvent;
    /**
     * Create account deletion event
     */
    static createAccountDeletionEvent(reason?: string, userData?: Partial<UserProperties>): DataLayerEvent;
    /**
     * Create password reset event
     */
    static createPasswordResetEvent(step: 'requested' | 'completed' | 'failed', userData?: Partial<UserProperties>): DataLayerEvent;
    /**
     * Create user consent event (for GDPR/privacy)
     */
    static createConsentEvent(consentType: 'marketing' | 'analytics' | 'all', granted: boolean, userData?: Partial<UserProperties>): DataLayerEvent;
}
//# sourceMappingURL=UserEvents.d.ts.map