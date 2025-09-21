/**
 * Cart Store - Zustand store for cart state management
 */

import { create } from 'zustand';
import { subscribeWithSelector, persist } from 'zustand/middleware';
import type { CartState, CartItem, CartTotals, DiscountDefinition, AppliedCoupon } from '@/types/global';
import { sessionStorageManager, CART_STORAGE_KEY } from '@/utils/storage';
import { EventBus } from '@/utils/events';
import { createLogger } from '@/utils/logger';
import { formatCurrency, formatPercentage } from '@/utils/currencyFormatter';

const logger = createLogger('CartStore');

interface CartActions {
  addItem: (item: Partial<CartItem> & { isUpsell: boolean | undefined }) => Promise<void>;
  removeItem: (packageId: number) => Promise<void>;
  updateQuantity: (packageId: number, quantity: number) => Promise<void>;
  swapPackage: (removePackageId: number, addItem: Partial<CartItem> & { isUpsell: boolean | undefined }) => Promise<void>;
  clear: () => Promise<void>;
  swapCart: (items: Array<{ packageId: number; quantity: number }>) => Promise<void>;
  syncWithAPI: () => Promise<void>;
  calculateTotals: () => void;
  calculateShipping: () => number;
  calculateTax: () => number;
  calculateEnrichedItems: () => Promise<void>;
  refreshItemPrices: () => Promise<void>;
  setShippingMethod: (methodId: number) => Promise<void>;
  hasItem: (packageId: number) => boolean;
  getItem: (packageId: number) => CartItem | undefined;
  getItemQuantity: (packageId: number) => number;
  getTotalWeight: () => number;
  getTotalItemCount: () => number;
  reset: () => void;
  setLastCurrency: (currency: string) => void;
  
  // Coupon methods
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: (code: string) => void;
  getCoupons: () => AppliedCoupon[];
  validateCoupon: (code: string) => { valid: boolean; message?: string };
  calculateDiscountAmount: (coupon: DiscountDefinition) => number;
}

const initialState: CartState = {
  items: [],
  subtotal: 0,
  shipping: 0,
  tax: 0,
  total: 0,
  totalQuantity: 0,
  isEmpty: true,
  appliedCoupons: [],
  enrichedItems: [],
  totals: {
    subtotal: { value: 0, formatted: '$0.00' },
    shipping: { value: 0, formatted: 'FREE' },
    tax: { value: 0, formatted: '$0.00' },
    discounts: { value: 0, formatted: '$0.00' },
    total: { value: 0, formatted: '$0.00' },
    totalExclShipping: { value: 0, formatted: '$0.00' },
    count: 0,
    isEmpty: true,
    savings: { value: 0, formatted: '$0.00' },
    savingsPercentage: { value: 0, formatted: '0%' },
    compareTotal: { value: 0, formatted: '$0.00' },
    hasSavings: false,
    totalSavings: { value: 0, formatted: '$0.00' },
    totalSavingsPercentage: { value: 0, formatted: '0%' },
    hasTotalSavings: false,
  },
};

const cartStoreInstance = create<CartState & CartActions>()(
  persist(
    subscribeWithSelector((set, get) => ({
      ...initialState,

      addItem: async (item: Partial<CartItem> & { isUpsell: boolean | undefined }) => {
        const { useCampaignStore } = await import('./campaignStore');
        const { useProfileStore } = await import('./profileStore');
        const campaignStore = useCampaignStore.getState();
        const profileStore = useProfileStore.getState();
        
        // Apply profile mapping if active (unless it's already a mapped ID)
        let finalPackageId = item.packageId ?? 0;
        if (!item.originalPackageId && profileStore.activeProfileId) {
          const mappedId = profileStore.getMappedPackageId(finalPackageId);
          if (mappedId !== finalPackageId) {
            logger.debug(`Applying profile mapping: ${finalPackageId} -> ${mappedId}`);
            finalPackageId = mappedId;
          }
        }
        
        // Get package data from campaign
        const packageData = campaignStore.getPackage(finalPackageId);
        
        if (!packageData) {
          throw new Error(`Package ${finalPackageId} not found in campaign data`);
        }
        
        set(state => {
          const newItem: CartItem = {
            id: Date.now(),
            packageId: finalPackageId,
            originalPackageId: item.originalPackageId || (finalPackageId !== (item.packageId ?? 0) ? item.packageId : undefined),
            quantity: item.quantity ?? 1,
            price: parseFloat(packageData.price_total), // Use total package price, not per-unit
            title: item.title ?? packageData.name,
            is_upsell: item.isUpsell ?? false,
            image: item.image ?? packageData.image ?? undefined,
            sku: item.sku ?? packageData.product_sku ?? undefined,
            // Add campaign response data for display
            price_per_unit: packageData.price,
            qty: packageData.qty,
            price_total: packageData.price_total,
            price_retail: packageData.price_retail,
            price_retail_total: packageData.price_retail_total,
            price_recurring: packageData.price_recurring,
            is_recurring: packageData.is_recurring,
            interval: packageData.interval,
            interval_count: packageData.interval_count,
            // Product and variant information
            productId: packageData.product_id,
            productName: packageData.product_name,
            variantId: packageData.product_variant_id,
            variantName: packageData.product_variant_name,
            variantAttributes: packageData.product_variant_attribute_values,
            variantSku: packageData.product_sku || undefined || undefined
          };
          
          // Console log for debugging upsell items
          if (item.isUpsell) {
            logger.debug(`Adding upsell item:`, {
              packageId: newItem.packageId,
              isUpsell: item.isUpsell,
              finalItemIsUpsell: newItem.is_upsell,
              itemData: newItem
            });
          }
          
          const existingIndex = state.items.findIndex(
            existing => existing.packageId === newItem.packageId
          );
          
          let newItems;
          if (existingIndex >= 0) {
            newItems = [...state.items];
            newItems[existingIndex]!.quantity += newItem.quantity;
          } else {
            newItems = [...state.items, newItem];
          }
          
          return { ...state, items: newItems };
        });
        
        // Calculate totals after state update
        get().calculateTotals();
        
        // Emit events for tracking
        const eventBus = EventBus.getInstance();
        eventBus.emit('cart:item-added', { 
          packageId: item.packageId ?? 0, 
          quantity: item.quantity ?? 1
        });
        eventBus.emit('cart:updated', get());
      },

      removeItem: async (packageId: number) => {
        const removedItem = get().items.find(item => item.packageId === packageId);
        
        set(state => {
          const newItems = state.items.filter(item => item.packageId !== packageId);
          return { ...state, items: newItems };
        });
        
        // Calculate totals after state update
        get().calculateTotals();
        
        // Emit events for tracking
        if (removedItem) {
          const eventBus = EventBus.getInstance();
          eventBus.emit('cart:item-removed', { 
            packageId, 
          });
          eventBus.emit('cart:updated', get());
        }
      },

      updateQuantity: async (packageId: number, quantity: number) => {
        if (quantity <= 0) {
          return get().removeItem(packageId);
        }
        
        const currentItem = get().items.find(item => item.packageId === packageId);
        const oldQuantity = currentItem?.quantity ?? 0;
        
        set(state => {
          const newItems = state.items.map(item =>
            item.packageId === packageId ? { ...item, quantity } : item
          );
          return { ...state, items: newItems };
        });
        
        // Calculate totals after state update
        get().calculateTotals();
        
        // Emit events for tracking
        if (currentItem) {
          const eventBus = EventBus.getInstance();
          eventBus.emit('cart:quantity-changed', { 
            packageId, 
            quantity,
            oldQuantity
          });
          eventBus.emit('cart:updated', get());
        }
      },


      swapPackage: async (removePackageId: number, addItem: Partial<CartItem> & { isUpsell: boolean | undefined }) => {
        const { useCampaignStore } = await import('./campaignStore');
        const { useProfileStore } = await import('./profileStore');
        const campaignStore = useCampaignStore.getState();
        const profileStore = useProfileStore.getState();

        // Apply profile mapping to both the package being removed and added
        let mappedRemovePackageId = removePackageId;
        if (profileStore.activeProfileId) {
          const mappedRemoveId = profileStore.getMappedPackageId(removePackageId);
          if (mappedRemoveId !== removePackageId) {
            logger.debug(`Applying profile mapping to remove package: ${removePackageId} -> ${mappedRemoveId}`);
            mappedRemovePackageId = mappedRemoveId;
          }
        }

        // Apply profile mapping to the new package
        let finalPackageId = addItem.packageId ?? 0;
        if (profileStore.activeProfileId) {
          const mappedId = profileStore.getMappedPackageId(finalPackageId);
          if (mappedId !== finalPackageId) {
            logger.debug(`Applying profile mapping in swapPackage: ${finalPackageId} -> ${mappedId}`);
            finalPackageId = mappedId;
          }
        }

        // Get package data from campaign
        const newPackageData = campaignStore.getPackage(finalPackageId);

        if (!newPackageData) {
          throw new Error(`Package ${finalPackageId} not found in campaign data`);
        }

        // Get the item being removed (using the mapped ID)
        const previousItem = get().items.find(item => item.packageId === mappedRemovePackageId);
        
        // Create the new item
        const newItem: CartItem = {
          id: Date.now(),
          packageId: finalPackageId,
          originalPackageId: finalPackageId !== (addItem.packageId ?? 0) ? (addItem.packageId ?? 0) : undefined,
          quantity: addItem.quantity ?? 1,
          price: parseFloat(newPackageData.price_total),
          title: addItem.title ?? newPackageData.name,
          is_upsell: addItem.isUpsell ?? false,
          image: addItem.image ?? newPackageData.image ?? undefined,
          sku: addItem.sku ?? newPackageData.product_sku ?? undefined,
          price_per_unit: newPackageData.price,
          qty: newPackageData.qty,
          price_total: newPackageData.price_total,
          price_retail: newPackageData.price_retail,
          price_retail_total: newPackageData.price_retail_total,
          price_recurring: newPackageData.price_recurring,
          is_recurring: newPackageData.is_recurring,
          interval: newPackageData.interval,
          interval_count: newPackageData.interval_count,
          // Product and variant information
          productId: newPackageData.product_id,
          productName: newPackageData.product_name,
          variantId: newPackageData.product_variant_id,
          variantName: newPackageData.product_variant_name,
          variantAttributes: newPackageData.product_variant_attribute_values,
          variantSku: newPackageData.product_sku || undefined
        };
        
        // Calculate price difference
        const priceDifference = newItem.price - (previousItem?.price ?? 0);
        
        // Perform atomic update
        set(state => {
          // Remove old item and add new item in single state update
          const newItems = state.items.filter(item => item.packageId !== mappedRemovePackageId);
          
          // Check if new package already exists
          const existingIndex = newItems.findIndex(
            existing => existing.packageId === newItem.packageId
          );
          
          if (existingIndex >= 0) {
            newItems[existingIndex]!.quantity += newItem.quantity;
          } else {
            newItems.push(newItem);
          }
          
          return { ...state, items: newItems, swapInProgress: false };
        });
        
        // Calculate totals after state update
        get().calculateTotals();
        
        // Emit single swap event
        const eventBus = EventBus.getInstance();
        const swapEvent: Parameters<typeof eventBus.emit<'cart:package-swapped'>>[1] = {
          previousPackageId: mappedRemovePackageId,
          newPackageId: finalPackageId,
          newItem,
          priceDifference,
          source: 'package-selector'
        };
        
        // Only include previousItem if it exists
        if (previousItem) {
          swapEvent.previousItem = previousItem;
        }
        
        eventBus.emit('cart:package-swapped', swapEvent);
        
        // Emit cart updated event
        eventBus.emit('cart:updated', get());
      },

      clear: async () => {
        set(state => ({
          ...state,
          items: [],
        }));
        
        // Calculate totals after state update
        get().calculateTotals();
      },

      swapCart: async (items: Array<{ packageId: number; quantity: number }>) => {
        const { useCampaignStore } = await import('./campaignStore');
        const { useProfileStore } = await import('./profileStore');
        const campaignStore = useCampaignStore.getState();
        const profileStore = useProfileStore.getState();
        const eventBus = EventBus.getInstance();

        logger.debug('Swapping cart with new items:', items);

        // Set swapInProgress flag to prevent auto-sync removal
        set(state => ({
          ...state,
          swapInProgress: true,
        }));
        
        // Build new items array
        const newItems: CartItem[] = [];
        
        for (const item of items) {
          // Apply profile mapping if active (unless originalPackageId is provided)
          let finalPackageId = item.packageId;
          let originalPackageId = (item as any).originalPackageId;

          // Only apply profile mapping if no originalPackageId was provided
          if (!originalPackageId && profileStore.activeProfileId) {
            const mappedId = profileStore.getMappedPackageId(finalPackageId);
            if (mappedId !== finalPackageId) {
              logger.debug(`Applying profile mapping: ${finalPackageId} -> ${mappedId}`);
              originalPackageId = finalPackageId;
              finalPackageId = mappedId;
            }
          }

          // Get package data from campaign
          const packageData = campaignStore.getPackage(finalPackageId);

          if (!packageData) {
            logger.warn(`Package ${finalPackageId} not found in campaign data, skipping`);
            logger.debug('Available packages:', campaignStore.data?.packages?.map(p => p.ref_id));
            continue;
          }

          logger.debug(`Package ${finalPackageId} found:`, packageData);

          const newItem: CartItem = {
            id: Date.now() + Math.random(), // Ensure unique IDs
            packageId: finalPackageId,
            originalPackageId: originalPackageId,
            title: packageData.name || `Package ${finalPackageId}`, // Use 'title' instead of 'name'
            price: parseFloat(packageData.price_total), // Use total package price, not per-unit
            price_retail: packageData.price_retail,
            quantity: item.quantity,
            is_upsell: (item as any).isUpsell || false, // Preserve isUpsell flag if provided
            image: packageData.image,
            sku: packageData.product_sku || undefined,
            qty: packageData.qty,
            price_total: packageData.price_total,
            price_retail_total: packageData.price_retail_total,
            price_per_unit: packageData.price,
            price_recurring: packageData.price_recurring,
            is_recurring: packageData.is_recurring,
            interval: packageData.interval,
            interval_count: packageData.interval_count,
            // Product and variant information
            productId: packageData.product_id,
            productName: packageData.product_name,
            variantId: packageData.product_variant_id,
            variantName: packageData.product_variant_name,
            variantAttributes: packageData.product_variant_attribute_values,
            variantSku: packageData.product_sku || undefined || undefined
          };

          newItems.push(newItem);
        }
        
        // Replace entire cart and clear swapInProgress flag
        set(state => ({
          ...state,
          items: newItems,
          swapInProgress: false,
        }));
        
        // Calculate totals after state update
        get().calculateTotals();

        // Emit cart updated event
        eventBus.emit('cart:updated', get());
        
        logger.info(`Cart swapped successfully with ${newItems.length} items`);
      },

      syncWithAPI: async () => {
        // TODO: Implement API sync
        logger.debug('syncWithAPI not yet implemented');
      },

      calculateTotals: async () => {
        try {
          // Import campaign store dynamically to avoid circular dependencies
          const { useCampaignStore } = await import('./campaignStore');
          const campaignState = useCampaignStore.getState();

        const state = get();
        // item.price is already the total package price, so just multiply by quantity of packages
        const subtotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalQuantity = state.items.reduce((sum, item) => sum + item.quantity, 0);
        const isEmpty = state.items.length === 0;
        
        // Currency formatting is handled by the centralized formatter
        
        // Calculate compare total (retail prices) - FIXED: Handle null values properly
        const compareTotal = state.items.reduce((sum, item) => {
          const packageData = campaignState.getPackage(item.packageId);
          // FIXED: Proper null handling for price_retail_total
          let retailTotal = 0;
          if (packageData?.price_retail_total) {
            retailTotal = parseFloat(packageData.price_retail_total);
          } else if (packageData?.price_total) {
            retailTotal = parseFloat(packageData.price_total);
          }
          return sum + (retailTotal * item.quantity);
        }, 0);
        
        // Calculate savings
        const savings = Math.max(0, compareTotal - subtotal);
        const savingsPercentage = compareTotal > 0 ? (savings / compareTotal) * 100 : 0;
        const hasSavings = savings > 0;
        
        const shipping = get().calculateShipping();
        const tax = get().calculateTax();
        
        // SINGLE SOURCE OF TRUTH: Dynamically calculate all coupon discounts
        let totalDiscounts = 0;
        const appliedCoupons = state.appliedCoupons || []; // Add safety check for undefined
        const updatedCoupons = appliedCoupons.map(appliedCoupon => {
          const discountAmount = get().calculateDiscountAmount(appliedCoupon.definition);
          totalDiscounts += discountAmount;
          return {
            ...appliedCoupon,
            discount: discountAmount
          };
        });
        
        // Update the applied coupons with recalculated discount amounts
        if (updatedCoupons.length > 0) {
          set(currentState => ({
            ...currentState,
            appliedCoupons: updatedCoupons
          }));
        }
        
        const total = subtotal + shipping + tax - totalDiscounts;
        const totalExclShipping = subtotal + tax - totalDiscounts; // Total without shipping
        
        // Calculate total savings (retail savings + discount coupons)
        const totalSavings = savings + totalDiscounts;
        const totalSavingsPercentage = compareTotal > 0 ? (totalSavings / compareTotal) * 100 : 0;
        const hasTotalSavings = totalSavings > 0;
        
        const totals: CartTotals = {
          subtotal: { value: subtotal, formatted: formatCurrency(subtotal) },
          shipping: { value: shipping, formatted: shipping === 0 ? 'FREE' : formatCurrency(shipping) },
          tax: { value: tax, formatted: formatCurrency(tax) },
          discounts: { value: totalDiscounts, formatted: formatCurrency(totalDiscounts) },
          total: { value: total, formatted: formatCurrency(total) },
          totalExclShipping: { value: totalExclShipping, formatted: formatCurrency(totalExclShipping) },
          count: totalQuantity,
          isEmpty,
          savings: { value: savings, formatted: formatCurrency(savings) },
          savingsPercentage: { value: savingsPercentage, formatted: formatPercentage(savingsPercentage) },
          compareTotal: { value: compareTotal, formatted: formatCurrency(compareTotal) },
          hasSavings,
          totalSavings: { value: totalSavings, formatted: formatCurrency(totalSavings) },
          totalSavingsPercentage: { value: totalSavingsPercentage, formatted: formatPercentage(totalSavingsPercentage) },
          hasTotalSavings,
        };
        
        set({
          subtotal,
          shipping,
          tax,
          total,
          totalQuantity,
          isEmpty,
          totals,
        });
        
        // Calculate enriched items after updating totals
        await get().calculateEnrichedItems();
        } catch (error) {
          console.error('Error calculating totals:', error);
          // Set safe defaults on error
          set({
            subtotal: 0,
            shipping: 0,
            tax: 0,
            total: 0,
            totalQuantity: 0,
            isEmpty: true,
            totals: {
              subtotal: { value: 0, formatted: '$0.00' },
              shipping: { value: 0, formatted: 'FREE' },
              tax: { value: 0, formatted: '$0.00' },
              discounts: { value: 0, formatted: '$0.00' },
              total: { value: 0, formatted: '$0.00' },
              totalExclShipping: { value: 0, formatted: '$0.00' },
              count: 0,
              isEmpty: true,
              savings: { value: 0, formatted: '$0.00' },
              savingsPercentage: { value: 0, formatted: '0%' },
              compareTotal: { value: 0, formatted: '$0.00' },
              hasSavings: false,
              totalSavings: { value: 0, formatted: '$0.00' },
              totalSavingsPercentage: { value: 0, formatted: '0%' },
              hasTotalSavings: false,
            }
          });
        }
      },

      hasItem: (packageId: number) => {
        const state = get();
        return state.items.some(item => item.packageId === packageId);
      },

      getItem: (packageId: number) => {
        const state = get();
        return state.items.find(item => item.packageId === packageId);
      },

      getItemQuantity: (packageId: number) => {
        const state = get();
        const item = state.items.find(item => item.packageId === packageId);
        return item?.quantity ?? 0;
      },

      calculateShipping: () => {
        const state = get();
        
        if (state.isEmpty || state.items.length === 0) {
          return 0;
        }

        // Only use explicitly set shipping method price, no automatic calculation
        if (state.shippingMethod) {
          return state.shippingMethod.price;
        }

        // Default to 0 if no shipping method is set
        return 0;
      },

      calculateTax: () => {
        return 0; // Tax calculation disabled
      },

      setShippingMethod: async (methodId: number) => {
        try {
          // Get campaign data to validate shipping method
          const { useCampaignStore } = await import('./campaignStore');
          const { useCheckoutStore } = await import('./checkoutStore');
          
          const campaignStore = useCampaignStore.getState();
          const checkoutStore = useCheckoutStore.getState();
          const campaignData = campaignStore.data;
          
          if (!campaignData?.shipping_methods) {
            throw new Error('No shipping methods available');
          }
          
          // Find the shipping method by ref_id
          const shippingMethod = campaignData.shipping_methods.find(
            method => method.ref_id === methodId
          );
          
          if (!shippingMethod) {
            throw new Error(`Shipping method ${methodId} not found`);
          }
          
          const price = parseFloat(shippingMethod.price || '0');
          
          // Update cart store
          set(state => ({
            ...state,
            shippingMethod: { 
              id: shippingMethod.ref_id, 
              name: shippingMethod.code, 
              price, 
              code: shippingMethod.code 
            }
          }));
          
          // Also update checkout store to keep in sync
          checkoutStore.setShippingMethod({
            id: shippingMethod.ref_id,
            name: shippingMethod.code,
            price: price,
            code: shippingMethod.code
          });
          
          // Recalculate totals with new shipping method
          get().calculateTotals();
          
          // Emit event
          const eventBus = EventBus.getInstance();
          eventBus.emit('shipping:method-changed', { 
            methodId,
            method: shippingMethod 
          });
          
        } catch (error) {
          console.error('Failed to set shipping method:', error);
          throw error;
        }
      },

      getTotalWeight: () => {
        const state = get();
        // Assume each item weighs 1 lb for simplicity
        return state.items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotalItemCount: () => {
        const state = get();
        return state.items.reduce((sum, item) => sum + item.quantity, 0);
      },

      calculateEnrichedItems: async () => {
        try {
          // Import stores dynamically to avoid circular dependencies
          // const { useConfigStore } = await import('./configStore'); - removed unused import
          const { useCampaignStore } = await import('./campaignStore');
          
          // const configState = useConfigStore.getState();
          const campaignState = useCampaignStore.getState();
          const state = get();
          
          // Currency is now handled by individual components via campaign/config stores
          
          // Use centralized formatter
          
          const enrichedItems = state.items.map(item => {
            const packageData = campaignState.getPackage(item.packageId);
            
            // FIXED: Use direct API values instead of double-dividing
            const actualUnitPrice = parseFloat(packageData?.price || '0'); // Direct per-unit price from API
            const retailUnitPrice = parseFloat(packageData?.price_retail || packageData?.price || '0'); // Direct per-unit retail from API
            
            // Package-level pricing (what's stored in cart)
            const packagePrice = item.price; // This is the total package price
            const lineTotal = packagePrice * item.quantity; // Total for this cart line
            
            // Retail comparison - FIXED: Handle null values properly
            let retailPackagePrice = 0;
            if (packageData?.price_retail_total) {
              retailPackagePrice = parseFloat(packageData.price_retail_total);
            } else if (packageData?.price_total) {
              retailPackagePrice = parseFloat(packageData.price_total);
            }
            const retailLineTotal = retailPackagePrice * item.quantity;
            
            // Savings calculations
            const unitSavings = Math.max(0, retailUnitPrice - actualUnitPrice);
            const lineSavings = Math.max(0, retailLineTotal - lineTotal);
            const savingsPct = retailUnitPrice > actualUnitPrice ? Math.round((unitSavings / retailUnitPrice) * 100) : 0;
            
            // FIXED: Trust API's is_recurring flag and handle recurring pricing properly
            const hasRecurring = packageData?.is_recurring === true;
            const recurringPrice = hasRecurring ? parseFloat(packageData?.price_recurring || '0') : 0;
            
            // Frequency text
            const frequencyText = hasRecurring ? 
              (packageData?.interval_count && packageData.interval_count > 1 ? 
                `Every ${packageData.interval_count} ${packageData.interval}s` : 
                `Per ${packageData.interval}`) : 'One time';
            
            return {
              id: item.id,
              packageId: item.packageId,
              quantity: item.quantity,
              price: {
                excl_tax: { value: actualUnitPrice, formatted: formatCurrency(actualUnitPrice) },
                incl_tax: { value: actualUnitPrice, formatted: formatCurrency(actualUnitPrice) },
                original: { value: retailUnitPrice, formatted: formatCurrency(retailUnitPrice) },
                savings: { value: unitSavings, formatted: formatCurrency(unitSavings) },
                recurring: { value: recurringPrice, formatted: formatCurrency(recurringPrice) },
                // Line totals
                lineTotal: { value: lineTotal, formatted: formatCurrency(lineTotal) },
                lineCompare: { value: retailLineTotal, formatted: formatCurrency(retailLineTotal) },
                lineSavings: { value: lineSavings, formatted: formatCurrency(lineSavings) },
                // Calculated fields
                savingsPct: { value: savingsPct, formatted: formatPercentage(savingsPct) },
              },
              product: {
                title: item.title || packageData?.name || '',
                sku: packageData?.external_id?.toString() || '',
                image: item.image || packageData?.image || '',
              },
              is_upsell: item.is_upsell ?? false,
              is_recurring: hasRecurring,
              interval: packageData?.interval || undefined,
              interval_count: packageData?.interval_count,
              frequency: frequencyText,
              is_bundle: false,
              bundleComponents: undefined,
              // Conditional flags for templates
              hasSavings: lineSavings > 0,
              hasComparePrice: retailUnitPrice > actualUnitPrice,
              showCompare: retailUnitPrice > actualUnitPrice ? 'show' : 'hide',
              showSavings: lineSavings > 0 ? 'show' : 'hide', 
              showRecurring: hasRecurring ? 'show' : 'hide',
            };
          });
          
          set({ enrichedItems: enrichedItems as any });
        } catch (error) {
          console.error('Error calculating enriched items:', error);
        }
      },

      // Coupon methods
      applyCoupon: async (code: string) => {
        const { useConfigStore } = await import('./configStore');
        const configState = useConfigStore.getState();
        const state = get();
        
        // Normalize code
        const normalizedCode = code.toUpperCase().trim();
        
        // Check if already applied
        if ((state.appliedCoupons || []).some(c => c.code === normalizedCode)) {
          return { success: false, message: 'Coupon already applied' };
        }
        
        // Get discount definition
        const discount = configState.discounts[normalizedCode];
        if (!discount) {
          return { success: false, message: 'Invalid coupon code' };
        }
        
        // Validate coupon
        const validation = get().validateCoupon(normalizedCode);
        if (!validation.valid) {
          return { success: false, message: validation.message || 'Coupon cannot be applied' };
        }
        
        // Apply coupon - store definition but calculate discount dynamically
        set(state => ({
          ...state,
          appliedCoupons: [...state.appliedCoupons, {
            code: normalizedCode,
            discount: 0, // Will be calculated dynamically in calculateTotals
            definition: discount
          }]
        }));
        
        // Recalculate totals
        get().calculateTotals();
        
        return { success: true, message: `Coupon ${normalizedCode} applied successfully` };
      },

      removeCoupon: (code: string) => {
        set(state => ({
          ...state,
          appliedCoupons: (state.appliedCoupons || []).filter(c => c.code !== code)
        }));
        
        // Recalculate totals
        get().calculateTotals();
      },

      getCoupons: () => {
        return get().appliedCoupons || [];
      },

      validateCoupon: (code: string) => {
        const state = get();
        // Use window config directly to avoid circular dependency issues
        const windowConfig = (window as any).nextConfig;
        if (!windowConfig?.discounts) {
          return { valid: false, message: 'No discounts configured' };
        }
        
        const discount = windowConfig.discounts[code];
        
        if (!discount) {
          return { valid: false, message: 'Invalid coupon code' };
        }
        
        // Check minimum order value
        if (discount.minOrderValue && state.subtotal < discount.minOrderValue) {
          return { valid: false, message: `Minimum order value of $${discount.minOrderValue} required` };
        }
        
        
        // Check if combinable with other coupons
        if (!discount.combinable && (state.appliedCoupons || []).length > 0) {
          return { valid: false, message: 'Cannot combine with other coupons' };
        }
        
        return { valid: true };
      },

      calculateDiscountAmount: (coupon: DiscountDefinition) => {
        const state = get();
        let discountAmount = 0;
        
        if (coupon.scope === 'order') {
          // Apply to entire order
          if (coupon.type === 'percentage') {
            discountAmount = state.subtotal * (coupon.value / 100);
            if (coupon.maxDiscount) {
              discountAmount = Math.min(discountAmount, coupon.maxDiscount);
            }
          } else {
            discountAmount = coupon.value;
          }
        } else if (coupon.scope === 'package' && coupon.packageIds) {
          // Apply to specific packages
          const eligibleTotal = state.items
            .filter(item => coupon.packageIds?.includes(item.packageId))
            .reduce((sum, item) => sum + (item.price * item.quantity), 0);
          
          if (coupon.type === 'percentage') {
            discountAmount = eligibleTotal * (coupon.value / 100);
            if (coupon.maxDiscount) {
              discountAmount = Math.min(discountAmount, coupon.maxDiscount);
            }
          } else {
            discountAmount = Math.min(coupon.value, eligibleTotal);
          }
        }
        
        // Ensure discount doesn't exceed subtotal
        return Math.min(discountAmount, state.subtotal);
      },

      refreshItemPrices: async () => {
        try {
          logger.info('Refreshing cart item prices with new currency data...');
          
          // Import campaign store to get updated package data
          const { useCampaignStore } = await import('./campaignStore');
          const campaignStore = useCampaignStore.getState();
          
          if (!campaignStore.data) {
            logger.warn('No campaign data available to refresh prices');
            return;
          }
          
          const state = get();
          
          // Update each item with new prices from campaign data
          const updatedItems = state.items.map(item => {
            const packageData = campaignStore.getPackage(item.packageId);

            if (!packageData) {
              logger.warn(`Package ${item.packageId} not found in campaign data`);
              return item;
            }

            // Update the item with new prices from the reloaded campaign data
            return {
              ...item,
              price: parseFloat(packageData.price_total), // Update package total price
              price_per_unit: packageData.price,
              price_total: packageData.price_total,
              price_retail: packageData.price_retail,
              price_retail_total: packageData.price_retail_total,
              price_recurring: packageData.price_recurring,
              // Keep other fields unchanged (quantity, title, etc.)
              // Preserve existing variant data or update if changed
              productId: item.productId ?? packageData.product_id,
              productName: item.productName ?? packageData.product_name,
              variantId: item.variantId ?? packageData.product_variant_id,
              variantName: item.variantName ?? packageData.product_variant_name,
              variantAttributes: item.variantAttributes ?? packageData.product_variant_attribute_values,
              variantSku: item.variantSku ?? packageData.product_sku
            };
          });
          
          // Also update shipping method price if one is selected
          let updatedShippingMethod = state.shippingMethod;
          if (updatedShippingMethod && campaignStore.data.shipping_methods) {
            const shippingMethodData = campaignStore.data.shipping_methods.find(
              method => method.ref_id === updatedShippingMethod!.id
            );
            
            if (shippingMethodData) {
              const newPrice = parseFloat(shippingMethodData.price || '0');
              updatedShippingMethod = {
                ...updatedShippingMethod,
                price: newPrice
              };
              logger.info(`Updated shipping method price: ${updatedShippingMethod.code} = ${newPrice} ${campaignStore.data.currency}`);
            }
          }
          
          // Update state with new items and shipping method
          set(state => {
            const updates: any = {
              ...state,
              items: updatedItems
            };
            if (updatedShippingMethod !== undefined) {
              updates.shippingMethod = updatedShippingMethod;
            }
            return updates;
          });
          
          logger.info('Cart item prices and shipping refreshed with new currency');
          
          // Recalculate totals with updated prices
          // Use setTimeout to ensure the state update completes first
          setTimeout(() => {
            get().calculateTotals();
          }, 0);
          
        } catch (error) {
          logger.error('Failed to refresh item prices:', error);
        }
      },

      reset: () => {
        set(initialState);
      },

      setLastCurrency: (currency: string) => {
        set({ lastCurrency: currency });
      },
    })),
    {
      name: CART_STORAGE_KEY,
      storage: {
        getItem: (name: string) => {
          const value = sessionStorageManager.get<any>(name);
          return value;
        },
        setItem: (name: string, value: any) => {
          sessionStorageManager.set(name, value);
        },
        removeItem: (name: string) => {
          sessionStorageManager.remove(name);
        },
      },
      onRehydrateStorage: () => (state) => {
        // Recalculate totals after rehydration to ensure discounts are properly calculated
        if (state) {
          logger.debug('Cart store rehydrated, recalculating totals...');
          state.calculateTotals();
        }
      },
      partialize: (state) => ({
        items: state.items,
        appliedCoupons: state.appliedCoupons,
        subtotal: state.subtotal,
        shipping: state.shipping,
        shippingMethod: state.shippingMethod, // Include shipping method to persist selection
        tax: state.tax,
        total: state.total,
        totalQuantity: state.totalQuantity,
        isEmpty: state.isEmpty,
        totals: state.totals,
        enrichedItems: [], // Include but keep empty - will be recalculated
      }),
    }
  )
);

export const cartStore = cartStoreInstance;
export const useCartStore = cartStoreInstance;