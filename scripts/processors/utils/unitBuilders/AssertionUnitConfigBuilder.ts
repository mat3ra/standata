import type { AssertionUnitSchema } from "@mat3ra/esse/dist/js/types";

import { UnitConfigBuilder } from "./UnitConfigBuilder";

export default class AssertionUnitConfigBuilder extends UnitConfigBuilder<"assertion"> {
    private _statement: string;

    private _errorMessage: string;

    constructor(name: string, statement: string, errorMessage: string) {
        super({ name, type: "assertion" });
        this._statement = statement;
        this._errorMessage = errorMessage;
    }

    statement(str: string) {
        this._statement = str;
        return this;
    }

    errorMessage(str: string) {
        this._errorMessage = str;
        return this;
    }

    build(): AssertionUnitSchema {
        return {
            ...super.build(),
            statement: this._statement,
            errorMessage: this._errorMessage,
        };
    }
}
