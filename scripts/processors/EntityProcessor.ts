import { Utils } from "@mat3ra/utils";
import serverUtils from "@mat3ra/utils/server";
import * as fs from "fs";
import * as path from "path";

import { BUILD_CONFIG } from "../../build-config";
import { EntityItem, RuntimeData, StandataConfig } from "../../src/js/types/standata";
import {
    encodeDataAsURLPath,
    findJsonFilesRecursively,
    readYAMLFileResolved,
    resolveFromRoot,
} from "../utils";
import type { BuildArtifact } from "./types";

export interface EntityProcessorOptions {
    rootDir: string;
    entityNamePlural: string;
    assetsDir: string;
    dataDir: string;
    buildDir: string;
    categoriesRelativePath: string;
    categoryKeys?: readonly string[];
    excludedAssetFiles?: string[];
    areKeysSorted?: boolean;
    excludeKeys?: string[];
}

export type AssetRecord<T = unknown> = {
    sourceFile: string;
    entities: T[];
};

export abstract class EntityProcessor {
    protected readonly options: EntityProcessorOptions;

    protected readonly resolvedPaths: {
        assetsDir: string;
        srcPythonDataDir: string;
        dataDir: string;
        buildDir: string;
        distRuntimeDir?: string;
    };

    protected assets: AssetRecord[] = [];

    distRuntimeDir = BUILD_CONFIG.distRuntimeDataDir;

    srcPythonDataDir = BUILD_CONFIG.srcPythonRuntimeDataDir;

    constructor(options: EntityProcessorOptions) {
        this.options = options;
        this.resolvedPaths = {
            assetsDir: resolveFromRoot(options.rootDir, options.assetsDir),
            srcPythonDataDir: resolveFromRoot(options.rootDir, this.srcPythonDataDir),
            dataDir: resolveFromRoot(options.rootDir, options.dataDir),
            buildDir: resolveFromRoot(options.rootDir, options.buildDir),
            distRuntimeDir: resolveFromRoot(options.rootDir, this.distRuntimeDir),
        };
    }

    // Hooks
    // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
    protected transformEntity(entity: unknown, _sourceFile: string): unknown {
        return entity;
    }

    // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
    protected getDataSubdirectory(_entity: unknown, _sourceFile: string): string {
        return "";
    }

    // eslint-disable-next-line class-methods-use-this
    protected additionalProcessing(): void {}

    // eslint-disable-next-line class-methods-use-this
    protected getBuildArtifacts(): BuildArtifact[] {
        return [];
    }

    // Default implementations
    public readAssets() {
        const yamlFiles = serverUtils.file.getFilesInDirectory(this.resolvedPaths.assetsDir, [
            ".yml",
            ".yaml",
        ]);
        const excludeFiles = this.getExcludedAssetFiles();

        this.assets = yamlFiles
            .filter((filePath: string) => {
                const basename = path.basename(filePath);
                return !excludeFiles.includes(basename);
            })
            .map((filePath: string) => {
                const parsed = readYAMLFileResolved(filePath);
                const entities = Utils.array.normalizeToArray(parsed);
                return { sourceFile: filePath, entities } as AssetRecord;
            });
    }

    protected getExcludedAssetFiles(): string[] {
        const excludeFiles: string[] = [...(this.options.excludedAssetFiles || [])];
        if (this.options.categoriesRelativePath) {
            excludeFiles.push(path.basename(this.options.categoriesRelativePath));
        }
        return excludeFiles;
    }

    public writeBuildDirectoryContent(): void {
        if (!this.resolvedPaths.buildDir) return;

        // Write special build artifacts (maps, aggregations, etc.)
        const artifacts = this.getBuildArtifacts();
        if (artifacts.length > 0) {
            serverUtils.file.createDirIfNotExistsSync(this.resolvedPaths.buildDir);
            artifacts.forEach(({ relativePath, content }) => {
                const targetPath = path.resolve(
                    this.resolvedPaths.buildDir as string,
                    relativePath,
                );
                serverUtils.file.createDirIfNotExistsSync(path.dirname(targetPath));
                serverUtils.json.writeJSONFileSync(targetPath, content, {
                    spaces: BUILD_CONFIG.buildJSONFormat.spaces,
                });
                console.log(`  Built: ${targetPath}`);
            });
        }

        // Copy and minify entity JSON files from data/ to build/
        this.copyAndMinifyFromDataToBuild();
    }

    protected copyAndMinifyFromDataToBuild(): void {
        const { dataDir, buildDir } = this.resolvedPaths;

        if (!dataDir || !buildDir) {
            return;
        }

        if (!fs.existsSync(dataDir)) {
            console.warn(`  Warning: Data directory ${dataDir} does not exist`);
            return;
        }

        const files = serverUtils.file.getFilesInDirectory(dataDir, [".json"]);

        if (files.length === 0) {
            return;
        }

        serverUtils.file.createDirIfNotExistsSync(buildDir);

        files.forEach((filePath: string) => {
            const relativePath = path.relative(dataDir, filePath);
            const destinationPath = path.resolve(buildDir, relativePath);

            serverUtils.file.createDirIfNotExistsSync(path.dirname(destinationPath));

            const content = serverUtils.json.readJSONFileSync(filePath);

            serverUtils.json.writeJSONFileSync(destinationPath, content, {
                spaces: BUILD_CONFIG.buildJSONFormat.spaces,
            });
            console.log(`  Built: ${destinationPath}`);
        });
    }

    protected cleanDataDirectory(): void {
        const { dataDir } = this.resolvedPaths;
        if (!fs.existsSync(dataDir)) {
            return;
        }

        console.log(`  Cleaning ${dataDir}...`);

        const files = findJsonFilesRecursively(dataDir);
        findJsonFilesRecursively(dataDir).forEach(fs.unlinkSync);

        console.log(`  Removed ${files.length} files`);
    }

    public writeDataDirectoryContent(): void {
        const { dataDir } = this.resolvedPaths;
        const categoryKeys = this.options.categoryKeys || [];

        serverUtils.file.createDirIfNotExistsSync(dataDir);

        this.assets.forEach(({ sourceFile, entities }) => {
            entities.forEach((entity: unknown) => {
                const raw =
                    typeof entity === "object" && entity !== null
                        ? { ...(entity as object) }
                        : entity;

                const transformed = this.transformEntity(raw, sourceFile) as Record<
                    string,
                    unknown
                >;
                if (!transformed.path && categoryKeys.length > 0) {
                    transformed.path = encodeDataAsURLPath(transformed, categoryKeys);
                }
                delete transformed.schema;

                const subdir = this.getDataSubdirectory(transformed, sourceFile);
                const targetDir = path.join(dataDir, subdir);
                const filename = `${Utils.str.createSafeFilename(
                    transformed.name || "entity",
                )}.json`;
                const targetPath = path.join(targetDir, filename);
                serverUtils.json.writeJSONFileSync(targetPath, transformed, {
                    spaces: BUILD_CONFIG.dataJSONFormat.spaces,
                });
                console.log(`  Created: ${targetPath}`);
            });
        });
    }

    public writeDistDirectoryContent(): void {
        const entityRuntimeDir = path.resolve(
            this.resolvedPaths.distRuntimeDir as string,
            Utils.str.createSafeFilename(this.options.entityNamePlural),
        );
        serverUtils.file.createDirIfNotExistsSync(entityRuntimeDir);

        this.copyJsonFiles(this.resolvedPaths.buildDir, entityRuntimeDir);
    }

    protected copyJsonFiles(fromDir: string, destinationBaseDir: string): void {
        if (!fromDir || !fs.existsSync(fromDir)) return;
        const files = serverUtils.file.getFilesInDirectory(fromDir, [".json"]);
        const shouldSort = this.options.areKeysSorted !== false;
        files.forEach((filePath: string) => {
            const relativePath = path.relative(fromDir, filePath);
            const destinationPath = path.resolve(destinationBaseDir, relativePath);
            serverUtils.file.createDirIfNotExistsSync(path.dirname(destinationPath));
            const content = serverUtils.json.readJSONFileSync(filePath);
            const finalContent = shouldSort
                ? Utils.object.sortKeysDeepForObjectWithExclude(content, this.options.excludeKeys)
                : content;
            serverUtils.json.writeJSONFileSync(destinationPath, finalContent, {
                spaces: BUILD_CONFIG.buildJSONFormat.spaces,
            });
            console.log(`  Dist: ${destinationPath}`);
        });
    }

    // eslint-disable-next-line class-methods-use-this
    public updateCategoriesFile(): void {}

    // Runtime data generation

    get categoriesPath(): string {
        return path.resolve(
            resolveFromRoot(this.options.rootDir, this.options.assetsDir),
            this.options.categoriesRelativePath,
        );
    }

    get runtimeDataJsPath(): string {
        return path.resolve(
            this.resolvedPaths.distRuntimeDir as string,
            `${Utils.str.createSafeFilename(this.options.entityNamePlural)}.json`,
        );
    }

    get runtimeDataPyPath(): string {
        return path.resolve(
            this.resolvedPaths.srcPythonDataDir as string,
            `${Utils.str.createSafeFilename(this.options.entityNamePlural)}.py`,
        );
    }

    protected generateRuntimeDataConfig(): RuntimeData {
        // Read categories YAML
        const categoriesContent = serverUtils.yaml.readYAMLFileSync(
            this.categoriesPath,
        ) as StandataConfig;
        const { entities } = categoriesContent;

        // Build runtime data object
        const runtimeDataConfig: RuntimeData = {
            standataConfig: categoriesContent,
            filesMapByName: {},
        };

        // Load each entity's JSON file
        entities.forEach((entity: EntityItem) => {
            const entityPath = path.join(this.resolvedPaths.dataDir, entity.filename);
            console.log(`  Loading entity file: ${entityPath}`);
            if (fs.existsSync(entityPath)) {
                console.log(`    Found. Loading...`);
                const content = serverUtils.json.readJSONFileSync(entityPath);
                runtimeDataConfig.filesMapByName[entity.filename] = content;
            } else {
                console.warn(`  Warning: Entity file not found: ${entityPath}`);
            }
        });
        return runtimeDataConfig;
    }

    static createJsRuntimeFile(
        content: object,
        fullPath: string,
        areKeysSorted = true,
        excludeKeys: string[] = [],
    ): void {
        const finalContent = areKeysSorted
            ? Utils.object.sortKeysDeepForObjectWithExclude(content, excludeKeys)
            : content;
        serverUtils.json.writeJSONFileSync(fullPath, finalContent, { spaces: 0 });
        console.log(`Written JS runtime data to "${fullPath}"`);
    }

    public createPythonRuntimeModule(content: object, fullPath: string): void {
        const pyContent = `import json\n\n${
            this.options.entityNamePlural
        }_data = json.loads(r'''${JSON.stringify(content)}''')\n`;
        fs.writeFileSync(fullPath, pyContent, "utf8");
        console.log(`Written Python Module to "${fullPath}"`);
    }

    protected generateRuntimeFiles() {
        const runtimeData = this.generateRuntimeDataConfig();
        EntityProcessor.createJsRuntimeFile(
            runtimeData,
            this.runtimeDataJsPath,
            this.options.areKeysSorted,
            this.options.excludeKeys,
        );
        this.createPythonRuntimeModule(runtimeData, this.runtimeDataPyPath);
    }

    // End of Runtime data generation

    public process(): void {
        console.log(`▶ Processing ${this.options.entityNamePlural} ...`);
        this.readAssets();
        this.cleanDataDirectory();
        this.writeDataDirectoryContent();
        this.writeBuildDirectoryContent();
        this.writeDistDirectoryContent();
        this.updateCategoriesFile();
        this.generateRuntimeFiles();
        this.additionalProcessing();
        console.log(`✅ ${this.options.entityNamePlural} completed.`);
    }
}
