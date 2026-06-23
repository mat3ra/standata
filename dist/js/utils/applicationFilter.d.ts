import { FilterTree } from "../types/applicationFilter";
export declare enum FilterMode {
    ANY_MATCH = "ANY",// OR logic - at least one filter must match (for models)
    ALL_MATCH = "ALL"
}
export declare abstract class ApplicationFilterStandata {
    protected filterTree: FilterTree;
    protected filterMode: FilterMode;
    constructor(filterTree: FilterTree, filterMode?: FilterMode);
    protected filterByApplicationParameters(entityList: any[], name: string, version?: string, build?: string, executable?: string, flavor?: string): any[];
    getAvailableEntities(name: string): any;
    protected filterByApplicationParametersGetDefault(entityList: any[], name: string, version?: string, build?: string, executable?: string, flavor?: string): any;
}
