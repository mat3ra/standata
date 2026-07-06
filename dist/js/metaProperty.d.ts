export interface MetaPropertySeedEntry {
    slug: string;
    data: Record<string, unknown>;
    source?: {
        info: Record<string, unknown>;
        type: string;
    };
}
export declare class MetaPropertyStandata {
    static getPseudopotentials(): MetaPropertySeedEntry[];
}
