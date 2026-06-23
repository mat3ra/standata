export interface ModelConfig {
    name: string;
    path: string;
    categories: {
        tier1?: string;
        tier2?: string;
        tier3?: string;
        type?: string;
        subtype?: string;
    };
    parameters?: Record<string, any>;
    tags?: string[];
}
