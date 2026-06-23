export interface FilterRule {
    path?: string;
    regex?: string;
}

export interface ModelCategories {
    tier1?: string;
    tier2?: string;
    tier3?: string;
    type?: string;
    subtype?: string;
}

export interface ModelMethodFilterEntry {
    modelCategories: ModelCategories;
    filterRules: FilterRule[];
}
