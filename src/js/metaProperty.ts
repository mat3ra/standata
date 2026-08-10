import PSEUDOPOTENTIALS from "./runtime_data/metaProperties/pseudos.json";

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

const META_PROPERTIES_BY_METHOD_NAME: Record<MetaPropertyMethodName, MetaPropertySeedEntry[]> = {
    pseudopotential: PSEUDOPOTENTIALS as MetaPropertySeedEntry[],
};

export class MetaPropertyStandata {
    static getAllByMethodName(methodName: MetaPropertyMethodName): MetaPropertySeedEntry[] {
        const entries = META_PROPERTIES_BY_METHOD_NAME[methodName];
        if (!entries) {
            throw new Error(`Unknown meta-property method name: ${methodName}`);
        }
        return entries;
    }
}
