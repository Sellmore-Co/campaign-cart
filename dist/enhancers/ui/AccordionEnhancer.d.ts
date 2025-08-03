import { BaseEnhancer } from '../base/BaseEnhancer';
export declare class AccordionEnhancer extends BaseEnhancer {
    static selector: string;
    private accordions;
    initialize(): Promise<void>;
    enhance(): void;
    update(_data?: any): void;
    private parseConfig;
    private setupEventListeners;
    private toggleAccordion;
    private openAccordion;
    private closeAccordion;
    openAccordionById(id: string): void;
    closeAccordionById(id: string): void;
    toggleAccordionById(id: string): void;
    getAccordionState(id: string): boolean | null;
    getAllAccordions(): string[];
    destroy(): void;
}
//# sourceMappingURL=AccordionEnhancer.d.ts.map