/**
 * Shared types for scripts/processors.
 */

/** Map of category key -> set of string values (used when collecting categories from entities). */
export type CategorySets = Record<string, Set<string>>;

/** Object that can be used as a source for category/tag collection (lodash.get keys + optional tags). */
export interface CategorySourceObject {
    tags?: string[];
    categories?: Record<string, string>;
    [key: string]: unknown;
}

/** Options for category collection in categorized entity processors. */
export interface CategoryCollectOptions {
    includeUnits?: boolean;
    includeTags?: boolean;
    includeEntitiesMap?: boolean;
}

/** Single build artifact (relative path + JSON-serializable content). */
export interface BuildArtifact {
    relativePath: string;
    content: unknown;
}

/** Entity config produced by workflow/subworkflow processors for build/data output. */
export interface WorkflowEntityConfig {
    appName: string;
    safeName: string;
    config: unknown;
    tags?: string[];
}

/** Entity data loaded from YAML with optional __path__ and tags (workflows/subworkflows). */
export type WorkflowEntityData<T extends object = object> = T & {
    __path__: string;
    tags?: string[];
};

/** Map: application name -> entity key -> entity data. */
export type EntityMapByApplication<T extends object = object> = Record<
    string,
    Record<string, WorkflowEntityData<T>>
>;

/** Workflow/subworkflow map structure passed to createWorkflow/createSubworkflow. */
export interface WorkflowSubworkflowMapByApplication<T extends object = object> {
    workflows: Record<string, Record<string, WorkflowEntityData>>;
    subworkflows: Record<string, Record<string, WorkflowEntityData<T>>>;
}

/** Entity with optional path, name, and units (for methods/models). */
export interface EntityWithPathAndUnits {
    path?: string;
    name?: string;
    units?: Array<{ path?: string; [key: string]: unknown }>;
    [key: string]: unknown;
}
