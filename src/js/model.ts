import { Standata } from "./base";
import MODELS from "./runtime_data/models.json";
import { ModelConfig } from "./types/model";
import { getModelCategoryTags } from "./utils/category";

export class ModelStandata extends Standata<ModelConfig> {
    static runtimeData = MODELS;

    getByName(name: string): ModelConfig | undefined {
        const allModels = this.getAll();
        return allModels.find((model) => model.name === name);
    }

    getByCategory(category: string): ModelConfig[] {
        const allModels = this.getAll();
        return allModels.filter((model) => {
            const categoryPath = `${model.categories.tier1 || "none"}/${
                model.categories.tier2 || "none"
            }/${model.categories.tier3 || "none"}/${model.categories.type || "none"}/${
                model.categories.subtype || "none"
            }`;
            return categoryPath.includes(category);
        });
    }

    getBySubtype(subtype: string): ModelConfig[] {
        const allModels = this.getAll();
        return allModels.filter((model) => model.categories.subtype === subtype);
    }

    getByTags(...tags: string[]): ModelConfig[] {
        const tagSet = new Set<string>(tags);
        const allModels = this.getAll();
        return allModels.filter((model) => {
            const values = getModelCategoryTags(model);
            return values.some((v) => tagSet.has(v));
        });
    }

    getByPath(path: string): ModelConfig[] {
        const allModels = this.getAll();
        return allModels.filter((model) => model.path === path);
    }

    getByParameters(parameters: Record<string, any>): ModelConfig[] {
        const allModels = this.getAll();
        return allModels.filter((model) => {
            if (!model.parameters) return false;
            return Object.entries(parameters).every(
                ([key, value]) => model.parameters![key] === value,
            );
        });
    }

    getAllModelNames(): string[] {
        const allModels = this.getAll();
        return allModels.map((model) => model.name);
    }

    getAllModelPaths(): string[] {
        const allModels = this.getAll();
        return allModels.map((model) => model.path);
    }

    getUniqueSubtypes(): string[] {
        const allModels = this.getAll();
        const subtypes = new Set(
            allModels
                .map((model) => model.categories.subtype)
                .filter((subtype): subtype is string => subtype !== undefined),
        );
        return Array.from(subtypes);
    }
}
