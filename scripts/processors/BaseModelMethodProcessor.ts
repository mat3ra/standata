/* eslint-disable class-methods-use-this */
import { CategorizedEntityProcessor } from "./CategorizedEntityProcessor";
import { EntityProcessorOptions } from "./EntityProcessor";
import type { CategoryCollectOptions, CategorySets } from "./types";

export interface ModelMethodProcessorOptions extends EntityProcessorOptions {
    categoryCollectOptions?: CategoryCollectOptions;
}

export abstract class BaseModelMethodProcessor extends CategorizedEntityProcessor {
    protected readonly options: ModelMethodProcessorOptions;

    constructor(options: ModelMethodProcessorOptions) {
        super(options);
        this.options = options;
    }

    public getCategoryCollectOptions() {
        return {
            includeUnits: false,
            includeTags: false,
            includeEntitiesMap: false,
            ...this.options.categoryCollectOptions,
        } as const;
    }

    public addCategoriesFromObject(
        obj: Record<string, unknown>,
        categoryKeys: string[],
        includeTags: boolean,
        categorySets: CategorySets,
    ): void {
        const categories = obj?.categories as Record<string, string> | undefined;
        if (categories) {
            categoryKeys.forEach((key) => {
                const v = categories[key];
                if (typeof v === "string" && v) categorySets[key].add(v);
            });
        }
        if (includeTags && Array.isArray(obj?.tags)) {
            (obj.tags as string[]).forEach((t) => categorySets.tags.add(t));
        }
    }

    public addCategoriesToSet(
        obj: Record<string, unknown>,
        categoryKeys: string[],
        includeTags: boolean,
        target: Set<string>,
    ): void {
        const categories = obj?.categories as Record<string, string> | undefined;
        if (categories) {
            categoryKeys.forEach((key) => {
                const v = categories[key];
                if (typeof v === "string" && v) target.add(v);
            });
        }
        if (includeTags && Array.isArray(obj?.tags)) {
            (obj.tags as string[]).forEach((t) => target.add(t));
        }
    }

    protected getDataSubdirectory(entity: Record<string, unknown>): string {
        const fullPathAsURL = typeof entity.path === "string" ? entity.path : "";
        return fullPathAsURL.split("?")[0];
    }
}
