import type {
    AssertionUnitSchema,
    AssignmentUnitSchema,
    ConditionUnitSchema,
    DataIOUnitSchema,
    MapUnitSchema,
    SubworkflowUnitSchema,
    WorkflowBaseUnitSchema,
} from "@mat3ra/esse/dist/js/types";

export type DefaultUnitFields =
    | "results"
    | "monitors"
    | "preProcessors"
    | "postProcessors"
    | "status"
    | "statusTrack"
    | "tags";

export type DefaultUnit = Readonly<Pick<WorkflowBaseUnitSchema, DefaultUnitFields>>;
export type DefaultConditionUnit = Readonly<
    Omit<ConditionUnitSchema, "flowchartId" | "then" | "else">
>;
export type DefaultAssignmentUnit = Readonly<Omit<AssignmentUnitSchema, "flowchartId">>;
export type DefaultAssertionUnit = Readonly<Omit<AssertionUnitSchema, "flowchartId">>;
export type DefaultIOUnit = Readonly<Omit<DataIOUnitSchema, "flowchartId" | "input" | "source">>;

export const defaultUnit: DefaultUnit = {
    results: [],
    monitors: [],
    preProcessors: [],
    postProcessors: [],
    status: "idle",
    statusTrack: [],
    tags: [],
};

export const defaultConditionUnit: DefaultConditionUnit = {
    name: "condition",
    type: "condition",
    input: [],
    statement: "true",
    maxOccurrences: 100,
    ...defaultUnit,
};

export const defaultAssignmentUnit: DefaultAssignmentUnit = {
    name: "assignment",
    type: "assignment",
    operand: "X",
    value: "1",
    input: [],
    ...defaultUnit,
};

export const defaultAssertionUnit: DefaultAssertionUnit = {
    name: "assertion",
    type: "assertion",
    statement: "true",
    errorMessage: "assertion failed",
    ...defaultUnit,
} as const;

export const defaultIOUnit: DefaultIOUnit = {
    name: "io",
    type: "io",
    subtype: "input",
    ...defaultUnit,
} as const;

export const defaultMapConfig = {
    name: "map",
    type: "map",
    input: {
        target: "MAP_DATA",
        scope: "global",
        name: "",
        values: [],
        useValues: false,
    },
    ...defaultUnit,
} as const satisfies Pick<MapUnitSchema, DefaultUnitFields | "type" | "input" | "name">;

export const defaultSubworkflowUnitConfig = {
    type: "subworkflow",
    name: "New Subworkflow",
    ...defaultUnit,
} as const satisfies Pick<SubworkflowUnitSchema, DefaultUnitFields | "type" | "name">;
