import serverUtils from "@mat3ra/utils/server";
import * as fs from "fs";
import * as yaml from "js-yaml";
import * as lodash from "lodash";
import * as path from "path";

import { BUILD_CONFIG } from "../../build-config";
import { findJsonFilesRecursively } from "../utils";
import { EntityProcessor, EntityProcessorOptions } from "./EntityProcessor";
import type { CategoryCollectOptions, CategorySets } from "./types";

export interface ModelMethodProcessorOptions extends EntityProcessorOptions {
    categoryCollectOptions?: CategoryCollectOptions;
}

export abstract class CategorizedEntityProcessor extends EntityProcessor {
    protected readonly options: ModelMethodProcessorOptions;

    constructor(options: ModelMethodProcessorOptions) {
        super(options);
        this.options = options;
    }

    // TODO: move to specific entity processors
    // eslint-disable-next-line class-methods-use-this
    public getCategoryCollectOptions() {
        return {
            includeUnits: false,
            includeTags: false,
            includeEntitiesMap: false,
        };
    }

    public updateCategoriesFile(): void {
        const { categoriesPath } = this;

        const categoryKeys = this.options.categoryKeys || [];
        const { includeUnits, includeTags, includeEntitiesMap } = this.getCategoryCollectOptions();

        const categorySets: CategorySets = Object.fromEntries(
            [...categoryKeys, includeTags ? "tags" : null]
                .filter(Boolean)
                .map((k) => [k as string, new Set<string>()]),
        );
        const entities: { filename: string; categories: string[] }[] = [];

        const jsonFiles = findJsonFilesRecursively(this.resolvedPaths.dataDir);
        // eslint-disable-next-line no-restricted-syntax
        for (const filePath of jsonFiles) {
            console.log(`Processing file: ${filePath}`);
            try {
                const data = serverUtils.json.readJSONFileSync(filePath) as Record<string, unknown>;

                this.addCategoriesFromObject(data, categoryKeys, includeTags, categorySets);
                if (includeUnits && Array.isArray(data.units)) {
                    // eslint-disable-next-line no-restricted-syntax
                    for (const u of data.units as Record<string, unknown>[]) {
                        this.addCategoriesFromObject(u, categoryKeys, includeTags, categorySets);
                    }
                }

                if (includeEntitiesMap) {
                    const relativePath = path.relative(this.resolvedPaths.dataDir, filePath);
                    const flat = new Set<string>();

                    this.addCategoriesToSet(data, categoryKeys, includeTags, flat);
                    if (includeUnits && Array.isArray(data.units)) {
                        // eslint-disable-next-line no-restricted-syntax
                        for (const u of data.units as Record<string, unknown>[]) {
                            this.addCategoriesToSet(u, categoryKeys, includeTags, flat);
                        }
                    }
                    entities.push({ filename: relativePath, categories: Array.from(flat).sort() });
                }
            } catch (e: unknown) {
                const errorMessage = e instanceof Error ? e.message : String(e);
                console.error(`Error processing ${filePath}: ${errorMessage}`);
            }
        }

        const categoriesOut: Record<string, string[]> = {};

        categoryKeys.forEach((key) => {
            const arr = Array.from(categorySets[key]).sort();
            if (arr.length > 0) categoriesOut[key] = arr;
        });

        if (includeTags) {
            const tagsArr = Array.from(categorySets.tags || []).sort();
            if (tagsArr.length > 0) categoriesOut.tags = tagsArr;
        }

        const payload = includeEntitiesMap
            ? {
                  categories: categoriesOut,
                  entities: entities.sort((a, b) => a.filename.localeCompare(b.filename)),
              }
            : { categories: categoriesOut, entities: [] };

        const yamlContent = yaml.dump(payload, {
            indent: BUILD_CONFIG.yamlFormat.indent,
            lineWidth: BUILD_CONFIG.yamlFormat.lineWidth,
            sortKeys: BUILD_CONFIG.yamlFormat.sortKeys as boolean,
        });

        serverUtils.file.createDirIfNotExistsSync(path.dirname(categoriesPath));
        fs.writeFileSync(categoriesPath, yamlContent, "utf-8");
        console.log(`Categories file written to: ${categoriesPath}`);
    }

    // eslint-disable-next-line class-methods-use-this
    public addCategoriesFromObject(
        obj: Record<string, unknown>,
        categoryKeys: readonly string[],
        includeTags: boolean,
        categorySets: CategorySets,
    ) {
        categoryKeys.forEach((key) => {
            const value = lodash.get(obj, key);
            if (typeof value === "string" && value) {
                categorySets[key].add(value);
            }
        });

        if (includeTags && Array.isArray(obj.tags)) {
            (obj.tags as string[]).forEach((t) => categorySets.tags.add(t));
        }
    }

    // eslint-disable-next-line class-methods-use-this
    public addCategoriesToSet(
        obj: Record<string, unknown>,
        categoryKeys: readonly string[],
        includeTags: boolean,
        target: Set<string>,
    ): void {
        categoryKeys.forEach((key) => {
            const value = lodash.get(obj, key);
            if (typeof value === "string" && value) target.add(value);
        });
        if (includeTags && Array.isArray(obj.tags)) {
            (obj.tags as string[]).forEach((t) => target.add(t));
        }
    }
}
