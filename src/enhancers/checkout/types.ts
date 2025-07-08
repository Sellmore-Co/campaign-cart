// Field validation types
export interface ValidationRule {
  test: (value: any) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export interface FormValidationResult {
  isValid: boolean;
  firstErrorField?: string;
  errors: Record<string, string>;
}

// Address types
export interface AddressFields {
  address: HTMLInputElement | null;
  city: HTMLInputElement | null;
  state: HTMLSelectElement | null;
  zip: HTMLInputElement | null;
  country: HTMLSelectElement | null;
}

export interface AddressData {
  first_name: string;
  last_name: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  postal: string;
  country: string;
  phone: string;
}

// Payment types
export interface PaymentData {
  payment_method: string;
  credit_card?: {
    number: string;
    cvv: string;
    expiry: string;
  };
}

// UI types
export interface FloatingLabel {
  element: HTMLElement;
  label: HTMLElement;
  isActive: boolean;
}

export interface LoadingState {
  section: string;
  isLoading: boolean;
}