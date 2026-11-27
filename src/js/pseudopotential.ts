import type { MetaPropertyHolderSchema } from "@mat3ra/esse/dist/js/types";

import PSEUDOPOTENTIALS_BY_COLLECTION from "./runtime_data/metaProperties/pseudopotentials.json";

export type MetaPropertySeedEntry = Required<
    Pick<MetaPropertyHolderSchema, "slug" | "data" | "source">
>;

type PseudopotentialData = MetaPropertySeedEntry["data"];

/**
 * Criteria for PseudopotentialStandata.filter(). Every given field must match; omitted fields match all.
 * `collection` is the per-archive file name from the `pseudos` repo, e.g. "dojo-jth_paw_pbe_1.1".
 */
export interface PseudopotentialFilter {
    collection?: string;
    element?: string;
    application?: string;
    approximation?: string;
    functional?: string;
    source?: string;
    type?: PseudopotentialData["type"];
    version?: string;
}

type DataFilterKey = Exclude<keyof PseudopotentialFilter, "collection">;

/** How each filter field is matched against an entry's `data`. */
const DATA_MATCHERS: Record<DataFilterKey, (data: PseudopotentialData, value: string) => boolean> =
    {
        element: (data, value) => data.element === value,
        application: (data, value) => data.apps.includes(value),
        approximation: (data, value) => data.exchangeCorrelation.approximation === value,
        functional: (data, value) => data.exchangeCorrelation.functional === value,
        source: (data, value) => data.source === value,
        type: (data, value) => data.type === value,
        version: (data, value) => data.version === value,
    };

const COLLECTIONS = PSEUDOPOTENTIALS_BY_COLLECTION as unknown as Record<
    string,
    MetaPropertySeedEntry[]
>;

export class PseudopotentialStandata {
    /** Collection names, one per source archive, sorted. */
    static getCollectionNames(): string[] {
        return Object.keys(COLLECTIONS).sort();
    }

    /** All pseudopotentials across every collection, e.g. to seed the database in one call. */
    static getAll(): MetaPropertySeedEntry[] {
        return Object.values(COLLECTIONS).flat();
    }

    static getByCollection(collectionName: string): MetaPropertySeedEntry[] {
        const entries = COLLECTIONS[collectionName];
        if (!entries) {
            throw new Error(`Unknown pseudopotential collection: ${collectionName}`);
        }
        return entries;
    }

    static filter({
        collection,
        ...criteria
    }: PseudopotentialFilter = {}): MetaPropertySeedEntry[] {
        const entries = collection ? this.getByCollection(collection) : this.getAll();
        const activeCriteria = Object.entries(criteria).filter(
            ([, value]) => value !== undefined,
        ) as [DataFilterKey, string][];
        return entries.filter(({ data }) =>
            activeCriteria.every(([key, value]) => DATA_MATCHERS[key](data, value)),
        );
    }
}
