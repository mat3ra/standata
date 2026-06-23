import serverUtils from "@mat3ra/utils/server";
import * as path from "path";

import { BUILD_CONFIG } from "../../build-config";
import { BaseWorkflowSubworkflowProcessor } from "./BaseWorkflowSubworkflowProcessor";
import type { WorkflowEntityConfig } from "./types";
import createWorkflow, { type SubworkflowsTree, type WorkflowData } from "./utils/createWorkflow";

export class WorkflowsProcessor extends BaseWorkflowSubworkflowProcessor<WorkflowData> {
    public static defaultCategoryKeys = ["properties", "isMultimaterial", "tags", "application"];

    private subworkflowMapByApplication: SubworkflowsTree;

    constructor(rootDir: string, subworkflowsMapByApplication: SubworkflowsTree) {
        super({
            rootDir,
            entityNamePlural: "workflows",
            assetsDir: BUILD_CONFIG.workflows.assets.path,
            dataDir: BUILD_CONFIG.workflows.data.path,
            buildDir: BUILD_CONFIG.workflows.build.path,
            excludedAssetFiles: [BUILD_CONFIG.workflows.assets.categories],
            categoriesRelativePath: BUILD_CONFIG.workflows.assets.categories,
            categoryKeys: WorkflowsProcessor.defaultCategoryKeys,
        });
        this.subworkflowMapByApplication = subworkflowsMapByApplication;
    }

    private get workflowSubworkflowMapByApplication(): { workflows: any; subworkflows: any } {
        const workflowSubworkflowMapByApplication = { workflows: {}, subworkflows: {} } as any;
        workflowSubworkflowMapByApplication.workflows = this.entityMapByApplication;
        workflowSubworkflowMapByApplication.subworkflows =
            this.subworkflowMapWithCrossApplicationReferences;
        return workflowSubworkflowMapByApplication;
    }

    private get subworkflowMapWithCrossApplicationReferences(): Record<string, any> {
        return Object.fromEntries(
            Object.entries(this.subworkflowMapByApplication).map(
                ([applicationName, subworkflows]) => [
                    applicationName,
                    {
                        ...subworkflows,
                        ...this.getCrossApplicationReferences(applicationName),
                    },
                ],
            ),
        );
    }

    private getCrossApplicationReferences(applicationName: string): Record<string, any> {
        const references: Record<string, any> = {};
        const unitsToVisit = Object.values(
            this.entityMapByApplication[applicationName] || {},
        ).flatMap((workflowData: any) => workflowData.units || []);

        while (unitsToVisit.length) {
            const unitData = unitsToVisit.pop();
            unitsToVisit.push(...(unitData.units || []));
            const [sourceApplicationName, ...pathParts] = String(unitData.name || "").split("/");
            const pathInSource = pathParts.join("/");
            const sourceSubworkflows = this.subworkflowMapByApplication[sourceApplicationName];
            if (!pathInSource || sourceApplicationName === applicationName || !sourceSubworkflows)
                continue;

            const subworkflowData = Object.values(sourceSubworkflows).find((subworkflow: any) => {
                return subworkflow.__path__ === pathInSource;
            });
            if (subworkflowData) references[unitData.name] = subworkflowData;
        }
        return references;
    }

    protected buildEntityConfigs(): WorkflowEntityConfig[] {
        const configs: WorkflowEntityConfig[] = [];
        // For each application (from application_data.yml), look into its folder under assets/workflows/workflows/{appName}
        // and load all YAML files, preserving their relative paths to use as safeName in build/data output structure
        this.applications.forEach((appName) => {
            const workflows = this.entityMapByApplication[appName];

            Object.entries(workflows || {}).forEach(([workflowKey, workflowData]) => {
                const workflow = createWorkflow(
                    appName,
                    workflowData,
                    this.subworkflowMapByApplication,
                );
                const config = this.buildConfigFromEntityData(
                    workflowData,
                    workflowKey,
                    appName,
                    workflow,
                );
                configs.push(config);
            });
        });
        return configs;
    }

    protected writeWorkflowSubworkflowMapByApplication(): void {
        serverUtils.json.writeJSONFileSync(
            path.resolve(
                this.resolvedPaths.buildDir,
                BUILD_CONFIG.workflows.build.workflowSubworkflowMapByApplication,
            ),
            this.workflowSubworkflowMapByApplication,
        );
    }

    public writeBuildDirectoryContent(): void {
        this.writeWorkflowSubworkflowMapByApplication();
        super.writeDataDirectoryContent();
    }
}
