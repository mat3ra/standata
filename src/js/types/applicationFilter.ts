import { ApplicationSchema, ExecutableSchema } from "@mat3ra/esse/dist/js/types";

import { ApplicationExecutableTree } from "./application";

export type FilterTree = ApplicationExecutableTree;

export interface FilterObjectPath {
    path: string;
}

export interface FilterObjectRegex {
    regex: string;
    defaultPath?: string;
}

export type FilterObject = FilterObjectPath | FilterObjectRegex;

export interface FilterObjectsParams
    extends Partial<Pick<ApplicationSchema, "name" | "version" | "build">> {
    filterTree: FilterTree;
    executable?: ExecutableSchema["name"];
    flavor?: string;
}

export interface FilterableEntity {
    path: string;
    [key: string]: any;
}

export interface FilterEntityListParams {
    entitiesOrPaths: (string | FilterableEntity)[];
    filterObjects: FilterObject[];
}

export interface ApplicationModelParametersInterface
    extends Omit<FilterObjectsParams, "filterTree"> {
    modelList: any[];
    name: Required<ApplicationSchema>["name"];
}

export type ModelMethodFilterTree = Record<
    Required<ApplicationSchema>["name"],
    Record<
        Required<ApplicationSchema>["version"],
        Record<
            Required<ApplicationSchema>["build"],
            Record<ExecutableSchema["name"], Record<string, FilterObject[]>> | string
        >
    >
>;

export interface ModelMethodMapByApplication {
    models: ModelMethodFilterTree;
    methods: ModelMethodFilterTree;
}

export interface ApplicationMethodParametersInterface
    extends Omit<FilterObjectsParams, "filterTree"> {
    methodList: any[];
    name: Required<ApplicationSchema>["name"];
}
