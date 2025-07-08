/**
 * Test Data Handler
 * Centralized handling of test/debug data for checkout forms
 * This functionality was spread across multiple enhancers in the original system
 */

import { useCheckoutStore } from '@/stores/checkoutStore';
import { createLogger } from '@/utils/logger';

export interface TestCheckoutData {
  // Personal information
  fname?: string;
  lname?: string;
  email?: string;
  phone?: string;
  
  // Address information
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  postal?: string;
  country?: string;
  
  // Credit card information
  'cc-name'?: string;
  'cc-number'?: string;
  'cc-month'?: string;
  'cc-year'?: string;
  cvv?: string;
  
  // Billing address (if different)
  billingAddress?: {
    first_name?: string;
    last_name?: string;
    address1?: string;
    address2?: string;
    city?: string;
    province?: string;
    postal?: string;
    country?: string;
    phone?: string;
  };
  
  // Other form data
  accepts_marketing?: boolean;
  use_shipping_address?: boolean;
  payment_method?: string;
  shipping_method?: number;
}

export class TestDataHandler {
  private static instance: TestDataHandler;
  private logger = createLogger('TestDataHandler');
  
  // Default test data sets
  private readonly defaultTestData: Record<string, TestCheckoutData> = {
    'us': {
      fname: 'John',
      lname: 'Doe',
      email: 'john.doe@example.com',
      phone: '(555) 123-4567',
      address1: '123 Main St',
      city: 'New York',
      province: 'NY',
      postal: '10001',
      country: 'US',
      'cc-name': 'John Doe',
      'cc-number': '4111111111111111',
      'cc-month': '12',
      'cc-year': '2025',
      cvv: '123'
    },
    'ca': {
      fname: 'Jane',
      lname: 'Smith',
      email: 'jane.smith@example.com',
      phone: '(416) 555-0123',
      address1: '456 Queen St W',
      city: 'Toronto',
      province: 'ON',
      postal: 'M5V 2A4',
      country: 'CA',
      'cc-name': 'Jane Smith',
      'cc-number': '4111111111111111',
      'cc-month': '06',
      'cc-year': '2026',
      cvv: '456'
    },
    'uk': {
      fname: 'William',
      lname: 'Johnson',
      email: 'w.johnson@example.com',
      phone: '+44 20 7946 0958',
      address1: '221B Baker Street',
      city: 'London',
      postal: 'NW1 6XE',
      country: 'GB',
      'cc-name': 'William Johnson',
      'cc-number': '4111111111111111',
      'cc-month': '03',
      'cc-year': '2027',
      cvv: '789'
    }
  };

  public static getInstance(): TestDataHandler {
    if (!TestDataHandler.instance) {
      TestDataHandler.instance = new TestDataHandler();
    }
    return TestDataHandler.instance;
  }

  /**
   * Fill checkout form with test data
   */
  public fillTestData(dataSet: string = 'us', customData?: Partial<TestCheckoutData>): void {
    const testData = {
      ...this.defaultTestData[dataSet],
      ...customData
    };

    if (!testData) {
      this.logger.warn(`Unknown test data set: ${dataSet}`);
      return;
    }

    this.logger.debug('Filling form with test data:', { dataSet, testData });

    // Update checkout store
    const checkoutStore = useCheckoutStore.getState();
    checkoutStore.updateFormData(testData);

    // If billing address is provided, set it
    if (testData.billingAddress) {
      const billing = testData.billingAddress;
      // Ensure all required fields are present
      if (billing.first_name && billing.last_name && billing.address1 && 
          billing.city && billing.province && billing.postal && 
          billing.country && billing.phone) {
        checkoutStore.setBillingAddress({
          first_name: billing.first_name,
          last_name: billing.last_name,
          address1: billing.address1,
          address2: billing.address2,
          city: billing.city,
          province: billing.province,
          postal: billing.postal,
          country: billing.country,
          phone: billing.phone
        });
        checkoutStore.setSameAsShipping(false);
      } else {
        this.logger.warn('Incomplete billing address data provided');
      }
    }

    // Set payment method if provided
    if (testData.payment_method) {
      checkoutStore.setPaymentMethod(testData.payment_method as any);
    }

    // Set shipping method if provided
    if (testData.shipping_method) {
      checkoutStore.setShippingMethod({
        id: testData.shipping_method,
        name: 'Test Shipping',
        price: 0,
        code: 'test'
      });
    }

    // Emit event for enhancers to pick up the changes
    document.dispatchEvent(new CustomEvent('checkout:test-data-filled', {
      detail: { dataSet, testData }
    }));

    this.logger.info(`Test data filled for ${dataSet}`);
  }

  /**
   * Get available test data sets
   */
  public getAvailableDataSets(): string[] {
    return Object.keys(this.defaultTestData);
  }

  /**
   * Add or update a test data set
   */
  public addTestDataSet(name: string, data: TestCheckoutData): void {
    this.defaultTestData[name] = data;
    this.logger.debug(`Added test data set: ${name}`);
  }

  /**
   * Remove a test data set
   */
  public removeTestDataSet(name: string): void {
    delete this.defaultTestData[name];
    this.logger.debug(`Removed test data set: ${name}`);
  }

  /**
   * Get test data for a specific set
   */
  public getTestData(dataSet: string): TestCheckoutData | undefined {
    return this.defaultTestData[dataSet];
  }

  /**
   * Auto-fill form based on browser location or other heuristics
   */
  public async autoFillByLocation(): Promise<void> {
    try {
      // Try to detect country from timezone or other browser APIs
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      let dataSet = 'us'; // default

      if (timeZone.includes('America/Toronto') || timeZone.includes('Canada')) {
        dataSet = 'ca';
      } else if (timeZone.includes('Europe/London') || timeZone.includes('GMT')) {
        dataSet = 'uk';
      }

      this.fillTestData(dataSet);
    } catch (error) {
      this.logger.warn('Could not auto-detect location, using default US data');
      this.fillTestData('us');
    }
  }

  /**
   * Clear all form data
   */
  public clearFormData(): void {
    const checkoutStore = useCheckoutStore.getState();
    checkoutStore.reset();

    // Emit event for enhancers
    document.dispatchEvent(new CustomEvent('checkout:test-data-cleared'));

    this.logger.debug('Test data cleared');
  }
}

// Global API for debug/test purposes
declare global {
  interface Window {
    tnTestData?: TestDataHandler;
  }
}

// Expose to window for debug/testing
if (typeof window !== 'undefined') {
  window.tnTestData = TestDataHandler.getInstance();
}

export default TestDataHandler;