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

    it("finds the experimental SS-PFM workflow by its tags", () => {
        const std = new WorkflowStandata();
        const entities = std.findEntitiesByTags(
            "experimental",
            "afm",
        ) as unknown as WorkflowSchema[];
        expect(entities).to.have.lengthOf(1);
        const [workflow] = entities;
        expect(workflow.name).to.equal("SS-PFM Hysteresis Loop");
        expect(workflow.properties).to.include("hysteresis_loop");
        expect(workflow.subworkflows[0].application.name).to.equal("asylum-spm");
        const unit = workflow.subworkflows[0].units[0] as any;
        expect(unit.executable.name).to.equal("loop");
        expect(unit.flavor.name).to.equal("ss_pfm");
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
