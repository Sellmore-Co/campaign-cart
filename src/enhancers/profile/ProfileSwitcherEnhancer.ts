/**
 * Profile Switcher Enhancer
 * Handles elements that switch between different pricing profiles
 * 
 * Attributes:
 * - data-next-profile: Profile ID to activate (required)
 * - data-next-clear-cart: If "true", clears cart before applying profile
 * - data-next-preserve-quantities: If "false", resets all quantities to 1
 */

import { BaseEnhancer } from '@/enhancers/base/BaseEnhancer';
import { ProfileManager } from '@/core/ProfileManager';
import { useProfileStore } from '@/stores/profileStore';

export class ProfileSwitcherEnhancer extends BaseEnhancer {
  private profileId?: string;
  private clearCart: boolean = false;
  private preserveQuantities: boolean = true;
  private clickHandler?: (event: Event) => void;
  private profileManager = ProfileManager.getInstance();
  
  public async initialize(): Promise<void> {
    this.validateElement();
    
    // Get profile ID
    this.profileId = this.getAttribute('data-next-profile') || undefined;
    if (!this.profileId) {
      this.logger.error('Profile ID is required for profile switcher', this.element);
      return;
    }
    
    // Get options
    this.clearCart = this.getAttribute('data-next-clear-cart') === 'true';
    this.preserveQuantities = this.getAttribute('data-next-preserve-quantities') !== 'false';
    
    // Set up click handler
    this.clickHandler = this.handleClick.bind(this);
    this.element.addEventListener('click', this.clickHandler);
    
    // Update active state
    this.updateActiveState();
    
    // Listen for profile changes
    this.eventBus.on('profile:applied', this.updateActiveState.bind(this));
    this.eventBus.on('profile:reverted', this.updateActiveState.bind(this));
    
    // Add class for styling
    this.element.classList.add('next-profile-switcher');
    
    this.logger.debug('ProfileSwitcherEnhancer initialized', {
      profileId: this.profileId,
      clearCart: this.clearCart,
      preserveQuantities: this.preserveQuantities,
    });
  }
  
  private async handleClick(event: Event): Promise<void> {
    event.preventDefault();
    
    if (!this.profileId) {
      return;
    }
    
    try {
      // Show loading state
      this.element.classList.add('next-loading');
      this.element.setAttribute('aria-busy', 'true');
      
      // Check if this profile is already active
      const profileStore = useProfileStore.getState();
      if (profileStore.activeProfileId === this.profileId) {
        this.logger.info(`Profile "${this.profileId}" is already active`);
        return;
      }
      
      // Apply the profile
      await this.profileManager.applyProfile(this.profileId, {
        clearCart: this.clearCart,
        preserveQuantities: this.preserveQuantities,
      });
      
      this.logger.info(`Profile "${this.profileId}" applied via switcher`);
      
      // Emit custom event
      this.eventBus.emit('action:success', {
        action: 'profile-switch',
        data: { profileId: this.profileId },
      });
      
    } catch (error) {
      this.logger.error(`Failed to apply profile "${this.profileId}":`, error);
      
      this.eventBus.emit('action:failed', {
        action: 'profile-switch',
        error: error as Error,
      });
      
    } finally {
      // Remove loading state
      this.element.classList.remove('next-loading');
      this.element.setAttribute('aria-busy', 'false');
    }
  }
  
  private updateActiveState(): void {
    const profileStore = useProfileStore.getState();
    const isActive = profileStore.activeProfileId === this.profileId;
    
    this.element.classList.toggle('next-profile-active', isActive);
    this.element.setAttribute('aria-pressed', String(isActive));
    
    // Update text if needed
    const activeText = this.element.getAttribute('data-next-active-text');
    const inactiveText = this.element.getAttribute('data-next-inactive-text');
    
    if (activeText && inactiveText) {
      const textElement = this.element.querySelector('.next-profile-text') || this.element;
      if (textElement.textContent) {
        textElement.textContent = isActive ? activeText : inactiveText;
      }
    }
  }
  
  public update(_data?: any): void {
    this.updateActiveState();
  }
  
  public destroy(): void {
    if (this.clickHandler) {
      this.element.removeEventListener('click', this.clickHandler);
    }
    
    this.element.classList.remove('next-profile-switcher', 'next-profile-active', 'next-loading');
    this.element.removeAttribute('aria-pressed');
    this.element.removeAttribute('aria-busy');
    
    super.destroy();
  }
}

// Also create a ProfileSelectorEnhancer for dropdown/select elements
export class ProfileSelectorEnhancer extends BaseEnhancer {
  private selectElement?: HTMLSelectElement;
  private changeHandler?: (event: Event) => void;
  private profileManager = ProfileManager.getInstance();
  private clearCart: boolean = false;
  private preserveQuantities: boolean = true;
  
  public async initialize(): Promise<void> {
    this.validateElement();
    
    // Check if this is a select element
    if (!(this.element instanceof HTMLSelectElement)) {
      this.logger.error('ProfileSelectorEnhancer requires a <select> element', this.element);
      return;
    }
    
    this.selectElement = this.element;
    
    // Get options
    this.clearCart = this.getAttribute('data-next-clear-cart') === 'true';
    this.preserveQuantities = this.getAttribute('data-next-preserve-quantities') !== 'false';
    
    // Set up change handler
    this.changeHandler = this.handleChange.bind(this);
    this.selectElement.addEventListener('change', this.changeHandler);
    
    // Populate options if not already present
    if (this.getAttribute('data-next-auto-populate') === 'true') {
      this.populateOptions();
    }
    
    // Set current value
    this.updateSelectedValue();
    
    // Listen for profile changes
    this.eventBus.on('profile:applied', this.updateSelectedValue.bind(this));
    this.eventBus.on('profile:reverted', this.updateSelectedValue.bind(this));
    
    // Add class for styling
    this.element.classList.add('next-profile-selector');
    
    this.logger.debug('ProfileSelectorEnhancer initialized');
  }
  
  private populateOptions(): void {
    if (!this.selectElement) {
      return;
    }
    
    const profileStore = useProfileStore.getState();
    const profiles = profileStore.getAllProfiles();
    
    // Clear existing options
    this.selectElement.innerHTML = '';
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Regular Pricing';
    this.selectElement.appendChild(defaultOption);
    
    // Add profile options
    profiles.forEach(profile => {
      const option = document.createElement('option');
      option.value = profile.id;
      option.textContent = profile.name;
      if (this.selectElement) {
        this.selectElement.appendChild(option);
      }
    });
  }
  
  private async handleChange(event: Event): Promise<void> {
    if (!this.selectElement) {
      return;
    }
    
    const profileId = this.selectElement.value;
    
    try {
      if (profileId) {
        // Apply profile
        await this.profileManager.applyProfile(profileId, {
          clearCart: this.clearCart,
          preserveQuantities: this.preserveQuantities,
        });
        
        this.logger.info(`Profile "${profileId}" applied via selector`);
      } else {
        // Revert to no profile
        await this.profileManager.revertProfile();
        this.logger.info('Profile reverted via selector');
      }
      
      this.eventBus.emit('action:success', {
        action: 'profile-select',
        data: { profileId: profileId || 'none' },
      });
      
    } catch (error) {
      this.logger.error(`Failed to apply profile "${profileId}":`, error);
      
      // Revert select value
      this.updateSelectedValue();
      
      this.eventBus.emit('action:failed', {
        action: 'profile-select',
        error: error as Error,
      });
    }
  }
  
  private updateSelectedValue(): void {
    if (!this.selectElement) {
      return;
    }
    
    const profileStore = useProfileStore.getState();
    this.selectElement.value = profileStore.activeProfileId || '';
  }
  
  public update(_data?: any): void {
    this.updateSelectedValue();
  }
  
  public destroy(): void {
    if (this.changeHandler && this.selectElement) {
      this.selectElement.removeEventListener('change', this.changeHandler);
    }
    
    this.element.classList.remove('next-profile-selector');
    
    super.destroy();
  }
}