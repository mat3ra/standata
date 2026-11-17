import { expect } from "chai";

import { ApplicationMethodStandata } from "../../src/js/applicationMethod";
import { WorkflowStandata } from "../../src/js/workflow";

type SubworkflowWithMethod = {
    name: string;
    application: { name: string };
    model: { method: { type: string } };
};

describe("Q3 Workflows", () => {
    const densityOfStatesWorkflow = new WorkflowStandata().findByApplicationAndName(
        "q3",
        "Density of States - Q3",
    ) as unknown as { subworkflows: SubworkflowWithMethod[] };

    it("resolves a default pseudopotential method for the current q3 version", () => {
        const methodConfig = new ApplicationMethodStandata().getDefaultMethodConfigForApplication({
            name: "q3",
            version: "2026.11.14-0",
            build: "GNU",
        } as never);
        expect(methodConfig.path).to.include("/psp/");
    });

    // Job creation fills pseudopotentials only into subworkflows whose method is "pseudopotential";
    // any other type leaves the q3 input with an empty pseudopotential path.
    it("gives every q3 subworkflow of the DOS workflow a pseudopotential method", () => {
        const q3Subworkflows = densityOfStatesWorkflow.subworkflows.filter(
            (subworkflow) => subworkflow.application.name === "q3",
        );
        expect(q3Subworkflows.map((subworkflow) => subworkflow.name)).to.deep.equal([
            "Total Energy",
            "Non-Self-Consistent Field",
        ]);
        q3Subworkflows.forEach((subworkflow) => {
            expect(subworkflow.model.method.type, subworkflow.name).to.equal("pseudopotential");
        });
    });
});
