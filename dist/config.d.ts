declare const config: {
    apiKey: string;
    debug: boolean;
    paymentConfig: {
        expressCheckout: {
            requireValidation: boolean;
            requiredFields: string[];
        };
    };
    addressConfig: {
        defaultCountry: string;
        showCountries: string[];
        dontShowStates: string[];
    };
    discounts: {
        SAVE10: {
            code: string;
            type: string;
            value: number;
            scope: string;
            description: string;
            combinable: boolean;
        };
    };
    googleMaps: {
        apiKey: string;
        region: string;
        enableAutocomplete: boolean;
    };
    tracking: string;
    analytics: {
        enabled: boolean;
        mode: string;
        providers: {
            nextCampaign: {
                enabled: boolean;
            };
            gtm: {
                enabled: boolean;
                settings: {
                    containerId: string;
                    dataLayerName: string;
                };
            };
            facebook: {
                enabled: boolean;
                settings: {
                    pixelId: string;
                };
            };
            rudderstack: {
                enabled: boolean;
                settings: {};
            };
            custom: {
                enabled: boolean;
                settings: {
                    endpoint: string;
                    apiKey: string;
                };
            };
        };
    };
    utmTransfer: {
        enabled: boolean;
        applyToExternalLinks: boolean;
        debug: boolean;
    };
};
export default config;
//# sourceMappingURL=config.d.ts.map