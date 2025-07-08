/**
 * User Events
 * Builder methods for user-related analytics events
 */

import type { DataLayerEvent, UserProperties } from '../types';
import { EventBuilder } from './EventBuilder';

export class UserEvents {
  /**
   * Create base user data event
   * This is the foundation for all user-related events
   */
  static createUserDataEvent(
    eventName: string,
    userData?: Partial<UserProperties>,
    additionalData?: Record<string, any>
  ): DataLayerEvent {
    // Merge provided user data with existing user properties
    const userProperties: UserProperties = {
      ...EventBuilder.getUserProperties(),
      ...userData
    };

    return EventBuilder.createEvent(eventName, {
      user_properties: userProperties,
      event_category: 'user',
      ...additionalData
    });
  }

  /**
   * Create sign_up event
   */
  static createSignUpEvent(
    method: string = 'email',
    userData?: Partial<UserProperties>
  ): DataLayerEvent {
    return this.createUserDataEvent('sign_up', userData, {
      event_label: method,
      custom_properties: {
        method,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Create login event
   */
  static createLoginEvent(
    method: string = 'email',
    userData?: Partial<UserProperties>
  ): DataLayerEvent {
    // Update visitor type to customer if we have a customer ID
    const enrichedUserData: Partial<UserProperties> = {
      ...userData,
      visitor_type: userData?.customer_id ? 'returning_customer' : 'guest'
    };

    return this.createUserDataEvent('login', enrichedUserData, {
      event_label: method,
      custom_properties: {
        method,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Create subscribe event (for email/SMS subscriptions)
   */
  static createSubscribeEvent(
    channel: 'email' | 'sms' | 'push' = 'email',
    subscriptionData?: {
      list_id?: string;
      list_name?: string;
      frequency?: string;
      topics?: string[];
    },
    userData?: Partial<UserProperties>
  ): DataLayerEvent {
    return this.createUserDataEvent('subscribe', userData, {
      event_label: channel,
      custom_properties: {
        channel,
        subscription_details: subscriptionData,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Create user profile update event
   */
  static createProfileUpdateEvent(
    updatedFields: string[],
    userData?: Partial<UserProperties>
  ): DataLayerEvent {
    return this.createUserDataEvent('profile_update', userData, {
      event_label: `Updated: ${updatedFields.join(', ')}`,
      custom_properties: {
        updated_fields: updatedFields,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Create email verification event
   */
  static createEmailVerificationEvent(
    status: 'sent' | 'verified' | 'failed',
    userData?: Partial<UserProperties>
  ): DataLayerEvent {
    return this.createUserDataEvent('email_verification', userData, {
      event_label: status,
      custom_properties: {
        verification_status: status,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Create account deletion event
   */
  static createAccountDeletionEvent(
    reason?: string,
    userData?: Partial<UserProperties>
  ): DataLayerEvent {
    return this.createUserDataEvent('account_deletion', userData, {
      event_label: reason || 'user_initiated',
      custom_properties: {
        deletion_reason: reason,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Create password reset event
   */
  static createPasswordResetEvent(
    step: 'requested' | 'completed' | 'failed',
    userData?: Partial<UserProperties>
  ): DataLayerEvent {
    return this.createUserDataEvent('password_reset', userData, {
      event_label: step,
      custom_properties: {
        reset_step: step,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Create user consent event (for GDPR/privacy)
   */
  static createConsentEvent(
    consentType: 'marketing' | 'analytics' | 'all',
    granted: boolean,
    userData?: Partial<UserProperties>
  ): DataLayerEvent {
    return this.createUserDataEvent('user_consent', userData, {
      event_label: `${consentType}_${granted ? 'granted' : 'denied'}`,
      custom_properties: {
        consent_type: consentType,
        consent_granted: granted,
        timestamp: new Date().toISOString()
      }
    });
  }
}