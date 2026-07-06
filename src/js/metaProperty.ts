import PSEUDOPOTENTIALS from "./runtime_data/metaProperties/pseudos.json";

export interface MetaPropertySeedEntry {
    slug: string;
    data: Record<string, unknown>;
    source?: {
        info: Record<string, unknown>;
        type: string;
    };
}

export class MetaPropertyStandata {
    static getPseudopotentials(): MetaPropertySeedEntry[] {
        return PSEUDOPOTENTIALS as MetaPropertySeedEntry[];
    }
}
