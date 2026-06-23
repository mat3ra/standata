import type { MethodConfig } from "./types/method";
import type { ModelConfig } from "./types/model";
import { FilterRule, ModelMethodFilterEntry } from "./types/modelMethodFilter";
export type ModelMethodFilterMap = ModelMethodFilterEntry[];
export declare class ModelMethodFilter {
    private filterMap;
    constructor();
    getCompatibleMethods(model: ModelConfig, allMethods: MethodConfig[]): MethodConfig[];
    private getFilterRulesForModel;
    private categoriesMatch;
    private isMethodCompatible;
    private isUnitMatchingRule;
    getFilterMap(): ModelMethodFilterMap;
    getAllFilterRules(): FilterRule[];
    getUniqueFilterPaths(): string[];
    getUniqueFilterRegexes(): string[];
}
/**
 * Convenience function to filter methods by model
 * This is a helper wrapper around ModelMethodFilter.getCompatibleMethods()
 *
 * @param methodList - Array of method configs to filter
 * @param model - Model config to use for filtering
 * @returns Filtered array of compatible method configs
 */
export declare function filterMethodsByModel({ methodList, model, }: {
    methodList: MethodConfig[];
    model?: ModelConfig;
}): MethodConfig[];
