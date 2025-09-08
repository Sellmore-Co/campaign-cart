/**
 * Checkout Panel Component
 * Displays checkout state and form validation status
 */

import { useCheckoutStore } from '../../../stores/checkoutStore';
import { DebugPanel, PanelAction, PanelTab } from '../DebugPanels';
import { RawDataHelper } from './RawDataHelper';

export class CheckoutPanel implements DebugPanel {
  id = 'checkout';
  title = 'Checkout State';
  icon = '💳';

  getContent(): string {
    // Fallback to first tab's content if tabs are not being used
    const tabs = this.getTabs();
    return tabs[0]?.getContent() || '';
  }

  getTabs(): PanelTab[] {
    return [
      {
        id: 'overview',
        label: 'Overview',
        icon: '📊',
        getContent: () => this.getOverviewContent()
      },
      {
        id: 'customer',
        label: 'Customer Info',
        icon: '👤',
        getContent: () => this.getCustomerContent()
      },
      {
        id: 'validation',
        label: 'Validation',
        icon: '✅',
        getContent: () => this.getValidationContent()
      },
      {
        id: 'raw',
        label: 'Raw Data',
        icon: '🔧',
        getContent: () => this.getRawDataContent()
      }
    ];
  }

  private getOverviewContent(): string {
    const checkoutState = useCheckoutStore.getState();
    
    return `
      <div class="enhanced-panel">
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon">📋</div>
            <div class="metric-content">
              <div class="metric-value">${checkoutState.step || 'Not Started'}</div>
              <div class="metric-label">Current Step</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">${checkoutState.isProcessing ? '⏳' : '✅'}</div>
            <div class="metric-content">
              <div class="metric-value">${checkoutState.isProcessing ? 'PROCESSING' : 'READY'}</div>
              <div class="metric-label">Form Status</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🔒</div>
            <div class="metric-content">
              <div class="metric-value">${checkoutState.paymentMethod || 'None'}</div>
              <div class="metric-label">Payment Method</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🚚</div>
            <div class="metric-content">
              <div class="metric-value">${checkoutState.shippingMethod?.name || 'None'}</div>
              <div class="metric-label">Shipping Method</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h3 class="section-title">Form Fields Status</h3>
          <div class="form-fields-grid">
            ${this.renderFormFields(checkoutState)}
          </div>
        </div>
        
        <div class="section">
          <h3 class="section-title">Current Form Data</h3>
          <div class="form-data-summary">
            ${Object.keys(checkoutState.formData).length > 0 ? 
              Object.entries(checkoutState.formData).map(([key, value]) => `
                <div class="form-field-row">
                  <span class="field-name">${this.formatFieldName(key)}</span>
                  <span class="field-value">${value || 'Empty'}</span>
                </div>
              `).join('') : 
              '<div class="empty-state">No form data yet</div>'
            }
          </div>
        </div>
      </div>
    `;
  }

  private getCustomerContent(): string {
    const checkoutState = useCheckoutStore.getState();
    const formData = checkoutState.formData;
    const hasFormData = Object.keys(formData).length > 0;
    
    return `
      <div class="enhanced-panel">
        <div class="section">
          <div class="customer-info">
            ${hasFormData ? `
              <div class="info-card">
                <h4>Contact Information</h4>
                <div class="info-row">
                  <span class="info-label">Email:</span>
                  <span class="info-value">${formData.email || 'Not provided'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Phone:</span>
                  <span class="info-value">${formData.phone || 'Not provided'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Name:</span>
                  <span class="info-value">${formData.fname || ''} ${formData.lname || ''}</span>
                </div>
              </div>
              
              <div class="info-card">
                <h4>Shipping Address</h4>
                <div class="address-info">
                  ${formData.address1 ? `
                    <div class="info-row">
                      <span class="info-label">Address:</span>
                      <span class="info-value">${formData.address1}</span>
                    </div>
                    ${formData.address2 ? `
                      <div class="info-row">
                        <span class="info-label">Address 2:</span>
                        <span class="info-value">${formData.address2}</span>
                      </div>
                    ` : ''}
                    <div class="info-row">
                      <span class="info-label">City:</span>
                      <span class="info-value">${formData.city || 'Not provided'}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">State/Province:</span>
                      <span class="info-value">${formData.province || 'Not provided'}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Postal Code:</span>
                      <span class="info-value">${formData.postal || 'Not provided'}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Country:</span>
                      <span class="info-value">${formData.country || 'Not provided'}</span>
                    </div>
                  ` : '<div class="info-empty">Not provided</div>'}
                </div>
              </div>

              <div class="info-card">
                <h4>Billing Address</h4>
                <div class="address-info">
                  ${checkoutState.sameAsShipping ? `
                    <div class="info-same">Same as shipping address</div>
                  ` : (checkoutState.billingAddress ? `
                    <div class="info-row">
                      <span class="info-label">Name:</span>
                      <span class="info-value">${checkoutState.billingAddress.first_name} ${checkoutState.billingAddress.last_name}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Address:</span>
                      <span class="info-value">${checkoutState.billingAddress.address1}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">City:</span>
                      <span class="info-value">${checkoutState.billingAddress.city}, ${checkoutState.billingAddress.province} ${checkoutState.billingAddress.postal}</span>
                    </div>
                  ` : '<div class="info-empty">Not provided</div>')}
                </div>
              </div>
            ` : `
              <div class="empty-state">
                <div class="empty-icon">👤</div>
                <div class="empty-text">No customer information yet</div>
                <div class="empty-subtitle">Fill out the checkout form to see data here</div>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  }

  private getValidationContent(): string {
    const checkoutState = useCheckoutStore.getState();
    
    return `
      <div class="enhanced-panel">
        <div class="section">
          <div class="validation-errors">
            ${checkoutState.errors && Object.keys(checkoutState.errors).length > 0 ? `
              ${Object.entries(checkoutState.errors).map(([field, error]) => `
                <div class="error-item">
                  <span class="error-field">${field}:</span>
                  <span class="error-message">${error}</span>
                </div>
              `).join('')}
            ` : `
              <div class="empty-state">
                <div class="empty-icon">✅</div>
                <div class="empty-text">No validation errors</div>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  }

  private getRawDataContent(): string {
    const checkoutState = useCheckoutStore.getState();
    return RawDataHelper.generateRawDataContent(checkoutState);
  }

  getActions(): PanelAction[] {
    return [
      {
        label: 'Fill Test Data',
        action: () => this.fillTestData(),
        variant: 'primary'
      },
      {
        label: 'Validate Form',
        action: () => this.validateForm(),
        variant: 'secondary'
      },
      {
        label: 'Clear Errors',
        action: () => this.clearErrors(),
        variant: 'secondary'
      },
      {
        label: 'Reset Checkout',
        action: () => this.resetCheckout(),
        variant: 'danger'
      },
      {
        label: 'Export State',
        action: () => this.exportState(),
        variant: 'secondary'
      }
    ];
  }

  private renderFormFields(checkoutState: any): string {
    const requiredFields = [
      'email', 'fname', 'lname', 'address1', 'city', 'province', 'postal', 'phone', 'country'
    ];

    return requiredFields.map(field => {
      const hasValue = this.hasFieldValue(checkoutState, field);
      const hasError = checkoutState.errors && checkoutState.errors[field];
      
      return `
        <div class="field-status-card ${hasValue ? 'filled' : 'empty'} ${hasError ? 'error' : ''}">
          <div class="field-name">${this.formatFieldName(field)}</div>
          <div class="field-status">
            ${hasValue ? '✅' : '⏳'}
            ${hasError ? ' ❌' : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  private hasFieldValue(checkoutState: any, field: string): boolean {
    // Check in formData first
    if (checkoutState.formData && checkoutState.formData[field]) {
      return checkoutState.formData[field].toString().trim().length > 0;
    }
    
    // Check in billing address for billing-specific fields
    if (checkoutState.billingAddress && checkoutState.billingAddress[field]) {
      return checkoutState.billingAddress[field].toString().trim().length > 0;
    }
    
    return false;
  }

  private formatFieldName(field: string): string {
    const fieldNames: Record<string, string> = {
      fname: 'First Name',
      lname: 'Last Name',
      email: 'Email',
      phone: 'Phone',
      address1: 'Address',
      address2: 'Address 2',
      city: 'City',
      province: 'State/Province',
      postal: 'Postal Code',
      country: 'Country',
      accepts_marketing: 'Accepts Marketing'
    };
    
    return fieldNames[field] || field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  private fillTestData(): void {
    const checkoutStore = useCheckoutStore.getState();
    
    // Test data based on the old Konami code handler
    const testFormData = {
      email: 'test@test.com',
      fname: 'Test',
      lname: 'Order',
      phone: '+14807581224',
      address1: 'Test Address 123',
      address2: '',
      city: 'Tempe',
      province: 'AZ',
      postal: '85281',
      country: 'US',
      accepts_marketing: true
    };
    
    
    // Clear any existing errors
    checkoutStore.clearAllErrors();
    
    // Fill the form data
    checkoutStore.updateFormData(testFormData);
    
    // Set other checkout options
    checkoutStore.setPaymentMethod('credit-card');
    checkoutStore.setSameAsShipping(true);
    
    // Set a default shipping method if available
    checkoutStore.setShippingMethod({
      id: 1,
      name: 'Standard Shipping',
      price: 0,
      code: 'standard'
    });
    
    console.log('✅ Test data filled successfully');
    
    // Trigger UI updates
    document.dispatchEvent(new CustomEvent('debug:update-content'));
    
    // Also trigger a DOM update event to update any form fields
    setTimeout(() => {
      document.dispatchEvent(new CustomEvent('checkout:test-data-filled', {
        detail: testFormData
      }));
    }, 100);
  }

  private validateForm(): void {
    // Trigger a validation check - this would normally be handled by the CheckoutFormEnhancer
    const checkoutStore = useCheckoutStore.getState();
    const formData = checkoutStore.formData;
    
    // Basic validation
    const requiredFields = ['email', 'fname', 'lname', 'address1', 'city', 'country'];
    let hasErrors = false;
    
    // Clear existing errors first
    checkoutStore.clearAllErrors();
    
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        checkoutStore.setError(field, `${this.formatFieldName(field)} is required`);
        hasErrors = true;
      }
    });
    
    if (!hasErrors) {
      console.log('✅ Form validation passed');
    }
    
    document.dispatchEvent(new CustomEvent('debug:update-content'));
  }

  private clearErrors(): void {
    const checkoutStore = useCheckoutStore.getState();
    checkoutStore.clearAllErrors();
    document.dispatchEvent(new CustomEvent('debug:update-content'));
  }

  private resetCheckout(): void {
    if (confirm('Are you sure you want to reset the checkout state?')) {
      const checkoutStore = useCheckoutStore.getState();
      checkoutStore.reset();
      document.dispatchEvent(new CustomEvent('debug:update-content'));
    }
  }

  private exportState(): void {
    const checkoutState = useCheckoutStore.getState();
    const data = JSON.stringify(checkoutState, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `checkout-state-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}