"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelMethodFilter = void 0;
exports.filterMethodsByModel = filterMethodsByModel;
const modelMethodMap_json_1 = __importDefault(require("./runtime_data/models/modelMethodMap.json"));
class ModelMethodFilter {
    constructor() {
        this.filterMap = modelMethodMap_json_1.default;
    }
    getCompatibleMethods(model, allMethods) {
        const filterRules = this.getFilterRulesForModel(model);
        if (!filterRules.length) {
            return [];
        }
        return allMethods.filter((method) => this.isMethodCompatible(method, filterRules));
    }
    getFilterRulesForModel(model) {
        const modelCategories = model.categories;
        // Find matching filter entries
        const matchingEntries = this.filterMap.filter((entry) => this.categoriesMatch(modelCategories, entry.modelCategories));
        // Combine all filter rules from matching entries
        return matchingEntries.flatMap((entry) => entry.filterRules);
    }
    // eslint-disable-next-line class-methods-use-this
    categoriesMatch(modelCategories, filterCategories) {
        // Check if model categories match the filter criteria
        // Undefined filter categories act as wildcards (match anything)
        return ((!filterCategories.tier1 || modelCategories.tier1 === filterCategories.tier1) &&
            (!filterCategories.tier2 || modelCategories.tier2 === filterCategories.tier2) &&
            (!filterCategories.tier3 || modelCategories.tier3 === filterCategories.tier3) &&
            (!filterCategories.type || modelCategories.type === filterCategories.type) &&
            (!filterCategories.subtype || modelCategories.subtype === filterCategories.subtype));
    }
    isMethodCompatible(method, filterRules) {
        return method.units.every((unit) => filterRules.some((rule) => this.isUnitMatchingRule(unit, rule)));
    }
    // eslint-disable-next-line class-methods-use-this
    isUnitMatchingRule(unit, rule) {
        if (rule.path) {
            return unit.path === rule.path;
        }
        if (rule.regex) {
            try {
                const regex = new RegExp(rule.regex);
                return regex.test(unit.path);
            }
            catch (error) {
                console.warn(`Invalid regex pattern: ${rule.regex}`, error);
                return false;
            }
        }
        return false;
    }
    getFilterMap() {
        return this.filterMap;
    }
    getAllFilterRules() {
        return this.filterMap.flatMap((entry) => entry.filterRules);
    }
    getUniqueFilterPaths() {
        const rules = this.getAllFilterRules();
        const paths = new Set(rules.map((rule) => rule.path).filter((path) => path !== undefined));
        return Array.from(paths);
    }
    getUniqueFilterRegexes() {
        const rules = this.getAllFilterRules();
        const regexes = new Set(rules.map((rule) => rule.regex).filter((regex) => regex !== undefined));
        return Array.from(regexes);
    }
}
exports.ModelMethodFilter = ModelMethodFilter;
/**
 * Convenience function to filter methods by model
 * This is a helper wrapper around ModelMethodFilter.getCompatibleMethods()
 *
 * @param methodList - Array of method configs to filter
 * @param model - Model config to use for filtering
 * @returns Filtered array of compatible method configs
 */
function filterMethodsByModel({ methodList, model, }) {
    if (!model)
        return [];
    const modelMethodFilter = new ModelMethodFilter();
    return modelMethodFilter.getCompatibleMethods(model, methodList);
}
