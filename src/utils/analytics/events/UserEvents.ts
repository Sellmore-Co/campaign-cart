/**
 * User Events
 * Builder methods for user-related analytics events
 */

import type { DataLayerEvent, UserProperties, EcommerceItem, EcommerceData } from '../types';
import { EventBuilder } from './EventBuilder';
import { useCartStore } from '@/stores/cartStore';
import { useCampaignStore } from '@/stores/campaignStore';

export class UserEvents {
  /**
   * Create base user data event (GA4 format)
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

    // For dl_user_data event, add cart items and cart_total
    if (eventName === 'dl_user_data') {
      try {
        if (typeof window !== 'undefined') {
          const cartState = useCartStore.getState();
          const campaignState = useCampaignStore.getState();

          const currency = campaignState?.data?.currency || 'USD';
          // Use items from cart store - they already have all the fields we need
          const cartItems = cartState?.items || [];

          // Format cart items as GA4 items using EventBuilder
          const items: EcommerceItem[] = cartItems.length > 0
            ? cartItems.map((item: any, idx: number) => EventBuilder.formatEcommerceItem(item, idx))
            : [];

          // Calculate cart total
          const cartTotal = cartState?.totals?.total?.value || cartState?.total || 0;

          // Build GA4 ecommerce object
          const ecommerce: EcommerceData = {
            currency,
            value: cartTotal,
            items // GA4 expects items array (can be empty)
          };

          // Always return the event with ecommerce data (even if items is empty array)
          return EventBuilder.createEvent(eventName, {
            user_properties: userProperties,
            cart_total: String(cartTotal),
            ecommerce,
            ...additionalData
          });
        }
      } catch (error) {
        console.warn('Could not add cart contents to user data event:', error);
      }
    }

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
    return this.createUserDataEvent('dl_sign_up', userData, {
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
    // Update visitor type to customer if we have a customer ID (Elevar format)
    const enrichedUserData: Partial<UserProperties> = {
      ...userData,
      visitor_type: userData?.customer_id ? 'logged_in' : 'guest'
    };

    return this.createUserDataEvent('dl_login', enrichedUserData, {
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
    // For Elevar format, include lead_type
    const leadType = channel === 'sms' || channel === 'push' ? 'phone' : 'email';

    return this.createUserDataEvent('dl_subscribe', userData, {
      lead_type: leadType,
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