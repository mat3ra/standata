import type { ApplicationSchema } from "@mat3ra/esse/dist/js/types";

import { MethodStandata } from "./method";
import MODEL_METHOD_DATA from "./runtime_data/applications/modelMethodMapByApplication.json";
import { ApplicationMethodParametersInterface } from "./types/applicationFilter";
import { ApplicationFilterStandata, FilterMode } from "./utils/applicationFilter";

export class ApplicationMethodStandata extends ApplicationFilterStandata {
    constructor() {
        const data = MODEL_METHOD_DATA;
        super(data?.methods as any, FilterMode.ALL_MATCH);
    }

    findByApplicationParameters({
        methodList,
        name,
        version,
        build,
        executable,
        flavor,
    }: ApplicationMethodParametersInterface): any[] {
        return this.filterByApplicationParameters(
            methodList,
            name,
            version,
            build,
            executable,
            flavor,
        );
    }

    getAvailableMethods(name: string): any {
        return this.getAvailableEntities(name);
    }

    getDefaultMethodConfigForApplication(application: ApplicationSchema) {
        const { name, version, build /* executable, flavor */ } = application;

        const availableMethods = this.getAvailableMethods(name);
        if (!availableMethods || Object.keys(availableMethods).length === 0) {
            return { type: "unknown", subtype: "unknown" };
        }

        const methodStandata = new MethodStandata();
        const allMethods = methodStandata.getAll();

        return this.filterByApplicationParametersGetDefault(
            allMethods,
            name,
            version,
            build,
            // executable,
            // flavor,
        );
    }
}
