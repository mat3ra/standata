import MODEL_METHOD_MAP from "./runtime_data/models/modelMethodMap.json";
import type { MethodConfig, UnitMethod } from "./types/method";
import type { ModelConfig } from "./types/model";
import { FilterRule, ModelCategories, ModelMethodFilterEntry } from "./types/modelMethodFilter";

export type ModelMethodFilterMap = ModelMethodFilterEntry[];

export class ModelMethodFilter {
    private filterMap: ModelMethodFilterMap;

    constructor() {
        this.filterMap = MODEL_METHOD_MAP as ModelMethodFilterMap;
    }

    getCompatibleMethods(model: ModelConfig, allMethods: MethodConfig[]): MethodConfig[] {
        const filterRules = this.getFilterRulesForModel(model);
        if (!filterRules.length) {
            return [];
        }

        return allMethods.filter((method) => this.isMethodCompatible(method, filterRules));
    }

    private getFilterRulesForModel(model: ModelConfig): FilterRule[] {
        const modelCategories = model.categories;

        // Find matching filter entries
        const matchingEntries = this.filterMap.filter((entry) =>
            this.categoriesMatch(modelCategories, entry.modelCategories),
        );

        // Combine all filter rules from matching entries
        return matchingEntries.flatMap((entry) => entry.filterRules);
    }

    // eslint-disable-next-line class-methods-use-this
    private categoriesMatch(modelCategories: any, filterCategories: ModelCategories): boolean {
        // Check if model categories match the filter criteria
        // Undefined filter categories act as wildcards (match anything)
        return (
            (!filterCategories.tier1 || modelCategories.tier1 === filterCategories.tier1) &&
            (!filterCategories.tier2 || modelCategories.tier2 === filterCategories.tier2) &&
            (!filterCategories.tier3 || modelCategories.tier3 === filterCategories.tier3) &&
            (!filterCategories.type || modelCategories.type === filterCategories.type) &&
            (!filterCategories.subtype || modelCategories.subtype === filterCategories.subtype)
        );
    }

    private isMethodCompatible(method: MethodConfig, filterRules: FilterRule[]): boolean {
        return method.units.every((unit: UnitMethod) =>
            filterRules.some((rule) => this.isUnitMatchingRule(unit, rule)),
        );
    }

    // eslint-disable-next-line class-methods-use-this
    private isUnitMatchingRule(unit: UnitMethod, rule: FilterRule): boolean {
        if (rule.path) {
            return unit.path === rule.path;
        }

        if (rule.regex) {
            try {
                const regex = new RegExp(rule.regex);
                return regex.test(unit.path);
            } catch (error) {
                console.warn(`Invalid regex pattern: ${rule.regex}`, error);
                return false;
            }
        }

        return false;
    }

    getFilterMap(): ModelMethodFilterMap {
        return this.filterMap;
    }

    getAllFilterRules(): FilterRule[] {
        return this.filterMap.flatMap((entry) => entry.filterRules);
    }

    getUniqueFilterPaths(): string[] {
        const rules = this.getAllFilterRules();
        const paths = new Set(
            rules.map((rule) => rule.path).filter((path): path is string => path !== undefined),
        );
        return Array.from(paths);
    }

    getUniqueFilterRegexes(): string[] {
        const rules = this.getAllFilterRules();
        const regexes = new Set(
            rules.map((rule) => rule.regex).filter((regex): regex is string => regex !== undefined),
        );
        return Array.from(regexes);
    }
}

/**
 * Convenience function to filter methods by model
 * This is a helper wrapper around ModelMethodFilter.getCompatibleMethods()
 *
 * @param methodList - Array of method configs to filter
 * @param model - Model config to use for filtering
 * @returns Filtered array of compatible method configs
 */
export function filterMethodsByModel({
    methodList,
    model,
}: {
    methodList: MethodConfig[];
    model?: ModelConfig;
}): MethodConfig[] {
    if (!model) return [];

    const modelMethodFilter = new ModelMethodFilter();
    return modelMethodFilter.getCompatibleMethods(model, methodList);
}
