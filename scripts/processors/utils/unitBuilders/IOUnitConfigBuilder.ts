import type { DataIOUnitSchema } from "@mat3ra/esse/dist/js/types";

import { UnitConfigBuilder } from "./UnitConfigBuilder";

export default class IOUnitConfigBuilder extends UnitConfigBuilder<"io"> {
    private _endpointName: string;

    private _endpointOptions: string;

    private _variableName: string;

    private _subtype: DataIOUnitSchema["subtype"];

    private _source: DataIOUnitSchema["source"];

    constructor(name: string, endpointName: string, endpointOptions: string) {
        super({ name, type: "io" });
        this._endpointName = endpointName;
        this._endpointOptions = endpointOptions;
        this._variableName = "DATA";
        this._subtype = "input";
        this._source = "api";
    }

    variableName(variableName: string) {
        this._variableName = variableName;
        return this;
    }

    subtype(subtype: DataIOUnitSchema["subtype"]) {
        this._subtype = subtype;
        return this;
    }

    source(source: DataIOUnitSchema["source"]) {
        this._source = source;
        return this;
    }

    build(): DataIOUnitSchema {
        return {
            ...super.build(),
            subtype: this._subtype,
            source: this._source,
            input: [
                {
                    type: "api",
                    endpoint: this._endpointName,
                    endpoint_options: this._endpointOptions,
                    name: this._variableName,
                },
            ],
        } as const;
    }
}
