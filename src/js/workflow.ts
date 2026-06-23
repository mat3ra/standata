import { Standata } from "./base";
import SUBWORKFLOWS from "./runtime_data/subworkflows.json";
import WORKFLOWS from "./runtime_data/workflows.json";
import workflowSubworkflowMapByApplication from "./runtime_data/workflows/workflowSubworkflowMapByApplication.json";

export enum TAGS {
    RELAXATION = "variable-cell_relaxation",
    DEFAULT = "default",
}

/**
 * Generic, reusable Standata with all the shared queries.
 * Only `runtimeData` differs between concrete types.
 */
type StandataEntity = { filename: string; categories: string[]; name?: string };
type WorkflowStandataRuntimeData = {
    standataConfig: {
        categories: Record<string, string[]>;
        entities: StandataEntity[];
    };
    filesMapByName: Record<string, unknown>;
};

abstract class BaseWorkflowStandata<T extends { name?: string }> extends Standata<T> {
    static runtimeData: WorkflowStandataRuntimeData;

    findByApplication(appName: string): T[] {
        return this.findEntitiesByTags(appName);
    }

    findByApplicationAndName(appName: string, displayName: string): T | undefined {
        return this.findByApplication(appName).find((e) => e?.name === displayName);
    }

    // NOTE: The WF/SWF returned will have only `name` inside the application object.
    getRelaxationByApplication(appName: string): T | undefined {
        const list = this.findEntitiesByTags(TAGS.RELAXATION, appName);
        return list[0];
    }

    getDefault(): T {
        const list = this.findEntitiesByTags(TAGS.DEFAULT);
        if (list.length > 1) console.error("Multiple default workflows found");
        if (list.length === 0) console.error("No default workflow found");
        return list[0];
    }
}

export class WorkflowStandata extends BaseWorkflowStandata<StandataEntity> {
    static override runtimeData: WorkflowStandataRuntimeData = WORKFLOWS;

    getRelaxationWorkflowByApplication(appName: string) {
        return this.getRelaxationByApplication(appName);
    }
}

export class SubworkflowStandata extends BaseWorkflowStandata<StandataEntity> {
    static override runtimeData: WorkflowStandataRuntimeData = SUBWORKFLOWS;

    getRelaxationSubworkflowByApplication(appName: string) {
        return this.getRelaxationByApplication(appName);
    }
}

export { workflowSubworkflowMapByApplication };
