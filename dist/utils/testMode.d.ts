export interface TestCard {
    number: string;
    name: string;
    cvv: string;
    expiry: string;
    type: 'visa' | 'mastercard' | 'amex' | 'discover';
}
export declare class TestModeManager {
    private static instance;
    private isTestMode;
    private konamiSequence;
    private keySequence;
    private konamiCallback?;
    private testCards;
    static getInstance(): TestModeManager;
    private constructor();
    private initializeKonamiCode;
    private handleKeyDown;
    private checkUrlTestMode;
    private activateKonamiCode;
    private showKonamiMessage;
    setTestMode(enabled: boolean): void;
    isActive(): boolean;
    onKonamiCode(callback: () => void): void;
    getTestCards(): TestCard[];
    getTestCard(type?: string): TestCard;
    fillTestCardData(cardType?: string): void;
    showTestCardMenu(): void;
}
export declare const testModeManager: TestModeManager;
//# sourceMappingURL=testMode.d.ts.map