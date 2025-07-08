import { DebugPanel, PanelAction, PanelTab } from '../DebugPanels';

interface APIRequest {
    id: string;
    method: string;
    url: string;
    status: number;
    duration: number;
    timestamp: Date;
    requestData?: any;
    responseData?: any;
}
export declare class APIPanel implements DebugPanel {
    id: string;
    title: string;
    icon: string;
    private requests;
    getContent(): string;
    getTabs(): PanelTab[];
    private getOverviewContent;
    private getRequestsContent;
    private getPerformanceContent;
    getActions(): PanelAction[];
    private shortenUrl;
    private getAverageResponseTime;
    private getMethodStatistics;
    private clearHistory;
    private testApiConnection;
    private exportRequests;
    addRequest(request: APIRequest): void;
}
export {};
//# sourceMappingURL=APIPanel.d.ts.map