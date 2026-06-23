import MODEL_METHOD_DATA from "./runtime_data/applications/modelMethodMapByApplication.json";
import { ApplicationModelParametersInterface } from "./types/applicationFilter";
import { ApplicationFilterStandata, FilterMode } from "./utils/applicationFilter";

export class ApplicationModelStandata extends ApplicationFilterStandata {
    constructor() {
        const data = MODEL_METHOD_DATA;
        super(data?.models as any, FilterMode.ANY_MATCH);
    }

    findByApplicationParameters({
        modelList,
        name,
        version,
        build,
        executable,
        flavor,
    }: ApplicationModelParametersInterface): any[] {
        return this.filterByApplicationParameters(
            modelList,
            name,
            version,
            build,
            executable,
            flavor,
        );
    }

    getAvailableModels(name: string): any {
        return this.getAvailableEntities(name);
    }
}
