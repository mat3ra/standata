import type { MetaPropertySeedEntry } from "./metaPropertyBase";
import { PseudopotentialStandata } from "./pseudopotential";

export type {
    MetaPropertyData,
    MetaPropertyDataMatcher,
    MetaPropertyFilter,
    MetaPropertySeedEntry,
} from "./metaPropertyBase";
export { BaseMetaPropertyStandata } from "./metaPropertyBase";
export type { PseudopotentialFilter } from "./pseudopotential";
export { PseudopotentialStandata } from "./pseudopotential";

/** Known meta-property method names. Extend as new meta-property types are added. */
export type MetaPropertyMethodName = "pseudopotential";

const GET_ALL_BY_METHOD_NAME: Record<MetaPropertyMethodName, () => MetaPropertySeedEntry[]> = {
    pseudopotential: () => PseudopotentialStandata.getAll(),
};

/**
 * Server-only entry point (statically imports large seed data): import from
 * "@mat3ra/standata/dist/js/metaProperty", never from the package root.
 */
export class MetaPropertyStandata {
    static getAllByMethodName(methodName: MetaPropertyMethodName): MetaPropertySeedEntry[] {
        const getAll = GET_ALL_BY_METHOD_NAME[methodName];
        if (!getAll) {
            throw new Error(`Unknown meta-property method name: ${methodName}`);
        }
        return getAll();
    }
}
