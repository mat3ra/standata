/* eslint-disable class-methods-use-this */
import workflowSchema from "@mat3ra/esse/dist/js/schema/workflow.json";
import { validateAndClean } from "@mat3ra/esse/dist/js/utils/ajv";
import { Utils } from "@mat3ra/utils";
import serverUtils from "@mat3ra/utils/server";
import path from "path";

import { BUILD_CONFIG } from "../../build-config";
import { loadYAMLFilesAsMap, readYAMLFileResolved } from "../utils";
import { CategorizedEntityProcessor } from "./CategorizedEntityProcessor";
import { EntityProcessorOptions } from "./EntityProcessor";
import type {
    CategorySets,
    EntityMapByApplication,
    WorkflowEntityConfig,
    WorkflowEntityData,
} from "./types";

export abstract class BaseWorkflowSubworkflowProcessor<
    T extends object = object,
> extends CategorizedEntityProcessor {
    protected applications: string[] = [];

    public entityMapByApplication: EntityMapByApplication<T>;

    public entityConfigs: WorkflowEntityConfig[];

    constructor(options: EntityProcessorOptions) {
        super(options);
        this.entityMapByApplication = {};
        this.entityConfigs = [];
        this.applications = this.getApplicationsListFromYAML();
    }

    private getApplicationsListFromYAML(): string[] {
        const appsPath = `${BUILD_CONFIG.applications.assets.path}/applications/application_data.yml`;
        const resolvedAppsPath = path.resolve(__dirname, "../../", appsPath);
        const appsYAML = readYAMLFileResolved(resolvedAppsPath);

        return Object.keys(appsYAML);
    }

    public getCategoryCollectOptions() {
        return {
            includeUnits: true,
            includeTags: true,
            includeEntitiesMap: true,
        } as const;
    }

    public addCategoriesFromObject(
        obj: Record<string, unknown>,
        categoryKeys: string[],
        includeTags: boolean,
        categorySets: CategorySets,
    ): void {
        categoryKeys.forEach((key) => {
            let value = obj[key];
            if (
                key === "application" &&
                value &&
                typeof value === "object" &&
                value !== null &&
                "name" in value
            ) {
                value = (value as { name: string }).name;
            }
            if (Array.isArray(value)) {
                value.forEach((v: unknown) => {
                    if (typeof v === "string" && v) categorySets[key].add(v);
                });
            } else if (typeof value === "string" && value) {
                categorySets[key].add(value);
            }
        });
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
        categoryKeys.forEach((key) => {
            let value = obj[key];
            if (
                key === "application" &&
                value &&
                typeof value === "object" &&
                value !== null &&
                "name" in value
            ) {
                value = (value as { name: string }).name;
            }
            if (Array.isArray(value)) {
                value.forEach((v: unknown) => {
                    if (typeof v === "string" && v) target.add(v);
                });
            } else if (typeof value === "string" && value) {
                target.add(value);
            }
        });
        if (includeTags && Array.isArray(obj?.tags)) {
            (obj.tags as string[]).forEach((t) => target.add(t));
        }
    }

    public setEntityMapByApplication() {
        this.applications.forEach((name) => {
            const pathForName = `${this.resolvedPaths.assetsDir}/${name}`;
            this.entityMapByApplication[name] = loadYAMLFilesAsMap<T>(pathForName);
        });
    }

    protected getSafeNameFromPath(pathInSource: string | undefined, fallbackName: string): string {
        return pathInSource || Utils.str.createSafeFilename(fallbackName);
    }

    protected buildConfigFromEntityData(
        entityData: WorkflowEntityData<T>,
        entityName: string,
        appName: string,
        entity: object,
    ): WorkflowEntityConfig {
        const pathInSource = entityData.__path__;
        const safeName = this.getSafeNameFromPath(pathInSource, entityName);
        const tags = entityData?.tags;
        const hasTags = Array.isArray(tags) && tags.length > 0;

        return {
            appName,
            safeName,
            config: entity,
            ...(hasTags ? { tags } : {}),
        };
    }

    protected abstract buildEntityConfigs(): WorkflowEntityConfig[];

    public readAssets() {
        this.setEntityMapByApplication();
        // read assets to be able to run buildEntityConfigs
        super.readAssets();
        this.entityConfigs = this.buildEntityConfigs();
    }

    private writeEntityConfigs(dirPath: string, minified = true): void {
        this.entityConfigs.forEach((entityConfig) => {
            const entityName = entityConfig.safeName;
            const targetPath = `${dirPath}/${entityConfig.appName}/${entityName}.json`;
            const dataToWrite = {
                ...entityConfig.config,
                ...(entityConfig.tags ? { tags: entityConfig.tags } : {}),
                ...(entityConfig.appName ? { application: { name: entityConfig.appName } } : {}),
            };
            if (this.options.entityNamePlural === "workflows") {
                const result = validateAndClean(dataToWrite, workflowSchema, {
                    coerceTypes: false,
                    useDefaults: false,
                });
                if (!result.isValid && result.errors?.length) {
                    const errMsg = result.errors
                        .map((e: any) => `${e.instancePath ?? ""} ${e.message}`)
                        .join("; ");
                    throw new Error(
                        `workflows validation failed for ${entityConfig.appName}/${entityName}: ${errMsg}`,
                    );
                }
            }
            const spaces = minified
                ? BUILD_CONFIG.buildJSONFormat.spaces
                : BUILD_CONFIG.dataJSONFormat.spaces;
            serverUtils.json.writeJSONFileSync(targetPath, dataToWrite, { spaces });
        });
    }

    public writeBuildDirectoryContent(): void {
        this.writeEntityConfigs(this.resolvedPaths.buildDir, true);
    }

    public writeDataDirectoryContent() {
        super.writeDataDirectoryContent();
        this.writeEntityConfigs(this.resolvedPaths.dataDir, false);
    }
}
