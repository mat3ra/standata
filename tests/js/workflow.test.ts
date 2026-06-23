import type { WorkflowSchema } from "@mat3ra/esse/dist/js/types";
import { expect } from "chai";

import { WorkflowStandata } from "../../src/js";

describe("Workflow Standata", () => {
    it("can search workflows by tags", () => {
        const std = new WorkflowStandata();
        const tags = ["espresso", "single-material", "total_energy"];
        const entities = std.findEntitiesByTags(...tags) as unknown as WorkflowSchema[];

        // Check that we found some entities
        expect(entities.length).to.be.greaterThan(0);
        expect(entities.length).to.be.lessThanOrEqual(std.entities.length);

        // Check that all found entities are espresso workflows with total_energy property
        entities.forEach((entity) => {
            expect(entity.subworkflows).to.be.an("array");
            // Check that it's an espresso or logical shell workflow
            expect(entity.subworkflows[0].application.name).to.be.oneOf(["espresso", "shell"]);

            // Check that it has total_energy property
            expect(entity.properties).to.be.an("array");
            expect(entity.properties).to.include("total_energy");
        });
    });

    it("can get default workflow", () => {
        const std = new WorkflowStandata();
        const defaultWorkflow = std.getDefault() as any;
        expect(defaultWorkflow.name).to.equal("Total Energy");

        const entity = std.entities.find((e: any) => e.filename.includes("total_energy"));
        expect(entity!.categories).to.include("default");
    });

    it("can get relaxation workflow by application", () => {
        const std = new WorkflowStandata();
        const relaxationWorkflow = std.getRelaxationWorkflowByApplication("espresso") as any;
        expect(relaxationWorkflow.name).to.equal("Variable-cell Relaxation");

        const entity = std.entities.find((e: any) =>
            e.filename.includes("variable_cell_relaxation"),
        );
        expect(entity!.categories).to.include("variable-cell_relaxation");
        expect(entity!.categories).to.include("espresso");
    });
});
