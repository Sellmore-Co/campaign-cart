/**
 * Conditional Display Enhancer
 * Shows/hides elements based on cart state and other conditions
 * 
 * Note: Uses shared PropertyResolver infrastructure for consistent property access
 * while maintaining its unique BaseEnhancer inheritance (visibility vs content display)
 */

import { BaseEnhancer } from '../base/BaseEnhancer';
import { AttributeParser } from '../base/AttributeParser';
import { PropertyResolver } from './DisplayEnhancerCore';
import { getPropertyConfig } from './DisplayEnhancerTypes';
import { PackageContextResolver } from '@/utils/dom/PackageContextResolver';
import { PriceCalculator } from '@/utils/calculations/PriceCalculator';
import { useCartStore } from '@/stores/cartStore';
import { useCampaignStore } from '@/stores/campaignStore';
import { useOrderStore } from '@/stores/orderStore';
import { useProfileStore } from '@/stores/profileStore';
import { useParameterStore } from '@/stores/parameterStore';
import type { CartState } from '@/types/global';
import type { Package } from '@/types/campaign';

export class ConditionalDisplayEnhancer extends BaseEnhancer {
  private condition: any;
  private showCondition!: boolean;
  private packageContext: number | null = null;
  private selectorId: string | null = null;
  private dependsOnCart: boolean = false;
  private dependsOnPackage: boolean = false;
  private dependsOnSelection: boolean = false;
  private dependsOnOrder: boolean = false;
  private dependsOnShipping: boolean = false;
  private dependsOnProfile: boolean = false;
  private dependsOnParams: boolean = false;
  private profileId: string | null = null;
  private selectionChangeHandler: ((event: any) => void) | null = null;

  public async initialize(): Promise<void> {
    // Log initialization for debugging
    const showAttr = this.element.getAttribute('data-next-show');
    const hideAttr = this.element.getAttribute('data-next-hide');
    this.logger.info('ConditionalDisplayEnhancer initializing:', {
      element: this.element.tagName,
      class: this.element.className,
      showAttr,
      hideAttr,
      hasParams: window.location.search
    });

    this.validateElement();
    
    // Detect package context using PackageContextResolver
    const packageId = PackageContextResolver.findPackageId(this.element);
    this.packageContext = packageId !== undefined ? packageId : null;
    
    // Detect selector context
    this.selectorId = this.detectSelectorContext();
    
    // Check for profile-specific attributes first
    const showIfProfileAttr = this.getAttribute('data-next-show-if-profile');
    const hideIfProfileAttr = this.getAttribute('data-next-hide-if-profile');
    
    if (showIfProfileAttr) {
      this.profileId = showIfProfileAttr;
      this.showCondition = true;
      this.dependsOnProfile = true;
    } else if (hideIfProfileAttr) {
      this.profileId = hideIfProfileAttr;
      this.showCondition = false;
      this.dependsOnProfile = true;
    } else {
      // Determine if this is a show or hide condition
      const showAttr = this.getAttribute('data-next-show');
      const hideAttr = this.getAttribute('data-next-hide');
    
      if (showAttr) {
        this.condition = AttributeParser.parseCondition(showAttr);
        this.showCondition = true;
      } else if (hideAttr) {
        this.condition = AttributeParser.parseCondition(hideAttr);
        this.showCondition = false;
      } else {
        throw new Error('Either data-next-show, data-next-hide, data-next-show-if-profile, or data-next-hide-if-profile is required');
      }
    }
    
    // Determine what this condition depends on (if not profile-based from attributes)
    if (!this.dependsOnProfile && this.condition) {
      this.analyzeDependencies();

      // Debug logging for condition analysis
      this.logger.debug('Condition analysis:', {
        condition: this.condition,
        dependsOnParams: this.dependsOnParams,
        dependsOnCart: this.dependsOnCart,
        dependsOnProfile: this.dependsOnProfile
      });
    }
    
    // Subscribe only to relevant state changes
    if (this.dependsOnCart) {
      this.subscribe(useCartStore, this.handleStateUpdate.bind(this));
    }
    
    if (this.dependsOnPackage) {
      this.subscribe(useCampaignStore, this.handleCampaignUpdate.bind(this));
    }
    
    if (this.dependsOnSelection) {
      this.selectionChangeHandler = this.handleSelectionChange.bind(this);
      this.eventBus.on('selector:selection-changed', this.selectionChangeHandler);
      this.eventBus.on('selector:item-selected', this.selectionChangeHandler);
    }
    
    if (this.dependsOnOrder) {
      this.subscribe(useOrderStore, this.handleOrderUpdate.bind(this));
    }
    
    if (this.dependsOnShipping) {
      this.subscribe(useCampaignStore, this.handleShippingUpdate.bind(this));
    }
    
    if (this.dependsOnProfile) {
      this.subscribe(useProfileStore, this.handleProfileUpdate.bind(this));

      // Also listen for profile events to handle URL parameter application
      this.eventBus.on('profile:applied', () => {
        this.handleProfileUpdate(useProfileStore.getState());
      });
      this.eventBus.on('profile:reverted', () => {
        this.handleProfileUpdate(useProfileStore.getState());
      });
      this.eventBus.on('profile:switched', () => {
        this.handleProfileUpdate(useProfileStore.getState());
      });

      // Listen for SDK URL parameters processed event
      // This ensures we re-evaluate after profiles are applied from URL
      this.eventBus.on('sdk:url-parameters-processed', () => {
          this.handleProfileUpdate(useProfileStore.getState());
      });
    }

    if (this.dependsOnParams) {
      this.subscribe(useParameterStore, this.handleParamsUpdate.bind(this));

      // Also listen for URL parameter updates
      this.eventBus.on('sdk:url-parameters-processed', () => {
        this.handleParamsUpdate(useParameterStore.getState());
      });
    }
    
    // Initial update - force immediate evaluation with current state
    // This ensures we get the correct state even after rehydration
    await new Promise(resolve => setTimeout(resolve, 0)); // Allow stores to fully initialize
    
    // Initial evaluation based on current dependency
    if (this.dependsOnProfile) {
      this.handleProfileUpdate(useProfileStore.getState());
    } else if (this.dependsOnParams) {
      this.handleParamsUpdate(useParameterStore.getState());
    } else if (this.dependsOnCart) {
      this.handleStateUpdate(useCartStore.getState());
    } else if (this.dependsOnPackage) {
      this.handlePackageUpdate();
    } else if (this.dependsOnSelection) {
      this.handleSelectionUpdate();
    } else if (this.dependsOnOrder) {
      this.handleOrderUpdate(useOrderStore.getState());
    } else if (this.dependsOnShipping) {
      this.handleShippingUpdate();
    }
    
  }

  public update(): void {
    if (this.dependsOnCart) {
      this.handleStateUpdate(useCartStore.getState());
    } else if (this.dependsOnPackage) {
      this.handlePackageUpdate();
    } else if (this.dependsOnSelection) {
      this.handleSelectionUpdate();
    } else if (this.dependsOnOrder) {
      this.handleOrderUpdate(useOrderStore.getState());
    } else if (this.dependsOnProfile) {
      this.handleProfileUpdate(useProfileStore.getState());
    } else if (this.dependsOnParams) {
      this.handleParamsUpdate(useParameterStore.getState());
    }
  }

  private analyzeDependencies(): void {
    this.dependsOnCart = this.conditionDependsOnCart(this.condition);
    this.dependsOnPackage = this.conditionDependsOnPackage(this.condition);
    this.dependsOnSelection = this.conditionDependsOnSelection(this.condition);
    this.dependsOnOrder = this.conditionDependsOnOrder(this.condition);
    this.dependsOnShipping = this.conditionDependsOnShipping(this.condition);
    this.dependsOnProfile = this.conditionDependsOnProfile(this.condition);
    this.dependsOnParams = this.conditionDependsOnParams(this.condition);

    // If no dependency is detected, default to cart for backward compatibility
    if (!this.dependsOnCart && !this.dependsOnPackage && !this.dependsOnSelection && !this.dependsOnOrder && !this.dependsOnShipping && !this.dependsOnProfile && !this.dependsOnParams) {
      this.dependsOnCart = true;
    }
  }

  private conditionDependsOnCart(condition: any): boolean {
    switch (condition.type) {
      case 'property':
        return condition.object === 'cart';
      
      case 'function':
        return condition.object === 'cart';
      
      case 'comparison':
        return condition.left.object === 'cart' || 
               (condition.right && typeof condition.right === 'object' && condition.right.object === 'cart');
      
      default:
        return false;
    }
  }

  private conditionDependsOnPackage(condition: any): boolean {
    switch (condition.type) {
      case 'property':
        return condition.object === 'package';
      
      case 'function':
        return condition.object === 'package';
      
      case 'comparison':
        return condition.left.object === 'package' || 
               (condition.right && typeof condition.right === 'object' && condition.right.object === 'package');
      
      default:
        return false;
    }
  }

  private conditionDependsOnSelection(condition: any): boolean {
    switch (condition.type) {
      case 'property':
        return condition.object === 'selection' || 
               (condition.object && condition.object.startsWith('selection.'));
      
      case 'function':
        return condition.object === 'selection' || 
               (condition.object && condition.object.startsWith('selection.'));
      
      case 'comparison':
        const leftIsSelection = condition.left.object === 'selection' || 
                               (condition.left.object && condition.left.object.startsWith('selection.'));
        const rightIsSelection = condition.right && typeof condition.right === 'object' && 
                                (condition.right.object === 'selection' || 
                                 (condition.right.object && condition.right.object.startsWith('selection.')));
        return leftIsSelection || rightIsSelection;
      
      default:
        return false;
    }
  }

  private conditionDependsOnOrder(condition: any): boolean {
    switch (condition.type) {
      case 'property':
        return condition.object === 'order';
      
      case 'function':
        return condition.object === 'order';
      
      case 'comparison':
        return condition.left.object === 'order' || 
               (condition.right && typeof condition.right === 'object' && condition.right.object === 'order');
      
      default:
        return false;
    }
  }

  private conditionDependsOnShipping(condition: any): boolean {
    switch (condition.type) {
      case 'property':
        return condition.object === 'shipping';
      
      case 'function':
        return condition.object === 'shipping';
      
      case 'comparison':
        return condition.left.object === 'shipping' || 
               (condition.right && typeof condition.right === 'object' && condition.right.object === 'shipping');
      
      default:
        return false;
    }
  }

  private conditionDependsOnProfile(condition: any): boolean {
    if (!condition) return false;

    switch (condition.type) {
      case 'property':
        return condition.object === 'profile';

      case 'function':
        return condition.object === 'profile';

      case 'comparison':
        return (condition.left && condition.left.object === 'profile') ||
               (condition.right && typeof condition.right === 'object' && condition.right.object === 'profile');

      default:
        return false;
    }
  }

  private conditionDependsOnParams(condition: any): boolean {
    if (!condition) return false;

    this.logger.debug('Checking if condition depends on params:', {
      condition,
      type: condition.type,
      leftObject: condition.left?.object,
      rightObject: condition.right?.object
    });

    switch (condition.type) {
      case 'property':
        return condition.object === 'param' || condition.object === 'params';

      case 'function':
        return condition.object === 'param' || condition.object === 'params';

      case 'comparison':
        const dependsOnParams = (condition.left && (condition.left.object === 'param' || condition.left.object === 'params')) ||
               (condition.right && typeof condition.right === 'object' &&
                (condition.right.object === 'param' || condition.right.object === 'params'));

        this.logger.debug('Comparison depends on params:', dependsOnParams);
        return dependsOnParams;

      default:
        return false;
    }
  }

  private handleCampaignUpdate(): void {
    // Campaign data changed, re-evaluate package conditions
    if (this.dependsOnPackage) {
      this.handlePackageUpdate();
    }
  }

  private handleOrderUpdate(orderState: any): void {
    try {
      const conditionMet = this.evaluateOrderCondition(orderState);
      const shouldShow = this.showCondition ? conditionMet : !conditionMet;
      
      // Update element visibility
      this.element.style.display = shouldShow ? '' : 'none';
      
      // Add conditional classes
      this.toggleClass('next-condition-met', conditionMet);
      this.toggleClass('next-condition-not-met', !conditionMet);
      this.toggleClass('next-visible', shouldShow);
      this.toggleClass('next-hidden', !shouldShow);
      
    } catch (error) {
      this.handleError(error, 'handleOrderUpdate');
    }
  }

  private handlePackageUpdate(): void {
    try {
      const conditionMet = this.evaluatePackageCondition();
      const shouldShow = this.showCondition ? conditionMet : !conditionMet;
      
      // Update element visibility
      this.element.style.display = shouldShow ? '' : 'none';
      
      // Add conditional classes
      this.toggleClass('next-condition-met', conditionMet);
      this.toggleClass('next-condition-not-met', !conditionMet);
      this.toggleClass('next-visible', shouldShow);
      this.toggleClass('next-hidden', !shouldShow);
      
    } catch (error) {
      this.handleError(error, 'handlePackageUpdate');
    }
  }

  private handleShippingUpdate(): void {
    try {
      const conditionMet = this.evaluateShippingCondition();
      const shouldShow = this.showCondition ? conditionMet : !conditionMet;
      
      // Update element visibility
      this.element.style.display = shouldShow ? '' : 'none';
      
      // Add conditional classes
      this.toggleClass('next-condition-met', conditionMet);
      this.toggleClass('next-condition-not-met', !conditionMet);
      this.toggleClass('next-visible', shouldShow);
      this.toggleClass('next-hidden', !shouldShow);
      
    } catch (error) {
      this.handleError(error, 'handleShippingUpdate');
    }
  }

  private handleProfileUpdate(profileState: any): void {
    try {

      // For profile-specific attributes, check if the active profile matches
      let conditionMet = false;

      if (this.profileId) {
        // Simple profile ID check for data-next-show-if-profile / data-next-hide-if-profile
        conditionMet = profileState.activeProfileId === this.profileId;
      } else if (this.condition) {
        // Complex profile condition (e.g., profile.active === 'vip')
        conditionMet = this.evaluateProfileCondition(profileState);
      }

      const shouldShow = this.showCondition ? conditionMet : !conditionMet;

      // Update element visibility
      this.element.style.display = shouldShow ? '' : 'none';

      // Add conditional classes
      this.toggleClass('next-condition-met', conditionMet);
      this.toggleClass('next-condition-not-met', !conditionMet);
      this.toggleClass('next-visible', shouldShow);
      this.toggleClass('next-hidden', !shouldShow);
      this.toggleClass('next-profile-active', conditionMet && this.profileId !== null);

    } catch (error) {
      this.handleError(error, 'handleProfileUpdate');
    }
  }

  private handleParamsUpdate(paramState: any): void {
    try {
      const conditionMet = this.evaluateParamsCondition(paramState);
      const shouldShow = this.showCondition ? conditionMet : !conditionMet;

      // Debug logging
      this.logger.debug('handleParamsUpdate:', {
        condition: this.condition,
        showCondition: this.showCondition,
        conditionMet,
        shouldShow,
        params: paramState.params,
        element: this.element.outerHTML.substring(0, 100)
      });

      // Update element visibility
      this.element.style.display = shouldShow ? '' : 'none';

      // Add conditional classes
      this.toggleClass('next-condition-met', conditionMet);
      this.toggleClass('next-condition-not-met', !conditionMet);
      this.toggleClass('next-visible', shouldShow);
      this.toggleClass('next-hidden', !shouldShow);

    } catch (error) {
      this.handleError(error, 'handleParamsUpdate');
    }
  }

  private evaluatePackageCondition(): boolean {
    try {
      switch (this.condition.type) {
        case 'property':
          return this.evaluatePackageProperty(this.condition);
        
        case 'comparison':
          return this.evaluatePackageComparison(this.condition);
        
        default:
          this.logger.warn(`Unsupported condition type for package: ${this.condition.type}`);
          return false;
      }
    } catch (error) {
      this.logger.error('Error evaluating package condition:', error);
      return false;
    }
  }

  private evaluateOrderCondition(orderState: any): boolean {
    try {
      switch (this.condition.type) {
        case 'property':
          return this.evaluateOrderProperty(orderState, this.condition);
        
        case 'comparison':
          return this.evaluateOrderComparison(orderState, this.condition);
        
        default:
          this.logger.warn(`Unsupported condition type for order: ${this.condition.type}`);
          return false;
      }
    } catch (error) {
      this.logger.error('Error evaluating order condition:', error);
      return false;
    }
  }

  private evaluatePackageProperty(condition: any): boolean {
    const value = this.getPackagePropertyValue(condition.property);
    return Boolean(value);
  }

  private evaluatePackageComparison(condition: any): boolean {
    const leftValue = this.getPackagePropertyValue(condition.left.property);
    const rightValue = condition.right;
    
    switch (condition.operator) {
      case '>':
        return Number(leftValue) > Number(rightValue);
      case '>=':
        return Number(leftValue) >= Number(rightValue);
      case '<':
        return Number(leftValue) < Number(rightValue);
      case '<=':
        return Number(leftValue) <= Number(rightValue);
      case '==':
      case '===':
        return leftValue === rightValue;
      case '!=':
      case '!==':
        return leftValue !== rightValue;
      default:
        return false;
    }
  }

  private evaluateOrderProperty(orderState: any, condition: any): boolean {
    const value = this.getOrderPropertyValue(orderState, condition.property);
    return Boolean(value);
  }

  private evaluateOrderComparison(orderState: any, condition: any): boolean {
    const leftValue = this.getOrderPropertyValue(orderState, condition.left.property);
    const rightValue = condition.right;
    
    switch (condition.operator) {
      case '>':
        return Number(leftValue) > Number(rightValue);
      case '>=':
        return Number(leftValue) >= Number(rightValue);
      case '<':
        return Number(leftValue) < Number(rightValue);
      case '<=':
        return Number(leftValue) <= Number(rightValue);
      case '==':
      case '===':
        return leftValue === rightValue;
      case '!=':
      case '!==':
        return leftValue !== rightValue;
      default:
        return false;
    }
  }

  private handleStateUpdate(cartState: CartState): void {
    try {
      const conditionMet = this.evaluateCondition(cartState);
      const shouldShow = this.showCondition ? conditionMet : !conditionMet;
      
      // Update element visibility
      this.element.style.display = shouldShow ? '' : 'none';
      
      // Add conditional classes
      this.toggleClass('next-condition-met', conditionMet);
      this.toggleClass('next-condition-not-met', !conditionMet);
      this.toggleClass('next-visible', shouldShow);
      this.toggleClass('next-hidden', !shouldShow);
      
    } catch (error) {
      this.handleError(error, 'handleStateUpdate');
    }
  }

  private evaluateCondition(cartState: CartState): boolean {
    try {
      switch (this.condition.type) {
        case 'property':
          return this.evaluateProperty(cartState, this.condition);
        
        case 'function':
          return this.evaluateFunction(cartState, this.condition);
        
        case 'comparison':
          return this.evaluateComparison(cartState, this.condition);
        
        default:
          this.logger.warn(`Unknown condition type: ${this.condition.type}`);
          return false;
      }
    } catch (error) {
      this.logger.error('Error evaluating condition:', error);
      return false;
    }
  }

  private detectSelectorContext(): string | null {
    // First check the parsed condition for embedded selector ID
    if (this.condition) {
      // For property conditions
      if (this.condition.property && this.condition.property.includes('.')) {
        const parts = this.condition.property.split('.');
        if (parts.length >= 2) {
          this.logger.debug('Found selector ID in property:', parts[0]);
          return parts[0];
        }
      }
      
      // For comparison conditions, check left side
      if (this.condition.left && this.condition.left.property && this.condition.left.property.includes('.')) {
        const parts = this.condition.left.property.split('.');
        if (parts.length >= 2) {
          this.logger.debug('Found selector ID in comparison:', parts[0]);
          return parts[0];
        }
      }
    }
    
    // Check for explicit selector ID attribute
    const explicitId = this.getAttribute('data-next-selector-id') || 
                      this.getAttribute('data-selector-id');
    if (explicitId) return explicitId;
    
    // Search up the DOM tree for selector context
    let current: HTMLElement | null = this.element;
    
    while (current) {
      const selectorId = current.getAttribute('data-next-selector-id');
      if (selectorId) return selectorId;
      
      // Check if this is a selector element itself
      if (current.hasAttribute('data-next-cart-selector')) {
        return current.getAttribute('data-next-selector-id') || 
               current.getAttribute('data-next-id') || null;
      }
      
      current = current.parentElement;
    }
    
    return null;
  }

  private handleSelectionChange(event: any): void {
    // Only handle events for our selector
    if (this.selectorId && event.selectorId !== this.selectorId) return;
    
    this.handleSelectionUpdate();
  }

  private handleSelectionUpdate(): void {
    try {
      const conditionMet = this.evaluateSelectionCondition();
      const shouldShow = this.showCondition ? conditionMet : !conditionMet;
      
      // Update element visibility
      this.element.style.display = shouldShow ? '' : 'none';
      
      // Add conditional classes
      this.toggleClass('next-condition-met', conditionMet);
      this.toggleClass('next-condition-not-met', !conditionMet);
      this.toggleClass('next-visible', shouldShow);
      this.toggleClass('next-hidden', !shouldShow);
      
    } catch (error) {
      this.handleError(error, 'handleSelectionUpdate');
    }
  }

  private evaluateSelectionCondition(): boolean {
    try {
      switch (this.condition.type) {
        case 'property':
          return this.evaluateSelectionProperty(this.condition);
        
        case 'comparison':
          return this.evaluateSelectionComparison(this.condition);
        
        default:
          this.logger.warn(`Unsupported condition type for selection: ${this.condition.type}`);
          return false;
      }
    } catch (error) {
      this.logger.error('Error evaluating selection condition:', error);
      return false;
    }
  }

  private evaluateShippingCondition(): boolean {
    try {
      switch (this.condition.type) {
        case 'property':
          return this.evaluateShippingProperty(this.condition);
        
        case 'comparison':
          return this.evaluateShippingComparison(this.condition);
        
        default:
          this.logger.warn(`Unsupported condition type for shipping: ${this.condition.type}`);
          return false;
      }
    } catch (error) {
      this.logger.error('Error evaluating shipping condition:', error);
      return false;
    }
  }

  private evaluateProfileCondition(profileState: any): boolean {
    try {

      switch (this.condition.type) {
        case 'property':
          // Handle profile.active or profile.isActive
          if (this.condition.property === 'active' || this.condition.property === 'isActive') {
            return Boolean(profileState.activeProfileId);
          }
          // Handle profile.id
          if (this.condition.property === 'id') {
            return profileState.activeProfileId || '';
          }
          return false;

        case 'comparison':
          // Handle profile.active === 'profile_id'
          if (this.condition.left.object === 'profile' &&
              (this.condition.left.property === 'active' || this.condition.left.property === 'id')) {
            const activeProfile = profileState.activeProfileId || '';
            const compareValue = this.condition.right;

            switch (this.condition.operator) {
              case '===':
              case '==':
                return activeProfile === compareValue;
              case '!==':
              case '!=':
                return activeProfile !== compareValue;
              default:
                return false;
            }
          }
          return false;

        case 'function':
          // Handle profile.is('profile_id')
          if (this.condition.method === 'is') {
            const profileId = this.condition.args[0];
            return profileState.activeProfileId === profileId;
          }
          // Handle profile.has('profile_id')
          if (this.condition.method === 'has') {
            const profileId = this.condition.args[0];
            return profileState.profiles.has(profileId);
          }
          return false;

        default:
          this.logger.warn(`Unsupported condition type for profile: ${this.condition.type}`);
          return false;
      }
    } catch (error) {
      this.logger.error('Error evaluating profile condition:', error);
      return false;
    }
  }

  private evaluateParamsCondition(paramState: any): boolean {
    try {
      switch (this.condition.type) {
        case 'property':
          // param.seen would check if 'seen' parameter exists
          return paramState.hasParam(this.condition.property);

        case 'comparison':
          // param.seen == 'n' would check the value
          const paramValue = String(paramState.getParam(this.condition.left.property) || '');
          const compareValue = String(this.condition.right); // Ensure string comparison

          this.logger.info('evaluateParamsCondition comparison:', {
            condition: this.condition,
            property: this.condition.left.property,
            paramValue,
            compareValue,
            operator: this.condition.operator,
            willMatch: paramValue === compareValue,
            paramValueType: typeof paramValue,
            compareValueType: typeof compareValue,
            allParams: paramState.params
          });

          switch (this.condition.operator) {
            case '===':
            case '==':
              return paramValue === compareValue;
            case '!==':
            case '!=':
              return paramValue !== compareValue;
            case '>':
              return Number(paramValue) > Number(compareValue);
            case '>=':
              return Number(paramValue) >= Number(compareValue);
            case '<':
              return Number(paramValue) < Number(compareValue);
            case '<=':
              return Number(paramValue) <= Number(compareValue);
            default:
              return false;
          }

        case 'function':
          // Handle param.has('seen') or param.exists('seen')
          if (this.condition.method === 'has' || this.condition.method === 'exists') {
            const paramName = this.condition.args[0];
            return paramState.hasParam(paramName);
          }
          // Handle param.is('seen', 'n')
          if (this.condition.method === 'is' || this.condition.method === 'equals') {
            const paramName = this.condition.args[0];
            const expectedValue = String(this.condition.args[1]);
            const actualValue = paramState.getParam(paramName) || '';
            return actualValue === expectedValue;
          }
          return false;

        default:
          this.logger.warn(`Unsupported condition type for params: ${this.condition.type}`);
          return false;
      }
    } catch (error) {
      this.logger.error('Error evaluating params condition:', error);
      return false;
    }
  }

  private evaluateSelectionProperty(condition: any): boolean {
    const value = this.getSelectionPropertyValue(condition.property);
    return Boolean(value);
  }

  private evaluateSelectionComparison(condition: any): boolean {
    const leftValue = this.getSelectionPropertyValue(condition.left.property);
    const rightValue = condition.right;
    
    switch (condition.operator) {
      case '>':
        return Number(leftValue) > Number(rightValue);
      case '>=':
        return Number(leftValue) >= Number(rightValue);
      case '<':
        return Number(leftValue) < Number(rightValue);
      case '<=':
        return Number(leftValue) <= Number(rightValue);
      case '==':
      case '===':
        return leftValue === rightValue;
      case '!=':
      case '!==':
        return leftValue !== rightValue;
      default:
        return false;
    }
  }

  private evaluateShippingProperty(condition: any): boolean {
    const value = this.getShippingPropertyValue(condition.property);
    return Boolean(value);
  }

  private evaluateShippingComparison(condition: any): boolean {
    const leftValue = this.getShippingPropertyValue(condition.left.property);
    const rightValue = condition.right;
    
    switch (condition.operator) {
      case '>':
        return Number(leftValue) > Number(rightValue);
      case '>=':
        return Number(leftValue) >= Number(rightValue);
      case '<':
        return Number(leftValue) < Number(rightValue);
      case '<=':
        return Number(leftValue) <= Number(rightValue);
      case '==':
      case '===':
        return leftValue === rightValue;
      case '!=':
      case '!==':
        return leftValue !== rightValue;
      default:
        return false;
    }
  }

  private evaluateProperty(cartState: CartState, condition: any): boolean {
    const value = this.getPropertyValue(cartState, condition.object, condition.property);
    return Boolean(value);
  }

  private evaluateFunction(cartState: CartState, condition: any): boolean {
    const { object, method, args } = condition;
    
    if (object === 'cart') {
      switch (method) {
        case 'hasItem':
          if (args.length > 0) {
            const packageId = args[0];
            return cartState.items.some(item => item.packageId === packageId);
          }
          return false;
        
        case 'hasItems':
          return !cartState.isEmpty;
        
        default:
          this.logger.warn(`Unknown cart method: ${method}`);
          return false;
      }
    }
    
    return false;
  }

  private evaluateComparison(cartState: CartState, condition: any): boolean {
    const leftValue = this.getPropertyValue(cartState, condition.left.object, condition.left.property);
    const rightValue = condition.right;
    
    switch (condition.operator) {
      case '>':
        return Number(leftValue) > Number(rightValue);
      case '>=':
        return Number(leftValue) >= Number(rightValue);
      case '<':
        return Number(leftValue) < Number(rightValue);
      case '<=':
        return Number(leftValue) <= Number(rightValue);
      case '==':
      case '===':
        return leftValue === rightValue;
      case '!=':
      case '!==':
        return leftValue !== rightValue;
      default:
        return false;
    }
  }

  private getPropertyValue(cartState: CartState, object: string, property: string): any {
    if (object === 'cart') {
      // Handle special cart properties
      switch (property) {
        case 'total':
        case 'total.value':
          return cartState.totals.total.value;
        case 'subtotal':
        case 'subtotal.value':
          return cartState.totals.subtotal.value;
        case 'shipping':
        case 'shipping.value':
          return cartState.totals.shipping.value;
        case 'tax':
        case 'tax.value':
          return cartState.totals.tax.value;
        case 'discounts':
        case 'discounts.value':
          return cartState.totals.discounts.value;
        case 'count':
          return cartState.totalQuantity;
        case 'isEmpty':
          return cartState.isEmpty;
        case 'hasItems':
          return !cartState.isEmpty;
        case 'hasShipping':
          return cartState.totals.shipping.value > 0;
        case 'hasFreeShipping':
          return cartState.totals.shipping.value === 0;
        case 'savingsAmount':
        case 'savingsAmount.value':
          return cartState.totals.savings.value;
        case 'savingsPercentage':
        case 'savingsPercentage.value':
          return cartState.totals.savingsPercentage.value;
        case 'compareTotal':
        case 'compareTotal.value':
          return cartState.totals.compareTotal.value;
        case 'hasSavings':
          return cartState.totals.hasSavings;
        default:
          // Check for mapped properties first
          const config = getPropertyConfig('cart', property);
          if (config) {
            const { path, validator } = config;
            
            // Handle negation
            if (path.startsWith('!')) {
              const actualPath = path.substring(1);
              const value = PropertyResolver.getNestedProperty(cartState, actualPath);
              return !value;
            }
            
            // Get the value using the mapped path
            let value = PropertyResolver.getNestedProperty(cartState, path);
            
            // Apply validator if present
            if (validator && value !== undefined) {
              value = validator(value);
            }
            
            return value;
          }
          
          // Fallback to direct property access for unmapped properties
          return PropertyResolver.getNestedProperty(cartState, property);
      }
    }
    
    if (object === 'package') {
      return this.getPackagePropertyValue(property);
    }
    
    if (object === 'selection' || (object && object.startsWith('selection.'))) {
      // Handle embedded selector ID
      let actualSelectorId: string | null = this.selectorId;
      let actualProperty = property;
      
      if (object.startsWith('selection.')) {
        const parts = object.split('.');
        if (parts.length >= 2) {
          actualSelectorId = parts[1] ?? null;
          // If property is part of the object path, reconstruct it
          if (parts.length > 2) {
            actualProperty = parts.slice(2).join('.') + (property ? '.' + property : '');
          }
        }
      }
      
      return this.getSelectionPropertyValue(actualProperty, actualSelectorId);
    }
    
    if (object === 'order') {
      const orderStore = useOrderStore.getState();
      return this.getOrderPropertyValue(orderStore, property);
    }
    
    if (object === 'shipping') {
      return this.getShippingPropertyValue(property);
    }

    if (object === 'param' || object === 'params') {
      const paramStore = useParameterStore.getState();
      return paramStore.getParam(property);
    }

    return null;
  }

  private getSelectionPropertyValue(property: string, selectorId?: string | null): any {
    let targetSelectorId: string | null = selectorId || this.selectorId;
    let actualProperty = property;
    
    // Check if property contains the selector ID
    if (property && property.includes('.')) {
      const parts = property.split('.');
      if (parts.length >= 2) {
        targetSelectorId = parts[0] ?? null;
        actualProperty = parts.slice(1).join('.');
      }
    }
    
    if (!targetSelectorId) {
      this.logger.warn('Selection condition used but no selector context found');
      return null;
    }

    // Find the selector element
    const selectorElement = document.querySelector(
      `[data-next-selector-id="${targetSelectorId}"]`
    ) as HTMLElement;
    
    if (!selectorElement) {
      this.logger.debug(`Selector element not found for ID: ${targetSelectorId}`);
      return null;
    }

    // Try to get the selected item from the selector
    const getSelectedItem = (selectorElement as any)._getSelectedItem;
    const selectedItem = typeof getSelectedItem === 'function' ? getSelectedItem() : null;
    
    if (!selectedItem) {
      // No selection made yet
      if (actualProperty === 'hasSelection') return false;
      return null;
    }

    // Get package data if available
    let packageData: Package | undefined;
    try {
      const campaignStore = useCampaignStore.getState();
      packageData = campaignStore.getPackage(selectedItem.packageId) ?? undefined;
    } catch (error) {
      this.logger.debug('Could not get package data for selection');
    }

    // Evaluate selection properties (similar to SelectionDisplayEnhancer)
    switch (actualProperty) {
      case 'hasSelection':
        return true;
      
      case 'packageId':
        return selectedItem.packageId;
      
      case 'quantity':
        return selectedItem.quantity || 1;
      
      case 'name':
        return packageData?.name || selectedItem.name || '';
      
      case 'price':
        return packageData ? parseFloat(packageData.price || '0') : (selectedItem.price || 0);
      
      case 'total':
      case 'price_total':
        if (packageData) {
          return parseFloat(packageData.price_total || '0') || 
                 (parseFloat(packageData.price || '0') * selectedItem.quantity);
        }
        return (selectedItem.price || 0) * selectedItem.quantity;
      
      case 'hasSavings':
        if (!packageData) return false;
        const hasSavingsMetrics = PriceCalculator.calculatePackageMetrics({
          price: parseFloat(packageData.price || '0'),
          retailPrice: parseFloat(packageData.price_retail || '0'),
          quantity: selectedItem.quantity,
          priceTotal: parseFloat(packageData.price_total || '0'),
          retailPriceTotal: parseFloat(packageData.price_retail_total || '0')
        });
        return hasSavingsMetrics.hasSavings;
      
      case 'savingsAmount':
        if (!packageData) return 0;
        const metrics = PriceCalculator.calculatePackageMetrics({
          price: parseFloat(packageData.price || '0'),
          retailPrice: parseFloat(packageData.price_retail || '0'),
          quantity: selectedItem.quantity,
          priceTotal: parseFloat(packageData.price_total || '0'),
          retailPriceTotal: parseFloat(packageData.price_retail_total || '0')
        });
        return metrics.totalSavings;
      
      case 'savingsPercentage':
        if (!packageData) return 0;
        const metricsPerc = PriceCalculator.calculatePackageMetrics({
          price: parseFloat(packageData.price || '0'),
          retailPrice: parseFloat(packageData.price_retail || '0'),
          quantity: selectedItem.quantity,
          priceTotal: parseFloat(packageData.price_total || '0'),
          retailPriceTotal: parseFloat(packageData.price_retail_total || '0')
        });
        return metricsPerc.totalSavingsPercentage;
      
      case 'compareTotal':
      case 'price_retail_total':
        if (!packageData) return 0;
        const rtlTotal = parseFloat(packageData.price_retail_total || '0');
        if (rtlTotal > 0) return rtlTotal;
        const rtlPrice = parseFloat(packageData.price_retail || '0');
        if (rtlPrice > 0) return rtlPrice * selectedItem.quantity;
        return this.getSelectionPropertyValue('total', targetSelectorId);
      
      case 'isBundle':
      case 'isMultiPack':
        return (selectedItem.quantity || 1) > 1;
      
      case 'isSingleUnit':
        return (selectedItem.quantity || 1) === 1;
      
      case 'totalUnits':
      case 'totalQuantity':
        return selectedItem.quantity || 1;
      
      default:
        // Try to get from package data
        if (packageData) {
          return PropertyResolver.getNestedProperty(packageData, actualProperty);
        }
        return null;
    }
  }

  private getPackagePropertyValue(property: string): any {
    if (!this.packageContext) {
      this.logger.warn('Package condition used but no package context found');
      return null;
    }

    try {
      const campaignStore = useCampaignStore.getState();
      const packageData = campaignStore.getPackage(this.packageContext);
      
      if (!packageData) {
        this.logger.warn(`Package ${this.packageContext} not found in campaign data`);
        return null;
      }

      // Use direct property access - legacy mapping has been removed
      return this.calculatePackageProperty(packageData, property);
    } catch (error) {
      this.logger.error(`Error getting package property ${property}:`, error);
      return null;
    }
  }

  private calculatePackageProperty(packageData: Package, property: string): any {
    const price = parseFloat(packageData.price) || 0;
    const priceRetail = parseFloat(packageData.price_retail || packageData.price) || 0;
    const priceTotal = parseFloat(packageData.price_total || '0') || (price * (packageData.qty || 1));
    const priceRetailTotal = parseFloat(packageData.price_retail_total || '0') || (priceRetail * (packageData.qty || 1));
    const quantity = packageData.qty || 1;
    
    // Use PriceCalculator for price metrics
    const metrics = PriceCalculator.calculatePackageMetrics({
      price,
      retailPrice: priceRetail,
      quantity,
      priceTotal,
      retailPriceTotal: priceRetailTotal
    });
    
    // Handle property access with standardized names
    switch (property) {
      // Basic properties
      case 'name':
        return packageData.name;
      case 'price':
        return price;
      case 'quantity':
      case 'qty':
        return quantity;
      case 'image':
        return packageData.image;
      case 'isRecurring':
        return packageData.is_recurring;
      case 'interval':
        return packageData.interval;
      case 'intervalCount':
        return packageData.interval_count;
      
      // Calculated properties using PriceCalculator
      case 'hasRetailPrice':
        return priceRetail > 0 && priceRetail !== price;
      case 'hasSavings':
        return metrics.hasSavings;
      case 'savingsAmount':
        return metrics.totalSavings;
      case 'savingsPercentage':
        return metrics.totalSavingsPercentage;
      
      // Total calculations
      case 'priceRetailTotal':
        return metrics.totalRetailPrice;
      case 'totalSavings':
        return metrics.totalSavings;
      case 'totalSavingsPercentage':
        return metrics.totalSavingsPercentage;
      
      // Unit pricing
      case 'unitPrice':
        return metrics.unitPrice;
      case 'unitRetailPrice':
        return metrics.unitRetailPrice;
      case 'unitSavings':
        return metrics.unitSavings;
      case 'unitSavingsPercentage':
        return metrics.unitSavingsPercentage;
      
      // Boolean checks
      case 'isBundle':
        return quantity > 1;
      case 'hasDiscount':
        return metrics.hasSavings;
      case 'isSubscription':
        return packageData.is_recurring === true;
      case 'isOneTime':
        return !packageData.is_recurring;
      
      // Raw value access
      case 'price.raw':
        return price;
      case 'priceRetail.raw':
        return priceRetail;
      case 'savingsAmount.raw':
        return metrics.totalSavings;
      
      default:
        // Use PropertyResolver for direct property access as fallback
        return PropertyResolver.getNestedProperty(packageData, property);
    }
  }

  private getShippingPropertyValue(property: string): any {
    // Find the closest parent element with data-next-shipping-id
    const shippingElement = this.element.closest('[data-next-shipping-id]') as HTMLElement;
    
    if (!shippingElement) {
      this.logger.warn('Shipping condition used but no shipping context found');
      return null;
    }
    
    const shippingId = shippingElement.getAttribute('data-next-shipping-id');
    if (!shippingId) {
      return null;
    }
    
    // Get shipping method from campaign data
    const campaignStore = useCampaignStore.getState();
    const shippingMethods = campaignStore.data?.shipping_methods || [];
    const shippingMethod = shippingMethods.find(
      method => method.ref_id === parseInt(shippingId, 10)
    );
    
    if (!shippingMethod) {
      this.logger.warn(`Shipping method ${shippingId} not found in campaign data`);
      return null;
    }
    
    // Return the requested property
    switch (property) {
      case 'isFree':
        return parseFloat(shippingMethod.price || '0') === 0;
      
      case 'cost':
      case 'price':
        return parseFloat(shippingMethod.price || '0');
      
      case 'name':
      case 'code':
        return shippingMethod.code;
      
      case 'id':
      case 'refId':
        return shippingMethod.ref_id;
      
      case 'method':
        return shippingMethod;
      
      default:
        return null;
    }
  }

  // getPackageShippingCost method removed - unused

  private getOrderPropertyValue(orderState: any, property: string): any {
    const order = orderState.order;
    
    // Handle state properties that don't require an order to exist
    switch (property) {
      case 'exists':
      case 'hasOrder':
        return !!order;
      
      case 'isLoaded':
        return !orderState.isLoading && !!order;
      
      case 'isLoading':
        return orderState.isLoading;
      
      case 'hasError':
        return !!orderState.error;
      
      case 'cacheFresh':
      case 'isCacheFresh':
        // Check if order cache was loaded less than 15 minutes ago
        if (!order || !orderState.orderLoadedAt) return false;
        const now = Date.now();
        const loadedAt = orderState.orderLoadedAt;
        const fifteenMinutes = 15 * 60 * 1000; // 15 minutes in milliseconds
        return (now - loadedAt) < fifteenMinutes;
      
      case 'cacheExpired':
      case 'isCacheExpired':
        // Check if order cache is expired (15+ minutes old)
        if (!order || !orderState.orderLoadedAt) return false;
        const currentTime = Date.now();
        const orderLoadTime = orderState.orderLoadedAt;
        const expiration = 15 * 60 * 1000; // 15 minutes in milliseconds
        return (currentTime - orderLoadTime) >= expiration;
        
      // Keep old names for backwards compatibility but map to new behavior
      case 'isRecent':
      case 'isRecentOrder':
        // NOW checks if order was PLACED recently, not cache
        if (!order) return false;
        const orderTsRecent = order.attribution?.metadata?.timestamp;
        if (!orderTsRecent) return false;
        const nowRecent = Date.now();
        const ageRecent = nowRecent - orderTsRecent;
        const fifteenMinsRecent = 15 * 60 * 1000;
        return ageRecent < fifteenMinsRecent;
      
      case 'isExpired':
        // NOW checks if order is old, not cache
        if (!order) return false;
        const orderTsExpired = order.attribution?.metadata?.timestamp;
        if (!orderTsExpired) return false;
        const nowExpired = Date.now();
        const ageExpired = nowExpired - orderTsExpired;
        const fifteenMinsExpired = 15 * 60 * 1000;
        return ageExpired >= fifteenMinsExpired;
      
      case 'isNewOrder':
      case 'wasPlacedRecently':
        // Check if order was PLACED less than 15 minutes ago (not loaded)
        if (!order) return false;
        const orderTimestamp = order.attribution?.metadata?.timestamp;
        if (!orderTimestamp) return false;
        const nowTime = Date.now();
        const orderAge = nowTime - orderTimestamp;
        const fifteenMins = 15 * 60 * 1000;
        return orderAge < fifteenMins;
      
      case 'isOldOrder':
      case 'wasPlacedLongAgo':
        // Check if order was PLACED more than 15 minutes ago
        if (!order) return false;
        const orderTs = order.attribution?.metadata?.timestamp;
        if (!orderTs) return false;
        const currentTs = Date.now();
        const age = currentTs - orderTs;
        const fifteenMinutesMs = 15 * 60 * 1000;
        return age >= fifteenMinutesMs;
    }
    
    if (!order) {
      // No order exists, return false for all other properties
      return false;
    }
    
    // Handle order content properties (requires order to exist)
    switch (property) {
      case 'isTest':
        return order.is_test || false;
      
      case 'hasItems':
        return order.lines && order.lines.length > 0;
      
      case 'isEmpty':
        return !order.lines || order.lines.length === 0;
      
      case 'hasShipping':
        return parseFloat(order.shipping_incl_tax || '0') > 0;
      
      case 'hasTax':
        return parseFloat(order.total_tax || '0') > 0;
      
      case 'hasDiscounts':
        return parseFloat(order.total_discounts || '0') > 0;
      
      case 'hasUpsells':
        return order.lines?.some((line: any) => line.is_upsell) || false;
      
      case 'supportsUpsells':
      case 'acceptsUpsells':
      case 'supportsPostPurchaseUpsells':
        return order.supports_post_purchase_upsells || false;
      
      // Numeric properties for comparisons
      case 'total':
        return parseFloat(order.total_incl_tax || '0');
      
      case 'subtotal':
        // Calculate subtotal from line items only (excludes shipping)
        if (order.lines && order.lines.length > 0) {
          return order.lines.reduce((sum: number, line: any) => {
            return sum + parseFloat(line.price_excl_tax || '0');
          }, 0);
        }
        // Fallback: subtract shipping from total_excl_tax
        return parseFloat(order.total_excl_tax || '0') - parseFloat(order.shipping_excl_tax || '0');
      
      case 'tax':
        return parseFloat(order.total_tax || '0');
      
      case 'shipping':
        return parseFloat(order.shipping_incl_tax || '0');
      
      case 'shippingExclTax':
        return parseFloat(order.shipping_excl_tax || '0');
      
      case 'shippingTax':
        return parseFloat(order.shipping_tax || '0');
      
      case 'discounts':
        return parseFloat(order.total_discounts || '0');
      
      case 'itemCount':
        return order.lines?.length || 0;
      
      case 'totalQuantity':
        return order.lines?.reduce((sum: number, line: any) => sum + (line.quantity || 0), 0) || 0;
      
      default:
        // Try direct property access using PropertyResolver
        return PropertyResolver.getNestedProperty(order, property);
    }
  }

  public override destroy(): void {
    // Clean up selection event listeners
    if (this.selectionChangeHandler) {
      this.eventBus.off('selector:selection-changed', this.selectionChangeHandler);
      this.eventBus.off('selector:item-selected', this.selectionChangeHandler);
    }
    
    super.destroy();
  }
}