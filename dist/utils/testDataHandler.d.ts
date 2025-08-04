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
    fillTestData(dataSet?: string, customData?: Partial<TestCheckoutData>): void;
    getAvailableDataSets(): string[];
    addTestDataSet(name: string, data: TestCheckoutData): void;
    removeTestDataSet(name: string): void;
    getTestData(dataSet: string): TestCheckoutData | undefined;
    autoFillByLocation(): Promise<void>;
    clearFormData(): void;
}
declare global {
    interface Window {
        tnTestData?: TestDataHandler;
    }
}
export default TestDataHandler;
//# sourceMappingURL=testDataHandler.d.ts.map