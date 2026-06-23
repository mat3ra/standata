import {
    type ExecutableSchema,
    type FlavorSchema,
    type TemplateSchema,
    ApplicationSchema,
} from "@mat3ra/esse/dist/js/types";
import { Utils } from "@mat3ra/utils";
import serverUtils from "@mat3ra/utils/server";
import * as path from "path";

import { BUILD_CONFIG, EXCLUDE_KEYS_FROM_SORTING } from "../../build-config";
import {
    type ApplicationYAMLItem,
    type ExecutableYAMLItem,
    type FlavorYAMLItem,
    type TemplateYAMLItem,
} from "../../src/js/types/application";
import {
    buildJSONFromYAMLInDir,
    loadYAMLTree,
    readYAMLFileResolved,
    resolveFromRoot,
} from "../utils";
import { EntityProcessor } from "./EntityProcessor";
import { validateTemplateContextProviders } from "./utils/contextProviders";
import { validateData } from "./utils/utils";

type ApplicationYAMLTree = Record<string, ApplicationYAMLItem>;

type ExecutableYAMLTree = Record<string, Record<string, ExecutableYAMLItem>>;

type TemplateYAMLTree = TemplateYAMLItem[];

type ApplicationWithBuildConfig = ApplicationSchema & { buildConfig: object };

function applicationAssetToSchemas(appData: ApplicationYAMLItem) {
    return appData.versions.map((version) => {
        const app: ApplicationWithBuildConfig = {
            name: appData.name,
            shortName: appData.shortName,
            summary: appData.summary,
            isUsingMaterial: Boolean(appData.isUsingMaterial),
            version: version.version,
            isDefault: Boolean(version.isDefault),
            isDefaultVersion: appData.defaultVersion === version.version,
            build: version.build,
            hasAdvancedComputeOptions: Boolean(version.hasAdvancedComputeOptions),
            buildConfig: version.buildConfig,
            runConfig: appData.runConfig,
            isLicensed: appData.isLicensed ? true : undefined,
        };

        return app;
    });
}

function executableAssetToSchemas(
    applicationName: string,
    executableName: string,
    executableData: ExecutableYAMLItem,
) {
    return {
        name: executableName,
        isDefault: Boolean(executableData.isDefault),
        preProcessors: executableData.preProcessors || [],
        postProcessors: executableData.postProcessors || [],
        monitors: executableData.monitors || [],
        results: executableData.results || [],
        hasAdvancedComputeOptions: Boolean(executableData.hasAdvancedComputeOptions),
        applicationName,
        applicationVersion: executableData.supportedApplicationVersions ?? "*",
    };
}

function flavorAssetToSchemas(
    applicationName: string,
    executableName: string,
    flavorName: string,
    flavorData: FlavorYAMLItem,
): FlavorSchema {
    return {
        name: flavorName,
        applicationName,
        executableName,
        applicationVersion: flavorData.supportedApplicationVersions ?? "*",
        preProcessors: flavorData.preProcessors || [],
        postProcessors: flavorData.postProcessors || [],
        monitors: flavorData.monitors || [],
        results: flavorData.results || [],
        input: flavorData.input,
        isDefault: Boolean(flavorData.isDefault),
    };
}

function templateAssetToSchemas(templateData: TemplateYAMLItem) {
    return {
        name: templateData.name,
        contextProviders: templateData.contextProviders,
        content: templateData.content,
        applicationName: templateData.applicationName,
        applicationVersion: templateData.supportedApplicationVersions ?? "*",
        executableName: templateData.executableName,
    };
}

export class ApplicationsProcessor extends EntityProcessor {
    constructor(rootDir: string) {
        super({
            rootDir,
            entityNamePlural: "applications",
            assetsDir: BUILD_CONFIG.applications.assets.path,
            dataDir: BUILD_CONFIG.applications.data.path,
            buildDir: BUILD_CONFIG.applications.build.path,
            categoriesRelativePath: BUILD_CONFIG.applications.assets.categories,
            areKeysSorted: true,
            excludeKeys: [...EXCLUDE_KEYS_FROM_SORTING],
        });
    }

    private cleanApplicationData: Record<string, ApplicationYAMLItem> = {};

    private allApplications: ApplicationSchema[] = [];

    private allExecutables: ExecutableSchema[] = [];

    private allFlavors: FlavorSchema[] = [];

    private allTemplates: TemplateSchema[] = [];

    private allApplicationsWithBuildConfigs: ApplicationWithBuildConfig[] = [];

    private modelMethodMapByApplication: {
        models: Record<string, unknown>;
        methods: Record<string, unknown>;
    } = {
        models: {},
        methods: {},
    };

    public readAssets() {
        const { assets } = BUILD_CONFIG.applications;

        const sourcesRoot = resolveFromRoot(this.options.rootDir, assets.path);
        const applicationAssetPath = path.resolve(sourcesRoot, assets.applications);
        const modelAssetPath = path.resolve(sourcesRoot, assets.models);
        const methodAssetPath = path.resolve(sourcesRoot, assets.methods);

        const tree = loadYAMLTree<ApplicationYAMLTree>(applicationAssetPath);
        const clean = Utils.object.flattenNestedObjects(tree);

        this.cleanApplicationData = clean;

        const executableTree = readYAMLFileResolved<ExecutableYAMLTree>(
            assets.executableTree,
            sourcesRoot,
        );

        const templatesTree = readYAMLFileResolved<TemplateYAMLTree>(assets.templates, sourcesRoot);

        this.allApplicationsWithBuildConfigs = Object.values(clean).reduce<
            ApplicationWithBuildConfig[]
        >((acc, appData) => {
            const apps = applicationAssetToSchemas(appData);

            return [...acc, ...apps];
        }, []);

        this.allApplications = this.allApplicationsWithBuildConfigs.map(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ({ buildConfig: _, ...app }) => {
                return app;
            },
        );

        this.allExecutables = Object.entries(executableTree).flatMap(
            ([applicationName, executables]) => {
                return Object.entries(executables).map(([executableName, executableData]) => {
                    return executableAssetToSchemas(
                        applicationName,
                        executableName,
                        executableData,
                    );
                });
            },
        );

        this.allExecutables = this.allExecutables.map((executable) => {
            return validateData(executable, "software/executable");
        });

        this.allFlavors = Object.entries(executableTree).flatMap(
            ([applicationName, executables]) => {
                return Object.entries(executables).flatMap(([executableName, executableData]) => {
                    return Object.entries(executableData.flavors).map(
                        ([flavorName, flavorData]) => {
                            return flavorAssetToSchemas(
                                applicationName,
                                executableName,
                                flavorName,
                                flavorData,
                            );
                        },
                    );
                });
            },
        );

        this.allFlavors = this.allFlavors.map((flavor) => {
            return validateData(flavor, "software/flavor");
        });

        this.allTemplates = templatesTree.map(templateAssetToSchemas);

        validateTemplateContextProviders(this.allTemplates);

        this.allTemplates = this.allTemplates.map((template) => {
            return validateData(template, "software/template");
        });

        this.modelMethodMapByApplication = {
            models: loadYAMLTree(modelAssetPath),
            methods: loadYAMLTree(methodAssetPath),
        };

        this.assets = [];
    }

    public writeBuildDirectoryContent(): void {
        if (!this.resolvedPaths.buildDir) return;

        const { buildDir } = this.resolvedPaths;
        const buildConfig = BUILD_CONFIG.applications.build;
        const workingDir = BUILD_CONFIG.applications.assets.path;

        const applicationsPath = path.resolve(buildDir, buildConfig.applicationsList);
        const executablesPath = path.resolve(buildDir, buildConfig.executablesList);
        const flavorsPath = path.resolve(buildDir, buildConfig.flavorsList);
        const templatesPath = path.resolve(buildDir, buildConfig.templatesList);

        serverUtils.file.createDirIfNotExistsSync(this.resolvedPaths.buildDir);
        serverUtils.json.writeJSONFileSync(applicationsPath, this.allApplications);
        serverUtils.json.writeJSONFileSync(executablesPath, this.allExecutables);
        serverUtils.json.writeJSONFileSync(flavorsPath, this.allFlavors);
        serverUtils.json.writeJSONFileSync(templatesPath, this.allTemplates);
        serverUtils.json.writeJSONFileSync(
            path.resolve(buildDir, buildConfig.modelMethodMapByApplication),
            this.modelMethodMapByApplication,
        );

        buildJSONFromYAMLInDir({
            assetPath: BUILD_CONFIG.applications.assets.executableTree,
            targetPath: `${buildDir}/${BUILD_CONFIG.applications.build.executableFlavorMapByApplication}`,
            workingDir,
            spaces: 0,
        });

        serverUtils.json.writeJSONFileSync(
            path.resolve(
                buildDir,
                BUILD_CONFIG.applications.build.applicationVersionsMapByApplication,
            ),
            this.cleanApplicationData,
        );
    }

    public writeDataDirectoryContent(): void {
        this.allApplicationsWithBuildConfigs.forEach((app) => {
            const fileName = `${app.name}_${app.build.toLowerCase()}_${app.version}.json`;
            const appDir = path.resolve(this.resolvedPaths.dataDir, app.name);
            const filePath = path.resolve(appDir, fileName);

            serverUtils.file.createDirIfNotExistsSync(appDir);
            serverUtils.json.writeJSONFileSync(filePath, app, {
                spaces: BUILD_CONFIG.dataJSONFormat.spaces,
            });

            console.log(`Generated application version: ${app.name}/${fileName}`);
        });
    }
}
