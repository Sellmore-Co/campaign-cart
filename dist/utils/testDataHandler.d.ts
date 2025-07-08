/**
 * Test Data Handler
 * Centralized handling of test/debug data for checkout forms
 * This functionality was spread across multiple enhancers in the original system
 */
export interface TestCheckoutData {
    fname?: string;
    lname?: string;
    email?: string;
    phone?: string;
    address1?: string;
    address2?: string;
    city?: string;
    province?: string;
    postal?: string;
    country?: string;
    'cc-name'?: string;
    'cc-number'?: string;
    'cc-month'?: string;
    'cc-year'?: string;
    cvv?: string;
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
    accepts_marketing?: boolean;
    use_shipping_address?: boolean;
    payment_method?: string;
    shipping_method?: number;
}
export declare class TestDataHandler {
    private static instance;
    private logger;
    private readonly defaultTestData;
    static getInstance(): TestDataHandler;
    /**
     * Fill checkout form with test data
     */
    fillTestData(dataSet?: string, customData?: Partial<TestCheckoutData>): void;
    /**
     * Get available test data sets
     */
    getAvailableDataSets(): string[];
    /**
     * Add or update a test data set
     */
    addTestDataSet(name: string, data: TestCheckoutData): void;
    /**
     * Remove a test data set
     */
    removeTestDataSet(name: string): void;
    /**
     * Get test data for a specific set
     */
    getTestData(dataSet: string): TestCheckoutData | undefined;
    /**
     * Auto-fill form based on browser location or other heuristics
     */
    autoFillByLocation(): Promise<void>;
    /**
     * Clear all form data
     */
    clearFormData(): void;
}
declare global {
    interface Window {
        tnTestData?: TestDataHandler;
    }
}
export default TestDataHandler;
//# sourceMappingURL=testDataHandler.d.ts.map