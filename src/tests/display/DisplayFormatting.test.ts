/**
 * Display Formatting Test Suite
 * Comprehensive tests for the display formatting system
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { DisplayFormatter } from '@/enhancers/display/DisplayEnhancerCore';
import { ProductDisplayEnhancer } from '@/enhancers/display/ProductDisplayEnhancer';
import { CartDisplayEnhancer } from '@/enhancers/display/CartDisplayEnhancer';
import { DisplayContextProvider } from '@/enhancers/display/DisplayContextProvider';
import { DisplayErrorBoundary } from '@/enhancers/display/DisplayErrorBoundary';
import { useCampaignStore } from '@/stores/campaignStore';
import { useCartStore } from '@/stores/cartStore';

// Mock stores
vi.mock('@/stores/campaignStore');
vi.mock('@/stores/cartStore');

// Test utilities
function createTestElement(displayPath: string, attributes: Record<string, string> = {}): HTMLElement {
  const element = document.createElement('div');
  element.setAttribute('data-next-display', displayPath);
  
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  
  document.body.appendChild(element);
  return element;
}

function mockCampaignStore(packages: any[] = []) {
  const mockStore = {
    getState: vi.fn(() => ({ packages })),
    subscribe: vi.fn()
  };
  (useCampaignStore as any).mockReturnValue(mockStore);
  return mockStore;
}

function mockCartStore(state: any = {}) {
  const mockStore = {
    getState: vi.fn(() => state),
    subscribe: vi.fn()
  };
  (useCartStore as any).mockReturnValue(mockStore);
  return mockStore;
}

describe('Display Formatting System', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    DisplayContextProvider.clearAll();
    DisplayErrorBoundary.clearErrorCache();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('DisplayFormatter', () => {
    describe('Currency Formatting', () => {
      test('formats positive numbers as currency', () => {
        expect(DisplayFormatter.formatValue(123.45, 'currency')).toBe('$123.45');
      });

      test('formats zero as currency', () => {
        expect(DisplayFormatter.formatValue(0, 'currency')).toBe('$0.00');
      });

      test('formats negative numbers as currency', () => {
        expect(DisplayFormatter.formatValue(-50.99, 'currency')).toBe('-$50.99');
      });

      test('handles string numbers', () => {
        expect(DisplayFormatter.formatValue('123.45', 'currency')).toBe('$123.45');
      });

      test('handles invalid values', () => {
        expect(DisplayFormatter.formatValue('invalid', 'currency')).toBe('$0.00');
        expect(DisplayFormatter.formatValue(null, 'currency')).toBe('');
        expect(DisplayFormatter.formatValue(undefined, 'currency')).toBe('');
      });
    });

    describe('Percentage Formatting', () => {
      test('formats decimals as percentages', () => {
        expect(DisplayFormatter.formatValue(0.15, 'percentage')).toBe('15%');
        expect(DisplayFormatter.formatValue(0.5, 'percentage')).toBe('50%');
        expect(DisplayFormatter.formatValue(1, 'percentage')).toBe('100%');
      });

      test('formats whole numbers as percentages', () => {
        expect(DisplayFormatter.formatValue(15, 'percentage')).toBe('15%');
        expect(DisplayFormatter.formatValue(50, 'percentage')).toBe('50%');
        expect(DisplayFormatter.formatValue(100, 'percentage')).toBe('100%');
      });

      test('clamps values between 0-100', () => {
        expect(DisplayFormatter.formatValue(-10, 'percentage')).toBe('0%');
        expect(DisplayFormatter.formatValue(150, 'percentage')).toBe('100%');
      });

      test('rounds to nearest whole number', () => {
        expect(DisplayFormatter.formatValue(33.333, 'percentage')).toBe('33%');
        expect(DisplayFormatter.formatValue(66.666, 'percentage')).toBe('67%');
      });
    });

    describe('Number Formatting', () => {
      test('formats whole numbers', () => {
        expect(DisplayFormatter.formatValue(1234, 'number')).toBe('1,234');
      });

      test('formats decimals with max 2 places', () => {
        expect(DisplayFormatter.formatValue(1234.567, 'number')).toBe('1,234.57');
        expect(DisplayFormatter.formatValue(1234.5, 'number')).toBe('1,234.5');
      });

      test('handles edge cases', () => {
        expect(DisplayFormatter.formatValue(0, 'number')).toBe('0');
        expect(DisplayFormatter.formatValue(-1000, 'number')).toBe('-1,000');
      });
    });

    describe('Boolean Formatting', () => {
      test('formats boolean values', () => {
        expect(DisplayFormatter.formatValue(true, 'boolean')).toBe('Yes');
        expect(DisplayFormatter.formatValue(false, 'boolean')).toBe('No');
      });

      test('formats string booleans', () => {
        expect(DisplayFormatter.formatValue('true', 'boolean')).toBe('Yes');
        expect(DisplayFormatter.formatValue('false', 'boolean')).toBe('No');
        expect(DisplayFormatter.formatValue('1', 'boolean')).toBe('Yes');
        expect(DisplayFormatter.formatValue('0', 'boolean')).toBe('No');
      });

      test('formats truthy/falsy values', () => {
        expect(DisplayFormatter.formatValue(1, 'boolean')).toBe('Yes');
        expect(DisplayFormatter.formatValue(0, 'boolean')).toBe('No');
        expect(DisplayFormatter.formatValue('yes', 'boolean')).toBe('Yes');
        expect(DisplayFormatter.formatValue('', 'boolean')).toBe('No');
      });
    });

    describe('Text Formatting', () => {
      test('preserves string values exactly', () => {
        expect(DisplayFormatter.formatValue('12345', 'text')).toBe('12345');
        expect(DisplayFormatter.formatValue('123.45', 'text')).toBe('123.45');
        expect(DisplayFormatter.formatValue('Suite 100', 'text')).toBe('Suite 100');
      });

      test('converts non-strings to strings', () => {
        expect(DisplayFormatter.formatValue(12345, 'text')).toBe('12345');
        expect(DisplayFormatter.formatValue(true, 'text')).toBe('true');
      });
    });

    describe('Auto Formatting', () => {
      test('detects currency from decimal places', () => {
        expect(DisplayFormatter.formatValue(123.45, 'auto')).toBe('$123.45');
        expect(DisplayFormatter.formatValue('99.99', 'auto')).toBe('$99.99');
      });

      test('formats small integers as plain numbers', () => {
        expect(DisplayFormatter.formatValue(5, 'auto')).toBe('5');
        expect(DisplayFormatter.formatValue(10, 'auto')).toBe('10');
      });

      test('formats large numbers with commas', () => {
        expect(DisplayFormatter.formatValue(1000, 'auto')).toBe('1,000');
        expect(DisplayFormatter.formatValue(1234567, 'auto')).toBe('1,234,567');
      });

      test('preserves non-numeric strings', () => {
        expect(DisplayFormatter.formatValue('ABC123', 'auto')).toBe('ABC123');
        expect(DisplayFormatter.formatValue('Suite 200', 'auto')).toBe('Suite 200');
      });

      test('does not format postal codes as numbers', () => {
        expect(DisplayFormatter.formatValue('12345', 'auto')).toBe('12345');
        expect(DisplayFormatter.formatValue('90210', 'auto')).toBe('90210');
      });
    });
  });

  describe('Context Resolution', () => {
    test('resolves package context from parent elements', () => {
      const parent = document.createElement('div');
      parent.setAttribute('data-next-package-id', '123');
      document.body.appendChild(parent);

      const child = document.createElement('div');
      parent.appendChild(child);

      const context = DisplayContextProvider.resolve(child);
      expect(context).toEqual({ packageId: 123 });
    });

    test('child context overrides parent context', () => {
      const parent = document.createElement('div');
      parent.setAttribute('data-next-package-id', '123');
      document.body.appendChild(parent);

      const child = document.createElement('div');
      child.setAttribute('data-next-package-id', '456');
      parent.appendChild(child);

      const context = DisplayContextProvider.resolve(child);
      expect(context).toEqual({ packageId: 456 });
    });

    test('provides and resolves custom contexts', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      DisplayContextProvider.provide(element, {
        packageId: 789,
        customData: 'test'
      });

      const context = DisplayContextProvider.resolve(element);
      expect(context).toEqual({
        packageId: 789,
        customData: 'test'
      });
    });

    test('merges contexts correctly', () => {
      const parent = { packageId: 123, shippingMethodId: 'express' };
      const child = { packageId: 456, cartItemId: 'item-1' };

      const merged = DisplayContextProvider.merge(parent, child);
      expect(merged).toEqual({
        packageId: 456,
        shippingMethodId: 'express',
        cartItemId: 'item-1'
      });
    });
  });

  describe('Error Handling', () => {
    test('wraps synchronous functions with error boundaries', () => {
      const errorFn = () => {
        throw new Error('Test error');
      };

      const result = DisplayErrorBoundary.wrap(errorFn, 'fallback');
      expect(result).toBe('fallback');
    });

    test('wraps async functions with error boundaries', async () => {
      const errorFn = async () => {
        throw new Error('Async test error');
      };

      const result = await DisplayErrorBoundary.wrapAsync(errorFn, 'async fallback');
      expect(result).toBe('async fallback');
    });

    test('tries multiple strategies until one succeeds', () => {
      const strategies = [
        () => { throw new Error('Strategy 1 failed'); },
        () => { throw new Error('Strategy 2 failed'); },
        () => 'Strategy 3 succeeded'
      ];

      const result = DisplayErrorBoundary.tryStrategies(strategies, 'fallback');
      expect(result).toBe('Strategy 3 succeeded');
    });

    test('uses fallback when all strategies fail', () => {
      const strategies = [
        () => { throw new Error('Strategy 1 failed'); },
        () => { throw new Error('Strategy 2 failed'); }
      ];

      const result = DisplayErrorBoundary.tryStrategies(strategies, 'all failed');
      expect(result).toBe('all failed');
    });

    test('rate limits error logging', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Trigger same error multiple times
      for (let i = 0; i < 10; i++) {
        DisplayErrorBoundary.wrap(() => {
          throw new Error('Repeated error');
        }, null, { operation: 'test' });
      }

      // Should only log up to threshold
      expect(consoleSpy).toHaveBeenCalledTimes(5);
      consoleSpy.mockRestore();
    });
  });

  describe('ProductDisplayEnhancer', () => {
    test('handles missing package context gracefully', async () => {
      mockCampaignStore([
        { ref_id: 1, name: 'Product 1', price: '99.99' }
      ]);

      const element = createTestElement('package.savingsAmount');
      const enhancer = new ProductDisplayEnhancer(element);
      await enhancer.initialize();

      // Should show fallback value or empty
      expect(element.textContent).toBe('');
    });

    test('respects explicit format over auto-detection', async () => {
      mockCampaignStore([
        { ref_id: 1, name: 'Product 1', price: '99.99' }
      ]);

      const element = createTestElement('package.1.price', {
        'data-format': 'number'
      });
      const enhancer = new ProductDisplayEnhancer(element);
      await enhancer.initialize();

      // Should format as number, not currency
      expect(element.textContent).toBe('99.99');
      expect(element.textContent).not.toContain('$');
    });

    test('calculates savings correctly', async () => {
      mockCampaignStore([
        {
          ref_id: 1,
          name: 'Product 1',
          price: '80.00',
          price_retail: '100.00',
          price_total: '80.00',
          price_retail_total: '100.00',
          qty: 1
        }
      ]);

      const element = createTestElement('package.1.savingsAmount');
      const enhancer = new ProductDisplayEnhancer(element);
      await enhancer.initialize();

      expect(element.textContent).toBe('$20.00');
    });

    test('formats savings percentage correctly', async () => {
      mockCampaignStore([
        {
          ref_id: 1,
          name: 'Product 1',
          price: '75.00',
          price_retail: '100.00',
          price_total: '75.00',
          price_retail_total: '100.00',
          qty: 1
        }
      ]);

      const element = createTestElement('package.1.savingsPercentage');
      const enhancer = new ProductDisplayEnhancer(element);
      await enhancer.initialize();

      expect(element.textContent).toBe('25%');
    });
  });

  describe('CartDisplayEnhancer', () => {
    test('prevents double formatting of pre-formatted values', async () => {
      mockCartStore({
        totals: {
          total: {
            value: 123.45,
            formatted: '$123.45'
          },
          savings: {
            value: 20.00,
            formatted: '$20.00'
          }
        }
      });

      const element = createTestElement('cart.total');
      const enhancer = new CartDisplayEnhancer(element);
      await enhancer.initialize();

      expect(element.textContent).toBe('$123.45');
      expect(element.textContent).not.toBe('$$123.45');
    });

    test('uses raw values when needed', async () => {
      mockCartStore({
        totals: {
          subtotal: {
            value: 99.99,
            formatted: '$99.99'
          }
        }
      });

      const element = createTestElement('cart.subtotal.raw', {
        'data-format': 'number'
      });
      const enhancer = new CartDisplayEnhancer(element);
      await enhancer.initialize();

      expect(element.textContent).toBe('99.99');
    });
  });

  describe('Property Configuration', () => {
    test('applies validators to property values', async () => {
      mockCampaignStore([
        {
          ref_id: 1,
          name: 'Product 1',
          price: '100.00',
          price_retail: '90.00', // Invalid: retail less than regular
          price_total: '100.00',
          price_retail_total: '90.00',
          qty: 1,
          _calculated: {
            savingsAmount: -10 // Negative savings
          }
        }
      ]);

      const element = createTestElement('package.1.savingsAmount');
      const enhancer = new ProductDisplayEnhancer(element);
      await enhancer.initialize();

      // Validator should ensure non-negative value
      expect(element.textContent).toBe('$0.00');
    });

    test('uses fallback values when property is missing', async () => {
      mockCampaignStore([
        {
          ref_id: 1,
          name: 'Product 1',
          // Missing savings data
        }
      ]);

      const element = createTestElement('package.1.savingsPercentage');
      const enhancer = new ProductDisplayEnhancer(element);
      await enhancer.initialize();

      // Should use fallback value
      expect(element.textContent).toBe('0%');
    });
  });

  describe('Edge Cases', () => {
    test('handles deeply nested property paths', async () => {
      mockCartStore({
        customer: {
          shipping: {
            address: {
              components: {
                street: '123 Main St'
              }
            }
          }
        }
      });

      const element = createTestElement('cart.customer.shipping.address.components.street');
      const enhancer = new CartDisplayEnhancer(element);
      await enhancer.initialize();

      expect(element.textContent).toBe('123 Main St');
    });

    test('handles arrays in property paths', async () => {
      mockCartStore({
        items: [
          { name: 'Item 1', price: 10 },
          { name: 'Item 2', price: 20 }
        ]
      });

      const element = createTestElement('cart.items.1.price');
      const enhancer = new CartDisplayEnhancer(element);
      await enhancer.initialize();

      expect(element.textContent).toBe('$20.00');
    });

    test('handles mathematical transformations', async () => {
      mockCampaignStore([
        {
          ref_id: 1,
          price: '100.00',
          qty: 1
        }
      ]);

      const element = createTestElement('package.1.price', {
        'data-divide-by': '2'
      });
      const enhancer = new ProductDisplayEnhancer(element);
      await enhancer.initialize();

      expect(element.textContent).toBe('$50.00');
    });

    test('handles conditional visibility', async () => {
      mockCartStore({
        totals: {
          savings: {
            value: 0,
            formatted: '$0.00'
          }
        }
      });

      const element = createTestElement('cart.savingsAmount', {
        'data-hide-if-zero': 'true'
      });
      const enhancer = new CartDisplayEnhancer(element);
      await enhancer.initialize();

      expect(element.style.display).toBe('none');
      expect(element.classList.contains('display-hidden')).toBe(true);
    });
  });
});