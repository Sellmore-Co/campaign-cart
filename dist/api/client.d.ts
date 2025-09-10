import { Campaign, Cart, Order, CartBase, CreateOrder, AddUpsellLine } from '../types/api';
export declare class ApiClient {
    private baseURL;
    private apiKey;
    private logger;
    constructor(apiKey: string);
    getCampaigns(currency?: string): Promise<Campaign>;
    createCart(data: CartBase & {
        currency?: string;
    }): Promise<Cart>;
    createOrder(data: CreateOrder & {
        currency?: string;
    }): Promise<Order>;
    getOrder(refId: string): Promise<Order>;
    addUpsell(refId: string, data: AddUpsellLine): Promise<Order>;
    createProspectCart(data: any): Promise<any>;
    updateProspectCart(cartId: string, data: any): Promise<any>;
    getProspectCart(cartId: string): Promise<any>;
    abandonProspectCart(cartId: string): Promise<any>;
    convertProspectCart(cartId: string): Promise<any>;
    private getRequestType;
    private getErrorType;
    private request;
    setApiKey(apiKey: string): void;
    getApiKey(): string;
}
//# sourceMappingURL=client.d.ts.map