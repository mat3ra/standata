import { Standata } from "./base";
import workflowSubworkflowMapByApplication from "./runtime_data/workflows/workflowSubworkflowMapByApplication.json";
export declare enum TAGS {
    RELAXATION = "variable-cell_relaxation",
    DEFAULT = "default"
}
/**
 * Generic, reusable Standata with all the shared queries.
 * Only `runtimeData` differs between concrete types.
 */
type StandataEntity = {
    filename: string;
    categories: string[];
    name?: string;
};
type WorkflowStandataRuntimeData = {
    standataConfig: {
        categories: Record<string, string[]>;
        entities: StandataEntity[];
    };
    filesMapByName: Record<string, unknown>;
};
declare abstract class BaseWorkflowStandata<T extends {
    name?: string;
}> extends Standata<T> {
    static runtimeData: WorkflowStandataRuntimeData;
    findByApplication(appName: string): T[];
    findByApplicationAndName(appName: string, displayName: string): T | undefined;
    getRelaxationByApplication(appName: string): T | undefined;
    getDefault(): T;
}
export declare class WorkflowStandata extends BaseWorkflowStandata<StandataEntity> {
    static runtimeData: WorkflowStandataRuntimeData;
    getRelaxationWorkflowByApplication(appName: string): StandataEntity | undefined;
}
export declare class SubworkflowStandata extends BaseWorkflowStandata<StandataEntity> {
    static runtimeData: WorkflowStandataRuntimeData;
    getRelaxationSubworkflowByApplication(appName: string): StandataEntity | undefined;
}
export { workflowSubworkflowMapByApplication };
