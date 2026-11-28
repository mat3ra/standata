import {
    type MetaPropertyData,
    type MetaPropertyDataMatcher,
    type MetaPropertySeedEntry,
    BaseMetaPropertyStandata,
} from "./metaPropertyBase";
import PSEUDOPOTENTIALS_BY_COLLECTION from "./runtime_data/metaProperties/pseudopotentials.json";

export type { MetaPropertySeedEntry } from "./metaPropertyBase";

/**
 * Criteria for PseudopotentialStandata.filter(). Every given field must match; omitted fields match all.
 * `collection` is the per-archive file name from the `pseudos` repo, e.g. "dojo-jth_paw_pbe_1.1".
 */
export type PseudopotentialFilter = {
    collection?: string;
    element?: string;
    application?: string;
    approximation?: string;
    functional?: string;
    source?: string;
    type?: MetaPropertyData["type"];
    version?: string;
};

type DataFilterKey = Exclude<keyof PseudopotentialFilter, "collection">;

/** How each filter field is matched against an entry's `data`. */
const DATA_MATCHERS: Record<DataFilterKey, MetaPropertyDataMatcher> = {
    element: (data, value) => data.element === value,
    application: (data, value) => data.apps.includes(value),
    approximation: (data, value) => data.exchangeCorrelation.approximation === value,
    functional: (data, value) => data.exchangeCorrelation.functional === value,
    source: (data, value) => data.source === value,
    type: (data, value) => data.type === value,
    version: (data, value) => data.version === value,
};

export class PseudopotentialStandata extends BaseMetaPropertyStandata {
    protected static collections = PSEUDOPOTENTIALS_BY_COLLECTION as unknown as Record<
        string,
        MetaPropertySeedEntry[]
    >;

    protected static dataMatchers = DATA_MATCHERS;

    protected static entityName = "pseudopotential";

    /** Narrows the base filter to the pseudopotential fields. */
    static filter(filter: PseudopotentialFilter = {}): MetaPropertySeedEntry[] {
        return super.filter(filter);
    }
}
