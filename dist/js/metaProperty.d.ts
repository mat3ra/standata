export interface MetaPropertySeedEntry {
    slug: string;
    data: Record<string, unknown>;
    source?: {
        info: Record<string, unknown>;
        type: string;
    };
}
/** Known meta-property method names. Extend as new collections are added. */
export type MetaPropertyMethodName = "pseudopotential";
export declare class MetaPropertyStandata {
    static getAllByMethodName(methodName: MetaPropertyMethodName): MetaPropertySeedEntry[];
}
