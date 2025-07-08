import { 
  eventSchemas, 
  validateEventSchema, 
  getEventSchema, 
  EventSchema,
  FieldDefinition 
} from '../schemas';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class EventValidator {
  private debug: boolean;

  constructor(debug: boolean = false) {
    this.debug = debug;
  }

  /**
   * Validates an event against its schema
   */
  public validateEvent(eventData: any): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: []
    };

    // Check if event has a name
    if (!eventData || typeof eventData !== 'object') {
      result.valid = false;
      result.errors.push('Event data must be an object');
      return result;
    }

    if (!eventData.event) {
      result.valid = false;
      result.errors.push('Event must have an "event" field');
      return result;
    }

    // Get the schema for this event
    const schema = getEventSchema(eventData.event);
    if (!schema) {
      result.warnings.push(`No schema defined for event: ${eventData.event}`);
      // Still allow the event to proceed if no schema is defined
      return result;
    }

    // Validate against schema
    const schemaValidation = validateEventSchema(eventData, schema);
    result.valid = schemaValidation.valid;
    result.errors.push(...schemaValidation.errors);

    // Additional validation for specific event types
    this.performAdditionalValidation(eventData, result);

    // Log validation results in debug mode
    if (this.debug && !result.valid) {
      console.error(`[EventValidator] Validation failed for ${eventData.event}:`, result.errors);
    }

    return result;
  }

  /**
   * Performs additional validation beyond schema validation
   */
  private performAdditionalValidation(eventData: any, result: ValidationResult): void {
    // Validate ecommerce data
    if (eventData.ecommerce) {
      // Check for valid currency
      if (eventData.ecommerce.currency && !this.isValidCurrency(eventData.ecommerce.currency)) {
        result.warnings.push(`Invalid currency format: ${eventData.ecommerce.currency}`);
      }

      // Check for negative values
      if (eventData.ecommerce.value !== undefined && eventData.ecommerce.value < 0) {
        result.warnings.push('Ecommerce value should not be negative');
      }

      // Validate items array
      if (eventData.ecommerce.items && Array.isArray(eventData.ecommerce.items)) {
        eventData.ecommerce.items.forEach((item: any, index: number) => {
          this.validateProduct(item, `ecommerce.items[${index}]`, result);
        });
      }

      // Validate impressions array
      if (eventData.ecommerce.impressions && Array.isArray(eventData.ecommerce.impressions)) {
        eventData.ecommerce.impressions.forEach((impression: any, index: number) => {
          this.validateProduct(impression, `ecommerce.impressions[${index}]`, result);
        });
      }
    }

    // Validate user properties
    if (eventData.user_properties) {
      this.validateUserProperties(eventData.user_properties, result);
    }

    // Event-specific validation
    switch (eventData.event) {
      case 'dl_purchase':
        if (!eventData.ecommerce?.transaction_id) {
          result.errors.push('dl_purchase event must have ecommerce.transaction_id');
          result.valid = false;
        }
        break;

      case 'dl_view_search_results':
        if (!eventData.search_term) {
          result.errors.push('dl_view_search_results event must have search_term');
          result.valid = false;
        }
        break;

      case 'dl_viewed_upsell':
      case 'dl_accepted_upsell':
      case 'dl_skipped_upsell':
        this.validateUpsellEvent(eventData, result);
        break;
    }
  }

  /**
   * Validates a product object
   */
  private validateProduct(product: any, path: string, result: ValidationResult): void {
    if (!product || typeof product !== 'object') {
      result.errors.push(`${path} must be an object`);
      result.valid = false;
      return;
    }

    // Check for required fields
    if (!product.item_id) {
      result.errors.push(`${path}.item_id is required`);
      result.valid = false;
    }

    if (!product.item_name) {
      result.errors.push(`${path}.item_name is required`);
      result.valid = false;
    }

    // Validate numeric fields
    const numericFields = ['price', 'quantity', 'discount', 'index'];
    for (const field of numericFields) {
      if (product[field] !== undefined) {
        if (typeof product[field] !== 'number') {
          result.errors.push(`${path}.${field} must be a number`);
          result.valid = false;
        } else if (field !== 'discount' && product[field] < 0) {
          result.warnings.push(`${path}.${field} should not be negative`);
        }
      }
    }

    // Validate quantity specifically
    if (product.quantity !== undefined && !Number.isInteger(product.quantity)) {
      result.warnings.push(`${path}.quantity should be an integer`);
    }
  }

  /**
   * Validates user properties
   */
  private validateUserProperties(userProperties: any, result: ValidationResult): void {
    if (typeof userProperties !== 'object') {
      result.errors.push('user_properties must be an object');
      result.valid = false;
      return;
    }

    // Validate email format
    if (userProperties.customer_email && !this.isValidEmail(userProperties.customer_email)) {
      result.warnings.push('customer_email is not a valid email address');
    }

    // Validate numeric fields
    if (userProperties.customer_order_count !== undefined) {
      if (typeof userProperties.customer_order_count !== 'number' || !Number.isInteger(userProperties.customer_order_count)) {
        result.warnings.push('customer_order_count should be an integer');
      }
    }

    if (userProperties.customer_total_spent !== undefined) {
      if (typeof userProperties.customer_total_spent !== 'number') {
        result.warnings.push('customer_total_spent should be a number');
      }
    }

    // Validate country and province codes
    if (userProperties.customer_address_country_code && userProperties.customer_address_country_code.length !== 2) {
      result.warnings.push('customer_address_country_code should be a 2-letter ISO code');
    }

    if (userProperties.customer_address_province_code && userProperties.customer_address_province_code.length > 3) {
      result.warnings.push('customer_address_province_code seems too long');
    }
  }

  /**
   * Checks if a currency code is valid (3-letter ISO code)
   */
  private isValidCurrency(currency: string): boolean {
    return /^[A-Z]{3}$/.test(currency);
  }

  /**
   * Basic email validation
   */
  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Validates upsell events
   */
  private validateUpsellEvent(eventData: any, result: ValidationResult): void {
    // Validate order_id
    if (!eventData.order_id) {
      result.errors.push(`${eventData.event} must have order_id`);
      result.valid = false;
    }

    // Validate upsell object
    if (!eventData.upsell || typeof eventData.upsell !== 'object') {
      result.errors.push(`${eventData.event} must have upsell object`);
      result.valid = false;
      return;
    }

    // Validate required fields in upsell object
    if (!eventData.upsell.package_id) {
      result.errors.push(`${eventData.event}.upsell.package_id is required`);
      result.valid = false;
    }

    // For accepted upsell, value is required
    if (eventData.event === 'dl_accepted_upsell' && eventData.upsell.value === undefined) {
      result.errors.push('dl_accepted_upsell.upsell.value is required');
      result.valid = false;
    }

    // Validate numeric fields
    if (eventData.upsell.price !== undefined && typeof eventData.upsell.price !== 'number') {
      result.errors.push(`${eventData.event}.upsell.price must be a number`);
      result.valid = false;
    }

    if (eventData.upsell.quantity !== undefined && typeof eventData.upsell.quantity !== 'number') {
      result.errors.push(`${eventData.event}.upsell.quantity must be a number`);
      result.valid = false;
    }

    if (eventData.upsell.value !== undefined && typeof eventData.upsell.value !== 'number') {
      result.errors.push(`${eventData.event}.upsell.value must be a number`);
      result.valid = false;
    }
  }

  /**
   * Get all available event schemas
   */
  public getAvailableSchemas(): string[] {
    return Object.keys(eventSchemas);
  }

  /**
   * Get schema details for a specific event
   */
  public getSchemaDetails(eventName: string): EventSchema | undefined {
    return getEventSchema(eventName);
  }

  /**
   * Generate a sample event based on schema
   */
  public generateSampleEvent(eventName: string): any {
    const schema = getEventSchema(eventName);
    if (!schema) {
      return null;
    }

    const sample: any = {
      event: eventName,
      event_id: 'sample_' + Date.now(),
      timestamp: Date.now()
    };

    // Generate sample data based on schema
    this.generateSampleFromSchema(schema.fields, sample);

    return sample;
  }

  /**
   * Helper to generate sample data from schema
   */
  private generateSampleFromSchema(fields: Record<string, FieldDefinition>, target: any): void {
    for (const [fieldName, fieldDef] of Object.entries(fields)) {
      if (fieldName === 'event') continue; // Skip event field as it's already set

      if (fieldDef.required || Math.random() > 0.5) { // Include required fields and randomly include optional ones
        switch (fieldDef.type) {
          case 'string':
            target[fieldName] = fieldDef.enum ? fieldDef.enum[0] : `sample_${fieldName}`;
            break;
          case 'number':
            target[fieldName] = fieldName.includes('price') || fieldName.includes('value') ? 99.99 : 1;
            break;
          case 'boolean':
            target[fieldName] = true;
            break;
          case 'object':
            target[fieldName] = {};
            if (fieldDef.properties) {
              this.generateSampleFromSchema(fieldDef.properties, target[fieldName]);
            }
            break;
          case 'array':
            target[fieldName] = [];
            if (fieldDef.items && fieldDef.items.type === 'object' && fieldDef.items.properties) {
              const item: any = {};
              this.generateSampleFromSchema(fieldDef.items.properties, item);
              target[fieldName].push(item);
            }
            break;
        }
      }
    }
  }
}

// Export a singleton instance for convenience
export const eventValidator = new EventValidator();