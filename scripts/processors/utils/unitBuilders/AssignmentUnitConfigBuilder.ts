import type { AssignmentUnitSchema, RuntimeItemNameObjectSchema } from "@mat3ra/esse/dist/js/types";

import { UnitConfigBuilder } from "./UnitConfigBuilder";

type Input = AssignmentUnitSchema["input"];

export default class AssignmentUnitConfigBuilder extends UnitConfigBuilder<"assignment"> {
    private _variableName: string;

    private _variableValue: string;

    private _input: Input;

    constructor(
        name: string,
        variableName: string,
        variableValue: string,
        input: Input = [],
        results: RuntimeItemNameObjectSchema[] = [],
    ) {
        super({ name, type: "assignment" });
        this._variableName = variableName;
        this._variableValue = variableValue;
        this._input = input;
        this._results = results;
    }

    input(input: Input) {
        this._input = input;
        return this;
    }

    variableName(variableName: string) {
        this._variableName = variableName;
        return this;
    }

    variableValue(variableValue: string) {
        this._variableValue = variableValue;
        return this;
    }

    build(): AssignmentUnitSchema {
        return {
            ...super.build(),
            input: this._input,
            operand: this._variableName,
            value: this._variableValue,
        };
    }
}
