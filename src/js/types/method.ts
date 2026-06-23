import { CategorizedUnitMethod } from "@mat3ra/esse/dist/js/types";

// TODO: maybe change ESSE Schema. We expect these properties to be defined in UnitMethod
export interface UnitMethod extends CategorizedUnitMethod {
    categories: Required<CategorizedUnitMethod>["categories"] & {
        type: Required<CategorizedUnitMethod>["categories"]["type"];
        subtype: Required<CategorizedUnitMethod>["categories"]["subtype"];
    };
    parameters: Record<string, any>;
    tags: Required<CategorizedUnitMethod>["tags"];
    path: Required<CategorizedUnitMethod>["path"];
}

export interface MethodConfig {
    name: string;
    shortName?: string;
    path: string;
    units: UnitMethod[];
}
