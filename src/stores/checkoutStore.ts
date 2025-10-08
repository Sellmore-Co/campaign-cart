/**
 * Checkout Store - Zustand store for checkout flow state management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CheckoutState {
  step: number;
  isProcessing: boolean;
  errors: Record<string, string>;
  formData: Record<string, any>;
  paymentToken?: string;
  paymentMethod: 'card_token' | 'paypal' | 'apple_pay' | 'google_pay' | 'credit-card';
  shippingMethod?: {
    id: number;
    name: string;
    price: number;
    code: string;
  } | undefined;
  billingAddress?: {
    first_name: string;
    last_name: string;
    address1: string;
    address2?: string | undefined;
    city: string;
    province: string;
    postal: string;
    country: string;
    phone: string;
  } | undefined;
  sameAsShipping: boolean;
  testMode: boolean;
  vouchers: string[];
}

interface CheckoutActions {
  setStep: (step: number) => void;
  setProcessing: (processing: boolean) => void;
  setError: (field: string, error: string) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;
  updateFormData: (data: Record<string, any>) => void;
  setPaymentToken: (token: string) => void;
  setPaymentMethod: (method: CheckoutState['paymentMethod']) => void;
  setShippingMethod: (method: CheckoutState['shippingMethod']) => void;
  setBillingAddress: (address: CheckoutState['billingAddress']) => void;
  setSameAsShipping: (same: boolean) => void;
  setTestMode: (testMode: boolean) => void;
  addVoucher: (code: string) => void;
  removeVoucher: (code: string) => void;
  reset: () => void;
}

const initialState: CheckoutState = {
  step: 1,
  isProcessing: false,
  errors: {},
  formData: {},
  paymentMethod: 'credit-card',
  sameAsShipping: true,
  testMode: false,
  vouchers: [],
};

export const useCheckoutStore = create<CheckoutState & CheckoutActions>()(
  persist(
    (set) => ({
      ...initialState,

      setStep: (step: number) => {
        set({ step });
      },

      setProcessing: (isProcessing: boolean) => {
        set({ isProcessing });
      },

      setError: (field: string, error: string) => {
        set(state => ({
          errors: { ...state.errors, [field]: error },
        }));
      },

      clearError: (field: string) => {
        set(state => {
          const { [field]: _, ...errors } = state.errors;
          return { errors };
        });
      },

      clearAllErrors: () => {
        set({ errors: {} });
      },

      updateFormData: (data: Record<string, any>) => {
        set(state => ({
          formData: { ...state.formData, ...data },
        }));
      },

      setPaymentToken: (paymentToken: string) => {
        set({ paymentToken });
      },

      setPaymentMethod: (paymentMethod: CheckoutState['paymentMethod']) => {
        set({ paymentMethod });
      },

      setShippingMethod: (shippingMethod: CheckoutState['shippingMethod']) => {
        set({ shippingMethod });
      },

      setBillingAddress: (billingAddress: CheckoutState['billingAddress']) => {
        set({ billingAddress });
      },

      setSameAsShipping: (sameAsShipping: boolean) => {
        set({ sameAsShipping });
      },

      setTestMode: (testMode: boolean) => {
        set({ testMode });
      },

      addVoucher: (code: string) => {
        set(state => ({
          vouchers: [...state.vouchers, code],
        }));
      },

      removeVoucher: (code: string) => {
        set(state => ({
          vouchers: state.vouchers.filter(v => v !== code),
        }));
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'next-checkout-store', // Key in sessionStorage
      storage: {
        getItem: (name) => {
          const str = sessionStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name);
        },
      },
      // Exclude transient state from persistence
      partialize: (state) => {
        return {
          step: state.step,
          formData: state.formData,
          shippingMethod: state.shippingMethod,
          billingAddress: state.billingAddress,
          sameAsShipping: state.sameAsShipping,
          // Explicitly exclude:
          // - errors (transient validation state)
          // - isProcessing (transient UI state)
          // - paymentToken (sensitive, should not persist)
          // - paymentMethod (should be derived from form, not persisted)
          // - testMode (session-specific)
          // - vouchers (will be revalidated on page load)
        } as any;
      },
    }
  )
);