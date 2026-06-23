import type {
    RuntimeItemNameObjectSchema,
    WorkflowBaseUnitSchema,
    WorkflowSubworkflowUnitSchema,
    WorkflowUnitSchema,
} from "@mat3ra/esse/dist/js/types";

import { defaultUnit } from "../defaults";
import { generateBuilderFlowChartId } from "../utils";

type SubworkflowUnitType = WorkflowSubworkflowUnitSchema["type"];
type WorkflowUnitType = WorkflowUnitSchema["type"];
type UnitType = SubworkflowUnitType | WorkflowUnitType;

type UnitConfigBuilderOptions<T extends UnitType = UnitType> = {
    name: string;
    type: T;
    flowchartId?: string;
    cache?: string[];
};

function union<T>(...arrays: T[][]): T[] {
    return arrays.reduce<T[]>((result, arr) => {
        return arr.reduce<T[]>((acc, item) => {
            return acc.includes(item) ? acc : [...acc, item];
        }, result);
    }, []);
}

export class UnitConfigBuilder<T extends UnitType = UnitType> {
    public type: T;

    private _flowchartId: string;

    private _name: string;

    private _head?: boolean;

    protected _results: RuntimeItemNameObjectSchema[];

    protected _monitors: RuntimeItemNameObjectSchema[];

    protected _preProcessors: RuntimeItemNameObjectSchema[];

    protected _postProcessors: RuntimeItemNameObjectSchema[];

    constructor({ name, type, flowchartId, cache }: UnitConfigBuilderOptions<T>) {
        this.type = type;
        this._name = name;
        this._head = false;
        this._results = [];
        this._monitors = [];
        this._preProcessors = [];
        this._postProcessors = [];
        this._flowchartId = flowchartId || generateBuilderFlowChartId(name, cache);
    }

    name(name: string) {
        this._name = name;
        return this;
    }

    head(head: boolean) {
        this._head = head;
        return this;
    }

    flowchartId(flowchartId: string) {
        this._flowchartId = flowchartId;
        return this;
    }

    addPreProcessors(preProcessorNames: RuntimeItemNameObjectSchema[]) {
        this._preProcessors = union(preProcessorNames, this._preProcessors);
        return this;
    }

    addPostProcessors(postProcessorNames: RuntimeItemNameObjectSchema[]) {
        this._postProcessors = union(postProcessorNames, this._postProcessors);
        return this;
    }

    addResults(resultNames: RuntimeItemNameObjectSchema[]) {
        this._results = union(resultNames, this._results);
        return this;
    }

    addMonitors(monitorNames: RuntimeItemNameObjectSchema[]) {
        this._monitors = union(monitorNames, this._monitors);
        return this;
    }

    build(): WorkflowBaseUnitSchema & { type: T } {
        return {
            type: this.type,
            name: this._name,
            head: this._head,
            results: this._results,
            monitors: this._monitors,
            flowchartId: this._flowchartId,
            preProcessors: this._preProcessors,
            postProcessors: this._postProcessors,
            status: defaultUnit.status,
            statusTrack: defaultUnit.statusTrack,
            tags: defaultUnit.tags,
        };
    }
}
