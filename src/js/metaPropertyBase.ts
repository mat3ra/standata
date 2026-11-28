import type { MetaPropertyHolderSchema } from "@mat3ra/esse/dist/js/types";

export type MetaPropertySeedEntry = Required<
    Pick<MetaPropertyHolderSchema, "slug" | "data" | "source">
>;

export type MetaPropertyData = MetaPropertySeedEntry["data"];

/** Matches one filter field against an entry's `data`. */
export type MetaPropertyDataMatcher = (data: MetaPropertyData, value: string) => boolean;

/** `collection` selects one collection; every other given field must match its data matcher. */
export type MetaPropertyFilter = { collection?: string } & Record<string, string | undefined>;

/**
 * Shared lookups over meta-property seed data split into named collections. Subclasses set
 * `collections`, `dataMatchers` and `entityName`, as `Standata` subclasses set `runtimeData`.
 */
export abstract class BaseMetaPropertyStandata {
    protected static collections: Record<string, MetaPropertySeedEntry[]> = {};

    protected static dataMatchers: Record<string, MetaPropertyDataMatcher> = {};

    /** Used in error messages, e.g. "pseudopotential". */
    protected static entityName = "meta-property";

    /** Collection names, sorted. */
    static getCollectionNames(): string[] {
        return Object.keys(this.collections).sort();
    }

    /** All entries across every collection, e.g. to seed the database in one call. */
    static getAll(): MetaPropertySeedEntry[] {
        return Object.values(this.collections).flat();
    }

    static getByCollection(collectionName: string): MetaPropertySeedEntry[] {
        const entries = this.collections[collectionName];
        if (!entries) {
            throw new Error(`Unknown ${this.entityName} collection: ${collectionName}`);
        }
        return entries;
    }

    static filter({ collection, ...criteria }: MetaPropertyFilter = {}): MetaPropertySeedEntry[] {
        const entries = collection ? this.getByCollection(collection) : this.getAll();
        const activeCriteria = Object.entries(criteria).filter(
            (criterion): criterion is [string, string] => criterion[1] !== undefined,
        );
        const matchers = activeCriteria.map(([key, value]) => {
            const matcher = this.dataMatchers[key];
            if (!matcher) {
                throw new Error(`Unknown ${this.entityName} filter field: ${key}`);
            }
            return (data: MetaPropertyData) => matcher(data, value);
        });
        return entries.filter(({ data }) => matchers.every((matches) => matches(data)));
    }
}
