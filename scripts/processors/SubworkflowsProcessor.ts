import { BUILD_CONFIG } from "../../build-config";
import { BaseWorkflowSubworkflowProcessor } from "./BaseWorkflowSubworkflowProcessor";
import type { WorkflowEntityConfig } from "./types";
import createSubworkflow, { type SubworkflowData } from "./utils/createSubworkflow";

const defaultCategoryKeys = ["properties", "isMultimaterial", "tags", "application"] as const;

export class SubworkflowsProcessor extends BaseWorkflowSubworkflowProcessor<SubworkflowData> {
    constructor(rootDir: string) {
        super({
            rootDir,
            entityNamePlural: "subworkflows",
            assetsDir: BUILD_CONFIG.subworkflows.assets.path,
            dataDir: BUILD_CONFIG.subworkflows.data.path,
            buildDir: BUILD_CONFIG.subworkflows.build.path,
            excludedAssetFiles: [BUILD_CONFIG.subworkflows.assets.categories],
            categoriesRelativePath: BUILD_CONFIG.subworkflows.assets.categories,
            categoryKeys: defaultCategoryKeys,
        });
    }

    private get workflowSubworkflowMapByApplication() {
        return {
            workflows: {},
            subworkflows: this.entityMapByApplication,
        };
    }

    protected buildEntityConfigs() {
        const configs: WorkflowEntityConfig[] = [];
        const map = this.workflowSubworkflowMapByApplication;

        this.applications.forEach((appName) => {
            const subworkflows = map.subworkflows[appName];

            if (!subworkflows) {
                return;
            }

            Object.keys(subworkflows).forEach((subworkflowName) => {
                const subworkflowData = subworkflows[subworkflowName];
                const subworkflow = createSubworkflow(subworkflowData);
                const config = this.buildConfigFromEntityData(
                    subworkflowData,
                    subworkflowName,
                    appName,
                    subworkflow,
                );
                configs.push(config);
            });
        });

        return configs;
    }
}
