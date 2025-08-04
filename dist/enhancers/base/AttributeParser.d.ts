export interface ParsedAttribute {
    raw: string | null;
    parsed: any;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
}
export declare class AttributeParser {
    private static logger;
    static parseDataAttribute(element: HTMLElement, attribute: string): ParsedAttribute;
    static parseValue(value: string | null): any;
    static inferType(value: string | null): ParsedAttribute['type'];
    static getEnhancerTypes(element: HTMLElement): string[];
    static parseDisplayPath(path: string): {
        object: string;
        property: string;
    };
    static parseCondition(condition: string): any;
}
//# sourceMappingURL=AttributeParser.d.ts.map