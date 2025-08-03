import { EventSchema } from '../schemas';
export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
export declare class EventValidator {
    private debug;
    constructor(debug?: boolean);
    validateEvent(eventData: any): ValidationResult;
    private performAdditionalValidation;
    private validateProduct;
    private validateUserProperties;
    private isValidCurrency;
    private isValidEmail;
    private validateUpsellEvent;
    getAvailableSchemas(): string[];
    getSchemaDetails(eventName: string): EventSchema | undefined;
    generateSampleEvent(eventName: string): any;
    private generateSampleFromSchema;
}
export declare const eventValidator: EventValidator;
//# sourceMappingURL=EventValidator.d.ts.map