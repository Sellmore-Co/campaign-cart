import { EventSchema } from '../schemas';
export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
export declare class EventValidator {
    private debug;
    constructor(debug?: boolean);
    /**
     * Validates an event against its schema
     */
    validateEvent(eventData: any): ValidationResult;
    /**
     * Performs additional validation beyond schema validation
     */
    private performAdditionalValidation;
    /**
     * Validates a product object
     */
    private validateProduct;
    /**
     * Validates user properties
     */
    private validateUserProperties;
    /**
     * Checks if a currency code is valid (3-letter ISO code)
     */
    private isValidCurrency;
    /**
     * Basic email validation
     */
    private isValidEmail;
    /**
     * Validates upsell events
     */
    private validateUpsellEvent;
    /**
     * Get all available event schemas
     */
    getAvailableSchemas(): string[];
    /**
     * Get schema details for a specific event
     */
    getSchemaDetails(eventName: string): EventSchema | undefined;
    /**
     * Generate a sample event based on schema
     */
    generateSampleEvent(eventName: string): any;
    /**
     * Helper to generate sample data from schema
     */
    private generateSampleFromSchema;
}
export declare const eventValidator: EventValidator;
//# sourceMappingURL=EventValidator.d.ts.map