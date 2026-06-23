import type { ApplicationSchema, AssignmentUnitSchema } from "@mat3ra/esse/dist/js/types";

import ExecutionUnitConfigBuilder from "../../unitBuilders/ExecutionUnitConfigBuilder";

function getQpointIrrep(application: ApplicationSchema) {
    const config = {
        name: "python",
        execName: "python",
        flavorName: "espresso_xml_get_qpt_irr",
    };
    const pythonUnit = new ExecutionUnitConfigBuilder(config, application).build();

    const assignmentUnit: AssignmentUnitSchema = {
        name: "assignment",
        type: "assignment",
        input: [
            {
                scope: pythonUnit.flowchartId,
                name: "STDOUT",
            },
        ],
        operand: "Q_POINTS",
        value: "json.loads(STDOUT)",
        preProcessors: [],
        postProcessors: [],
        monitors: [],
        results: [],
        flowchartId: "assignment",
    };

    return [pythonUnit, assignmentUnit];
}

export default getQpointIrrep;
