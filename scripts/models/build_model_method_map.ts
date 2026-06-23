import serverUtils from "@mat3ra/utils/server";

import { BUILD_CONFIG } from "../../build-config";
import {
    FilterRule,
    ModelCategories,
    ModelMethodFilterEntry,
} from "../../src/js/types/modelMethodFilter";
import { readYAMLFileResolved } from "../utils";

function parseModelCategories(categoryPath: string[]): ModelCategories {
    const categories: ModelCategories = {};

    if (categoryPath[0]) categories.tier1 = categoryPath[0];
    if (categoryPath[1]) categories.tier2 = categoryPath[1];
    if (categoryPath[2]) categories.tier3 = categoryPath[2];
    if (categoryPath[3]) categories.type = categoryPath[3];
    if (categoryPath[4]) categories.subtype = categoryPath[4];

    return categories;
}

function traverseNestedCategories(
    obj: any,
    currentPath: string[],
    filterEntries: ModelMethodFilterEntry[],
): void {
    for (const [key, value] of Object.entries(obj)) {
        if (Array.isArray(value)) {
            const modelCategories = parseModelCategories([...currentPath, key]);
            filterEntries.push({
                modelCategories,
                filterRules: value as FilterRule[],
            });
        } else if (typeof value === "object" && value !== null) {
            traverseNestedCategories(value, [...currentPath, key], filterEntries);
        }
    }
}

export function buildModelMethodMap(): void {
    const sourceFile = `./${BUILD_CONFIG.models.assets.path}/${BUILD_CONFIG.models.assets.modelMethodMap}`;
    const targetFile = `./${BUILD_CONFIG.models.build.path}/${BUILD_CONFIG.models.build.modelMethodMap}`;

    console.log(`Building model-method map from ${sourceFile}...`);

    const yamlData = readYAMLFileResolved(sourceFile) as Record<string, any>;

    const filterEntries: ModelMethodFilterEntry[] = [];
    traverseNestedCategories(yamlData, [], filterEntries);

    serverUtils.json.writeJSONFileSync(targetFile, filterEntries);
    console.log(`Generated: ${targetFile}`);
    console.log(`Model-method map built successfully with ${filterEntries.length} entries`);
}

// Run if called directly
if (require.main === module) {
    buildModelMethodMap();
}
